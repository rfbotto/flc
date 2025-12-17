import { Task } from './types'

const taskTitles = [
  'Review pull request',
  'Update documentation',
  'Fix navigation bug',
  'Write unit tests',
  'Refactor auth module',
  'Design new feature',
  'Optimize database queries',
  'Setup CI/CD pipeline',
  'Create API endpoints',
  'Implement caching',
  'Buy groceries',
  'Schedule dentist appointment',
  'Call mom',
  'Plan weekend trip',
  'Read React documentation',
  'Organize desk',
  'Pay utility bills',
  'Workout routine',
  'Meal prep Sunday',
  'Book flight tickets',
  'Submit expense report',
  'Team standup meeting',
  'Code review session',
  'Deploy to staging',
  'Customer feedback review',
]

const descriptions = [
  'This needs to be done soon',
  'High priority item',
  'Can wait until next week',
  'Blocked by other tasks',
  'Requires team discussion',
  'Quick task, should take 30 mins',
  'Complex task, may need help',
  'Recurring weekly task',
  'One-time task',
  'Depends on external input',
]

const priorities: Task['priority'][] = ['low', 'medium', 'high']
const categories: Task['category'][] = ['work', 'personal', 'shopping', 'health']

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

function seededElement<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)]
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function generateDate(daysAgo: number = 30): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

export function generateTask(index?: number): Task {
  if (index !== undefined) {
    return {
      id: `task-${index}`,
      title: `${taskTitles[index % taskTitles.length]} #${Math.floor(index / taskTitles.length) + 1}`,
      description: seededElement(descriptions, index * 2),
      completed: seededRandom(index * 3) > 0.7,
      priority: seededElement(priorities, index * 4),
      category: seededElement(categories, index * 5),
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
  }

  const createdAt = generateDate()
  return {
    id: generateId(),
    title: randomElement(taskTitles),
    description: randomElement(descriptions),
    completed: Math.random() > 0.7,
    priority: randomElement(priorities),
    category: randomElement(categories),
    createdAt,
    updatedAt: createdAt,
  }
}

export function generateTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => generateTask(i))
}

let inMemoryTasks: Task[] = generateTasks(50)

export function getTasks(): Task[] {
  return [...inMemoryTasks]
}

export function getTaskById(id: string): Task | undefined {
  return inMemoryTasks.find(t => t.id === id)
}

export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const now = new Date().toISOString()
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  inMemoryTasks = [newTask, ...inMemoryTasks]
  return newTask
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const index = inMemoryTasks.findIndex(t => t.id === id)
  if (index === -1) return null

  inMemoryTasks[index] = {
    ...inMemoryTasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return inMemoryTasks[index]
}

export function deleteTask(id: string): boolean {
  const initialLength = inMemoryTasks.length
  inMemoryTasks = inMemoryTasks.filter(t => t.id !== id)
  return inMemoryTasks.length < initialLength
}

export function resetTasks(count: number = 50): void {
  inMemoryTasks = generateTasks(count)
}

export function filterTasks(
  tasks: Task[],
  filter: {
    status?: 'all' | 'active' | 'completed'
    priority?: Task['priority'] | 'all'
    category?: Task['category'] | 'all'
    search?: string
  }
): Task[] {
  return tasks.filter(task => {
    if (filter.status === 'active' && task.completed) return false
    if (filter.status === 'completed' && !task.completed) return false
    if (filter.priority && filter.priority !== 'all' && task.priority !== filter.priority) return false
    if (filter.category && filter.category !== 'all' && task.category !== filter.category) return false
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      )
    }
    return true
  })
}
