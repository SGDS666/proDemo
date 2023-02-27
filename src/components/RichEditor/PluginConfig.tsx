import { $, isMobile, removeUnit } from '@aomao/engine';
import type { PluginEntry, CardEntry, PluginOptions, NodeInterface } from '@aomao/engine';
import { ToolbarPlugin, ToolbarComponent, fontFamilyDefaultData } from '@aomao/toolbar';
import type { ToolbarOptions } from '@aomao/toolbar';
import Alignment from '@aomao/plugin-alignment'; // 对齐方式：左对齐、居中对齐、右对齐、两端对齐
import Backcolor from '@aomao/plugin-backcolor'; // 背景颜色插件
import Bold from '@aomao/plugin-bold'; // 加粗样式插件
import Code from '@aomao/plugin-code'; // 行内代码样式插件
import CodeBlock, { CodeBlockComponent } from '@aomao/plugin-codeblock'; // 代码块插件
import Embed, { EmbedComponent } from '@aomao/plugin-embed'; // 嵌入网址
import File, { FileComponent, FileUploader } from '@aomao/plugin-file'; // 文件插件
import type { FileOptions } from '@aomao/plugin-file';
import Fontcolor from '@aomao/plugin-fontcolor'; // 前景色插件
import Fontsize from '@aomao/plugin-fontsize'; // 字体大小插件
import type { FontsizeOptions } from '@aomao/plugin-fontsize';
import Fontfamily from '@aomao/plugin-fontfamily'; // 字体插件
import type { FontfamilyOptions } from '@aomao/plugin-fontfamily';
import Heading from '@aomao/plugin-heading'; // 标题样式插件
import type { HeadingOptions } from '@aomao/plugin-heading';
import Hr, { HrComponent } from '@aomao/plugin-hr'; // 分割线插件
import Indent from '@aomao/plugin-indent'; // 缩进插件
import Italic from '@aomao/plugin-italic'; // 斜体样式插件
import Image, { ImageComponent, ImageUploader } from '@aomao/plugin-image'; // 图片插件
import type { ImageOptions } from '@aomao/plugin-image';
import Link from '@aomao/plugin-link'; // 链接插件
import LineHeight from '@aomao/plugin-line-height'; // 行高插件
import type { LineHeightOptions } from '@aomao/plugin-line-height';
import Lightblock, { LightblockComponent } from '@aomao/plugin-lightblock'; // 高亮块、提示框插件(React)
import Mark from '@aomao/plugin-mark';
// import MarkRange from '@aomao/plugin-mark-range'; // 光标区域标记插件 console报错
import type { MarkRangeOptions } from '@aomao/plugin-mark-range';
import Math, { MathComponent } from '@aomao/plugin-math'; // 数学公式
import type { MathOptions } from '@aomao/plugin-math';
import Mention, { MentionComponent } from '@aomao/plugin-mention'; // 提及插件
import type { MentionOptions } from '@aomao/plugin-mention';
import Mermaid, { MermaidComponent } from '@aomao/plugin-mermaid'; // mermaid 插件 (支持 markdown 语法生成 mermaid 图表)
import Orderedlist from '@aomao/plugin-orderedlist'; // 有序列表插件
import PaintFormat from '@aomao/plugin-paintformat'; // 格式刷插件
import Quote from '@aomao/plugin-quote'; // 引用样式插件
import Redo from '@aomao/plugin-redo'; // 重做历史插件
import RemoveFormat from '@aomao/plugin-removeformat'; // 移除样式插件
import SelectAll from '@aomao/plugin-selectall'; // 全选插件
import Strikethrough from '@aomao/plugin-strikethrough'; // 删除线样式插件
import Status, { StatusComponent } from '@aomao/plugin-status'; // 状态插件
import Sub from '@aomao/plugin-sub'; // 下标样式插件
import Sup from '@aomao/plugin-sup'; // 上标样式插件
import Table, { TableComponent } from '@aomao/plugin-table'; // 表格插件
import type { TableOptions } from '@aomao/plugin-table';
import Tasklist, { CheckboxComponent } from '@aomao/plugin-tasklist'; // 任务列表插件
import Underline from '@aomao/plugin-underline'; // 下划线样式插件
import Undo from '@aomao/plugin-undo'; // 撤销历史插件
import Unorderedlist from '@aomao/plugin-unorderedlist'; // 无序列表插件
import Video, { VideoComponent, VideoUploader } from '@aomao/plugin-video';
import type { VideoOptions, VideoUploaderOptions } from '@aomao/plugin-video';
import MulitCodeblock, { MulitCodeblockComponent } from '@aomao/plugin-mulit-codeblock';
import { ImageUploaderOptions } from 'plugins/image/dist/uploader';
import Tag, { TagComponent } from '@aomao/plugin-tag';
import Test, { TestComponent } from './plugins/test';
import ReactDOM from 'react-dom';
import Empty from 'antd/es/empty';

