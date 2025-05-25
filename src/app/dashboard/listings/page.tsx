"use client"

import React, { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, BadgeCheck, Ban, Trash2, MoreHorizontal } from "lucide-react"
import { DataTable, Column } from "@/components/ui/data-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Listing {
    id: number
    title: string
    description: string
    status: string
    created_at: string
    updated_at: string
    user_id?: number
}

interface PaginatedListings {
    data: Listing[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from?: number
    to?: number
}

interface SortConfig {
    key: string
    direction: "asc" | "desc"
}

export default function ListingsPage() {
    const [listings, setListings] = useState<PaginatedListings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [sort, setSort] = useState<SortConfig>({ key: "created_at", direction: "desc" })

    const fetchListings = async (
        page = 1,
        searchTerm = "",
        sortConfig = sort,
        pageSize = perPage
    ) => {
        setLoading(true)
        setError("")

        const response = await apiClient.getListings(page, searchTerm, sortConfig.key, sortConfig.direction, pageSize)

        if (response.data) {
            setListings(response.data)
        } else {
            setError(response.error || "İlanlar yüklenemedi")
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchListings(currentPage, search, sort, perPage)
    }, [currentPage, sort, perPage])

    const handleSearch = () => {
        setCurrentPage(1)
        fetchListings(1, search, sort, perPage)
    }

    const handleSort = (key: string) => {
        const direction = sort.key === key && sort.direction === "asc" ? "desc" : "asc"
        setSort({ key, direction })
        setCurrentPage(1)
    }

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value))
        setCurrentPage(1)
    }

    const handleApprove = async (id: number) => {
        const response = await apiClient.approveListing(id)
        if (response.data) {
            fetchListings(currentPage, search, sort, perPage)
        } else {
            alert(response.error || "İlan onaylanamadı")
        }
    }

    const handleReject = async (id: number) => {
        const response = await apiClient.rejectListing(id)
        if (response.data) {
            fetchListings(currentPage, search, sort, perPage)
        } else {
            alert(response.error || "İlan reddedilemedi")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Bu ilanı silmek istediğinizden emin misiniz?")) return

        const response = await apiClient.deleteListing(id)
        if (response.data) {
            fetchListings(currentPage, search, sort, perPage)
        } else {
            alert(response.error || "İlan silinemedi")
        }
    }

    // Kolonlar
    const columns: Column<Listing>[] = [
        { key: "title", title: "Başlık", sortable: true },
        {
            key: "description",
            title: "Açıklama",
            render: (listing) => listing.description?.slice(0, 60) + "...",
        },
        {
            key: "status",
            title: "Durum",
            sortable: true,
            render: (listing) => {
                const status = listing.status
                let variant: "secondary" | "default" | "destructive" | "outline" | undefined = "secondary"
                let label = "Bilinmiyor"

                if (status === "approved") {
                    variant = "default"
                    label = "Onaylı"
                } else if (status === "rejected") {
                    variant = "destructive"
                    label = "Reddedildi"
                } else if (status === "pending") {
                    variant = "secondary"
                    label = "Bekliyor"
                }

                return <Badge variant={variant}>{label}</Badge>
            },
        },
        {
            key: "created_at",
            title: "Oluşturulma",
            sortable: true,
            render: (listing) => new Date(listing.created_at).toLocaleDateString("tr-TR"),
        },
    ]

    const renderActions = (listing: Listing) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleApprove(listing.id)}>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Onayla
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReject(listing.id)}>
                    <Ban className="mr-2 h-4 w-4" />
                    Reddet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(listing.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">İlan Yönetimi</h1>
                <p className="text-muted-foreground">Sistemdeki tüm ilanları yönetin</p>
            </div>

            <Tabs defaultValue="listings" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="listings" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        İlanlar
                        {listings && <span className="ml-1 text-xs">({listings.total})</span>}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="listings">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>İlanlar</CardTitle>
                            <CardDescription>
                                {listings && `Toplam ${listings.total} ilan`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable<Listing>
                                data={listings}
                                columns={columns}
                                loading={loading}
                                searchValue={search}
                                onSearchChange={setSearch}
                                onSearch={handleSearch}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                perPage={perPage}
                                onPerPageChange={handlePerPageChange}
                                sortConfig={sort}
                                onSort={handleSort}
                                actions={renderActions}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
