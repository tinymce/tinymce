import{r as q,j as a}from"./iframe-BC5SEvUl.js";import{I as C}from"./IconButton-C0bNSHxT.js";import{U as f}from"./UniverseProvider-m24ONePf.js";import{b as T,e as p}from"./Bem-BaJhmSJn.js";import{b as L}from"./Optional-DbTLtGQT.js";import{n as b,c as j}from"./Fun--VEwoXIw.js";import"./preload-helper-PPVm8Dsz.js";import"./Button-Dx0J1Qf_.js";import"./Icon-BhFApuYt.js";import"./Strings-tLOZuS7x.js";import"./Obj-DUQpguIS.js";const n=q.forwardRef((e,l)=>{const{label:v,icon:y,closeable:r,ariaLabel:E,link:o,focusable:x,...i}=e,u=r&&e.disabled===!0,V=o?e.href:void 0,c=o?e.target??"_blank":void 0,h=o&&c==="_blank"?"noopener noreferrer":void 0,k=L(x)||r?!0:e.focusable,d={className:T("tox-tag"),onKeyUp:M=>{r&&["Backspace","Delete"].includes(M.key)&&!u&&e.onClose()},...k?{tabIndex:-1}:{}},m=a.jsxs(a.Fragment,{children:[y,a.jsx("span",{className:p("tox-tag","label"),children:v}),r&&a.jsx("span",{className:p("tox-tag","close"),children:a.jsx(C,{icon:"source-close",variant:"naked",disabled:u,onClick:e.onClose,"aria-label":E})})]});return o?a.jsx("a",{...i,...d,href:V,target:c,rel:h,ref:l,children:m}):a.jsx("div",{...i,...d,ref:l,children:m})});try{n.displayName="Tag",n.__docgenInfo={description:"",displayName:"Tag",props:{link:{defaultValue:null,description:"",name:"link",required:!0,type:{name:"boolean"}},closeable:{defaultValue:null,description:"",name:"closeable",required:!0,type:{name:"boolean"}},label:{defaultValue:null,description:"",name:"label",required:!0,type:{name:"string"}},icon:{defaultValue:null,description:"",name:"icon",required:!1,type:{name:"Element"}},onMouseEnter:{defaultValue:null,description:"",name:"onMouseEnter",required:!1,type:{name:"((event: MouseEvent<HTMLElement, MouseEvent>) => void)"}},onMouseLeave:{defaultValue:null,description:"",name:"onMouseLeave",required:!1,type:{name:"((event: MouseEvent<HTMLElement, MouseEvent>) => void)"}},onFocus:{defaultValue:null,description:"",name:"onFocus",required:!1,type:{name:"((event: FocusEvent<HTMLElement, Element>) => void)"}},onBlur:{defaultValue:null,description:"",name:"onBlur",required:!1,type:{name:"((event: FocusEvent<HTMLElement, Element>) => void)"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"((event: MouseEvent<HTMLElement, MouseEvent>) => void)"}},ariaLabel:{defaultValue:null,description:"",name:"ariaLabel",required:!1,type:{name:"string"}},focusable:{defaultValue:null,description:"",name:"focusable",required:!1,type:{name:"boolean"}},onClose:{defaultValue:null,description:"",name:"onClose",required:!0,type:{name:"() => void"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},href:{defaultValue:null,description:"",name:"href",required:!0,type:{name:"string"}},target:{defaultValue:null,description:"",name:"target",required:!1,type:{name:"string"}}}}}catch{}const S={title:"bespoke/tinymceai/Tag",component:n,parameters:{layout:"centered"},tags:["autodocs"]},g={getIcon:j(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path fill="#222F3E" fill-rule="evenodd" d="M11.723 5.62 9.356 8l2.367 2.38a.95.95 0 0 1-1.343 1.343L8 9.356l-2.38 2.367a.95.95 0 0 1-1.343-1.343L6.644 8 4.277 5.62A.95.95 0 0 1 5.62 4.277L8 6.644l2.38-2.367a.95.95 0 0 1 1.343 1.343Z"/>
  </svg>
`)},s={args:{closeable:!0,link:!1,label:"Value",onClose:b},render:e=>a.jsx(f,{resources:g,children:a.jsx(n,{...e})})},t={args:{closeable:!0,link:!1,label:"Value",onClose:b},render:e=>a.jsx(f,{resources:g,children:a.jsx(n,{ref:l=>l?.focus(),...e})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    closeable: true,
    link: false,
    label: 'Value',
    onClose: Fun.noop
  },
  render: args => <UniverseProvider resources={resources}>
      <Tag {...args} />
    </UniverseProvider>
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    closeable: true,
    link: false,
    label: 'Value',
    onClose: Fun.noop
  },
  render: args => {
    return <UniverseProvider resources={resources}>
        <Tag ref={el => el?.focus()} {...args} />
      </UniverseProvider>;
  }
}`,...t.parameters?.docs?.source}}};const D=["ClosableTag","FocusedClosableTag"];export{s as ClosableTag,t as FocusedClosableTag,D as __namedExportsOrder,S as default};
