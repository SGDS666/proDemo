import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { apiDomainPersonals, apiEmailSave } from '@/services/search';
import { useRequest } from '@umijs/max';
import { Button, Col, message, Row, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { LinkOutlined, SaveOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import DomainSaveToContatcs from '../DomainSaveToContacts';

interface InfoProps {
  domain: string;
}
const OrgPersonal: React.FC<InfoProps> = (props: any, ref: any) => {
  const { domain } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0,
    current: 1,
    pageSize: 10,
    emailsData: [],
    keyword: '',
    domainValues: {},
    domainSaveVisible: false,
  });

  const { run, loading, refresh } = useRequest(apiDomainPersonals, {
    debounceInterval: 500,
    onSuccess: (data: any) => {
      if (!data) return;
      const { total, list } = data;
      setState({ emailsData: list, total });
    },
  });

  const { run: saveRun, loading: saveLoading } = useRequest(apiEmailSave, {
    manual: true,
    debounceInterval: 300,
    onSuccess: (data: any) => {
      if (!data) return;
      const { cost } = data;
      message.success(`邮箱保存成功，消耗点数：${cost}`);
      refresh();
    },
  });

  useImperativeHandle(ref, () => {
    return { flush: refresh };
  });

  const renderLink = (record: any) => {
    const { sourcePage: link } = record;
    if (link) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={link}>
          <LinkOutlined />
        </a>
      );
    }
    return null;
  };

  const renderAction = (record: any) => {
    const { hidden, id } = record;
    if (hidden) {
      return (
        <Button
          onClick={() => saveRun({ id, type: 'personal' })}
          type="link"
          size="small"
          loading={saveLoading}
        >
          <SaveOutlined />
        </Button>
      );
    }
    return null;
  };

  const columns: ColumnsType<any> = [
    {
      title: '名字',
      key: 'firstName',
      dataIndex: 'firstName',
    },
    {
      title: '姓氏',
      key: 'lastName',
      dataIndex: 'lastName',
    },
    {
      title: '职位',
      key: 'lastName',
      dataIndex: 'position',
    },
    {
      title: '邮箱地址',
      key: 'email',
      dataIndex: 'email',
    },
    {
      title: '来源',
      key: 'link',
      width: 64,
      render: (_: any, record: any) => renderLink(record),
    },
    {
      title: '保存',
      key: 'save',
      width: 64,
      render: (_: any, record: any) => renderAction(record),
    },
  ];

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    run({ domain, filter: {}, current, pageSize });
  };

  useEffect(() => {
    if (domain) {
      run({ domain, filter: {}, current: 1, pageSize: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  return (
    <div>
      <Spin spinning={loading} tip="加载中...">
        <div style={{ marginBottom: 12 }}>
          <Row>
            <Col span={12}>
              <span style={{ color: '#70757a' }}>每个精准邮箱消耗 2 点</span>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <a
                onClick={() => setState({ domainSaveVisible: true, domainValues: { domain } })}
                style={{ marginRight: 24 }}
              >
                <SaveOutlined /> 批量保存
              </a>
            </Col>
          </Row>
        </div>
        <Table
          columns={columns}
          dataSource={state?.emailsData}
          rowKey="email"
          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total) => `精准邮箱数 ${total} `,
            onChange: onPageParamsChange,
          }}
          size="small"
        />
      </Spin>
      <DomainSaveToContatcs
        visible={state.domainSaveVisible}
        onCancel={() => setState({ domainSaveVisible: false })}
        initValues={state.domainValues}
        actionReload={() => refresh()}
      />
    </div>
  );
};

export default forwardRef(OrgPersonal);
