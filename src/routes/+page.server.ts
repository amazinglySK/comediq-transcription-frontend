import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.API_URL || 'http://localhost:8000';

// TypeScript interfaces
interface Joke {
  setup: string;
  punchline: string;
  start_time: number;
  end_time: number;
}

interface Bit {
  bit: string;
  jokes: Joke[];
}

interface SegmentationChunk {
  chunk: string;
  bits: Bit[];
}

type SegmentationData = SegmentationChunk[];

interface SegmentResponse {
  status: string;
  filename: string;
  transcript: string;
  segmentation: SegmentationData;
}

interface AnalysisResponse {
  status: string;
  analysis: string;
}

// Server-side API functions
async function segmentAudio(audioFile: File): Promise<SegmentResponse> {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await fetch(`${API_BASE_URL}/segment/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Segmentation API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function analyzeSegmentation(segmentation: SegmentationData): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ segmentation }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Analysis API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export const actions = {
  analyze: async ({ request }) => {
    try {
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      

      
      if (!audioFile) {
        return fail(400, { error: 'No audio file provided' });
      }

      // Use the server-side functions
      const segmentData = await segmentAudio(audioFile);
      const analysisData = await analyzeSegmentation(segmentData.segmentation);

      return {
        success: true,
        filename: segmentData.filename,
        transcript: segmentData.transcript,
        segmentation: segmentData.segmentation,
        analysis: analysisData.analysis
      };

    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      return fail(500, { error: errorMessage });
    }
  }
} satisfies Actions;