import { apiConfig } from "./config";

// Genel API response arayüzleri
export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// Dashboard özel arayüzler
export interface TotalUsersResponse {
    total: number;
}

export interface ListingsCountResponse {
    total: number;
}

// Log arayüzleri
export interface UserLog {
    id: number;
    user_id: number;
    action: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface ListingLog {
    id: number;
    user_id: number;
    listing_id: number;
    action: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    listing?: {
        id: number;
        title: string;
        status: string;
    };
}

export interface LogFilters {
    user_id?: number;
    action?: string;
    listing_id?: number;
    limit?: number;
    per_page?: number;
    page?: number;
}

class ApiClient {
    private baseURL: string;
    private adminPrefix: string;

    constructor() {
        this.baseURL = apiConfig.baseURL;
        this.adminPrefix = apiConfig.adminPrefix;
    }

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem("admin_token");
        return {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        if (response.status === 204) {
            return { data: undefined };
        }

        try {
            const data = await response.json();

            if (!response.ok) {
                return {
                    error: data.error || data.message || `Sunucu Hatası: ${response.status}`,
                    errors: data.errors,
                };
            }

            return { data };
        } catch (error) {
            if (!response.ok) {
                try {
                    const errorText = await response.text();
                    console.error("API Error (Non-JSON or Malformed JSON):", response.status, errorText);
                    return {
                        error: `Sunucu Hatası: ${response.status}. Yanıt JSON formatında değil veya bozuk. Detaylar konsolda.`,
                    };
                } catch (textError) {
                    console.error("API Error (Could not read error text):", response.status, textError);
                    return { error: `Sunucu Hatası: ${response.status}. Yanıt okunamadı.` };
                }
            }

            console.error("JSON Parsing Error (Response was OK):", error);
            return { error: "Sunucudan gelen yanıt işlenirken bir hata oluştu." };
        }
    }

