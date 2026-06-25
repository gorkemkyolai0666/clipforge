'use client';

import React from 'react';

interface StitchScreenProps {
  slug: string;
  className?: string;
}

export function StitchScreen({ slug, className = '' }: StitchScreenProps) {
  const [html, setHtml] = React.useState('');
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    import(`@/stitch-screens/${slug}.html`)
      .then((mod) => {
        if (!cancelled) setHtml(mod.html);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p>Stitch ekranı yüklenemedi: {slug}</p>
      </div>
    );
  }

  if (!html) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }

  return (
    <div
      className={`stitch-screen ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
