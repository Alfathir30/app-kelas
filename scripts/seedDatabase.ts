import { initializeApp } from "firebase/app"
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
const db = getFirestore(app)

// Sample data for Class 11 TKJ2
const piketSchedules = [
  {
    id: "monday",
    day: "monday",
    students: ["Ahmad Rizki", "Siti Nurhaliza", "Budi Santoso", "Dewi Lestari"],
    tasks: [
      "Membersihkan papan tulis",
      "Menyapu lantai kelas",
      "Mengatur meja dan kursi",
      "Membuang sampah",
      "Mematikan AC dan lampu",
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "tuesday",
    day: "tuesday",
    students: ["Andi Pratama", "Maya Sari", "Rudi Hermawan", "Lina Marlina"],
    tasks: [
      "Membersihkan papan tulis",
      "Menyapu lantai kelas",
      "Mengatur meja dan kursi",
      "Membuang sampah",
      "Mematikan AC dan lampu",
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "wednesday",
    day: "wednesday",
    students: ["Doni Setiawan", "Rina Wati", "Agus Salim", "Fitri Handayani"],
    tasks: [
      "Membersihkan papan tulis",
      "Menyapu lantai kelas",
      "Mengatur meja dan kursi",
      "Membuang sampah",
      "Mematikan AC dan lampu",
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "thursday",
    day: "thursday",
    students: ["Hendra Gunawan", "Novi Astuti", "Bayu Aji", "Indah Permata"],
    tasks: [
      "Membersihkan papan tulis",
      "Menyapu lantai kelas",
      "Mengatur meja dan kursi",
      "Membuang sampah",
      "Mematikan AC dan lampu",
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "friday",
    day: "friday",
    students: ["Joko Widodo", "Sri Mulyani", "Tono Sumarno", "Yuni Shara"],
    tasks: [
      "Membersihkan papan tulis",
      "Menyapu lantai kelas",
      "Mengatur meja dan kursi",
      "Membuang sampah",
      "Mematikan AC dan lampu",
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

const lessonSchedules = [
  // Monday
  {
    id: "monday-1",
    day: "monday",
    time: "07:00 - 08:30",
    subject: "Matematika",
    teacher: "Pak Suryanto",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "monday-2",
    day: "monday",
    time: "08:30 - 10:00",
    subject: "Bahasa Indonesia",
    teacher: "Bu Sari",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "monday-3",
    day: "monday",
    time: "10:15 - 11:45",
    subject: "Jaringan Dasar",
    teacher: "Pak Budi",
    room: "Lab Komputer 1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "monday-4",
    day: "monday",
    time: "12:30 - 14:00",
    subject: "Sistem Operasi",
    teacher: "Bu Rina",
    room: "Lab Komputer 2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },

  // Tuesday
  {
    id: "tuesday-1",
    day: "tuesday",
    time: "07:00 - 08:30",
    subject: "Bahasa Inggris",
    teacher: "Bu Maya",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "tuesday-2",
    day: "tuesday",
    time: "08:30 - 10:00",
    subject: "Pemrograman Dasar",
    teacher: "Pak Andi",
    room: "Lab Komputer 1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "tuesday-3",
    day: "tuesday",
    time: "10:15 - 11:45",
    subject: "Administrasi Infrastruktur Jaringan",
    teacher: "Pak Doni",
    room: "Lab Komputer 2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "tuesday-4",
    day: "tuesday",
    time: "12:30 - 14:00",
    subject: "PKN",
    teacher: "Bu Fitri",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },

  // Wednesday
  {
    id: "wednesday-1",
    day: "wednesday",
    time: "07:00 - 08:30",
    subject: "Fisika",
    teacher: "Pak Hendra",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "wednesday-2",
    day: "wednesday",
    time: "08:30 - 10:00",
    subject: "Teknologi Layanan Jaringan",
    teacher: "Bu Novi",
    room: "Lab Komputer 1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "wednesday-3",
    day: "wednesday",
    time: "10:15 - 11:45",
    subject: "Administrasi Sistem Jaringan",
    teacher: "Pak Bayu",
    room: "Lab Komputer 2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "wednesday-4",
    day: "wednesday",
    time: "12:30 - 14:00",
    subject: "Agama",
    teacher: "Pak Joko",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },

  // Thursday
  {
    id: "thursday-1",
    day: "thursday",
    time: "07:00 - 08:30",
    subject: "Kimia",
    teacher: "Bu Sri",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "thursday-2",
    day: "thursday",
    time: "08:30 - 10:00",
    subject: "Komputer dan Jaringan Dasar",
    teacher: "Pak Tono",
    room: "Lab Komputer 1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "thursday-3",
    day: "thursday",
    time: "10:15 - 11:45",
    subject: "Pemrograman Web",
    teacher: "Bu Yuni",
    room: "Lab Komputer 2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "thursday-4",
    day: "thursday",
    time: "12:30 - 14:00",
    subject: "Sejarah",
    teacher: "Pak Ahmad",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },

  // Friday
  {
    id: "friday-1",
    day: "friday",
    time: "07:00 - 08:30",
    subject: "Olahraga",
    teacher: "Pak Rudi",
    room: "Lapangan",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "friday-2",
    day: "friday",
    time: "08:30 - 10:00",
    subject: "Seni Budaya",
    teacher: "Bu Lina",
    room: "XI TKJ2",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "friday-3",
    day: "friday",
    time: "10:15 - 11:45",
    subject: "Troubleshooting Jaringan",
    teacher: "Pak Agus",
    room: "Lab Komputer 1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

const sampleTasks = [
  {
    id: "task-1",
    title: "Tugas Matematika Bab 5",
    description: "Kerjakan soal latihan halaman 120-125",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    completed: false,
    assignedTo: ["all"],
    createdBy: "teacher",
    priority: "high",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "task-2",
    title: "Praktikum Jaringan",
    description: "Konfigurasi router dan switch di lab",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    completed: false,
    assignedTo: ["all"],
    createdBy: "teacher",
    priority: "medium",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "task-3",
    title: "Essay Bahasa Indonesia",
    description: "Tulis essay tentang teknologi informasi 500 kata",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    completed: false,
    assignedTo: ["all"],
    createdBy: "teacher",
    priority: "medium",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

const sampleSummary = [
  {
    id: "financial-1",
    type: "financial",
    title: "Kas Kelas",
    value: 750000,
    description: "Total kas kelas bulan ini",
    date: new Date(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "academic-1",
    type: "academic",
    title: "Rata-rata Nilai",
    value: 85.5,
    description: "Rata-rata nilai kelas semester ini",
    date: new Date(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "habit-1",
    type: "habit",
    title: "Kehadiran",
    value: 95,
    description: "Persentase kehadiran kelas bulan ini",
    date: new Date(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Seed piket schedules
    console.log("Seeding piket schedules...")
    for (const schedule of piketSchedules) {
      await setDoc(doc(db, "piket_schedules", schedule.id), schedule)
      console.log(`Added piket schedule for ${schedule.day}`)
    }

    // Seed lesson schedules
    console.log("Seeding lesson schedules...")
    for (const lesson of lessonSchedules) {
      await setDoc(doc(db, "lesson_schedules", lesson.id), lesson)
      console.log(`Added lesson: ${lesson.subject} on ${lesson.day}`)
    }

    // Seed tasks
    console.log("Seeding tasks...")
    for (const task of sampleTasks) {
      await setDoc(doc(db, "tasks", task.id), task)
      console.log(`Added task: ${task.title}`)
    }

    // Seed summary data
    console.log("Seeding summary data...")
    for (const summary of sampleSummary) {
      await setDoc(doc(db, "summary", summary.id), summary)
      console.log(`Added summary: ${summary.title}`)
    }

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seeding function
seedDatabase()
