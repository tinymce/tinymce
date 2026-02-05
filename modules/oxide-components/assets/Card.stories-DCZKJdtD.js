import{r as s,j as e}from"./iframe-BbfrR8Gr.js";import{g as he}from"./icons-BBMSdiSt.js";import{B as u}from"./Button-BWf5_q07.js";import{b as oe,e as g}from"./Bem-C5idDC5H.js";import{O as me,i as q}from"./Optional-CilDcsXt.js";import{r as xe}from"./Strings-CdlRWgOi.js";import{E as ge}from"./ExpandableBox-C3sA2iiN.js";import{I as p}from"./Universe-_KS2wzqW.js";import{U as ye}from"./UniverseProvider-BjpLNJMs.js";import{g as Ce}from"./Obj-ycCTN9Ns.js";import{c as fe}from"./KeyboardNavigationHooks-BzoSmtNM.js";import"./Fun--VEwoXIw.js";const re=s.createContext(null),ie=s.createContext(null),be=()=>s.useContext(re),de=()=>s.useContext(ie),k=({children:t,focusedIndex:n,onFocusedIndexChange:r,selectedIndex:l,onSelectCard:a})=>{const c=s.useMemo(()=>({focusedIndex:n,selectedIndex:l,onFocusedIndexChange:r,onSelectCard:a}),[n,l,r,a]);return e.jsx(ie.Provider,{value:c,children:t})},le=({children:t,className:n,ariaLabel:r,cycles:l,focusedIndex:a,selectedIndex:c,setFocusedIndex:o,onSelectCard:i})=>{const d=s.useRef(null),v=s.useMemo(()=>({focusedIndex:a,selectedIndex:c,setFocusedIndex:o,onSelectCard:i}),[a,c,o,i]);fe({containerRef:d,selector:".tox-card",allowVertical:!0,allowHorizontal:!1,cycles:l,closest:!1,execute:S=>(S.dom.click(),me.some(!0))});const w=oe("tox-card-list")+(q(n)?` ${n}`:"");return e.jsx(re.Provider,{value:v,children:e.jsx("div",{ref:d,role:"listbox","aria-label":r??"Card list",className:w,children:t})})},ve=({children:t,className:n,ariaLabel:r,cycles:l=!1})=>{const a=de();if(a===null)throw new Error("CardList: Controlled mode requires CardListController wrapper");const c=s.useCallback(i=>{a.onFocusedIndexChange(i)},[a]),o=s.useCallback(i=>{var d;(d=a.onSelectCard)==null||d.call(a,i)},[a]);return e.jsx(le,{children:t,className:n,ariaLabel:r,cycles:l,focusedIndex:a.focusedIndex,selectedIndex:a.selectedIndex,setFocusedIndex:c,onSelectCard:o})},we=({children:t,className:n,ariaLabel:r,cycles:l=!1,defaultFocusedIndex:a=0,defaultSelectedIndex:c,onSelectCard:o})=>{const[i,d]=s.useState(a),[v,w]=s.useState(c),S=s.useCallback(I=>{o==null||o(I),w(I)},[o]);return e.jsx(le,{children:t,className:n,ariaLabel:r,cycles:l,focusedIndex:i,selectedIndex:v,setFocusedIndex:d,onSelectCard:S})},b=t=>de()!==null?e.jsx(ve,{...t}):e.jsx(we,{...t});try{k.displayName="CardListController",k.__docgenInfo={description:"",displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{b.displayName="CardList",b.__docgenInfo={description:"",displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}const Se=t=>xe(t,n=>e.jsx("div",{className:g("tox-skeleton","line"),style:{width:"100%"}},n)),h=({children:t,className:n,onSelect:r,selected:l=!1,ariaLabel:a,hasDecision:c=!1,index:o,loading:i=!1})=>{const d=be(),v=(d==null?void 0:d.focusedIndex)===o,w=(d==null?void 0:d.selectedIndex)===o,S=s.useCallback(C=>{var V;const f=C.target,F=C.currentTarget;f!==F&&(f.matches("button, a, input, textarea, select")||f.closest("button, a, input, textarea, select"))||(d&&o!==void 0&&((V=d.onSelectCard)==null||V.call(d,o),d.setFocusedIndex(o)),r==null||r())},[r,d,o]),I=s.useCallback(C=>{if(C.key!=="Enter"&&C.key!==" ")return;const f=C.target,F=C.currentTarget;f!==F&&(f.matches("button, a, input, textarea, select")||f.closest("button, a, input, textarea, select"))},[]),ce=s.useCallback(()=>{d&&o!==void 0&&d.setFocusedIndex(o)},[d,o]),ue=oe("tox-card",{selected:v||l,"has-decision":c})+(i?" tox-skeleton":"")+(q(n)?` ${n}`:""),pe=e.jsxs(e.Fragment,{children:[e.jsx("div",{className:g("tox-card","body"),children:Se(1)}),e.jsx("div",{className:g("tox-card","actions"),children:e.jsx("div",{className:g("tox-skeleton","line"),style:{width:"50%"}})})]});return e.jsx("div",{className:ue,onClick:i?void 0:S,onKeyDown:i?void 0:I,onFocus:i?void 0:ce,tabIndex:-1,role:"option","aria-label":a??`Card ${(o??0)+1}`,"aria-selected":w,"aria-busy":i,children:i?pe:t})},y=({children:t,title:n})=>e.jsx("div",{className:g("tox-card","header"),children:q(n)?n:t}),m=({children:t})=>e.jsx("div",{className:g("tox-card","body"),children:t}),x=({children:t,layout:n="flex-start"})=>e.jsx("div",{className:g("tox-card","actions",{"space-between":n==="space-between","flex-start":n==="flex-start"}),children:t}),P=({children:t,type:n})=>e.jsx("div",{className:g("tox-card","highlight",{added:n==="added",deleted:n==="deleted",modified:n==="modified"}),children:t});try{h.displayName="Root",h.__docgenInfo={description:"",displayName:"Root",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}},onSelect:{defaultValue:null,description:"",name:"onSelect",required:!1,type:{name:"(() => void)"}},selected:{defaultValue:{value:"false"},description:"",name:"selected",required:!1,type:{name:"boolean"}},ariaLabel:{defaultValue:null,description:"",name:"ariaLabel",required:!1,type:{name:"string"}},hasDecision:{defaultValue:{value:"false"},description:"",name:"hasDecision",required:!1,type:{name:"boolean"}},index:{defaultValue:null,description:`Index of this card within a CardList.
Required when used inside CardList for proper keyboard navigation.`,name:"index",required:!1,type:{name:"number"}},loading:{defaultValue:{value:"false"},description:`When true, displays skeleton loading state instead of children.
Disables interactions and shows aria-busy attribute.`,name:"loading",required:!1,type:{name:"boolean"}}}}}catch{}try{y.displayName="Header",y.__docgenInfo={description:"",displayName:"Header",props:{title:{defaultValue:null,description:"",name:"title",required:!1,type:{name:"string"}}}}}catch{}try{m.displayName="Body",m.__docgenInfo={description:"",displayName:"Body",props:{}}}catch{}try{x.displayName="Actions",x.__docgenInfo={description:"",displayName:"Actions",props:{layout:{defaultValue:{value:"flex-start"},description:"",name:"layout",required:!1,type:{name:"CardLayout"}}}}}catch{}try{P.displayName="Highlight",P.__docgenInfo={description:"",displayName:"Highlight",props:{type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"CardHighlightType"}}}}}catch{}try{CardList.displayName="CardList",CardList.__docgenInfo={description:"",displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{CardListController.displayName="CardListController",CardListController.__docgenInfo={description:"",displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}const j=he(),ke={checkmark:j.checkmark,close:j.close,"chevron-down":j["chevron-down"],"chevron-up":j["chevron-up"]},Ie={getIcon:t=>Ce(ke,t).getOr(`<svg id="${t}"></svg>`)},Ee={title:"components/Card",component:h,decorators:[t=>e.jsx(ye,{resources:Ie,children:e.jsx("div",{className:"tox",children:e.jsx(t,{})})})],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},render:()=>{const[t,n]=s.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(y,{children:"Review Suggestion"}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(x,{children:[e.jsxs(u,{variant:"outlined",children:[e.jsx(p,{icon:"close"}),"Skip"]}),e.jsxs(u,{variant:"outlined",children:[e.jsx(p,{icon:"checkmark"}),"Apply"]})]})]})})}},L={parameters:{docs:{description:{story:`
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        `}}},render:()=>{const[t,n]=s.useState(!1),[r,l]=s.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(y,{title:"Lengthy Review"}),e.jsx(m,{children:e.jsx(ge,{maxHeight:80,expanded:r,onToggle:()=>l(!r),children:e.jsx("p",{style:{margin:0},children:`Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance in ways no other club matches. The club has been home to football's greatest talents: Pelé called it his "second home," Maradona dazzled at Camp Nou, and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona's La Masia academy is football's most successful youth system, producing world-class talents like Xavi, Iniesta, Puyol, and countless others who embody the club's values.`})})}),e.jsxs(x,{children:[e.jsxs(u,{variant:"outlined",children:[e.jsx(p,{icon:"close"}),"Skip"]}),e.jsxs(u,{variant:"outlined",children:[e.jsx(p,{icon:"checkmark"}),"Apply"]})]})]})})}},_={parameters:{docs:{description:{story:`
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        `}}},render:()=>{const[t,n]=s.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(y,{children:"Review Suggestion"}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(x,{children:[e.jsxs(u,{variant:"outlined",children:[e.jsx(p,{icon:"close"}),"Skip"]}),e.jsxs(u,{variant:"outlined",children:[e.jsx(p,{icon:"checkmark"}),"Apply"]})]})]})})}},A={parameters:{docs:{description:{story:`
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        `}}},render:()=>{const[t,n]=s.useState(0),[r,l]=s.useState(void 0);return e.jsx("div",{style:{width:"316px"},children:e.jsx(k,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:r,onSelectCard:l,children:e.jsxs(b,{ariaLabel:"Review suggestions with different states",children:[e.jsxs(h,{index:0,children:[e.jsx(y,{children:"Review Suggestion"}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This card has no status yet."})}),e.jsxs(x,{children:[e.jsxs(u,{variant:"outlined",onClick:a=>a.stopPropagation(),children:[e.jsx(p,{icon:"close"}),"Skip"]}),e.jsxs(u,{variant:"outlined",onClick:a=>a.stopPropagation(),children:[e.jsx(p,{icon:"checkmark"}),"Apply"]})]})]}),e.jsxs(h,{index:1,hasDecision:!0,children:[e.jsx(y,{children:e.jsx("div",{className:g("tox-card","header-label"),children:"Applied"})}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been applied."})}),e.jsx(x,{children:e.jsxs(u,{variant:"outlined",onClick:a=>a.stopPropagation(),children:[e.jsx(p,{icon:"close"}),"Revert"]})})]}),e.jsxs(h,{index:2,hasDecision:!0,children:[e.jsx(y,{children:e.jsx("div",{className:g("tox-card","header-label"),children:"Skipped"})}),e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been skipped."})}),e.jsx(x,{children:e.jsxs(u,{variant:"outlined",onClick:a=>a.stopPropagation(),children:[e.jsx(p,{icon:"close"}),"Revert"]})})]})]})})})}},N={parameters:{docs:{description:{story:`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (316px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        `}}},render:()=>{const[t,n]=s.useState(0),[r,l]=s.useState(void 0),a=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px",maxHeight:"500px",overflowY:"auto",padding:"12px",backgroundColor:"#f5f5f5",borderRadius:"6px"},children:e.jsx(k,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:r,onSelectCard:l,children:e.jsx(b,{ariaLabel:"Review suggestions",children:a.map((c,o)=>e.jsxs(h,{index:o,children:[e.jsx(y,{title:c.title}),e.jsx(m,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:c.content})}),e.jsxs(x,{children:[e.jsxs(u,{variant:"outlined",onClick:i=>{i.stopPropagation(),l(void 0)},children:[e.jsx(p,{icon:"close"}),"Skip"]}),e.jsxs(u,{variant:"outlined",onClick:i=>{i.stopPropagation(),l(o)},children:[e.jsx(p,{icon:"checkmark"}),"Apply"]})]})]},c.id))})})})}},R={parameters:{docs:{description:{story:`
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
        `}}},render:()=>{const[t,n]=s.useState(0),[r,l]=s.useState(void 0),a=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px"},children:e.jsx(k,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:r,onSelectCard:l,children:e.jsx(b,{ariaLabel:"Review suggestions",cycles:!1,children:a.map((c,o)=>e.jsxs(h,{index:o,children:[e.jsx(y,{title:c.title}),e.jsx(m,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:c.content})}),e.jsxs(x,{children:[e.jsxs(u,{variant:"outlined",onClick:i=>{i.stopPropagation(),l(void 0)},children:[e.jsx(p,{icon:"close"}),"Skip"]}),e.jsxs(u,{variant:"outlined",onClick:i=>{i.stopPropagation(),l(o)},children:[e.jsx(p,{icon:"checkmark"}),"Apply"]})]})]},c.id))})})})}},T={parameters:{docs:{description:{story:`
**Skeleton Loading State with Transition**

Demonstrates the \`loading\` prop on Card.Root that internally handles skeleton state.
The card automatically transitions from skeleton to loaded content when \`loading\` changes from \`true\` to \`false\`.

This matches the Suggested Edits pattern where the card container remains the same but content switches between skeleton and loaded state.

**Try it:** The card shows skeleton for 2 seconds, then transitions to show the actual content.
        `}}},render:()=>{const[t,n]=s.useState(!0);return s.useEffect(()=>{const r=setTimeout(()=>n(!1),2e3);return()=>clearTimeout(r)},[]),e.jsx("div",{style:{width:"316px"},children:e.jsx(b,{children:e.jsxs(h,{loading:t,index:0,children:[e.jsx(m,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(x,{children:[e.jsxs(u,{variant:"outlined",children:[e.jsx(p,{icon:"close"}),"Skip"]}),e.jsxs(u,{variant:"outlined",children:[e.jsx(p,{icon:"checkmark"}),"Apply"]})]})]})})})}};var D,E,H;B.parameters={...B.parameters,docs:{...(D=B.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(H=(E=B.parameters)==null?void 0:E.docs)==null?void 0:H.source}}};var K,M,U;L.parameters={...L.parameters,docs:{...(K=L.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(U=(M=L.parameters)==null?void 0:M.docs)==null?void 0:U.source}}};var z,O,W;_.parameters={..._.parameters,docs:{...(z=_.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(W=(O=_.parameters)==null?void 0:O.docs)==null?void 0:W.source}}};var G,$,X;A.parameters={...A.parameters,docs:{...(G=A.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
}`,...(X=($=A.parameters)==null?void 0:$.docs)==null?void 0:X.source}}};var Y,J,Q;N.parameters={...N.parameters,docs:{...(Y=N.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(Q=(J=N.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var Z,ee,te;R.parameters={...R.parameters,docs:{...(Z=R.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(te=(ee=R.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ne,ae,se;T.parameters={...T.parameters,docs:{...(ne=T.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(se=(ae=T.parameters)==null?void 0:ae.docs)==null?void 0:se.source}}};const He=["Default","LongContent","WithActionButtons","CardStates","SidebarDensity","KeyboardNavigation","SkeletonLoading"];export{A as CardStates,B as Default,R as KeyboardNavigation,L as LongContent,N as SidebarDensity,T as SkeletonLoading,_ as WithActionButtons,He as __namedExportsOrder,Ee as default};
