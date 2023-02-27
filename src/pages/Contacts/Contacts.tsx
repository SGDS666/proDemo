import React, { useEffect, useState } from 'react';
import RightContainer from '@/components/Global/RightContainer';
import { Dropdown, Input, List, Modal, Tooltip, Card, Divider } from 'antd';
import { useSetState } from 'ahooks';
import {
  CaretDownOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  PlusOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import ViewSelect from '@/components/Contacts/ViewSelect';
import ViewCreate from '@/components/Contacts/ViewCreate';
import ViewRename from '@/components/Contacts/ViewRename';
import {
  apiPinViews,
  apiPinViewsSave,
  apiViewsList,
  apiViewConfig,
  apiViewDelete,
} from '@/services/contacts';
import ContactsDataTable from './components/ContactsDataTable';
import { ProCard } from '@ant-design/pro-components';
import RcResizeObserver from 'rc-resize-observer';
import styles from './style.less';
import ViewShare from '@/components/Contacts/ViewShare';
import EditTabs from '@/components/EditTabs';
import { SetState } from 'ahooks/lib/useSetState';

import { renderUnpinView } from './components/UnPin';
import { PinTabName } from './components/Pin';

interface AllViewListProps {
  responsive: boolean,
  setResponsive: (b: boolean) => void,
  state: Record<string, any>,
  setState: SetState<Record<string, any>>,

}
//查看所有视图组件
const AllViewList: React.FC<AllViewListProps> = (props) => {
  const { responsive, setResponsive, state, setState } = props
  const { run: viewConfigRun } = useRequest(apiViewConfig, { manual: true });
  const { run: viewsListRun } = useRequest(apiViewsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { mineViews, othersViews, systemViews } = data;
      setState({ mineViews, othersViews, systemViews });
    },
  });
  const { run: viewDeleteRun } = useRequest(apiViewDelete, {
    manual: true,
    onSuccess: () => {
      viewsListRun();
    },
  });
  const onClickCopy = async (item: any) => {
    const { viewId, name } = item;
    const data = await viewConfigRun({ viewId });
    const { filters } = data;
    setState({ filters, viewName: `${name}(副本)`, viewCreateVisible: true });
  };
  const onClickRename = (item: any) => {
    const { viewId, name } = item;
    setState({ viewId, viewName: name, renameVisible: true });
  };
  const onClickShare = (item: any) => {
    const { viewId, shared } = item;
    setState({ viewId, viewShared: shared, shareVisible: true });
  };
  const onClickDelete = (item: any) => {
    const { viewId, name } = item;
    Modal.confirm({
      title: `删除视图：${name}`,
      content: `确定删除视图？`,
      onOk: () => viewDeleteRun({ viewId }),
    });
  };

  const renderAction = (item: any, owner: string) => {
    let saveDisable = false;
    let delDisable = false;
    let shareDisable = false;
    if (owner === 'system' || owner === 'other') {
      saveDisable = true;
      delDisable = true;
      shareDisable = true;
    }
    return (
      <Dropdown
        key="more-actions"
        menu={{
          items: [
            {
              key: "info",
              icon: <CopyOutlined />,
              label: "复制",
              onClick: () => onClickCopy(item),
            },
            {
              key: "save",
              icon: <EditOutlined />,
              label: "重命名",
              disabled: saveDisable,
              onClick: () => onClickRename(item)
            },
            {
              key: "share",
              icon: <ShareAltOutlined />,
              label: "分享设置",
              disabled: shareDisable,
              onClick: () => onClickShare(item)
            },
            {
              key: "delete",
              icon: <DeleteOutlined />,
              label: "删除",
              disabled: delDisable,
              onClick: () => onClickDelete(item)

            }
          ]
        }}

      >
        <a>
          操作 <CaretDownOutlined />
        </a>
      </Dropdown>
    );
  };

  const renderSystemViews = () => {
    return (
      <List
        size="large"
        dataSource={state.systemViews}
        rowKey="viewId"
        renderItem={(item: any) => (
          <List.Item key={item.viewId} actions={[renderAction(item, 'system')]}>
            <div style={{}}> {item.name}</div>
          </List.Item>
        )}
      />
    );
  };

  const renderMineViews = () => {
    return (
      <List
        size="large"
        dataSource={state.mineViews}
        rowKey="viewId"
        renderItem={(item: any) => {
          const { name, shared, viewId } = item;
          const { keyword } = state;
          if (keyword && name.toLowerCase().indexOf(keyword.toLowerCase()) < 0) {
            return null;
          }
          return (
            <List.Item key={viewId} actions={[renderAction(item, 'mine')]}>
              <div >
                {name}{' '}
                {shared === 'everyone' ? (
                  <Tooltip title="已分享">
                    <ShareAltOutlined />
                  </Tooltip>
                ) : null}
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  const renderOtherViews = () => {
    return (
      <List
        size="large"
        dataSource={state.othersViews}
        rowKey="viewId"
        renderItem={(item: any) => {
          const { name, shared, viewId } = item;
          const { keyword } = state;
          if (keyword && name.toLowerCase().indexOf(keyword.toLowerCase()) < 0) {
            return null;
          }
          return (
            <List.Item key={viewId} actions={[renderAction(item, 'other')]}>
              <div>

                {name}{' '}
                {shared === 'everyone' ? (
                  <Tooltip title="已分享">
                    <ShareAltOutlined />
                  </Tooltip>
                ) : null}
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <Card className={`${styles.viewTabs} both-left`} style={{ marginTop: "38px" }}>
      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          setResponsive(offset.width < 800);
        }}
      >
        <ProCard
          title={
            <div>
              <span>所有视图列表</span>
            </div>
          }
          extra={
            <Input.Search
              placeholder="查找"
              allowClear
              style={{ width: 200 }}
              size="large"
              value={state.keyword}
              onChange={(e) => setState({ keyword: e.target.value })}
            />
          }
          split={responsive ? 'horizontal' : 'vertical'}
          bordered
          headerBordered
        >
          <ProCard title="系统默认" colSpan={responsive ? '100%' : '33%'} key="systemViews">
            <div style={{ minHeight: 540 }} key="sysViewsContent">
              {renderSystemViews()}
            </div>
          </ProCard>
          <ProCard title="我创建的" key="mineViews">
            <div style={{ minHeight: 540 }} key="mineViewsContent">
              {renderMineViews()}
            </div>
          </ProCard>
          <ProCard title="其他人创建的" key="otherViews">
            <div style={{ minHeight: 540 }} key="otherViewsContent">
              {renderOtherViews()}
            </div>
          </ProCard>
        </ProCard>
      </RcResizeObserver>


    </Card>
  )
}


const Contacts: React.FC = () => {
  const [responsive, setResponsive] = useState(false);
  const [state, setState] = useSetState<Record<string, any>>({
    viewSelectVisible: false, // 视图选择
    viewCreateVisible: false, // 创建视图
    renameVisible: false, // 重命名视图
    viewId: '',
    viewName: '',
    viewShared: 'private',
    shareVisible: false,
    unpinViewData: {}, // 临时视图（未固定）
    viewActiveKey: '', // 当前视图KEY
    viewIds: [],
    viewItems: [],
    unpinViewActionVisible: false,
    pinViewActionVisible: false,
    showAllViews: false,
    mineViews: [],
    othersViews: [],
    systemViews: [],
    filters: [],
    keyword: '',
  });
  const { run: viewsListRun } = useRequest(apiViewsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { mineViews, othersViews, systemViews } = data;
      setState({ mineViews, othersViews, systemViews });
    },
  });

  const { run: pinViewsRun, refresh: pinViewsRefresh } = useRequest(apiPinViews, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { viewActiveKey } = state;
      if (data?.length) {
        const viewIds = [];
        // eslint-disable-next-line guard-for-in
        for (const idx in data) {
          const { viewId } = data[idx];
          if (`${idx}` === '0' && !viewActiveKey) {
            setState({ viewActiveKey: viewId });
          }
          viewIds.push(viewId);
        }
        setState({ viewIds, viewItems: data });
      }
    },
  });

  const { run: savePinView } = useRequest(apiPinViewsSave, { manual: true });

  const onViewSelectAction = async (val: any) => {
    const { viewId, name } = val;
    const { viewIds } = state;
    setState({ viewActiveKey: viewId });
    if (viewIds.indexOf(viewId) >= 0) {
      return;
    }
    if (viewIds && viewIds.length > 5) {
      setState({ unpinViewData: { viewId, name } });
    } else {
      await savePinView({ viewIds: [...viewIds, viewId] });
      pinViewsRefresh();
    }
    // const { viewId, name } = val;
    // setState({ unpinViewData: { viewId, name }, viewActiveKey: viewId });
  };

  // 创建新视图成功
  const onViewCreateSuccess = async (vals: any) => {
    const { viewId, name } = vals;
    const { viewIds } = state;
    if (viewIds && viewIds.length > 5) {
      setState({ viewActiveKey: viewId });
      setState({ unpinViewData: { viewId, name } });
    } else {
      await savePinView({ viewIds: [...viewIds, viewId] });
      pinViewsRefresh();
    }
    viewsListRun();
    // const { viewId, name } = val;
    // setState({ unpinViewData: { viewId, name } });
  };

  const onViewRenameSuccess = () => {
    pinViewsRun();
    viewsListRun();
  };

  const onViewSharedSuccess = () => {
    viewsListRun();
  };



  const onViewEdit = (targetKey: any, action: 'add' | 'remove') => {
    if (!targetKey) {
      return;
    }
    if (action === 'add') {
      return;
    }
    const { unpinViewData, viewActiveKey, viewIds } = state;
    const { viewId } = unpinViewData;
    if (viewId === targetKey) {
      // 未固定视图删除
      setState({ unpinViewData: {} });
      if (viewActiveKey === targetKey) {
        setState({ viewActiveKey: viewIds[0] });
      }
      return;
    }
    const index = viewIds.indexOf(targetKey);
    if (index >= 0) {
      viewIds.splice(index, 1);
      setState({ viewIds });
      savePinView({ viewIds });
      if (viewActiveKey === targetKey) {
        setState({ viewActiveKey: viewIds[0] });
      }
    }
  };
  const onViewChange = (key: string) => {
    setState({ viewActiveKey: key });
  };


  useEffect(() => {
    pinViewsRun();
    viewsListRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RightContainer pageTitle={false} pageGroup="contacts" pageActive="contacts">
      <div style={{ width: "100%", height: "5vh", }}>
        <EditTabs
          className='both-down'
          items={
            [...state.viewIds?.map(
              (viewId: string, index: number) => ({
                key: viewId,
                onEdit: () => onViewEdit(viewId, "add"),
                label: <PinTabName {...{ viewId, index, state, setState, savePinView }} />,
                // closable:index !== 0,
                onClick: () => onViewChange(viewId),
                style: { width: "140px", justifyContent: "space-around" } as React.CSSProperties
              }))
              ,
            renderUnpinView({ state, setState, onViewEdit, onViewChange, savePinView }),
            {
              key: "inset",
              label: (
                <ViewSelect

                  onSelectAction={(val) => onViewSelectAction(val)}
                  showCreate={() => setState({ viewCreateVisible: true })}
                >
                  <div style={{ width: '100%', cursor: "pointer" }}>
                    <PlusOutlined />
                  </div>
                </ViewSelect>)

            },

            ]
          }

          optionItems={
            [
              {
                key: "additem",
                label: "创建视图",
                style: { cursor: "pointer" },
                onClick: () => setState({ viewCreateVisible: true }),

              },
              !state.showAllViews ?
                {
                  key: "all",
                  label: "所有视图",
                  style: { cursor: "pointer" },
                  onClick: () => setState({ showAllViews: true })
                } : {
                  key: "all",
                  style: { cursor: "pointer" },
                  label: <p><LeftOutlined />返回</p>,
                  onClick: () => setState({ showAllViews: false }),

                }

            ]}
        />
        <Divider style={{ margin: 0 }} />
        {
          !state.showAllViews
          &&
          <div className='both-up' style={{ marginTop: "16px" }}>
            <ContactsDataTable
              viewId={state.viewActiveKey}
              createReload={(vals: any) => onViewCreateSuccess(vals)}
            />
          </div>
        }
      </div>
      {
        state.showAllViews
        &&
        <AllViewList {...{ setState, state, responsive, setResponsive }} />
      }

      <ViewCreate
        visible={state.viewCreateVisible}
        onCancel={() => setState({ viewCreateVisible: false })}
        actionReload={(vals: any) => onViewCreateSuccess(vals)}
        filters={state.filters}
        name={state.viewName}
      />
      <ViewRename
        visible={state.renameVisible}
        onCancel={() => setState({ renameVisible: false })}
        viewId={state.viewId}
        viewName={state.viewName}
        actionReload={() => onViewRenameSuccess()}
      />
      <ViewShare
        visible={state.shareVisible}
        onCancel={() => setState({ shareVisible: false })}
        viewId={state.viewId}
        viewShared={state.viewShared}
        actionReload={() => onViewSharedSuccess()}
      />
    </RightContainer>
  );
};

export default Contacts;
