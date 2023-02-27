import React from 'react';
import {
  Input,
  DatePicker,
  InputNumber,
  Select,
  Rate,
  AutoComplete,
  TreeSelect,
  Divider,
  Space,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { apiTagsAdd, apiTagsList } from '@/services/contacts';
import { useRequest, history } from '@umijs/max';
import { renderTagsTree } from '../Common/Tag';
import moment from 'moment';

const ContactField: React.FC<any> = (props) => {
  const { field } = props;
  const { dataIndex, valueType, multi, options, items } = field;
  const [state, setState] = useSetState<Record<string, any>>({
    tagName: '',
    tagsTreeData: [],
  });

  const { run: tagsListRun } = useRequest(apiTagsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const tree = renderTagsTree(data);
      setState({ tagsTreeData: tree });
    },
  });

  const { run: tagAddRun } = useRequest(apiTagsAdd, {
    manual: true,
    onSuccess: () => {
      message.success('创建标签成功');
      setState({ tagName: '' });
      tagsListRun();
    },
  });

  if (!dataIndex) return null;

  const onAddClick = () => {
    const { tagName } = state;
    if (!tagName) {
      message.error('标签名称不能为空');
      return;
    }
    if (!tagName.trim()) {
      message.error('非法字符');
      return;
    }
    tagAddRun({ name: tagName.trim() });
  };

  const getField = () => {
    let sOptions = [];
    if (options && options.length && typeof options === 'object') {
      sOptions = options;
    }
    // 标签
    if (dataIndex === 'tags') {
      const tree = renderTagsTree(items);
      return (
        <TreeSelect
          {...props}
          treeDataSimpleMode
          treeData={state.tagsTreeData.length ? state.tagsTreeData : tree}
          showArrow={true}
          treeCheckable={true}
          allowClear
          treeNodeFilterProp="name"
          dropdownStyle={{ width: 256 }}
          dropdownRender={(menu: any) => (
            <>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <Space align="center" style={{ padding: '0 8px 4px' }}>
                <Input
                  placeholder="增加标签"
                  value={state.tagName}
                  onChange={(e) => setState({ tagName: e.target.value })}
                />
                <Typography.Link style={{ whiteSpace: 'nowrap' }} onClick={onAddClick}>
                  <PlusOutlined /> 新增标签
                </Typography.Link>
                <a style={{ marginLeft: 12 }} onClick={() => history.push('/settings/tags')}>
                  <SettingOutlined /> 标签管理
                </a>
              </Space>
            </>
          )}
        />
      );
    }
    if (dataIndex === 'c_name' || dataIndex === 'department' || dataIndex === 'position') {
      return (
        <AutoComplete
          {...props}
          options={options}
          allowClear
          filterOption={(inputValue: any, option: any) => {
            if (option?.label) {
              if (typeof option.label === 'string') {
                return option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
              }
            }
            return false;
          }}
        />
      );
    }
    // 日期
    if (valueType === 'date') {
      let { value } = props;
      if (typeof value === 'string' || typeof value === 'number') {
        value = moment(value);
      }
      return <DatePicker {...props} value={value} />;
    }
    // 日期时间
    if (valueType === 'dateTime') {
      let { value } = props;
      if (typeof value === 'string' || typeof value === 'number') {
        value = moment(value);
      }
      return <DatePicker {...props} value={value} showTime />;
    }
    // 单行文本
    if (valueType === 'text') {
      return <Input {...props} />;
    }
    // 多行文本
    if (valueType === 'textarea') {
      return <Input.TextArea {...props} />;
    }
    // 数字
    if (valueType === 'digit') {
      return <InputNumber {...props} />;
    }
    // 选项
    if (valueType === 'select') {
      if (`${multi}` === '1') {
        return (
          <Select
            {...props}
            mode="multiple"
            showArrow
            allowClear
            showSearch
            optionFilterProp="label"
            options={sOptions}
          />
        );
      }
      return (
        <Select
          {...props}
          showArrow
          allowClear
          showSearch
          optionFilterProp="label"
          options={sOptions}
        />
      );
    }
    // 评分
    if (valueType === 'rate') {
      return <Rate {...props} />;
    }

    return <Input {...props} />;
  };

  return getField();
};

export default ContactField;
