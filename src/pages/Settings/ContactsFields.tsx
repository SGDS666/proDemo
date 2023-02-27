import React, { useEffect } from 'react';
import { Button, Card, Col, Divider, Input, message, Popconfirm, Row, Space, Table } from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import { useSetState } from 'ahooks';
import { apiFieldsShow } from '@/services/settings';
import { useRequest } from '@umijs/max';
import { PlusOutlined } from '@ant-design/icons';
import FieldEdit from '@/components/Fields/FieldEdit';
import FieldCreate from '@/components/Fields/FieldCreate';
import { apiFieldDelete } from '@/services/field';
import _ from 'lodash';

const ValueTypes: any = {
  text: { text: '单行文本' },
  textarea: { text: '多行文本' },
  digit: { text: '数字' },
  money: { text: '金额' },
  percent: { text: '百分比' },
  date: { text: '日期' },
  dateTime: { text: '日期和时间' },
  select: { text: '选项' },
  rate: { text: '评分' },
};

const ContactsFields: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0, // 总字段数量
    current: 1, // 当前页码
    pageSize: 10, // 页面纪录数
    dataSource: [], // 字段数据
    keyword: '', // 关键字
    currentRecord: {}, // 当前修改字段属性
    editVisible: false, // 编辑字段显示
    createVisible: false, // 创建字段显示
  });

  const renderValueType = (record: any) => {
    const { valueType } = record;
    const values = ValueTypes[valueType];
    if (values) {
      return values.text;
    }
    return valueType;
  };

  const openSetOptions = (record: any) => {
    setState({ setVisible: true, currentRecord: record });
  };

  const onChangeAction = (record: any) => {
    setState({ editVisible: true, currentRecord: record });
  };

  const {
    data: fieldsData,
    run: fieldsDataRun,
    refresh: fieldsDataRefresh,
    loading,
  } = useRequest(apiFieldsShow, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ dataSource: data });
    },
  });

  const { run: deleteRun } = useRequest(apiFieldDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      fieldsDataRefresh();
    },
  });

  const onClickDelete = (record: any) => {
    const { belongTo, dataIndex } = record;
    deleteRun({ belongTo, dataIndex });
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'idx',

    },
    {
      title: '名称',
      dataIndex: 'title',
      sorter: (a: any, b: any) => a.title - b.title,
    },
    {
      title: '创建者',
      dataIndex: 'source',
      sorter: (a: any, b: any) => a.source - b.source,
      render: (value: any, record: any) => {
        const { source } = record;
        if (source === 'system') {
          return '来发信';
        } else {
          return source;
        }
      },
    },
    {
      title: '归属',
      dataIndex: 'belongTo',
      sorter: (a: any, b: any) => a.belongTo - b.belongTo,
      valueEnum: {
        contact: { text: '联系人', status: 'Success' },
        company: { text: '公司', status: 'Processing' },
      },
      render: (value: any, record: any) => {
        const { belongTo } = record;
        if (belongTo === 'contact') {
          return '联系人';
        } else {
          return belongTo;
        }
      },
    },
    {
      title: '字段类型',
      dataIndex: 'valueType',
      sorter: (a: any, b: any) => a.valueType - b.valueType,
      render: (value: any, record: any) => {
        return renderValueType(record);
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (value: any, record: any) => {
        const { source, title, valueType, setOptions } = record;
        if (source === 'system') {
          if (valueType === 'select' && setOptions === '1') {
            return (
              <span>
                <a onClick={() => openSetOptions(record)}>设置选项</a>
              </span>
            );
          } else {
            return null;
          }
        }
        return (
          <span>
            <a onClick={() => onChangeAction(record)}>修改字段</a>
            <Divider type="vertical" />
            <Popconfirm title={`确认删除字段：${title} ?`} onConfirm={() => onClickDelete(record)}>
              <a>删除</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
  };

  const reloadContactsTableData = () => {
    const { keyword } = state;
    const data = [];
    // eslint-disable-next-line guard-for-in
    for (const idx in fieldsData) {
      const { title } = fieldsData[idx];
      if (title.indexOf(keyword) >= 0) {
        data.push(fieldsData[idx]);
      }
    }
    setState({ dataSource: data });
  };

  useEffect(() => {
    fieldsDataRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTblChange = (pagination: any, filter: any, sorter: any) => {
    let { field, order } = sorter;
    if (order === 'descend') {
      order = 'desc';
    } else if (order === 'ascend') {
      order = 'asc';
    } else {
      field = 'idx';
      order = 'asc';
    }
    const { dataSource } = state;
    const sortedData = _.orderBy(dataSource, [field], [order]);
    setState({ dataSource: sortedData });
  };

  return (
    <RightContainer pageTitle={false} pageGroup="settings" pageActive="fields" className='both-down'>
      <Card>
        <Row style={{ marginBottom: 24, marginTop: 12, marginLeft: 12 }}>
          <Col span={6}> </Col>
          <Col span={18} style={{ textAlign: 'right' }}>
            <Space size="large">
              <Input.Search
                key="searchKey"
                placeholder="搜索字段名称"
                enterButton
                style={{ maxWidth: 300, verticalAlign: 'middle' }}
                value={state.keyword}
                onChange={(e) => setState({ keyword: e.target.value })}
                onSearch={() => reloadContactsTableData()}
                size="large"
              />
              <Button size="large" type="primary" onClick={() => setState({ createVisible: true })}>
                <PlusOutlined /> 新建
              </Button>
            </Space>
          </Col>
        </Row>
        <Table
          rowKey="dataIndex"
          loading={loading}
          dataSource={state.dataSource}
          columns={columns.map(c => ({ ...c, className: "both-big" }))}

          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total) => `总纪录数 ${total} `,
            onChange: onPageParamsChange,
          }}
          onChange={onTblChange}
        />
      </Card>
      <FieldEdit
        visible={state.editVisible}
        onCancel={() => setState({ editVisible: false })}
        actionReload={() => fieldsDataRefresh()}
        current={state.currentRecord}
      />
      <FieldCreate
        visible={state.createVisible}
        onCancel={() => setState({ createVisible: false })}
        actionReload={() => fieldsDataRefresh()}
      />
    </RightContainer>
  );
};

export default ContactsFields;
