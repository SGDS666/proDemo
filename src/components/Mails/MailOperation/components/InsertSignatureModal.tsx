import React, { useEffect } from 'react';
import { Modal, Space, Divider, Empty } from 'antd';
import { useSetState } from 'ahooks';
import { apiSignItems } from '@/services/mails';
import styles from './index.less';
import SignCreate from '@/components/Mails/MailSignature/SignCreate';
import SignList from '@/components/Mails/MailSignature/SignList';

const InsertSignatureModal: React.FC<any> = (props) => {
  const { visible, onCancel, insertAction } = props;
  const [state, setState] = useSetState({
    contactOptions: [],
    companyOptions: [],
    options: [],
    fieldType: 'contact', // contact/company
    key: '',
    createVisiable: false,
    listVisiable: false,
  });

  const getOptions = async () => {
    const data = await apiSignItems();
    if (data) {
      setState({ options: data });
    }
  };

  const fieldItemClick = (name: string, content: string) => {
    insertAction({ name, content });
  };

  const fieldItem = (item: any) => {
    const { name, content } = item;
    return (
      <div
        key={name}
        className={styles['field-item']}
        onClick={() => fieldItemClick(name, content)}
      >
        {name}
      </div>
    );
  };

  useEffect(() => {
    if (visible) {
      getOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      title={false}
      width={240}
      bodyStyle={{ minHeight: 160 }}
      destroyOnClose
      open={visible}
      footer={null}
      onCancel={onCancel}
      maskClosable={false}
    >
      <Space direction="vertical">
        <div style={{ fontSize: 16, width: 192, overflow: 'auto', maxHeight: 300 }}>
          {state.options && state.options.length ? (
            state.options.map((item) => fieldItem(item))
          ) : (
            <Empty description={false} />
          )}
        </div>
      </Space>
      <div style={{ textAlign: 'center', width: 192 }}>
        <Divider style={{ margin: 12 }} />
        <div>
          <a onClick={() => setState({ createVisiable: true })}>新建签名</a>
        </div>
        <Divider style={{ margin: 12 }} />
        <div>
          <a onClick={() => setState({ listVisiable: true })}>签名管理</a>
        </div>
      </div>
      <SignCreate
        visible={state.createVisiable}
        onCancel={() => setState({ createVisiable: false })}
        actionReload={() => getOptions()}
      />
      <SignList visible={state.listVisiable} onCancel={() => setState({ listVisiable: false })} />
    </Modal>
  );
};

export default InsertSignatureModal;
