export interface User {
  uid: string
  email: string
  name: string
  role: "owner" | "editor" | "user"
  createdAt: Date
  updatedAt: Date
}

export interface PiketSchedule {
  id: string
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
  students: string[]
  tasks: string[]
  createdAt: Date
  updatedAt: Date
}

export interface LessonSchedule {
  id: string
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
  time: string
  subject: string
  teacher: string
  room: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
  assignedTo: string[]
  createdBy: string
  priority: "low" | "medium" | "high"
  createdAt: Date
  updatedAt: Date
}

export interface Summary {
  id: string
  type: "financial" | "habit" | "academic"
  title: string
  value: number
  description: string
  date: Date
  createdAt: Date
  updatedAt: Date
}
