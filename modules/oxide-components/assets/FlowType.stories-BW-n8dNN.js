import{r,j as t}from"./iframe-CXQ-yjfd.js";import{c as p}from"./KeyboardNavigationHooks-BFPsBuel.js";import{c as H}from"./Fun--VEwoXIw.js";import{O as R}from"./Optional-CilDcsXt.js";import"./Strings-BDyhe4Of.js";const o=({classes:e})=>t.jsx("span",{className:e.join(" "),style:{display:"inline-block",width:"20px",height:"20px",margin:"2px",border:"1px solid "+(e.includes("stay")?"blue":"yellow")},tabIndex:-1}),d=r.forwardRef(({testId:e},s)=>t.jsxs("div",{"data-testid":e,ref:s,className:"flow-keying-test",style:{background:"white",width:"200px",height:"200px"},children:[t.jsx(o,{classes:["stay","one"]}),t.jsx(o,{classes:["stay","two"]}),t.jsx(o,{classes:["skip","three"]}),t.jsx(o,{classes:["skip","four"]}),t.jsx(o,{classes:["stay","five"]})]}));try{d.displayName="Container",d.__docgenInfo={description:"",displayName:"Container",props:{}}}catch{}const c={render:()=>{const e=r.useRef(null);return p({containerRef:e,selector:".stay",cycles:!0}),r.useEffect(()=>{var s;e.current&&((s=e.current.querySelector(".stay"))==null||s.focus())},[]),t.jsx(d,{ref:e,testId:"container"})}};var y,h,x;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(x=(h=c.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};const i={render:()=>{const e=r.useRef(null);return p({containerRef:e,selector:".stay",cycles:!1}),r.useEffect(()=>{var s;e.current&&((s=e.current.querySelector(".stay"))==null||s.focus())},[]),t.jsx(d,{ref:e,testId:"container"})}};var g,w,b;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(b=(w=i.parameters)==null?void 0:w.docs)==null?void 0:b.source}}};const a=({classes:e})=>t.jsx("span",{className:e.join(" "),style:{display:"inline-block",width:"20px",height:"20px",margin:"2px",border:"1px solid "+(e.includes("stay")?"blue":"yellow")},tabIndex:-1}),F=e=>(e.dom.click(),R.some(!0)),f=({selector:e,execute:s=F,escape:l=H(R.none()),allowVertical:n=!0,allowHorizontal:T=!0,cycles:_=!0,focusIn:k=!1,closest:q=!0})=>{const m=r.useRef(null);return p({containerRef:m,selector:e,allowHorizontal:T,allowVertical:n,closest:q,cycles:_,escape:l,execute:s,focusIn:k}),t.jsxs("div",{ref:m,className:"container",style:{background:"white",width:"200px",height:"200px"},children:[t.jsx(a,{classes:["stay","one"]}),t.jsx(a,{classes:["stay","two"]}),t.jsx(a,{classes:["skip","three"]}),t.jsx(a,{classes:["skip","four"]}),t.jsx(a,{classes:["stay","five"]})]})};try{f.displayName="FlowTypeDemo",f.__docgenInfo={description:"",displayName:"FlowTypeDemo",props:{execute:{defaultValue:{value:`(
  focused: SugarElement<HTMLElement>
): Optional<boolean> => {
  focused.dom.click();
  return Optional.some(true);

}`},description:"The function to execute when we press enter while the element is focused.",name:"execute",required:!1,type:{name:"((focused: SugarElement<HTMLElement>) => Optional<boolean>)"}},selector:{defaultValue:null,description:"The selector used to find the next element to focus.",name:"selector",required:!0,type:{name:"string"}},escape:{defaultValue:{value:"Fun.constant(Optional.none())"},description:"The function to execute when we press escape while the element is focused.",name:"escape",required:!1,type:{name:"((focused: SugarElement<HTMLElement>) => Optional<boolean>)"}},allowVertical:{defaultValue:{value:"true"},description:"Whether to allow vertical movement.",name:"allowVertical",required:!1,type:{name:"boolean"}},allowHorizontal:{defaultValue:{value:"true"},description:"Whether to allow horizontal movement.",name:"allowHorizontal",required:!1,type:{name:"boolean"}},cycles:{defaultValue:{value:"true"},description:"Whether to allow cycling through elements.",name:"cycles",required:!1,type:{name:"boolean"}},focusIn:{defaultValue:{value:"false"},description:"",name:"focusIn",required:!1,type:{name:"boolean"}},closest:{defaultValue:{value:"true"},description:"",name:"closest",required:!1,type:{name:"boolean"}}}}}catch{}const N=`.stay:focus {
    background-color: #cadbee;
  }
  .skip:focus {
    background-color: red;
  }
`,V={title:"KeyboardNavigationHooks/FlowKey",component:f,parameters:{layout:"centered",docs:{story:{autoplay:!0}}},tags:["autodocs","skip-visual-testing"],decorators:[e=>t.jsxs(t.Fragment,{children:[t.jsx("style",{children:N}),t.jsx(e,{})]})],args:{selector:".stay"},argTypes:{containerRef:{control:!1,type:{required:!0,name:"other",value:"RefObject<HTMLElement>"},description:"RefObject<HTMLElement> - Reference to the container element that will handle keyboard navigation",table:{type:{summary:"RefObject<HTMLElement>"},defaultValue:{summary:"useRef<HTMLDivElement>(null)"}}}},play:({canvasElement:e,context:s})=>{const l=e.ownerDocument.querySelector(".container");if(l){const n=l.querySelector(s.args.selector);n==null||n.focus()}}},u={};var j,v,E;u.parameters={...u.parameters,docs:{...(j=u.parameters)==null?void 0:j.docs,source:{originalSource:"{}",...(E=(v=u.parameters)==null?void 0:v.docs)==null?void 0:E.source}}};const C=["Basic","FlowKeyingWithCycles","FlowKeyingWithoutCycles"];export{u as Basic,c as FlowKeyingWithCycles,i as FlowKeyingWithoutCycles,C as __namedExportsOrder,V as default};
