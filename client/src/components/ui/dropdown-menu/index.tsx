import cn from 'classnames';
import Script from 'next/script';
import { ReactNode } from 'react';
import styles from './dropdown-menu.module.css';

const DropdownMenu = ({
  id,
  actionButton,
  menuButtons,
}: {
  id: string | number;
  actionButton: ReactNode;
  dropdownContainerClass?: string;
  menuButtons: Array<{
    icon?: ReactNode;
    label: string;
    onClick: Function;
  }>;
}) => {
  return (
    <>
      <Script src="https://unpkg.com/flowbite@1.5.1/dist/flowbite.js" />
      <div id={`dropdownDefaultButton${id}`} data-dropdown-toggle={`dropdown${id}`}>
        {actionButton}
      </div>
      <div id={`dropdown${id}`} className={`absolute z-10 hidden ${styles.cardContainer}`}>
        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby={`dropdownDefaultButton${id}`}>
          {menuButtons.map((menuButton, i) => (
            <li key={i} className={cn(styles.dropdownItems, styles.dropdownActiveItem)} onClick={() => menuButton.onClick()}>
              {menuButton.icon ?? null}
              {menuButton.label}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default DropdownMenu;
