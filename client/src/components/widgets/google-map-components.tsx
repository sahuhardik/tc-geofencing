import React, { useEffect, useRef, useState } from 'react';
import { createCustomEqual } from 'fast-equals';
import { isLatLngLiteral } from '@googlemaps/typescript-guards';

export interface ILatLng {
  lat: number;
  lng: number;
}

export interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

export const Map: React.FC<MapProps> = ({ onClick, onIdle, children, style, ...options }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, { mapId: options.mapId }));
    }
  }, [ref, map]);

  // because React does not do deep comparisons, a custom hook is used
  // see discussion in https://github.com/googlemaps/js-samples/issues/946
  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  useEffect(() => {
    if (map) {
      ['click', 'idle'].forEach((eventName) => google.maps.event.clearListeners(map, eventName));

      if (onClick) {
        map.addListener('click', onClick);
      }

      if (onIdle) {
        map.addListener('idle', () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);

  return (
    <>
      <div ref={ref} style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          // @ts-ignore
          return React.cloneElement(child, { map, mapRef: ref });
        }
      })}
    </>
  );
};

export const Marker: React.FC<google.maps.MarkerOptions> = (options) => {
  const [marker, setMarker] = useState<google.maps.Marker>();

  useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);

  return null;
};

export const Circle: React.FC<google.maps.CircleOptions> = (options) => {
  const [circle, setCircle] = useState<google.maps.Circle>();

  useEffect(() => {
    if (!circle) {
      setCircle(new google.maps.Circle());
    }

    // remove marker from map on unmount
    return () => {
      if (circle) {
        circle.setMap(null);
      }
    };
  }, [circle]);

  useEffect(() => {
    if (circle) {
      circle.setOptions({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        ...options,
      });
    }
  }, [circle, options]);

  return null;
};

export const deepCompareEqualsForMaps = createCustomEqual(
  // @ts-expect-error
  (deepEqual) => (a: any, b: any) => {
    if (
      isLatLngLiteral(a) ||
      a instanceof google.maps.LatLng ||
      isLatLngLiteral(b) ||
      b instanceof google.maps.LatLng
    ) {
      return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
    }

    // TODO extend to other types

    // use fast-equals for other objects
    // @ts-expect-error
    return deepEqual(a, b);
  }
);

export function useDeepCompareMemoize(value: any) {
  const ref = useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

export function useDeepCompareEffectForMaps(callback: React.EffectCallback, dependencies: any[]) {
  useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

export const mapMarkerColors = ['#A12687', '#5B4D99', '#0099cc', '#cc9900', '#9900cc', '#009973', '#99ff66'];

export default Map;
