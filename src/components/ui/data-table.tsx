"use client"

import React from "react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2,
} from "lucide-react"

export interface SortConfig {
    key: string
    direction: "asc" | "desc"
}

export interface PaginatedResponse<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from?: number
    to?: number
}

export interface Column<T> {
    key: string
    title: string
    sortable?: boolean
    render?: (item: T) => React.ReactNode
}

export interface DataTableProps<T> {
    data: PaginatedResponse<T> | null
    columns: Column<T>[]
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
    actions?: (item: T) => React.ReactNode
    searchPlaceholder?: string
}

export function DataTable<T>({
    data,
    columns,
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
    actions,
    searchPlaceholder = "Ara...",
}: DataTableProps<T>) {
    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="ml-1 h-4 w-4" />
        return sortConfig.direction === "asc"
            ? <ArrowUp className="ml-1 h-4 w-4" />
            : <ArrowDown className="ml-1 h-4 w-4" />
    }

    const generatePageNumbers = (current: number, last: number) => {
        const pages = []
        const maxVisible = 5
        let start = Math.max(1, current - Math.floor(maxVisible / 2))
        let end = Math.min(last, start + maxVisible - 1)
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
        for (let i = start; i <= end; i++) pages.push(i)
        return pages
    }

    return (
        <div className="space-y-4">
            {/* Arama */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    />
                </div>
                <Button onClick={onSearch}>Ara</Button>
            </div>

            {/* İçerik */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col.key}>
                                        {col.sortable ? (
                                            <Button
                                                variant="ghost"
                                                onClick={() => onSort(col.key)}
                                                className="h-auto p-0 font-medium"
                                            >
                                                {col.title}
                                                {getSortIcon(col.key)}
                                            </Button>
                                        ) : (
                                            col.title
                                        )}
                                    </TableHead>
                                ))}
                                {actions && <TableHead className="text-right">İşlemler</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.data.map((item, index) => (
                                <TableRow key={index}>
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>
                                            {col.render ? col.render(item) : (item as any)[col.key]}
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <TableCell className="text-right">
                                            {actions(item)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Sayfalama */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-muted-foreground">
                            {data?.from}-{data?.to} / {data?.total} sonuç
                        </div>
                        <div className="flex items-center space-x-2">
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
                            <div className="flex items-center space-x-1">
                                <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {generatePageNumbers(currentPage, data?.last_page || 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === currentPage ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === data?.last_page}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onPageChange(data?.last_page || 1)} disabled={currentPage === data?.last_page}>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
