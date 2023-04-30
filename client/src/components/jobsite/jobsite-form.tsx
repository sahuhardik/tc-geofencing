import React, { ChangeEvent, useEffect, useState } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useTranslation } from 'next-i18next';
import Input from '@components/ui/input';
import { Control, UseFormRegister, UseFormSetValue, useForm, useWatch } from 'react-hook-form';
import Button from '@components/ui/button';
import SwitchInput from '@components/ui/switch-input';
import AutoComplete from '@components/ui/autocomplete';
import Label from '@components/ui/label';
import { getErrorMessage } from '@utils/form-error';
import LocationPicker from '@components/widgets/location-picker-map';
import { yupResolver } from '@hookform/resolvers/yup';
import { jobsiteStepOneValidationSchema, jobsiteStepTwoValidationSchema } from './jobsite-validation-schema';
import { useCreateJobSiteMutation } from '@data/jobsite/use-jobsite-create.mutation';
import { useUpdateJobSiteMutation } from '@data/jobsite/use-jobsite-update.mutation';
import { JobSite, TimeCampTask, TimeCampUser } from '@ts-types/generated';
import { useTimeCampTaskQuery } from '@data/timecamp/use-timecamp-tasks.query';
import { useTimeCampUserQuery } from '@data/timecamp/use-timecamp-users.query';
import styles from './jobsite-form.module.css';
import cn from 'classnames';
import CrossIcon from '@components/icons/cross-icon';
import InfoIcon from '@components/icons/info-icon';
import { ArrowPrev } from '@components/icons/arrow-prev';

export type JobSiteFormValues = {
  identifier: string;
  radius: number;
  latitude: number;
  longitude: number;
  address: string;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  pushNotification: boolean;
  taskId: null | number;
  createdBy: string;
  task?: TimeCampTask;
  jobSiteUsers: { userId: string; userEmail: string; user: TimeCampUser }[];
};

type IProps = {
  initialValues?: JobSite | null;
  onCancel: () => void;
};

const Stepper = ({ activeStep }: { activeStep: number }) => {
  return (
    <div className="w-full flex items-center gap-2">
      <div className={cn(styles.roundStep, activeStep > 0 && styles.activeRoundStep)}>1</div>
      <div className={styles.stepConnector}></div>
      <div className={cn(styles.roundStep, activeStep > 1 && styles.activeRoundStep)}>2</div>
    </div>
  );
};

const FormStepOne = ({
  register,
  errors,
  setValue,
  radius,
}: {
  register: UseFormRegister<JobSiteFormValues>;
  errors: any;
  setValue: UseFormSetValue<JobSiteFormValues>;
  radius: number;
}) => {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <Input
        label={t('form:input-label-name')}
        {...register('identifier')}
        error={t(errors.identifier?.message!)}
        variant="outline"
        className="mb-5 w-full"
        placeholder="Type your job site name...."
      />
      <span className="color-gray text-xs text-gray-500 leading-7">
        Can also pick location by dragging location in map.
      </span>
      <Input
        label={t('Adress')}
        {...register('address')}
        error={t(errors.address?.message!)}
        variant="outline"
        className="mb-5 w-full"
        placeholder="Start typing address..."
      />
      <div className="w-full flex gap-4 flex-wrap">
        <Input
          label={t('form:input-label-latitude')}
          {...register('latitude')}
          placeholder="Enter latiitude..."
          error={t(errors.latitude?.message!)}
          variant="outline"
          className="mb-5 flex-1 w-full l:w-auto"
          type="number"
          step="any"
        />
        <Input
          label={t('form:input-label-longitude')}
          {...register('longitude')}
          placeholder="Enter longitude..."
          error={t(errors.longitude?.message!)}
          variant="outline"
          className="mb-5 flex-1 w-full l:w-auto"
          type="number"
          step="any"
        />
      </div>
      <div className="w-full flex items-center">
        <Input
          label={t('radius')}
          {...register('radius')}
          error={t(errors.radius?.message!)}
          className="mb-5 w-full border-none"
          inputClassName="px-0 py-0"
          value={radius}
          min={'1'}
          defaultValue={1}
          max={'1000'}
          type={'range'}
          variant="none"
          onChange={(event: ChangeEvent<HTMLInputElement>) => setValue('radius', Number(event.target.value))}
        />
        <div className={styles.radiusBlock}>{radius || 1} m</div>
      </div>
    </div>
  );
};

