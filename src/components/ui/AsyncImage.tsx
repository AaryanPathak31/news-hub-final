import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff, Loader2 } from 'lucide-react';

interface AsyncImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    fallbackSrc?: string;
    category?: string;
    className?: string;
}

// STRICT Category-specific fallbacks - NO EARTH
const FALLBACKS: Record<string, string> = {
    'world': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48bc6a?w=800&h=400&fit=crop', // World Map
    'india': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=400&fit=crop', // India Gate 
    'tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',  // Circuit
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
    'business': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop', // Stock
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop', // Stadium
    'entertainment': 'https://images.unsplash.com/photo-1470229722913-5f4c0a8e0c4b?w=800&h=400&fit=crop', // Concert
    'health': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=400&fit=crop', // Medical
    'politics': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48bc6a?w=800&h=400&fit=crop', // Politics
    'default': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=400&fit=crop' // Abstract Blue News (NOT EARTH)
};

export function AsyncImage({ src, alt, fallbackSrc, category = 'default', className, ...props }: AsyncImageProps) {
    const [currentSrc, setCurrentSrc] = useState<string>(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const retryCount = useRef(0);

    // INCREASED RETRIES for Pollinations latency
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 2500; // 2.5 seconds wait

    // Reset state when prop src changes
    useEffect(() => {
        setCurrentSrc(src);
        setIsLoading(true);
        setHasError(false);
        setIsRetrying(false);
        retryCount.current = 0;
    }, [src]);

    const handleError = () => {
        // If it's a Pollinations URL, retry aggressively
        if (retryCount.current < MAX_RETRIES) {
            retryCount.current++;
            setIsRetrying(true);

            console.log(`[AsyncImage] Retry ${retryCount.current}/${MAX_RETRIES} for ${src}`);

            setTimeout(() => {
                // Cache bust to force browser to try fetching again
                const separator = src.includes('?') ? '&' : '?';
                setCurrentSrc(`${src}${separator}retry=${Date.now()}`);
            }, RETRY_DELAY);

        } else {
            // Retries exhausted
            console.warn('Max retries reached. Switching to Category Fallback.');
            setIsRetrying(false);
            setHasError(true);
            setIsLoading(false);

            // Select appropriate fallback
            const catKey = (category || 'default').toLowerCase();
            const fallback = FALLBACKS[catKey] || FALLBACKS['default'];
            setCurrentSrc(fallback);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
        setIsRetrying(false);
        setHasError(false);
    };

    return (
        <div className={cn("relative overflow-hidden bg-muted", className)}>
            <img
                {...props}
                src={currentSrc}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-all duration-700",
                    (isLoading || isRetrying) ? "opacity-0" : "opacity-100",
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
            />

            {/* Loading State Overlay */}
            {(isLoading || isRetrying) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80 backdrop-blur-sm z-10 transition-opacity duration-300">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    {isRetrying && (
                        <span className="text-xs text-muted-foreground animate-pulse font-mono">
                            Generating AI Image... ({retryCount.current}/{MAX_RETRIES})
                        </span>
                    )}
                </div>
            )}

            {/* Error State */}
            {hasError && !currentSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground">
                    <ImageOff className="h-8 w-8 opacity-50" />
                </div>
            )}
        </div>
    );
}
