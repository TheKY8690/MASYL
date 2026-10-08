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
      xAnchor?: number;
      yAnchor?: number;
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

    namespace services {
      enum SortBy {
        ACCURACY = 'accuracy',
        DISTANCE = 'distance',
      }
      enum Status {
        OK = 'OK',
        ZERO_RESULT = 'ZERO_RESULT',
        ERROR = 'ERROR',
      }
      interface PlaceSearchResult {
        id: string;
        place_name: string;
        category_name: string;
        x: string;
        y: string;
        distance: string;
        place_url: string;
        address_name: string;
        road_address_name: string;
        phone: string;
      }
      type PlacesSearchCallback = (
        result: PlaceSearchResult[],
        status: Status,
      ) => void;
      interface PlacesSearchOptions {
        location?: LatLng;
        radius?: number;
        sort?: SortBy;
        size?: number;
      }
      class Places {
        keywordSearch(
          keyword: string,
          callback: PlacesSearchCallback,
          options?: PlacesSearchOptions,
        ): void;
      }
    }
  }
}

interface Window {
  kakao: typeof kakao;
}
