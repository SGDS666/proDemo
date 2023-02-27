import moment from 'moment';
import { parse } from 'querystring';
const { htmlToText } = require('html-to-text');
import _ from 'lodash';
import type { RangePickerProps } from 'antd/es/date-picker/generatePicker';
const domainReg = /([a-zA-Z0-9][_-a-zA-Z0-9]{0,62}\.)+[a-zA-Z]{1,62}/gi;
const url = require('url');

// 格式化protable请求参数，匹配服务端
export function formatParams(params: any) {
  const formFilter: any = {}; // 顶层表单参数值
  const { filter, current, pageSize, sorter } = params;
  for (const key in params) {
    if (key === 'filter' || key === 'current' || key === 'sorter' || key === 'pageSize') {
      continue;
    } else {
      formFilter[key] = params[key];
    }
  }
  const sort: any = {};
  for (const key in sorter) {
    if (sorter[key] === 'ascend') {
      sort[key] = 1;
    } else {
      sort[key] = -1;
    }
  }
  return { current, pageSize, sort, filter: { ...filter, ...formFilter } };
}

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

export const exTimeToDate = (t: any) => {
  if (!t) return '';
  return moment(t).format('YYYY-MM-DD');
};

export const exTimeToDateTime = (t: any) => {
  if (!t) return '';
  return moment(t).format('YYYY-MM-DD HH:mm:ss');
};

export const todayDate = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

export const exFileSize = (fileByte: number | string) => {
  if (typeof fileByte === 'undefined') {
    return '';
  }
  if (typeof fileByte === 'string') {
    return fileByte;
  }
  const fileSizeByte = fileByte;
  let fileSizeMsg = '';
  if (fileSizeByte < 1024) {
    fileSizeMsg = fileSizeByte + ' B';
  } else if (fileSizeByte === 1024) {
    fileSizeMsg = '1 KB';
  } else if (fileSizeByte > 1024 && fileSizeByte < 1048576) {
    fileSizeMsg = (fileSizeByte / 1024).toFixed(1) + ' KB';
  } else if (fileSizeByte === 1048576) {
    fileSizeMsg = '1 MB';
  } else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) {
    fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(1) + ' MB';
  } else if (fileSizeByte > 1048576 && fileSizeByte === 1073741824) {
    fileSizeMsg = '1 GB';
  } else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) {
    fileSizeMsg = (fileSizeByte / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  } else {
    fileSizeMsg = '大于1TB';
  }
  return fileSizeMsg;
};

