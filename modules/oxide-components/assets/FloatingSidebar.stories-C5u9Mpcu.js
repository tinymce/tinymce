import{r,j as t,c}from"./iframe-NqYd2yDC.js";import{I as S}from"./IconButton-u3IGv2ll.js";import{R as H,H as j}from"./Draggable-CKkWa27s.js";import{c as q}from"./Optional-xAorvXRI.js";import"./Icon.component-B2GSstcR.js";import"./Button-DD1MMjR8.js";import"./Bem--Tv3ahAp.js";import"./Strings-Cpm3hB5w.js";const R=e=>{switch(e.origin){case"topleft":return{top:`${e.y}px`,left:`${e.x}px`};case"topright":return{top:`${e.y}px`,left:`calc(${e.x}px - var(--tox-private-floating-sidebar-width))`};case"bottomleft":return{top:`calc(${e.y}px - var(--tox-private-floating-sidebar-height))`,left:`${e.x}px`};case"bottomright":return{top:`calc(${e.y}px - var(--tox-private-floating-sidebar-height))`,left:`calc(${e.x}px - var(--tox-private-floating-sidebar-width))`}}},a=r.forwardRef(({isOpen:e=!0,height:y=600,children:_,...w},F)=>{const n=r.useRef(null),P=R(w.initialPosition??{x:0,y:0,origin:"topleft"});return r.useImperativeHandle(F,()=>({open:()=>{var i;(i=n.current)==null||i.togglePopover(!0)},close:()=>{var i;(i=n.current)==null||i.togglePopover(!1)}})),r.useEffect(()=>{const i=n.current;i&&i.togglePopover(e)},[e]),t.jsx(H,{ref:n,popover:"manual",className:c(["tox-floating-sidebar"]),style:{"--tox-private-floating-sidebar-requested-height":`${y}px`},initialPosition:P,declaredSize:{width:"var(--tox-private-floating-sidebar-width)",height:"var(--tox-private-floating-sidebar-height)"},children:t.jsx("aside",{className:c(["tox-floating-sidebar__content-wrapper"]),children:_})})}),o=({children:e})=>t.jsx(j,{children:t.jsx("header",{className:c(["tox-sidebar-content__header","tox-floating-sidebar__header"]),children:e})});try{a.displayName="Root",a.__docgenInfo={description:"",displayName:"Root",props:{isOpen:{defaultValue:{value:"true"},description:"",name:"isOpen",required:!1,type:{name:"boolean"}},height:{defaultValue:{value:"600"},description:"",name:"height",required:!1,type:{name:"number"}},initialPosition:{defaultValue:null,description:"",name:"initialPosition",required:!1,type:{name:"InitialPosition"}}}}}catch{}try{o.displayName="Header",o.__docgenInfo={description:"",displayName:"Header",props:{}}}catch{}const B={title:"components/FloatingSidebar",component:a,parameters:{layout:"centered",docs:{description:{component:"A draggable floating sidebar component that uses the Popover API and can be positioned anywhere on the screen.\n\n## How it works\n\nThe FloatingSidebar is built on top of the Draggable component and uses the browser's Popover API for overlay management.\nIt consists of two parts:\n\n- **`FloatingSidebar.Root`** - The container that manages the sidebar's position, visibility, and popover behavior.\n- **`FloatingSidebar.Header`** - A required header element that acts as the drag handle for moving the sidebar.\n\nThe sidebar can be opened or closed programmatically using the `isOpen` prop, or imperatively by using `ref` to call the `open` and `close` methods.\nWhen dragged, the sidebar remains within viewport bounds and maintains its position across window resizes."}}},argTypes:{isOpen:{description:"Controls the visibility of the floating sidebar. When `true`, the sidebar is shown; when `false`, it is hidden.",control:"boolean",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},height:{description:"The requested height of the sidebar in pixels. The actual height may be constrained by viewport size.",control:"number",table:{type:{summary:"number"},defaultValue:{summary:"600"}}},initialPosition:{description:"The initial position of the sidebar with x and y coordinates, and an origin point.\nThe origin determines which corner of the sidebar is anchored to the coordinates:\n- `topleft`: x and y represent the top-left corner\n- `topright`: x and y represent the top-right corner\n- `bottomleft`: x and y represent the bottom-left corner\n- `bottomright`: x and y represent the bottom-right corner",table:{type:{summary:'{ x: number, y: number, origin: "topleft" | "topright" | "bottomleft" | "bottomright" }'},defaultValue:{summary:'{ x: 0, y: 0, origin: "topleft" }'}}}},tags:["autodocs"]},s={args:{isOpen:!0,initialPosition:{x:30,y:30,origin:"topleft"}},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:e=>t.jsxs(a,{...e,children:[t.jsx(o,{children:t.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),t.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},I=`<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>
`,l={name:"Button in header",args:{isOpen:!0,initialPosition:{x:30,y:30,origin:"topleft"}},render:e=>t.jsxs(a,{...e,children:[t.jsxs(o,{children:[t.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"}),t.jsx("div",{className:"tox-sidebar-content__header-close-button",children:t.jsx(S,{variant:"naked",icon:"close",resolver:q(I),onClick:()=>window.alert("Close the sidebar!")})})]}),t.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},d={name:"Initial position",args:{origin:"bottomright",height:250},argTypes:{origin:{control:"radio",options:["topleft","topright","bottomleft","bottomright"],description:"The origin point that determines which corner of the sidebar is anchored to the coordinates"},isOpen:{table:{disable:!0}},initialPosition:{table:{disable:!0}}},render:e=>t.jsxs(t.Fragment,{children:[t.jsx("div",{style:{position:"absolute",top:300,left:400,height:"15px",width:"15px",backgroundColor:"red"}}),t.jsxs(a,{isOpen:!0,height:e.height,initialPosition:{x:400,y:300,origin:e.origin},children:[t.jsx(o,{children:t.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),t.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit."})]},e.origin)]})};var p,u,m;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=(u=s.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var h,g,b;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(b=(g=l.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var v,f,x;d.parameters={...d.parameters,docs:{...(v=d.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(x=(f=d.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};const V=["Example","ButtonInHeader","InitialPosition"];export{l as ButtonInHeader,s as Example,d as InitialPosition,V as __namedExportsOrder,B as default};
