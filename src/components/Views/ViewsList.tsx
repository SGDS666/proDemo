import React, { useEffect, useState } from 'react';
import { Card, Dropdown, Input, List, Modal, Radio, Tooltip } from 'antd';
import { useSetState } from 'ahooks';
import {
  CaretDownOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import ViewCreate from './ViewCreate';
import ViewRename from './ViewRename';
import ViewShare from './ViewShare';
import { apiViewsList, apiViewConfig, apiViewDelete } from '@/services/views';
import { ProCard } from '@ant-design/pro-components';
import RcResizeObserver from 'rc-resize-observer';

interface Props {
  viewType: string;
  onClose: () => void;
}

const ViewsList: React.FC<Props> = (props: any) => {
  const { viewType } = props;
  const [responsive, setResponsive] = useState(false);
  const [state, setState] = useSetState<Record<string, any>>({
    mineViews: [],
    othersViews: [],
    systemViews: [],
    filters: [],
    keyword: '',
    type: 'searchCompany',
  });

  const { run: viewsListRun } = useRequest(apiViewsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { mineViews, othersViews, systemViews } = data;
      setState({ mineViews, othersViews, systemViews });
    },
  });

  const { run: viewConfigRun } = useRequest(apiViewConfig, { manual: true });

  // 创建新视图成功
  const onViewCreateSuccess = async (vals: any) => {
    const { viewId, name } = vals;
    const { viewIds } = state;
    if (viewIds && viewIds.length > 5) {
      setState({ viewActiveKey: viewId });
      setState({ unpinViewData: { viewId, name } });
    }
    viewsListRun({ type: viewType });
  };

  const onViewRenameSuccess = () => {
    const { type } = state;
    viewsListRun({ type });
  };

  const onViewSharedSuccess = () => {
    const { type } = state;
    viewsListRun({ type });
  };

  useEffect(() => {
    if (viewType) {
      setState({ type: viewType });
      viewsListRun({ type: viewType });
    } else {
      const { type } = state;
      viewsListRun({ type });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const { run: viewDeleteRun } = useRequest(apiViewDelete, {
    manual: true,
    onSuccess: () => {
      const { type } = state;
      viewsListRun({ type });
    },
  });

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
        menu={
          {
            style: { width: 120 },
            items: [
              {
                key: "info",
                icon: <CopyOutlined />,
                label: "复制",
                onClick: () => onClickCopy(item)
              },
              {
                key: "save",
                disabled: saveDisable,
                onClick: () => onClickRename(item),
                icon: <EditOutlined />,
                label: "重命名",
              },
              {
                key: "share",
                disabled: shareDisable,
                onClick: () => onClickShare(item),
                label: "分享设置",
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                disabled: delDisable,
                onClick: () => onClickDelete(item),
                label: "删除",

              }
            ]
          }
        }
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
              <div style={{}}>
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

  const onChangeViewType = (value: string) => {
    setState({ type: value });
    viewsListRun({ type: value });
  };

  const renderTitle = () => {
    return (
      <div>
        <Radio.Group
          value={state.type}
          buttonStyle="solid"
          onChange={(e) => onChangeViewType(e.target.value)}
        >
          <Radio.Button value="searchCompany">企业视图列表(新)</Radio.Button>
          <Radio.Button value="searchOrgs">
            <Tooltip title="老任务视图，即将废弃">企业视图列表(旧)</Tooltip>
          </Radio.Button>
          <Radio.Button value="searchDomain">
            <Tooltip title="老任务视图，即将废弃">域名视图列表(旧)</Tooltip>
          </Radio.Button>
        </Radio.Group>
      </div>
    );
  };

  return (
    <Card title={false} className="both-left">
      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          setResponsive(offset.width < 800);
        }}
      >
        <ProCard
          title={renderTitle()}
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
          <ProCard title="系统默认" colSpan={responsive ? undefined : '33%'} key="systemViews">
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
      <ViewCreate
        visible={state.viewCreateVisible}
        onCancel={() => setState({ viewCreateVisible: false })}
        actionReload={(vals: any) => onViewCreateSuccess(vals)}
        filters={state.filters}
        name={state.viewName}
        viewType={state.type}
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
    </Card>
  );
};

export default ViewsList;
