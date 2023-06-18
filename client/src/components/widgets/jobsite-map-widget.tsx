import React, { useEffect, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Circle, ILatLng, Map, mapMarkerColors } from './google-map-components';
import { JobSite, JobSiteUser, TimeCampEntry } from '@ts-types/generated';
import ErrorMessage from '@components/ui/error-message';
import styles from './jobsite-map.module.css';
import { useJobsiteMemberTimesheet } from '@data/jobsite/use-jobsite.query';

type TMarkerView = any;
interface IAdvanceMarker {
  position: ILatLng;
  title?: string;
  markerIconHtml?: string;
  markerColor?: string;
  detailCardHtml?: string;
  bigMarker?: boolean;
  map?: google.maps.Map;
  mapRef?: any;
  beforeHover?: (markerView: TMarkerView) => void;
}
interface IMemberMarker extends IAdvanceMarker {
  avatar?: string;
  name?: string;
  email: string;
  userId: string;
  jobsiteName: string;
  taskIds: string[];
  jobsiteAddress: string;
  isActive: boolean;
}

interface IJobSiteMap {
  /**
   * Job site name
   */
  name: string;
  address: string;
  radius: number;
  position: ILatLng;
  markerColor?: string;
  members: IMemberMarker[];
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  map?: google.maps.Map;
  mapRef?: any;
  taskIds: string[];
  hideMembersMarkers?: boolean;
}

const jobsiteIconSvg = `
<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2.36048 1.6735C2.15096 1.6735 1.97953 1.84493 1.97953 2.05445V11.1973C1.97953 11.4068 2.15096 11.5783 2.36048 11.5783H4.26524V10.0544C4.26524 9.4235 4.77715 8.91159 5.4081 8.91159C6.03905 8.91159 6.55096 9.4235 6.55096 10.0544V11.5783H8.45572C8.66524 11.5783 8.83667 11.4068 8.83667 11.1973V2.05445C8.83667 1.84493 8.66524 1.6735 8.45572 1.6735H2.36048ZM0.83667 2.05445C0.83667 1.21397 1.52 0.53064 2.36048 0.53064H8.45572C9.29619 0.53064 9.97953 1.21397 9.97953 2.05445V11.1973C9.97953 12.0378 9.29619 12.7211 8.45572 12.7211H2.36048C1.52 12.7211 0.83667 12.0378 0.83667 11.1973V2.05445ZM2.93191 3.00683C2.93191 2.79731 3.10334 2.62588 3.31286 2.62588H4.45572C4.66524 2.62588 4.83667 2.79731 4.83667 3.00683V4.14969C4.83667 4.35921 4.66524 4.53064 4.45572 4.53064H3.31286C3.10334 4.53064 2.93191 4.35921 2.93191 4.14969V3.00683ZM6.36048 2.62588H7.50334C7.71286 2.62588 7.88429 2.79731 7.88429 3.00683V4.14969C7.88429 4.35921 7.71286 4.53064 7.50334 4.53064H6.36048C6.15096 4.53064 5.97953 4.35921 5.97953 4.14969V3.00683C5.97953 2.79731 6.15096 2.62588 6.36048 2.62588ZM2.93191 6.05445C2.93191 5.84492 3.10334 5.6735 3.31286 5.6735H4.45572C4.66524 5.6735 4.83667 5.84492 4.83667 6.05445V7.19731C4.83667 7.40683 4.66524 7.57826 4.45572 7.57826H3.31286C3.10334 7.57826 2.93191 7.40683 2.93191 7.19731V6.05445ZM6.36048 5.6735H7.50334C7.71286 5.6735 7.88429 5.84492 7.88429 6.05445V7.19731C7.88429 7.40683 7.71286 7.57826 7.50334 7.57826H6.36048C6.15096 7.57826 5.97953 7.40683 5.97953 7.19731V6.05445C5.97953 5.84492 6.15096 5.6735 6.36048 5.6735Z" fill="white"/>
</svg>
`;

function highlight(markerView: TMarkerView) {
  markerView.content.classList.add('highlight');
  markerView.element.style.zIndex = 1;
}

