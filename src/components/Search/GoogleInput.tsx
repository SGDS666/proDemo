import React, { useEffect, useState, useCallback } from 'react';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KeywordCard } from './components/KeywordCard';
import { PlusOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  keyword: string;
  actionReload: (value: string) => void;
}

const InitItem = { value: '', strict: true };

const GoogleInput: React.FC<FormProps> = (props) => {
  const { visible, onCancel, actionReload, keyword } = props;
  const [includeOptions, setIncludeOptions] = useState([{ ...InitItem }]);
  const [excludeOptions, setExcludeOptions] = useState([{ ...InitItem }]);
  const [state, setState] = useSetState<Record<string, any>>({
    hasApply: false,
  });

  const getKeywords = () => {
    let includeKeywords = '';
    let excludeKeywords = '';
    includeOptions.forEach((item: any) => {
      const { value, strict } = item;
      if (value) {
        if (includeKeywords) {
          if (strict) {
            includeKeywords += ` AND "${value}"`;
          } else {
            includeKeywords += ` AND ${value}`;
          }
        } else {
          if (strict) {
            includeKeywords += `"${value}"`;
          } else {
            includeKeywords += `${value}`;
          }
        }
      }
    });
    excludeOptions.forEach((item: any) => {
      const { value, strict } = item;
      if (value) {
        if (strict) {
          excludeKeywords += ` -"${value}"`;
        } else {
          excludeKeywords += ` -${value}`;
        }
      }
    });
    const keywords = `${includeKeywords}${excludeKeywords}`.trim();
    return {
      keywords,
      includeKeywords: includeKeywords.trim(),
      excludeKeywords: excludeKeywords.trim(),
    };
  };

  const onApplyAction = () => {
    const { keywords, includeKeywords } = getKeywords();
    if (!keywords || !includeKeywords) {
      message.error('匹配关键词不能为空');
      return;
    }
    setState({ hasApply: true });
    actionReload(keywords);
    onCancel();
  };

  const footer = () => {
    return (
      <div style={{ textAlign: 'center' }}>
        <Button style={{ marginRight: 24 }} onClick={() => onCancel()} size="large">
          取消
        </Button>
        <Button type="primary" onClick={() => onApplyAction()} size="large">
          应用
        </Button>
      </div>
    );
  };

  const moveIncludeCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const opts = [...includeOptions];
      const dragCard = includeOptions[dragIndex];
      opts.splice(dragIndex, 1);
      opts.splice(hoverIndex, 0, dragCard);
      setIncludeOptions(opts);
    },
    [includeOptions],
  );

  const removeIncludeCard = useCallback(
    (index) => {
      const opts = [...includeOptions];
      opts.splice(index, 1);
      setIncludeOptions(opts);
    },
    [includeOptions],
  );

  const changeIncludeCard = useCallback(
    (index, name, value) => {
      const opts = [...includeOptions];
      opts[index] = { ...opts[index], [name]: value };
      setIncludeOptions(opts);
    },
    [includeOptions],
  );

  const renderIncludeCard = (item: any, index: number) => {
    return (
      <KeywordCard
        key={index}
        index={index}
        wordItem={item}
        moveCard={moveIncludeCard}
        removeCard={removeIncludeCard}
        changeCard={changeIncludeCard}
      />
    );
  };

  const moveExcludeCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const opts = [...excludeOptions];
      const dragCard = excludeOptions[dragIndex];
      opts.splice(dragIndex, 1);
      opts.splice(hoverIndex, 0, dragCard);
      setExcludeOptions(opts);
    },
    [excludeOptions],
  );

  const removeExcludeCard = useCallback(
    (index) => {
      const opts = [...excludeOptions];
      opts.splice(index, 1);
      setExcludeOptions(opts);
    },
    [excludeOptions],
  );

  const changeExcludeCard = useCallback(
    (index, name, value) => {
      const opts = [...excludeOptions];
      opts[index] = { ...opts[index], [name]: value };
      setExcludeOptions(opts);
    },
    [excludeOptions],
  );

  const renderExcludeCard = (item: any, index: number) => {
    return (
      <KeywordCard
        key={index}
        index={index}
        wordItem={item}
        moveCard={moveExcludeCard}
        removeCard={removeExcludeCard}
        changeCard={changeExcludeCard}
      />
    );
  };

  const onPlusInclude = () => {
    if (includeOptions && includeOptions.length >= 5) {
      message.error('关键词数量最多为5个');
      return;
    }
    const ops = [...includeOptions];
    ops.push({ ...InitItem });
    setIncludeOptions(ops);
  };

  const onPlusExclude = () => {
    if (excludeOptions && excludeOptions.length >= 5) {
      message.error('关键词数量最多为5个');
      return;
    }
    const ops = [...excludeOptions];
    ops.push({ ...InitItem });
    setExcludeOptions(ops);
  };

  const renderKeywords = () => {
    const { keywords } = getKeywords();
    if (!keywords) return <div>请设置关键词</div>;
    return (
      <Tag color="#2db7f5">
        <span style={{ fontSize: 16 }}>{keywords}</span>
      </Tag>
    );
  };

  const readKeyword = () => {
    const { hasApply } = state;
    if (hasApply) {
      return;
    }
    let value = keyword.trim();
    if (!value) {
      return;
    }
    if (value.indexOf(' ') >= 0) {
      return;
    }
    if (value.indexOf('"') < 0) {
      setIncludeOptions([{ value, strict: false }]);
    } else {
      value = value.replace(/"/g, '');
      setIncludeOptions([{ value, strict: true }]);
    }
  };

  useEffect(() => {
    if (visible) {
      readKeyword();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Drawer
      destroyOnClose
      width={560}
      title="搜索高级语法"
      open={visible}
      onClose={() => onCancel()}
      footer={footer()}
      placement="right"
    >
      <div>
        <Form size="large" layout="vertical">
          <Form.Item label="匹配关键词(同时出现)" name="includeWords">
            <div>
              <DndProvider backend={HTML5Backend}>
                <div style={{ width: '100%', maxHeight: 480, overflow: 'auto' }}>
                  {includeOptions.map((item: any, i: number) => renderIncludeCard(item, i))}
                </div>
              </DndProvider>
              <a onClick={() => onPlusInclude()}>
                <PlusOutlined />
                添加
              </a>
            </div>
          </Form.Item>
          <Form.Item label="排除关键词" name="exCludeWords">
            <div>
              <DndProvider backend={HTML5Backend}>
                <div style={{ width: '100%', maxHeight: 480, overflow: 'auto' }}>
                  {excludeOptions.map((item: any, i: number) => renderExcludeCard(item, i))}
                </div>
              </DndProvider>
              <a onClick={() => onPlusExclude()}>
                <PlusOutlined />
                添加
              </a>
            </div>
          </Form.Item>
          <Form.Item label="语法预览" name="keywords">
            {renderKeywords()}
          </Form.Item>
        </Form>
      </div>
    </Drawer>
  );
};

export default GoogleInput;
