import type { ProColumns } from '@ant-design/pro-components';
import { LightFilter, ProFormDatePicker, ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';

import React, { useState } from 'react';

export type TableListItem = {
    ID?: string;
    cost: number;
    commission: number;
    createdAt: number;
    method?:"支付宝"|"微信"
    bank?:"中国工商银行"|"中国农业银行",
    account?:number;
    tax?:number,
    receipt?:number,
    status?:"进行中"|"已完成",
    Cash?:number
    
};



const tableListDataSource: TableListItem[] = [];


for (let i = 0; i < 50; i += 1) {
    const Cash = Math.floor(Math.random() * 1000) + 1000
    const tax = Math.floor(Cash*0.3)
    tableListDataSource.push({
        ID: `00${Math.floor(Math.random() * 100)}`,
        cost: Math.floor(Math.random() * 20),
        commission: Math.floor(Math.random() * 200)+100,
        createdAt: Date.now() - Math.floor(Math.random() * 20000000000),
        method:Math.random()*1<0.3?"微信":"支付宝",
        bank:Math.random()*1<0.3?"中国工商银行":"中国农业银行",
        account:Date.now()- - Math.floor(Math.random() * 200000000000),
        tax:tax,
        Cash:Cash,
        receipt:Cash-tax,
        status:Math.random()*1<0.3?"进行中":"已完成"
    });
}

const columns1: ProColumns<TableListItem>[] = [
    {
        title: '用户ID',
        dataIndex: 'ID',
        render: (_) => <a>{_}</a>,
    },
    {
        title: '邀请时间',
        dataIndex: 'createdAt',
        valueType:"date"
        
        
        
    },
    {
        title: '总消费',
        dataIndex: 'cost',
        initialValue: 'all',
        
    },
    {
        title: '总佣金',
        dataIndex: 'commission',
        render:(_)=> <a>¥{_}</a>,
    },
   
];
const columns2: ProColumns<TableListItem>[] = [
    {
        title: '用户ID',
        dataIndex: 'ID',
        render: (_) => <a>{_}</a>,
    },
    {
        title: '消费时间',
        dataIndex: 'createdAt',
        valueType:"date"
        
        
        
    },
    {
        title: '消费金额',
        dataIndex: 'cost',
        initialValue: 'all',
        
    },
    {
        title: '佣金金额',
        dataIndex: 'commission',
        render:(_)=> <a>¥{_}</a>,
    },
   
];
const columns3: ProColumns<TableListItem>[] = [

    {
        title: '奖励时间',
        dataIndex: 'createdAt',
        valueType:"date"
        
        
        
    },
    {
        title: '奖励金额',
        dataIndex: 'cost',
        initialValue: 'all',
        
    },
    {
        title: '奖励原因',
        dataIndex: 'commission',
        render:(_)=> <a>¥{_}</a>,
    },
   
];
const columns4: ProColumns<TableListItem>[] = [

    {
        title: '提现方式',
        dataIndex: 'method',
    },
    {
        title: '提现时间',
        dataIndex: 'createdAt',
        valueType: 'date',
        
    },
    {
        title: '银行',
        dataIndex: 'bank',
    },
    {
        title: '提现账号',
        dataIndex: 'account',
    },
    {
        title: '提现',
        dataIndex: 'Cash',
    },
    {
        title: '税费',
        dataIndex: 'tax',
    },
    {
        title: '到账',
        dataIndex: 'receipt',
    },
    {
        title: '状态',
        dataIndex: 'status',
        render:(_)=> {
            if(_==="进行中"){
                return <Tag color="gold">进行中</Tag>
            }else if(_==="已完成"){
                return <Tag color="success">已完成</Tag>
            }
        },
    },
];
const columnsSet = {
    tab1:columns1,
    tab2:columns2,
    tab3:columns3,
    tab4:columns4
}

export default () => {
    const [activeKey, setActiveKey] = useState<keyof typeof columnsSet>('tab1');

    return (
        <ProTable<TableListItem>
            columns={columnsSet[activeKey]}
            request={(params, sorter, filter) => {
                // 表单搜索项会从 params 传入，传递给后端接口。
                console.log(params, sorter, filter);
                return Promise.resolve({
                    data: tableListDataSource,
                    success: true,
                });
            }}
            toolbar={{
                filter: (
                    <LightFilter>
                        <ProFormDatePicker name="startdate" label="日期" />
                    </LightFilter>
                ),
                menu: {
                    type: 'tab',
                    activeKey: activeKey,
                    items: [
                        {
                            key: 'tab1',
                            label: <span>邀请记录</span>,
                        },
                        {
                            key: 'tab2',
                            label: <span>佣金明细</span>,
                        },
                        {
                            key: 'tab3',
                            label: <span>奖励明细</span>,
                        },
                        {
                            key: 'tab4',
                            label: <span>提现明细</span>,
                        },
                    ],
                    onChange: (key:any) => {
                        setActiveKey(key);
                    },
                }
            }}
            rowKey="key"
            pagination={{
                showQuickJumper: true,
            }}
            search={false}
            dateFormatter="string"
            options={{
                setting: {
                    draggable: true,
                    checkable: true,
                    checkedReset: false,
                    extra: [<a key="confirm">确认</a>],
                },
            }}
        />
    );
};