/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      { path: '/user/regist', component: './User/Regist' },
      { path: '/user/regist-success', component: './User/RegistSuccess' },
      { path: '/user/reset', component: './User/Reset' },
      { path: '/user/reset-success', component: './User/ResetSuccess' },
    ],
  },
  {
    path: '/i',
    layout: false,
    routes: [{ path: '/i/:uid', component: './User/Partner' }],
  },
  {
    path: '/regist',
    layout: false,
    routes: [{ path: '/regist/:uid', component: './User/Regist' }],
  },
  {
    path: '/register',
    layout: false,
    routes: [{ path: '/register/:uid', component: './User/Regist' }],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smileFilled',
    component: './Welcome',
  },
  {
    path: '/partner',
    name: 'partner',
    icon: 'likeFilled',
    component: './Partner/Invite',
  },
  {
    path: '/search',
    name: 'search',
    icon: 'plusCircleFilled',
    routes: [
      { path: '/search', component: './Search' },
      {
        name: 'precise-buyer',
        path: '/search/precise-buyer',
        component: './Search/PreciseBuyer',
        access: 'search.precise-buyer',
      },
      {
        name: 'global-engine',
        path: '/search/global-engine',
        component: './Search/GlobalEngine',
        access: 'search.global-engine',
      },
      {
        name: 'domain-engine',
        path: '/search/domain-engine',
        component: './Search/DomainEngine',
        access: 'search.domain-engine',
      },
      {
        name: 'name-engine',
        path: '/search/name-engine',
        component: './Search/NameEngine',
        // access: 'search.domain-engine',
      },
      { name: 'tasks', path: '/search/tasks', component: './Search/Tasks', access: 'search.tasks' },
      { name: 'saved', path: '/search/saved', component: './Search/Saved', access: 'search.saved' },
      {
        name: 'packages',
        path: '/search/packages',
        component: './Search/Packages',
        access: 'search.packages',
      },
      {
        name: 'black-domains',
        path: '/search/black-domains',
        component: './Search/BlackDomains',
        access: 'search.black-domains',
      },
      { component: './404' },
    ],
  },
  {
    path: '/contacts',
    name: 'contacts',
    icon: 'contactsFilled',
    routes: [
      { path: '/contacts', component: './Contacts' },
      {
        name: 'contacts',
        path: '/contacts/contacts',
        component: './Contacts/Contacts',
        access: 'contacts.contacts',
      },
      {
        name: 'companies',
        path: '/contacts/companies',
        component: './Contacts/Company',
        access: 'contacts.companies',
      },

      // {
      //   name: 'black-domains',
      //   path: '/contacts/black-domains',
      //   component: './Contacts/BlackDomains',
      // },
      {
        path: '/contacts/contacts-import',
        component: './Contacts/ContactsImport',
      },
      {
        name: 'recycle',
        path: '/contacts/recycle',
        component: './Contacts/Recycle',
        access: 'contacts.recycle',
      },
      {
        name: 'import-history',
        path: '/contacts/import-history',
        component: './Contacts/ImportHistory',
        access: 'contacts.import-history',
      },
      {
        name: 'export-history',
        path: '/contacts/export-history',
        component: './Contacts/ExportHistory',
        access: 'contacts.export-history',
      },
      // { path: '/contacts/operations', component: './Contacts/Operations' },
      { component: './404' },
    ],
  },
  {
    path: '/marketing',
    name: 'marketing',
    icon: 'dribbbleCircleFilled',
    routes: [
      { path: '/marketing', component: './Marketing' },
      {
        name: 'tasks',
        path: '/marketing/tasks',
        component: './Marketing/Tasks',
        access: 'marketing.tasks',
      },
      {
        name: 'tracks',
        path: '/marketing/tracks',
        component: './Marketing/Track',
        access: 'marketing.tracks',
      },
      { component: './404' },
    ],
  },
  {
    path: '/reports',
    name: 'reports',
    icon: 'dashboardFilled',
    routes: [
      { path: '/reports', component: './Reports' },
      {
        name: 'overview',
        path: '/reports/overview',
        component: './Reports/Overview',
        access: 'reports.overview',
      },
      { component: './404' },
    ],
  },
  {
    path: '/expenses',
    name: 'expenses',
    icon: 'payCircleFilled',
    routes: [
      { path: '/expenses', component: './Expenses' },
      {
        name: 'balance',
        path: '/expenses/balance',
        component: './Expenses/Balance',
        access: 'expenses.balance',
      },
      {
        name: 'packages',
        path: '/expenses/packages',
        component: './Expenses/Packages',
        access: 'expenses.packages',
      },
      {
        name: 'orders',
        path: '/expenses/orders',
        component: './Expenses/Orders',
        access: 'expenses.orders',
      },
      {
        name: 'billing',
        path: '/expenses/billing',
        component: './Expenses/Billing',
        access: 'expenses.billing',
      },
      { path: '/expenses/purchase', component: './Expenses/Purchase' },
      { component: './404' },
    ],
  },
  {
    path: '/notifications',
    icon: 'bell',
    routes: [
      { path: '/notifications', component: './Notifications' },
      {
        path: '/notifications/messages',
        component: './Notifications/Message',
        access: 'notifications.messages',
      },
      { component: './404' },
    ],
  },
  {
    path: '/enterprise',
    name: 'enterprise',
    icon: 'homeFilled',
    routes: [
      { path: '/enterprise', redirect: '/enterprise/personal' },
      { path: '/enterprise/invite', component: './Enterprise/Invite' },
      {
        name: 'personal',
        path: '/enterprise/personal',
        component: './Enterprise/Personal',
      },
      {
        name: 'profile',
        path: '/enterprise/profile',
        component: './Enterprise/Profile',
        access: 'enterprise.profile',
      },
      {
        name: 'members',
        path: '/enterprise/members',
        component: './Enterprise/Members',
        access: 'enterprise.members',
      },
      {
        name: 'teams',
        path: '/enterprise/teams',
        component: './Enterprise/Teams',
        access: 'enterprise.teams',
      },
      {
        name: 'permissions',
        path: '/enterprise/permissions',
        component: './Enterprise/Permissions',
        access: 'enterprise.permissions',
      },
      { path: '/enterprise/openrations', component: './Enterprise/Openrations', access: 'canOrg' },
      { component: './404' },
    ],
  },
  {
    path: '/settings',
    name: 'settings',
    icon: 'settingFilled',
    routes: [
      { path: '/settings', component: './Settings' },
      {
        name: 'tags',
        path: '/settings/tags',
        component: './Settings/Tags',
        access: 'settings.tags',
      },
      {
        name: 'fields',
        path: '/settings/fields',
        component: './Settings/ContactsFields',
        access: 'settings.fields',
      },
      {
        name: 'templets',
        path: '/settings/templets',
        component: './Settings/MailTemplets',
        access: 'settings.templets',
      },
      {
        name: 'content',
        path: '/settings/content',
        component: './Settings/MailContent',
        access: 'settings.content',
      },
      {
        name: 'signatures',
        path: '/settings/signatures',
        component: './Settings/MailSignatures',
        access: 'settings.signatures',
      },
      { component: './404' },
    ],
  },
  {
    path: '/mails',
    icon: 'mail',
    routes: [
      { path: '/mails', redirect: '/mails/list' },
      { path: '/mails/accounts', component: './Mails/Accounts' },
      { path: '/mails/inbox', component: './Mails/Inbox' },
      { path: '/mails/list', component: './Mails/List' },
      { component: './404' },
    ],
  },
  {
    path: '/account',
    icon: 'setting',
    routes: [
      { path: '/account/setting', component: './Account/Setting' },
      { path: '/account/authc', component: './Account/Authc' },
      { component: './404' },
    ],
  },
  // {
  //   path: '/admin',
  //   name: 'admin',
  //   icon: 'crown',
  //   // access: 'canAdmin',
  //   routes: [
  //     {
  //       path: '/admin',
  //       redirect: '/admin/sub-page',
  //     },
  //     {
  //       path: '/admin/sub-page',
  //       name: 'sub-page',
  //       component: './Admin',
  //     },
  //   ],
  // },
  // {
  //   name: 'list.table-list',
  //   icon: 'table',
  //   path: '/list',
  //   component: './TableList',
  // },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
