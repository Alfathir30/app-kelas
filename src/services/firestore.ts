import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  type DocumentData,
  type QueryConstraint,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../config/firebase"

// Generic Firestore service class
export class FirestoreService {
  private collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  // Get a single document
  async getDocument(id: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error)
      throw error
    }
  }

  // Get multiple documents with optional constraints
  async getDocuments(constraints: QueryConstraint[] = []): Promise<DocumentData[]> {
    try {
      const collectionRef = collection(db, this.collectionName)
      const q = query(collectionRef, ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error(`Error getting documents from ${this.collectionName}:`, error)
      throw error
    }
  }

  // Create or update a document
  async setDocument(id: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
        createdAt: data.createdAt || serverTimestamp(),
      })
    } catch (error) {
      console.error(`Error setting document in ${this.collectionName}:`, error)
      throw error
    }
  }

  // Update a document
  async updateDocument(id: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error)
      throw error
    }
  }

  // Delete a document
  async deleteDocument(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error)
      throw error
    }
  }

  // Listen to real-time updates
  subscribeToDocument(id: string, callback: (data: DocumentData | null) => void) {
    const docRef = doc(db, this.collectionName, id)
    return onSnapshot(docRef, (doc) => {
      callback(doc.exists() ? { id: doc.id, ...doc.data() } : null)
    })
  }

  // Listen to collection changes
  subscribeToCollection(callback: (data: DocumentData[]) => void, constraints: QueryConstraint[] = []) {
    const collectionRef = collection(db, this.collectionName)
    const q = query(collectionRef, ...constraints)
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      callback(documents)
    })
  }
}

// Specific services for each collection
export const usersService = new FirestoreService("users")
export const piketService = new FirestoreService("piket_schedules")
export const pelajaranService = new FirestoreService("lesson_schedules")
export const tasksService = new FirestoreService("tasks")
export const summaryService = new FirestoreService("summary")
