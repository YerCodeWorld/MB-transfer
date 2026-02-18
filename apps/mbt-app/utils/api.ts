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

	async addRoutePrice(routeId: string, data: { vehicleId: string; price: string }) {
		return this.post<any>(`/api/v1/routes/${routeId}/prices`, data);
	}

	async deleteRoutePrice(routeId: string, vehicleId: string) {
		return this.delete<any>(`/api/v1/routes/${routeId}/prices/${vehicleId}`);
	}

	// Allies endpoints
	async getAllies(params?: { limit?: number; offset?: number }) {
		const query = new URLSearchParams();
		if (params?.limit) query.set('limit', params.limit.toString());
		if (params?.offset) query.set('offset', params.offset.toString());

		const queryString = query.toString();
		return this.get<any[]>(`/api/v1/allies${queryString ? `?${queryString}` : ''}`);
	}

	async getAlly(id: string) {
		return this.get<any>(`/api/v1/allies/${id}`);
	}

	async createAlly(data: {
		name: string;
		website?: string;
		logo?: string;
		email?: string;
		contactNumber?: string;
		notes?: string;
	}) {
		return this.post<any>('/api/v1/allies', data);
	}

	async updateAlly(
		id: string,
		data: {
			name?: string;
			website?: string;
			logo?: string;
			email?: string;
			contactNumber?: string;
			notes?: string;
		}
	) {
		return this.put<any>(`/api/v1/allies/${id}`, data);
	}

	async deleteAlly(id: string) {
		return this.delete<any>(`/api/v1/allies/${id}`);
	}

	// Services endpoints
	async getServices(params?: {
		date?: string;
		itineraryId?: string;
		state?: string;
		kindOf?: string;
		allyId?: string;
		driverId?: string;
		vehicleId?: string;
		limit?: number;
		offset?: number;
	}) {
		const query = new URLSearchParams();
		if (params?.date) query.set('date', params.date);
		if (params?.itineraryId) query.set('itineraryId', params.itineraryId);
		if (params?.state) query.set('state', params.state);
		if (params?.kindOf) query.set('kindOf', params.kindOf);
		if (params?.allyId) query.set('allyId', params.allyId);
		if (params?.driverId) query.set('driverId', params.driverId);
		if (params?.vehicleId) query.set('vehicleId', params.vehicleId);
		if (params?.limit) query.set('limit', params.limit.toString());
		if (params?.offset) query.set('offset', params.offset.toString());

		const queryString = query.toString();
		return this.get<any[]>(`/api/v1/services${queryString ? `?${queryString}` : ''}`);
	}

	async getService(id: string) {
		return this.get<any>(`/api/v1/services/${id}`);
	}

	async createService(data: {
		code?: string;
		kindOf: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
		clientName: string;
		pickupTime: string;
		flightCode?: string;
		pax: number;
		luggage?: number;
		pickupId: string;
		dropoffId: string;
		driverId?: string;
		vehicleId?: string;
		allyId?: string;
		routeId?: string;
		price?: number;
		currency?: 'DOP' | 'USD' | 'EUR';
		flierUrl?: string;
		state?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELED' | 'REFUNDED';
	}) {
		return this.post<any>('/api/v1/services', data);
	}

	async updateService(id: string, data: {
		code?: string;
		kindOf?: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
		clientName?: string;
		pickupTime?: string;
		flightCode?: string;
		pax?: number;
		luggage?: number;
		pickupId?: string;
		dropoffId?: string;
		driverId?: string;
		vehicleId?: string;
		allyId?: string;
		routeId?: string;
		price?: number;
		currency?: 'DOP' | 'USD' | 'EUR';
		flierUrl?: string;
		state?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELED' | 'REFUNDED';
	}) {
		return this.put<any>(`/api/v1/services/${id}`, data);
	}

	async deleteService(id: string) {
		return this.delete<any>(`/api/v1/services/${id}`);
	}

	async updateServicePdfProfile(
		serviceId: string,
		data: {
			clientName?: string | null;
			hotelName?: string | null;
			pax?: number | null;
			time?: string | null;
			flightCode?: string | null;
		}
	) {
		return this.put<any>(`/api/v1/services/${serviceId}/pdf-profile`, data);
	}

	// Itineraries endpoints
	async getItineraries(params?: {
		startDate?: string;
		endDate?: string;
		sorted?: boolean;
		flightsChecked?: boolean;
		limit?: number;
		offset?: number;
	}) {
		const query = new URLSearchParams();
		if (params?.startDate) query.set('startDate', params.startDate);
		if (params?.endDate) query.set('endDate', params.endDate);
		if (params?.sorted !== undefined) query.set('sorted', params.sorted.toString());
		if (params?.flightsChecked !== undefined) query.set('flightsChecked', params.flightsChecked.toString());
		if (params?.limit) query.set('limit', params.limit.toString());
		if (params?.offset) query.set('offset', params.offset.toString());

		const queryString = query.toString();
		return this.get<any[]>(`/api/v1/itineraries${queryString ? `?${queryString}` : ''}`);
	}

	async getItinerary(id: string) {
		return this.get<any>(`/api/v1/itineraries/${id}`);
	}

	async getItineraryByDate(date: string) {
		return this.get<any>(`/api/v1/itineraries/by-date/${date}`);
	}

	async createItinerary(data: {
		date: string;
		sorted?: boolean;
		flightsChecked?: boolean;
		timesConverted?: boolean;
		edgeCases?: boolean;
	}) {
		return this.post<any>('/api/v1/itineraries', data);
	}

	async updateItinerary(id: string, data: {
		sorted?: boolean;
		flightsChecked?: boolean;
		timesConverted?: boolean;
		edgeCases?: boolean;
	}) {
		return this.put<any>(`/api/v1/itineraries/${id}`, data);
	}

	async deleteItinerary(id: string) {
		return this.delete<any>(`/api/v1/itineraries/${id}`);
	}

	// Notes endpoints
	async getNotes(params?: {
		serviceId?: string;
		itineraryId?: string;
		date?: string;
		tag?: string;
		vehicleId?: string;
		employeeId?: string;
		limit?: number;
		offset?: number;
	}) {
		const query = new URLSearchParams();
		if (params?.serviceId) query.set('serviceId', params.serviceId);
		if (params?.itineraryId) query.set('itineraryId', params.itineraryId);
		if (params?.date) query.set('date', params.date);
		if (params?.tag) query.set('tag', params.tag);
		if (params?.vehicleId) query.set('vehicleId', params.vehicleId);
		if (params?.employeeId) query.set('employeeId', params.employeeId);
		if (params?.limit) query.set('limit', params.limit.toString());
		if (params?.offset) query.set('offset', params.offset.toString());

		const queryString = query.toString();
		return this.get<any[]>(`/api/v1/notes${queryString ? `?${queryString}` : ''}`);
	}

	async getNote(id: string) {
		return this.get<any>(`/api/v1/notes/${id}`);
	}

	async createNote(data: {
		title: string;
		caption?: string;
		content: string;
		tag?: 'EMERGENCY' | 'IMPORTANT' | 'REMINDER' | 'MINOR' | 'IDEA' | 'SUGGESTION';
		serviceId?: string;
		itineraryId?: string;
		vehicleId?: string;
		placeId?: string;
		routeId?: string;
		allyId?: string;
		budgetId?: string;
		employeeId?: string;
		transactionId?: string;
		spendingId?: string;
	}) {
		return this.post<any>('/api/v1/notes', data);
	}

	async updateNote(id: string, data: {
		title?: string;
		caption?: string;
		content?: string;
		tag?: 'EMERGENCY' | 'IMPORTANT' | 'REMINDER' | 'MINOR' | 'IDEA' | 'SUGGESTION';
		serviceId?: string;
		itineraryId?: string;
		vehicleId?: string;
		placeId?: string;
		routeId?: string;
		allyId?: string;
		budgetId?: string;
		employeeId?: string;
		transactionId?: string;
		spendingId?: string;
	}) {
		return this.put<any>(`/api/v1/notes/${id}`, data);
	}

	async deleteNote(id: string) {
		return this.delete<any>(`/api/v1/notes/${id}`);
	}
}

export const apiClient = new APIClient(API_BASE_URL);
