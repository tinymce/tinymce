import{j as e}from"./iframe-lCE6g0Kq.js";import{B as r}from"./Button-BwzdkHOv.js";import"./Bem-BjVdC6ql.js";import"./Optional-Bk48EtMP.js";import"./Strings-ChBvWd27.js";const{fn:S}=__STORYBOOK_MODULE_TEST__,B={title:"components/Button",component:r,parameters:{layout:"centered"},tags:["autodocs"],args:{onClick:S()}},c=a=>e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box",gap:"8px"},children:[e.jsx(r,{...a}),e.jsx(r,{...a,active:!0,children:"Active prop true"}),e.jsx(r,{...a,id:"hover",children:"Hover"}),e.jsx(r,{...a,id:"active",children:"Css active state"}),e.jsx(r,{...a,id:"focus",children:"Focused"}),e.jsx(r,{...a,disabled:!0,children:"Disabled"})]}),n={args:{children:"Primary"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:c},o={args:{children:"Secondary",variant:"secondary"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:c},s={args:{children:"Outlined",variant:"outlined"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:c},t={args:{children:"Naked",variant:"naked"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:c};var i,d,u;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(u=(d=n.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var p,v,m;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=(v=o.parameters)==null?void 0:v.docs)==null?void 0:m.source}}};var l,h,f;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(f=(h=s.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var x,y,g;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(g=(y=t.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};const E=["Primary","Secondary","Outlined","Naked"];export{t as Naked,s as Outlined,n as Primary,o as Secondary,E as __namedExportsOrder,B as default};
