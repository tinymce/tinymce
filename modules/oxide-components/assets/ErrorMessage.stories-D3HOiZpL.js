import{j as e}from"./iframe-tuiAydD7.js";import{I as p}from"./IconButton-v3pNI5a5.js";import{U as v}from"./UniverseProvider-BnPLMVuS.js";import{b as u,e as a}from"./Bem-A_X-XUhj.js";import{n as x}from"./Fun--VEwoXIw.js";import{g as M}from"./Obj-0QrmN1ba.js";import"./Button-B6YDcXDY.js";import"./Universe-CVvymJmW.js";import"./Optional-DGH8Y1w3.js";import"./Strings-CkeB91LW.js";const h=r=>{const{message:d,removable:g}=r;return e.jsxs("div",{className:u("tox-ai-error"),role:"alert","aria-live":"polite",children:[e.jsx("div",{className:a("tox-ai-error","message"),children:d}),g&&e.jsx("div",{className:a("tox-ai-error","icon"),children:e.jsx(p,{variant:"naked",icon:"close",onClick:r.onRemove})})]})},j={close:'<svg width="24" height="24"><path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path></svg>'},b={getIcon:r=>M(j,r).getOrDie("Failed to get icon")},O={title:"bespoke/tinymceai/ErrorMessage",component:h,parameters:{layout:"centered"},tags:["autodocs"],decorators:[r=>e.jsx("div",{className:"tox-ai",children:e.jsx(v,{resources:b,children:e.jsx(r,{})})})]},s={args:{message:"Message"}},o={args:{message:"Message",removable:!0,onRemove:x}};var t,n,m;s.parameters={...s.parameters,docs:{...(t=s.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    message: 'Message'
  }
}`,...(m=(n=s.parameters)==null?void 0:n.docs)==null?void 0:m.source}}};var i,c,l;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    message: 'Message',
    removable: true,
    onRemove: Fun.noop
  }
}`,...(l=(c=o.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const _=["StandardErrorMessage","RemoveableErrorMessage"];export{o as RemoveableErrorMessage,s as StandardErrorMessage,_ as __namedExportsOrder,O as default};
