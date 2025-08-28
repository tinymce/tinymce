import{r as n,j as d,c as S}from"./iframe-CHYBGZgy.js";import{i as _}from"./Type-DK8IqPft.js";const H=e=>{const a=e.rows,t=e.value;e.value="",e.rows=1;const s=e.scrollHeight;return e.rows=a,e.value=t,s},z=({maxHeight:e,singleRowHeight:a})=>{if(e.unit==="rows")return Math.max(e.value,1);const t=Math.floor(e.value/a);return Math.max(t,1)},E=({minHeight:e,singleRowHeight:a})=>{if(e.unit==="rows")return Math.max(e.value,1);const t=Math.ceil(e.value/a);return Math.max(t,1)},N=({minRows:e,maxRows:a,singleRowHeight:t,textarea:s})=>{s.rows=e;const{scrollHeight:c}=s,p=Math.min(Math.max(e,Math.ceil(c/t)),a);s.rows=p},T={unit:"rows",value:1},A={unit:"rows",value:4},l=n.forwardRef(({maxHeight:e=A,minHeight:a=T,className:t,value:s,onChange:c,...p},u)=>{const o=n.useRef(null),[r,V]=n.useState(1);n.useLayoutEffect(()=>{o.current&&V(H(o.current))},[]);const v=n.useMemo(()=>E({minHeight:a,singleRowHeight:r}),[a,r]),f=n.useMemo(()=>z({maxHeight:e,singleRowHeight:r}),[e,r]);return n.useLayoutEffect(()=>{o.current&&N({textarea:o.current,minRows:v,maxRows:f,singleRowHeight:r})},[s,v,f,r]),d.jsx("textarea",{...p,className:`${S(["tox-textarea"])} ${t??""}`,value:s,onChange:i=>{c&&c(i.target.value)},ref:i=>{o.current=i,u&&(typeof u=="function"?u(i):_(u)&&(u.current=i))}})});try{l.displayName="AutoResizingTextarea",l.__docgenInfo={description:"",displayName:"AutoResizingTextarea",props:{maxHeight:{defaultValue:{value:`{
  unit: 'rows',
  value: 4
}`},description:"",name:"maxHeight",required:!1,type:{name:"Height"}},minHeight:{defaultValue:{value:`{
  unit: 'rows',
  value: 1
}`},description:"",name:"minHeight",required:!1,type:{name:"Height"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}},value:{defaultValue:null,description:"",name:"value",required:!0,type:{name:"string"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"((value: string) => void)"}}}}}catch{}const q={title:"components/AutoResizingTextarea",component:l,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"]},m={args:{value:"initial value"},render:e=>{const[a,t]=n.useState(e.value);return d.jsx(l,{...e,value:a,onChange:t})}},g={args:{value:"initial value"},render:e=>{const[a,t]=n.useState(e.value);return d.jsx(l,{value:a,onChange:t,minHeight:{unit:"rows",value:2}})}};var h,w,x;m.parameters={...m.parameters,docs:{...(h=m.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    value: 'initial value'
  },
  render: args => {
    const [value, setValue] = useState(args.value);
    return <AutoResizingTextarea {...args} value={value} onChange={setValue} />;
  }
}`,...(x=(w=m.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var R,M,y;g.parameters={...g.parameters,docs:{...(R=g.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(y=(M=g.parameters)==null?void 0:M.docs)==null?void 0:y.source}}};const L=["Example","StartsWith2Rows"];export{m as Example,g as StartsWith2Rows,L as __namedExportsOrder,q as default};
