import{r as k,j as T}from"./iframe-Dt7rryTP.js";import{O as j}from"./Optional-CHj922Ci.js";import{u as q,g as v,a as O,s as H}from"./KeyboardNavigationHooks-B5zdcwPv.js";import"./Fun--VEwoXIw.js";import"./Strings-D6HyETGk.js";const A={title:"KeyboardNavigationHooks/ExecutionType",component:U=>{const u=k.useRef(null);return q({...U,doExecute:o=>(v(o,"background")==="rgb(255, 0, 0)"?O(o,"background"):H(o,"background","rgb(255, 0, 0)"),j.from(!0)),containerRef:u}),T.jsx("span",{ref:u,style:{display:"inline-block",width:"20px",height:"20px",margin:"2px",border:"1px solid blue"},tabIndex:-1})},parameters:{layout:"centered",docs:{story:{useSpace:!1,useEnter:!1,useControlEnter:!1,useDown:!1}}},tags:["autodocs","skip-visual-testing"],args:{useSpace:!1,useEnter:!1,useControlEnter:!1,useDown:!1},argTypes:{containerRef:{control:!1,type:{required:!0,name:"other",value:"RefObject<HTMLElement>"},description:"RefObject<HTMLElement> - Reference to the container element that will handle keyboard navigation",table:{type:{summary:"RefObject<HTMLElement>"},defaultValue:{summary:"useRef<HTMLElement>(null)"}}},useSpace:{control:!1,type:{required:!0,name:"boolean"},description:"Boolean - determines whether using the spacebar to trigger execution is acceptable",table:{type:{summary:"using spacebar"},defaultValue:{summary:"false"}}},useEnter:{control:!1,type:{required:!0,name:"boolean"},description:"Boolean - determines whether using the enter button to trigger execution is acceptable",table:{type:{summary:"using enter"},defaultValue:{summary:"false"}}},useControlEnter:{control:!1,type:{required:!0,name:"boolean"},description:'Boolean - determines whether using the enter button to trigger execution is acceptable, but also requiring control to be pressed. Can be used together or separate from "useEnter", but if used together will add no change in behavior to only using "useEnter".',table:{type:{summary:"using control enter"},defaultValue:{summary:"false"}}},useDown:{control:!1,type:{required:!0,name:"boolean"},description:"Boolean - determines whether using the down arrow button to trigger execution is acceptable",table:{type:{summary:"using arrow button"},defaultValue:{summary:"false"}}}}},e={args:{useSpace:!1,useEnter:!1,useControlEnter:!1,useDown:!1}},r={args:{useSpace:!0,useEnter:!1,useControlEnter:!1,useDown:!1}},s={args:{useSpace:!1,useEnter:!0,useControlEnter:!1,useDown:!1}},t={args:{useSpace:!1,useEnter:!0,useControlEnter:!0,useDown:!1}},a={args:{useSpace:!1,useEnter:!1,useControlEnter:!1,useDown:!0}},n={args:{useSpace:!0,useEnter:!0,useControlEnter:!0,useDown:!0}};var l,c,i;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    useSpace: false,
    useEnter: false,
    useControlEnter: false,
    useDown: false
  }
}`,...(i=(c=e.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var p,m,f;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    useSpace: true,
    useEnter: false,
    useControlEnter: false,
    useDown: false
  }
}`,...(f=(m=r.parameters)==null?void 0:m.docs)==null?void 0:f.source}}};var d,g,E;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    useSpace: false,
    useEnter: true,
    useControlEnter: false,
    useDown: false
  }
}`,...(E=(g=s.parameters)==null?void 0:g.docs)==null?void 0:E.source}}};var b,y,w;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    useSpace: false,
    useEnter: true,
    useControlEnter: true,
    useDown: false
  }
}`,...(w=(y=t.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var h,S,x;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    useSpace: false,
    useEnter: false,
    useControlEnter: false,
    useDown: true
  }
}`,...(x=(S=a.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};var C,D,R;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    useSpace: true,
    useEnter: true,
    useControlEnter: true,
    useDown: true
  }
}`,...(R=(D=n.parameters)==null?void 0:D.docs)==null?void 0:R.source}}};const _=["None","UseSpace","UseEnter","UseEnterControl","UseDown","All"];export{n as All,e as None,a as UseDown,s as UseEnter,t as UseEnterControl,r as UseSpace,_ as __namedExportsOrder,A as default};
