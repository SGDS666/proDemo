import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { useSetState } from 'ahooks';
import { history } from '@umijs/max';
import { useRequest } from '@umijs/max';
import {
  Tree,
  Modal,
  Input,
  Tabs,
  Space,
  List,
  Dropdown,
  Checkbox,
  Button,
  Spin,
  message,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FormOutlined,
  SearchOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserAddOutlined,
  EditOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import './Mail.less';
import styles from './Mail.less';
// import NewMail from './components/NewMail/NewMail';
import { formatTime, timeWeekFormat } from '../../utils/common';
import { menuListR, menuListC } from './mailData';
import reSend from '../../../public/icons/reSend.png';
import reSends from '../../../public/icons/reSends.png';
import {
  apiAccountsItems,
  apiAccountsList,
  apiMailsList,
  apiMailsOpen,
  apiMailsDelete,
  apiMailsDrop,
  apimailsunseen,
  apimailsnotjunk,
} from '@/services/mails';
import MailAccountCreate from '@/components/Mails/AccountCreate';
import MailOperation from '@/components/Mails/MailOperation';
const axios = require('axios');
const emlformat = require('@/libs/eml-format');
// const translate = require('@/libs/google-translate');
// import html from './translate.js';

// const { TreeNode } = Tree;
const { TabPane } = Tabs;
const { Search } = Input;

interface dataList {
  id?: number;
  fromName?: string;
  subject?: string;
  text?: string;
  [key: string]: any;
}

interface Istate {
  dataList: dataList[];
  [key: string]: any;
}
const Welcome: React.FC = () => {
  // 初始化操作的状态数据
  const [state, setState] = useSetState<Istate>({
    deleteId: [],
    mailConlist: {},
    mailConId: '',
    SelectedKeys: '1',
    menuVisible: false,
    menuVisibleId: '',
    showDetail: false,
    showSearch: false,
    isOpen: true,
    bgArr: {
      bgColor: 0,
      id: Number,
    },
    modal2Visible: false,
    newList: [],
    keyS: '1',
    value: '',
    show: 0,
    newVisible1: false,
    lists: [],
    listLeft: [],
    dataList: [],
    dataList1: [],
    total: 0,
    total1: 0,
    mailListParam: {
      current: 1,
      pageSize: 15,
      filter: {
        keyword: '',
        boxName: '',
        maid: '',
        parent: '',
      },
      sort: {},
    },
    editShow: false,
    action: '',
    replyVisible: false, // 回复邮件
    replyAllVisible: false, // 回复全部
    forwardVisible: false, // 转发邮件
    editVisible: false, // 编辑邮件
    newVisible: false, // 新邮件
    sendReplyVisible: false, // 已发送回复
    sendReplyAllVisible: false, // 已发送回复全部
    currentMail: {}, // 当前邮件信息
    createVisible: false,
    maid: '',
    _id: '',
  });

  const [emailContent, setEmailContent] = useState('');
  let i = 0;
  function roundA(data: any) {
    return data.map((item: any) => ({
      ...item,
      title: item.name,
      key: i++,
      children: item.children ? roundA(item.children) : null,
    }));
  }
  const { run: mailListRun, loading: saveLoading } = useRequest(apiMailsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const arr = data.list.map((item: any, index: number) => ({
        ...item,
        id: index,
      }));
      const arr1 = arr.filter((item: any) => item.status === 0);
      setState({ dataList: arr, total: data.total, total1: arr.length, dataList1: arr1 });
    },
  });
  const { run: markunseenRun } = useRequest(apimailsunseen, {
    manual: true,
    onSuccess: () => {
      message.success('已标记为未读');
    },
  });
  const { run: notjunkRun } = useRequest(apimailsnotjunk, {
    manual: true,
    onSuccess: () => {
      message.success('标记成功');
    },
  });
  const { refresh: accRefresh } = useRequest(apiAccountsItems);
  const { run: mailLeftRun } = useRequest(apiAccountsList, {
    manual: true,
    onSuccess: (result:any) => {
      if (result.length > 0) {
        const aa = roundA(result);
        // console.log(aa);
        const param = {
          current: 1,
          pageSize: 15,
          filter: {
            keyword: '',
            boxName: result[0].boxName,
            maid: result[0].maid,
            parent: result[0].parent,
          },
          sort: {},
        };
        setState({
          maid: result[0].maid,
          listLeft: aa,
          value: result[0].boxName,
          mailListParam: param,
        });
        mailListRun({
          ...param,
        });
      }
    },
  });
  useEffect(() => {
    mailLeftRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { run: mailConRun } = useRequest(apiMailsOpen, {
    manual: true,
    onSuccess: async (data: any) => {
      if (!data.html) {
        const response = await axios.get(data.downloadUrl);
        if (response) {
          const datas = response.data;
          // console.log(datas);
          await emlformat.read(datas, function (error: any, data2: any) {
            if (error) return console.log(error);
            setEmailContent(data2.html);
            // console.log(data2.html);
            setState({
              mailConlist: data,
              currentMail: { ...state.currentMail, html: data2.html },
            });
          });
        }
      } else {
        setEmailContent(data.html);
        setState({
          mailConlist: data,
          currentMail: { ...state.currentMail, html: data.html },
        });
      }
    },
  });
  const { run: mailDeleteRun } = useRequest(apiMailsDelete, {
    manual: true,
    onSuccess: () => {
      setState({ deleteId: [] });
      mailListRun({
        ...state.mailListParam,
      });
    },
  });
  const changeItem = (val: any) => {
    console.log(val);
    if (val.key !== state.keys) {
      setState({ mailConlist: {}, deleteId: [] });
    }
    const param = {
      current: 1,
      pageSize: 15,
      filter: {
        keyword: '',
        boxName: val.boxName,
        maid: val.maid,
        parent: val.parent,
      },
      sort: {},
    };
    setState({
      editShow: false,
      maid: val.maid,
      keyS: val.key,
      value: val.name,
      mailListParam: param,
      bgArr: { bgColor: 0, id: '' },
    });
    if (val.name === '收件箱') {
      setState({
        show: 1,
      });
    } else {
      setState({ show: 2 });
    }
    if (val.name === '草稿箱') {
      setState({ editShow: true });
    }
    mailListRun({
      ...param,
    });
  };
  // const renderTreeNodes = (data: any) => {
  //   const nodeArr = data.map((item: any) => {
  //     item.title = (
  //       <div onClick={() => changeItem(item)} className={styles.treeSty}>
  //         <span>{item.name}</span>
  //         {item.name === '收件箱' ? (
  //           <a>{Number(item.unseen) > 0 ? item.unseen : ''}</a>
  //         ) : item.name === '草稿箱' ? (
  //           <a>{Number(item.total) > 0 ? item.total : ''}</a>
  //         ) : null}
  //       </div>
  //     );

  //     if (item.children) {
  //       return (
  //         <TreeNode
  //           title={item.title}
  //           key={item.key.toString()}
  //           style={state.keyS === item.key ? { background: '#bae7ff' } : { background: 'none' }}
  //         >
  //           {renderTreeNodes(item.children)}
  //         </TreeNode>
  //       );
  //     }
  //     return (
  //       <TreeNode
  //         title={item.title}
  //         key={item.key.toString()}
  //         style={state.keyS === item.key ? { background: '#bae7ff' } : { background: 'none' }}
  //       />
  //     );
  //   });
  //   return nodeArr;
  // };
  const setModal2Visible = (modal2Visible: boolean) => {
    setState({ modal2Visible });
  };
  const changeTab = () => {
    setState({ bgArr: { bgColor: 0, id: '' }, mailConlist: {} });
  };
  const changeBgColor = (item: any) => {
    setState({ mailConlist: [] });
    mailConRun({ id: item._id });
    setState({ bgArr: { bgColor: 1, id: item.id }, currentMail: item, _id: item._id });
  };
  const conTitle = () => {
    return (
      <>
        {!state.editShow ? (
          <Space size="middle" className={styles.focusSty}>
            <div onClick={() => setState({ replyVisible: true, action: 'reply' })}>
              <img src={reSend} />
              回复
            </div>
            <div onClick={() => setState({ replyVisible: true, action: 'replyAll' })}>
              <img src={reSend} />
              全部回复
            </div>
            <div onClick={() => setState({ replyVisible: true, action: 'forward' })}>
              <img src={reSends} /> 转发
            </div>
          </Space>
        ) : (
          <Space size="large" className={styles.focusSty}>
            <div onClick={() => setState({ replyVisible: true, action: 'edit' })}>
              <EditOutlined /> 再次编辑
            </div>
          </Space>
        )}
      </>
    );
  };
  const deleteSure = async () => {
    await apiMailsDrop({ ids: [state._id] });
    setState({ bgArr: { bgColor: 0, id: '' }, mailConlist: {}, _id: '' });
    mailListRun({
      ...state.mailListParam,
    });
  };
  const deleteIcon = () => {
    return (
      <span title="彻底删除" onClick={deleteSure}>
        <DeleteOutlined style={{ fontSize: '18px' }} />
      </span>
    );
  };
  // 弹出式富文本
  const onFinishNewMail = () => {
    console.log('弹出富文本');
  };
  const isOpen = () => {
    setState({ isOpen: !state.isOpen });
  };
  const searchMail = () => {
    setState({ showSearch: !state.showSearch });
  };
  const goBack = async () => {
    setState({ showSearch: !state.showSearch });
    state.mailListParam.filter.keyword = '';
    await mailListRun({
      ...state.mailListParam,
    });
  };
  const showDetail = () => {
    setState({ showDetail: !state.showDetail });
  };
  const goAcount = () => {
    history.push('/mails/accounts');
  };

  const mousechoseR = async (val: any) => {
    const keys = val.key;
    if (keys === '2') {
      setState({ replyVisible: true, action: 'reply' });
    } else if (keys === '3') {
      setState({ replyVisible: true, action: 'replyAll' });
    } else if (keys === '4') {
      setState({ replyVisible: true, action: 'forward' });
    } else if (keys === '5') {
      if (state._id) {
        await markunseenRun({ id: state._id });
      }
    } else if (keys === '7') {
      if (state._id) {
        await notjunkRun({ id: state._id });
      }
    } else if (keys === '8') {
      await apiMailsDrop({ ids: [state._id] });
      setState({ bgArr: { bgColor: 0, id: '' }, mailConlist: {}, _id: '' });
      mailListRun({
        ...state.mailListParam,
      });
    }
  };
  // const menu2 = (
  //   <Menu onClick={mousechoseR}>
  //     {menuListC.map((item) => (
  //       <Menu.Item key={item.key}>
  //         <span>{item.value}</span>
  //       </Menu.Item>
  //     ))}
  //   </Menu>
  // );
  // const menu1 = (
  //   <Menu onClick={mousechoseR}>
  //     {menuListR.map((item) => (
  //       <Menu.Item key={item.key}>
  //         <span>{item.value}</span>
  //       </Menu.Item>
  //     ))}
  //   </Menu>
  // );
  const deleteItem = async () => {
    if (state.deleteId.length > 0) {
      if (state.value === '已删除') {
        await apiMailsDrop({ ids: state.deleteId });
        setState({ bgArr: { bgColor: 0, id: '' }, mailConlist: {}, _id: '', deleteId: [] });
        mailListRun({
          ...state.mailListParam,
        });
      } else {
        mailDeleteRun({ ids: state.deleteId });
      }
    } else {
      message.error('请勾选要删除的邮件');
    }
  };
  const choseItem = (e: any) => {
    let ids = state.deleteId;
    if (e.target.checked && !ids.includes(e.target.id)) {
      ids.push(e.target.id);
      setState({ deleteId: ids });
    } else if (e.target.checked === false) {
      ids = ids.filter((it: string) => it !== e.target.id);
      setState({ deleteId: ids });
    }
  };
  const onSearch = async (e: any) => {
    state.mailListParam.filter.keyword = e;
    await mailListRun({
      ...state.mailListParam,
    });
  };
  const gotranslate = async () => {};
  const tabCon = (list: dataList[], total: number) => (
    <div className={styles.mailList}>
      <List
        style={{ position: 'static' }}
        itemLayout="horizontal"
        pagination={
          list.length > 0
            ? {
                onChange: (page) => {
                  console.log(page);
                  state.mailListParam.current = page;
                  mailListRun({ ...state.mailListParam, current: page });
                  setState({ bgArr: { bgColor: 0, id: '' }, mailConlist: {} });
                },
                showSizeChanger: false,
                pageSize: 15,
                total: total,
                current: state.mailListParam.current,
              }
            : false
        }
        dataSource={list}
        renderItem={(item) => (
          <Dropdown
            overlayStyle={{ width: '200px' }}
            menu={
              {
                onClick:mousechoseR,
                items:menuListR.map(item=>({key:item.key,label:item.value}))}
            }
           
            key={item._id}
            disabled={state.bgArr.bgColor === 1 ? false : true}
            trigger={['contextMenu']}
          >
            <List.Item
              onClick={() => changeBgColor(item)}
              onContextMenu={() => {}}
              className={
                state.bgArr.bgColor === 1 && item.id === state.bgArr.id
                  ? styles.active
                  : styles.listItem
              }
            >
              <List.Item.Meta
                avatar={
                  <span className={styles.avatarSty}>
                    {item.fromName ? item.fromName?.substring(0, 2) : '未'}
                  </span>
                }
                title={
                  <div style={item.status === 1 ? { color: 'gray' } : { color: 'black' }}>
                    <div className={styles.mailTitle}>
                      <span>
                        <i className={item.status === 0 ? styles.tips : ''} />{' '}
                        {item.fromName || '未填写收信人'}
                      </span>

                      <label>
                        {formatTime(item.timestamp)}
                        <Checkbox
                          id={item._id}
                          style={{ marginLeft: '10px' }}
                          onChange={choseItem}
                        />
                      </label>
                    </div>
                    <div className={styles.singleEllipse}>{item.subject}</div>
                  </div>
                }
                description={<div className={styles.singleEllipse}>{item.text}</div>}
              />
            </List.Item>
          </Dropdown>
        )}
      />
    </div>
  );
  const { mailConlist } = state;
  return (
    <PageContainer
      className={styles.pages}
      header={{
        title: '',
        breadcrumb: {},
      }}
    >
      <div>
        <ProCard split="vertical">
          {state.isOpen ? (
            <ProCard colSpan="220px">
              {state.listLeft.length > 0 ? (
                <Tree
                  defaultExpandedKeys={[1]}
                  defaultSelectedKeys={[1]}
                  height={800}
                  treeData={state.listLeft}
                  titleRender={(node: any) => {
                    return (
                      <div
                        onClick={() => changeItem(node)}
                        className={styles.treeSty}
                        style={
                          state.keyS === node.key
                            ? { background: '#bae7ff' }
                            : { background: 'none' }
                        }
                      >
                        <span>{node.title}</span>
                        {node.name === '收件箱' ? (
                          <a style={{ marginRight: '15px' }} title={node.unseen}>
                            {Number(node.unseen) > 0 ? node.unseen : ''}
                          </a>
                        ) : node.name === '草稿箱' ? (
                          <a style={{ marginRight: '15px' }} title={node.total}>
                            {Number(node.total) > 0 ? node.total : ''}
                          </a>
                        ) : null}
                      </div>
                    );
                  }}
                >
                  {/* {renderTreeNodes(state.listLeft)} */}
                </Tree>
              ) : null}

              <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                <Button
                  type="primary"
                  shape="round"
                  ghost
                  onClick={() => setState({ createVisible: true })}
                >
                  <UserAddOutlined /> 添加邮箱账户
                </Button>

                <Button type="primary" shape="round" ghost onClick={goAcount}>
                  <SolutionOutlined /> 邮箱账号管理
                </Button>
              </Space>
            </ProCard>
          ) : null}

          <ProCard colSpan="400px" style={{ position: 'relative' }}>
            {state.show === 1 && state.showSearch === false ? (
              <div>
                <div className={styles.navTop}>
                  <div>
                    <i onClick={isOpen}>
                      {state.isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                    </i>
                    <span>{state.value}</span>
                  </div>
                  <div>
                    <FormOutlined title="写邮件" onClick={() => setState({ newVisible: true })} />
                    <DeleteOutlined
                      className={styles.searchfocus}
                      title="删除"
                      onClick={deleteItem}
                    />
                    <span className={styles.searchfocus} title="搜索" onClick={searchMail}>
                      <SearchOutlined />
                    </span>
                  </div>
                </div>

                <Tabs defaultActiveKey="1" onChange={changeTab}>
                  <TabPane tab="全部" key="1">
                    {saveLoading ? <Spin /> : tabCon(state.dataList, state.total)}
                  </TabPane>
                  <TabPane tab="未读" key="2">
                    {tabCon(state.dataList1, state.total1)}
                  </TabPane>
                </Tabs>
              </div>
            ) : state.showSearch ? (
              <div>
                <div className={styles.searchSty}>
                  <div onClick={goBack} className={styles.arrow}>
                    <ArrowLeftOutlined />
                  </div>
                  <div className={styles.inputSty}>
                    <Search
                      placeholder={'在" ' + state.value + ' "中搜索'}
                      allowClear
                      onSearch={onSearch}
                    />
                  </div>
                </div>
                {saveLoading ? <Spin /> : tabCon(state.dataList, state.total)}
              </div>
            ) : (
              <div>
                <div className={[styles.navTop, styles.border].join(' ')}>
                  <div>
                    <i onClick={isOpen}>
                      {state.isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                    </i>
                    <span>{state.value}</span>
                  </div>
                  <div>
                    <FormOutlined title="写邮件" onClick={() => setState({ newVisible: true })} />
                    <DeleteOutlined
                      className={styles.searchfocus}
                      title="删除"
                      onClick={deleteItem}
                    />
                    <span className={styles.searchfocus} title="搜索" onClick={searchMail}>
                      <SearchOutlined />
                    </span>
                  </div>
                </div>
                {saveLoading ? <Spin /> : tabCon(state.dataList, state.total)}
              </div>
            )}
          </ProCard>
          <ProCard
            className="proPadding"
            title={state.mailConlist._id ? conTitle() : ''}
            extra={state.mailConlist._id ? deleteIcon() : ''}
          >
            {state.mailConlist._id ? (
              <div>
                <h2>{mailConlist.subject}</h2>
                <div className={styles.mailCon}>
                  <div>
                    <div className={styles.box}>
                      <div className={styles.conTop}>
                        <h3>{mailConlist.from}</h3>
                        <Space className={styles.commonFlex}>
                          <img
                            src={reSend}
                            title="回复"
                            onClick={() => setState({ replyVisible: true, action: 'reply' })}
                          />
                          <img
                            src={reSends}
                            title="转发"
                            onClick={() => setState({ replyVisible: true, action: 'forward' })}
                          />
                          <Dropdown 
                          menu={
                            {
                              onClick:mousechoseR,
                              items:menuListC.map(item=>({key:item.key,label:item.value}))
                            }
                          }
     
                          trigger={['click']}>
                            <span style={{ cursor: 'pointer' }}>...</span>
                          </Dropdown>
                        </Space>
                      </div>
                      <div className={styles.commonFlex}>
                        <span>发给 {mailConlist.to} </span>
                        <span>
                          {timeWeekFormat(mailConlist.timestamp)}
                          <a onClick={showDetail}>{state.showDetail ? '隐藏' : '详情'}</a>
                        </span>
                      </div>
                      {state.showDetail ? (
                        <Space className={styles.borderSty} direction="vertical" size="middle">
                          <span>发件人 &nbsp;&nbsp; {mailConlist.from}</span>
                          <span>收件人 &nbsp;&nbsp; {mailConlist.to}</span>
                          <span>时间 &nbsp;&nbsp; {timeWeekFormat(mailConlist.timestamp)}</span>
                          <span>大小 &nbsp;&nbsp; {mailConlist.size} K</span>
                        </Space>
                      ) : null}
                    </div>
                  </div>
                  <div className={[styles.commonFlex, styles.bgSty].join(' ')}>
                    <Space>
                      <span className={styles.circle}>A</span>
                      <span>邮件可翻译为简体中文</span>
                    </Space>
                    <Space>
                      <a onClick={gotranslate}>立即翻译</a> <span className={styles.fontS}>x</span>
                    </Space>
                  </div>
                  <div>
                    {/* <iframe srcDoc={html(emailContent)} className={styles.iframe} /> */}
                    <div
                      className={styles.iframe}
                      dangerouslySetInnerHTML={{ __html: emailContent ? emailContent : '暂无邮件' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <h3>没有邮件</h3>
            )}
          </ProCard>
        </ProCard>
        <Modal
          title="新建文件夹"
          centered
          width={400}
          open={state.modal2Visible}
          onOk={() => setModal2Visible(false)}
          onCancel={() => setModal2Visible(false)}
          okText="保存"
          cancelText="取消"
        >
          <Input placeholder="输入文件夹名称" autoFocus />
        </Modal>
        <MailOperation
          visible={state.replyVisible}
          onCancel={() => setState({ replyVisible: false })}
          current={state.currentMail}
          action={state.action}
          actionReload={onFinishNewMail}
        />
        <MailOperation
          visible={state.replyAllVisible}
          onCancel={() => setState({ replyAllVisible: false })}
          current={state.currentMail}
          action="replyAll"
          actionReload={onFinishNewMail}
        />
        <MailOperation
          visible={state.sendReplyVisible}
          onCancel={() => setState({ sendReplyVisible: false })}
          current={state.currentMail}
          action="sendReply"
          actionReload={onFinishNewMail}
        />
        <MailOperation
          visible={state.sendReplyAllVisible}
          onCancel={() => setState({ sendReplyAllVisible: false })}
          current={state.currentMail}
          action="sendReplyAll"
          actionReload={onFinishNewMail}
        />
        <MailOperation
          visible={state.forwardVisible}
          onCancel={() => setState({ forwardVisible: false })}
          current={state.currentMail}
          action="forward"
          actionReload={onFinishNewMail}
        />
        <MailOperation
          visible={state.editVisible}
          onCancel={() => setState({ editVisible: false })}
          current={state.currentMail}
          action="edit"
          actionReload={onFinishNewMail}
        />
        <MailOperation
          visible={state.newVisible}
          onCancel={() => setState({ newVisible: false })}
          current={{ maid: state.maid }}
          action="new"
          actionReload={onFinishNewMail}
        />
        <MailAccountCreate
          visible={state.createVisible}
          onCancel={() => setState({ createVisible: false })}
          actionReload={() => accRefresh()}
        />
      </div>
    </PageContainer>
  );
};

export default Welcome;
