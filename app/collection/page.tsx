"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';

interface CollectionItem {
  id: string;
  type: 'image' | 'chat';
  title: string;
  thumbnail?: string;
  createdAt: Date;
  model: string;
  prompt?: string;
  height?: number; // For masonry layout
}

// Mock data with random heights for masonry effect
const mockCollectionItems: CollectionItem[] = [
  {
    id: '1',
    type: 'image',
    title: 'Sunset over mountains',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600',
    createdAt: new Date('2024-01-15'),
    model: 'Stable Diffusion XL',
    prompt: 'A beautiful sunset over mountains with purple sky',
    height: 300
  },
  {
    id: '2',
    type: 'image',
    title: 'Futuristic city',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500',
    createdAt: new Date('2024-01-13'),
    model: 'FLUX.1-dev',
    prompt: 'A futuristic cyberpunk city at night with neon lights',
    height: 250
  },
  {
    id: '3',
    type: 'image',
    title: 'Abstract art',
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=700',
    createdAt: new Date('2024-01-12'),
    model: 'Stable Diffusion XL',
    height: 350
  },
  {
    id: '4',
    type: 'image',
    title: 'Nature scene',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=450',
    createdAt: new Date('2024-01-11'),
    model: 'FLUX.1-dev',
    height: 280
  },
  {
    id: '5',
    type: 'image',
    title: 'Portrait',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600',
    createdAt: new Date('2024-01-10'),
    model: 'Stable Diffusion XL',
    height: 320
  },
  {
    id: '6',
    type: 'image',
    title: 'Architecture',
    thumbnail: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=550',
    createdAt: new Date('2024-01-09'),
    model: 'FLUX.1-dev',
    height: 290
  }
];

export default function CollectionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter only image items
  const imageItems = mockCollectionItems.filter(item => 
    item.type === 'image' && 
    item.thumbnail &&
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#1a1625]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1a1625]">
        {/* Header - shifted right */}
        <div className="border-b border-[#2d2936] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <motion.button
                className="mr-4 p-2 rounded-lg hover:bg-[#2d2936] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-semibold text-white">Collection</h1>
                <p className="text-gray-400 text-sm mt-1">Your generated images</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-[#2d2936] border border-[#3a3545] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Masonry Grid Content */}
        <div className="flex-1 overflow-auto p-6">
          {imageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#2d2936] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-purple-400/50" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No images found</h3>
              <p className="text-gray-400">Your generated images will appear here.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {imageItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="break-inside-avoid mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative group cursor-pointer overflow-hidden rounded-lg bg-[#2d2936] border border-[#3a3545] hover:border-purple-400/50 transition-all">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-auto object-cover"
                      style={{ height: 'auto' }}
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
                      <div className="p-3 w-full">
                        <h3 className="text-white text-sm font-medium mb-1 truncate">{item.title}</h3>
                        <p className="text-gray-300 text-xs">{item.model}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
