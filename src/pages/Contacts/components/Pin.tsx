import { FormOutlined, StarOutlined, ScissorOutlined, PushpinFilled, MenuFoldOutlined } from '@ant-design/icons';
import { Tooltip, Popover, theme } from 'antd';
import styles from '../style.less'
import { pinTabClick, PinTabNameProps } from './types/pin.type';


const pinTabClickContent: pinTabClick = ({ viewId, viewName, index, setState, viewType, state, savePinView }) => {
  const onClickRenameView = async (viewId: string, viewName: string) => {
    setState({
      viewId,
      viewName,
      renameVisible: true,
      unpinViewActionVisible: false,
      pinViewActionVisible: false,
    });
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


export const PinTabName: React.FC<PinTabNameProps> = ({ viewId, index, state, setState, viewType, savePinView }) => {
  const { token } = theme.useToken()
  const { viewItems, viewName } = state;
  const idx = viewItems.findIndex((item: any) => item.viewId === viewId);
  const { name } = viewItems[idx];
  const { viewActiveKey } = state;

  const style: React.CSSProperties = {
    color: token.colorText,

  }
  if (idx < 0) return null;

  if (viewId === viewActiveKey) {
    return (
      <div className={styles.tabName} style={{ color: token.colorPrimaryText, cursor: "pointer" }}>
        <PushpinFilled style={{ marginRight: 5 }} />
        {name}
        <Popover
          placement="bottom"
          style={style}
          title={false}
          content={pinTabClickContent({ viewId, viewName, index, setState, viewType, state, savePinView })}
          trigger="click"
          open={state.pinViewActionVisible}
          onOpenChange={(visible) => setState({ pinViewActionVisible: visible })}
        >
          <MenuFoldOutlined style={{ marginLeft: 8 }} />
        </Popover>

      </div>

    );
  }
  return (
    <span style={{ cursor: "pointer" }}>
      <PushpinFilled style={{ marginRight: 5 }} />
      {name}
    </span>
  );
};