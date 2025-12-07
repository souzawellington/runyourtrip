import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface MobileCTAProps {
  text?: string;
  action?: () => void;
  href?: string;
  show?: boolean;
}

export function MobileCTA({ 
  text = "Monte sua viagem grátis", 
  action,
  href = "/marketplace",
  show = true 
}: MobileCTAProps) {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show on mobile devices
    const isMobile = window.innerWidth < 768;
    if (isMobile && show && !isDismissed) {
      // Show after a slight delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [show, isDismissed]);

  const handleClick = () => {
    if (action) {
      action();
    } else if (href) {
      setLocation(href);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    // Remember dismissal for this session
    sessionStorage.setItem('mobile-cta-dismissed', 'true');
  };

  useEffect(() => {
    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('mobile-cta-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-4 pb-safe"
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-4">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1">
              <p className="text-white font-medium text-sm">
                {text}
              </p>
              <p className="text-white/80 text-xs">
                Roteiros personalizados em segundos
              </p>
            </div>

            <Button
              onClick={handleClick}
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
            >
              Começar
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>

          {/* Animated pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-white/10"
            animate={{
              opacity: [0, 0.3, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sticky WhatsApp button for mobile
export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsApp = () => {
    const phone = '5541991619359'; // Replace with actual number
    const message = encodeURIComponent('Olá! Quero planejar uma viagem personalizada.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleWhatsApp}
          className="fixed bottom-20 right-4 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl md:hidden"
          aria-label="Falar no WhatsApp"
        >
          <svg
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}