import React, { useState, useEffect } from "react";
import { UseFormSetValue, Control, useWatch } from "react-hook-form";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { JobSiteFormValues } from "@components/jobsite/jobsite-form";
import { Map, Marker, Circle } from './google-map-components';

interface IMaps {
    control: Control<any>;
    setValue: UseFormSetValue<JobSiteFormValues>;
};


const LocationPickerMap: React.FC<IMaps> = ({ control, setValue }) => {
    const [radius, longitude, latitude] = useWatch({
        control,
        name: ["radius", 'longitude', 'latitude'],
    });

    const [click, setClick] = useState<google.maps.LatLng>();
    const [zoom, setZoom] = useState(3);
    const [center, setCenter] = useState<google.maps.LatLngLiteral>({
        lat: 0,
        lng: 0,
    });
    
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

    const onClick = (e: google.maps.MapMouseEvent) => {
        // avoid directly mutating state
        setClick(e.latLng!);
        setValue('longitude', e.latLng?.lng() || 0);
        setValue('latitude', e.latLng?.lat() || 0);
    };

    const onIdle = (m: google.maps.Map) => {
        setZoom(m.getZoom()!);
        setCenter(m.getCenter()!.toJSON());
    };

    return <div style={{ display: "flex", height: "500px" }}>
        <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!} version="beta" mapIds={['theuniquemapid']} >
            <Map
                center={center}
                onClick={onClick}
                onIdle={onIdle}
                zoom={zoom}
                style={{ flexGrow: "1", height: "100%" }}
            >
                {click ? <Marker position={click} /> : null}
                {click && radius ? <Circle center={click} radius={Number(radius)} /> : null}
            </Map>
        </Wrapper>
    </div>;
};

export default LocationPickerMap;