import {
  FolderOutlined,
  MailOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  PaperClipOutlined,
  CheckOutlined,
  RollbackOutlined,
  DeleteOutlined,
  EditOutlined,
  EnterOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  FormOutlined,
  TagTwoTone,
  SaveTwoTone,
  UserAddOutlined,
  SolutionOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Menu,
  Badge,
  Card,
  Space,
  Checkbox,
  Popconfirm,
  Tooltip,
  Tag,
  Popover,
  Table,
  message,
  Input,
  Timeline,
  Tree,
  Spin,
  Alert,
  TreeSelect,
  Select,
  Modal,
} from 'antd';
import React, { useRef, useEffect } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { ProList } from '@ant-design/pro-components';
import {
  apiAccountsList,
  apiMailsList,
  apiMailsOpen,
  apiMailOwnerSet,
  apiMailDelete,
  apiMailsDelete,
  apiMailDrop,
  apiMailsDrop,
  apiMailTrackInfo,
  apiMailCancelTimer,
  apiMailHistory,
  apiMailSendStatus,
} from '@/services/mails';
import { apiTextSave, apiTagsList, apiTagsSet } from '@/services/contacts';
import { useSetState } from 'ahooks';
import moment from 'moment';
import {
  exFileSize,
  exMailBoxname,
  getEmailAddresName,
  urlContact,
  deviceInfo,
  getTextEmails,
} from '@/utils/common';
import MailOperation from '@/components/Mails/MailOperation';
// import MailAccountOperation from '@/components/MailAccountOperation';
import styles from './styles.less';
import fatherStyles from '@/pages/index.less';
import './styles.less';
import _ from 'lodash';
import { useRequest, history } from '@umijs/max';
import ContactsTags from '../Contacts/components/ContactsTags';
import RightContainer from '@/components/Global/RightContainer';
import MailAccountCreate from '@/components/Mails/AccountCreate';
import { apiSubordinateUsers } from '@/services/enterprise';
// import locale from 'antd/es/date-picker/locale/zh_CN';
moment.locale('zh-CN');

const axios = require('axios');

const emlformat = require('@/libs/eml-format');
// const { simpleParser } = require('@/lib/mailparser');

// const { Item, SubMenu } = Menu;
const DEFAULT_VALUES = {
  mailList: [],
  subject: '',
  html: '',
  rtime: '',
  current: 0,
  unopen: 0,
  hasMore: true,
  selectId: '',
};

const renderTime = (t: number) => {
  if (!t) {
    return null;
  }
  return moment(t).format('YYYY-MM-DD HH:mm:ss');
};

const renderDate = (t: number) => {
  if (!t) {
    return null;
  }
  const now = new Date().getTime();
  if (now - t < 3600 * 1000) {
    return moment(t).fromNow();
  }
  const todayTimeBegin = new Date(new Date().toLocaleDateString()).getTime();
  if (t > todayTimeBegin) {
    return moment(t).format('HH:mm');
  }

  return moment(t).format('M???DD???');
};

const renderAct = (act: string) => {
  if (!act) {
    return null;
  }
  if (act === 'read') {
    return <Tag color="#87d068">??????</Tag>;
  }
  if (act === 'click') {
    return <Tag color="#2db7f5">??????</Tag>;
  }
  if (act === 'download') {
    return <Tag color="#108ee9">??????</Tag>;
  }
  if (act === 'reply') {
    return <Tag color="#3b5999">??????</Tag>;
  }
  return act;
};