const FormStepTwo = ({
  control,
  timecampTasks,
  timecampUsers,
  register,
  errors,
  setValue,
}: {
  control: Control<JobSiteFormValues, any>;
  register: UseFormRegister<JobSiteFormValues>;
  errors: any;
  setValue: UseFormSetValue<JobSiteFormValues>;
  timecampTasks: TimeCampTask[] | undefined;
  timecampUsers: TimeCampUser[] | undefined;
}) => {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <div className="mb-5">
        <Label>{t('form:input-label-user-assign')}</Label>
        <AutoComplete
          name="jobSiteUsers"
          control={control}
          data={timecampUsers || []}
          parseLabel={(item) => item?.userEmail as string}
          parseValue={(item) => item?.userEmail as string}
          multiple
        />
        {errors?.jobSiteUsers?.message && (
          <p className="my-2 text-xs text-start text-red-500">{errors?.jobSiteUsers.message}</p>
        )}
      </div>
      <span className={styles.formDarkHeading}>Automatic timer actions</span>
      <div>
        <Label>{t('form:input-label-notifyOnEntry')}</Label>
        <div className="flex gap-3">
          <SwitchInput name="notifyOnEntry" control={control} />
          <span className={styles.formLightText}>Track time to selected task or project</span>
          <div id="info-icon">
            <InfoIcon className="cursor-pointer" />
          </div>
          <ReactTooltip
            className={styles.tooltip}
            anchorId="info-icon"
            place="top"
            content=" You have to select project or task to automatically start timer to when entering job site."
          />
        </div>
      </div>
      <div className="mb-5">
        <Label>{t('form:input-label-taskId')}</Label>
        <AutoComplete
          name="task"
          control={control}
          data={timecampTasks || []}
          parseLabel={(item) => `${item?.name}${item?.projectName ? ` - ${item?.projectName}` : ''}` as string}
          parseValue={(item) => item?.task_id as string}
        />
        {errors?.task?.message && <p className="my-2 text-xs text-start text-red-500">{errors?.task.message}</p>}
      </div>
      <div className="mb-5 flex gap-3">
        <SwitchInput name="notifyOnExit" control={control} />
        <span className={styles.formLightText}>Send users push notification</span>
      </div>
      <div className="mb-5">
        <Label>{t('form:input-label-notifyOnExit')}</Label>
        <div className="flex gap-3">
          <SwitchInput name="pushNotification" control={control} />
          <span className={styles.formLightText}>Send users push notification and stop timers</span>
        </div>
      </div>
    </div>
  );
};

