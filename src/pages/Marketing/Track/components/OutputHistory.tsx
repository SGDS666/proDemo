import React from 'react';
import { Modal } from 'antd';
import styles from './style.less';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { apiOutputHistory, apiOutputHistoryDownload } from '@/services/contacts';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
}

const TagsFolderOperation: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel } = props;

  const historyDownload = async (record: any) => {
    const { savePath } = record;
    const data = await apiOutputHistoryDownload();
    if (data) {
      const { mailUrl } = data;
      const url = `${mailUrl}${savePath}`;
      window.open(url);
    }
  };

  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      tip: '序号id,系统自动生成',
    },
    {
      title: '导出时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      valueType: 'dateTime',
      sorter: (a, b) => a.create_time - b.create_time,
    },
    {
      title: '纪录数',
      dataIndex: 'dataLength',
      valueType: 'text',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a onClick={() => historyDownload(record)}>下载</a>
        </>
      ),
    },
  ];

  return (
    <Modal
      title="追踪导出纪录"
      className={styles.standardListForm}
      width={480}
      bodyStyle={{ padding: '0 0 0' }}
      destroyOnClose
      open={visible}
      footer={null}
      onCancel={onCancel}
    >
      <ProTable<any>
        headerTitle={null}
        rowKey="_id"
        request={(params, sorter, filter) =>
          apiOutputHistory({ ...params, sorter, filter, table: 'track' })
        }
        columns={columns}
        rowSelection={false}
        search={false}
        pagination={{ pageSize: 10 }}
        toolBarRender={false}
      />
    </Modal>
  );
};

export default TagsFolderOperation;
