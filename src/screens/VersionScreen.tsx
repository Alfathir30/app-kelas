"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useVersion } from "../hooks/useVersion"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import AnimatedCard from "../components/AnimatedCard"
import AnimatedButton from "../components/AnimatedButton"

const VersionScreen: React.FC = () => {
  const { versionInfo, isChecking, lastCheckDate, checkForUpdates, getCurrentVersion, getVersionHistory } = useVersion()
  const [refreshing, setRefreshing] = useState(false)

  const currentVersion = getCurrentVersion()
  const versionHistory = getVersionHistory()

  const onRefresh = async () => {
    setRefreshing(true)
    await checkForUpdates(true)
    setRefreshing(false)
  }

  const handleCheckUpdates = async () => {
    await checkForUpdates(true)
  }

  const getStatusColor = () => {
    if (versionInfo?.isUpdateAvailable) {
      return versionInfo.isForceUpdate ? "#FF3B30" : "#FF9500"
    }
    return "#34C759"
  }

  const getStatusText = () => {
    if (versionInfo?.isUpdateAvailable) {
      return versionInfo.isForceUpdate ? "Update Wajib" : "Update Tersedia"
    }
    return "Terbaru"
  }

  const getStatusIcon = () => {
    if (versionInfo?.isUpdateAvailable) {
      return versionInfo.isForceUpdate ? "warning" : "information-circle"
    }
    return "checkmark-circle"
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <AnimatedCard animation="fadeInDown" style={styles.header}>
        <Text style={styles.headerTitle}>Versi Aplikasi</Text>
        <Text style={styles.headerSubtitle}>TKJ2 Class App</Text>
      </AnimatedCard>

      {/* Current Version */}
      <AnimatedCard delay={100} animation="fadeInUp" style={styles.section}>
        <View style={styles.versionCard}>
          <View style={styles.versionInfo}>
            <Text style={styles.versionNumber}>v{currentVersion}</Text>
            <Text style={styles.versionLabel}>Versi Saat Ini</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Ionicons name={getStatusIcon()} size={16} color="white" />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {versionInfo?.isUpdateAvailable && (
          <View style={styles.updateInfo}>
            <Text style={styles.updateTitle}>Versi {versionInfo.latestVersion} Tersedia</Text>
            {versionInfo.releaseNotes && <Text style={styles.updateNotes}>{versionInfo.releaseNotes}</Text>}
          </View>
        )}
      </AnimatedCard>

      {/* Check Updates */}
      <AnimatedCard delay={200} animation="fadeInUp" style={styles.section}>
        <View style={styles.checkSection}>
          <View style={styles.checkInfo}>
            <Text style={styles.checkTitle}>Pemeriksaan Update</Text>
            <Text style={styles.checkSubtitle}>
              {lastCheckDate
                ? `Terakhir diperiksa: ${format(lastCheckDate, "dd MMM yyyy, HH:mm", { locale: id })}`
                : "Belum pernah diperiksa"}
            </Text>
          </View>

          <AnimatedButton
            style={[styles.checkButton, isChecking && styles.checkButtonDisabled]}
            onPress={handleCheckUpdates}
            disabled={isChecking}
          >
            {isChecking ? (
              <Ionicons name="refresh" size={20} color="white" />
            ) : (
              <Ionicons name="cloud-download-outline" size={20} color="white" />
            )}
            <Text style={styles.checkButtonText}>{isChecking ? "Memeriksa..." : "Periksa Update"}</Text>
          </AnimatedButton>
        </View>
      </AnimatedCard>

      {/* Version History */}
      <AnimatedCard delay={300} animation="fadeInUp" style={styles.section}>
        <Text style={styles.sectionTitle}>Riwayat Versi</Text>

        {versionHistory.map((version, index) => (
          <AnimatedCard
            key={version.version}
            delay={300 + index * 50}
            animation="slideInLeft"
            style={styles.historyItem}
          >
            <View style={styles.historyHeader}>
              <View style={styles.historyVersion}>
                <Text style={styles.historyVersionNumber}>v{version.version}</Text>
                <Text style={styles.historyDate}>{format(new Date(version.date), "dd MMM yyyy", { locale: id })}</Text>
              </View>

              {version.version === currentVersion && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Saat Ini</Text>
                </View>
              )}
            </View>

            <Text style={styles.historyNotes}>{version.notes}</Text>
          </AnimatedCard>
        ))}
      </AnimatedCard>

      {/* App Info */}
      <AnimatedCard delay={400} animation="fadeIn" style={styles.footer}>
        <Text style={styles.footerText}>TKJ2 Class App</Text>
        <Text style={styles.footerText}>Kelas XI TKJ2 • SMK Negeri 1</Text>
        <Text style={styles.footerVersion}>
          Build: {currentVersion}.{Date.now().toString().slice(-4)}
        </Text>
      </AnimatedCard>
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
  section: {
    backgroundColor: "white",
    marginTop: 20,
    padding: 20,
  },
  versionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  versionInfo: {
    flex: 1,
  },
  versionNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  versionLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    marginLeft: 4,
  },
  updateInfo: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  updateNotes: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  checkSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkInfo: {
    flex: 1,
    marginRight: 16,
  },
  checkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  checkSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  checkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 16,
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyVersion: {
    flex: 1,
  },
  historyVersionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  historyDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  historyNotes: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    padding: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  footerVersion: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 8,
  },
})

export default VersionScreen
