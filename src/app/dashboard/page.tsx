"use client";

import React, { useState, useEffect } from "react";
import {
    apiClient,
    TotalUsersResponse, // ApiClient'tan import ediyoruz
    ListingsCountResponse // ApiClient'tan import ediyoruz
} from "@/lib/api-client"; // api-client dosyanızın doğru yolunu belirtin
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, MessageSquare, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

interface StatItem {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    isLoading?: boolean;
    error?: string | null;
    apiKey: 'totalUsers' | 'listingsCount' | 'roommateListingsCount' | 'growthRate'; // API anahtarları
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
        title: "Aktif ilanlar",
        value: "Yükleniyor...",
        description: "",
        icon: Building,
        isLoading: true,
        apiKey: 'listingsCount',
    },
    {
        title: "Ev Arkadaşlıkları", // Örnek, API'si yoksa isLoading: false veya statik veri
        value: "Yükleniyor...",
        description: "Son ayda +23%",
        icon: MessageSquare,
        isLoading: false, // API yoksa false, varsa true ve apiKey ekleyin
        apiKey: 'roommateListingsCount', // Örnek API key, eğer varsa
    },
    {
        title: "Büyüme Oranı", // Genellikle hesaplanır veya farklı bir API'den gelir
        value: "+15.2%",
        description: "Geçen aya göre",
        icon: TrendingUp,
        isLoading: false, // API yoksa false
        apiKey: 'growthRate', // Örnek API key, eğer varsa
    },
];

export default function DashboardPage() {
    const [dashboardStats, setDashboardStats] = useState<StatItem[]>(initialStats);

    useEffect(() => {
        const fetchDataForStat = async (statToUpdate: StatItem) => {
            if (!statToUpdate.isLoading) return; // Zaten yüklenmiyorsa tekrar çekme

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
                    if (response.data && typeof response.data.count === 'number') {
                        numericValue = response.data.count;
                        successDescription = "Güncel aktif ilan sayısı";
                    }
                }
                //  else if (statToUpdate.apiKey === 'roommateListingsCount') {
                //      // roommateListingsCount için API çağrısı ve mantığı
                //  }
                //  else if (statToUpdate.apiKey === 'growthRate') {
                //      // growthRate için API çağrısı ve mantığı
                //  }


                if (numericValue !== undefined) {
                    setDashboardStats(prevStats =>
                        prevStats.map(stat =>
                            stat.title === statToUpdate.title
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
                    // API'den .error alanı geldiyse veya data beklenen formatta değilse
                    const finalErrorMessage = errorMessageFromApi || `Veri alınamadı veya format hatalı (${statToUpdate.title}).`;
                    console.error(`Hata (${statToUpdate.title}): ${finalErrorMessage}`);
                    setDashboardStats(prevStats =>
                        prevStats.map(stat =>
                            stat.title === statToUpdate.title
                                ? { ...stat, value: "Hata", description: finalErrorMessage, isLoading: false, error: finalErrorMessage }
                                : stat
                        )
                    );
                }
            } catch (error) { // Bu catch genellikle fetch sırasındaki ağ hatalarını yakalar
                console.error(`${statToUpdate.title} çekerken ağ hatası oluştu:`, error);
                const networkErrorMessage = `${statToUpdate.title} verisi çekilemedi (ağ hatası).`;
                setDashboardStats(prevStats =>
                    prevStats.map(stat =>
                        stat.title === statToUpdate.title
                            ? { ...stat, value: "Hata", description: networkErrorMessage, isLoading: false, error: networkErrorMessage }
                            : stat
                    )
                );
            }
        };

        dashboardStats.forEach(stat => {
            if (stat.isLoading) { // Sadece isLoading true olanları çek
                fetchDataForStat(stat);
            }
        });

    }, []); // Bağımlılık dizisi boş, sadece ilk renderda çalışır

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Roomiefies admin paneline hoş geldiniz</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dashboardStats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            {stat.isLoading ? (
                                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                            ) : stat.error ? (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            )}
                        </CardHeader>
                        <CardContent>
                             <div className={`text-2xl font-bold ${stat.error ? 'text-red-600' : ''}`}>
                                {stat.value}
                            </div>
                            <p className={`text-xs ${stat.error ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dashboard'un geri kalan içeriği */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Son Aktiviteler</CardTitle>
                        <CardDescription>Sistemdeki son kullanıcı aktiviteleri</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Örnek Aktivite */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Yeni kullanıcı kaydı</p>
                                    <p className="text-sm text-muted-foreground">Ahmet Yılmaz sisteme katıldı</p>
                                </div>
                                <div className="ml-auto font-medium">2 dk önce</div>
                            </div>
                            {/* Diğer aktiviteler buraya eklenebilir */}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Hızlı İşlemler</CardTitle>
                        <CardDescription>Sık kullanılan admin işlemleri</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         {/* Örnek Hızlı İşlem */}
                        <div className="rounded-lg border p-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm font-medium">Kullanıcı Ekle</p>
                            <p className="text-xs text-muted-foreground">Yeni admin kullanıcısı ekle</p>
                        </div>
                        {/* Diğer hızlı işlemler buraya eklenebilir */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}