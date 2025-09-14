"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { auth, enableOfflineSupport } from "./src/config/firebase"
import type { User } from "firebase/auth"

import { AuthProvider } from "./src/contexts/AuthContext"
import { I18nProvider } from "./src/contexts/I18nContext"
import AuthNavigator from "./src/navigation/AuthNavigator"
import MainNavigator from "./src/navigation/MainNavigator"
import LoadingScreen from "./src/screens/LoadingScreen"

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    enableOfflineSupport()

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <I18nProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          {user ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </AuthProvider>
    </I18nProvider>
  )
}