function unhighlight(markerView: TMarkerView) {
  markerView.content.classList.remove('highlight');
  markerView.element.style.zIndex = '';
}

interface IMarkerBuilderOptions {
  bigMarker?: boolean;
  markerColor?: string;
  markerIconHtml?: string;
  detailCardHtml?: string;
}

function buildMarker(options: IMarkerBuilderOptions) {
  const content = document.createElement('div');
  content.classList.add(`property`);
  if (options.bigMarker) {
    content.classList.add('big-marker');
  }
  if (options.markerColor) {
    content.style.setProperty('--defaultMarker-color', options.markerColor);
  }

  let contentHtml = `<div class="icon ${options.bigMarker ? 'big-marker' : ''} " >
      ${options.markerIconHtml ?? ''}
    </div>`;

  if (options.detailCardHtml) {
    contentHtml += `
      <div class="details">
        ${options.detailCardHtml}
      </div>
      `;
  }

  content.innerHTML = contentHtml;
  return content;
}

export const JobsiteMapWidget = React.memo(
  ({
    height,
    zoom = 12,
    jobSites: jobSites,
    center,
    jobsiteUsers,
    bypassErrorMessage,
    hideJobsiteMembersMarkers,
  }: {
    height: string;
    zoom?: number;
    jobSites: JobSite[];
    center?: ILatLng;
    bypassErrorMessage?: boolean;
    jobsiteUsers?: JobSiteUser[];
    hideJobsiteMembersMarkers?: boolean;
  }) => {
    const [mapCenter, setMapCenter] = useState<ILatLng>();

    const getMapCenter = (): ILatLng => {
      if (mapCenter) {
        return mapCenter;
      } else if (jobSites.length) {
        return {
          lat: jobSites[0].latitude,
          lng: jobSites[0].longitude,
        };
      } else if (jobsiteUsers?.length) {
        return jobsiteUsers[jobsiteUsers.length - 1].lastPosition as ILatLng;
      } else {
        return {
          lat: 0,
          lng: 0,
        };
      }
    };

    useEffect(() => {
      setMapCenter(center);
    }, [center]);

    const buildJobsiteUserMarkerData = (jobsiteUsers: JobSiteUser[]): IMemberMarker[] => {
      return jobsiteUsers?.map(
        (jobsiteUser) =>
          ({
            position: jobsiteUser.lastPosition,
            name: jobsiteUser.user.display_name,
            email: jobsiteUser.userEmail,
            userId: jobsiteUser.userId,
            isActive: jobsiteUser.isActive,
            // TODO: Need to find this
            avatar:
              'data:image/jpeg;base64,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',
          } as IMemberMarker)
      );
    };

    if (!jobSites.length && !bypassErrorMessage) {
      return <ErrorMessage message={'No jobsites'} />;
    }

    const allTaskIds = jobSites.map((jobsite) => String(jobsite.taskId));

    const jobsiteMapsData: IJobSiteMap[] = jobSites.map(
      (jobSite, i) =>
        ({
          name: jobSite.identifier,
          address: jobSite.address,
          radius: jobSite.radius,
          notifyOnEntry: jobSite.notifyOnEntry,
          notifyOnExit: jobSite.notifyOnExit,
          taskIds: allTaskIds,
          markerColor: mapMarkerColors[i % mapMarkerColors.length],
          position: {
            lat: jobSite.latitude,
            lng: jobSite.longitude,
          },
          members: buildJobsiteUserMarkerData(jobSite.jobSiteUsers ?? []),
        } as IJobSiteMap)
    );

    return (
      <div style={{ display: 'flex', height }}>
        <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!} version="beta" mapIds={['theuniquemapid']}>
          <Map center={getMapCenter()} zoom={zoom} style={{ flexGrow: '1', height: '100%' }} mapId={'theuniquemapid'}>
            {jobsiteMapsData.map((jobsiteMap) => (
              <JobSiteMap
                key={jobsiteMap.name}
                markerColor={jobsiteMap.markerColor}
                position={jobsiteMap.position}
                radius={jobsiteMap.radius}
                members={jobsiteMap.members}
                name={jobsiteMap.name}
                taskIds={jobsiteMap.taskIds}
                address={jobsiteMap.address}
                notifyOnEntry={jobsiteMap.notifyOnEntry}
                notifyOnExit={jobsiteMap.notifyOnExit}
                hideMembersMarkers={hideJobsiteMembersMarkers}
              />
            ))}
            {jobsiteUsers &&
              buildJobsiteUserMarkerData(jobsiteUsers).map((member, i) => (
                <MemberMarker {...member} jobsiteName={member.email} taskIds={allTaskIds} jobsiteAddress={''} key={i} />
              ))}
          </Map>
        </Wrapper>
      </div>
    );
  }
);