function CreateOrUpdateJobSiteForm({ initialValues, onCancel }: IProps) {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState<number>(1);

  const { data: timecampTasks } = useTimeCampTaskQuery();

  const { data: timecampUsers } = useTimeCampUserQuery();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<JobSiteFormValues>({
    shouldUnregister: true,
    resolver: yupResolver(activeStep === 1 ? jobsiteStepOneValidationSchema : jobsiteStepTwoValidationSchema),
    ...(Boolean(initialValues) && {
      defaultValues: {
        ...initialValues,
        task: {},
        users: [],
      } as any,
    }),
  });

  const [taskId, radius] = useWatch({
    control,
    name: ['taskId', 'radius'],
  });

  useEffect(() => {
    if (timecampTasks?.length && taskId) {
      const task = timecampTasks.find((_task) => _task.task_id === taskId);
      setValue('task', task);
    }
  }, [timecampTasks]);

  const { mutate: createJobSite, isLoading: creating } = useCreateJobSiteMutation(onCancel);
  const { mutate: updateJobSite, isLoading: updating } = useUpdateJobSiteMutation(onCancel);

  const onSubmit = async (values: JobSiteFormValues) => {
    if (activeStep === 1) {
      setActiveStep(2);
      return;
    }
    const {
      identifier,
      radius,
      latitude,
      longitude,
      pushNotification,
      notifyOnEntry,
      notifyOnExit,
      taskId,
      task,
      jobSiteUsers,
      address,
    } = values;

    debugger;
    const input = {
      identifier,
      radius,
      latitude,
      longitude,
      notifyOnEntry,
      notifyOnExit,
      taskId: task?.task_id || taskId || null,
      jobSiteUsers,
      address,
      pushNotification,
    };
    try {
      if (initialValues) {
        updateJobSite({
          variables: {
            input: {
              ...input,
              id: initialValues.id!,
            },
          },
        });
      } else {
        createJobSite({
          variables: {
            input: {
              ...input,
            },
          },
        });
      }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };

  const renderStepOne = ({ show }: { show: boolean }) => {
    return (
      <div className={`w-full h-full flex-col flex-1 ${show ? 'flex' : 'hidden'}`}>
        <FormStepOne register={register} errors={errors} setValue={setValue} radius={radius} />
        <div className="mb-4 flex justify-between w-full flex-1 items-end">
          <Button
            type="button"
            size="small"
            variant="outline"
            onClick={onCancel}
            className="rounded-full h-9 rounded-3xl"
          >
            {t('form:button-label-cancel')}
          </Button>
          <Button
            size="small"
            loading={updating || creating}
            disabled={updating || creating}
            className="rounded-full h-9 rounded-3xl"
          >
            &nbsp;&nbsp; Next &nbsp;&nbsp;
          </Button>
        </div>
      </div>
    );
  };

  const renderStepTwo = ({ show }: { show: boolean }) => {
    const goBack = () => setActiveStep(1);
    return (
      <div className={`w-full h-full flex-col flex-1 ${show ? 'flex' : 'hidden'}`}>
        <FormStepTwo
          control={control}
          register={register}
          errors={errors}
          setValue={setValue}
          timecampTasks={timecampTasks}
          timecampUsers={timecampUsers}
        />
        <div className="mb-4 flex justify-between w-full flex-1 items-end">
          <Button
            size="small"
            onClick={goBack}
            className="me-4 border-0 hover:bg-transparent hover:text-body bg-transparent text-gray-600 font-normal"
            type="button"
          >
            <ArrowPrev style={{ marginRight: '10px' }} />
            {t('form:button-label-back')}
          </Button>
          <Button
            size="small"
            loading={updating || creating}
            disabled={updating || creating}
            className="rounded-full h-9 rounded-3xl"
          >
            {initialValues ? t('form:button-label-update-jobsite') : t('form:button-label-add-jobsite')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.jobsiteHeading}>
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17 12C17 14.7625 14.7625 17 12 17C9.2375 17 7 14.7625 7 12C7 9.2375 9.2375 7 12 7C14.7625 7 17 9.2375 17 12ZM12 15C13.6562 15 15 13.6562 15 12C15 10.3438 13.6562 9 12 9C10.3438 9 9 10.3438 9 12C9 13.6562 10.3438 15 12 15ZM24 12C24 17.4625 16.6875 27.1875 13.4812 31.2C12.7125 32.1562 11.2875 32.1562 10.5188 31.2C7.25625 27.1875 0 17.4625 0 12C0 5.3725 5.3725 0 12 0C18.625 0 24 5.3725 24 12ZM12 2C6.475 2 2 6.475 2 12C2 12.975 2.33938 14.3125 3.035 15.9625C3.71688 17.5812 4.675 19.3375 5.75875 21.0938C7.8875 24.55 10.4125 27.8563 12 29.85C13.5875 27.8563 16.1125 24.55 18.2437 21.0938C19.325 19.3375 20.2812 17.5812 20.9625 15.9625C21.6625 14.3125 22 12.975 22 12C22 6.475 17.525 2 12 2Z"
            fill="#4BB063"
          />
        </svg>
        <span> {initialValues ? 'Update' : 'Add new'} job site</span>
        <CrossIcon style={{ position: 'absolute', right: '20px', cursor: 'pointer' }} onClick={onCancel} />
      </div>
      <form className="w-full flex flex-row flex-1" onSubmit={handleSubmit(onSubmit)}>
        <div className="xl:w-1/2 w-full items-center flex flex-col xl:mb-0 pr-8">
          <div className="w-5/12 pt-3">
            <Stepper activeStep={activeStep} />
          </div>
          {renderStepOne({ show: activeStep === 1 })}
          {renderStepTwo({ show: activeStep === 2 })}
        </div>
        <div className="xl:w-1/2 4 xl:mb-0">
          <LocationPicker height="100%" control={control} setValue={setValue} />
        </div>
      </form>
    </>
  );
}

export default React.memo(CreateOrUpdateJobSiteForm);
