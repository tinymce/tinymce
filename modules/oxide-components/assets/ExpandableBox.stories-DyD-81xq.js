import{r as l,j as e}from"./iframe-Bqwj2VHp.js";import{e as z,b as A}from"./Bem-CgRdu8iC.js";import{B as V}from"./Button-CComdfQi.js";import{I as W}from"./Icon-DewQr_Ma.js";import{a as M}from"./Optional-CwMd5iHh.js";import{g as U}from"./Obj-CrmHtVnN.js";import"./Strings-UaHc7-Lp.js";import"./Fun--VEwoXIw.js";const i=({iconResolver:r,maxHeight:t=80,expanded:a=!1,onToggle:n,expandLabel:o="Expand",collapseLabel:b="Collapse",children:s})=>{const v=l.useRef(null),[y,I]=l.useState(!1),D=z("tox-expandable-box","content",{expanded:a,overflowing:y&&!a});return l.useLayoutEffect(()=>{const j=v.current;M(j)&&I(j.scrollHeight>t)},[s,t]),e.jsxs("div",{className:A("tox-expandable-box"),children:[e.jsx("div",{ref:v,className:D,style:{maxHeight:a?void 0:`${t}px`},children:s}),y&&e.jsxs(V,{variant:"naked",type:"button",onClick:()=>n==null?void 0:n(),children:[e.jsx(W,{resolver:r,icon:a?"chevron-up":"chevron-down"}),a?b:o]})]})};try{i.displayName="ExpandableBox",i.__docgenInfo={description:"Expandable container box",displayName:"ExpandableBox",props:{iconResolver:{defaultValue:null,description:"Icon resolver",name:"iconResolver",required:!0,type:{name:"(icon: string) => string"}},maxHeight:{defaultValue:{value:"80"},description:"Max height the content can be before it becomes expandable",name:"maxHeight",required:!1,type:{name:"number"}},expanded:{defaultValue:{value:"false"},description:"Expanded state",name:"expanded",required:!1,type:{name:"boolean"}},onToggle:{defaultValue:null,description:"Callback for toggle button",name:"onToggle",required:!1,type:{name:"(() => void)"}},expandLabel:{defaultValue:{value:"Expand"},description:"Text to render when the button is to expand the content",name:"expandLabel",required:!1,type:{name:"string"}},collapseLabel:{defaultValue:{value:"Collapse"},description:"Text to render when the button is to collapse the content",name:"collapseLabel",required:!1,type:{name:"string"}}}}}catch{}const{useArgs:F}=__STORYBOOK_MODULE_PREVIEW_API__,Z={"chevron-down":'<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',"chevron-up":'<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>'},K=r=>U(Z,r).getOrDie("Failed to get icon"),ae={title:"components/ExpandableBox",component:i,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"],args:{}},h=r=>{const[{expanded:t},a]=F(),n=o=>{a({expanded:o})};return e.jsx("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:e.jsx(i,{...r,expanded:t,onToggle:()=>n(!t)})})},d=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,f=()=>e.jsx("span",{style:{width:"600px",height:"20px",backgroundColor:"lightgray",display:"inline-block"},children:"This is a wide thing"}),c={iconResolver:K,maxHeight:80,collapseLabel:"Collapse",expandLabel:"Expand",children:e.jsx("p",{children:d})},p={args:{...c,children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:d}),e.jsx("p",{children:d})]})},render:h},u={args:{...c,children:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[d,e.jsx(f,{})]}),e.jsxs("p",{children:[d,e.jsx(f,{})]})]})},render:h},x={args:{...c,children:e.jsxs("p",{children:["Hello world",e.jsx(f,{})]})},render:h},g={args:{...c,children:e.jsx("p",{children:"Hello world"})},render:h},m={args:{...c},render:r=>{const[t,a]=l.useState(!1),[n,o]=l.useState(1);return e.jsxs("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:[e.jsx(i,{...r,expanded:t,onToggle:()=>a(!t),children:Array.from({length:n}).map((b,s)=>e.jsxs("p",{children:["Paragraph ",s+1]},s))}),e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"center"},children:[e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(n+1),children:"Add"}),e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(Math.max(1,n-1)),children:"Remove"})]})]})}};var w,E,_;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
}`,...(_=(E=p.parameters)==null?void 0:E.docs)==null?void 0:_.source}}};var S,C,O;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}<WideThing /></p><p>{longText}<WideThing /></p></>
  },
  render
}`,...(O=(C=u.parameters)==null?void 0:C.docs)==null?void 0:O.source}}};var P,T,k;x.parameters={...x.parameters,docs:{...(P=x.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world<WideThing /></p>
  },
  render
}`,...(k=(T=x.parameters)==null?void 0:T.docs)==null?void 0:k.source}}};var L,q,N;g.parameters={...g.parameters,docs:{...(L=g.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world</p>
  },
  render
}`,...(N=(q=g.parameters)==null?void 0:q.docs)==null?void 0:N.source}}};var R,B,H;m.parameters={...m.parameters,docs:{...(R=m.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    ...defaultsProps
  },
  render: args => {
    const [expanded, setExpanded] = useState(false);
    const [paragraphs, setParagraphs] = useState(1);
    return <div style={{
      display: 'flex',
      alignItems: 'stretch',
      boxSizing: 'border-box',
      flexDirection: 'column',
      gap: '8px',
      width: '400px'
    }}>
      <ExpandableBox {...args} expanded={expanded} onToggle={() => setExpanded(!expanded)}>
        {Array.from({
          length: paragraphs
        }).map((_, i) => <p key={i}>Paragraph {i + 1}</p>)}
      </ExpandableBox>
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center'
      }}>
        <button type="button" className="tox-button" onClick={() => setParagraphs(paragraphs + 1)}>Add</button>
        <button type="button" className="tox-button" onClick={() => setParagraphs(Math.max(1, paragraphs - 1))}>Remove</button>
      </div>
    </div>;
  }
}`,...(H=(B=m.parameters)==null?void 0:B.docs)==null?void 0:H.source}}};const ne=["Overflowing","OverflowingWithScroll","OverflowingHorizontallyOnly","Underflowing","DynamicContent"];export{m as DynamicContent,p as Overflowing,x as OverflowingHorizontallyOnly,u as OverflowingWithScroll,g as Underflowing,ne as __namedExportsOrder,ae as default};