const renderAddress = (record: any) => {
  const { country, regionName, city, county, ip } = record;
  let msg = '';
  if (regionName) {
    msg += regionName;
  }
  if (city) {
    msg += city;
  }
  if (county) {
    msg += county;
  }

  if (country === '??????') {
    return (
      <Tooltip title={`${msg}(${ip})`}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {msg}({ip})
        </div>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={`${country}${msg}(${ip})`}>
      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {country}
        {msg}({ip})
      </div>
    </Tooltip>
  );
};

const renderDeviceInfo = (record: any) => {
  const { device } = record;
  return deviceInfo(device);
};

const trackColumns = [
  {
    title: '??????',
    dataIndex: 'time',
    render: (text: number) => renderTime(text),
    width: 145,
  },
  {
    title: '??????',
    dataIndex: 'act',
    render: (text: string) => renderAct(text),
    width: 60,
  },
  {
    title: '????????????',
    dataIndex: 'country',
    ellipsis: true,
    render: (__: any, record: any) => renderAddress(record),
    width: 180,
  },
  {
    title: '?????????',
    dataIndex: 'isp',
    width: 75,
    ellipsis: true,
  },
  {
    title: '??????',
    dataIndex: 'device',
    render: (__: any, record: any) => renderDeviceInfo(record),
    width: 120,
  },
  {
    title: '??????/??????/??????',
    dataIndex: 'other',
    width: 120,
    ellipsis: true,
  },
];

const MailsList: React.FC = () => {
  const actionRef: any = useRef<ActionType>();
  const [state, setState] = useSetState<Record<string, any>>({
    maid: 'system', // ??????
    parent: '', // ??????
    boxName: 'INBOX', // ????????????
    boxDisName: '', // ??????????????????
    accList: [],
    loading: false,
    hasMore: true,
    mailList: [],
    innerHeight: 600,
    subject: '',
    html: '',
    rtime: '',
    timestamp: 0,
    timeStart: 0,
    from: '',
    fromTags: null,
    to: '',
    cc: '',
    bcc: '',
    replyTo: '',
    current: 1,
    total: 0,
    unseen: 0,
    unopen: 0,
    readStatus: false, // ?????????????????????
    selectId: '', // ????????????ID
    selectedKeys: ['system||INBOX'],
    openKeys: ['system|/|system'],
    rootSubmenuKeys: [],
    attachments: [],
    tblSelectKeys: [],
    tblSelectAll: false,
    editStatus: false, // ????????????
    mailUrl: '',
    imgUrl: '',
    params: {},
    replyVisible: false, // ????????????
    replyAllVisible: false, // ????????????
    forwardVisible: false, // ????????????
    editVisible: false, // ????????????
    newVisible: false, // ?????????
    sendReplyVisible: false, // ???????????????
    sendReplyAllVisible: false, // ?????????????????????
    currentMail: {}, // ??????????????????
    iframeHeight: '600px',
    keyword: '',
    mailHistory: [],
    expandedKeys: [],
    checkedKeys: ['system||INBOX'],
    searchValue: '',
    autoExpandParent: true,
    addAccountVisible: false,
    loadingStatus: false,
    setTagsVisible: false,
    setTagsText: '',
    changeType: 'add',
    tagsColors: {},
    tagsItems: [],
    webhookMsg: {},
    ssid: '',
    owners: [],
    ownerValues: [],
    userid: null,
  });

  const { run: ownerSetRun } = useRequest(apiMailOwnerSet, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { userid } = data;
      setState({ userid });
    },
  });

  const { data: usersData } = useRequest(apiSubordinateUsers, {
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

  const { run: sendStatusRun } = useRequest(apiMailSendStatus, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ webhookMsg: data });
    },
  });

  const actionReload = () => {
    if (actionRef.current) {
      actionRef?.current?.reload();
      actionRef?.current?.reset();
    }
  };

  const onTreeSelect = (selectedKeys: any) => {
    setState({ ...DEFAULT_VALUES, readStatus: false, keyword: '' });
    if (selectedKeys && selectedKeys.length) {
      const key = selectedKeys[0];
      const [maid, parent, boxName] = key.split('|');
      const boxDisName = exMailBoxname(boxName);
      setState({
        maid,
        parent,
        boxName,
        boxDisName,
        selectedKeys: [key],
        params: {},
        tblSelectKeys: [],
      });
      actionReload();
    }
  };

  const { run: accountsRun } = useRequest(apiAccountsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const rootKeys = data.map((item: any) => {
        const { maid, parent, boxName } = item;
        const key = `${maid}|${parent}|${boxName}`;
        return key;
      });
      setState({ accList: data, rootSubmenuKeys: rootKeys });
    },
  });

  // ????????????????????????
  const getAccList = async () => {
    await accountsRun();
    const { expandedKeys } = state;
    if (!expandedKeys || !expandedKeys.length) {
      setState({ expandedKeys: ['system|/|system'] });
    }
  };

  // const renderMenuItem = (item: any) => {
  //   const { maid, name, parent, boxName, children, unseen, total } = item;
  //   const key = `${maid}|${parent}|${boxName}`;
  //   let icon = <FolderOutlined />;
  //   if (parent === '/') {
  //     icon = <MailOutlined />;
  //   }
  //   if (children && children.length) {
  //     const childs = children.map((it: any) => {
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //       return renderMenuItem(it);
  //     });
  //     if (unseen) {
  //       return (
  //         <SubMenu key={key} icon={icon} title={`${name} (${unseen})`}>
  //           {childs}
  //         </SubMenu>
  //       );
  //     }
  //     return (
  //       <SubMenu key={key} icon={icon} title={name}>
  //         {childs}
  //       </SubMenu>
  //     );
  //   }
  //   if (name && name.indexOf('??????') === 0 && total) {
  //     return (
  //       <Item key={key} icon={icon}>
  //         {name} [{total}]
  //       </Item>
  //     );
  //   }
  //   if (unseen) {
  //     return (
  //       <Item key={key} icon={icon}>
  //         {name} ({unseen})
  //       </Item>
  //     );
  //   }
  //   return (
  //     <Item key={key} icon={icon}>
  //       {name}
  //     </Item>
  //   );
  // };

  const rednerTreeNode = (item: any) => {
    const { maid, name, parent, boxName, children, unseen, total } = item;
    const key = `${maid}|${parent}|${boxName}`;
    let icon = <FolderOutlined />;
    if (parent === '/') {
      icon = <MailOutlined />;
    }
    if (children && children.length) {
      const childs = children.map((it: any) => {
        return rednerTreeNode(it);
      });
      if (unseen) {
        return { title: `${name} (${unseen})`, key, icon, children: childs };
      }
      return { title: name, key, icon, children: childs };
    }
    if (name && name.indexOf('??????') === 0 && total) {
      return { title: `${name} (${total})`, key, icon };
    }
    if (unseen) {
      return { title: `${name} (${unseen})`, key, icon };
    }
    return { title: name, key, icon };
  };

  const renderLeftTree = () => {
    const { accList } = state;
    return accList.map((item: any) => {
      const { name, maid, parent, boxName, status } = item;
      const key = `${maid}|${parent}|${boxName}`;
      if (status === 'success') {
        return rednerTreeNode(item);
      }
      if (status === 'failed') {
        return { title: name, key, icon: <CloseCircleOutlined /> };
      }
      return { title: name, key, icon: <QuestionCircleOutlined /> };
    });
  };

  const { run: trackInfoRun, loading: trackLoading } = useRequest(apiMailTrackInfo, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ mailTrackInfo: data });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const onIpInfoVisibleChange = async (visible: boolean, index: number) => {
    if (visible) {
      const { mailList } = state;
      const record = mailList[index];
      const { ssid } = record;
      trackInfoRun({ sid: ssid });
    }
  };

  const ipInfoContent = (item: any) => {
    const { track } = item;
    if (!track) {
      return <div>???????????????</div>;
    }
    return (
      <Table
        style={{ maxWidth: 720 }}
        rowKey="_id"
        columns={trackColumns}
        dataSource={state.mailTrackInfo}
        size="small"
        pagination={false}
        loading={trackLoading}
      />
    );
  };

  const { run: historyRun } = useRequest(apiMailHistory, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ mailHistory: data });
    },
  });

  const onMailHistoryVisibleChange = async (visible: boolean) => {
    if (visible) {
      const { currentMail, boxDisName } = state;
      if (currentMail) {
        const { from, to } = currentMail;
        const reg = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        // const email = address.match(regex2)[0];
        let email;
        if (boxDisName === '?????????' || boxDisName === '???????????????') {
          email = to.match(reg)[0];
        } else {
          email = from.match(reg)[0];
        }
        historyRun({ email });
      }
    } else {
      setState({ mailHistory: [] });
    }
  };

  const mailHistoryDisplay = () => {
    const { mailHistory } = state;
    return (
      <div style={{ width: 800, maxHeight: state.innerHeight - 32, overflow: 'auto' }}>
        <Timeline mode="right" style={{ paddingTop: 12 }}>
          {mailHistory.map((item: any) => {
            const { subject, timestamp, _id, boxName } = item;
            const boxDisName = exMailBoxname(boxName);
            let color = 'blue';
            let act = '??????';
            if (boxDisName === '?????????' || boxDisName === '???????????????') {
              color = 'green';
              act = '??????';
            }
            return (
              <Timeline.Item
                color={color}
                label={`${moment(timestamp).format('YYYY???MM???DD??? HH:mm:ss')} (${act})`}
                key={_id}
              >
                {subject}
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    );
  };

  const renderTrackStatus = (item: any, index: number) => {
    const { readed, clicked, downed, replied, boxName, track, from, to, status } = item;
    const boxDisName = exMailBoxname(boxName);
    if (boxDisName && boxDisName.indexOf('??????') !== 0 && boxDisName.indexOf('??????') !== 0) {
      return (
        <div
          style={{
            maxWidth: '300px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {getEmailAddresName(from)}
        </div>
      );
    }
    return (
      <div
        style={{
          maxWidth: '300px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {getEmailAddresName(to)}
        {status === 4 ? (
          <Tag color="error">?????????</Tag>
        ) : (
          <Popover
            content={ipInfoContent(item)}
            title={false}
            onOpenChange={(value) => onIpInfoVisibleChange(value, index)}
          >
            <Space style={{ marginLeft: 4 }}>
              {status === 3 && track && !readed ? <Tag color="default">?????????</Tag> : null}
              {status === 4 ? <Tag color="error">?????????</Tag> : null}
              {replied ? (
                <Tag color="success">
                  ??????
                  <Badge
                    size="small"
                    count={replied}
                    style={{ marginBottom: 3, backgroundColor: '#52c41a' }}
                  />
                </Tag>
              ) : null}
              {downed ? (
                <Tag color="success">
                  ??????
                  <Badge
                    size="small"
                    count={downed}
                    style={{ marginBottom: 3, backgroundColor: '#52c41a' }}
                  />
                </Tag>
              ) : null}
              {clicked ? (
                <Tag color="success">
                  ??????
                  <Badge
                    size="small"
                    count={clicked}
                    style={{ marginBottom: 3, backgroundColor: '#52c41a' }}
                  />
                </Tag>
              ) : null}
              {readed ? (
                <Tag color="success">
                  ??????
                  <Badge
                    size="small"
                    count={readed}
                    style={{ marginBottom: 3, backgroundColor: '#52c41a' }}
                  />
                </Tag>
              ) : null}
            </Space>
          </Popover>
        )}
      </div>
    );
  };

  const exDataSource = (dataList: any) => {
    const data = dataList.map((item: any, index: number) => {
      const {
        _id,
        status,
        attach,
        html,
        from,
        to,
        cc,
        bcc,
        timestamp,
        attachments,
        replyTo,
        timeStart,
        maid,
        boxName,
        attIds,
      } = item;
      let { subject, text } = item;
      subject = subject || null;
      text = text || <span>&nbsp;</span>;
      const description = status ? (
        <div>
          <div
            style={{
              width: '380px',
              fontWeight: 'bold',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {subject}
          </div>
          <div
            style={{
              width: '380px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {text}
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              width: '380px',
              color: '#2e3133',
              fontWeight: 'bold',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {subject}
          </div>
          <div
            style={{
              width: '380px',
              color: '#2e3133',
              fontWeight: 'bold',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {text}
          </div>
        </div>
      );
      const title = status ? (
        renderTrackStatus(item, index)
      ) : (
        <div
          style={{
            maxWidth: '200px',
            fontWeight: 'bold',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {getEmailAddresName(from)}
        </div>
      );
      const type = 'inline';
      const subTitle = attach || attIds?.length ? <PaperClipOutlined /> : null;
      return {
        id: _id,
        maid,
        title,
        subTitle,
        description,
        type,
        status,
        html,
        subject,
        replyTo,
        from,
        to,
        cc,
        bcc,
        timestamp,
        timeStart,
        attachments,
        boxName,
        extra: (
          <div
            style={{
              minWidth: 60,
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ width: '80px' }}>
              <div>{renderDate(item.timestamp)}</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
            </div>
          </div>
        ),
      };
    });
    return data;
  };

  const { run: mailsRun } = useRequest(apiMailsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { list, total, unseen, storeUrl, trackUrl } = data;
      setState({ total, unseen, mailList: list, mailUrl: storeUrl, imgUrl: trackUrl });
    },
  });

  const getTableData = async (params: any, sorter: any, filter: any) => {
    const { maid, parent, boxName, keyword, ownerValues } = state;
    const { current, pageSize, status } = params;
    let postData;
    if (keyword) {
      filter.keyword = keyword;
      postData = { current, pageSize, filter, sort: sorter, owners: ownerValues };
    } else {
      postData = {
        owners: ownerValues,
        current,
        pageSize,
        filter: { ...filter, maid, parent, boxName, status },
        sort: sorter,
      };
    }
    const res = await mailsRun(postData);
    return res;
  };

  const setReadData = async (record: any) => {
    const { id, status } = record;
    if (status) {
      return;
    }
    if (!status) {
      getAccList();
    }
    const { mailList, unseen } = state;
    const index = mailList.findIndex((o: any) => o._id === id);
    mailList[index].status = 1;
    setState({ mailList, unseen: unseen - 1 });
  };

  const { run: mailOpenRun } = useRequest(apiMailsOpen, {
    manual: true,
    onSuccess: async (data: any) => {
      const {
        html,
        rtime,
        subject,
        from,
        fromTags,
        toTags,
        to,
        cc,
        bcc,
        timestamp,
        attachments,
        downloadUrl,
        replyTo,
        timeStart,
        ssid,
        status,
        userid,
      } = data;
      if (html) {
        setState({
          ssid,
          html,
          subject,
          rtime,
          from,
          fromTags,
          to,
          toTags,
          cc,
          bcc,
          timestamp,
          attachments,
          replyTo: replyTo || from,
          currentMail: data,
          timeStart,
          loadingStatus: false,
          webhookMsg: {},
          userid,
        });
        if (ssid && status === 4) {
          // ??????????????????????????????
          sendStatusRun({ ssid });
        }
        return;
      }
      // const url = `${mailUrl}${ossPath}`;
      const response = await axios.get(downloadUrl);
      if (response) {
        const { data: resData } = response;
        let realHtml = '';
        await emlformat.read(resData, function (error: any, data2: any) {
          if (error) return console.log(error);
          realHtml = data2.html;
        });
        setState({
          userid,
          loadingStatus: false,
          html: realHtml,
          subject,
          rtime,
          from,
          fromTags,
          to,
          cc,
          bcc,
          timestamp,
          attachments,
          replyTo: replyTo || from,
          timeStart,
          currentMail: { ...data, html: realHtml },
        });
      }
    },
  });

  // ????????????
  const handleClickRow = async (record: any) => {
    const { maid, selectId, tblSelectKeys, editStatus } = state;
    const { id, boxName } = record;
    if (editStatus) {
      // ??????????????????????????????????????????????????????
      const idx = tblSelectKeys.indexOf(id);
      if (idx >= 0) {
        tblSelectKeys.splice(idx, 1);
        setState({ tblSelectKeys: [...tblSelectKeys] });
      } else {
        setState({ tblSelectKeys: [...tblSelectKeys, id] });
      }
      return;
    }
    if (id === selectId) {
      return;
    }
    const boxDisName = exMailBoxname(boxName);
    setState({
      boxDisName,
      readStatus: true,
      selectId: id,
      tblSelectKeys: [id],
      iframeHeight: '600px',
      loadingStatus: true,
    });

    mailOpenRun({ id, maid });
    setReadData(record);
  };

  const handleMailDelete = async () => {
    const { selectId } = state;
    const success = await apiMailDelete({ id: selectId });
    if (success) {
      setState({ readStatus: false });
      actionRef?.current?.reload();
    }
  };

  const { run: multiDeleteRun } = useRequest(apiMailsDelete, {
    manual: true,
    onSuccess: () => {
      setState({ readStatus: false, editStatus: false, tblSelectKeys: [] });
      actionRef?.current?.reload();
    },
  });

  const handleMailMultiDelete = async () => {
    const { tblSelectKeys } = state;
    multiDeleteRun({ ids: tblSelectKeys });
  };

  const handleMailDrop = async () => {
    const { selectId } = state;
    const success = await apiMailDrop({ id: selectId });
    if (success) {
      setState({ readStatus: false });
      actionRef?.current?.reload();
    }
  };

  const handleCancelTimer = async () => {
    const { selectId } = state;
    const success = await apiMailCancelTimer({ id: selectId });
    if (success) {
      message.success('????????????');
      actionRef?.current?.reload();
      setState({ timeStart: 0 });
    }
  };

  const handleMailMultiDrop = async () => {
    const { boxName, parent, maid, tblSelectKeys } = state;
    const success = await apiMailsDrop({ maid, parent, boxName, ids: tblSelectKeys });
    if (success) {
      setState({ readStatus: false, editStatus: false, tblSelectKeys: [] });
      actionRef?.current?.reload();
    }
  };

  const tblSelectChange = (selectedRowKeys: any) => {
    if (!selectedRowKeys.length) {
      setState({ tblSelectAll: false });
    }
    setState({ tblSelectKeys: selectedRowKeys });
  };

  const renderMailStatus = (record: any) => {
    const { status, timeStart, boxName } = record;
    const boxDisName = exMailBoxname(boxName);
    if (boxDisName && boxDisName.indexOf('?????????') === 0) {
      return (
        <Tooltip title="?????????">
          <DeleteOutlined />
        </Tooltip>
      );
    }
    if (boxDisName && boxDisName.indexOf('??????') === 0) {
      if (timeStart) {
        const title = `????????????????????????: ${moment(timeStart).format('YYYY???MM???DD??? HH:mm:ss')}`;
        return (
          <Tooltip title={title}>
            <ClockCircleOutlined />
          </Tooltip>
        );
      }
      return (
        <Tooltip title="?????????">
          <EditOutlined />
        </Tooltip>
      );
    }
    if (status === 0) {
      return (
        <Tooltip title="??????">
          <Badge status="processing" />
        </Tooltip>
      );
    }
    if (status === 1) {
      return (
        <Tooltip title="??????">
          <Badge status="default" />
        </Tooltip>
      );
    }
    if (status === 2) {
      return (
        <Tooltip title="????????????????????????">
          <RollbackOutlined />
        </Tooltip>
      );
    }
    if (status === 3) {
      return (
        <Tooltip title="????????????">
          <CheckOutlined />
        </Tooltip>
      );
    }
    if (status === 5) {
      return (
        <Tooltip title="?????????">
          <EnterOutlined />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="??????">
        <Badge status="error" />
      </Tooltip>
    );
  };

  // ??????????????????
  const renderSelect = (checked: boolean, record: any) => {
    return (
      <div>
        <div>
          {state.editStatus ? <Checkbox checked={checked}> </Checkbox> : <span>&nbsp;</span>}
        </div>
        <div style={{ paddingLeft: 4, paddingTop: 4 }}>{renderMailStatus(record)}</div>
      </div>
    );
  };

  const allMailChoice = (checked: boolean) => {
    const { mailList } = state;
    if (checked) {
      const ids = mailList.map((item: any) => {
        return item._id;
      });
      setState({ tblSelectKeys: ids });
    } else {
      setState({ tblSelectKeys: [] });
    }
  };

  const titleRender = () => {
    const { editStatus, tblSelectKeys, boxDisName } = state;
    if (editStatus) {
      return (
        <Space>
          <Checkbox onChange={(e) => allMailChoice(e.target.checked)}>??????</Checkbox>
          <span>
            ????????? <a>{tblSelectKeys.length}</a> ?????????
          </span>
          {boxDisName !== '?????????' && boxDisName !== '?????????' && tblSelectKeys.length ? (
            <Button size="small" onClick={handleMailMultiDelete}>
              ??????
            </Button>
          ) : null}
          {(boxDisName === '?????????' || boxDisName === '?????????') && tblSelectKeys.length ? (
            <Popconfirm title="????????????????????????????????????????" onConfirm={handleMailMultiDrop}>
              <Button size="small">????????????</Button>
            </Popconfirm>
          ) : null}
        </Space>
      );
    }
    return (
      <span style={{ fontSize: 14 }}>
        ??? <a onClick={() => setState({ params: {} })}>{state.total}</a> ????????????????????????{' '}
        <a onClick={() => setState({ params: { status: 0 } })}>{state.unseen}</a> ???
      </span>
    );
  };

  const changeFrameHeight = () => {
    const iframe: any = document.getElementById('myiframe');
    const bHeight = iframe.contentWindow.document?.body.scrollHeight;
    const dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
    const height = Math.max(bHeight, dHeight);
    setState({ iframeHeight: `${height}px` });
  };

  const onMailSearch = () => {
    const { keyword, ownerValues } = state;
    if (keyword || ownerValues) {
      setState({ selectedKeys: [] });
      actionRef?.current?.reset();
      actionRef?.current?.reload();
    }
  };

  const onTreeExpand = (exKeys: any) => {
    setState({ expandedKeys: exKeys, autoExpandParent: false });
  };

  const { run: tagsListRun } = useRequest(apiTagsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const colors: any = {};
      // eslint-disable-next-line guard-for-in
      for (const i in data) {
        const { id, name, color } = data[i];
        colors[id] = { name, color };
      }
      setState({ tagsColors: colors, tagsItems: data });
    },
  });

  const getTagsList = async () => {
    tagsListRun();
  };

  useEffect(() => {
    const innerHeight = window.innerHeight - 48 - 48 - 36;
    setState({ ...DEFAULT_VALUES, innerHeight });
    getTagsList();
    getAccList();
  }, []);

  const { run: addRun } = useRequest(apiTextSave, {
    manual: true,
    onSuccess: () => {
      message.success('????????????');
      setState({ fromTags: [] });
    },
  });

  const saveFromEmail = async () => {
    const { from } = state;
    await addRun({ text: from });
  };

  const { run: tagsRun, loading: tagsLoading } = useRequest(apiTagsSet, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      getTagsList();
      const { tags } = data;
      setState({ fromTags: tags, setTagsVisible: false });
    },
  });

  const openSetTagsModel = async (text: string) => {
    setState({ setTagsVisible: true, setTagsText: text });
  };

  const onMultiTags = (values: any) => {
    const { tagValues: tags } = values;
    if (!tags || !tags.length) {
      message.error('??????????????????');
      return;
    }
    const { setTagsText } = state;
    const emails = getTextEmails(setTagsText);
    if (emails && emails.length) {
      const email = emails[0];
      tagsRun({ email, tags, type: 'add' });
    } else {
      message.error('??????????????????');
    }
  };

  const { run: tagsSetRun } = useRequest(apiTagsSet, {
    manual: true,
    onSuccess: (data) => {
      const { tags } = data;
      setState({ fromTags: tags });
      message.success('??????????????????');
    },
  });

  const delOneTags = async (email: string, id: string) => {
    await tagsSetRun({ email, tags: [id], type: 'del' });
  };

  const getTagsColor = (id: string, colors: any, email: string) => {
    if (colors[id]) {
      const { name, color } = colors[id];
      return (
        <Tag key={id} color={color} closable onClose={() => delOneTags(email, id)}>
          {name}
        </Tag>
      );
    }
    return <Tag key={id}>{id}</Tag>;
  };

  const mailFromRender = () => {
    const { from, fromTags } = state;
    if (!from) {
      return null;
    }
    const emails = getTextEmails(from);
    if (!emails || !emails.length) {
      return null;
    }
    const email = emails[0];
    let tagsStyle;
    if (!fromTags) {
      tagsStyle = (
        <Tooltip title="??????????????????">
          <SaveTwoTone onClick={() => saveFromEmail()} />
        </Tooltip>
      );
    } else {
      tagsStyle = (
        <Tooltip title="????????????">
          <TagTwoTone onClick={() => openSetTagsModel(from)} />
        </Tooltip>
      );
    }
    const { tagsColors } = state;
    let emailTags = null;
    if (fromTags) {
      emailTags = (
        <span style={{ width: 500, height: 24, padding: 0, overflow: 'hidden' }}>
          {_.uniq(fromTags).map((id: any) => getTagsColor(id, tagsColors, email))}
        </span>
      );
    }
    return (
      <div className={styles.from}>
        ????????????<a href={`mailto:${state.from}`}>{state.from}</a>&nbsp;&nbsp;&nbsp;{tagsStyle}{' '}
        &nbsp;&nbsp;&nbsp;{emailTags}
      </div>
    );
  };

  const renderMailTo = () => {
    const { to, toTags, ssid } = state;
    if (!to) {
      return null;
    }
    const emails = getTextEmails(to);
    if (!emails || !emails.length) {
      return null;
    }
    const email = emails[0];
    let tagsStyle;
    if (!toTags) {
      tagsStyle = (
        <Tooltip title="??????????????????">
          <SaveTwoTone onClick={() => saveFromEmail()} />
        </Tooltip>
      );
    } else {
      tagsStyle = (
        <Tooltip title="????????????">
          <TagTwoTone onClick={() => openSetTagsModel(to)} />
        </Tooltip>
      );
    }
    const { tagsColors } = state;
    let emailTags = null;
    if (toTags) {
      emailTags = (
        <span style={{ width: 500, height: 24, padding: 0, overflow: 'hidden' }}>
          {_.uniq(toTags).map((id: any) => getTagsColor(id, tagsColors, email))}
        </span>
      );
    }
    if (ssid) {
      return (
        <div className={styles.from}>
          ????????????<a href={`mailto:${to}`}>{to}</a>&nbsp;&nbsp;&nbsp;{tagsStyle} &nbsp;&nbsp;&nbsp;
          {emailTags}
        </div>
      );
    }
    return (
      <div className={styles.from}>
        ????????????<a href={`mailto:${to}`}>{to}</a>&nbsp;&nbsp;&nbsp;
        {emailTags}
      </div>
    );
  };

  const renderSendStatus = () => {
    const { ssid, webhookMsg } = state;
    if (ssid && webhookMsg) {
      const { message: errMsg, event } = webhookMsg;
      if (event && event !== 'deliver') {
        return (
          <Alert message={`?????????????????? ${event}`} description={errMsg} type="error" showIcon />
        );
      }
    }
    return null;
  };

  const onOwnerChange = (value: string) => {
    const { owners, selectId } = state;
    const idx = owners.findIndex((item: any) => item.userid === value);
    const { nickname } = owners[idx];
    Modal.confirm({
      title: `??????????????????`,
      content: `???????????????????????? ${nickname}?`,
      onOk: () => ownerSetRun({ userid: value, id: selectId }),
    });
  };

  const renderOwner = () => {
    const { owners } = state;
    if (!owners?.length) {
      return null;
    }
    return (
      <div>
        ???????????????
        <Select
          style={{ width: 240, textDecoration: 'underline' }}
          bordered={false}
          showArrow={false}
          placeholder={
            <div style={{ color: '#383838' }}>
              ???????????? <CaretDownOutlined />
            </div>
          }
          value={state.userid}
          onChange={onOwnerChange}
        >
          {owners.map(({ nickname, userid }: any) => (
            <Select.Option key={userid}>{nickname}</Select.Option>
          ))}
        </Select>
      </div>
    );
  };

  const ownerTagRender = (prop: any) => {
    const { ownerValues } = state;
    const { value } = prop;
    if (ownerValues && ownerValues.length && ownerValues[0] === value) {
      return <div className={fatherStyles.stardardFilterSelected}>?????? ({ownerValues.length})</div>;
    } else {
      return <span />;
    }
  };

  const onOwnerFilterChange = (value: string) => {
    setState({ ownerValues: value });
    setState({ selectedKeys: [] });
    actionRef?.current?.reset();
    actionRef?.current?.reload();
  };

  return (
    <RightContainer pageTitle={false} pageGroup={''} pageActive={''}>
      <div className={styles.mainLayout}>
        <div
          className={styles.leftLayout}
          style={{ maxHeight: state.innerHeight + 36, overflowY: 'auto', overflowX: 'hidden' }}
        >
          <div style={{ width: '100%', textAlign: 'center', marginTop: 12, marginBottom: 12 }}>
            <Button
              type="primary"
              shape="round"
              style={{ width: 120 }}
              onClick={() => setState({ newVisible: true })}
            >
              <FormOutlined />
              ?????????
            </Button>
          </div>
          <div className="mailListTree">
            <Tree
              onExpand={onTreeExpand}
              expandedKeys={state.expandedKeys}
              defaultSelectedKeys={state.selectedKeys}
              checkedKeys={state.selectedKeys}
              autoExpandParent={state.autoExpandParent}
              treeData={renderLeftTree()}
              blockNode={true}
              showIcon={true}
              onSelect={onTreeSelect}
            />
          </div>
          <div style={{ width: '100%', textAlign: 'center', marginTop: 12, marginBottom: 12 }}>
            <Space direction="vertical" size="small" style={{ display: 'flex' }}>
              <Button
                type="primary"
                shape="round"
                ghost
                onClick={() => setState({ addAccountVisible: true })}
              >
                <UserAddOutlined /> ??????????????????
              </Button>
              <Button
                type="primary"
                shape="round"
                ghost
                onClick={() => history.push('/mails/accounts')}
              >
                <SolutionOutlined /> ??????????????????
              </Button>
            </Space>
          </div>
        </div>
        <div className={styles.middle} style={{ height: state.innerHeight + 36 }}>
          <Card bodyStyle={{ padding: 0 }}>
            <div
              className="mailListContainer"
              style={{ height: state.innerHeight + 34, padding: 0 }}
            >
              {usersData?.length ? (
                <TreeSelect
                  treeCheckable={true}
                  treeData={state.userTreeData}
                  dropdownStyle={{ maxHeight: 400, minWidth: 200 }}
                  placeholder={
                    <div style={{ color: '#383838', textAlign: 'center' }}>
                      ?????? <CaretDownOutlined />
                    </div>
                  }
                  tagRender={ownerTagRender}
                  showArrow={false}
                  allowClear
                  className={fatherStyles.stardardFilter}
                  style={{ marginTop: 12, marginRight: 0 }}
                  bordered={false}
                  value={state.ownerValues}
                  onChange={(value: any) => onOwnerFilterChange(value)}
                />
              ) : null}
              <Input.Search
                placeholder="????????????????????????"
                allowClear
                enterButton
                style={{ width: usersData?.length ? 340 : 440, paddingLeft: 12, paddingTop: 12 }}
                value={state.keyword}
                onChange={(e) => setState({ keyword: e.target.value })}
                onSearch={onMailSearch}
              />
              <ProList<any>
                search={{
                  filterType: 'light',
                }}
                actionRef={actionRef}
                rowKey="id"
                headerTitle={titleRender()}
                split={true}
                request={(params, sorter, filter) => getTableData(params, sorter, filter)}
                params={state.params}
                dataSource={exDataSource(state.mailList)}
                pagination={{
                  pageSize: 15,
                  simple: true,
                }}
                showActions="hover"
                metas={{
                  title: { search: false },
                  description: { search: false },
                  type: { search: false },
                  subTitle: { search: false },
                  actions: { search: false },
                  extra: { search: false },
                }}
                onRow={(record) => ({
                  onClick: () => handleClickRow(record),
                })}
                rowSelection={{
                  onChange: tblSelectChange,
                  selectedRowKeys: state.tblSelectKeys,
                  renderCell: renderSelect,
                }}
                tableAlertRender={false}
                toolBarRender={() => {
                  if (state.editStatus) {
                    return [
                      <Button
                        size="small"
                        key="cancle"
                        onClick={() => setState({ editStatus: false, tblSelectKeys: [] })}
                      >
                        ??????
                      </Button>,
                    ];
                  }
                  return [
                    <Button size="small" key="edit" onClick={() => setState({ editStatus: true })}>
                      ??????
                    </Button>,
                  ];
                }}
              />
            </div>
          </Card>
        </div>
        <div
          className={styles.right}
          style={{
            width: '100%',
            height: state.innerHeight + 36,
            paddingLeft: 0,
            display: state.readStatus ? 'inline' : 'none',
          }}
        >
          <Spin tip="Loading" spinning={state.loadingStatus}>
            <Space style={{ margin: 12 }} key="actList">
              {state.boxDisName === '???????????????' || state.boxDisName === '?????????' ? (
                <Button
                  size="small"
                  key="sendReplyButton"
                  onClick={() => setState({ sendReplyVisible: true })}
                >
                  ??????
                </Button>
              ) : null}
              {state.boxDisName === '???????????????' || state.boxDisName === '?????????' ? (
                <Button
                  size="small"
                  key="sendReplyAllButton"
                  onClick={() => setState({ sendReplyAllVisible: true })}
                >
                  ????????????
                </Button>
              ) : null}
              {state.boxDisName !== '???????????????' &&
              state.boxDisName !== '?????????' &&
              state.boxDisName !== '?????????' ? (
                <Button
                  size="small"
                  key="replyButton"
                  onClick={() => setState({ replyVisible: true })}
                >
                  ??????
                </Button>
              ) : null}
              {state.boxDisName !== '???????????????' &&
              state.boxDisName !== '?????????' &&
              state.boxDisName !== '?????????' ? (
                <Button
                  size="small"
                  key="replyAllButton"
                  onClick={() => setState({ replyAllVisible: true })}
                >
                  ????????????
                </Button>
              ) : null}
              {state.boxDisName !== '?????????' ? (
                <Button
                  size="small"
                  key="forwardButton"
                  onClick={() => setState({ forwardVisible: true })}
                >
                  ??????
                </Button>
              ) : null}
              {state.boxDisName !== '?????????' && state.boxDisName !== '?????????' ? (
                <Button size="small" key="delButton" onClick={handleMailDelete}>
                  ??????
                </Button>
              ) : null}
              {(state.boxDisName === '?????????' || state.boxDisName === '??????') &&
              !state.timeStart ? (
                <Button
                  size="small"
                  key="draftButton"
                  onClick={() => setState({ editVisible: true })}
                >
                  ??????
                </Button>
              ) : null}
              {(state.boxDisName === '?????????' || state.boxDisName === '??????') && state.timeStart ? (
                <Button size="small" key="cancelTimer" onClick={handleCancelTimer}>
                  ????????????
                </Button>
              ) : null}
              <Popconfirm title="????????????????????????????????????????" onConfirm={handleMailDrop}>
                <Button size="small">????????????</Button>
              </Popconfirm>
              {state.boxDisName === '?????????' ? null : (
                <Popover
                  content={mailHistoryDisplay}
                  title={false}
                  onOpenChange={(value) => onMailHistoryVisibleChange(value)}
                >
                  <Button size="small">
                    <SwapOutlined />
                    ????????????
                  </Button>
                </Popover>
              )}
            </Space>
            <Card title={state.subject} bodyStyle={{ padding: 12 }}>
              <div style={{ fontWeight: 500 }}>
                {mailFromRender()}
                {renderMailTo()}
                {state.cc ? (
                  <div
                    style={{
                      maxWidth: 800,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    ???&ensp;&ensp;??????{state.cc}
                  </div>
                ) : null}
                {state.bcc ? (
                  <div
                    style={{
                      maxWidth: 800,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    ???&ensp;&ensp;??????{state.bcc}
                  </div>
                ) : null}
                <div>
                  ???&ensp;&ensp;??????
                  {state.timestamp
                    ? moment(state.timestamp).format('YYYY???MM???DD??? (dddd) HH:mm:ss')
                    : null}
                </div>
              </div>
              {renderSendStatus()}
              {renderOwner()}
              <Divider style={{ margin: 12 }} />
              <div style={{ maxHeight: state.innerHeight - 186, overflow: 'auto' }}>
                <iframe
                  id="myiframe"
                  title="resg"
                  srcDoc={state.html}
                  style={{
                    width: '100%',
                    border: '0px',
                    height: state.iframeHeight,
                    font: 'small caption',
                  }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  scrolling="auto"
                  onLoad={changeFrameHeight}
                />
                {state.attachments && state.attachments.length ? (
                  <Card
                    title={
                      <div>
                        <PaperClipOutlined /> ?????? ({state.attachments.length})
                      </div>
                    }
                  >
                    {state.attachments.map((item: any) => {
                      const { filename, size, savePath } = item;
                      const downUrl = urlContact(state.mailUrl, state.imgUrl, savePath);
                      if (downUrl) {
                        const fileSize = exFileSize(size);
                        return (
                          <div style={{ marginLeft: 0, marginBottom: 16 }} key={filename}>
                            <a href={downUrl} target="_blank" rel="noopener noreferrer">
                              <div>
                                <PaperClipOutlined />{' '}
                                <span>
                                  {filename} ({fileSize})
                                </span>
                              </div>
                            </a>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </Card>
                ) : null}
              </div>
            </Card>
          </Spin>
        </div>
        <div
          className={styles.right}
          style={{
            width: '100%',
            paddingTop: 256,
            textAlign: 'center',
            paddingLeft: 12,
            display: state.readStatus ? 'none' : 'inline',
          }}
        >
          <div style={{ fontSize: 16 }}>?????????????????????</div>
        </div>
      </div>
      <MailOperation
        visible={state.replyVisible}
        onCancel={() => setState({ replyVisible: false })}
        current={state.currentMail}
        action="reply"
        actionReload={getAccList}
      />
      <MailOperation
        visible={state.replyAllVisible}
        onCancel={() => setState({ replyAllVisible: false })}
        current={state.currentMail}
        action="replyAll"
        actionReload={getAccList}
      />
      <MailOperation
        visible={state.sendReplyVisible}
        onCancel={() => setState({ sendReplyVisible: false })}
        current={state.currentMail}
        action="sendReply"
        actionReload={getAccList}
      />
      <MailOperation
        visible={state.sendReplyAllVisible}
        onCancel={() => setState({ sendReplyAllVisible: false })}
        current={state.currentMail}
        action="sendReplyAll"
        actionReload={getAccList}
      />
      <MailOperation
        visible={state.forwardVisible}
        onCancel={() => setState({ forwardVisible: false })}
        current={state.currentMail}
        action="forward"
        actionReload={getAccList}
      />
      <MailOperation
        visible={state.editVisible}
        onCancel={() => setState({ editVisible: false })}
        current={state.currentMail}
        action="edit"
        actionReload={getAccList}
      />
      <MailOperation
        visible={state.newVisible}
        onCancel={() => setState({ newVisible: false })}
        current={{ maid: state.maid }}
        action="new"
        actionReload={getAccList}
      />
      <ContactsTags
        visible={state.setTagsVisible}
        onCancel={() => setState({ setTagsVisible: false })}
        rowCount={1}
        multiTags={(values: any) => onMultiTags(values)}
        loading={tagsLoading}
        action="push"
        tagsItem={{ belongTo: 'contact', dataIndex: 'tags', items: state.tagsItems }}
      />
      <MailAccountCreate
        visible={state.addAccountVisible}
        onCancel={() => setState({ addAccountVisible: false })}
        actionReload={() => accountsRun()}
      />
    </RightContainer>
  );
};

export default MailsList;
