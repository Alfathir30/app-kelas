"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { auth, db } from "../config/firebase"
import NotificationService from "../services/NotificationService"

export type UserRole = "owner" | "editor" | "user"

export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  name: string
  createdAt: Date
  updatedAt: Date
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  hasPermission: (requiredRole: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const roleHierarchy: Record<UserRole, number> = {
  user: 1,
  editor: 2,
  owner: 3,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)

      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile
            setUserProfile(profileData)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, name: string, role: UserRole = "user") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      role,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userProfile)
    setUserProfile(userProfile)
  }

  const logout = async () => {
    try {
      // Clear all notifications
      const notificationService = NotificationService.getInstance()
      await notificationService.cancelAllTaskReminders()

      // Clear local storage
      await AsyncStorage.multiRemove(["task_notifications", "last_version_check", "user_preferences"])

      // Sign out from Firebase
      await signOut(auth)

      // Show success message
      Alert.alert("Berhasil Keluar", "Anda telah berhasil keluar dari aplikasi.", [{ text: "OK" }])
    } catch (error) {
      console.error("Error during logout:", error)
      Alert.alert("Error", "Terjadi kesalahan saat keluar. Silakan coba lagi.", [{ text: "OK" }])
    }
  }

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userProfile) return false
    return roleHierarchy[userProfile.role] >= roleHierarchy[requiredRole]
  }

  const value: AuthContextType = {
    user,
    userProfile,
    login,
    register,
    logout,
    loading,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
