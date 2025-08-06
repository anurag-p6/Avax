"use client"

import { useState, useRef, useEffect } from "react"
import { ImageGen } from "./imagegen"
import ChatInput from "./chatinput"
import { ModelDropdown } from "./modeldropdown"
import { FileDropArea } from "./file-drop-area"
import ChatBox from "./chatbox"
import { updateModelProvider } from "@/chat/provider"

// Define message types
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Interface for the shared image generation state
interface ImageGenState {
  prompt: string;
  isGenerating: boolean;
  imageUrl: string | null;
}

export function ChatUI() {
  // Existing state
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [showFileDropArea, setShowFileDropArea] = useState(false)
  
  // Image generation state (shared with ImageGen component)
  const [imageGenState, setImageGenState] = useState<ImageGenState>({
    prompt: "",
    isGenerating: false,
    imageUrl: null,
  })
  
  const modelButtonRef = useRef<HTMLDivElement>(null)
  const modelSelectorRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle model change
  const handleModelChange = (modelName: string) => {
    // Update local state
    setSelectedModel(modelName);
    // Update provider with the new model
    updateModelProvider(modelName);
  };

  // Function to generate image based on prompt
  const generateImage = async (prompt: string) => {
    try {
      console.log('Starting image generation with prompt:', prompt);
      setImageGenState(prev => ({ ...prev, isGenerating: true, prompt }));
      
      // Determine if the selected model is an image generation model
      const isImageModel = selectedModel === "Stable-diffusion-xl-base-1.0";
      const modelToUse = isImageModel ? selectedModel : "default";
      
      console.log('Making API request to /api/generate-image');
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt.trim(), 
          steps: 5,
          model: modelToUse
        }),
      });
      
      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error text:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', { success: data.success, hasImageUrl: !!data.imageUrl, error: data.error });
      
      if (data.success && data.imageUrl) {
        setImageGenState({
          prompt,
          isGenerating: false,
          imageUrl: data.imageUrl,
        });
        
        return data.imageUrl;
      } else {
        throw new Error(data.error || data.details || "Failed to generate image - no error details");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      setImageGenState(prev => ({ ...prev, isGenerating: false }));
      
      // Show more specific error to user
      const errorMessage = error.message || "Unknown error occurred";
      alert(`Image generation failed: ${errorMessage}`);
      
      return null;
    }
  };

  // Function to handle image prompt from ChatInput
  const handleImagePrompt = (prompt: string) => {
    setImageGenState(prev => ({ ...prev, prompt }));
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: message }])
    setIsLoading(true)

    try {
      // Check if this is an image generation request
      if (message.toLowerCase().includes("generate image") || 
          message.toLowerCase().includes("create image") || 
          message.toLowerCase().includes("draw") || 
          message.toLowerCase().startsWith("image of")) {
        
        // Extract the image description
        let imagePrompt = message;
        
        if (message.toLowerCase().includes("generate image of")) {
          imagePrompt = message.split("generate image of")[1].trim();
        } else if (message.toLowerCase().includes("create image of")) {
          imagePrompt = message.split("create image of")[1].trim();
        } else if (message.toLowerCase().includes("draw")) {
          imagePrompt = message.split("draw")[1].trim();
        } else if (message.toLowerCase().startsWith("image of")) {
          imagePrompt = message.substring("image of".length).trim();
        }
        
        // Generate the image
        const imageUrl = await generateImage(imagePrompt);
        
        // Add AI response with image information
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: imageUrl 
              ? `I've generated this image for you: "${imagePrompt}"`
              : `I'm sorry, I couldn't generate an image based on "${imagePrompt}". Please try again with a different description.`
          }
        ]);
      } else {
        // Handle regular text message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add assistant response
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: `I'm responding to your message: "${message}"\n\nThis is a simulated response from the ${selectedModel} model.`
          }
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Panel */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col h-full">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full mt-20 text-center">
                  <h1 className="text-xl font-medium text-gray-400 mb-4">No messages yet</h1>
                  <p className="text-sm text-gray-500">Start a conversation by sending a message below</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <ChatBox 
                    key={index}
                    message={msg.content}
                    role={msg.role}
                    isLast={index === messages.length - 1}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
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
            onImagePrompt={handleImagePrompt}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-border" />

      {/* Image Panel */}
      <div className="w-96 min-w-80">
        <ImageGen
          state={imageGenState}
          setState={setImageGenState}
          onGenerateImage={generateImage}
          selectedModel={selectedModel}
        />
      </div>

      {/* Render ModelDropdown only when isModelSelectorOpen is true */}
      {isModelSelectorOpen && (
        <ModelDropdown
          isOpen={isModelSelectorOpen}
          setIsOpen={setIsModelSelectorOpen}
          selectedModel={selectedModel}
          setSelectedModel={handleModelChange}  // Use our new handler that updates both state and provider
          modelSelectorRef={modelSelectorRef}
        />
      )}

      {/* Render FileDropArea only when showFileDropArea is true */}
      {showFileDropArea && (
        <FileDropArea onClose={() => setShowFileDropArea(false)} />
      )}
    </div>
  )
}