import { JobSite } from '@ts-types/generated';
import Accordion from '@components/common/accordion';
import styles from './jobstie-list.module.css';
import { ILatLng, mapMarkerColors } from '@components/widgets/google-map-components';
import DropdownMenu from '@components/ui/dropdown-menu';
import { useModalAction } from '@components/ui/modal/modal.context';

type IProps = {
  jobsites?: Array<JobSite>;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
  setMapCenter: (center: ILatLng) => void;
  onEditJobSite: (jobsite: JobSite) => void;
};

interface IJobsiteItemProps extends JobSite {
  markerColor: string;
  actionCard?: React.ReactNode;
  open?: boolean;
}
interface IJobsiteItemCardHeadingProps extends JobSite {
  markerColor: string;
}

const JobsiteItemCardHeading = (jobsite: IJobsiteItemCardHeadingProps) => {
  return (
    <>
      <div
        className={`property mb-3 ${styles.propertyIcon}`}
        style={{
          backgroundColor: jobsite.markerColor,
        }}
        ref={(domRef) => domRef?.style.setProperty('--defaultMarker-color', jobsite.markerColor)}
      >
        <div className={`${styles.iconSvg}`}>
          <svg width="14px" height="13px" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.36048 1.6735C2.15096 1.6735 1.97953 1.84493 1.97953 2.05445V11.1973C1.97953 11.4068 2.15096 11.5783 2.36048 11.5783H4.26524V10.0544C4.26524 9.4235 4.77715 8.91159 5.4081 8.91159C6.03905 8.91159 6.55096 9.4235 6.55096 10.0544V11.5783H8.45572C8.66524 11.5783 8.83667 11.4068 8.83667 11.1973V2.05445C8.83667 1.84493 8.66524 1.6735 8.45572 1.6735H2.36048ZM0.83667 2.05445C0.83667 1.21397 1.52 0.53064 2.36048 0.53064H8.45572C9.29619 0.53064 9.97953 1.21397 9.97953 2.05445V11.1973C9.97953 12.0378 9.29619 12.7211 8.45572 12.7211H2.36048C1.52 12.7211 0.83667 12.0378 0.83667 11.1973V2.05445ZM2.93191 3.00683C2.93191 2.79731 3.10334 2.62588 3.31286 2.62588H4.45572C4.66524 2.62588 4.83667 2.79731 4.83667 3.00683V4.14969C4.83667 4.35921 4.66524 4.53064 4.45572 4.53064H3.31286C3.10334 4.53064 2.93191 4.35921 2.93191 4.14969V3.00683ZM6.36048 2.62588H7.50334C7.71286 2.62588 7.88429 2.79731 7.88429 3.00683V4.14969C7.88429 4.35921 7.71286 4.53064 7.50334 4.53064H6.36048C6.15096 4.53064 5.97953 4.35921 5.97953 4.14969V3.00683C5.97953 2.79731 6.15096 2.62588 6.36048 2.62588ZM2.93191 6.05445C2.93191 5.84492 3.10334 5.6735 3.31286 5.6735H4.45572C4.66524 5.6735 4.83667 5.84492 4.83667 6.05445V7.19731C4.83667 7.40683 4.66524 7.57826 4.45572 7.57826H3.31286C3.10334 7.57826 2.93191 7.40683 2.93191 7.19731V6.05445ZM6.36048 5.6735H7.50334C7.71286 5.6735 7.88429 5.84492 7.88429 6.05445V7.19731C7.88429 7.40683 7.71286 7.57826 7.50334 7.57826H6.36048C6.15096 7.57826 5.97953 7.40683 5.97953 7.19731V6.05445C5.97953 5.84492 6.15096 5.6735 6.36048 5.6735Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
      <div>
        <span className={styles.jobHeading}>{jobsite.identifier}</span>
        <p className={styles.jobSubheading}>{jobsite.address}</p>
      </div>
    </>
  );
};

