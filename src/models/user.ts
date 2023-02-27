import { useRequest } from '@umijs/max';
import { apiMessageCount } from '../services/notice';
import { apiMailsCount } from '../services/mails';

export default () => {
  const { run: messageRun, data: messageData } = useRequest(apiMessageCount, {
    pollingInterval: 60000,
    pollingWhenHidden: false,
    manual: true,
  });

  const { run: mailsCountRun, data: mailsCountData } = useRequest(apiMailsCount, {
    pollingInterval: 120000,
    pollingWhenHidden: false,
    manual: true,
  });

  return { messageData, messageRun, mailsCountRun, mailsCountData };
};
