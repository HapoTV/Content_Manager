'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {cn} from '@/lib/utils';

// You can keep the TooltipProvider here or wrap your layout in it once.
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;


// --- FIX 1: Define custom props for our enhanced TooltipContent ---
// This allows us to accept the 'variant' prop in addition to all standard props.
interface CustomTooltipContentProps
    extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
    variant?: 'dark' | 'light';
}


// --- FIX 2: Update TooltipContent to handle the 'variant' prop ---
export const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    CustomTooltipContentProps // Use our custom props interface
>(({className, sideOffset = 4, variant = 'dark', ...props}, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            // Base styles for ALL variants
            'z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs font-medium animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',

            // Conditional styles based on the 'variant' prop
            variant === 'dark' && 'bg-gray-900 text-primary-foreground',
            variant === 'light' && 'bg-white text-secondary-foreground border shadow-md',

            // This allows for any additional custom classes to be passed in
            className
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;


// --- YOUR NEW REUSABLE TOOLTIP COMPONENT ---

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    variant?: 'dark' | 'light';
}

export function Tooltip({
                            content,
                            children,
                            position = 'top',
                            className,
                            variant = 'dark',
                        }: TooltipProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <TooltipRoot>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                side={position}
                className={className}
                variant={variant}>
                    <p>{content}</p>
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
}