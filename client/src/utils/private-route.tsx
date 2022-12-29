import React from "react";
import { useRouter } from "next/router";
import { getAuthCredentials } from "./auth-utils";
import Loader from "@components/ui/loader/loader";
import { ROUTES } from "./routes";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { token } = getAuthCredentials();
  const isUser = !!token;
  React.useEffect(() => {
    if (!isUser) router.replace(ROUTES.LOGIN); // If not authenticated, force log in
  }, [isUser]);

  if (isUser) {
    return <>{children}</>;
  }
  // return <AccessDeniedPage />;

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <></>;
};

export default PrivateRoute;
