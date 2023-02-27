import React, { useEffect } from 'react';
import { Alert, Button, Card, Checkbox, Form, Input, Space, Table, Tag, TreeSelect } from 'antd';
import { useSetState } from 'ahooks';
import RightContainer from '@/components/Global/RightContainer';
import { apiRecycleShow, apiTagsList, apiRecycleRestore } from '@/services/contacts';
import { useRequest } from '@umijs/max';
import { exTimeToDateTime } from '@/utils/common';
import ContactsRestore from './components/ContactsRestore';
import styles from '@/pages/index.less';
import DateFilter from '@/components/Common/DateFilter';
import { CaretDownOutlined } from '@ant-design/icons';
import { apiOrganizeUsers } from '@/services/enterprise';

const Recycle: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0,
    current: 1,
    pageSize: 10,
    filters: [],
    contactsData: [],
    tblSelectKeys: [],
    selectAll: false,
    restoreVisible: false,
    filterValues: {},
  });

  const { run: tagsListRun, data: tagsData } = useRequest(apiTagsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const tree = [];
      const children: any = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { parent, id, name, color, folder } = data[idx];
        if (folder) {
          tree.push({ id, value: id, title: name, children });
        } else if (!folder && parent === '0') {
          tree.push({
            id,
            value: id,
            title: <Tag color={color}>{name}</Tag>,
            name,
          });
        } else {
          const index = tree.findIndex((o) => o.id === parent);
          if (index >= 0) {
            tree[index].children?.push({
              id,
              value: id,
              title: <Tag color={color}>{name}</Tag>,
              name,
            });
          }
        }
      }
      setState({ tagsTreeData: tree });
    },
  });

  const { run: dataRun, loading } = useRequest(apiRecycleShow, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { current, total, pageSize, list } = data;
      setState({ current, total, pageSize, contactsData: list });
    },
  });

  const renderTags = (record: any) => {
    const { tags } = record;
    if (!tags || !tags.length) {
      return <span>--</span>;
    }
    return tags.map((tagId: string) => {
      const idx = tagsData?.findIndex((o: any) => o.id === tagId);
      if (idx >= 0) {
        const { color, name } = tagsData[idx];
        return (
          <Tag key={tagId} color={color}>
            {name}
          </Tag>
        );
      } else {
        return <Tag>{tagId}</Tag>;
      }
    });
  };

  const columns = [
    {
      title: '邮箱地址',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '名字',
      dataIndex: 'first_name',
      key: 'first_name',
    },
    {
      title: '姓氏',
      dataIndex: 'last_name',
      key: 'last_name',
    },

    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (_: any, record: any) => renderTags(record),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (_: any, record: any) => {
        const { create_time } = record;
        return exTimeToDateTime(create_time);
      },
    },
    {
      title: '删除时间',
      dataIndex: 'deleteTime',
      key: 'deleteTime',
      render: (_: any, record: any) => {
        const { deleteTime } = record;
        return exTimeToDateTime(deleteTime);
      },
    },
    {
      title: '删除用户',
      dataIndex: 'userName',
      key: 'userName',
    },
  ];

  const onTblSelectKeysChange = (selectedKeys: any) => {
    setState({ tblSelectKeys: selectedKeys, selectAll: false });
  };

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    const { filters } = state;
    dataRun({ current, pageSize, filters });
  };

  const onSelectAll = () => {
    const { contactsData } = state;
    const keys = [];
    // eslint-disable-next-line guard-for-in
    for (const idx in contactsData) {
      const { cid } = contactsData[idx];
      keys.push(cid);
    }
    setState({ tblSelectKeys: keys });
  };

  const onActionSelectChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
      setState({ selectAll: false });
    } else {
      setState({ tblSelectKeys: [], selectAll: false });
    }
  };

  const reloadTasksData = (values?: any) => {
    const { filterValues, pageSize, sort } = state;
    if (!values) {
      // eslint-disable-next-line no-param-reassign
      values = filterValues;
    }
    setState({ current: 1 });
    dataRun({ filters: values, current: 1, pageSize, sort });
  };

  const { run: restoreRun, loading: restoreLoading } = useRequest(apiRecycleRestore, {
    manual: true,
    onSuccess: () => {
      setState({ restoreVisible: false, selectAll: false, selectKeys: [] });
      reloadTasksData();
    },
  });

  const onRestoreAction = (values: any) => {
    const { filterValues, keyword, tblSelectKeys, selectAll } = state;
    const { replace, verify } = values;
    restoreRun({
      filters: filterValues,
      keyword,
      selectKeys: tblSelectKeys,
      selectAll,
      replace,
      verify,
    });
  };

  const { data: usersData } = useRequest(apiOrganizeUsers, {
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ owners: data });
      const treeData = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { nickname, userid } = data[idx];
        treeData.push({ title: nickname, value: userid, key: userid });
      }
      setState({ userTreeData: treeData });
    },
  });

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    reloadTasksData(allValues);
  };

  const ownerTagRender = (prop: any) => {
    const { filterValues } = state;
    const { owners } = filterValues;
    const { value } = prop;
    if (owners && owners.length && owners[0] === value) {
      return <div className={styles.stardardFilterSelected}>创建者 ({owners.length})</div>;
    } else {
      return <span />;
    }
  };

  useEffect(() => {
    tagsListRun();
    reloadTasksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagsTagRender = (prop: any) => {
    const { filterValues } = state;
    const { tags } = filterValues;
    const { value } = prop;
    if (tags.length && tags[0] === value) {
      return <div className={styles.stardardFilterSelected}>标签 ({tags.length})</div>;
    } else {
      return <span />;
    }
  };

  return (
    <RightContainer pageTitle={false} pageGroup="contacts" pageActive="recycle">
      <Alert message="回收站数据只保存90天" type="warning" showIcon style={{ marginBottom: 12 }} className="both-down" />
      <Card className="both-down">
        <Form
          layout="inline"

          initialValues={state.filterValues}
          onValuesChange={onFilterValuesChange}
        >
          <div className={styles.standardFilterConditions}>
            {usersData?.length ? (
              <Form.Item name="owners" noStyle>
                <TreeSelect
                  treeCheckable={true}
                  treeData={state.userTreeData}
                  dropdownStyle={{ maxHeight: 400, minWidth: 200 }}
                  placeholder={
                    <div style={{ color: '#383838', textAlign: 'center' }}>
                      删除者 <CaretDownOutlined />
                    </div>
                  }
                  tagRender={ownerTagRender}
                  showArrow={false}
                  allowClear
                  className={styles.stardardFilter}
                  bordered={false}
                />
              </Form.Item>
            ) : null}
            <Form.Item name="tags" noStyle>
              <TreeSelect
                treeDataSimpleMode
                dropdownStyle={{ maxHeight: 400, minWidth: 200 }}
                placeholder={
                  <div style={{ color: '#383838', textAlign: 'center' }}>
                    联系人标签 <CaretDownOutlined />
                  </div>
                }
                treeData={state.tagsTreeData}
                bordered={false}
                treeCheckable={true}
                allowClear
                tagRender={tagsTagRender}
                treeNodeFilterProp="name"
                className={styles.stardardFilter}
              />
            </Form.Item>
            <Form.Item name="deleteTime">
              <DateFilter name="删除时间" />
            </Form.Item>
            <Form.Item name="keyword" tooltip="任务名称关键词">
              <Input.Search
                key="searchKey"
                placeholder="名搜索名称、昵称、邮箱"
                style={{ width: 256, verticalAlign: 'middle' }}
                className={styles.stardardFilter}
                allowClear
              />
            </Form.Item>
          </div>
        </Form>
      </Card>
      <Card title={false} className="both-up">
        <div className={styles['tbl-operator']} hidden={!state.tblSelectKeys.length}>
          <Space size={24}>
            <Checkbox
              indeterminate={state.tblSelectKeys.length !== state.contactsData.length}
              checked={state.tblSelectKeys.length > 0}
              onChange={(e) => onActionSelectChange(e.target.checked)}
            />
            <span>
              已选 <a>{state.selectAll ? state.total : state.tblSelectKeys.length}</a>/{state.total}{' '}
              项数据
              <span key="b" style={{ marginLeft: 12 }}>
                {state.selectAll ? null : (
                  <a
                    onClick={() => {
                      setState({ selectAll: true });
                      onSelectAll();
                    }}
                  >
                    选择全部
                  </a>
                )}
              </span>
            </span>
            <Button
              key="111"
              size="small"
              type="primary"
              onClick={() => setState({ restoreVisible: true })}
            >
              恢复
            </Button>
          </Space>
        </div>
        <Table
          rowKey="cid"
          loading={loading}
          dataSource={state.contactsData}
          columns={columns}
          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total) => `总纪录数 ${total} `,
            onChange: onPageParamsChange,
          }}
          rowSelection={{
            selectedRowKeys: state.tblSelectKeys,
            onChange: onTblSelectKeysChange,
            columnWidth: 32,
          }}
          showHeader={!state.tblSelectKeys.length}
        />
      </Card>
      <ContactsRestore
        visible={state.restoreVisible}
        onCancel={() => setState({ restoreVisible: false })}
        rowCount={state.selectAll ? state.total : state.tblSelectKeys.length}
        onAction={(vals: any) => onRestoreAction(vals)}
        loading={restoreLoading}
      />
    </RightContainer>
  );
};

export default Recycle;
