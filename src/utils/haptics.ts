// Native vibration feedback for Android / iOS mobile devices
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([15, 40, 25]);
          break;
        case 'warning':
          navigator.vibrate([30, 60, 30]);
          break;
      }
    } catch {
      // Ignorar si el navegador restringe la vibración
    }
  }
}
