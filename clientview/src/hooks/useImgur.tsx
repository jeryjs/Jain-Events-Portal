import { useQuery } from "@tanstack/react-query";

// Define interfaces for Imgur API responses
interface ImgurImage {
  id: string;
  title: string | null;
  description: string | null;
  link: string;
  width: number;
  height: number;
  type: string;
  animated: boolean;
}

interface ImgurAlbumResponse {
  data: {
    id: string;
    title: string | null;
    description: string | null;
    images?: ImgurImage[];
  };
  success: boolean;
  status: number;
}

// Imgur client ID
const IMGUR_CLIENT_ID = "92e7daf3ff48945";

/**
 * Extract album/gallery ID from an Imgur URL
 */
const extractImgurId = (url: string): { type: 'album' | 'gallery' | 'image', id: string } | null => {
  // For album URLs (e.g., https://imgur.com/a/abcdef)
  const albumMatch = url.match(/imgur\.com\/a\/([a-zA-Z0-9]+)/);
  if (albumMatch) return { type: 'album', id: albumMatch[1] };
  
  // For gallery URLs (e.g., https://imgur.com/gallery/abcdef)
  const galleryMatch = url.match(/imgur\.com\/gallery\/([a-zA-Z0-9]+)/);
  if (galleryMatch) return { type: 'gallery', id: galleryMatch[1] };
  
  // For single image URLs (e.g., https://imgur.com/abcdef)
  const imageMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)$/);
  if (imageMatch) return { type: 'image', id: imageMatch[1] };
  
  return null;
};

/**
 * Fetch images from an Imgur post
 */
const fetchImgurImages = async (imgurUrl: string): Promise<ImgurImage[]> => {
  const imgurId = extractImgurId(imgurUrl);
  
  if (!imgurId) {
    throw new Error("Invalid Imgur URL format");
  }
  
  let apiUrl: string;
  
  switch (imgurId.type) {
    case 'album':
      apiUrl = `https://api.imgur.com/3/album/${imgurId.id}/images`;
      break;
    case 'gallery':
      apiUrl = `https://api.imgur.com/3/gallery/${imgurId.id}`;
      break;
    case 'image':
      apiUrl = `https://api.imgur.com/3/image/${imgurId.id}`;
      break;
    default:
      throw new Error("Unsupported Imgur URL type");
  }
  
  const response = await fetch(apiUrl, {
    headers: {
      "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`,
      "Accept": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Imgur content: ${response.status} ${response.statusText}`);
  }
  
  const data: ImgurAlbumResponse = await response.json();
  
  if (!data.success) {
    throw new Error("Imgur API returned an unsuccessful response");
  }
  
  // Handle different response structures based on Imgur URL type
  if (imgurId.type === 'image') {
    // For single images, wrap in an array
    return [data.data as unknown as ImgurImage];
  } else if (imgurId.type === 'gallery') {
    // For galleries, check if it has images array
    return data.data.images || [data.data as unknown as ImgurImage];
  } else {
    // For albums, return the images array
    return data.data as unknown as ImgurImage[] || [];
  }
};

/**
 * Hook to fetch images from an Imgur post
 */
export const useImgur = (imgurUrl: string | null) => {
  return useQuery({
    queryKey: ["imgur", imgurUrl],
    queryFn: () => fetchImgurImages(imgurUrl || ""),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    enabled: !!imgurUrl,
  });
};

export default useImgur;
