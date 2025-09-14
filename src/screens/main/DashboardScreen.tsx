"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, RefreshControl, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../contexts/AuthContext"
import { useFirestore } from "../../hooks/useFirestore"
import { getDayName, getDayNameIndonesian, formatDate, getDaysUntil } from "../../utils/dateHelpers"
import { where, orderBy, limit } from "firebase/firestore"

const { width } = Dimensions.get("window")

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation()
  const { userProfile } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  const today = getDayName()

  // Get today's piket schedule
  const { data: todayPiket } = useFirestore("piket_schedules", [where("day", "==", today)])

  // Get today's lessons
  const { data: todayLessons } = useFirestore("lesson_schedules", [where("day", "==", today), orderBy("time", "asc")])

  // Get upcoming tasks (next 3)
  const { data: upcomingTasks } = useFirestore("tasks", [
    where("completed", "==", false),
    orderBy("dueDate", "asc"),
    limit(3),
  ])

  // Get summary data
  const { data: summaryData } = useFirestore("summary")

  const onRefresh = async () => {
    setRefreshing(true)
    // Refresh will be handled by the useFirestore hooks automatically
    setTimeout(() => setRefreshing(false), 1000)
  }

  const renderSummaryCard = (item: any) => (
    <View key={item.id} style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Ionicons
          name={
            item.type === "financial"
              ? "wallet-outline"
              : item.type === "academic"
                ? "school-outline"
                : "trending-up-outline"
          }
          size={24}
          color="#007AFF"
        />
        <Text style={styles.summaryTitle}>{item.title}</Text>
      </View>
      <Text style={styles.summaryValue}>
        {item.type === "financial"
          ? `Rp ${item.value.toLocaleString("id-ID")}`
          : `${item.value}${item.type === "habit" ? "%" : ""}`}
      </Text>
      <Text style={styles.summaryDescription}>{item.description}</Text>
    </View>
  )

  const renderTaskCard = (task: any) => {
    const daysUntil = getDaysUntil(task.dueDate.toDate())
    const isUrgent = daysUntil <= 2

    return (
      <View key={task.id} style={[styles.taskCard, isUrgent && styles.urgentTask]}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View
            style={[
              styles.priorityBadge,
              styles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`],
            ]}
          >
            <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.taskDescription}>{task.description}</Text>
        <View style={styles.taskFooter}>
          <Text style={[styles.taskDue, isUrgent && styles.urgentText]}>
            {daysUntil === 0 ? "Hari ini" : daysUntil === 1 ? "Besok" : `${daysUntil} hari lagi`}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Selamat datang,</Text>
          <Text style={styles.userName}>{userProfile?.name || "User"}</Text>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
        </View>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>{userProfile?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("dashboard.summary")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
          {summaryData.map(renderSummaryCard)}
        </ScrollView>
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("dashboard.todaySchedule")}</Text>

        {/* Piket Today */}
        {todayPiket.length > 0 && (
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Ionicons name="people-outline" size={20} color="#007AFF" />
              <Text style={styles.scheduleTitle}>Piket Hari Ini ({getDayNameIndonesian(today)})</Text>
            </View>
            <View style={styles.piketStudents}>
              {todayPiket[0]?.students?.map((student: string, index: number) => (
                <Text key={index} style={styles.studentName}>
                  • {student}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Lessons Today */}
        {todayLessons.length > 0 && (
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Ionicons name="book-outline" size={20} color="#007AFF" />
              <Text style={styles.scheduleTitle}>Jadwal Pelajaran Hari Ini</Text>
            </View>
            {todayLessons.slice(0, 3).map((lesson: any) => (
              <View key={lesson.id} style={styles.lessonItem}>
                <Text style={styles.lessonTime}>{lesson.time}</Text>
                <View style={styles.lessonDetails}>
                  <Text style={styles.lessonSubject}>{lesson.subject}</Text>
                  <Text style={styles.lessonTeacher}>
                    {lesson.teacher} • {lesson.room}
                  </Text>
                </View>
              </View>
            ))}
            {todayLessons.length > 3 && (
              <Text style={styles.moreText}>+{todayLessons.length - 3} pelajaran lainnya</Text>
            )}
          </View>
        )}
      </View>

      {/* Upcoming Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("dashboard.upcomingTasks")}</Text>
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map(renderTaskCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Tidak ada tugas mendatang</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    color: "white",
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  date: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  roleContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  summaryContainer: {
    flexDirection: "row",
  },
  summaryCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: width * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 14,
    color: "#666",
  },
  scheduleCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  piketStudents: {
    marginLeft: 28,
  },
  studentName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginLeft: 28,
  },
  lessonTime: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
    width: 80,
  },
  lessonDetails: {
    flex: 1,
    marginLeft: 12,
  },
  lessonSubject: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  lessonTeacher: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  moreText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 28,
    fontStyle: "italic",
  },
  taskCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgentTask: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityHigh: {
    backgroundColor: "#FF3B30",
  },
  priorityMedium: {
    backgroundColor: "#FF9500",
  },
  priorityLow: {
    backgroundColor: "#34C759",
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskDue: {
    fontSize: 12,
    color: "#666",
  },
  urgentText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 12,
  },
})

export default DashboardScreen
