"use strict";(self.webpackChunklaifaxin_web=self.webpackChunklaifaxin_web||[]).push([[5554],{88208:function(_,j,n){var I=n(30279),v=n.n(I),S=n(85170),l=n(91522),h=n(43010);j.Z=function(m){var p=m.children,P=m.pageTitle;return(0,h.jsx)(h.Fragment,{children:(0,h.jsx)(l._z,v()(v()({header:{title:P,breadcrumb:{}}},m),{},{children:p}))})}},56314:function(_,j,n){var I=n(85170),v=n(80661),S=n(22196),l=n(43010);j.Z=function(h){var m=h.children,p=h.accessKey,P=(0,S.useModel)("@@initialState"),O=P.initialState;if(!O)return(0,l.jsx)(v.Z,{size:"large",children:"\u672A\u767B\u5F55"});var y=O.userPermissions,E=O.currentUser,A=function(){var T,x=E!=null?E:{},r=x.uid,B=x.orgId;return!!(!B||r===B||!p||y!=null&&(T=y[p])!==null&&T!==void 0&&T.checked)};return(0,l.jsx)(S.Access,{accessible:A(),children:m})}},58386:function(_,j,n){n.r(j),n.d(j,{default:function(){return N}});var I=n(46686),v=n.n(I),S=n(85170),l=n(33285),h=n(16798),m=n(13590),p=n(6416),P=n(22196),O=n(66694),y=n(88665),E=n(31810),A=n(41318),Z=n(58110),T=n(2800),x=n(43520),r=n(43010),B=function($){var d=$.visible,D=$.onCancel,M=$.actionReload,U=$.values,e=E.Z.useForm(),t=v()(e,1),s=t[0],i=(0,P.useRequest)(O.B6,{manual:!0,onSuccess:function(){A.ZP.success("\u4FEE\u6539\u6210\u529F"),D(),M()}}),c=i.run,a=i.loading;return(0,S.useEffect)(function(){d&&(s.resetFields(),s.setFieldsValue(U))},[d]),(0,r.jsx)(Z.Z,{destroyOnClose:!0,title:"\u4FEE\u6539\u56E2\u961F\u6216\u4F01\u4E1A",open:d,onCancel:function(){return D()},footer:null,children:(0,r.jsxs)(E.Z,{form:s,onFinish:c,layout:"vertical",size:"large",style:{paddingLeft:24,paddingRight:24},initialValues:{scale:1},children:[(0,r.jsx)(E.Z.Item,{label:"\u56E2\u961F\u6216\u4F01\u4E1A\u540D\u79F0",name:"name",rules:[{required:!0,message:"\u8BF7\u8F93\u5165\u56E2\u961F\u6216\u4F01\u4E1A\u540D\u79F0"}],children:(0,r.jsx)(T.Z,{placeholder:"\u8BF7\u8F93\u5165\u56E2\u961F\u6216\u4F01\u4E1A\u540D\u79F0"})}),(0,r.jsx)(E.Z.Item,{label:"\u9884\u8BA1\u4F7F\u7528\u89C4\u6A21",name:"scale",children:(0,r.jsxs)(x.Z,{children:[(0,r.jsx)(x.Z.Option,{value:1,children:"1 ~ 10 \u4EBA"},"selectKey1"),(0,r.jsx)(x.Z.Option,{value:2,children:"11 ~ 50 \u4EBA"},"selectKey2"),(0,r.jsx)(x.Z.Option,{value:3,children:"51 ~ 100 \u4EBA"},"selectKey3"),(0,r.jsx)(x.Z.Option,{value:4,children:"101 ~ 300 \u4EBA"},"selectKey4"),(0,r.jsx)(x.Z.Option,{value:5,children:"301 ~ 1000 \u4EBA"},"selectKey5"),(0,r.jsx)(x.Z.Option,{value:6,children:"101 \u4EBA\u53CA\u4EE5\u4E0A"},"selectKey6")]})}),(0,r.jsx)(E.Z.Item,{children:(0,r.jsx)(h.ZP,{type:"primary",htmlType:"submit",loading:a,children:"\u4FDD\u5B58"})})]})})},w=B,q=n(56314),k=n(88208),ee=function(){var $=(0,P.useRequest)(O.y_),d=$.data,D=$.loading,M=$.refresh,U=(0,S.useState)(!1),e=v()(U,2),t=e[0],s=e[1],i=function(){if(!d)return"";var o=d.level;return o===0?"\u8BD5\u7528\u7248":o===1?"\u4F01\u4E1A\u7248":o},c=function(o){return!d||!d[o]?"":(0,y.HS)(d[o])};return(0,r.jsxs)(k.Z,{pageTitle:!1,pageGroup:"enterprise",pageActive:"profile",children:[(0,r.jsx)(l.Z,{title:"\u5F53\u524D\u4F01\u4E1A\u4FE1\u606F",loading:D,bordered:!0,extra:(0,r.jsx)(q.Z,{accessKey:"enterprise.profile.modify",children:(0,r.jsx)(h.ZP,{type:"primary",onClick:function(){return s(!0)},children:"\u4FEE\u6539"})}),children:(0,r.jsxs)(m.Z,{column:1,style:{margin:"auto",maxWidth:400},labelStyle:{fontSize:20,minWidth:96},contentStyle:{fontSize:20},children:[(0,r.jsx)(m.Z.Item,{label:"\u4F01\u4E1AID",children:(0,r.jsx)(p.Z.Text,{strong:!0,copyable:!0,children:d==null?void 0:d.uid})}),(0,r.jsx)(m.Z.Item,{label:"\u4F01\u4E1A\u540D\u79F0",children:(0,r.jsx)(p.Z.Text,{strong:!0,copyable:!0,children:d==null?void 0:d.name})}),(0,r.jsx)(m.Z.Item,{label:"\u6210\u5458\u6570\u91CF",children:(0,r.jsx)(p.Z.Text,{strong:!0,children:d==null?void 0:d.userCount})}),(0,r.jsx)(m.Z.Item,{label:"\u521B\u5EFA\u65F6\u95F4",children:(0,r.jsx)(p.Z.Text,{strong:!0,children:c("create_time")})}),(0,r.jsx)(m.Z.Item,{label:"\u7248\u672C\u4FE1\u606F",children:(0,r.jsx)(p.Z.Text,{strong:!0,children:i()})}),(0,r.jsx)(m.Z.Item,{label:"\u5230\u671F\u65F6\u95F4",children:(0,r.jsx)(p.Z.Text,{strong:!0,children:c("expire_time")})})]})}),(0,r.jsx)(w,{visible:t,onCancel:function(){return s(!1)},actionReload:function(){return M()},values:d})]})},N=ee},13590:function(_,j,n){n.d(j,{K:function(){return N},Z:function(){return U}});var I=n(84875),v=n.n(I),S=n(40778),l=n(85170),h=n(97618),m=n(88934),p=n(25262),O=e=>{let{children:t}=e;return t};function y(e){return e!=null}var A=e=>{let{itemPrefixCls:t,component:s,span:i,className:c,style:a,labelStyle:o,contentStyle:C,bordered:b,label:f,content:u,colon:L}=e;const F=s;return b?l.createElement(F,{className:v()({[`${t}-item-label`]:y(f),[`${t}-item-content`]:y(u)},c),style:a,colSpan:i},y(f)&&l.createElement("span",{style:o},f),y(u)&&l.createElement("span",{style:C},u)):l.createElement(F,{className:v()(`${t}-item`,c),style:a,colSpan:i},l.createElement("div",{className:`${t}-item-container`},(f||f===0)&&l.createElement("span",{className:v()(`${t}-item-label`,{[`${t}-item-no-colon`]:!L}),style:o},f),(u||u===0)&&l.createElement("span",{className:v()(`${t}-item-content`),style:C},u)))};function Z(e,t,s){let{colon:i,prefixCls:c,bordered:a}=t,{component:o,type:C,showLabel:b,showContent:f,labelStyle:u,contentStyle:L}=s;return e.map((F,R)=>{let{props:{label:K,children:V,prefixCls:W=c,className:g,style:z,labelStyle:X,contentStyle:J,span:Q=1},key:H}=F;return typeof o=="string"?l.createElement(A,{key:`${C}-${H||R}`,className:g,style:z,labelStyle:Object.assign(Object.assign({},u),X),contentStyle:Object.assign(Object.assign({},L),J),span:Q,colon:i,component:o,itemPrefixCls:W,bordered:a,label:b?K:null,content:f?V:null}):[l.createElement(A,{key:`label-${H||R}`,className:g,style:Object.assign(Object.assign(Object.assign({},u),z),X),span:1,colon:i,component:o[0],itemPrefixCls:W,bordered:a,label:K}),l.createElement(A,{key:`content-${H||R}`,className:g,style:Object.assign(Object.assign(Object.assign({},L),z),J),span:Q*2-1,component:o[1],itemPrefixCls:W,bordered:a,content:V})]})}var x=e=>{const t=l.useContext(N),{prefixCls:s,vertical:i,row:c,index:a,bordered:o}=e;return i?l.createElement(l.Fragment,null,l.createElement("tr",{key:`label-${a}`,className:`${s}-row`},Z(c,e,Object.assign({component:"th",type:"label",showLabel:!0},t))),l.createElement("tr",{key:`content-${a}`,className:`${s}-row`},Z(c,e,Object.assign({component:"td",type:"content",showContent:!0},t)))):l.createElement("tr",{key:a,className:`${s}-row`},Z(c,e,Object.assign({component:o?["th","td"]:"td",type:"item",showLabel:!0,showContent:!0},t)))},r=n(68141),B=n(21288),w=n(14485);const q=e=>{const{componentCls:t,descriptionsSmallPadding:s,descriptionsDefaultPadding:i,descriptionsMiddlePadding:c,descriptionsBg:a}=e;return{[`&${t}-bordered`]:{[`${t}-view`]:{border:`${e.lineWidth}px ${e.lineType} ${e.colorSplit}`,"> table":{tableLayout:"auto",borderCollapse:"collapse"}},[`${t}-item-label, ${t}-item-content`]:{padding:i,borderInlineEnd:`${e.lineWidth}px ${e.lineType} ${e.colorSplit}`,"&:last-child":{borderInlineEnd:"none"}},[`${t}-item-label`]:{color:e.colorTextSecondary,backgroundColor:a,"&::after":{display:"none"}},[`${t}-row`]:{borderBottom:`${e.lineWidth}px ${e.lineType} ${e.colorSplit}`,"&:last-child":{borderBottom:"none"}},[`&${t}-middle`]:{[`${t}-item-label, ${t}-item-content`]:{padding:c}},[`&${t}-small`]:{[`${t}-item-label, ${t}-item-content`]:{padding:s}}}}},k=e=>{const{componentCls:t,descriptionsExtraColor:s,descriptionItemPaddingBottom:i,descriptionsItemLabelColonMarginRight:c,descriptionsItemLabelColonMarginLeft:a,descriptionsTitleMarginBottom:o}=e;return{[t]:Object.assign(Object.assign(Object.assign({},(0,w.Wf)(e)),q(e)),{["&-rtl"]:{direction:"rtl"},[`${t}-header`]:{display:"flex",alignItems:"center",marginBottom:o},[`${t}-title`]:Object.assign(Object.assign({},w.vS),{flex:"auto",color:e.colorText,fontWeight:e.fontWeightStrong,fontSize:e.fontSizeLG,lineHeight:e.lineHeightLG}),[`${t}-extra`]:{marginInlineStart:"auto",color:s,fontSize:e.fontSize},[`${t}-view`]:{width:"100%",borderRadius:e.borderRadiusLG,table:{width:"100%",tableLayout:"fixed"}},[`${t}-row`]:{"> th, > td":{paddingBottom:i},"&:last-child":{borderBottom:"none"}},[`${t}-item-label`]:{color:e.colorTextTertiary,fontWeight:"normal",fontSize:e.fontSize,lineHeight:e.lineHeight,textAlign:"start","&::after":{content:'":"',position:"relative",top:-.5,marginInline:`${a}px ${c}px`},[`&${t}-item-no-colon::after`]:{content:'""'}},[`${t}-item-no-label`]:{"&::after":{margin:0,content:'""'}},[`${t}-item-content`]:{display:"table-cell",flex:1,color:e.colorText,fontSize:e.fontSize,lineHeight:e.lineHeight,wordBreak:"break-word",overflowWrap:"break-word"},[`${t}-item`]:{paddingBottom:0,verticalAlign:"top","&-container":{display:"flex",[`${t}-item-label`]:{display:"inline-flex",alignItems:"baseline"},[`${t}-item-content`]:{display:"inline-flex",alignItems:"baseline"}}},"&-middle":{[`${t}-row`]:{"> th, > td":{paddingBottom:e.paddingSM}}},"&-small":{[`${t}-row`]:{"> th, > td":{paddingBottom:e.paddingXS}}}})}};var ee=(0,r.Z)("Descriptions",e=>{const t=e.colorFillAlter,s=e.fontSizeSM*e.lineHeightSM,i=e.colorText,c=`${e.paddingXS}px ${e.padding}px`,a=`${e.padding}px ${e.paddingLG}px`,o=`${e.paddingSM}px ${e.paddingLG}px`,C=e.padding,b=e.marginXS,f=e.marginXXS/2,u=(0,B.TS)(e,{descriptionsBg:t,descriptionsTitleMarginBottom:s,descriptionsExtraColor:i,descriptionItemPaddingBottom:C,descriptionsSmallPadding:c,descriptionsDefaultPadding:a,descriptionsMiddlePadding:o,descriptionsItemLabelColonMarginRight:b,descriptionsItemLabelColonMarginLeft:f});return[k(u)]});const N=l.createContext({}),G={xxl:3,xl:3,lg:3,md:3,sm:2,xs:1};function $(e,t){if(typeof e=="number")return e;if(typeof e=="object")for(let s=0;s<p.c.length;s++){const i=p.c[s];if(t[i]&&e[i]!==void 0)return e[i]||G[i]}return 3}function d(e,t,s){let i=e;return(s===void 0||s>t)&&(i=(0,m.Tm)(e,{span:t})),i}function D(e,t){const s=(0,S.Z)(e).filter(o=>o),i=[];let c=[],a=t;return s.forEach((o,C)=>{var b;const f=(b=o.props)===null||b===void 0?void 0:b.span,u=f||1;if(C===s.length-1){c.push(d(o,a,f)),i.push(c);return}u<a?(a-=u,c.push(o)):(c.push(d(o,a,u)),i.push(c),a=t,c=[])}),i}function M(e){let{prefixCls:t,title:s,extra:i,column:c=G,colon:a=!0,bordered:o,layout:C,children:b,className:f,rootClassName:u,style:L,size:F,labelStyle:R,contentStyle:K}=e;const{getPrefixCls:V,direction:W}=l.useContext(h.E_),g=V("descriptions",t),[z,X]=l.useState({}),J=$(c,z),[Q,H]=ee(g),ne=(0,p.Z)();l.useEffect(()=>{const te=ne.subscribe(Y=>{typeof c=="object"&&X(Y)});return()=>{ne.unsubscribe(te)}},[]);const le=D(b,J),re=l.useMemo(()=>({labelStyle:R,contentStyle:K}),[R,K]);return Q(l.createElement(N.Provider,{value:re},l.createElement("div",{className:v()(g,{[`${g}-${F}`]:F&&F!=="default",[`${g}-bordered`]:!!o,[`${g}-rtl`]:W==="rtl"},f,u,H),style:L},(s||i)&&l.createElement("div",{className:`${g}-header`},s&&l.createElement("div",{className:`${g}-title`},s),i&&l.createElement("div",{className:`${g}-extra`},i)),l.createElement("div",{className:`${g}-view`},l.createElement("table",null,l.createElement("tbody",null,le.map((te,Y)=>l.createElement(x,{key:Y,index:Y,colon:a,prefixCls:g,vertical:C==="vertical",bordered:o,row:te}))))))))}M.Item=O;var U=M}}]);
