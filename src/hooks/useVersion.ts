"use client"

import { useState, useEffect, useCallback } from "react"
import VersionService, { type VersionInfo } from "../services/VersionService"

export const useVersion = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckDate, setLastCheckDate] = useState<Date | null>(null)

  const versionService = VersionService.getInstance()

  useEffect(() => {
    // Load last check date on mount
    const loadLastCheckDate = async () => {
      const date = await versionService.getLastCheckDate()
      setLastCheckDate(date)
    }
    loadLastCheckDate()

    // Auto check for updates on app start
    versionService.autoCheckForUpdates()
  }, [])

  const checkForUpdates = useCallback(async (showNoUpdateAlert = false) => {
    setIsChecking(true)
    try {
      const info = await versionService.checkForUpdates(showNoUpdateAlert)
      setVersionInfo(info)

      const newLastCheckDate = await versionService.getLastCheckDate()
      setLastCheckDate(newLastCheckDate)

      return info
    } finally {
      setIsChecking(false)
    }
  }, [])

  const getCurrentVersion = useCallback(() => {
    return versionService.getCurrentVersion()
  }, [])

  const getVersionHistory = useCallback(() => {
    return versionService.getVersionHistory()
  }, [])

  const compareVersions = useCallback((version1: string, version2: string) => {
    return versionService.compareVersions(version1, version2)
  }, [])

  return {
    versionInfo,
    isChecking,
    lastCheckDate,
    checkForUpdates,
    getCurrentVersion,
    getVersionHistory,
    compareVersions,
  }
}
