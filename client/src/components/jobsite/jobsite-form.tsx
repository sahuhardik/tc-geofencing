import { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Input from "@components/ui/input";
import { useForm, useWatch } from "react-hook-form";
import Button from "@components/ui/button";
import SwitchInput from "@components/ui/switch-input";
import AutoComplete from "@components/ui/autocomplete";
import Label from "@components/ui/label";
import { getErrorMessage } from "@utils/form-error";
import Description from "@components/ui/description";
import Card from "@components/common/card";
import MapWidget from "@components/widgets/map-widget";
import { yupResolver } from "@hookform/resolvers/yup";
import { jobsiteValidationSchema } from "./jobsite-validation-schema";
import { useCreateJobSiteMutation } from "@data/jobsite/use-jobsite-create.mutation";
import { useUpdateJobSiteMutation } from "@data/jobsite/use-jobsite-update.mutation";
import { JobSite, TimeCampTask, TimeCampUser } from "@ts-types/generated";
import { useTimeCampTaskQuery } from "@data/timecamp/use-timecamp-tasks.query";
import { useTimeCampUserQuery } from "@data/timecamp/use-timecamp-users.query";

export type JobSiteFormValues = {
  identifier: string;
  radius: number;
  latitude: number;
  longitude: number;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  taskId: null | number;
  createdBy: string;
  task?: TimeCampTask;
  jobSiteUsers: { userId: string; userEmail: string; user: TimeCampUser }[];
};

type IProps = {
  initialValues?: JobSite | null;
};

export default function CreateOrUpdateJobSiteForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    data: timecampTasks,
  } = useTimeCampTaskQuery();

  const {
    data: timecampUsers,
  } = useTimeCampUserQuery();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<JobSiteFormValues>({
    shouldUnregister: true,
    resolver: yupResolver(jobsiteValidationSchema),
    ...(Boolean(initialValues) && {
      defaultValues: {
        ...initialValues,
        task: {},
        users: [],
      } as any,
    }),
  });

  const [taskId, jobSiteUsers] = useWatch({
    control,
    name: ["taskId", "jobSiteUsers"],
  });

  useEffect(() => {
    if (timecampTasks?.length && taskId) {
      const task = timecampTasks.find((_task) => _task.task_id === taskId);
      setValue('task', task);
    }
  }, [timecampTasks]);

  const { mutate: createJobSite, isLoading: creating } =
    useCreateJobSiteMutation();
  const { mutate: updateJobSite, isLoading: updating } =
    useUpdateJobSiteMutation();

  const onSubmit = async (values: JobSiteFormValues) => {
    const {
      identifier,
      radius,
      latitude,
      longitude,
      notifyOnEntry,
      notifyOnExit,
      taskId,
      task,
      jobSiteUsers,
    } = values;
    const input = {
      identifier,
      radius,
      latitude,
      longitude,
      notifyOnEntry,
      notifyOnExit,
      taskId: task?.task_id || taskId || null,
      jobSiteUsers,
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
        setError(field.split(".")[1], {
          type: "manual",
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t("form:input-label-description")}
          details={`${initialValues
            ? t("form:item-description-edit")
            : t("form:item-description-add")
            } ${t("form:jobsite-form-description-details")}`}
          className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t("form:input-label-name")}
            {...register("identifier")}
            error={t(errors.identifier?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="mb-5">
            <Label>{t("form:input-label-notifyOnEntry")}</Label>
            <SwitchInput name="notifyOnEntry" control={control} />
          </div>

          <div className="mb-5">
            <Label>{t("form:input-label-notifyOnExit")}</Label>
            <SwitchInput name="notifyOnExit" control={control} />
          </div>

          <div className="mb-5">
            <Label>{t("form:input-label-taskId")}</Label>
            <AutoComplete name="task" control={control} data={timecampTasks || []}
              parseLabel={(item) => `${item?.name}${item?.projectName ? ` - ${item?.projectName}` : ''}` as string}
              parseValue={(item) => item?.task_id as string}
            />
          </div>
          <div className="mb-5">
            <Label>{t("form:input-label-user-assign")}</Label>
            <AutoComplete name="jobSiteUsers" control={control} data={timecampUsers || []}
              parseLabel={(item) => item?.userEmail as string}
              parseValue={(item) => item?.userEmail as string}
              multiple
            />
          </div>

        </Card>
      </div>

      <div className="flex flex-wrap pt-8 border-t border-dashed border-border-base my-5 sm:my-8">
        <Description
          title={t("form:input-label-jobsite-location")}
          details={t("form:jobsite-location-helper-text")}
          className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">

          <div className="mb-5">
            <Label>{t("form:input-label-map")}</Label>
            <MapWidget control={control} setValue={setValue} />
          </div>

          <Input
            label={t("form:input-label-radius")}
            {...register("radius")}
            error={t(errors.radius?.message!)}
            variant="outline"
            className="mb-5"
            type="number"
          />

          <Input
            label={t("form:input-label-longitude")}
            {...register("longitude")}
            error={t(errors.longitude?.message!)}
            variant="outline"
            className="mb-5"
            type="number"
            step="any"
          />

          <Input
            label={t("form:input-label-latitude")}
            {...register("latitude")}
            error={t(errors.latitude?.message!)}
            variant="outline"
            className="mb-5"
            type="number"
            step="any"
          />
        </Card>

      </div>

      <div className="mb-4 text-end">
        {initialValues && (
          <Button
            variant="outline"
            onClick={router.back}
            className="me-4"
            type="button"
          >
            {t("form:button-label-back")}
          </Button>
        )}

        <Button loading={updating || creating} disabled={updating || creating}>
          {initialValues
            ? t("form:button-label-update-jobsite")
            : t("form:button-label-add-jobsite")}
        </Button>
      </div>
    </form>
  );
}
