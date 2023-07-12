import _ from 'lodash';
import { IUser } from '../timecamp/types/user.interface';
import { IUserGroup, IUserGroupNode, TGroupSet } from '../timecamp/types/types';

export const buildGroupHierarchy = (
  groups: IUserGroup[],
  users: IUser[],
): Record<string, IUserGroupNode> => {
  const groupSet = groups.reduce((groupSet, group) => {
    groupSet[group.group_id] = {
      ...group,
      childrens: [],
      users: [],
    } as IUserGroupNode;
    return groupSet;
  }, {} as Record<string, IUserGroupNode>);

  const childrenGroupsIds = [];

  Object.values(groupSet).forEach((group) => {
    if (group.parent_id != '0' && group.parent_id) {
      groupSet[group.parent_id].childrens.push(group);
      childrenGroupsIds.push(group.group_id);
    }
  });

  users.forEach((user) => {
    groupSet[user.group_id].users.push(user);
  });

  childrenGroupsIds.forEach((childrenGroupsId) => {
    delete groupSet[childrenGroupsId];
  });

  return groupSet;
};

export const filterGroupsWithAccesses = (
  groupSet: TGroupSet,
  adminInGroups: Record<string, boolean>,
) => {
  const _groupSet = _.cloneDeep(groupSet);

  function filterGroupsHierarchy(group) {
    if (adminInGroups[group.group_id]) {
      return true;
    } else {
      group.users = [];

      if (group.childrens.length === 0) {
        return false;
      }

      group.childrens = group.childrens.filter((childGroup) => {
        return filterGroupsHierarchy(childGroup);
      });

      return group.childrens.length > 0;
    }
  }

  filterGroupsHierarchy(Object.values(_groupSet)[0]);
  return _groupSet;
};

export const getUsersFromGroupSets = (group: IUserGroupNode): IUser[] => {
  return [
    ...group.users,
    ...group.childrens.map((group) => getUsersFromGroupSets(group)).flat(),
  ];
};
