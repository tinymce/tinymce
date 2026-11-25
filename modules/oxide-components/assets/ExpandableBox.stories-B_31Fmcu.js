import{r as v,j as e}from"./iframe-m8jlWi5a.js";import{U as y}from"./UniverseProvider-6Km2qX_O.js";import{E as b}from"./ExpandableBox-Cxmn2Aw_.js";import{i as T}from"./Optional-C7ZieBtS.js";import{g as w}from"./Obj-DJRegViB.js";import"./preload-helper-PPVm8Dsz.js";import"./Universe-DM4c6Udm.js";import"./Bem-uABtowwn.js";import"./Strings-0z8lz2Ma.js";import"./Button-C4Pj9Hl_.js";import"./Icon-B82XuRAQ.js";const{useArgs:S}=__STORYBOOK_MODULE_PREVIEW_API__,P={"chevron-down":'<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',"chevron-up":'<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>',"source-file":'<svg width="16" height="16"><path d="M4.333 2h5.61L13 5.057v7.61c0 .735-.598 1.333-1.333 1.333H4.333A1.335 1.335 0 0 1 3 12.667V3.333C3 2.6 3.598 2 4.333 2Zm0 10.667h7.334V6H9V3.333H4.333v9.334Z" fill-rule="evenodd"/></svg>'},E={getIcon:t=>w(P,t).getOrDie("Failed to get icon"),translate:T},F={title:"components/ExpandableBox",component:b,decorators:[t=>e.jsx(y,{resources:E,children:e.jsx(t,{})})],parameters:{layout:"centered"},tags:["autodocs"],args:{}},s=t=>{const[{expanded:o},m]=S(),a=i=>{m({expanded:i})};return e.jsx("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:e.jsx(b,{...t,expanded:o,onToggle:()=>a(!o)})})},n=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,f=()=>e.jsx("span",{style:{width:"600px",height:"20px",backgroundColor:"lightgray",display:"inline-block"},children:"This is a wide thing"}),r={maxHeight:80,collapseLabel:"Collapse",expandLabel:"Expand",children:e.jsx("p",{children:n})},l={args:{...r,children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:n}),e.jsx("p",{children:n})]})},render:s},d={args:{...r,children:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[n,e.jsx(f,{})]}),e.jsxs("p",{children:[n,e.jsx(f,{})]})]})},render:s},c={args:{...r,children:e.jsxs("p",{children:["Hello world",e.jsx(f,{})]})},render:s},p={args:{...r,title:"Title",children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:n}),e.jsx("p",{children:n})]})},render:s},g={args:{...r,title:"Title",icon:"source-file",children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:n}),e.jsx("p",{children:n})]})},render:s},u={args:{...r,title:"A very long title that should be truncated with an ellipsis when it does not fit",icon:"source-file",children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:n}),e.jsx("p",{children:n})]})},render:s},h={args:{...r,children:e.jsx("p",{children:"Hello world"})},render:s},x={args:{...r},render:t=>{const[o,m]=v.useState(!1),[a,i]=v.useState(1);return e.jsxs("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:[e.jsx(b,{...t,expanded:o,onToggle:()=>m(!o),children:Array.from({length:a}).map((A,j)=>e.jsxs("p",{children:["Paragraph ",j+1]},j))}),e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"center"},children:[e.jsx("button",{type:"button",className:"tox-button",onClick:()=>i(a+1),children:"Add"}),e.jsx("button",{type:"button",className:"tox-button",onClick:()=>i(Math.max(1,a-1)),children:"Remove"})]})]})}},M=["Overflowing","OverflowingWithScroll","OverflowingHorizontallyOnly","WithTitle","WithTitleAndIcon","WithLongTitleAndIcon","Underflowing","DynamicContent"];l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}<WideThing /></p><p>{longText}<WideThing /></p></>
  },
  render
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world<WideThing /></p>
  },
  render
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    title: 'Title',
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    title: 'Title',
    icon: 'source-file',
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    title: 'A very long title that should be truncated with an ellipsis when it does not fit',
    icon: 'source-file',
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
}`,...u.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world</p>
  },
  render
}`,...h.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};export{x as DynamicContent,l as Overflowing,c as OverflowingHorizontallyOnly,d as OverflowingWithScroll,h as Underflowing,u as WithLongTitleAndIcon,p as WithTitle,g as WithTitleAndIcon,M as __namedExportsOrder,F as default};
