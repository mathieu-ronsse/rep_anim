export function isValidImageUrl(url) {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  return url.startsWith('data:') || url.startsWith('http');
}