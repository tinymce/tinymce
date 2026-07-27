import{r as o,j as u}from"./iframe-C6b9XVTn.js";import{A as n}from"./AutoResizingTextarea-BPydi7t-.js";import"./preload-helper-PPVm8Dsz.js";import"./Fun-DfA6N4bS.js";import"./Optional-BNsUfA-0.js";import"./SugarElement-HgeWKcVW.js";import"./Visibility-HiPE8kkv.js";import"./Bem-Bvj_EqVZ.js";import"./Strings-C1h4ndsz.js";import"./Obj-SoxFuRAr.js";const S={title:"components/AutoResizingTextarea",component:n,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"]},a={args:{value:"initial value"},render:e=>{const[r,s]=o.useState(e.value);return u.jsx(n,{...e,value:r,onChange:s})}},t={args:{value:"initial value"},render:e=>{const[r,s]=o.useState(e.value);return u.jsx(n,{value:r,onChange:s,minHeight:{unit:"rows",value:2}})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'initial value'
  },
  render: args => {
    const [value, setValue] = useState(args.value);
    return <AutoResizingTextarea {...args} value={value} onChange={setValue} />;
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'initial value'
  },
  render: args => {
    const [value, setValue] = useState(args.value);
    return <AutoResizingTextarea value={value} onChange={setValue} minHeight={{
      unit: 'rows',
      value: 2
    }} />;
  }
}`,...t.parameters?.docs?.source}}};const R=["Example","StartsWith2Rows"];export{a as Example,t as StartsWith2Rows,R as __namedExportsOrder,S as default};
