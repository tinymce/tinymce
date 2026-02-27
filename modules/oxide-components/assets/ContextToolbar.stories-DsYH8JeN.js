import{r as t,j as o}from"./iframe-J9TtgGkm.js";import{U as V}from"./UniverseProvider-MCXJRTL8.js";import{B as r}from"./Button-COPsK-St.js";import{I as U}from"./IconButton-DnQFlXkm.js";import{e as $}from"./Strings-tLOZuS7x.js";import{g as J}from"./Id-D_rOpTWK.js";import{O as D,i as C,b as H}from"./Optional-DbTLtGQT.js";import{S as I,f as X,i as Y,e as O,h as Z,j as Q,k as oo,s as k,a as q,c as eo,p as to,l as no}from"./KeyboardNavigationHooks-CjsnDBIe.js";import{c as ro}from"./Fun--VEwoXIw.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-BaJhmSJn.js";import"./Obj-DUQpguIS.js";import"./Icon-CO_NQ6QA.js";const so=e=>e.dom.classList!==void 0,io=(e,n)=>so(e)&&e.dom.classList.contains(n),W=t.createContext(null),F=()=>{const e=t.useContext(W);if(!C(e))throw new Error("useContextToolbarContext must be used within a ContextToolbarProvider");return e},ao="6px",g=({children:e,persistent:n=!1,anchorRef:s,usePopover:d=!1})=>{const[l,v]=t.useState(!1),c=t.useRef(null),u=t.useRef(null),T=t.useCallback(()=>{v(!0)},[]),j=t.useCallback(()=>{v(!1)},[]),b=t.useCallback(()=>D.from(s?.current).orThunk(()=>D.from(c.current).map(I.fromDom).bind(X).filter(Y).map(h=>h.dom).orThunk(()=>D.from(c.current))).getOrNull(),[s,c]);t.useEffect(()=>{const h=b();if(C(h)&&!C(c.current)){const B=window.requestAnimationFrame(()=>{C(c.current)||v(!0)});return()=>window.cancelAnimationFrame(B)}},[b,c]),t.useEffect(()=>{const h=b();if(C(h)){const B=()=>{T()};return h.addEventListener("click",B),()=>{h.removeEventListener("click",B)}}},[b,T]);const S=t.useMemo(()=>({isOpen:l,open:T,close:j,triggerRef:c,toolbarRef:u,anchorRef:s,anchorElement:b(),getAnchorElement:b,persistent:n,usePopover:d}),[l,T,j,n,s,b,d]);return o.jsx(W.Provider,{value:S,children:e})},w=({children:e,onClick:n,onMouseDown:s})=>{const{open:d,triggerRef:l}=F(),v=t.useCallback(u=>{d(),n?.(u)},[d,n]),c=t.useCallback(u=>{u.preventDefault(),s?.(u)},[s]);return o.jsx("div",{ref:l,onClick:v,onMouseDown:c,children:e})},f=({children:e,onMouseDown:n,onEscape:s})=>{const{isOpen:d,toolbarRef:l,triggerRef:v,getAnchorElement:c,close:u,persistent:T,usePopover:j}=F();t.useEffect(()=>{const i=l.current;if(!H(i)){if(!d){j&&i.hidePopover();return}j&&i.showPopover(),window.queueMicrotask(()=>{const m=I.fromDom(i);O(m,".tox-toolbar__group").bind(R=>O(R,'button, [role="button"]')).fold(()=>i.focus(),R=>Z(R))})}},[j,d,l]);const b=t.useMemo(()=>T?s:H(s)?u:()=>{s(),u()},[T,s,u]);Q({containerRef:l,...C(b)?{onEscape:b}:{}}),oo({containerRef:l,selector:"button, .tox-button",useTabstopAt:i=>to(i).filter(m=>io(m,"tox-toolbar__group")).map(m=>{const y=no(m,"button, .tox-button");return y.length>0&&y[0].dom===i.dom}).getOr(!0),cyclic:!0});const S=t.useCallback(i=>{if(d&&C(l.current)&&i.target instanceof Node){const m=l.current.contains(i.target),y=v.current?.contains(i.target)??!1,R=c()?.contains(i.target)??!1;!m&&!y&&!R&&u()}},[d,u,l,v,c]);t.useEffect(()=>{if(!T)return document.addEventListener("mousedown",S),()=>document.removeEventListener("mousedown",S)},[T,S]);const h=t.useMemo(()=>`--${J("context-toolbar")}`,[]);t.useEffect(()=>{const i=c(),m=l.current;if(!d||!C(i)||!C(m))return;const y=I.fromDom(i),x=I.fromDom(m);k(y,"anchor-name",h),k(x,"position","absolute"),k(x,"margin","0"),k(x,"inset","unset"),k(x,"position-anchor",h);const R=`calc(anchor(${h} bottom) + ${ao})`;return k(x,"top",R),k(x,"justify-self","anchor-center"),k(x,"position-try-fallbacks","flip-block, flip-inline, flip-block flip-inline"),()=>{q(y,"anchor-name"),$(["position","margin","inset","position-anchor","top","justify-self","position-try-fallbacks"],z=>{q(x,z)})}},[h,d,l,c]);const B=t.useCallback(i=>{n?.(i)},[n]);return o.jsx("div",{ref:l,popover:j?"manual":void 0,tabIndex:-1,className:"tox-context-toolbar",style:{visibility:d?void 0:"hidden",pointerEvents:"auto"},onMouseDown:B,children:o.jsx("div",{role:"toolbar",className:"tox-toolbar",children:e})})},p=({children:e})=>{const n=t.useRef(null);return eo({containerRef:n,selector:"button, .tox-button",execute:s=>(s.dom.click(),D.some(!0))}),o.jsx("div",{ref:n,role:"group",className:"tox-toolbar__group",children:e})};try{g.displayName="Root",g.__docgenInfo={description:"",displayName:"Root",props:{persistent:{defaultValue:{value:"false"},description:"",name:"persistent",required:!1,type:{name:"boolean"}},anchorRef:{defaultValue:null,description:"",name:"anchorRef",required:!1,type:{name:"RefObject<HTMLElement>"}},usePopover:{defaultValue:{value:"false"},description:"",name:"usePopover",required:!1,type:{name:"boolean"}}}}}catch{}try{w.displayName="Trigger",w.__docgenInfo={description:"",displayName:"Trigger",props:{onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{f.displayName="Toolbar",f.__docgenInfo={description:"",displayName:"Toolbar",props:{onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onEscape:{defaultValue:null,description:"",name:"onEscape",required:!1,type:{name:"(() => void)"}}}}}catch{}try{p.displayName="Group",p.__docgenInfo={description:"",displayName:"Group",props:{}}}catch{}const{fn:a}=__STORYBOOK_MODULE_TEST__,lo=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,K={getIcon:ro(lo)},ko={title:"components/ContextToolbar",parameters:{layout:"centered",docs:{description:{component:`
A compound component for creating context toolbars that anchor to trigger elements.

## Usage

\`\`\`tsx
import * as ContextToolbar from 'oxide-components/ContextToolbar';

const MyComponent = () => {
  return (
    <div className='tox' style={{ position: 'relative' }}>
      <ContextToolbar.Root persistent={false}>
        <ContextToolbar.Trigger>
          <div style={{ backgroundColor: 'red', padding: '10px' }}>
            Click me!
          </div>
        </ContextToolbar.Trigger>
        <ContextToolbar.Toolbar>
          <ContextToolbar.Group>
            <Button>Accept</Button>
            <Button>Reject</Button>
          </ContextToolbar.Group>
        </ContextToolbar.Toolbar>
      </ContextToolbar.Root>
    </div>
  );
};
\`\`\`

## Components

### Root
The provider component that manages toolbar state.

**Important:**
- Use either \`Trigger\` component OR \`anchorRef\` (not both).
- With \`anchorRef\` and no Trigger, the toolbar auto-opens on mount.
- Visibility is controlled by conditional rendering - mount/unmount the component based on your state (e.g., when an annotation is selected).

### Trigger
Wraps the element that opens the toolbar when clicked.

### Toolbar
Contains the toolbar content and groups. When \`popover\` is \`true\`, it uses the Popover API (\`popover="manual"\`) for top-layer layering, while the component still controls when it opens and closes. When \`popover\` is \`false\`, it renders as a regular absolutely positioned element anchored to the trigger or \`anchorRef\`.

### Group
Groups related buttons together for keyboard navigation. Buttons within a group are navigated with arrow keys, while Tab moves between groups.

## Behaviour
- Click trigger to open the toolbar
- Press **Escape** to close the toolbar (unless \`persistent=true\`)
- Press **Tab** to navigate to the first button in the next group
- Press **Shift+Tab** to navigate to the first button in the previous group
- Press **Arrow keys** to navigate between buttons within the current group
- Press **Enter** to execute the focused button
- Click outside to close the toolbar (unless \`persistent=true\`)
- Toolbar automatically receives focus when opened

## Accessibility
- **Keyboard Navigation**:
  - \`Tab\` / \`Shift+Tab\`: Navigate between toolbar groups (cyclic)
  - \`Arrow Left\` / \`Arrow Up\`: Navigate to previous button in group
  - \`Arrow Right\` / \`Arrow Down\`: Navigate to next button in group
  - \`Enter\`: Execute focused button
  - \`Escape\`: Close the toolbar (unless \`persistent=true\`)
- **Focus Management**: Toolbar automatically receives focus when opened, with the first button in the first group focused
- **Click Outside**: Click outside the toolbar to dismiss it (unless \`persistent=true\`). The component handles click-outside detection.
- **Persistent Mode**: Use \`persistent=true\` for toolbars that require explicit dismissal (e.g. forms, critical actions). Disables both Escape key and click-outside dismissal.
- **ARIA**: Toolbar uses \`role="toolbar"\` and groups use \`role="group"\` for proper accessibility semantics
- **Toolbar Groups**: Matches TinyMCE core context toolbar behavior for consistency

## Positioning Anchoring Support

- ✅ **Chrome 125+**
- ✅ **Edge 125+**
- ✅ **Safari 18+**
- ❌ **Firefox** (not yet supported)

## Default Behavior

By default, the ContextToolbar anchors to the bottom left of the trigger element. It can position above/below or left/center/right based on the trigger element's inline positioning styles. The position-try-fallbacks CSS property automatically flips the toolbar when it would overflow the viewport.

## Key Features

- **Native CSS positioning** using \`anchor()\` function
- **Auto-detection** of anchor placement (top/bottom, left/center/right)
- **Automatic viewport overflow handling** with \`position-try-fallbacks\`
- **Dynamic gap** controlled by CSS variable \`--context-toolbar-gap\`
- **Unique anchor names** per instance using \`Id.generate()\`

## How It Works

1. Generates unique anchor name for each toolbar instance
2. Sets \`anchor-name\` CSS property on trigger element
3. Links toolbar to anchor via \`position-anchor\` property
4. Calculates position using \`anchor()\` and \`anchor-size()\` CSS functions
5. Applies transform for center/bottom alignment
6. Enables automatic flipping when toolbar would overflow viewport

See the **Corners** story for a live demonstration of auto-flip behavior.
        `}}},argTypes:{persistent:{description:"When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:"boolean"}},tags:["autodocs"]},_={parameters:{docs:{description:{story:"Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`)."}}},render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(g,{persistent:!1,children:[o.jsx(w,{children:o.jsx("div",{style:{backgroundColor:"red",padding:"10px"},children:"Click me!"})}),o.jsx(f,{children:o.jsxs(p,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]})})},A={parameters:{docs:{description:{story:"Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed."}}},render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(g,{persistent:!0,children:[o.jsx(w,{children:o.jsx("div",{style:{backgroundColor:"blue",padding:"10px"},children:"Click me (Persistent)!"})}),o.jsx(f,{children:o.jsxs(p,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]})})},E={decorators:[e=>o.jsx(V,{resources:K,children:o.jsx(e,{})})],render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(g,{persistent:!1,children:[o.jsx(w,{children:o.jsx("div",{style:{backgroundColor:"lightblue",padding:"10px"},children:"Click me!"})}),o.jsx(f,{children:o.jsxs(p,{children:[o.jsx(U,{variant:"primary",icon:"checkmark",onClick:a()}),o.jsx(U,{variant:"secondary",icon:"cross",onClick:a()})]})})]})})},N={render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(g,{persistent:!1,children:[o.jsx(w,{children:o.jsx("div",{style:{backgroundColor:"lightgreen",padding:"10px"},children:"Click me!"})}),o.jsxs(f,{children:[o.jsxs(p,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Accept"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"Reject"})]}),o.jsxs(p,{children:[o.jsx(r,{variant:"outlined",onClick:a(),children:"Edit"}),o.jsx(r,{variant:"naked",onClick:a(),children:"Comment"})]}),o.jsxs(p,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Share"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"More"})]})]})]})})},M={render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(g,{persistent:!1,children:[o.jsx(w,{children:o.jsx("div",{style:{backgroundColor:"lightyellow",padding:"10px"},children:"Click me!"})}),o.jsxs(f,{children:[o.jsx(V,{resources:K,children:o.jsxs(p,{children:[o.jsx(U,{icon:"arrow-up",onClick:a()}),o.jsx("span",{style:{padding:"8px",fontSize:"12px",flexShrink:0,whiteSpace:"nowrap"},children:"1/3"}),o.jsx(U,{icon:"arrow-down",onClick:a()})]})}),o.jsxs(p,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Accept"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"Reject"})]})]})]})})},L={parameters:{docs:{description:{story:"Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions."}}},render:()=>{const e=t.useMemo(()=>[{id:"top-left",label:"Top Left",style:{top:"20px",left:"20px"}},{id:"top-center",label:"Top Center",style:{top:"20px",left:"50%",marginLeft:"calc(-1 * (6ch + 24px) / 2)"}},{id:"top-right",label:"Top Right",style:{top:"20px",right:"20px"}},{id:"middle-left",label:"Middle Left",style:{top:"50%",left:"20px",marginTop:"calc(-1em / 2)"}},{id:"center",label:"Center",style:{top:"50%",left:"50%",marginTop:"calc(-1em / 2)",marginLeft:"calc(-1 * (4ch + 24px) / 2)"}},{id:"middle-right",label:"Middle Right",style:{top:"50%",right:"20px",marginTop:"calc(-1em / 2)"}},{id:"bottom-left",label:"Bottom Left",style:{bottom:"20px",left:"20px"}},{id:"bottom-center",label:"Bottom Center",style:{bottom:"20px",left:"50%",marginLeft:"calc(-1 * (9ch + 24px) / 2)"}},{id:"bottom-right",label:"Bottom Right",style:{bottom:"20px",right:"20px"}}],[]);return o.jsx("div",{className:"tox context-toolbar-anchors",style:{width:"520px"},children:o.jsx("div",{className:"tox",style:{position:"relative",height:"360px",border:"1px solid #c6cdd6",borderRadius:"16px",background:"#ffffff",overflow:"hidden"},children:e.map(n=>o.jsxs(g,{persistent:!1,children:[o.jsx(w,{children:o.jsx("div",{style:{position:"absolute",display:"inline-flex",...n.style},children:o.jsx(r,{children:n.label})})}),o.jsx(f,{children:o.jsxs(p,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]},n.id))})})}},G={parameters:{docs:{description:{story:"Demonstrates using `anchorRef` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected)."}}},render:()=>{const e=t.useRef(null),[n,s]=t.useState(!0);return o.jsxs("div",{className:"tox",style:{position:"relative"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),o.jsxs("button",{onClick:()=>s(!n),style:{marginLeft:"10px"},children:[n?"Hide":"Show"," Toolbar"]}),n&&o.jsx(g,{anchorRef:e,persistent:!0,children:o.jsx(f,{children:o.jsxs(p,{children:[o.jsx(r,{children:"Accept"}),o.jsx(r,{children:"Reject"})]})})})]})}},P={parameters:{docs:{description:{story:"Demonstrates anchored toolbar positioning without the Popover API. The toolbar stays inside the scroll container and tracks its anchor element as the page scrolls. This mode mirrors iframe-overlay behavior (popover={false})."}}},render:()=>{const e=t.useRef(null),[n,s]=t.useState(!0);return o.jsx("div",{className:"tox",style:{height:"300px",overflow:"auto",border:"1px solid #ccc",position:"relative"},children:o.jsxs("div",{style:{height:"1000px",padding:"20px"},children:[o.jsx("p",{children:"Scroll down to find the anchor ↓"}),o.jsxs("div",{style:{marginTop:"300px"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightgreen",padding:"12px",cursor:"pointer",display:"inline-block"},children:"Scroll-anchored element"}),o.jsxs("button",{onClick:()=>s(!n),style:{marginLeft:"10px"},children:[n?"Hide":"Show"," Toolbar"]}),n&&o.jsx(g,{anchorRef:e,persistent:!0,usePopover:!1,children:o.jsx(f,{children:o.jsxs(p,{children:[o.jsx(r,{children:"Accept"}),o.jsx(r,{children:"Reject"})]})})})]})]})})}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless \`persistent={true}\`).'
      }
    }
  },
  render: () => {
    return <div className='tox' style={{
      position: 'relative'
    }}>
        <ContextToolbar.Root persistent={false}>
          <ContextToolbar.Trigger>
            <div style={{
            backgroundColor: 'red',
            padding: '10px'
          }}>
              Click me!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <Button onClick={fn()}>Accept</Button>
              <Button onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>;
  }
}`,..._.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Toolbar with \`persistent={true}\` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed.'
      }
    }
  },
  render: () => {
    return <div className='tox' style={{
      position: 'relative'
    }}>
        <ContextToolbar.Root persistent={true}>
          <ContextToolbar.Trigger>
            <div style={{
            backgroundColor: 'blue',
            padding: '10px'
          }}>
              Click me (Persistent)!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <Button onClick={fn()}>Accept</Button>
              <Button onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>;
  }
}`,...A.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  decorators: [(Story: React.ComponentType): JSX.Element => <UniverseProvider resources={mockUniverse}>
        <Story />
      </UniverseProvider>],
  render: () => {
    return <div className='tox' style={{
      position: 'relative'
    }}>
        <ContextToolbar.Root persistent={false}>
          <ContextToolbar.Trigger>
            <div style={{
            backgroundColor: 'lightblue',
            padding: '10px'
          }}>
              Click me!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <IconButton variant='primary' icon='checkmark' onClick={fn()} />
              <IconButton variant='secondary' icon='cross' onClick={fn()} />
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>;
  }
}`,...E.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    return <div className='tox' style={{
      position: 'relative'
    }}>
        <ContextToolbar.Root persistent={false}>
          <ContextToolbar.Trigger>
            <div style={{
            backgroundColor: 'lightgreen',
            padding: '10px'
          }}>
              Click me!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <Button variant='primary' onClick={fn()}>Accept</Button>
              <Button variant='secondary' onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button variant='outlined' onClick={fn()}>Edit</Button>
              <Button variant='naked' onClick={fn()}>Comment</Button>
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button variant='primary' onClick={fn()}>Share</Button>
              <Button variant='secondary' onClick={fn()}>More</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>;
  }
}`,...N.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    return <div className='tox' style={{
      position: 'relative'
    }}>
        <ContextToolbar.Root persistent={false}>
          <ContextToolbar.Trigger>
            <div style={{
            backgroundColor: 'lightyellow',
            padding: '10px'
          }}>
              Click me!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <UniverseProvider resources={mockUniverse}>
              <ContextToolbar.Group>
                <IconButton icon='arrow-up' onClick={fn()} />

                <span style={{
                padding: '8px',
                fontSize: '12px',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>
                  1/3
                </span>
                <IconButton icon='arrow-down' onClick={fn()} />
              </ContextToolbar.Group>
            </UniverseProvider>
            <ContextToolbar.Group>
              <Button variant='primary' onClick={fn()}>Accept</Button>
              <Button variant='secondary' onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>;
  }
}`,...M.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions.\`
      }
    }
  },
  render: () => {
    const triggerPositions = useMemo(() => [
    // Top row
    {
      id: 'top-left',
      label: 'Top Left',
      style: {
        top: '20px',
        left: '20px'
      }
    }, {
      id: 'top-center',
      label: 'Top Center',
      style: {
        top: '20px',
        left: '50%',
        marginLeft: 'calc(-1 * (6ch + 24px) / 2)'
      }
    }, {
      id: 'top-right',
      label: 'Top Right',
      style: {
        top: '20px',
        right: '20px'
      }
    },
    // Middle row
    {
      id: 'middle-left',
      label: 'Middle Left',
      style: {
        top: '50%',
        left: '20px',
        marginTop: 'calc(-1em / 2)'
      }
    }, {
      id: 'center',
      label: 'Center',
      style: {
        top: '50%',
        left: '50%',
        marginTop: 'calc(-1em / 2)',
        marginLeft: 'calc(-1 * (4ch + 24px) / 2)'
      }
    }, {
      id: 'middle-right',
      label: 'Middle Right',
      style: {
        top: '50%',
        right: '20px',
        marginTop: 'calc(-1em / 2)'
      }
    },
    // Bottom row
    {
      id: 'bottom-left',
      label: 'Bottom Left',
      style: {
        bottom: '20px',
        left: '20px'
      }
    }, {
      id: 'bottom-center',
      label: 'Bottom Center',
      style: {
        bottom: '20px',
        left: '50%',
        marginLeft: 'calc(-1 * (9ch + 24px) / 2)'
      }
    }, {
      id: 'bottom-right',
      label: 'Bottom Right',
      style: {
        bottom: '20px',
        right: '20px'
      }
    }] as const, []);
    return <div className='tox context-toolbar-anchors' style={{
      width: '520px'
    }}>
        <div className='tox' style={{
        position: 'relative',
        height: '360px',
        border: '1px solid #c6cdd6',
        borderRadius: '16px',
        background: '#ffffff',
        overflow: 'hidden'
      }}>
          {triggerPositions.map(pos => <ContextToolbar.Root key={pos.id} persistent={false}>
              <ContextToolbar.Trigger>
                <div style={{
              position: 'absolute',
              display: 'inline-flex',
              ...pos.style
            }}>
                  <Button>{pos.label}</Button>
                </div>
              </ContextToolbar.Trigger>
              <ContextToolbar.Toolbar>
                <ContextToolbar.Group>
                  <Button onClick={fn()}>Accept</Button>
                  <Button onClick={fn()}>Reject</Button>
                </ContextToolbar.Group>
              </ContextToolbar.Toolbar>
            </ContextToolbar.Root>)}
        </div>
      </div>;
  }
}`,...L.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using \`anchorRef\` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected).'
      }
    }
  },
  render: () => {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [showToolbar, setShowToolbar] = useState(true);
    return <div className='tox' style={{
      position: 'relative'
    }}>
        <div ref={anchorRef} style={{
        backgroundColor: 'lightcoral',
        padding: '10px',
        cursor: 'pointer',
        display: 'inline-block'
      }}>
          Anchor element
        </div>

        <button onClick={() => setShowToolbar(!showToolbar)} style={{
        marginLeft: '10px'
      }}>
          {showToolbar ? 'Hide' : 'Show'} Toolbar
        </button>

        {showToolbar && <ContextToolbar.Root anchorRef={anchorRef} persistent={true}>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <Button>Accept</Button>
                <Button>Reject</Button>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>}
      </div>;
  }
}`,...G.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates anchored toolbar positioning without the Popover API. The toolbar stays inside the scroll container and tracks its anchor element as the page scrolls. This mode mirrors iframe-overlay behavior (popover={false}).'
      }
    }
  },
  render: () => {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [showToolbar, setShowToolbar] = useState(true);
    return <div className="tox" style={{
      height: '300px',
      overflow: 'auto',
      border: '1px solid #ccc',
      position: 'relative'
    }}>
        <div style={{
        height: '1000px',
        padding: '20px'
      }}>
          <p>Scroll down to find the anchor ↓</p>

          <div style={{
          marginTop: '300px'
        }}>
            <div ref={anchorRef} style={{
            backgroundColor: 'lightgreen',
            padding: '12px',
            cursor: 'pointer',
            display: 'inline-block'
          }}>
              Scroll-anchored element
            </div>

            <button onClick={() => setShowToolbar(!showToolbar)} style={{
            marginLeft: '10px'
          }}>
              {showToolbar ? 'Hide' : 'Show'} Toolbar
            </button>

            {showToolbar && <ContextToolbar.Root anchorRef={anchorRef} persistent={true} usePopover={false}>
                <ContextToolbar.Toolbar>
                  <ContextToolbar.Group>
                    <Button>Accept</Button>
                    <Button>Reject</Button>
                  </ContextToolbar.Group>
                </ContextToolbar.Toolbar>
              </ContextToolbar.Root>}
          </div>
        </div>
      </div>;
  }
}`,...P.parameters?.docs?.source}}};const wo=["Basic","Persistent","WithIconButtons","ManyButtons","MixedContent","Corners","WithAnchorRef","ScrollAnchored"];export{_ as Basic,L as Corners,N as ManyButtons,M as MixedContent,A as Persistent,P as ScrollAnchored,G as WithAnchorRef,E as WithIconButtons,wo as __namedExportsOrder,ko as default};
