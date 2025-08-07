'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllContent } from '@/app/actions/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import {
    Download,
    Calendar,
    Filter,
    FileText,
    Image,
    Video,
    Music,
    Archive
} from 'lucide-react';
import { format } from 'date-fns';

interface ContentItem {
    id: string;
    title: string;
    type: 'image' | 'video' | 'music';
    file_url: string;
    file_size: number;
    created_at: string;
    stores: {
        name: string;
        brand_company: string;
        address: string;
    };
    profiles: {
        email: string;
    };
}

interface FilterOptions {
    startDate: string;
    endDate: string;
    contentType: string;
    client: string;
    company: string;
}

export function BulkDownloadManager() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        startDate: '',
        endDate: '',
        contentType: '',
        client: '',
        company: '',
    });

    const fetchContent = useCallback(async () => {
        try {
      const data = await getAllContent();
      setContent(data);
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const applyFilters = useCallback(() => {
        let filtered = [...content];

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

        if (filters.contentType) {
            filtered = filtered.filter(item => item.type === filters.contentType);
        }

        if (filters.client) {
            filtered = filtered.filter(item =>
        item.profiles?.email?.toLowerCase().includes(filters.client.toLowerCase())
            );
        }

        if (filters.company) {
            filtered = filtered.filter(item =>
        item.stores?.brand_company?.toLowerCase().includes(filters.company.toLowerCase())
            );
        }

        setFilteredContent(filtered);
        setSelectedItems(new Set()); // Clear selection when filters change
    }, [content, filters]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredContent.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredContent.map(item => item.id)));
        }
    };

    const toggleSelectItem = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const downloadSelected = async () => {
        if (selectedItems.size === 0) return;

        setDownloading(true);
        try {
            const selectedContent = filteredContent.filter(item => selectedItems.has(item.id));

            // Create CSV data
            const csvData = [
                ['Title', 'Type', 'Client Email', 'Store', 'Company', 'Address', 'File URL', 'File Size (MB)', 'Upload Date'],
                ...selectedContent.map(item => [
                    item.title,
                    item.type,
          item.profiles?.email || 'Unknown',
          item.stores?.name || 'Unknown',
          item.stores?.brand_company || 'Unknown',
          item.stores?.address || 'Unknown',
                    item.file_url,
                    (item.file_size / (1024 * 1024)).toFixed(2),
                    format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss')
                ])
            ];

            // Convert to CSV string
            const csvString = csvData.map(row =>
                row.map(field => `"${field}"`).join(',')
            ).join('\n');

            // Download CSV
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bulk-content-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // Also create a text file with direct download links
            const linksText = selectedContent.map(item =>
                `${item.title} (${item.type}): ${item.file_url}`
            ).join('\n');

            const linksBlob = new Blob([linksText], { type: 'text/plain' });
            const linksUrl = window.URL.createObjectURL(linksBlob);
            const linksA = document.createElement('a');
            linksA.href = linksUrl;
            linksA.download = `content-links-${format(new Date(), 'yyyy-MM-dd-HHmm')}.txt`;
            document.body.appendChild(linksA);
            linksA.click();
            document.body.removeChild(linksA);
            window.URL.revokeObjectURL(linksUrl);

        } catch (error) {
            console.error('Error downloading content:', error);
        } finally {
            setDownloading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'image': return <Image className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            case 'music': return <Music className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getTotalSize = () => {
        const selectedContent = filteredContent.filter(item => selectedItems.has(item.id));
        const totalBytes = selectedContent.reduce((sum, item) => sum + item.file_size, 0);
        return formatFileSize(totalBytes);
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading content...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Content Type</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={filters.contentType}
                                onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value }))}
                            >
                                <option value="">All Types</option>
                                <option value="image">Images</option>
                                <option value="video">Videos</option>
                                <option value="music">Audio</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Client Email</label>
                            <Input
                                placeholder="Search by email..."
                                value={filters.client}
                                onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Company</label>
                            <Input
                                placeholder="Search by company..."
                                value={filters.company}
                                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selection and Download Controls */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.size === filteredContent.length && filteredContent.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">
                  Select All ({filteredContent.length} items)
                </span>
                            </label>
                            {selectedItems.size > 0 && (
                                <Badge variant="secondary">
                                    {selectedItems.size} selected • {getTotalSize()}
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Tooltip content="Clear all filters" variant="dark">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters({
                                        startDate: '',
                                        endDate: '',
                                        contentType: '',
                                        client: '',
                                        company: '',
                                    })}
                                >
                                    Clear Filters
                                </Button>
                            </Tooltip>

                            <Tooltip content="Download selected content metadata and links" variant="dark">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={downloadSelected}
                                    disabled={selectedItems.size === 0 || downloading}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {downloading ? 'Downloading...' : `Download Selected (${selectedItems.size})`}
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content List */}
            <div className="grid gap-4">
                {filteredContent.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => toggleSelectItem(item.id)}
                                    className="rounded"
                                />

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(item.type)}
                                        <div>
                                            <div className="font-medium text-sm">{item.title}</div>
                                            <Badge variant="outline" className="text-xs">
                                                {item.type}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                    <div className="font-medium">{item.profiles?.email || 'Unknown User'}</div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                    <div className="font-medium">{item.stores?.name || 'Unknown Store'}</div>
                    <div className="text-xs">{item.stores?.brand_company || 'Unknown Company'}</div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {formatFileSize(item.file_size)}
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                    </div>

                                    <div className="flex gap-2">
                                        <Tooltip content="Download this file" variant="dark">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(item.file_url, '_blank')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredContent.length === 0 && (
                <div className="text-center py-12">
                    <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                    <p className="text-gray-600">
                        Try adjusting your filters to see more content.
                    </p>
                </div>
            )}
        </div>
    );
}
