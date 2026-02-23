import{r as s,j as t}from"./iframe--TxWTUtT.js";import{c as f}from"./KeyboardNavigationHooks-Crw7Be3C.js";import{c as b}from"./Fun--VEwoXIw.js";import{O as y}from"./Optional-DbTLtGQT.js";import"./preload-helper-PPVm8Dsz.js";import"./Strings-tLOZuS7x.js";const n=({classes:e})=>t.jsx("span",{className:e.join(" "),style:{display:"inline-block",width:"20px",height:"20px",margin:"2px",border:"1px solid "+(e.includes("stay")?"blue":"yellow")},tabIndex:-1}),u=s.forwardRef(({testId:e},r)=>t.jsxs("div",{"data-testid":e,ref:r,className:"flow-keying-test",style:{background:"white",width:"200px",height:"200px"},children:[t.jsx(n,{classes:["stay","one"]}),t.jsx(n,{classes:["stay","two"]}),t.jsx(n,{classes:["skip","three"]}),t.jsx(n,{classes:["skip","four"]}),t.jsx(n,{classes:["stay","five"]})]}));try{u.displayName="Container",u.__docgenInfo={description:"",displayName:"Container",props:{}}}catch{}const l={render:()=>{const e=s.useRef(null);return f({containerRef:e,selector:".stay",cycles:!0}),s.useEffect(()=>{e.current&&e.current.querySelector(".stay")?.focus()},[]),t.jsx(u,{ref:e,testId:"container"})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};const c={render:()=>{const e=s.useRef(null);return f({containerRef:e,selector:".stay",cycles:!1}),s.useEffect(()=>{e.current&&e.current.querySelector(".stay")?.focus()},[]),t.jsx(u,{ref:e,testId:"container"})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};const o=({classes:e})=>t.jsx("span",{className:e.join(" "),style:{display:"inline-block",width:"20px",height:"20px",margin:"2px",border:"1px solid "+(e.includes("stay")?"blue":"yellow")},tabIndex:-1}),j=e=>(e.dom.click(),y.some(!0)),d=({selector:e,execute:r=j,escape:a=b(y.none()),allowVertical:p=!0,allowHorizontal:h=!0,cycles:x=!0,focusIn:g=!1,closest:w=!0})=>{const m=s.useRef(null);return f({containerRef:m,selector:e,allowHorizontal:h,allowVertical:p,closest:w,cycles:x,escape:a,execute:r,focusIn:g}),t.jsxs("div",{ref:m,className:"container",style:{background:"white",width:"200px",height:"200px"},children:[t.jsx(o,{classes:["stay","one"]}),t.jsx(o,{classes:["stay","two"]}),t.jsx(o,{classes:["skip","three"]}),t.jsx(o,{classes:["skip","four"]}),t.jsx(o,{classes:["stay","five"]})]})};try{d.displayName="FlowTypeDemo",d.__docgenInfo={description:"",displayName:"FlowTypeDemo",props:{execute:{defaultValue:{value:`(
  focused: SugarElement<HTMLElement>
): Optional<boolean> => {
  focused.dom.click();
  return Optional.some(true);

}`},description:"The function to execute when we press enter while the element is focused.",name:"execute",required:!1,type:{name:"((focused: SugarElement<HTMLElement>) => Optional<boolean>)"}},selector:{defaultValue:null,description:"The selector used to find the next element to focus.",name:"selector",required:!0,type:{name:"string"}},escape:{defaultValue:{value:"Fun.constant(Optional.none())"},description:"The function to execute when we press escape while the element is focused.",name:"escape",required:!1,type:{name:"((focused: SugarElement<HTMLElement>) => Optional<boolean>)"}},allowVertical:{defaultValue:{value:"true"},description:"Whether to allow vertical movement.",name:"allowVertical",required:!1,type:{name:"boolean"}},allowHorizontal:{defaultValue:{value:"true"},description:"Whether to allow horizontal movement.",name:"allowHorizontal",required:!1,type:{name:"boolean"}},cycles:{defaultValue:{value:"true"},description:"Whether to allow cycling through elements.",name:"cycles",required:!1,type:{name:"boolean"}},focusIn:{defaultValue:{value:"false"},description:"",name:"focusIn",required:!1,type:{name:"boolean"}},closest:{defaultValue:{value:"true"},description:"",name:"closest",required:!1,type:{name:"boolean"}}}}}catch{}const v=`.stay:focus {
    background-color: #cadbee;
  }
  .skip:focus {
    background-color: red;
  }
`,F={title:"KeyboardNavigationHooks/FlowType",component:d,parameters:{layout:"centered",docs:{story:{autoplay:!0}}},tags:["autodocs","skip-visual-testing"],decorators:[e=>t.jsxs(t.Fragment,{children:[t.jsx("style",{children:v}),t.jsx(e,{})]})],args:{selector:".stay"},argTypes:{containerRef:{control:!1,type:{required:!0,name:"other",value:"RefObject<HTMLElement>"},description:"RefObject<HTMLElement> - Reference to the container element that will handle keyboard navigation",table:{type:{summary:"RefObject<HTMLElement>"},defaultValue:{summary:"useRef<HTMLDivElement>(null)"}}}},play:({canvasElement:e,context:r})=>{const a=e.ownerDocument.querySelector(".container");a&&a.querySelector(r.args.selector)?.focus()}},i={};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:"{}",...i.parameters?.docs?.source}}};const H=["Basic","FlowKeyingWithCycles","FlowKeyingWithoutCycles"];export{i as Basic,l as FlowKeyingWithCycles,c as FlowKeyingWithoutCycles,H as __namedExportsOrder,F as default};
