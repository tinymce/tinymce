import{j as e}from"./iframe-DzsrnzHR.js";import{I as m}from"./IconButton-BINGkDXY.js";import{U as i}from"./UniverseProvider-BfISix5e.js";import{b as c,e as a}from"./Bem-BJplfvtK.js";import{n as l}from"./Fun--VEwoXIw.js";import{g as d}from"./Obj-BYXNADYo.js";import"./preload-helper-PPVm8Dsz.js";import"./Button-Dl9m8ymt.js";import"./Icon-BWvvLQur.js";import"./Optional-CuHnBc-7.js";import"./Strings-CwVUhXDr.js";const g=r=>{const{message:t,removable:n}=r;return e.jsxs("div",{className:c("tox-ai-error"),role:"alert","aria-live":"polite",children:[e.jsx("div",{className:a("tox-ai-error","message"),children:t}),n&&e.jsx("div",{className:a("tox-ai-error","icon"),children:e.jsx(m,{variant:"naked",icon:"close",onClick:r.onRemove})})]})},p={close:'<svg width="24" height="24"><path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path></svg>'},v={getIcon:r=>d(p,r).getOrDie("Failed to get icon")},S={title:"bespoke/tinymceai/ErrorMessage",component:g,parameters:{layout:"centered"},tags:["autodocs"],decorators:[r=>e.jsx("div",{className:"tox-ai",children:e.jsx(i,{resources:v,children:e.jsx(r,{})})})]},s={args:{message:"Message"}},o={args:{message:"Message",removable:!0,onRemove:l}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Message'
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Message',
    removable: true,
    onRemove: Fun.noop
  }
}`,...o.parameters?.docs?.source}}};const I=["StandardErrorMessage","RemoveableErrorMessage"];export{o as RemoveableErrorMessage,s as StandardErrorMessage,I as __namedExportsOrder,S as default};
