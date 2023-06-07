declare module 'react-sidebar' {
  import { Component } from 'react';

  interface SidebarProps {
    sidebar: React.ReactNode;
    open?: boolean;
    onSetOpen?: (open: boolean) => void;
    styles?: {
      sidebar?: React.CSSProperties;
      overlay?: React.CSSProperties;
      content?: React.CSSProperties;
    };
    pullRight?: boolean;
  }

  export default class Sidebar extends Component<SidebarProps> {}
}
