import React, { useEffect, useRef, useState } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';

import { Wrapper } from '@googlemaps/react-wrapper';
import { JobSiteFormValues } from '@components/jobsite/jobsite-form';
import { Circle, Map, Marker } from './google-map-components';

interface IMaps {
  control: Control<any>;
  setValue: UseFormSetValue<JobSiteFormValues>;
  height?: string;
  disabled?: boolean;
}

const LocationPickerMap: React.FC<IMaps> = ({ control, setValue, height = '500px', disabled = false }) => {
  const [radius, longitude, latitude] = useWatch({
    control,
    name: ['radius', 'longitude', 'latitude'],
  });
  const geocoderRef = useRef<google.maps.Geocoder>();
  const [click, setClick] = useState<google.maps.LatLng>();
  const [zoom, setZoom] = useState(3);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0,
  });

  async function geocodePosition(pos: google.maps.LatLng): Promise<string> {
    if (geocoderRef.current) {
      const response = await geocoderRef.current.geocode({
        location: pos,
      });
      if (response && response.results?.length > 0) {
        return response.results[0].formatted_address;
      }
    }
    return '';
  }

  useEffect(() => {
    if (longitude && latitude && window.google) {
      setCenter({
        lng: Number(longitude),
        lat: Number(latitude),
      });
      setClick(new google.maps.LatLng(latitude, longitude));

      setZoom(10);
    }
  }, [longitude, latitude, window.google]);

  useEffect(() => {
    if (window.google) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [window.google]);

  const onClick = (e: google.maps.MapMouseEvent) => {
    if (disabled) {
      return;
    }
    // avoid directly mutating state
    setClick(e.latLng!);
    setValue('longitude', e.latLng?.lng() || 0);
    setValue('latitude', e.latLng?.lat() || 0);
    setValue('latitude', e.latLng?.lat() || 0);
    geocodePosition(e.latLng!).then((address) => {
      setValue('address', address);
    });
  };

  const onIdle = (m: google.maps.Map) => {
    setZoom(m.getZoom()!);
    setCenter(m.getCenter()!.toJSON());
  };

  return (
    <div style={{ display: 'flex', height }}>
      <Wrapper
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!}
        version="beta"
        libraries={['places']}
        mapIds={['theuniquemapid']}
      >
        <Map center={center} onClick={onClick} onIdle={onIdle} zoom={zoom} style={{ flexGrow: '1', height: '100%' }}>
          {click ? <Marker position={click} /> : null}
          {click && radius ? <Circle center={click} radius={Number(radius)} /> : null}
        </Map>
      </Wrapper>
    </div>
  );
};

export default LocationPickerMap;
