import React, { FC, useEffect } from 'react';
import { Modal, Input, Select, Space } from 'antd';
import { useSetState } from 'ahooks';
import { apiFieldContactShow, apiFieldCompanyShow } from '@/services/field';
import styles from './index.less';

const InsertVeriableModal: FC<any> = (props) => {
  const { visible, onCancel, insertAction } = props;
  const [state, setState] = useSetState({
    contactOptions: [],
    companyOptions: [],
    options: [],
    fieldType: 'contact', // contact/company
    key: '',
  });

  const getOptions = async (fieldType: string) => {
    const { contactOptions, companyOptions } = state;
    if (fieldType === 'contact') {
      if (contactOptions && contactOptions.length) {
        setState({ options: [...contactOptions] });
      } else {
        const data = await apiFieldContactShow({ showAll: true });
        setState({ contactOptions: [...data], options: [...data] });
      }
    } else {
      if (companyOptions && companyOptions.length) {
        setState({ options: [...companyOptions] });
      } else {
        const data = await apiFieldCompanyShow({ showAll: true });
        setState({ companyOptions: [...data], options: [...data] });
      }
    }
  };

  const fieldItemClick = (dataIndex: string, title: string) => {
    const { fieldType } = state;
    insertAction({ fieldType, dataIndex, title });
  };

  const fieldItem = (item: any) => {
    const { key } = state;
    const { dataIndex, title } = item;
    if (key) {
      const idx = title.indexOf(key);
      if (idx < 0) {
        return null;
      }
    }
    return (
      <div
        key={dataIndex}
        className={styles['field-item']}
        onClick={() => fieldItemClick(dataIndex, title)}
      >
        {title}
      </div>
    );
  };

  const fieldTypeChange = (value: string) => {
    setState({ fieldType: value });
    getOptions(value);
  };

  useEffect(() => {
    if (visible) {
      getOptions('contact');
    }
  }, [props.visible]);

  return (
    <Modal
      title="插入变量选择"
      width={300}
      bodyStyle={{ height: 450 }}
      destroyOnClose
      open={visible}
      footer={null}
      onCancel={onCancel}
    >
      <Space direction="vertical">
        <Select style={{ width: '100%' }} value={state.fieldType} onChange={fieldTypeChange}>
          <Select.Option value="contact">联系人</Select.Option>
          <Select.Option value="company">公司</Select.Option>
        </Select>
        <Input.Search
          placeholder="搜索字段"
          allowClear
          onChange={(e) => setState({ key: e.target.value })}
          style={{ width: '100%', paddingBottom: 10 }}
          value={state.key}
        />
        <div style={{ fontSize: 16, overflow: 'auto', height: 300 }}>
          {state.options.map((item, index) => fieldItem(item, index))}
        </div>
      </Space>
    </Modal>
  );
};

export default InsertVeriableModal;
