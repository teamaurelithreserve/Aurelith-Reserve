/**
 * Theme-aware Favicon Manager for Aurelith Reserve
 * Seamlessly manages browser tab favicons using the official light (color) and dark (white) logos.
 */

export function updateFaviconForTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;

  const isDark = theme === 'dark';

  // 1. Primary theme-aware PNG favicon (high-resolution)
  let themeFavicon = document.querySelector<HTMLLinkElement>('#favicon-theme');
  if (!themeFavicon) {
    themeFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-theme-favicon="true"]');
  }
  if (themeFavicon) {
    themeFavicon.href = isDark ? '/favicon-dark.png' : '/favicon-light.png';
  }

  // 2. Standard 32x32 PNG favicon
  let favicon32 = document.querySelector<HTMLLinkElement>('#favicon-32');
  if (!favicon32) {
    favicon32 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="32x32"]');
  }
  if (favicon32) {
    favicon32.href = isDark ? '/favicon-dark-32x32.png' : '/favicon-32x32.png';
  }

  // 3. Standard 16x16 PNG favicon
  let favicon16 = document.querySelector<HTMLLinkElement>('#favicon-16');
  if (!favicon16) {
    favicon16 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="16x16"]');
  }
  if (favicon16) {
    favicon16.href = isDark ? '/favicon-dark-16x16.png' : '/favicon-16x16.png';
  }

  // 4. Apple Touch Icon (180x180)
  let appleTouchIcon = document.querySelector<HTMLLinkElement>('#apple-touch-icon');
  if (!appleTouchIcon) {
    appleTouchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  }
  if (appleTouchIcon) {
    appleTouchIcon.href = isDark ? '/apple-touch-icon-dark.png' : '/apple-touch-icon.png';
  }
}
