import{r as o,j as u}from"./iframe-CR4ryuk2.js";import{A as n}from"./AutoResizingTextarea-bLM2llI2.js";import"./preload-helper-PPVm8Dsz.js";import"./Fun-DfA6N4bS.js";import"./Optional-BMqOXurB.js";import"./SugarElement-B83-kpSi.js";import"./Visibility-HiPE8kkv.js";import"./Bem-BAJJXTy-.js";import"./Strings-DatO8Mn0.js";import"./Obj-4mkygeuk.js";const S={title:"components/AutoResizingTextarea",component:n,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"]},a={args:{value:"initial value"},render:e=>{const[r,s]=o.useState(e.value);return u.jsx(n,{...e,value:r,onChange:s})}},t={args:{value:"initial value"},render:e=>{const[r,s]=o.useState(e.value);return u.jsx(n,{value:r,onChange:s,minHeight:{unit:"rows",value:2}})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
