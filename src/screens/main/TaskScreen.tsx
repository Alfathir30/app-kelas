"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, ScrollView, StyleSheet, RefreshControl, Alert, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../contexts/AuthContext"
import { useFirestore } from "../../hooks/useFirestore"
import { useNotifications } from "../../hooks/useNotifications"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { id } from "date-fns/locale"
import AnimatedCard from "../../components/AnimatedCard"
import AnimatedButton from "../../components/AnimatedButton"
import AnimatedModal from "../../components/AnimatedModal"

interface Task {
  id: string
  title: string
  subject: string
  description: string
  dueDate: string
  dueTime: string
  owner: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

const TaskScreen: React.FC = () => {
  const { t } = useTranslation()
  const { userProfile, hasPermission } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all")

  const { data: allTasks, updateDocument, addDocument, deleteDocument } = useFirestore("tasks")

  const { scheduleTaskReminder, cancelTaskReminder, updateTaskReminder, scheduleMultipleTaskReminders } =
    useNotifications({
      onNotificationResponse: (response) => {
        // Handle notification tap - could navigate to specific task
        const taskId = response.notification.request.content.data?.taskId
        if (taskId) {
          console.log("User tapped notification for task:", taskId)
          // Could implement navigation to specific task here
        }
      },
    })

  const canEdit = hasPermission("editor")
  const canDelete = hasPermission("owner") || hasPermission("editor")

  useEffect(() => {
    const scheduleNotificationsForTasks = async () => {
      const incompleteTasks = allTasks.filter((task) => !task.completed)
      const taskNotifications = incompleteTasks.map((task) => ({
        taskId: task.id,
        taskTitle: task.title,
        subject: task.subject,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
      }))

      if (taskNotifications.length > 0) {
        await scheduleMultipleTaskReminders(taskNotifications)
      }
    }

    if (allTasks.length > 0) {
      scheduleNotificationsForTasks()
    }
  }, [allTasks, scheduleMultipleTaskReminders])

  const onRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const getFilteredTasks = () => {
    const now = new Date()

    return allTasks
      .filter((task) => {
        const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`)

        switch (filter) {
          case "pending":
            return !task.completed && isAfter(dueDateTime, now)
          case "completed":
            return task.completed
          case "overdue":
            return !task.completed && isBefore(dueDateTime, now)
          default:
            return true
        }
      })
      .sort((a, b) => {
        // Sort by due date, then by due time
        const dateA = new Date(`${a.dueDate}T${a.dueTime}`)
        const dateB = new Date(`${b.dueDate}T${b.dueTime}`)
        return dateA.getTime() - dateB.getTime()
      })
  }

  const handleAddTask = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    setEditingTask({
      title: "",
      subject: "",
      description: "",
      dueDate: format(tomorrow, "yyyy-MM-dd"),
      dueTime: "23:59",
      owner: userProfile?.name || "",
      completed: false,
    })
    setModalVisible(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setModalVisible(true)
  }

  const handleSaveTask = async () => {
    if (
      !editingTask?.title ||
      !editingTask?.subject ||
      !editingTask?.dueDate ||
      !editingTask?.dueTime ||
      !editingTask?.owner
    ) {
      Alert.alert(
        "Error",
        "Mohon lengkapi semua field yang wajib (hari, jam mulai, jam selesai, mata pelajaran/tugas, dan nama pemilik)",
      )
      return
    }

    try {
      const taskData = {
        title: editingTask.title,
        subject: editingTask.subject,
        description: editingTask.description || "",
        dueDate: editingTask.dueDate,
        dueTime: editingTask.dueTime,
        owner: editingTask.owner,
        completed: editingTask.completed || false,
        updatedAt: new Date(),
      }

      if (editingTask.id) {
        await updateDocument(editingTask.id, taskData)

        if (!taskData.completed) {
          await updateTaskReminder({
            taskId: editingTask.id,
            taskTitle: taskData.title,
            subject: taskData.subject,
            dueDate: taskData.dueDate,
            dueTime: taskData.dueTime,
          })
        } else {
          await cancelTaskReminder(editingTask.id)
        }
      } else {
        const taskId = `task-${Date.now()}`
        await addDocument(taskId, {
          ...taskData,
          createdAt: new Date(),
        })

        if (!taskData.completed) {
          await scheduleTaskReminder({
            taskId,
            taskTitle: taskData.title,
            subject: taskData.subject,
            dueDate: taskData.dueDate,
            dueTime: taskData.dueTime,
          })
        }
      }

      setModalVisible(false)
      setEditingTask(null)
      Alert.alert("Berhasil", "Tugas berhasil disimpan")
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan tugas")
    }
  }

  const handleDeleteTask = (task: Task) => {
    if (!canDelete) {
      Alert.alert("Error", "Anda tidak memiliki izin untuk menghapus tugas")
      return
    }

    Alert.alert("Hapus Tugas", `Apakah Anda yakin ingin menghapus "${task.title}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDocument(task.id)
            await cancelTaskReminder(task.id)
            Alert.alert("Berhasil", "Tugas berhasil dihapus")
          } catch (error) {
            Alert.alert("Error", "Gagal menghapus tugas")
          }
        },
      },
    ])
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = {
        ...task,
        completed: !task.completed,
        updatedAt: new Date(),
      }

      await updateDocument(task.id, updatedTask)

      if (updatedTask.completed) {
        // Cancel notification when task is completed
        await cancelTaskReminder(task.id)
      } else {
        // Schedule notification when task is marked as incomplete
        await scheduleTaskReminder({
          taskId: task.id,
          taskTitle: task.title,
          subject: task.subject,
          dueDate: task.dueDate,
          dueTime: task.dueTime,
        })
      }
    } catch (error) {
      Alert.alert("Error", "Gagal mengubah status tugas")
    }
  }

  const getTaskStatus = (task: Task) => {
    if (task.completed) return "completed"

    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`)
    const now = new Date()

    if (isBefore(dueDateTime, now)) return "overdue"

    // Check if due within 24 hours
    const tomorrow = addDays(now, 1)
    if (isBefore(dueDateTime, tomorrow)) return "urgent"

    return "pending"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#34C759"
      case "overdue":
        return "#FF3B30"
      case "urgent":
        return "#FF9500"
      default:
        return "#007AFF"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Selesai"
      case "overdue":
        return "Terlambat"
      case "urgent":
        return "Mendesak"
      default:
        return "Pending"
    }
  }

  const renderFilterButton = (filterType: typeof filter, label: string, count: number, index: number) => {
    const isSelected = filter === filterType

    return (
      <AnimatedCard key={filterType} delay={index * 50} animation="fadeIn">
        <AnimatedButton
          style={[styles.filterButton, isSelected && styles.selectedFilterButton]}
          onPress={() => setFilter(filterType)}
        >
          <Text style={[styles.filterButtonText, isSelected && styles.selectedFilterButtonText]}>
            {label} ({count})
          </Text>
        </AnimatedButton>
      </AnimatedCard>
    )
  }

  const renderTaskCard = (task: Task, index: number) => {
    const status = getTaskStatus(task)
    const statusColor = getStatusColor(status)
    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`)

    return (
      <AnimatedCard
        key={task.id}
        delay={index * 100}
        animation="fadeInUp"
        style={[styles.taskCard, task.completed && styles.completedTaskCard]}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskStatus}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{getStatusText(status)}</Text>
            {!task.completed && (
              <View style={styles.notificationIndicator}>
                <Ionicons name="notifications-outline" size={12} color="#666" />
              </View>
            )}
          </View>

          <View style={styles.taskActions}>
            <AnimatedButton style={styles.actionButton} onPress={() => handleToggleComplete(task)}>
              <Ionicons
                name={task.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                size={20}
                color={task.completed ? "#34C759" : "#666"}
              />
            </AnimatedButton>

            {canEdit && (
              <AnimatedButton style={styles.actionButton} onPress={() => handleEditTask(task)}>
                <Ionicons name="create-outline" size={18} color="#007AFF" />
              </AnimatedButton>
            )}

            {canDelete && (
              <AnimatedButton style={styles.actionButton} onPress={() => handleDeleteTask(task)}>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </AnimatedButton>
            )}
          </View>
        </View>

        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, task.completed && styles.completedTaskTitle]}>{task.title}</Text>
          <Text style={styles.taskSubject}>{task.subject}</Text>

          {task.description && <Text style={styles.taskDescription}>{task.description}</Text>}

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{format(dueDateTime, "dd MMM yyyy", { locale: id })}</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{format(dueDateTime, "HH:mm")}</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{task.owner}</Text>
            </View>
          </View>
        </View>
      </AnimatedCard>
    )
  }

  const filteredTasks = getFilteredTasks()
  const taskCounts = {
    all: allTasks.length,
    pending: allTasks.filter((t) => !t.completed && isAfter(new Date(`${t.dueDate}T${t.dueTime}`), new Date())).length,
    completed: allTasks.filter((t) => t.completed).length,
    overdue: allTasks.filter((t) => !t.completed && isBefore(new Date(`${t.dueDate}T${t.dueTime}`), new Date())).length,
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <AnimatedCard animation="fadeInDown" style={styles.header}>
        <Text style={styles.headerTitle}>Tugas</Text>
        <Text style={styles.headerSubtitle}>Kelas XI TKJ2</Text>
      </AnimatedCard>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          ["all", "Semua", taskCounts.all],
          ["pending", "Pending", taskCounts.pending],
          ["urgent", "Mendesak", allTasks.filter((t) => getTaskStatus(t) === "urgent").length],
          ["overdue", "Terlambat", taskCounts.overdue],
          ["completed", "Selesai", taskCounts.completed],
        ].map(([filterType, label, count], index) =>
          renderFilterButton(filterType as typeof filter, label as string, count as number, index),
        )}
      </ScrollView>

      {/* Tasks Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>
            {filter === "all"
              ? "Semua Tugas"
              : filter === "pending"
                ? "Tugas Pending"
                : filter === "completed"
                  ? "Tugas Selesai"
                  : filter === "overdue"
                    ? "Tugas Terlambat"
                    : "Tugas"}
          </Text>

          {canEdit && (
            <AnimatedButton style={styles.addButton} onPress={handleAddTask}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Tambah</Text>
            </AnimatedButton>
          )}
        </View>

        {filteredTasks.length > 0 ? (
          filteredTasks.map(renderTaskCard)
        ) : (
          <AnimatedCard delay={200} animation="fadeIn" style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "Belum ada tugas"
                : filter === "pending"
                  ? "Tidak ada tugas pending"
                  : filter === "completed"
                    ? "Belum ada tugas yang selesai"
                    : filter === "overdue"
                      ? "Tidak ada tugas terlambat"
                      : "Tidak ada tugas"}
            </Text>
            {canEdit && filter === "all" && (
              <AnimatedButton style={styles.emptyAddButton} onPress={handleAddTask}>
                <Text style={styles.emptyAddButtonText}>Tambah Tugas</Text>
              </AnimatedButton>
            )}
          </AnimatedCard>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <AnimatedModal visible={modalVisible} onRequestClose={() => setModalVisible(false)} animationType="slide">
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{editingTask?.id ? "Edit Tugas" : "Tambah Tugas"}</Text>
          <AnimatedButton style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </AnimatedButton>
        </View>

        <ScrollView style={styles.modalBody}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Judul Tugas *</Text>
            <TextInput
              style={styles.input}
              value={editingTask?.title || ""}
              onChangeText={(text) => setEditingTask({ ...editingTask, title: text })}
              placeholder="Nama tugas"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mata Pelajaran *</Text>
            <TextInput
              style={styles.input}
              value={editingTask?.subject || ""}
              onChangeText={(text) => setEditingTask({ ...editingTask, subject: text })}
              placeholder="Contoh: Matematika, Bahasa Indonesia"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Deskripsi</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editingTask?.description || ""}
              onChangeText={(text) => setEditingTask({ ...editingTask, description: text })}
              placeholder="Deskripsi tugas (opsional)"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tanggal Deadline *</Text>
            <TextInput
              style={styles.input}
              value={editingTask?.dueDate || ""}
              onChangeText={(text) => setEditingTask({ ...editingTask, dueDate: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Jam Deadline *</Text>
            <TextInput
              style={styles.input}
              value={editingTask?.dueTime || ""}
              onChangeText={(text) => setEditingTask({ ...editingTask, dueTime: text })}
              placeholder="HH:MM (contoh: 23:59)"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nama Pemilik *</Text>
            <TextInput
              style={styles.input}
              value={editingTask?.owner || ""}
              onChangeText={(text) => setEditingTask({ ...editingTask, owner: text })}
              placeholder="Nama siswa yang bertanggung jawab"
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <AnimatedButton style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
          </AnimatedButton>
          <AnimatedButton style={styles.saveButton} onPress={handleSaveTask}>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  filterContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  selectedFilterButton: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  selectedFilterButtonText: {
    color: "white",
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
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
  taskCard: {
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
  completedTaskCard: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  notificationIndicator: {
    marginLeft: 8,
    opacity: 0.6,
  },
  taskActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  completedTaskTitle: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskSubject: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
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
    textAlign: "center",
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
    maxHeight: "90%",
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
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

export default TaskScreen
