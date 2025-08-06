import { InferenceClient } from "@huggingface/inference";
import { NextRequest, NextResponse } from 'next/server';

// Initialize the HuggingFace client
const client = new InferenceClient(process.env.HF_TOKEN);

// Map of image generation models
const imageModels = {
  "Stable-diffusion-xl-base-1.0": "stabilityai/stable-diffusion-xl-base-1.0",
  "default": "stabilityai/stable-diffusion-xl-base-1.0" // Use stable diffusion as default
};

export async function POST(req: NextRequest) {
  try {
    console.log('API route called');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const { prompt, steps = 5, model = "default" } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      console.log('Invalid prompt:', prompt);
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    if (!process.env.HF_TOKEN) {
      console.log('HF_TOKEN not found');
      return NextResponse.json({ error: 'HF_TOKEN not configured' }, { status: 500 });
    }
    
    console.log('Generating image with prompt:', prompt);
    console.log('Using model:', model);
    console.log('HF_TOKEN available:', !!process.env.HF_TOKEN);
    
    // Select the appropriate image model
    const selectedModel = imageModels[model] || imageModels.default;
    console.log('Selected model:', selectedModel);
    
    try {
      // Call the HuggingFace API to generate an image
      console.log('Calling HuggingFace API...');
      const imageBlob = await client.textToImage({
        provider: "auto",
        model: selectedModel,
        inputs: prompt,
        parameters: { 
          num_inference_steps: steps,
          guidance_scale: 7.5,
          width: 512,
          height: 512,
        },
      });
      
      console.log('HuggingFace API call successful, processing image...');
      
      // Convert Blob to Buffer and then to base64
      const arrayBuffer = await imageBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      
      console.log('Image processed successfully, base64 length:', base64.length);
      
      return NextResponse.json({ 
        success: true, 
        imageUrl: dataUrl,
        model: selectedModel,
        prompt: prompt
      });
    } catch (hfError: any) {
      console.error('HuggingFace API error:', hfError);
      console.error('HF Error details:', {
        message: hfError.message,
        status: hfError.status,
        statusText: hfError.statusText,
        stack: hfError.stack
      });
      
      // More specific error handling
      if (hfError.message?.includes('401') || hfError.message?.includes('unauthorized')) {
        return NextResponse.json({ error: 'Invalid API token. Please check your HF_TOKEN.' }, { status: 401 });
      } else if (hfError.message?.includes('429') || hfError.message?.includes('rate limit')) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      } else if (hfError.message?.includes('503') || hfError.message?.includes('model')) {
        return NextResponse.json({ error: 'Model is currently unavailable. Please try again later.' }, { status: 503 });
      }
      
      throw hfError; // Re-throw to be caught by outer catch
    }
    
  } catch (error: any) {
    console.error("General API error:", error);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during image generation',
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}
