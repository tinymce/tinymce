import{r as n,j as g}from"./iframe-D-F86K0x.js";import{b as S}from"./Bem-VFOblZbt.js";import{i as _}from"./Optional-xAorvXRI.js";import"./Strings-Cpm3hB5w.js";const H=e=>{const a=e.rows,t=e.value;e.value="",e.rows=1;const s=e.scrollHeight;return e.rows=a,e.value=t,s},q=({maxHeight:e,singleRowHeight:a})=>{if(e.unit==="rows")return Math.max(e.value,1);const t=Math.floor(e.value/a);return Math.max(t,1)},z=({minHeight:e,singleRowHeight:a})=>{if(e.unit==="rows")return Math.max(e.value,1);const t=Math.ceil(e.value/a);return Math.max(t,1)},E=({minRows:e,maxRows:a,singleRowHeight:t,textarea:s})=>{s.rows=e;const{scrollHeight:c}=s,p=Math.min(Math.max(e,Math.ceil(c/t)),a);s.rows=p},N={unit:"rows",value:1},T={unit:"rows",value:4},i=n.forwardRef(({maxHeight:e=T,minHeight:a=N,className:t,value:s,onChange:c,...p},o)=>{const u=n.useRef(null),[r,V]=n.useState(1);n.useLayoutEffect(()=>{u.current&&V(H(u.current))},[]);const v=n.useMemo(()=>z({minHeight:a,singleRowHeight:r}),[a,r]),f=n.useMemo(()=>q({maxHeight:e,singleRowHeight:r}),[e,r]);return n.useLayoutEffect(()=>{u.current&&E({textarea:u.current,minRows:v,maxRows:f,singleRowHeight:r})},[s,v,f,r]),g.jsx("textarea",{...p,className:`${S("tox-textarea")} ${t??""}`,value:s,onChange:l=>{c&&c(l.target.value)},ref:l=>{u.current=l,o&&(typeof o=="function"?o(l):_(o)&&(o.current=l))}})});try{i.displayName="AutoResizingTextarea",i.__docgenInfo={description:"",displayName:"AutoResizingTextarea",props:{maxHeight:{defaultValue:{value:`{
  unit: 'rows',
  value: 4
}`},description:"",name:"maxHeight",required:!1,type:{name:"Height"}},minHeight:{defaultValue:{value:`{
  unit: 'rows',
  value: 1
}`},description:"",name:"minHeight",required:!1,type:{name:"Height"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}},value:{defaultValue:null,description:"",name:"value",required:!0,type:{name:"string"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"((value: string) => void)"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},placeholder:{defaultValue:null,description:"",name:"placeholder",required:!1,type:{name:"string"}}}}}catch{}const k={title:"components/AutoResizingTextarea",component:i,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"]},m={args:{value:"initial value"},render:e=>{const[a,t]=n.useState(e.value);return g.jsx(i,{...e,value:a,onChange:t})}},d={args:{value:"initial value"},render:e=>{const[a,t]=n.useState(e.value);return g.jsx(i,{value:a,onChange:t,minHeight:{unit:"rows",value:2}})}};var h,w,x;m.parameters={...m.parameters,docs:{...(h=m.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    value: 'initial value'
  },
  render: args => {
    const [value, setValue] = useState(args.value);
    return <AutoResizingTextarea {...args} value={value} onChange={setValue} />;
  }
}`,...(x=(w=m.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var R,y,M;d.parameters={...d.parameters,docs:{...(R=d.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    value: 'initial value'
  },
  render: args => {
    const [value, setValue] = useState(args.value);
    return <AutoResizingTextarea value={value} onChange={setValue} minHeight={{
      unit: 'rows',
      value: 2
    }} />;
  }
}`,...(M=(y=d.parameters)==null?void 0:y.docs)==null?void 0:M.source}}};const L=["Example","StartsWith2Rows"];export{m as Example,d as StartsWith2Rows,L as __namedExportsOrder,k as default};
