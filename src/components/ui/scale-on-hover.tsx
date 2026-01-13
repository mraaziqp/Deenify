'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScaleOnHoverProps {
  children: React.ReactNode;
  className?: string;
}

export function ScaleOnHover({ children, className }: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={cn('cursor-pointer', className)}
    >
      {children}
    </motion.div>
  );
}
