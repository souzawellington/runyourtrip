import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface TemplateGridAnimationsProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function TemplateGridContainer({ children, isLoading }: TemplateGridAnimationsProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingGrid key="loading" />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingGrid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Image Skeleton */}
          <div className="h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: [-300, 300] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
          
          {/* Content Skeleton */}
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded-lg mb-3 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: [-200, 200] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.2 }}
              />
            </div>
            
            <div className="h-4 bg-gray-200 rounded mb-2 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: [-200, 200] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.4 }}
              />
            </div>
            
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: [-150, 150] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.6 }}
              />
            </div>

            {/* Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: [-100, 100] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.8 }}
                />
              </div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: [-100, 100] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 1 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface StaggeredAnimationProps {
  children: ReactNode[];
  staggerDelay?: number;
}

export function StaggeredAnimation({ children, staggerDelay = 0.1 }: StaggeredAnimationProps) {
  return (
    <>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{
            duration: 0.5,
            delay: index * staggerDelay,
            ease: [0.4, 0, 0.2, 1]
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
}

export function FloatingElement({ children, delay = 0 }: FloatingElementProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-5, 5, -5] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
}

interface PulseAnimationProps {
  children: ReactNode;
  scale?: [number, number];
  duration?: number;
}

export function PulseAnimation({ children, scale = [1, 1.05], duration = 2 }: PulseAnimationProps) {
  return (
    <motion.div
      animate={{ scale }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
}

export function SlideIn({ children, direction = "up", delay = 0 }: SlideInProps) {
  const directionMap = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: 50 },
    down: { x: 0, y: -50 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  duration?: number;
}

export function HoverScale({ children, scale = 1.05, duration = 0.2 }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}