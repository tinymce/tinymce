import{r as v,j as e}from"./iframe-DcUk-pSD.js";import{U as y}from"./UniverseProvider-JuRbKnlw.js";import{E as b}from"./ExpandableBox-D-H6kSRf.js";import{i as T}from"./Optional-CwIPeCD0.js";import{g as w}from"./Obj-dSJWADda.js";import"./preload-helper-PPVm8Dsz.js";import"./Universe-BvVaJLT4.js";import"./Bem-BDvzWjIo.js";import"./Strings-DwL7BECk.js";import"./Button-DytB-ttv.js";import"./Icon-BoGqIHQw.js";const{useArgs:S}=__STORYBOOK_MODULE_PREVIEW_API__,P={"chevron-down":'<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',"chevron-up":'<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>',"source-file":'<svg width="16" height="16"><path d="M4.333 2h5.61L13 5.057v7.61c0 .735-.598 1.333-1.333 1.333H4.333A1.335 1.335 0 0 1 3 12.667V3.333C3 2.6 3.598 2 4.333 2Zm0 10.667h7.334V6H9V3.333H4.333v9.334Z" fill-rule="evenodd"/></svg>'},E={getIcon:n=>w(P,n).getOrDie("Failed to get icon"),translate:T},F={title:"components/ExpandableBox",component:b,decorators:[n=>e.jsx(y,{resources:E,children:e.jsx(n,{})})],parameters:{layout:"centered"},tags:["autodocs"],args:{}},s=n=>{const[{expanded:o},m]=S(),a=i=>{m({expanded:i})};return e.jsx("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:e.jsx(b,{...n,expanded:o,onToggle:()=>a(!o)})})},r=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,f=()=>e.jsx("span",{style:{width:"600px",height:"20px",backgroundColor:"lightgray",display:"inline-block"},children:"This is a wide thing"}),t={maxHeight:80,collapseLabel:"Collapse",expandLabel:"Expand",children:e.jsx("p",{children:r})},l={args:{...t,children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:r}),e.jsx("p",{children:r})]})},render:s},d={args:{...t,children:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[r,e.jsx(f,{})]}),e.jsxs("p",{children:[r,e.jsx(f,{})]})]})},render:s},c={args:{...t,children:e.jsxs("p",{children:["Hello world",e.jsx(f,{})]})},render:s},p={args:{...t,title:"Title",children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:r}),e.jsx("p",{children:r})]})},render:s},g={args:{...t,title:"Title",icon:"source-file",children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:r}),e.jsx("p",{children:r})]})},render:s},u={args:{...t,title:"A very long title that should be truncated with an ellipsis when it does not fit",icon:"source-file",children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:r}),e.jsx("p",{children:r})]})},render:s},h={args:{...t,children:e.jsx("p",{children:"Hello world"})},render:s},x={args:{...t},render:n=>{const[o,m]=v.useState(!1),[a,i]=v.useState(1);return e.jsxs("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:[e.jsx(b,{...n,expanded:o,onToggle:()=>m(!o),children:Array.from({length:a}).map((A,j)=>e.jsxs("p",{children:["Paragraph ",j+1]},j))}),e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"center"},children:[e.jsx("button",{type:"button",className:"tox-button",onClick:()=>i(a+1),children:"Add"}),e.jsx("button",{type:"button",className:"tox-button",onClick:()=>i(Math.max(1,a-1)),children:"Remove"})]})]})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};const M=["Overflowing","OverflowingWithScroll","OverflowingHorizontallyOnly","WithTitle","WithTitleAndIcon","WithLongTitleAndIcon","Underflowing","DynamicContent"];export{x as DynamicContent,l as Overflowing,c as OverflowingHorizontallyOnly,d as OverflowingWithScroll,h as Underflowing,u as WithLongTitleAndIcon,p as WithTitle,g as WithTitleAndIcon,M as __namedExportsOrder,F as default};
