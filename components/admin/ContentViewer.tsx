'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllContent } from '@/app/actions/content';
import NextImage from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import {
  Folder,
  Image,
  Video,
  Music,
  Calendar,
  MapPin,
  Download,
  ExternalLink,
  Grid,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { format } from 'date-fns';

interface ContentItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'music';
  file_url: string;
  file_size: number;
  start_date: string;
  end_date: string;
  recurrence_type: string;
  recurrence_days: string[] | null;
  created_at: string;
  stores: {
    name: string;
    brand_company: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
}

interface GroupedContent {
  [key: string]: {
    [key: string]: {
      [key: string]: ContentItem[];
    };
  };
}

export function ContentViewer() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [groupedContent, setGroupedContent] = useState<GroupedContent>({});
  const [viewMode, setViewMode] = useState<'grid' | 'location' | 'company'>('grid');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

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

  const groupContent = useCallback(() => {
    const sorted = [...content].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const grouped: GroupedContent = {};

    sorted.forEach(item => {
      if (viewMode === 'location') {
        const location = item.stores.address.split(',')[0] || 'Unknown Location';
        const company = item.stores.brand_company;
        const type = item.type;

        if (!grouped[location]) grouped[location] = {};
        if (!grouped[location][company]) grouped[location][company] = {};
        if (!grouped[location][company][type]) grouped[location][company][type] = [];

        grouped[location][company][type].push(item);
      } else {
        const company = item.stores.brand_company;
        const location = item.stores.address.split(',')[0] || 'Unknown Location';
        const type = item.type;

        if (!grouped[company]) grouped[company] = {};
        if (!grouped[company][location]) grouped[company][location] = {};
        if (!grouped[company][location][type]) grouped[company][location][type] = [];

        grouped[company][location][type].push(item);
      }
    });

    setGroupedContent(grouped);
  }, [content, viewMode, sortOrder]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    if (viewMode !== 'grid') {
      groupContent();
    }
  }, [viewMode, groupContent]);

  const sortedContent = useMemo(() => {
    return [...content].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [content, sortOrder]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (item: ContentItem) => {
    const now = new Date();
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);

    if (startDate > now) {
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Scheduled</Badge>;
    } else if (endDate < now) {
      return <Badge variant="secondary" className="text-gray-600">Archived</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-600 text-white">Active</Badge>;
    }
  };

  const ContentCard = ({ item }: { item: ContentItem }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
      {/* Image/Video Preview */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {item.type === 'image' && (
          <div className="relative w-full h-full">
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <NextImage
                src={item.file_url}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  (target.parentNode as HTMLElement).parentElement?.nextElementSibling?.classList.remove('hidden');
                }}
              />
            </div>
          </div>
        )}
        {item.type === 'video' && (
          <div className="relative w-full h-full">
            <video
              src={item.file_url}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <Video className="w-12 h-12 text-white" />
            </div>
          </div>
        )}
        {item.type === 'music' && (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <Music className="w-12 h-12 text-white" />
          </div>
        )}

        {/* Fallback for broken images */}
        <div className="hidden w-full h-full bg-gray-200 flex items-center justify-center">
          {getTypeIcon(item.type)}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Tooltip content="View details" variant="dark">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContent(item);
                }}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Download file" variant="dark">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.file_url, '_blank');
                }}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <Download className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {item.type}
          </Badge>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {getStatusBadge(item)}
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
          {item.title}
        </h3>

        <div className="space-y-1 text-xs text-gray-600 mb-3">
          <p className="font-medium">{item.stores.name}</p>
          <p className="text-gray-500">{item.stores.brand_company}</p>
          <p className="text-gray-500">{formatFileSize(item.file_size)}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(item.start_date), 'MMM dd')} - {format(new Date(item.end_date), 'MMM dd')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* View Mode Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Tooltip content="Grid view of all content" variant="dark">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:border-blue-300 hover:text-blue-600'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid View
            </Button>
          </Tooltip>
          <Tooltip content="Group content by store location" variant="dark">
            <Button
              variant={viewMode === 'location' ? 'default' : 'outline'}
              className={viewMode === 'location' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:border-blue-300 hover:text-blue-600'}
              onClick={() => setViewMode('location')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              By Location
            </Button>
          </Tooltip>
          <Tooltip content="Group content by company/brand" variant="dark">
            <Button
              variant={viewMode === 'company' ? 'default' : 'outline'}
              className={viewMode === 'company' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:border-blue-300 hover:text-blue-600'}
              onClick={() => setViewMode('company')}
            >
              <Folder className="w-4 h-4 mr-2" />
              By Company
            </Button>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <Tooltip content="Show newest content first" variant="dark">
            <Button
              variant={sortOrder === 'newest' ? 'default' : 'outline'}
              className={sortOrder === 'newest' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300 hover:border-green-300 hover:text-green-600'}
              onClick={() => setSortOrder('newest')}
              size="sm"
            >
              <SortDesc className="w-4 h-4 mr-1" />
              Newest First
            </Button>
          </Tooltip>
          <Tooltip content="Show oldest content first" variant="dark">
            <Button
              variant={sortOrder === 'oldest' ? 'default' : 'outline'}
              className={sortOrder === 'oldest' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300 hover:border-green-300 hover:text-green-600'}
              onClick={() => setSortOrder('oldest')}
              size="sm"
            >
              <SortAsc className="w-4 h-4 mr-1" />
              Oldest First
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Content Display */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Content</h3>
            <p className="text-sm text-gray-600">
              {sortedContent.length} items • Sorted by {sortOrder === 'newest' ? 'newest' : 'oldest'} first
            </p>
          </div>

          {sortedContent.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">No content has been uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedContent.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Grouped View (existing functionality) */
      <div className="grid gap-6">
        {Object.entries(groupedContent).map(([primaryKey, secondaryGroups]) => (
          <Card key={primaryKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                {primaryKey}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(secondaryGroups).map(([secondaryKey, typeGroups]) => (
                  <div key={secondaryKey} className="border-l-2 border-gray-200 pl-4">
                    <h4 className="font-medium text-gray-700 mb-2">{secondaryKey}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(typeGroups).map(([type, items]) => (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            {getTypeIcon(type)}
                            {type} ({items.length})
                          </div>
                          <div className="space-y-1">
                            {items.map(item => (
                              <Tooltip
                                key={item.id}
                                content={`Click to view details for ${item.title}`}
                                variant="dark"
                                position="top"
                              >
                                <div
                                  className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                  onClick={() => setSelectedContent(item)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium truncate">{item.title}</div>
                                    <Tooltip content="Download this file" variant="dark">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(item.file_url, '_blank');
                                        }}
                                        className="ml-2 h-6 w-6 p-0"
                                      >
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </Tooltip>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatFileSize(item.file_size)}
                                  </div>
                                </div>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedContent.type)}
                  {selectedContent.title}
                </CardTitle>
                <Tooltip content="Close details">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                    onClick={() => setSelectedContent(null)}
                  >
                    ×
                  </Button>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Store:</strong> {selectedContent.stores.name}
                </div>
                <div>
                  <strong>Company:</strong> {selectedContent.stores.brand_company}
                </div>
                <div>
                  <strong>Type:</strong> {selectedContent.type}
                </div>
                <div>
                  <strong>Size:</strong> {formatFileSize(selectedContent.file_size)}
                </div>
                <div>
                  <strong>Start Date:</strong> {format(new Date(selectedContent.start_date), 'MMM dd, yyyy')}
                </div>
                <div>
                  <strong>End Date:</strong> {format(new Date(selectedContent.end_date), 'MMM dd, yyyy')}
                </div>
                <div>
                  <strong>Recurrence:</strong> {selectedContent.recurrence_type}
                </div>
                <div>
                  <strong>Uploaded:</strong> {format(new Date(selectedContent.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>

              {selectedContent.recurrence_days && selectedContent.recurrence_days.length > 0 && (
                <div>
                  <strong>Recurrence Days:</strong> {selectedContent.recurrence_days.join(', ')}
                </div>
              )}

              <div>
                <strong>Address:</strong> {selectedContent.stores.address}
              </div>

              <div className="flex gap-2 pt-4">
                <Tooltip content="Download this file" variant="dark">
                  <Button
                    variant="default"
                    onClick={() => window.open(selectedContent.file_url, '_blank')}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </Tooltip>
                <Tooltip content="Open file in new tab" variant="dark">
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedContent.file_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>

              {selectedContent.type === 'image' && (
                <div className="mt-4 relative">
                  <div className="relative w-full h-auto aspect-video">
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <NextImage
                        src={selectedContent.file_url}
                        alt={selectedContent.title}
                        fill
                        className="object-contain rounded"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedContent.type === 'video' && (
                <div className="mt-4">
                  <video
                    src={selectedContent.file_url}
                    controls
                    className="max-w-full h-auto rounded"
                  />
                </div>
              )}

              {selectedContent.type === 'music' && (
                <div className="mt-4">
                  <audio
                    src={selectedContent.file_url}
                    controls
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
