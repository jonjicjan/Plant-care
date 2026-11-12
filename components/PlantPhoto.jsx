import { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { plantImageFor } from '@/lib/plantImages';

const signedUrlCache = new Map();

export default function PlantPhoto({ uri, alt, className, fittingType = 'fill', plantType }) {
  const [url, setUrl] = useState(() => (uri && /^https?:\/\//i.test(uri) ? uri : signedUrlCache.get(uri) || null));

  useEffect(() => {
    let active = true;
    if (!uri) {
      setUrl(null);
      return undefined;
    }
    if (/^https?:\/\//i.test(uri)) {
      setUrl(uri);
      return undefined;
    }
    if (signedUrlCache.has(uri)) {
      setUrl(signedUrlCache.get(uri));
      return undefined;
    }
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 })
      .then((result) => {
        if (result?.signed_url) signedUrlCache.set(uri, result.signed_url);
        if (active) setUrl(result?.signed_url ?? null);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [uri]);

  return <Image src={url || plantImageFor(plantType)} alt={alt} fittingType={fittingType} className={className} />;
}