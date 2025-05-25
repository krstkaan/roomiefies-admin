"use client"

import React, { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, Users, UserCheck, UserX, UserMinus, Trash2, MoreHorizontal, Edit, Eye, User, Mail, Phone, Calendar, MapPin, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable, Column } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
    id: number
    name: string
    email: string
    is_helios: number | string
    onayli: number | string
    character_test_done: number | string
    created_at: string
    telefon?: string
    gender?: string
}

interface UserDetails {
    id: number
    name: string
    email: string
    email_verified_at: string | null
    created_at: string
    updated_at: string
    telefon: string
    dogum_tarihi: string
    gender: string
    il_id: number
    ilce_id: number
    profile_photo_path: string
    onayli: boolean
    character_test_done: boolean
    listing_id: number
    is_helios: boolean
    profile_photo_url: string
}

interface PaginatedUsers {
    data: User[]
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

export default function UsersPage() {
    // --- STATES ---
    const [users, setUsers] = useState<PaginatedUsers | null>(null)
    const [usersLoading, setUsersLoading] = useState(true)
    const [usersError, setUsersError] = useState("")
    const [usersSearch, setUsersSearch] = useState("")
    const [usersCurrentPage, setUsersCurrentPage] = useState(1)
    const [usersPerPage, setUsersPerPage] = useState(15)
    const [usersSort, setUsersSort] = useState<SortConfig>({ key: "created_at", direction: "desc" })

    const [admins, setAdmins] = useState<PaginatedUsers | null>(null)
    const [adminsLoading, setAdminsLoading] = useState(true)
    const [adminsError, setAdminsError] = useState("")
    const [adminsSearch, setAdminsSearch] = useState("")
    const [adminsCurrentPage, setAdminsCurrentPage] = useState(1)
    const [adminsPerPage, setAdminsPerPage] = useState(15)
    const [adminsSort, setAdminsSort] = useState<SortConfig>({ key: "created_at", direction: "desc" })

    // Modal states
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [detailsError, setDetailsError] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)

    // --- FETCH METHODS ---
    const fetchUsers = async (page = 1, searchTerm = "", sort = usersSort, perPage = usersPerPage) => {
        setUsersLoading(true)
        setUsersError("")
        const response = await apiClient.getRegularUsers(page, searchTerm, sort.key, sort.direction, perPage)
        response.data ? setUsers(response.data) : setUsersError(response.error || "Kullanıcılar yüklenemedi")
        setUsersLoading(false)
    }

    const fetchAdmins = async (page = 1, searchTerm = "", sort = adminsSort, perPage = adminsPerPage) => {
        setAdminsLoading(true)
        setAdminsError("")
        const response = await apiClient.getAdmins(page, searchTerm, sort.key, sort.direction, perPage)
        response.data ? setAdmins(response.data) : setAdminsError(response.error || "Admin kullanıcıları yüklenemedi")
        setAdminsLoading(false)
    }

    const fetchUserDetails = async (userId: number) => {
        setDetailsLoading(true)
        setDetailsError("")
        setUserDetails(null)

        const response = await apiClient.getUserDetails(userId)
        if (response.data) {
            setUserDetails(response.data)
        } else {
            setDetailsError(response.error || "Kullanıcı detayları yüklenemedi")
        }
        setDetailsLoading(false)
    }

    // --- EFFECTS ---
    useEffect(() => {
        fetchUsers(usersCurrentPage, usersSearch, usersSort, usersPerPage)
    }, [usersCurrentPage, usersSort, usersPerPage])

    useEffect(() => {
        fetchAdmins(adminsCurrentPage, adminsSearch, adminsSort, adminsPerPage)
    }, [adminsCurrentPage, adminsSort, adminsPerPage])

    // --- HANDLERS ---
    const handleUsersSort = (key: string) => {
        const direction = usersSort.key === key && usersSort.direction === "asc" ? "desc" : "asc"
        setUsersSort({ key, direction })
        setUsersCurrentPage(1)
    }

    const handleAdminsSort = (key: string) => {
        const direction = adminsSort.key === key && adminsSort.direction === "asc" ? "desc" : "asc"
        setAdminsSort({ key, direction })
        setAdminsCurrentPage(1)
    }

    const handleUsersSearch = () => {
        setUsersCurrentPage(1)
        fetchUsers(1, usersSearch, usersSort, usersPerPage)
    }

    const handleAdminsSearch = () => {
        setAdminsCurrentPage(1)
        fetchAdmins(1, adminsSearch, adminsSort, adminsPerPage)
    }

    const handleUsersPerPageChange = (value: string) => {
        setUsersPerPage(Number(value))
        setUsersCurrentPage(1)
    }

