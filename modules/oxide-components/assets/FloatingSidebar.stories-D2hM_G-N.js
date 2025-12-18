import{r as w,j as i,c as b}from"./iframe-C7NE8tRI.js";import{U as S}from"./UniverseProvider-PUcfqhFi.js";import{I as F}from"./IconButton-4ZUL2Ntw.js";import{b as j}from"./Bem-CMgfceZl.js";import{R as H,H as q}from"./Draggable-DlxKFRZR.js";import{c as P}from"./Fun--VEwoXIw.js";import"./Button-D9ENjlHI.js";import"./Universe-oMyZVlke.js";import"./Optional-CHj922Ci.js";import"./Strings-D6HyETGk.js";import"./Obj-BAtCA5NI.js";const R=e=>{switch(e.origin){case"topleft":return{top:`${e.y}px`,left:`${e.x}px`};case"topright":return{top:`${e.y}px`,left:`calc(${e.x}px - var(--tox-private-floating-sidebar-width))`};case"bottomleft":return{top:`calc(${e.y}px - var(--tox-private-floating-sidebar-height))`,left:`${e.x}px`};case"bottomright":return{top:`calc(${e.y}px - var(--tox-private-floating-sidebar-height))`,left:`calc(${e.x}px - var(--tox-private-floating-sidebar-width))`}}},t=({isOpen:e=!0,children:x,style:f,...v})=>{const y=w.useRef(null),_=R(v.initialPosition??{x:0,y:0,origin:"topleft"});return i.jsx(H,{ref:y,className:j("tox-floating-sidebar",{open:e}),initialPosition:_,declaredSize:{width:"var(--tox-private-floating-sidebar-width)",height:"var(--tox-private-floating-sidebar-height)"},style:f,children:i.jsx("aside",{className:b(["tox-floating-sidebar__content-wrapper"]),children:x})})},a=({children:e})=>i.jsx(q,{children:i.jsx("header",{className:b(["tox-sidebar-content__header","tox-floating-sidebar__header"]),children:e})});try{t.displayName="Root",t.__docgenInfo={description:"",displayName:"Root",props:{isOpen:{defaultValue:{value:"true"},description:"",name:"isOpen",required:!1,type:{name:"boolean"}},initialPosition:{defaultValue:null,description:"",name:"initialPosition",required:!1,type:{name:"InitialPosition"}},style:{defaultValue:null,description:"",name:"style",required:!1,type:{name:"CSSProperties"}}}}}catch{}try{a.displayName="Header",a.__docgenInfo={description:"",displayName:"Header",props:{}}}catch{}const X={title:"components/FloatingSidebar",component:t,parameters:{layout:"centered",docs:{description:{component:`A draggable floating sidebar component, can be positioned anywhere on the screen.

## How it works

The FloatingSidebar is built on top of the Draggable component.
It consists of two parts:

- **\`FloatingSidebar.Root\`** - The container that manages the sidebar's position and visibility.
- **\`FloatingSidebar.Header\`** - A required header element that acts as the drag handle for moving the sidebar.

The sidebar can be opened or closed programmatically using the \`isOpen\` prop.
When dragged, the sidebar remains within viewport bounds and maintains its position across window resizes.`}}},decorators:[e=>i.jsx(S,{resources:N,children:i.jsx(e,{})})],argTypes:{isOpen:{description:"Controls the visibility of the floating sidebar. When `true`, the sidebar is shown; when `false`, it is hidden.",control:"boolean",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},initialPosition:{description:"The initial position of the sidebar with x and y coordinates, and an origin point.\nThe origin determines which corner of the sidebar is anchored to the coordinates:\n- `topleft`: x and y represent the top-left corner\n- `topright`: x and y represent the top-right corner\n- `bottomleft`: x and y represent the bottom-left corner\n- `bottomright`: x and y represent the bottom-right corner",table:{type:{summary:'{ x: number, y: number, origin: "topleft" | "topright" | "bottomleft" | "bottomright" }'},defaultValue:{summary:'{ x: 0, y: 0, origin: "topleft" }'}}}},tags:["autodocs"]},o={args:{isOpen:!0,initialPosition:{x:30,y:30,origin:"topleft"}},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:e=>i.jsxs(t,{...e,children:[i.jsx(a,{children:i.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),i.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},I=`<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>
`,N={getIcon:P(I)},n={name:"Button in header",args:{isOpen:!0,initialPosition:{x:30,y:30,origin:"topleft"}},render:e=>i.jsxs(t,{...e,children:[i.jsxs(a,{children:[i.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"}),i.jsx("div",{className:"tox-sidebar-content__header-close-button",children:i.jsx(F,{variant:"naked",icon:"close",onClick:()=>window.alert("Close the sidebar!")})})]}),i.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam. Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore, laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?"})]})},r={name:"Initial position",args:{origin:"bottomright"},argTypes:{origin:{control:"radio",options:["topleft","topright","bottomleft","bottomright"],description:"The origin point that determines which corner of the sidebar is anchored to the coordinates"},isOpen:{table:{disable:!0}},initialPosition:{table:{disable:!0}}},render:e=>i.jsxs(i.Fragment,{children:[i.jsx("div",{style:{position:"absolute",top:300,left:400,height:"15px",width:"15px",backgroundColor:"red"}}),i.jsxs(t,{style:{"--tox-private-floating-sidebar-height":"250px"},isOpen:!0,initialPosition:{x:400,y:300,origin:e.origin},children:[i.jsx(a,{children:i.jsx("div",{className:"tox-sidebar-content__title",children:"Floating Header"})}),i.jsx("div",{style:{padding:"12px"},children:"Lorem ipsum dolor sit amet consectetur adipisicing elit."})]},e.origin)]})};var s,d,l;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(l=(d=o.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var c,p,m;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(m=(p=n.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var u,g,h;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  name: 'Initial position',
  args: {
    origin: 'bottomright'
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
      <FloatingSidebar.Root key={args.origin} style={{
      '--tox-private-floating-sidebar-height': '250px'
    }} isOpen={true} initialPosition={{
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
}`,...(h=(g=r.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};const z=["Example","ButtonInHeader","InitialPosition"];export{n as ButtonInHeader,o as Example,r as InitialPosition,z as __namedExportsOrder,X as default};
