export function getEmbeddableVideoUrl(rawUrl?: string | null): string | null {
    if (!rawUrl) return null;

    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

    let url: URL;
    try {
        url = new URL(normalizedUrl);
    } catch {
        return null;
    }

    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
        const idFromQuery = url.searchParams.get('v');
        const pathParts = url.pathname.split('/').filter(Boolean);
        const idFromPath = host === 'youtu.be'
            ? pathParts[0]
            : pathParts[0] === 'shorts' || pathParts[0] === 'embed'
                ? pathParts[1]
                : null;
        const videoId = idFromQuery || idFromPath;
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }

    if (host === 'vimeo.com') {
        const id = url.pathname.split('/').filter(Boolean)[0];
        return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host === 'drive.google.com') {
        const directFileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
        const idFromPath = directFileMatch?.[1] || url.searchParams.get('id');
        if (idFromPath) {
            return `https://drive.google.com/file/d/${idFromPath}/preview`;
        }
    }

    if (host === 'facebook.com' || host === 'm.facebook.com' || host === 'fb.watch') {
        const pathParts = url.pathname.split('/').filter(Boolean);
        const reelIndex = pathParts.indexOf('reel');
        if (reelIndex !== -1 && pathParts[reelIndex + 1]) {
            const watchUrl = `https://www.facebook.com/watch/?v=${pathParts[reelIndex + 1]}`;
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(watchUrl)}&show_text=false&width=1280`;
        }
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(normalizedUrl)}&show_text=false&width=1280`;
    }

    if (host === 'instagram.com') {
        const cleanPath = url.pathname.replace(/\/+$/, '');
        const pathParts = cleanPath.split('/').filter(Boolean);
        if (pathParts.length >= 2 && ['reel', 'p', 'tv'].includes(pathParts[0])) {
            return `https://www.instagram.com/${pathParts[0]}/${pathParts[1]}/embed/`;
        }
    }

    return null;
}