    const handleAdminsPerPageChange = (value: string) => {
        setAdminsPerPage(Number(value))
        setAdminsCurrentPage(1)
    }

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return
        const response = await apiClient.deleteUser(userId)
        response.data
            ? fetchUsers(usersCurrentPage, usersSearch, usersSort, usersPerPage)
            : alert(response.error || "Kullanıcı silinemedi")
    }

    const handleToggleAdmin = async (user: User) => {
        const newStatus = Number(user.is_helios) === 1 ? 0 : 1
        const response = await apiClient.updateUser(user.id, { is_helios: newStatus })
        if (response.data) {
            fetchUsers(usersCurrentPage, usersSearch, usersSort, usersPerPage)
            fetchAdmins(adminsCurrentPage, adminsSearch, adminsSort, adminsPerPage)
        } else alert(response.error || "Kullanıcı güncellenemedi")
    }

    const handleToggleApproval = async (user: User) => {
        const newStatus = Number(user.onayli) === 1 ? 0 : 1
        const response = await apiClient.updateUser(user.id, { onayli: newStatus })
        if (response.data) {
            fetchUsers(usersCurrentPage, usersSearch, usersSort, usersPerPage)
            fetchAdmins(adminsCurrentPage, adminsSearch, adminsSort, adminsPerPage)
        } else alert(response.error || "Kullanıcı güncellenemedi")
    }

    const handleRemoveAdmin = async (admin: User) => {
        if (!confirm(`${admin.name} kullanıcısının admin yetkisini kaldırmak istediğinizden emin misiniz?`)) return
        const response = await apiClient.updateUser(admin.id, { is_helios: 0 })
        response.data
            ? (fetchAdmins(adminsCurrentPage, adminsSearch, adminsSort, adminsPerPage),
                fetchUsers(usersCurrentPage, usersSearch, usersSort, usersPerPage))
            : alert(response.error || "Admin yetkisi kaldırılamadı")
    }

    const handleDeleteAdmin = async (adminId: number) => {
        if (!confirm("Bu admin kullanıcısını silmek istediğinizden emin misiniz?")) return
        const response = await apiClient.deleteUser(adminId)
        response.data
            ? fetchAdmins(adminsCurrentPage, adminsSearch, adminsSort, adminsPerPage)
            : alert(response.error || "Admin silinemedi")
    }

    const handleViewDetails = (userId: number) => {
        setSelectedUserId(userId)
        setIsModalOpen(true)
        fetchUserDetails(userId)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("tr-TR", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatBirthDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("tr-TR", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getGenderText = (gender: string) => {
        switch (gender) {
            case 'male': return 'Erkek'
            case 'female': return 'Kadın'
            default: return 'Belirtilmemiş'
        }
    }

    // --- COLUMNS ---
    const userColumns: Column<User>[] = [
        { key: "name", title: "Ad", sortable: true },
        { key: "email", title: "E-posta", sortable: true },
        {
            key: "character_test_done", title: "Durum", sortable: true,
            render: (user) => (
                <Badge
                    variant={Number(user.character_test_done) === 1 ? "default" : "secondary"}
                    className={Number(user.character_test_done) === 1 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                    {Number(user.character_test_done) === 1 ? "Test Tamamlandı" : "Test Bekliyor"}
                </Badge>
            ),
        },
        {
            key: "onayli", title: "Onay", sortable: true,
            render: (user) => (
                <Badge
                    variant={Number(user.onayli) === 1 ? "default" : "destructive"}
                    className={Number(user.onayli) === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                    {Number(user.onayli) === 1 ? "Onaylı" : "Bekliyor"}
                </Badge>
            ),
        },
        {
            key: "created_at", title: "Kayıt Tarihi", sortable: true,
            render: (user) => new Date(user.created_at).toLocaleDateString("tr-TR"),
        },
    ]

    // --- ACTIONS ---
    const renderUserActions = (user: User, isAdminTable: boolean) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Detayları Görüntüle
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleToggleApproval(user)}>
                    {Number(user.onayli) === 1 ? (
                        <>
                            <UserX className="mr-2 h-4 w-4" />
                            Onayı Kaldır
                        </>
                    ) : (
                        <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Onayla
                        </>
                    )}
                </DropdownMenuItem>

                {!isAdminTable && (
                    <DropdownMenuItem onClick={() => handleToggleAdmin(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Admin Yap
                    </DropdownMenuItem>
                )}

                {isAdminTable && (
                    <DropdownMenuItem onClick={() => handleRemoveAdmin(user)}>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Yetkiyi Kaldır
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem
                    onClick={() => isAdminTable ? handleDeleteAdmin(user.id) : handleDeleteUser(user.id)}
                    className="text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    // --- RENDER USER DETAILS MODAL ---
    const renderUserDetailsModal = () => (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Kullanıcı Detayları
                    </DialogTitle>
                </DialogHeader>

                {detailsLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {detailsError && (
                    <Alert variant="destructive">
                        <AlertDescription>{detailsError}</AlertDescription>
                    </Alert>
                )}

                {userDetails && (
                    <div className="space-y-6">
                        {/* Profile Section */}
                        <div className="flex items-start gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={userDetails.profile_photo_url} alt={userDetails.name} />
                                <AvatarFallback className="text-lg">
                                    {userDetails.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">{userDetails.name}</h3>
                                <p className="text-muted-foreground">{userDetails.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant={userDetails.onayli ? "default" : "destructive"}>
                                        {userDetails.onayli ? "Onaylı" : "Onay Bekliyor"}
                                    </Badge>
                                    <Badge variant={userDetails.is_helios ? "secondary" : "outline"}>
                                        {userDetails.is_helios ? "Admin" : "Kullanıcı"}
                                    </Badge>
                                    <Badge variant={userDetails.character_test_done ? "default" : "secondary"}>
                                        {userDetails.character_test_done ? "Test Tamamlandı" : "Test Bekliyor"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg">Kişisel Bilgiler</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">E-posta</p>
                                        <p className="font-medium">{userDetails.email}</p>
                                        {userDetails.email_verified_at && (
                                            <p className="text-xs text-green-600">Doğrulanmış</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Telefon</p>
                                        <p className="font-medium">{userDetails.telefon || "Belirtilmemiş"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cinsiyet</p>
                                        <p className="font-medium">{getGenderText(userDetails.gender)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Doğum Tarihi</p>
                                        <p className="font-medium">
                                            {userDetails.dogum_tarihi ? formatBirthDate(userDetails.dogum_tarihi) : "Belirtilmemiş"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Konum</p>
                                        <p className="font-medium">İl ID: {userDetails.il_id}, İlçe ID: {userDetails.ilce_id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Profil Fotoğrafı</p>
                                        <p className="font-medium">{userDetails.profile_photo_path ? "Mevcut" : "Yok"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* System Information */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg">Sistem Bilgileri</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Kullanıcı ID</p>
                                    <p className="font-medium">{userDetails.id}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Listing ID</p>
                                    <p className="font-medium">{userDetails.listing_id}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
                                    <p className="font-medium">{formatDate(userDetails.created_at)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Son Güncelleme</p>
                                    <p className="font-medium">{formatDate(userDetails.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
                <p className="text-muted-foreground">Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin</p>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Normal Kullanıcılar
                        {users && <span className="ml-1 text-xs">({users.total})</span>}
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Kullanıcıları
                        {admins && <span className="ml-1 text-xs">({admins.total})</span>}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    {usersError && <Alert variant="destructive"><AlertDescription>{usersError}</AlertDescription></Alert>}
                    <Card>
                        <CardHeader>
                            <CardTitle>Normal Kullanıcılar</CardTitle>
                            <CardDescription>{users && `Toplam ${users.total} kullanıcı`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable<User>
                                data={users}
                                columns={userColumns}
                                loading={usersLoading}
                                searchValue={usersSearch}
                                onSearchChange={setUsersSearch}
                                onSearch={handleUsersSearch}
                                currentPage={usersCurrentPage}
                                onPageChange={setUsersCurrentPage}
                                perPage={usersPerPage}
                                onPerPageChange={handleUsersPerPageChange}
                                sortConfig={usersSort}
                                onSort={handleUsersSort}
                                actions={(user) => renderUserActions(user, false)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="admins">
                    {adminsError && <Alert variant="destructive"><AlertDescription>{adminsError}</AlertDescription></Alert>}
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Kullanıcılar</CardTitle>
                            <CardDescription>{admins && `Toplam ${admins.total} admin`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable<User>
                                data={admins}
                                columns={userColumns}
                                loading={adminsLoading}
                                searchValue={adminsSearch}
                                onSearchChange={setAdminsSearch}
                                onSearch={handleAdminsSearch}
                                currentPage={adminsCurrentPage}
                                onPageChange={setAdminsCurrentPage}
                                perPage={adminsPerPage}
                                onPerPageChange={handleAdminsPerPageChange}
                                sortConfig={adminsSort}
                                onSort={handleAdminsSort}
                                actions={(user) => renderUserActions(user, true)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* User Details Modal */}
            {renderUserDetailsModal()}
        </div>
    )
}