import React, { useEffect } from 'react';
import { Input, Drawer, Button, Tag, Alert, message, Radio } from 'antd';
import { useSetState } from 'ahooks';
import { apiContactFilterFields } from '@/services/field';
import { useModel, useRequest } from '@umijs/max';
import { CheckCard } from '@ant-design/pro-card';
import { CloseOutlined, DeleteOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import FilterField from '@/components/Contacts/FilterField';
import styles from '../style.less';
import { fieldOptions, MultiValuesList } from '@/config/config';
import { apiViewSave } from '@/services/contacts';
import { theme } from 'antd'
interface Props {
  onCancel: () => void;
  visible: boolean;
  filters: any;
  logic: string;
  onApplyAction: (vals: any, index: any, act: 'add' | 'update' | 'delete') => void;
  onLogicChange: (logic: string) => void;
  viewConfig: any;
}
const { useToken } = theme
const ContactFilter: React.FC<Props> = (props) => {
  const { filters, logic, visible, onCancel, onApplyAction, onLogicChange, viewConfig } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    key: '', // 字段关键字
    step: 1, // 1显示所有条件，2显示所有字段，3某个字段设置
    fieldConfig: {},
    fieldValue: {},
    fieldIdx: -1,
    saveVisible: false,
  });
  const { initialState } = useModel('@@initialState');
  const { token } = useToken()
  const { viewId, viewOwner } = viewConfig;

  const { data: fieldsData, run: fieldsRun } = useRequest(apiContactFilterFields, {
    manual: true,
    onSuccess: () => {
      if (!filters || !filters.length) {
        setState({ step: 2 });
      }
    },
  });

  const { run: saveRun } = useRequest(apiViewSave, {
    manual: true,
    onSuccess: () => {
      message.success('保存成功');
      setState({ saveVisible: false });
    },
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
        <div style={{ overflow: 'auto', color: token.colorText }}>
          <div style={{ fontSize: 12, }}>系统默认字段</div>
          {fieldsData.map((item: any) => {
            const { dataIndex, title } = item;
            const { key } = state;
            if (title.toLocaleLowerCase().indexOf(key.toLocaleLowerCase()) >= 0) {
              return (
                <a key={dataIndex} onClick={() => onFilterFiledClick(item)}>
                  <div className={styles['view-item']} style={{ color: token.colorText }}>{title}</div>
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

  const renderOwners = (items: any, value: string) => {
    const idx = items.findIndex((o: any) => o.userid === value);
    if (idx >= 0) {
      const { userid, nickname } = items[idx];
      return <Tag key={userid}>{nickname}</Tag>;
    }
    return <Tag key={value}>{value}</Tag>;
  };

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
    const { dataIndex, items, options } = field;
    if (dataIndex === 'tags') {
      // 标签返回
      return (
        <div style={{ width: 296 }}>
          <span>
            {name}{' '}
            {values?.map((val: any) => {
              const idx = items.findIndex((o: any) => o.id === val);
              if (idx >= 0) {
                const { name: tagName, color } = items[idx];
                return (
                  <Tag key={val} color={color}>
                    {tagName}
                  </Tag>
                );
              }
              return <Tag key={val}>{val}</Tag>;
            })}
          </span>
        </div>
      );
    }
    if (dataIndex === 'userid') {
      // 归属
      if (operator === 'include' || operator === 'exclude') {
        return (
          <div style={{ width: 296 }}>
            <span>
              {name}{' '}
              {values?.map((val: any) => {
                return renderOwners(items, val);
              })}
            </span>
          </div>
        );
      }
      if (operator === 'eq' || operator === 'neq') {
        return (
          <div style={{ width: 296 }}>
            <span>
              {name} {renderOwners(items, value)}
            </span>
          </div>
        );
      }
    }
    if (MultiValuesList.indexOf(operator) >= 0) {
      if (valueType === 'select') {
        return (
          <div style={{ width: 296 }}>
            <span>
              {name}{' '}
              {values?.map((val: any) => {
                const idx = options.findIndex((o: any) => o.value === val);
                if (idx >= 0) {
                  const { label } = options[idx];
                  return <Tag key={val}>{label}</Tag>;
                }
                return <Tag key={val}>{val}</Tag>;
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
      <div style={{ width: 296 }}>
        <span>
          {name} <a>{value}</a>
        </span>
      </div>
    );
  };

  const getChangeAuth = (item: any, index: number) => {
    if (!initialState?.currentUser?.isOrg) {
      return true;
    }
    const { property } = item;
    if (viewId === 'mine' && property === 'userid' && index === 0) {
      // 我的联系人第一个userid不可修改
      return false;
    }
    if (viewId === 'unassign' && property === 'userid' && index === 0) {
      // 公海联系人第一个userid不可修改
      return false;
    }
    if (initialState?.userPermissions['contacts.contacts.allShow']?.checked) {
      return true;
    }

    if (viewId === 'mine' || viewId === 'unassign') {
      return false;
    }
    if (property === 'userid') {
      return false;
    }
    return true;
  };

  const onViewLogicChange = (value: string) => {
    onLogicChange(value);
    setState({ saveVisible: true });
  };

  const renderFilters = () => {
    const filterList = filters.map((item: any, index: number) => {
      const { property, operator, value, values } = item;
      if (!fieldsData) {
        return null;
      }
      const key = `_key_${property}_${index}`;
      const idx = fieldsData.findIndex((o: any) => o.dataIndex === property);
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
      const field = fieldsData[idx];
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
            style={{
              background: token.colorBgContainer,
              borderColor: token.colorBorderSecondary,
              color: token.colorText
            }}

            checked={false}
            // eslint-disable-next-line react/no-array-index-key
            title={<div style={{ color: token.colorText }}>{title}</div>}

            description={<div style={{ color: token.colorText }}>{renderFieldValue(operator, name, valueType, value, values, field)}</div>}
            onClick={() => {
              setState({
                step: 3,
                fieldConfig: fieldsData[idx],
                fieldValue: item,
                fieldIdx: index,
              });
            }}
            disabled={!getChangeAuth(item, index)}
            extra={
              <Button
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setState({ saveVisible: true });
                  onApplyAction(item, index, 'delete');
                }}
                disabled={!getChangeAuth(item, index)}
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
            <Radio value="or" disabled>
              或者
            </Radio>
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

  useEffect(() => {
    if (visible) {
      fieldsRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const onClickSave = () => {
    saveRun({ viewId, filters });
  };

  const renderTitle = () => {
    const { saveVisible } = state;
    if (saveVisible && viewOwner) {
      return (
        <Alert
          message="立即保存视图？"
          type="warning"
          action={
            <Button type="primary" onClick={() => onClickSave()}>
              保存
            </Button>
          }
          showIcon
        />
      );
    }
    return '联系人筛选';
  };

  const renderExtra = () => {
    return (
      <Button type="text" onClick={onCancel}>
        <CloseOutlined style={{ fontSize: 16 }} />
      </Button>
    );
  };

  return (
    <>
      <Drawer
        title={renderTitle()}
        open={visible}
        onClose={onCancel}
        closable={false}
        extra={renderExtra()}
        width={420}
      >
        {visible && state.step === 1 ? renderFilters() : null}
        {visible && state.step === 2 ? renderFieldSelect() : null}
        {visible && state.step === 3 ? renderFieldSetting() : null}
      </Drawer>
    </>
  );
};

export default ContactFilter;
