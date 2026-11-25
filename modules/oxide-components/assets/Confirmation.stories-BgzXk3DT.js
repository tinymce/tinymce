import{r,j as e}from"./iframe-m8jlWi5a.js";import{g as y}from"./icons-BH388hKR.js";import{U as h}from"./UniverseProvider-6Km2qX_O.js";import{S as w}from"./Spinner-B7j5eotS.js";import{u as b}from"./Universe-DM4c6Udm.js";import{e as a,b as v}from"./Bem-uABtowwn.js";import{B as C}from"./Button-C4Pj9Hl_.js";import{i as N}from"./Optional-C7ZieBtS.js";import{g as R}from"./Obj-DJRegViB.js";import"./preload-helper-PPVm8Dsz.js";import"./Strings-0z8lz2Ma.js";const P=({text:o,buttonName:t,cancelBtnName:n,onConfirm:i,onCancel:l})=>{const{translate:c}=b(),s=t??c("Yes"),p=n??c("No"),u=r.useRef(null),[f,x]=r.useState(!1);r.useEffect(()=>{u.current?.focus()},[u]);const j=r.useCallback(g=>{g.stopPropagation(),g.preventDefault(),x(!0),i().finally(()=>{x(!1)})},[i]);return e.jsx("div",{className:v("tox-dialog-wrap"),children:e.jsx("div",{style:{display:"flex"},className:a("tox-dialog-wrap","backdrop"),children:e.jsxs("dialog",{style:{margin:"auto"},className:v("tox-dialog"),children:[e.jsx("div",{className:a("tox-dialog","body"),children:e.jsx("div",{className:a("tox-dialog","body-content"),children:o})}),e.jsxs("div",{className:a("tox-dialog","footer"),children:[e.jsx("div",{className:a("tox-dialog","footer-start")}),e.jsxs("div",{className:a("tox-dialog","footer-end"),children:[e.jsx(C,{variant:"primary",ref:u,disabled:f,onClick:j,"aria-label":s,children:f?e.jsx(w,{type:"circle",color:"lightgray"}):s}),e.jsx(C,{variant:"secondary",disabled:f,onClick:()=>{l().catch(console.error)},"aria-label":p,children:p})]})]})]})})})},k=r.forwardRef((o,t)=>{const[n,i]=r.useState(null),l=r.useRef(0),c=r.useRef(!0);return r.useEffect(()=>()=>{c.current=!1},[]),r.useImperativeHandle(t,()=>({confirm:s=>{l.current+=1,i({id:l.current,options:s})}}),[]),n?e.jsx(P,{text:n.options.text,onConfirm:()=>c.current?n.options.onConfirm().finally(()=>i(s=>s?.id===n.id?null:s)):Promise.resolve(),onCancel:()=>(i(null),Promise.resolve())},n.id):null}),E=y(),_={close:E.close},D={getIcon:o=>R(_,o).getOrDie("Failed to get icon"),translate:N},S=o=>{const t=r.useRef(null);return e.jsxs("div",{style:{width:"480px"},children:[e.jsx(k,{ref:t}),e.jsx("button",{style:{cursor:"pointer"},onClick:()=>t.current?.confirm({text:o.text,onConfirm:o.onConfirm}),children:"show"})]})},z={title:"components/Confirmation",decorators:[o=>e.jsx(h,{resources:D,children:e.jsx(o,{})})],parameters:{layout:"centered"},tags:["autodocs"],args:{text:"do you want to confirm it?",onConfirm:()=>new Promise(o=>{setTimeout(()=>{o()},1e3)})},render:S},m={args:{text:"do you want to confirm it?",onConfirm:()=>new Promise(o=>{setTimeout(()=>o(),2e3)})}},d={args:{text:"do you want to confirm it?",onConfirm:()=>new Promise((o,t)=>{setTimeout(()=>t(),2e3)})}},G=["ConfirmationDialog","ConfirmationDialogWithError"];m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'do you want to confirm it?',
    onConfirm: () => new Promise(resolve => {
      setTimeout(() => {
        return resolve();
      }, 2_000);
    })
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'do you want to confirm it?',
    onConfirm: () => new Promise((_resolve, reject) => {
      setTimeout(() => {
        return reject();
      }, 2_000);
    })
  }
}`,...d.parameters?.docs?.source}}};export{m as ConfirmationDialog,d as ConfirmationDialogWithError,G as __namedExportsOrder,z as default};