    // ==== Temel CRUD Metodları ====
    async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${this.adminPrefix}${endpoint}`, {
                method: "GET",
                headers: this.getAuthHeaders(),
            });
            return this.handleResponse<T>(response);
        } catch (error) {
            console.error("Network Error (GET):", endpoint, error);
            return { error: "Ağ bağlantı hatası oluştu." };
        }
    }

    async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${this.adminPrefix}${endpoint}`, {
                method: "POST",
                headers: this.getAuthHeaders(),
                body: body ? JSON.stringify(body) : undefined,
            });
            return this.handleResponse<T>(response);
        } catch (error) {
            console.error("Network Error (POST):", endpoint, error);
            return { error: "Ağ bağlantı hatası oluştu." };
        }
    }

    async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${this.adminPrefix}${endpoint}`, {
                method: "PUT",
                headers: this.getAuthHeaders(),
                body: body ? JSON.stringify(body) : undefined,
            });
            return this.handleResponse<T>(response);
        } catch (error) {
            console.error("Network Error (PUT):", endpoint, error);
            return { error: "Ağ bağlantı hatası oluştu." };
        }
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${this.adminPrefix}${endpoint}`, {
                method: "DELETE",
                headers: this.getAuthHeaders(),
            });
            return this.handleResponse<T>(response);
        } catch (error) {
            console.error("Network Error (DELETE):", endpoint, error);
            return { error: "Ağ bağlantı hatası oluştu." };
        }
    }

    // ==== Users ====
    async getUsers(page = 1, search?: string, sortBy?: string, sortOrder?: string, perPage?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (search) params.append("search", search);
        if (sortBy) params.append("sort_by", sortBy);
        if (sortOrder) params.append("sort_order", sortOrder);
        if (perPage) params.append("per_page", perPage.toString());
        return this.get(`/users?${params.toString()}`);
    }

    async getUser(id: number): Promise<ApiResponse<any>> {
        return this.get(`/users/${id}`);
    }

    async updateUser(id: number, data: any): Promise<ApiResponse<any>> {
        return this.put(`/users/${id}`, data);
    }

    async deleteUser(id: number): Promise<ApiResponse<any>> {
        return this.delete(`/users/${id}`);
    }

    async getAdmins(page = 1, search?: string, sortBy?: string, sortOrder?: string, perPage?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (search) params.append("search", search);
        if (sortBy) params.append("sort_by", sortBy);
        if (sortOrder) params.append("sort_order", sortOrder);
        if (perPage) params.append("per_page", perPage.toString());
        return this.get(`/users/admins?${params.toString()}`);
    }

    async getRegularUsers(page = 1, search?: string, sortBy?: string, sortOrder?: string, perPage?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (search) params.append("search", search);
        if (sortBy) params.append("sort_by", sortBy);
        if (sortOrder) params.append("sort_order", sortOrder);
        if (perPage) params.append("per_page", perPage.toString());
        return this.get(`/users/regular-users?${params.toString()}`);
    }

    async getUserDetails(id: number): Promise<ApiResponse<any>> {
        return this.get(`/users/${id}`);
    }

    // ==== Dashboard ====
    async getTotalUsersCount(): Promise<ApiResponse<TotalUsersResponse>> {
        return this.get<TotalUsersResponse>(`/users/total-users`);
    }

    async getListingsCount(): Promise<ApiResponse<ListingsCountResponse>> {
        return this.get<ListingsCountResponse>(`/listings/total-listings`);
    }

    // ==== Listings (Yeni Eklenen Metodlar) ====
    async getApprovedListings(page = 1, search?: string, sortBy?: string, sortOrder?: string, perPage?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (search) params.append("search", search);
        if (sortBy) params.append("sort_by", sortBy);
        if (sortOrder) params.append("sort_order", sortOrder);
        if (perPage) params.append("per_page", perPage.toString());
        return this.get(`/listings/approved?${params.toString()}`);
    }
    async getPendingListings(page = 1, search?: string, sortBy?: string, sortOrder?: string, perPage?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (search) params.append("search", search);
        if (sortBy) params.append("sort_by", sortBy);
        if (sortOrder) params.append("sort_order", sortOrder);
        if (perPage) params.append("per_page", perPage.toString());
        return this.get(`/listings/pending?${params.toString()}`);
    }
    async getRejectedListings(page = 1, search?: string, sortBy?: string, sortOrder?: string, perPage?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (search) params.append("search", search);
        if (sortBy) params.append("sort_by", sortBy);
        if (sortOrder) params.append("sort_order", sortOrder);
        if (perPage) params.append("per_page", perPage.toString());
        return this.get(`/listings/rejected?${params.toString()}`);
    }

    async getListing(id: number): Promise<ApiResponse<any>> {
        return this.get(`/listings/${id}`);
    }

    async approveListing(id: number): Promise<ApiResponse<any>> {
        return this.post(`/listings/${id}/approve`);
    }

    async rejectListing(id: number): Promise<ApiResponse<any>> {
        return this.post(`/listings/${id}/reject`);
    }

    async deleteListing(id: number): Promise<ApiResponse<any>> {
        return this.delete(`/listings/${id}`);
    }

    // ==== Logs (Yeni Eklenen) ====
    async getUserLogs(filters: LogFilters = {}): Promise<ApiResponse<PaginatedResponse<UserLog> | UserLog[]>> {
        const params = new URLSearchParams();
        params.append("type", "user");

        if (filters.user_id) params.append("user_id", filters.user_id.toString());
        if (filters.action) params.append("action", filters.action);
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.per_page) params.append("per_page", filters.per_page.toString());
        if (filters.page) params.append("page", filters.page.toString());

        return this.get(`/logs?${params.toString()}`);
    }

    async getListingLogs(filters: LogFilters = {}): Promise<ApiResponse<PaginatedResponse<ListingLog> | ListingLog[]>> {
        const params = new URLSearchParams();
        params.append("type", "listing");

        if (filters.user_id) params.append("user_id", filters.user_id.toString());
        if (filters.listing_id) params.append("listing_id", filters.listing_id.toString());
        if (filters.action) params.append("action", filters.action);
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.per_page) params.append("per_page", filters.per_page.toString());
        if (filters.page) params.append("page", filters.page.toString());

        return this.get(`/logs?${params.toString()}`);
    }

    // Genel log metodu (type parametresi ile)
    async getLogs(type: 'user' | 'listing', filters: LogFilters = {}): Promise<ApiResponse<PaginatedResponse<UserLog | ListingLog> | (UserLog | ListingLog)[]>> {
        const params = new URLSearchParams();
        params.append("type", type);

        if (filters.user_id) params.append("user_id", filters.user_id.toString());
        if (filters.action) params.append("action", filters.action);
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.per_page) params.append("per_page", filters.per_page.toString());
        if (filters.page) params.append("page", filters.page.toString());

        // listing için özel parametre
        if (type === 'listing' && filters.listing_id) {
            params.append("listing_id", filters.listing_id.toString());
        }

        return this.get(`/logs?${params.toString()}`);
    }
}

export const apiClient = new ApiClient();