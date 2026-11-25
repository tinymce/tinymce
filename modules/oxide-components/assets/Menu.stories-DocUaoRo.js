import{j as e,r as t}from"./iframe-m8jlWi5a.js";import{R as E,T as A,C as D}from"./Dropdown-aYgGxssW.js";import{I as j}from"./Icon-B82XuRAQ.js";import{I as H}from"./IconButton-DkZACQq3.js";import{R as G,T as Y,C as W}from"./Tooltip-CmvLZS0f.js";import{U as N}from"./UniverseProvider-6Km2qX_O.js";import{R as T,I as S}from"./Menu-DwCcKtyP.js";import{n as z,a as I,e as _,f as J,d as q,i as K}from"./Optional-C7ZieBtS.js";import{g as d}from"./Id--8xy-NHg.js";import{e as c}from"./Bem-uABtowwn.js";import"./preload-helper-PPVm8Dsz.js";import"./Context-D-gsCzRv.js";import"./Universe-DM4c6Udm.js";import"./Button-C4Pj9Hl_.js";import"./SugarElement-v4NJLiy_.js";import"./PredicateFind-cjflXcNJ.js";import"./Strings-0z8lz2Ma.js";import"./KeyboardNavigationHooks-DDqxoP3O.js";import"./Num-xrWELwUY.js";import"./Visibility-HiPE8kkv.js";import"./Obj-DJRegViB.js";const P=()=>e.jsx("div",{role:"separator",className:c("tox-collection","item-separator")}),Z=t.forwardRef(({enabled:n=!0,icon:a,onSetup:m,children:x,submenusSide:f="right",submenuContent:y},u)=>{const[i,o]=t.useState({enabled:n,focused:!1}),[h,R]=t.useState(!1),v=t.useId(),p=t.useRef(i),w=t.useRef(null),s=t.useRef(null);t.useEffect(()=>{p.current=i},[i]),t.useEffect(()=>{o(r=>({...r,enabled:n}))},[n]);const g=t.useMemo(()=>({isEnabled:()=>p.current.enabled,setEnabled:r=>{o(l=>({...l,enabled:r}))}}),[]);t.useEffect(()=>{if(m){const r=m(g);return()=>r(g)}return z},[m,g]),t.useEffect(()=>{i.enabled||s.current?.hidePopover()},[i.enabled]);const F=t.useCallback(r=>{const l=r.relatedTarget,X=I(l)&&(w.current?.contains(l)??!1),$=I(l)&&(s.current?.contains(l)??!1);!X&&!$&&s.current?.hidePopover()},[]),O=t.useCallback(r=>{w.current=r,_(u)?u(r):I(u)&&(u.current=r)},[u]),L=J(a)?e.jsx(j,{icon:a}):a;return e.jsxs(E,{side:f,align:"start",triggerEvents:i.enabled?["click","hover","arrows"]:[],children:[e.jsx(A,{children:e.jsxs("div",{id:v,ref:O,style:{boxSizing:"border-box",width:"100%"},tabIndex:-1,role:"menuitem","aria-haspopup":"true","aria-disabled":!i.enabled,onFocus:()=>o(r=>({...r,focused:!0})),onPointerMove:r=>{i.enabled&&r.currentTarget.focus()},onBlur:r=>{o(l=>({...l,focused:!1})),F(r)},className:c("tox-collection","item",{active:i.focused||h,"state-disabled":!i.enabled}),children:[L&&e.jsx("div",{className:c("tox-collection","item-icon"),children:L}),e.jsx("div",{className:c("tox-collection","item-label"),children:x}),e.jsx("div",{className:c("tox-collection","item-caret"),children:e.jsx(j,{icon:"chevron-right"})})]})}),e.jsx(D,{ref:s,onOpenChange:R,onBlur:F,children:y})]})}),M=t.forwardRef(({enabled:n=!0,onSetup:a,icon:m,active:x=!1,shortcut:f,onAction:y,children:u},i)=>{const[o,h]=t.useState({enabled:n,active:x,focused:!1}),R=t.useId(),v=t.useRef(o);t.useEffect(()=>{v.current=o},[o]),t.useEffect(()=>{h(s=>({...s,enabled:n,active:x}))},[n,x]);const p=t.useMemo(()=>({isEnabled:()=>v.current.enabled,setEnabled:s=>{h(g=>({...g,enabled:s}))},isActive:()=>v.current.active,setActive:s=>{h(g=>({...g,active:s}))}}),[]);t.useEffect(()=>{if(a){const s=a(p);return()=>s(p)}return z},[a,p]);const w=J(m)?e.jsx(j,{icon:m}):m;return e.jsxs("div",{id:R,tabIndex:-1,role:"menuitemcheckbox","aria-haspopup":!1,"aria-disabled":!o.enabled,"aria-checked":o.active,onFocus:()=>h({...o,focused:!0}),onPointerMove:s=>{o.enabled&&s.currentTarget.focus()},onBlur:()=>h({...o,focused:!1}),onClick:()=>{o.enabled&&y(p)},className:c("tox-collection","item",{enabled:o.active,active:o.focused,"state-disabled":!o.enabled}),ref:i,"aria-keyshortcuts":f,children:[w&&e.jsx("div",{className:c("tox-collection","item-icon"),children:w}),e.jsx("div",{className:c("tox-collection","item-label"),children:u}),f&&e.jsx("div",{className:c("tox-collection","item-accessory"),children:f}),e.jsx("div",{className:c("tox-collection","item-checkmark"),children:e.jsx(j,{icon:"checkmark"})})]})}),je={title:"components/Menu",component:T,decorators:[n=>e.jsx(N,{resources:B,children:e.jsx("div",{style:{height:"100vh",width:"100vw",paddingTop:"40vh",paddingInlineStart:"35vw"},children:e.jsx(n,{})})})],argTypes:{},parameters:{layout:"centered",docs:{description:{component:""}}},tags:["autodocs"]},Q=n=>new Map([["chevron-right",`<?xml version="1.0" encoding="UTF-8"?>
<svg width="10px" height="10px" viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
    <title>icon-chevron-right</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M2.21845958,1.3349556 C1.91680892,1.0226681 1.92570969,0.536022971 2.23859257,0.234195098 C2.55147544,-0.0676327747 3.05594483,-0.0762190601 3.37967043,0.214773464 L7.76159819,4.44187585 C8.08197558,4.75131828 8.08197558,5.25261554 7.76159819,5.56205798 L3.37967043,9.78916036 C3.05594483,10.0801529 2.55147544,10.0715666 2.23859257,9.76973873 C1.92570969,9.46791085 1.91680892,8.98126573 2.21845958,8.66897823 L6.01978191,5.00196691 L2.21845958,1.3349556 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>`],["checkmark",`<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
    <title>icon-checkmark</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M18.1679497,5.4452998 C18.4743022,4.98577112 19.0951715,4.86159725 19.5547002,5.16794971 C20.0142289,5.47430216 20.1384028,6.09517151 19.8320503,6.5547002 L11.8320503,18.5547002 C11.4831227,19.0780915 10.7433669,19.1531818 10.2963845,18.7105809 L5.29919894,13.7623796 C4.90675595,13.3737835 4.90363744,12.7406262 5.29223356,12.3481832 C5.68082968,11.9557402 6.31398698,11.9526217 6.70642997,12.3412178 L10.8411868,16.4354442 L18.1679497,5.4452998 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>`],["item",`<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.3 (57544) - http://www.bohemiancoding.com/sketch -->
    <title>icon-emoji</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M9,11 C9.55,11 10,10.55 10,10 C10,9.45 9.55,9 9,9 C8.45,9 8,9.45 8,10 C8,10.55 8.45,11 9,11 Z M15,11 C15.55,11 16,10.55 16,10 C16,9.45 15.55,9 15,9 C14.45,9 14,9.45 14,10 C14,10.55 14.45,11 15,11 Z M12,16.5 C14.14,16.5 15.92,15 16.38,13 L7.62,13 C8.08,15 9.86,16.5 12,16.5 Z M12,4 C7.57,4 4,7.58 4,12 C4,16.42 7.57,20 12,20 C16.43,20 20,16.42 20,12 C20,7.58 16.42,4 12,4 Z M12,18.5 C8.41,18.5 5.5,15.59 5.5,12 C5.5,8.41 8.41,5.5 12,5.5 C15.59,5.5 18.5,8.41 18.5,12 C18.5,15.59 15.59,18.5 12,18.5 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>`]]).get(n)||"",B={getIcon:Q,translate:K},U=e.jsxs(T,{children:[e.jsx(S,{icon:e.jsx(j,{icon:"item"}),onAction:()=>console.log("Clicked Menu item 1"),children:"Menu item 1"},d("menu-item")),e.jsx(M,{icon:"item",onAction:n=>{n.setActive(!n.isActive()),console.log("You toggled a menuitem")},children:e.jsxs("span",{children:["Menu ",e.jsx("span",{style:{textDecoration:"underline"},children:"item  2"})]})},d("menu-item")),e.jsx(P,{}),e.jsx(Z,{icon:"item",submenuContent:e.jsxs(T,{children:[e.jsx(S,{icon:"item",onAction:()=>console.log("Clicked nested menu item 1"),children:"Nested menu item 1"},d("menu-item")),e.jsx(M,{enabled:!1,icon:"item",onAction:n=>{n.setActive(!n.isActive()),console.log("You toggled a nested menu item 2")},children:"Nested menu item 2"},d("menu-item")),e.jsx(P,{}),e.jsx(Z,{icon:"item",submenuContent:e.jsxs(T,{children:[e.jsx(S,{icon:"item",onAction:()=>console.log("Clicked nested menu item 1"),children:"Nested menu item 1"},d("menu-item")),e.jsx(M,{icon:"item",onAction:n=>{n.setActive(!n.isActive()),console.log("You toggled a nested menu item 2")},children:"Nested menu item 2"},d("menu-item"))]}),children:"Submenu"},d("menu-item"))]}),children:"Submenu"},d("menu-item"))]}),C={args:{},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:q(U)},b={args:{},decorators:[n=>e.jsx(N,{resources:B,children:e.jsx(n,{})})],parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:()=>e.jsx(e.Fragment,{children:e.jsxs(E,{children:[e.jsx(A,{children:e.jsx(H,{variant:"secondary",icon:"item","aria-label":"Menu"})}),e.jsx(D,{children:U})]})})},k={args:{},decorators:[n=>e.jsx(N,{resources:B,children:e.jsx(n,{})})],parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:()=>e.jsx(e.Fragment,{children:e.jsx(E,{children:e.jsxs(G,{children:[e.jsx(A,{children:e.jsx(Y,{children:e.jsx(H,{variant:"secondary",icon:"item","aria-label":"Menu"})})}),e.jsx(D,{children:U}),e.jsx(W,{text:"if you can read this, you're too close"})]})})})},Ce=["Example","MenuInADropdown","MenuInADropdownWithTooltip"];C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {},
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render: Fun.constant(menu)
}`,...C.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {},
  decorators: [(Story: React.ComponentType): JSX.Element => <UniverseProvider resources={mockUniverse}>
        <Story />
      </UniverseProvider>],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render: (): JSX.Element => {
    return <>
      <Dropdown.Root>
        <Dropdown.Trigger>
          <IconButton variant={'secondary'} icon={'item'} aria-label={'Menu'}></IconButton>
        </Dropdown.Trigger>
        <Dropdown.Content>
          {menu}
        </Dropdown.Content>
      </Dropdown.Root>
    </>;
  }
}`,...b.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {},
  decorators: [(Story: React.ComponentType): JSX.Element => <UniverseProvider resources={mockUniverse}>
        <Story />
      </UniverseProvider>],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render: (): JSX.Element => {
    return <>
      <Dropdown.Root>
        <Tooltip.Root>
          <Dropdown.Trigger>
            <Tooltip.Trigger>
              <IconButton variant={'secondary'} icon={'item'} aria-label={'Menu'}></IconButton>
            </Tooltip.Trigger>
          </Dropdown.Trigger>
          <Dropdown.Content>
            {menu}
          </Dropdown.Content>
          <Tooltip.Content text={'if you can read this, you\\'re too close'} />
        </Tooltip.Root>
      </Dropdown.Root>
    </>;
  }
}`,...k.parameters?.docs?.source}}};export{C as Example,b as MenuInADropdown,k as MenuInADropdownWithTooltip,Ce as __namedExportsOrder,je as default};
