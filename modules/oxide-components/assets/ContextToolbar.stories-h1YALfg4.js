import{r as n,j as o}from"./iframe-BBSycjvz.js";import{U as W}from"./UniverseProvider-B7n9aVvo.js";import{B as r}from"./Button-9Vy9O2Im.js";import{I}from"./IconButton-BUcujC8w.js";import{e as to,m as no}from"./Strings-DatO8Mn0.js";import{g as ro}from"./Id--8xy-NHg.js";import{O as j,i as v,b as U}from"./Optional-BMqOXurB.js";import{S as F,f as so,i as K,c as io,d as ao,e as lo,s as y,r as O,b as co,h as $,j as q,k as po,l as uo,m as ho,n as bo}from"./KeyboardNavigationHooks-B0XVMoDd.js";import{c as xo}from"./Fun-DfA6N4bS.js";import"./preload-helper-PPVm8Dsz.js";import"./Bem-BAJJXTy-.js";import"./Obj-4mkygeuk.js";import"./Icon-Bj68rC19.js";import"./Num-xrWELwUY.js";const z=n.createContext(null),J=()=>{const e=n.useContext(z);if(!v(e))throw new Error("useContextToolbarContext must be used within a ContextToolbarProvider");return e},mo="6px",X=["button",'[role="button"]',".tox-button"],Y=X.join(", "),go=no(X,e=>`${e}:not([disabled]):not([aria-disabled="true"])`).join(", "),fo=e=>!ho(e,"disabled")&&bo(e,"aria-disabled")!=="true"&&e.dom.tabIndex>=0,To=e=>t=>K(t)&&uo(t,e)&&fo(t),Z=To(Y),Co=(e,t)=>lo(e,t).map(s=>$(s,Z).exists(f=>po(f,e))).getOr(!0),V=e=>{const t=F.fromDom(e);$(t,Z).fold(()=>q(t),q)},x=({children:e,persistent:t=!1,anchorRef:s,usePopover:f=!1})=>{const[d,i]=n.useState(!1),p=n.useRef(null),h=n.useRef(null),g=n.useCallback(()=>{i(!0)},[]),w=n.useCallback(()=>{i(!1)},[]),u=n.useCallback(()=>j.from(s?.current).orThunk(()=>j.from(p.current).map(F.fromDom).bind(so).filter(K).map(b=>b.dom).orThunk(()=>j.from(p.current))).getOrNull(),[s,p]);n.useEffect(()=>{const b=u();if(v(b)&&!v(p.current)){const T=window.requestAnimationFrame(()=>{v(p.current)||i(!0)});return()=>window.cancelAnimationFrame(T)}},[u,p]),n.useEffect(()=>{const b=u();if(v(b)){const T=()=>{g()};return b.addEventListener("click",T),()=>{b.removeEventListener("click",T)}}},[u,g]);const R=n.useMemo(()=>({isOpen:d,open:g,close:w,triggerRef:p,toolbarRef:h,anchorRef:s,anchorElement:u(),getAnchorElement:u,persistent:t,usePopover:f}),[d,g,w,t,s,u,f]);return o.jsx(z.Provider,{value:R,children:e})},k=({children:e,onClick:t,onMouseDown:s})=>{const{open:f,triggerRef:d}=J(),i=n.useCallback(h=>{f(),t?.(h)},[f,t]),p=n.useCallback(h=>{h.preventDefault(),s?.(h)},[s]);return o.jsx("div",{ref:d,onClick:i,onMouseDown:p,children:e})},m=n.forwardRef(({children:e,onMouseDown:t,onEscape:s},f)=>{const{isOpen:d,toolbarRef:i,triggerRef:p,getAnchorElement:h,close:g,persistent:w,usePopover:u}=J();n.useImperativeHandle(f,()=>({focus:()=>{j.from(i.current).each(V)}}),[i]),n.useEffect(()=>{const c=i.current;if(!U(c)){if(!d){u&&c.hidePopover();return}u&&c.showPopover(),window.queueMicrotask(()=>{V(c)})}},[u,d,i]);const R=n.useMemo(()=>w?s:U(s)?g:()=>{s(),g()},[w,s,g]);io({containerRef:i,...v(R)?{onEscape:R}:{}}),ao({containerRef:i,selector:Y,useTabstopAt:c=>Co(c,".tox-toolbar__group"),cyclic:!0});const b=n.useCallback(c=>{if(d&&v(i.current)&&c.target instanceof Node){const B=i.current.contains(c.target),S=p.current?.contains(c.target)??!1,H=h()?.contains(c.target)??!1;!B&&!S&&!H&&g()}},[d,g,i,p,h]);n.useEffect(()=>{if(!w)return document.addEventListener("mousedown",b),()=>document.removeEventListener("mousedown",b)},[w,b]);const T=n.useMemo(()=>`--${ro("context-toolbar")}`,[]);n.useEffect(()=>{const c=h(),B=i.current;if(!d||!v(c)||!v(B))return;const S=F.fromDom(c),C=F.fromDom(B);y(S,"anchor-name",T),y(C,"position","absolute"),y(C,"margin","0"),y(C,"inset","unset"),y(C,"position-anchor",T);const H=`calc(anchor(${T} bottom) + ${mo})`;return y(C,"top",H),y(C,"justify-self","anchor-center"),y(C,"position-try-fallbacks","flip-block, flip-inline, flip-block flip-inline"),()=>{O(S,"anchor-name"),to(["position","margin","inset","position-anchor","top","justify-self","position-try-fallbacks"],eo=>{O(C,eo)})}},[T,d,i,h]);const oo=n.useCallback(c=>{t?.(c)},[t]);return o.jsx("div",{ref:i,popover:u?"manual":void 0,tabIndex:-1,className:"tox-context-toolbar",style:{visibility:d?void 0:"hidden",pointerEvents:"auto"},onMouseDown:oo,children:o.jsx("div",{role:"toolbar",className:"tox-toolbar",children:e})})}),l=({children:e})=>{const t=n.useRef(null);return co({containerRef:t,selector:go,execute:s=>(s.dom.click(),j.some(!0))}),o.jsx("div",{ref:t,role:"group",className:"tox-toolbar__group",children:e})};try{x.displayName="Root",x.__docgenInfo={description:"",displayName:"Root",props:{persistent:{defaultValue:{value:"false"},description:"",name:"persistent",required:!1,type:{name:"boolean"}},anchorRef:{defaultValue:null,description:"",name:"anchorRef",required:!1,type:{name:"RefObject<HTMLElement>"}},usePopover:{defaultValue:{value:"false"},description:"",name:"usePopover",required:!1,type:{name:"boolean"}}}}}catch{}try{k.displayName="Trigger",k.__docgenInfo={description:"",displayName:"Trigger",props:{onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{m.displayName="Toolbar",m.__docgenInfo={description:"",displayName:"Toolbar",props:{onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onEscape:{defaultValue:null,description:"",name:"onEscape",required:!1,type:{name:"(() => void)"}}}}}catch{}try{l.displayName="Group",l.__docgenInfo={description:"",displayName:"Group",props:{}}}catch{}const{fn:a}=__STORYBOOK_MODULE_TEST__,vo=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,Q={getIcon:xo(vo)},Lo={title:"components/ContextToolbar",parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{persistent:{description:"When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:"boolean"}},tags:["autodocs"]},A={parameters:{docs:{description:{story:"Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`)."}}},render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!1,children:[o.jsx(k,{children:o.jsx("div",{style:{backgroundColor:"red",padding:"10px"},children:"Click me!"})}),o.jsx(m,{children:o.jsxs(l,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]})})},G={parameters:{docs:{description:{story:"Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed."}}},render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!0,children:[o.jsx(k,{children:o.jsx("div",{style:{backgroundColor:"blue",padding:"10px"},children:"Click me (Persistent)!"})}),o.jsx(m,{children:o.jsxs(l,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]})})},E={decorators:[e=>o.jsx(W,{resources:Q,children:o.jsx(e,{})})],render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!1,children:[o.jsx(k,{children:o.jsx("div",{style:{backgroundColor:"lightblue",padding:"10px"},children:"Click me!"})}),o.jsx(m,{children:o.jsxs(l,{children:[o.jsx(I,{variant:"primary",icon:"checkmark",onClick:a()}),o.jsx(I,{variant:"secondary",icon:"cross",onClick:a()})]})})]})})},N={render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!1,children:[o.jsx(k,{children:o.jsx("div",{style:{backgroundColor:"lightgreen",padding:"10px"},children:"Click me!"})}),o.jsxs(m,{children:[o.jsxs(l,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Accept"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"Reject"})]}),o.jsxs(l,{children:[o.jsx(r,{variant:"outlined",onClick:a(),children:"Edit"}),o.jsx(r,{variant:"naked",onClick:a(),children:"Comment"})]}),o.jsxs(l,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Share"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"More"})]})]})]})})},_={render:()=>o.jsx("div",{className:"tox",style:{position:"relative"},children:o.jsxs(x,{persistent:!1,children:[o.jsx(k,{children:o.jsx("div",{style:{backgroundColor:"lightyellow",padding:"10px"},children:"Click me!"})}),o.jsxs(m,{children:[o.jsx(W,{resources:Q,children:o.jsxs(l,{children:[o.jsx(I,{icon:"arrow-up",onClick:a()}),o.jsx("span",{style:{padding:"8px",fontSize:"12px",flexShrink:0,whiteSpace:"nowrap"},children:"1/3"}),o.jsx(I,{icon:"arrow-down",onClick:a()})]})}),o.jsxs(l,{children:[o.jsx(r,{variant:"primary",onClick:a(),children:"Accept"}),o.jsx(r,{variant:"secondary",onClick:a(),children:"Reject"})]})]})]})})},M={parameters:{docs:{description:{story:"Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions."}}},render:()=>{const e=n.useMemo(()=>[{id:"top-left",label:"Top Left",style:{top:"20px",left:"20px"}},{id:"top-center",label:"Top Center",style:{top:"20px",left:"50%",marginLeft:"calc(-1 * (6ch + 24px) / 2)"}},{id:"top-right",label:"Top Right",style:{top:"20px",right:"20px"}},{id:"middle-left",label:"Middle Left",style:{top:"50%",left:"20px",marginTop:"calc(-1em / 2)"}},{id:"center",label:"Center",style:{top:"50%",left:"50%",marginTop:"calc(-1em / 2)",marginLeft:"calc(-1 * (4ch + 24px) / 2)"}},{id:"middle-right",label:"Middle Right",style:{top:"50%",right:"20px",marginTop:"calc(-1em / 2)"}},{id:"bottom-left",label:"Bottom Left",style:{bottom:"20px",left:"20px"}},{id:"bottom-center",label:"Bottom Center",style:{bottom:"20px",left:"50%",marginLeft:"calc(-1 * (9ch + 24px) / 2)"}},{id:"bottom-right",label:"Bottom Right",style:{bottom:"20px",right:"20px"}}],[]);return o.jsx("div",{className:"tox context-toolbar-anchors",style:{width:"520px"},children:o.jsx("div",{className:"tox",style:{position:"relative",height:"360px",border:"1px solid #c6cdd6",borderRadius:"16px",background:"#ffffff",overflow:"hidden"},children:e.map(t=>o.jsxs(x,{persistent:!1,children:[o.jsx(k,{children:o.jsx("div",{style:{position:"absolute",display:"inline-flex",...t.style},children:o.jsx(r,{children:t.label})})}),o.jsx(m,{children:o.jsxs(l,{children:[o.jsx(r,{onClick:a(),children:"Accept"}),o.jsx(r,{onClick:a(),children:"Reject"})]})})]},t.id))})})}},D={parameters:{docs:{description:{story:"Demonstrates using `anchorRef` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected)."}}},render:()=>{const e=n.useRef(null),[t,s]=n.useState(!0);return o.jsxs("div",{className:"tox",style:{position:"relative"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),o.jsxs("button",{onClick:()=>s(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&o.jsx(x,{anchorRef:e,persistent:!0,children:o.jsx(m,{children:o.jsxs(l,{children:[o.jsx(r,{children:"Accept"}),o.jsx(r,{children:"Reject"})]})})})]})}},L={parameters:{docs:{description:{story:"Demonstrates anchored toolbar positioning without the Popover API. The toolbar stays inside the scroll container and tracks its anchor element as the page scrolls. This mode mirrors iframe-overlay behavior (popover={false})."}}},render:()=>{const e=n.useRef(null),[t,s]=n.useState(!0);return o.jsx("div",{className:"tox",style:{height:"300px",overflow:"auto",border:"1px solid #ccc",position:"relative"},children:o.jsxs("div",{style:{height:"1000px",padding:"20px"},children:[o.jsx("p",{children:"Scroll down to find the anchor ↓"}),o.jsxs("div",{style:{marginTop:"300px"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightgreen",padding:"12px",cursor:"pointer",display:"inline-block"},children:"Scroll-anchored element"}),o.jsxs("button",{onClick:()=>s(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&o.jsx(x,{anchorRef:e,persistent:!0,usePopover:!1,children:o.jsx(m,{children:o.jsxs(l,{children:[o.jsx(r,{children:"Accept"}),o.jsx(r,{children:"Reject"})]})})})]})]})})}},P={parameters:{docs:{description:{story:"Demonstrates keyboard navigation with disabled controls. On open, focus moves to the first enabled control. Tab moves between groups using the first enabled control in each group and skips groups with no enabled controls. Arrow keys move within the current group."}}},render:()=>{const e=n.useRef(null),[t,s]=n.useState(!0);return o.jsxs("div",{className:"tox",style:{position:"relative"},children:[o.jsx("div",{ref:e,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),o.jsxs("button",{onClick:()=>s(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&o.jsx(x,{anchorRef:e,persistent:!0,children:o.jsxs(m,{children:[o.jsxs(l,{children:[o.jsx(r,{children:"Accept A"}),o.jsx(r,{children:"Accept B"}),o.jsx(r,{disabled:!0,children:"Reject (Disabled)"})]}),o.jsx(l,{children:o.jsx(r,{disabled:!0,children:"Group 2 Action (Disabled)"})}),o.jsx(l,{children:o.jsx(r,{disabled:!0,children:"Group 3 Action (Disabled)"})}),o.jsxs(l,{children:[o.jsx(r,{children:"Final Group A"}),o.jsx(r,{children:"Final Group B"}),o.jsx(r,{children:"Final Group C"}),o.jsx(r,{children:"Final Group D"}),o.jsx(r,{children:"Final Group E"})]})]})})]})}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};const Po=["Basic","Persistent","WithIconButtons","ManyButtons","MixedContent","Corners","WithAnchorRef","ScrollAnchored","DisabledControls"];export{A as Basic,M as Corners,P as DisabledControls,N as ManyButtons,_ as MixedContent,G as Persistent,L as ScrollAnchored,D as WithAnchorRef,E as WithIconButtons,Po as __namedExportsOrder,Lo as default};
