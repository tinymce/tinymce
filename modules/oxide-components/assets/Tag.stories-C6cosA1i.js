import{r as T,j as s}from"./iframe-m8jlWi5a.js";import{U as f}from"./UniverseProvider-6Km2qX_O.js";import{I as A}from"./IconButton-DkZACQq3.js";import{b as F,e as g}from"./Bem-uABtowwn.js";import{b as P,n as p,i as R,d as U}from"./Optional-C7ZieBtS.js";import"./preload-helper-PPVm8Dsz.js";import"./Button-C4Pj9Hl_.js";import"./Icon-B82XuRAQ.js";import"./Universe-DM4c6Udm.js";import"./Strings-0z8lz2Ma.js";import"./Obj-DJRegViB.js";const c=T.forwardRef((e,a)=>{const{label:x,icon:h,closeable:r,closeAriaLabel:k,link:o,focusable:j,...i}=e,d=r&&e.disabled===!0,C=o?e.href:void 0,u=o?e.target??"_blank":void 0,w=o&&u==="_blank"?"noopener noreferrer":void 0,L=P(j)||r?!0:e.focusable,m={className:F("tox-tag"),onKeyDown:t=>{r&&["Backspace","Delete"].includes(t.key)&&!d&&e.onClose()},...L?{tabIndex:-1}:{}},b=s.jsxs(s.Fragment,{children:[h,s.jsx("span",{className:g("tox-tag","label"),children:x}),r&&s.jsx("span",{className:g("tox-tag","close"),children:s.jsx(A,{icon:"source-close",variant:"naked",disabled:d,"aria-label":k,onClick:t=>{t.preventDefault(),e.onClose()}})})]});return o?s.jsx("a",{...i,...m,href:C,target:u,rel:w,ref:a,children:b}):s.jsx("div",{...i,...m,ref:a,children:b})}),O={title:"bespoke/tinymceai/Tag",component:c,parameters:{layout:"centered"},tags:["autodocs"]},v={getIcon:U(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path fill="#222F3E" fill-rule="evenodd" d="M11.723 5.62 9.356 8l2.367 2.38a.95.95 0 0 1-1.343 1.343L8 9.356l-2.38 2.367a.95.95 0 0 1-1.343-1.343L6.644 8 4.277 5.62A.95.95 0 0 1 5.62 4.277L8 6.644l2.38-2.367a.95.95 0 0 1 1.343 1.343Z"/>
  </svg>
`),translate:R},n={args:{closeable:!0,link:!1,label:"Value",closeAriaLabel:"Remove tag",onClose:p},render:e=>s.jsx(f,{resources:v,children:s.jsx(c,{...e})})},l={args:{closeable:!0,link:!1,label:"Value",closeAriaLabel:"Remove tag",onClose:p},render:e=>s.jsx(f,{resources:v,children:s.jsx(c,{ref:a=>a?.focus(),...e})})},Z=["ClosableTag","FocusedClosableTag"];n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    closeable: true,
    link: false,
    label: 'Value',
    closeAriaLabel: 'Remove tag',
    onClose: Fun.noop
  },
  render: args => <UniverseProvider resources={resources}>
      <Tag {...args} />
    </UniverseProvider>
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    closeable: true,
    link: false,
    label: 'Value',
    closeAriaLabel: 'Remove tag',
    onClose: Fun.noop
  },
  render: args => {
    return <UniverseProvider resources={resources}>
        <Tag ref={el => el?.focus()} {...args} />
      </UniverseProvider>;
  }
}`,...l.parameters?.docs?.source}}};export{n as ClosableTag,l as FocusedClosableTag,Z as __namedExportsOrder,O as default};
