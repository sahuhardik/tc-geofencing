import Input from "@components/ui/input";
import { useForm } from "react-hook-form";
import Button from "@components/ui/button";
import TextArea from "@components/ui/text-area";
import { getErrorMessage } from "@utils/form-error";
import Description from "@components/ui/description";
import Card from "@components/common/card";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import { jobsiteValidationSchema } from "./jobsite-validation-schema";
import { useCreateJobSiteMutation } from "@data/jobsite/use-jobsite-create.mutation";
import { useUpdateJobSiteMutation } from "@data/jobsite/use-jobsite-update.mutation";
import { JobSite } from "@ts-types/generated";

type FormValues = {
  identifier: string;
  radius: number;
  latitude: number;
  longitude: number;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  taskId: null | number;
  createdBy: string;
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
    register,
    handleSubmit,
    control,
    setError,

    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    resolver: yupResolver(jobsiteValidationSchema),
    ...(Boolean(initialValues) && {
      defaultValues: {
        ...initialValues
      } as any,
    }),
  });

  const { mutate: createJobSite, isLoading: creating } =
    useCreateJobSiteMutation();
  const { mutate: updateJobSite, isLoading: updating } =
    useUpdateJobSiteMutation();

  const onSubmit = async (values: FormValues) => {
    // const {
    //   identifier,
    //   radius,
    //   latitude,
    //   longitude,
    //   notifyOnEntry,
    //   notifyOnExit,
    //   taskId,
    //   createdBy,
    // } = values;
    // const input = {
    //   name,
    //   description,
    //   is_approved,
    //   website,
    //   socials: socials
    //     ? socials?.map((social: any) => ({
    //       icon: social?.icon?.value,
    //       url: social?.url,
    //     }))
    //     : [],
    //   image: {
    //     thumbnail: image?.thumbnail,
    //     original: image?.original,
    //     id: image?.id,
    //   },
    //   cover_image: {
    //     thumbnail: cover_image?.thumbnail,
    //     original: cover_image?.original,
    //     id: cover_image?.id,
    //   },
    //   type_id: type?.id!,
    // };
    try {
      if (initialValues) {
        // updateJobSite({
        //   variables: {
        //     input: {
        //       ...input,
        //       id: initialValues.id!,
        //       shop_id: shopId,
        //     },
        //   },
        // });
      } else {
        // createJobSite({
        //   variables: {
        //     input: {
        //       ...input,
        //       shop_id: shopId,
        //     },
        //   },
        // });
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
      <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
        <Description
          title={t("form:input-label-logo")}
          details={t("form:manufacturer-image-helper-text")}
          className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
        />
      </div>
      <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
        <Description
          title={t("form:input-label-cover-image")}
          details={t("form:manufacturer-cover-image-helper-text")}
          className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
        />
      </div>

      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t("form:input-label-description")}
          details={`${initialValues
            ? t("form:item-description-edit")
            : t("form:item-description-add")
            } ${t("form:manufacturer-form-description-details")}`}
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

          <Input
            label={t("form:input-label-website")}
            {...register("radius")}
            error={t(errors.radius?.message!)}
            variant="outline"
            className="mb-5"
          />

          <Input
            label={t("form:input-label-website")}
            {...register("longitude")}
            error={t(errors.longitude?.message!)}
            variant="outline"
            className="mb-5"
          />

          <Input
            label={t("form:input-label-website")}
            {...register("latitude")}
            error={t(errors.latitude?.message!)}
            variant="outline"
            className="mb-5"
          />

          <TextArea
            label={t("form:input-label-description")}
            {...register("latitude")}
            variant="outline"
            className="mb-5"
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
            ? t("form:button-label-update-manufacturer-publication")
            : t("form:button-label-add-jobsite-publication")}
        </Button>
      </div>
    </form>
  );
}
