import { useState, useEffect } from 'react';

export default function BlurImage({
  src,
  alt,
  className = '',
  priority = false,
}) {
  const [loaded, setLoaded] = useState(false);

  // Give LCP a nudge on the first few images in view
  const fetchpriority = priority ? 'high' : 'low';

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={fetchpriority}
      sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
      className={`${className} transition-[filter,opacity] duration-300 will-change-auto ${loaded ? 'opacity-100 filter-none' : 'opacity-80 blur-[8px]'}`}
      onLoad={() => setLoaded(true)}
      style={{ width: '100%', display: 'block' }}
    />
  );
}
