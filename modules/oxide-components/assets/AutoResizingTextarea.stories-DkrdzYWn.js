import{r as o,j as u}from"./iframe-m8jlWi5a.js";import{A as n}from"./AutoResizingTextarea-BnN_tguZ.js";import"./preload-helper-PPVm8Dsz.js";import"./Optional-C7ZieBtS.js";import"./SugarElement-v4NJLiy_.js";import"./Visibility-HiPE8kkv.js";import"./Bem-uABtowwn.js";import"./Strings-0z8lz2Ma.js";import"./Obj-DJRegViB.js";const h={title:"components/AutoResizingTextarea",component:n,parameters:{layout:"centered"},tags:["autodocs"]},a={args:{value:"initial value"},render:e=>{const[r,s]=o.useState(e.value);return u.jsx(n,{...e,value:r,onChange:s})}},t={args:{value:"initial value"},render:e=>{const[r,s]=o.useState(e.value);return u.jsx(n,{value:r,onChange:s,minHeight:{unit:"rows",value:2}})}},S=["Example","StartsWith2Rows"];a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};export{a as Example,t as StartsWith2Rows,S as __namedExportsOrder,h as default};
