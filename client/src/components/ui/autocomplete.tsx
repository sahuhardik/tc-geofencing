import { useTranslation } from 'next-i18next';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import ValidationError from './form-validation-error';
import Select from 'react-select';
interface Props {
  control: Control<any>;
  errors?: FieldErrors;
  label?: string;
  name: string;
  parseValue: (val: any) => string;
  parseLabel: (val: any) => string;
  data: any[];
  [key: string]: unknown;
}

const AutoComplete = ({ control, label, name, errors, data, parseValue, parseLabel, ...rest }: Props) => {
  const { t } = useTranslation();
  const filteredData = data;
  return (
    <div>
      {label && <div>{label}</div>}
      <Controller
        name={name}
        control={control}
        {...rest}
        render={({ field: { onChange, value } }) => (
          <Select
            classNamePrefix="addl-class"
            options={filteredData.map((item) => ({ label: parseLabel(item), value: parseValue(item) }))}
            value={
              Boolean(rest.multiple)
                ? value?.map((_value: any) => ({ label: parseLabel(_value), value: parseValue(_value) }))
                : value
                ? { label: parseLabel(value), value: parseValue(value) }
                : undefined
            }
            onChange={(val) =>
              onChange(
                Boolean(rest.multiple)
                  ? val?.map((selectedValue: any) =>
                      filteredData.find((item) => parseValue(item) == selectedValue?.value)
                    )
                  : filteredData.find((item) => parseValue(item) == val?.value)
              )
            }
            isMulti={Boolean(rest.multiple)}
          />
        )}
      />
      <ValidationError message={t(errors?.[name]?.message as string)} />
    </div>
  );
};

export default AutoComplete;
