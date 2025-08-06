"use client"

import React, { useState, useEffect, useRef } from "react"
import { Sun, Settings, PanelLeft } from "lucide-react"
import Image from "next/image"
import Sidebar from "@/components/sidebar"
import { ModelDropdown } from "@/components/modeldropdown"
import { FileDropArea } from "@/components/file-drop-area"
import SplashScreen from "@/components/SplashScreen"
import { AnimatePresence } from "framer-motion"
import { Analytics } from "@vercel/analytics/next"
import { ChatUI } from "@/components/chat-ui"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("Google Gemma 3n")
  const [showFileDropArea, setShowFileDropArea] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const modelSelectorRef = useRef<HTMLDivElement>(null!)
  const modelButtonRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    setMounted(true)

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelSelectorRef.current &&
        modelButtonRef.current &&
        !modelSelectorRef.current.contains(event.target as Node) &&
        !modelButtonRef.current.contains(event.target as Node)
      ) {
        setIsModelSelectorOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFileDropAreaClose = () => setShowFileDropArea(false)
  const handleSplashFinish = () => setShowSplash(false)

  if (!mounted) return null

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </AnimatePresence>
      
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col relative">
          {sidebarCollapsed && (
            <button
              className="absolute top-6 left-6 z-50 text-foreground bg-card p-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Image src="/images/agentzk-logo.png" alt="Logo" width={28} height={28} />
              <PanelLeft size={18} />
            </button>
          )}

          

          <ChatUI />

          <ModelDropdown
            isOpen={isModelSelectorOpen}
            setIsOpen={setIsModelSelectorOpen}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            modelSelectorRef={modelSelectorRef}
          />

          {showFileDropArea && <FileDropArea onClose={handleFileDropAreaClose} />}
          <Analytics />
        </div>
      </div>
    </>
  )
}
