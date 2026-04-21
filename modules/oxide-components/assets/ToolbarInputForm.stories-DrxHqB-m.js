import{r,j as e}from"./iframe-D0djEA9-.js";import{O as S}from"./Optional-BMqOXurB.js";import{I as k}from"./Icon-cOBfaUui.js";import{U as w}from"./UniverseProvider-rPfSd9Pa.js";import{d as _}from"./KeyboardNavigationHooks-BBqYvqWE.js";import{c as h,b as n}from"./Bem-BAJJXTy-.js";import"./preload-helper-PPVm8Dsz.js";import"./Fun-DfA6N4bS.js";import"./Strings-DatO8Mn0.js";import"./Num-xrWELwUY.js";import"./Obj-4mkygeuk.js";const s=({onSubmit:t,onEscape:i,label:x,placeholder:g,autoFocus:p=!0})=>{const[u,v]=r.useState(""),m=r.useRef(null),d=r.useRef(null),f=r.useId();r.useEffect(()=>{p&&d.current?.focus()},[p]);const y=r.useMemo(()=>({containerRef:m,selector:[h("tox-toolbar-textfield"),h("tox-tbtn")].join(", "),escape:()=>(i(),S.some(!0))}),[i]);return _(y),e.jsxs("form",{ref:m,className:n("tox-toolbar-input-form"),noValidate:!0,onSubmit:c=>{c.preventDefault(),t(u)},children:[e.jsx("label",{htmlFor:f,className:n("tox-label"),children:e.jsx("span",{children:x})}),e.jsx("input",{ref:d,placeholder:g,id:f,type:"text",required:!0,value:u,onChange:c=>v(c.target.value),className:n("tox-toolbar-textfield")}),e.jsx("button",{className:n("tox-tbtn"),type:"submit",children:e.jsx(k,{icon:"checkmark"})})]})};try{s.displayName="ToolbarInputForm",s.__docgenInfo={description:"",displayName:"ToolbarInputForm",props:{onSubmit:{defaultValue:null,description:"",name:"onSubmit",required:!0,type:{name:"(inputValue: string) => void"}},onEscape:{defaultValue:null,description:"",name:"onEscape",required:!0,type:{name:"() => void"}},placeholder:{defaultValue:null,description:"",name:"placeholder",required:!1,type:{name:"string"}},label:{defaultValue:null,description:"",name:"label",required:!0,type:{name:"string"}},autoFocus:{defaultValue:{value:"true"},description:"",name:"autoFocus",required:!1,type:{name:"boolean"}}}}}catch{}const{fn:l}=__STORYBOOK_MODULE_TEST__,H={title:"components/ToolbarInputForm",component:s,argTypes:{label:{description:"Input field label."},placeholder:{description:"Placeholder text for input field."},onSubmit:{description:"On submit function."}},decorators:[t=>e.jsx(w,{resources:j,children:e.jsx(t,{})})],parameters:{layout:"centered",docs:{description:{component:""}}},tags:["autodocs"]},E=t=>new Map([["checkmark",`<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
    <title>icon-checkmark</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M18.1679497,5.4452998 C18.4743022,4.98577112 19.0951715,4.86159725 19.5547002,5.16794971 C20.0142289,5.47430216 20.1384028,6.09517151 19.8320503,6.5547002 L11.8320503,18.5547002 C11.4831227,19.0780915 10.7433669,19.1531818 10.2963845,18.7105809 L5.29919894,13.7623796 C4.90675595,13.3737835 4.90363744,12.7406262 5.29223356,12.3481832 C5.68082968,11.9557402 6.31398698,11.9526217 6.70642997,12.3412178 L10.8411868,16.4354442 L18.1679497,5.4452998 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>`]]).get(t)||"",j={getIcon:E},b=t=>e.jsx(s,{...t}),o={args:{label:"Some input:",placeholder:"value...",onSubmit:l(),onEscape:l()},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:b},a={args:{label:"URL",placeholder:"http://",onSubmit:l(),onEscape:l()},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:b};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Some input:',
    placeholder: 'value...',
    onSubmit: fn(),
    onEscape: fn()
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'URL',
    placeholder: 'http://',
    onSubmit: fn(),
    onEscape: fn()
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...a.parameters?.docs?.source}}};const M=["Example","Url"];export{o as Example,a as Url,M as __namedExportsOrder,H as default};