const buildMemberIcon = (imgSrc?: string, size = 16) => {
  if (!imgSrc) {
    return '';
  }
  return `<img
      src="${imgSrc}"
      style="height: ${size}px; width ${size}px; border-radius: ${Math.ceil(size / 2)}px; margin: 0px;"
    />`;
};

export const MemberMarker = (props: IMemberMarker) => {
  const { refetch: getMemberEntries } = useJobsiteMemberTimesheet(props.userId);
  let entries: TimeCampEntry[] | null = null;
  const getEntries = async () => {
    if (!entries) {
      const { data } = await getMemberEntries();
      entries = (data?.entries ?? []).filter((tcEntry) => props.taskIds.includes(tcEntry.task_id));
    }
    return entries;
  };

  const buildMembersiteCard = (memberCardData: {
    memberIconSvg: string;
    jobsiteName: string;
    jobsiteAddress: string;
    displayName: string;
    memberEntries: TimeCampEntry[];
  }) => {
    return `<div class=${styles.jobsiteMapCardWrapper} >
       
    <div class=${styles.jobsiteMapCardHeader} >
       <div class="property"  style="min-width: 20px; min-height: 20px;">
          ${memberCardData.memberIconSvg}
       </div>
      <div class=${styles.jobsiteMapHeaderTitle} >
        <span class=${styles.jobsiteCardHeading} >${memberCardData.displayName}</span>
        <span class=${styles.jobsiteCardSubHeading} >${memberCardData.jobsiteName} - ${
      memberCardData.jobsiteAddress
    }</span>
      </div>
    </div>

    <div class=${styles.jobsiteCardActiveUsers} >
      <span class=${styles.memberCardSmallHeading} >Today</span>
      ${memberCardData.memberEntries
        .map(
          (memberEntry: TimeCampEntry) => `
        <div class=${styles.memberCardTimeEntry} >
          <span>${memberEntry.name}</span>
          <span>${memberEntry.start_time}-${memberEntry.end_time}</span>
        </div>
    `
        )
        .join('')}
     </div>
  
  </div>`;
  };

  const setMemberTimesheet = async (marker: TMarkerView) => {
    const content = marker.content as HTMLDivElement;
    const detailElement = content.getElementsByClassName('details')[0];
    detailElement.innerHTML = `<div class="html-loader" ></div>`;
    const memberEntries = await getEntries();
    detailElement.innerHTML = buildMembersiteCard({
      memberIconSvg: buildMemberIcon(props.avatar),
      memberEntries,
      jobsiteName: props.jobsiteName,
      jobsiteAddress: props.jobsiteAddress,
      displayName: props.name || props.email,
    });
  };

  return (
    <AdvanceMarker
      map={props.map}
      mapRef={props.mapRef}
      bigMarker={false}
      position={props.position}
      markerIconHtml={buildMemberIcon(props.avatar)}
      markerColor={props.markerColor}
      beforeHover={setMemberTimesheet}
      detailCardHtml={'-'}
    />
  );
};

