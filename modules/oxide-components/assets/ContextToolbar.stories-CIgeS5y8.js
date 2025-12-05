import{r as s,j as e}from"./iframe-DyWTEy9f.js";import{B as i}from"./Button-Bu4WKpBR.js";import{I as M}from"./IconButton-BQGpAzTh.js";import{e as xe}from"./Strings-UaHc7-Lp.js";import{r as ge,S as P,f as fe,i as ve,d as W,a as Te,u as Ce,b as ye,s as C,c as q,e as ke,p as we,g as je}from"./KeyboardNavigationHooks-_ypYmR4V.js";import{O as G,a as y,b as Re}from"./Optional-CwMd5iHh.js";import{c as I}from"./Fun--VEwoXIw.js";import"./Bem-CgRdu8iC.js";import"./Obj-CrmHtVnN.js";import"./Icon-Bkxk_H6V.js";let V=0;const Be=t=>{const n=new Date().getTime(),a=Math.floor(ge()*1e9);return V++,t+"_"+a+V+String(n)},Se=t=>t.dom.classList!==void 0,Ae=(t,o)=>Se(t)&&t.dom.classList.contains(o),be=s.createContext(null),me=()=>{const t=s.useContext(be);if(!y(t))throw new Error("useContextToolbarContext must be used within a ContextToolbarProvider");return t},_e="6px",x=({children:t,persistent:o=!1,anchorRef:n,usePopover:a=!1})=>{const[w,b]=s.useState(!1),d=s.useRef(null),m=s.useRef(null),f=s.useCallback(()=>{b(!0)},[]),j=s.useCallback(()=>{b(!1)},[]),u=s.useCallback(()=>G.from(n==null?void 0:n.current).orThunk(()=>G.from(d.current).map(P.fromDom).bind(fe).filter(ve).map(r=>r.dom).orThunk(()=>G.from(d.current))).getOrNull(),[n,d]);s.useEffect(()=>{const r=u();if(y(r)&&!y(d.current)){const c=window.requestAnimationFrame(()=>{y(d.current)||b(!0)});return()=>window.cancelAnimationFrame(c)}},[u,d]),s.useEffect(()=>{const r=u();if(y(r)){const c=()=>{f()};return r.addEventListener("click",c),()=>{r.removeEventListener("click",c)}}},[u,f]);const O=s.useMemo(()=>({isOpen:w,open:f,close:j,triggerRef:d,toolbarRef:m,anchorRef:n,anchorElement:u(),getAnchorElement:u,persistent:o,usePopover:a}),[w,f,j,o,n,u,a]);return e.jsx(be.Provider,{value:O,children:t})},k=({children:t,onClick:o,onMouseDown:n})=>{const{open:a,triggerRef:w}=me(),b=s.useCallback(m=>{a(),o==null||o(m)},[a,o]),d=s.useCallback(m=>{m.preventDefault(),n==null||n(m)},[n]);return e.jsx("div",{ref:w,onClick:b,onMouseDown:d,children:t})},g=({children:t,onMouseDown:o})=>{const{isOpen:n,toolbarRef:a,triggerRef:w,getAnchorElement:b,close:d,persistent:m,usePopover:f}=me();s.useEffect(()=>{const r=a.current;if(!Re(r)){if(!n){f&&r.hidePopover();return}f&&r.showPopover(),window.queueMicrotask(()=>{const c=P.fromDom(r);W(c,".tox-toolbar__group").bind(v=>W(v,'button, [role="button"]')).fold(()=>r.focus(),v=>Te(v))})}},[f,n,a]),Ce({containerRef:a,onEscape:m?void 0:d}),ye({containerRef:a,selector:"button, .tox-button",useTabstopAt:r=>we(r).filter(c=>Ae(c,"tox-toolbar__group")).map(c=>{const T=je(c,"button, .tox-button");return T.length>0&&T[0].dom===r.dom}).getOr(!0),cyclic:!0});const j=s.useCallback(r=>{var c;if(n&&y(a.current)&&r.target instanceof Node){const T=a.current.contains(r.target),h=((c=w.current)==null?void 0:c.contains(r.target))??!1,v=b(),H=(v==null?void 0:v.contains(r.target))??!1;!T&&!h&&!H&&d()}},[n,d,a,w,b]);s.useEffect(()=>{if(!m)return document.addEventListener("mousedown",j),()=>document.removeEventListener("mousedown",j)},[m,j]);const u=s.useMemo(()=>`--${Be("context-toolbar")}`,[]);s.useEffect(()=>{const r=b(),c=a.current;if(!n||!y(r)||!y(c))return;const T=P.fromDom(r),h=P.fromDom(c);C(T,"anchor-name",u),C(h,"position","absolute"),C(h,"margin","0"),C(h,"inset","unset"),C(h,"position-anchor",u);const v=`calc(anchor(${u} bottom) + ${_e})`;return C(h,"top",v),C(h,"justify-self","anchor-center"),C(h,"position-try-fallbacks","flip-block, flip-inline, flip-block flip-inline"),()=>{q(T,"anchor-name"),xe(["position","margin","inset","position-anchor","top","justify-self","position-try-fallbacks"],H=>{q(h,H)})}},[u,n,a,b]);const O=s.useCallback(r=>{o==null||o(r)},[o]);return e.jsx("div",{ref:a,popover:f?"manual":void 0,tabIndex:-1,className:"tox-context-toolbar",style:{visibility:n?void 0:"hidden",pointerEvents:"auto"},onMouseDown:O,children:e.jsx("div",{role:"toolbar",className:"tox-toolbar",children:t})})},p=({children:t})=>{const o=s.useRef(null);return ke({containerRef:o,selector:"button, .tox-button",execute:n=>(n.dom.click(),G.some(!0))}),e.jsx("div",{ref:o,role:"group",className:"tox-toolbar__group",children:t})};try{x.displayName="Root",x.__docgenInfo={description:"",displayName:"Root",props:{persistent:{defaultValue:{value:"false"},description:"",name:"persistent",required:!1,type:{name:"boolean"}},anchorRef:{defaultValue:null,description:"",name:"anchorRef",required:!1,type:{name:"RefObject<HTMLElement>"}},usePopover:{defaultValue:{value:"false"},description:"",name:"usePopover",required:!1,type:{name:"boolean"}}}}}catch{}try{k.displayName="Trigger",k.__docgenInfo={description:"",displayName:"Trigger",props:{onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{g.displayName="Toolbar",g.__docgenInfo={description:"",displayName:"Toolbar",props:{onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{p.displayName="Group",p.__docgenInfo={description:"",displayName:"Group",props:{}}}catch{}const{fn:l}=__STORYBOOK_MODULE_TEST__,D=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,We={title:"components/ContextToolbar",parameters:{layout:"centered",docs:{description:{component:`
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

**Props:**
- \`persistent\`: (optional, default: \`false\`). If true, the toolbar stays open when clicking outside of it.
- \`usePopover\`: (optional, default: \`false\`). Enables Native Popover API mode. When \`true\`, toolbar uses \`showPopover()\` and \`hidePopover()\` to appear in the top layer. When \`false\`, the toolbar behaves as a regular absolutely-positioned element, typically used when anchoring inside an iframe overlay where Popover cannot work.
- \`anchorRef\`: (optional). A ref to an external element to anchor the toolbar to. When provided, the toolbar positions relative to this element instead of the Trigger component. The toolbar auto-opens on mount if no Trigger component is present.

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
        `}}},argTypes:{persistent:{description:"When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:"boolean"}},tags:["autodocs","skip-visual-testing"]},R={parameters:{docs:{description:{story:"Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`)."}}},render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"red",padding:"10px"},children:"Click me!"})}),e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{onClick:l(),children:"Accept"}),e.jsx(i,{onClick:l(),children:"Reject"})]})})]})})},B={parameters:{docs:{description:{story:"Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed."}}},render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!0,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"blue",padding:"10px"},children:"Click me (Persistent)!"})}),e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{onClick:l(),children:"Accept"}),e.jsx(i,{onClick:l(),children:"Reject"})]})})]})})},S={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"lightblue",padding:"10px"},children:"Click me!"})}),e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(M,{variant:"primary",icon:"checkmark",onClick:l(),resolver:I(D)}),e.jsx(M,{variant:"secondary",icon:"cross",onClick:l(),resolver:I(D)})]})})]})})},A={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"lightgreen",padding:"10px"},children:"Click me!"})}),e.jsxs(g,{children:[e.jsxs(p,{children:[e.jsx(i,{variant:"primary",onClick:l(),children:"Accept"}),e.jsx(i,{variant:"secondary",onClick:l(),children:"Reject"})]}),e.jsxs(p,{children:[e.jsx(i,{variant:"outlined",onClick:l(),children:"Edit"}),e.jsx(i,{variant:"naked",onClick:l(),children:"Comment"})]}),e.jsxs(p,{children:[e.jsx(i,{variant:"primary",onClick:l(),children:"Share"}),e.jsx(i,{variant:"secondary",onClick:l(),children:"More"})]})]})]})})},_={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"lightyellow",padding:"10px"},children:"Click me!"})}),e.jsxs(g,{children:[e.jsxs(p,{children:[e.jsx(M,{icon:"arrow-up",onClick:l(),resolver:I(D)}),e.jsx("span",{style:{padding:"8px",fontSize:"12px",flexShrink:0,whiteSpace:"nowrap"},children:"1/3"}),e.jsx(M,{icon:"arrow-down",onClick:l(),resolver:I(D)})]}),e.jsxs(p,{children:[e.jsx(i,{variant:"primary",onClick:l(),children:"Accept"}),e.jsx(i,{variant:"secondary",onClick:l(),children:"Reject"})]})]})]})})},E={parameters:{docs:{description:{story:"Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions."}}},render:()=>{const t=s.useMemo(()=>[{id:"top-left",label:"Top Left",style:{top:"20px",left:"20px"}},{id:"top-center",label:"Top Center",style:{top:"20px",left:"50%",marginLeft:"calc(-1 * (6ch + 24px) / 2)"}},{id:"top-right",label:"Top Right",style:{top:"20px",right:"20px"}},{id:"middle-left",label:"Middle Left",style:{top:"50%",left:"20px",marginTop:"calc(-1em / 2)"}},{id:"center",label:"Center",style:{top:"50%",left:"50%",marginTop:"calc(-1em / 2)",marginLeft:"calc(-1 * (4ch + 24px) / 2)"}},{id:"middle-right",label:"Middle Right",style:{top:"50%",right:"20px",marginTop:"calc(-1em / 2)"}},{id:"bottom-left",label:"Bottom Left",style:{bottom:"20px",left:"20px"}},{id:"bottom-center",label:"Bottom Center",style:{bottom:"20px",left:"50%",marginLeft:"calc(-1 * (9ch + 24px) / 2)"}},{id:"bottom-right",label:"Bottom Right",style:{bottom:"20px",right:"20px"}}],[]);return e.jsx("div",{className:"tox context-toolbar-anchors",style:{width:"520px"},children:e.jsx("div",{className:"tox",style:{position:"relative",height:"360px",border:"1px solid #c6cdd6",borderRadius:"16px",background:"#ffffff",overflow:"hidden"},children:t.map(o=>e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{position:"absolute",display:"inline-flex",...o.style},children:e.jsx(i,{children:o.label})})}),e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{onClick:l(),children:"Accept"}),e.jsx(i,{onClick:l(),children:"Reject"})]})})]},o.id))})})}},N={parameters:{docs:{description:{story:"Demonstrates using `anchorRef` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected)."}}},render:()=>{const t=s.useRef(null),[o,n]=s.useState(!0);return e.jsxs("div",{className:"tox",style:{position:"relative"},children:[e.jsx("div",{ref:t,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),e.jsxs("button",{onClick:()=>n(!o),style:{marginLeft:"10px"},children:[o?"Hide":"Show"," Toolbar"]}),o&&e.jsx(x,{anchorRef:t,persistent:!0,children:e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{children:"Accept"}),e.jsx(i,{children:"Reject"})]})})})]})}},L={parameters:{docs:{description:{story:"Demonstrates anchored toolbar positioning without the Popover API. The toolbar stays inside the scroll container and tracks its anchor element as the page scrolls. This mode mirrors iframe-overlay behavior (popover={false})."}}},render:()=>{const t=s.useRef(null),[o,n]=s.useState(!0);return e.jsx("div",{className:"tox",style:{height:"300px",overflow:"auto",border:"1px solid #ccc",position:"relative"},children:e.jsxs("div",{style:{height:"1000px",padding:"20px"},children:[e.jsx("p",{children:"Scroll down to find the anchor ↓"}),e.jsxs("div",{style:{marginTop:"300px"},children:[e.jsx("div",{ref:t,style:{backgroundColor:"lightgreen",padding:"12px",cursor:"pointer",display:"inline-block"},children:"Scroll-anchored element"}),e.jsxs("button",{onClick:()=>n(!o),style:{marginLeft:"10px"},children:[o?"Hide":"Show"," Toolbar"]}),o&&e.jsx(x,{anchorRef:t,persistent:!0,usePopover:!1,children:e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{children:"Accept"}),e.jsx(i,{children:"Reject"})]})})})]})]})})}};var F,U,K;R.parameters={...R.parameters,docs:{...(F=R.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(K=(U=R.parameters)==null?void 0:U.docs)==null?void 0:K.source}}};var $,z,Y;B.parameters={...B.parameters,docs:{...($=B.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(Y=(z=B.parameters)==null?void 0:z.docs)==null?void 0:Y.source}}};var Z,J,Q;S.parameters={...S.parameters,docs:{...(Z=S.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
              <IconButton variant='primary' icon='checkmark' onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
              <IconButton variant='secondary' icon='cross' onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>;
  }
}`,...(Q=(J=S.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var X,ee,oe;A.parameters={...A.parameters,docs:{...(X=A.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(oe=(ee=A.parameters)==null?void 0:ee.docs)==null?void 0:oe.source}}};var te,ne,re;_.parameters={..._.parameters,docs:{...(te=_.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
            <ContextToolbar.Group>
              <IconButton icon='arrow-up' onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
              <span style={{
              padding: '8px',
              fontSize: '12px',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}>
                1/3
              </span>
              <IconButton icon='arrow-down' onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button variant='primary' onClick={fn()}>Accept</Button>
              <Button variant='secondary' onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>;
  }
}`,...(re=(ne=_.parameters)==null?void 0:ne.docs)==null?void 0:re.source}}};var se,ie,ae;E.parameters={...E.parameters,docs:{...(se=E.parameters)==null?void 0:se.docs,source:{originalSource:`{
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
}`,...(ae=(ie=E.parameters)==null?void 0:ie.docs)==null?void 0:ae.source}}};var le,ce,de;N.parameters={...N.parameters,docs:{...(le=N.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(de=(ce=N.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};var pe,ue,he;L.parameters={...L.parameters,docs:{...(pe=L.parameters)==null?void 0:pe.docs,source:{originalSource:`{
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
}`,...(he=(ue=L.parameters)==null?void 0:ue.docs)==null?void 0:he.source}}};const qe=["Basic","Persistent","WithIconButtons","ManyButtons","MixedContent","Corners","WithAnchorRef","ScrollAnchored"];export{R as Basic,E as Corners,A as ManyButtons,_ as MixedContent,B as Persistent,L as ScrollAnchored,N as WithAnchorRef,S as WithIconButtons,qe as __namedExportsOrder,We as default};
