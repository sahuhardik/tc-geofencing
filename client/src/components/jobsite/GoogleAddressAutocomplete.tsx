import React, { forwardRef, useImperativeHandle } from "react";
import usePlacesAutocomplete, { getLatLng, getGeocode }  from "use-places-autocomplete";
import useOnclickOutside from "react-cool-onclickoutside";

export default  forwardRef(({renderInput, setAddress}: {renderInput: (props: any) => React.ReactElement; setAddress: (address: string, isSelected?: boolean, latlng?: { lat: number; lng: number }) => void }, addressRef) => {
  const {
    ready,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
  });

  const ref = useOnclickOutside(() => {
    clearSuggestions();
  });

  const handleInput = (value: string) => {
    setValue(value);
  };

  useImperativeHandle(addressRef, () => ({
    setValue: handleInput
  }));

  const handleSelect =
    (geoLocation) =>
    async () => {
      const { description } = geoLocation;
      const results = await getGeocode({ placeId: geoLocation.place_id });
      const { lat, lng } = await getLatLng(results[0]);
      setValue(description, false);
      setAddress(description, true, { lat, lng });
      clearSuggestions();
    };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li key={place_id} className={'z-10 pl-[10px] pr-[10px] pt-1  pb-1 rounded-sm hover:cursor-pointer hover:bg-gray-100'} onClick={handleSelect(suggestion)}>
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div ref={ref}>
      {renderInput({
        disabled:!ready,
        handleInput
      })}
      {status === "OK" && <ul className="z-10 absolute bg-white  shadow-md mt-[-10px]	gap-[20px] p-[15px] pt-0" >{renderSuggestions()}</ul>}
    </div>
  );
});
