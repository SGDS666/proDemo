export default [
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  { path: '/welcome', name: '欢迎', icon: 'SmileFilled', component: './Welcome' },
  { path: '/partner', name: '合作', icon: 'likeFilled', component: './partner' },
  {
    path: '/search', name: '获客', icon: 'plusCircleFilled', component: './Welcome',
    routes: [
      { path: '/search/global-engine', name: '全球搜客引擎', component: './Welcome' },
      { path: '/search/precise-buyer', name: '精准买家数据', component: './Welcome' },
      { path: '/search/domain-engine', name: '公司域名搜客', component: './Welcome' },
      { path: '/search/name-engine', name: '公司名称搜客', component: './Welcome' },
      { path: '/search/tasks', name: '批量搜客任务', component: './Welcome' },
      { path: '/search/saved', name: '保存记录', component: './Welcome' },
      { path: '/search/packages', name: '套餐余额', component: './Welcome' },
      { path: '/search/black-domains', name: '域名黑名单', component: './Welcome' },
    ],
  },
  {
    path: '/contacts', name: '客户', icon: 'contactsFilled', component: './Welcome',
    routes: [
      { path: '/contacts/contacts', name: '联系人', component: './Welcome' },
      { path: '/contacts/companies', name: '公司', component: './Welcome' },
      { path: '/contacts/recycle', name: '回收站', component: './Welcome' },
      { path: '/contacts/import-history', name: '导入历史', component: './Welcome' },
      { path: '/contacts/export-history', name: '导出历史', component: './Welcome' },
    ],
  },
  {
    path: '/marketing', name: '营销', icon: 'DribbbleCircleFilled', component: './Welcome',
    routes: [
      { path: '/marketing/tasks', name: '邮件群发', component: './Welcome' },
      { path: '/marketing/tracks', name: '邮件追踪', component: './Welcome' },

    ],
  },
  {
    path: '/reports', name: '数据', icon: 'dashboardFilled', component: './Welcome',
    routes: [
      { path: '/reports/overview', name: '数据总览', component: './Welcome' },

    ],
  },
  {
    path: '/expenses', name: '费用', icon: 'payCircleFilled', component: './Welcome',
    routes: [
      { path: '/expenses/balance', name: '账户余额', component: './Welcome' },
      { path: '/expenses/packages', name: '套餐余额', component: './Welcome' },
      { path: '/expenses/orders', name: '充值订单', component: './Welcome' },
      { path: '/expenses/billing', name: '消费明细', component: './Welcome' },
    ],
  },
  { path: '/enterprise', name: '企业', icon: 'homeFilled', component: './Welcome' ,
  routes: [
    { path: '/enterprise/personal', name: '我的企业', component: './Welcome' },

  ],},
  { path: '/settings', name: '设置', icon: 'settingFilled', component: './Welcome' ,
  routes: [
    { path: '/settings/tags', name: '标签管理', component: './Welcome' },
    { path: '/settings/fields', name: '客户字段', component: './Welcome' },
    { path: '/settings/templets', name: '邮件模版', component: './Welcome' },
    { path: '/settings/signatures', name: '邮件签名', component: './Welcome' },
  ],},
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
