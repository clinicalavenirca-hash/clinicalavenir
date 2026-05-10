'use client';
/**
 * Plain native YouTube iframe — keeps YouTube's own controls, branding, title
 * bar, and fullscreen behaviour. We tried hiding it all with custom controls
 * but it caused sizing issues, so we're back to a normal embed.
 *
 * The CoursePlayer handles "mark watched" + module unlock based on user clicks
 * (see `loadVideo`), so we don't need a JS-API wired player here.
 */
export function VideoPlayer({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="aspect-video bg-ink-900">
      <iframe
        // `key` forces a fresh iframe when the user picks a different lesson.
        key={videoId}
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={title ?? 'Lesson'}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
