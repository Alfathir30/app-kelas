"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../contexts/AuthContext"
import { useFirestore } from "../../hooks/useFirestore"
import { getDayName, getDayNameIndonesian } from "../../utils/dateHelpers"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"]

const PelajaranScreen: React.FC = () => {
  const { t } = useTranslation()
  const { userProfile, hasPermission } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDay, setSelectedDay] = useState(DAYS[0])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)

  const { data: allLessons, updateDocument, addDocument, deleteDocument } = useFirestore("lesson_schedules")

  const canEdit = hasPermission("editor")
  const today = getDayName()

  const onRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const getLessonsForDay = (day: string) => {
    return allLessons.filter((lesson) => lesson.day === day).sort((a, b) => a.time.localeCompare(b.time))
  }

  const handleAddLesson = () => {
    setEditingLesson({
      day: selectedDay,
      time: "",
      subject: "",
      teacher: "",
      room: "",
    })
    setModalVisible(true)
  }

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson)
    setModalVisible(true)
  }

  const handleSaveLesson = async () => {
    if (!editingLesson?.time || !editingLesson?.subject || !editingLesson?.teacher) {
      Alert.alert("Error", "Mohon lengkapi semua field yang wajib")
      return
    }

    try {
      const lessonData = {
        day: editingLesson.day,
        time: editingLesson.time,
        subject: editingLesson.subject,
        teacher: editingLesson.teacher,
        room: editingLesson.room || "",
      }

      if (editingLesson.id) {
        await updateDocument(editingLesson.id, lessonData)
      } else {
        const lessonId = `${editingLesson.day}-${Date.now()}`
        await addDocument(lessonId, lessonData)
      }

      setModalVisible(false)
      setEditingLesson(null)
      Alert.alert("Berhasil", "Jadwal pelajaran berhasil disimpan")
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan jadwal pelajaran")
    }
  }

  const handleDeleteLesson = (lesson: any) => {
    Alert.alert("Hapus Pelajaran", `Apakah Anda yakin ingin menghapus ${lesson.subject}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDocument(lesson.id)
            Alert.alert("Berhasil", "Pelajaran berhasil dihapus")
          } catch (error) {
            Alert.alert("Error", "Gagal menghapus pelajaran")
          }
        },
      },
    ])
  }

  const renderDayTab = (day: string) => {
    const isSelected = selectedDay === day
    const isToday = day === today
    const dayName = getDayNameIndonesian(day)

    return (
      <TouchableOpacity
        key={day}
        style={[styles.dayTab, isSelected && styles.selectedDayTab]}
        onPress={() => setSelectedDay(day)}
      >
        <Text style={[styles.dayTabText, isSelected && styles.selectedDayTabText]}>{dayName}</Text>
        {isToday && <View style={styles.todayIndicator} />}
      </TouchableOpacity>
    )
  }

  const renderLessonCard = (lesson: any, index: number) => {
    return (
      <View key={lesson.id} style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color="#007AFF" />
            <Text style={styles.lessonTime}>{lesson.time}</Text>
          </View>
          {canEdit && (
            <View style={styles.lessonActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleEditLesson(lesson)}>
                <Ionicons name="create-outline" size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteLesson(lesson)}>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.lessonContent}>
          <Text style={styles.lessonSubject}>{lesson.subject}</Text>
          <View style={styles.lessonDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="person-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{lesson.teacher}</Text>
            </View>
            {lesson.room && (
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.detailText}>{lesson.room}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  const selectedDayLessons = getLessonsForDay(selectedDay)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("pelajaran.title")}</Text>
        <Text style={styles.headerSubtitle}>Kelas XI TKJ2</Text>
      </View>

      {/* Day Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayTabsContainer}
        contentContainerStyle={styles.dayTabsContent}
      >
        {DAYS.map(renderDayTab)}
      </ScrollView>

      {/* Lessons Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.contentHeader}>
          <Text style={styles.dayTitle}>
            {getDayNameIndonesian(selectedDay)}
            {selectedDay === today && <Text style={styles.todayText}> (Hari Ini)</Text>}
          </Text>
          {canEdit && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddLesson}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Tambah</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedDayLessons.length > 0 ? (
          selectedDayLessons.map(renderLessonCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Tidak ada pelajaran hari ini</Text>
            {canEdit && (
              <TouchableOpacity style={styles.emptyAddButton} onPress={handleAddLesson}>
                <Text style={styles.emptyAddButtonText}>Tambah Pelajaran</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingLesson?.id ? "Edit Pelajaran" : "Tambah Pelajaran"}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Waktu *</Text>
                <TextInput
                  style={styles.input}
                  value={editingLesson?.time || ""}
                  onChangeText={(text) => setEditingLesson({ ...editingLesson, time: text })}
                  placeholder="Contoh: 07:00 - 08:30"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mata Pelajaran *</Text>
                <TextInput
                  style={styles.input}
                  value={editingLesson?.subject || ""}
                  onChangeText={(text) => setEditingLesson({ ...editingLesson, subject: text })}
                  placeholder="Nama mata pelajaran"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Guru *</Text>
                <TextInput
                  style={styles.input}
                  value={editingLesson?.teacher || ""}
                  onChangeText={(text) => setEditingLesson({ ...editingLesson, teacher: text })}
                  placeholder="Nama guru"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ruangan</Text>
                <TextInput
                  style={styles.input}
                  value={editingLesson?.room || ""}
                  onChangeText={(text) => setEditingLesson({ ...editingLesson, room: text })}
                  placeholder="Nama ruangan (opsional)"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveLesson}>
                <Text style={styles.saveButtonText}>{t("common.save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  dayTabsContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  selectedDayTab: {
    backgroundColor: "#007AFF",
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  selectedDayTabText: {
    color: "white",
  },
  todayIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  todayText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "normal",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  lessonCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 4,
  },
  lessonActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  lessonContent: {
    flex: 1,
  },
  lessonSubject: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  lessonDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 12,
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
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

export default PelajaranScreen
