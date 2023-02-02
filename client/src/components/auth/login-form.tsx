import Alert from "@components/ui/alert";
import Button from "@components/ui/button";
import Input from "@components/ui/input";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ROUTES } from "@utils/routes";
import { useLoginMutation } from "@data/user/use-login.mutation";
import { useTranslation } from "next-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { setAuthCredentials } from "@utils/auth-utils";

type FormValues = {
  token: string;
};

const loginFormSchema = yup.object().shape({
  token: yup
    .string()
    .required("form:error-token-required"),
});

const defaultValues = {
  token: "",
};

const LoginForm = () => {
  const { mutate: login, isLoading: loading } = useLoginMutation();
  const [errorMsg, setErrorMsg] = useState("");
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: yupResolver(loginFormSchema),
  });

  const router = useRouter();

  function onSubmit({ token }: FormValues) {
    login(
      {
        variables: {
          token
        },
      },
      {
        onSuccess: ({ data }) => {
          if (data?.token) {

            setAuthCredentials(data?.token);
            router.push(ROUTES.DASHBOARD);
            return;
          } else {
            setErrorMsg("form:error-credential-wrong");
          }
        },
        onError: () => { },
      }
    );
  }
  return (
    <>
        <Input
          label={t("form:input-label-token")}
          {...register("token")}
          type="token"
          variant="outline"
          className="mb-4"
          error={t(errors?.token?.message!)}
        />
        <Button onClick={handleSubmit(onSubmit)} className="w-full" loading={loading} disabled={loading}>
          {t("form:button-label-login")}
        </Button>

        {errorMsg ? (
          <Alert
            message={t(errorMsg)}
            variant="error"
            closeable={true}
            className="mt-5"
            onClose={() => setErrorMsg("")}
          />
        ) : null}
    </>
  );
};

export default LoginForm;
