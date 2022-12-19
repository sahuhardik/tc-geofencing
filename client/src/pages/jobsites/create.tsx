import Layout from "@components/layouts/admin";
import JobSiteCreateOrUpdateForm from "@components/jobsite/jobsite-form";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function CreateJobSitePage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="py-5 sm:py-8 flex border-b border-dashed border-border-base">
        <h1 className="text-lg font-semibold text-heading">
          {t("form:form-title-create-jobsite")}
        </h1>
      </div>
      <JobSiteCreateOrUpdateForm />
    </>
  );
}
CreateJobSitePage.authenticate = {};
CreateJobSitePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ["form", "common"])),
  },
});
