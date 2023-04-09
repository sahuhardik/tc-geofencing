import type { AppProps } from 'next/app';
import '@fontsource/open-sans';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import 'react-toastify/dist/ReactToastify.css';
import '@assets/main.css';
import '@assets/jobsite-map.css';
import { UIProvider } from '@contexts/ui.context';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { useRef } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
import { appWithTranslation } from 'next-i18next';
import { ModalProvider } from '@components/ui/modal/modal.context';
import DefaultSeo from '@components/ui/default-seo';
import PrivateRoute from '@utils/private-route';
import ManagedModal from '@components/ui/modal/managed-modal';

const Noop: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const queryClientRef = useRef<any>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  const Layout = (Component as any).Layout || Noop;
  const authProps = (Component as any).authenticate;

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <Hydrate state={(pageProps as { dehydratedState: unknown }).dehydratedState}>
        <UIProvider>
          <ModalProvider>
            <>
              <DefaultSeo />
              {authProps ? (
                <PrivateRoute>
                  <Layout {...pageProps}>
                    <Component {...pageProps} />
                  </Layout>
                </PrivateRoute>
              ) : (
                <Layout {...pageProps}>
                  <Component {...pageProps} />
                </Layout>
              )}
              <ToastContainer autoClose={2000} theme="colored" />
              <ManagedModal />
            </>
          </ModalProvider>
        </UIProvider>
        <ReactQueryDevtools />
      </Hydrate>
    </QueryClientProvider>
  );
};

export default appWithTranslation(CustomApp);