export const exTimes = (times: number) => {
  if (!times) {
    return '';
  }
  if (times < 1000) {
    return '小于1秒';
  }
  if (times >= 1000 && times < 60 * 1000) {
    const sec = Math.floor(times / 1000);
    return `${sec}秒`;
  }
  if (times >= 60 * 1000 && times < 3600 * 1000) {
    const min = Math.floor(times / (60 * 1000));
    const sec = Math.floor((times - min * 60 * 1000) / 1000);
    if (sec) {
      return `${min}分${sec}秒`;
    }
    return `${min}分钟`;
  }
  const hour = Math.floor(times / (3600 * 1000));
  const min = Math.floor((times - hour * 3600 * 1000) / (60 * 1000));
  if (min) {
    return `${hour}时${min}分`;
  }
  return `${hour}小时`;
};
export function add0(m: number) {
  return m < 10 ? '0' + m : m;
}
export function formatTime(shijianchuo: any) {
  //shijianchuo是整数，否则要parseInt转换
  const time = new Date(shijianchuo);
  const y = time.getFullYear();
  const m = time.getMonth() + 1;
  const d = time.getDate();
  // const h = time.getHours();
  // const mm = time.getMinutes();
  // const s = time.getSeconds();
  return y + '/' + m + '/' + d;
}
// 时间戳转年月日时分秒星期
export function timeWeekFormat(times: any) {
  //定义一个日期对象;
  const dateTime = new Date(times);
  //获得系统年份;
  const year = dateTime.getFullYear();
  //获得系统月份;
  let month: string | number = dateTime.getMonth() + 1;
  //获得系统当月分天数;
  const day = dateTime.getDate();
  //获得系统小时;
  let hours: string | number = dateTime.getHours();
  //获得系统分钟;
  let minutes: string | number = dateTime.getMinutes();
  //获得系统秒数;
  let second: string | number = dateTime.getSeconds();
  //获得系统星期几;
  let dayCycle: string | number = dateTime.getDay();
  //使用数组更改日期样式;
  const dayCycleArray = ['日', '一', '二', '三', '四', '五', '六'];
  for (let i = 0; i < 7; i++) {
    if (dayCycle === i) {
      //将dayCycleArray的数赋值到系统星期几里面中去;
      dayCycle = dayCycleArray[i];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  month < 10 ? (month = '0' + month) : month;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  hours < 10 ? (hours = '0' + hours) : hours;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  minutes < 10 ? (minutes = '0' + minutes) : minutes;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  second < 10 ? (second = '0' + second) : second;
  //打印完整的系统日期;
  const dateStr =
    year +
    '年' +
    month +
    '月' +
    day +
    '日' +
    '( 星期' +
    dayCycle +
    ' ) ' +
    hours +
    ':' +
    minutes +
    ':' +
    second;
  return dateStr;
}

export const exCustomerSelectOptions = (
  data: { email: string; first_name: string; last_name: string }[],
) => {
  return data.map(({ email, first_name, last_name }) => {
    let name = '';
    if (first_name) {
      name += first_name;
    }
    if (last_name) {
      name += ` ${last_name}`;
    }
    if (!name) {
      name = email.split('@')[0];
    }
    return { label: `${name} <${email}>`, value: `${name} <${email}>` };
  });
};

export const exHtmlToText = (html: string) => {
  const text = htmlToText(html, {
    wordwrap: 130,
  });
  return text;
};

// 邮件地址格式转换
export const exMailAddressList = (from: string) => {
  const res: string[] = [];
  if (!from) {
    return res;
  }
  const reg =
    /("[^<>]*"(\s)?<[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+>|<[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+>|[^,<@>]*(\s)?<[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+>|[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const toArr = from.match(reg);
  toArr?.forEach((maddr) => {
    const addr = maddr.trim();
    if (addr.indexOf('<') === 0) {
      const name = addr.split('<')[1].split('@')[0];
      res.push(`${name} ${addr}`);
    } else if (addr.indexOf('<') < 0) {
      const name = addr.split('@')[0];
      res.push(`${name} <${addr}>`);
    } else {
      res.push(addr);
    }
  });
  return res;
};

export const exEmailAddressList = (addressList: string[]) => {
  const idx = addressList.length - 1;
  const tail = addressList[idx];
  const head = _.dropRight(addressList);
  const tailArr = exMailAddressList(tail);
  return _.concat(head, tailArr);
};

export const mailAddressInfo = (address: string) => {
  if (!address) {
    return { name: '', email: '' };
  }
  const regex2 = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const email = address.match(regex2)?.[0];
  let name = address.split('<')[0];
  if (!name.trim()) {
    return { name, email };
  }
  if (address && address.indexOf('<') >= 0) {
    name = address.split('<')[1].split('@')[0];
    return { name, email };
  }
  name = address.split('@')[0];
  return { name, email };
};

// 邮件地址去重，去掉原地址
export const exMailFinalList = (mList: string[], origi: string) => {
  if (!mList) {
    return [];
  }
  const len = mList.length;
  for (let idx = len - 1; idx >= 0; idx -= 1) {
    const addr = mList[idx];
    if (addr.indexOf(`<${origi}>`) > 0) {
      mList.splice(idx, 1);
    }
  }
  return _.uniq(mList);
};

// 检查邮件正文中变量
export function checkVeriables(html: string, veriables: any) {
  let ver = false;
  if (!veriables) {
    return [false, {}];
  }
  Object.keys(veriables).forEach((key) => {
    const { code } = veriables[key];
    const idx = html.indexOf(code);
    if (idx >= 0) {
      ver = true;
    } else {
      delete veriables[key];
    }
  });
  return [ver, veriables];
}

export function deviceInfo(device: string) {
  if (!device) {
    return '';
  }
  const devList = [
    { name: '桌面端(OSX)', keywords: ['mac'] },
    { name: '桌面端(Windows)', keywords: ['windows', 'msoffice', 'microsoft'] },
    { name: '桌面端(Linux)', keywords: ['linux.*x86'] },
    { name: '移动端(iOS)', keywords: ['iphone'] },
    { name: '移动端(Android)', keywords: ['android'] },
    { name: '移动端(HarmonyOS)', keywords: ['harmony'] },
  ];
  const info = device.toLowerCase();
  let deviceName: string = `未知(${device})`;
  devList.forEach((values: any) => {
    const { name, keywords } = values;
    // eslint-disable-next-line guard-for-in
    for (const idx in keywords) {
      const reg = new RegExp(keywords[idx]);
      if (reg.test(info)) {
        deviceName = name;
      }
    }
  });
  return deviceName;
}

type RangePickerValue = RangePickerProps<moment.Moment>['value'];

export function fixedZero(val: number) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(
  type: 'today' | 'd7' | 'yestoday' | 'week' | 'month' | 'year',
): RangePickerValue {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'yestoday') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    const beginTime = now.getTime() - oneDay;
    const endTime = now.getTime() - 1000;
    return [moment(beginTime), moment(endTime)];
  }

  if (type === 'd7') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    const beginTime = now.getTime() - 7 * oneDay;
    const endTime = now.getTime() - 1000;
    return [moment(beginTime), moment(endTime)];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }
  const year = now.getFullYear();

  if (type === 'month') {
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function displayKeywordColor(message: string, keyword: string) {
  let msg = message;
  if (!message) {
    return `<span> </span>`;
  }
  const mword = keyword.replace(/"/g, '').replace(/AND /g, '');
  const reg = new RegExp(mword, 'gi');
  const words = _.uniq(message.match(reg));
  words.forEach((word: string) => {
    const regi = new RegExp(word, 'g');
    msg = msg.replace(regi, `<b style="color:red">${word}</b>`);
  });
  return `<div>${msg}</div>`;
}

export function renderPlatformUrl(platform: string, id: string, link: string) {
  if (platform === 'linkedin') {
    return `https://linkedin.com/company/${id}`;
  }
  return link;
}

export function checkBadDomain(domain: string) {
  if (!domain) {
    return true;
  }
  const names: string[] = [
    'txt',
    'php',
    'js',
    'doc',
    'docx',
    'xlx',
    'xlsx',
    'png',
    'jpg',
    'jpef',
    'html',
    'xml',
    'pdf',
    'ico',
    'img',
    'csv',
  ];
  const reg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
  if (!reg.test(domain)) {
    return true;
  }
  // eslint-disable-next-line guard-for-in
  for (const idx in names) {
    const name = names[idx];
    const reg = new RegExp(`.${name}$`, 'i');
    if (reg.test(domain)) {
      return true;
    }
  }
  return false;
}

export function getDomainsFromString(keyword: string) {
  if (!keyword) return [];
  const words = keyword.toLocaleLowerCase().replace(/www\./g, '');
  const ds = words.match(domainReg);
  const dds = _.uniq(ds);
  const domains: string[] = [];
  dds.forEach((domain: string) => {
    const bad = checkBadDomain(domain);
    if (!bad) {
      domains.push(domain);
    }
  });
  return domains;
}

export function getDomainFromString(keyword: string) {
  const domains = getDomainsFromString(keyword);
  if (domains && domains.length) {
    return domains[0];
  }
  return null;
}

export function getNamesFromString(keyword: string) {
  if (!keyword) return [];
  const ns = keyword.split('\n');
  const nss = _.uniq(ns);
  const names: string[] = [];
  nss.forEach((name: string) => {
    if (name.trim().length >= 3) {
      names.push(name);
    }
  });
  return names;
}

export function checkTaskIdSubmit(task_id: string) {
  if (/[a-zA-Z]/.test(task_id)) {
    return true;
  }
  return false;
}

export function checkObjectIds(ids: any) {
  if (!ids) {
    return [];
  }
  const reg = new RegExp('^[0-9a-zA-F]{24}$');
  const objIds = [];
  // eslint-disable-next-line guard-for-in
  for (const idx in ids) {
    const id = ids[idx];
    if (reg.test(id)) {
      objIds.push(id);
    }
  }
  return objIds;
}

export function sleepTime(time: number = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

// 判断是否含有中文字符
export function hasChnWord(value: string | undefined) {
  if (!value) {
    return false;
  }
  return /.*[\u4e00-\u9fa5]+.*/.test(value);
}

export function renderName(values: any) {
  // first_name是名字 last_name姓氏
  const { first_name, last_name } = values;
  if (first_name && last_name) {
    if (hasChnWord(first_name)) {
      return `${last_name} ${first_name}`;
    }
    return `${first_name} ${last_name}`;
  }
  if (first_name && !last_name) {
    return `${first_name}`;
  }
  if (!first_name && last_name) {
    return `${last_name}`;
  }
  return '';
}

export const exMailBoxname = (box: string) => {
  if (!box) {
    return box;
  }
  const lower = box.toLowerCase();
  if (lower === 'inbox') {
    return '收件箱';
  }
  if (lower === 'outbox' || lower.indexOf('sent') === 0) {
    return '已发送邮件';
  }
  if (lower === 'drafts') {
    return '草稿箱';
  }
  if (lower === 'junk') {
    return '垃圾箱';
  }
  if (lower === 'deleted messages' || lower.indexOf('deleted') === 0) {
    return '已删除';
  }
  return box;
};

export const getEmailAddresName = (address: string) => {
  if (!address) {
    return '';
  }
  let name = '';
  if (address && address.indexOf('"') >= 0) {
    name = address.split('"')[1];
  } else if (address && address.indexOf('<') === 0) {
    name = address.split('<')[1].split('@')[0];
  } else if (address && address.indexOf('<') > 0) {
    name = address.split('<')[0];
  } else {
    name = address.split('@')[0];
  }
  return name;
};

export const urlContact = (storeUrl: string, trackUrl: string, urlPath: string) => {
  let encodeUrl;
  const idx = urlPath.indexOf('inbox');
  if (idx === 0 || idx === 1) {
    if (!urlPath) {
      return null;
    }
    encodeUrl = url.resolve(storeUrl, urlPath);
  } else {
    if (!trackUrl) {
      return null;
    }
    encodeUrl = url.resolve(trackUrl, urlPath);
  }
  return encodeUrl.replace(/#/g, '%23');
};

export const getTextEmails = (text: string) => {
  if (!text) {
    return [];
  }
  const str = text.toLowerCase();
  const reg = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emails = str.match(reg);
  return emails;
};

export function randomArray(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function isIncludeGoogleParams(keyword: string) {
  const keys: any = ['"', ':', ' and ', ' or '];
  const str = keyword.toLocaleLowerCase();
  // eslint-disable-next-line guard-for-in
  for (const idx in keys) {
    const key = keys[idx];
    if (str.includes(key)) {
      return true;
    }
  }
  return false;
}

export function rangeTime(key: string) {
  let start = moment();
  let end = moment();
  if (key === 'today') {
    start = start.startOf('day');
    end = end.endOf('day');
  } else if (key === 'yestoday') {
    start = start.subtract(1, 'days').startOf('day');
    end = end.subtract(1, 'days').endOf('day');
  } else if (key === 'last24Hours') {
    start = start.subtract(1, 'days');
  } else if (key === 'thisIsoWeek') {
    start = start.startOf('isoWeek');
    end = end.endOf('isoWeek');
  } else if (key === 'lastIsoWeek') {
    start = start.subtract(7, 'days').startOf('isoWeek');
    end = end.subtract(7, 'days').endOf('isoWeek');
  } else if (key === 'thisMonth') {
    start = start.startOf('month');
    end = end.endOf('month');
  } else if (key === 'lastMonth') {
    start = start.subtract(1, 'months').startOf('month');
    end = end.subtract(1, 'months').endOf('month');
  } else if (key === 'thisQuarter') {
    start = start.startOf('quarter');
    end = end.endOf('quarter');
  } else if (key === 'lastQuarter') {
    start = start.subtract(1, 'quarters').startOf('quarter');
    end = end.subtract(1, 'quarters').endOf('quarter');
  } else if (key === 'thisYear') {
    start = start.startOf('year');
    end = end.endOf('year');
  } else if (key === 'lastYear') {
    start = start.subtract(1, 'years').startOf('year');
    start = start.subtract(1, 'years').endOf('year');
  } else if (key === 'last7Days') {
    start = start.subtract(7, 'days').startOf('days');
    end = end.subtract(1, 'days').endOf('days');
  } else if (key === 'last30Days') {
    start = start.subtract(30, 'days').startOf('days');
    end = end.subtract(1, 'days').endOf('days');
  } else if (key === 'last60Days') {
    start = start.subtract(60, 'days').startOf('days');
    end = end.subtract(1, 'days').endOf('days');
  } else if (key === 'last90Days') {
    start = start.subtract(90, 'days').startOf('days');
    end = end.subtract(1, 'days').endOf('days');
  } else if (key === 'last180Days') {
    start = start.subtract(180, 'days').startOf('days');
    end = end.subtract(1, 'days').endOf('days');
  } else if (key === 'last365Days') {
    start = start.subtract(365, 'days').startOf('days');
    end = end.subtract(1, 'days').endOf('days');
  }
  return [start, end];
}

// 获取主页域名，二级
export function getWebsiteDomain(website: string) {
  if (!website) return null;
  const reg = new RegExp('http[s]?://[a-z0-9-_.]+\\.[a-z]{2,11}');
  const domains = website.toLocaleLowerCase().match(reg);
  let msgs: string[];
  if (domains && domains.length) {
    msgs = domains[0].replace('http:', '').replace('https:', '').replace(/\//g, '').split('.');
  } else {
    msgs = website.replace(/\//g, '').split('.');
  }
  if (!msgs || !msgs.length) return null;
  if (msgs[0] === 'www') {
    msgs.splice(0, 1);
  }
  if (msgs.length >= 3) {
    return `${msgs[msgs.length - 3]}.${msgs[msgs.length - 2]}.${msgs[msgs.length - 1]}`;
  }
  return `${msgs[msgs.length - 2]}.${msgs[msgs.length - 1]}`;
}
