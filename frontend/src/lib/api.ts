const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface RegisterData {
	username: string
	password: string
	email?: string
}

export interface LoginData {
	username: string
	password: string
}

export interface AuthResponse {
	access_token: string
}

export interface User {
	id: number
	username: string
	email?: string
}

export enum TaskStatus {
	TODO = 'TODO',
	IN_PROGRESS = 'IN_PROGRESS',
	REVIEW = 'REVIEW',
	BLOCKED = 'BLOCKED',
	DONE = 'DONE',
	CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH',
	URGENT = 'URGENT',
}

export interface Task {
	id: number
	title: string
	description?: string
	observations?: string
	status: TaskStatus
	priority: TaskPriority
	startDate?: string
	dueDate?: string
	createdAt: string
	updatedAt: string
	creatorId: number
	creator: {
		id: number
		username: string
	}
	taskAccess: Array<{
		id: number
		userId: number
		accessLevel: string
		user: {
			id: number
			username: string
		}
	}>
	dependencies: Array<{
		dependsOn: {
			id: number
			title: string
			status: string
		}
	}>
	dependedBy: Array<{
		task: {
			id: number
			title: string
			status: string
		}
	}>
}

export interface CreateTaskData {
	title: string
	description?: string
	observations?: string
	status?: TaskStatus
	priority?: TaskPriority
	startDate?: string
	dueDate?: string
	dependsOnTaskIds?: number[]
}

export interface UpdateTaskData {
	title?: string
	description?: string
	observations?: string
	status?: TaskStatus
	priority?: TaskPriority
	startDate?: string
	dueDate?: string
	dependsOnTaskIds?: number[]
}

export class ApiError extends Error {
	constructor(public status: number, message: string) {
		super(message)
		this.name = 'ApiError'
	}
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`

	const headers = new Headers(options.headers)
	if (options.body) {
		headers.set('Content-Type', 'application/json')
	}

	const requestBody = options.body ? JSON.parse(options.body as string) : null
	console.log('=== API REQUEST DEBUG ===')
	console.log('URL:', url)
	console.log('Method:', options.method || 'GET')
	console.log('Request body:', requestBody)
	console.log('=======================')

	const response = await fetch(url, {
		...options,
		headers,
	})

	if (!response.ok) {
		const errorText = await response.text()
		console.log('=== API ERROR DEBUG ===')
		console.log('Response status:', response.status)
		console.log('Error text:', errorText)
		console.log('======================')

		let errorMessage = 'Ocorreu um erro'

		try {
			const errorData = JSON.parse(errorText)
			errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || errorData.error || errorText
		} catch {
			errorMessage = errorText || `HTTP ${response.status}`
		}

		throw new ApiError(response.status, errorMessage)
	}

	// Handle cases where the response is empty (e.g., DELETE 204 No Content)
	const contentType = response.headers.get('content-type')
	if (contentType && contentType.includes('application/json')) {
		return response.json()
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return undefined as any
}

export const authApi = {
	async register(data: RegisterData): Promise<AuthResponse> {
		return apiRequest<AuthResponse>('/auth/register', {
			method: 'POST',
			body: JSON.stringify(data),
		})
	},

	async login(data: LoginData): Promise<AuthResponse> {
		return apiRequest<AuthResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(data),
		})
	},

	async getProfile(token: string): Promise<User> {
		return apiRequest<User>('/profile', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
	},
}

export const tasksApi = {
	async getAll(token: string): Promise<Task[]> {
		return apiRequest<Task[]>('/api/tasks', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
	},

	async getById(id: number, token: string): Promise<Task> {
		return apiRequest<Task>(`/api/tasks/${id}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
	},

	async create(data: CreateTaskData, token: string): Promise<Task> {
		console.log('API create called with data:', data) // Debug log
		return apiRequest<Task>('/api/tasks', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})
	},

	async update(id: number, data: UpdateTaskData, token: string): Promise<Task> {
		return apiRequest<Task>(`/api/tasks/${id}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})
	},

	async delete(id: number, token: string): Promise<void> {
		return apiRequest<void>(`/api/tasks/${id}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
	},
}
