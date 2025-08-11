import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

export async function GET(request: NextRequest) {
  try {
    const pinata = new PinataSDK({
      pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!, // Use server environment variable
      pinataGateway: "amaranth-keen-tern-765.mypinata.cloud",
    });
    
    const response = await pinata.files.public.list();
    
    // Return the response data
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Pinata files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
