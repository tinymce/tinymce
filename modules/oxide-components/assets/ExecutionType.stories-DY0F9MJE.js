import{r as c,j as i}from"./iframe-CI102TCB.js";import{O as p}from"./Optional-DbTLtGQT.js";import{b as m,g as f,a as d,s as g}from"./KeyboardNavigationHooks-Dj35Im8Q.js";import"./preload-helper-PPVm8Dsz.js";import"./Fun--VEwoXIw.js";import"./Strings-tLOZuS7x.js";const x={title:"KeyboardNavigationHooks/ExecutionType",component:l=>{const u=c.useRef(null);return m({...l,doExecute:o=>(f(o,"background")==="rgb(255, 0, 0)"?d(o,"background"):g(o,"background","rgb(255, 0, 0)"),p.from(!0)),containerRef:u}),i.jsx("span",{ref:u,style:{display:"inline-block",width:"20px",height:"20px",margin:"2px",border:"1px solid blue"},tabIndex:-1})},parameters:{layout:"centered",docs:{story:{useSpace:!1,useEnter:!1,useControlEnter:!1,useDown:!1}}},tags:["autodocs","skip-visual-testing"],args:{useSpace:!1,useEnter:!1,useControlEnter:!1,useDown:!1},argTypes:{containerRef:{control:!1,type:{required:!0,name:"other",value:"RefObject<HTMLElement>"},description:"RefObject<HTMLElement> - Reference to the container element that will handle keyboard navigation",table:{type:{summary:"RefObject<HTMLElement>"},defaultValue:{summary:"useRef<HTMLElement>(null)"}}},useSpace:{control:!1,type:{required:!0,name:"boolean"},description:"Boolean - determines whether using the spacebar to trigger execution is acceptable",table:{type:{summary:"using spacebar"},defaultValue:{summary:"false"}}},useEnter:{control:!1,type:{required:!0,name:"boolean"},description:"Boolean - determines whether using the enter button to trigger execution is acceptable",table:{type:{summary:"using enter"},defaultValue:{summary:"false"}}},useControlEnter:{control:!1,type:{required:!0,name:"boolean"},description:'Boolean - determines whether using the enter button to trigger execution is acceptable, but also requiring control to be pressed. Can be used together or separate from "useEnter", but if used together will add no change in behavior to only using "useEnter".',table:{type:{summary:"using control enter"},defaultValue:{summary:"false"}}},useDown:{control:!1,type:{required:!0,name:"boolean"},description:"Boolean - determines whether using the down arrow button to trigger execution is acceptable",table:{type:{summary:"using arrow button"},defaultValue:{summary:"false"}}}}},e={args:{useSpace:!1,useEnter:!1,useControlEnter:!1,useDown:!1}},r={args:{useSpace:!0,useEnter:!1,useControlEnter:!1,useDown:!1}},s={args:{useSpace:!1,useEnter:!0,useControlEnter:!1,useDown:!1}},t={args:{useSpace:!1,useEnter:!0,useControlEnter:!0,useDown:!1}},a={args:{useSpace:!1,useEnter:!1,useControlEnter:!1,useDown:!0}},n={args:{useSpace:!0,useEnter:!0,useControlEnter:!0,useDown:!0}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    useSpace: false,
    useEnter: false,
    useControlEnter: false,
    useDown: false
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    useSpace: true,
    useEnter: false,
    useControlEnter: false,
    useDown: false
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    useSpace: false,
    useEnter: true,
    useControlEnter: false,
    useDown: false
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    useSpace: false,
    useEnter: true,
    useControlEnter: true,
    useDown: false
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    useSpace: false,
    useEnter: false,
    useControlEnter: false,
    useDown: true
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    useSpace: true,
    useEnter: true,
    useControlEnter: true,
    useDown: true
  }
}`,...n.parameters?.docs?.source}}};const C=["None","UseSpace","UseEnter","UseEnterControl","UseDown","All"];export{n as All,e as None,a as UseDown,s as UseEnter,t as UseEnterControl,r as UseSpace,C as __namedExportsOrder,x as default};
