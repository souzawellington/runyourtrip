import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Download, 
  Heart, 
  Star, 
  DollarSign, 
  Zap, 
  ExternalLink,
  Play,
  X
} from "lucide-react";

interface AnimatedTemplateCardProps {
  template: any;
  onPurchase?: (template: any) => void;
  onPreview?: (template: any) => void;
}

export default function AnimatedTemplateCard({ template, onPurchase, onPreview }: AnimatedTemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${template.name} ${isLiked ? "removed from" : "added to"} your favorites.`,
    });
  };

  const handlePreview = () => {
    setShowPreview(true);
    onPreview?.(template);
  };

  const handlePurchase = () => {
    onPurchase?.(template);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative cursor-pointer"
        onClick={(e) => {
          // Prevent any default navigation
          e.preventDefault();
          e.stopPropagation();
          // Open preview modal instead
          handlePreview();
        }}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-gray-100">
          {/* Template Image Container */}
          <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            {template.imageUrl ? (
              <motion.img
                src={template.imageUrl}
                alt={template.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ) : (
              <motion.div
                className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-white text-4xl font-bold"
                >
                  {template.name?.charAt(0) || 'T'}
                </motion.div>
              </motion.div>
            )}

            {/* Overlay with actions */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview();
                      }}
                      className="bg-white/90 hover:bg-white text-black shadow-lg"
                    >
                      <Eye size={16} className="mr-2" />
                      Preview
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -180 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase();
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Download size={16} className="mr-2" />
                      Buy ${template.price || '29'}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category Badge */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute top-4 left-4"
            >
              <Badge className="bg-white/90 text-gray-800 shadow-md">
                {template.category?.name || 'Template'}
              </Badge>
            </motion.div>

            {/* Like Button */}
            <motion.button
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                size={16}
                className={`${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'} transition-colors`}
              />
            </motion.button>

            {/* Status Badge */}
            {template.status === 'live' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="absolute bottom-4 right-4"
              >
                <Badge className="bg-green-500 text-white shadow-md">
                  <Zap size={12} className="mr-1" />
                  Live
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Card Content */}
          <CardContent className="p-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {template.name || 'Untitled Template'}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description || 'Professional template for your business needs'}
              </p>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {template.views || Math.floor(Math.random() * 1000) + 100}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download size={14} />
                    {template.downloads || Math.floor(Math.random() * 50) + 10}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-current text-yellow-400" />
                    {((template.rating ? Number(template.rating) : 0) || (Math.random() * 2 + 3)).toFixed(1)}
                  </span>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 font-semibold text-green-600"
                >
                  <DollarSign size={16} />
                  {template.price || '29'}
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Play size={14} className="mr-2" />
                  Preview
                </Button>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    onClick={handlePurchase}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Download size={14} className="mr-2" />
                    Buy Now
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Floating action hint */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full shadow-lg"
            >
              Click to explore ✨
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-bold">{template.name}</h3>
                  <p className="text-gray-600 text-sm">{template.category?.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="rounded-full p-2"
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Preview Image/Content */}
                <div className="h-96 rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                  {template.imageUrl ? (
                    <img
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-6xl font-bold mb-4">{template.name?.charAt(0) || 'T'}</div>
                        <p className="text-lg opacity-80">Template Preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {template.description || 'This is a professional template designed to help you create stunning websites with ease. Features modern design principles and responsive layouts.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Responsive Design
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Modern UI Components
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Easy Customization
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        SEO Optimized
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open('#', '_blank')}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Live Preview
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => {
                      setShowPreview(false);
                      handlePurchase();
                    }}
                  >
                    <Download size={16} className="mr-2" />
                    Buy for ${template.price || '29'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}