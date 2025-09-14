"use client"

import { useEffect, useCallback } from "react"
import { Alert } from "react-native"
import type * as Notifications from "expo-notifications"
import NotificationService, { type TaskNotification } from "../services/NotificationService"

interface UseNotificationsProps {
  onNotificationReceived?: (notification: Notifications.Notification) => void
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
}

export const useNotifications = ({ onNotificationReceived, onNotificationResponse }: UseNotificationsProps = {}) => {
  const notificationService = NotificationService.getInstance()

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize()

    // Set up listeners
    const notificationListener = notificationService.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification)

      // Show alert when notification is received while app is in foreground
      if (notification.request.content.data?.type === "task_reminder") {
        Alert.alert(
          notification.request.content.title || "Pengingat",
          notification.request.content.body || "Ada tugas yang perlu diperhatikan",
          [{ text: "OK" }],
        )
      }

      onNotificationReceived?.(notification)
    })

    const responseListener = notificationService.addNotificationResponseListener((response) => {
      console.log("Notification response:", response)
      onNotificationResponse?.(response)
    })

    return () => {
      notificationListener.remove()
      responseListener.remove()
    }
  }, [onNotificationReceived, onNotificationResponse])

  const scheduleTaskReminder = useCallback(async (task: TaskNotification) => {
    return await notificationService.scheduleTaskReminder(task)
  }, [])

  const cancelTaskReminder = useCallback(async (taskId: string) => {
    await notificationService.cancelTaskReminder(taskId)
  }, [])

  const updateTaskReminder = useCallback(async (task: TaskNotification) => {
    return await notificationService.updateTaskReminder(task)
  }, [])

  const scheduleMultipleTaskReminders = useCallback(async (tasks: TaskNotification[]) => {
    await notificationService.scheduleMultipleTaskReminders(tasks)
  }, [])

  const cancelAllTaskReminders = useCallback(async () => {
    await notificationService.cancelAllTaskReminders()
  }, [])

  const getScheduledNotifications = useCallback(async () => {
    return await notificationService.getScheduledNotifications()
  }, [])

  return {
    scheduleTaskReminder,
    cancelTaskReminder,
    updateTaskReminder,
    scheduleMultipleTaskReminders,
    cancelAllTaskReminders,
    getScheduledNotifications,
  }
}
