import{j as e}from"./iframe-CuNqc7t1.js";import{B as r}from"./Button-Cu1Oqro7.js";const{fn:S}=__STORYBOOK_MODULE_TEST__,_={title:"components/Button",component:r,parameters:{layout:"centered"},tags:["autodocs"],args:{onClick:S()}},t=a=>e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box",gap:"8px"},children:[e.jsx(r,{...a}),e.jsx(r,{...a,id:"hover",children:"Hover"}),e.jsx(r,{...a,id:"active",children:"Active"}),e.jsx(r,{...a,id:"focus",children:"Focused"}),e.jsx(r,{...a,disabled:!0,children:"Disabled"})]}),n={args:{children:"Primary"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:t},o={args:{children:"Secondary",variant:"secondary"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:t},s={args:{children:"Outlined",variant:"outlined"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:t},c={args:{children:"Naked",variant:"naked"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:t};var d,i,u;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(u=(i=n.parameters)==null?void 0:i.docs)==null?void 0:u.source}}};var p,v,m;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(f=(h=s.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var x,y,g;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(g=(y=c.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};const k=["Primary","Secondary","Outlined","Naked"];export{c as Naked,s as Outlined,n as Primary,o as Secondary,k as __namedExportsOrder,_ as default};
