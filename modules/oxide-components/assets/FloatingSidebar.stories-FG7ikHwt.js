import{r as s,j as e}from"./iframe-m8jlWi5a.js";import{I as b}from"./IconButton-DkZACQq3.js";import{U as v}from"./UniverseProvider-6Km2qX_O.js";import{e as d,b as x}from"./Bem-uABtowwn.js";import{R as f,H as S}from"./Draggable-BTILJR52.js";import{e as y,i as w,d as F}from"./Optional-C7ZieBtS.js";import"./preload-helper-PPVm8Dsz.js";import"./Button-C4Pj9Hl_.js";import"./Icon-B82XuRAQ.js";import"./Universe-DM4c6Udm.js";import"./Strings-0z8lz2Ma.js";import"./Obj-DJRegViB.js";const l=s.forwardRef(({isOpen:i=!0,children:t,style:r,origin:a="top-right",initialPosition:u={x:0,y:0},onDragStart:m,onDragEnd:g},h)=>e.jsx(f,{className:x("tox-floating-sidebar",{open:i}),origin:a,initialPosition:u,allowedOverflow:{horizontal:.8},declaredSize:{width:"var(--tox-private-floating-sidebar-width)",height:"var(--tox-private-floating-sidebar-height)"},onDragStart:m,onDragEnd:g,style:r,ref:h,children:e.jsx("aside",{className:d("tox-floating-sidebar","content-wrapper"),children:t})})),p=s.forwardRef(({children:i},t)=>{const r=s.useCallback(a=>{t&&(y(t)?t(a):t.current=a)},[t]);return e.jsx(S,{children:e.jsx("header",{ref:r,className:`${d("tox-sidebar-content","header")} ${d("tox-floating-sidebar","header")}`,children:i})})}),{fn:c}=__STORYBOOK_MODULE_TEST__,D={title:"components/FloatingSidebar",component:l,parameters:{layout:"centered",docs:{description:{component:`A draggable floating sidebar component, can be positioned anywhere on the screen.

## How it works

The FloatingSidebar is built on top of the Draggable component.
It consists of two parts:

- **\`FloatingSidebar.Root\`** - The container that manages the sidebar's position and visibility.
- **\`FloatingSidebar.Header\`** - A required header element that acts as the drag handle for moving the sidebar.

The sidebar can be opened or closed programmatically using the \`isOpen\` prop.
When dragged, the sidebar can be moved freely and may partially extend beyond the viewport edge while maintaining its position across window resizes.`}}},decorators:[i=>e.jsx(v,{resources:j,children:e.jsx(i,{})})],argTypes:{isOpen:{description:"Controls the visibility of the floating sidebar. When `true`, the sidebar is shown; when `false`, it is hidden.",control:"boolean",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},origin:{description:"Determines which CSS coordinate system is used to position the sidebar. \nFor example, `top-left` uses the `top` and `left` CSS properties, while `bottom-right` uses `bottom` and `right`.\nThe `x` and `y` values in `initialPosition` correspond to these CSS properties.",control:{type:"radio"},options:["top-left","top-right","bottom-left","bottom-right"]},initialPosition:{description:'Sets the initial position of the sidebar as an object with `x` and `y` coordinates.\nThese values can be specified in any CSS length unit (pixels, percentages, etc.).\nThe `x` and `y` values map to the CSS positioning properties determined\nby the `origin` prop (e.g., with `origin="top-left"`, `x` maps to `left` and `y` maps to `top`)'},onDragStart:{description:"Optional callback function that is called when dragging begins."},onDragEnd:{description:"Optional callback function that is called when dragging ends."}},tags:["autodocs"],args:{onDragStart:c(),onDragEnd:c()}},n={args:{isOpen:!0,initialPosition:{x:"30px",y:"30px"},origin:"top-right"},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:i=>e.jsxs(l,{...i,children:[e.jsx(p,{children:e.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),e.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},_=`<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>
`,j={getIcon:F(_),translate:w},o={name:"Button in header",args:{isOpen:!0,initialPosition:{x:"30px",y:"30px"},origin:"top-right"},render:i=>e.jsxs(l,{...i,children:[e.jsxs(p,{children:[e.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"}),e.jsx("div",{className:"tox-sidebar-content__header-close-button",children:e.jsx(b,{variant:"naked",icon:"close","aria-label":"Close",onClick:()=>window.alert("Close the sidebar!")})})]}),e.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},L=["Example","ButtonInHeader"];n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
          <IconButton variant='naked' icon="close" aria-label="Close" onClick={() => window.alert('Close the sidebar!')} />
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
}`,...o.parameters?.docs?.source}}};export{o as ButtonInHeader,n as Example,L as __namedExportsOrder,D as default};
