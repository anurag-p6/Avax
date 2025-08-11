"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Image as ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import CopyButton from '@/components/CopyButton';
import WalletButton from '@/components/walletbutton';
import { useAuthState } from "@campnetwork/origin/react";

// Simple file interface matching Pinata response
interface PinataFile {
  id: string;
  name: string;
  cid: string;
  size: number;
  number_of_files: number;
  mime_type: string;
  group_id: string | null;
  created_at: string;
}

// Simple image item component
const ImageItem = ({ item }: { item: PinataFile }) => {
  const imageUrl = `https://gateway.pinata.cloud/ipfs/${item.cid}`;
  const datePinned = new Date(item.created_at).toLocaleDateString();

  return (
    <motion.div
      key={item.id}
      className="break-inside-avoid mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative group cursor-pointer overflow-hidden rounded-lg bg-[#2d2936] border border-[#3a3545] hover:border-purple-400/50 transition-all w-full h-auto">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-auto object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
        
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
          <div>
            <h3 className="text-white text-sm font-medium mb-2 truncate">{item.name}</h3>
          </div>
          
          <div className="mt-auto">
            <p className="text-purple-300 text-xs mb-2">
              Size: {(item.size / 1024).toFixed(2)} KB
            </p>
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-xs">{datePinned}</p>
              <div className="flex items-center space-x-1">
                <CopyButton value={item.cid} />
                <motion.a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md hover:bg-[#3a3545]/50"
                  whileTap={{ scale: 0.9 }}
                >
                  <ExternalLink className="h-3 w-3 text-white" />
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main component
function CollectionPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [items, setItems] = useState<PinataFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated } = useAuthState();
  
  // Fetch function - sample data
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sample data structure
      const sampleData = {
        files: [
          {
            id: "01989a1c-73a8-78e7-bbe2-261503c4d047",
            name: "generated-image-1754932210607.png",
            cid: "bafkreihkte25hw4xchfilsmnm462ul33q3erbtsrizwbhig6qwcnalauke",
            size: 22394,
            number_of_files: 1,
            mime_type: "image/webp",
            group_id: null,
            created_at: "2025-08-11T17:10:12.979556Z"
          },
          {
            id: "019899d7-6c40-780f-9231-db2d7a9c03e6",
            name: "generated-image-1754927686636.png",
            cid: "bafkreicp3cbwydwknh2xvowpn7yjb3vij2wojg74a7tktfvmvquooboq4i",
            size: 31144,
            number_of_files: 1,
            mime_type: "image/webp",
            group_id: null,
            created_at: "2025-08-11T15:54:49.078202Z"
          }
        ],
        next_page_token: "MjAyNS0wOC0xMVQxNTo1NDo0OS4wNzgyMDIrMDA6MDB8MDE5ODk5ZDctNmM0MC03ODBmLTkyMzEtZGIyZDdhOWMwM2U2"
      };
      
      setItems(sampleData.files);
      
      // Uncomment if you want to use API instead of sample data
      /*
      const response = await fetch('/api/pinata-files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data?.files) {
        setItems(data.files);
      } else {
        setError({message: 'No files found'});
      }
      */
    } catch (err) {
      console.error("Error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch files when authenticated
  useEffect(() => {
    if (authenticated) {
      fetchFiles();
    }
  }, [authenticated]);

  // Simple search filter
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex h-screen bg-[#1a1625]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-[#2d2936] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <motion.button
                className="mr-4 p-2 rounded-lg hover:bg-[#2d2936]"
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-semibold text-white">IPFS Collection</h1>
                <p className="text-gray-400 text-sm mt-1">Files stored on Pinata IPFS</p>
              </div>
            </div>
            
            {authenticated && (
              <motion.button
                className="p-2 rounded-lg hover:bg-[#2d2936]"
                whileTap={{ scale: 0.95 }}
                onClick={fetchFiles}
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 text-white ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            )}
          </div>

          {authenticated && (
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#2d2936] border border-[#3a3545] rounded-lg text-white"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {!authenticated ? (
            <div className="flex flex-col items-center justify-center gap-4 my-10 text-white">
              <h2 className="text-xl font-semibold">Sign in to view your collection</h2>
              <p className="text-gray-400 mb-6">Connect your wallet to see your IPFS files</p>
              <div className="w-48">
                <WalletButton />
              </div>
            </div>
          ) : filteredItems.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#2d2936] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-purple-400/50" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No IPFS files found</h3>
              <p className="text-gray-400">
                No files to display.
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
              {filteredItems.map((item) => (
                <ImageItem key={item.id} item={item} />
              ))}
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
          
          {authenticated && error && (
            <div className="text-center py-4">
              <p className="text-red-400 mb-3">
                Error: {error.message || String(error)}
              </p>
              <button
                onClick={fetchFiles}
                disabled={loading}
                className="px-4 py-2 bg-[#2d2936] hover:bg-[#3a3545] text-white rounded-md text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return <CollectionPageContent />;
}


