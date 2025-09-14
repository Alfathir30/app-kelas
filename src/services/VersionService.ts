"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert, Linking } from "react-native"

export interface VersionInfo {
  currentVersion: string
  latestVersion: string
  isUpdateAvailable: boolean
  isForceUpdate: boolean
  updateUrl?: string
  releaseNotes?: string
  releaseDate?: string
}

export interface UpdateConfig {
  checkUrl: string
  downloadUrl: string
  forceUpdateVersions: string[]
}

class VersionService {
  private static instance: VersionService
  private currentVersion = "1.0.0"
  private lastCheckDate: Date | null = null
  private updateConfig: UpdateConfig = {
    checkUrl: "https://api.github.com/repos/your-repo/releases/latest", // Replace with actual API
    downloadUrl: "https://github.com/your-repo/releases", // Replace with actual download URL
    forceUpdateVersions: ["0.9.0", "0.9.1"], // Versions that require force update
  }

  static getInstance(): VersionService {
    if (!VersionService.instance) {
      VersionService.instance = new VersionService()
    }
    return VersionService.instance
  }

  getCurrentVersion(): string {
    return this.currentVersion
  }

  async getLastCheckDate(): Promise<Date | null> {
    try {
      const dateString = await AsyncStorage.getItem("last_version_check")
      return dateString ? new Date(dateString) : null
    } catch (error) {
      console.error("Failed to get last check date:", error)
      return null
    }
  }

  private async setLastCheckDate(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem("last_version_check", date.toISOString())
      this.lastCheckDate = date
    } catch (error) {
      console.error("Failed to set last check date:", error)
    }
  }

  async checkForUpdates(showNoUpdateAlert = false): Promise<VersionInfo> {
    try {
      // For demo purposes, simulate version check
      // In a real app, you would fetch from your API
      const versionInfo = await this.simulateVersionCheck()

      await this.setLastCheckDate(new Date())

      if (versionInfo.isUpdateAvailable) {
        this.showUpdateAlert(versionInfo)
      } else if (showNoUpdateAlert) {
        Alert.alert("Tidak Ada Update", `Anda sudah menggunakan versi terbaru (${versionInfo.currentVersion})`, [
          { text: "OK" },
        ])
      }

      return versionInfo
    } catch (error) {
      console.error("Failed to check for updates:", error)

      if (showNoUpdateAlert) {
        Alert.alert("Error", "Gagal memeriksa update. Pastikan Anda terhubung ke internet.", [{ text: "OK" }])
      }

      return {
        currentVersion: this.currentVersion,
        latestVersion: this.currentVersion,
        isUpdateAvailable: false,
        isForceUpdate: false,
      }
    }
  }

  private async simulateVersionCheck(): Promise<VersionInfo> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For demo, randomly decide if update is available
    const hasUpdate = Math.random() > 0.7 // 30% chance of update
    const latestVersion = hasUpdate ? "1.1.0" : this.currentVersion
    const isForceUpdate = this.updateConfig.forceUpdateVersions.includes(this.currentVersion)

    return {
      currentVersion: this.currentVersion,
      latestVersion,
      isUpdateAvailable: hasUpdate,
      isForceUpdate,
      updateUrl: this.updateConfig.downloadUrl,
      releaseNotes: hasUpdate
        ? "• Perbaikan bug\n• Peningkatan performa\n• Fitur notifikasi yang lebih baik\n• UI/UX improvements"
        : undefined,
      releaseDate: hasUpdate ? new Date().toISOString() : undefined,
    }
  }

  private showUpdateAlert(versionInfo: VersionInfo): void {
    const title = versionInfo.isForceUpdate ? "Update Wajib" : "Update Tersedia"
    const message = `Versi ${versionInfo.latestVersion} tersedia.\n\n${versionInfo.releaseNotes || "Update terbaru dengan perbaikan dan fitur baru."}`

    const buttons = versionInfo.isForceUpdate
      ? [
          {
            text: "Update Sekarang",
            onPress: () => this.openUpdateUrl(versionInfo.updateUrl),
          },
        ]
      : [
          {
            text: "Nanti",
            style: "cancel" as const,
          },
          {
            text: "Update",
            onPress: () => this.openUpdateUrl(versionInfo.updateUrl),
          },
        ]

    Alert.alert(title, message, buttons, {
      cancelable: !versionInfo.isForceUpdate,
    })
  }

  private async openUpdateUrl(url?: string): Promise<void> {
    if (!url) {
      Alert.alert("Error", "URL update tidak tersedia")
      return
    }

    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        Alert.alert("Error", "Tidak dapat membuka URL update")
      }
    } catch (error) {
      console.error("Failed to open update URL:", error)
      Alert.alert("Error", "Gagal membuka halaman update")
    }
  }

  async shouldCheckForUpdates(): Promise<boolean> {
    const lastCheck = await this.getLastCheckDate()
    if (!lastCheck) return true

    // Check once per day
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    return lastCheck < oneDayAgo
  }

  async autoCheckForUpdates(): Promise<void> {
    const shouldCheck = await this.shouldCheckForUpdates()
    if (shouldCheck) {
      await this.checkForUpdates(false)
    }
  }

  getVersionHistory(): Array<{ version: string; date: string; notes: string }> {
    return [
      {
        version: "1.0.0",
        date: "2024-01-15",
        notes:
          "• Rilis pertama\n• Jadwal pelajaran dan piket\n• Manajemen tugas\n• Sistem notifikasi\n• Role management",
      },
      {
        version: "0.9.1",
        date: "2024-01-10",
        notes: "• Beta testing\n• Perbaikan bug\n• Optimasi performa",
      },
      {
        version: "0.9.0",
        date: "2024-01-05",
        notes: "• Alpha release\n• Fitur dasar\n• Testing internal",
      },
    ]
  }

  compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split(".").map(Number)
    const v2Parts = version2.split(".").map(Number)

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0

      if (v1Part > v2Part) return 1
      if (v1Part < v2Part) return -1
    }

    return 0
  }
}

export default VersionService
