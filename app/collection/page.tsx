"use client"

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { ApolloClient, InMemoryCache, gql, ApolloProvider, useQuery } from "@apollo/client";
import { useWallet } from "@getpara/react-sdk";
import { useAuthState, useModal } from "@campnetwork/origin/react";
import { CONTRACT_ADDRESS, truncate } from "@/utils/utils";
import CopyButton from '@/components/CopyButton';

// GraphQL query for fetching NFTs
const QUERY = gql`
  query ipNFTs($first: Int!, $skip: Int!) {
    ipNFTs(
      first: $first
      skip: $skip
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      tokenId
      tokenURI
      attributes
      name
      description
      backgroundColor
      image
      parentId
      creator {
        id
      }
    }
  }
`;

// Initialize Apollo Client
const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://api.thegraph.com/subgraphs/name/campnetwork/ipnft",
  cache: new InMemoryCache(),
});

interface NFTItem {
  id: string;
  tokenId: string;
  tokenURI: string;
  name: string;
  description?: string;
  image: string;
  creator?: {
    id: string;
  };
}

// Image item component
const ImageItem = ({ item }: { item: NFTItem }) => {
  const [imgSrc, setImgSrc] = useState(item.image);
  const [imgName, setImgName] = useState(item.name);

  useEffect(() => {
    if (!item.image || !item.name) {
      fetch(item.tokenURI)
        .then((response) => response.json())
        .then((data) => {
          if (data.image) {
            setImgSrc(data.image);
          }
          if (data.name) {
            setImgName(data.name);
          }
        })
        .catch((error) => {
          console.error("Error fetching token URI:", error);
        });
    }
  }, [item]);

  // Simple external link button component
  const OpenExternalLink = ({ url }: { url: string }) => {
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 rounded-md hover:bg-[#3a3545]/50 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="View on explorer"
        title="View on explorer"
      >
        <ExternalLink className="h-3 w-3 text-white" />
      </motion.a>
    );
  };

  return (
    <motion.div
      key={item.id}
      className="break-inside-avoid mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative group cursor-pointer overflow-hidden rounded-lg bg-[#2d2936] border border-[#3a3545] hover:border-purple-400/50 transition-all w-full h-auto">
        <img
          src={imgSrc}
          alt={imgName}
          className="w-full h-auto object-cover"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
          <div className="p-3 w-full">
            <h3 className="text-white text-sm font-medium mb-1 truncate">{imgName}</h3>
            <div className="flex justify-between items-center">
              <p className="text-gray-300 text-xs">
                {item.creator && truncate(item.creator.id, 4, 3)}
              </p>
              <div className="flex items-center space-x-1">
                {item.creator && <CopyButton value={item.creator.id} />}
                <OpenExternalLink 
                  url={`https://basecamp.cloud.blockscout.com/token/${CONTRACT_ADDRESS}/instance/${item.tokenId}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Collection page component that uses Apollo Query hook
function CollectionPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { data: wallet } = useWallet();
  const { authenticated } = useAuthState();
  const [items, setItems] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const fetchingRef = useRef(false);
  const BATCH_SIZE = 10;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModal();

  // Use Apollo useQuery hook directly instead of client.query
  const fetchItems = async (reset = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const currentSkip = reset ? 0 : skip;
      const { data } = await client.query({
        query: QUERY,
        variables: { first: BATCH_SIZE, skip: currentSkip },
        fetchPolicy: "network-only",
      });
      
      if (reset) {
        setItems(data.ipNFTs);
        setSkip(BATCH_SIZE);
        setHasMore(data.ipNFTs.length === BATCH_SIZE);
      } else {
        setItems((prev: any[]) => {
          const ids = new Set(prev.map((i) => i.id));
          const filtered = data.ipNFTs.filter((i: any) => !ids.has(i.id));
          return [...prev, ...filtered];
        });
        setSkip((prev) => prev + BATCH_SIZE);
        setHasMore(data.ipNFTs.length === BATCH_SIZE);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchItems(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.address, authenticated]);

  useEffect(() => {
    const el = scrollRef.current;
    if (
      el &&
      hasMore &&
      !loading &&
      items.length > 0 &&
      el.scrollHeight <= el.clientHeight
    ) {
      fetchItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, hasMore, loading]);

  useEffect(() => {
    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el || loading || !hasMore) return;
      const scrollable = el.scrollHeight - el.clientHeight;
      const scrolled = el.scrollTop;
      if (scrollable - scrolled < 200) {
        fetchItems();
      }
    };
    
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
    }
    
    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore]);

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#1a1625]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
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
                <p className="text-gray-400 text-sm mt-1">Your NFT collection</p>
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

        {/* Content Area with Infinite Scroll */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-auto p-6"
        >
          {!wallet?.address || !authenticated ? (
            <div className="flex flex-col items-center justify-center gap-4 my-10 text-white">
              <h2 className="text-xl font-semibold">Sign in to view your collection</h2>
              <p className="text-gray-400">Connect your wallet to see your NFTs</p>
              <motion.button
                className="w-48 bg-[#2d2936] hover:bg-[#3a3545] text-white rounded-md py-2 font-medium flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal()}
              >
                <span className="text-sm">Connect Wallet</span>
              </motion.button>
            </div>
          ) : filteredItems.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#2d2936] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-purple-400/50" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No images found</h3>
              <p className="text-gray-400">Your NFT images will appear here.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
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
          
          {error && (
            <div className="text-center text-red-400 py-4">
              Error loading data: {error.message || String(error)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap the main component with ApolloProvider
export default function CollectionPage() {
  return (
    <ApolloProvider client={client}>
      <CollectionPageContent />
    </ApolloProvider>
  );
}
