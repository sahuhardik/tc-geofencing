import * as yup from 'yup';
export const jobsiteValidationSchema = yup.object().shape({
  identifier: yup.string().required('form:error-manufacturer-name-required'),
  radius: yup.number(),
  latitude: yup.number(),
  longitude: yup.number(),
  address: yup.string().required(),
  notifyOnEntry: yup.boolean(),
  notifyOnExit: yup.boolean(),
});
