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
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { detail: 'No image provided' },
        { status: 400 }
      );
    }

    const prediction = await replicate.predictions.create({
      version: "0da600fab0c45a66211339f1c16b71345d22f26ef5fea3dca1bb90bb5711e950",
      input: {
        input_image: imageUrl,
        model_name: "Artistic"
      }
    });

    if (prediction?.error) {
      return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { detail: error.message },
      { status: 500 }
    );
  }
}