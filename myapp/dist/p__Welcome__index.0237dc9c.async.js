"use strict";(self.webpackChunkant_design_pro=self.webpackChunkant_design_pro||[]).push([[871],{55959:function(w,F,t){t.r(F),t.d(F,{default:function(){return z}});var x=t(80854),A=t(67294),v=function(){var e=(0,A.useCallback)(function(a){x.history.push(a)},[]);return e},m=t(50337),h=t(92195),s=t(4393),E=t(71230),g=t(15746),B=t(51904),k=t(99138),r={box:"box___pODOW",item:"item___MMlov",label:"label___QB3ND",value:"value___LKvbh"},u=t(85893),C=[{label:"\u5F53\u524Dip",value:"127.0.0.1",key:"1"},{label:"\u4F4D\u7F6E\u4FE1\u606F",value:"\u5730\u7403",key:"2"},{label:"\u8BBF\u95EE\u901F\u5EA6",value:"1000ms",key:"3"},{label:"\u63D0\u793A\u4FE1\u606F",value:"66666",key:"4"}],D=function(e){var a=e.data,n=a===void 0?C:a;return(0,u.jsx)("div",{className:r.box,children:n.map(function(l){return(0,u.jsxs)("div",{className:r.item,children:[(0,u.jsx)("div",{className:r.label,children:l.label}),(0,u.jsx)("div",{className:r.value,children:l.value})]},l.key)})})},f=D,y=function(){return(0,u.jsx)(s.Z,{title:"\u767B\u9646\u4FE1\u606F",style:{marginTop:"10px",height:"30vh"},children:(0,u.jsx)(f,{data:[{label:"\u5F53\u524Dip",value:"http://127.0.0.1",key:"1"},{label:"\u4F4D\u7F6E\u4FE1\u606F",value:"\u4E2D\u56FD\u6C5F\u82CF\u7701\u5357\u4EAC (China Unicom Jiangsu Province Network)",key:"2"},{label:"\u8BBF\u95EE\u901F\u5EA6",value:(0,u.jsx)(B.Z,{color:"red",children:"1000ms"}),key:"3"},{label:"\u63D0\u793A\u4FE1\u606F",value:(0,u.jsx)(k.Z,{message:(0,u.jsx)("code",{children:"\u60A8\u6B63\u5728\u4F7F\u7528\u4EE3\u7406\u8F6F\u4EF6\uFF0C\u5EFA\u8BAE\u5173\u95ED\u4EE5\u63D0\u5347\u8BBF\u95EE\u4F53\u9A8C"}),type:"info",showIcon:!0,style:{fontSize:"12px"}}),key:"4"}]})})},j=y,p={box:"box___w2Icd",carditem:"carditem___T6VBU"},b=[{title:"\u8054\u7CFB\u4EBA\u65B0\u589E\u6570\u91CF",value:0,path:"/contacts/contacts"},{title:"\u8054\u7CFB\u4EBA\u5220\u9664\u6570\u91CF",value:0,path:"/contacts/recycle"},{title:"\u8054\u7CFB\u4EBA\u5BFC\u51FA\u4FE1\u606F",value:0,path:"/contacts/export-history"},{title:"\u83B7\u5BA2\u989D\u5EA6\u6D88\u8017",value:0,path:"/search/packages"},{title:"\u83B7\u5BA2\u90AE\u7BB1\u589E\u52A0",value:0,path:"/search/saved"},{title:"\u83B7\u5BA2\u4EFB\u52A1\u5B8C\u6210",value:0,path:"/search/tasks"},{title:"\u7FA4\u53D1\u989D\u5EA6\u6D88\u8017",value:0,path:"/marketing/tasks"},{title:"\u7FA4\u53D1\u90AE\u4EF6\u6570\u91CF",value:0,path:"/marketing/tasks"},{title:"\u7FA4\u53D1\u9605\u8BFB\u6570\u91CF",value:0,path:"/marketing/tasks"}],T=function(){var e=v();return(0,u.jsx)(s.Z,{title:"\u4ECA\u65E5\u6570\u636E",style:{marginTop:"10px",height:"30vh"},bodyStyle:{width:"100%",height:"86%",padding:0},children:(0,u.jsx)("div",{className:p.box,children:b.map(function(a,n){return(0,u.jsxs)(s.Z.Grid,{className:p.carditem,onClick:function(){return e(a.path)},children:[(0,u.jsx)("h5",{children:a.title}),(0,u.jsx)("p",{children:a.value})]},n)})})})},S=T,I={card:"card___jeSnr"},d=function(e){var a=e.title,n=e.href,l=e.index,o=e.desc,N=h.Z.useToken,L=N(),c=L.token,W=v();return(0,u.jsxs)("div",{onClick:function(){return W(n)},className:I.card,style:{borderRadius:"8px",fontSize:"14px",color:c.colorTextSecondary,lineHeight:"22px",padding:"16px 19px",minWidth:"220px",flex:1},children:[(0,u.jsxs)("div",{style:{display:"flex",gap:"4px",alignItems:"center"},children:[(0,u.jsx)("div",{style:{width:48,height:48,lineHeight:"22px",backgroundSize:"100%",textAlign:"center",padding:"8px 16px 16px 12px",color:"#FFF",fontWeight:"bold",backgroundImage:"url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')"},children:l}),(0,u.jsx)("div",{style:{fontSize:"16px",color:c.colorText,paddingBottom:8},children:a})]}),(0,u.jsx)("div",{style:{fontSize:"14px",color:c.colorTextSecondary,textAlign:"justify",lineHeight:"22px",marginBottom:8},children:o})]})},Z=function(){var e,a=h.Z.useToken(),n=a.token,l=(0,x.useModel)("@@initialState"),o=l.initialState;return(0,u.jsxs)(m._z,{children:[(0,u.jsx)(s.Z,{style:{borderRadius:8},bodyStyle:{backgroundImage:(o==null||(e=o.settings)===null||e===void 0?void 0:e.navTheme)==="realDark"?"background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)":"background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)"},children:(0,u.jsxs)("div",{style:{backgroundPosition:"100% -30%",backgroundRepeat:"no-repeat",backgroundSize:"274px auto",backgroundImage:"url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')"},children:[(0,u.jsx)("div",{style:{fontSize:"20px",color:n.colorTextHeading},children:"\u6B22\u8FCE\u4F7F\u7528 \u6765\u53D1\u4FE1"}),(0,u.jsx)("p",{style:{fontSize:"14px",color:n.colorTextSecondary,lineHeight:"22px",marginTop:16,marginBottom:32,width:"65%"},children:"\u4E13\u4E3A\u5916\u8D38\u4F01\u4E1A\u63D0\u4F9B\u5168\u7403\u8425\u9500\u7684\u4E00\u7AD9\u5F0F\u670D\u52A1\u5E73\u53F0\uFF0C\u52A9\u529B\u5916\u8D38\u4E1A\u52A1\u98DE\u901F\u53D1\u5C55"}),(0,u.jsxs)("div",{style:{display:"flex",flexWrap:"wrap",gap:16},children:[(0,u.jsx)(d,{index:1,href:"/search/global-engine",title:"\u5168\u7403\u5BA2\u6237\u641C\u7D22",desc:"Google\u3001LinkedIn\u3001Facebook\u3001Twitter\u3001Zoominfo\u7B49\uFF0C\u4E00\u952E\u83B7\u53D6\u59D3\u540D\u3001\u804C\u4F4D\u3001\u793E\u5A92\u3001\u4F01\u4E1A\u5B98\u7F51\u7B49\u3002"}),(0,u.jsx)(d,{index:2,title:"\u90AE\u7BB1\u6279\u91CF\u9A8C\u8BC1",href:"/contacts/companies",desc:"\u90AE\u7BB1\u9A8C\u8BC1\u670D\u52A1\u5B8C\u5168\u514D\u8D39\uFF0C\u5355\u65E5\u53EF\u9A8C\u8BC1\u4E0A\u767E\u4E07\u90AE\u7BB1\uFF0C\u5168\u7403\u90AE\u7BB1\u9A8C\u8BC1\u51C6\u786E\u738799%+\u3002"}),(0,u.jsx)(d,{index:3,title:"\u90AE\u4EF6\u8425\u9500\u670D\u52A1",href:"/marketing/tasks",desc:"\u6279\u91CF\u81EA\u52A8\u53D1\u9001\u90AE\u7BB1\uFF0C\u652F\u6301\u6570\u636E\u7EDF\u8BA1\uFF0C\u5B9E\u65F6\u8FFD\u8E2A\u53D1\u9001\u6548\u679C\uFF0C\u4F4E\u6210\u672C\uFF0C\u4E2A\u6027\u5316\uFF0C\u8F7B\u677E\u4E0A\u624B\u3002"}),(0,u.jsx)(d,{index:4,title:"\u90AE\u4EF6\u5B9E\u65F6\u8FFD\u8E2A",href:"/marketing/tasks",desc:"\u5B9E\u65F6\u4E86\u89E3\u5BA2\u6237\u9605\u8BFB\u3001\u70B9\u51FB\u3001\u4E0B\u8F7D\u51FB\u72B6\u6001\u53CA\u65F6\u8DDF\u8FDB\u5BA2\u6237\u60C5\u51B5\uFF0C\u81EA\u52A8\u7EDF\u8BA1\u8FFD\u8E2A\u6570\u636E\uFF0C\u5BA2\u6237\u5F00\u53D1\u66F4\u9AD8\u6548\u3002"})]})]})}),(0,u.jsxs)(E.Z,{wrap:!0,justify:"space-between",gutter:16,children:[(0,u.jsx)(g.Z,{xl:15,xs:24,children:(0,u.jsx)(S,{})}),(0,u.jsx)(g.Z,{xl:9,xs:24,children:(0,u.jsx)(j,{})})]})]})},z=Z}}]);