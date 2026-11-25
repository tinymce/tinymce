import{r as n,j as o}from"./iframe-m8jlWi5a.js";import{B as r}from"./Button-C4Pj9Hl_.js";import{I as U}from"./IconButton-DkZACQq3.js";import{U as z}from"./UniverseProvider-6Km2qX_O.js";import{e as so,m as io}from"./Strings-0z8lz2Ma.js";import{g as ao}from"./Id--8xy-NHg.js";import{O as R,a as x,b as q,i as lo,d as co}from"./Optional-C7ZieBtS.js";import{f as po,c as uo,d as ho,s as f,r as K,b as bo,e as V,h as xo,i as mo,j as go,k as fo,l as Co}from"./KeyboardNavigationHooks-DDqxoP3O.js";import{S as O}from"./SugarElement-v4NJLiy_.js";import{i as J,d as X}from"./PredicateFind-cjflXcNJ.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-uABtowwn.js";import"./Obj-DJRegViB.js";import"./Icon-B82XuRAQ.js";import"./Universe-DM4c6Udm.js";import"./Num-xrWELwUY.js";import"./Visibility-HiPE8kkv.js";const Y=n.createContext(null),Z=()=>{const e=n.useContext(Y);if(!x(e))throw new Error("useContextToolbarContext must be used within a ContextToolbarProvider");return e},To="6px",Q=["button",'[role="button"]',".tox-button"],oo=Q.join(", "),vo=io(Q,e=>`${e}:not([disabled]):not([aria-disabled="true"])`).join(", "),yo=e=>!fo(e,"disabled")&&Co(e,"aria-disabled")!=="true"&&e.dom.tabIndex>=0,ko=e=>t=>J(t)&&go(t,e)&&yo(t),eo=ko(oo),wo=(e,t)=>xo(e,t).map(s=>X(s,eo).exists(h=>mo(h,e))).getOr(!0),$=e=>{const t=O.fromDom(e);X(t,eo).fold(()=>V(t),V)},m=({children:e,persistent:t=!1,anchorRef:s,usePopover:h=!1})=>{const[C,T]=n.useState(!1),l=n.useRef(null),i=n.useRef(null),v=n.useCallback(()=>{T(!0)},[]),y=n.useCallback(()=>{T(!1)},[]),p=n.useCallback(()=>R.from(s?.current).orThunk(()=>R.from(l.current).map(O.fromDom).bind(po).filter(J).map(u=>u.dom).orThunk(()=>R.from(l.current))).getOrNull(),[s,l]);n.useEffect(()=>{const u=p();if(x(u)&&!x(l.current)){const k=window.requestAnimationFrame(()=>{x(l.current)||T(!0)});return()=>window.cancelAnimationFrame(k)}},[p,l]),n.useEffect(()=>{const u=p();if(x(u)){const k=()=>{v()};return u.addEventListener("click",k),()=>{u.removeEventListener("click",k)}}},[p,v]);const w=n.useMemo(()=>({isOpen:C,open:v,close:y,triggerRef:l,toolbarRef:i,anchorRef:s,anchorElement:p(),getAnchorElement:p,persistent:t,usePopover:h}),[C,v,y,t,s,p,h]);return o.jsx(Y.Provider,{value:w,children:e})},j=({children:e,onClick:t,onMouseDown:s})=>{const{open:h,triggerRef:C}=Z(),T=n.useCallback(i=>{h(),t?.(i)},[h,t]),l=n.useCallback(i=>{i.preventDefault(),s?.(i)},[s]);return o.jsx("div",{ref:C,onClick:T,onMouseDown:l,children:e})},g=n.forwardRef(({children:e,onMouseDown:t,onEscape:s,onOpen:h,autoFocus:C=!0},T)=>{const{isOpen:l,toolbarRef:i,triggerRef:v,getAnchorElement:y,close:p,persistent:w,usePopover:u}=Z();n.useImperativeHandle(T,()=>({focus:()=>{R.from(i.current).each($)}}),[i]);const k=n.useRef(h);n.useLayoutEffect(()=>{k.current=h}),n.useEffect(()=>{const c=i.current;if(!q(c)){if(!l){u&&c.hidePopover();return}u&&c.showPopover(),window.queueMicrotask(()=>{C&&$(c),k.current?.()})}},[u,l,i,C]);const W=n.useMemo(()=>w?s:q(s)?p:()=>{s(),p()},[w,s,p]);uo({containerRef:i,...x(W)?{onEscape:W}:{}}),ho({containerRef:i,selector:oo,useTabstopAt:c=>wo(c,".tox-toolbar__group"),cyclic:!0});const H=n.useCallback(c=>{if(l&&x(i.current)&&c.target instanceof Node){const S=i.current.contains(c.target),A=v.current?.contains(c.target)??!1,_=y()?.contains(c.target)??!1;!S&&!A&&!_&&p()}},[l,p,i,v,y]);n.useEffect(()=>{if(!w)return document.addEventListener("mousedown",H),()=>document.removeEventListener("mousedown",H)},[w,H]);const B=n.useMemo(()=>`--${ao("context-toolbar")}`,[]);n.useLayoutEffect(()=>{const c=y(),S=i.current;if(!l||!x(c)||!x(S))return;const A=O.fromDom(c),b=O.fromDom(S);f(A,"anchor-name",B),f(b,"position","absolute"),f(b,"margin","0"),f(b,"inset","unset"),f(b,"position-anchor",B);const _=`calc(anchor(${B} bottom) + ${To})`;return f(b,"top",_),f(b,"justify-self","anchor-center"),f(b,"position-try-fallbacks","flip-block, flip-inline, flip-block flip-inline"),()=>{K(A,"anchor-name"),so(["position","margin","inset","position-anchor","top","justify-self","position-try-fallbacks"],ro=>{K(b,ro)})}},[B,l,i,y]);const no=n.useCallback(c=>{t?.(c)},[t]);return o.jsx("div",{ref:i,popover:u?"manual":void 0,tabIndex:-1,className:"tox-context-toolbar",style:{visibility:l?void 0:"hidden",pointerEvents:"auto"},onMouseDown:no,children:o.jsx("div",{role:"toolbar",className:"tox-toolbar",children:e})})}),d=({children:e})=>{const t=n.useRef(null);return bo({containerRef:t,selector:vo,execute:s=>(s.dom.click(),R.some(!0))}),o.jsx("div",{ref:t,role:"group",className:"tox-toolbar__group",children:e})},{fn:a}=__STORYBOOK_MODULE_TEST__,jo=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,to={getIcon:co(jo),translate:lo},Wo={title:"components/ContextToolbar",parameters:{layout:"centered",docs:{description:{component:`
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

- ✅ **Chrome 129+**
- ✅ **Edge 129+**
- ✅ **Safari 26+**
- ✅ **Firefox 147+**

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
        `}}},argTypes:{persistent:{description:"When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:"boolean"}},tags:["autodocs"]},G={parameters:{docs:{description:{story:"Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`)."}}},render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(m,{persistent:!1,children:[o.jsx(j,{children:o.jsx("div",{style:{backgroundColor:"red",padding:"10px"},children:"Click me!"})}),o.jsx(g,{children:o.jsxs(d,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]})})},E={parameters:{docs:{description:{story:"Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed."}}},render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(m,{persistent:!0,children:[o.jsx(j,{children:o.jsx("div",{style:{backgroundColor:"blue",padding:"10px"},children:"Click me (Persistent)!"})}),o.jsx(g,{children:o.jsxs(d,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]})})},N={decorators:[e=>o.jsx(z,{resources:to,children:o.jsx(e,{})})],render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(m,{persistent:!1,children:[o.jsx(j,{children:o.jsx("div",{style:{backgroundColor:"lightblue",padding:"10px"},children:"Click me!"})}),o.jsx(g,{children:o.jsxs(d,{children:[o.jsx(U,{variant:"primary",icon:"checkmark","aria-label":"Accept",onClick:a()}),o.jsx(U,{variant:"secondary",icon:"cross","aria-label":"Reject",onClick:a()})]})})]})})},L={render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(m,{persistent:!1,children:[o.jsx(j,{children:o.jsx("div",{style:{backgroundColor:"lightgreen",padding:"10px"},children:"Click me!"})}),o.jsxs(g,{children:[o.jsxs(d,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Accept"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"Reject"})]}),o.jsxs(d,{children:[o.jsx(r,{variant:"outlined",onClick:a(),children:"Edit"}),o.jsx(r,{variant:"naked",onClick:a(),children:"Comment"})]}),o.jsxs(d,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Share"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"More"})]})]})]})})},P={render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(m,{persistent:!1,children:[o.jsx(j,{children:o.jsx("div",{style:{backgroundColor:"lightyellow",padding:"10px"},children:"Click me!"})}),o.jsxs(g,{children:[o.jsx(z,{resources:to,children:o.jsxs(d,{children:[o.jsx(U,{icon:"arrow-up","aria-label":"Previous",onClick:a()}),o.jsx("span",{style:{padding:"8px",fontSize:"12px",flexShrink:0,whiteSpace:"nowrap"},children:"1/3"}),o.jsx(U,{icon:"arrow-down","aria-label":"Next",onClick:a()})]})}),o.jsxs(d,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Accept"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"Reject"})]})]})]})})},D={parameters:{docs:{description:{story:"Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions."}}},render:()=>{const e=n.useMemo(()=>[{id:"top-left",label:"Top Left",style:{top:"20px",left:"20px"}},{id:"top-center",label:"Top Center",style:{top:"20px",left:"50%",marginLeft:"calc(-1 * (6ch + 24px) / 2)"}},{id:"top-right",label:"Top Right",style:{top:"20px",right:"20px"}},{id:"middle-left",label:"Middle Left",style:{top:"50%",left:"20px",marginTop:"calc(-1em / 2)"}},{id:"center",label:"Center",style:{top:"50%",left:"50%",marginTop:"calc(-1em / 2)",marginLeft:"calc(-1 * (4ch + 24px) / 2)"}},{id:"middle-right",label:"Middle Right",style:{top:"50%",right:"20px",marginTop:"calc(-1em / 2)"}},{id:"bottom-left",label:"Bottom Left",style:{bottom:"20px",left:"20px"}},{id:"bottom-center",label:"Bottom Center",style:{bottom:"20px",left:"50%",marginLeft:"calc(-1 * (9ch + 24px) / 2)"}},{id:"bottom-right",label:"Bottom Right",style:{bottom:"20px",right:"20px"}}],[]);return o.jsx("div",{className:"tox context-toolbar-anchors",style:{width:"520px"},children:o.jsx("div",{className:"tox",style:{position:"relative",height:"360px",border:"1px solid #c6cdd6",borderRadius:"16px",background:"#ffffff",overflow:"hidden"},children:e.map(t=>o.jsxs(m,{persistent:!1,children:[o.jsx(j,{children:o.jsx("div",{style:{position:"absolute",display:"inline-flex",...t.style},children:o.jsx(r,{children:t.label})})}),o.jsx(g,{children:o.jsxs(d,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]},t.id))})})}},M={parameters:{docs:{description:{story:"Demonstrates using `anchorRef` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected)."}}},render:()=>{const e=n.useRef(null),[t,s]=n.useState(!0);return o.jsxs("div",{className:"tox",style:{position:"relative"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),o.jsxs("button",{onClick:()=>s(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&o.jsx(m,{anchorRef:e,persistent:!0,children:o.jsx(g,{children:o.jsxs(d,{children:[o.jsx(r,{children:"Accept"}),o.jsx(r,{children:"Reject"})]})})})]})}},I={parameters:{docs:{description:{story:"Demonstrates anchored toolbar positioning without the Popover API. The toolbar stays inside the scroll container and tracks its anchor element as the page scrolls. This mode mirrors iframe-overlay behavior (popover={false})."}}},render:()=>{const e=n.useRef(null),[t,s]=n.useState(!0);return o.jsx("div",{className:"tox",style:{height:"300px",overflow:"auto",border:"1px solid #ccc",position:"relative"},children:o.jsxs("div",{style:{height:"1000px",padding:"20px"},children:[o.jsx("p",{children:"Scroll down to find the anchor ↓"}),o.jsxs("div",{style:{marginTop:"300px"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightgreen",padding:"12px",cursor:"pointer",display:"inline-block"},children:"Scroll-anchored element"}),o.jsxs("button",{onClick:()=>s(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&o.jsx(m,{anchorRef:e,persistent:!0,usePopover:!1,children:o.jsx(g,{children:o.jsxs(d,{children:[o.jsx(r,{children:"Accept"}),o.jsx(r,{children:"Reject"})]})})})]})]})})}},F={parameters:{docs:{description:{story:"Demonstrates keyboard navigation with disabled controls. On open, focus moves to the first enabled control. Tab moves between groups using the first enabled control in each group and skips groups with no enabled controls. Arrow keys move within the current group."}}},render:()=>{const e=n.useRef(null),[t,s]=n.useState(!0);return o.jsxs("div",{className:"tox",style:{position:"relative"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),o.jsxs("button",{onClick:()=>s(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&o.jsx(m,{anchorRef:e,persistent:!0,children:o.jsxs(g,{children:[o.jsxs(d,{children:[o.jsx(r,{children:"Accept A"}),o.jsx(r,{children:"Accept B"}),o.jsx(r,{disabled:!0,children:"Reject (Disabled)"})]}),o.jsx(d,{children:o.jsx(r,{disabled:!0,children:"Group 2 Action (Disabled)"})}),o.jsx(d,{children:o.jsx(r,{disabled:!0,children:"Group 3 Action (Disabled)"})}),o.jsxs(d,{children:[o.jsx(r,{children:"Final Group A"}),o.jsx(r,{children:"Final Group B"}),o.jsx(r,{children:"Final Group C"}),o.jsx(r,{children:"Final Group D"}),o.jsx(r,{children:"Final Group E"})]})]})})]})}},qo=["Basic","Persistent","WithIconButtons","ManyButtons","MixedContent","Corners","WithAnchorRef","ScrollAnchored","DisabledControls"];G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
              <IconButton variant='primary' icon='checkmark' aria-label='Accept' onClick={fn()} />
              <IconButton variant='secondary' icon='cross' aria-label='Reject' onClick={fn()} />
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>;
  }
}`,...N.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
                <IconButton icon='arrow-up' aria-label='Previous' onClick={fn()} />

                <span style={{
                padding: '8px',
                fontSize: '12px',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>
                  1/3
                </span>
                <IconButton icon='arrow-down' aria-label='Next' onClick={fn()} />
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
}`,...P.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates keyboard navigation with disabled controls. On open, focus moves to the first enabled control. Tab moves between groups using the first enabled control in each group and skips groups with no enabled controls. Arrow keys move within the current group.'
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
                <Button>Accept A</Button>
                <Button>Accept B</Button>
                <Button disabled>Reject (Disabled)</Button>
              </ContextToolbar.Group>
              <ContextToolbar.Group>
                <Button disabled>Group 2 Action (Disabled)</Button>
              </ContextToolbar.Group>
              <ContextToolbar.Group>
                <Button disabled>Group 3 Action (Disabled)</Button>
              </ContextToolbar.Group>

              <ContextToolbar.Group>
                <Button>Final Group A</Button>
                <Button>Final Group B</Button>
                <Button>Final Group C</Button>
                <Button>Final Group D</Button>
                <Button>Final Group E</Button>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>}
      </div>;
  }
}`,...F.parameters?.docs?.source}}};export{G as Basic,D as Corners,F as DisabledControls,L as ManyButtons,P as MixedContent,E as Persistent,I as ScrollAnchored,M as WithAnchorRef,N as WithIconButtons,qo as __namedExportsOrder,Wo as default};
