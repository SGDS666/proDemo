
import { BarsOutlined, FormOutlined } from '@ant-design/icons';
import { Popover, theme } from 'antd';
import { UnpinTabProps, renderView, unpinTabContent } from './types/unpin.type'
import styles from '../style.less'


const unpinTabClickContent: unpinTabContent = (viewId, viewName, onClickView, onCLickRename) => {
  return (
    <div>
      <a onClick={() => onClickView(viewId)}>
        <div className={styles['view-item']}>固定视图</div>
      </a>
      {viewId && viewId.length >= 8 ? (
        <a onClick={() => onCLickRename(viewId, viewName)}>
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


export const UnpinTabName: React.FC<UnpinTabProps> = ({ viewId, name, state, setState, viewType, savePinView }) => {
  const { viewActiveKey } = state;
  const { token } = theme.useToken()
  const active = (viewId === viewActiveKey)
  const style: React.CSSProperties = { color: token.colorText, }

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

  const onClickRenameView = async (viewId: string, viewName: string) => {
    setState({
      viewId,
      viewName,
      renameVisible: true,
      unpinViewActionVisible: false,
      pinViewActionVisible: false,
    });
  };

  return (
    <div style={active ? { color: token.colorPrimaryText } : {}}>
      <Popover
        placement="bottom"
        title={false}

        content={unpinTabClickContent(viewId, name, onClickPinView, onClickRenameView)}
        trigger="click"
        open={state.unpinViewActionVisible}
        onOpenChange={(visible) => setState({ unpinViewActionVisible: visible })}
      >
        <BarsOutlined style={{ ...style, marginRight: 5, color: active ? token.colorPrimaryText : "" }} />
      </Popover>
      {name}
    </div>
  );
};




export const renderUnpinView: renderView = ({ state, setState, viewType, onViewEdit, onViewChange, savePinView }) => {
  const { unpinViewData, viewIds } = state;
  const { viewId, name } = unpinViewData;
  if (!viewId) return null;
  if (viewIds.indexOf(viewId) >= 0) return null;
  return {
    key: viewId,
    label: <UnpinTabName {...{ viewId, name, state, setState, viewType, savePinView }} />,
    onDelete: () => onViewEdit(viewId, "remove"),
    onClick: () => onViewChange(viewId),
  }
};