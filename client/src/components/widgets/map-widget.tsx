import React, { useState, useEffect, useRef } from "react";
import { UseFormSetValue, Control, useWatch } from "react-hook-form";
import { createCustomEqual } from "fast-equals";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { isLatLngLiteral } from "@googlemaps/typescript-guards";
import { JobSiteFormValues } from "@components/jobsite/jobsite-form";

interface IMaps {
    control: Control<any>;
    setValue: UseFormSetValue<JobSiteFormValues>;
};

const render = (status: Status) => {
    return <h1>{status}</h1>;
};

const MapWidget: React.FC<IMaps> = ({ control, setValue }) => {
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
        if (longitude && latitude) {
            setCenter({
                lng: Number(longitude),
                lat: Number(latitude),
            });
            // setClick(new google.maps.LatLng(latitude, longitude));
        }
    }, []);

    const onClick = (e: google.maps.MapMouseEvent) => {
        // avoid directly mutating state
        setClick(e.latLng!);
        setValue('longitude', e.latLng?.lat() || 0);
        setValue('latitude', e.latLng?.lng() || 0);
    };

    const onIdle = (m: google.maps.Map) => {
        setZoom(m.getZoom()!);
        setCenter(m.getCenter()!.toJSON());
    };

    return <div style={{ display: "flex", height: "500px" }}>
        <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!} render={render}>
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

interface MapProps extends google.maps.MapOptions {
    style: { [key: string]: string };
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onIdle?: (map: google.maps.Map) => void;
    children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({
    onClick,
    onIdle,
    children,
    style,
    ...options
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();

    useEffect(() => {
        if (ref.current && !map) {
            setMap(new window.google.maps.Map(ref.current, {}));
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
            ["click", "idle"].forEach((eventName) =>
                google.maps.event.clearListeners(map, eventName)
            );

            if (onClick) {
                map.addListener("click", onClick);
            }

            if (onIdle) {
                map.addListener("idle", () => onIdle(map));
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
                    return React.cloneElement(child, { map });
                }
            })}
        </>
    );
};

const Marker: React.FC<google.maps.MarkerOptions> = (options) => {
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

const Circle: React.FC<google.maps.CircleOptions> = (options) => {
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
                ...options,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
            });
        }
    }, [circle, options]);

    return null;
};

const deepCompareEqualsForMaps = createCustomEqual(
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
        return deepEqual(a, b);
    }
);

function useDeepCompareMemoize(value: any) {
    const ref = useRef();

    if (!deepCompareEqualsForMaps(value, ref.current)) {
        ref.current = value;
    }

    return ref.current;
}

function useDeepCompareEffectForMaps(
    callback: React.EffectCallback,
    dependencies: any[]
) {
    useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

export default MapWidget;