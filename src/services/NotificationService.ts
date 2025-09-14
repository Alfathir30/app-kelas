"use client"

import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export interface TaskNotification {
  taskId: string
  taskTitle: string
  subject: string
  dueDate: string
  dueTime: string
  notificationId?: string
}

class NotificationService {
  private static instance: NotificationService
  private isInitialized = false

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== "granted") {
        console.warn("Notification permissions not granted")
        return false
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("task-reminders", {
          name: "Task Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#007AFF",
          sound: "default",
        })
      }

      this.isInitialized = true
      return true
    } catch (error) {
      console.error("Failed to initialize notifications:", error)
      return false
    }
  }

  async scheduleTaskReminder(task: TaskNotification): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize()
        if (!initialized) return null
      }

      // Parse due date and time
      const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`)

      // Calculate reminder time (24 hours before due time)
      const reminderTime = new Date(dueDateTime.getTime() - 24 * 60 * 60 * 1000)

      // Don't schedule if reminder time is in the past
      if (reminderTime <= new Date()) {
        console.log("Reminder time is in the past, skipping notification")
        return null
      }

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Pengingat Tugas",
          body: `Tugas "${task.taskTitle}" (${task.subject}) akan jatuh tempo besok pada ${task.dueTime}`,
          data: {
            taskId: task.taskId,
            type: "task_reminder",
          },
          sound: "default",
        },
        trigger: {
          date: reminderTime,
        },
      })

      // Store notification mapping
      await this.storeNotificationMapping(task.taskId, notificationId)

      console.log(`Scheduled notification for task ${task.taskId} at ${reminderTime.toISOString()}`)
      return notificationId
    } catch (error) {
      console.error("Failed to schedule task reminder:", error)
      return null
    }
  }

  async cancelTaskReminder(taskId: string): Promise<void> {
    try {
      const notificationId = await this.getNotificationId(taskId)
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId)
        await this.removeNotificationMapping(taskId)
        console.log(`Cancelled notification for task ${taskId}`)
      }
    } catch (error) {
      console.error("Failed to cancel task reminder:", error)
    }
  }

  async updateTaskReminder(task: TaskNotification): Promise<string | null> {
    // Cancel existing notification
    await this.cancelTaskReminder(task.taskId)

    // Schedule new notification
    return await this.scheduleTaskReminder(task)
  }

  async scheduleMultipleTaskReminders(tasks: TaskNotification[]): Promise<void> {
    for (const task of tasks) {
      await this.scheduleTaskReminder(task)
    }
  }

  async cancelAllTaskReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
      await AsyncStorage.removeItem("task_notifications")
      console.log("Cancelled all task reminders")
    } catch (error) {
      console.error("Failed to cancel all task reminders:", error)
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync()
    } catch (error) {
      console.error("Failed to get scheduled notifications:", error)
      return []
    }
  }

  private async storeNotificationMapping(taskId: string, notificationId: string): Promise<void> {
    try {
      const existingMappings = await AsyncStorage.getItem("task_notifications")
      const mappings = existingMappings ? JSON.parse(existingMappings) : {}
      mappings[taskId] = notificationId
      await AsyncStorage.setItem("task_notifications", JSON.stringify(mappings))
    } catch (error) {
      console.error("Failed to store notification mapping:", error)
    }
  }

  private async getNotificationId(taskId: string): Promise<string | null> {
    try {
      const mappings = await AsyncStorage.getItem("task_notifications")
      if (mappings) {
        const parsed = JSON.parse(mappings)
        return parsed[taskId] || null
      }
      return null
    } catch (error) {
      console.error("Failed to get notification ID:", error)
      return null
    }
  }

  private async removeNotificationMapping(taskId: string): Promise<void> {
    try {
      const existingMappings = await AsyncStorage.getItem("task_notifications")
      if (existingMappings) {
        const mappings = JSON.parse(existingMappings)
        delete mappings[taskId]
        await AsyncStorage.setItem("task_notifications", JSON.stringify(mappings))
      }
    } catch (error) {
      console.error("Failed to remove notification mapping:", error)
    }
  }

  // Listen for notification responses
  addNotificationResponseListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener)
  }

  // Listen for notifications received while app is in foreground
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener)
  }
}

export default NotificationService
