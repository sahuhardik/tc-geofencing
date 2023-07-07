import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { Popover, Transition } from '@headlessui/react';
import { TimeCampGroup as Group, TimeCampUser as User } from '@ts-types/generated';
import Accordion from '@components/common/accordion';
import _ from 'lodash';
import cn from 'classnames';
import ChevronUp from '@components/icons/chevron-up';

interface GroupPickerProps {
  items: Group[];
  onChange?(selectedGroup: Group[], selectedUsers: User[]): void;
  initialGroupIds?: string[];
  initialUserIds?: string[];
}

const GroupPicker: React.FC<GroupPickerProps> = ({ items, onChange, initialGroupIds, initialUserIds }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const distinctUsers = (users: User[]) => _.uniqBy(users, 'user_id');
  const distinctGroups = (groups: Group[]): Group[] => {
    return _.uniqBy(groups, (group) => group.group_id);
  };
  useEffect(() => {
    if (initialGroupIds && initialGroupIds.length) {
      const allGroupsList = items.map((group) => [group, ...getAllSubgroups(group)]).flat();
      const initialGroups = initialGroupIds
        .map((groupId) => allGroupsList.find((group) => group.group_id === groupId))
        .filter(Boolean) as Group[];
      setSelectedGroups(initialGroups); // initialing group picker with initial groups
    }
    if (initialUserIds && initialUserIds.length) {
      const allUsersList = items.map((group) => [...group.users, ...getAllSubgroupUsers(group.childrens)]).flat();
      const initialUsers = initialUserIds
        .map((userId) => allUsersList.find((user) => user.user_id === userId))
        .filter(Boolean) as User[];
      setSelectedUsers(distinctUsers(initialUsers)); // initialing group picker with initial groups
    }
  }, []);

  useEffect(() => {
    if (onChange) {
      onChange(selectedGroups, selectedUsers);
    }
  }, [selectedGroups, selectedUsers]);

  useEffect(() => {
    const recursiveSelectedGroup = getRecursiveSelectedGroups();
    setSelectedGroups(recursiveSelectedGroup);
  }, [selectedUsers]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const getRecursiveSelectedGroups = () => {
    const filteredGroups: Group[] = [];

    function isGroupSelected(group: Group): boolean {
      let isThisGroupSelected = false;
      const isAllUsersOfThisSelected = group.users.every(
        (user) => !!selectedUsers.find((_user) => _user.user_id === user.user_id)
      );

      if (group.childrens.length === 0) {
        // having no clildrens
        if (group.users.length > 0) {
          if (isAllUsersOfThisSelected) {
            isThisGroupSelected = true;
          }
        } else {
          isThisGroupSelected = Boolean(selectedGroups.find((_group) => _group.group_id === group.group_id));
        }

        if (isThisGroupSelected) {
          filteredGroups.push(group);
        }

        return isThisGroupSelected;
      }

      const isChilrenGroupSelected = group.childrens.reduce(
        (isChilrenGroupSelected, childGroup) => isGroupSelected(childGroup) && isChilrenGroupSelected,
        true
      );

      if (group.users.length) {
        isThisGroupSelected = isChilrenGroupSelected && isAllUsersOfThisSelected;
      } else {
        isThisGroupSelected = isChilrenGroupSelected;
      }

      if (isThisGroupSelected) {
        filteredGroups.push(group);
      }
      return isThisGroupSelected;
    }

    items.forEach(isGroupSelected);
    return filteredGroups;
  };

  const handleGroupSelection = (group: Group) => {
    const isSelected = selectedGroups.some((selectedGroup) => selectedGroup.group_id === group.group_id);

    if (isSelected) {
      // Deselect group and its subgroups/users
      const deselectedGroupIds = [group, ...getAllSubgroups(group)].map((group) => group.group_id);
      setSelectedGroups((prevSelectedGroups) =>
        prevSelectedGroups.filter((selectedGroup) => !deselectedGroupIds.includes(selectedGroup.group_id))
      );
      setSelectedUsers((prevSelectedUsers) =>
        distinctUsers(
          prevSelectedUsers.filter(
            (selectedUser) =>
              !deselectedGroupIds.includes(selectedUser.group_id) && selectedUser.group_id !== group.group_id
          )
        )
      );
    } else {
      // Select group and its subgroups/users
      const selectedGroups = [group, ...getAllSubgroups(group)];
      setSelectedGroups((prevSelectedGroups) => distinctGroups([...prevSelectedGroups, ...selectedGroups]));
      setSelectedUsers((prevSelectedUsers) =>
        distinctUsers([...prevSelectedUsers, ...group.users, ...getAllSubgroupUsers(group.childrens)])
      );
    }
  };

  const handleUserSelection = (user: User) => {
    const isSelected = selectedUsers.some((selectedUser) => selectedUser.user_id === user.user_id);

    if (isSelected) {
      setSelectedUsers((prevSelectedUsers) =>
        distinctUsers(prevSelectedUsers.filter((selectedUser) => selectedUser.user_id !== user.user_id))
      );
    } else {
      setSelectedUsers((prevSelectedUsers) => distinctUsers([...prevSelectedUsers, user]));
    }
  };

  const renderGroup = (group: Group, nestingLevel: number) => {
    const isSubGroup = nestingLevel > 0;
    const isSelected = selectedGroups
      .filter(Boolean)
      .some((selectedGroup) => selectedGroup.group_id === group.group_id);

    return (
      <div
        className={`${styles.group} ${isSubGroup ? styles.subGroup : ''}`}
        style={{ marginLeft: `${nestingLevel * 5}px` }}
        key={group.group_id}
      >
        <Accordion
          key={group.group_id}
          headerClasses={styles.accordionHeader}
          containerClasses={styles.accordionContainer}
          isOn={!!searchKeyword}
          heading={
            <div
              className={styles.groupTitle}
              onClick={(e) => {
                e.stopPropagation();
                handleGroupSelection(group);
              }}
            >
              <input type="checkbox" className={styles.checkbox} checked={isSelected} />
              <span className={styles.groupName}>{group.name}</span>
            </div>
          }
        >
          <div className={styles.groupContent}>
            {group.childrens.map((childGroup) => renderGroup(childGroup, nestingLevel + 1))}
            {group.users.map((user) => {
              const isUserSelected = selectedUsers.some((selectedUser) => selectedUser.user_id === user.user_id);
              return (
                <div key={user.user_id} className={styles.user}>
                  <input
                    id={user.user_id}
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isUserSelected}
                    onChange={() => handleUserSelection(user)}
                  />
                  <label htmlFor={user.user_id} className={styles.userText}>
                    {user.email}
                  </label>
                </div>
              );
            })}
          </div>
        </Accordion>
      </div>
    );
  };

  const getAllSubgroups = (group: Group): Group[] => {
    let subgroups: Group[] = [];

    group.childrens.forEach((childGroup) => {
      subgroups.push(childGroup);
      subgroups = subgroups.concat(getAllSubgroups(childGroup));
    });

    return distinctGroups(subgroups);
  };

  const getAllSubgroupUsers = (groups: Group[]): User[] => {
    let users: User[] = [];

    groups.forEach((group) => {
      users = [...users, ...group.users, ...getAllSubgroupUsers(group.childrens)];
    });

    return users;
  };

  const filterItems = (groups: Group[], searchQuery: string): Group[] => {
    const filteredGroups: Group[] = [];

    groups.forEach((group) => {
      const subgroups = filterItems(group.childrens, searchQuery);
      const filteredUsers = group.users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.display_name && user.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      if (
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        filteredUsers.length > 0 ||
        subgroups.length > 0
      ) {
        filteredGroups.push({
          ...group,
          childrens: subgroups,
          users: filteredUsers,
        });
      }
    });

    return filteredGroups;
  };

  const filteredItems = filterItems(items, searchKeyword);

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button className={cn(styles.popoverButton, open && styles.popoverButtonActive)}>
            <img
              className={styles.btnProfileIcon}
              src="https://www.gravatar.com/avatar/463e3d4aa9ac0f502960a196c1a2d56f?s=120&amp;d=mm"
            />
            <span className={styles.btnChip}>{selectedUsers.length}</span>
            Open Group Picker
            <span className={cn(styles.chevron, open && styles.chevronDown)}>
              <ChevronUp />
            </span>
          </Popover.Button>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Popover.Panel style={{ position: 'absolute', zIndex: 9999 }}>
              <div className={styles.panelContainer}>
                <input
                  type="text"
                  placeholder="Search user/group name..."
                  value={searchKeyword}
                  onChange={handleSearch}
                  className={styles.searchBar}
                />
                <div className={styles.groupPicker}>{filteredItems.map((group) => renderGroup(group, 0))}</div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default GroupPicker;
