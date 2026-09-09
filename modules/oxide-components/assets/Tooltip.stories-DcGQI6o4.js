import{j as t}from"./iframe-DKMkJvMs.js";import{U as s}from"./UniverseProvider-BHZ20yNP.js";import{R as a,T as i,C as n}from"./Tooltip-DjJx93Qi.js";import{i as l}from"./Optional-CwIPeCD0.js";import{g as p}from"./Obj-BEXbhZhc.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-jw9k3Vcm.js";import"./PredicateFind--7pRSCFh.js";import"./Strings-DwL7BECk.js";import"./Context-CjfEVaNE.js";import"./Bem-Du84Tdvq.js";import"./Id--8xy-NHg.js";import"./Num-xrWELwUY.js";const c={close:'<svg width="24" height="24"><path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path></svg>'},d={getIcon:e=>p(c,e).getOrDie("Failed to get icon"),translate:l},T={title:"components/Tooltip",component:e=>t.jsxs(a,{showCondition:e.alwaysShow?"always":"overflow",children:[t.jsx(i,{children:t.jsx("div",{title:"hover",style:{border:"1px solid #000",maxWidth:"200px",maxHeight:"200px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:e.oversizeContent?"Hover Me, but Big".repeat(50):"Hover Me"})}),t.jsx(n,{text:e.text})]}),parameters:{layout:"centered"},tags:["autodocs"],decorators:[e=>t.jsx("div",{className:"tox-ai",children:t.jsx(s,{resources:d,children:t.jsx(e,{})})})]},o={args:{text:"Message",oversizeContent:!1,alwaysShow:!0}},r={args:{text:"Message",oversizeContent:!0,alwaysShow:!1}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Message',
    oversizeContent: false,
    alwaysShow: true
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Message',
    oversizeContent: true,
    alwaysShow: false
  }
}`,...r.parameters?.docs?.source}}};const z=["StandardTooltip","OverflowingTooltip"];export{r as OverflowingTooltip,o as StandardTooltip,z as __namedExportsOrder,T as default};
