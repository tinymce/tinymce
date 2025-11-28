import{r as l,j as e}from"./iframe-4Et4ejVK.js";import{I as z}from"./Icon.component-BIGdDERd.js";import{e as A,b as V,g as W}from"./Bem-BJ9cjQ_m.js";import{B as M}from"./Button-BuIignGd.js";import{i as U}from"./Optional-BsJ-k4_8.js";import"./Strings-DyDqPgoE.js";import"./Fun--VEwoXIw.js";const i=({iconResolver:r,maxHeight:t=80,expanded:n=!1,onToggle:a,expandLabel:o="Expand",collapseLabel:b="Collapse",children:s})=>{const v=l.useRef(null),[y,I]=l.useState(!1),D=A("tox-expandable-box","content",{expanded:n,overflowing:y&&!n});return l.useLayoutEffect(()=>{const j=v.current;U(j)&&I(j.scrollHeight>t)},[s,t]),e.jsxs("div",{className:V("tox-expandable-box"),children:[e.jsx("div",{ref:v,className:D,style:{maxHeight:n?void 0:`${t}px`},children:s}),y&&e.jsxs(M,{variant:"naked",type:"button",onClick:()=>a==null?void 0:a(),children:[e.jsx(z,{resolver:r,icon:n?"chevron-up":"chevron-down"}),n?b:o]})]})};try{i.displayName="ExpandableBox",i.__docgenInfo={description:"Expandable container box",displayName:"ExpandableBox",props:{iconResolver:{defaultValue:null,description:"Icon resolver",name:"iconResolver",required:!0,type:{name:"(icon: string) => string"}},maxHeight:{defaultValue:{value:"80"},description:"Max height the content can be before it becomes expandable",name:"maxHeight",required:!1,type:{name:"number"}},expanded:{defaultValue:{value:"false"},description:"Expanded state",name:"expanded",required:!1,type:{name:"boolean"}},onToggle:{defaultValue:null,description:"Callback for toggle button",name:"onToggle",required:!1,type:{name:"(() => void)"}},expandLabel:{defaultValue:{value:"Expand"},description:"Text to render when the button is to expand the content",name:"expandLabel",required:!1,type:{name:"string"}},collapseLabel:{defaultValue:{value:"Collapse"},description:"Text to render when the button is to collapse the content",name:"collapseLabel",required:!1,type:{name:"string"}}}}}catch{}const{useArgs:F}=__STORYBOOK_MODULE_PREVIEW_API__,Z={"chevron-down":'<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',"chevron-up":'<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>'},K=r=>W(Z,r).getOrDie("Failed to get icon"),te={title:"components/ExpandableBox",component:i,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"],args:{}},h=r=>{const[{expanded:t},n]=F(),a=o=>{n({expanded:o})};return e.jsx("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:e.jsx(i,{...r,expanded:t,onToggle:()=>a(!t)})})},d=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,f=()=>e.jsx("span",{style:{width:"600px",height:"20px",backgroundColor:"lightgray",display:"inline-block"},children:"This is a wide thing"}),c={iconResolver:K,maxHeight:80,collapseLabel:"Collapse",expandLabel:"Expand",children:e.jsx("p",{children:d})},p={args:{...c,children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:d}),e.jsx("p",{children:d})]})},render:h},u={args:{...c,children:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[d,e.jsx(f,{})]}),e.jsxs("p",{children:[d,e.jsx(f,{})]})]})},render:h},x={args:{...c,children:e.jsxs("p",{children:["Hello world",e.jsx(f,{})]})},render:h},g={args:{...c,children:e.jsx("p",{children:"Hello world"})},render:h},m={args:{...c},render:r=>{const[t,n]=l.useState(!1),[a,o]=l.useState(1);return e.jsxs("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:[e.jsx(i,{...r,expanded:t,onToggle:()=>n(!t),children:Array.from({length:a}).map((b,s)=>e.jsxs("p",{children:["Paragraph ",s+1]},s))}),e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"center"},children:[e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(a+1),children:"Add"}),e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(Math.max(1,a-1)),children:"Remove"})]})]})}};var w,E,_;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(H=(B=m.parameters)==null?void 0:B.docs)==null?void 0:H.source}}};const ne=["Overflowing","OverflowingWithScroll","OverflowingHorizontallyOnly","Underflowing","DynamicContent"];export{m as DynamicContent,p as Overflowing,x as OverflowingHorizontallyOnly,u as OverflowingWithScroll,g as Underflowing,ne as __namedExportsOrder,te as default};
