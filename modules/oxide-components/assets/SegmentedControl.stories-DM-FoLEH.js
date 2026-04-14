import{r,j as e}from"./iframe-Dp9s-o-3.js";import{f as D,a as _}from"./Strings-DatO8Mn0.js";import{i as R,O as P}from"./Optional-BMqOXurB.js";import{b as L,n as V}from"./KeyboardNavigationHooks-CvuGmtXR.js";import{b as N,e as E}from"./Bem-BAJJXTy-.js";import{n as I}from"./Fun-DfA6N4bS.js";import"./preload-helper-PPVm8Dsz.js";import"./Num-xrWELwUY.js";import"./Obj-4mkygeuk.js";const y=r.createContext(null),k=()=>{const t=r.useContext(y);if(!R(t))throw new Error("SegmentedControl.Option must be used within SegmentedControl.Root");return t},a=r.forwardRef(({value:t,onChange:n,disabled:s,children:u,...m},l)=>{const p=r.useRef(null);r.useEffect(()=>{R(l)&&(typeof l=="function"?l(p.current):typeof l=="object"&&R(l)&&(l.current=p.current))},[l]);const b=r.useMemo(()=>{const i=r.Children.toArray(u),c=D(i,d=>r.isValidElement(d)&&typeof d.type!="string");return _(c,d=>!s&&!d.props.disabled).map(d=>d.props.value).getOrNull()},[u,s]);L({containerRef:p,selector:'[role="radio"]',allowHorizontal:!0,allowVertical:!1,cycles:!0,execute:i=>{const c=V(i,"data-value"),v=V(i,"aria-disabled")==="true";return R(c)&&c!==t&&!s&&!v&&n(c),P.some(!0)}});const g={value:t,onChange:n,disabled:s,firstOptionValue:b};return e.jsx(y.Provider,{value:g,children:e.jsx("div",{ref:p,className:N("tox-segmented-control",{disabled:s}),role:"radiogroup","aria-disabled":s,...m,children:u})})}),o=r.forwardRef(({value:t,disabled:n,children:s},u)=>{const{value:m,onChange:l,disabled:p,firstOptionValue:b}=k(),g=m===t,i=p||n,c=b===t,v=()=>i?-1:c?0:-1,d=()=>{!i&&!g&&l(t)};return e.jsx("span",{ref:u,className:E("tox-segmented-control","segment",{active:g}),role:"radio","aria-checked":g,"aria-disabled":i?"true":"false",tabIndex:v(),"data-value":t,onClick:d,children:s})});try{a.displayName="Root",a.__docgenInfo={description:"",displayName:"Root",props:{value:{defaultValue:null,description:"",name:"value",required:!0,type:{name:"string"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!0,type:{name:"(value: string) => void"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}try{o.displayName="Option",o.__docgenInfo={description:"",displayName:"Option",props:{}}}catch{}const G={title:"components/SegmentedControl",parameters:{layout:"centered"},tags:["autodocs"]},S={render:()=>{const[t,n]=r.useState("diff");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]})}},f={render:()=>{const[t,n]=r.useState("preview");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]})}},C={render:()=>{const[t,n]=r.useState("off");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"off",children:"Off"}),e.jsx(o,{value:"on",children:"On"})]})}},h={render:()=>{const[t,n]=r.useState("show");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"show",children:"Show changes"}),e.jsx(o,{value:"hide",children:"Hide changes"})]})}},x={render:()=>{const[t,n]=r.useState("diff");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",alignItems:"flex-start"},children:[e.jsxs(a,{value:t,onChange:n,disabled:!0,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]}),e.jsxs(a,{value:"preview",onChange:n,disabled:!0,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]})]})}},O={render:()=>{const[t,n]=r.useState("left");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"left",children:"Left"}),e.jsx(o,{value:"right",children:"Right"})]})}},w={render:()=>{const[t,n]=r.useState("view");return e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"view",children:"View"}),e.jsx(o,{value:"edit",children:"Edit"}),e.jsx(o,{value:"preview",children:"Preview"})]})}},j={render:()=>{const[t,n]=r.useState("diff"),[s,u]=r.useState("edit"),[m,l]=r.useState("light");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",alignItems:"flex-start"},children:[e.jsxs(a,{value:t,onChange:n,children:[e.jsx(o,{value:"diff",children:"Diff mode"}),e.jsx(o,{value:"preview",children:"Preview"})]}),e.jsxs(a,{value:s,onChange:u,children:[e.jsx(o,{value:"edit",children:"Edit"}),e.jsx(o,{value:"view",children:"View"})]}),e.jsxs(a,{value:m,onChange:l,children:[e.jsx(o,{value:"light",children:"Light"}),e.jsx(o,{value:"dark",children:"Dark"})]}),e.jsxs(a,{value:"disabled",onChange:I,disabled:!0,children:[e.jsx(o,{value:"disabled",children:"Disabled"}),e.jsx(o,{value:"control",children:"Control"})]})]})}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('diff');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...S.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('preview');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...f.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('off');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="off">Off</SegmentedControl.Option>
        <SegmentedControl.Option value="on">On</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...C.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('show');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="show">Show changes</SegmentedControl.Option>
        <SegmentedControl.Option value="hide">Hide changes</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...h.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('left');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="left">Left</SegmentedControl.Option>
        <SegmentedControl.Option value="right">Right</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...O.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('view');
    return <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="view">View</SegmentedControl.Option>
        <SegmentedControl.Option value="edit">Edit</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>;
  }
}`,...w.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};const J=["LeftActive","RightActive","ShortLabels","LongLabels","Disabled","Interactive","ThreeOptions","MultipleControls"];export{x as Disabled,O as Interactive,S as LeftActive,h as LongLabels,j as MultipleControls,f as RightActive,C as ShortLabels,w as ThreeOptions,J as __namedExportsOrder,G as default};
