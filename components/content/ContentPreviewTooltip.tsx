// components/content/ContentPreviewTooltip.tsx
import NextImage from 'next/image';
import { Music, Video } from 'lucide-react';
import { ContentItem } from '@/types/content'; // Import the shared type

interface Props {
    item: ContentItem;
}

export function ContentPreviewTooltip({ item }: Props) {
    // A consistent container for the preview
    const PreviewContainer = ({ children }: { children: React.ReactNode }) => (
        <div className="w-48 h-auto bg-gray-800 rounded-md overflow-hidden shadow-xl">
            {children}
        </div>
    );

    switch (item.type) {
        case 'image':
            return (
                <PreviewContainer>
                    <div className="relative aspect-video">
                        <NextImage
                            src={item.file_url}
                            alt={`Preview of ${item.title}`}
                            fill
                            className="object-cover"
                            sizes="12rem"
                        />
                    </div>
                </PreviewContainer>
            );
        case 'video':
            return (
                <PreviewContainer>
                    <div className="relative aspect-video w-full h-full flex items-center justify-center">
                        <video
                            src={item.file_url}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                        />
                        {/* Overlay to show a video icon, as autoplay might be blocked */}
                        <Video className="w-8 h-8 text-white/70 z-10" />
                    </div>
                </PreviewContainer>
            );
        case 'music':
            return (
                <div className="p-2 w-48 bg-gray-900 rounded-md">
                    <div className='flex items-center gap-2 mb-2'>
                        <Music className="w-4 h-4 text-purple-300" />
                        <p className="text-white text-sm font-semibold line-clamp-1">{item.title}</p>
                    </div>
                    <audio src={item.file_url} controls className="w-full h-8" />
                </div>
            );
        default:
            return <div className="p-2">No preview available.</div>;
    }
}