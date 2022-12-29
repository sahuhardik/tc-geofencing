import { Fragment, useState } from "react";
import { useTranslation } from "next-i18next";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Control, Controller, FieldErrors } from "react-hook-form";
import ValidationError from "./form-validation-error";
import { TimeCampUser } from "@ts-types/generated";

interface Props {
  control: Control<any>;
  errors?: FieldErrors;
  label?: string;
  name: string;
  renderSuggestion: (val: any) => React.ReactNode;
  getSuggestionValue: (val: any) => string;
  data: any[];
  searchField: string[];
  id: string;
  [key: string]: unknown;
}

const AutoComplete = ({ control, label, id, name, errors, data, searchField, renderSuggestion, getSuggestionValue, ...rest }: Props) => {
  const { t } = useTranslation();

  const [query, setQuery] = useState('');

  const filteredData =
    query === '' || rest.multiple
      ? data
      : data.filter((val) => searchField.some(field => val[field].toLowerCase().includes(query.toLowerCase())))

  return (
    <div>
      {label && <div>{label}</div>}
      <Controller
        name={name}
        control={control}
        {...rest}
        render={({ field: { onChange, value } }) => (
          <Combobox value={value} onChange={(data) => onChange(data)} {...rest}>
            <div className="relative mt-1">
              <div className="relative w-full cursor-default">
                <Combobox.Input
                  className="px-4 h-12 flex items-center w-full rounded appearance-none transition duration-300 ease-in-out text-heading text-sm focus:outline-none focus:ring-0 border border-border-base focus:border-accent"
                  displayValue={(val: any) => getSuggestionValue(val)}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQuery('')}
              >
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-border-accent">
                  {filteredData.length === 0 && query !== '' ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                      Nothing found.
                    </div>
                  ) : (
                    filteredData.map((val: any) => (
                      <Combobox.Option
                        key={val?.[id]}
                        className={({ active }) =>
                          `cursor-default select-none relative py-2 pl-10 pr-4 ${active ? "text-white bg-teal-600" : "text-gray-900"
                          }`
                        }
                        value={val}
                        disabled={Array.isArray(value) && value.some((user: any) => user?.[id] === val?.[id])}
                      >
                        {({ active }) => {
                          const selected = rest.multiple ? value?.some((_val: any) => _val?.[id] === val?.[id]) : value?.['task_id'] === val?.['task_id'];
                          return (
                            <>
                              <span
                                className={`block truncate ${selected ? "font-medium" : "font-normal"
                                  }`}
                              >
                                {renderSuggestion(val)}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-teal-600"
                                    }`}
                                >
                                  <CheckIcon
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )
                        }}
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </Transition>
            </div>
          </Combobox>
        )}
      />
      <ValidationError message={t(errors?.[name]?.message as string)} />
    </div>
  );
};

export default AutoComplete;
