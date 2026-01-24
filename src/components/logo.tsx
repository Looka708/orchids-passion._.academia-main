import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 32, height = 32, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Passion Academia Logo"
      width={width}
      height={height}
      className={cn("rounded-full", className)}
    />
  );
}
