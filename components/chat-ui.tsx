"use client"

import { useState, useRef } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ImageGen } from "./imagegen"
import ChatInput from "./chatinput"
import { ModelDropdown } from "./modeldropdown"
import { FileDropArea } from "./file-drop-area"

export function ChatUI() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [showFileDropArea, setShowFileDropArea] = useState(false)
  const modelButtonRef = useRef<HTMLDivElement>(null)
  const modelSelectorRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      // Handle message sending logic here
      console.log("Sending message:", message)
      // Add a delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={60} minSize={40}>
        <div className="flex flex-col h-full">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-3xl mx-auto">{/* Empty chat state - no messages yet */}</div>
          </div>

          {/* Use ChatInput component */}
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            selectedModel={selectedModel}
            setIsModelSelectorOpen={setIsModelSelectorOpen}
            isModelSelectorOpen={isModelSelectorOpen}
            setShowFileDropArea={setShowFileDropArea}
            modelButtonRef={modelButtonRef}
          />
        </div>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={40} minSize={30}>
        <ImageGen />
      </ResizablePanel>

      {/* Add the model dropdown */}
      {isModelSelectorOpen && (
        <ModelDropdown
          isOpen={isModelSelectorOpen}
          setIsOpen={setIsModelSelectorOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          modelSelectorRef={modelSelectorRef}
        />
      )}

      {/* Add file drop area when active */}
      {showFileDropArea && (
        <FileDropArea onClose={() => setShowFileDropArea(false)} />
      )}
    </ResizablePanelGroup>
  )
}