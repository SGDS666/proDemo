import React, { useRef } from 'react';
import { Card, Menu, message } from 'antd';
import styles from './style.less';
import { useSetState } from 'ahooks';
import { apiAccountInfo, apiAccountInfoSave } from '@/services/user';
import { useRequest } from '@umijs/max';
import { ProDescriptions, PageContainer } from '@ant-design/pro-components';
import PasswordChange from './components/PasswordChange';
import EmailVerify from './components/EmailVerify';
import EmailChange from './components/EmailChange';

const Setting: React.FC = () => {
  const actionRef = useRef();
  const [state, setState] = useSetState<Record<string, any>>({
    selectKey: 'base',
    userInfo: {},
    passVisible: false,
    verifyVisible: false,
    changeVisible: false,
  });

  const { refresh: infoRefresh } = useRequest(apiAccountInfo, {
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ userInfo: data });
    },
  });

  const { run: saveRun } = useRequest(apiAccountInfoSave, {
    manual: true,
    onSuccess: () => {
      message.success('保存成功');
      infoRefresh();
    },
  });

  const onBaseSaveAction = (key: any, row: any, oriRow: any) => {
    if (key === 'nickname') {
      const { nickname } = row;
      const { nickname: oriNickname } = oriRow;
      saveRun({ nickname, oriNickname });
    }
    return key;
  };

  const openEmailChange = async () => {
    setState({ verifyVisible: false, changeVisible: true });
  };

  const baseView = () => {
    return (
      <div>
        <div style={{ minWidth: 224, maxWidth: 496 }}>
          <ProDescriptions
            actionRef={actionRef}
            // bordered
            formProps={{
              onValuesChange: (e, f) => console.log(f),
            }}
            title="用户基本信息"
            request={apiAccountInfo}
            column={1}
            bordered
            // eslint-disable-next-line react/jsx-no-duplicate-props
            editable={{ onSave: onBaseSaveAction }}
            columns={[
              {
                title: '邮箱',
                key: 'email',
                dataIndex: 'email',
                copyable: true,
                editable: false,
              },
              {
                title: '用户ID',
                key: 'uid',
                dataIndex: 'uid',
                copyable: true,
                editable: false,
              },
              {
                title: '用户呢称',
                key: 'nickname',
                dataIndex: 'nickname',
              },
              {
                title: '注册时间',
                key: 'create_time',
                dataIndex: 'create_time',
                valueType: 'dateTime',
                editable: false,
              },
              {
                title: '登录时间',
                key: 'login_time',
                dataIndex: 'login_time',
                valueType: 'dateTime',
                editable: false,
              },
              {
                title: '操作',
                valueType: 'option',
                render: () => [
                  <a key="passwordChangeKey" onClick={() => setState({ passVisible: true })}>
                    修改密码
                  </a>,
                  <a key="changeEmailKey" onClick={() => setState({ verifyVisible: true })}>
                    更换邮箱
                  </a>,
                ],
              },
            ]}
          />
        </div>
        <div className={styles.right}></div>
      </div>
    );
  };

  return (
    <PageContainer title={false}>
      <Card>
        <div className={styles.main}>
          <div className={styles.leftMenu}>
            <Menu
              mode="inline"
              selectedKeys={[state.selectKey]}
              onClick={({ key }) => setState({ selectKey: key })}
            >
              <Menu.Item key="base">基本设置</Menu.Item>
              <Menu.Item key="notification">新消息通知</Menu.Item>
            </Menu>
          </div>
          <div className={styles.right}>{baseView()}</div>
        </div>
        <PasswordChange
          visible={state.passVisible}
          onCancel={() => setState({ passVisible: false })}
          current={state.userInfo}
        />
        <EmailVerify
          visible={state.verifyVisible}
          onCancel={() => setState({ verifyVisible: false })}
          actionReload={openEmailChange}
          current={state.userInfo}
        />
        <EmailChange
          visible={state.changeVisible}
          onCancel={() => setState({ changeVisible: false })}
          actionReload={() => infoRefresh()}
        />
      </Card>
    </PageContainer>
  );
};

export default Setting;
