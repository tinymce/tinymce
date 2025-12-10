import{r as s,j as e}from"./iframe-CAK5rbnr.js";import{B as l}from"./Button-DGnGaO15.js";import{I as G}from"./IconButton-3_XzO1z3.js";import{e as pe}from"./Strings-DGm1ki_t.js";import{a as ue,S as A,f as be,i as he,d as O,b as me,c as xe,e as ge,s as v,r as H,h as fe,p as Ce,j as Te}from"./KeyboardNavigationHooks-C6OFPh06.js";import{O as L,b as x,c as M}from"./Optional-Bk48EtMP.js";import"./Bem-DR_JBL72.js";let q=0;const ve=o=>{const r=new Date().getTime(),i=Math.floor(ue()*1e9);return q++,o+"_"+i+q+String(r)},ye=o=>o.dom.classList!==void 0,ke=(o,t)=>ye(o)&&o.dom.classList.contains(t),ce=s.createContext(null),de=()=>{const o=s.useContext(ce);if(!x(o))throw new Error("useContextToolbarContext must be used within a ContextToolbarProvider");return o},we="6px",g=({children:o,persistent:t=!1,anchorRef:r})=>{const[i,C]=s.useState(!1),d=s.useRef(null),k=s.useRef(null),p=s.useCallback(()=>{C(!0)},[]),w=s.useCallback(()=>{C(!1)},[]),u=s.useCallback(()=>L.from(r==null?void 0:r.current).orThunk(()=>L.from(d.current).map(A.fromDom).bind(be).filter(he).map(n=>n.dom).orThunk(()=>L.from(d.current))).getOrNull(),[r,d]);s.useEffect(()=>{const n=u();if(x(n)&&!x(d.current)){const c=window.requestAnimationFrame(()=>{x(d.current)||C(!0)});return()=>window.cancelAnimationFrame(c)}},[u,d]),s.useEffect(()=>{const n=u();if(x(n)){const c=()=>{p()};return n.addEventListener("click",c),()=>{n.removeEventListener("click",c)}}},[u,p]);const P=s.useMemo(()=>({isOpen:i,open:p,close:w,triggerRef:d,toolbarRef:k,anchorRef:r,anchorElement:u(),getAnchorElement:u,persistent:t}),[i,p,w,t,r,u]);return e.jsx(ce.Provider,{value:P,children:o})},y=({children:o,onClick:t,onMouseDown:r})=>{const{open:i,triggerRef:C}=de(),d=s.useCallback(p=>{i(),t==null||t(p)},[i,t]),k=s.useCallback(p=>{p.preventDefault(),r==null||r(p)},[r]);return e.jsx("div",{ref:C,onClick:d,onMouseDown:k,children:o})},f=({children:o,onMouseDown:t})=>{const{isOpen:r,toolbarRef:i,triggerRef:C,getAnchorElement:d,close:k,persistent:p}=de();s.useEffect(()=>{const n=i.current;x(n)&&(r?(n.showPopover(),window.queueMicrotask(()=>{const c=A.fromDom(n);O(c,".tox-toolbar__group").bind(m=>O(m,'button, [role="button"]')).fold(()=>n.focus(),m=>me(m))})):n.hidePopover())},[r,i]),xe({containerRef:i,onEscape:p?void 0:k}),ge({containerRef:i,selector:"button, .tox-button",useTabstopAt:n=>Ce(n).filter(c=>ke(c,"tox-toolbar__group")).map(c=>{const T=Te(c,"button, .tox-button");return T.length>0&&T[0].dom===n.dom}).getOr(!0),cyclic:!0});const w=s.useCallback(n=>{var c;if(r&&x(i.current)&&n.target instanceof Node){const T=i.current.contains(n.target),h=((c=C.current)==null?void 0:c.contains(n.target))??!1,m=d(),D=(m==null?void 0:m.contains(n.target))??!1;!T&&!h&&!D&&k()}},[r,k,i,C,d]);s.useEffect(()=>{if(!p)return document.addEventListener("mousedown",w),()=>document.removeEventListener("mousedown",w)},[p,w]);const u=s.useMemo(()=>`--${ve("context-toolbar")}`,[]);s.useEffect(()=>{const n=d(),c=i.current;if(!r||!x(n)||!x(c))return;const T=A.fromDom(n),h=A.fromDom(c);v(T,"anchor-name",u),v(h,"position","absolute"),v(h,"margin","0"),v(h,"inset","unset"),v(h,"position-anchor",u);const m=`calc(anchor(${u} bottom) + ${we})`;return v(h,"top",m),v(h,"justify-self","anchor-center"),v(h,"position-try-fallbacks","flip-block, flip-inline, flip-block flip-inline"),()=>{H(T,"anchor-name"),pe(["position","margin","inset","position-anchor","top","justify-self","position-try-fallbacks"],D=>{H(h,D)})}},[u,r,i,d]);const P=s.useCallback(n=>{t==null||t(n)},[t]);return e.jsx("div",{ref:i,popover:"manual",tabIndex:-1,className:"tox-context-toolbar",style:{visibility:r?void 0:"hidden"},onMouseDown:P,children:e.jsx("div",{role:"toolbar",className:"tox-toolbar",children:o})})},b=({children:o})=>{const t=s.useRef(null);return fe({containerRef:t,selector:"button, .tox-button",execute:r=>(r.dom.click(),L.some(!0))}),e.jsx("div",{ref:t,role:"group",className:"tox-toolbar__group",children:o})};try{g.displayName="Root",g.__docgenInfo={description:"",displayName:"Root",props:{persistent:{defaultValue:{value:"false"},description:"",name:"persistent",required:!1,type:{name:"boolean"}},anchorRef:{defaultValue:null,description:"",name:"anchorRef",required:!1,type:{name:"RefObject<HTMLElement>"}}}}}catch{}try{y.displayName="Trigger",y.__docgenInfo={description:"",displayName:"Trigger",props:{onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{f.displayName="Toolbar",f.__docgenInfo={description:"",displayName:"Toolbar",props:{onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{b.displayName="Group",b.__docgenInfo={description:"",displayName:"Group",props:{}}}catch{}const{fn:a}=__STORYBOOK_MODULE_TEST__,I=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,Ae={title:"components/ContextToolbar",parameters:{layout:"centered",docs:{description:{component:`
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
- \`anchorRef\`: (optional). A ref to an external element to anchor the toolbar to. When provided, the toolbar positions relative to this element instead of the Trigger component. The toolbar auto-opens on mount if no Trigger component is present.

**Important:** 
- Use either \`Trigger\` component OR \`anchorRef\` (not both). 
- With \`anchorRef\` and no Trigger, the toolbar auto-opens on mount.
- Visibility is controlled by conditional rendering - mount/unmount the component based on your state (e.g., when an annotation is selected).

### Trigger
Wraps the element that opens the toolbar when clicked.

### Toolbar
Contains the toolbar content and groups. Uses the Popover API (popover='manual') for layering and positioning, with manual control over dismissal behavior.

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
        `}}},argTypes:{persistent:{description:"When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:"boolean"}},tags:["autodocs","skip-visual-testing"]},j={parameters:{docs:{description:{story:"Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`)."}}},render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(g,{persistent:!1,children:[e.jsx(y,{children:e.jsx("div",{style:{backgroundColor:"red",padding:"10px"},children:"Click me!"})}),e.jsx(f,{children:e.jsxs(b,{children:[e.jsx(l,{onClick:a(),children:"Accept"}),e.jsx(l,{onClick:a(),children:"Reject"})]})})]})})},B={parameters:{docs:{description:{story:"Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed."}}},render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(g,{persistent:!0,children:[e.jsx(y,{children:e.jsx("div",{style:{backgroundColor:"blue",padding:"10px"},children:"Click me (Persistent)!"})}),e.jsx(f,{children:e.jsxs(b,{children:[e.jsx(l,{onClick:a(),children:"Accept"}),e.jsx(l,{onClick:a(),children:"Reject"})]})})]})})},R={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(g,{persistent:!1,children:[e.jsx(y,{children:e.jsx("div",{style:{backgroundColor:"lightblue",padding:"10px"},children:"Click me!"})}),e.jsx(f,{children:e.jsxs(b,{children:[e.jsx(G,{variant:"primary",icon:"checkmark",onClick:a(),resolver:M(I)}),e.jsx(G,{variant:"secondary",icon:"cross",onClick:a(),resolver:M(I)})]})})]})})},S={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(g,{persistent:!1,children:[e.jsx(y,{children:e.jsx("div",{style:{backgroundColor:"lightgreen",padding:"10px"},children:"Click me!"})}),e.jsxs(f,{children:[e.jsxs(b,{children:[e.jsx(l,{variant:"primary",onClick:a(),children:"Accept"}),e.jsx(l,{variant:"secondary",onClick:a(),children:"Reject"})]}),e.jsxs(b,{children:[e.jsx(l,{variant:"outlined",onClick:a(),children:"Edit"}),e.jsx(l,{variant:"naked",onClick:a(),children:"Comment"})]}),e.jsxs(b,{children:[e.jsx(l,{variant:"primary",onClick:a(),children:"Share"}),e.jsx(l,{variant:"secondary",onClick:a(),children:"More"})]})]})]})})},_={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(g,{persistent:!1,children:[e.jsx(y,{children:e.jsx("div",{style:{backgroundColor:"lightyellow",padding:"10px"},children:"Click me!"})}),e.jsxs(f,{children:[e.jsxs(b,{children:[e.jsx(G,{icon:"arrow-up",onClick:a(),resolver:M(I)}),e.jsx("span",{style:{padding:"8px",fontSize:"12px",flexShrink:0,whiteSpace:"nowrap"},children:"1/3"}),e.jsx(G,{icon:"arrow-down",onClick:a(),resolver:M(I)})]}),e.jsxs(b,{children:[e.jsx(l,{variant:"primary",onClick:a(),children:"Accept"}),e.jsx(l,{variant:"secondary",onClick:a(),children:"Reject"})]})]})]})})},E={parameters:{docs:{description:{story:"Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions."}}},render:()=>{const o=s.useMemo(()=>[{id:"top-left",label:"Top Left",style:{top:"20px",left:"20px"}},{id:"top-center",label:"Top Center",style:{top:"20px",left:"50%",marginLeft:"calc(-1 * (6ch + 24px) / 2)"}},{id:"top-right",label:"Top Right",style:{top:"20px",right:"20px"}},{id:"middle-left",label:"Middle Left",style:{top:"50%",left:"20px",marginTop:"calc(-1em / 2)"}},{id:"center",label:"Center",style:{top:"50%",left:"50%",marginTop:"calc(-1em / 2)",marginLeft:"calc(-1 * (4ch + 24px) / 2)"}},{id:"middle-right",label:"Middle Right",style:{top:"50%",right:"20px",marginTop:"calc(-1em / 2)"}},{id:"bottom-left",label:"Bottom Left",style:{bottom:"20px",left:"20px"}},{id:"bottom-center",label:"Bottom Center",style:{bottom:"20px",left:"50%",marginLeft:"calc(-1 * (9ch + 24px) / 2)"}},{id:"bottom-right",label:"Bottom Right",style:{bottom:"20px",right:"20px"}}],[]);return e.jsx("div",{className:"tox context-toolbar-anchors",style:{width:"520px"},children:e.jsx("div",{className:"tox",style:{position:"relative",height:"360px",border:"1px solid #c6cdd6",borderRadius:"16px",background:"#ffffff",overflow:"hidden"},children:o.map(t=>e.jsxs(g,{persistent:!1,children:[e.jsx(y,{children:e.jsx("div",{style:{position:"absolute",display:"inline-flex",...t.style},children:e.jsx(l,{children:t.label})})}),e.jsx(f,{children:e.jsxs(b,{children:[e.jsx(l,{onClick:a(),children:"Accept"}),e.jsx(l,{onClick:a(),children:"Reject"})]})})]},t.id))})})}},N={parameters:{docs:{description:{story:"Demonstrates using `anchorRef` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected)."}}},render:()=>{const o=s.useRef(null),[t,r]=s.useState(!0);return e.jsxs("div",{className:"tox",style:{position:"relative"},children:[e.jsx("div",{ref:o,style:{backgroundColor:"lightcoral",padding:"10px",cursor:"pointer",display:"inline-block"},children:"Anchor element"}),e.jsxs("button",{onClick:()=>r(!t),style:{marginLeft:"10px"},children:[t?"Hide":"Show"," Toolbar"]}),t&&e.jsx(g,{anchorRef:o,persistent:!0,children:e.jsx(f,{children:e.jsxs(b,{children:[e.jsx(l,{children:"Accept"}),e.jsx(l,{children:"Reject"})]})})})]})}};var F,U,V;j.parameters={...j.parameters,docs:{...(F=j.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(V=(U=j.parameters)==null?void 0:U.docs)==null?void 0:V.source}}};var W,K,$;B.parameters={...B.parameters,docs:{...(W=B.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...($=(K=B.parameters)==null?void 0:K.docs)==null?void 0:$.source}}};var z,Y,Z;R.parameters={...R.parameters,docs:{...(z=R.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(Z=(Y=R.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var J,Q,X;S.parameters={...S.parameters,docs:{...(J=S.parameters)==null?void 0:J.docs,source:{originalSource:`{
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
}`,...(X=(Q=S.parameters)==null?void 0:Q.docs)==null?void 0:X.source}}};var ee,oe,te;_.parameters={..._.parameters,docs:{...(ee=_.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(te=(oe=_.parameters)==null?void 0:oe.docs)==null?void 0:te.source}}};var ne,re,se;E.parameters={...E.parameters,docs:{...(ne=E.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(se=(re=E.parameters)==null?void 0:re.docs)==null?void 0:se.source}}};var ie,ae,le;N.parameters={...N.parameters,docs:{...(ie=N.parameters)==null?void 0:ie.docs,source:{originalSource:`{
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
}`,...(le=(ae=N.parameters)==null?void 0:ae.docs)==null?void 0:le.source}}};const Le=["Basic","Persistent","WithIconButtons","ManyButtons","MixedContent","Corners","WithAnchorRef"];export{j as Basic,E as Corners,S as ManyButtons,_ as MixedContent,B as Persistent,N as WithAnchorRef,R as WithIconButtons,Le as __namedExportsOrder,Ae as default};
