import Pagination from '@components/ui/pagination';
import { Table, AlignType } from '@components/ui/table';
import ActionButtons from '@components/common/action-buttons';
import { ROUTES } from '@utils/routes';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { JobSitePaginator } from '@ts-types/generated';

type IProps = {
  jobsites: JobSitePaginator | null | undefined;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const JobSiteList = ({ jobsites, onPagination }: IProps) => {
  const { data, paginatorInfo } = jobsites!;
  const { t } = useTranslation();
  const router = useRouter();

  let columns = [
    {
      title: t('table:table-item-identifier'),
      dataIndex: 'identifier',
      key: 'identifier',
      align: 'center' as AlignType,
      width: 64,
    },
    {
      title: t('table:table-item-radius'),
      dataIndex: 'radius',
      key: 'radius',
      align: 'center' as AlignType,
    },
    {
      title: t('table:table-item-longitude'),
      dataIndex: 'longitude',
      key: 'longitude',
      align: 'center' as AlignType,
    },
    {
      title: t('table:table-item-latitude'),
      dataIndex: 'latitude',
      key: 'latitude',
      align: 'center' as AlignType,
    },
    {
      title: t('table:table-item-updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'center' as AlignType,
      render: (id: string, record: any) => record.updatedAt,
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'center' as AlignType,
      render: (id: string, record: any) => (
        <ActionButtons id={id} editUrl={`${ROUTES.JOBSITES}/${record.id}/edit`} deleteModalView="DELETE_JOBSITE" />
      ),
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter((col) => col?.key !== 'approve' && col?.key !== 'actions');
  }

  return (
    <>
      <div className="rounded overflow-hidden shadow mb-6">
        <Table columns={columns} emptyText={t('table:empty-table-data')} data={data} rowKey="id" scroll={{ x: 900 }} />
      </div>

      {!!paginatorInfo.total && (
        <div className="flex justify-end items-center">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default JobSiteList;
