"use client"

import React, { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, BadgeCheck, Ban, Trash2, MoreHorizontal, Clock, Eye, X, User, MapPin, Home, Calendar } from "lucide-react"
import { DataTable, Column } from "@/components/ui/data-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface Listing {
    id: number
    title: string
    description: string
    status: string
    created_at: string
    updated_at: string
    user_id?: number
}

interface ListingDetails {
    id: number
    user_id: number
    title: string
    description: string
    rent_price: string
    square_meters: number
    roommate_gender_id: number
    age_range_id: number
    house_type_id: number
    furniture_status_id: number
    heating_type_id: number
    building_age_id: number
    status: string
    created_at: string
    updated_at: string
    images: Array<{
        id: number
        listing_id: number
        image_path: string
        created_at: string
        updated_at: string
    }>
    user: {
        id: number
        name: string
        email: string
        telefon: string
        dogum_tarihi: string
        gender: string
        il_id: number
        ilce_id: number
        profile_photo_path: string
        profile_photo_url: string
        onayli: boolean
        character_test_done: boolean
    }
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
    // Onaylı ilanlar state'leri
    const [approvedListings, setApprovedListings] = useState<PaginatedListings | null>(null)
    const [approvedLoading, setApprovedLoading] = useState(true)
    const [approvedSearch, setApprovedSearch] = useState("")
    const [approvedCurrentPage, setApprovedCurrentPage] = useState(1)
    const [approvedPerPage, setApprovedPerPage] = useState(15)
    const [approvedSort, setApprovedSort] = useState<SortConfig>({ key: "created_at", direction: "desc" })

    // Onay bekleyen ilanlar state'leri
    const [pendingListings, setPendingListings] = useState<PaginatedListings | null>(null)
    const [pendingLoading, setPendingLoading] = useState(true)
    const [pendingSearch, setPendingSearch] = useState("")
    const [pendingCurrentPage, setPendingCurrentPage] = useState(1)
    const [pendingPerPage, setPendingPerPage] = useState(15)
    const [pendingSort, setPendingSort] = useState<SortConfig>({ key: "created_at", direction: "desc" })

    // Reddedilen ilanlar state'leri
    const [rejectedListings, setRejectedListings] = useState<PaginatedListings | null>(null)
    const [rejectedLoading, setRejectedLoading] = useState(true)
    const [rejectedSearch, setRejectedSearch] = useState("")
    const [rejectedCurrentPage, setRejectedCurrentPage] = useState(1)
    const [rejectedPerPage, setRejectedPerPage] = useState(15)
    const [rejectedSort, setRejectedSort] = useState<SortConfig>({ key: "created_at", direction: "desc" })