const JobSiteMap = (props: IJobSiteMap) => {
  const buildJobsiteCard = (jobsiteMapData: IJobSiteMap) => {
    const activeMembersCounts = jobsiteMapData.members.filter((member: IMemberMarker) => member.isActive).length;
    const totalMembers = jobsiteMapData.members.length;

    return `<div class=${styles.jobsiteMapCardWrapper} >
       
    <div class=${styles.jobsiteMapCardHeader} >
       <div class="property"  style="min-width: 23px; min-height: 23px;">
          ${jobsiteIconSvg}
       </div>
      <div class=${styles.jobsiteMapHeaderTitle} >
        <span class=${styles.jobsiteCardHeading} >${jobsiteMapData.name}</span>
        <span class=${styles.jobsiteCardSubHeading} >${jobsiteMapData.address}</span>
      </div>
    </div>

    <div class=${styles.jobsiteCardBody} >
      <div class=${styles.jobsiteCardBodyRow} >
        <span class=${styles.jobsiteCardHeading} >Radius:</span>
        <span class=${styles.jobsiteCardSubHeading} >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${
      jobsiteMapData.radius
    } m</span>
      </div>
      <div class=${styles.jobsiteCardBodyRow} >
        <span class=${styles.jobsiteCardHeading} >On arrival:</span>
        <span class=${styles.jobsiteCardSubHeading} >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Start timer ${
      jobsiteMapData.notifyOnEntry ? 'and notify' : ''
    }</span>
      </div>
      <div class=${styles.jobsiteCardBodyRow} >
        <span class=${styles.jobsiteCardHeading} >On departure: </span>
        <span class=${styles.jobsiteCardSubHeading} >&nbsp;&nbsp;Stop timer ${
      jobsiteMapData.notifyOnExit ? 'and notify' : ''
    }</span>
      </div>
    </div>  

    <div class=${styles.jobsiteCardActiveUsers} >
      <span class=${styles.jobsiteCardActiveUsersHeading}>Active now (${activeMembersCounts}/${totalMembers}) </span>
      ${jobsiteMapData.members
        .map(
          (member) => `
        <div class=${styles.jobsiteCardActiveUser} >
        ${buildMemberIcon(
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBUWEhgWFhUZGRgYGRgYGBkaGBgYGRgYGBkZGRgaHBocIS4lHB4rHxwaJjgmLC8xNTU1GiQ7QDs0Py40NTQBDAwMEA8QHxISHjQlJCYxNDE0NDY0MTQ0NDQ2NDYxMTQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDc0NDQ0NDQ0Mf/AABEIAN0A5AMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAABAECAwUHBgj/xABHEAACAQIDAwcIBwYEBgMAAAABAgADEQQSIQUxUQZBYXGBkaEHEyIyQlKSsSNUYnLB0fAUF0NzsuEzgpOiFSQ0Y8LxFiVT/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAECBAMF/8QAJREBAQACAgEDBQADAAAAAAAAAAECEQMhMRJBURMiMnGBBGGx/9oADAMBAAIRAxEAPwDsUREBERAREQEREBESBtPa9HDreq4XgN7N1KNTItk7qZLfCfE8XiuV1V9KFEIvv1Tr1hF/OafEV8RU/wAXEOR7qHzady7+2csubGeO3ScVvnp0PEY+knr1ET7zKPC8g/8AybCXsK6HqufkJ4NMHTGoQX4kXPeZIWw3ASn18vhb6U+Xthygwx/iD4W/KXf8ew3/AOg7m/KeJ84f0BHnG4/KPrZH0o9qu38Pe3nVHWGA7yJsKNZWF1ZWHFSCPCc6z8QPlKIxVsyMUbipynvG/tkzmvvEXins6VE81sXbxZglW1z6r6C54MNw6xPRLUU7mB6iDO2Ocym453Gy6q+IiWVIiICIiAiIgIiICIiAiIgIiICInjuVe3GLnDUWsf41QewPdB5mPPwlcspjN1bHG5XUX7d5TnM1HDWLDR6pF0Q84HMzeE82tEBi7ku59Z3OZj37pmpUlRQALdH4nplAOc/+pkyyuV3WnHGYzo1PR85cKf6MrmlhcdfVrKrLiJSUueqVAgIvKhL/AK0hmA54FLQDI9SuToP7mXobWXn5+iNmmWMo/uND3jWYzVGvAeJlaD5h2yRsMJtrEUdQxqJzo5u1ufK51v0G89lsvaVPEUw9M3G4g6MrDerDmM8Cp47o2djzhcQH/huQtUc1uZx0rv6pfDksvfhzzwlnXl0uJRCCLg3B1B4iVmtmIiICIiAiIgIiICIiAiIgaXlPtf8AZ6BZfXc5KY+0fa6gNe6eIwFDKpZtSTmYnezHXXt1krlJi/PY1h7NH0F+9vc/h2TFWcKAP1czHyZerL9NWGPpx/YTFpDbFa2uB0aXg4g8R4TntfSb5sdHzldOvwmt/a7mwa54DU+EkU8PWf1adQ9JGQf7rRtPpSWbsmM11HT4zNR2DWb1mRB2u34CbGhsCmPXLOek5R3LJ7NNG+KJNhv5hvPYBMeJpuoBZSCdwY2JHG28Ceu/ZMq5aWWnxIQE9mo167yBU2CpDemzO2939LrsosL8OEXGp6ebR+m55zzDqlSxAvawYesdxHRxnp8LsOklibuR71svwjTvvJf7EnnM5GZtLX3KBuyjmj00abZmxy4zVAQtvRXcTf2jw6pBq0zSqFG7+I5mE9hIe0sAtVbbmHqtw6DxEm4/A0O/UTHiUzJr+hMVRXpNlcWPNwPSp55mSoD+UhXWnq+ROPL4fIxu1Fsh6VtdD3adk9HOf8kq/m8aV5qqFf8AMnpL4EzoE18WW8Wbkx1kRETo5kREBERAREQEREBMdaplVmO5QW7heZJC2wf+Wrfy3/pMi+Ezy5jsq7emd7kuetzczJiSz1Ai+s7ZF6L7z2CU2Xog+6sl7Ap5sXc+wjN/mchR4XmD4jd7t7Q2RQVAnm0biWUMzHnJJ1lybJw43UU+AH5ybEvqCxKar6qheoAfKXxEsKytoEqBCFLRaXWgiBYZSXkS0wKREQlZUpqwysoYHmIBHcZ5nbOFWlUQoLKynTmDKRe3C4I06J6marlFRzUc3OhDdm5vA+ErlOhovP5K1Gp7roT1E5W8DOpzkWPF6J4gHwnVcFVz0kb3lVu9QZ14L5jPzzxUiIiaHAiIgIiICIiAiIgJgx1PNSdfeRx3qRM8QOSbLb6MfcE2/JZPTqt9xfAn8ZraNLI7p7j1E+Fzbwm25LDSr99f6BPPnmN7fxETqEREC4S9ZYJcDCGQCWtGaUJhC0y0yplDCVIiISSLtVb0Ko+w/wDSTJUwY4fRP/Lf+kyKPGPrRP63idI5OPfCUD/208Bac2B+hPUP6Z0bkuLYKh/LWW4Py/jjzfj/AFtoiJqZiIiAiIgIiICIiAiJhxWIVELsbBRc8/YBzmCTbnm2qeTG1hxYN8aA/O8k8l/4o+0n9Mwco6+bEBwjpmQeuALlCddCeYiZ+TPrVetPk0w3Xr6bsZZO2/iJjakp3i/XrLpVaqo3sB2iFqqdzA9olvmE9xfhEj1RQ9rJ3qJUThLgZrEVP4dSx4ZgynsvJeHqk3DCzDfwPSDJ2hIvBMtvKM1gTw1ki4mWMwG8269JBd2bV3yKdy3AY9ZO7qEogw/FCelwx8TI2Jnnl95e8TIDfdMK0kI0VSOgKZd5hPdA6hb5SEskwY4/RP8Ay3/pMzATBtE/Q1PuP/QZNHiKzWoHq+SzqmyqOShSX3UQHrCi85cEzFEIJBdAQBckXBYAdQnTcBtJarFcrKyi5VgL2OlxYkES3BZuuPNLZ02ERE1MxERAREQEREBERATR8qntSTpcH4VZvmBN5NByqW60xzF2H+xv7ynL+NdOL848/tKg7YdGc3cekNADqNV036a9YlOTG+p/k/8AKT8figiM51vdEHzPh4CQ9hrao5GiuqMBw33HVe4mP3bbLZtvJB2ztDzGHerkZ8ilgii5J5uocTzCToM6KPNbN5J18UvnsdiKmozLhqLGnTUEXCkrvPTOdYumlOrTAwocP6xIL2N7Zdd1umdmFWupOR0C6WDU2JUW3ei4BHZNFjeT5qOXNXKW1IRFVbnUmzZt86ZZY9aZ7x52mwOTmDr4cv8AsyI6uVV6YKOLAHMGXnBJm3wqOnoO4crpntbMOYkbg1t9tLyFS2awQUzWqFBoFDBF7QgW/aTNjh6AUAAWAFgOgSuWUykjrx4ZY+azTHVawlEqXqMvuhe9rn5WmR0uJzdELDcmKFdvOYlRWY+qGuaaLzKq7r8SdSeyco22iJVTLg0YO7ZgiWC+lYIAN3bwnVGwRDl0d0Y7yjFb9a+qe0Ga3FcnzUcs1d7nU+hT1J3khVGs6+uanThlxZW72gbC5JpXpVKlGpVwtRXyqyVGyH0QTdSbEXmz5O47EecqYbFLmqUQpFZB6FVG9Um2itxGk2eCStSpimj0gg3XpPe53kkVNTJSKec3Y2zGwGYgWvYScssbj/s48c8b34XSLtT/AAKn8t/6TJUibUF6LjddSNd05Xw7x57YlItXBHsA792ZhYdwue6b3ZdRxjFDNfV0BsB6LJmG7pWa7YjqCaR0JAIbnL7z+uibWhriaLWsSwBHSqVLyuHmftOc1jZfh6yIibnnkREBERAREQEREBNXt3DlqV1F2Rg4HHLfMO1SZtIkZTc0tLq7jnm0/SWiRqlrX6bi9+m02NYZKqMNASUPYAV+RknaWD8y5bLejUPpL7rHo4GRscv0ZtqNHU9Ka7+oETFcbjbtvxzmUmmxiY6D5lB4iZJKpFolZYUAl1oEwbQq5KTtwU26zoPnI8HlE2S+d6r8XAHUBYeE2dprOTifRE8XPgAJtCJE8Jy/JYRKWl5EtMsqpERCSQdpelkT32APVe7eAk6a52LV9PYXr9J7/gPGVyWx8oOPp/TUso9IhTp0Nv7putkUs+ILD1aebXmLsALDqUE9sjOpLCnTANRxYsfZUbyegT0uAwa0qaou4bzzkneT1y3Fhu7c+bk1jr3SoiJrYiIiAiIgIiICIiAiIgYsTQV0KMLqwIPbPNYdSpek/rIbE++p9V+0eN56qQcfs1ahDEsrjQMpsbcDzEdc58mHq7nl14s/T1fDz2yzZCh3oxXuOnhaTpFfC+ZxBTMzB0D3Y3JI9FvwkqZ5NdVq3L3PclRKSokiomo5SVrIqe8bnqX+5m3E0PKHDOXD71sB1G/CVy/FbDW+212GlsOnSC3exMmtNDgMW3mwAxuotbq3SXgcc7sVawseI16rRMpqRGWN3a2BlDKmWmWVUiIhKjHSQcC4CPUY2DMzX+yvoj5HvmbH1MtNiN9rDrOg8ZPwuwEAXM7sFAOViMlxxAGovzGRMLlekZZzCdsmwcHlU1GFmqWNvdUeqv4npM28RNWOMxmox5W5XdIiJZUiIgIiICIiAiIgIiICIiBo+UKWai/Byh6nGniBMU2u1MJ52ky7ibFTwZTdT3iaLB1sy6izC4Yc4YaETNyTV/bVxXeOvhIgmJjrH0G+6flKurV1tpuxsgtw0ux/KWps6q5u5t943PdJOy6VqZZbZjexO7SSQ9X3U+JvylUSbMNs5EGozHifkOiQa+xzvRr9B0PfJ/nKg9hT1NYeIjNV4IO1jHSdNWK9ano17fa1HYZs8Fig63tYjQiVRHN85Ugi2ULYd51kTZKZS68GA7rwjw2URKE2lko9Zc1WinFwx+6npn5T1U8/sOjnqNWPqqCidJ9th0c3YZ6CduKdb+Wbmy+7XwRETq4kREBERAREQEREBERAREQEREBNDtjAMGNamLn+Ig9oD2h9oDvE30SuWMymqtjlcbuPM0KyuoZTcGVr+o33T8pJ2jsk5jUo2DHVk3Kx4jg3gZATEhlcEFWAIZToQbc4mbLG43Va8cplNxbsv/CXt+cmTW7IxAy5CdRu6QZmx2MCCw1Y7hw6TI9krcXXRWAJNzvsdw4mTEAsLbuaeXdiSSTcnfJ+zsdk9FvV5j7v9pEptu5A2f69X7/5yXVqqq5idPn1cZr9lVR9Ix0uQT4mBtCZFSm1d8iGyD/EfgPdH2j4S7DYd8RuulLnf2m6FHD7U9HhcMiIFVbAbh+J4npnTDC3u+FM+SY9Tz/xdRpKihVFlUAAcAJkiJpZCIiAiIgIiICIiAiIgIiICIiAiIgImDGYtKVNnqOqIouzMQqgdZnHuWHlMqViaWCLU6W41rFaj8cgIui9PrdUG3XsRtGihs9VEPBnVT3Ezx+1iGxLujg+rZlIIIKjTTQicLxJv6R1Y72b0mPWTqZ1Tyc7P/8Ar1bnZ3IHNYMQPxnLnx+3+u/+Nl91/SaAVOVt/MeMqTNhWwoIsw/MdU19SmyetqvMw/GZGnLH3hExGsP1w5pcj3sFBY8BJ2ppezfr8pelJspzHTfl6hpfjM+HwttW1PgOrp6ZPoYPNv0Ei9umM9PdTcHyowVGjSSpiqKMEQFS65gcutxzTeYDaFKsmelUSonvIwYd4ny/j0KYiqnu1ainrDsJN2Ntevhaoq0GKMDqPZdedXXcwPeN4noY4/bHnZX7q+nYnmeSPLGhjqfonJWUfSUWPpKeK+8p5iO2emgIiICIiAiIgIiICIiAiJa7AAkkAAXJJsABvJPMIF0Tx21/KNgKBKioazj2aK59eGb1R3zzOM8rLn/BwiqOZqtS5+BF/wDKDb1nLfleMCiqqecrVLlFLZVVVsC7Ea2uQABqZznEeU3aJ3Nh0+7RY2+Jzeef5RcpK2KrCpXKXyhFCKVVbEkDVmJvffeaYmWkVtT9sbZxGJbNiKz1LG4DWVVP2UUBRNfKMbSokoWVBcTt/Iehk2dhxaxKBj1uSx+c4nOpeTLbfnKLYdz6dC2T7VJj6Pwn0e6cuaX0u3BZMntnQHeJibCr+tZkqbjLlNxeZG3aA+yKZN8o8R8jMtPAqosNB0C0lxJ1EbYkoqObvmWUvrbomLF4lKaPUdsqIpZjwAFzIK4jyywuTaeJFrAv5wdPnFVz4lpqZL2rtFsTXeu2hdrhfcQaIvYtu28iTfjNSbednZcrYqhIYMCQy7mUlWHUw1E3dDlbjlFhja4H31YD4lM0LNrYb/kOMuEaRt1XkPy9rvXTD4plcVDlSrYIysfVVsvosDuBsCDxvp1afLWFxbI6FCA6OjgnUAowdbjn1A04ToWE8qmLW2ejQqD7Oekx7buPCLEyuxxPA7O8qWFcgVadSieJAqJ8S6gdJAnstm7To4hM9CqlReKMGt0G2oPXKrJkREBERAREQNJyo5SUMDR85VNydERfXdvdUfjzTh/KTlPicaSa75KXs0FJCi2ozne56+E6ft3yfjF4k16uKqZtVRQiZaajcqj5nnmvfyQ0if8Aq6nwJJmkXbkgcAWUACWFr751z90NL61U+BI/dDS+tVPgSW6U7chZQRY7jMSOQcrf5TxH5zsf7oaX1qp8CSyp5HKLDXFVPgSOk9uSzExyn7J/2n8p2BPI/St/1dT/AE0lT5IKX1qp8CR0duRzPs7aL4aslen66HdzOp9ZD0ETqS+R6kNBi6lv5aTJ+6Gl9aqfAki6s7JuXcb/AGPtOniaCVqZurjdzqfaVukHSSMM3o24aTV8nfJ8MHUYpiqjK3rIyrlJ5mFtzdM9PR2QBf0yb9AmTLC76bceWenvyhRNl/w0e8e4S1tmAj1j3CPp1P1MWqpNcsemw7Jy7yjcphXf9lotemjXqsDcO4Oig+6p38T1TqW1eTJqUjTWu9PMbFlUFgp3gG+h6Z5Sn5HaKjTFVPgSdOPDvdcubk3NYuSSyo9tBqTuH4nonXz5IKX1up/ppLKfkdo6n9rq3O85EnfbNquRolukneeMtq1LHKurHw6TOwt5IKX1up/ppMdHyO0Rf/mqtzvORI2duSU0yi3eeJ4zIDOufuhpfWqnwJH7oaX1qp8CSekarky1SJJwWMZHFSm7U6g3Mhyt1E+0Og3E6h+6Gl9aqfAkfuhpfWqnwJHSe1eSHlIzutDG5VZiFSuvoo5O5XX2G6dx6J02c0HkjpWscVUI6USe25N7LfDUBRau9YJojOAGC2BCkjfbjK1aNrERIS//2Q==',
          24
        )}
          <span class=${styles.jobsiteUsernameText} > ${member.name || member.email}</span>
          <span style="height: 10px; width: 10px; border-radius: 5px; background-color: ${
            member.isActive ? '#008000' : '#b30000'
          }; margin-left: 2px; line-height: 12px;" ></span>
        </div>
      `
        )
        .join('')}

    </div>
  
  </div>`;
  };

  return (
    <>
      <AdvanceMarker
        map={props.map}
        mapRef={props.mapRef}
        bigMarker={true}
        position={props.position}
        markerIconHtml={jobsiteIconSvg}
        markerColor={props.markerColor}
        detailCardHtml={buildJobsiteCard(props)}
        title={props.name}
      />
      {!props.hideMembersMarkers &&
        props.members.map((member, i) => (
          <MemberMarker
            {...member}
            map={props.map}
            mapRef={props.mapRef}
            jobsiteName={props.name}
            jobsiteAddress={props.address}
            taskIds={props.taskIds}
            key={i}
          />
        ))}
      <Circle
        map={props.map}
        center={props.position}
        fillColor={props.markerColor}
        strokeColor={props.markerColor}
        radius={props.radius}
      />
    </>
  );
};

