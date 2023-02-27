import React, { useEffect, useRef } from 'react';
import {
  Row,
  Col,
  Tree,
  Button,
  Space,
  Divider,
  Popconfirm,
  Dropdown,
  message,
  Tabs,
  Modal,
  Card,
  MenuProps,
} from 'antd';
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
import { ProCard } from '@ant-design/pro-components';
import './style.less';
import { useRequest } from '@umijs/max';
import { logicSort } from '@/utils/logicSort';

const MailTemplets: React.FC = () => {
  const actionRef: any = useRef<ActionType>();
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
    owner: 'mine', // mine team system
  });

  const { run: folderRun } = useRequest(apiFolderItems, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ folderItems: data });
    },
  });

  const getFolderList = () => {
    const { type, owner } = state;
    folderRun({ type, owner });
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

  const { run: exchangeRun } = useRequest(apiFolderExchange, {
    manual: true,
    onSuccess: () => {
      getFolderList();
    },
  });

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
    exchangeRun({ type, ids });
  };

  const renderTreeNode = (node: any, index: number) => {
    const { foid, name, count } = node;
    const { treeSelectKeys } = state;
    let icon = <FolderOutlined />;

    if (treeSelectKeys && treeSelectKeys.length && treeSelectKeys[0] === foid) {
      icon = <FolderOpenOutlined />;
    }

    const getMenuitems = () => {
      const items: MenuProps["items"] = []
      logicSort([
        {
          bool: index > 1,
          run1: () => items.push({
            key: "up", label:
              (
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
          }),
          run2: () => items.push({ key: "up", icon: <ArrowUpOutlined />, label: "上升", disabled: true })
        },
        {
          bool: index < 1 || state.folderItems.length === index + 1,
          run1: () => items.push({ key: "down", icon: <ArrowDownOutlined />, label: "下降", disabled: true }),
          run2: () => items.push({
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
        },
        {
          bool: index >= 1,
          run1: () => items.push(
            {
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
            },
            {
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
            }

          ),
          run2: () => items.push(
            { key: "rename", icon: <FormOutlined />, label: "重命名", disabled: true },
            { key: "delete", icon: <DeleteOutlined />, label: "删除分组", disabled: true }
          )

        }
      ])
      return items
    }
    const title = (
      <span className="tree-leaf">
        <Row style={{ width: '100%', whiteSpace: 'nowrap' }}>
          <Col span={20}>
            <span className="name">
              {name}({count})
            </span>
          </Col>
          <Col span={4} className="action" style={{ textAlign: 'right' }}>
            <Dropdown
              menu={{ items: getMenuitems() }}
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

  const onClickDelete = (record: any) => {
    const { _id, name } = record;
    Modal.confirm({
      title: `删除模板：${name}`,
      content: `确定删除？`,
      onOk: () => contentDeleteRun({ id: _id }),
    });
  };

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
      title: '创建者',
      dataIndex: 'userid',
      valueType: 'text',
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
          <a onClick={() => onClickDelete(record)}>删除</a>
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
    actionRef?.current?.reset();
    setState({ treeSelectKeys: selectKeys, foid });
    actionReload();
  };

  const renderFolderMenu = () => {
    return (
      <div style={{ overflow: 'auto' }}>
        <Tree
          blockNode
          showIcon
          treeData={renderTree(state.folderItems)}
          onSelect={onTreeSelect}
          selectedKeys={state.treeSelectKeys}
        />
      </div>
    );
  };

  const onTblChange = async (value: string) => {
    const { type } = state;
    if (value === 'mine') {
    }
    setState({ owner: value });
    folderRun({ type, owner: value });
    actionRef?.current?.reload();
  };

  return (
    <RightContainer pageTitle={false} pageGroup="settings" pageActive="templets" className='both-down'>
      <Card>
        <ProCard split="vertical">
          <ProCard colSpan="256px" className='both-down'>
            <Tabs
              activeKey={state.owner}
              onChange={(val: string) => onTblChange(val)}
              items={[
                { label: "我的", key: "mine", children: renderFolderMenu() },
                { label: "团队", key: "team", children: renderFolderMenu() },
                { label: "系统", key: "system", children: renderFolderMenu(), disabled: true },
              ]}
            >

            </Tabs>
            {state.owner === 'mine' ? (
              <Button
                style={{ width: '100%' }}
                type="primary"
                onClick={() => setState({ folderVisible: true, folder: null })}
              >
                <PlusOutlined /> 新增目录
              </Button>
            ) : null}
          </ProCard>
          <ProCard headerBordered className='both-down'>
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
                apiContentList({ ...params, sorter, filter, foid: state.foid, owner: state.owner })
              }
              columns={columns}
              search={false}
            />
          </ProCard>
        </ProCard>
      </Card>

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

export default MailTemplets;
