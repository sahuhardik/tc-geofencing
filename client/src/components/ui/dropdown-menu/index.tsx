import cn from 'classnames';
import { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
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
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center focus:outline-none">{actionButton}</Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="ul"
          className="absolute right-0 w-56 mt-1 origin-top-right bg-white rounded shadow-md focus:outline-none px-2 py-2 text-sm text-gray-700 dark:text-gray-200 z-10"
        >
          {menuButtons.map((menuButton, i) => (
            <Menu.Item key={i}>
              <li
                key={i}
                className={cn(styles.dropdownItems, styles.dropdownActiveItem)}
                onClick={() => menuButton.onClick()}
              >
                {menuButton.icon ?? null}
                {menuButton.label}
              </li>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
export default DropdownMenu;
