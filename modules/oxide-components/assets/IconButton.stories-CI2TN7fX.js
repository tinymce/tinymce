import{j as s,c as I}from"./iframe-7xQS4pQC.js";import{B as N}from"./Button-DgXnHZ0r.js";import{c as w}from"./Fun-DhDWU5Ah.js";const i=({icon:e,resolver:o})=>s.jsx("span",{className:I(["tox-icon"]),dangerouslySetInnerHTML:{__html:o(e)}});try{i.displayName="Icon",i.__docgenInfo={description:"",displayName:"Icon",props:{icon:{defaultValue:null,description:"The name of the icon",name:"icon",required:!0,type:{name:"string"}},resolver:{defaultValue:null,description:`The function to resolve the icon name to an html string.
This would eventually default to retrieving the icon from the editor's registry.
(name: string) => editor.ui.registry.getAll().icons[name] ?? 'temporary-placeholder'
@param icon - The name of the icon
@returns The html string representation of the icon`,name:"resolver",required:!0,type:{name:"(icon: string) => string"}}}}}catch{}const c=({icon:e,resolver:o,...T})=>s.jsx(N,{...T,className:I(["tox-button--icon"]),children:s.jsx(i,{icon:e,resolver:o})});try{c.displayName="IconButton",c.__docgenInfo={description:"",displayName:"IconButton",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"undefined"}},icon:{defaultValue:null,description:"The name of the icon",name:"icon",required:!0,type:{name:"string"}},resolver:{defaultValue:null,description:`The function to resolve the icon name to an html string.
This would eventually default to retrieving the icon from the editor's registry.
(name: string) => editor.ui.registry.getAll().icons[name] ?? 'temporary-placeholder'
@param icon - The name of the icon
@returns The html string representation of the icon`,name:"resolver",required:!0,type:{name:"(icon: string) => string"}},variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:'"primary" | "secondary" | "outlined" | "naked"'}}}}}catch{}const B=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,j={title:"components/IconButton",component:c,parameters:{layout:"centered"},tags:["autodocs"],args:{icon:"leftArrow",resolver:w(B)}},r={args:{variant:"primary"}},n={args:{variant:"secondary"}},t={args:{variant:"outlined"}},a={args:{variant:"naked"}};var l,d,m;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    variant: 'primary'
  }
}`,...(m=(d=r.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var u,p,g;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: 'secondary'
  }
}`,...(g=(p=n.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var h,y,f;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    variant: 'outlined'
  }
}`,...(f=(y=t.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var v,_,x;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: 'naked'
  }
}`,...(x=(_=a.parameters)==null?void 0:_.docs)==null?void 0:x.source}}};const k=["Primary","Secondary","Outlined","Naked"];export{a as Naked,t as Outlined,r as Primary,n as Secondary,k as __namedExportsOrder,j as default};
