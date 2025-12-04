import{r as c,j as d}from"./iframe-Bqwj2VHp.js";import{B as he}from"./Button-CComdfQi.js";import{b as ye}from"./Bem-CgRdu8iC.js";import"./Optional-CwMd5iHh.js";import"./Strings-UaHc7-Lp.js";import"./Fun--VEwoXIw.js";import"./Obj-CrmHtVnN.js";const pe=c.createContext(null),me=()=>{const e=c.useContext(pe);if(e===null)throw new Error("Dropdown compound components must be rendered within the Dropdown component");return e},xe=(e,n,t)=>e==="top"?n.top-t.top:t.bottom-n.bottom,He=(e,n,t)=>e==="left"?n.left-t.left:t.right-n.right,ve=({anchorRect:e,anchoredContainerRect:n,side:t,align:r,gap:a,boundaryRect:l=document.documentElement.getBoundingClientRect()})=>{if(t==="top"||t==="bottom"){const o=xe(t,e,l),p=t==="top"?e.top-n.height-a:e.bottom+a;let i=e.left;return r==="center"&&(i=e.left+e.width/2-n.width/2),r==="end"&&(i=e.right-n.width),{maxHeight:`${o}px`,top:`${p}px`,left:`${i}px`}}if(t==="left"||t==="right"){const o=He(t,e,l),p=t==="left"?e.left-n.width-a:e.right+a;let i=e.top;return r==="center"&&(i=e.top-n.width/2+e.width/2),r==="end"&&(i=e.bottom-n.height),{maxWidth:`${o}px`,top:`${i}px`,left:`${p}px`}}return{}},Se=8,B=({children:e,...n})=>{const{popoverId:t,triggerRef:r,side:a,align:l}=me(),o=c.useRef(null),[p,i]=c.useState({}),E=c.useCallback(m=>{if(m.newState==="open"&&r.current&&o.current){const ge=document.documentElement.getBoundingClientRect(),ue=r.current.getBoundingClientRect(),fe=o.current.getBoundingClientRect();i(ve({anchorRect:ue,anchoredContainerRect:fe,side:a,align:l,gap:Se,boundaryRect:ge}))}},[o,r,l,a]);return c.useEffect(()=>{const m=o.current;if(m!==null)return m.addEventListener("toggle",E),()=>{m.removeEventListener("toggle",E)}},[o,E]),d.jsx("div",{className:ye("tox-dropdown-content"),popover:"auto",id:t,ref:o,...n,style:{...p},children:e})},j=({children:e,...n})=>{const{popoverId:t,triggerRef:r}=me();return d.jsx(he,{popovertarget:t,popovertargetaction:"toggle",ref:r,...n,children:e})},C=({children:e,side:n="top",align:t="start"})=>{const r=c.useId(),a=c.useRef(null);return d.jsx(pe.Provider,{value:{triggerRef:a,popoverId:r,side:n,align:t},children:e})};try{C.displayName="Root",C.__docgenInfo={description:"",displayName:"Root",props:{side:{defaultValue:{value:"top"},description:"",name:"side",required:!1,type:{name:'"top" | "bottom" | "left" | "right"'}},align:{defaultValue:{value:"start"},description:"",name:"align",required:!1,type:{name:'"start" | "center" | "end"'}}}}}catch{}try{B.displayName="Content",B.__docgenInfo={description:"",displayName:"Content",props:{}}}catch{}try{j.displayName="TriggerButton",j.__docgenInfo={description:"",displayName:"TriggerButton",props:{variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:'"primary" | "secondary" | "outlined" | "naked"'}},active:{defaultValue:null,description:"",name:"active",required:!1,type:{name:"boolean"}}}}}catch{}const Te={title:"components/Dropdown",component:C,argTypes:{side:{description:"On which side of the trigger button should the content container appear",value:"top",options:["top","bottom","left","right"]},align:{description:"Should the content container be aligned to the start, center or end of the trigger button.",value:"start",options:["start","center","end"]}},parameters:{layout:"centered",docs:{description:{component:"A dropdown component. Contains a button and an anchored container that can be used for creating menus."}}},tags:["autodocs","skip-visual-testing","dropdown-visual-testing"]},s=e=>d.jsx("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"},children:d.jsxs(C,{side:e.side,align:e.align,children:[d.jsx(j,{variant:"secondary",children:"Click me to toggle dropdown"}),d.jsx(B,{children:d.jsx("div",{style:{width:"400px",height:"300px",border:"2px solid lightgrey",borderRadius:"8px"}})})]})}),g={args:{side:"top",align:"start"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},u={args:{side:"top",align:"center"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},f={args:{side:"top",align:"end"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},h={args:{side:"bottom",align:"start"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},y={args:{side:"bottom",align:"center"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},x={args:{side:"bottom",align:"end"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},H={args:{side:"left",align:"start"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},v={args:{side:"left",align:"center"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},S={args:{side:"left",align:"end"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},_={args:{side:"right",align:"start"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},b={args:{side:"right",align:"center"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s},w={args:{side:"right",align:"end"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:s};var T,I,L;g.parameters={...g.parameters,docs:{...(T=g.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    side: 'top',
    align: 'start'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(L=(I=g.parameters)==null?void 0:I.docs)==null?void 0:L.source}}};var N,$,k;u.parameters={...u.parameters,docs:{...(N=u.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    side: 'top',
    align: 'center'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(k=($=u.parameters)==null?void 0:$.docs)==null?void 0:k.source}}};var D,P,q;f.parameters={...f.parameters,docs:{...(D=f.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    side: 'top',
    align: 'end'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(q=(P=f.parameters)==null?void 0:P.docs)==null?void 0:q.source}}};var V,W,A;h.parameters={...h.parameters,docs:{...(V=h.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    side: 'bottom',
    align: 'start'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(A=(W=h.parameters)==null?void 0:W.docs)==null?void 0:A.source}}};var M,O,R;y.parameters={...y.parameters,docs:{...(M=y.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    side: 'bottom',
    align: 'center'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(R=(O=y.parameters)==null?void 0:O.docs)==null?void 0:R.source}}};var G,z,F;x.parameters={...x.parameters,docs:{...(G=x.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    side: 'bottom',
    align: 'end'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(F=(z=x.parameters)==null?void 0:z.docs)==null?void 0:F.source}}};var J,K,Q;H.parameters={...H.parameters,docs:{...(J=H.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    side: 'left',
    align: 'start'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(Q=(K=H.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var U,X,Y;v.parameters={...v.parameters,docs:{...(U=v.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    side: 'left',
    align: 'center'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(Y=(X=v.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,te;S.parameters={...S.parameters,docs:{...(Z=S.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    side: 'left',
    align: 'end'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(te=(ee=S.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ne,re,se;_.parameters={..._.parameters,docs:{...(ne=_.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  args: {
    side: 'right',
    align: 'start'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(se=(re=_.parameters)==null?void 0:re.docs)==null?void 0:se.source}}};var oe,ae,ie;b.parameters={...b.parameters,docs:{...(oe=b.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  args: {
    side: 'right',
    align: 'center'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(ie=(ae=b.parameters)==null?void 0:ae.docs)==null?void 0:ie.source}}};var de,ce,le;w.parameters={...w.parameters,docs:{...(de=w.parameters)==null?void 0:de.docs,source:{originalSource:`{
  args: {
    side: 'right',
    align: 'end'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(le=(ce=w.parameters)==null?void 0:ce.docs)==null?void 0:le.source}}};const Ie=["TopStart","TopCenter","TopEnd","BottomStart","BottomCenter","BottomEnd","LeftStart","LeftCenter","LeftEnd","RightStart","RightCenter","RightEnd"];export{y as BottomCenter,x as BottomEnd,h as BottomStart,v as LeftCenter,S as LeftEnd,H as LeftStart,b as RightCenter,w as RightEnd,_ as RightStart,u as TopCenter,f as TopEnd,g as TopStart,Ie as __namedExportsOrder,Te as default};
