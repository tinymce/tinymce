import{r as w,j as e}from"./iframe-m8jlWi5a.js";import{g as E}from"./icons-BH388hKR.js";import{B as n}from"./Button-C4Pj9Hl_.js";import{U as S}from"./UniverseProvider-6Km2qX_O.js";import{u as D}from"./Universe-DM4c6Udm.js";import{e as a,b as h}from"./Bem-uABtowwn.js";import{I as _}from"./IconButton-DkZACQq3.js";import{i as F}from"./Optional-C7ZieBtS.js";import{g as O}from"./Obj-DJRegViB.js";import"./preload-helper-PPVm8Dsz.js";import"./Strings-0z8lz2Ma.js";import"./Icon-B82XuRAQ.js";const L=o=>{switch(o){case"error":return h("tox-alert",{error:!0});case"warning":return h("tox-alert",{warning:!0});default:return h("tox-alert")}},b=w.forwardRef(({message:o,severity:f,removable:x=!1,onRemove:R,actions:A,closeAriaLabel:C,...j},B)=>{const{translate:W}=D(),y=C??W("Close");return e.jsxs("div",{ref:B,className:L(f),role:"alert",...j,children:[e.jsxs("div",{className:a("tox-alert","body"),children:[e.jsx("div",{className:a("tox-alert","content"),children:e.jsx("p",{className:a("tox-alert","message"),children:o})}),A&&e.jsx("div",{className:a("tox-alert","actions"),children:A})]}),x&&e.jsx(_,{variant:"naked",icon:"close",onClick:R,"aria-label":y})]})}),{fn:r}=__STORYBOOK_MODULE_TEST__,N=E(),T={close:N.close},U={getIcon:o=>O(T,o).getOrDie("Failed to get icon"),translate:F},I="The change is not supported by the editor and can't be previewed or applied.",P=o=>e.jsx("div",{style:{width:"480px"},children:e.jsx(b,{...o})}),$={title:"components/Alert",component:b,decorators:[o=>e.jsx(S,{resources:U,children:e.jsx(o,{})})],parameters:{layout:"centered",docs:{description:{component:"\nThe Alert component displays warning/error feedback with optional action and remove controls.\n\n## Props\n- `message`: string content shown in the alert body\n- `severity`: `error` | `warning`\n- `actions`: optional slot for one or more action buttons/components\n- `removable`: optional close affordance (requires `onRemove`)\n- `closeAriaLabel`: optional accessible label for the close button (defaults to `Close`)\n        "}}},tags:["autodocs"],args:{message:I,severity:"error"},render:P},t={},s={args:{removable:!0,onRemove:r(),closeAriaLabel:"Dismiss alert"}},i={args:{actions:e.jsx(n,{variant:"naked",onClick:r(),children:"Action"})}},c={args:{removable:!0,onRemove:r(),actions:e.jsx(n,{variant:"naked",onClick:r(),children:"Action"})}},l={args:{actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"naked",onClick:r(),children:"Action 1"}),e.jsx(n,{variant:"naked",onClick:r(),children:"Action 2"})]})}},m={args:{removable:!0,onRemove:r(),actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"naked",onClick:r(),children:"Action 1"}),e.jsx(n,{variant:"naked",onClick:r(),children:"Action 2"})]})}},d={args:{severity:"warning"}},u={args:{severity:"warning",removable:!0,onRemove:r()}},v={args:{severity:"warning",actions:e.jsx(n,{variant:"naked",onClick:r(),children:"Action"})}},p={args:{severity:"warning",removable:!0,onRemove:r(),actions:e.jsx(n,{variant:"naked",onClick:r(),children:"Action"})}},g={args:{severity:"warning",actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"naked",onClick:r(),children:"Retry"}),e.jsx(n,{variant:"naked",onClick:r(),children:"Dismiss all"})]})}},k={args:{severity:"warning",removable:!0,onRemove:r(),actions:e.jsxs(e.Fragment,{children:[e.jsx(n,{variant:"naked",onClick:r(),children:"Retry"}),e.jsx(n,{variant:"naked",onClick:r(),children:"Dismiss all"})]})}},ee=["ErrorAlert","ErrorRemovable","ErrorWithAction","ErrorRemovableWithAction","ErrorWithActions","ErrorRemovableWithActions","Warning","WarningRemovable","WarningWithAction","WarningRemovableWithAction","WarningWithActions","WarningRemovableWithActions"];t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    severity: 'warning',
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
}`,...v.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    severity: 'warning',
    removable: true,
    onRemove: fn(),
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};export{t as ErrorAlert,s as ErrorRemovable,c as ErrorRemovableWithAction,m as ErrorRemovableWithActions,i as ErrorWithAction,l as ErrorWithActions,d as Warning,u as WarningRemovable,p as WarningRemovableWithAction,k as WarningRemovableWithActions,v as WarningWithAction,g as WarningWithActions,ee as __namedExportsOrder,$ as default};
