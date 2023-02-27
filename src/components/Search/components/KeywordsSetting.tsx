import React, { useEffect } from 'react';
import { Modal, Button, Menu } from 'antd';
import { apiCustomOptionsList, apiCustomOptionsSave } from '@/services/option';
import { useRequest } from '@umijs/max';
import { Sortable } from '@/components/DndKit/Sortable';
import type { AnimateLayoutChanges } from '@dnd-kit/sortable';
import { defaultAnimateLayoutChanges, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MeasuringStrategy } from '@dnd-kit/core';
import ProCard from '@ant-design/pro-card';
import { useSetState } from 'ahooks';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  type: string;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const KeywordsSetting: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, type } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    settingType: 'includeKeywords',
    keywords: [],
    hasChange: false,
  });
  const { settingType } = state;
  const { run: listRun } = useRequest(apiCustomOptionsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { values } = data;
      setState({ keywords: values });
    },
  });

  const { run: saveRun, loading: saveLoading } = useRequest(apiCustomOptionsSave, {
    manual: true,
    onSuccess: () => {
      actionReload();
      onCancel();
      setState({ hasChange: false });
    },
  });

  const onSaveAction = async () => {
    const { keywords: values } = state;
    saveRun({ type: settingType, values });
  };

  const onCloseAction = () => {
    if (state.hasChange) {
      Modal.confirm({
        title: '有修改数据未保存',
        content: `是否保存？`,
        cancelText: '不保存退出',
        okText: '保存并退出',
        onOk: () => onSaveAction(),
      });
    }
    onCancel();
  };

  const footer = () => {
    return (
      <div style={{ textAlign: 'right' }}>
        <Button style={{ marginRight: 24 }} onClick={() => onCloseAction()}>
          取消
        </Button>
        <Button
          type="primary"
          onClick={onSaveAction}
          disabled={!state.hasChange}
          loading={saveLoading}
        >
          保存
        </Button>
      </div>
    );
  };

  const onKeywordsChange = (values: any) => {
    setState({ hasChange: true, keywords: values });
  };

  useEffect(() => {
    if (visible) {
      listRun({ type });
      setState({ settingType: type });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      destroyOnClose
      title="常用关键词设置"
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
      maskClosable={false}
      width={640}
      bodyStyle={{ padding: 0 }}
    >
      <ProCard split="vertical">
        <ProCard title={false} colSpan="25%" bodyStyle={{ padding: 0 }}>
          <Menu
            style={{ width: '100%' }}
            mode="inline"
            selectedKeys={[settingType]}
            items={[
              {
                key: 'includeKeywords',
                label: '关键词',
              },
              {
                key: 'otherKeywords',
                label: '同时包含',
              },
              {
                key: 'titleKeywords',
                label: '标题包含',
              },
              {
                key: 'excludeKeywords',
                label: '同时排除',
              },
              {
                key: 'categoryKeywords',
                label: '分类关键词',
              },
              {
                key: 'industryKeywords',
                label: '行业关键词',
              },
            ]}
            onSelect={({ key }) => {
              setState({ settingType: key });
              listRun({ type: key });
            }}
          />
        </ProCard>
        <ProCard title={false} headerBordered bodyStyle={{ padding: 0 }}>
          <div
            style={{
              height: 360,
              overflow: 'auto',
              margin: 0,
              width: '100%',
            }}
          >
            <Sortable
              strategy={verticalListSortingStrategy}
              itemCount={50}
              items={state.keywords}
              animateLayoutChanges={animateLayoutChanges}
              measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
              removable
              handle
              style={{ padding: 0, width: 100 }}
              onChange={(values: any) => onKeywordsChange(values)}
            />
          </div>
        </ProCard>
      </ProCard>
    </Modal>
  );
};

export default KeywordsSetting;
