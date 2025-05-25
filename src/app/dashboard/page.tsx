"use client";

import React, { useState, useEffect } from "react";
import {
    apiClient,
    // TotalUsersResponse, // Not directly used, inferred by apiClient methods
    // ListingsCountResponse, // Not directly used, inferred by apiClient methods
    UserLog,
    ListingLog
} from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, MessageSquare, TrendingUp, Loader2, AlertCircle, User, Home } from 'lucide-react';

interface StatItem {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    isLoading?: boolean;
    error?: string | null;
    apiKey: 'totalUsers' | 'listingsCount' | 'roommateListingsCount' | 'growthRate';
}

const initialStats: StatItem[] = [
    {
        title: "Toplam Kullanıcı",
        value: "Yükleniyor...",
        description: "",
        icon: Users,
        isLoading: true,
        apiKey: 'totalUsers',
    },
    {
        title: "Aktif İlanlar", // Corrected to "Aktif İlanlar" from "Aktif ilanlar" for consistency
        value: "Yükleniyor...",
        description: "",
        icon: Building,
        isLoading: true,
        apiKey: 'listingsCount',
    },
    {
        title: "Ev Arkadaşlıkları",
        value: "Coming Soon",
        description: "Son ayda +23%",
        icon: MessageSquare,
        isLoading: false,
        apiKey: 'roommateListingsCount',
    },
    {
        title: "Büyüme Oranı",
        value: "Coming Soon",
        description: "Geçen aya göre",
        icon: TrendingUp,
        isLoading: false,
        apiKey: 'growthRate',
    },
];

