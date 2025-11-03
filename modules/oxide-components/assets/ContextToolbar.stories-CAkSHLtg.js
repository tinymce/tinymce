import{r as i,j as e}from"./iframe-DMoLddr3.js";import{B as l}from"./Button-CdDPyMpe.js";import{I as S}from"./IconButton-COVHLMrG.js";import{e as ae}from"./Strings-DbDkfDAK.js";import{r as le,S as M,d as A,f as ce,u as de,a as pe,s as y,b as L,c as ue,p as be,e as xe}from"./KeyboardNavigationHooks-CXqmDpt6.js";import{b as T,O as me,c as N}from"./Optional-CLt1CVr3.js";import"./Bem-2mkHu_ih.js";let I=0;const he=o=>{const n=new Date().getTime(),r=Math.floor(le()*1e9);return I++,o+"_"+r+I+String(n)},ge=o=>o.dom.classList!==void 0,fe=(o,t)=>ge(o)&&o.dom.classList.contains(t),oe=i.createContext(null),te=()=>{const o=i.useContext(oe);if(!T(o))throw new Error("useContextToolbarContext must be used within a ContextToolbarProvider");return o},Ce="6px",m=({children:o,persistent:t=!1})=>{const[n,r]=i.useState(!1),p=i.useRef(null),f=i.useRef(null),x=i.useCallback(()=>r(!0),[]),c=i.useCallback(()=>r(!1),[]),C=i.useMemo(()=>({isOpen:n,open:x,close:c,triggerRef:p,toolbarRef:f,persistent:t}),[n,x,c,t]);return e.jsx(oe.Provider,{value:C,children:o})},h=({children:o,onClick:t,onMouseDown:n})=>{const{open:r,triggerRef:p}=te(),f=i.useCallback(c=>{r(),t==null||t(c)},[r,t]),x=i.useCallback(c=>{c.preventDefault(),n==null||n(c)},[n]);return e.jsx("div",{ref:p,onClick:f,onMouseDown:x,children:o})},g=({children:o,onMouseDown:t})=>{const{isOpen:n,toolbarRef:r,triggerRef:p,close:f,persistent:x}=te();i.useEffect(()=>{const s=r.current;T(s)&&(n?(s.showPopover(),window.queueMicrotask(()=>{const u=M.fromDom(s);A(u,".tox-toolbar__group").bind(b=>A(b,'button, [role="button"]')).fold(()=>s.focus(),b=>ce(b))})):s.hidePopover())},[n,r]),de({containerRef:r,onEscape:x?void 0:f}),pe({containerRef:r,selector:"button, .tox-button",useTabstopAt:s=>be(s).filter(u=>fe(u,"tox-toolbar__group")).map(u=>{const v=xe(u,"button, .tox-button");return v.length>0&&v[0].dom===s.dom}).getOr(!0),cyclic:!0});const c=i.useCallback(s=>{if(n&&T(r.current)&&T(p.current)&&s.target instanceof Node){const u=r.current.contains(s.target),v=p.current.contains(s.target);!u&&!v&&f()}},[n,f,r,p]);i.useEffect(()=>{if(!x)return document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[x,c]);const C=i.useMemo(()=>`--${he("context-toolbar")}`,[]);i.useEffect(()=>{if(!n||!T(p.current)||!T(r.current))return;const s=p.current,u=r.current,v=s.firstElementChild instanceof window.HTMLElement?s.firstElementChild:s,G=M.fromDom(v),b=M.fromDom(u);y(G,"anchor-name",C),y(b,"position-anchor",C);const re=`calc(anchor(${C} bottom) + ${Ce})`,se=`anchor(${C} left)`;return y(b,"top",re),y(b,"left",se),y(b,"position-try-fallbacks","flip-block, flip-inline, flip-block flip-inline"),()=>{L(G,"anchor-name"),ae(["position-anchor","top","left","position-try-fallbacks"],ie=>{L(b,ie)})}},[C,n,p,r]);const ne=i.useCallback(s=>{t==null||t(s)},[t]);return e.jsx("div",{ref:r,popover:"manual",tabIndex:-1,className:"tox-context-toolbar",style:{visibility:n?void 0:"hidden"},onMouseDown:ne,children:e.jsx("div",{role:"toolbar",className:"tox-toolbar",children:o})})},d=({children:o})=>{const t=i.useRef(null);return ue({containerRef:t,selector:"button, .tox-button",execute:n=>(n.dom.click(),me.some(!0))}),e.jsx("div",{ref:t,role:"group",className:"tox-toolbar__group",children:o})};try{m.displayName="Root",m.__docgenInfo={description:"",displayName:"Root",props:{persistent:{defaultValue:{value:"false"},description:"",name:"persistent",required:!1,type:{name:"boolean"}}}}}catch{}try{h.displayName="Trigger",h.__docgenInfo={description:"",displayName:"Trigger",props:{onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}},onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{g.displayName="Toolbar",g.__docgenInfo={description:"",displayName:"Toolbar",props:{onMouseDown:{defaultValue:null,description:"",name:"onMouseDown",required:!1,type:{name:"MouseEventHandler<HTMLDivElement>"}}}}}catch{}try{d.displayName="Group",d.__docgenInfo={description:"",displayName:"Group",props:{}}}catch{}const{fn:a}=__STORYBOOK_MODULE_TEST__,E=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`,Re={title:"components/ContextToolbar",parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},argTypes:{persistent:{description:"When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:"boolean"}},tags:["autodocs","skip-visual-testing"]},k={parameters:{docs:{description:{story:"Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`)."}}},render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(m,{persistent:!1,children:[e.jsx(h,{children:e.jsx("div",{style:{backgroundColor:"red",padding:"10px"},children:"Click me!"})}),e.jsx(g,{children:e.jsxs(d,{children:[e.jsx(l,{onClick:a(),children:"Accept"}),e.jsx(l,{onClick:a(),children:"Reject"})]})})]})})},w={parameters:{docs:{description:{story:"Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed."}}},render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(m,{persistent:!0,children:[e.jsx(h,{children:e.jsx("div",{style:{backgroundColor:"blue",padding:"10px"},children:"Click me (Persistent)!"})}),e.jsx(g,{children:e.jsxs(d,{children:[e.jsx(l,{onClick:a(),children:"Accept"}),e.jsx(l,{onClick:a(),children:"Reject"})]})})]})})},j={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(m,{persistent:!1,children:[e.jsx(h,{children:e.jsx("div",{style:{backgroundColor:"lightblue",padding:"10px"},children:"Click me!"})}),e.jsx(g,{children:e.jsxs(d,{children:[e.jsx(S,{variant:"primary",icon:"checkmark",onClick:a(),resolver:N(E)}),e.jsx(S,{variant:"secondary",icon:"cross",onClick:a(),resolver:N(E)})]})})]})})},B={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(m,{persistent:!1,children:[e.jsx(h,{children:e.jsx("div",{style:{backgroundColor:"lightgreen",padding:"10px"},children:"Click me!"})}),e.jsxs(g,{children:[e.jsxs(d,{children:[e.jsx(l,{variant:"primary",onClick:a(),children:"Accept"}),e.jsx(l,{variant:"secondary",onClick:a(),children:"Reject"})]}),e.jsxs(d,{children:[e.jsx(l,{variant:"outlined",onClick:a(),children:"Edit"}),e.jsx(l,{variant:"naked",onClick:a(),children:"Comment"})]}),e.jsxs(d,{children:[e.jsx(l,{variant:"primary",onClick:a(),children:"Share"}),e.jsx(l,{variant:"secondary",onClick:a(),children:"More"})]})]})]})})},R={render:()=>e.jsx("div",{className:"tox",style:{position:"relative"},children:e.jsxs(m,{persistent:!1,children:[e.jsx(h,{children:e.jsx("div",{style:{backgroundColor:"lightyellow",padding:"10px"},children:"Click me!"})}),e.jsxs(g,{children:[e.jsxs(d,{children:[e.jsx(S,{icon:"arrow-up",onClick:a(),resolver:N(E)}),e.jsx("span",{style:{padding:"8px",fontSize:"12px",flexShrink:0,whiteSpace:"nowrap"},children:"1/3"}),e.jsx(S,{icon:"arrow-down",onClick:a(),resolver:N(E)})]}),e.jsxs(d,{children:[e.jsx(l,{variant:"primary",onClick:a(),children:"Accept"}),e.jsx(l,{variant:"secondary",onClick:a(),children:"Reject"})]})]})]})})},_={parameters:{docs:{description:{story:"Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions."}}},render:()=>{const o=i.useMemo(()=>[{id:"top-left",label:"Top Left",style:{top:"20px",left:"20px"}},{id:"top-center",label:"Top Center",style:{top:"20px",left:"50%",marginLeft:"calc(-1 * (6ch + 24px) / 2)"}},{id:"top-right",label:"Top Right",style:{top:"20px",right:"20px"}},{id:"middle-left",label:"Middle Left",style:{top:"50%",left:"20px",marginTop:"calc(-1em / 2)"}},{id:"center",label:"Center",style:{top:"50%",left:"50%",marginTop:"calc(-1em / 2)",marginLeft:"calc(-1 * (4ch + 24px) / 2)"}},{id:"middle-right",label:"Middle Right",style:{top:"50%",right:"20px",marginTop:"calc(-1em / 2)"}},{id:"bottom-left",label:"Bottom Left",style:{bottom:"20px",left:"20px"}},{id:"bottom-center",label:"Bottom Center",style:{bottom:"20px",left:"50%",marginLeft:"calc(-1 * (9ch + 24px) / 2)"}},{id:"bottom-right",label:"Bottom Right",style:{bottom:"20px",right:"20px"}}],[]);return e.jsx("div",{className:"tox context-toolbar-anchors",style:{width:"520px"},children:e.jsx("div",{className:"tox",style:{position:"relative",height:"360px",border:"1px solid #c6cdd6",borderRadius:"16px",background:"#ffffff",overflow:"hidden"},children:o.map(t=>e.jsxs(m,{persistent:!1,children:[e.jsx(h,{children:e.jsx("div",{style:{position:"absolute",display:"inline-flex",...t.style},children:e.jsx(l,{children:t.label})})}),e.jsx(g,{children:e.jsxs(d,{children:[e.jsx(l,{onClick:a(),children:"Accept"}),e.jsx(l,{onClick:a(),children:"Reject"})]})})]},t.id))})})}};var P,D,O;k.parameters={...k.parameters,docs:{...(P=k.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(O=(D=k.parameters)==null?void 0:D.docs)==null?void 0:O.source}}};var q,U,F;w.parameters={...w.parameters,docs:{...(q=w.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(F=(U=w.parameters)==null?void 0:U.docs)==null?void 0:F.source}}};var H,V,K;j.parameters={...j.parameters,docs:{...(H=j.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(K=(V=j.parameters)==null?void 0:V.docs)==null?void 0:K.source}}};var W,$,z;B.parameters={...B.parameters,docs:{...(W=B.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(z=($=B.parameters)==null?void 0:$.docs)==null?void 0:z.source}}};var Y,Z,J;R.parameters={...R.parameters,docs:{...(Y=R.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(J=(Z=R.parameters)==null?void 0:Z.docs)==null?void 0:J.source}}};var Q,X,ee;_.parameters={..._.parameters,docs:{...(Q=_.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(ee=(X=_.parameters)==null?void 0:X.docs)==null?void 0:ee.source}}};const _e=["Basic","Persistent","WithIconButtons","ManyButtons","MixedContent","Corners"];export{k as Basic,_ as Corners,B as ManyButtons,R as MixedContent,w as Persistent,j as WithIconButtons,_e as __namedExportsOrder,Re as default};
