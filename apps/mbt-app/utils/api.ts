const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface APIResponse<T = any> {
	success: boolean;
	message?: string;
	data?: T;
	errors?: any[];
}

class APIClient {

	private baseURL: string;
	private token: string | null = null;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	setToken(token: string) {
		this.token = token;
	}

	clearToken() {
		this.token = null;
	}

	private getHeaders(): HeadersInit {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		return headers;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<APIResponse<T>> {
		const url = `${this.baseURL}${endpoint}`;

		const response = await fetch(url, {
			...options,
			headers: {
				...this.getHeaders(),
				...options.headers,
			},
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'API request failed');
		}

		return data;
	}

	// Auth endpoints
	async login(identifier: string, accessKey: string) {
		return this.request<{ token: string; employee: any }>('/api/v1/auth/login', {
			method: 'POST',
			body: JSON.stringify({ identifier, accessKey }),
		});
	}

	async getMe() {
		return this.request<{ employee: any }>('/api/v1/auth/me', {
			method: 'GET',
		});
	}

	async refreshToken() {
		return this.request<{ token: string; employee: any }>('/api/v1/auth/refresh', {
			method: 'POST',
		});
	}

	// Generic CRUD methods
	async get<T>(endpoint: string) {
		return this.request<T>(endpoint, {
			method: 'GET',
		});
	}

	async post<T>(endpoint: string, data: any) {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async put<T>(endpoint: string, data: any) {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async delete<T>(endpoint: string) {
		return this.request<T>(endpoint, {
			method: 'DELETE',
		});
	}

	// PDF Generation endpoint - returns a Blob
	async generatePDF(data: {
		name: string;
		hotel: string;
		pax: number;
		time: string;
		date: string;
		company: 'at' | 'st';
		service_type: 'arrivals' | 'departures';
		flight_code?: string;
	}): Promise<Blob> {
		const url = `${this.baseURL}/api/v1/pdf/generate`;

		const response = await fetch(url, {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: 'Failed to generate PDF' }));
			throw new Error(errorData.message || 'Failed to generate PDF');
		}

		return response.blob();
	}

	// Check PDF service health
	async checkPDFHealth() {
		return this.get<{ available: boolean; message: string }>('/api/v1/pdf/health');
	}

	// Places endpoints
	async getPlaces(params?: { kind?: string; zoneId?: string; limit?: number; offset?: number }) {
		const query = new URLSearchParams();
		if (params?.kind) query.set('kind', params.kind);
		if (params?.zoneId) query.set('zoneId', params.zoneId);
		if (params?.limit) query.set('limit', params.limit.toString());
		if (params?.offset) query.set('offset', params.offset.toString());

		const queryString = query.toString();
		return this.get<any[]>(`/api/v1/places${queryString ? `?${queryString}` : ''}`);
	}

	async getPlace(id: string) {
		return this.get<any>(`/api/v1/places/${id}`);
	}

	async createPlace(data: any) {
		return this.post<any>('/api/v1/places', data);
	}

	async updatePlace(id: string, data: any) {
		return this.put<any>(`/api/v1/places/${id}`, data);
	}

	async deletePlace(id: string) {
		return this.delete<any>(`/api/v1/places/${id}`);
	}

	// Zones endpoints
	async getZones(params?: { limit?: number; offset?: number }) {
		const query = new URLSearchParams();
		if (params?.limit) query.set('limit', params.limit.toString());
		if (params?.offset) query.set('offset', params.offset.toString());

		const queryString = query.toString();
		return this.get<any[]>(`/api/v1/zones${queryString ? `?${queryString}` : ''}`);
	}

	async getZone(id: string) {
		return this.get<any>(`/api/v1/zones/${id}`);
	}

	async createZone(data: any) {
		return this.post<any>('/api/v1/zones', data);
	}

	async updateZone(id: string, data: any) {
		return this.put<any>(`/api/v1/zones/${id}`, data);
	}

	async deleteZone(id: string) {
		return this.delete<any>(`/api/v1/zones/${id}`);
	}

	async addZonePrice(zoneId: string, data: { vehicleId: string; price: string }) {
		return this.post<any>(`/api/v1/zones/${zoneId}/prices`, data);
	}

	async deleteZonePrice(zoneId: string, vehicleId: string) {
		return this.delete<any>(`/api/v1/zones/${zoneId}/prices/${vehicleId}`);
	}

	// Routes endpoints
	async getRoutes(params?: { fromId?: string; toId?: string; limit?: number; offset?: number }) {
		const query = new URLSearchParams();
		if (params?.fromId) query.set('fromId', params.fromId);
		if (params?.toId) query.set('toId', params.toId);
		if (params?.limit) query.set('limit', params.limit.toString());
		if (params?.offset) query.set('offset', params.offset.toString());

		const queryString = query.toString();
		return this.get<any[]>(`/api/v1/routes${queryString ? `?${queryString}` : ''}`);
	}

	async getRoute(id: string) {
		return this.get<any>(`/api/v1/routes/${id}`);
	}

	async createRoute(data: any) {
		return this.post<any>('/api/v1/routes', data);
	}

	async updateRoute(id: string, data: any) {
		return this.put<any>(`/api/v1/routes/${id}`, data);
	}

	async deleteRoute(id: string) {
		return this.delete<any>(`/api/v1/routes/${id}`);
	}
}

export const apiClient = new APIClient(API_BASE_URL);
