'use client';

import {useEffect, useRef} from 'react';
import NextImage from 'next/image';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Tooltip} from '@/components/ui/Tooltip';
import {Download, ExternalLink, FileText, Image, Music, Video,X} from 'lucide-react';
import {format} from 'date-fns';
import {ContentItem} from '@/types/content';

interface ContentDetailModalProps {
    item: ContentItem | null;
    onClose: () => void;
}

// These utilities are kept here to perfectly match the original component's implementation.
// For a larger app, they would live in a shared `utils` file.
const getTypeIcon = (type: string) => {
    switch (type) {
        case 'image':
            return <Image className="w-4 h-4"/>;
        case 'video':
            return <Video className="w-4 h-4"/>;
        case 'music':
            return <Music className="w-4 h-4"/>;
        default:
            return <FileText className="w-4 h-4"/>;
    }
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export function ContentDetailModal({item, onClose}: ContentDetailModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Effect to handle clicks outside the modal to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (item) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [item, onClose]);

    if (!item) {
        return null;
    }

    return (
        // Backdrop and positioning
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

            {/* The Modal Card itself - matching the original style */}
            <Card ref={modalRef} className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            {item.title}
                        </CardTitle>
                        <Tooltip content="Close details">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5"/>
                            </Button>
                        </Tooltip>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Section 1: Metadata Grid (Exact Replica) */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Store:</strong> {item.stores?.name || 'N/A'}</div>
                        <div><strong>Company:</strong> {item.stores?.brand_company || 'N/A'}</div>
                        <div><strong>Type:</strong> <span className="capitalize">{item.type}</span></div>
                        <div><strong>Size:</strong> {formatFileSize(item.file_size)}</div>
                        <div><strong>Start
                            Date:</strong> {item.start_date ? format(new Date(item.start_date), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                        <div><strong>End
                            Date:</strong> {item.end_date ? format(new Date(item.end_date), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                        <div><strong>Recurrence:</strong> {item.recurrence_type || 'N/A'}</div>
                        <div><strong>Uploaded:</strong> {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}</div>
                    </div>

                    {/* Section 2: Recurrence Days (Conditional) */}
                    {item.recurrence_days && item.recurrence_days.length > 0 && (
                        <div>
                            <strong>Recurrence Days:</strong> {item.recurrence_days.join(', ')}
                        </div>
                    )}

                    {/* Section 3: Address */}
                    <div>
                        <strong>Address:</strong> {item.stores?.address || 'N/A'}
                    </div>

                    {/* Section 4: Action Buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="default"
                            onClick={() => window.open(item.file_url, '_blank')}
                            className="flex-1"
                        >
                            <Download className="w-4 h-4 mr-2"/>
                            Download File
                        </Button>
                        <Tooltip content="Open file in new tab" variant="dark">
                            <Button
                                variant="outline"
                                onClick={() => window.open(item.file_url, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4"/>
                            </Button>
                        </Tooltip>
                    </div>

                    {/* Section 5: Media Preview (at the bottom) */}
                    {item.type === 'image' && (
                        <div className="mt-4 relative">
                            <div className="relative w-full h-auto" style={{aspectRatio: '16/9'}}>
                                <NextImage
                                    src={item.file_url}
                                    alt={item.title}
                                    fill
                                    className="object-contain rounded"
                                    sizes="(max-width: 640px) 90vw, 50vw"
                                />
                            </div>
                        </div>
                    )}
                    {item.type === 'video' && (
                        <div className="mt-4">
                            <video src={item.file_url} controls className="max-w-full h-auto rounded"/>
                        </div>
                    )}
                    {item.type === 'music' && (
                        <div className="mt-4">
                            <audio src={item.file_url} controls className="w-full"/>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}