import React, { useEffect, useRef, useState } from 'react';
import type { EngineInterface } from '@aomao/engine';
import Engine from '@aomao/engine';
import Toolbar from '@aomao/toolbar';
import { pluginList, cardList, ImageUploaderConfig } from './PluginConfig';

const Editor: React.FC<any> = (props) => {
  const { value, onChange, isMobile } = props;
  //编辑器容器
  const ref = useRef<HTMLDivElement | null>(null);
  //引擎实例
  const [engine, setEngine] = useState<EngineInterface>();

  const engineOption = {
    plugins: pluginList,
    cards: cardList,
    config: {
      ...ImageUploaderConfig,
    },
  };

  const engineItems = isMobile
    ? [
        ['bold', 'italic', 'strikethrough', 'underline', 'moremark'],
        ['heading', 'fontfamily', 'fontsize'],
        [
          // {
          //   type: 'button',
          //   name: 'image-uploader',
          //   icon: 'image',
          // },
          'link',
          'tasklist',
        ],
        {
          icon: 'more',
          items: [
            // {
            //   type: 'button',
            //   name: 'video-uploader',
            //   icon: 'video',
            // },
            // {
            //   type: 'button',
            //   name: 'file-uploader',
            //   icon: 'attachment',
            // },
            {
              type: 'button',
              name: 'math',
              icon: 'math',
            },
            {
              type: 'button',
              name: 'codeblock',
              icon: 'codeblock',
            },
            {
              type: 'button',
              name: 'orderedlist',
              icon: 'ordered-list',
            },
            {
              type: 'button',
              name: 'unorderedlist',
              icon: 'unordered-list',
            },
            {
              type: 'button',
              name: 'hr',
              icon: 'hr',
            },
            {
              type: 'button',
              name: 'quote',
              icon: 'quote',
            },
          ],
        },
      ]
    : [
        ['collapse'],
        ['undo', 'redo', 'paintformat', 'removeformat'],
        ['heading', 'fontfamily', 'fontsize'],
        ['bold', 'italic', 'strikethrough', 'underline', 'moremark'],
        ['fontcolor', 'backcolor'],
        ['alignment'],
        ['unorderedlist', 'orderedlist', 'tasklist', 'indent', 'line-height'],
        ['link', 'quote', 'hr'],
      ];

  useEffect(() => {
    if (!ref.current) return;
    //实例化引擎
    const _engine = new Engine(ref.current, { ...engineOption });
    if (value) {
      _engine.setHtml(value);
    }
    //监听编辑器值改变事件
    _engine.on('change', () => {
      const val = _engine.getHtml();
      onChange(val);
    });
    setEngine(_engine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', zIndex: 100, borderRadius: '6px' }}>
      {engine && <Toolbar engine={engine} items={engineItems} />}
      <div ref={ref} style={{ minHeight: 400 }} />
    </div>
  );
};
export default Editor;
