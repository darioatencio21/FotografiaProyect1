import React, { useState } from 'react';

type StorageImageProps = React.ComponentPropsWithoutRef<'img'>;

export default function StorageImage({ src, ...props }: StorageImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.dataset.retried) {
      img.dataset.retried = 'true';
      const sep = imgSrc?.includes('?') ? '&' : '?';
      setImgSrc(`${imgSrc}${sep}retry=${Date.now()}`);
    }
  };

  if (!imgSrc) return null;

  return (
    <img
      src={imgSrc}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
