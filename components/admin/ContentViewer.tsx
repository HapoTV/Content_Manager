// components/admin/ContentViewer.tsx
'use client';

import {useState, useEffect, useCallback, useMemo, useRef} from 'react'; // 1. Import useRef
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
import { fetchAllContent } from '@/app/actions/data-actions';
import {ContentDetailModal} from "@/components/content/ContentDetailModal";
import { getTypeIcon, getStatusBadge, formatFileSize } from '@/utils/contentUtils';

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
  const modalRef = useRef<HTMLDivElement>(null); // 2. Create a ref for the modal

  // 3. Add useEffect for handling outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setSelectedContent(null); // Close the modal
      }
    }

    // Bind the event listener
    if (selectedContent) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Unbind the event listener on clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedContent]); // Only re-run the effect if selectedContent changes


  const fetchContent = useCallback(async () => {
    try {
      const result = await fetchAllContent();

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
  }, [viewMode, sortOrder, content, groupContent]);

  const sortedContent = useMemo(() => {
    return [...content].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [content, sortOrder]);



  const ContentCard = ({ item }: { item: ContentItem }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer" onClick={() => setSelectedContent(item)}>
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
          <Badge variant="secondary" className="text-xs capitalize">
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
        /* --- MODIFIED Grouped View --- */
        <div className="space-y-6">
        {Object.entries(groupedContent).map(([primaryKey, secondaryGroups]) => (
          <Card key={primaryKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                {primaryKey}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(secondaryGroups).map(([secondaryKey, typeGroups]) => (
                  <div key={secondaryKey} className="border-l-2 border-gray-200 pl-4">
                      <h4 className="font-medium text-gray-800 mb-4">{secondaryKey}</h4>
                      <div className="space-y-6">
                      {Object.entries(typeGroups).map(([type, items]) => (
                          <div key={type}>
                            <div className="flex items-center gap-2 text-md font-semibold text-gray-800 mb-3">
                            {getTypeIcon(type)}
                              <span className="capitalize">{type}</span>
                              <Badge variant="secondary">{items.length}</Badge>
                          </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {items.map(item => (
                                <ContentCard key={item.id} item={item} />
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
      <ContentDetailModal
          item={selectedContent}
          onClose={() => setSelectedContent(null)}
      />
    </div>
  );
}
