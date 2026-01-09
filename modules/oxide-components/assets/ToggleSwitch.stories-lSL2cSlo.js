import{r as a,j as s}from"./iframe-CmWCvaf2.js";import{n as E}from"./Fun--VEwoXIw.js";const n=a.forwardRef(({onClick:e,onKeyDown:t,checked:c,name:h,children:r,...k},I)=>s.jsxs("label",{className:"tox-toggle",children:[s.jsx("input",{type:"checkbox",ref:I,tabIndex:-1,checked:c,name:h,onClick:e,onKeyDown:t,"aria-checked":c,...k}),s.jsx("span",{className:"tox-toggle__slider"}),r]}));try{n.displayName="ToggleSwitch",n.__docgenInfo={description:"",displayName:"ToggleSwitch",props:{onClick:{defaultValue:null,description:"",name:"onClick",required:!0,type:{name:"() => void"}},onKeyDown:{defaultValue:null,description:"",name:"onKeyDown",required:!1,type:{name:"((e: KeyboardEvent<HTMLInputElement>) => void)"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}const{fn:O}=__STORYBOOK_MODULE_TEST__,N={title:"components/ToggleSwitch",component:n,parameters:{layout:"centered"},tags:["autodocs"],args:{onClick:O()}},l={args:{checked:!0,name:"toggle-checked",children:"Toggle switch"},render:e=>{const[t,c]=a.useState(e.checked);return s.jsx(n,{...e,checked:t,onClick:()=>c(!t),children:e.children})}},o={args:{checked:!1,name:"toggle-unchecked",children:"Toggle switch"},render:e=>{const[t,c]=a.useState(e.checked);return s.jsx(n,{...e,checked:t,onClick:()=>c(!t),children:e.children})}},d={args:{checked:!1,name:"toggle-without-label"},render:e=>{const[t,c]=a.useState(e.checked);return s.jsx(n,{...e,checked:t,onClick:()=>c(!t)})}},i={args:{checked:!1,name:"toggle-disabled",disabled:!0,children:"Toggle switch"},render:e=>{const[t,c]=a.useState(e.checked);return s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",alignItems:"flex-start"},children:[s.jsx(n,{...e,checked:t,onClick:()=>c(!t),children:"Disabled"}),s.jsx(n,{...e,checked:!0,onClick:()=>c(!t),children:"Disabled checked"})]})}},g={args:{name:"toggle-interactive"},render:()=>{const[e,t]=a.useState(!1),[c,h]=a.useState(!0),[r,k]=a.useState(!1);return s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",alignItems:"flex-start"},children:[s.jsx(n,{checked:e,name:"toggle-1",onClick:()=>t(!e),children:"Toggle 1"}),s.jsx(n,{checked:c,name:"toggle-2",onClick:()=>h(!c),children:"Toggle 2"}),s.jsx(n,{checked:r,name:"toggle-3",onClick:()=>k(!r),children:"Toggle 3"}),s.jsx(n,{checked:!1,name:"toggle-4",disabled:!0,onClick:()=>E(),children:"Toggle 4 (disabled)"})]})}};var u,m,p;l.parameters={...l.parameters,docs:{...(u=l.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    checked: true,
    name: 'toggle-checked',
    children: 'Toggle switch'
  },
  render: args => {
    const [checked, setChecked] = useState(args.checked);
    return <ToggleSwitch {...args} checked={checked} onClick={() => setChecked(!checked)}>
        {args.children}
      </ToggleSwitch>;
  }
}`,...(p=(m=l.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var S,x,T;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    checked: false,
    name: 'toggle-unchecked',
    children: 'Toggle switch'
  },
  render: args => {
    const [checked, setChecked] = useState(args.checked);
    return <ToggleSwitch {...args} checked={checked} onClick={() => setChecked(!checked)}>
        {args.children}
      </ToggleSwitch>;
  }
}`,...(T=(x=o.parameters)==null?void 0:x.docs)==null?void 0:T.source}}};var f,C,w;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    checked: false,
    name: 'toggle-without-label'
  },
  render: args => {
    const [checked, setChecked] = useState(args.checked);
    return <ToggleSwitch {...args} checked={checked} onClick={() => setChecked(!checked)} />;
  }
}`,...(w=(C=d.parameters)==null?void 0:C.docs)==null?void 0:w.source}}};var b,y,_;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    checked: false,
    name: 'toggle-disabled',
    disabled: true,
    children: 'Toggle switch'
  },
  render: args => {
    const [checked, setChecked] = useState(args.checked);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'flex-start'
    }}>
        <ToggleSwitch {...args} checked={checked} onClick={() => setChecked(!checked)}>
          Disabled
        </ToggleSwitch>
        <ToggleSwitch {...args} checked={true} onClick={() => setChecked(!checked)}>
          Disabled checked
        </ToggleSwitch>
      </div>;
  }
}`,...(_=(y=i.parameters)==null?void 0:y.docs)==null?void 0:_.source}}};var j,v,D;g.parameters={...g.parameters,docs:{...(j=g.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    name: 'toggle-interactive'
  },
  render: () => {
    const [state1, setState1] = useState(false);
    const [state2, setState2] = useState(true);
    const [state3, setState3] = useState(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'flex-start'
    }}>
        <ToggleSwitch checked={state1} name="toggle-1" onClick={() => setState1(!state1)}>
          Toggle 1
        </ToggleSwitch>
        <ToggleSwitch checked={state2} name="toggle-2" onClick={() => setState2(!state2)}>
          Toggle 2
        </ToggleSwitch>
        <ToggleSwitch checked={state3} name="toggle-3" onClick={() => setState3(!state3)}>
          Toggle 3
        </ToggleSwitch>
        <ToggleSwitch checked={false} name="toggle-4" disabled onClick={() => Fun.noop()}>
          Toggle 4 (disabled)
        </ToggleSwitch>
      </div>;
  }
}`,...(D=(v=g.parameters)==null?void 0:v.docs)==null?void 0:D.source}}};const q=["Checked","Unchecked","WithoutLabel","Disabled","Interactive"];export{l as Checked,i as Disabled,g as Interactive,o as Unchecked,d as WithoutLabel,q as __namedExportsOrder,N as default};
