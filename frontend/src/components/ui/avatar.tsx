import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, children, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(!src);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#0F172A]',
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || ''}
            onError={() => setImageError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#F59E0B] text-[#0F1015] font-black">
            {fallback || children}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

const AvatarImage = ({
  className,
  src,
  alt = '',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src={src}
    alt={alt}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex h-full w-full items-center justify-center rounded-xl bg-[#F59E0B] text-[#0F1015] font-black',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
