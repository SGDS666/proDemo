import React, { useEffect } from 'react';
import { Divider } from 'antd';
import { useSetState } from 'ahooks';
import {

  LeftOutlined,

  PlusOutlined,

} from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import ViewSelect from '@/components/Search/ViewSelect';
import ViewCreate from '@/components/Search/ViewCreate';
import ViewRename from '@/components/Search/ViewRename';
import ViewsList from '@/components/Views/ViewsList';
import { apiPinViews, apiPinViewsSave } from '@/services/views';
import CompanyDataTable from './CompanyDataTable';

import EditTabs, { EditItem } from '@/components/EditTabs';
import { renderUnpinView } from '../components/UnPin';
import { PinTabName } from '../components/Pin';

const viewType = 'searchCompany';

const Company: React.FC = () => {
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


  const onViewChange = (key: string) => {
    setState({ viewActiveKey: key });
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
    pinViewsRun({ type: 'searchCompany' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <EditTabs
        className='both-down'
        items={
          [...state.viewIds?.map(
            (viewId: string, index: number): EditItem => ({
              key: viewId,
              onEdit: () => onViewEdit(viewId, "add"),
              label: <PinTabName {...{ viewId, index, state, setState, viewType, savePinView }} />,
              // closable:index !== 0,
              onClick: () => onViewChange(viewId),
              style: { width: "140px", justifyContent: "space-around" } as React.CSSProperties
            }))
            ,
          renderUnpinView({ state, setState, viewType, onViewEdit, onViewChange, savePinView }),
          {
            key: "inset",

            label: (
              <ViewSelect
                onSelectAction={(val) => onViewSelectAction(val)}
                showCreate={() => setState({ viewCreateVisible: true })}
                viewType="searchCompany"
              >
                <div style={{ width: '100%', cursor: "pointer" }}>
                  <PlusOutlined />
                </div>
              </ViewSelect>
            )
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

          ]
        }

      />
      <Divider style={{ margin: 0 }} />
      <div style={{ marginTop: "16px" }} >
        {!state.showAllViews && <CompanyDataTable

          viewId={state.viewActiveKey}
          createReload={(vals: any) => onViewCreateSuccess(vals)}
        />}
        {state.showAllViews && <ViewsList onClose={() => setState({ showAllViews: false })} viewType="searchCompany" />}
      </div>


      <ViewCreate
        visible={state.viewCreateVisible}
        onCancel={() => setState({ viewCreateVisible: false })}
        actionReload={(vals: any) => onViewCreateSuccess(vals)}
        filters={[]}
        viewType="searchCompany"
      />
      <ViewRename
        visible={state.renameVisible}
        onCancel={() => setState({ renameVisible: false })}
        viewId={state.viewId}
        viewName={state.viewName}
        actionReload={() => pinViewsRun({ type: 'searchCompany' })}
      />
    </>
  );
};

export default Company;
