import{j as t}from"./iframe-J2gFPS-j.js";import{R as s,T as a,C as i}from"./Tooltip-DJQIVnIL.js";import{U as n}from"./UniverseProvider-C-OtDR6M.js";import{g as l}from"./Obj-SoxFuRAr.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-HgeWKcVW.js";import"./Optional-BNsUfA-0.js";import"./PredicateFind-BNrxGBih.js";import"./Strings-mgJOXRNf.js";import"./Fun-DfA6N4bS.js";import"./Context-Dlmr6jRg.js";import"./Id--8xy-NHg.js";import"./Num-xrWELwUY.js";import"./Bem-F6R1EozP.js";const p={close:'<svg width="24" height="24"><path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path></svg>'},c={getIcon:e=>l(p,e).getOrDie("Failed to get icon")},T={title:"components/Tooltip",component:e=>t.jsxs(s,{showCondition:e.alwaysShow?"always":"overflow",children:[t.jsx(a,{children:t.jsx("div",{title:"hover",style:{border:"1px solid #000",maxWidth:"200px",maxHeight:"200px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:e.oversizeContent?"Hover Me, but Big".repeat(50):"Hover Me"})}),t.jsx(i,{text:e.text})]}),parameters:{layout:"centered"},tags:["autodocs","hover-visual-testing","skip-visual-testing"],decorators:[e=>t.jsx("div",{className:"tox-ai",children:t.jsx(n,{resources:c,children:t.jsx(e,{})})})]},o={args:{text:"Message",oversizeContent:!1,alwaysShow:!0}},r={args:{text:"Message",oversizeContent:!0,alwaysShow:!1}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
