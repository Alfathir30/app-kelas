"use client"

import type React from "react"
import { Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../contexts/AuthContext"
import AnimatedButton from "./AnimatedButton"

interface LogoutButtonProps {
  style?: any
  iconSize?: number
  iconColor?: string
  showConfirmation?: boolean
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  style,
  iconSize = 24,
  iconColor = "#FF3B30",
  showConfirmation = true,
}) => {
  const { logout } = useAuth()

  const handleLogout = () => {
    if (showConfirmation) {
      Alert.alert("Keluar Aplikasi", "Apakah Anda yakin ingin keluar dari aplikasi?", [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: logout,
        },
      ])
    } else {
      logout()
    }
  }

  return (
    <AnimatedButton style={style} onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={iconSize} color={iconColor} />
    </AnimatedButton>
  )
}

export default LogoutButton
