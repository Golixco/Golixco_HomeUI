import { motion } from 'motion/react';
import { ReactNode } from 'react';

export function RevealContainer({ 
  children, 
  className = '',
  viewportMargin = "-100px"
}: { 
  children: ReactNode; 
  className?: string;
  viewportMargin?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin as any }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.7, 
            ease: [0.22, 0.61, 0.36, 1] 
          } 
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
