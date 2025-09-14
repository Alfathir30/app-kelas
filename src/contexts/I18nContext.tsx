"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import * as Localization from "expo-localization"

import id from "../locales/id.json"
import en from "../locales/en.json"

const resources = {
  id: { translation: id },
  en: { translation: en },
}

i18n.use(initReactI18next).init({
  resources,
  lng: "id", // default language
  fallbackLng: "id",
  interpolation: {
    escapeValue: false,
  },
})

interface I18nContextType {
  language: string
  changeLanguage: (lang: string) => Promise<void>
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

interface I18nProviderProps {
  children: ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState("id")

  useEffect(() => {
    loadLanguage()
  }, [])

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language")
      if (savedLanguage) {
        setLanguage(savedLanguage)
        i18n.changeLanguage(savedLanguage)
      } else {
        // Use device locale if available
        const deviceLanguage = Localization.locale.startsWith("id") ? "id" : "en"
        setLanguage(deviceLanguage)
        i18n.changeLanguage(deviceLanguage)
      }
    } catch (error) {
      console.error("Error loading language:", error)
    }
  }

  const changeLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem("language", lang)
      setLanguage(lang)
      i18n.changeLanguage(lang)
    } catch (error) {
      console.error("Error saving language:", error)
    }
  }

  const value: I18nContextType = {
    language,
    changeLanguage,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
