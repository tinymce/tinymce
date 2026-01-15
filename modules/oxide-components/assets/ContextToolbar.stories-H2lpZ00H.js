import{r as s,j as e}from"./iframe-Dmg9xr8O.js";import{U as pe}from"./UniverseProvider-Bhg6zhei.js";import{B as i}from"./Button-BS00URxD.js";import{I as M}from"./IconButton-Zn5fXC9V.js";import{e as me}from"./Strings-CkeB91LW.js";import{g as xe}from"./Id-CeguMbR2.js";import{O as G,a as y,b as ge}from"./Optional-DGH8Y1w3.js";import{S as P,f as fe,i as Te,d as U,e as ve,h as Ce,j as ye,s as C,a as O,c as ke,p as we,k as je}from"./KeyboardNavigationHooks-DXGDDa5c.js";import{c as Re}from"./Fun--VEwoXIw.js";import"./Bem-A_X-XUhj.js";import"./Obj-0QrmN1ba.js";import"./Universe-DVkDv2uJ.js";const Be=o=>o.dom.classList!==void 0,Se=(o,t)=>Be(o)&&o.dom.classList.contains(t),ue=s.createContext(null),he=()=>{const o=s.useContext(ue);if(!y(o))throw new Error("useContextToolbarContext must be used within a ContextToolbarProvider");return o},_e="6px",x=({children:o,persistent:t=!1,anchorRef:r,usePopover:l=!1})=>{const[w,b]=s.useState(!1),d=s.useRef(null),m=s.useRef(null),f=s.useCallback(()=>{b(!0)},[]),j=s.useCallback(()=>{b(!1)},[]),u=s.useCallback(()=>G.from(r==null?void 0:r.current).orThunk(()=>G.from(d.current).map(P.fromDom).bind(fe).filter(Te).map(n=>n.dom).orThunk(()=>G.from(d.current))).getOrNull(),[r,d]);s.useEffect(()=>{const n=u();if(y(n)&&!y(d.current)){const c=window.requestAnimationFrame(()=>{y(d.current)||b(!0)});return()=>window.cancelAnimationFrame(c)}},[u,d]),s.useEffect(()=>{const n=u();if(y(n)){const c=()=>{f()};return n.addEventListener("click",c),()=>{n.removeEventListener("click",c)}}},[u,f]);const I=s.useMemo(()=>({isOpen:w,open:f,close:j,triggerRef:d,toolbarRef:m,anchorRef:r,anchorElement:u(),getAnchorElement:u,persistent:t,usePopover:l}),[w,f,j,t,r,u,l]);return e.jsx(ue.Provider,{value:I,children:o})},k=({children:o,onClick:t,onMouseDown:r})=>{const{open:l,triggerRef:w}=he(),b=s.useCallback(m=>{l(),t==null||t(m)},[l,t]),d=s.useCallback(m=>{m.preventDefault(),r==null||r(m)},[r]);return e.jsx("div",{ref:w,onClick:b,onMouseDown:d,children:o})},g=({children:o,onMouseDown:t})=>{const{isOpen:r,toolbarRef:l,triggerRef:w,getAnchorElement:b,close:d,persistent:m,usePopover:f}=he();s.useEffect(()=>{const n=l.current;if(!ge(n)){if(!r){f&&n.hidePopover();return}f&&n.showPopover(),window.queueMicrotask(()=>{const c=P.fromDom(n);U(c,".tox-toolbar__group").bind(T=>U(T,'button, [role="button"]')).fold(()=>n.focus(),T=>ve(T))})}},[f,r,l]),Ce({containerRef:l,onEscape:m?void 0:d}),ye({containerRef:l,selector:"button, .tox-button",useTabstopAt:n=>we(n).filter(c=>Se(c,"tox-toolbar__group")).map(c=>{const v=je(c,"button, .tox-button");return v.length>0&&v[0].dom===n.dom}).getOr(!0),cyclic:!0});const j=s.useCallback(n=>{var c;if(r&&y(l.current)&&n.target instanceof Node){const v=l.current.contains(n.target),h=((c=w.current)==null?void 0:c.contains(n.target))??!1,T=b(),D=(T==null?void 0:T.contains(n.target))??!1;!v&&!h&&!D&&d()}},[r,d,l,w,b]);s.useEffect(()=>{if(!m)return document.addEventListener("mousedown",j),()=>document.removeEventListener("mousedown",j)},[m,j]);const u=s.useMemo(()=>`--${xe("context-toolbar")}`,[]);s.useEffect(()=>{const n=b(),c=l.current;if(!r||!y(n)||!y(c))return;const v=P.fromDom(n),h=P.fromDom(c);C(v,"anchor-name",u),C(h,"position","absolute"),C(h,"margin","0"),C(h,"inset","unset"),C(h,"position-anchor",u);const T=`calc(anchor(${u} bottom) + ${_e})`;return C(h,"top",T),C(h,"justify-self","anchor-center"),C(h,"position-try-fallbacks","flip-block, flip-inline, flip-block flip-inline"),()=>{O(v,"anchor-name"),me(["position","margin","inset","position-anchor","top","justify-self","position-try-fallbacks"],D=>{O(h,D)})}},[u,r,l,b]);const I=s.useCallback(n=>{t==null||t(n)},[t]);return e.jsx("div",{ref:l,popover:f?"manual":void 0,tabIndex:-1,className:"tox-context-toolbar",style:{visibility:r?void 0:"hidden",pointerEvents:"auto"},onMouseDown:I,children:e.jsx("div",{role:"toolbar",className:"tox-toolbar",children:o})})},p=({children:o})=>{const t=s.useRef(null);return ke({containerRef:t,selector:"button, .tox-button",execute:r=>(r.dom.click(),G.some(!0))}),e.jsx("div",{ref:t,role:"group",className:"tox-toolbar__group",children:o})};try{x.displayName="Root",x.__docgenInfo={description:"",displayName:"Root",props:{persistent:{defaultValue:{value:"false"},description:"",name:"persistent",required:!1,type:{name:"boolean"}},anchorRef:{defaultValue:null,description:"",name:"anchorRef",required:!1,type:{name:"RefObject<HTMLElement>"}},usePopover:{defaultValue:{value:"false"},description:"",name:"usePopover",required:!1,type:{name:"boolean"}}}}}catch{}try{k.displayName="Trigger",k.__docgenInfo={description:"",displayName:"Trigger",props:{onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{g.displayName="Toolbar",g.__docgenInfo={description:"",displayName:"Toolbar",props:{onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{p.displayName="Group",p.__docgenInfo={description:"",displayName:"Group",props:{}}}catch{}const{fn:a}=__STORYBOOK_MODULE_TEST__,Ae=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,be={getIcon:Re(Ae)},Ve={title:"components/ContextToolbar",parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{persistent:{description:"When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:"boolean"}},tags:["autodocs"]},R={parameters:{docs:{description:{story:"Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`)."}}},render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"red",padding:"10px"},children:"Click me!"})}),e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{onClick:a(),children:"Accept"}),e.jsx(i,{onClick:a(),children:"Reject"})]})})]})})},B={parameters:{docs:{description:{story:"Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed."}}},render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!0,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"blue",padding:"10px"},children:"Click me (Persistent)!"})}),e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{onClick:a(),children:"Accept"}),e.jsx(i,{onClick:a(),children:"Reject"})]})})]})})},S={decorators:[o=>e.jsx(pe,{resources:be,children:e.jsx(o,{})})],render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"lightblue",padding:"10px"},children:"Click me!"})}),e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(M,{variant:"primary",icon:"checkmark",onClick:a()}),e.jsx(M,{variant:"secondary",icon:"cross",onClick:a()})]})})]})})},_={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"lightgreen",padding:"10px"},children:"Click me!"})}),e.jsxs(g,{children:[e.jsxs(p,{children:[e.jsx(i,{variant:"primary",onClick:a(),children:"Accept"}),e.jsx(i,{variant:"secondary",onClick:a(),children:"Reject"})]}),e.jsxs(p,{children:[e.jsx(i,{variant:"outlined",onClick:a(),children:"Edit"}),e.jsx(i,{variant:"naked",onClick:a(),children:"Comment"})]}),e.jsxs(p,{children:[e.jsx(i,{variant:"primary",onClick:a(),children:"Share"}),e.jsx(i,{variant:"secondary",onClick:a(),children:"More"})]})]})]})})},A={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{backgroundColor:"lightyellow",padding:"10px"},children:"Click me!"})}),e.jsxs(g,{children:[e.jsx(pe,{resources:be,children:e.jsxs(p,{children:[e.jsx(M,{icon:"arrow-up",onClick:a()}),e.jsx("span",{style:{padding:"8px",fontSize:"12px",flexShrink:0,whiteSpace:"nowrap"},children:"1/3"}),e.jsx(M,{icon:"arrow-down",onClick:a()})]})}),e.jsxs(p,{children:[e.jsx(i,{variant:"primary",onClick:a(),children:"Accept"}),e.jsx(i,{variant:"secondary",onClick:a(),children:"Reject"})]})]})]})})},E={parameters:{docs:{description:{story:"Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions."}}},render:()=>{const o=s.useMemo(()=>[{id:"top-left",label:"Top Left",style:{top:"20px",left:"20px"}},{id:"top-center",label:"Top Center",style:{top:"20px",left:"50%",marginLeft:"calc(-1 * (6ch + 24px) / 2)"}},{id:"top-right",label:"Top Right",style:{top:"20px",right:"20px"}},{id:"middle-left",label:"Middle Left",style:{top:"50%",left:"20px",marginTop:"calc(-1em / 2)"}},{id:"center",label:"Center",style:{top:"50%",left:"50%",marginTop:"calc(-1em / 2)",marginLeft:"calc(-1 * (4ch + 24px) / 2)"}},{id:"middle-right",label:"Middle Right",style:{top:"50%",right:"20px",marginTop:"calc(-1em / 2)"}},{id:"bottom-left",label:"Bottom Left",style:{bottom:"20px",left:"20px"}},{id:"bottom-center",label:"Bottom Center",style:{bottom:"20px",left:"50%",marginLeft:"calc(-1 * (9ch + 24px) / 2)"}},{id:"bottom-right",label:"Bottom Right",style:{bottom:"20px",right:"20px"}}],[]);return e.jsx("div",{className:"tox context-toolbar-anchors",style:{width:"520px"},children:e.jsx("div",{className:"tox",style:{position:"relative",height:"360px",border:"1px solid #c6cdd6",borderRadius:"16px",background:"#ffffff",overflow:"hidden"},children:o.map(t=>e.jsxs(x,{persistent:!1,children:[e.jsx(k,{children:e.jsx("div",{style:{position:"absolute",display:"inline-flex",...t.style},children:e.jsx(i,{children:t.label})})}),e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{onClick:a(),children:"Accept"}),e.jsx(i,{onClick:a(),children:"Reject"})]})})]},t.id))})})}},N={parameters:{docs:{description:{story:"Demonstrates using `anchorRef` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected)."}}},render:()=>{const o=s.useRef(null),[t,r]=s.useState(!0);return e.jsxs("div",{className:"tox",style:{position:"relative"},children:[e.jsx("div",{ref:o,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),e.jsxs("button",{onClick:()=>r(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&e.jsx(x,{anchorRef:o,persistent:!0,children:e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{children:"Accept"}),e.jsx(i,{children:"Reject"})]})})})]})}},L={parameters:{docs:{description:{story:"Demonstrates anchored toolbar positioning without the Popover API. The toolbar stays inside the scroll container and tracks its anchor element as the page scrolls. This mode mirrors iframe-overlay behavior (popover={false})."}}},render:()=>{const o=s.useRef(null),[t,r]=s.useState(!0);return e.jsx("div",{className:"tox",style:{height:"300px",overflow:"auto",border:"1px solid #ccc",position:"relative"},children:e.jsxs("div",{style:{height:"1000px",padding:"20px"},children:[e.jsx("p",{children:"Scroll down to find the anchor ↓"}),e.jsxs("div",{style:{marginTop:"300px"},children:[e.jsx("div",{ref:o,style:{backgroundColor:"lightgreen",padding:"12px",cursor:"pointer",display:"inline-block"},children:"Scroll-anchored element"}),e.jsxs("button",{onClick:()=>r(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&e.jsx(x,{anchorRef:o,persistent:!0,usePopover:!1,children:e.jsx(g,{children:e.jsxs(p,{children:[e.jsx(i,{children:"Accept"}),e.jsx(i,{children:"Reject"})]})})})]})]})})}};var H,q,V;R.parameters={...R.parameters,docs:{...(H=R.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(V=(q=R.parameters)==null?void 0:q.docs)==null?void 0:V.source}}};var W,F,K;B.parameters={...B.parameters,docs:{...(W=B.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(K=(F=B.parameters)==null?void 0:F.docs)==null?void 0:K.source}}};var z,$,J;S.parameters={...S.parameters,docs:{...(z=S.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(J=($=S.parameters)==null?void 0:$.docs)==null?void 0:J.source}}};var X,Y,Z;_.parameters={..._.parameters,docs:{...(X=_.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(Z=(Y=_.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var Q,ee,oe;A.parameters={...A.parameters,docs:{...(Q=A.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(oe=(ee=A.parameters)==null?void 0:ee.docs)==null?void 0:oe.source}}};var te,ne,re;E.parameters={...E.parameters,docs:{...(te=E.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
}`,...(re=(ne=E.parameters)==null?void 0:ne.docs)==null?void 0:re.source}}};var se,ie,ae;N.parameters={...N.parameters,docs:{...(se=N.parameters)==null?void 0:se.docs,source:{originalSource:`{
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
}`,...(ae=(ie=N.parameters)==null?void 0:ie.docs)==null?void 0:ae.source}}};var le,ce,de;L.parameters={...L.parameters,docs:{...(le=L.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(de=(ce=L.parameters)==null?void 0:ce.docs)==null?void 0:de.source}}};const We=["Basic","Persistent","WithIconButtons","ManyButtons","MixedContent","Corners","WithAnchorRef","ScrollAnchored"];export{R as Basic,E as Corners,_ as ManyButtons,A as MixedContent,B as Persistent,L as ScrollAnchored,N as WithAnchorRef,S as WithIconButtons,We as __namedExportsOrder,Ve as default};