    // Modal state'leri
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const [selectedListing, setSelectedListing] = useState<ListingDetails | null>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)

    const [error, setError] = useState("")

    // Onaylı ilanları getir
    const fetchApprovedListings = async (
        page = 1,
        searchTerm = "",
        sortConfig = approvedSort,
        pageSize = approvedPerPage
    ) => {
        setApprovedLoading(true)
        setError("")

        const response = await apiClient.getApprovedListings(
            page,
            searchTerm || undefined,
            sortConfig.key,
            sortConfig.direction,
            pageSize
        )

        if (response.data) {
            setApprovedListings(response.data)
        } else {
            setError(response.error || "Onaylı ilanlar yüklenemedi")
        }

        setApprovedLoading(false)
    }

    // Onay bekleyen ilanları getir
    const fetchPendingListings = async (
        page = 1,
        searchTerm = "",
        sortConfig = pendingSort,
        pageSize = pendingPerPage
    ) => {
        setPendingLoading(true)
        setError("")

        const response = await apiClient.getPendingListings(
            page,
            searchTerm || undefined,
            sortConfig.key,
            sortConfig.direction,
            pageSize
        )

        if (response.data) {
            setPendingListings(response.data)
        } else {
            setError(response.error || "Onay bekleyen ilanlar yüklenemedi")
        }

        setPendingLoading(false)
    }

    // Reddedilen ilanları getir
    const fetchRejectedListings = async (
        page = 1,
        searchTerm = "",
        sortConfig = rejectedSort,
        pageSize = rejectedPerPage
    ) => {
        setRejectedLoading(true)
        setError("")

        const response = await apiClient.getRejectedListings(
            page,
            searchTerm || undefined,
            sortConfig.key,
            sortConfig.direction,
            pageSize
        )

        if (response.data) {
            setRejectedListings(response.data)
        } else {
            setError(response.error || "Reddedilen ilanlar yüklenemedi")
        }

        setRejectedLoading(false)
    }

    // İlan detaylarını getir
    const fetchListingDetails = async (id: number) => {
        setDetailsLoading(true)

        const response = await apiClient.getListing(id)

        if (response.data) {
            setSelectedListing(response.data)
        } else {
            setError(response.error || "İlan detayları yüklenemedi")
        }

        setDetailsLoading(false)
    }

    useEffect(() => {
        fetchApprovedListings(approvedCurrentPage, approvedSearch, approvedSort, approvedPerPage)
    }, [approvedCurrentPage, approvedSort, approvedPerPage])

    useEffect(() => {
        fetchPendingListings(pendingCurrentPage, pendingSearch, pendingSort, pendingPerPage)
    }, [pendingCurrentPage, pendingSort, pendingPerPage])

    useEffect(() => {
        fetchRejectedListings(rejectedCurrentPage, rejectedSearch, rejectedSort, rejectedPerPage)
    }, [rejectedCurrentPage, rejectedSort, rejectedPerPage])

    // Onaylı ilanlar için handler'lar
    const handleApprovedSearch = () => {
        setApprovedCurrentPage(1)
        fetchApprovedListings(1, approvedSearch, approvedSort, approvedPerPage)
    }

    const handleApprovedSort = (key: string) => {
        const direction = approvedSort.key === key && approvedSort.direction === "asc" ? "desc" : "asc"
        setApprovedSort({ key, direction })
        setApprovedCurrentPage(1)
    }

    const handleApprovedPerPageChange = (value: string) => {
        setApprovedPerPage(Number(value))
        setApprovedCurrentPage(1)
    }

    // Onay bekleyen ilanlar için handler'lar
    const handlePendingSearch = () => {
        setPendingCurrentPage(1)
        fetchPendingListings(1, pendingSearch, pendingSort, pendingPerPage)
    }

    const handlePendingSort = (key: string) => {
        const direction = pendingSort.key === key && pendingSort.direction === "asc" ? "desc" : "asc"
        setPendingSort({ key, direction })
        setPendingCurrentPage(1)
    }

    const handlePendingPerPageChange = (value: string) => {
        setPendingPerPage(Number(value))
        setPendingCurrentPage(1)
    }

    // Reddedilen ilanlar için handler'lar
    const handleRejectedSearch = () => {
        setRejectedCurrentPage(1)
        fetchRejectedListings(1, rejectedSearch, rejectedSort, rejectedPerPage)
    }

    const handleRejectedSort = (key: string) => {
        const direction = rejectedSort.key === key && rejectedSort.direction === "asc" ? "desc" : "asc"
        setRejectedSort({ key, direction })
        setRejectedCurrentPage(1)
    }

    const handleRejectedPerPageChange = (value: string) => {
        setRejectedPerPage(Number(value))
        setRejectedCurrentPage(1)
    }

    // Detayları göster
    const handleShowDetails = async (id: number) => {
        setDetailsModalOpen(true)
        await fetchListingDetails(id)
    }

    // API işlemleri
    const handleApprove = async (id: number) => {
        const response = await apiClient.approveListing(id)
        if (response.data) {
            // Tüm tabloları yenile
            fetchApprovedListings(approvedCurrentPage, approvedSearch, approvedSort, approvedPerPage)
            fetchPendingListings(pendingCurrentPage, pendingSearch, pendingSort, pendingPerPage)
            fetchRejectedListings(rejectedCurrentPage, rejectedSearch, rejectedSort, rejectedPerPage)
        } else {
            alert(response.error || "İlan onaylanamadı")
        }
    }

    const handleReject = async (id: number) => {
        const response = await apiClient.rejectListing(id)
        if (response.data) {
            // Tüm tabloları yenile
            fetchApprovedListings(approvedCurrentPage, approvedSearch, approvedSort, approvedPerPage)
            fetchPendingListings(pendingCurrentPage, pendingSearch, pendingSort, pendingPerPage)
            fetchRejectedListings(rejectedCurrentPage, rejectedSearch, rejectedSort, rejectedPerPage)
        } else {
            alert(response.error || "İlan reddedilemedi")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Bu ilanı silmek istediğinizden emin misiniz?")) return

        const response = await apiClient.deleteListing(id)
        if (response.data) {
            // Tüm tabloları yenile
            fetchApprovedListings(approvedCurrentPage, approvedSearch, approvedSort, approvedPerPage)
            fetchPendingListings(pendingCurrentPage, pendingSearch, pendingSort, pendingPerPage)
            fetchRejectedListings(rejectedCurrentPage, rejectedSearch, rejectedSort, rejectedPerPage)
        } else {
            alert(response.error || "İlan silinemedi")
        }
    }

    // Ortak kolonlar
    const baseColumns: Column<Listing>[] = [
        { key: "title", title: "Başlık", sortable: true },
        {
            key: "description",
            title: "Açıklama",
            render: (listing) => listing.description?.slice(0, 60) + "...",
        },
        {
            key: "created_at",
            title: "Oluşturulma",
            sortable: true,
            render: (listing) => new Date(listing.created_at).toLocaleDateString("tr-TR"),
        },
    ]

    // Onaylı ilanlar için action'lar
    const renderApprovedActions = (listing: Listing) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShowDetails(listing.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Detayları Gör
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

    // Onay bekleyen ilanlar için action'lar
    const renderPendingActions = (listing: Listing) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShowDetails(listing.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Detayları Gör
                </DropdownMenuItem>
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

    // Reddedilen ilanlar için action'lar
    const renderRejectedActions = (listing: Listing) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShowDetails(listing.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Detayları Gör
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleApprove(listing.id)}>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Onayla
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

            <Tabs defaultValue="approved" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="approved" className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" />
                        Onaylı İlanlar
                        {approvedListings && <span className="ml-1 text-xs">({approvedListings.total})</span>}
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Onay Bekleyen İlanlar
                        {pendingListings && <span className="ml-1 text-xs">({pendingListings.total})</span>}
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center gap-2">
                        <Ban className="h-4 w-4" />
                        Reddedilen İlanlar
                        {rejectedListings && <span className="ml-1 text-xs">({rejectedListings.total})</span>}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="approved">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BadgeCheck className="h-5 w-5 text-green-600" />
                                Onaylı İlanlar
                            </CardTitle>
                            <CardDescription>
                                {approvedListings && `Toplam ${approvedListings.total} onaylı ilan`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable<Listing>
                                data={approvedListings}
                                columns={baseColumns}
                                loading={approvedLoading}
                                searchValue={approvedSearch}
                                onSearchChange={setApprovedSearch}
                                onSearch={handleApprovedSearch}
                                currentPage={approvedCurrentPage}
                                onPageChange={setApprovedCurrentPage}
                                perPage={approvedPerPage}
                                onPerPageChange={handleApprovedPerPageChange}
                                sortConfig={approvedSort}
                                onSort={handleApprovedSort}
                                actions={renderApprovedActions}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                Onay Bekleyen İlanlar
                            </CardTitle>
                            <CardDescription>
                                {pendingListings && `Toplam ${pendingListings.total} onay bekleyen ilan`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable<Listing>
                                data={pendingListings}
                                columns={baseColumns}
                                loading={pendingLoading}
                                searchValue={pendingSearch}
                                onSearchChange={setPendingSearch}
                                onSearch={handlePendingSearch}
                                currentPage={pendingCurrentPage}
                                onPageChange={setPendingCurrentPage}
                                perPage={pendingPerPage}
                                onPerPageChange={handlePendingPerPageChange}
                                sortConfig={pendingSort}
                                onSort={handlePendingSort}
                                actions={renderPendingActions}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rejected">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ban className="h-5 w-5 text-red-600" />
                                Reddedilen İlanlar
                            </CardTitle>
                            <CardDescription>
                                {rejectedListings && `Toplam ${rejectedListings.total} reddedilen ilan`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable<Listing>
                                data={rejectedListings}
                                columns={baseColumns}
                                loading={rejectedLoading}
                                searchValue={rejectedSearch}
                                onSearchChange={setRejectedSearch}
                                onSearch={handleRejectedSearch}
                                currentPage={rejectedCurrentPage}
                                onPageChange={setRejectedCurrentPage}
                                perPage={rejectedPerPage}
                                onPerPageChange={handleRejectedPerPageChange}
                                sortConfig={rejectedSort}
                                onSort={handleRejectedSort}
                                actions={renderRejectedActions}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* İlan Detayları Modal */}
            <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            İlan Detayları
                        </DialogTitle>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : selectedListing ? (
                        <div className="space-y-6">
                            {/* İlan Bilgileri */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">İlan Bilgileri</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Başlık</label>
                                        <p className="font-medium">{selectedListing.title}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Durum</label>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={
                                                selectedListing.status === 'approved' ? 'default' :
                                                    selectedListing.status === 'rejected' ? 'destructive' : 'secondary'
                                            }>
                                                {selectedListing.status === 'approved' ? 'Onaylı' :
                                                    selectedListing.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Kira Fiyatı</label>
                                        <p className="font-medium">{selectedListing.rent_price} ₺</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Metrekare</label>
                                        <p className="font-medium">{selectedListing.square_meters} m²</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{selectedListing.description}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Kullanıcı Bilgileri */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    İlan Sahibi
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
                                        <p className="font-medium">{selectedListing.user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                                        <p className="font-medium">{selectedListing.user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                                        <p className="font-medium">{selectedListing.user.telefon}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Cinsiyet</label>
                                        <p className="font-medium">{selectedListing.user.gender === 'male' ? 'Erkek' : 'Kadın'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Onaylı Kullanıcı</label>
                                        <Badge variant={selectedListing.user.onayli ? 'default' : 'secondary'}>
                                            {selectedListing.user.onayli ? 'Onaylı' : 'Onaylanmamış'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Karakter Testi</label>
                                        <Badge variant={selectedListing.user.character_test_done ? 'default' : 'secondary'}>
                                            {selectedListing.user.character_test_done ? 'Tamamlanmış' : 'Tamamlanmamış'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Resimler */}
                            {selectedListing.images && selectedListing.images.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">İlan Resimleri</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedListing.images.map((image) => (
                                            <div key={image.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={`http://192.168.1.111:8000/storage/${image.image_path}`}
                                                    alt="İlan resmi"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Tarihler */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Tarih Bilgileri
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
                                        <p className="font-medium">{new Date(selectedListing.created_at).toLocaleString("tr-TR")}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Güncellenme Tarihi</label>
                                        <p className="font-medium">{new Date(selectedListing.updated_at).toLocaleString("tr-TR")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">İlan detayları yüklenemedi</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}