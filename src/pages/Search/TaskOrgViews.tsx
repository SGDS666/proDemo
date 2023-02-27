import React, { useEffect } from 'react';
import { Card, Popover, Space, Tabs, Tooltip } from 'antd';
import { useSetState } from 'ahooks';
import {
  CaretDownOutlined,
  FormOutlined,
  PlusOutlined,
  PushpinOutlined,
  ScissorOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import ViewSelect from '@/components/Search/ViewSelect';
import ViewCreate from '@/components/Search/ViewCreate';
import ViewRename from '@/components/Search/ViewRename';
import { apiPinViews, apiPinViewsSave } from '@/services/views';
import TaskOrganizations from './components/TaskOrganizations';
import styles from './style.less';
import ViewsList from '@/components/Views/ViewsList';

interface FormProps {
  taskInfo: any;
  setStep: (step: string) => void;
}

const viewType = 'searchOrgs';

const TaskOrgViews: React.FC<FormProps> = (props) => {
  const { taskInfo, setStep } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    viewSelectVisible: false, // 视图选择
    viewCreateVisible: false, // 创建视图
    unpinViewData: {}, // 临时视图（未固定）
    viewActiveKey: '', // 当前视图KEY
    viewIds: [],
    viewItems: [],
    unpinViewActionVisible: false,
    pinViewActionVisible: false,
    renameVisible: false,
    viewId: '',
    viewName: '',
    showAllViews: false,
  });

  const onClickRenameView = async (viewId: string, viewName: string) => {
    setState({
      viewId,
      viewName,
      renameVisible: true,
      unpinViewActionVisible: false,
      pinViewActionVisible: false,
    });
  };

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
      await savePinView({ viewIds: [...viewIds, viewId], viewType });
      pinViewsRefresh();
    }
  };

  // 创建新视图成功
  const onViewCreateSuccess = async (vals: any) => {
    const { viewId, name } = vals;
    const { viewIds } = state;
    if (viewIds && viewIds.length > 5) {
      setState({ viewActiveKey: viewId });
      setState({ unpinViewData: { viewId, name } });
    } else {
      await savePinView({ viewIds: [...viewIds, viewId], viewType });
      pinViewsRefresh();
    }
  };

  const onClickPinView = async (viewId: string) => {
    const { viewIds, viewItems, unpinViewData } = state;
    await savePinView({ viewIds: [...viewIds, viewId], viewType });
    setState({
      viewIds: [...viewIds, viewId],
      viewItems: [...viewItems, unpinViewData],
      unpinViewData: {},
      unpinViewActionVisible: false,
      pinViewActionVisible: false,
    });
  };

  // 点击视图操作
  const unpinTabClickContent = (viewId: string, viewName: string) => {
    return (
      <div>
        <a onClick={() => onClickPinView(viewId)}>
          <div className={styles['view-item']}>固定视图</div>
        </a>
        {viewId && viewId.length >= 8 ? (
          <a onClick={() => onClickRenameView(viewId, viewName)}>
            <div className={styles['view-item']}>
              <FormOutlined /> 重命名
            </div>
          </a>
        ) : (
          <div className={styles['default-view-item']}>
            <FormOutlined /> 重命名
          </div>
        )}
      </div>
    );
  };

  const renderUnpinTabName = (viewId: string, name: string) => {
    const { viewActiveKey } = state;
    if (viewActiveKey === viewId) {
      return (
        <Popover
          placement="bottom"
          title={false}
          content={unpinTabClickContent(viewId, name)}
          trigger="click"
          open={state.unpinViewActionVisible}
          onOpenChange={(visible) => setState({ unpinViewActionVisible: visible })}
        >
          <a>
            {name} <CaretDownOutlined />
          </a>
        </Popover>
      );
    }
    return <span>{name}</span>;
  };

  const onViewChange = (key: string) => {
    setState({ viewActiveKey: key });
  };

  // 选中取消固定视图
  const onClickUnpinView = async (index: number) => {
    const { viewIds, viewItems } = state;
    const viewId = viewIds[index];
    viewIds.splice(index, 1);
    const idx = viewItems.findIndex((item: any) => item.viewId === viewId);
    if (idx < 0) return;
    const unpinViewData = viewItems[idx];
    setState({ viewIds, unpinViewData, pinViewActionVisible: false });
    await savePinView({ viewIds, viewType });
  };

  // 选中设置默认视图
  const onClickDefaulView = async (index: number) => {
    const { viewIds } = state;
    const viewId = viewIds[index];
    viewIds.splice(index, 1);
    setState({
      viewIds: [viewId, ...viewIds],
      pinViewActionVisible: false,
    });
    await savePinView({ viewIds: [viewId, ...viewIds], viewType });
  };

  // 点击视图操作
  const pinTabClickContent = (viewId: string, viewName: string, index: number) => {
    if (index === 0) {
      return (
        <div>
          <Tooltip title="默认视图不能取消固定。先设置其他视图默认后再取消固定。">
            <div className={styles['default-view-item']}>取消固定</div>
          </Tooltip>
          {viewId && viewId.length >= 8 ? (
            <a onClick={() => onClickRenameView(viewId, viewName)}>
              <div className={styles['view-item']}>
                <FormOutlined /> 重命名
              </div>
            </a>
          ) : (
            <div className={styles['default-view-item']}>
              <FormOutlined /> 重命名
            </div>
          )}
        </div>
      );
    }
    return (
      <div>
        <a onClick={() => onClickDefaulView(index)}>
          <div className={styles['view-item']}>
            <StarOutlined /> 设置默认
          </div>
        </a>
        <a onClick={() => onClickUnpinView(index)}>
          <div className={styles['view-item']}>
            <ScissorOutlined /> 取消固定
          </div>
        </a>
        {viewId && viewId.length >= 8 ? (
          <a onClick={() => onClickRenameView(viewId, viewName)}>
            <div className={styles['view-item']}>
              <FormOutlined /> 重命名
            </div>
          </a>
        ) : (
          <div className={styles['default-view-item']}>
            <FormOutlined /> 重命名
          </div>
        )}
      </div>
    );
  };

  // 未固定的视图
  const renderUnpinView = () => {
    const { unpinViewData, viewActiveKey, viewIds } = state;
    const { viewId, name } = unpinViewData;
    if (!viewId) return null;
    if (viewIds.indexOf(viewId) >= 0) return null;
    return {key:viewId,label:renderUnpinTabName(viewId, name),children:(
      viewActiveKey === viewId ? (
        <TaskOrganizations
            taskInfo={taskInfo}
            setStep={setStep}
            viewId={state.viewActiveKey}
            createReload={(vals: any) => onViewCreateSuccess(vals)}
          />
      ) : null
    )}
  
  };

  const renderPinTabName = (viewId: string, index: number) => {
    const { viewItems, viewActiveKey } = state;
    const idx = viewItems.findIndex((item: any) => item.viewId === viewId);
    if (idx < 0) return null;
    const { name } = viewItems[idx];
    if (viewId === viewActiveKey) {
      return (
        <Popover
          placement="bottom"
          title={false}
          content={pinTabClickContent(viewId, name, index)}
          trigger="click"
          open={state.pinViewActionVisible}
          onOpenChange={(visible) => setState({ pinViewActionVisible: visible })}
        >
          <a>
            <PushpinOutlined />
            {name} <CaretDownOutlined />
          </a>
        </Popover>
      );
    }
    return (
      <span>
        <PushpinOutlined />
        {name}
      </span>
    );
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
      savePinView({ viewIds, viewType });
      if (viewActiveKey === targetKey) {
        setState({ viewActiveKey: viewIds[0] });
      }
    }
  };

  useEffect(() => {
    pinViewsRun({ type: 'searchOrgs' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state.showAllViews ? (
    <ViewsList onClose={() => setState({ showAllViews: false })} viewType="searchOrgs" />
  ) : (
    <Card title={false}>
      <Tabs
        activeKey={state.viewActiveKey}
        size="large"
        type="editable-card"
        onChange={onViewChange}
        onEdit={onViewEdit}
        addIcon={
          <ViewSelect
            onSelectAction={(val) => onViewSelectAction(val)}
            showCreate={() => setState({ viewCreateVisible: true })}
            viewType="searchOrgs"
          >
            <div style={{ width: '100%' }}>
              <PlusOutlined /> 添加视图
            </div>
          </ViewSelect>
        }
        tabBarExtraContent={{
          right: (
            <Space style={{ marginRight: 4 }}>
              <a
                style={{ textDecoration: 'underline', fontSize: 16 }}
                onClick={() => setState({ showAllViews: true })}
              >
                所有视图
              </a>
            </Space>
          ),
        }}
        items={[...state.viewIds?.map((viewId: string, index: number) => ({
          key:viewId,
          label:renderPinTabName(viewId, index),
          children:(
            state.viewActiveKey === viewId ? (
              <TaskOrganizations
              taskInfo={taskInfo}
              setStep={setStep}
              viewId={state.viewActiveKey}
              createReload={(vals: any) => onViewCreateSuccess(vals)}
            />
            ) : null
          )
        })),renderUnpinView()]}
      >
      </Tabs>
      <ViewCreate
        visible={state.viewCreateVisible}
        onCancel={() => setState({ viewCreateVisible: false })}
        actionReload={(vals: any) => onViewCreateSuccess(vals)}
        filters={[]}
        viewType="searchOrgs"
      />
      <ViewRename
        visible={state.renameVisible}
        onCancel={() => setState({ renameVisible: false })}
        viewId={state.viewId}
        viewName={state.viewName}
        actionReload={() => pinViewsRun({ type: 'searchOrgs' })}
      />
    </Card>
  );
};

export default TaskOrgViews;
