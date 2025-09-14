import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage"
import { storage } from "../config/firebase"

export class StorageService {
  // Upload file to Firebase Storage
  async uploadFile(path: string, file: Blob | Uint8Array | ArrayBuffer, metadata?: any): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file, metadata)
      const downloadURL = await getDownloadURL(snapshot.ref)
      return downloadURL
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }

  // Get download URL for a file
  async getFileURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error("Error getting file URL:", error)
      throw error
    }
  }

  // Delete a file
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      console.error("Error deleting file:", error)
      throw error
    }
  }

  // List all files in a directory
  async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(storage, path)
      const result = await listAll(storageRef)
      const urls = await Promise.all(result.items.map((item) => getDownloadURL(item)))
      return urls
    } catch (error) {
      console.error("Error listing files:", error)
      throw error
    }
  }

  // Upload image with compression (for mobile)
  async uploadImage(path: string, uri: string, metadata?: any): Promise<string> {
    try {
      const response = await fetch(uri)
      const blob = await response.blob()
      return await this.uploadFile(path, blob, metadata)
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }
}

export const storageService = new StorageService()
