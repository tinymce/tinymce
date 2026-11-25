import{r as s,j as t}from"./iframe-m8jlWi5a.js";import{b as u}from"./KeyboardNavigationHooks-DDqxoP3O.js";import{d as j,O as d}from"./Optional-C7ZieBtS.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-v4NJLiy_.js";import"./PredicateFind-cjflXcNJ.js";import"./Strings-0z8lz2Ma.js";import"./Num-xrWELwUY.js";import"./Visibility-HiPE8kkv.js";const n=({classes:e})=>t.jsx("span",{className:e.join(" "),style:{display:"inline-block",width:"20px",height:"20px",margin:"2px",border:"1px solid "+(e.includes("stay")?"blue":"yellow")},tabIndex:-1}),m=s.forwardRef(({testId:e},r)=>t.jsxs("div",{"data-testid":e,ref:r,className:"flow-keying-test",style:{background:"white",width:"200px",height:"200px"},children:[t.jsx(n,{classes:["stay","one"]}),t.jsx(n,{classes:["stay","two"]}),t.jsx(n,{classes:["skip","three"]}),t.jsx(n,{classes:["skip","four"]}),t.jsx(n,{classes:["stay","five"]})]})),c={render:()=>{const e=s.useRef(null);return u({containerRef:e,selector:".stay",cycles:!0}),s.useEffect(()=>{e.current&&e.current.querySelector(".stay")?.focus()},[]),t.jsx(m,{ref:e,testId:"container"})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    useFlowKeyNavigation({
      containerRef: ref,
      selector: '.stay',
      cycles: true
    });
    useEffect(() => {
      if (ref.current) {
        ref.current.querySelector<HTMLDivElement>('.stay')?.focus();
      }
    }, []);
    return <Container ref={ref} testId='container' />;
  }
}`,...c.parameters?.docs?.source}}};const l={render:()=>{const e=s.useRef(null);return u({containerRef:e,selector:".stay",cycles:!1}),s.useEffect(()=>{e.current&&e.current.querySelector(".stay")?.focus()},[]),t.jsx(m,{ref:e,testId:"container"})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    useFlowKeyNavigation({
      containerRef: ref,
      selector: '.stay',
      cycles: false
    });
    useEffect(() => {
      if (ref.current) {
        ref.current.querySelector<HTMLDivElement>('.stay')?.focus();
      }
    }, []);
    return <Container ref={ref} testId='container' />;
  }
}`,...l.parameters?.docs?.source}}};const o=({classes:e})=>t.jsx("span",{className:e.join(" "),style:{display:"inline-block",width:"20px",height:"20px",margin:"2px",border:"1px solid "+(e.includes("stay")?"blue":"yellow")},tabIndex:-1}),w=e=>(e.dom.click(),d.some(!0)),b=({selector:e,execute:r=w,escape:a=j(d.none()),allowVertical:f=!0,allowHorizontal:p=!0,cycles:x=!0,focusIn:g=!1,closest:h=!0})=>{const y=s.useRef(null);return u({containerRef:y,selector:e,allowHorizontal:p,allowVertical:f,closest:h,cycles:x,escape:a,execute:r,focusIn:g}),t.jsxs("div",{ref:y,className:"container",style:{background:"white",width:"200px",height:"200px"},children:[t.jsx(o,{classes:["stay","one"]}),t.jsx(o,{classes:["stay","two"]}),t.jsx(o,{classes:["skip","three"]}),t.jsx(o,{classes:["skip","four"]}),t.jsx(o,{classes:["stay","five"]})]})},R=`.stay:focus {
    background-color: #cadbee;
  }
  .skip:focus {
    background-color: red;
  }
`,L={title:"KeyboardNavigationHooks/FlowType",component:b,parameters:{layout:"centered",docs:{story:{autoplay:!0}}},tags:["autodocs"],decorators:[e=>t.jsxs(t.Fragment,{children:[t.jsx("style",{children:R}),t.jsx(e,{})]})],args:{selector:".stay"},argTypes:{containerRef:{control:!1,type:{required:!0,name:"other",value:"RefObject<HTMLElement>"},description:"RefObject<HTMLElement> - Reference to the container element that will handle keyboard navigation",table:{type:{summary:"RefObject<HTMLElement>"},defaultValue:{summary:"useRef<HTMLDivElement>(null)"}}}},play:({canvasElement:e,context:r})=>{const a=e.ownerDocument.querySelector(".container");a&&a.querySelector(r.args.selector)?.focus()}},i={},M=["Basic","FlowKeyingWithCycles","FlowKeyingWithoutCycles"];i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:"{}",...i.parameters?.docs?.source}}};export{i as Basic,c as FlowKeyingWithCycles,l as FlowKeyingWithoutCycles,M as __namedExportsOrder,L as default};
