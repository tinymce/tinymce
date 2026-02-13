import{j as e}from"./iframe-Bpfz3w10.js";import{B as r}from"./Button-DOJTGoBr.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-By0_poOi.js";import"./Optional-CuHnBc-7.js";import"./Strings-CwVUhXDr.js";import"./Fun--VEwoXIw.js";import"./Obj-BYXNADYo.js";const{fn:i}=__STORYBOOK_MODULE_TEST__,x={title:"components/Button",component:r,parameters:{layout:"centered"},tags:["autodocs"],args:{onClick:i()}},c=a=>e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box",gap:"8px"},children:[e.jsx(r,{...a}),e.jsx(r,{...a,active:!0,children:"Active prop true"}),e.jsx(r,{...a,id:"hover",children:"Hover"}),e.jsx(r,{...a,id:"active",children:"Css active state"}),e.jsx(r,{...a,id:"focus",children:"Focused"}),e.jsx(r,{...a,disabled:!0,children:"Disabled"})]}),n={args:{children:"Primary"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:c},o={args:{children:"Secondary",variant:"secondary"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:c},s={args:{children:"Outlined",variant:"outlined"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:c},t={args:{children:"Naked",variant:"naked"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:c};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Primary'
  },
  parameters: {
    pseudo: {
      hover: ['#hover'],
      active: ['#active'],
      focus: ['#focus']
    }
  },
  render
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Secondary',
    variant: 'secondary'
  },
  parameters: {
    pseudo: {
      hover: ['#hover'],
      active: ['#active'],
      focus: ['#focus']
    }
  },
  render
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Outlined',
    variant: 'outlined'
  },
  parameters: {
    pseudo: {
      hover: ['#hover'],
      active: ['#active'],
      focus: ['#focus']
    }
  },
  render
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Naked',
    variant: 'naked'
  },
  parameters: {
    pseudo: {
      hover: ['#hover'],
      active: ['#active'],
      focus: ['#focus']
    }
  },
  render
}`,...t.parameters?.docs?.source}}};const y=["Primary","Secondary","Outlined","Naked"];export{t as Naked,s as Outlined,n as Primary,o as Secondary,y as __namedExportsOrder,x as default};
