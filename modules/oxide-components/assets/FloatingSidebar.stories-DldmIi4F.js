import{r as i,j as t,c as u}from"./iframe-Bqwj2VHp.js";import{I as R}from"./IconButton-DXHq99QG.js";import{R as I,H as T}from"./Draggable-8D4Dtp1w.js";import{c as N}from"./Fun--VEwoXIw.js";import"./Button-CComdfQi.js";import"./Bem-CgRdu8iC.js";import"./Optional-CwMd5iHh.js";import"./Strings-UaHc7-Lp.js";import"./Obj-CrmHtVnN.js";import"./Icon-DewQr_Ma.js";const C=e=>{switch(e.origin){case"topleft":return{top:`${e.y}px`,left:`${e.x}px`};case"topright":return{top:`${e.y}px`,left:`calc(${e.x}px - var(--tox-private-floating-sidebar-width))`};case"bottomleft":return{top:`calc(${e.y}px - var(--tox-private-floating-sidebar-height))`,left:`${e.x}px`};case"bottomright":return{top:`calc(${e.y}px - var(--tox-private-floating-sidebar-height))`,left:`calc(${e.x}px - var(--tox-private-floating-sidebar-width))`}}},o=i.forwardRef(({isOpen:e=!0,height:w=600,children:S,...F},H)=>{const r=i.useRef(null),P=C(F.initialPosition??{x:0,y:0,origin:"topleft"}),[j,q]=i.useState(!1),c=i.useCallback(()=>{var a;(a=r.current)==null||a.togglePopover(!0),q(!0)},[]),p=i.useCallback(()=>{var a;return(a=r.current)==null?void 0:a.togglePopover(!1)},[]);return i.useImperativeHandle(H,()=>({open:c,close:p})),i.useEffect(()=>{r.current&&(e?c():p())},[e,c,p]),t.jsx(I,{ref:r,popover:"manual",className:u(["tox-floating-sidebar"]),style:{"--tox-private-floating-sidebar-requested-height":`${w}px`},initialPosition:P,declaredSize:{width:"var(--tox-private-floating-sidebar-width)",height:"var(--tox-private-floating-sidebar-height)"},children:t.jsx("aside",{className:u(["tox-floating-sidebar__content-wrapper"]),children:j&&S})})}),n=({children:e})=>t.jsx(T,{children:t.jsx("header",{className:u(["tox-sidebar-content__header","tox-floating-sidebar__header"]),children:e})});try{o.displayName="Root",o.__docgenInfo={description:"",displayName:"Root",props:{isOpen:{defaultValue:{value:"true"},description:"",name:"isOpen",required:!1,type:{name:"boolean"}},height:{defaultValue:{value:"600"},description:"",name:"height",required:!1,type:{name:"number"}},initialPosition:{defaultValue:null,description:"",name:"initialPosition",required:!1,type:{name:"InitialPosition"}}}}}catch{}try{n.displayName="Header",n.__docgenInfo={description:"",displayName:"Header",props:{}}}catch{}const W={title:"components/FloatingSidebar",component:o,parameters:{layout:"centered",docs:{description:{component:"A draggable floating sidebar component that uses the Popover API and can be positioned anywhere on the screen.\n\n## How it works\n\nThe FloatingSidebar is built on top of the Draggable component and uses the browser's Popover API for overlay management.\nIt consists of two parts:\n\n- **`FloatingSidebar.Root`** - The container that manages the sidebar's position, visibility, and popover behavior.\n- **`FloatingSidebar.Header`** - A required header element that acts as the drag handle for moving the sidebar.\n\nThe sidebar can be opened or closed programmatically using the `isOpen` prop, or imperatively by using `ref` to call the `open` and `close` methods.\nWhen dragged, the sidebar remains within viewport bounds and maintains its position across window resizes."}}},argTypes:{isOpen:{description:"Controls the visibility of the floating sidebar. When `true`, the sidebar is shown; when `false`, it is hidden.",control:"boolean",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},height:{description:"The requested height of the sidebar in pixels. The actual height may be constrained by viewport size.",control:"number",table:{type:{summary:"number"},defaultValue:{summary:"600"}}},initialPosition:{description:"The initial position of the sidebar with x and y coordinates, and an origin point.\nThe origin determines which corner of the sidebar is anchored to the coordinates:\n- `topleft`: x and y represent the top-left corner\n- `topright`: x and y represent the top-right corner\n- `bottomleft`: x and y represent the bottom-left corner\n- `bottomright`: x and y represent the bottom-right corner",table:{type:{summary:'{ x: number, y: number, origin: "topleft" | "topright" | "bottomleft" | "bottomright" }'},defaultValue:{summary:'{ x: 0, y: 0, origin: "topleft" }'}}}},tags:["autodocs"]},s={args:{isOpen:!0,initialPosition:{x:30,y:30,origin:"topleft"}},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:e=>t.jsxs(o,{...e,children:[t.jsx(n,{children:t.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),t.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},O=`<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>
`,l={name:"Button in header",args:{isOpen:!0,initialPosition:{x:30,y:30,origin:"topleft"}},render:e=>t.jsxs(o,{...e,children:[t.jsxs(n,{children:[t.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"}),t.jsx("div",{className:"tox-sidebar-content__header-close-button",children:t.jsx(R,{variant:"naked",icon:"close",resolver:N(O),onClick:()=>window.alert("Close the sidebar!")})})]}),t.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},d={name:"Initial position",args:{origin:"bottomright",height:250},argTypes:{origin:{control:"radio",options:["topleft","topright","bottomleft","bottomright"],description:"The origin point that determines which corner of the sidebar is anchored to the coordinates"},isOpen:{table:{disable:!0}},initialPosition:{table:{disable:!0}}},render:e=>t.jsxs(t.Fragment,{children:[t.jsx("div",{style:{position:"absolute",top:300,left:400,height:"15px",width:"15px",backgroundColor:"red"}}),t.jsxs(o,{isOpen:!0,height:e.height,initialPosition:{x:400,y:300,origin:e.origin},children:[t.jsx(n,{children:t.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),t.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit."})]},e.origin)]})};var m,h,g;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    initialPosition: {
      x: 30,
      y: 30,
      origin: 'topleft'
    }
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
}`,...(g=(h=s.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var b,f,v;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Button in header',
  args: {
    isOpen: true,
    initialPosition: {
      x: 30,
      y: 30,
      origin: 'topleft'
    }
  },
  render: (args: FloatingSidebarProps): JSX.Element => <FloatingSidebar.Root {...args}>
      <FloatingSidebar.Header>
        <div className='tox-sidebar-content__title'>Floating Header</div>
        <div className='tox-sidebar-content__header-close-button'>
          <IconButton variant='naked' icon="close" resolver={Fun.constant(resolvedIcon)} onClick={() => window.alert('Close the sidebar!')} />
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
}`,...(v=(f=l.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var x,y,_;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'Initial position',
  args: {
    origin: 'bottomright',
    height: 250
  },
  argTypes: {
    origin: {
      control: 'radio',
      options: ['topleft', 'topright', 'bottomleft', 'bottomright'],
      description: 'The origin point that determines which corner of the sidebar is anchored to the coordinates'
    },
    isOpen: {
      table: {
        disable: true
      }
    },
    initialPosition: {
      table: {
        disable: true
      }
    }
  },
  render: (args): JSX.Element => <>
      <div style={{
      position: 'absolute',
      top: 300,
      left: 400,
      height: '15px',
      width: '15px',
      backgroundColor: 'red'
    }}></div>
      <FloatingSidebar.Root key={args.origin} isOpen={true} height={args.height} initialPosition={{
      x: 400,
      y: 300,
      origin: args.origin
    }}>
        <FloatingSidebar.Header>
          <div className='tox-sidebar-content__title'>Floating Header</div>
        </FloatingSidebar.Header>
        <div style={{
        padding: '12px'
      }}>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
      </FloatingSidebar.Root>
    </>
}`,...(_=(y=d.parameters)==null?void 0:y.docs)==null?void 0:_.source}}};const D=["Example","ButtonInHeader","InitialPosition"];export{l as ButtonInHeader,s as Example,d as InitialPosition,D as __namedExportsOrder,W as default};
