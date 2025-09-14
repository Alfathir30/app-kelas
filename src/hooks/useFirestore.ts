"use client"

import { useState, useEffect } from "react"
import type { DocumentData, QueryConstraint } from "firebase/firestore"
import { FirestoreService } from "../services/firestore"

// Custom hook for Firestore operations
export function useFirestore(collectionName: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const service = new FirestoreService(collectionName)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribe = service.subscribeToCollection((documents) => {
      setData(documents)
      setLoading(false)
    }, constraints)

    return () => unsubscribe()
  }, [collectionName, JSON.stringify(constraints)])

  const addDocument = async (id: string, data: any) => {
    try {
      await service.setDocument(id, data)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateDocument = async (id: string, data: any) => {
    try {
      await service.updateDocument(id, data)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      await service.deleteDocument(id)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    data,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
  }
}

// Hook for single document
export function useDocument(collectionName: string, documentId: string) {
  const [data, setData] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const service = new FirestoreService(collectionName)

  useEffect(() => {
    if (!documentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = service.subscribeToDocument(documentId, (document) => {
      setData(document)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [collectionName, documentId])

  return { data, loading, error }
}
