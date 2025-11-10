import{r as l,j as e}from"./iframe-xheP5H4k.js";import{I as B}from"./Icon.component-Dtf8Nehs.js";import{e as w,b as V,g as W}from"./Bem--Tv3ahAp.js";import{i as M}from"./Optional-xAorvXRI.js";import"./Strings-Cpm3hB5w.js";const i=({iconResolver:r,maxHeight:t=80,expanded:n=!1,onToggle:a,expandLabel:o="Expand",collapseLabel:f="Collapse",children:s})=>{const v=l.useRef(null),[y,z]=l.useState(!1),A=w("tox-expandable-box","content",{expanded:n,overflowing:y&&!n});return l.useLayoutEffect(()=>{const j=v.current;M(j)&&z(j.scrollHeight>t)},[s,t]),e.jsxs("div",{className:V("tox-expandable-box"),children:[e.jsx("div",{ref:v,className:A,style:{maxHeight:n?void 0:`${t}px`},children:s}),y&&e.jsxs("button",{type:"button",className:w("tox-expandable-box","toggle-button"),onClick:()=>a==null?void 0:a(),children:[e.jsx(B,{resolver:r,icon:n?"chevron-up":"chevron-down"}),n?f:o]})]})};try{i.displayName="ExpandableBox",i.__docgenInfo={description:"Expandable container box",displayName:"ExpandableBox",props:{iconResolver:{defaultValue:null,description:"Icon resolver",name:"iconResolver",required:!0,type:{name:"(icon: string) => string"}},maxHeight:{defaultValue:{value:"80"},description:"Max height the content can be before it becomes expandable",name:"maxHeight",required:!1,type:{name:"number"}},expanded:{defaultValue:{value:"false"},description:"Expanded state",name:"expanded",required:!1,type:{name:"boolean"}},onToggle:{defaultValue:null,description:"Callback for toggle button",name:"onToggle",required:!1,type:{name:"(() => void)"}},expandLabel:{defaultValue:{value:"Expand"},description:"Text to render when the button is to expand the content",name:"expandLabel",required:!1,type:{name:"string"}},collapseLabel:{defaultValue:{value:"Collapse"},description:"Text to render when the button is to collapse the content",name:"collapseLabel",required:!1,type:{name:"string"}}}}}catch{}const{useArgs:U}=__STORYBOOK_MODULE_PREVIEW_API__,F={"chevron-down":'<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',"chevron-up":'<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>'},Z=r=>W(F,r).getOrDie("Failed to get icon"),Q={title:"components/ExpandableBox",component:i,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"],args:{}},h=r=>{const[{expanded:t},n]=U(),a=o=>{n({expanded:o})};return e.jsx("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:e.jsx(i,{...r,expanded:t,onToggle:()=>a(!t)})})},d=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,b=()=>e.jsx("span",{style:{width:"600px",height:"20px",backgroundColor:"lightgray",display:"inline-block"},children:"This is a wide thing"}),c={iconResolver:Z,maxHeight:80,collapseLabel:"Collapse",expandLabel:"Expand",children:e.jsx("p",{children:d})},p={args:{...c,children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:d}),e.jsx("p",{children:d})]})},render:h},u={args:{...c,children:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[d,e.jsx(b,{})]}),e.jsxs("p",{children:[d,e.jsx(b,{})]})]})},render:h},x={args:{...c,children:e.jsxs("p",{children:["Hello world",e.jsx(b,{})]})},render:h},g={args:{...c,children:e.jsx("p",{children:"Hello world"})},render:h},m={args:{...c},render:r=>{const[t,n]=l.useState(!1),[a,o]=l.useState(1);return e.jsxs("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:[e.jsx(i,{...r,expanded:t,onToggle:()=>n(!t),children:Array.from({length:a}).map((f,s)=>e.jsxs("p",{children:["Paragraph ",s+1]},s))}),e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"center"},children:[e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(a+1),children:"Add"}),e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(Math.max(1,a-1)),children:"Remove"})]})]})}};var E,_,S;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
}`,...(S=(_=p.parameters)==null?void 0:_.docs)==null?void 0:S.source}}};var C,O,P;u.parameters={...u.parameters,docs:{...(C=u.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}<WideThing /></p><p>{longText}<WideThing /></p></>
  },
  render
}`,...(P=(O=u.parameters)==null?void 0:O.docs)==null?void 0:P.source}}};var T,L,k;x.parameters={...x.parameters,docs:{...(T=x.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world<WideThing /></p>
  },
  render
}`,...(k=(L=x.parameters)==null?void 0:L.docs)==null?void 0:k.source}}};var q,N,R;g.parameters={...g.parameters,docs:{...(q=g.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world</p>
  },
  render
}`,...(R=(N=g.parameters)==null?void 0:N.docs)==null?void 0:R.source}}};var H,I,D;m.parameters={...m.parameters,docs:{...(H=m.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(D=(I=m.parameters)==null?void 0:I.docs)==null?void 0:D.source}}};const X=["Overflowing","OverflowingWithScroll","OverflowingHorizontallyOnly","Underflowing","DynamicContent"];export{m as DynamicContent,p as Overflowing,x as OverflowingHorizontallyOnly,u as OverflowingWithScroll,g as Underflowing,X as __namedExportsOrder,Q as default};
