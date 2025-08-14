'use client';

import NextImage from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { format } from 'date-fns';
import { CheckSquare, Square, ExternalLink, Video, Music } from 'lucide-react';

// --- Assuming these are now in a shared utils file ---
import { formatFileSize, getStatusBadge } from '@/utils/contentUtils';
import { ContentItem } from '@/types/content';

interface ContentCardProps {
    item: ContentItem;
    isSelected: boolean;
    onSelectItem: (id: string) => void;
    onViewDetails: (item: ContentItem) => void; // Function to open a detail modal
}

export function ContentCard({ item, isSelected, onSelectItem, onViewDetails }: ContentCardProps) {

    // Handler for the main card click to show details
    const handleCardClick = () => {
        onViewDetails(item);
    };

    // Handler for the selection icon click
    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the detail view from opening
        onSelectItem(item.id);
    };

    return (
        // --- UPDATED: Conditionally applies a prominent border and ring when selected ---
        <div
            className={`relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1' : 'border-gray-200'
            }`}
            onClick={handleCardClick}
        >
            {/* --- SELECTION CHECKBOX --- */}
            <div
                className="absolute top-2 left-2 z-20"
                onClick={handleSelectClick}
            >
                <Tooltip content={isSelected ? 'Deselect' : 'Select'} variant="dark">
                    {isSelected ? (
                        <CheckSquare className="w-6 h-6 text-white bg-blue-600 rounded-md p-0.5" />
                    ) : (
                        <Square className="w-6 h-6 text-gray-500 bg-white/70 backdrop-blur-sm rounded-md transition-colors group-hover:text-blue-600" />
                    )}
                </Tooltip>
            </div>


            {/* --- MEDIA PREVIEW (Unchanged from your version) --- */}
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {item.type === 'image' && (
                    <NextImage
                        src={item.file_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                )}
                {item.type === 'video' && (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                        <Video className="w-12 h-12 text-white opacity-70" />
                    </div>
                )}
                {item.type === 'music' && (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <Music className="w-12 h-12 text-white" />
                    </div>
                )}

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Tooltip content="View details" variant="dark">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 right-2 z-10">
                    {getStatusBadge(item)}
                </div>
            </div>

            {/* --- CARD CONTENT --- */}
            <div className="p-3">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
                    {item.title}
                </h3>
                <div className="space-y-1 text-xs text-gray-600">
                    <p className="font-medium truncate">{item.stores?.name ?? 'Unknown Store'}</p>
                    <p className="text-gray-500 truncate">{item.stores?.brand_company ?? 'Unknown Company'}</p>
                    <p className="text-gray-500">{formatFileSize(item.file_size)}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                    {item.profiles?.email && (
                        <span className="truncate" title={item.profiles.email}>
                           {item.profiles.email}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}