export const pluginList = [
  Redo,
  Undo,
  Bold,
  Code,
  Backcolor,
  Fontcolor,
  Fontsize,
  Italic,
  Underline,
  Hr,
  Tasklist,
  Orderedlist,
  Unorderedlist,
  Indent,
  Heading,
  Strikethrough,
  Sub,
  Sup,
  Alignment,
  Mark,
  Quote,
  PaintFormat,
  RemoveFormat,
  SelectAll,
  Link,
  CodeBlock,
  Image,
  ImageUploader,
  Table,
  // MarkRange,
  File,
  FileUploader,
  Video,
  VideoUploader,
  Math,
  ToolbarPlugin,
  Fontfamily,
  Status,
  LineHeight,
  Mention,
  Embed,
  Test,
  Lightblock,
  MulitCodeblock,
  Tag,
  Mermaid,
];

export const cardList = [
  HrComponent,
  CheckboxComponent,
  CodeBlockComponent,
  ImageComponent,
  TableComponent,
  FileComponent,
  VideoComponent,
  MathComponent,
  ToolbarComponent,
  StatusComponent,
  MentionComponent,
  TestComponent,
  EmbedComponent,
  LightblockComponent,
  MulitCodeblockComponent,
  TagComponent,
  MermaidComponent,
];

/* ImageUploader配置 */
export const ImageUploaderConfig = {
  [ImageUploader.pluginName]: {
    file: {
      action: `/api/upload/image`, // 上传地址
      crossOrigin: true, // 是否跨域
      headers: {
        Authorization: 213434,
      },
      name: 'file',
    },
  },
};

export const tableOptions: TableOptions = {
  overflow: {
    maxLeftWidth: () => {
      if (isMobile) return 0;
      // 编辑区域位置
      const rect = $('.am-engine').get<HTMLElement>()?.getBoundingClientRect();
      const editorLeft = rect?.left || 0;
      // 减去大纲的宽度
      const width = editorLeft - $('.data-toc-wrapper').width();
      // 留 16px 的间隔
      return width <= 0 ? 0 : width - 16;
    },
    maxRightWidth: () => {
      if (isMobile) return 0;
      // 编辑区域位置
      const rect = $('.am-engine').get<HTMLElement>()?.getBoundingClientRect();
      const editorRigth = (rect?.right || 0) - (rect?.width || 0);
      // 减去评论区域的宽度
      const width = editorRigth - $('.doc-comment-layer').width();
      // 留 16px 的间隔
      return width <= 0 ? 0 : width - 16;
    },
  },
  maxInsertNum: 50,
};

export const markRangeOptions: MarkRangeOptions = {
  //标记类型集合
  keys: ['comment'],
};

export const imageOptions: ImageOptions = {
  onBeforeRender: (status: string, url: string) => {
    if (!url || url.indexOf('http') === 0) return url;
    return url + `?token=12323`;
  },
  maxHeight: 600,
};

export const imageUploaderOptions: ImageUploaderOptions = {
  file: {
    action: '/api/upload/image',
    headers: { Authorization: '213434' },
  },
  remote: {
    action: '/api/upload/image',
  },
  isRemote: () => false,
};

export const fileOptions: FileOptions = {
  action: '/api/upload/file',
};

export const videoOptions: VideoOptions = {
  onBeforeRender: (status: string, url: string) => {
    return url;
  },
  fullEditor: 420,
};

export const videoUploaderOptions: VideoUploaderOptions = {
  action: '/api/upload/video',
  limitSize: 1024 * 1024 * 50,
};

export const mathOptions: MathOptions = {
  action: '/api/latex',
  parse: (res: any) => {
    if (res.success) return { result: true, data: res.svg };
    return { result: false, data: '' };
  },
};

