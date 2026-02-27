export function getEmbeddableVideoUrl(rawUrl?: string | null): string | null {
    if (!rawUrl) return null;

    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        return null;
    }

    const host = url.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
        const idFromQuery = url.searchParams.get('v');
        const pathParts = url.pathname.split('/').filter(Boolean);
        const idFromPath = host.includes('youtu.be')
            ? pathParts[0]
            : pathParts[0] === 'shorts' || pathParts[0] === 'embed'
                ? pathParts[1]
                : null;
        const videoId = idFromQuery || idFromPath;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host.includes('facebook.com') || host.includes('fb.watch')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false`;
    }

    if (host.includes('instagram.com')) {
        const cleanPath = url.pathname.replace(/\/+$/, '');
        return `${url.origin}${cleanPath}/embed`;
    }

    return null;
}
