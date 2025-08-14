// components/client/ContentDashboard.tsx
'use client';

import {useState, useEffect, useCallback, useMemo} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import {
    Upload,
    Search,
    Filter,
    Calendar,
    SortAsc,
    SortDesc,
    Grid,
    List,
    Download,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2, Delete
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchContentForUser } from '@/app/actions/data-actions';

// --- Reusable Component Imports ---
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { ContentCard } from "@/components/content/ContentCard"; // --- FIX: Import the reusable card ---
import { ContentItem } from "@/types/content";
import { formatFileSize, getStatusBadge, getTypeIcon } from "@/utils/contentUtils";
import { ContentPreviewTooltip } from '@/components/content/ContentPreviewTooltip'; // --- 1. IMPORT THE NEW COMPONENT ---


interface ContentDashboardProps {
    userId: string;
    isAdminView?: boolean;
}

interface FilterOptions {
    search: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
}

interface SortOptions {
    field: 'created_at' | 'title' | 'file_size' | 'type';
    direction: 'asc' | 'desc';
}

export function ContentDashboard({ userId, isAdminView }: ContentDashboardProps) {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

    // Filtering and sorting
    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        type: '',
        status: '',
        startDate: '',
        endDate: '',
    });

    const [sort, setSort] = useState<SortOptions>({
        field: 'created_at',
        direction: 'desc',
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'grid' ? 12 : 10; // Allow more items for grid view

    const fetchContent = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchContentForUser(userId);
            if (result.success) {
                setContent(result.content || []);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    // Filter and sort content
    const filteredAndSortedContent = useMemo(() => {
        let filtered = [...content];

        // Apply filters
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(item => {
                const titleMatch = item.title.toLowerCase().includes(searchLower);
                // --- FIX 1: Safely check properties on the optional 'stores' object. ---
                const storeNameMatch = (item.stores?.name?.toLowerCase() ?? '').includes(searchLower);
                const companyMatch = (item.stores?.brand_company?.toLowerCase() ?? '').includes(searchLower);
                return titleMatch || storeNameMatch || companyMatch;
            });
        }

        if (filters.type) {
            filtered = filtered.filter(item => item.type === filters.type);
        }

        if (filters.status) {
            const now = new Date();
            filtered = filtered.filter(item => {
                // --- FIX 2: Prevent "Invalid Date" errors by guarding against undefined dates. ---
                if (!item.start_date || !item.end_date) return false;

                const startDate = new Date(item.start_date);
                const endDate = new Date(item.end_date);

                if (filters.status === 'active') {
                    return startDate <= now && endDate >= now;
                } else if (filters.status === 'archived') {
                    return endDate < now;
                } else if (filters.status === 'scheduled') {
                    return startDate > now;
                }
                return true;
            });
        }

        if (filters.startDate) {
            filtered = filtered.filter(item =>
                new Date(item.created_at) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            filtered = filtered.filter(item =>
                new Date(item.created_at) <= new Date(filters.endDate)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[sort.field];
            let bValue: any = b[sort.field];

            if (sort.field === 'created_at' || sort.field === 'file_size') {
                aValue = sort.field === 'created_at' ? new Date(aValue).getTime() : aValue;
                bValue = sort.field === 'created_at' ? new Date(bValue).getTime() : bValue;
            } else {
                aValue = aValue?.toString().toLowerCase() ?? '';
                bValue = bValue?.toString().toLowerCase() ?? '';
            }

            if (sort.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [content, filters, sort]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedContent.length / itemsPerPage);
    const paginatedContent = filteredAndSortedContent.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    const handleSort = (field: SortOptions['field']) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            status: '',
            startDate: '',
            endDate: ''
        });
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading your content...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters and Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Content Filters & Search
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search content..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="pl-10"
                            />
                        </div>

                        {/* Content Type Filter */}
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="">All Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                            <option value="music">Audio</option>
                        </select>

                        {/* Status Filter */}
                        <select className="w-full p-2 border border-gray-300 rounded-md"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="archived">Archived</option>
                        </select>

                        {/* Date Range */}
                        <Input
                            type="date"
                            placeholder="Start Date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        />

                        <Input
                            type="date"
                            placeholder="End Date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>

                            <div className="text-sm text-gray-600 flex items-center">
                                Showing {filteredAndSortedContent.length} of {content.length} items
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-300 rounded-md">
                                <Tooltip content="Grid view" variant="dark">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-r-none"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                <Tooltip content="List view" variant="dark">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-l-none border-l"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                            </div>

                            {/* Sort Controls */}
                            <div className="flex gap-1">
                                <Tooltip content="Sort by upload date" variant="dark">
                                    <Button
                                        variant={sort.field === 'created_at' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Date
                                        {sort.field === 'created_at' && (
                                            sort.direction === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
                                        )}
                                    </Button>
                                </Tooltip>

                                <Tooltip content="Sort by name" variant="dark">
                                    <Button
                                        variant={sort.field === 'title' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSort('title')}
                                    >
                                        Name
                                        {sort.field === 'title' && (
                                            sort.direction === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
                                        )}
                                    </Button>
                                </Tooltip>

                                <Tooltip content="Sort by file size" variant="dark">
                                    <Button
                                        variant={sort.field === 'file_size' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSort('file_size')}
                                    >
                                        Size
                                        {sort.field === 'file_size' && (
                                            sort.direction === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
                                        )}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Display */}
            {filteredAndSortedContent.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {content.length === 0 ? 'No content uploaded yet' : 'No content matches your filters'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {content.length === 0
                                ? 'Start by uploading your first marketing content.'
                                : 'Try adjusting your search criteria or clearing filters.'
                            }
                        </p>
                        {content.length === 0 ? (
                            <Button>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Content
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {paginatedContent.map(item => <ContentCard key={item.id} item={item} isSelected={selectedContent?.id === item.id} onSelectItem={() => setSelectedContent(item)} onViewDetails={() => setSelectedContent(item)} />)}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-gray-900">Content</th>
                                            <th className="text-left p-4 font-medium text-gray-900">Store</th>
                                            <th className="text-left p-4 font-medium text-gray-900">Status</th>
                                            <th className="text-left p-4 font-medium text-gray-900">Size</th>
                                            <th className="text-left p-4 font-medium text-gray-900">Uploaded</th>
                                            <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {paginatedContent.map(item => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">
                                                    {/* --- 2. WRAP THE CONTENT CELL WITH THE TOOLTIP --- */}
                                                    <Tooltip
                                                        position="right"
                                                        variant="dark"
                                                        className="p-0 bg-transparent border-none shadow-none" // Make tooltip container invisible
                                                        content={<ContentPreviewTooltip item={item} />}
                                                    >
                                                        <div className="flex items-center gap-3 cursor-default">
                                                        {getTypeIcon(item.type)}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.title}</p>
                                                            <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                                                        </div>
                                                    </div>
                                                    </Tooltip>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.stores?.name ?? 'N/A'}</p>
                                                        <p className="text-sm text-gray-600">{item.stores?.brand_company ?? 'N/A'}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(item)}
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {formatFileSize(item.file_size)}
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <Tooltip content="View details" variant="dark">
                                                            <Button variant="outline" size="sm" onClick={() => setSelectedContent(item)}><Eye className="w-4 h-4" /></Button>
                                                        </Tooltip>
                                                        <Tooltip content="Delete (Not Implemented)" variant="dark">
                                                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600"><Delete className="w-4 h-4" /></Button>
                                                            </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedContent.length)} of {filteredAndSortedContent.length} results
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>

                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <Button
                                            key={page}
                                            variant={page === currentPage ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="w-10"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Content Detail Modal */}

            <ContentDetailModal
                item={selectedContent}
                onClose={() => setSelectedContent(null)}
            />
        </div>
    );
}
