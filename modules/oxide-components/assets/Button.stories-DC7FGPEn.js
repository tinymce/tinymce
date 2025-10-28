import{j as e}from"./iframe-CQQKTGU1.js";import{B as r}from"./Button-DF0-lB93.js";const{fn:S}=__STORYBOOK_MODULE_TEST__,_={title:"components/Button",component:r,parameters:{layout:"centered"},tags:["autodocs"],args:{onClick:S()}},t=a=>e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box",gap:"8px"},children:[e.jsx(r,{...a}),e.jsx(r,{...a,active:!0,children:"Active prop true"}),e.jsx(r,{...a,id:"hover",children:"Hover"}),e.jsx(r,{...a,id:"active",children:"Css active state"}),e.jsx(r,{...a,id:"focus",children:"Focused"}),e.jsx(r,{...a,disabled:!0,children:"Disabled"})]}),n={args:{children:"Primary"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:t},s={args:{children:"Secondary",variant:"secondary"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:t},o={args:{children:"Outlined",variant:"outlined"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:t},c={args:{children:"Naked",variant:"naked"},parameters:{pseudo:{hover:["#hover"],active:["#active"],focus:["#focus"]}},render:t};var i,d,u;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(u=(d=n.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var p,v,m;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=(v=s.parameters)==null?void 0:v.docs)==null?void 0:m.source}}};var l,h,f;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(f=(h=o.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var x,y,g;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(g=(y=c.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};const k=["Primary","Secondary","Outlined","Naked"];export{c as Naked,o as Outlined,n as Primary,s as Secondary,k as __namedExportsOrder,_ as default};
