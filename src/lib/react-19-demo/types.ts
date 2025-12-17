export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'work' | 'personal' | 'shopping' | 'health'
  createdAt: string
  updatedAt: string
}

export interface FormState {
  success: boolean
  message: string
  errors?: {
    title?: string
    description?: string
  }
}

export interface TasksResponse {
  tasks: Task[]
  total: number
}

export interface TaskResponse {
  task: Task
}

export interface ErrorResponse {
  error: string
}

export type TaskFilter = {
  status?: 'all' | 'active' | 'completed'
  priority?: Task['priority'] | 'all'
  category?: Task['category'] | 'all'
  search?: string
}

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
}

export interface LoginFormState {
  success: boolean
  message: string
  errors?: {
    username?: string
    password?: string
  }
}

export interface UserData {
  user: User
  recentTasks: Task[]
  stats: {
    totalTasks: number
    completedTasks: number
    activeTasks: number
  }
}
