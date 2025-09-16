import React, { useState, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, ZoomIn } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const mainImage = images[selectedImageIndex] || 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedImageIndex}
            src={mainImage}
            alt={`${productName} - Image ${selectedImageIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
        <button 
          onClick={() => setIsZoomModalOpen(true)}
          className="absolute top-3 right-3 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Agrandir l'image"
        >
          <Maximize className="h-5 w-5" />
        </button>

        {/* Hover Zoom (Magnifier) */}
        <AnimatePresence>
        {showZoom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-0 left-full ml-4 w-full h-full border bg-white hidden lg:block pointer-events-none"
            style={{
              backgroundImage: `url(${mainImage})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '200%',
            }}
          />
        )}
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                selectedImageIndex === index ? 'border-green-600' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      <Modal 
        isOpen={isZoomModalOpen} 
        onClose={() => setIsZoomModalOpen(false)} 
        title={productName}
        size="xl"
      >
        <img src={mainImage} alt={productName} className="w-full h-auto object-contain rounded-lg" />
      </Modal>
    </div>
  );
}
