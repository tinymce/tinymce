import{r as o,j as u}from"./iframe-BhQbq8zk.js";import{A as n}from"./AutoResizingTextarea-B_-8vVEX.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-BaJhmSJn.js";import"./Optional-DbTLtGQT.js";import"./Strings-tLOZuS7x.js";import"./Fun--VEwoXIw.js";import"./Obj-DUQpguIS.js";const x={title:"components/AutoResizingTextarea",component:n,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"]},a={args:{value:"initial value"},render:e=>{const[r,s]=o.useState(e.value);return u.jsx(n,{...e,value:r,onChange:s})}},t={args:{value:"initial value"},render:e=>{const[r,s]=o.useState(e.value);return u.jsx(n,{value:r,onChange:s,minHeight:{unit:"rows",value:2}})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const h=["Example","StartsWith2Rows"];export{a as Example,t as StartsWith2Rows,h as __namedExportsOrder,x as default};