export const mentionOptions: MentionOptions = {
  action: '/api/user/search',
  // onLoading: (root: NodeInterface) => {
  // 	return ReactDOM.render(<Loading />, root.get<HTMLElement>()!);
  // },
  onEmpty: (root: NodeInterface) => {
    // eslint-disable-next-line react/no-render-return-value
    return ReactDOM.render(<Empty />, root.get<HTMLElement>()!);
  },
  onClick: (root: NodeInterface, { key, name }) => {
    console.log('mention click:', key, '-', name);
  },
  onMouseEnter: (layout: NodeInterface, { name }) => {
    ReactDOM.render(
      <div style={{ padding: 5 }}>
        <p>This is name: {name}</p>
        <p>配置 mention 插件的 onMouseEnter 方法</p>
        <p>此处使用 ReactDOM.render 自定义渲染</p>
        <p>Use ReactDOM.render to customize rendering here</p>
      </div>,
      layout.get<HTMLElement>()!,
    );
  },
};

export const fontsizeOptions: FontsizeOptions = {
  //配置粘贴后需要过滤的字体大小
  filter: (fontSize: string) => {
    const size = removeUnit(fontSize);
    if (size > 48) {
      return '48px';
    } else if (size < 12) return '12px';
    else if (size < 19 && size > 16) return '16px';
    else if (size < 22 && size > 19) return '19px';
    else if (size < 24 && size > 22) return '22px';
    else if (size < 29 && size > 24) return '24px';
    else if (size < 32 && size > 29) return '29px';
    else if (size < 40 && size > 32) return '32px';
    else if (size < 48 && size > 40) return '40px';
    return (
      [
        '12px',
        '13px',
        '14px',
        '15px',
        '16px',
        '19px',
        '22px',
        '24px',
        '29px',
        '32px',
        '40px',
        '48px',
      ].indexOf(fontSize) > -1
    );
  },
};

export const fontfamilyOptions: FontfamilyOptions = {
  //配置粘贴后需要过滤的字体
  filter: (fontfamily: string) => {
    const item = fontFamilyDefaultData.find((item) =>
      fontfamily
        .split(',')
        .some((name) => item.value.toLowerCase().indexOf(name.replace(/"/, '').toLowerCase()) > -1),
    );
    return item ? item.value : false;
  },
};

export const lineHeightOptions: LineHeightOptions = {
  //配置粘贴后需要过滤的行高
  filter: (lineHeight: string) => {
    if (lineHeight === '14px') return '1';
    if (lineHeight === '16px') return '1.15';
    if (lineHeight === '21px') return '1.5';
    if (lineHeight === '28px') return '2';
    if (lineHeight === '35px') return '2.5';
    if (lineHeight === '42px') return '3';
    // 不满足条件就移除掉
    return ['1', '1.15', '1.5', '2', '2.5', '3'].indexOf(lineHeight) > -1;
  },
};

export const toolbarOptions: ToolbarOptions = () => ({
  popup: {
    items: [
      ['bold', 'strikethrough', 'fontcolor'],
      {
        icon: 'text',
        items: ['italic', 'underline', 'backcolor', 'moremark'],
      },
      [
        {
          type: 'button',
          name: 'image-uploader',
          icon: 'image',
        },
        'link',
        'tasklist',
        'heading',
      ],
      {
        icon: 'more',
        items: [
          {
            type: 'button',
            name: 'video-uploader',
            icon: 'video',
          },
          {
            type: 'button',
            name: 'file-uploader',
            icon: 'attachment',
          },
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
    ],
  },
});

const headingOptions: HeadingOptions = {
  showAnchor: isMobile ? false : true,
};

export const pluginConfig = (lang: string): Record<string, PluginOptions> => ({
  [Heading.pluginName]: headingOptions,
  [ToolbarPlugin.pluginName]: toolbarOptions(lang),
  [Table.pluginName]: tableOptions,
  [MarkRange.pluginName]: markRangeOptions,
  [Image.pluginName]: imageOptions,
  [ImageUploader.pluginName]: imageUploaderOptions,
  [FileUploader.pluginName]: fileOptions,
  [VideoUploader.pluginName]: videoUploaderOptions,
  [Video.pluginName]: videoOptions,
  [Math.pluginName]: mathOptions,
  [Mention.pluginName]: mentionOptions,
  [Fontsize.pluginName]: fontsizeOptions,
  [Fontfamily.pluginName]: fontfamilyOptions,
  [LineHeight.pluginName]: lineHeightOptions,
  [MulitCodeblock.pluginName]: {
    language: ['javascript', 'html', 'css'],
  },
});
