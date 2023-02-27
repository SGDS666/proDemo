import React, { useEffect, useRef } from 'react';
import { Row, Col, Tree, Button, Space, Divider, Popconfirm, Dropdown,  message, MenuProps } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  FormOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import RightContainer from '@/components/Global/RightContainer';
import styles from './style.less';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  apiContentList,
  apiContentDelete,
  apiFolderItems,
  apiFolderDelete,
  apiFolderExchange,
} from '@/services/mails';
import MailContentOperation from '@/components/Mails/MailContent';
import MailFolderOption from '@/components/Mails/MailFolder';
import { useSetState } from 'ahooks';
import { useRequest } from '@umijs/max';

const MailContent: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<Record<string, any>>({
    contentVisible: false,
    folderVisible: false,
    folder: null,
    folderItems: [],
    type: 'content',
    treeHeight: 600,
    tableHeight: 600,
    treeSelectKeys: ['0'],
    foid: '0',
    action: 'add',
    currentValues: {},
  });

  const getFolderList = async () => {
    const { type } = state;
    const data = await apiFolderItems({ type });
    if (data) {
      setState({ folderItems: [...data] });
    }
  };

  const actionReload = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
    getFolderList();
  };

  const { run: contentDeleteRun } = useRequest(apiContentDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除邮件模板成功！');
      if (actionRef.current) {
        actionRef.current.reload();
      }
      getFolderList();
    },
  });

  const confirmRemove = async (record: any) => {
    const { _id } = record;
    contentDeleteRun({ id: _id });
  };

  const { run: folderDeleteRun } = useRequest(apiFolderDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除分组成功!');
      getFolderList();
    },
  });

  const folderDelete = async (foid: string) => {
    const { type } = state;
    await folderDeleteRun({ type, foid });
  };

  const folderExchange = async (action: string, index: number, node: any) => {
    const { folderItems, type } = state;
    const id1 = node.foid;
    let idx;
    if (action === 'up') {
      idx = index - 1;
    } else {
      idx = index + 1;
    }
    const id2 = folderItems[idx].foid;
    const ids = [id1, id2];
    const success = await apiFolderExchange({ type, ids });
    if (success) {
      // getFolderList();
    }
  };

  const renderTreeNode = (node: any, index: number) => {
    const { foid, name, count } = node;
    const { treeSelectKeys } = state;
    let icon = <FolderOutlined />;
    if (treeSelectKeys && treeSelectKeys.length && treeSelectKeys[0] === foid) {
      icon = <FolderOpenOutlined />;
    }
    const getMenuitems = (): MenuProps["items"] => {
      const menuitems = []
      if (index > 1) {
        menuitems.push({
          key: "up", label: (
            <a
              onClick={(event) => {
                event.stopPropagation();
                folderExchange('up', index, node);
              }}
            >
              <ArrowUpOutlined />
              上升
            </a>
          )
        })
      } else {
        menuitems.push({ key: "up", icon: <ArrowUpOutlined />, label: "上升", disabled: true })
      }
      if (index < 1 || state.folderItems.length === index + 1) {
        menuitems.push({ key: "down", icon: <ArrowDownOutlined />, label: "下降", disabled: true })
      } else {
        menuitems.push({
          key: "down",

          label: (<a
            onClick={(event) => {
              event.stopPropagation();
              folderExchange('down', index, node);
            }}
          >
            <ArrowDownOutlined />
            下降
          </a>)
        })
      }
      if (index >= 1) {
        menuitems.push({
          key: "rename", label: (
            <a
              onClick={(event) => {
                event.stopPropagation();
                setState({ folderVisible: true, folder: node });
              }}
            >
              <FormOutlined /> 重命名
            </a>
          )
        })
        menuitems.push({
          key: "delete", label: (
            <Popconfirm title={`确认删除分组：${name}?`}>
              <a
                onClick={(event) => {
                  event.stopPropagation();
                  folderDelete(foid);
                }}
              >
                <DeleteOutlined />
                删除分组
              </a>
            </Popconfirm>
          )
        })
      } else {
        menuitems.push({ key: "rename", icon: <FormOutlined />, label: "重命名", disabled: true })
        menuitems.push({ key: "delete", icon: <DeleteOutlined />, label: "删除分组", disabled: true })
      }

      return menuitems
    }
    const title = (
      <span className="tree-leaf">
        <Row style={{ width: '100%' }}>
          <Col span={20}>
            <span className="name">
              {name}({count})
            </span>
          </Col>
          <Col span={4} className="action" style={{ textAlign: 'right' }}>
            <Dropdown
              menu={{items:getMenuitems()}}
              
            >
              <EllipsisOutlined
                onClick={(event) => {
                  event.stopPropagation();
                }}
              />
            </Dropdown>
          </Col>
        </Row>
      </span>
    );

    return { key: foid, title, icon };
  };

  const renderTree = (list: any) => {
    if (!list) {
      return [];
    }
    const tree = list.map((node: any, idx: number) => renderTreeNode(node, idx));
    return tree;
  };

  useEffect(() => {
    getFolderList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ProColumns<any>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: '主题',
      dataIndex: 'subject',
      valueType: 'text',
    },
    {
      title: '邮件正文',
      dataIndex: 'html',
      valueType: 'text',
      ellipsis: true,
      width: '50%',
      render: (_, record) => (
        <>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ maxHeight: 100 }} dangerouslySetInnerHTML={{ __html: record.html }} />
          </div>
        </>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      valueType: 'dateTime',
      sorter: (a, b) => a.create_time - b.create_time,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              setState({ contentVisible: true, currentValues: record, action: 'copy' });
            }}
          >
            复制
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              setState({ contentVisible: true, currentValues: record, action: 'update' });
            }}
          >
            修改
          </a>
          <Divider type="vertical" />
          <Popconfirm title={`确认删除：${record.name}?`} onConfirm={() => confirmRemove(record)}>
            <a href="#">删除</a>
          </Popconfirm>
        </>
      ),
    },
  ];

  const onTreeSelect = (selectKeys: any) => {
    let foid;
    if (!selectKeys.length) {
      // eslint-disable-next-line no-param-reassign
      selectKeys = ['all'];
      foid = 'all';
    } else {
      foid = selectKeys[0];
    }
    setState({ treeSelectKeys: selectKeys, foid });
    actionReload();
  };

  return (
    <RightContainer pageTitle={false} pageGroup="settings" pageActive="templets">
      <div className={styles.main}>
        <div className={styles.leftMenu}>
          <div style={{ fontSize: 16, margin: '0px 10px 4px 10px' }}>
            <Row>
              <Col span={20}>
                <span>内容分组()</span>
              </Col>
              <Col span={4} style={{ textAlign: 'center' }}>
                <a onClick={() => setState({ folderVisible: true, folder: null })}>
                  <PlusOutlined />
                </a>
              </Col>
            </Row>
          </div>
          <div style={{ overflow: 'auto', maxHeight: state.treeHeight }}>
            <Tree
              blockNode
              showIcon
              treeData={renderTree(state.folderItems)}
              onSelect={onTreeSelect}
              selectedKeys={state.treeSelectKeys}
            />
          </div>
        </div>
        <div className={styles.right}>
          <ProTable
            headerTitle="邮件模板"
            actionRef={actionRef}
            rowKey="_id"
            toolBarRender={(action, { selectedRows }) => [
              <Button
                key="create"
                type="primary"
                onClick={() => {
                  setState({ contentVisible: true, action: 'add', currentValues: {} });
                }}
              >
                <PlusOutlined /> 新建
              </Button>,
              selectedRows && selectedRows.length > 0 && (
                <Space key="skey">
                  <Button key="333">批量删除</Button>
                </Space>
              ),
            ]}
            tableAlertRender={({ selectedRowKeys }) => (
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
              </div>
            )}
            request={(params, sorter, filter) =>
              apiContentList({ ...params, sorter, filter, foid: state.foid })
            }
            columns={columns}
            search={false}
          />
        </div>
      </div>
      <MailContentOperation
        visible={state.contentVisible}
        onCancel={() => setState({ contentVisible: false })}
        current={state.currentValues}
        actionReload={actionReload}
        folderItems={state.folderItems}
        action={state.action}
      />
      <MailFolderOption
        visible={state.folderVisible}
        onCancel={() => setState({ folderVisible: false })}
        folder={state.folder}
        actionReload={getFolderList}
        type={state.type}
      />
    </RightContainer>
  );
};

export default MailContent;
