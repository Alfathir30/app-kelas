"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, RefreshControl, Alert, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../contexts/AuthContext"
import { useFirestore } from "../../hooks/useFirestore"
import { getDayName, getDayNameIndonesian } from "../../utils/dateHelpers"
import AnimatedCard from "../../components/AnimatedCard"
import AnimatedButton from "../../components/AnimatedButton"
import AnimatedModal from "../../components/AnimatedModal"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"]

const PiketScreen: React.FC = () => {
  const { t } = useTranslation()
  const { userProfile, hasPermission } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [newStudent, setNewStudent] = useState("")

  const { data: piketSchedules, updateDocument, addDocument } = useFirestore("piket_schedules")

  const canEdit = hasPermission("editor")
  const today = getDayName()

  const onRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const getScheduleForDay = (day: string) => {
    return piketSchedules.find((schedule) => schedule.day === day)
  }

  const handleEditSchedule = (day: string) => {
    const schedule = getScheduleForDay(day)
    setEditingSchedule(schedule || { day, students: [], tasks: [] })
    setModalVisible(true)
  }

  const handleSaveSchedule = async () => {
    if (!editingSchedule) return

    try {
      const scheduleData = {
        day: editingSchedule.day,
        students: editingSchedule.students,
        tasks: editingSchedule.tasks,
      }

      if (editingSchedule.id) {
        await updateDocument(editingSchedule.id, scheduleData)
      } else {
        await addDocument(editingSchedule.day, scheduleData)
      }

      setModalVisible(false)
      setEditingSchedule(null)
      Alert.alert("Berhasil", "Jadwal piket berhasil disimpan")
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan jadwal piket")
    }
  }

  const handleAddStudent = () => {
    if (!newStudent.trim()) return

    setEditingSchedule({
      ...editingSchedule,
      students: [...(editingSchedule.students || []), newStudent.trim()],
    })
    setNewStudent("")
  }

  const handleRemoveStudent = (index: number) => {
    const updatedStudents = editingSchedule.students.filter((_: any, i: number) => i !== index)
    setEditingSchedule({
      ...editingSchedule,
      students: updatedStudents,
    })
  }

  const renderDayCard = (day: string, index: number) => {
    const schedule = getScheduleForDay(day)
    const isToday = day === today
    const dayName = getDayNameIndonesian(day)

    return (
      <AnimatedCard
        key={day}
        delay={index * 100}
        animation="fadeInUp"
        style={[styles.dayCard, isToday && styles.todayCard]}
      >
        <View style={styles.dayHeader}>
          <View style={styles.dayTitleContainer}>
            <Text style={[styles.dayTitle, isToday && styles.todayText]}>{dayName}</Text>
            {isToday && (
              <AnimatedCard delay={index * 100 + 200} animation="slideInRight">
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>HARI INI</Text>
                </View>
              </AnimatedCard>
            )}
          </View>
          {canEdit && (
            <AnimatedButton style={styles.editButton} onPress={() => handleEditSchedule(day)}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </AnimatedButton>
          )}
        </View>

        {schedule && schedule.students && schedule.students.length > 0 ? (
          <View style={styles.studentsContainer}>
            <Text style={styles.studentsTitle}>Siswa Piket:</Text>
            {schedule.students.map((student: string, studentIndex: number) => (
              <AnimatedCard key={studentIndex} delay={index * 100 + studentIndex * 50 + 300} animation="slideInLeft">
                <View style={styles.studentItem}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.studentName}>{student}</Text>
                </View>
              </AnimatedCard>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={32} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada siswa piket</Text>
            {canEdit && (
              <AnimatedButton style={styles.addButton} onPress={() => handleEditSchedule(day)}>
                <Text style={styles.addButtonText}>Tambah Siswa</Text>
              </AnimatedButton>
            )}
          </View>
        )}

        {schedule && schedule.tasks && schedule.tasks.length > 0 && (
          <View style={styles.tasksContainer}>
            <Text style={styles.tasksTitle}>Tugas Piket:</Text>
            {schedule.tasks.map((task: string, taskIndex: number) => (
              <AnimatedCard key={taskIndex} delay={index * 100 + taskIndex * 50 + 400} animation="slideInRight">
                <View style={styles.taskItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#34C759" />
                  <Text style={styles.taskText}>{task}</Text>
                </View>
              </AnimatedCard>
            ))}
          </View>
        )}
      </AnimatedCard>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <AnimatedCard animation="fadeInDown" style={styles.header}>
        <Text style={styles.headerTitle}>{t("piket.title")}</Text>
        <Text style={styles.headerSubtitle}>Kelas XI TKJ2</Text>
      </AnimatedCard>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {DAYS.map((day, index) => renderDayCard(day, index))}
      </ScrollView>

      {/* Edit Modal */}
      <AnimatedModal visible={modalVisible} onRequestClose={() => setModalVisible(false)} animationType="slide">
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Piket {getDayNameIndonesian(editingSchedule?.day || "")}</Text>
          <AnimatedButton style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </AnimatedButton>
        </View>

        <ScrollView style={styles.modalBody}>
          {/* Students Section */}
          <Text style={styles.sectionTitle}>Siswa Piket</Text>

          <View style={styles.addStudentContainer}>
            <TextInput
              style={styles.addStudentInput}
              value={newStudent}
              onChangeText={setNewStudent}
              placeholder="Nama siswa"
              onSubmitEditing={handleAddStudent}
            />
            <AnimatedButton style={styles.addStudentButton} onPress={handleAddStudent}>
              <Ionicons name="add" size={20} color="white" />
            </AnimatedButton>
          </View>

          {editingSchedule?.students?.map((student: string, index: number) => (
            <AnimatedCard key={index} delay={index * 50} animation="slideInLeft">
              <View style={styles.editStudentItem}>
                <Text style={styles.editStudentName}>{student}</Text>
                <AnimatedButton style={styles.removeButton} onPress={() => handleRemoveStudent(index)}>
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </AnimatedButton>
              </View>
            </AnimatedCard>
          ))}
        </ScrollView>

        <View style={styles.modalFooter}>
          <AnimatedButton style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
          </AnimatedButton>
          <AnimatedButton style={styles.saveButton} onPress={handleSaveSchedule}>
            <Text style={styles.saveButtonText}>{t("common.save")}</Text>
          </AnimatedButton>
        </View>
      </AnimatedModal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "white",
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dayCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dayTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  todayText: {
    color: "#007AFF",
  },
  todayBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  editButton: {
    padding: 8,
  },
  studentsContainer: {
    marginBottom: 16,
  },
  studentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  studentName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  tasksContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  taskText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 8,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  addStudentContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  addStudentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addStudentButton: {
    backgroundColor: "#007AFF",
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  editStudentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  editStudentName: {
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    padding: 4,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
})

export default PiketScreen
