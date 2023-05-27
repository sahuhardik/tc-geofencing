import React, { useState } from 'react';
import styles from './styles.module.css';
import { Popover, Transition } from '@headlessui/react';
import { TimeCampGroup as Group, TimeCampUser as User } from '@ts-types/generated';

interface GroupPickerProps {
  items: Group[];
}

const GroupPicker: React.FC<GroupPickerProps> = ({ items }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const handleGroupSelection = (group: Group) => {
    const isSelected = selectedGroups.some((selectedGroup) => selectedGroup.group_id === group.group_id);

    if (isSelected) {
      // Deselect group and its subgroups/users
      const deselectedGroupIds = getAllSubgroupIds(group);
      setSelectedGroups((prevSelectedGroups) =>
        prevSelectedGroups.filter((selectedGroup) => !deselectedGroupIds.includes(selectedGroup.group_id))
      );
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter(
          (selectedUser) =>
            !deselectedGroupIds.includes(selectedUser.group_id) && selectedUser.parent_id !== group.group_id
        )
      );
    } else {
      // Select group and its subgroups/users
      const selectedGroupIds = [group.group_id, ...getAllSubgroupIds(group)];
      setSelectedGroups((prevSelectedGroups) => [
        ...prevSelectedGroups,
        ...selectedGroupIds.map((groupId) => items.find((item) => item.group_id === groupId)!),
      ]);
      setSelectedUsers((prevSelectedUsers) => [
        ...prevSelectedUsers,
        ...group.users,
        ...getAllSubgroupUsers(group.childrens),
      ]);
    }
  };

  const handleUserSelection = (user: User) => {
    const isSelected = selectedUsers.some((selectedUser) => selectedUser.user_id === user.user_id);

    if (isSelected) {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((selectedUser) => selectedUser.user_id !== user.user_id)
      );
    } else {
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prevExpandedGroups) => {
      if (prevExpandedGroups.includes(groupId)) {
        return prevExpandedGroups.filter((id) => id !== groupId);
      } else {
        return [...prevExpandedGroups, groupId];
      }
    });
  };

  const renderGroup = (group: Group, nestingLevel: number) => {
    const isSubGroup = nestingLevel > 0;
    const isExpanded = expandedGroups.includes(group.group_id);
    const isSelected = selectedGroups
      .filter(Boolean)
      .some((selectedGroup) => selectedGroup.group_id === group.group_id);

    return (
      <div
        className={`${styles.group} ${isSubGroup ? styles.subGroup : ''}`}
        style={{ marginLeft: `${nestingLevel * 10}px` }}
        key={group.group_id}
      >
        <div className={styles.groupTitle} onClick={() => toggleGroup(group.group_id)}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={isSelected}
            onChange={() => handleGroupSelection(group)}
          />
          <span>{group.name}</span>
        </div>
        {isExpanded && (
          <div className={styles.groupContent}>
            {group.childrens.map((childGroup) => renderGroup(childGroup, nestingLevel + 1))}
            {group.users.map((user) => {
              const isUserSelected = selectedUsers.some((selectedUser) => selectedUser.user_id === user.user_id);
              return (
                <div key={user.user_id} className={styles.user}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isUserSelected}
                    onChange={() => handleUserSelection(user)}
                  />
                  <span>{user.email}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const getAllSubgroupIds = (group: Group): string[] => {
    let subgroupIds: string[] = [];

    group.childrens.forEach((childGroup) => {
      subgroupIds.push(childGroup.group_id);
      subgroupIds = subgroupIds.concat(getAllSubgroupIds(childGroup));
    });

    return subgroupIds;
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
      <Popover.Button className={styles.popoverButton}>Open Group Picker</Popover.Button>
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
          <div className={styles.modal}>
            <input
              type="text"
              placeholder="Search..."
              value={searchKeyword}
              onChange={handleSearch}
              className={styles.searchBar}
            />
            <div className={styles.groupPicker}>{filteredItems.map((group) => renderGroup(group, 0))}</div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default GroupPicker;
