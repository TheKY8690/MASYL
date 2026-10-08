export function loadKakaoSdk(): Promise<void> {
  const key = import.meta.env.VITE_KAKAO_MAP_API_KEY;
  if (!key) return Promise.resolve();
  if (window.kakao?.maps) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Kakao Maps SDK failed to load'));
    document.head.appendChild(script);
  });
}
