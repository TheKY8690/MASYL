declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;

    interface MapOptions {
      center: LatLng;
      level: number;
      draggable?: boolean;
      scrollwheel?: boolean;
      disableDoubleClickZoom?: boolean;
    }

    interface CustomOverlayOptions {
      position: LatLng;
      content: string | HTMLElement;
      zIndex?: number;
      clickable?: boolean;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      setLevel(level: number): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
    }

    namespace event {
      function addListener(
        target: Map | CustomOverlay,
        type: string,
        handler: (...args: unknown[]) => void,
      ): void;
    }
  }
}

interface Window {
  kakao: typeof kakao;
}