const JobsiteCardDetail = (jobsite: JobSite) => {
  return (
    <div className={styles.jobsiteAccordionBody}>
      <div className="flex mb-1">
        <span className={styles.boldCardLabel}>Radius:</span>
        <span className={styles.boldCardValue}>{jobsite.radius}</span>
      </div>
      <div className="flex mb-1">
        <span className={styles.boldCardLabel}>On arrival:</span>
        <span className={styles.boldCardValue}>Start timer {jobsite.notifyOnEntry ? 'and notify' : ''}</span>
      </div>
      <div className="flex mb-2">
        <span className={styles.boldCardLabel}>On departure:</span>
        <span className={styles.boldCardValue}>Stop timer {jobsite.notifyOnEntry ? 'and notify' : ''}</span>
      </div>
      <span className={styles.boldCardLabel}>{jobsite.jobSiteUsers?.length} people assigned</span>

      {jobsite.jobSiteUsers?.map((jobSiteUser, i) => (
        <div className={styles.memberItemWrapper} key={i}>
          <img src="https://cdn.pixabay.com/photo/2013/07/13/10/07/man-156584__340.png" className={styles.avatarIcon} />
          <span className={styles.memberName}>{jobSiteUser.user.display_name || jobSiteUser.userEmail}</span>
          {jobSiteUser.isActive && (
            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.30556 1.75312C3.11111 1.75312 2.93056 1.87467 2.87833 2.06207C2.74306 2.55244 2.66667 3.04504 2.66667 3.53125C2.66667 4.01745 2.74306 4.53478 2.87847 5.00014C2.93403 5.18768 3.10764 5.30909 3.30208 5.30909C3.60069 5.30909 3.80903 5.02432 3.72569 4.73954C3.61389 4.37863 3.55556 3.97578 3.55556 3.53125C3.55556 3.08671 3.61458 2.70831 3.72569 2.32295C3.80833 2.0629 3.60556 1.75312 3.30556 1.75312ZM1.125 0C0.955 0 0.795278 0.0972412 0.697222 0.253522C0.263889 1.26052 0 2.3788 0 3.53125C0 4.68369 0.263889 5.85114 0.697222 6.85967C0.795278 7.01526 0.955 7.0875 1.125 7.0875C1.45139 7.0875 1.65972 6.75076 1.52444 6.45543C1.11806 5.5872 0.888889 4.59812 0.888889 3.53125C0.888889 2.46437 1.11806 1.49974 1.52444 0.608452C1.65972 0.336733 1.45139 0 1.125 0ZM12.6972 1.75312C12.3986 1.75312 12.1903 2.0379 12.2736 2.32268C12.3861 2.73303 12.4444 3.13672 12.4444 3.53125C12.4444 3.92577 12.3854 4.35446 12.2743 4.73982C12.191 5.02459 12.3958 5.30937 12.6943 5.30937C12.8888 5.30937 13.0693 5.18782 13.1215 5.00042C13.2583 4.55923 13.3333 4.06746 13.3333 3.53125C13.3333 2.99503 13.2569 2.52772 13.1215 2.06235C13.0694 1.89954 12.8917 1.75312 12.6972 1.75312ZM15.2528 0.253522C15.2056 0.0972412 15.0444 0 14.875 0C14.5486 0 14.3403 0.336733 14.4756 0.632068C14.8833 1.52446 15.1111 2.5141 15.1111 3.53125C15.1111 4.54839 14.8833 5.5872 14.475 6.47904C14.3396 6.7741 14.5479 7.11111 14.8744 7.11111C15.0446 7.11111 15.2044 7.01387 15.2772 6.85759C15.7361 5.85114 16 4.73426 16 3.53125C16 2.32823 15.7361 1.26052 15.2528 0.253522ZM7.575 1.82786C6.93611 1.97566 6.41667 2.49549 6.27222 3.13395C6.03889 4.14248 6.66389 5.03987 7.55556 5.27325V13.7805C7.55556 14.026 7.75456 14.2 8 14.2C8.24544 14.2 8.44444 14.001 8.44444 13.7805V5.27325C9.21 5.07496 9.77778 4.3853 9.77778 3.55792C9.77778 2.43631 8.74167 1.55836 7.575 1.82786ZM8 4.44531C7.51 4.44531 7.11111 4.04635 7.11111 3.55625C7.11111 3.06616 7.51 2.69219 8 2.69219C8.49 2.69219 8.88889 3.09116 8.88889 3.55625C8.88889 4.02134 8.48889 4.44531 8 4.44531Z"
                fill="#4BB063"
              />
              <path
                d="M8 4.44531C7.51 4.44531 7.11111 4.04635 7.11111 3.55625C7.11111 3.06616 7.51 2.69219 8 2.69219C8.49 2.69219 8.88889 3.09116 8.88889 3.55625C8.88889 4.02134 8.48889 4.44531 8 4.44531Z"
                fill="#4BB063"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

interface IJobsiteActioncardProps extends JobSite {
  setMapCenter: (center: ILatLng) => void;
  onEditJobSite: () => void;
  handleDelete: () => void;
  markerColor: string;
}

const JobsiteCardAction = (jobsite: IJobsiteActioncardProps) => {
  return (
    <DropdownMenu
      id={jobsite.id}
      actionButton={
        <div className="p-2 cursor-pointer">
          <svg width="3" height="16" viewBox="0 0 3 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.33333 13.3333C2.06958 13.3333 2.66667 13.9292 2.66667 14.6667C2.66667 15.4042 2.06958 16 1.33333 16C0.597083 16 0 15.4042 0 14.6667C0 13.9292 0.597083 13.3333 1.33333 13.3333ZM1.33333 6.66667C2.06958 6.66667 2.66667 7.2625 2.66667 8C2.66667 8.7375 2.06958 9.33333 1.33333 9.33333C0.597083 9.33333 0 8.7375 0 8C0 7.2625 0.597083 6.66667 1.33333 6.66667ZM1.33333 2.66667C0.597083 2.66667 0 2.07083 0 1.33333C0 0.597083 0.597083 0 1.33333 0C2.06958 0 2.66667 0.597083 2.66667 1.33333C2.66667 2.07083 2.06958 2.66667 1.33333 2.66667Z"
              fill="black"
            />
          </svg>
        </div>
      }
      menuButtons={[
        {
          label: 'Location on map',
          onClick: () => {
            jobsite.setMapCenter({
              lat: jobsite.latitude,
              lng: jobsite.longitude,
            });
          },
          icon: (
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.5 6C8.5 7.38125 7.38125 8.5 6 8.5C4.61875 8.5 3.5 7.38125 3.5 6C3.5 4.61875 4.61875 3.5 6 3.5C7.38125 3.5 8.5 4.61875 8.5 6ZM6 7.5C6.82812 7.5 7.5 6.82812 7.5 6C7.5 5.17188 6.82812 4.5 6 4.5C5.17188 4.5 4.5 5.17188 4.5 6C4.5 6.82812 5.17188 7.5 6 7.5ZM12 6C12 8.73125 8.34375 13.5938 6.74062 15.6C6.35625 16.0781 5.64375 16.0781 5.25938 15.6C3.62813 13.5938 0 8.73125 0 6C0 2.68625 2.68625 0 6 0C9.3125 0 12 2.68625 12 6ZM6 1C3.2375 1 1 3.2375 1 6C1 6.4875 1.16969 7.15625 1.5175 7.98125C1.85844 8.79062 2.3375 9.66875 2.87937 10.5469C3.94375 12.275 5.20625 13.9281 6 14.925C6.79375 13.9281 8.05625 12.275 9.12187 10.5469C9.6625 9.66875 10.1406 8.79062 10.4812 7.98125C10.8313 7.15625 11 6.4875 11 6C11 3.2375 8.7625 1 6 1Z"
                fill="#4F4F4F"
              />
            </svg>
          ),
        },
        {
          label: 'Open site report',
          onClick: () => {
            jobsite.setMapCenter({
              lat: jobsite.latitude,
              lng: jobsite.longitude,
            });
          },
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.88867 7.55558C8.64423 7.55558 8.44423 7.35558 8.44423 7.11114V1.31864C8.44423 1.08542 8.62478 0.890116 8.85812 0.888988L8.88867 0.888916C12.3248 0.888916 15.1109 3.67503 15.1109 7.11114L15.0859 7.14169C15.0859 7.37503 14.9137 7.55558 14.6803 7.55558H8.88867ZM9.33312 1.79614V6.66669H14.2026C13.9887 4.07503 11.9248 2.00975 9.33312 1.79614ZM7.11089 2.26697V8.88892L11.4581 13.2361C11.6442 13.4222 11.6303 13.7278 11.4164 13.8806C10.3276 14.6556 8.99423 15.1111 7.55534 15.1111C3.87478 15.1111 0.888672 12.1278 0.888672 8.44447C0.888672 5.07503 3.39145 2.28725 6.61367 1.8403C6.89423 1.8053 7.11089 2.01003 7.11089 2.26697ZM6.48312 9.51669C6.31645 9.35003 6.222 9.12503 6.222 8.88892V2.82114C3.67478 3.4228 1.77756 5.71392 1.77756 8.44447C1.77756 11.6361 4.36367 14.2222 7.55534 14.2222C8.59978 14.2222 9.58034 13.9445 10.4248 13.4611L6.48312 9.51669ZM13.8859 13.3139C13.7192 13.4472 13.4581 13.4584 13.297 13.2972L9.647 9.64725C9.36645 9.36669 9.56645 8.88892 9.96089 8.88892H15.5109C15.7664 8.88892 15.972 9.10558 15.9387 9.36114C15.7248 10.9139 14.9748 12.2945 13.8859 13.3139ZM14.9553 9.77781H11.0359L13.5998 12.3417C14.2526 11.6278 14.7276 10.725 14.9553 9.77781Z"
                fill="#323333"
              />
              <path
                d="M14.9553 9.77781H11.0359L13.5998 12.3417C14.2526 11.6278 14.7276 10.725 14.9553 9.77781Z"
                fill="#323333"
              />
            </svg>
          ),
        },
        {
          label: 'Edit',
          onClick: jobsite.onEditJobSite,
          icon: (
            <svg width="15" height="14" viewBox="0 0 15 14" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.71875 0.42709C10.2891 -0.142363 11.2109 -0.142363 11.7813 0.42709L12.8906 1.53725C13.4609 2.10678 13.4609 3.02943 12.8906 3.59975L4.7474 11.7456C4.45052 12.0398 4.08594 12.256 3.6849 12.3758L0.534379 13.3029C0.388025 13.3445 0.229874 13.3055 0.122061 13.1961C0.0142382 13.0893 -0.02609 12.9305 0.0169465 12.7846L0.943493 9.6336C1.06146 9.23256 1.27839 8.86797 1.57396 8.5711L9.71875 0.42709ZM11.1927 1.01641C10.9479 0.772402 10.5521 0.772402 10.3073 1.01641L8.88021 2.4435L10.875 4.41485L12.3021 3.0112C12.5469 2.76641 12.5469 2.37058 12.3021 2.12657L11.1927 1.01641ZM1.74297 9.87058L1.03203 12.2872L3.44792 11.5763C3.71615 11.4982 3.96094 11.3523 4.15625 11.1544L10.263 5.02683L8.29167 3.03204L2.16328 9.16224C1.96615 9.35756 1.82162 9.60235 1.74297 9.87058ZM14.5833 12.4852C14.8125 12.4852 15 12.6727 15 12.9018C15 13.131 14.8125 13.3185 14.5833 13.3185H6.25C6.02084 13.3185 5.83334 13.131 5.83334 12.9018C5.83334 12.6727 6.02084 12.4852 6.25 12.4852H14.5833Z" />
            </svg>
          ),
        },
        {
          label: 'Delete',
          onClick: jobsite.handleDelete,
          icon: (
            <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.21875 11.7188C4.21875 11.9766 4.00781 12.1875 3.75 12.1875C3.49219 12.1875 3.28125 11.9766 3.28125 11.7188V5.15625C3.28125 4.89844 3.49219 4.6875 3.75 4.6875C4.00781 4.6875 4.21875 4.89844 4.21875 5.15625V11.7188ZM7.03125 11.7188C7.03125 11.9766 6.82031 12.1875 6.5625 12.1875C6.30469 12.1875 6.09375 11.9766 6.09375 11.7188V5.15625C6.09375 4.89844 6.30469 4.6875 6.5625 4.6875C6.82031 4.6875 7.03125 4.89844 7.03125 5.15625V11.7188ZM9.84375 11.7188C9.84375 11.9766 9.63281 12.1875 9.375 12.1875C9.11719 12.1875 8.90625 11.9766 8.90625 11.7188V5.15625C8.90625 4.89844 9.11719 4.6875 9.375 4.6875C9.63281 4.6875 9.84375 4.89844 9.84375 5.15625V11.7188ZM9.08496 0.660937L9.87012 1.875H12.6562C12.9141 1.875 13.125 2.08477 13.125 2.34375C13.125 2.60273 12.9141 2.8125 12.6562 2.8125H12.1875V12.6562C12.1875 13.9512 11.1387 15 9.84375 15H3.28125C1.98691 15 0.9375 13.9512 0.9375 12.6562V2.8125H0.46875C0.209883 2.8125 0 2.60273 0 2.34375C0 2.08477 0.209883 1.875 0.46875 1.875H3.25488L4.01367 0.660937C4.27148 0.249785 4.72266 0 5.20605 0H7.91894C8.40234 0 8.85352 0.249785 9.08496 0.660937ZM4.3623 1.875H8.7627L8.31445 1.15781C8.22949 1.0207 8.08008 0.9375 7.91894 0.9375H5.20605C5.04492 0.9375 4.89551 1.0207 4.81055 1.15781L4.3623 1.875ZM1.875 12.6562C1.875 13.4326 2.50459 14.0625 3.28125 14.0625H9.84375C10.6201 14.0625 11.25 13.4326 11.25 12.6562V2.8125H1.875V12.6562Z"
                fill="#4F4F4F"
              />
            </svg>
          ),
        },
      ]}
    />
  );
};

export const JobsiteItem = (jobsiteProps: IJobsiteItemProps) => {
  return (
    <Accordion isOn={!!jobsiteProps.open} key={jobsiteProps.id} heading={<JobsiteItemCardHeading {...jobsiteProps} />} actions={jobsiteProps.actionCard}>
      <JobsiteCardDetail {...jobsiteProps} />
    </Accordion>
  );
};

const JobSiteList = ({ jobsites, setMapCenter, onEditJobSite }: IProps) => {
  const { openModal } = useModalAction();
  function handleDelete(jobsiteId: string) {
    openModal('DELETE_JOBSITE', jobsiteId);
  }
  return (
    <>
      <div className="rounded overflow-hidden mb-6 h-[70vh] overflow-y-scroll">
        {jobsites?.map((jobsite, i) => (
          <JobsiteItem
            markerColor={mapMarkerColors[i % mapMarkerColors.length]}
            {...jobsite}
            actionCard={
              <JobsiteCardAction
                setMapCenter={setMapCenter}
                onEditJobSite={() => onEditJobSite(jobsite)}
                handleDelete={() => handleDelete(jobsite.id)}
                markerColor={mapMarkerColors[i % mapMarkerColors.length]}
                {...jobsite}
              />
            }
            key={jobsite.id}
          />
        ))}
      </div>
    </>
  );
};

export default JobSiteList;
