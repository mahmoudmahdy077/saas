'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AnimatedCard } from '@/components/ui/animated-card'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  pageSize?: number
  enablePagination?: boolean
  enableSorting?: boolean
  enableFilters?: boolean
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  enablePagination = true,
  enableSorting = true,
  enableFilters = true,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchKey && enableFilters && (
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              onClick={() => setGlobalFilter('')}
              size="sm"
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <AnimatedCard className="overflow-hidden">
        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400"
                      onClick={
                        enableSorting && header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {enableSorting && header.column.getCanSort() && (
                            <ArrowUpDown className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <AnimatePresence>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={`border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        onRowClick ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 align-middle">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-24"
                  >
                    <td
                      colSpan={columns.length}
                      className="text-center text-gray-500"
                    >
                      No results found.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper column definitions
export const createColumn = <TData, TValue = unknown>(
  accessorKey: string,
  header: string,
  options?: {
    cell?: (row: TData) => React.ReactNode
    enableSorting?: boolean
    width?: number
  }
): ColumnDef<TData, TValue> => ({
  accessorKey,
  header,
  enableSorting: options?.enableSorting ?? true,
  size: options?.width,
  cell: options?.cell
    ? ({ row }) => options.cell!(row.original)
    : ({ getValue }) => getValue() as React.ReactNode,
})

export const BadgeCell = ({
  value,
  variant,
}: {
  value: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}) => <Badge variant={variant}>{value}</Badge>

export const DateCell = ({ date }: { date: string | Date }) => (
  <span className="text-sm text-gray-500">
    {new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}
  </span>
)

export const ActionCell = ({ actions }: { actions: React.ReactNode[] }) => (
  <div className="flex items-center gap-2">{actions}</div>
)
