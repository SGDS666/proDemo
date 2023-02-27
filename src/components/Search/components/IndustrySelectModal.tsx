import React, { useEffect } from 'react';
import { Modal, Table, Input } from 'antd';
import { useSetState } from 'ahooks';
import { industryOptions } from '@/config/industries';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: (value: string) => void;
}

const IndustrySelectModal: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    keyword: '',
    tableData: [],
  });

  const onSaveAction = async (industry: string) => {
    actionReload(industry);
  };

  const onKeywordChange = (value: string) => {
    const tableData: any = [];
    industryOptions.forEach((item) => {
      const { en, cn } = item;
      const lowerValue = value.toLocaleLowerCase();
      if (en.toLocaleLowerCase().includes(lowerValue) || cn.includes(value)) {
        tableData.push({ en, cn });
      }
    });
    setState({ tableData });
  };

  useEffect(() => {
    if (visible) {
      setState({ tableData: industryOptions, keyword: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const columns: any = [
    {
      title: 'idx',
      dataIndex: 'idx',
      key: 'idx',
      render: (_: any, record: any, index: number) => <span>{index + 1}</span>,
    },
    {
      title: 'en',
      dataIndex: 'en',
      key: 'en',
      width: 300,
    },
    {
      title: 'cn',
      dataIndex: 'cn',
      key: 'cn',
      width: 260,
    },
    {
      title: 'option',
      dataIndex: 'option',
      key: 'option',
      render: (_: any, record: any) => <a onClick={() => onSaveAction(record.en)}>使用</a>,
    },
  ];

  return (
    <Modal
      destroyOnClose
      title="常用行业分类"
      open={visible}
      onCancel={() => onCancel()}
      footer={false}
      width={720}
      bodyStyle={{ padding: 0 }}
    >
      <Input.Search
        placeholder="请输入中文或英文关键词查找"
        style={{ width: '100%', marginBottom: 12 }}
        onChange={(e) => onKeywordChange(e.target.value)}
      />
      <Table
        columns={columns}
        dataSource={state.tableData}
        size="small"
        showHeader={false}
        pagination={{
          pageSize: 1000,
          position: [],
        }}
        scroll={{ y: 480 }}
      />
    </Modal>
  );
};

export default IndustrySelectModal;
