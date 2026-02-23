import{r as o,j as e}from"./iframe-CD0Rh_Wl.js";import{g as W}from"./icons-A3JhSkeR.js";import{B as c}from"./Button-CCQZCkPP.js";import{b as P,e as C}from"./Bem-BaJhmSJn.js";import{O as G,i as V}from"./Optional-DbTLtGQT.js";import{r as $}from"./Strings-tLOZuS7x.js";import{E as X}from"./ExpandableBox-CBeOCsgM.js";import{I as u}from"./Icon-Cb__aWad.js";import{U as Y}from"./UniverseProvider-EFbEQh-O.js";import{g as J}from"./Obj-DUQpguIS.js";import{c as Q}from"./KeyboardNavigationHooks-CQCzucpF.js";import"./preload-helper-PPVm8Dsz.js";import"./Fun--VEwoXIw.js";const D=o.createContext(null),E=o.createContext(null),Z=()=>o.useContext(D),H=()=>o.useContext(E),k=({children:t,focusedIndex:n,onFocusedIndexChange:i,selectedIndex:d,onSelectCard:a})=>{const l=o.useMemo(()=>({focusedIndex:n,selectedIndex:d,onFocusedIndexChange:i,onSelectCard:a}),[n,d,i,a]);return e.jsx(E.Provider,{value:l,children:t})},K=({children:t,className:n,ariaLabel:i,cycles:d,focusedIndex:a,selectedIndex:l,setFocusedIndex:s,onSelectCard:r})=>{const p=o.useRef(null),v=o.useMemo(()=>({focusedIndex:a,selectedIndex:l,setFocusedIndex:s,onSelectCard:r}),[a,l,s,r]);Q({containerRef:p,selector:".tox-card",allowVertical:!0,allowHorizontal:!1,cycles:d,closest:!1,execute:S=>(S.dom.click(),G.some(!0))});const w=P("tox-card-list")+(V(n)?` ${n}`:"");return e.jsx(D.Provider,{value:v,children:e.jsx("div",{ref:p,role:"listbox","aria-label":i??"Card list",className:w,children:t})})},ee=({children:t,className:n,ariaLabel:i,cycles:d=!1})=>{const a=H();if(a===null)throw new Error("CardList: Controlled mode requires CardListController wrapper");const l=o.useCallback(r=>{a.onFocusedIndexChange(r)},[a]),s=o.useCallback(r=>{a.onSelectCard?.(r)},[a]);return e.jsx(K,{children:t,className:n,ariaLabel:i,cycles:d,focusedIndex:a.focusedIndex,selectedIndex:a.selectedIndex,setFocusedIndex:l,onSelectCard:s})},te=({children:t,className:n,ariaLabel:i,cycles:d=!1,defaultFocusedIndex:a=0,defaultSelectedIndex:l,onSelectCard:s})=>{const[r,p]=o.useState(a),[v,w]=o.useState(l),S=o.useCallback(I=>{s?.(I),w(I)},[s]);return e.jsx(K,{children:t,className:n,ariaLabel:i,cycles:d,focusedIndex:r,selectedIndex:v,setFocusedIndex:p,onSelectCard:S})},b=t=>H()!==null?e.jsx(ee,{...t}):e.jsx(te,{...t});try{k.displayName="CardListController",k.__docgenInfo={description:"",displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{b.displayName="CardList",b.__docgenInfo={description:"",displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}const ne=t=>$(t,n=>e.jsx("div",{className:C("tox-skeleton","line"),style:{width:"100%"}},n)),h=({children:t,className:n,onSelect:i,selected:d=!1,ariaLabel:a,hasDecision:l=!1,index:s,loading:r=!1})=>{const p=Z(),v=p?.focusedIndex===s,w=p?.selectedIndex===s,S=o.useCallback(y=>{const f=y.target,F=y.currentTarget;f!==F&&(f.matches("button, a, input, textarea, select")||f.closest("button, a, input, textarea, select"))||(p&&s!==void 0&&(p.onSelectCard?.(s),p.setFocusedIndex(s)),i?.())},[i,p,s]),I=o.useCallback(y=>{if(y.key!=="Enter"&&y.key!==" ")return;const f=y.target,F=y.currentTarget;f!==F&&(f.matches("button, a, input, textarea, select")||f.closest("button, a, input, textarea, select"))},[]),M=o.useCallback(()=>{p&&s!==void 0&&p.setFocusedIndex(s)},[p,s]),U=P("tox-card",{selected:v||d,"has-decision":l})+(r?" tox-skeleton":"")+(V(n)?` ${n}`:""),z=e.jsxs(e.Fragment,{children:[e.jsx("div",{className:C("tox-card","body"),children:ne(1)}),e.jsx("div",{className:C("tox-card","actions"),children:e.jsx("div",{className:C("tox-skeleton","line"),style:{width:"50%"}})})]});return e.jsx("div",{className:U,onClick:r?void 0:S,onKeyDown:r?void 0:I,onFocus:r?void 0:M,tabIndex:-1,role:"option","aria-label":a??`Card ${(s??0)+1}`,"aria-selected":w,"aria-busy":r,children:r?z:t})},g=({children:t,title:n})=>e.jsx("div",{className:C("tox-card","header"),children:V(n)?n:t}),m=({children:t})=>e.jsx("div",{className:C("tox-card","body"),children:t}),x=({children:t,layout:n="flex-start"})=>e.jsx("div",{className:C("tox-card","actions",{"space-between":n==="space-between","flex-start":n==="flex-start"}),children:t}),q=({children:t,type:n})=>e.jsx("div",{className:C("tox-card","highlight",{added:n==="added",deleted:n==="deleted",modified:n==="modified"}),children:t});try{h.displayName="Root",h.__docgenInfo={description:"",displayName:"Root",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}},onSelect:{defaultValue:null,description:"",name:"onSelect",required:!1,type:{name:"(() => void)"}},selected:{defaultValue:{value:"false"},description:"",name:"selected",required:!1,type:{name:"boolean"}},ariaLabel:{defaultValue:null,description:"",name:"ariaLabel",required:!1,type:{name:"string"}},hasDecision:{defaultValue:{value:"false"},description:"",name:"hasDecision",required:!1,type:{name:"boolean"}},index:{defaultValue:null,description:`Index of this card within a CardList.
Required when used inside CardList for proper keyboard navigation.`,name:"index",required:!1,type:{name:"number"}},loading:{defaultValue:{value:"false"},description:`When true, displays skeleton loading state instead of children.
Disables interactions and shows aria-busy attribute.`,name:"loading",required:!1,type:{name:"boolean"}}}}}catch{}try{g.displayName="Header",g.__docgenInfo={description:"",displayName:"Header",props:{title:{defaultValue:null,description:"",name:"title",required:!1,type:{name:"string"}}}}}catch{}try{m.displayName="Body",m.__docgenInfo={description:"",displayName:"Body",props:{}}}catch{}try{x.displayName="Actions",x.__docgenInfo={description:"",displayName:"Actions",props:{layout:{defaultValue:{value:"flex-start"},description:"",name:"layout",required:!1,type:{name:"CardLayout"}}}}}catch{}try{q.displayName="Highlight",q.__docgenInfo={description:"",displayName:"Highlight",props:{type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"CardHighlightType"}}}}}catch{}try{CardList.displayName="CardList",CardList.__docgenInfo={description:"",displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{CardListController.displayName="CardListController",CardListController.__docgenInfo={description:"",displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}const j=W(),ae={checkmark:j.checkmark,close:j.close,"chevron-down":j["chevron-down"],"chevron-up":j["chevron-up"]},oe={getIcon:t=>J(ae,t).getOr(`<svg id="${t}"></svg>`)},ye={title:"components/Card",component:h,decorators:[t=>e.jsx(Y,{resources:oe,children:e.jsx("div",{className:"tox",children:e.jsx(t,{})})})],parameters:{layout:"centered",docs:{description:{component:`
The Card component is a reusable compound component for displaying content with actions.

## Features
- **Compound Component Pattern**: Flexible composition with Root, Header, Body, and Actions
- **State Management**: Supports selected and resolution states (accepted/rejected)
- **Controlled Component**: Parent manages state via props
- **Accessibility**: Proper ARIA attributes and keyboard support

## Usage Pattern

The component uses a compound component pattern with four parts:
- \`Card.Root\`: Container managing state and click handlers
- \`Card.Header\`: Title/status section
- \`Card.Body\`: Main content area
- \`Card.Actions\`: Button container

## Integration

Works seamlessly with other oxide-components:
- **Button**: For action buttons (Skip, Apply, Revert)
- **ExpandableBox**: For long content
- **Icon**: For status indicators
        `}}},tags:["autodocs","skip-visual-testing"],args:{}},B={parameters:{docs:{description:{story:`
**Default Card**

A basic card with header, body content, and action buttons.
This demonstrates the minimal setup needed for a functional card.
Buttons use Secondary style with icons as specified, positioned on the left with 8px gap.

**Click the card** to see the selected state (2px blue border).

Spacing: 12px padding from card edge, 12px gap between sections.
        `}}},render:()=>{const[t,n]=o.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(g,{children:"Review Suggestion"}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(x,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},L={parameters:{docs:{description:{story:`
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        `}}},render:()=>{const[t,n]=o.useState(!1),[i,d]=o.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(g,{title:"Lengthy Review"}),e.jsx(m,{children:e.jsx(X,{maxHeight:80,expanded:i,onToggle:()=>d(!i),children:e.jsx("p",{style:{margin:0},children:`Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance in ways no other club matches. The club has been home to football's greatest talents: Pelé called it his "second home," Maradona dazzled at Camp Nou, and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona's La Masia academy is football's most successful youth system, producing world-class talents like Xavi, Iniesta, Puyol, and countless others who embody the club's values.`})})}),e.jsxs(x,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},_={parameters:{docs:{description:{story:`
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        `}}},render:()=>{const[t,n]=o.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(g,{children:"Review Suggestion"}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(x,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},A={parameters:{docs:{description:{story:`
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        `}}},render:()=>{const[t,n]=o.useState(0),[i,d]=o.useState(void 0);return e.jsx("div",{style:{width:"316px"},children:e.jsx(k,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:d,children:e.jsxs(b,{ariaLabel:"Review suggestions with different states",children:[e.jsxs(h,{index:0,children:[e.jsx(g,{children:"Review Suggestion"}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This card has no status yet."})}),e.jsxs(x,{children:[e.jsxs(c,{variant:"outlined",onClick:a=>a.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:a=>a.stopPropagation(),children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]}),e.jsxs(h,{index:1,hasDecision:!0,children:[e.jsx(g,{children:e.jsx("div",{className:C("tox-card","header-label"),children:"Applied"})}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been applied."})}),e.jsx(x,{children:e.jsxs(c,{variant:"outlined",onClick:a=>a.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Revert"]})})]}),e.jsxs(h,{index:2,hasDecision:!0,children:[e.jsx(g,{children:e.jsx("div",{className:C("tox-card","header-label"),children:"Skipped"})}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been skipped."})}),e.jsx(x,{children:e.jsxs(c,{variant:"outlined",onClick:a=>a.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Revert"]})})]})]})})})}},N={parameters:{docs:{description:{story:`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (316px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        `}}},render:()=>{const[t,n]=o.useState(0),[i,d]=o.useState(void 0),a=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px",maxHeight:"500px",overflowY:"auto",padding:"12px",backgroundColor:"#f5f5f5",borderRadius:"6px"},children:e.jsx(k,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:d,children:e.jsx(b,{ariaLabel:"Review suggestions",children:a.map((l,s)=>e.jsxs(h,{index:s,children:[e.jsx(g,{title:l.title}),e.jsx(m,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:l.content})}),e.jsxs(x,{children:[e.jsxs(c,{variant:"outlined",onClick:r=>{r.stopPropagation(),d(void 0)},children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:r=>{r.stopPropagation(),d(s)},children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]},l.id))})})})}},R={parameters:{docs:{description:{story:`
**Keyboard Navigation with CardList**

Demonstrates the CardList component with full keyboard navigation support:
- **Arrow Keys**: Navigate between cards (Up/Down)
- **Enter/Space**: Select the focused card
- **Tab**: Move focus in/out of the list
- **Roving Tabindex**: Only the focused card is in tab order

This follows WCAG accessibility guidelines and the listbox pattern.

**Try it:**
1. Tab to focus the first card
2. Use arrow keys to navigate
3. Press Enter/Space to select
        `}}},render:()=>{const[t,n]=o.useState(0),[i,d]=o.useState(void 0),a=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px"},children:e.jsx(k,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:d,children:e.jsx(b,{ariaLabel:"Review suggestions",cycles:!1,children:a.map((l,s)=>e.jsxs(h,{index:s,children:[e.jsx(g,{title:l.title}),e.jsx(m,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:l.content})}),e.jsxs(x,{children:[e.jsxs(c,{variant:"outlined",onClick:r=>{r.stopPropagation(),d(void 0)},children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:r=>{r.stopPropagation(),d(s)},children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]},l.id))})})})}},T={parameters:{docs:{description:{story:`
**Skeleton Loading State with Transition**

Demonstrates the \`loading\` prop on Card.Root that internally handles skeleton state.
The card automatically transitions from skeleton to loaded content when \`loading\` changes from \`true\` to \`false\`.

This matches the Suggested Edits pattern where the card container remains the same but content switches between skeleton and loaded state.

**Try it:** The card shows skeleton for 2 seconds, then transitions to show the actual content.
        `}}},render:()=>{const[t,n]=o.useState(!0);return o.useEffect(()=>{const i=setTimeout(()=>n(!1),2e3);return()=>clearTimeout(i)},[]),e.jsx("div",{style:{width:"316px"},children:e.jsx(b,{children:e.jsxs(h,{loading:t,index:0,children:[e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(x,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})})}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Default Card**

A basic card with header, body content, and action buttons.
This demonstrates the minimal setup needed for a functional card.
Buttons use Secondary style with icons as specified, positioned on the left with 8px gap.

**Click the card** to see the selected state (2px blue border).

Spacing: 12px padding from card edge, 12px gap between sections.
        \`
      }
    }
  },
  render: () => {
    const [selected, setSelected] = useState(false);
    return <div style={{
      width: '316px'
    }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header>
            Review Suggestion
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>Barcelona is football&apos;s most exceptional institution club, combining sporting excellence with cultural significance.</p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">
              <Icon icon="close" />
              Skip
            </Button>
            <Button variant="outlined">
              <Icon icon="checkmark" />
              Apply
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>;
  }
}`,...B.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        \`
      }
    }
  },
  render: () => {
    const [selected, setSelected] = useState(false);
    const [expanded, setExpanded] = useState(false);
    return <div style={{
      width: '316px'
    }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header title="Lengthy Review" />
          <Card.Body>
            <ExpandableBox maxHeight={80} expanded={expanded} onToggle={() => setExpanded(!expanded)}>
              <p style={{
              margin: 0
            }}>
                Barcelona is football&apos;s most exceptional institution club, combining sporting excellence
                with cultural significance in ways no other club matches. The club has been home to
                football&apos;s greatest talents: Pelé called it his &quot;second home,&quot; Maradona dazzled at Camp Nou,
                and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona&apos;s La Masia
                academy is football&apos;s most successful youth system, producing world-class talents like Xavi,
                Iniesta, Puyol, and countless others who embody the club&apos;s values.
              </p>
            </ExpandableBox>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">
              <Icon icon="close" />
              Skip
            </Button>
            <Button variant="outlined">
              <Icon icon="checkmark" />
              Apply
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>;
  }
}`,...L.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        \`
      }
    }
  },
  render: () => {
    const [selected, setSelected] = useState(false);
    return <div style={{
      width: '316px'
    }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header>
            Review Suggestion
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>
              Barcelona is football&apos;s most exceptional institution club, combining sporting excellence with cultural significance.
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">
              <Icon icon="close" />
              Skip
            </Button>
            <Button variant="outlined">
              <Icon icon="checkmark" />
              Apply
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>;
  }
}`,..._.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        \`
      }
    }
  },
  render: () => {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
    return <div style={{
      width: '316px'
    }}>
        <Card.CardListController focusedIndex={focusedIndex} onFocusedIndexChange={setFocusedIndex} selectedIndex={selectedIndex} onSelectCard={setSelectedIndex}>
          <Card.CardList ariaLabel="Review suggestions with different states">
            <Card.Root index={0}>
              <Card.Header>
                Review Suggestion
              </Card.Header>
              <Card.Body>
                <p style={{
                margin: 0
              }}>This card has no status yet.</p>
              </Card.Body>
              <Card.Actions>
                <Button variant="outlined" onClick={e => e.stopPropagation()}>
                  <Icon icon="close" />
                  Skip
                </Button>
                <Button variant="outlined" onClick={e => e.stopPropagation()}>
                  <Icon icon="checkmark" />
                  Apply
                </Button>
              </Card.Actions>
            </Card.Root>

            <Card.Root index={1} hasDecision={true}>
              <Card.Header>
                <div className={Bem.element('tox-card', 'header-label')}>Applied</div>
              </Card.Header>
              <Card.Body>
                <p style={{
                margin: 0
              }}>This suggestion has been applied.</p>
              </Card.Body>
              <Card.Actions>
                <Button variant="outlined" onClick={e => e.stopPropagation()}>
                  <Icon icon="close" />
                  Revert
                </Button>
              </Card.Actions>
            </Card.Root>

            <Card.Root index={2} hasDecision={true}>
              <Card.Header>
                <div className={Bem.element('tox-card', 'header-label')}>Skipped</div>
              </Card.Header>
              <Card.Body>
                <p style={{
                margin: 0
              }}>This suggestion has been skipped.</p>
              </Card.Body>
              <Card.Actions>
                <Button variant="outlined" onClick={e => e.stopPropagation()}>
                  <Icon icon="close" />
                  Revert
                </Button>
              </Card.Actions>
            </Card.Root>
          </Card.CardList>
        </Card.CardListController>
      </div>;
  }
}`,...A.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (316px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        \`
      }
    }
  },
  render: () => {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
    const reviews = [{
      id: 1,
      title: 'Grammar Fix',
      content: 'Change "institution club" to "club institution"'
    }, {
      id: 2,
      title: 'Spelling Correction',
      content: 'Correct "tiki-taka" spelling'
    }, {
      id: 3,
      title: 'Clarity Improvement',
      content: 'Simplify complex sentence structure'
    }, {
      id: 4,
      title: 'Style Enhancement',
      content: 'Add transition words for better flow'
    }, {
      id: 5,
      title: 'Fact Check',
      content: 'Verify the 2008-2012 era claim'
    }];
    return <div style={{
      width: '316px',
      maxHeight: '500px',
      overflowY: 'auto',
      padding: '12px',
      backgroundColor: '#f5f5f5',
      borderRadius: '6px'
    }}>
        <Card.CardListController focusedIndex={focusedIndex} onFocusedIndexChange={setFocusedIndex} selectedIndex={selectedIndex} onSelectCard={setSelectedIndex}>
          <Card.CardList ariaLabel="Review suggestions">
            {reviews.map((review, index) => <Card.Root key={review.id} index={index}>
                <Card.Header title={review.title} />
                <Card.Body>
                  <p style={{
                margin: 0,
                fontSize: '14px'
              }}>{review.content}</p>
                </Card.Body>
                <Card.Actions>
                  <Button variant="outlined" onClick={e => {
                e.stopPropagation();
                setSelectedIndex(undefined);
              }}>
                    <Icon icon="close" />
                    Skip
                  </Button>
                  <Button variant="outlined" onClick={e => {
                e.stopPropagation();
                setSelectedIndex(index);
              }}>
                    <Icon icon="checkmark" />
                    Apply
                  </Button>
                </Card.Actions>
              </Card.Root>)}
          </Card.CardList>
        </Card.CardListController>
      </div>;
  }
}`,...N.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Keyboard Navigation with CardList**

Demonstrates the CardList component with full keyboard navigation support:
- **Arrow Keys**: Navigate between cards (Up/Down)
- **Enter/Space**: Select the focused card
- **Tab**: Move focus in/out of the list
- **Roving Tabindex**: Only the focused card is in tab order

This follows WCAG accessibility guidelines and the listbox pattern.

**Try it:**
1. Tab to focus the first card
2. Use arrow keys to navigate
3. Press Enter/Space to select
        \`
      }
    }
  },
  render: () => {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
    const reviews = [{
      id: 1,
      title: 'Grammar Fix',
      content: 'Change "institution club" to "club institution"'
    }, {
      id: 2,
      title: 'Spelling Correction',
      content: 'Correct "tiki-taka" spelling'
    }, {
      id: 3,
      title: 'Clarity Improvement',
      content: 'Simplify complex sentence structure'
    }, {
      id: 4,
      title: 'Style Enhancement',
      content: 'Add transition words for better flow'
    }, {
      id: 5,
      title: 'Fact Check',
      content: 'Verify the 2008-2012 era claim'
    }];
    return <div style={{
      width: '316px'
    }}>
        <Card.CardListController focusedIndex={focusedIndex} onFocusedIndexChange={setFocusedIndex} selectedIndex={selectedIndex} onSelectCard={setSelectedIndex}>
          <Card.CardList ariaLabel="Review suggestions" cycles={false}>
            {reviews.map((review, index) => <Card.Root key={review.id} index={index}>
                <Card.Header title={review.title} />
                <Card.Body>
                  <p style={{
                margin: 0,
                fontSize: '14px'
              }}>{review.content}</p>
                </Card.Body>
                <Card.Actions>
                  <Button variant="outlined" onClick={e => {
                e.stopPropagation();
                setSelectedIndex(undefined);
              }}>
                    <Icon icon="close" />
                    Skip
                  </Button>
                  <Button variant="outlined" onClick={e => {
                e.stopPropagation();
                setSelectedIndex(index);
              }}>
                    <Icon icon="checkmark" />
                    Apply
                  </Button>
                </Card.Actions>
              </Card.Root>)}
          </Card.CardList>
        </Card.CardListController>
      </div>;
  }
}`,...R.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Skeleton Loading State with Transition**

Demonstrates the \\\`loading\\\` prop on Card.Root that internally handles skeleton state.
The card automatically transitions from skeleton to loaded content when \\\`loading\\\` changes from \\\`true\\\` to \\\`false\\\`.

This matches the Suggested Edits pattern where the card container remains the same but content switches between skeleton and loaded state.

**Try it:** The card shows skeleton for 2 seconds, then transitions to show the actual content.
        \`
      }
    }
  },
  render: () => {
    const [loading, setLoading] = useState(true);

    // Simulate data loading
    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);
    return <div style={{
      width: '316px'
    }}>
        <Card.CardList>
          <Card.Root loading={loading} index={0}>
            <Card.Body>
              <p style={{
              margin: 0
            }}>
                Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance.
              </p>
            </Card.Body>
            <Card.Actions>
              <Button variant="outlined">
                <Icon icon="close" />
                Skip
              </Button>
              <Button variant="outlined">
                <Icon icon="checkmark" />
                Apply
              </Button>
            </Card.Actions>
          </Card.Root>
        </Card.CardList>
      </div>;
  }
}`,...T.parameters?.docs?.source}}};const fe=["Default","LongContent","WithActionButtons","CardStates","SidebarDensity","KeyboardNavigation","SkeletonLoading"];export{A as CardStates,B as Default,R as KeyboardNavigation,L as LongContent,N as SidebarDensity,T as SkeletonLoading,_ as WithActionButtons,fe as __namedExportsOrder,ye as default};
