import { Button, Checkbox, Col, Dropdown, Menu, MenuProps, message, Popconfirm, Row, Tabs } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import ProCard from '@ant-design/pro-card';
import {
  apiPermissionTree,
  apiRolePermissionsShow,
  apiPermissionsManage,
  apiRolesList,
  apiRoleUserList,
} from '@/services/enterprise';
import { useSetState } from 'ahooks';
import { useRequest } from '@umijs/max';
import RightContainer from '@/components/Global/RightContainer';
import UseAccess from '@/components/Global/UseAccess';
import './style.less';
import {
  DashOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import RoleCreateForm from './components/RoleCreate';
import RoleUpdateForm from './components/RoleUpdate';
import RoleChange from './components/RoleChange';

const Permissions: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>({});
  const [state, setState] = useSetState<any>({
    createVisible: false,
    updateVisible: false,
    changeVisible: false,
    roleId: 'owner',
    roleName: '拥有者',
    roleUsers: 0,
    permissions: {},
  });
  const { data: treeData, loading: treeLoading } = useRequest(apiPermissionTree);

  const { data: rolesList, refresh: roleRefresh } = useRequest(apiRolesList);

  const { run: runSave, loading: saveLoading } = useRequest(apiPermissionsManage, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
    },
  });

  const reloadRoleAction = async (role_id: string) => {
    await roleRefresh();
    setState({ roleId: role_id });
  };

  const membersReload = () => {
    actionRef.current?.reload();
    roleRefresh();
  };

  const reloadRolePermissions = async () => {
    const { roleId } = state;
    const result = await apiRolePermissionsShow({ roleId });
    const { success, data } = result;
    if (success) {
      setState({ permissions: data });
    }
    // eslint-disable-next-line guard-for-in
    for (const idx in rolesList) {
      const { role_id, role_name, users } = rolesList[idx];
      if (role_id === roleId) {
        setState({ roleName: role_name, roleUsers: users });
        break;
      }
    }
  };

  // 权限范围保存
  const onSaveAction = () => {
    const { roleId, permissions } = state;
    runSave({ role_id: roleId, permissions, action: 'update' });
  };

  const renderOperation = (record: any) => {
    const { role_id } = record;
    if (role_id === 'owner') {
      return [];
    }
    return [
      <UseAccess key="update" accessKey="enterprise.permissions.manage">
        <a
          key="updateRoleKey"
          onClick={() => {
            setCurrentRow(record);
            setState({ changeVisible: true });
          }}
        >
          更换角色
        </a>
      </UseAccess>,
    ];
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
      render: (_: any, record: any) => renderOperation(record),
    },
  ];

  // 检查父级是否模糊选择
  const checkFatherIndeterminate = (childKey: string, permissions: any) => {
    const fatherKey = childKey.split('.')[0];
    let checkedCount = 0;
    let uncheckCount = 0;
    // eslint-disable-next-line guard-for-in
    for (const key in permissions) {
      const father = key.split('.')[0];
      if (father === fatherKey && father !== key) {
        const { checked } = permissions[key];
        if (checked) {
          checkedCount += 1;
        } else {
          uncheckCount += 1;
        }
      }
    }
    if (checkedCount && uncheckCount) {
      permissions[fatherKey] = { ...permissions[fatherKey], indeterminate: true };
    } else {
      permissions[fatherKey] = { ...permissions[fatherKey], indeterminate: false };
    }
    setState({ permissions });
  };

  // 子选项发生变化时
  const onChildCheckboxChange = (key: string, value: boolean) => {
    const { permissions } = state;
    permissions[key] = { ...permissions[key], checked: value };
    setState({ permissions });
    checkFatherIndeterminate(key, permissions);
  };

  const renderChildren = (children: any) => {
    const { permissions } = state;
    return children.map((item: any) => {
      const { name, key } = item;
      if (!permissions[key]) {
        permissions[key] = { checked: false };
      }
      return (
        <Checkbox
          key={key}
          checked={permissions[key].checked}
          onChange={(e) => onChildCheckboxChange(key, e.target.checked)}
          disabled={state.roleId === 'owner' ? true : false}
        >
          {name}
        </Checkbox>
      );
    });
  };

  // 父级发生变化时
  const onFatherCheckboxChange = (key: string, value: boolean) => {
    const { permissions } = state;
    permissions[key] = { ...permissions[key], indeterminate: false };
    for (const idx in permissions) {
      if (idx && idx.indexOf(key) === 0) {
        permissions[idx] = { ...permissions[idx], checked: value };
      }
    }
    setState({ permissions });
  };

  const renderFather = (key: string, name: string) => {
    const { permissions } = state;
    return (
      <Checkbox
        key={key}
        indeterminate={permissions[key]?.indeterminate}
        checked={permissions[key]?.checked}
        onChange={(e) => onFatherCheckboxChange(key, e.target.checked)}
        disabled={state.roleId === 'owner' ? true : false}
      >
        {name}
      </Checkbox>
    );
  };

  const onRoleClick = (e: any) => {
    const key = e.key;
    setState({ roleId: key });
    actionRef.current?.reload();
  };

  const onRoleDelete = async (role_id: string) => {
    await runSave({ action: 'delete', role_id });
    await roleRefresh();
    setState({ roleId: 'owner' });
  };

  useEffect(() => {
    reloadRolePermissions();
    actionRef.current?.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.roleId]);

  const onRoleUpdateClick = (role_id: string, role_name: string) => {
    setState({ roleId: role_id, roleName: role_name });
    setState({ updateVisible: true });
  };
  const roleActionMenu = (role_id: string, role_name: string): MenuProps => {
    return {
      style: { fontSize: 16 },
      items: [
        {
          key: "changeKey",
          label: (
            <a onClick={() => onRoleUpdateClick(role_id, role_name)}>
              <EditOutlined /> 修改
            </a>
          )
        },
        {
          key: "deleteKey",
          label: (
            <Popconfirm
              key="delete"
              title={`确认删除 ${role_name}?`}
              onConfirm={() => onRoleDelete(role_id)}
            >
              <DeleteOutlined /> 删除
            </Popconfirm>
          )
        }
      ]
    }
  }




  return (
    <RightContainer pageTitle={false} pageGroup="enterprise" pageActive="permissions">
      <ProCard split="vertical">
        <ProCard
          title={<span style={{ paddingLeft: 24 }}>角色列表</span>}
          colSpan="208px"
          ghost
          headerBordered
        >
          <Menu mode="inline" selectedKeys={[state.roleId]} onClick={onRoleClick}>
            {rolesList?.map((item: any) => {
              const { role_id, role_name, users } = item;
              return (
                <Menu.Item key={role_id} title={role_name}>
                  <Row>
                    <Col span={21} key="roleNameKey">
                      {role_name} <UserOutlined /> {users}{' '}
                    </Col>
                    {['owner', 'admin', 'leader', 'user', 'none'].indexOf(role_id) >= 0 ? null : (
                      <Col span={3} className="enterpriseRoleAction" key="actionKey">
                        <UseAccess accessKey="enterprise.permissions.manage">
                          <Dropdown menu={roleActionMenu(role_id, role_name)}>
                            <DashOutlined />
                          </Dropdown>
                        </UseAccess>
                      </Col>
                    )}
                  </Row>
                </Menu.Item>
              );
            })}
          </Menu>
          <div style={{ marginTop: 24, marginLeft: 24, paddingBottom: 48 }}>
            <UseAccess accessKey="enterprise.permissions.manage">
              <Button type="primary" onClick={() => setState({ createVisible: true })}>
                <PlusOutlined /> 新增角色
              </Button>
            </UseAccess>
          </div>
        </ProCard>
        <ProCard
          loading={treeLoading}
          title={<span style={{ paddingLeft: 24 }}>{state.roleName}</span>}
          headerBordered
          ghost
        >
          <Tabs defaultActiveKey="members" style={{ paddingLeft: 24 }}>
            <Tabs.TabPane tab="成员列表" key="members">
              <ProTable<API.RuleListItem, API.PageParams>
                headerTitle={false}
                options={false}
                actionRef={actionRef}
                rowKey="uid"
                search={false}
                request={(params, sorter, filter) =>
                  apiRoleUserList({ ...params, sorter, filter, roleId: state.roleId })
                }
                columns={columns}
                rowSelection={false}
              />
            </Tabs.TabPane>
            {state.roleId === 'none' ? null : (
              <Tabs.TabPane tab="权限范围" key="permissions">
                {treeData?.length
                  ? treeData.map(
                    (item: { key: string; name: string; tip: string; children: any }) => {
                      const { key, name, tip, children } = item;
                      return (
                        <ProCard key={key} title={renderFather(key, name)} tooltip={tip} bordered>
                          {renderChildren(children)}
                        </ProCard>
                      );
                    },
                  )
                  : null}
                <UseAccess accessKey="enterprise.permissions.manage">
                  {state.roleId === 'owner' ? null : (
                    <Button
                      type="primary"
                      style={{ marginTop: 24, marginBottom: 24 }}
                      loading={saveLoading}
                      onClick={onSaveAction}
                    >
                      保存
                    </Button>
                  )}
                </UseAccess>
              </Tabs.TabPane>
            )}
          </Tabs>
        </ProCard>
      </ProCard>
      <RoleCreateForm
        visible={state.createVisible}
        onCancel={() => setState({ createVisible: false })}
        actionReload={reloadRoleAction}
      />
      <RoleUpdateForm
        visible={state.updateVisible}
        onCancel={() => setState({ updateVisible: false })}
        actionReload={roleRefresh}
        values={{ role_id: state.roleId, role_name: state.roleName }}
      />
      <RoleChange
        visible={state.changeVisible}
        onCancel={() => setState({ changeVisible: false })}
        actionReload={membersReload}
        values={currentRow}
      />
    </RightContainer>
  );
};

export default Permissions;
