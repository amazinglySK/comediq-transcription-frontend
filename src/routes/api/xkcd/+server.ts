import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface XkcdComic {
  num: number;
  title: string;
  alt: string;
  img: string;
  safe_title: string;
  month: string;
  year: string;
  day: string;
  transcript: string;
  link?: string;
  news?: string;
}

export const GET: RequestHandler = async () => {
  try {
    // First get the latest comic number
    const latestResponse = await fetch('https://xkcd.com/info.0.json');
    
    if (!latestResponse.ok) {
      throw new Error(`Failed to fetch latest comic: ${latestResponse.status}`);
    }
    
    const latest: XkcdComic = await latestResponse.json();
    
    // Generate random comic number (1 to latest)
    const randomNum = Math.floor(Math.random() * latest.num) + 1;
    
    // Fetch the random comic
    const comicResponse = await fetch(`https://xkcd.com/${randomNum}/info.0.json`);
    
    if (!comicResponse.ok) {
      throw new Error(`Failed to fetch comic ${randomNum}: ${comicResponse.status}`);
    }
    
    const comicData: XkcdComic = await comicResponse.json();
    
    // Return the comic data
    return json({
      success: true,
      comic: {
        num: comicData.num,
        title: comicData.title,
        alt: comicData.alt,
        img: comicData.img,
        safe_title: comicData.safe_title
      }
    });
    
  } catch (error) {
    console.error('Error fetching XKCD comic:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { 
      status: 500 
    });
  }
};