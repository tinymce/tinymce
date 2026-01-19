import{r as l,j as e}from"./iframe-Phrq4Xly.js";import{e as z,b as A}from"./Bem-A_X-XUhj.js";import{B as R}from"./Button-CLwgwj0s.js";import{I as U}from"./Universe-BGVFRU4m.js";import{a as W}from"./Optional-DGH8Y1w3.js";import{U as M}from"./UniverseProvider-CRvKBadQ.js";import{g as V}from"./Obj-0QrmN1ba.js";import"./Strings-CkeB91LW.js";import"./Fun--VEwoXIw.js";const i=({maxHeight:t=80,expanded:a=!1,onToggle:n,expandLabel:r="Expand",collapseLabel:o="Collapse",children:f})=>{const s=l.useRef(null),[v,I]=l.useState(!1),D=z("tox-expandable-box","content",{expanded:a,overflowing:v&&!a});return l.useLayoutEffect(()=>{const y=s.current;W(y)&&I(y.scrollHeight>t)},[f,t]),e.jsxs("div",{className:A("tox-expandable-box"),children:[e.jsx("div",{ref:s,className:D,style:{maxHeight:a?void 0:`${t}px`},children:f}),v&&e.jsxs(R,{variant:"naked",type:"button",onClick:()=>n==null?void 0:n(),children:[e.jsx(U,{icon:a?"chevron-up":"chevron-down"}),a?o:r]})]})};try{i.displayName="ExpandableBox",i.__docgenInfo={description:"Expandable container box",displayName:"ExpandableBox",props:{maxHeight:{defaultValue:{value:"80"},description:"Max height the content can be before it becomes expandable",name:"maxHeight",required:!1,type:{name:"number"}},expanded:{defaultValue:{value:"false"},description:"Expanded state",name:"expanded",required:!1,type:{name:"boolean"}},onToggle:{defaultValue:null,description:"Callback for toggle button",name:"onToggle",required:!1,type:{name:"(() => void)"}},expandLabel:{defaultValue:{value:"Expand"},description:"Text to render when the button is to expand the content",name:"expandLabel",required:!1,type:{name:"string"}},collapseLabel:{defaultValue:{value:"Collapse"},description:"Text to render when the button is to collapse the content",name:"collapseLabel",required:!1,type:{name:"string"}}}}}catch{}const{useArgs:F}=__STORYBOOK_MODULE_PREVIEW_API__,Z={"chevron-down":'<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',"chevron-up":'<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>'},K={getIcon:t=>V(Z,t).getOrDie("Failed to get icon")},ne={title:"components/ExpandableBox",component:i,decorators:[t=>e.jsx(M,{resources:K,children:e.jsx(t,{})})],parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"],args:{}},h=t=>{const[{expanded:a},n]=F(),r=o=>{n({expanded:o})};return e.jsx("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:e.jsx(i,{...t,expanded:a,onToggle:()=>r(!a)})})},d=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,b=()=>e.jsx("span",{style:{width:"600px",height:"20px",backgroundColor:"lightgray",display:"inline-block"},children:"This is a wide thing"}),c={maxHeight:80,collapseLabel:"Collapse",expandLabel:"Expand",children:e.jsx("p",{children:d})},p={args:{...c,children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:d}),e.jsx("p",{children:d})]})},render:h},u={args:{...c,children:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[d,e.jsx(b,{})]}),e.jsxs("p",{children:[d,e.jsx(b,{})]})]})},render:h},x={args:{...c,children:e.jsxs("p",{children:["Hello world",e.jsx(b,{})]})},render:h},m={args:{...c,children:e.jsx("p",{children:"Hello world"})},render:h},g={args:{...c},render:t=>{const[a,n]=l.useState(!1),[r,o]=l.useState(1);return e.jsxs("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:[e.jsx(i,{...t,expanded:a,onToggle:()=>n(!a),children:Array.from({length:r}).map((f,s)=>e.jsxs("p",{children:["Paragraph ",s+1]},s))}),e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"center"},children:[e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(r+1),children:"Add"}),e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(Math.max(1,r-1)),children:"Remove"})]})]})}};var j,w,E;p.parameters={...p.parameters,docs:{...(j=p.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
}`,...(E=(w=p.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};var _,S,C;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}<WideThing /></p><p>{longText}<WideThing /></p></>
  },
  render
}`,...(C=(S=u.parameters)==null?void 0:S.docs)==null?void 0:C.source}}};var O,P,T;x.parameters={...x.parameters,docs:{...(O=x.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world<WideThing /></p>
  },
  render
}`,...(T=(P=x.parameters)==null?void 0:P.docs)==null?void 0:T.source}}};var k,L,q;m.parameters={...m.parameters,docs:{...(k=m.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world</p>
  },
  render
}`,...(q=(L=m.parameters)==null?void 0:L.docs)==null?void 0:q.source}}};var N,B,H;g.parameters={...g.parameters,docs:{...(N=g.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(H=(B=g.parameters)==null?void 0:B.docs)==null?void 0:H.source}}};const re=["Overflowing","OverflowingWithScroll","OverflowingHorizontallyOnly","Underflowing","DynamicContent"];export{g as DynamicContent,p as Overflowing,x as OverflowingHorizontallyOnly,u as OverflowingWithScroll,m as Underflowing,re as __namedExportsOrder,ne as default};
