import{r as w,j as e}from"./iframe-DKMkJvMs.js";import{g as E}from"./icons-CeCQNAbo.js";import{B as n}from"./Button-CnoGWjF3.js";import{U as _}from"./UniverseProvider-BHZ20yNP.js";import{u as S}from"./Universe-DMdW2Sux.js";import{e as o,b as h}from"./Bem-Du84Tdvq.js";import{I as D}from"./IconButton-DGJJKrvA.js";import{i as N}from"./Optional-CwIPeCD0.js";import{g as q}from"./Obj-BEXbhZhc.js";import"./preload-helper-PPVm8Dsz.js";import"./Strings-DwL7BECk.js";import"./Icon-F3P38j-G.js";const L=a=>{switch(a){case"error":return h("tox-alert",{error:!0});case"warning":return h("tox-alert",{warning:!0});default:return h("tox-alert")}},f=w.forwardRef(({message:a,severity:A,removable:x=!1,onRemove:y,actions:b,closeAriaLabel:R,...C},j)=>{const{translate:B}=S(),W=R??B("Close");return e.jsxs("div",{ref:j,className:L(A),role:"alert",...C,children:[e.jsxs("div",{className:o("tox-alert","body"),children:[e.jsx("div",{className:o("tox-alert","content"),children:e.jsx("p",{className:o("tox-alert","message"),children:a})}),b&&e.jsx("div",{className:o("tox-alert","actions"),children:b})]}),x&&e.jsx(D,{variant:"naked",icon:"close",onClick:y,"aria-label":W})]})});try{f.displayName="Alert",f.__docgenInfo={description:"",displayName:"Alert",props:{message:{defaultValue:null,description:"",name:"message",required:!0,type:{name:"string"}},severity:{defaultValue:null,description:"",name:"severity",required:!0,type:{name:'"error" | "warning"'}},actions:{defaultValue:null,description:"",name:"actions",required:!1,type:{name:"ReactNode"}},closeAriaLabel:{defaultValue:null,description:"",name:"closeAriaLabel",required:!1,type:{name:"string"}},removable:{defaultValue:{value:"false"},description:"",name:"removable",required:!1,type:{name:"boolean"}},onRemove:{defaultValue:null,description:"",name:"onRemove",required:!1,type:{name:"(() => void)"}}}}}catch{}const{fn:r}=__STORYBOOK_MODULE_TEST__,F=E(),O={close:F.close},V={getIcon:a=>q(O,a).getOrDie("Failed to get icon"),translate:N},I="The change is not supported by the editor and can't be previewed or applied.",T=a=>e.jsx("div",{style:{width:"480px"},children:e.jsx(f,{...a})}),$={title:"components/Alert",component:f,decorators:[a=>e.jsx(_,{resources:V,children:e.jsx(a,{})})],parameters:{layout:"centered",docs:{description:{component:"\nThe Alert component displays warning/error feedback with optional action and remove controls.\n\n## Props\n- `message`: string content shown in the alert body\n- `severity`: `error` | `warning`\n- `actions`: optional slot for one or more action buttons/components\n- `removable`: optional close affordance (requires `onRemove`)\n- `closeAriaLabel`: optional accessible label for the close button (defaults to `Close`)\n        "}}},tags:["autodocs"],args:{message:I,severity:"error"},render:T},t={},s={args:{removable:!0,onRemove:r(),closeAriaLabel:"Dismiss alert"}},i={args:{actions:e.jsx(n,{variant:"naked",onClick:r(),children:"Action"})}},c={args:{removable:!0,onRemove:r(),actions:e.jsx(n,{variant:"naked",onClick:r(),children:"Action"})}},l={args:{actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"naked",onClick:r(),children:"Action 1"}),e.jsx(n,{variant:"naked",onClick:r(),children:"Action 2"})]})}},m={args:{removable:!0,onRemove:r(),actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"naked",onClick:r(),children:"Action 1"}),e.jsx(n,{variant:"naked",onClick:r(),children:"Action 2"})]})}},d={args:{severity:"warning"}},u={args:{severity:"warning",removable:!0,onRemove:r()}},p={args:{severity:"warning",actions:e.jsx(n,{variant:"naked",onClick:r(),children:"Action"})}},v={args:{severity:"warning",removable:!0,onRemove:r(),actions:e.jsx(n,{variant:"naked",onClick:r(),children:"Action"})}},g={args:{severity:"warning",actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"naked",onClick:r(),children:"Retry"}),e.jsx(n,{variant:"naked",onClick:r(),children:"Dismiss all"})]})}},k={args:{severity:"warning",removable:!0,onRemove:r(),actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"naked",onClick:r(),children:"Retry"}),e.jsx(n,{variant:"naked",onClick:r(),children:"Dismiss all"})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    removable: true,
    onRemove: fn(),
    closeAriaLabel: 'Dismiss alert'
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    removable: true,
    onRemove: fn(),
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    actions: <>
        <Button variant='naked' onClick={fn()}>Action 1</Button>
        <Button variant='naked' onClick={fn()}>Action 2</Button>
      </>
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    removable: true,
    onRemove: fn(),
    actions: <>
        <Button variant='naked' onClick={fn()}>Action 1</Button>
        <Button variant='naked' onClick={fn()}>Action 2</Button>
      </>
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    severity: 'warning'
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    severity: 'warning',
    removable: true,
    onRemove: fn()
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    severity: 'warning',
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
}`,...p.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    severity: 'warning',
    removable: true,
    onRemove: fn(),
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
}`,...v.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    severity: 'warning',
    actions: <>
        <Button variant='naked' onClick={fn()}>Retry</Button>
        <Button variant='naked' onClick={fn()}>Dismiss all</Button>
      </>
  }
}`,...g.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    severity: 'warning',
    removable: true,
    onRemove: fn(),
    actions: <>
        <Button variant='naked' onClick={fn()}>Retry</Button>
        <Button variant='naked' onClick={fn()}>Dismiss all</Button>
      </>
  }
}`,...k.parameters?.docs?.source}}};const ee=["ErrorAlert","ErrorRemovable","ErrorWithAction","ErrorRemovableWithAction","ErrorWithActions","ErrorRemovableWithActions","Warning","WarningRemovable","WarningWithAction","WarningRemovableWithAction","WarningWithActions","WarningRemovableWithActions"];export{t as ErrorAlert,s as ErrorRemovable,c as ErrorRemovableWithAction,m as ErrorRemovableWithActions,i as ErrorWithAction,l as ErrorWithActions,d as Warning,u as WarningRemovable,v as WarningRemovableWithAction,k as WarningRemovableWithActions,p as WarningWithAction,g as WarningWithActions,ee as __namedExportsOrder,$ as default};
