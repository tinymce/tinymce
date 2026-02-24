import{j as e,r as f}from"./iframe-15ddwbeI.js";import{E as m}from"./ExpandableBox-D25-ZU7P.js";import{U as b}from"./UniverseProvider-DThdvWo9.js";import{g as y}from"./Obj-DUQpguIS.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-BaJhmSJn.js";import"./Optional-DbTLtGQT.js";import"./Strings-tLOZuS7x.js";import"./Fun--VEwoXIw.js";import"./Button-uktnlNjO.js";import"./Icon-Dw8UG_kz.js";const{useArgs:v}=__STORYBOOK_MODULE_PREVIEW_API__,j={"chevron-down":'<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',"chevron-up":'<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>'},w={getIcon:r=>y(j,r).getOrDie("Failed to get icon")},L={title:"components/ExpandableBox",component:m,decorators:[r=>e.jsx(b,{resources:w,children:e.jsx(r,{})})],parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"],args:{}},g=r=>{const[{expanded:t},x]=v(),n=o=>{x({expanded:o})};return e.jsx("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:e.jsx(m,{...r,expanded:t,onToggle:()=>n(!t)})})},s=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,u=()=>e.jsx("span",{style:{width:"600px",height:"20px",backgroundColor:"lightgray",display:"inline-block"},children:"This is a wide thing"}),a={maxHeight:80,collapseLabel:"Collapse",expandLabel:"Expand",children:e.jsx("p",{children:s})},i={args:{...a,children:e.jsxs(e.Fragment,{children:[e.jsx("p",{children:s}),e.jsx("p",{children:s})]})},render:g},l={args:{...a,children:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[s,e.jsx(u,{})]}),e.jsxs("p",{children:[s,e.jsx(u,{})]})]})},render:g},d={args:{...a,children:e.jsxs("p",{children:["Hello world",e.jsx(u,{})]})},render:g},p={args:{...a,children:e.jsx("p",{children:"Hello world"})},render:g},c={args:{...a},render:r=>{const[t,x]=f.useState(!1),[n,o]=f.useState(1);return e.jsxs("div",{style:{display:"flex",alignItems:"stretch",boxSizing:"border-box",flexDirection:"column",gap:"8px",width:"400px"},children:[e.jsx(m,{...r,expanded:t,onToggle:()=>x(!t),children:Array.from({length:n}).map((E,h)=>e.jsxs("p",{children:["Paragraph ",h+1]},h))}),e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"center"},children:[e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(n+1),children:"Add"}),e.jsx("button",{type:"button",className:"tox-button",onClick:()=>o(Math.max(1,n-1)),children:"Remove"})]})]})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <><p>{longText}<WideThing /></p><p>{longText}<WideThing /></p></>
  },
  render
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world<WideThing /></p>
  },
  render
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultsProps,
    children: <p>Hello world</p>
  },
  render
}`,...p.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};const U=["Overflowing","OverflowingWithScroll","OverflowingHorizontallyOnly","Underflowing","DynamicContent"];export{c as DynamicContent,i as Overflowing,d as OverflowingHorizontallyOnly,l as OverflowingWithScroll,p as Underflowing,U as __namedExportsOrder,L as default};
