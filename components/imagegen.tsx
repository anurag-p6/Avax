"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Image as ImageIcon, Download, Share2 } from "lucide-react"

export function ImageGen() {
  const [isReady, setIsReady] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState("")

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="h-full bg-[#1c1b22]">
      <div className="p-4 h-full flex flex-col">
        {/* <h2 className="text-xl font-semibold text-gray-200 mb-6 flex items-center">
         
          Mira AI Image Gen
        </h2> */}
        
        {/* Image area */}
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-solid border-[#3a3545] rounded-lg bg-[#14121a]/50 mb-4 overflow-hidden">
          {isGenerating ? (
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 shimmer"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Generating...</h3>
              <p className="text-sm text-gray-400">
                Creating your image with AI
              </p>
            </div>
          ) : (
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-[#2d2936] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-purple-400/50" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Ready to create
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                Enter a prompt below to generate content IP
              </p>
            </div>
          )}
        </div>


        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <motion.button
            className="w-full bg-gradient-to-r from-[#7b5cfa] to-[#9d5cfa] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium relative overflow-hidden border border-[#9d5cfa]/50 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            <span className="relative z-10">
              {isGenerating ? "Generating..." : "Mint IP"}
            </span>
          </motion.button>
          
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-[#2d2936] hover:bg-[#3a3545] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4" />
              <span>Save</span>
            </motion.button>
            <motion.button
              className="flex-1 bg-[#2d2936] hover:bg-[#3a3545] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isGenerating}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
