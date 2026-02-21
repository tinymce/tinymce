import{r,j as e}from"./iframe-BnFtquk-.js";import{i as w,O as V}from"./Optional-CuHnBc-7.js";import{c as y,d as j}from"./KeyboardNavigationHooks-CxFGbCUl.js";import{b as D,e as _}from"./Bem-BJplfvtK.js";import{n as P}from"./Fun--VEwoXIw.js";import"./preload-helper-PPVm8Dsz.js";import"./Strings-CwVUhXDr.js";import"./Obj-BYXNADYo.js";const R=r.createContext(null),L=()=>{const t=r.useContext(R);if(!w(t))throw new Error("SegmentedControl.Option must be used within SegmentedControl.Root");return t},a=r.forwardRef(({value:t,onChange:n,disabled:i,children:d,...u},l)=>{const s=r.useRef(null);r.useEffect(()=>{w(l)&&(typeof l=="function"?l(s.current):typeof l=="object"&&w(l)&&(l.current=s.current))},[l]),y({containerRef:s,selector:'[role="radio"]',allowHorizontal:!0,allowVertical:!1,cycles:!0,execute:p=>{const m=j(p,"data-value"),b=j(p,"aria-disabled")==="true";return w(m)&&m!==t&&!i&&!b&&n(m),V.some(!0)}});const c={value:t,onChange:n,disabled:i};return e.jsx(R.Provider,{value:c,children:e.jsx("div",{ref:s,className:D("tox-segmented-control",{disabled:i}),role:"radiogroup","aria-disabled":i,...u,children:d})})}),o=({value:t,disabled:n,children:i})=>{const{value:d,onChange:u,disabled:l}=L(),s=d===t,c=l||n,p=()=>c?-1:s?0:-1,m=()=>{!c&&!s&&u(t)};return e.jsx("span",{className:_("tox-segmented-control","segment",{active:s}),role:"radio","aria-checked":s,"aria-disabled":c?"true":"false",tabIndex:p(),"data-value":t,onClick:m,children:i})};try{a.displayName="Root",a.__docgenInfo={description:"",displayName:"Root",props:{value:{defaultValue:null,description:"",name:"value",required:!0,type:{name:"string"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!0,type:{name:"(value: string) => void"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}try{o.displayName="Option",o.__docgenInfo={description:"",displayName:"Option",props:{}}}catch{}const F={title:"components/SegmentedControl",parameters:{layout:"centered"},tags:["autodocs"]},g={render:()=>{const[t,n]=r.useState("diff");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]})}},v={render:()=>{const[t,n]=r.useState("preview");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]})}},S={render:()=>{const[t,n]=r.useState("off");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"off",children:"Off"}),e.jsx(o,{value:"on",children:"On"})]})}},C={render:()=>{const[t,n]=r.useState("show");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"show",children:"Show changes"}),e.jsx(o,{value:"hide",children:"Hide changes"})]})}},f={render:()=>{const[t,n]=r.useState("diff");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",alignItems:"flex-start"},children:[e.jsxs(a,{value:t,onChange:n,disabled:!0,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]}),e.jsxs(a,{value:"preview",onChange:n,disabled:!0,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]})]})}},h={render:()=>{const[t,n]=r.useState("left");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"left",children:"Left"}),e.jsx(o,{value:"right",children:"Right"})]})}},x={render:()=>{const[t,n]=r.useState("view");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"view",children:"View"}),e.jsx(o,{value:"edit",children:"Edit"}),e.jsx(o,{value:"preview",children:"Preview"})]})}},O={render:()=>{const[t,n]=r.useState("diff"),[i,d]=r.useState("edit"),[u,l]=r.useState("light");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",alignItems:"flex-start"},children:[e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]}),e.jsxs(a,{value:i,onChange:d,children:[e.jsx(o,{value:"edit",children:"Edit"}),e.jsx(o,{value:"view",children:"View"})]}),e.jsxs(a,{value:u,onChange:l,children:[e.jsx(o,{value:"light",children:"Light"}),e.jsx(o,{value:"dark",children:"Dark"})]}),e.jsxs(a,{value:"disabled",onChange:P,disabled:!0,children:[e.jsx(o,{value:"disabled",children:"Disabled"}),e.jsx(o,{value:"control",children:"Control"})]})]})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('diff');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...g.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('preview');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...v.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};const M=["LeftActive","RightActive","ShortLabels","LongLabels","Disabled","Interactive","ThreeOptions","MultipleControls"];export{f as Disabled,h as Interactive,g as LeftActive,C as LongLabels,O as MultipleControls,v as RightActive,S as ShortLabels,x as ThreeOptions,M as __namedExportsOrder,F as default};
