import { NextRequest, NextResponse } from 'next/server'
import { getTasks, addTask, filterTasks } from '@/lib/react-19-demo/mock-data'
import { Task, TasksResponse, TaskResponse, ErrorResponse } from '@/lib/react-19-demo/types'

async function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(req: NextRequest): Promise<NextResponse<TasksResponse | ErrorResponse>> {
  const searchParams = req.nextUrl.searchParams
  const delay = parseInt(searchParams.get('delay') || '300')
  const simulateError = searchParams.get('simulateError') === 'true'
  const status = searchParams.get('status') as 'all' | 'active' | 'completed' | null
  const priority = searchParams.get('priority') as Task['priority'] | 'all' | null
  const category = searchParams.get('category') as Task['category'] | 'all' | null
  const search = searchParams.get('search') || undefined

  await simulateDelay(delay)

  if (simulateError) {
    return NextResponse.json({ error: 'Simulated server error' }, { status: 500 })
  }

  const allTasks = getTasks()
  const filteredTasks = filterTasks(allTasks, {
    status: status || 'all',
    priority: priority || 'all',
    category: category || 'all',
    search,
  })

  return NextResponse.json({
    tasks: filteredTasks,
    total: filteredTasks.length,
  })
}

export async function POST(req: NextRequest): Promise<NextResponse<TaskResponse | ErrorResponse>> {
  const body = await req.json()
  const delay = body.delay || 500
  const simulateError = body.simulateError

  await simulateDelay(delay)

  if (simulateError) {
    return NextResponse.json({ error: 'Simulated server error' }, { status: 500 })
  }

  if (!body.title || body.title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const newTask = addTask({
    title: body.title,
    description: body.description || '',
    completed: false,
    priority: body.priority || 'medium',
    category: body.category || 'work',
  })

  return NextResponse.json({ task: newTask })
}
