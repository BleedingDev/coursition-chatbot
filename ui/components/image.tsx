import type { Experimental_GeneratedImage } from 'ai';
import { cn } from '@/lib/utils';

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({
  base64,
  uint8Array,
  mediaType,
  ...props
}: ImageProps) => (
  // biome-ignore lint/performance/noImgElement: This is a Vite project, not Next.js
  <img
    {...props}
    alt={props.alt || 'Generated image'}
    className={cn(
      'h-auto max-w-full overflow-hidden rounded-md',
      props.className
    )}
    height={props.height || 400}
    src={`data:${mediaType};base64,${base64}`}
    width={props.width || 400}
  />
);
