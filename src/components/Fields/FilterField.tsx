import React, { useEffect } from 'react';
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
  Space,
  TreeSelect,
  theme,
} from 'antd';
import { useSetState } from 'ahooks';
import { fieldOptions } from '@/config/config';
import moment from 'moment';
import { renderTagsTree } from '../Common/Tag';

interface Props {
  fieldConfig: any; // 字段设置
  fieldValue: any; // 字段值 { property: 'tags', operator: 'in', values: [], value: string/number }
  onApplyAction: (val: any) => void;
  fieldIdx: number | undefined;
}
const { useToken } = theme
const fieldStyle = { width: '100%', marginTop: 12, marginBottom: 4 };
const fieldSize = 'large';

const FilterField: React.FC<Props> = (props) => {
  const { fieldConfig, fieldValue, onApplyAction } = props;
  const { dataIndex, title, valueType, items } = fieldConfig;
  const [state, setState] = useSetState<Record<string, any>>({
    property: '',
    operator: '',
    values: [],
    value: '',
  });
  const { token } = useToken()
  const renderCountryCodeOptions = (codeItems: any) => {
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const idx in codeItems) {
      const { en, cn, abb2 } = codeItems[idx];
      options.push({ label: `${cn}(${en})`, value: abb2, key: en });
    }
    return options;
  };

  const renderFieldValue = (oper: string) => {
    const { operator, value, values } = state;
    if (oper !== operator) return null;
    if (!operator || !oper) return null;
    if (oper === 'null' || oper === 'notNull') {
      return null;
    }
    if (dataIndex === 'tags') {
      const tree = renderTagsTree(items);
      return (
        <TreeSelect
          treeDataSimpleMode
          treeData={tree}
          allowClear
          showSearch
          placeholder="请选择标签"
          value={values}
          style={fieldStyle}
          size={fieldSize}
          showArrow={true}
          treeCheckable={true}
          onChange={(vals: any) => setState({ values: vals })}
        />
      );
    }

    if (valueType === 'text' || valueType === 'textarea') {
      if (oper === 'eq' || oper === 'neq') {
        return (
          <Input
            style={fieldStyle}
            value={value}
            onChange={(e) => setState({ value: e.target.value })}
          />
        );
      }
      return (
        <Select
          mode="tags"
          allowClear
          optionFilterProp="label"
          placeholder="回车自动创建,带分号自动分词"
          value={values}
          tokenSeparators={[';']}
          style={fieldStyle}
          size={fieldSize}
          onChange={(vals: any) => setState({ values: vals })}
        />
      );
    }
    if (dataIndex === 'countryCode') {
      const options = renderCountryCodeOptions(items);
      return (
        <Select
          mode="multiple"
          showArrow
          allowClear
          showSearch
          options={options}
          optionFilterProp="label"
          tokenSeparators={[';']}
          placeholder="请选择"
          value={values}
          style={fieldStyle}
          size={fieldSize}
          onChange={(vals: any) => setState({ values: vals })}
        />
      );
    }
    if (valueType === 'select') {
      return (
        <Select
          mode="tags"
          showArrow
          allowClear
          showSearch
          optionFilterProp="label"
          tokenSeparators={[';']}
          placeholder="请选择"
          value={values}
          style={fieldStyle}
          size={fieldSize}
          onChange={(vals: any) => setState({ values: vals })}
        />
      );
    }
    if (valueType === 'digit' || valueType === 'money' || valueType === 'percent') {
      let number = value;
      if (typeof value === 'string') {
        number = '';
      }
      return (
        <InputNumber
          style={fieldStyle}
          value={number}
          onChange={(val: any) => setState({ value: val })}
        />
      );
    }
    if (valueType === 'date') {
      if (oper === 'before') {
        let number = value;
        if (typeof value === 'string') {
          number = '';
        }
        return (
          <span>
            <InputNumber
              value={number}
              onChange={(val: any) => setState({ value: val })}
              placeholder="N"
              size={fieldSize}
            />
            <span>天之前</span>
          </span>
        );
      }
      if (oper === 'after') {
        let number = value;
        if (typeof value === 'string') {
          number = '';
        }
        return (
          <span>
            <InputNumber
              value={number}
              style={fieldStyle}
              size={fieldSize}
              onChange={(val: any) => setState({ value: val })}
              placeholder="N"
            />
            <span>天之内</span>
          </span>
        );
      }
      let momentValue = value;
      if (typeof value === 'number') {
        momentValue = moment(value);
      }
      if (!value) {
        momentValue = moment();
      }
      return (
        <DatePicker
          value={momentValue}
          onChange={(val: any) => {
            if (val) {
              setState({ value: moment(val).valueOf() });
            } else {
              setState({ value: '' });
            }
          }}
          style={fieldStyle}
          size={fieldSize}
        />
      );
    }
    if (valueType === 'dateTime') {
      if (oper === 'before') {
        let number = value;
        if (typeof value === 'string') {
          number = '';
        }
        return (
          <span>
            <InputNumber
              value={number}
              onChange={(val: any) => setState({ value: val })}
              placeholder="N"
              style={fieldStyle}
              size={fieldSize}
            />
            <span>天之前</span>
          </span>
        );
      }
      if (oper === 'after') {
        let number = value;
        if (typeof value === 'string') {
          number = '';
        }
        return (
          <span>
            <InputNumber
              value={number}
              onChange={(val: any) => setState({ value: val })}
              placeholder="N"
              style={fieldStyle}
              size={fieldSize}
            />
            <span>天之内</span>
          </span>
        );
      }
      let momentValue = value;
      if (!value) {
        momentValue = moment();
      } else if (typeof value === 'string') {
        momentValue = moment(value);
      } else if (typeof value === 'number') {
        momentValue = moment();
      }
      return (
        <DatePicker
          value={momentValue}
          onChange={(val: any) => {
            if (val) {
              setState({ value: moment(val).format('YYYY-MM-DD') });
            } else {
              setState({ value: '' });
            }
          }}
          style={fieldStyle}
          size={fieldSize}
        />
      );
    }
    return null;
  };

  const renderFiledOperator = () => {
    const operators = fieldOptions[valueType];
    if (operators) {
      return (
        <div style={{ marginBottom: 12 }}>
          <Radio.Group
            value={state.operator}
            onChange={(e) => setState({ operator: e.target.value })}
          >
            <Space direction="vertical">
              {operators.map((item: any) => (
                <div key={item.key} style={{ width: 320 }}>
                  <div>
                    <Radio key={item.key} value={item.key}>
                      {item.name}
                    </Radio>
                  </div>
                  <div>{renderFieldValue(item.key)}</div>
                </div>
              ))}
            </Space>
          </Radio.Group>
        </div>
      );
    }
    return <div>其他类型字段</div>;
  };

  useEffect(() => {
    const { operator, values, value } = fieldValue;
    setState({ property: dataIndex, operator, values, value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldValue]);

  const onApplyClick = () => {
    const { property, operator, value, values } = state;
    if (operator !== 'null' && operator !== 'notNull') {
      if (!value && !values?.length && value !== 0) {
        message.error('数据不能为空');
        return;
      }
    }
    onApplyAction({ property, operator, value, values, valueType });
  };

  return (
    <div style={{ margin: 12 }}>
      <div style={{ marginBottom: 12, fontSize: 16, color: token.colorTextBase }}>选中字段：{title}</div>
      {renderFiledOperator()}
      <div style={{ marginTop: 12 }}>
        <Button size="small" type="primary" onClick={onApplyClick}>
          应用
        </Button>
      </div>
    </div>
  );
};

export default FilterField;
