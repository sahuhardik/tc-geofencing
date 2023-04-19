import * as yup from 'yup';
export const jobsiteStepOneValidationSchema = yup.object().shape({
  identifier: yup.string().required('form:error-jobsite-name-required'),
  radius: yup.number(),
  latitude: yup.number(),
  longitude: yup.number(),
  address: yup.string().required('form:error-jobsite-address-required'),
});


export const jobsiteStepTwoValidationSchema = jobsiteStepOneValidationSchema.shape({
  notifyOnEntry: yup.boolean(),
  notifyOnExit: yup.boolean(),
  pushNotification: yup.boolean(),
  jobSiteUsers:   yup.array().test({
    message: 'Please select atleast one jobsite user',
    test: arr => {
      return arr !== undefined && arr?.length  != 0;
    },
  }),
  task: yup.object().required('Please select task')
});
