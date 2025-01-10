import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { detail: 'REPLICATE_API_TOKEN is not set' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { imageUrl, prompt } = body;

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { detail: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    const output = await replicate.run(
      "minimax/video-01",
      {
        input: {
          prompt: prompt,
          first_frame_image: imageUrl
        }
      }
    );

    return NextResponse.json({
      status: 'succeeded',
      output
    });
  } catch (error) {
    console.error('Animation error:', error);
    return NextResponse.json(
      { detail: error.message || 'An error occurred during animation' },
      { status: 500 }
    );
  }
}