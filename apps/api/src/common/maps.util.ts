export function extractLatLngFromGoogleMaps(url: string): { lat: number; lng: number } | null {
    try {
        const decoded = decodeURIComponent(url);
        const atMatch = decoded.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (atMatch) {
            return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
        }
        const qMatch = decoded.match(/[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (qMatch) {
            return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
        }
        return null;
    } catch {
        return null;
    }
}
