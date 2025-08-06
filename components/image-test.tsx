"use client"

import { useState } from 'react';

export function ImageTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testImageGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing image generation...');
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: "a simple red apple",
          steps: 5,
          model: "default"
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setResult(data);
      } else {
        setError(`API Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Test error:', err);
      setError(`Network Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded">
      <h3 className="text-lg font-bold mb-4">Image Generation Test</h3>
      
      <button 
        onClick={testImageGeneration}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Image Generation'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-600 rounded">
          <h4>Error:</h4>
          <pre className="text-sm">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-600 rounded">
          <h4>Success!</h4>
          <p>Model: {result.model}</p>
          <p>Prompt: {result.prompt}</p>
          {result.imageUrl && (
            <img src={result.imageUrl} alt="Generated" className="mt-2 max-w-xs" />
          )}
        </div>
      )}
    </div>
  );
}
