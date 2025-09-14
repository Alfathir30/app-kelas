import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"

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
const auth = getAuth(app)
const db = getFirestore(app)

async function createAdminUser() {
  try {
    console.log("Creating admin user...")

    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(auth, "admin@tkj2.com", "admin123456")
    const user = userCredential.user

    // Create admin profile in Firestore
    const adminProfile = {
      uid: user.uid,
      email: user.email,
      role: "owner",
      name: "Admin TKJ2",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, "users", user.uid), adminProfile)

    console.log("Admin user created successfully!")
    console.log("Email: admin@tkj2.com")
    console.log("Password: admin123456")
    console.log("Role: owner")
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

// Run the function
createAdminUser()
