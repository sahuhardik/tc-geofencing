import dynamic from "next/dynamic";
import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  getAuthCredentials,
  isAuthenticated,
} from "@utils/auth-utils";
import { ROUTES } from "@utils/routes";
import AppLayout from "@components/layouts/app";

const AdminDashboard = dynamic(() => import("@components/dashboard/admin"));

export default function Dashboard() {
  return <AdminDashboard />;
}

Dashboard.Layout = AppLayout;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx;
  const { token } = getAuthCredentials(ctx);
  if (
    !isAuthenticated({ token })
  ) {
    return {
      redirect: {
        destination: ROUTES.LOGIN,
        permanent: false,
      },
    };
  }
  if (locale) {
    return {
      props: {
        ...(await serverSideTranslations(locale, [
          "common",
          "table",
          "widgets",
        ]))
      },
    };
  }
  return {
    props: {},
  };
};
