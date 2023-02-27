import React, { useEffect } from 'react';
import { Modal, Radio, Space, Alert, message } from 'antd';
import { useSetState } from 'ahooks';
import { apiExportQuota } from '@/services/contacts';
import { useRequest, history } from '@umijs/max';
import { ShoppingCartOutlined } from '@ant-design/icons';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  onAction: (vals: any) => void;
  rowCount: number;
  totalCount: number;
  loading: boolean;
}

const ContactsExport: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, onAction, rowCount, totalCount, loading } = props;
  const [state, setState] = useSetState({
    rangeType: 'all',
    fieldType: 'all',
    saveType: 'CSV',
    vip: 0,
  });

  const { data: quotaData, run: quotaRun } = useRequest(apiExportQuota, { manual: true });

  useEffect(() => {
    if (visible) {
      quotaRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSubmit = async () => {
    const { count } = quotaData;
    if (!count || count <= 0) {
      message.error('今日导出额度已使用完');
      return;
    }
    const { rangeType, fieldType } = state;
    if (rangeType === 'part' && count < rowCount) {
      message.error('额度不足');
      return;
    }
    if (rangeType === 'all' && count < totalCount) {
      message.error('额度不足');
      return;
    }
    onAction({ rangeType, fieldType });
  };

  const onCustChange = async (e: any) => {
    setState({ rangeType: e.target.value });
  };

  const onFiledChange = async (e: any) => {
    setState({ fieldType: e.target.value });
  };

  const modalFooter = { okText: '导出', onOk: handleSubmit, onCancel };

  const renderTitle = () => {
    return (
      <div>
        <span>联系人导出</span>
        <a style={{ marginLeft: 250 }} onClick={() => history.push('/contacts/export-history')}>
          导出纪录
        </a>
      </div>
    );
  };

  return (
    <Modal
      title={renderTitle()}
      width={480}
      bodyStyle={{ padding: '28px 24px 24px' }}
      destroyOnClose
      open={visible}
      confirmLoading={loading}
      {...modalFooter}
    >
      <div>
        <Alert
          message={
            <div>
              单日限额 <a>{quotaData?.quota}</a> 已使用 <a>{quotaData?.today}</a> 剩余{' '}
              <a>{quotaData?.count}</a>
            </div>
          }
          action={
            <a href="/expenses/purchase?type=svip" target="_blank" style={{ marginRight: 13 }}>
              <ShoppingCartOutlined />
              升级SVIP
            </a>
          }
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
        />

        <div style={{ color: '#9f9f9f', paddingBottom: 12 }}>保存文件格式</div>
        <Radio.Group style={{ marginLeft: 12 }} value={state.saveType} onChange={onCustChange}>
          <Radio value="CSV">CSV</Radio>
          <Radio value="XLSX" disabled>
            XLSX
          </Radio>
        </Radio.Group>
        <div style={{ color: '#9f9f9f', paddingBottom: 12, paddingTop: 12 }}>导出哪些数据</div>
        <Radio.Group style={{ marginLeft: 12 }} value={state.rangeType} onChange={onCustChange}>
          <Space direction="vertical">
            <Radio value="part">
              只导出页面 <a>{rowCount}</a> 条数据
            </Radio>
            <Radio value="all">
              导出全部 <a>{totalCount}</a> 条数据
            </Radio>
          </Space>
        </Radio.Group>
        <div style={{ color: '#9f9f9f', paddingBottom: 12, paddingTop: 12 }}>导出哪些字段</div>
        <Radio.Group style={{ marginLeft: 12 }} value={state.fieldType} onChange={onFiledChange}>
          <Space direction="vertical">
            <Radio value="part">当前显示的部分字段</Radio>
            <Radio value="all">全部字段</Radio>
          </Space>
        </Radio.Group>
      </div>
    </Modal>
  );
};

export default ContactsExport;
