import React, { useEffect } from 'react';
import { Input, Drawer, Button, Tag, Alert, message, Radio } from 'antd';
import { useSetState } from 'ahooks';
import { CheckCard } from '@ant-design/pro-card';
import { DeleteOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import FilterField from '@/components/Fields/FilterField';
import styles from '../style.less';
import { fieldOptions, MultiValuesList } from '@/config/config';
import { useRequest } from '@umijs/max';
import { apiViewSave } from '@/services/views';

interface Props {
  onCancel: () => void;
  visible: boolean;
  filters: any;
  logic: string;
  onApplyAction: (vals: any, index: any, act: 'add' | 'update' | 'delete') => void;
  onLogicChange: (logic: string) => void;
  viewConfig: any;
}

const FieldsData = [
  { dataIndex: 'domain', title: '域名', valueType: 'text' },
  { dataIndex: 'gg_title', title: '网站标题', valueType: 'text' },
  { dataIndex: 'gg_desc', title: '网站描述', valueType: 'text' },
  { dataIndex: 'gg_total', title: '谷歌收录数', valueType: 'digit' },
  { dataIndex: 'personal', title: '精准邮箱数', valueType: 'digit' },
  { dataIndex: 'generic', title: '普通邮箱数', valueType: 'digit' },
];

const DomainFilter: React.FC<Props> = (props) => {
  const { filters, visible, onCancel, onApplyAction, onLogicChange, viewConfig, logic } = props;
  const { viewId, viewOwner } = viewConfig;
  const [state, setState] = useSetState<Record<string, any>>({
    key: '', // 字段关键字
    step: 1, // 1显示所有条件，2显示所有字段，3某个字段设置
    fieldConfig: {},
    fieldValue: {},
    fieldIdx: -1,
    saveVisible: false,
  });

  // 选中字段
  const onFilterFiledClick = (field: any) => {
    setState({ step: 3, fieldConfig: field });
  };

  const renderFieldSelect = () => {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: 12 }}>
          <a onClick={() => setState({ step: 1 })}>
            <LeftOutlined /> 返回
          </a>
        </div>
        <Input.Search
          placeholder="搜索字段"
          allowClear
          onChange={(e) => setState({ key: e.target.value })}
          style={{ width: '100%', paddingBottom: 10 }}
          value={state.key}
        />
        <div style={{ overflow: 'auto' }}>
          <div style={{ fontSize: 12, color: '#999999' }}>系统默认字段</div>
          {FieldsData.map((item: any) => {
            const { dataIndex, title } = item;
            const { key } = state;
            if (title.toLocaleLowerCase().indexOf(key.toLocaleLowerCase()) >= 0) {
              return (
                <a key={dataIndex} onClick={() => onFilterFiledClick(item)}>
                  <div className={styles['view-item']}>{title}</div>
                </a>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  const onClickAddFilter = () => {
    setState({ step: 2, fieldIdx: -1 });
  };

  const { run: saveRun, loading: saveLoading } = useRequest(apiViewSave, {
    manual: true,
    onSuccess: () => {
      message.success('保存成功');
      setState({ saveVisible: false });
    },
  });

  const renderFieldValue = (
    operator: string,
    name: string,
    valueType: string,
    value: any,
    values: any,
    field: any,
  ) => {
    if (operator === 'null' || operator === 'notNull') {
      return (
        <div style={{ width: 296 }}>
          <span>
            <a>{name}</a>
          </span>
        </div>
      );
    }
    if (MultiValuesList.indexOf(operator) >= 0) {
      const { dataIndex, items } = field;
      if (dataIndex === 'countryCode') {
        return (
          <div style={{ width: 296 }}>
            <span>
              {name}{' '}
              {values?.map((val: any) => {
                const idx = items.findIndex((o: any) => o.abb2 === val);
                if (idx >= 0) {
                  const { en, cn } = items[idx];
                  return <Tag key={val}>{`${cn}(${en})`}</Tag>;
                }
                return <Tag key={val}>未知国家</Tag>;
              })}
            </span>
          </div>
        );
      } else {
        return (
          <div style={{ width: 296 }}>
            <span>
              {name}{' '}
              {values?.map((val: any) => (
                <Tag key={val}>{val}</Tag>
              ))}
            </span>
          </div>
        );
      }
    }

    return (
      <div style={{ width: 288 }}>
        <span>
          {name} <a>{value}</a>
        </span>
      </div>
    );
  };

  const onViewLogicChange = (value: string) => {
    onLogicChange(value);
    setState({ saveVisible: true });
  };

  const renderFilters = () => {
    const filterList = filters.map((item: any, index: number) => {
      const { property, operator, value, values } = item;
      if (!FieldsData) {
        return null;
      }
      const key = `_key_${property}_${index}`;
      const idx = FieldsData.findIndex((o: any) => o.dataIndex === property);
      if (idx < 0) {
        return (
          <Alert
            key={key}
            message={`未知字段: ${property}`}
            type="warning"
            closable
            onClose={() => onApplyAction(item, index, 'delete')}
          />
        );
      }
      const field = FieldsData[idx];
      const { title, valueType } = field;
      const configIdx = fieldOptions[valueType].findIndex((o: any) => o.key === operator);
      if (configIdx < 0) return null;
      const { name } = fieldOptions[valueType][configIdx];

      return (
        <div key={key}>
          {index > 0 ? (
            <div className={styles['condition-and']}>
              {logic === 'or' ? <span>或者</span> : <span>并且</span>}
            </div>
          ) : null}
          <CheckCard
            style={{ marginBottom: 0 }}
            checked={false}
            // eslint-disable-next-line react/no-array-index-key
            title={title}
            description={renderFieldValue(operator, name, valueType, value, values, field)}
            onClick={() => {
              setState({
                step: 3,
                fieldConfig: FieldsData[idx],
                fieldValue: item,
                fieldIdx: index,
              });
            }}
            extra={
              <Button
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyAction(item, index, 'delete');
                  setState({ saveVisible: true });
                }}
              >
                <DeleteOutlined />
              </Button>
            }
          />
        </div>
      );
    });
    return (
      <div>
        {filterList}
        <div style={{ marginTop: 24 }}>
          <Radio.Group onChange={(e) => onViewLogicChange(e.target.value)} value={logic}>
            <Radio value="and">并且</Radio>
            <Radio value="or">或者</Radio>
          </Radio.Group>
          <Button
            size="small"
            type="primary"
            onClick={onClickAddFilter}
            style={{ marginRight: 24 }}
          >
            <PlusOutlined /> 新增条件
          </Button>
        </div>
      </div>
    );
  };

  const onClickApplyAction = (vals: any) => {
    const { fieldIdx } = state;
    if (fieldIdx < 0) {
      onApplyAction(vals, fieldIdx, 'add');
    } else {
      onApplyAction(vals, fieldIdx, 'update');
    }
    setState({ step: 1, saveVisible: true });
  };

  const onLastStepReturnClick = () => {
    const { fieldIdx } = state;
    if (fieldIdx >= 0) {
      setState({ step: 1 });
    } else {
      setState({ step: 2 });
    }
  };

  // 字段筛选值
  const renderFieldSetting = () => {
    const { fieldConfig, fieldValue, fieldIdx } = state;
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <a onClick={onLastStepReturnClick}>
            <LeftOutlined /> 返回
          </a>
        </div>
        <FilterField
          fieldConfig={fieldConfig}
          fieldValue={fieldValue}
          fieldIdx={fieldIdx}
          onApplyAction={onClickApplyAction}
        />
      </div>
    );
  };

  const onClickSave = () => {
    saveRun({ viewId, filters, logic });
  };

  const renderTitle = () => {
    const { saveVisible } = state;
    if (saveVisible && viewOwner) {
      return (
        <Alert
          message="立即保存视图？"
          type="warning"
          action={
            <Button type="primary" onClick={() => onClickSave()} loading={saveLoading}>
              保存
            </Button>
          }
          showIcon
        />
      );
    }
    return '域名筛选';
  };

  useEffect(() => {
    if (visible) {
      if (!filters || !filters.length) {
        setState({ step: 2 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <>
      <Drawer title={renderTitle()} open={visible} onClose={onCancel} mask={false} destroyOnClose>
        {visible && state.step === 1 ? renderFilters() : null}
        {visible && state.step === 2 ? renderFieldSelect() : null}
        {visible && state.step === 3 ? renderFieldSetting() : null}
      </Drawer>
    </>
  );
};

export default DomainFilter;
