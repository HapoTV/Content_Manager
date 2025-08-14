import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Image, Video, Music, Upload, Folder, LucideProps } from 'lucide-react';
import { ContentItem, ContentType } from '@/types/content';

/**
 * A record mapping content types to their corresponding Lucide icon components.
 */
const iconMap: Record<ContentType, React.ElementType<LucideProps>> = {
    image: Image,
    video: Video,
    music: Music,
};

/**
 * Returns a React component for the given content type.
 * Allows for specifying a default icon for unknown types.
 *
 * @param type The type of content ('image', 'video', 'music').
 * @param options Configuration options for the icon.
 * @param options.defaultIcon The icon to use for unknown types. Defaults to 'folder'.
 * @param options.className Additional CSS classes to apply to the icon.
 * @returns A Lucide icon component.
 */
export const getTypeIcon = (
    type: string,
    options: { defaultIcon?: 'upload' | 'folder'; className?: string } = {}
): React.ReactNode => {
    const { defaultIcon = 'folder', className = 'w-4 h-4' } = options;

    const IconComponent = iconMap[type as ContentType];

    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    // Handle the default case
    switch (defaultIcon) {
        case 'upload':
            return <Upload className={className} />;
        case 'folder':
        default:
            return <Folder className={className} />;
    }
};


/**
 * Determines the status of a ContentItem based on its start and end dates
 * and returns a corresponding Badge component.
 *
 * @param item A ContentItem object, must include start_date and end_date.
 * @returns A Badge component indicating 'Active', 'Scheduled', 'Archived', or 'Status Unknown'.
 */
export const getStatusBadge = (item: Partial<ContentItem>): React.ReactNode => {
    if (!item.start_date || !item.end_date) {
        return <Badge variant="secondary">Status Unknown</Badge>;
    }

    const now = new Date();
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);

    // Check for invalid dates just in case
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return <Badge variant="secondary">Invalid Date</Badge>;
    }

    if (startDate > now) {
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Scheduled</Badge>;
    } else if (endDate < now) {
        return <Badge variant="secondary" className="text-gray-600">Archived</Badge>;
    } else {
        return <Badge variant="default" className="bg-green-600 text-white">Active</Badge>;
    }
};


/**
 * Formats a file size in bytes into a human-readable string (KB, MB, GB).
 *
 * @param bytes The file size in bytes.
 * @param decimals The number of decimal places to include. Defaults to 2.
 * @returns A formatted string like "1.23 MB".
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};