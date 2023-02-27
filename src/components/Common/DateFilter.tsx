import React, { useState } from 'react';
import { DatePicker, Divider, Checkbox, Select, Space, Tooltip } from 'antd';
import 'dayjs/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import styles from '@/pages/index.less';
import { CaretDownOutlined } from '@ant-design/icons';
import moment from 'moment';
const { Option } = Select;

const dateList: any = [
  { label: '昨天', desc: '昨天一天', value: 'yestoday' },
  { label: '今天', desc: '今天一天', value: 'today' },
  { label: '前24小时', desc: '此前24小时之内', value: 'last24Hours' },
  { label: '本周', desc: '本周星期一到星期天', value: 'thisIsoWeek' },
  { label: '上周', desc: '上周星期一到星期天', value: 'lastIsoWeek' },
  { label: '本月份', desc: '本月1号开始到月底', value: 'thisMonth' },
  { label: '上月份', desc: '上月1号开始到上月月底', value: 'lastMonth' },
  { label: '前7天', desc: '昨天开始往前7天', value: 'last7Days' },
  { label: '前30天', desc: '昨天开始往前30天', value: 'last30Days' },
  { label: '前60天', desc: '昨天开始往前60天', value: 'last60Days' },
  { label: '前90天', desc: '昨天开始往前90天', value: 'last90Days' },
  { label: '前180天', desc: '昨天开始往前180天', value: 'last180Days' },
  { label: '前365天', desc: '昨天开始往前365天', value: 'last365Days' },
];

const DateFilter: React.FC<any> = (props) => {
  const { name, onChange, value } = props;
  const [dateValue, setDateValue] = useState(moment().format('YYYY-MM-DD'));
  const renderLabel = (item: any) => {
    const { label } = item;
    return (
      <Tooltip title={`${name}: ${label}`}>
        <div className={styles.stardardDateFilterSelected}>
          {label} <CaretDownOutlined />
        </div>
      </Tooltip>
    );
  };

  const onDateChange = (date: any, dateString: any) => {
    if (dateString) {
      setDateValue(dateString);
      onChange(dateString);
    }
  };

  const onCustomChange = (checked: boolean) => {
    if (checked && dateValue) {
      onChange(dateValue);
    }
  };

  return (
    <Select
      {...props}
      placeholder={
        <div style={{ color: '#383838', textAlign: 'center' }}>
          {name} <CaretDownOutlined />
        </div>
      }
      // value={selectValue}
      // onSelect={onValueChange}
      allowClear
      showSearch
      bordered={false}
      showArrow={false}
      optionFilterProp="label"
      optionLabelProp="label"
      className={styles.stardardFilter}
      dropdownStyle={{ minWidth: 280 }}
      dropdownRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ padding: '0 8px 4px' }}>
            <span>
              <Checkbox
                checked={value === dateValue}
                onChange={(e) => onCustomChange(e.target.checked)}
              >
                自选日期
              </Checkbox>
            </span>
            <DatePicker
              locale={locale}
              onChange={onDateChange}
              value={moment(dateValue)}
              allowClear={false}
              // onClick={(e) => e.stopPropagation()}
              autoFocus={true}
              getPopupContainer={(trigger: any) => trigger.parentNode}
              popupStyle={{ width: 300, height: 300, minWidth: 300 }}
            />
          </Space>
        </>
      )}
    >
      {dateList.map((item: any) => {
        const { label, desc, value: itemValue } = item;
        return (
          <Option label={renderLabel(item)} value={itemValue} key={itemValue}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{label}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{desc}</div>
            </div>{' '}
          </Option>
        );
      })}
      {/* <Option key="customDate" value={dateValue}>
        <div>
          <div style={{ fontWeight: 'bold' }}>自选日期</div>
          <div>
            <DatePicker
              onChange={onDateChange}
              onClick={(e) => e.stopPropagation()}
              value={moment(dateValue)}
              allowClear={false}
            />
          </div>
        </div>
      </Option> */}
    </Select>
  );
};

export default DateFilter;
