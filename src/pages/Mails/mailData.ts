export default [
  {
    id: 1,
    avatar:
      'https://tse1-mm.cn.bing.net/th/id/R-C.6f3812af899915ec57ee2e7d7a277d72?rik=qiMWKqmZtKFBZA&riu=http%3a%2f%2fscimg.jianbihuadq.com%2f202012%2f2020120319570822.jpg&ehk=ypsLEZAjwfnVoLPwnQtjL%2fcDSf0SuedZf5vnf%2ffyscE%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1',
    sender: '邮件助手',
    theme: '开始使用你的工作邮箱',
    content: '将你的工作邮件同步到这里,统一处理',
  },
  {
    id: 2,
    avatar: 'https://pic.qqtn.com/up/2018-5/15258335232239499.jpg',
    sender: '腾讯业务邮箱',
    theme: '管理员Tony为你开通了业务邮箱',
    content: '你好XXX,管理员为你开通了业务邮箱',
  },
  {
    id: 3,
    avatar:
      'https://tse1-mm.cn.bing.net/th/id/R-C.33cf65724d3384f0c8011b41a2f42ef0?rik=9Cky61vVDzLmlw&riu=http%3a%2f%2fwww.shijuepi.com%2fuploads%2fallimg%2f200907%2f1-200ZG23J2-50.jpg&ehk=3XWCahxEK8QA3y3NnKuespVS%2bf0Sep6wEyBQX8c1HK0%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1',
    sender: 'Ant Title 3',
    theme: '中国(江苏)自由贸易试验区南京片区研创园江淼路88号腾飞大厦5-10室(信息申报)',
    content: ' 统一社会代码 : 91320191MA225LAX0H',
  },
  {
    id: 4,
    avatar:
      'https://tse1-mm.cn.bing.net/th/id/R-C.d5300ae546ac5036be45839adde6de7a?rik=1uuCR5ZxSwnomw&riu=http%3a%2f%2fimg2.woyaogexing.com%2f2017%2f08%2f03%2fbf000c71ef589986!400x400_big.jpg&ehk=dlSo2P1mTUcLc2YeeRcDP0TeFonzap1HYNhhIu4XObo%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1',
    sender: 'Ant Design Title 4',
    theme: '管理员Tony为你开通了业务邮箱',
    content: '最后一行内容详情介绍页',
  },
];

export interface entity {
  key: string;
  value: string;
  title?: string;
  children?: children[];
}
export interface children {
  key: string;
  value: string;
  title?: string;
  children?: children[];
}
export const menuArr = [
  { key: '1', value: '分别发送' },
  { key: '2', value: '定时' },
  { key: '3', value: '邮件追踪' },
];
export const menuList = [
  { key: '1', value: '写邮件' },
  { key: '2', value: '添加邮箱账户' },
  { key: '3', value: '邮箱账号管理' },
];
export const menuListR = [
  // { key: '1', value: '在新窗口打开' },
  { key: '2', value: '回复' },
  { key: '3', value: '全部回复' },
  { key: '4', value: '转发' },
  { key: '5', value: '标记未读' },
  // { key: '6', value: '添加星标' },
  { key: '7', value: '这不是垃圾邮件' },
  { key: '8', value: '彻底删除' },
];
export const menuListC = [
  { key: '5', value: '标记未读' },
  { key: '7', value: '这不是垃圾邮件' },
  { key: '8', value: '彻底删除' },
];
export const treeData = [
  {
    key: '1',
    value: 'Navigation One',
    children: [
      { key: '0-1', value: '收件箱' },
      { key: '1-1', value: '星标邮件' },
      { key: '1-2', value: '草稿箱' },
      { key: '1-3', value: '已发送' },
      { key: '1-4', value: '已删除' },
      { key: '1-5', value: '垃圾邮箱' },
      { key: '1-6', value: '我的文件夹', children: [{ key: '1-6-1', value: '新建文件夹' }] },
      { key: '1-7', value: '标签', children: [{ key: '1-7-1', value: '新建标签' }] },
    ],
  },
  {
    key: '2',
    value: 'Navigation two',
    children: [
      { key: '0-2', value: '收件箱', children: [{ key: '8', value: '222' }] },
      { key: '2-1', value: '星标邮件' },
      { key: '2-2', value: '草稿箱' },
      { key: '2-3', value: '已发送' },
      { key: '2-4', value: '已删除' },
      { key: '2-5', value: '垃圾邮箱' },
      { key: '2-6', value: '我的文件夹', children: [{ key: '2-6-1', value: '新建文件夹' }] },
      { key: '2-7', value: '标签', children: [{ key: '2-7-1', value: '新建标签' }] },
    ],
  },
];

