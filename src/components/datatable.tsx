import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Search,
    MoreHorizontal,
    UserCheck,
    UserX,
    UserMinus,
    Loader2,
    Shield,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Trash2
} from 'lucide-react'

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
    direction: 'asc' | 'desc'
}

interface DataTableProps {
    data: PaginatedUsers | null
    loading: boolean
    searchValue: string
    onSearchChange: (value: string) => void
    onSearch: () => void
    currentPage: number
    onPageChange: (page: number) => void
    perPage: number
    onPerPageChange: (value: string) => void
    sortConfig: SortConfig
    onSort: (key: string) => void
    onToggleApproval: (user: User) => void
    onToggleAdmin?: (user: User) => void
    onRemoveAdmin?: (user: User) => void
    onDelete: (userId: number) => void
    isAdminTable?: boolean
    searchPlaceholder?: string
}

export function DataTable({
    data,
    loading,
    searchValue,
    onSearchChange,
    onSearch,
    currentPage,
    onPageChange,
    perPage,
    onPerPageChange,
    sortConfig,
    onSort,
    onToggleApproval,
    onToggleAdmin,
    onRemoveAdmin,
    onDelete,
    isAdminTable = false,
    searchPlaceholder = "Kullanıcı ara..."
}: DataTableProps) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR')
    }

    const getSortIcon = (columnKey: string) => {
        if (sortConfig.key !== columnKey) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />
        }
        return sortConfig.direction === 'asc' ?
            <ArrowUp className="ml-2 h-4 w-4" /> :
            <ArrowDown className="ml-2 h-4 w-4" />
    }

    const generatePageNumbers = (currentPage: number, lastPage: number) => {
        const pages = []
        const maxVisible = 5

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
        let end = Math.min(lastPage, start + maxVisible - 1)

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        return pages
    }

    const PaginationControls = () => {
        if (!data || data.last_page <= 1) return null

        const pageNumbers = generatePageNumbers(currentPage, data.last_page)

        return (
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                        {data.from || 1}-{data.to || data.data.length} / {data.total} sonuç gösteriliyor
                    </p>
                    <Select value={perPage.toString()} onValueChange={onPerPageChange}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="15">15</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">sayfa başına</span>
                </div>

                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {pageNumbers.map((pageNum) => (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(pageNum)}
                        >
                            {pageNum}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === data.last_page}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(data.last_page)}
                        disabled={currentPage === data.last_page}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Arama */}
            <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                    />
                </div>
                <Button onClick={onSearch}>Ara</Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => onSort('name')}
                                        className="h-auto p-0 font-medium"
                                    >
                                        Ad
                                        {getSortIcon('name')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => onSort('email')}
                                        className="h-auto p-0 font-medium"
                                    >
                                        E-posta
                                        {getSortIcon('email')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => onSort('character_test_done')}
                                        className="h-auto p-0 font-medium"
                                    >
                                        Durum
                                        {getSortIcon('character_test_done')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => onSort('onayli')}
                                        className="h-auto p-0 font-medium"
                                    >
                                        Onay
                                        {getSortIcon('onayli')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => onSort('created_at')}
                                        className="h-auto p-0 font-medium"
                                    >
                                        Kayıt Tarihi
                                        {getSortIcon('created_at')}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {isAdminTable && <Shield className="h-4 w-4 text-blue-600" />}
                                            {user.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={Number(user.character_test_done) === 1 ? "default" : "secondary"}
                                            className={Number(user.character_test_done) === 1 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                                        >
                                            {Number(user.character_test_done) === 1 ? "Test Tamamlandı" : "Test Bekliyor"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={Number(user.onayli) === 1 ? "default" : "destructive"}
                                            className={Number(user.onayli) === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                        >
                                            {Number(user.onayli) === 1 ? "Onaylı" : "Onay Bekliyor"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(user.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onToggleApproval(user)}>
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

                                                {!isAdminTable && onToggleAdmin && (
                                                    <DropdownMenuItem onClick={() => onToggleAdmin(user)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Admin Yap
                                                    </DropdownMenuItem>
                                                )}

                                                {isAdminTable && onRemoveAdmin && (
                                                    <DropdownMenuItem onClick={() => onRemoveAdmin(user)}>
                                                        <UserMinus className="mr-2 h-4 w-4" />
                                                        Admin Yetkisini Kaldır
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem
                                                    onClick={() => onDelete(user.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Sil
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <PaginationControls />
                </>
            )}
        </>
    )
}