export const AdvanceMarker = (props: IAdvanceMarker) => {
  const [inittialized, setInit] = useState<boolean>(false);
  const loadAdvanceMarker = async () => {
    const { detailCardHtml, bigMarker, markerColor, markerIconHtml } = props;
    // Typescript work around
    const { AdvancedMarkerView } = (await google.maps.importLibrary('marker')) as any;
    const advancedMarkerView = new AdvancedMarkerView({
      map: props.map,
      content: buildMarker({ detailCardHtml, bigMarker, markerColor, markerIconHtml }),
      position: props.position,
      title: props.title ?? '',
    });

    if (props.detailCardHtml) {
      const element = advancedMarkerView.element as HTMLElement;
      ['focus', 'pointerenter'].forEach((event) => {
        element.addEventListener(event, () => {
          highlight(advancedMarkerView);
          props.beforeHover?.(advancedMarkerView);
        });
      });
      ['blur', 'pointerleave'].forEach((event) => {
        element.addEventListener(event, () => {
          unhighlight(advancedMarkerView);
        });
      });
    }
    setInit(true);
  };

  useEffect(() => {
    if (props.mapRef?.current && props.map && !inittialized) {
      loadAdvanceMarker();
    }
  }, [props.map]);
  return null;
};

export default JobsiteMapWidget;
