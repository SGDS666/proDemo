import React, { useEffect, useState } from 'react';
import {
  Input,
  Table,
  Space,
  Button,
  Row,
  Col,
  TreeSelect,
  Popover,
  message,
  Checkbox,
  Dropdown,
  InputNumber,
  Pagination,
  Tooltip,
  Select,
  Typography,
  Divider,
  Card,
  theme
} from 'antd';
import { useSetState } from 'ahooks';
import {
  apiContactsSave,
  apiContactsDelete,
  apiContactsTags,
  apiContactsShow,
  apiTagsList,
  apiViewConfig,
  apiViewSave,
  apiExportSave,
  apiTagsAdd,
} from '@/services/contacts';
import { apiContactTableFields, apiSaveFieldConfig } from '@/services/field';
import { useRequest, history } from '@umijs/max';
import {
  CaretDownOutlined,
  CheckCircleTwoTone,
  CheckOutlined,
  CloseCircleTwoTone,

  CloudUploadOutlined,
  EllipsisOutlined,
  FilterFilled,
  InfoCircleOutlined,
  LoadingOutlined,
  MailOutlined,
  PlusOutlined,
  QuestionCircleTwoTone,
  SettingOutlined,
  SyncOutlined,

} from '@ant-design/icons';
import TableCell from '@/components/Contacts/TableCell';
import ContactCreate from '@/components/Contacts/ContactCreate';
import ContactPreview from '@/components/Contacts/ContactPreview';
import FieldSetting from '@/components/FieldSetting';
import ContactFilter from './ContactFilters';
import ContactsChange from './ContactsChange';
import ContactsDelete from './ContactsDelete';
import ContactsTags from './ContactsTags';
import ContactsExport from './ContactsExport';
import MassTaskCreate from '@/components/Tasks/MassTaskCreate';
import ContactsAssign from './ContactsAssign';
import { Resizable } from 'react-resizable';
import classnames from 'classnames';
import styles from '../style.less';
import './resize.less';
import './style.less';
import ViewCreate from '@/components/Contacts/ViewCreate';
import { renderTagsTree } from '@/components/Common/Tag';
import MassTaskOpt from '@/components/Tasks/MassTaskOpt';
import { renderName } from '@/utils/common';
import RcResizeObserver from 'rc-resize-observer';
import { apiOrganizeUsers } from '@/services/enterprise';
import { MenuProps } from "antd";
const { useToken } = theme
interface Props {
  viewId: string;
  createReload: (val: any) => void;
}

