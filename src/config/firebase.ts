import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"
import Constants from "expo-constants"
import { __DEV__ } from "react-native"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB99bpYHbKCSew6q3lQfAnOU7cho6mre24",
  authDomain: "class11tkj2.firebaseapp.com",
  projectId: "class11tkj2",
  storageBucket: "class11tkj2.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:android:abcdef1234567890abcdef",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Enable offline persistence
export const enableOfflineSupport = async () => {
  try {
    await enableNetwork(db)
    console.log("Firebase offline support enabled")
  } catch (error) {
    console.error("Error enabling offline support:", error)
  }
}

// Disable network (for testing offline functionality)
export const disableOfflineSupport = async () => {
  try {
    await disableNetwork(db)
    console.log("Firebase network disabled")
  } catch (error) {
    console.error("Error disabling network:", error)
  }
}

// Connect to emulators in development
if (__DEV__ && Constants.expoConfig?.extra?.useEmulators) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099")
    connectFirestoreEmulator(db, "localhost", 8080)
    connectStorageEmulator(storage, "localhost", 9199)
    console.log("Connected to Firebase emulators")
  } catch (error) {
    console.log("Emulators already connected or not available")
  }
}

export default app
