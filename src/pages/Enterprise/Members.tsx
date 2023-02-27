import React, { useRef, useState } from 'react';
import { Button, Popconfirm, message } from 'antd';
import { useRequest } from '@umijs/max';
import RightContainer from '@/components/Global/RightContainer';
import { apiMembersShow, apiMembersDisable, apiMembersDelete } from '@/services/enterprise';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import MemberUpdate from './components/MemberUpdate';
import MemberInvite from './components/MemberInvite';
import UseAccess from '@/components/Global/UseAccess';
import RoleChange from './components/RoleChange';
import TeamsChange from './components/TeamsChange';

const EnterpriseMembers: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>({});
  const [state, setState] = useSetState({
    inviteVisible: false,
    updateVisible: false,
    roleVisible: false,
    teamVisible: false,
  });

  const tblDataRload = () => {
    actionRef.current?.reload();
  };

  const { run: deleteRun } = useRequest(apiMembersDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      tblDataRload();
    },
  });

  const { run: disableRun } = useRequest(apiMembersDisable, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      tblDataRload();
    },
  });

  const renderOperation = (record: any) => {
    const { userid, role_id, status } = record;
    let disableAction = null;
    if (status === 'ok' && role_id !== 'owner') {
      disableAction = (
        <UseAccess accessKey="enterprise.members.disable" key="disableAction">
          <Popconfirm title="确认禁用?" onConfirm={() => disableRun({ userid, action: 'disable' })}>
            <a style={{ color: 'orange' }}>禁用</a>
          </Popconfirm>
        </UseAccess>
      );
    } else if (status === 'disabled') {
      disableAction = (
        <UseAccess accessKey="enterprise.members.disable" key="enableAction">
          <Popconfirm title="确认启用?" onConfirm={() => disableRun({ userid, action: 'enable' })}>
            <a style={{ color: 'green' }}>启用</a>
          </Popconfirm>
        </UseAccess>
      );
    }
    const deleteAction = (
      <UseAccess accessKey="enterprise.members.delete" key="deleteAction">
        <Popconfirm title="确认删除?" onConfirm={() => deleteRun({ userid })}>
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>
      </UseAccess>
    );
    return [disableAction, deleteAction];
  };

  const renderNickname = (record: any) => {
    const { nickname } = record;
    return (
      <span>
        {nickname}{' '}
        <UseAccess accessKey="enterprise.members.modify" key="renameAction">
          <a
            onClick={() => {
              setCurrentRow(record);
              setState({ updateVisible: true });
            }}
          >
            <EditOutlined />
          </a>
        </UseAccess>
      </span>
    );
  };

  const renderRole = (record: any) => {
    const { role_name, role_id } = record;
    const roleAction =
      role_id === 'owner' ? null : (
        <UseAccess accessKey="enterprise.role.change" key="roleAction">
          <a
            onClick={() => {
              setCurrentRow(record);
              setState({ roleVisible: true });
            }}
          >
            <EditOutlined />
          </a>
        </UseAccess>
      );
    return (
      <span>
        {role_name} {roleAction}
      </span>
    );
  };

  const renderTeam = (record: any) => {
    const { teamsName } = record;
    return (
      <span>
        {teamsName}{' '}
        <UseAccess accessKey="enterprise.team.modify" key="renameAction">
          <a
            onClick={() => {
              setCurrentRow(record);
              setState({ teamVisible: true });
            }}
          >
            <EditOutlined />
          </a>
        </UseAccess>
      </span>
    );
  };

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: '邮箱',
      dataIndex: 'email',
      hideInSearch: true,
    },
    {
      title: '名称',
      dataIndex: 'nickname',
      render: (_: any, record: any) => renderNickname(record),
    },
    {
      title: '角色',
      dataIndex: 'role_name',
      hideInSearch: true,
      render: (_: any, record: any) => renderRole(record),
    },
    {
      title: '部门',
      dataIndex: 'teamsName',
      valueType: 'treeSelect',
      hideInSearch: true,
      render: (_: any, record: any) => renderTeam(record),
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
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, record: any) => renderOperation(record),
    },
  ];

  return (
    <RightContainer pageTitle={false} pageGroup="enterprise" pageActive="members">
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={'成员列表'}
        actionRef={actionRef}
        rowKey="userid"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <UseAccess accessKey="enterprise.members.invite" key="inviteKey">
            <Button type="primary" onClick={() => setState({ inviteVisible: true })}>
              <PlusOutlined /> 邀请
            </Button>
          </UseAccess>,
        ]}
        request={apiMembersShow}
        columns={columns}
        rowSelection={false}
      />
      <MemberUpdate
        visible={state.updateVisible}
        actionReload={tblDataRload}
        values={currentRow}
        onCancel={() => setState({ updateVisible: false })}
      />
      <MemberInvite
        visible={state.inviteVisible}
        actionReload={tblDataRload}
        onCancel={() => setState({ inviteVisible: false })}
      />
      <RoleChange
        visible={state.roleVisible}
        onCancel={() => setState({ roleVisible: false })}
        actionReload={tblDataRload}
        values={currentRow}
      />
      <TeamsChange
        visible={state.teamVisible}
        actionReload={tblDataRload}
        onCancel={() => setState({ teamVisible: false })}
        values={currentRow}
      />
    </RightContainer>
  );
};

export default EnterpriseMembers;
