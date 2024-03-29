export declare type Maybe<T> = T | null;
export declare type InputMaybe<T> = Maybe<T>;

/** All built-in and custom scalars, mapped to their actual values */
export declare type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A datetime string with format `Y-m-d H:i:s`, e.g. `2018-05-23 13:43:32`. */
  DateTime: any;
  /**
   * Loose type that allows any value. Be careful when passing in large `Int` or `Float` literals,
   * as they may not be parsed correctly on the server side. Use `String` literals if you are
   * dealing with really large numbers to be on the safe side.
   */
  Mixed: any;
  Upload: any;
  /** A date string with format `Y-m-d`, e.g. `2011-05-23`. */
  Date: any;
  /** A datetime and timezone string in ISO 8601 format `Y-m-dTH:i:sO`, e.g. `2020-04-20T13:53:12+02:00`. */
  DateTimeTz: any;
};

export declare type User = {
  user_id: Scalars['String'];
  email: Scalars['String'];
  display_name: Scalars['String'];
  time_zone: Scalars['String'];
  token: Scalars['String'];
};

/** Pagination information about the corresponding list of items. */
export declare type PaginatorInfo = {
  /** Total count of available items in the page. */
  count: Scalars['Int'];
  /** Current pagination page. */
  currentPage: Scalars['Int'];
  /** If collection has more pages. */
  hasMorePages: Scalars['Boolean'];
  /** Last page number of the collection. */
  lastPage: Scalars['Int'];
  /** Number of items per page in the collection. */
  perPage: Scalars['Int'];
  /** Total items available in the collection. */
  total: Scalars['Int'];
};

/** The available directions for ordering a list of records. */
export enum SortOrder {
  /** Sort records in ascending order. */
  Asc = 'asc',
  /** Sort records in descending order. */
  Desc = 'desc',
}

export declare type LoginInput = {
  token: Scalars['String'];
};

export declare type CreateJobSiteInput = {
  identifier: Scalars['String'];
  radius: Scalars['Float'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  notifyOnEntry: Scalars['Boolean'];
  notifyOnExit: Scalars['Boolean'];
  taskId: null | Scalars['Float'];
};

export declare type UpdateJobSiteInput = {
  identifier: Scalars['String'];
  radius: Scalars['Float'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  notifyOnEntry: Scalars['Boolean'];
  notifyOnExit: Scalars['Boolean'];
  taskId: null | Scalars['Float'];
  id: Scalars['ID'];
};

export declare type JobSite = {
  __typename?: 'JobSite';
  identifier: Scalars['String'];
  radius: Scalars['Float'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  address: Scalars['String'];
  notifyOnEntry: Scalars['Boolean'];
  pushNotification: Scalars['Boolean'];
  notifyOnExit: Scalars['Boolean'];
  taskId: null | Scalars['Float'];
  createdBy: Scalars['String'];
  id: Scalars['ID'];
  createdAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  jobSiteUsers?: Maybe<JobSiteUser[]>;
  jobSiteGroups?: Maybe<JobSiteGroup[]>;
};

/** A paginated list of JobSite items. */
export declare type JobSitePaginator = {
  __typename?: 'JobSitePaginator';
  /** A list of JobSite items. */

  data: Array<JobSite>;
  /** Pagination information about the list of items. */

  paginatorInfo: PaginatorInfo;
};

export declare type TimeCampTask = {
  __typename?: 'TimeCampTask';
  task_id: Scalars['Mixed'];
  name: Scalars['String'];
  color: Scalars['String'];
  parentName: Scalars['String'];
  parent_id: Scalars['Mixed'];
};

export declare type TimeCampUser = {
  __typename?: 'TimeCampUser';
  user_id: Scalars['String'];
  email: Scalars['String'];
  display_name: Scalars['String'];
  time_zone?: Scalars['String'];
  token?: Scalars['String'];
  group_id: Scalars['String'];
};

export declare type JobSiteUser = {
  __typename?: 'JobSiteUser';
  userId: Scalars['String'];
  userEmail: Scalars['String'];
  user: TimeCampUser;
  lastPosition?: {
    lat: Scalars['Float'];
    lng: Scalars['Float'];
  };
  isActive?: boolean;
};

export declare type JobSiteGroup = {
  __typename?: 'JobSiteGroup';
  jobsiteId: Scalars['String'];
  groupId: Scalars['String'];
};

export declare type TimeCampEntry = {
  __typename?: 'TimeCampEntry';
  date: Scalars['String'];
  description: Scalars['String'];
  duration: Scalars['String'];
  end_time: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  user_id: Scalars['String'];
  task_id: Scalars['String'];
  start_time: Scalars['String'];
  task_note: Scalars['String'];
};

export declare type TimeCampGroup = {
  __typename?: 'TimeCampGroup';
  group_id: Scalars['String'];
  name: Scalars['String'];
  parent_id: Scalars['String'];
  childrens: TimeCampGroup[];
  users: TimeCampUser[];
};
