"use strict";(self.webpackChunklaifaxin_web=self.webpackChunklaifaxin_web||[]).push([[1360],{9829:function(he,q,u){u.d(q,{J:function(){return z}});var L=u(49871),i=u(43010),z=function(w){var l=[],_={};for(var M in w){var g=w[M],b=g.parent,B=g.id,d=g.name,F=g.color,R=g.folder;if(R)_[B]=[];else{var D;(D=_[b])===null||D===void 0||D.push({id:B,value:B,title:(0,i.jsx)(L.Z,{color:F,children:d}),name:d})}}for(var C in w){var h=w[C],y=h.parent,T=h.id,k=h.name,N=h.color,v=h.folder;if(y==="0"&&v){var S=_[T];l.push({id:T,value:T,title:k,children:S})}else y==="0"&&!v&&l.push({id:T,value:T,title:(0,i.jsx)(L.Z,{color:N,children:k}),name:k})}return l}},36541:function(he,q,u){var L=u(30279),i=u.n(L),z=u(69946),s=u.n(z),w=u(46686),l=u.n(w),_=u(85170),M=u(41318),g=u(43267),b=u(42147),B=u(28931),d=u(2800),F=u(6416),R=u(11354),D=u(1406),C=u(18799),h=u(43520),y=u(14869),T=u(78730),k=u(74375),N=u(1166),v=u(10248),S=u(22196),I=u(9829),te=u(74637),K=u.n(te),o=u(43010),J=function(c){var A=c.field,E=A.dataIndex,O=A.valueType,H=A.multi,U=A.options,Q=A.items,ne=(0,N.Z)({tagName:"",tagsTreeData:[]}),W=l()(ne,2),$=W[0],j=W[1],se=(0,S.useRequest)(v.vs,{manual:!0,onSuccess:function(m){if(!!m){var re=(0,I.J)(m);j({tagsTreeData:re})}}}),V=se.run,ue=(0,S.useRequest)(v.eN,{manual:!0,onSuccess:function(){M.ZP.success("\u521B\u5EFA\u6807\u7B7E\u6210\u529F"),j({tagName:""}),V()}}),X=ue.run;if(!E)return null;var ie=function(){var m=$.tagName;if(!m){M.ZP.error("\u6807\u7B7E\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");return}if(!m.trim()){M.ZP.error("\u975E\u6CD5\u5B57\u7B26");return}X({name:m.trim()})},Y=function(){var m=[];if(U&&U.length&&s()(U)==="object"&&(m=U),E==="tags"){var re=(0,I.J)(Q);return(0,o.jsx)(g.Z,i()(i()({},c),{},{treeDataSimpleMode:!0,treeData:$.tagsTreeData.length?$.tagsTreeData:re,showArrow:!0,treeCheckable:!0,allowClear:!0,treeNodeFilterProp:"name",dropdownStyle:{width:256},dropdownRender:function(ae){return(0,o.jsxs)(o.Fragment,{children:[ae,(0,o.jsx)(b.Z,{style:{margin:"8px 0"}}),(0,o.jsxs)(B.Z,{align:"center",style:{padding:"0 8px 4px"},children:[(0,o.jsx)(d.Z,{placeholder:"\u589E\u52A0\u6807\u7B7E",value:$.tagName,onChange:function(Te){return j({tagName:Te.target.value})}}),(0,o.jsxs)(F.Z.Link,{style:{whiteSpace:"nowrap"},onClick:ie,children:[(0,o.jsx)(T.Z,{})," \u65B0\u589E\u6807\u7B7E"]}),(0,o.jsxs)("a",{style:{marginLeft:12},onClick:function(){return S.history.push("/settings/tags")},children:[(0,o.jsx)(k.Z,{})," \u6807\u7B7E\u7BA1\u7406"]})]})]})}}))}if(E==="c_name"||E==="department"||E==="position")return(0,o.jsx)(R.Z,i()(i()({},c),{},{options:U,allowClear:!0,filterOption:function(ae,f){return f!=null&&f.label&&typeof f.label=="string"?f.label.toUpperCase().indexOf(ae.toUpperCase())!==-1:!1}}));if(O==="date"){var P=c.value;return(typeof P=="string"||typeof P=="number")&&(P=K()(P)),(0,o.jsx)(D.Z,i()(i()({},c),{},{value:P}))}if(O==="dateTime"){var Z=c.value;return(typeof Z=="string"||typeof Z=="number")&&(Z=K()(Z)),(0,o.jsx)(D.Z,i()(i()({},c),{},{value:Z,showTime:!0}))}return O==="text"?(0,o.jsx)(d.Z,i()({},c)):O==="textarea"?(0,o.jsx)(d.Z.TextArea,i()({},c)):O==="digit"?(0,o.jsx)(C.Z,i()({},c)):O==="select"?"".concat(H)==="1"?(0,o.jsx)(h.Z,i()(i()({},c),{},{mode:"multiple",showArrow:!0,allowClear:!0,showSearch:!0,optionFilterProp:"label",options:m})):(0,o.jsx)(h.Z,i()(i()({},c),{},{showArrow:!0,allowClear:!0,showSearch:!0,optionFilterProp:"label",options:m})):O==="rate"?(0,o.jsx)(y.Z,i()({},c)):(0,o.jsx)(d.Z,i()({},c))};return Y()};q.Z=J},13949:function(he,q,u){u.d(q,{A1:function(){return h},C3:function(){return A},DI:function(){return S},Eg:function(){return te},Oe:function(){return D},Oo:function(){return T},QQ:function(){return Oe},RO:function(){return F},Uo:function(){return Ee},V$:function(){return O},be:function(){return g},dS:function(){return x},d_:function(){return ue},eE:function(){return ge},j9:function(){return ie},jy:function(){return se},mC:function(){return ne},q:function(){return ve},qi:function(){return U},r8:function(){return N},ti:function(){return $}});var L=u(30279),i=u.n(L),z=u(35290),s=u.n(z),w=u(411),l=u.n(w),_=u(22196),M=u(88665);function g(r){return b.apply(this,arguments)}function b(){return b=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/marketing/tasks/show",{method:"POST",data:n}));case 1:case"end":return e.stop()}},r)})),b.apply(this,arguments)}function B(){return d.apply(this,arguments)}function d(){return d=_asyncToGenerator(_regeneratorRuntime().mark(function r(){return _regeneratorRuntime().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",request("/api/marketing/tasks-count",{method:"POST"}));case 1:case"end":return t.stop()}},r)})),d.apply(this,arguments)}function F(r){return R.apply(this,arguments)}function R(){return R=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/marketing/task-details",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),R.apply(this,arguments)}function D(r){return C.apply(this,arguments)}function C(){return C=l()(s()().mark(function r(n){var t,e,p,a,ke;return s()().wrap(function(G){for(;;)switch(G.prev=G.next){case 0:return t=(0,M.aP)(n),G.next=3,(0,_.request)("/api/marketing/task-logs",{method:"POST",data:t});case 3:return e=G.sent,p=e.data,a=p.total,ke=p.current,G.abrupt("return",{data:p.list,total:a,current:ke});case 7:case"end":return G.stop()}},r)})),C.apply(this,arguments)}function h(r){return y.apply(this,arguments)}function y(){return y=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/marketing/task-rename",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),y.apply(this,arguments)}function T(){return k.apply(this,arguments)}function k(){return k=l()(s()().mark(function r(){return s()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",(0,_.request)("/api/tasks/get-mass-config",{method:"POST"}));case 1:case"end":return t.stop()}},r)})),k.apply(this,arguments)}function N(r){return v.apply(this,arguments)}function v(){return v=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/save-mass-config",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),v.apply(this,arguments)}function S(r){return I.apply(this,arguments)}function I(){return I=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/mass-count",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),I.apply(this,arguments)}function te(r){return K.apply(this,arguments)}function K(){return K=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/mass/add",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),K.apply(this,arguments)}function o(r){return J.apply(this,arguments)}function J(){return J=_asyncToGenerator(_regeneratorRuntime().mark(function r(n){return _regeneratorRuntime().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",request("/api/tasks/mass/save",{method:"POST",data:_objectSpread({},n)}));case 1:case"end":return e.stop()}},r)})),J.apply(this,arguments)}function ge(r){return c.apply(this,arguments)}function c(){return c=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/mass/info",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),c.apply(this,arguments)}function A(r){return E.apply(this,arguments)}function E(){return E=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/mass-audit",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),E.apply(this,arguments)}function O(r){return H.apply(this,arguments)}function H(){return H=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/mass-revoke",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),H.apply(this,arguments)}function U(r){return Q.apply(this,arguments)}function Q(){return Q=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/mass/delete",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),Q.apply(this,arguments)}function ne(r){return W.apply(this,arguments)}function W(){return W=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/mass/drop",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),W.apply(this,arguments)}function $(r){return j.apply(this,arguments)}function j(){return j=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/tasks/mass/start",{method:"POST",data:i()({},n)}));case 1:case"end":return e.stop()}},r)})),j.apply(this,arguments)}function se(r){return V.apply(this,arguments)}function V(){return V=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,_.request)("/api/tasks/mass/stop",{method:"POST",data:i()({},n)});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}},r)})),V.apply(this,arguments)}function ue(r){return X.apply(this,arguments)}function X(){return X=l()(s()().mark(function r(n){var t,e;return s()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,(0,_.request)("/api/marketing/task-html",{method:"POST",data:i()({},n)});case 2:return t=a.sent,e=t.data,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),X.apply(this,arguments)}function ie(r){return Y.apply(this,arguments)}function Y(){return Y=l()(s()().mark(function r(n){var t,e;return s()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,(0,_.request)("/api/marketing/task-tags",{method:"POST",data:i()({},n)});case 2:return t=a.sent,e=t.success,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),Y.apply(this,arguments)}function x(r){return m.apply(this,arguments)}function m(){return m=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,_.request)("/api/marketing/task-preview",{method:"POST",data:i()({},n)});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}},r)})),m.apply(this,arguments)}function re(r){return P.apply(this,arguments)}function P(){return P=_asyncToGenerator(_regeneratorRuntime().mark(function r(n){var t,e;return _regeneratorRuntime().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,request("/api/group/task-save",{method:"POST",data:_objectSpread({},n)});case 2:return t=a.sent,e=t.data,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),P.apply(this,arguments)}function Z(r){return ee.apply(this,arguments)}function ee(){return ee=_asyncToGenerator(_regeneratorRuntime().mark(function r(n){var t,e;return _regeneratorRuntime().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,request("/api/group/cost-check",{method:"POST",data:_objectSpread({},n)});case 2:return t=a.sent,e=t.data,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),ee.apply(this,arguments)}function ae(r){return f.apply(this,arguments)}function f(){return f=_asyncToGenerator(_regeneratorRuntime().mark(function r(n){var t,e;return _regeneratorRuntime().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,request("/api/group/task-multi-delete",{method:"POST",data:_objectSpread({},n)});case 2:return t=a.sent,e=t.success,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),f.apply(this,arguments)}function Te(r){return le.apply(this,arguments)}function le(){return le=_asyncToGenerator(_regeneratorRuntime().mark(function r(n){var t,e;return _regeneratorRuntime().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,request("/api/group/draft-delete",{method:"POST",data:_objectSpread({},n)});case 2:return t=a.sent,e=t.success,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),le.apply(this,arguments)}function Pe(r){return pe.apply(this,arguments)}function pe(){return pe=_asyncToGenerator(_regeneratorRuntime().mark(function r(n){var t,e;return _regeneratorRuntime().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,request("/api/group/recycle-multi-delete",{method:"POST",data:_objectSpread({},n)});case 2:return t=a.sent,e=t.success,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),pe.apply(this,arguments)}function we(){return _e.apply(this,arguments)}function _e(){return _e=_asyncToGenerator(_regeneratorRuntime().mark(function r(){var n,t;return _regeneratorRuntime().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,request("/api/group/task-get-other",{method:"POST"});case 2:return n=p.sent,t=n.data,p.abrupt("return",t);case 5:case"end":return p.stop()}},r)})),_e.apply(this,arguments)}function ve(r){return oe.apply(this,arguments)}function oe(){return oe=l()(s()().mark(function r(n){var t,e;return s()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,(0,_.request)("/api/marketing/task-display-more",{method:"POST",data:i()({},n)});case 2:return t=a.sent,e=t.data,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),oe.apply(this,arguments)}function De(){return ce.apply(this,arguments)}function ce(){return ce=_asyncToGenerator(_regeneratorRuntime().mark(function r(){var n,t;return _regeneratorRuntime().wrap(function(p){for(;;)switch(p.prev=p.next){case 0:return p.next=2,request("/api/group/customer-tree-data",{method:"POST"});case 2:return n=p.sent,t=n.data,p.abrupt("return",t);case 5:case"end":return p.stop()}},r)})),ce.apply(this,arguments)}function Ee(r){return me.apply(this,arguments)}function me(){return me=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/marketing/tracks/show",{method:"POST",data:n}));case 1:case"end":return e.stop()}},r)})),me.apply(this,arguments)}function Oe(r){return de.apply(this,arguments)}function de(){return de=l()(s()().mark(function r(n){return s()().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,_.request)("/api/marketing/tracks-tags",{method:"POST",data:n}));case 1:case"end":return e.stop()}},r)})),de.apply(this,arguments)}function ye(r){return fe.apply(this,arguments)}function fe(){return fe=_asyncToGenerator(_regeneratorRuntime().mark(function r(n){var t,e;return _regeneratorRuntime().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,request("/api/mail/track-output",{method:"POST",timeout:3e5,data:_objectSpread({},n)});case 2:return t=a.sent,e=t.data,a.abrupt("return",e);case 5:case"end":return a.stop()}},r)})),fe.apply(this,arguments)}}}]);