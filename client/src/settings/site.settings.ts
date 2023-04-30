import { ROUTES } from '@utils/routes';

export const siteSettings = {
  name: 'TimeCamp',
  description: '',
  logo: {
    url: '/logo.svg',
    alt: 'TimeCamp',
    href: '/',
    width: 128,
    height: 40,
  },
  defaultLanguage: 'en',
  author: {
    name: 'TimeCamp Inc.',
    websiteUrl: 'https://www.timecamp.com',
    address: '',
  },
  headerLinks: [],
  authorizedLinks: [
    {
      href: ROUTES.LOGOUT,
      labelTransKey: 'authorized-nav-item-logout',
    },
  ],
  currencyCode: 'USD',
  sidebarLinks: {
    admin: [
      {
        href: ROUTES.DASHBOARD,
        label: 'sidebar-nav-item-dashboard',
        icon: 'DashboardIcon',
      },
      {
        href: ROUTES.JOBSITES,
        label: 'sidebar-nav-item-jobsites',
        icon: 'LocationIcon',
      },
      {
        href: ROUTES.REPORT,
        label: 'sidebar-nav-item-report',
        icon: 'ReportIcon',
      },
    ],
  },
  product: {
    placeholder: '/product-placeholder.svg',
  },
  avatar: {
    placeholder: '/avatar-placeholder.svg',
  },
};
