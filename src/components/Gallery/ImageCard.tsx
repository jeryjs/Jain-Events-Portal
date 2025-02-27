import React from 'react';

interface ImageCardProps {
  imageUrl: string;
  altText: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, altText }) => {
  return (
    <div className="image-card">
      <img src={imageUrl} alt={altText} className="gallery-image" />
    </div>
  );
};

export default ImageCard;
