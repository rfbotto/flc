import { NextRequest, NextResponse } from 'next/server'
import { getTaskById, updateTask, deleteTask } from '@/lib/react-19-demo/mock-data'
import { TaskResponse, ErrorResponse } from '@/lib/react-19-demo/types'

async function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<TaskResponse | ErrorResponse>> {
  const { id } = await params
  const searchParams = req.nextUrl.searchParams
  const delay = parseInt(searchParams.get('delay') || '300')
  const simulateError = searchParams.get('simulateError') === 'true'

  await simulateDelay(delay)

  if (simulateError) {
    return NextResponse.json({ error: 'Simulated server error' }, { status: 500 })
  }

  const task = getTaskById(id)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({ task })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<TaskResponse | ErrorResponse>> {
  const { id } = await params
  const body = await req.json()
  const delay = body.delay || 500
  const simulateError = body.simulateError

  await simulateDelay(delay)

  if (simulateError) {
    return NextResponse.json({ error: 'Simulated server error' }, { status: 500 })
  }

  const updatedTask = updateTask(id, body)
  if (!updatedTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({ task: updatedTask })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean } | ErrorResponse>> {
  const { id } = await params
  const searchParams = req.nextUrl.searchParams
  const delay = parseInt(searchParams.get('delay') || '500')
  const simulateError = searchParams.get('simulateError') === 'true'

  await simulateDelay(delay)

  if (simulateError) {
    return NextResponse.json({ error: 'Simulated server error' }, { status: 500 })
  }

  const deleted = deleteTask(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