const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props;

  // 添加偏移量
  const [offset, setOffset] = useState(0);

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      // 宽度重新计算结果，表头应当加上偏移量，这样拖拽结束的时候能够计算结果；
      // 当然在停止事件再计算应当一样，我没试过（笑）
      width={width + offset}
      height={0}
      handle={
        <span
          // 有偏移量显示竖线
          className={classnames(['react-resizable-handle', offset && 'active'])}
          // 拖拽层偏移
          style={{ transform: `translateX(${offset}px)` }}
          onClick={(e) => {
            // 取消冒泡，不取消貌似容易触发排序事件
            e.stopPropagation();
            e.preventDefault();
          }}
        />
      }
      // 拖拽事件实时更新
      onResize={(e, { size }) => {
        // 这里只更新偏移量，数据列表其实并没有伸缩
        if (size.width >= 600) {
          // 列的最大宽度是600
          setOffset(600 - width);
        } else {
          setOffset(size.width - width);
        }
      }}
      // 拖拽结束更新
      onResizeStop={(...argu) => {
        // 拖拽结束以后偏移量归零
        setOffset(0);
        // 这里是props传进来的事件，在外部是列数据中的onHeaderCell方法提供的事件，请自行研究官方提供的案例
        onResize(...argu);
      }}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const ContactsDataTable: React.FC<Props> = (props) => {
  const { viewId, createReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    viewOwner: '',
    current: 1, // 当前页数
    pageSize: 10, // 每页纪录数量
    total: 10, // 总数
    contactsData: [], // 联系人数据
    tagsTreeData: [], // 标签树数据
    tagsItem: {}, // 标签列配置
    logic: 'and',
    filters: [], // 筛选条件
    keyword: '', // 搜索关键字
    ownerValue: [], // 归属值
    tagsValue: [], // 标签选中的值
    statusValue: [], // 联系人状态的值
    filterVisible: false, // 更多条件显示
    contactCreateVisible: false, // 创建联系人
    contactPreviewVisible: false, // 编辑联系人
    currentRecord: {},
    tblSelectKeys: [], // 选中的cid列表
    selectAll: false, // 是否选中所有客户
    selectLimit: 200,
    selectOption: '',
    selectTotal: 0,
    multiChangeVisible: false, // 批量修改
    multiDeleteVisible: false, // 批量删除
    multiTagsVisible: false, // 批量标签修改
    multiTagsAction: 'push', // 默认贴标签
    exportVisible: false, // 导入显示
    columnsData: [], // 表格字段
    fieldSettingVisible: false, // 字段设置
    sendMailsVisible: false,
    sort: { create_time: -1 },
    massVisible: false,
    assignVisible: false,
    viewConfig: {},
    scrollY: 600,
    searchVisible: false,
    viewSaveVisible: false,
    tagName: '',
    verifingCount: 0,
    unVerifyCount: 0,
  });
  const { token } = useToken()
  const { data: usersData } = useRequest(apiOrganizeUsers, {
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ owners: data });
      const treeData = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { nickname, userid } = data[idx];
        treeData.push({ title: nickname, value: userid, key: userid });
      }
      setState({ userTreeData: treeData });
    },
  });

  const [columnsData, setColumnsData] = useState<any>([]);

  const tblComponents = {
    header: {
      cell: ResizableTitle,
    },
  };

  const { run: saveConfigRun } = useRequest(apiSaveFieldConfig, {
    manual: true,
    debounceInterval: 500,
  });

  // 保存宽度
  const saveFieldWidth = async (field: any, width: number) => {
    const { belongTo, dataIndex } = field;
    saveConfigRun({ belongTo, saveType: 'show', dataIndex, config: { width } });
  };

  const handleResize =
    (index: any) =>
      (_e: any, { size }: any) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        setColumnsData((columnsData: any) => {
          const nextColumns = [...columnsData];
          nextColumns[index] = {
            ...nextColumns[index],
            width: size.width,
          };
          saveFieldWidth(nextColumns[index], size.width);
          return nextColumns;
        });
      };

  const { data: fieldData, run: fieldsRun } = useRequest(apiContactTableFields, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      let totalWidth = 32; // 选择框宽度
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { width, dataIndex } = data[idx];
        totalWidth += width;
        data[idx].onHeaderCell = (column: any) => ({
          width: column.width,
          onResize: handleResize(idx),
        });
        data[idx].sorter = (a: any, b: any) => a[dataIndex] - b[dataIndex];
      }
      const tblWidth = window.innerWidth - 64;
      if (tblWidth > totalWidth) {
        data.push({ width: tblWidth - totalWidth });
      }
      setColumnsData(data);
    },
  });

  const { run: viewSaveRun, loading: viewSaveLoading } = useRequest(apiViewSave, {
    manual: true,
    onSuccess: () => {
      message.success('保存成功');
    },
  });

  const { run: tagsListRun } = useRequest(apiTagsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const tree = renderTagsTree(data);
      setState({ tagsTreeData: tree });
    },
  });

  const renderTableData = (data: any) => {
    const result = [];
    // eslint-disable-next-line guard-for-in
    for (const index in data) {
      const values = data[index];
      const columnData: any = { cid: values.cid };
      // eslint-disable-next-line guard-for-in
      for (const idx in fieldData) {
        const { dataIndex } = fieldData[idx];
        if (dataIndex === 'tags') {
          setState({ tagsItem: fieldData[idx] });
        }
        if (dataIndex === 'name') {
          const name = renderName(values);
          columnData[dataIndex] = (
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Button
                size="small"
                className="preview-profile-button"
                onClick={() => setState({ contactPreviewVisible: true, currentRecord: values })}
              >
                预览
              </Button>
              <span>{name}</span>
            </div>
          );
        } else {
          columnData[dataIndex] = (
            <TableCell dataIndex={dataIndex} values={values} field={fieldData[idx]} />
          );
        }
      }
      result.push(columnData);
    }
    return result;
  };

  const {
    run: contactsRun,
    loading: contactsLoading,
    refresh: contactsRefresh,
  } = useRequest(apiContactsShow, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { list, current, total, pageSize, unVerifyCount, verifingCount } = data;
      const contactsData = renderTableData(list);
      setState({ contactsData, current, total, pageSize, unVerifyCount, verifingCount });
    },
  });

  const checkTableFilterValue = (filters: any) => {
    // 标签
    const idx = filters.findIndex((o: any) => o.property === 'tags' && o.operator === 'include');
    if (idx >= 0) {
      setState({ tagsValue: filters[idx].values });
    } else {
      setState({ tagsValue: [] });
    }
    // 验证结果
    const statusIdx = filters.findIndex(
      (o: any) => o.property === 'verify_status' && o.operator === 'include',
    );
    if (statusIdx >= 0) {
      setState({ statusValue: filters[statusIdx].values });
    } else {
      setState({ statusValue: [] });
    }
    // 归属
    const ownerIdx = filters.findIndex(
      (o: any) => o.property === 'userid' && o.operator === 'include',
    );
    if (ownerIdx >= 0) {
      setState({ ownerValue: filters[ownerIdx].values });
    } else {
      setState({ ownerValue: [] });
    }
  };

  const { run: viewConfigRun } = useRequest(apiViewConfig, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { filters, viewOwner, logic } = data;
      setState({
        filters,
        logic,
        current: 1,
        pageSize: 10,
        viewOwner,
        viewConfig: data,
        viewSaveVisible: false,
      });
      contactsRun({ viewId, current: 1, pageSize: 10, filters, logic });
      checkTableFilterValue(filters);
    },
  });

  const reloadContactsTableData = async () => {
    const { current, pageSize, filters, keyword, sort, logic } = state;
    if (current !== 1) {
      setState({ current: 1 });
    }
    const kw = keyword ? keyword.trim() : '';
    await contactsRun({ viewId, current: 1, pageSize, filters, keyword: kw, sort, logic });
  };

  const reloadTableDataWithCurrentPage = async () => {
    const { current, pageSize, filters, keyword, sort, logic } = state;
    const kw = keyword ? keyword.trim() : '';
    await contactsRun({ viewId, current, pageSize, filters, keyword: kw, sort, logic });
  };

  async function getContactsTableData() {
    await fieldsRun();
    await viewConfigRun({ viewId });
  }

  useEffect(() => {
    tagsListRun();
    getContactsTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId]);

  const onTagsChange = async (value: any) => {
    setState({ tagsValue: value });
    const { filters } = state;
    const idx = filters.findIndex((o: any) => o.property === 'tags' && o.operator === 'include');
    if (!value || !value.length) {
      filters.splice(idx, 1);
    } else {
      if (idx >= 0) {
        filters[idx] = { property: 'tags', operator: 'include', values: value };
      } else {
        filters.push({ property: 'tags', operator: 'include', values: value });
      }
    }
    setState({ filters, tblSelectKeys: [], selectAll: false, viewSaveVisible: true });
    reloadContactsTableData();
  };

  const onOwnerChange = async (value: any) => {
    setState({ ownerValue: value });
    const { filters } = state;
    const idx = filters.findIndex((o: any) => o.property === 'userid' && o.operator === 'include');
    if (!value || !value.length) {
      filters.splice(idx, 1);
    } else {
      if (idx >= 0) {
        filters[idx] = { property: 'userid', operator: 'include', values: value };
      } else {
        filters.push({ property: 'userid', operator: 'include', values: value });
      }
    }
    setState({ filters, tblSelectKeys: [], selectAll: false, viewSaveVisible: true });
    reloadContactsTableData();
  };

  const onFilterApplyAction = (vals: any, index: any, act: 'add' | 'update' | 'delete') => {
    const { filters } = state;
    if (act === 'add') {
      filters.push(vals);
    } else if (act === 'update') {
      if (index >= 0) {
        filters[index] = vals;
      } else {
        filters.push(vals);
      }
    } else {
      filters.splice(index, 1);
    }
    setState({ filters, viewSaveVisible: true });
    checkTableFilterValue(filters);
    reloadContactsTableData();
  };

  const onLogicChangeAction = (logic: string) => {
    setState({ logic });
    const { pageSize, filters, keyword, sort } = state;
    const kw = keyword ? keyword.trim() : '';
    contactsRun({ viewId, current: 1, pageSize, filters, keyword: kw, sort, logic });
  };

  const onSaveViewAction = () => {
    const { filters, logic } = state;
    viewSaveRun({ viewId, filters, logic });
    setState({ viewSaveVisible: false });
  };

  const saveViewContent = () => {
    let canSave = false;
    if (state.viewOwner) {
      canSave = true;
    }
    if (canSave) {
      return (
        <div style={{ width: 300 }}>
          <h3>可编辑视图</h3>
          <div>此视图由您创建。您可以将筛选条件保存到此视图。</div>
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <Button
              onClick={onSaveViewAction}
              loading={viewSaveLoading}
              style={{ backgroundColor: 'lightgrey' }}
            >
              保存
            </Button>
            <Button style={{ marginLeft: 24 }} onClick={() => viewConfigRun({ viewId })}>
              重置
            </Button>
          </div>
          <a
            style={{ textDecoration: 'underline', marginBottom: 12 }}
            onClick={() => setState({ viewCreateVisible: true })}
          >
            另存为新视图
          </a>
        </div>
      );
    }
    return (
      <div style={{ width: 300 }}>
        <h3>只读视图</h3>
        <div>这是一个系统标准视图或由其他创建。另存为新视图以保留您的更改。</div>
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <Button disabled>保存</Button>
          <Button style={{ marginLeft: 24 }} onClick={() => viewConfigRun({ viewId })}>
            重置
          </Button>
        </div>
        <a
          style={{ textDecoration: 'underline', marginBottom: 12 }}
          onClick={() => setState({ viewCreateVisible: true })}
        >
          另存为新视图
        </a>
      </div>
    );
  };

  const onTblSelectKeysChange = (selectedKeys: any) => {
    const { contactsData } = state;
    const selectTotal = selectedKeys.length;
    let selectOption = '';
    if (selectTotal === contactsData.length) {
      selectOption = 'current';
    }
    setState({ tblSelectKeys: selectedKeys, selectAll: false, selectTotal, selectOption });
  };

  const onSelectAll = () => {
    const { contactsData } = state;
    const keys = [];
    // eslint-disable-next-line guard-for-in
    for (const idx in contactsData) {
      const { cid } = contactsData[idx];
      keys.push(cid);
    }
    setState({ tblSelectKeys: keys });
  };

  const onActionSelectChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
      setState({ selectAll: false, selectOption: 'current' });
    } else {
      setState({ tblSelectKeys: [], selectAll: false, selectOption: '', selectTotal: 0 });
    }
  };

  const { run: multiSaveRun, loading: updateLoading } = useRequest(apiContactsSave, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      reloadTableDataWithCurrentPage();
      setState({ multiChangeVisible: false });
      onActionSelectChange(false);
      const { modifiedCount, matchedCount } = data;
      message.success(`批量更新数据成功 符合纪录数：${matchedCount} 修改纪录数：${modifiedCount}`);
    },
  });

  // 批量修改
  const onMultiUpdate = async (vals: any) => {
    const { changeField, changeType, changeValue } = vals;
    if (changeField === 'tags') {
      await fieldsRun();
    }
    const { selectAll, total, tblSelectKeys, filters, keyword, selectOption, selectTotal, sort } =
      state;
    const rowCount = selectAll ? total : tblSelectKeys.length;
    multiSaveRun({
      selectAll,
      filters,
      rowCount,
      selectKeys: tblSelectKeys,
      changeField,
      changeType,
      changeValue,
      keyword,
      selectOption,
      selectTotal,
      selectSort: sort,
    });
  };

  const { run: multiDeleteRun, loading: deleteLoading } = useRequest(apiContactsDelete, {
    manual: true,
    onSuccess: () => {
      reloadTableDataWithCurrentPage();
      setState({ multiDeleteVisible: false });
      onActionSelectChange(false);
      message.success('删除纪录成功');
    },
  });

  const onMultiDelete = async () => {
    const { selectAll, total, tblSelectKeys, filters, keyword, selectOption, selectTotal, sort } =
      state;
    const rowCount = selectAll ? total : tblSelectKeys.length;
    multiDeleteRun({
      selectAll,
      selectKeys: tblSelectKeys,
      rowCount,
      keyword,
      filters,
      selectOption,
      selectTotal,
      selectSort: sort,
    });
  };

  const { run: tagsRun, loading: tagsLoading } = useRequest(apiContactsTags, {
    manual: true,
    onSuccess: () => {
      reloadTableDataWithCurrentPage();
      setState({ multiTagsVisible: false });
      onActionSelectChange(false);
      message.success('操作成功');
    },
  });

  const onMultiTags = async (vals: any) => {
    const { tagValues } = vals;
    const {
      selectAll,
      total,
      tblSelectKeys,
      filters,
      keyword,
      multiTagsAction,
      selectOption,
      selectTotal,
      sort,
    } = state;
    const rowCount = selectAll ? total : tblSelectKeys.length;
    tagsRun({
      selectAll,
      selectKeys: tblSelectKeys,
      selectOption,
      selectTotal,
      selectSort: sort,
      filters,
      keyword,
      rowCount,
      tagAction: multiTagsAction,
      tagValues,
    });
  };

  const { run: exportRun, loading: exportLoading } = useRequest(apiExportSave, {
    manual: true,
    onSuccess: () => {
      message.success('导出数据成功，请到导出历史中查看进度');
      setState({ exportVisible: false });
    },
  });

  const onExportAction = async (vals: any) => {
    const { rangeType, fieldType } = vals;
    const { keyword, filters, contactsData } = state;
    const exKeys = [];
    if (rangeType === 'part') {
      // eslint-disable-next-line guard-for-in
      for (const idx in contactsData) {
        const { cid } = contactsData[idx];
        exKeys.push(cid);
      }
    }
    exportRun({ keyword, filters, rangeType, fieldType, exKeys });
  };

  const onMoreActionClick = (vals: any) => {
    const { key } = vals;
    if (key === 'outport') {
      setState({ exportVisible: true });
    } else if (key === 'field') {
      setState({ fieldSettingVisible: true });
    } else if (key === 'mail') {
      setState({ massVisible: true });
    }
  };
  const moreMenu: MenuProps = {
    onClick: onMoreActionClick,
    items: [
      {
        key: 'outport',
        label: "导出数据"
      },
      {
        key: 'field',
        label: "编辑字段"
      }
    ]
  }


  const onMoreChoiceActionClick = (vals: any) => {
    const { key } = vals;
    const { contactsData, total, selectLimit, tblSelectKeys } = state;
    let selectTotal = 0;
    if (key === 'current') {
      selectTotal = contactsData.length;
    } else if (key === 'all') {
      selectTotal = total;
    } else if (key === 'front') {
      selectTotal = selectLimit;
    } else {
      selectTotal = tblSelectKeys.length;
    }
    setState({ selectTotal, selectOption: key });
    onSelectAll();
  };
  const moreChoiceMenu: MenuProps = {
    onClick: onMoreChoiceActionClick,
    style: { width: 200 },
    items: [
      {
        key: 'current',
        icon: state.selectOption === 'current' ? (
          <CheckOutlined style={{ color: '#52c41a' }} />
        ) : (
          <span style={{ marginRight: 6 }}> </span>
        ),
        label: "选择当前页面 " + state.contactsData.length
      },
      {
        key: "front",
        icon: state.selectOption === 'front' ? (
          <CheckOutlined style={{ color: '#52c41a' }} />
        ) : (
          <span style={{ marginRight: 6 }}> </span>
        ),
        label: (
          <>
            选择前{' '}
            <InputNumber
              value={state.selectLimit}
              step={100}
              min={100}
              max={state.total >= 10000 ? 10000 : state.total}
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setState({ selectOption: 'front', selectTotal: state.selectLimit });
              }}
              controls={false}
              onChange={(val) => setState({ selectLimit: val, selectTotal: val })}
            />
          </>)
      },
      {
        key: "all",
        icon: state.selectOption === 'all' ? (
          <CheckOutlined style={{ color: '#52c41a' }} />
        ) : (
          <span style={{ marginRight: 6 }}> </span>
        ),
        label: " 选择全部" + (state.total)
      }
    ]
  }

  const onSaveFiledAction = async () => {
    await fieldsRun();
    contactsRefresh();
  };

  const onTblChange = (pagination: any, filter: any, sorter: any) => {
    // const { current, pageSize } = pagination;
    const sort: any = {};
    const { field, order } = sorter;
    let num = 1;
    if (order === 'descend') {
      num = -1;
    }
    if (field === 'name') {
      sort.first_name = num;
      sort.last_name = num;
    } else if (field) {
      sort[field] = num;
    } else {
      sort.create_time = -1;
    }
    const { filters, current, pageSize, keyword } = state;
    setState({ sort, current, pageSize, tblSelectKeys: [], selectAll: false });
    contactsRun({ viewId, current, pageSize, filters, keyword, sort });
  };

  const onPageChange = (page: any, pageSize: any) => {
    const { filters, sort, keyword } = state;
    contactsRun({ viewId, current: page, pageSize, filters, sort, keyword });
    setState({ sort, keyword, current: page, pageSize, tblSelectKeys: [], selectAll: false });
  };

  const renderTotal = (total: number) => {
    return (
      <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
        联系人数量 <a>{total}</a>
      </div>
    );
  };

  const tagsTagRender = (prop: any) => {
    const { tagsValue } = state;
    const { value } = prop;
    if (tagsValue.length && tagsValue[0] === value) {
      return <div className={styles.stardardFilterSelected}>标签 ({tagsValue.length})</div>;
    } else {
      return <span />;
    }
  };

  const onVerifyStatusChange = (value: any) => {
    setState({ statusValue: value });
    const { filters } = state;
    const idx = filters.findIndex(
      (o: any) => o.property === 'verify_status' && o.operator === 'include',
    );
    if (!value || !value.length) {
      filters.splice(idx, 1);
    } else {
      if (idx >= 0) {
        filters[idx] = { property: 'verify_status', operator: 'include', values: value };
      } else {
        filters.push({ property: 'verify_status', operator: 'include', values: value });
      }
    }
    setState({ filters, tblSelectKeys: [], selectAll: false, viewSaveVisible: true });
    reloadContactsTableData();
  };

  const verifyTagRender = (prop: any) => {
    const { statusValue } = state;
    const { value } = prop;
    if (statusValue.length && statusValue[0] === value) {
      return <div style={{ color: token.colorPrimary }} className={styles.stardardFilterSelected}>验证结果 ({statusValue.length})</div>;
    } else {
      return <span />;
    }
  };

  const ownerTagRender = (prop: any) => {
    const { ownerValue } = state;
    const { value } = prop;
    if (ownerValue && ownerValue.length && ownerValue[0] === value) {
      return <div className={styles.stardardFilterSelected}>归属 ({ownerValue.length})</div>;
    } else {
      return <span />;
    }
  };

  const { run: tagAddRun } = useRequest(apiTagsAdd, {
    manual: true,
    onSuccess: () => {
      message.success('创建标签成功');
      setState({ tagName: '' });
      tagsListRun();
    },
  });

  const onAddTagsClick = () => {
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

  return (
    <div>
      <Card hidden={state.tblSelectKeys.length}>
        <Row>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Space>
              {viewId === 'all' && usersData?.length ? (
                <TreeSelect
                  treeCheckable={true}
                  treeData={state.userTreeData}
                  dropdownStyle={{ maxHeight: 400, minWidth: 200 }}
                  placeholder={
                    <div style={{ color: '#383838', textAlign: 'center' }}>
                      归属 <CaretDownOutlined />
                    </div>
                  }
                  tagRender={ownerTagRender}
                  showArrow={false}
                  allowClear
                  className={styles.stardardFilter}
                  bordered={false}
                  onChange={onOwnerChange}
                  value={state.ownerValue}
                />
              ) : null}
              <TreeSelect
                treeDataSimpleMode
                dropdownStyle={{ maxHeight: 400, minWidth: 256 }}
                placeholder={
                  <div style={{ color: '#383838', textAlign: 'center' }}>
                    标签 <CaretDownOutlined />
                  </div>
                }
                treeData={state.tagsTreeData}
                bordered={false}
                showArrow={false}
                treeCheckable={true}
                allowClear
                tagRender={tagsTagRender}
                value={state.tagsValue}
                onChange={onTagsChange}
                treeNodeFilterProp="name"
                className={styles.stardardFilter}
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
                      <Typography.Link style={{ whiteSpace: 'nowrap' }} onClick={onAddTagsClick}>
                        <PlusOutlined /> 新增标签
                      </Typography.Link>
                      <Tooltip title="标签管理">
                        <a onClick={() => history.push('/settings/tags')}>
                          <SettingOutlined />
                        </a>
                      </Tooltip>
                    </Space>
                  </>
                )}
              />
              <Select
                mode="multiple"
                allowClear
                bordered={false}
                placeholder={
                  <div style={{ color: token.colorPrimaryText, textAlign: 'center' }}>
                    验证结果 <CaretDownOutlined />
                  </div>
                }
                value={state.statusValue}
                onChange={onVerifyStatusChange}
                className={styles.stardardFilter}
                tagRender={verifyTagRender}
                dropdownStyle={{ minWidth: 128 }}
              >
                <Select.Option value="valid">
                  <CheckCircleTwoTone twoToneColor="#52c41a" /> 有效邮箱
                </Select.Option>
                <Select.Option value="full">
                  <QuestionCircleTwoTone twoToneColor="orange" /> 全域邮箱
                </Select.Option>
                <Select.Option value="unkown">
                  <QuestionCircleTwoTone /> 未知邮箱
                </Select.Option>
                <Select.Option value="invalid">
                  <CloseCircleTwoTone twoToneColor="#eb2f96" /> 无效邮箱
                </Select.Option>
                <Select.Option value="waiting">
                  <LoadingOutlined /> 验证中 {state.verifingCount}
                </Select.Option>
                <Select.Option value="">
                  <InfoCircleOutlined /> 未验证 {state.unVerifyCount}
                </Select.Option>
              </Select>
              {state.filters.length ? (
                <div style={{ height: 32, backgroundColor: token.colorPrimaryHover }}>
                  <Button type="text" onClick={() => setState({ filterVisible: true })}>
                    <span className={styles['filter-item']} style={{ fontWeight: 'bold', color: token.colorWhite }}>
                      <FilterFilled /> 筛选 ({state.filters.length})
                    </span>
                  </Button>
                </div>
              ) : (
                <div style={{ borderBottom: '1px solid grey' }}>
                  <Button type="text" onClick={() => setState({ filterVisible: true, color: token.colorWhite })}>
                    <span className={styles['filter-item']}>
                      <FilterFilled /> 筛选 (0)
                    </span>
                  </Button>
                </div>
              )}
              {state.viewSaveVisible ? (
                <Popover
                  content={saveViewContent}
                  title={false}
                  trigger="click"
                  placement="bottomRight"
                >
                  <Button type="link">保存</Button>
                </Popover>
              ) : null}
            </Space>
          </Col>
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={12}
            xl={12}
            style={{ textAlign: 'right', paddingRight: 24 }}
          >
            <Space size="large">
              <Input.Search
                key="searchKey"
                placeholder="搜索名称、昵称、邮箱"
                enterButton
                style={{ maxWidth: 300, verticalAlign: 'middle' }}
                value={state.keyword}
                onChange={(e) => setState({ keyword: e.target.value })}
                onSearch={() => reloadContactsTableData()}
              />
              <Tooltip title="群发邮件">
                <a onClick={() => setState({ massVisible: true })} style={{ fontSize: 16 }}>
                  <MailOutlined />
                </a>
              </Tooltip>
              <Tooltip title="一键导入">
                <a
                  onClick={() => history.push('/contacts/contacts-import')}
                  style={{ fontSize: 16 }}
                >
                  <CloudUploadOutlined />
                </a>
              </Tooltip>
              <Tooltip title="新增联系人">
                <a
                  onClick={() => setState({ contactCreateVisible: true })}
                  style={{ fontSize: 16 }}
                >
                  <PlusOutlined />
                </a>
              </Tooltip>
              <Tooltip title="刷新数据">
                <a onClick={() => getContactsTableData()} style={{ fontSize: 16 }}>
                  {contactsLoading ? <LoadingOutlined /> : <SyncOutlined />}
                </a>
              </Tooltip>
              <Dropdown menu={moreMenu} trigger={['click']}>
                <a style={{ fontSize: 16 }}>
                  <EllipsisOutlined />
                </a>
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </Card>
      <div className={styles['tbl-operator']} hidden={!state.tblSelectKeys.length}>
        <Space size={24}>
          <Checkbox
            indeterminate={state.tblSelectKeys.length !== state.contactsData.length}
            checked={state.tblSelectKeys.length}
            onChange={(e) => onActionSelectChange(e.target.checked)}
          />
          <span>
            已选 <a>{state.selectTotal}</a>/{state.total} 项数据
            <span key="selectOptions" style={{ marginLeft: 12 }}>
              <Dropdown menu={moreChoiceMenu} trigger={['click']}>
                <span style={{ borderBottom: '1px solid grey' }}>
                  <a>高级选择</a>
                  <CaretDownOutlined />
                </span>
              </Dropdown>
            </span>
          </span>
          <Button
            key="sendEmail"
            onClick={() => setState({ sendMailsVisible: true })}
            size="small"
            type="primary"
          >
            邮件
          </Button>
          <Button
            key="111"
            onClick={() => setState({ multiChangeVisible: true })}
            size="small"
            type="primary"
          >
            修改
          </Button>
          <Button
            key="deleteKey"
            size="small"
            danger
            onClick={() => setState({ multiDeleteVisible: true })}
          >
            删除
          </Button>
          <Button
            key="222"
            onClick={() => setState({ multiTagsVisible: true, multiTagsAction: 'push' })}
            size="small"
            type="primary"
          >
            贴标签
          </Button>
          <Button
            key="333"
            onClick={() => setState({ multiTagsVisible: true, multiTagsAction: 'pull' })}
            size="small"
            danger
          >
            撕标签
          </Button>
          <Button
            key="assign"
            onClick={() => setState({ assignVisible: true })}
            size="small"
            type="primary"
          >
            归属
          </Button>
          <Button key="export" onClick={() => setState({ exportVisible: true })} size="small">
            导出
          </Button>
        </Space>
      </div>
      <div>
        <RcResizeObserver
          key="resize-observer"
          onResize={() => {
            const { innerHeight, innerWidth } = window;
            if (innerWidth >= 992 && innerHeight >= 500) {
              const scrollY = innerHeight - 360;
              setState({ scrollY });
            }
            if (innerWidth < 992 && innerHeight >= 600) {
              const scrollY = innerHeight - 440;
              setState({ scrollY });
            }
          }}
        >
          <Table
            rowKey="cid"
            loading={contactsLoading}
            dataSource={state.contactsData}
            columns={columnsData.map((c: any) => ({ ...c, className: "both-left" }))}
            scroll={{
              x: state.contactsData.length > 0 ? '100%' : undefined,
              y: state.contactsData.length > 0 ? state.scrollY : undefined,
            }}
            // pagination={{
            //   position: ['bottomCenter'],
            //   total: state.total,
            //   pageSize: state.pageSize,
            //   current: state.current,
            //   showTotal: (total) => renderTotal(total),
            // }}
            pagination={false}
            rowSelection={{
              selectedRowKeys: state.tblSelectKeys,
              onChange: onTblSelectKeysChange,
              columnWidth: 32,
            }}
            components={tblComponents}
            onChange={onTblChange}
            rowClassName={() => 'editable-row'}
            showSorterTooltip={false}
            size="middle"
          />
        </RcResizeObserver>
        <div style={{ width: '100%', height: 48, paddingTop: 12, textAlign: 'center' }}>
          <Pagination
            total={state.total}
            pageSize={state.pageSize}
            current={state.current}
            showSizeChanger
            onChange={onPageChange}
            showTotal={(total) => renderTotal(total)}
            showQuickJumper
          />
        </div>
      </div>
      <ContactFilter
        visible={state.filterVisible}
        onCancel={() => setState({ filterVisible: false })}
        onApplyAction={onFilterApplyAction}
        onLogicChange={onLogicChangeAction}
        filters={state.filters}
        logic={state.logic}
        viewConfig={state.viewConfig}
      />
      <ContactCreate
        visible={state.contactCreateVisible}
        onCancel={() => setState({ contactCreateVisible: false })}
        actionReload={reloadContactsTableData}
      />
      <ContactPreview
        visible={state.contactPreviewVisible}
        onCancel={() => setState({ contactPreviewVisible: false })}
        actionReload={reloadContactsTableData}
        current={state.currentRecord}
      />
      <ContactsChange
        visible={state.multiChangeVisible}
        onCancel={() => setState({ multiChangeVisible: false })}
        multiUpdate={(values: any) => onMultiUpdate(values)}
        changeRows={state.selectTotal}
        loading={updateLoading}
      />
      <ContactsDelete
        visible={state.multiDeleteVisible}
        onCancel={() => setState({ multiDeleteVisible: false })}
        rowCount={state.selectTotal}
        multiDelete={() => onMultiDelete()}
        loading={deleteLoading}
      />
      <ContactsTags
        visible={state.multiTagsVisible}
        onCancel={() => setState({ multiTagsVisible: false })}
        rowCount={state.selectTotal}
        multiTags={(values: any) => onMultiTags(values)}
        loading={tagsLoading}
        action={state.multiTagsAction}
        tagsItem={state.tagsItem}
      />
      <ContactsAssign
        visible={state.assignVisible}
        onCancel={() => setState({ assignVisible: false })}
        multiUpdate={(values: any) => onMultiUpdate(values)}
        rowCount={state.selectTotal}
        loading={updateLoading}
      />
      <ContactsExport
        visible={state.exportVisible}
        onCancel={() => setState({ exportVisible: false })}
        rowCount={state.pageSize}
        totalCount={state.total}
        onAction={(values: any) => onExportAction(values)}
        loading={exportLoading}
      />
      <FieldSetting
        visible={state.fieldSettingVisible}
        onCancel={() => setState({ fieldSettingVisible: false })}
        belongTo="contact"
        saveType="show"
        actionReload={() => onSaveFiledAction()}
      />
      <MassTaskCreate
        visible={state.sendMailsVisible}
        onCancel={() => setState({ sendMailsVisible: false })}
        initValues={{
          rowCount: state.selectTotal,
          selectAll: state.selectAll,
          selectKeys: state.tblSelectKeys,
          selectSort: state.sort,
          selectTotal: state.selectTotal,
          selectOption: state.selectOption,
          filters: state.filters,
          keyword: state.keyword,
        }}
      />
      <ViewCreate
        visible={state.viewCreateVisible}
        onCancel={() => setState({ viewCreateVisible: false })}
        actionReload={(vals: any) => {
          createReload(vals);
          setState({ viewSaveVisible: false });
        }}
        filters={state.filters}
        name=""
      />
      <MassTaskOpt
        visible={state.massVisible}
        onCancel={() => setState({ massVisible: false })}
        actionReload={() => { }}
        taskId=""
        action="create"
      />
    </div>
  );
};

export default ContactsDataTable;
