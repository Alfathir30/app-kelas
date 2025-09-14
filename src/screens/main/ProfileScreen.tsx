"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Alert, ScrollView, Switch, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../contexts/AuthContext"
import { useI18n } from "../../contexts/I18nContext"
import { useVersion } from "../../hooks/useVersion"
import AnimatedCard from "../../components/AnimatedCard"
import AnimatedButton from "../../components/AnimatedButton"
import LogoutButton from "../../components/LogoutButton"

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation()
  const { userProfile } = useAuth()
  const { language, changeLanguage } = useI18n()
  const { checkForUpdates, getCurrentVersion } = useVersion()
  const [isEnglish, setIsEnglish] = useState(language === "en")

  const handleLanguageToggle = async (value: boolean) => {
    setIsEnglish(value)
    await changeLanguage(value ? "en" : "id")
  }

  const handleWhatsAppContact = () => {
    const phoneNumber = "+6281234567890" // Replace with actual WhatsApp number
    const message = "Halo, saya membutuhkan bantuan dengan aplikasi TKJ2 Class App"
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url)
        } else {
          Alert.alert("Error", "WhatsApp tidak terinstall di perangkat ini")
        }
      })
      .catch((err) => {
        console.error("Error opening WhatsApp:", err)
        Alert.alert("Error", "Gagal membuka WhatsApp")
      })
  }

  const handleTelegramContact = () => {
    const telegramUsername = "tkj2classapp" // Replace with actual Telegram username
    const url = `https://t.me/${telegramUsername}`

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url)
        } else {
          Alert.alert("Error", "Telegram tidak terinstall di perangkat ini")
        }
      })
      .catch((err) => {
        console.error("Error opening Telegram:", err)
        Alert.alert("Error", "Gagal membuka Telegram")
      })
  }

  const handleVersionCheck = async () => {
    await checkForUpdates(true)
  }

  const handleAboutApp = () => {
    Alert.alert(
      "Tentang Aplikasi",
      "TKJ2 Class App\n\nAplikasi manajemen kelas untuk XI TKJ2 SMK Negeri 1.\n\nFitur:\n• Jadwal Pelajaran\n• Jadwal Piket\n• Manajemen Tugas\n• Notifikasi Pengingat\n• Role Management\n\nDikembangkan untuk memudahkan koordinasi dan komunikasi kelas.",
      [{ text: "OK" }],
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "#FF3B30"
      case "editor":
        return "#FF9500"
      default:
        return "#007AFF"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "owner":
        return "Pemilik"
      case "editor":
        return "Editor"
      default:
        return "Pengguna"
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <AnimatedCard animation="fadeInDown" style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userProfile?.name?.charAt(0).toUpperCase() || "U"}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userProfile?.name || "User"}</Text>
            <Text style={styles.userEmail}>{userProfile?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userProfile?.role || "user") }]}>
              <Text style={styles.roleText}>{getRoleDisplayName(userProfile?.role || "user")}</Text>
            </View>
          </View>
          <LogoutButton style={styles.headerLogoutButton} iconSize={20} iconColor="white" />
        </View>
      </AnimatedCard>

      {/* Settings */}
      <AnimatedCard delay={100} animation="fadeInUp" style={styles.section}>
        <Text style={styles.sectionTitle}>{t("common.settings")}</Text>

        {/* Language Toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="language-outline" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Bahasa / Language</Text>
              <Text style={styles.settingSubtitle}>{isEnglish ? "English" : "Bahasa Indonesia"}</Text>
            </View>
          </View>
          <Switch
            value={isEnglish}
            onValueChange={handleLanguageToggle}
            trackColor={{ false: "#767577", true: "#007AFF" }}
            thumbColor={isEnglish ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        {/* App Info */}
        <AnimatedButton style={styles.settingItem} onPress={handleAboutApp}>
          <View style={styles.settingLeft}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Tentang Aplikasi</Text>
              <Text style={styles.settingSubtitle}>Informasi aplikasi dan fitur</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </AnimatedButton>

        {/* Version Check */}
        <AnimatedButton style={styles.settingItem} onPress={handleVersionCheck}>
          <View style={styles.settingLeft}>
            <Ionicons name="refresh-outline" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Periksa Update</Text>
              <Text style={styles.settingSubtitle}>Versi {getCurrentVersion()}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </AnimatedButton>
      </AnimatedCard>

      {/* Help & Support */}
      <AnimatedCard delay={200} animation="fadeInUp" style={styles.section}>
        <Text style={styles.sectionTitle}>Bantuan & Dukungan</Text>

        {/* WhatsApp Support */}
        <AnimatedButton style={styles.settingItem} onPress={handleWhatsAppContact}>
          <View style={styles.settingLeft}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>WhatsApp</Text>
              <Text style={styles.settingSubtitle}>Hubungi kami via WhatsApp</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </AnimatedButton>

        {/* Telegram Support */}
        <AnimatedButton style={styles.settingItem} onPress={handleTelegramContact}>
          <View style={styles.settingLeft}>
            <Ionicons name="paper-plane-outline" size={24} color="#0088CC" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Telegram</Text>
              <Text style={styles.settingSubtitle}>Bergabung dengan grup Telegram</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </AnimatedButton>

        {/* FAQ */}
        <AnimatedButton style={styles.settingItem} onPress={() => Alert.alert("FAQ", "Fitur FAQ akan segera tersedia")}>
          <View style={styles.settingLeft}>
            <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>FAQ</Text>
              <Text style={styles.settingSubtitle}>Pertanyaan yang sering diajukan</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </AnimatedButton>
      </AnimatedCard>

      {/* Account Actions */}
      <AnimatedCard delay={300} animation="fadeInUp" style={styles.section}>
        <Text style={styles.sectionTitle}>Akun</Text>

        {/* Change Password */}
        <AnimatedButton
          style={styles.settingItem}
          onPress={() => Alert.alert("Ubah Kata Sandi", "Fitur ini akan segera tersedia")}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="key-outline" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Ubah Kata Sandi</Text>
              <Text style={styles.settingSubtitle}>Perbarui kata sandi Anda</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </AnimatedButton>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: "#FF3B30" }]}>{t("auth.logout")}</Text>
              <Text style={styles.settingSubtitle}>Keluar dari aplikasi dan hapus data lokal</Text>
            </View>
          </View>
          <LogoutButton style={styles.logoutButton} iconSize={16} showConfirmation={true} />
        </View>
      </AnimatedCard>

      {/* App Info */}
      <AnimatedCard delay={400} animation="fadeIn" style={styles.footer}>
        <Text style={styles.footerText}>TKJ2 Class App</Text>
        <Text style={styles.footerText}>Kelas XI TKJ2 • SMK Negeri 1</Text>
        <Text style={styles.footerVersion}>v{getCurrentVersion()}</Text>

        {/* Social Media Links */}
        <View style={styles.socialLinks}>
          <AnimatedButton style={styles.socialButton} onPress={handleWhatsAppContact}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </AnimatedButton>
          <AnimatedButton style={styles.socialButton} onPress={handleTelegramContact}>
            <Ionicons name="paper-plane-outline" size={20} color="#0088CC" />
          </AnimatedButton>
        </View>

        <View style={styles.emergencyLogout}>
          <Text style={styles.emergencyLogoutText}>Mengalami masalah?</Text>
          <LogoutButton style={styles.emergencyLogoutButton} iconSize={14} iconColor="#666" showConfirmation={false} />
        </View>
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
    backgroundColor: "white",
    padding: 20,
    paddingTop: 50,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  headerLogoutButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  section: {
    backgroundColor: "white",
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "#FFF5F5",
    borderRadius: 16,
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
  socialLinks: {
    flexDirection: "row",
    marginTop: 20,
    gap: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyLogout: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  emergencyLogoutText: {
    fontSize: 12,
    color: "#999",
  },
  emergencyLogoutButton: {
    padding: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
})

export default ProfileScreen
