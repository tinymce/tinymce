import{r as o,j as a,c}from"./iframe-CQQKTGU1.js";import{R as x,H as g}from"./Draggable-LoxC9v1N.js";const v=e=>{const r=(Array.isArray(e)?e:[e]).filter(t=>o.isValidElement(t)&&t.type===i),d=(Array.isArray(e)?e:[e]).filter(t=>!o.isValidElement(t)||t.type!==i);if(r.length===0)throw new Error("FloatingSidebar requires a header");if(r.length>1)throw new Error("FloatingSidebar accepts only one header");return{header:r[0],children:d}},n=({isOpen:e=!0,height:r=600,...d})=>{const{header:t,children:h}=v(d.children),p=o.useRef(null);return o.useEffect(()=>{const l=p.current;l&&(e?l.showPopover():l.hidePopover())},[e]),a.jsx(x,{ref:p,popover:"manual",className:c(["tox-floating-sidebar"]),style:{"--tox-private-floating-sidebar-requested-height":`${r}px`},children:a.jsxs("aside",{className:c(["tox-floating-sidebar__content-wrapper"]),children:[a.jsx(g,{children:t}),h]})})},i=({children:e})=>a.jsx("header",{className:c(["tox-sidebar-content__header","tox-floating-sidebar__header"]),children:e});try{n.displayName="Root",n.__docgenInfo={description:"",displayName:"Root",props:{isOpen:{defaultValue:{value:"true"},description:"",name:"isOpen",required:!1,type:{name:"boolean"}},height:{defaultValue:{value:"600"},description:"",name:"height",required:!1,type:{name:"number"}}}}}catch{}try{i.displayName="Header",i.__docgenInfo={description:"",displayName:"Header",props:{}}}catch{}const q={title:"components/FloatingSidebar",component:n,parameters:{layout:"centered"},tags:["autodocs"]},_=e=>a.jsx(n,{...e}),s={args:{isOpen:!0,children:[a.jsx(i,{children:a.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})},0),a.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"},1)]},parameters:{},render:_};var u,m,f;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    children: [<FloatingSidebar.Header key={0}>
        <div className='tox-sidebar-content__title'>Floating Header</div>
      </FloatingSidebar.Header>, <div key={1} style={{
      padding: '12px'
    }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam.
        Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore,
        laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?
      </div>]
  },
  parameters: {},
  render
}`,...(f=(m=s.parameters)==null?void 0:m.docs)==null?void 0:f.source}}};const j=["Example"];export{s as Example,j as __namedExportsOrder,q as default};
