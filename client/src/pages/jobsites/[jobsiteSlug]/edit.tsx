import Layout from '@components/layouts/admin';
import ManufacturerCreateOrUpdateForm from '@components/jobsite/jobsite-form';
import ErrorMessage from '@components/ui/error-message';
import Loader from '@components/ui/loader/loader';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useJobSiteQuery } from '@data/jobsite/use-jobsite.query';

export default function UpdateJobsitePage() {
  const { query } = useRouter();
  const { t } = useTranslation();
  const { data, isLoading: loading, error } = useJobSiteQuery(query.jobsiteSlug as string);
  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  return (
    <>
      <div className="py-5 sm:py-8 flex border-b border-dashed border-border-base">
        <h1 className="text-lg font-semibold text-heading">{t('form:form-title-update-manufacturer')}</h1>
      </div>
      <ManufacturerCreateOrUpdateForm initialValues={data} />
    </>
  );
}
UpdateJobsitePage.authenticate = {};
UpdateJobsitePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
