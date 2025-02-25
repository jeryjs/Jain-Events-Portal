import React from 'react';
import ImageCard from './ImageCard';
import { imageData } from './data'; // Import the placeholder image data

const Gallery: React.FC = () => {
  return (
    <div className="gallery">
      {imageData.map((image, index) => (
        <ImageCard key={index} imageUrl={image.url} altText={image.alt} />
      ))}
    </div>
  );
};

export default Gallery;
