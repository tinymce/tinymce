import{r as q,j as a}from"./iframe-B4rln6zq.js";import{I as C}from"./IconButton-Cz8mUS_-.js";import{U as b}from"./UniverseProvider-BNC0zl6k.js";import{b as T,e as f}from"./Bem-BaJhmSJn.js";import{b as L}from"./Optional-DbTLtGQT.js";import{n as v,c as j}from"./Fun--VEwoXIw.js";import"./preload-helper-PPVm8Dsz.js";import"./Button-DNXIlCl_.js";import"./Icon-oU9OkeLw.js";import"./Strings-tLOZuS7x.js";import"./Obj-DUQpguIS.js";const n=q.forwardRef((e,l)=>{const{label:y,icon:E,closeable:r,ariaLabel:x,link:o,focusable:V,...u}=e,c=r&&e.disabled===!0,h=o?e.href:void 0,d=o?e.target??"_blank":void 0,k=o&&d==="_blank"?"noopener noreferrer":void 0,M=L(V)||r?!0:e.focusable,m={className:T("tox-tag"),onKeyUp:i=>{r&&["Backspace","Delete"].includes(i.key)&&!c&&e.onClose()},...M?{tabIndex:-1}:{}},p=a.jsxs(a.Fragment,{children:[E,a.jsx("span",{className:f("tox-tag","label"),children:y}),r&&a.jsx("span",{className:f("tox-tag","close"),children:a.jsx(C,{icon:"source-close",variant:"naked",disabled:c,"aria-label":x,onClick:i=>{i.preventDefault(),e.onClose()}})})]});return o?a.jsx("a",{...u,...m,href:h,target:d,rel:k,ref:l,children:p}):a.jsx("div",{...u,...m,ref:l,children:p})});try{n.displayName="Tag",n.__docgenInfo={description:"",displayName:"Tag",props:{link:{defaultValue:null,description:"",name:"link",required:!0,type:{name:"boolean"}},closeable:{defaultValue:null,description:"",name:"closeable",required:!0,type:{name:"boolean"}},label:{defaultValue:null,description:"",name:"label",required:!0,type:{name:"string"}},icon:{defaultValue:null,description:"",name:"icon",required:!1,type:{name:"Element"}},onMouseEnter:{defaultValue:null,description:"",name:"onMouseEnter",required:!1,type:{name:"((event: MouseEvent<HTMLElement, MouseEvent>) => void)"}},onMouseLeave:{defaultValue:null,description:"",name:"onMouseLeave",required:!1,type:{name:"((event: MouseEvent<HTMLElement, MouseEvent>) => void)"}},onFocus:{defaultValue:null,description:"",name:"onFocus",required:!1,type:{name:"((event: FocusEvent<HTMLElement, Element>) => void)"}},onBlur:{defaultValue:null,description:"",name:"onBlur",required:!1,type:{name:"((event: FocusEvent<HTMLElement, Element>) => void)"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"((event: MouseEvent<HTMLElement, MouseEvent>) => void)"}},ariaLabel:{defaultValue:null,description:"",name:"ariaLabel",required:!1,type:{name:"string"}},focusable:{defaultValue:null,description:"",name:"focusable",required:!1,type:{name:"boolean"}},onClose:{defaultValue:null,description:"",name:"onClose",required:!0,type:{name:"() => void"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},href:{defaultValue:null,description:"",name:"href",required:!0,type:{name:"string"}},target:{defaultValue:null,description:"",name:"target",required:!1,type:{name:"string"}}}}}catch{}const R={title:"bespoke/tinymceai/Tag",component:n,parameters:{layout:"centered"},tags:["autodocs"]},g={getIcon:j(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path fill="#222F3E" fill-rule="evenodd" d="M11.723 5.62 9.356 8l2.367 2.38a.95.95 0 0 1-1.343 1.343L8 9.356l-2.38 2.367a.95.95 0 0 1-1.343-1.343L6.644 8 4.277 5.62A.95.95 0 0 1 5.62 4.277L8 6.644l2.38-2.367a.95.95 0 0 1 1.343 1.343Z"/>
  </svg>
`)},s={args:{closeable:!0,link:!1,label:"Value",onClose:v},render:e=>a.jsx(b,{resources:g,children:a.jsx(n,{...e})})},t={args:{closeable:!0,link:!1,label:"Value",onClose:v},render:e=>a.jsx(b,{resources:g,children:a.jsx(n,{ref:l=>l?.focus(),...e})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const S=["ClosableTag","FocusedClosableTag"];export{s as ClosableTag,t as FocusedClosableTag,S as __namedExportsOrder,R as default};
