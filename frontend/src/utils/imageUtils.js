export const optimizeImageUrl = (url, width = 'auto') => {
    if (!url || typeof url !== 'string') return url;
    
    // Only optimize Cloudinary URLs
    if (url.includes('res.cloudinary.com')) {
        // If it's already optimized, don't double up
        if (url.includes('/upload/f_auto,q_auto')) return url;
        
        const parts = url.split('/upload/');
        if (parts.length === 2) {
            const transform = width === 'auto' ? 'f_auto,q_auto' : `f_auto,q_auto,w_${width}`;
            return `${parts[0]}/upload/${transform}/${parts[1]}`;
        }
    }
    return url;
};
