import{r as m,j as t}from"./iframe-CTdvD1WV.js";import{b as r}from"./Bem-DDAe-1K0.js";import{I as v}from"./Universe-By04W8kO.js";import{U as S}from"./UniverseProvider-Clsb9xh4.js";import"./Optional-DSwtTfFR.js";import"./Strings-DLAoeKw-.js";import"./Fun--VEwoXIw.js";import"./Obj-CCYZ-IyV.js";const a=({onSubmit:e,label:s,placeholder:g})=>{const[i,w]=m.useState(""),c=m.useId();return t.jsxs("form",{className:r("tox-toolbar-input-form"),noValidate:!0,onSubmit:l=>{l.preventDefault(),e(i)},children:[t.jsx("label",{htmlFor:c,className:r("tox-label"),children:t.jsx("span",{children:s})}),t.jsx("input",{placeholder:g,id:c,type:"text",required:!0,value:i,onChange:l=>w(l.target.value),className:r("tox-toolbar-textfield")}),t.jsx("button",{className:r("tox-tbtn"),type:"submit",children:t.jsx(v,{icon:"checkmark"})})]})};try{a.displayName="ToolbarInputForm",a.__docgenInfo={description:"",displayName:"ToolbarInputForm",props:{onSubmit:{defaultValue:null,description:"",name:"onSubmit",required:!0,type:{name:"(inputValue: string) => void"}},placeholder:{defaultValue:null,description:"",name:"placeholder",required:!1,type:{name:"string"}},label:{defaultValue:null,description:"",name:"label",required:!0,type:{name:"string"}}}}}catch{}const N={title:"components/ToolbarInputForm",component:a,argTypes:{label:{description:"Input field label."},placeholder:{description:"Placeholder text for input field."},onSubmit:{description:"On submit function."}},decorators:[e=>t.jsx(S,{resources:y,children:t.jsx(e,{})})],parameters:{layout:"centered",docs:{description:{component:""}}},tags:["autodocs"]},k=e=>new Map([["checkmark",`<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
    <title>icon-checkmark</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M18.1679497,5.4452998 C18.4743022,4.98577112 19.0951715,4.86159725 19.5547002,5.16794971 C20.0142289,5.47430216 20.1384028,6.09517151 19.8320503,6.5547002 L11.8320503,18.5547002 C11.4831227,19.0780915 10.7433669,19.1531818 10.2963845,18.7105809 L5.29919894,13.7623796 C4.90675595,13.3737835 4.90363744,12.7406262 5.29223356,12.3481832 C5.68082968,11.9557402 6.31398698,11.9526217 6.70642997,12.3412178 L10.8411868,16.4354442 L18.1679497,5.4452998 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>`]]).get(e)||"",y={getIcon:k},x=e=>t.jsx(a,{onSubmit:e.onSubmit,placeholder:e.placeholder,label:e.label}),n={args:{label:"Some input:",placeholder:"value...",onSubmit:e=>{window.alert(`Form submitted with value: ${e}`)}},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:x},o={args:{label:"URL",placeholder:"http://",onSubmit:e=>{window.alert(`Form submitted with value: ${e}`)}},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:x};var p,d,u;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Some input:',
    placeholder: 'value...',
    onSubmit: value => {
      window.alert(\`Form submitted with value: \${value}\`);
    }
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
}`,...(u=(d=n.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var h,b,f;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'URL',
    placeholder: 'http://',
    onSubmit: value => {
      window.alert(\`Form submitted with value: \${value}\`);
    }
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
}`,...(f=(b=o.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};const T=["Example","Url"];export{n as Example,o as Url,T as __namedExportsOrder,N as default};
