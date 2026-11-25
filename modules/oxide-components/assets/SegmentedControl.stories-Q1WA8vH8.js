import{r,j as e}from"./iframe-m8jlWi5a.js";import{a as w,O as V,n as D}from"./Optional-C7ZieBtS.js";import{b as y,l as j}from"./KeyboardNavigationHooks-DDqxoP3O.js";import{b as P,e as L}from"./Bem-uABtowwn.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-v4NJLiy_.js";import"./PredicateFind-cjflXcNJ.js";import"./Strings-0z8lz2Ma.js";import"./Num-xrWELwUY.js";import"./Visibility-HiPE8kkv.js";import"./Obj-DJRegViB.js";const R=r.createContext(null),E=()=>{const t=r.useContext(R);if(!w(t))throw new Error("SegmentedControl.Option must be used within SegmentedControl.Root");return t},a=r.forwardRef(({value:t,onChange:o,disabled:s,children:d,...u},l)=>{const i=r.useRef(null);r.useEffect(()=>{w(l)&&(typeof l=="function"?l(i.current):typeof l=="object"&&w(l)&&(l.current=i.current))},[l]),y({containerRef:i,selector:'[role="radio"]',allowHorizontal:!0,allowVertical:!1,cycles:!0,execute:m=>{const g=j(m,"data-value"),b=j(m,"aria-disabled")==="true";return w(g)&&g!==t&&!s&&!b&&o(g),V.some(!0)}});const c={value:t,onChange:o,disabled:s};return e.jsx(R.Provider,{value:c,children:e.jsx("div",{ref:i,className:P("tox-segmented-control",{disabled:s}),role:"radiogroup","aria-disabled":s,...u,children:d})})}),n=r.forwardRef(({value:t,disabled:o,children:s},d)=>{const{value:u,onChange:l,disabled:i}=E(),c=u===t,m=i||o,g=()=>{!m&&!c&&l(t)};return e.jsx("span",{ref:d,className:L("tox-segmented-control","segment",{active:c}),role:"radio","aria-checked":c,"aria-disabled":m?"true":"false",tabIndex:-1,"data-value":t,onClick:g,children:s})}),q={title:"components/SegmentedControl",parameters:{layout:"centered"},tags:["autodocs"]},v={render:()=>{const[t,o]=r.useState("diff");return e.jsxs(a,{value:t,onChange:o,children:[e.jsx(n,{value:"diff",children:"Diff mode"}),e.jsx(n,{value:"preview",children:"Preview"})]})}},p={render:()=>{const[t,o]=r.useState("preview");return e.jsxs(a,{value:t,onChange:o,children:[e.jsx(n,{value:"diff",children:"Diff mode"}),e.jsx(n,{value:"preview",children:"Preview"})]})}},S={render:()=>{const[t,o]=r.useState("off");return e.jsxs(a,{value:t,onChange:o,children:[e.jsx(n,{value:"off",children:"Off"}),e.jsx(n,{value:"on",children:"On"})]})}},C={render:()=>{const[t,o]=r.useState("show");return e.jsxs(a,{value:t,onChange:o,children:[e.jsx(n,{value:"show",children:"Show changes"}),e.jsx(n,{value:"hide",children:"Hide changes"})]})}},f={render:()=>{const[t,o]=r.useState("diff");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",alignItems:"flex-start"},children:[e.jsxs(a,{value:t,onChange:o,disabled:!0,children:[e.jsx(n,{value:"diff",children:"Diff mode"}),e.jsx(n,{value:"preview",children:"Preview"})]}),e.jsxs(a,{value:"preview",onChange:o,disabled:!0,children:[e.jsx(n,{value:"diff",children:"Diff mode"}),e.jsx(n,{value:"preview",children:"Preview"})]})]})}},h={render:()=>{const[t,o]=r.useState("left");return e.jsxs(a,{value:t,onChange:o,children:[e.jsx(n,{value:"left",children:"Left"}),e.jsx(n,{value:"right",children:"Right"})]})}},x={render:()=>{const[t,o]=r.useState("view");return e.jsxs(a,{value:t,onChange:o,children:[e.jsx(n,{value:"view",children:"View"}),e.jsx(n,{value:"edit",children:"Edit"}),e.jsx(n,{value:"preview",children:"Preview"})]})}},O={render:()=>{const[t,o]=r.useState("diff"),[s,d]=r.useState("edit"),[u,l]=r.useState("light");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",alignItems:"flex-start"},children:[e.jsxs(a,{value:t,onChange:o,children:[e.jsx(n,{value:"diff",children:"Diff mode"}),e.jsx(n,{value:"preview",children:"Preview"})]}),e.jsxs(a,{value:s,onChange:d,children:[e.jsx(n,{value:"edit",children:"Edit"}),e.jsx(n,{value:"view",children:"View"})]}),e.jsxs(a,{value:u,onChange:l,children:[e.jsx(n,{value:"light",children:"Light"}),e.jsx(n,{value:"dark",children:"Dark"})]}),e.jsxs(a,{value:"disabled",onChange:D,disabled:!0,children:[e.jsx(n,{value:"disabled",children:"Disabled"}),e.jsx(n,{value:"control",children:"Control"})]})]})}},B=["LeftActive","RightActive","ShortLabels","LongLabels","Disabled","Interactive","ThreeOptions","MultipleControls"];v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('diff');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...v.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('preview');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...p.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('off');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="off">Off</SegmentedControl.Option>
        <SegmentedControl.Option value="on">On</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...S.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('show');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="show">Show changes</SegmentedControl.Option>
        <SegmentedControl.Option value="hide">Hide changes</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...C.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('diff');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'flex-start'
    }}>
        <SegmentedControl.Root value={value} onChange={setValue} disabled>
          <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
          <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
        </SegmentedControl.Root>
        <SegmentedControl.Root value="preview" onChange={setValue} disabled>
          <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
          <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
        </SegmentedControl.Root>
      </div>;
  }
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('left');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="left">Left</SegmentedControl.Option>
        <SegmentedControl.Option value="right">Right</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...h.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('view');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="view">View</SegmentedControl.Option>
        <SegmentedControl.Option value="edit">Edit</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...x.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [state1, setState1] = useState('diff');
    const [state2, setState2] = useState('edit');
    const [state3, setState3] = useState('light');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'flex-start'
    }}>
        <SegmentedControl.Root value={state1} onChange={setState1}>
          <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
          <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
        </SegmentedControl.Root>
        <SegmentedControl.Root value={state2} onChange={setState2}>
          <SegmentedControl.Option value="edit">Edit</SegmentedControl.Option>
          <SegmentedControl.Option value="view">View</SegmentedControl.Option>
        </SegmentedControl.Root>
        <SegmentedControl.Root value={state3} onChange={setState3}>
          <SegmentedControl.Option value="light">Light</SegmentedControl.Option>
          <SegmentedControl.Option value="dark">Dark</SegmentedControl.Option>
        </SegmentedControl.Root>
        <SegmentedControl.Root value="disabled" onChange={Fun.noop} disabled>
          <SegmentedControl.Option value="disabled">Disabled</SegmentedControl.Option>
          <SegmentedControl.Option value="control">Control</SegmentedControl.Option>
        </SegmentedControl.Root>
      </div>;
  }
}`,...O.parameters?.docs?.source}}};export{f as Disabled,h as Interactive,v as LeftActive,C as LongLabels,O as MultipleControls,p as RightActive,S as ShortLabels,x as ThreeOptions,B as __namedExportsOrder,q as default};