export const conText = `" Hello

    I’m Mark, a research Assistant of the Researchs and Development Department working at one of the leading Bio Pharmaceutical Companies here in England. I'm looking for a reliable businessman/individual in your region to represent my company in sourcing some of our basic raw material used in the manufacturing of high quality Anti-Viral Vaccines, Cancer treatment and other lifesaving Pharmaceutical Products.
    
    
    This may not be your area of specialization but it will be another income generating business out of your specialty. This is because Our company is yet to locate any seller to buy from, however, I have been able to discover a local dealer who can supply us with this product. He is selling at a cheap rate , which is far cheaper than our previous purchases.
    
    
    
    I will give you more specific profit details when I receive feedback from you if you are interested.
    
    
    
    Best regards,
    
    Mark   "`;
export const mailT = `Received: from [127.0.0.1] (unknown [180.111.106.165])
    by smtp8 (Coremail) with SMTP id DMCowAB3vfbHrldiIT3IBA--.50843S3;
    Thu, 14 Apr 2022 13:19:04 +0800 (CST)
  Content-Type: text/html; charset=utf-8
  From: =?UTF-8?B?5p2l5Y+R5L+h?= <jianwangok@163.com>
  To: 42173247@qq.com
  Subject: =?UTF-8?B?8J+UlOOAjCDpgq7ku7bnvqTlj5Eg44CN6aKd5bqm?=
   =?UTF-8?B?5Yiw6LSm5ZWmfiB8IOi/meS6m+OAjCDlp7/lir8g?=
   =?UTF-8?B?44CN5b+F55yL77yB77yB77yBTkVX77yB?=
  Message-ID: <4bea2a47-c28b-d253-554e-7a075d2a5dc2@163.com>
  Content-Transfer-Encoding: quoted-printable
  Date: Thu, 14 Apr 2022 05:19:03 +0000
  MIME-Version: 1.0
  X-CM-TRANSID:DMCowAB3vfbHrldiIT3IBA--.50843S3
  X-Coremail-Antispam: 1Uf129KBjDUn29KB7ZKAUJUUUUU529EdanIXcx71UUUUU7v73
    VFW2AGmfu7bjvjm3AaLaJ3UbIYCTnIWIevJa73UjIFyTuYvjxUoBMNDUUUU
  X-Originating-IP: [180.111.106.165]
  
  <table style=3D"border-collapse: collapse; width: 600px;" align=3D"center">
  <tbody>
  <tr>
  <td>
  <div style=3D"text-align: center;"><a href=3D"https://www=
  .laifaxin.com" target=3D"_blank" rel=3D"noopener"> <img =
  src=3D"https://files.laifaxin.com/www/no-email/lg.png" width=3D"100" /> =
  </a></div>
  </td>
  </tr>
  </tbody>
  </table>
  <table style=3D"border-collapse: =
  collapse; width: 600px; border: 1px solid #efefef; border-radius: 4px; =
  padding: 0;" align=3D"center">
  <tbody>
  <tr>
  <td style=3D"padding: 0;" =
  colspan=3D"2">
  <div style=3D"padding: 16px 32px 0 32px;">
  <p style=3D"font-size: 24px; font-weight: 600; padding: 0; margin: 16px 0 =
  24px 0;">=F0=9F=94=94 ~=E3=80=8C =E9=82=AE=E4=BB=B6=E7=BE=A4=E5=8F=91 =
  =E3=80=8D=E9=A2=9D=E5=BA=A6=E5=88=B0=E8=B4=A6=E6=8F=90=E9=86=92 ~ HOT~</p>
  </div>
  </td>
  </tr>
  <tr>
  <td style=3D"padding: 0;" align=3D"left" =
  width=3D"60%">
  <div style=3D"padding-left: 32px;">
  <p style=3D"font-size: =
  18px; font-weight: 600; margin: 16px 0 1px;"><span style=3D"color: =
  #2196f3;">=F0=9F=94=94 =E9=A2=9D=E5=BA=A6=E5=88=B0=E5=B8=90=E6=8F=90=
  =E9=86=92=EF=BC=9A</span></p>
  <p style=3D"font-size: 14px; color: #595959; =
  margin: 8px 0;"><span style=3D"color: #fa541c;"> <strong>=E8=B4=AD=
  =E4=B9=B0=E5=B8=90=E5=8F=B7</strong>: <span style=3D"color: =
  #999999;">z7pxw6</span><br /><strong>=E8=B4=AD=E4=B9=B0=E6=95=B0=E9=87=8F</=
  strong>: <span style=3D"color: #999999;">11</span><br /></span></p>
  <p style=3D"font-size: 18px; font-weight: 600; margin: 16px 0 1px;"><span =
  style=3D"color: #2196f3;">=E2=80=BC=EF=B8=8F =E7=BE=A4=E5=8F=91=E7=89=B9=
  =E8=89=B2=E8=AF=B4=E6=98=8E </span></p>
  <p style=3D"font-size: 14px; color:=
   #595959; ;margin: 8px 0;"><strong><span style=3D"color: =
  #2aa146;">=E4=B8=80=E3=80=81=E5=85=8D=E8=B4=B9=E9=82=AE=E7=AE=B1=E9=AA=8C=
  =E8=AF=81=EF=BC=8C=E4=B8=8D=E5=8F=91=E4=B8=8D=E6=89=A3=E9=87=8F=EF=BC=81=
  =E7=9C=81=E9=92=B1=EF=BC=81</span></strong></p>
  <p style=3D"font-size: =
  14px; color: #595959; ;margin: 8px 0;"><strong><span style=3D"color: =
  #2aa146;">=E4=BA=8C=E3=80=81=E5=85=8D=E8=B4=B9=E9=82=AE=E4=BB=B6=E8=BF=BD=
  =E8=B8=AA=EF=BC=8C=E5=8F=91=E9=80=81=E6=95=88=E6=9E=9C=E4=B8=80=E7=9B=AE=
  =E4=BA=86=E7=84=B6=EF=BC=9B</span></strong></p>
  <p style=3D"font-size: =
  14px; color: #595959; ;margin: 8px 0;"><strong><span style=3D"color: =
  #2aa146;">=E4=B8=89=E3=80=81=E5=A4=9A=E4=B8=BB=E9=A2=98/=E5=86=85=E5=AE=B9/=
  =E5=8F=98=E9=87=8F=EF=BC=8C=E8=AE=A9=E6=AF=8F=E4=B8=80=E5=B0=81=E9=83=BD=
  =E4=B8=8D=E4=B8=80=E6=A0=B7=EF=BC=9B</span></strong></p>
  <p style=3D"font-size: 14px; color: #595959; ;margin: 8px 0;"><strong><span=
   style=3D"color: #2aa146;">=E5=9B=9B=E3=80=81=E6=B7=BB=E5=8A=A0=E5=AE=A2=
  =E6=9C=8D=EF=BC=8C=E4=BA=86=E8=A7=A3=E6=9C=80=E6=96=B0=E7=BE=A4=E5=8F=91=
  =E5=AE=9E=E6=88=98=E7=AD=96=E7=95=A5=E3=80=82</span></strong></p>
  <p style=3D"padding: 16px 0;"><a style=3D"background-color: #25b864; color:=
   #fff; margin: 0 auto; padding: 8px 16px; font-size: 14px; border-radius: =
  4px; text-decoration: none;" href=3D"https://files.laifaxin.=
  com/www/no-email/yjqf.html"> =F0=9F=91=89 =E6=9F=A5=E7=9C=8B=E3=80=8A=
  =E9=82=AE=E4=BB=B6=E7=BE=A4=E5=8F=91=E3=80=8B=E6=94=BB=E7=95=A5 =
  =F0=9F=91=88 </a></p>
  </div>
  </td>
  <td style=3D"padding: 0;" =
  align=3D"right" width=3D"40%">
  <div style=3D"text-align: center; =
  padding-top: 160px;"><img src=3D"https://files.laifaxin.com/www/no-email/kf=
  .png" width=3D"120" height=3D"120" />
  <p style=3D"font-size: 12px; color: =
  #ff3b30;"><strong> =E5=BE=AE=E4=BF=A1=E6=89=AB=E4=B8=80=E6=89=AB=EF=BC=8C=
  =E8=8E=B7=E5=8F=96=E7=BE=A4=E5=8F=91=E5=B8=AE=E5=8A=A9 </strong></p>
  </div>
  </td>
  </tr>
  </tbody>
  </table>
  <table style=3D"border-collapse: collapse; =
  width: 600px;" border=3D"0" cellspacing=3D"0" cellpadding=3D"0" =
  align=3D"center">
  <tbody>
  <tr>
  <td style=3D"padding: 16px 0;" =
  align=3D"center">
  <p>=E6=9B=B4=E5=A4=9A=E5=B8=AE=E5=8A=A9=EF=BC=8C=
  =E8=AF=B7=E6=9F=A5=E7=9C=8B <a href=3D"https://files.laifaxin.=
  com/www/no-email/bz.html" target=3D"_blank" rel=3D"noopener"> =
  =E3=80=8A=E5=B8=AE=E5=8A=A9=E6=96=87=E6=A1=A3=E3=80=8B </a></p>
  </td>
  </tr>
  </tbody>
  </table>
  `;
