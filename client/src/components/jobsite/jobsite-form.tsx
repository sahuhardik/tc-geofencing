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
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import { jobsiteValidationSchema } from "./jobsite-validation-schema";
import { useCreateJobSiteMutation } from "@data/jobsite/use-jobsite-create.mutation";
import { useUpdateJobSiteMutation } from "@data/jobsite/use-jobsite-update.mutation";
import { JobSite, TimeCampTask, TimeCampUser } from "@ts-types/generated";
import { useTimeCampTaskQuery } from "@data/timecamp/use-timecamp-tasks.query";
import { useTimeCampUserQuery } from "@data/timecamp/use-timecamp-users.query";
import { useEffect } from "react";

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
  users: TimeCampUser[];
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
        users: []
      } as any,
    }),
  });

  const [taskId, users] = useWatch({
    control,
    name: ["taskId", "users"],
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
    } = values;
    const input = {
      identifier,
      radius,
      latitude,
      longitude,
      notifyOnEntry,
      notifyOnExit,
      taskId: task?.task_id || taskId || null,
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

  const handleDeselect = (id: string) => {
    const selectedPersonsUpdated = users.filter((el) => Number(el.user_id) !== Number(id));
    setValue('users', selectedPersonsUpdated);
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
              renderSuggestion={(val: any) => <span className="inline-block">{val?.name}<br />{val?.projectName}</span>}
              getSuggestionValue={(val: any) => val?.name}
              searchField={['name', 'projectName']}
              id="taskId"
            />
          </div>

          <div className="mb-5">
            <Label>{t("form:input-label-user-assign")}</Label>
            <AutoComplete name="users" control={control} data={timecampUsers || []}
              renderSuggestion={(val: any) => <span className="inline-block	">{val?.display_name}{val?.display_name ? <br /> : null}{val?.email}</span>}
              getSuggestionValue={(val: any) => val?.display_name}
              searchField={['display_name', 'email']}
              id="user_id"
              multiple
            />
            {users && users.map((user) => (
              <span key={user.user_id} id="badge-dismiss-default" className="inline-flex items-center py-1 px-2 mr-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-200 dark:text-blue-800">
                {user.email}
                <button type="button" className="inline-flex items-center p-0.5 ml-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-300 dark:hover:text-blue-900" data-dismiss-target="#badge-dismiss-default" aria-label="Remove" onClick={() => handleDeselect(user.user_id)}>
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  <span className="sr-only">Remove badge</span>
                </button>
              </span>
            ))}
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

        <Button loading={updating || creating}>
          {initialValues
            ? t("form:button-label-update-jobsite")
            : t("form:button-label-add-jobsite")}
        </Button>
      </div>
    </form>
  );
}