export default function DashboardPage() {
    const [dashboardStats, setDashboardStats] = useState<StatItem[]>(initialStats);
    const [activeTab, setActiveTab] = useState<'user' | 'listing'>('user');
    const [userLogs, setUserLogs] = useState<UserLog[]>([]);
    const [listingLogs, setListingLogs] = useState<ListingLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDataForStat = async (statToUpdate: StatItem) => {
            if (!statToUpdate.isLoading) return;

            let numericValue: number | undefined;
            let successDescription = "";
            let errorMessageFromApi: string | undefined;

            try {
                if (statToUpdate.apiKey === 'totalUsers') {
                    const response = await apiClient.getTotalUsersCount();
                    errorMessageFromApi = response.error;
                    if (response.data && typeof response.data.total === 'number') {
                        numericValue = response.data.total;
                        successDescription = "Güncel toplam kullanıcı sayısı";
                    }
                } else if (statToUpdate.apiKey === 'listingsCount') {
                    const response = await apiClient.getListingsCount();
                    errorMessageFromApi = response.error;
                    if (response.data && typeof response.data.total === 'number') {
                        numericValue = response.data.total;
                        successDescription = "Güncel aktif ilan sayısı";
                    }
                }
                // else if (statToUpdate.apiKey === 'roommateListingsCount' || statToUpdate.apiKey === 'growthRate') {
                //     // Handle these "Coming Soon" stats if/when APIs are available
                //     // For now, they remain isLoading: false and show "Coming Soon"
                //     return;
                // }


                if (numericValue !== undefined) {
                    setDashboardStats(prevStats =>
                        prevStats.map(stat =>
                            stat.apiKey === statToUpdate.apiKey // Use apiKey for matching
                                ? {
                                    ...stat,
                                    value: numericValue!.toLocaleString(),
                                    description: successDescription,
                                    isLoading: false,
                                    error: null
                                }
                                : stat
                        )
                    );
                } else {
                    const finalErrorMessage = errorMessageFromApi || `Veri alınamadı veya format hatalı (${statToUpdate.title}).`;
                    console.error(`Hata (${statToUpdate.title}): ${finalErrorMessage}`);
                    setDashboardStats(prevStats =>
                        prevStats.map(stat =>
                            stat.apiKey === statToUpdate.apiKey // Use apiKey for matching
                                ? { ...stat, value: "Hata", description: finalErrorMessage, isLoading: false, error: finalErrorMessage }
                                : stat
                        )
                    );
                }
            } catch (error) {
                console.error(`${statToUpdate.title} çekerken ağ hatası oluştu:`, error);
                const networkErrorMessage = `${statToUpdate.title} verisi çekilemedi (ağ hatası).`;
                setDashboardStats(prevStats =>
                    prevStats.map(stat =>
                        stat.apiKey === statToUpdate.apiKey // Use apiKey for matching
                            ? { ...stat, value: "Hata", description: networkErrorMessage, isLoading: false, error: networkErrorMessage }
                            : stat
                    )
                );
            }
        };

        dashboardStats.forEach(stat => {
            if (stat.isLoading) {
                fetchDataForStat(stat);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs once on mount for initial load

    // Logları çekme fonksiyonu
    const fetchLogs = async () => {
        setLogsLoading(true);
        setLogsError(null);

        try {
            // Son 3 kullanıcı logu
            const userLogsResponse = await apiClient.getUserLogs({ limit: 3, page: 1 }); // Added page for clarity if API supports pagination
            if (userLogsResponse.error) {
                throw new Error(`Kullanıcı logları: ${userLogsResponse.error}`);
            }

            const userLogsData = Array.isArray(userLogsResponse.data)
                ? userLogsResponse.data
                : userLogsResponse.data?.data || []; // Assuming paginated response might have { data: [], ... }
            setUserLogs(userLogsData);

            // Son 3 ilan logu
            const listingLogsResponse = await apiClient.getListingLogs({ limit: 3, page: 1 }); // Added page
            if (listingLogsResponse.error) {
                throw new Error(`İlan logları: ${listingLogsResponse.error}`);
            }

            const listingLogsData = Array.isArray(listingLogsResponse.data)
                ? listingLogsResponse.data
                : listingLogsResponse.data?.data || [];
            setListingLogs(listingLogsData);

        } catch (error) {
            console.error('Loglar çekilirken hata oluştu:', error);
            setLogsError(error instanceof Error ? error.message : 'Loglar yüklenirken bir hata oluştu');
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Bilinmeyen zaman';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return 'Az önce';
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours} saat önce`;
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} gün önce`;
        } catch (e) {
            console.error("Invalid date string for formatDate:", dateString, e);
            return "Geçersiz tarih";
        }
    };
    
    const getActionText = (action: string, type: 'user' | 'listing'): string => {
        const actionMapUser: Record<string, string> = {
            'register': 'Kullanıcı oluşturuldu',
            'update_profile': 'Profil güncellendi', // Changed from 'Kullanıcı güncellendi'
            'delete': 'Kullanıcı silindi',
            'login': 'Giriş yapıldı',
            'logout': 'Çıkış yapıldı',
        };
        const actionMapListing: Record<string, string> = {
            'create': 'İlan oluşturuldu',
            'update': 'İlan güncellendi', // Changed from 'updated' to 'update' for consistency if API uses 'update'
            'delete': 'İlan silindi',
            'approve': 'İlan onaylandı',
            'reject': 'İlan reddedildi', // Changed from 'rejected' to 'reject'
        };
    
        if (type === 'user') {
            return actionMapUser[action] || action;
        }
        if (type === 'listing') {
            return actionMapListing[action] || action;
        }
        return action;
    };

    return (
        <div className="space-y-4 p-4 sm:p-6">
            {/* Header Section - Responsive */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-gray-400">Roomiefies admin paneline hoş geldiniz</p>
            </div>

            {/* Stats Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat) => (
                    <Card key={stat.title} className="w-full bg-white dark:bg-gray-800 shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium truncate pr-2 text-gray-700 dark:text-gray-300">{stat.title}</CardTitle>
                            {stat.isLoading ? (
                                <Loader2 className="h-4 w-4 text-muted-foreground dark:text-gray-400 animate-spin flex-shrink-0" />
                            ) : stat.error ? (
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            ) : (
                                <stat.icon className="h-4 w-4 text-muted-foreground dark:text-gray-400 flex-shrink-0" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className={`text-xl sm:text-2xl font-bold ${stat.error ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                {stat.value}
                            </div>
                            <p className={`text-xs ${stat.error ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground dark:text-gray-400'} mt-1 break-words`}>
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* Recent Activities Card - Takes full width on mobile, 4 columns on large screens */}
                <Card className="lg:col-span-4 bg-white dark:bg-gray-800 shadow">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Son Aktiviteler</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground dark:text-gray-400">Sistemdeki son kullanıcı ve ilan aktiviteleri</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Tab Navigation - Responsive */}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            <button
                                onClick={() => setActiveTab('user')}
                                className={`flex items-center justify-center sm:justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors w-full sm:w-auto
                                ${activeTab === 'user'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">Kullanıcı Aktiviteleri</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('listing')}
                                className={`flex items-center justify-center sm:justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors w-full sm:w-auto
                                ${activeTab === 'listing'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Home className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">İlan Aktiviteleri</span>
                            </button>
                        </div>

                        {/* Loading State */}
                        {logsLoading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm text-muted-foreground dark:text-gray-400">Aktiviteler yükleniyor...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {logsError && (
                            <div className="flex flex-col sm:flex-row items-center justify-center py-8 text-red-600 dark:text-red-500">
                                <AlertCircle className="h-5 w-5 mr-0 sm:mr-2 mb-2 sm:mb-0" />
                                <span className="text-sm text-center">{logsError}</span>
                            </div>
                        )}

                        {/* Content */}
                        {!logsLoading && !logsError && (
                            <div className="space-y-3 max-h-96 overflow-y-auto"> {/* Added max-h and overflow for long lists */}
                                {activeTab === 'user' && (
                                    <>
                                        {userLogs.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
                                                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Henüz kullanıcı aktivitesi bulunmuyor.</p>
                                            </div>
                                        ) : (
                                            userLogs.map((log) => (
                                                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-600 rounded-full flex items-center justify-center">
                                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-100" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getActionText(log.action, 'user')}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground dark:text-gray-400 truncate">
                                                                {log.user?.name || 'Bilinmeyen Kullanıcı'} ({log.user?.email || 'Email yok'})
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 text-xs sm:text-sm text-muted-foreground dark:text-gray-500 text-left sm:text-right pl-11 sm:pl-0">
                                                        {formatDate(log.created_at)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}

                                {activeTab === 'listing' && (
                                    <>
                                        {listingLogs.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
                                                <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Henüz ilan aktivitesi bulunmuyor.</p>
                                            </div>
                                        ) : (
                                            listingLogs.map((log) => (
                                                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-8 h-8 bg-green-100 dark:bg-green-600 rounded-full flex items-center justify-center">
                                                                <Home className="h-4 w-4 text-green-600 dark:text-green-100" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getActionText(log.action, 'listing')}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground dark:text-gray-400 truncate">
                                                                {log.listing?.title || `İlan ID: ${log.listing_id || 'Bilinmiyor'}`} - {log.user?.name || 'Bilinmeyen Kullanıcı'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 text-xs sm:text-sm text-muted-foreground dark:text-gray-500 text-left sm:text-right pl-11 sm:pl-0">
                                                        {formatDate(log.created_at)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions Card - Takes full width on mobile, 3 columns on large screens */}
                <Card className="lg:col-span-3 bg-white dark:bg-gray-800 shadow">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Hızlı İşlemler</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground dark:text-gray-400">Sık kullanılan admin işlemleri</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* These could be <Link> components or trigger modals/actions */}
                        <div className="rounded-lg border dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Kullanıcı Ekle</p>
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">Yeni admin kullanıcısı ekle</p>
                        </div>
                        <div className="rounded-lg border dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">İlan Yönetimi</p>
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">Bekleyen ilanları incele</p>
                        </div>
                        <div className="rounded-lg border dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Sistem Raporu</p>
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">Detaylı sistem raporunu görüntüle</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}