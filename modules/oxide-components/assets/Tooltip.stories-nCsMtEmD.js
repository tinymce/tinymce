import{j as o}from"./iframe-z-JLygwu.js";import{R as s,T as a,C as i}from"./Tooltip-yyb_8hNL.js";import{U as n}from"./UniverseProvider-DcPj2fYi.js";import{g as l}from"./Obj-SoxFuRAr.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-HgeWKcVW.js";import"./Optional-BNsUfA-0.js";import"./PredicateFind-DCGfX9bu.js";import"./Strings-C1h4ndsz.js";import"./Fun-DfA6N4bS.js";import"./Bem-Bvj_EqVZ.js";import"./Context-CL_J5yi-.js";import"./Id--8xy-NHg.js";import"./Num-xrWELwUY.js";const p={close:'<svg width="24" height="24"><path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path></svg>'},c={getIcon:e=>l(p,e).getOrDie("Failed to get icon")},T={title:"components/Tooltip",component:e=>o.jsxs(s,{showCondition:e.alwaysShow?"always":"overflow",children:[o.jsx(a,{children:o.jsx("div",{title:"hover",style:{border:"1px solid #000",maxWidth:"200px",maxHeight:"200px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:e.oversizeContent?"Hover Me, but Big".repeat(50):"Hover Me"})}),o.jsx(i,{text:e.text})]}),parameters:{layout:"centered"},tags:["autodocs"],decorators:[e=>o.jsx("div",{className:"tox-ai",children:o.jsx(n,{resources:c,children:o.jsx(e,{})})})]},t={args:{text:"Message",oversizeContent:!1,alwaysShow:!0}},r={args:{text:"Message",oversizeContent:!0,alwaysShow:!1}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Message',
    oversizeContent: false,
    alwaysShow: true
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Message',
    oversizeContent: true,
    alwaysShow: false
  }
}`,...r.parameters?.docs?.source}}};const z=["StandardTooltip","OverflowingTooltip"];export{r as OverflowingTooltip,t as StandardTooltip,z as __namedExportsOrder,T as default};
