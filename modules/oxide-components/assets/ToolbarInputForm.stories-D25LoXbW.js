import{r as o,j as e}from"./iframe-m8jlWi5a.js";import{U as w}from"./UniverseProvider-6Km2qX_O.js";import{O as S,i as j}from"./Optional-C7ZieBtS.js";import{d as E}from"./KeyboardNavigationHooks-DDqxoP3O.js";import{c as f,b as r}from"./Bem-uABtowwn.js";import{I as y}from"./Icon-B82XuRAQ.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-v4NJLiy_.js";import"./PredicateFind-cjflXcNJ.js";import"./Strings-0z8lz2Ma.js";import"./Num-xrWELwUY.js";import"./Visibility-HiPE8kkv.js";import"./Obj-DJRegViB.js";import"./Universe-DM4c6Udm.js";const h=({onSubmit:t,onEscape:i,label:b,placeholder:g,autoFocus:c=!0})=>{const[p,v]=o.useState(""),m=o.useRef(null),u=o.useRef(null),d=o.useId();o.useEffect(()=>{c&&u.current?.focus()},[c]);const k=o.useMemo(()=>({containerRef:m,selector:[f("tox-toolbar-textfield"),f("tox-tbtn")].join(", "),escape:()=>(i(),S.some(!0))}),[i]);return E(k),e.jsxs("form",{ref:m,className:r("tox-toolbar-input-form"),noValidate:!0,onSubmit:l=>{l.preventDefault(),t(p)},children:[e.jsx("label",{htmlFor:d,className:r("tox-label"),children:e.jsx("span",{children:b})}),e.jsx("input",{ref:u,placeholder:g,id:d,type:"text",required:!0,value:p,onChange:l=>v(l.target.value),className:r("tox-toolbar-textfield")}),e.jsx("button",{className:r("tox-tbtn"),type:"submit",children:e.jsx(y,{icon:"checkmark"})})]})},{fn:a}=__STORYBOOK_MODULE_TEST__,K={title:"components/ToolbarInputForm",component:h,argTypes:{label:{description:"Input field label."},placeholder:{description:"Placeholder text for input field."},onSubmit:{description:"On submit function."}},decorators:[t=>e.jsx(w,{resources:I,children:e.jsx(t,{})})],parameters:{layout:"centered",docs:{description:{component:""}}},tags:["autodocs"]},R=t=>new Map([["checkmark",`<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
    <title>icon-checkmark</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M18.1679497,5.4452998 C18.4743022,4.98577112 19.0951715,4.86159725 19.5547002,5.16794971 C20.0142289,5.47430216 20.1384028,6.09517151 19.8320503,6.5547002 L11.8320503,18.5547002 C11.4831227,19.0780915 10.7433669,19.1531818 10.2963845,18.7105809 L5.29919894,13.7623796 C4.90675595,13.3737835 4.90363744,12.7406262 5.29223356,12.3481832 C5.68082968,11.9557402 6.31398698,11.9526217 6.70642997,12.3412178 L10.8411868,16.4354442 L18.1679497,5.4452998 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>`]]).get(t)||"",I={getIcon:R,translate:j},x=t=>e.jsx(h,{...t}),n={args:{label:"Some input:",placeholder:"value...",onSubmit:a(),onEscape:a()},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:x},s={args:{label:"URL",placeholder:"http://",onSubmit:a(),onEscape:a()},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:x},q=["Example","Url"];n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};export{n as Example,s as Url,q as __namedExportsOrder,K as default};
