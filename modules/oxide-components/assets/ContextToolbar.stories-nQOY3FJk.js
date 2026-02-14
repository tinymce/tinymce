import{r,j as o}from"./iframe-DlRB2uE8.js";import{U as O}from"./UniverseProvider-CbigmIcd.js";import{B as i}from"./Button-D-HzoLNK.js";import{I as P}from"./IconButton-CgqIDZfl.js";import{e as F}from"./Strings-CwVUhXDr.js";import{g as K}from"./Id-BpVM4rTp.js";import{O as L,i as v,b as z}from"./Optional-CuHnBc-7.js";import{S as G,f as $,i as J,d as I,e as X,h as Y,j as Z,s as C,a as U,c as Q,p as oo,k as eo}from"./KeyboardNavigationHooks-Blm27F_h.js";import{c as to}from"./Fun--VEwoXIw.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-BJplfvtK.js";import"./Obj-BYXNADYo.js";import"./Icon-iHwLeQyc.js";const no=e=>e.dom.classList!==void 0,ro=(e,n)=>no(e)&&e.dom.classList.contains(n),H=r.createContext(null),q=()=>{const e=r.useContext(H);if(!v(e))throw new Error("useContextToolbarContext must be used within a ContextToolbarProvider");return e},so="6px",x=({children:e,persistent:n=!1,anchorRef:s,usePopover:l=!1})=>{const[k,h]=r.useState(!1),d=r.useRef(null),b=r.useRef(null),f=r.useCallback(()=>{h(!0)},[]),j=r.useCallback(()=>{h(!1)},[]),u=r.useCallback(()=>L.from(s?.current).orThunk(()=>L.from(d.current).map(G.fromDom).bind($).filter(J).map(t=>t.dom).orThunk(()=>L.from(d.current))).getOrNull(),[s,d]);r.useEffect(()=>{const t=u();if(v(t)&&!v(d.current)){const c=window.requestAnimationFrame(()=>{v(d.current)||h(!0)});return()=>window.cancelAnimationFrame(c)}},[u,d]),r.useEffect(()=>{const t=u();if(v(t)){const c=()=>{f()};return t.addEventListener("click",c),()=>{t.removeEventListener("click",c)}}},[u,f]);const D=r.useMemo(()=>({isOpen:k,open:f,close:j,triggerRef:d,toolbarRef:b,anchorRef:s,anchorElement:u(),getAnchorElement:u,persistent:n,usePopover:l}),[k,f,j,n,s,u,l]);return o.jsx(H.Provider,{value:D,children:e})},y=({children:e,onClick:n,onMouseDown:s})=>{const{open:l,triggerRef:k}=q(),h=r.useCallback(b=>{l(),n?.(b)},[l,n]),d=r.useCallback(b=>{b.preventDefault(),s?.(b)},[s]);return o.jsx("div",{ref:k,onClick:h,onMouseDown:d,children:e})},g=({children:e,onMouseDown:n})=>{const{isOpen:s,toolbarRef:l,triggerRef:k,getAnchorElement:h,close:d,persistent:b,usePopover:f}=q();r.useEffect(()=>{const t=l.current;if(!z(t)){if(!s){f&&t.hidePopover();return}f&&t.showPopover(),window.queueMicrotask(()=>{const c=G.fromDom(t);I(c,".tox-toolbar__group").bind(w=>I(w,'button, [role="button"]')).fold(()=>t.focus(),w=>X(w))})}},[f,s,l]),Y({containerRef:l,onEscape:b?void 0:d}),Z({containerRef:l,selector:"button, .tox-button",useTabstopAt:t=>oo(t).filter(c=>ro(c,"tox-toolbar__group")).map(c=>{const T=eo(c,"button, .tox-button");return T.length>0&&T[0].dom===t.dom}).getOr(!0),cyclic:!0});const j=r.useCallback(t=>{if(s&&v(l.current)&&t.target instanceof Node){const c=l.current.contains(t.target),T=k.current?.contains(t.target)??!1,w=h()?.contains(t.target)??!1;!c&&!T&&!w&&d()}},[s,d,l,k,h]);r.useEffect(()=>{if(!b)return document.addEventListener("mousedown",j),()=>document.removeEventListener("mousedown",j)},[b,j]);const u=r.useMemo(()=>`--${K("context-toolbar")}`,[]);r.useEffect(()=>{const t=h(),c=l.current;if(!s||!v(t)||!v(c))return;const T=G.fromDom(t),m=G.fromDom(c);C(T,"anchor-name",u),C(m,"position","absolute"),C(m,"margin","0"),C(m,"inset","unset"),C(m,"position-anchor",u);const w=`calc(anchor(${u} bottom) + ${so})`;return C(m,"top",w),C(m,"justify-self","anchor-center"),C(m,"position-try-fallbacks","flip-block, flip-inline, flip-block flip-inline"),()=>{U(T,"anchor-name"),F(["position","margin","inset","position-anchor","top","justify-self","position-try-fallbacks"],W=>{U(m,W)})}},[u,s,l,h]);const D=r.useCallback(t=>{n?.(t)},[n]);return o.jsx("div",{ref:l,popover:f?"manual":void 0,tabIndex:-1,className:"tox-context-toolbar",style:{visibility:s?void 0:"hidden",pointerEvents:"auto"},onMouseDown:D,children:o.jsx("div",{role:"toolbar",className:"tox-toolbar",children:e})})},p=({children:e})=>{const n=r.useRef(null);return Q({containerRef:n,selector:"button, .tox-button",execute:s=>(s.dom.click(),L.some(!0))}),o.jsx("div",{ref:n,role:"group",className:"tox-toolbar__group",children:e})};try{x.displayName="Root",x.__docgenInfo={description:"",displayName:"Root",props:{persistent:{defaultValue:{value:"false"},description:"",name:"persistent",required:!1,type:{name:"boolean"}},anchorRef:{defaultValue:null,description:"",name:"anchorRef",required:!1,type:{name:"RefObject<HTMLElement>"}},usePopover:{defaultValue:{value:"false"},description:"",name:"usePopover",required:!1,type:{name:"boolean"}}}}}catch{}try{y.displayName="Trigger",y.__docgenInfo={description:"",displayName:"Trigger",props:{onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{g.displayName="Toolbar",g.__docgenInfo={description:"",displayName:"Toolbar",props:{onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{p.displayName="Group",p.__docgenInfo={description:"",displayName:"Group",props:{}}}catch{}const{fn:a}=__STORYBOOK_MODULE_TEST__,io=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,V={getIcon:to(io)},vo={title:"components/ContextToolbar",parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{persistent:{description:"When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:"boolean"}},tags:["autodocs"]},R={parameters:{docs:{description:{story:"Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`)."}}},render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!1,children:[o.jsx(y,{children:o.jsx("div",{style:{backgroundColor:"red",padding:"10px"},children:"Click me!"})}),o.jsx(g,{children:o.jsxs(p,{children:[o.jsx(i,{onClick:a(),children:"Accept"}),o.jsx(i,{onClick:a(),children:"Reject"})]})})]})})},B={parameters:{docs:{description:{story:"Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed."}}},render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!0,children:[o.jsx(y,{children:o.jsx("div",{style:{backgroundColor:"blue",padding:"10px"},children:"Click me (Persistent)!"})}),o.jsx(g,{children:o.jsxs(p,{children:[o.jsx(i,{onClick:a(),children:"Accept"}),o.jsx(i,{onClick:a(),children:"Reject"})]})})]})})},S={decorators:[e=>o.jsx(O,{resources:V,children:o.jsx(e,{})})],render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!1,children:[o.jsx(y,{children:o.jsx("div",{style:{backgroundColor:"lightblue",padding:"10px"},children:"Click me!"})}),o.jsx(g,{children:o.jsxs(p,{children:[o.jsx(P,{variant:"primary",icon:"checkmark",onClick:a()}),o.jsx(P,{variant:"secondary",icon:"cross",onClick:a()})]})})]})})},_={render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!1,children:[o.jsx(y,{children:o.jsx("div",{style:{backgroundColor:"lightgreen",padding:"10px"},children:"Click me!"})}),o.jsxs(g,{children:[o.jsxs(p,{children:[o.jsx(i,{variant:"primary",onClick:a(),children:"Accept"}),o.jsx(i,{variant:"secondary",onClick:a(),children:"Reject"})]}),o.jsxs(p,{children:[o.jsx(i,{variant:"outlined",onClick:a(),children:"Edit"}),o.jsx(i,{variant:"naked",onClick:a(),children:"Comment"})]}),o.jsxs(p,{children:[o.jsx(i,{variant:"primary",onClick:a(),children:"Share"}),o.jsx(i,{variant:"secondary",onClick:a(),children:"More"})]})]})]})})},A={render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!1,children:[o.jsx(y,{children:o.jsx("div",{style:{backgroundColor:"lightyellow",padding:"10px"},children:"Click me!"})}),o.jsxs(g,{children:[o.jsx(O,{resources:V,children:o.jsxs(p,{children:[o.jsx(P,{icon:"arrow-up",onClick:a()}),o.jsx("span",{style:{padding:"8px",fontSize:"12px",flexShrink:0,whiteSpace:"nowrap"},children:"1/3"}),o.jsx(P,{icon:"arrow-down",onClick:a()})]})}),o.jsxs(p,{children:[o.jsx(i,{variant:"primary",onClick:a(),children:"Accept"}),o.jsx(i,{variant:"secondary",onClick:a(),children:"Reject"})]})]})]})})},E={parameters:{docs:{description:{story:"Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions."}}},render:()=>{const e=r.useMemo(()=>[{id:"top-left",label:"Top Left",style:{top:"20px",left:"20px"}},{id:"top-center",label:"Top Center",style:{top:"20px",left:"50%",marginLeft:"calc(-1 * (6ch + 24px) / 2)"}},{id:"top-right",label:"Top Right",style:{top:"20px",right:"20px"}},{id:"middle-left",label:"Middle Left",style:{top:"50%",left:"20px",marginTop:"calc(-1em / 2)"}},{id:"center",label:"Center",style:{top:"50%",left:"50%",marginTop:"calc(-1em / 2)",marginLeft:"calc(-1 * (4ch + 24px) / 2)"}},{id:"middle-right",label:"Middle Right",style:{top:"50%",right:"20px",marginTop:"calc(-1em / 2)"}},{id:"bottom-left",label:"Bottom Left",style:{bottom:"20px",left:"20px"}},{id:"bottom-center",label:"Bottom Center",style:{bottom:"20px",left:"50%",marginLeft:"calc(-1 * (9ch + 24px) / 2)"}},{id:"bottom-right",label:"Bottom Right",style:{bottom:"20px",right:"20px"}}],[]);return o.jsx("div",{className:"tox context-toolbar-anchors",style:{width:"520px"},children:o.jsx("div",{className:"tox",style:{position:"relative",height:"360px",border:"1px solid #c6cdd6",borderRadius:"16px",background:"#ffffff",overflow:"hidden"},children:e.map(n=>o.jsxs(x,{persistent:!1,children:[o.jsx(y,{children:o.jsx("div",{style:{position:"absolute",display:"inline-flex",...n.style},children:o.jsx(i,{children:n.label})})}),o.jsx(g,{children:o.jsxs(p,{children:[o.jsx(i,{onClick:a(),children:"Accept"}),o.jsx(i,{onClick:a(),children:"Reject"})]})})]},n.id))})})}},N={parameters:{docs:{description:{story:"Demonstrates using `anchorRef` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected)."}}},render:()=>{const e=r.useRef(null),[n,s]=r.useState(!0);return o.jsxs("div",{className:"tox",style:{position:"relative"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),o.jsxs("button",{onClick:()=>s(!n),style:{marginLeft:"10px"},children:[n?"Hide":"Show"," Toolbar"]}),n&&o.jsx(x,{anchorRef:e,persistent:!0,children:o.jsx(g,{children:o.jsxs(p,{children:[o.jsx(i,{children:"Accept"}),o.jsx(i,{children:"Reject"})]})})})]})}},M={parameters:{docs:{description:{story:"Demonstrates anchored toolbar positioning without the Popover API. The toolbar stays inside the scroll container and tracks its anchor element as the page scrolls. This mode mirrors iframe-overlay behavior (popover={false})."}}},render:()=>{const e=r.useRef(null),[n,s]=r.useState(!0);return o.jsx("div",{className:"tox",style:{height:"300px",overflow:"auto",border:"1px solid #ccc",position:"relative"},children:o.jsxs("div",{style:{height:"1000px",padding:"20px"},children:[o.jsx("p",{children:"Scroll down to find the anchor ↓"}),o.jsxs("div",{style:{marginTop:"300px"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightgreen",padding:"12px",cursor:"pointer",display:"inline-block"},children:"Scroll-anchored element"}),o.jsxs("button",{onClick:()=>s(!n),style:{marginLeft:"10px"},children:[n?"Hide":"Show"," Toolbar"]}),n&&o.jsx(x,{anchorRef:e,persistent:!0,usePopover:!1,children:o.jsx(g,{children:o.jsxs(p,{children:[o.jsx(i,{children:"Accept"}),o.jsx(i,{children:"Reject"})]})})})]})]})})}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}};const yo=["Basic","Persistent","WithIconButtons","ManyButtons","MixedContent","Corners","WithAnchorRef","ScrollAnchored"];export{R as Basic,E as Corners,_ as ManyButtons,A as MixedContent,B as Persistent,M as ScrollAnchored,N as WithAnchorRef,S as WithIconButtons,yo as __namedExportsOrder,vo as default};
