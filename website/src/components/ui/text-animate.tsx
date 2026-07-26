'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TextAnimateProps {
  children: React.ReactNode;
  animation?: 'blurIn' | 'fadeIn' | 'slideUp';
  by?: 'word' | 'character' | 'line' | 'container';
  as?: React.ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  segmentClassName?: string;
}

export const TextAnimate: React.FC<TextAnimateProps> = ({
  children,
  animation = 'blurIn',
  by = 'container',
  as: Component = 'div',
  className = '',
  delay = 0,
  duration = 0.5,
  segmentClassName = '',
}) => {
  const text = typeof children === 'string' ? children : '';

  if (animation === 'blurIn') {
    const blurVariants: Variants = {
      hidden: {
        filter: 'blur(12px)',
        opacity: 0,
        y: 12,
      },
      visible: {
        filter: 'blur(0px)',
        opacity: 1,
        y: 0,
        transition: {
          duration: duration || 0.8,
          ease: [0.25, 0.4, 0.25, 1],
          delay,
        },
      },
    };

    return (
      <Component className={className}>
        <motion.span
          initial="hidden"
          animate="visible"
          variants={blurVariants}
          className="inline-block"
        >
          {children}
        </motion.span>
      </Component>
    );
  }

  if (animation === 'fadeIn' && by === 'line' && text) {
    const lines = text.split('\n').filter(Boolean);

    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.18,
          delayChildren: delay || 0.2,
        },
      },
    };

    const lineVariants: Variants = {
      hidden: {
        opacity: 0,
        y: 15,
        filter: 'blur(4px)',
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.6,
          ease: [0.215, 0.61, 0.355, 1],
        },
      },
    };

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={className}
      >
        {lines.map((line, index) => (
          <motion.span
            key={index}
            variants={lineVariants}
            className={`block ${segmentClassName}`}
          >
            {line}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  // Fallback / default container animate
  return (
    <Component className={className}>
      <motion.span
        initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, delay }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </Component>
  );
};
