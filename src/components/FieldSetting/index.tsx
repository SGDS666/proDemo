import React, { useEffect, useCallback } from 'react';
import { Row, Col, Modal, Card, Input, Checkbox, message } from 'antd';
import { Link, useRequest } from '@umijs/max';
import { apiSaveColumnsConfig, apiContactsFields, apiContactsColumns } from '@/services/field';
import { useSetState } from 'ahooks';
import { ItemCard } from './ItemCard';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';

const cardStyle = { width: 360, height: 480 };

interface Props {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  saveType: string;
  belongTo: string;
}

const FieldSetting: React.FC<any> = (props: Props) => {
  const { visible, onCancel, belongTo, saveType, actionReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    fields: [], // { dataIndex, title }[]
    saves: [],
    columns: [], // string[]
    key: '', // 关键字
  });

  const { run: fieldsRun } = useRequest(apiContactsFields, {
    manual: true,
    onSuccess: (data) => {
      setState({ fields: data });
    },
  });

  const setColumnsHeader = async (columns: string[], dataIndex: string) => {
    const idx = columns.indexOf(dataIndex);
    if (idx >= 0) {
      columns.splice(idx, 1);
    }
    columns.splice(0, 0, dataIndex);
  };

  const { run: columnsRun } = useRequest(apiContactsColumns, {
    manual: true,
    onSuccess: async (data) => {
      if (belongTo === 'company') {
        await setColumnsHeader(data, 'name');
      } else {
        await setColumnsHeader(data, 'tags');
        await setColumnsHeader(data, 'email');
        await setColumnsHeader(data, 'name');
      }
      setState({ columns: data });
    },
  });

  const initData = async () => {
    if (saveType === 'show') {
      await fieldsRun({ belongTo, saveType: 'read' });
      await columnsRun({ belongTo, saveType: 'show' });
    }
    if (saveType === 'create') {
      await fieldsRun({ belongTo, saveType: 'modify' });
      await columnsRun({ belongTo, saveType: 'create' });
    }
  };

  const clearChange = () => {
    const { columns } = state;
    if (columns.length > 3) {
      const len = columns.length - 3;
      columns.splice(3, len);
      setState({ columns });
    }
  };

  const leftChange = (value: boolean, item: string) => {
    const { columns } = state;
    if (value) {
      columns.push(item);
    } else {
      const idx = columns.indexOf(item);
      columns.splice(idx, 1);
    }
    setState({ columns });
  };

  const leftField = (item: any) => {
    const { key, columns } = state;
    const { dataIndex, title } = item;
    if (key) {
      const idx = title.indexOf(key);
      if (idx < 0) {
        return null;
      }
    }
    if (belongTo === 'company' && saveType === 'show') {
      if (dataIndex === 'name') {
        return (
          <div key={dataIndex}>
            <Checkbox defaultChecked disabled>
              {title}
            </Checkbox>
          </div>
        );
      }
    } else {
      if (dataIndex === 'email' || dataIndex === 'name' || dataIndex === 'tags') {
        return (
          <div key={dataIndex}>
            <Checkbox defaultChecked disabled>
              {title}
            </Checkbox>
          </div>
        );
      }
    }

    let checked = false;
    if (columns.indexOf(dataIndex) >= 0) {
      checked = true;
    }
    return (
      <div key={dataIndex}>
        <Checkbox
          checked={checked}
          onChange={(e) => leftChange(e.target.checked, dataIndex)}
          style={{ width: '100%' }}
        >
          {title}
        </Checkbox>
      </div>
    );
  };

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const { columns } = state;
      const dragCard = columns[dragIndex];
      // saves.splice(dragIndex, 1);
      // saves.splice(hoverIndex, 0, dragCard);
      const res = update(columns, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      });
      setState({ columns: res });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  const removeCard = useCallback(
    (index: any) => {
      const { columns } = state;
      columns.splice(index, 1);
      setState({ columns });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  const changeCard = useCallback(
    (index: any, value: any) => {
      const { columns } = state;
      columns[index] = value;
      setState({ columns });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  const renderCard = (item: string, index: number) => {
    const { fields } = state;
    const idx = fields.findIndex((o: any) => o.dataIndex === item);
    if (idx >= 0) {
      const { dataIndex, title } = fields[idx];
      return (
        <ItemCard
          key={dataIndex}
          index={index}
          id={dataIndex}
          text={title}
          moveCard={moveCard}
          removeCard={removeCard}
          changeCard={changeCard}
          belongTo={belongTo}
        />
      );
    }
    const name = `${item}(已删除)`;
    return (
      <ItemCard
        key={item}
        index={index}
        id={item}
        text={name}
        moveCard={moveCard}
        removeCard={removeCard}
        changeCard={changeCard}
        belongTo={belongTo}
      />
    );
  };

  const { run: saveRun, loading: saveLoading } = useRequest(apiSaveColumnsConfig, {
    manual: true,
    onSuccess: () => {
      message.success('保存成功');
      onCancel();
      actionReload();
    },
  });

  const handleSubmit = async () => {
    const { columns } = state;
    saveRun({ belongTo, saveType, columns });
  };

  const getTitle = () => {
    if (belongTo === 'company' && saveType === 'show') {
      return '公司列表字段显示设置';
    }
    if (belongTo === 'company' && saveType === 'create') {
      return '公司创建字段显示设置';
    }
    if (belongTo === 'company' && saveType === 'update') {
      return '公司编辑字段显示设置';
    }
    if (belongTo === 'contact' && saveType === 'show') {
      return '联系人列表字段显示设置';
    }
    if (belongTo === 'contact' && saveType === 'create') {
      return '联系人创建字段显示设置';
    }
    if (belongTo === 'contact' && saveType === 'update') {
      return '联系人编辑字段显示设置';
    }
    return '';
  };

  useEffect(() => {
    if (visible) {
      initData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      title={getTitle()}
      width={720}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      okText="保存"
      bodyStyle={{ padding: 0 }}
      onOk={handleSubmit}
      confirmLoading={saveLoading}
    >
      <Row>
        <Col xs={24} lg={12}>
          <Card style={cardStyle}>
            <Input.Search
              placeholder="搜索字段"
              allowClear
              onChange={(e) => setState({ key: e.target.value })}
              style={{ width: '100%', paddingBottom: 10 }}
              value={state.key}
            />
            <div style={{ fontSize: 24, overflow: 'auto', height: 370 }}>
              {state.fields.map((item: any) => leftField(item))}
            </div>
            <div style={{ textAlign: 'right', paddingTop: 10, fontSize: 16 }}>
              没有你需要的字段?<Link to="/settings/fields">新建字段</Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={false} style={cardStyle}>
            <div style={{ fontSize: 20, paddingBottom: 10 }}>
              已选择的字段 <a>{state.columns.length}</a>
            </div>
            <div style={{ fontSize: 16, overflow: 'auto', height: 370 }}>
              <DndProvider backend={HTML5Backend}>
                <div style={{ width: '100%' }}>
                  {state.columns.map((item: any, i: number) => renderCard(item, i))}
                </div>
              </DndProvider>
            </div>
            <div style={{ textAlign: 'right', paddingTop: 10, fontSize: 16 }}>
              <a onClick={clearChange}>清空字段</a>
            </div>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default FieldSetting;
