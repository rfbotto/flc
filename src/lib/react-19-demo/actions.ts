'use server'

import { FormState, Task } from './types'
import { addTask, updateTask as updateTaskInDb, deleteTask as deleteTaskInDb } from './mock-data'

async function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function createTaskAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = (formData.get('priority') as Task['priority']) || 'medium'
  const category = (formData.get('category') as Task['category']) || 'work'
  const delay = parseInt(formData.get('delay') as string) || 500
  const simulateError = formData.get('simulateError') === 'true'

  await simulateDelay(delay)

  if (simulateError) {
    return {
      success: false,
      message: 'Simulated server error - task not created',
    }
  }

  if (!title || title.trim().length === 0) {
    return {
      success: false,
      message: 'Validation failed',
      errors: {
        title: 'Title is required',
      },
    }
  }

  if (title.length < 3) {
    return {
      success: false,
      message: 'Validation failed',
      errors: {
        title: 'Title must be at least 3 characters',
      },
    }
  }

  addTask({
    title: title.trim(),
    description: description?.trim() || '',
    completed: false,
    priority,
    category,
  })

  return {
    success: true,
    message: 'Task created successfully!',
  }
}

export async function updateTaskAction(
  taskId: string,
  updates: Partial<Task>,
  options?: { delay?: number; simulateError?: boolean }
): Promise<{ success: boolean; task?: Task; error?: string }> {
  const delay = options?.delay || 500

  await simulateDelay(delay)

  if (options?.simulateError) {
    return {
      success: false,
      error: 'Simulated server error',
    }
  }

  const updatedTask = updateTaskInDb(taskId, updates)
  if (!updatedTask) {
    return {
      success: false,
      error: 'Task not found',
    }
  }

  return {
    success: true,
    task: updatedTask,
  }
}

export async function deleteTaskAction(
  taskId: string,
  options?: { delay?: number; simulateError?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const delay = options?.delay || 500

  await simulateDelay(delay)

  if (options?.simulateError) {
    return {
      success: false,
      error: 'Simulated server error',
    }
  }

  const deleted = deleteTaskInDb(taskId)
  if (!deleted) {
    return {
      success: false,
      error: 'Task not found',
    }
  }

  return {
    success: true,
  }
}

export async function toggleTaskAction(
  taskId: string,
  completed: boolean,
  options?: { delay?: number; simulateError?: boolean }
): Promise<{ success: boolean; task?: Task; error?: string }> {
  return updateTaskAction(taskId, { completed }, options)
}

export async function loginAction(
  username: string,
  password: string,
  options?: { delay?: number; simulateError?: boolean }
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const delay = options?.delay || 800

  await simulateDelay(delay)

  if (options?.simulateError) {
    return {
      success: false,
      error: 'Simulated authentication error',
    }
  }

  if (!username || username.trim().length === 0) {
    return {
      success: false,
      error: 'Username is required',
    }
  }

  if (!password || password.length < 4) {
    return {
      success: false,
      error: 'Password must be at least 4 characters',
    }
  }

  if (password === 'wrong') {
    return {
      success: false,
      error: 'Invalid username or password',
    }
  }

  return {
    success: true,
    userId: `user-${username.toLowerCase()}`,
  }
}

const userDataCache = new Map<string, Promise<{ user: { id: string; username: string; email: string; displayName: string }; recentTasks: { id: string; title: string; completed: boolean }[]; stats: { totalTasks: number; completedTasks: number; activeTasks: number } }>>()

export async function prefetchUserData(
  userId: string,
  options?: { delay?: number; timeout?: number }
): Promise<void> {
  const delay = options?.delay || 600
  const timeout = options?.timeout || 1000

  const fetchPromise = (async () => {
    await simulateDelay(delay)
    return {
      user: {
        id: userId,
        username: userId.replace('user-', ''),
        email: `${userId.replace('user-', '')}@example.com`,
        displayName: userId.replace('user-', '').charAt(0).toUpperCase() + userId.replace('user-', '').slice(1),
      },
      recentTasks: [
        { id: '1', title: 'Review pull request #42', completed: false },
        { id: '2', title: 'Update API documentation', completed: false },
        { id: '3', title: 'Fix mobile navigation bug', completed: true },
      ],
      stats: {
        totalTasks: 12,
        completedTasks: 5,
        activeTasks: 7,
      },
    }
  })()

  userDataCache.set(userId, fetchPromise)

  await Promise.race([
    fetchPromise,
    new Promise(resolve => setTimeout(resolve, timeout))
  ])
}

export async function getUserDataPromise(userId: string): Promise<{ user: { id: string; username: string; email: string; displayName: string }; recentTasks: { id: string; title: string; completed: boolean }[]; stats: { totalTasks: number; completedTasks: number; activeTasks: number } } | undefined> {
  return userDataCache.get(userId)
}

export async function clearUserDataCache(): Promise<void> {
  userDataCache.clear()
}
