/**
 * Utility functions for handling images in the application
 */

/**
 * Converts a data URL to a File object
 * @param dataUrl - The data URL string
 * @param filename - The desired filename
 * @returns File object or null if conversion fails
 */
export function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error("Error converting data URL to file:", error);
    return null;
  }
}

/**
 * Fetches an image from a URL and returns it as a File object
 * @param url - The URL of the image
 * @param filename - The desired filename
 * @returns Promise that resolves to a File object or null if fetch fails
 */
export async function fetchImageAsFile(url: string, filename: string): Promise<File | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

/**
 * Creates optimized NFT metadata for an AI-generated image
 * @param prompt - The prompt used to generate the image
 * @param model - The AI model used
 * @param imageUrl - Optional URL to include in the metadata
 * @returns Metadata object formatted for NFT standards
 */
export function createNFTMetadata(prompt: string, model: string, imageUrl?: string) {
  const title = prompt
    ? `${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`
    : 'AI Generated Image';
  
  return {
    name: title,
    description: prompt || 'AI generated image',
    image: imageUrl,
    external_url: imageUrl,
    attributes: [
      {
        trait_type: 'AI Model',
        value: model
      },
      {
        trait_type: 'Prompt',
        value: prompt
      },
      {
        display_type: 'date',
        trait_type: 'Generation Date',
        value: Date.now()
      }
    ]
  };
}
