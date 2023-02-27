import React, { useEffect } from 'react';
import { Modal, Radio, Space, Alert, message, DatePicker } from 'antd';
import styles from './style.less';
import { useSetState } from 'ahooks';
import { apiExportQuota } from '@/services/contacts';
import { apiTrackOutput } from '@/services/tasks';
import OutputHistory from './OutputHistory';
import { getTimeDistance } from '@/utils/common';
import type { RangePickerProps } from 'antd/es/date-picker/generatePicker';
import moment from 'moment';

const { RangePicker } = DatePicker;

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
}
type RangePickerValue = RangePickerProps<moment.Moment>['value'];

const OutputModal: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel } = props;
  const [state, setState] = useSetState({
    outType: 'all',
    vip: 0,
    quota: 0,
    payVipVisible: false,
    qrcodeVisible: false,
    app: 'wechat',
    codeUrl: '',
    id: '',
    loading: false,
    hisVisible: false,
    rangePickerValue: getTimeDistance('today'),
    activeKey: 'today',
  });

  const getQuota = async () => {
    const data = await apiExportQuota();
    if (data) {
      const { vip, quota } = data;
      setState({ vip, quota });
    }
  };

  useEffect(() => {
    if (visible) {
      setState({ loading: false });
      getQuota();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSubmit = async () => {
    setState({ loading: true });
    const { vip } = state;
    if (!vip) {
      message.error('请购买会员后再导出');
      return;
    }
    const { outType, rangePickerValue } = state;
    const beginTime = moment(rangePickerValue[0]).valueOf();
    const endTime = moment(rangePickerValue[1]).valueOf();
    const params = { outType, beginTime, endTime };
    const data = await apiTrackOutput(params);
    if (data) {
      const { downUrl } = data;
      if (downUrl) {
        window.open(downUrl);
        onCancel();
      }
    }
    setState({ loading: false });
  };

  const onOutTypeChange = async (e: any) => {
    setState({ outType: e.target.value });
  };

  const modalFooter = { okText: '导出', onOk: handleSubmit, onCancel };

  const renderTitle = () => {
    return (
      <div>
        <span>追踪导出</span>
        <a style={{ marginLeft: 250 }} onClick={() => setState({ hisVisible: true })}>
          导出纪录
        </a>
      </div>
    );
  };

  const isActive = (type: 'today' | 'yestoday' | 'd7' | 'week' | 'month' | 'year') => {
    const { rangePickerValue } = state;
    if (!rangePickerValue) {
      return ['', ''];
    }
    const value = getTimeDistance(type);
    if (!value) {
      return ['', ''];
    }
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return ['', ''];
    }
    if (
      rangePickerValue[0].isSame(value[0] as moment.Moment, 'day') &&
      rangePickerValue[1].isSame(value[1] as moment.Moment, 'day')
    ) {
      return styles.currentDate;
    }
    return ['', ''];
  };

  const selectDate = (type: 'today' | 'yestoday' | 'd7' | 'week' | 'month' | 'year') => {
    const rangePickerValue = getTimeDistance(type);
    setState({ rangePickerValue });
  };

  const handleRangePickerChange = (rangePickerValue: RangePickerValue) => {
    setState({ rangePickerValue });
  };

  return (
    <Modal
      title={renderTitle()}
      className={styles.standardListForm}
      width={480}
      bodyStyle={{ padding: '28px 24px 24px' }}
      destroyOnClose
      open={visible}
      confirmLoading={state.loading}
      okButtonProps={{ disabled: !state.vip }}
      {...modalFooter}
    >
      <div>
        {state.vip ? null : (
          <Alert
            message="购买VIP会员获取导出权限"
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
          />
        )}
        <div style={{ color: '#9f9f9f', paddingBottom: 12 }}>导出时间范围</div>
        <div className={styles.salesExtra}>
          <a className={isActive('today')} onClick={() => selectDate('today')}>
            今日
          </a>
          <a className={isActive('yestoday')} onClick={() => selectDate('yestoday')}>
            昨日
          </a>
          <a className={isActive('d7')} onClick={() => selectDate('d7')}>
            近7天
          </a>
          <a className={isActive('week')} onClick={() => selectDate('week')}>
            本周
          </a>
        </div>
        <div style={{ paddingTop: 12 }}>
          <RangePicker value={state.rangePickerValue} onChange={handleRangePickerChange} showTime />
        </div>

        <div style={{ color: '#9f9f9f', paddingBottom: 12, paddingTop: 12 }}>导出追踪类型</div>
        <Radio.Group style={{ marginLeft: 12 }} value={state.outType} onChange={onOutTypeChange}>
          <Space>
            <Radio value="all">所有</Radio>
            <Radio value="read">阅读</Radio>
            <Radio value="click">点击</Radio>
            <Radio value="download">下载</Radio>
          </Space>
        </Radio.Group>
      </div>
      <OutputHistory visible={state.hisVisible} onCancel={() => setState({ hisVisible: false })} />
    </Modal>
  );
};

export default OutputModal;
