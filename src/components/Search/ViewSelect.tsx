import React, { useEffect } from 'react';
import { Input, Popover, Divider } from 'antd';
import { useSetState } from 'ahooks';
import { apiViewsList } from '@/services/views';
import { useRequest } from '@umijs/max';
import styles from './style.less';

interface Props {
  onSelectAction: (val: any) => void;
  showCreate: () => void;
  viewType: string;
  children: any;
}

const ViewSelect: React.FC<Props> = (props) => {
  const { onSelectAction, showCreate, children, viewType } = props;
  const [state, setState] = useSetState({
    visible: false,
    key: '',
  });

  const { data: viewsData, run: viewsRun } = useRequest(apiViewsList, { manual: true });

  const onVisibleChange = (visible: boolean) => {
    setState({ visible });
  };

  const onClickNewView = () => {
    setState({ visible: false });
    showCreate();
  };

  const onViewClick = (viewId: string, name: string) => {
    onSelectAction({ viewId, name });
    setState({ visible: false });
  };

  const renderViewList = (type: string) => {
    if (!viewsData) return null;
    if (!type) return null;
    const views = viewsData[type];
    if (!views) return null;
    const { key } = state;
    return views.map((item: any) => {
      const { name, viewId } = item;
      if (key) {
        if (name.indexOf(key) < 0) {
          return null;
        }
      }
      return (
        <div key={viewId} onClick={() => onViewClick(viewId, name)}>
          <div className={styles['view-item']}>{name}</div>
        </div>
      );
    });
  };

  useEffect(() => {
    if (state.visible) {
      viewsRun({ type: viewType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.visible]);

  const cardContent = () => {
    return (
      <div style={{ width: 300 }}>
        <Input.Search
          placeholder="搜索视图"
          allowClear
          onChange={(e) => setState({ key: e.target.value })}
          style={{ width: '100%', paddingBottom: 10 }}
          value={state.key}
        />
        <div style={{ overflow: 'auto', height: 240 }}>
          <div style={{ fontSize: 12, color: '#999999' }}>系统默认</div>
          {renderViewList('systemViews')}
          <div style={{ fontSize: 12, color: '#999999' }}>我创建的</div>
          {renderViewList('mineViews')}
          <div style={{ fontSize: 12, color: '#999999' }}>其他人创建</div>
          {renderViewList('othersViews')}
        </div>
        <Divider style={{ marginTop: 12, marginBottom: 12 }} />
        <div style={{ fontSize: 16 }}>
          <a onClick={onClickNewView}>创建新视图</a>
        </div>
      </div>
    );
  };

  return (
    <>
      <Popover
        content={cardContent()}
        title={false}
        trigger="click"
        open={state.visible}
        onOpenChange={onVisibleChange}
      >
        {children}
      </Popover>
    </>
  );
};

export default ViewSelect;
