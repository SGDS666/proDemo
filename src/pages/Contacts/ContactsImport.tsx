import React from 'react';
import {
  Alert,
  Button,
  Card,
  message,
  Popover,
  Result,
  Select,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Upload,
} from 'antd';
import { useSetState } from 'ahooks';
import { Link, useRequest } from '@umijs/max';
import { ImportExampleData, ImportExampleColumns } from '@/config/data';
import { apiContactImportFile, apiContactImportSave, apiTagsList } from '@/services/contacts';
import { uploadFile } from '@/utils/oss';
import styles from './style.less';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { apiContactImportFields } from '@/services/field';
const { Step } = Steps;

const ContactsImport: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    currentStep: 0,
    uploadLoading: false,
    fileList: [], // 上传文件显示
    sheetNames: [],
    sheetValues: [],
    sheetIndex: 0,
    sheetName: '',
    sheetValue: '',
    tblColumns: [], // 预览数据表格字段
    tblData: [], // 预览数据表格数据
    matchTblData: [], // 匹配表格数据
    goStep2Disable: false,
    importType: 1,
    importBegin: 1,
    importFields: [],
    tags: [],
    tagsOptions: [],
    fieldOptions: [],
    setFields: [],
    tagsDelOld: false,
    choiceNum: 0,
    iid: '',
  });

  const { data: fieldsData, run: fieldsRun } = useRequest(apiContactImportFields, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const fieldOptions = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { dataIndex, title } = data[idx];
        fieldOptions.push({ label: title, value: dataIndex });
      }
      setState({ fieldOptions });
    },
  });

  const { run: tagsListRun } = useRequest(apiTagsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const tagsOptions = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { id, name, folder } = data[idx];
        if (!folder) {
          tagsOptions.push({ label: name, value: id });
        }
      }
      setState({ tagsOptions });
    },
  });

  const { run: saveRun } = useRequest(apiContactImportSave, {
    manual: true,
    onSuccess: () => {
      setState({ currentStep: 3 });
    },
  });

  const initTableData = (sheetValue: any) => {
    if (!sheetValue || !sheetValue.length) {
      setState({ tblColumns: [], tblData: [], goStep2Disable: true });
      return;
    }
    const importFields: any[] = [];
    const dataS: any[] = [];
    const header = sheetValue[0];
    const choice = [{ title: '行号', key: 'id', dataIndex: 'id', width: 100 }];
    const cols = header.map((item: any, idx: number) => {
      if (idx !== 0) {
        importFields.push(null);
      }
      return {
        title: item,
        key: `col${idx}`,
        dataIndex: `col${idx}`,
        width: 160,
        ellipsis: true,
      };
    });
    sheetValue.forEach((line: any, index: number) => {
      const dataLine: any = { id: index + 1 };
      for (let i = 0; i < line.length; i++) {
        dataLine[`col${i}`] = line[i];
      }
      dataS.push(dataLine);
    });
    setState({
      tblColumns: choice.concat(cols),
      tblData: dataS,
      matchTblData: dataS,
      goStep2Disable: false,
      importFields,
    });
  };

  const beforeUpload = async (localFile: any) => {
    const { name, size } = localFile;
    const lowerName = name.toLowerCase();
    if (
      lowerName.indexOf('.xls') <= 0 &&
      lowerName.indexOf('.xlsx') <= 0 &&
      lowerName.indexOf('.csv') <= 0 &&
      lowerName.indexOf('.txt') <= 0
    ) {
      message.warning('文件类型不支持！只支持xls、xlsx、csv、txt格式');
      return false;
    }
    if (size >= 10 * 1024 * 1024) {
      message.warning('文件过大！只支持10MB以内的文件！');
      return false;
    }
    setState({ uploadLoading: true, fileList: [{ name, uid: '1', status: 'uploading' }] });
    const { success, data: postData, error } = await uploadFile(localFile, 'store', true);
    if (!success) {
      if (error) {
        message.error('文件上传失败: ', error);
      } else {
        message.error('文件上传失败，检查是否有开启代理，请关闭代理后再尝试。');
      }
    } else {
      const { success: succ, data, errorMsg } = await apiContactImportFile(postData);
      if (succ) {
        const { sheetNames, workbook, iid } = data;
        if (sheetNames && sheetNames.length) {
          const { sheetName, sheetValue } = workbook[0];
          setState({
            iid,
            currentStep: 1,
            sheetNames,
            sheetValues: workbook,
            sheetIndex: 0,
            sheetName,
            sheetValue,
          });
          initTableData(sheetValue);
          fieldsRun();
          tagsListRun();
        }
      } else {
        message.error(errorMsg);
      }
    }
    setState({ uploadLoading: false, fileList: [{ name, uid: '1', status: 'done' }] });
    return false;
  };

  const Step0 = () => {
    return (
      <div hidden={state.currentStep !== 0}>
        <div>
          <div>您将通过上传的Excel文件，批量追加或更新表格数据</div>
        </div>
        <div style={{ color: '#999', fontSize: 12 }}>
          导入后只会保留Excel中的数据及通过公式计算后的值，设置的文字颜色等样式、合并的单元格、以及计算公式本身都不会被保留。
        </div>
        <Spin spinning={state.uploadLoading} size="large" tip="上传中..." delay={100}>
          <Upload.Dragger
            fileList={state.fileList}
            name="file"
            accept=".xls,.xlsx,.csv,.txt"
            beforeUpload={beforeUpload}
          >
            <p className="ant-upload-drag-icon">
              <Button type="primary">点我上传</Button>
            </p>
            <p className="ant-upload-text">点击或拖动文件到虚线框内上传</p>
            <p className="ant-upload-hint">
              支持 10MB 以内的 xls、xlsx、csv、txt文件,
              数据不能超过100000行、200列，txt文件必须使用英文逗号,做分隔符
            </p>
          </Upload.Dragger>
        </Spin>
        <div style={{ marginTop: 20 }}>
          <span style={{ fontWeight: 'bold', marginRight: 20 }}>表格示例</span>
          <span>有标准行列的二维数据表格</span>
          <Table
            dataSource={ImportExampleData}
            rowKey="id"
            columns={ImportExampleColumns}
            size="small"
            style={{ marginTop: 15 }}
            pagination={false}
          />
        </div>
      </div>
    );
  };

  const sheetChange = (idx: any) => {
    const { sheetValues } = state;
    const { sheetName, sheetValue } = sheetValues[idx];
    setState({ sheetIndex: idx, sheetName, sheetValue });
    initTableData(sheetValue);
  };

  const handleClickRow = (record: any) => {
    const { id } = record;
    const { tblData } = state;
    const matchTblData = tblData.slice(id);
    setState({ importBegin: id, matchTblData });
  };

  const renderCell = (text: any, record: any, index: number, idx: number) => {
    const { importBegin } = state;
    if (index === importBegin - 1 && idx === 0) {
      return (
        <span>
          {text}
          <Tag color="#108ee9">标题行</Tag>
        </span>
      );
    }
    return text;
  };

  // 自动匹配
  const autoMatch = async () => {
    const { tblColumns, importFields } = state;
    let choiceNum = 0;
    for (const idx in tblColumns) {
      if (`${idx}` !== '0') {
        const { title } = tblColumns[idx];
        const index1 = fieldsData.findIndex((o: any) => o.dataIndex === title);
        if (index1 >= 0) {
          const i = parseInt(idx) - 1;
          importFields[i] = fieldsData[index1].dataIndex;
          choiceNum += 1;
          continue;
        }
        const index2 = fieldsData.findIndex((o: any) => o.title === title);
        if (index2 >= 0) {
          const i = parseInt(idx) - 1;
          importFields[i] = fieldsData[index2].dataIndex;
          choiceNum += 1;
        }
      }
    }
    setState({ importFields, choiceNum });
  };

  const onClickGoStep2 = () => {
    autoMatch();
    setState({ currentStep: 2 });
  };

  const Step1 = () => {
    const { sheetNames, sheetIndex, tblData, tblColumns } = state;
    return (
      <div className={styles.stepForm} hidden={state.currentStep !== 1}>
        <Space>
          <span style={{ fontWeight: 'bold' }}>选择工作表</span>
          <Select style={{ width: 200 }} value={sheetIndex} onChange={sheetChange}>
            {sheetNames.map((name: string, idx: number) => (
              // eslint-disable-next-line react/no-array-index-key
              <Select.Option key={idx} value={idx}>
                {name}
              </Select.Option>
            ))}
          </Select>
          <span>请查看预览数据是否为要导入的数据，并指定哪一行为标题，然后点击“下一步”</span>
        </Space>
        <div style={{ fontWeight: 'bold', marginTop: 15 }}>预览数据：</div>
        <Table
          showHeader={false}
          size="small"
          style={{ marginTop: 15 }}
          dataSource={tblData}
          pagination={false}
          scroll={{ x: tblColumns.length * 100 }}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleClickRow(record),
          })}
        >
          {tblColumns.map((column: any, colIndex: number) => {
            return (
              <Table.Column
                key={column.key}
                render={(text, record, index) => renderCell(text, record, index, colIndex)}
                {...column}
              />
            );
          })}
        </Table>
        <Alert message="预览仅展示10条记录" type="warning" showIcon />
        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Button
            type="primary"
            danger
            style={{ marginRight: 20 }}
            onClick={() => setState({ currentStep: 0 })}
          >
            上一步
          </Button>
          <Button type="primary" onClick={onClickGoStep2} disabled={state.goStep2Disable}>
            下一步
          </Button>
        </div>
      </div>
    );
  };

  const tagsTip = (
    <div>
      <div>保存标签</div>
      <div className={styles.desc}>导入时设置标签可以便于联系人管理，强烈建议使用</div>
    </div>
  );

  const content = (
    <div>
      <div>仅新增数据</div>
      <div className={styles.desc}>将Excel中的数据全部追加为表格的新数据</div>
      <div>仅更新数据</div>
      <div className={styles.desc}>
        通过指定字段找到表格的<span style={{ color: '#CA5D67' }}>所有</span>
        已有数据，用Excel中的数据更新对应数据，不会新增任何数据
      </div>
      <div>更新和新增数据</div>
      <div className={styles.desc}>
        更新和新增数据用Excel中的数据更新表格的<span style={{ color: '#CA5D67' }}>所有</span>
        已有数据，当通过指定字段找不到已有数据时，会新增数据
      </div>
    </div>
  );

  const countChoiceFields = (importFields: any) => {
    let count = 0;
    for (const idx in importFields) {
      if (importFields[idx]) {
        count += 1;
      }
    }
    setState({ choiceNum: count });
  };

  const fieldChoiceChange = async (idx: number, value: string) => {
    const { importFields } = state;
    const index = importFields.indexOf(value);
    if (index >= 0) {
      message.warning('导入字段已存在，不能选择已导入的字段!');
      return;
    }
    importFields[idx - 1] = value;
    setState({ importFields });
    countChoiceFields(importFields);
  };

  const renderMatchCell = (text: any, record: any, index: number, idx: number) => {
    if (index === 0 && idx !== 0) {
      return (
        <Select
          key={idx}
          allowClear
          showArrow
          showSearch
          style={{ width: '100%', minWidth: 60 }}
          value={state.importFields[idx - 1]}
          onChange={(value) => fieldChoiceChange(idx, value)}
          placeholder="请选择导入列"
          optionFilterProp="label"
          options={state.fieldOptions}
        />
      );
    }
    return text;
  };

  const cancelAutoMatch = () => {
    const { tblColumns } = state;
    const importFields = [];
    for (const idx in tblColumns) {
      if (`${idx}` !== '0') {
        importFields.push(null);
      }
    }
    console.log(importFields);
    setState({ importFields, choiceNum: 0 });
  };

  const onClickSave = () => {
    const { importType, importFields, tags, choiceNum, tagsDelOld, importBegin, iid, sheetName } =
      state;
    if (choiceNum <= 0) {
      message.warning('没有选择导入列!');
      return;
    }
    if (importFields.indexOf('email') < 0) {
      message.warning('邮箱字段为必须');
      return;
    }
    if (!iid || !importType || !importBegin || importFields.length === 0) {
      message.warning('参数错误!');
      return;
    }
    saveRun({
      iid,
      importType,
      importFields,
      tags,
      importSheet: sheetName,
      importBegin,
      tagsDelOld,
    });
  };

  const Step2 = () => {
    return (
      <div className={styles.stepForm} hidden={state.currentStep !== 2}>
        <div className={styles.desc}>
          <div>为Excel数据中的每一列选择要导入到的字段</div>
        </div>
        <div className={styles.formLine}>
          <Popover content={content} title="">
            <div style={{ fontWeight: 'bold' }}>
              导入方式
              <QuestionCircleOutlined />
            </div>
          </Popover>
          <div style={{ marginLeft: 15 }}>
            <Select
              style={{ width: 200 }}
              value={state.importType}
              onChange={(val) => setState({ importType: val })}
            >
              <Select.Option key="1" value={1}>
                新增数据
              </Select.Option>
              <Select.Option key="2" value={2}>
                更新数据
              </Select.Option>
              <Select.Option key="3" value={3}>
                新增和更新数据
              </Select.Option>
            </Select>
          </div>
          <Popover content={tagsTip} title="">
            <div style={{ fontWeight: 'bold', marginLeft: 25, color: '#1890ff' }}>
              保存标签
              <QuestionCircleOutlined />
            </div>
          </Popover>
          <div style={{ marginLeft: 15 }}>
            <Select
              showArrow
              showSearch
              mode="tags"
              style={{ width: 320 }}
              value={state.tags}
              onChange={(val) => setState({ tags: val })}
              placeholder="请选择或输入标签名称(必填)"
              options={state.tagsOptions}
              optionFilterProp="label"
            />
          </div>
          <div style={{ marginLeft: 15 }}>
            <Select
              style={{ width: 140 }}
              value={state.tagsDelOld}
              onChange={(val) => setState({ tagsDelOld: val })}
            >
              <Select.Option key="false" value={false}>
                保留原有标签
              </Select.Option>
              <Select.Option key="true" value={true}>
                移除原有标签
              </Select.Option>
            </Select>
          </div>
        </div>
        <div className={styles.titleContainer} style={{ marginTop: 10 }}>
          <div className={styles.desc}>
            选择导入 {state.choiceNum} 列 / 共 {state.tblColumns.length - 1} 列
            (新增数据时邮箱字段为必须条件，否则保存失败)
          </div>
          <div>
            <Button type="link" style={{ marginRight: 15 }} onClick={() => autoMatch()}>
              自动匹配字段
            </Button>
            <Button type="link" onClick={() => cancelAutoMatch()}>
              取消所有字段导入
            </Button>
          </div>
        </div>
        <Table
          size="small"
          style={{ marginTop: 15 }}
          dataSource={state.matchTblData}
          pagination={false}
          scroll={{ x: state.tblColumns.length * 100 }}
          rowKey="id"
        >
          {state.tblColumns.map((column: any, colIndex: number) => {
            return (
              <Table.Column
                key={column.id}
                render={(text, record, index) => renderMatchCell(text, record, index, colIndex)}
                {...column}
              />
            );
          })}
        </Table>
        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Button style={{ marginRight: 20 }} onClick={() => setState({ currentStep: 1 })}>
            上一步
          </Button>
          <Button type="primary" onClick={onClickSave}>
            下一步
          </Button>
        </div>
      </div>
    );
  };

  const finishExtra = (
    <>
      <Button type="primary" onClick={() => setState({ currentStep: 0 })}>
        继续导入
      </Button>
      <Button>
        <Link to="/contacts/contacts" key="13a">
          查看联系人
        </Link>
      </Button>
      <Button>
        <Link to="/contacts/import-history" key="23a">
          查看纪录
        </Link>
      </Button>
    </>
  );

  const Step3 = () => {
    return (
      <div hidden={state.currentStep !== 3}>
        <Result
          status="success"
          title="上传成功"
          subTitle="后台正在为您保存数据，详细情况请查看导入纪录"
          extra={finishExtra}
          className={styles.result}
        />
      </div>
    );
  };

  return (
    <Card title={false}>
      <div style={{ minWidth: '800px', maxWidth: '75%', margin: '24px auto' }}>
        <Steps current={state.currentStep} style={{ marginBottom: 40 }}>
          <Step title="上传Excel" />
          <Step title="预览数据" />
          <Step title="匹配字段" />
          <Step title="完成" />
        </Steps>
        {Step0()}
        {Step1()}
        {Step2()}
        {Step3()}
      </div>
    </Card>
  );
};

export default ContactsImport;
