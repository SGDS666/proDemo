import React, { useRef, useState } from 'react';
import { Button, Popconfirm, message, Tree, Col, Row, Space, Tooltip } from 'antd';
import { useRequest } from '@umijs/max';
import RightContainer from '@/components/Global/RightContainer';
import { apiTeamsShow, apiTeamsManage, apiTeamsUserList } from '@/services/enterprise';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { DeleteTwoTone, EditTwoTone, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import ProCard from '@ant-design/pro-card';
import TeamsCreate from './components/TeamsCreate';
import TeamsUpdate from './components/TeamsUpdate';
import TeamsChange from './components/TeamsChange';
import UseAccess from '@/components/Global/UseAccess';
import './style.less';

const EnterpriseTeams: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [teamId, setTeamId] = useState<any>('');
  const [currentRow, setCurrentRow] = useState<any>({});
  const [state, setState] = useSetState({
    createVisible: false,
    updateVisible: false,
    changeVisible: false,
  });

  const { data: treeData, loading: treeLoading, refresh: treeRefresh } = useRequest(apiTeamsShow);

  const { run: deleteRun } = useRequest(apiTeamsManage, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      treeRefresh();
    },
  });

  const reloadMembersData = () => {
    actionRef.current?.reload();
    treeRefresh();
  };

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: '名称',
      dataIndex: 'nickname',
      hideInSearch: true,
    },
    {
      title: '角色',
      dataIndex: 'role_name',
    },
    {
      title: '部门',
      dataIndex: 'teamsName',
      valueType: 'select',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        ok: {
          text: '正常',
          status: 'Processing',
        },
        disabled: {
          text: '已禁用',
          status: 'Error',
        },
        pending: {
          text: '待激活',
          status: 'Default',
        },
      },
    },
    {
      title: '加入时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, record: any) => [
        <a
          key="update"
          onClick={() => {
            setState({ changeVisible: true });
            setCurrentRow(record);
          }}
        >
          更换部门
        </a>,
        <Popconfirm
          key="delete"
          title={`确认删除?`}
          onConfirm={() => deleteRun({ key: record.key })}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  const titleRender = (nodeData: any) => {
    const { title, key, users } = nodeData;
    return (
      <Row style={{ height: 32, fontSize: 16, width: '100%' }}>
        <Col span={20}>
          {title} <UserOutlined /> {users}
        </Col>
        {key === '0' ? null : (
          <UseAccess accessKey="enterprise.teams.manage">
            <Col span={3} className="enterpriseTeamAction">
              <Space>
                <Tooltip title="编辑">
                  <a onClick={() => setState({ updateVisible: true })}>
                    <EditTwoTone />
                  </a>
                </Tooltip>
                <a>
                  <Tooltip title="删除">
                    <Popconfirm
                      title={`确认删除 ${title}?`}
                      okText="删除"
                      cancelText="取消"
                      onConfirm={() => deleteRun({ action: 'delete', team_id: key })}
                    >
                      <DeleteTwoTone />
                    </Popconfirm>
                  </Tooltip>
                </a>
              </Space>
            </Col>
          </UseAccess>
        )}
      </Row>
    );
  };

  const onTeamSelect = async (selectedKeys: React.Key[]) => {
    if (selectedKeys && selectedKeys.length) {
      setTeamId(selectedKeys[0]);
      actionRef.current?.reload();
    }
  };

  return (
    <RightContainer pageTitle={false} pageGroup="enterprise" pageActive="teams">
      <ProCard split="vertical" style={{ minHeight: '80vh' }}>
        <ProCard
          loading={treeLoading}
          title={<span style={{ paddingLeft: 24 }}>部门列表</span>}
          colSpan="408px"
          ghost
          headerBordered
          extra={
            <UseAccess accessKey="enterprise.teams.manage">
              <Button
                type="primary"
                key="primary"
                onClick={() => setState({ createVisible: true })}
                style={{ marginRight: 24 }}
              >
                <PlusOutlined /> 新建部门
              </Button>
            </UseAccess>
          }
        >
          <Tree
            blockNode
            treeData={treeData}
            titleRender={titleRender}
            defaultExpandAll
            showLine={{ showLeafIcon: false }}
            style={{ paddingTop: 12 }}
            onSelect={onTeamSelect}
            selectedKeys={[teamId]}
          />
        </ProCard>
        <ProCard title={false}>
          <ProTable<API.RuleListItem, API.PageParams>
            headerTitle={'部门人员列表'}
            actionRef={actionRef}
            rowKey="uid"
            search={false}
            request={(params, sorter, filter) =>
              apiTeamsUserList({ ...params, sorter, filter, teamId })
            }
            columns={columns}
            rowSelection={false}
          />
        </ProCard>
      </ProCard>
      <TeamsCreate
        visible={state.createVisible}
        actionReload={treeRefresh}
        onCancel={() => setState({ createVisible: false })}
      />
      <TeamsUpdate
        visible={state.updateVisible}
        actionReload={treeRefresh}
        onCancel={() => setState({ updateVisible: false })}
        teamId={teamId}
      />
      <TeamsChange
        visible={state.changeVisible}
        actionReload={reloadMembersData}
        onCancel={() => setState({ changeVisible: false })}
        values={currentRow}
      />
    </RightContainer>
  );
};

export default EnterpriseTeams;
