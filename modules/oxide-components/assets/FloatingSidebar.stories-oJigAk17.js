import{j as e,c as m}from"./iframe-DfDF2x8D.js";import{U as y}from"./UniverseProvider-jw3579X1.js";import{I as _}from"./IconButton-Ba4LsHIT.js";import{b as S}from"./Bem-DWdSENOI.js";import{R as w,H as q}from"./Draggable-DKb3CYsd.js";import{c as j}from"./Fun--VEwoXIw.js";import"./Button-Bxl-_0Mb.js";import"./Universe-D_rlzAtv.js";import"./Optional-CilDcsXt.js";import"./Strings-BDyhe4Of.js";import"./Obj-ycCTN9Ns.js";const t=({isOpen:i=!0,children:g,style:h,origin:b="top-right",initialPosition:v={x:0,y:0},onDragStart:f,onDragEnd:x})=>e.jsx(w,{className:S("tox-floating-sidebar",{open:i}),origin:b,initialPosition:v,allowedOverflow:{horizontal:.8},declaredSize:{width:"var(--tox-private-floating-sidebar-width)",height:"var(--tox-private-floating-sidebar-height)"},onDragStart:f,onDragEnd:x,style:h,children:e.jsx("aside",{className:m(["tox-floating-sidebar__content-wrapper"]),children:g})}),n=({children:i})=>e.jsx(q,{children:e.jsx("header",{className:m(["tox-sidebar-content__header","tox-floating-sidebar__header"]),children:i})});try{t.displayName="Root",t.__docgenInfo={description:"",displayName:"Root",props:{isOpen:{defaultValue:{value:"true"},description:"",name:"isOpen",required:!1,type:{name:"boolean"}},origin:{defaultValue:{value:"top-right"},description:"",name:"origin",required:!1,type:{name:'"top-left" | "top-right" | "bottom-left" | "bottom-right"'}},initialPosition:{defaultValue:{value:"{ x: 0, y: 0 }"},description:"",name:"initialPosition",required:!1,type:{name:"{ x: Top<0 | (string & {})>; y: Left<0 | (string & {})>; }"}},style:{defaultValue:null,description:"",name:"style",required:!1,type:{name:"CSSProperties"}},onDragStart:{defaultValue:null,description:"",name:"onDragStart",required:!1,type:{name:"(() => void)"}},onDragEnd:{defaultValue:null,description:"",name:"onDragEnd",required:!1,type:{name:"(() => void)"}}}}}catch{}try{n.displayName="Header",n.__docgenInfo={description:"",displayName:"Header",props:{}}}catch{}const{fn:r}=__STORYBOOK_MODULE_TEST__,L={title:"components/FloatingSidebar",component:t,parameters:{layout:"centered",docs:{description:{component:`A draggable floating sidebar component, can be positioned anywhere on the screen.

## How it works

The FloatingSidebar is built on top of the Draggable component.
It consists of two parts:

- **\`FloatingSidebar.Root\`** - The container that manages the sidebar's position and visibility.
- **\`FloatingSidebar.Header\`** - A required header element that acts as the drag handle for moving the sidebar.

The sidebar can be opened or closed programmatically using the \`isOpen\` prop.
When dragged, the sidebar can be moved freely and may partially extend beyond the viewport edge while maintaining its position across window resizes.`}}},decorators:[i=>e.jsx(y,{resources:H,children:e.jsx(i,{})})],argTypes:{isOpen:{description:"Controls the visibility of the floating sidebar. When `true`, the sidebar is shown; when `false`, it is hidden.",control:"boolean",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},origin:{description:"Determines which CSS coordinate system is used to position the sidebar. \nFor example, `top-left` uses the `top` and `left` CSS properties, while `bottom-right` uses `bottom` and `right`.\nThe `x` and `y` values in `initialPosition` correspond to these CSS properties.",control:{type:"radio"},options:["top-left","top-right","bottom-left","bottom-right"]},initialPosition:{description:'Sets the initial position of the sidebar as an object with `x` and `y` coordinates.\nThese values can be specified in any CSS length unit (pixels, percentages, etc.).\nThe `x` and `y` values map to the CSS positioning properties determined\nby the `origin` prop (e.g., with `origin="top-left"`, `x` maps to `left` and `y` maps to `top`)'},onDragStart:{description:"Optional callback function that is called when dragging begins."},onDragEnd:{description:"Optional callback function that is called when dragging ends."}},tags:["autodocs"],args:{onDragStart:r(),onDragEnd:r()}},a={args:{isOpen:!0,initialPosition:{x:"30px",y:"30px"},origin:"top-right"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:i=>e.jsxs(t,{...i,children:[e.jsx(n,{children:e.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),e.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},F=`<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>
`,H={getIcon:j(F)},o={name:"Button in header",args:{isOpen:!0,initialPosition:{x:"30px",y:"30px"},origin:"top-right"},render:i=>e.jsxs(t,{...i,children:[e.jsxs(n,{children:[e.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"}),e.jsx("div",{className:"tox-sidebar-content__header-close-button",children:e.jsx(_,{variant:"naked",icon:"close",onClick:()=>window.alert("Close the sidebar!")})})]}),e.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})};var s,d,l;a.parameters={...a.parameters,docs:{...(s=a.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    initialPosition: {
      x: '30px',
      y: '30px'
    },
    origin: 'top-right'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render: (args: FloatingSidebarProps): JSX.Element => <FloatingSidebar.Root {...args}>
      <FloatingSidebar.Header>
        <div className='tox-sidebar-content__title'>Floating Header</div>
      </FloatingSidebar.Header>
      <div style={{
      padding: '12px'
    }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam.
        Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore,
        laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?
      </div>
    </FloatingSidebar.Root>
}`,...(l=(d=a.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var p,c,u;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Button in header',
  args: {
    isOpen: true,
    initialPosition: {
      x: '30px',
      y: '30px'
    },
    origin: 'top-right'
  },
  render: (args: FloatingSidebarProps): JSX.Element => <FloatingSidebar.Root {...args}>
      <FloatingSidebar.Header>
        <div className='tox-sidebar-content__title'>Floating Header</div>
        <div className='tox-sidebar-content__header-close-button'>
          <IconButton variant='naked' icon="close" onClick={() => window.alert('Close the sidebar!')} />
        </div>
      </FloatingSidebar.Header>
      <div style={{
      padding: '12px'
    }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam.
        Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore,
        laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?
      </div>
    </FloatingSidebar.Root>
}`,...(u=(c=o.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};const V=["Example","ButtonInHeader"];export{o as ButtonInHeader,a as Example,V as __namedExportsOrder,L as default};
