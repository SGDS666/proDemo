import React, { useRef } from 'react';
import { Button, Divider, Popconfirm, message, Switch, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { apiSignList, apiSignDefaultSet, apiSignDelete } from '@/services/mails';
import { useSetState } from 'ahooks';
import SignCreate from '@/components/Mails/MailSignature/SignCreate';
import SignChange from '@/components/Mails/MailSignature/SignChange';
import SignPreview from '@/components/Mails/MailSignature/SignPreview';
import RightContainer from '@/components/Global/RightContainer';

const MailTemplets: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState({
    createVisiable: false,
    changeVisiable: false,
    previewVisiable: false,
    currentRecord: null,
  });

  const tblReload = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  const onNewDefaultSet = async (id: string, checked: boolean) => {
    const success = await apiSignDefaultSet({ id, type: 'new', value: checked });
    if (success) {
      tblReload();
    }
  };

  const onReplyDefaultSet = async (id: string, checked: boolean) => {
    const success = await apiSignDefaultSet({ id, type: 'reply', value: checked });
    if (success) {
      tblReload();
    }
  };

  const handleDelete = async (record: any) => {
    const { _id } = record;
    const success = await apiSignDelete({ id: _id });
    if (success) {
      message.success('删除签名成功！');
      tblReload();
    }
  };

  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
    },
    {
      title: '签名名称',
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: '签名内容',
      dataIndex: 'content',
      valueType: 'text',
      width: '40%',
      render: (_, record) => (
        <>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ maxHeight: 100 }} dangerouslySetInnerHTML={{ __html: record.content }} />
          </div>
        </>
      ),
    },
    {
      title: '新邮件签名',
      dataIndex: 'forNew',
      render: (_, record) => (
        <>
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            checked={record.forNew}
            onChange={(checked) => onNewDefaultSet(record._id, checked)}
          />
        </>
      ),
    },
    {
      title: '转发/回复签名',
      dataIndex: 'forReply',
      render: (_, record) => (
        <>
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            checked={record.forReply}
            onChange={(checked) => onReplyDefaultSet(record._id, checked)}
          />
        </>
      ),
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a onClick={() => setState({ currentRecord: record, changeVisiable: true })}>修改</a>
          <Divider type="vertical" />
          <Popconfirm title={`确认删除：${record.name}?`} onConfirm={() => handleDelete(record)}>
            <a href="#">删除</a>
          </Popconfirm>
          <Divider type="vertical" />
          <a onClick={() => setState({ currentRecord: record, previewVisiable: true })}>预览</a>
        </>
      ),
    },
  ];

  return (
    <RightContainer pageTitle={false} pageGroup="settings" pageActive="signatures">
      <Card className='both-down'>
        <ProTable<any>
          headerTitle="邮件签名"
          actionRef={actionRef}
          rowKey="_id"
          toolBarRender={() => [
            <Button
              key="create"
              type="primary"
              style={{ marginRight: 24 }}
              onClick={() => setState({ createVisiable: true })}
            >
              <PlusOutlined /> 新建
            </Button>,
          ]}
          options={false}
          request={(params, sorter, filter) => apiSignList({ ...params, sorter, filter })}
          columns={columns}
          rowSelection={false}
          search={false}
        />
        <SignCreate
          visible={state.createVisiable}
          onCancel={() => setState({ createVisiable: false })}
          actionReload={() => tblReload()}
        />
        <SignChange
          visible={state.changeVisiable}
          onCancel={() => setState({ changeVisiable: false })}
          actionReload={() => tblReload()}
          current={state.currentRecord}
        />
        <SignPreview
          visible={state.previewVisiable}
          onCancel={() => setState({ previewVisiable: false })}
          current={state.currentRecord}
        />
      </Card>
    </RightContainer>
  );
};

export default MailTemplets;
