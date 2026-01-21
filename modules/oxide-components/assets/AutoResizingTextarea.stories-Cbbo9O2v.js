import{r as p,j as v}from"./iframe-BIeJ5E1r.js";import{A as n}from"./AutoResizingTextarea-DooXUrcg.js";import"./Bem-DWdSENOI.js";import"./Optional-CilDcsXt.js";import"./Strings-BDyhe4Of.js";import"./Fun--VEwoXIw.js";import"./Obj-ycCTN9Ns.js";const A={title:"components/AutoResizingTextarea",component:n,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"]},a={args:{value:"initial value"},render:e=>{const[r,s]=p.useState(e.value);return v.jsx(n,{...e,value:r,onChange:s})}},t={args:{value:"initial value"},render:e=>{const[r,s]=p.useState(e.value);return v.jsx(n,{value:r,onChange:s,minHeight:{unit:"rows",value:2}})}};var o,u,i;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    value: 'initial value'
  },
  render: args => {
    const [value, setValue] = useState(args.value);
    return <AutoResizingTextarea {...args} value={value} onChange={setValue} />;
  }
}`,...(i=(u=a.parameters)==null?void 0:u.docs)==null?void 0:i.source}}};var l,m,c;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(c=(m=t.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};const E=["Example","StartsWith2Rows"];export{a as Example,t as StartsWith2Rows,E as __namedExportsOrder,A as default};
