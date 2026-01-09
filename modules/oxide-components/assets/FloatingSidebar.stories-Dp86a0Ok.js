import{j as e,c as u}from"./iframe-CTdvD1WV.js";import{U as v}from"./UniverseProvider-Clsb9xh4.js";import{I as x}from"./IconButton-NnXtJa9y.js";import{b as f}from"./Bem-DDAe-1K0.js";import{R as y,H as _}from"./Draggable-DcBWlHsa.js";import{c as S}from"./Fun--VEwoXIw.js";import"./Button-AsiG_7sA.js";import"./Universe-By04W8kO.js";import"./Optional-DSwtTfFR.js";import"./Strings-DLAoeKw-.js";import"./Obj-CCYZ-IyV.js";const t=({isOpen:i=!0,children:m,style:g,origin:h="top-right",initialPosition:b={x:0,y:0}})=>e.jsx(y,{className:f("tox-floating-sidebar",{open:i}),origin:h,initialPosition:b,allowedOverflow:{horizontal:.8},declaredSize:{width:"var(--tox-private-floating-sidebar-width)",height:"var(--tox-private-floating-sidebar-height)"},style:g,children:e.jsx("aside",{className:u(["tox-floating-sidebar__content-wrapper"]),children:m})}),n=({children:i})=>e.jsx(_,{children:e.jsx("header",{className:u(["tox-sidebar-content__header","tox-floating-sidebar__header"]),children:i})});try{t.displayName="Root",t.__docgenInfo={description:"",displayName:"Root",props:{isOpen:{defaultValue:{value:"true"},description:"",name:"isOpen",required:!1,type:{name:"boolean"}},origin:{defaultValue:{value:"top-right"},description:"",name:"origin",required:!1,type:{name:'"top-left" | "top-right" | "bottom-left" | "bottom-right"'}},initialPosition:{defaultValue:{value:"{ x: 0, y: 0 }"},description:"",name:"initialPosition",required:!1,type:{name:"{ x: Top<0 | (string & {})>; y: Left<0 | (string & {})>; }"}},style:{defaultValue:null,description:"",name:"style",required:!1,type:{name:"CSSProperties"}}}}}catch{}try{n.displayName="Header",n.__docgenInfo={description:"",displayName:"Header",props:{}}}catch{}const B={title:"components/FloatingSidebar",component:t,parameters:{layout:"centered",docs:{description:{component:`A draggable floating sidebar component, can be positioned anywhere on the screen.

## How it works

The FloatingSidebar is built on top of the Draggable component.
It consists of two parts:

- **\`FloatingSidebar.Root\`** - The container that manages the sidebar's position and visibility.
- **\`FloatingSidebar.Header\`** - A required header element that acts as the drag handle for moving the sidebar.

The sidebar can be opened or closed programmatically using the \`isOpen\` prop.
When dragged, the sidebar can be moved freely and may partially extend beyond the viewport edge while maintaining its position across window resizes.`}}},decorators:[i=>e.jsx(v,{resources:q,children:e.jsx(i,{})})],argTypes:{isOpen:{description:"Controls the visibility of the floating sidebar. When `true`, the sidebar is shown; when `false`, it is hidden.",control:"boolean",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},origin:{description:"Determines which CSS coordinate system is used to position the sidebar. \nFor example, `top-left` uses the `top` and `left` CSS properties, while `bottom-right` uses `bottom` and `right`.\nThe `x` and `y` values in `initialPosition` correspond to these CSS properties.",control:{type:"radio"},options:["top-left","top-right","bottom-left","bottom-right"]},initialPosition:{description:'Sets the initial position of the sidebar as an object with `x` and `y` coordinates.\nThese values can be specified in any CSS length unit (pixels, percentages, etc.).\nThe `x` and `y` values map to the CSS positioning properties determined \nby the `origin` prop (e.g., with `origin="top-left"`, `x` maps to `left` and `y` maps to `top`)'}},tags:["autodocs"]},a={args:{isOpen:!0,initialPosition:{x:"30px",y:"30px"},origin:"top-right"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:i=>e.jsxs(t,{...i,children:[e.jsx(n,{children:e.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),e.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},w=`<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>
`,q={getIcon:S(w)},o={name:"Button in header",args:{isOpen:!0,initialPosition:{x:"30px",y:"30px"},origin:"top-right"},render:i=>e.jsxs(t,{...i,children:[e.jsxs(n,{children:[e.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"}),e.jsx("div",{className:"tox-sidebar-content__header-close-button",children:e.jsx(x,{variant:"naked",icon:"close",onClick:()=>window.alert("Close the sidebar!")})})]}),e.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})};var r,s,d;a.parameters={...a.parameters,docs:{...(r=a.parameters)==null?void 0:r.docs,source:{originalSource:`{
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
}`,...(d=(s=a.parameters)==null?void 0:s.docs)==null?void 0:d.source}}};var l,p,c;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(c=(p=o.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const E=["Example","ButtonInHeader"];export{o as ButtonInHeader,a as Example,E as __namedExportsOrder,B as default};
