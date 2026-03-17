'use client'

import { useState, useEffect } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { DataTable, createColumn, BadgeCell, DateCell } from '@/components/ui/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  CheckSquare,
  X,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileText,
  Eye,
  Edit,
  Trash2,
  Share
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'

interface Case {
  id: string
  procedure_type: string
  date: string
  category: string
  subcategory?: string
  role: string
  verification_status: string
  patient_demographics?: {
    age?: number
    gender?: string
  }
  notes?: string
  created_at: string
  updated_at: string
}

export default function CasesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<Case[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [filters, setFilters] = useState({
    category: '',
    verification_status: '',
    dateFrom: '',
    dateTo: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cases')
      const data = await response.json()
      setCases(data.cases || [])
      
      toast({
        title: 'Cases Loaded',
        description: `Successfully loaded ${data.cases?.length || 0} cases`,
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load cases',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCase = (id: string) => {
    if (selectedCases.includes(id)) {
      setSelectedCases(selectedCases.filter(caseId => caseId !== id))
    } else {
      setSelectedCases([...selectedCases, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedCases.length === cases.length) {
      setSelectedCases([])
    } else {
      setSelectedCases(cases.map(c => c.id))
    }
  }

  const handleBulkExport = async () => {
    try {
      toast({
        title: 'Exporting...',
        description: `Exporting ${selectedCases.length} cases`,
      })
      
      const response = await fetch('/api/cases/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseIds: selectedCases, format: 'pdf' }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `medlog-cases-export-${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
        
        toast({
          title: 'Export Complete',
          description: `${selectedCases.length} cases exported successfully`,
          variant: 'success',
        })
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export cases',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCases.length} cases?`)) {
      return
    }
    
    try {
      await fetch('/api/cases/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseIds: selectedCases }),
      })
      
      toast({
        title: 'Deleted',
        description: `${selectedCases.length} cases deleted`,
        variant: 'success',
      })
      
      setCases(cases.filter(c => !selectedCases.includes(c.id)))
      setSelectedCases([])
      setBulkMode(false)
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete cases',
        variant: 'destructive',
      })
    }
  }

  const columns = [
    {
      id: 'select',
      header: ({ table }: any) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-gray-300"
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedCases.includes(row.original.id)}
            onChange={() => handleSelectCase(row.original.id)}
            className="w-4 h-4 rounded border-gray-300"
          />
        </div>
      ),
      width: 50,
    },
    createColumn<Case, string>('procedure_type', 'Procedure', {
      width: 250,
      cell: (row) => (
        <div>
          <div className="font-medium">{row.procedure_type}</div>
          {row.patient_demographics?.age && (
            <div className="text-xs text-gray-500">
              {row.patient_demographics.age}y • {row.patient_demographics.gender}
            </div>
          )}
        </div>
      ),
    }),
    createColumn<Case, string>('date', 'Date', {
      cell: (row) => <DateCell date={row.date} />,
      width: 120,
    }),
    createColumn<Case, string>('category', 'Category', {
      width: 150,
    }),
    createColumn<Case, string>('role', 'Role', {
      width: 150,
    }),
    createColumn<Case, string>('verification_status', 'Status', {
      cell: (row) => (
        <BadgeCell
          value={row.verification_status}
          variant={
            row.verification_status === 'verified' ? 'success' :
            row.verification_status === 'pending' ? 'warning' : 'default'
          }
        />
      ),
      width: 120,
    }),
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: 60,
    },
  ]

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.procedure_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filters.category || caseItem.category === filters.category
    const matchesStatus = !filters.verification_status || caseItem.verification_status === filters.verification_status
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <SlideUp>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Cases</h1>
              <p className="text-gray-500 mt-1">
                Manage and view all your logged procedures
              </p>
            </div>
            <div className="flex gap-2">
              {bulkMode && selectedCases.length > 0 && (
                <>
                  <Badge variant="default">
                    {selectedCases.length} selected
                  </Badge>
                  <Button onClick={handleBulkExport} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button onClick={() => { setBulkMode(false); setSelectedCases([]) }} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
              {!bulkMode && (
                <>
                  <Button onClick={() => setBulkMode(true)} variant="outline">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Bulk Select
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Case
                  </Button>
                </>
              )}
            </div>
          </div>
        </SlideUp>

        {/* Search & Filters */}
        <SlideUp delay={0.1}>
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search procedures, categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? 'default' : 'outline'}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>
                <Button onClick={fetchCases} variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="grid gap-4 mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full rounded-md border border-gray-200 p-2 text-sm"
                      >
                        <option value="">All Categories</option>
                        <option value="Trauma">Trauma</option>
                        <option value="Arthroplasty">Arthroplasty</option>
                        <option value="Sports Medicine">Sports Medicine</option>
                        <option value="Shoulder">Shoulder</option>
                        <option value="Hand">Hand</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <select
                        value={filters.verification_status}
                        onChange={(e) => setFilters({ ...filters, verification_status: e.target.value })}
                        className="w-full rounded-md border border-gray-200 p-2 text-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="self">Self-Logged</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          setFilters({ category: '', verification_status: '', dateFrom: '', dateTo: '' })
                          setSearchTerm('')
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideUp>

        {/* Data Table */}
        <SlideUp delay={0.2}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Cases</CardTitle>
                  <CardDescription>
                    {filteredCases.length} of {cases.length} cases shown
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {selectedCases.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredCases}
                searchKey="procedure_type"
                pageSize={10}
              />
            </CardContent>
          </Card>
        </SlideUp>

        {/* Quick Stats */}
        <SlideUp delay={0.3}>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{cases.length}</div>
                <p className="text-sm text-gray-500">Total Cases</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {cases.filter(c => c.verification_status === 'verified').length}
                </div>
                <p className="text-sm text-gray-500">Verified</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {cases.filter(c => c.verification_status === 'pending').length}
                </div>
                <p className="text-sm text-gray-500">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(cases.map(c => c.category)).size}
                </div>
                <p className="text-sm text-gray-500">Categories</p>
              </CardContent>
            </Card>
          </div>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
