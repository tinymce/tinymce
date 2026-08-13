import{r as a,j as e}from"./iframe-BD9TEMTg.js";import{g as G}from"./icons-CeCQNAbo.js";import{B as r}from"./Button-Baz0IJt0.js";import{C as J,u as D,d as W,a as h,H as x,c as p,A as m,e as N,R as V,I as _,B as q,b as U,S as K,f as E}from"./Profile-jLTPMY8G.js";import{E as $}from"./ExpandableBox-CggkvLHu.js";import{I as l}from"./Icon-BEdo81QP.js";import{I as C}from"./IconButton-DdtayvKP.js";import{U as Q}from"./UniverseProvider-dTmjFr1-.js";import{b as X,e as F}from"./Bem-Bvj_EqVZ.js";import{O as Y,i as Z}from"./Optional-BNsUfA-0.js";import{b as ee}from"./KeyboardNavigationHooks-Ciz7YXgG.js";import{g as te}from"./Obj-SoxFuRAr.js";import"./preload-helper-PPVm8Dsz.js";import"./Strings-C1h4ndsz.js";import"./Fun-DfA6N4bS.js";import"./SugarElement-HgeWKcVW.js";import"./PredicateFind-DCGfX9bu.js";import"./Num-xrWELwUY.js";import"./Visibility-HiPE8kkv.js";const f=({children:t,focusedIndex:n,onFocusedIndexChange:i,selectedIndex:s,onSelectCard:o})=>{const d=a.useMemo(()=>({focusedIndex:n,selectedIndex:s,onFocusedIndexChange:i,onSelectCard:o}),[n,s,i,o]);return e.jsx(J.Provider,{value:d,children:t})},O=({children:t,className:n,ariaLabel:i,cycles:s,focusedIndex:o,selectedIndex:d,setFocusedIndex:u,onSelectCard:c})=>{const g=a.useRef(null);a.useEffect(()=>{g.current?.querySelectorAll(".tox-card")[o]?.scrollIntoView({block:"nearest",behavior:"smooth"})},[o]);const L=a.useMemo(()=>({focusedIndex:o,selectedIndex:d,setFocusedIndex:u,onSelectCard:c}),[o,d,u,c]);ee({containerRef:g,selector:".tox-card",allowVertical:!0,allowHorizontal:!1,cycles:s,closest:!1,execute:b=>(b.dom.click(),Y.some(!0))});const T=X("tox-card-list")+(Z(n)?` ${n}`:"");return e.jsx(W.Provider,{value:L,children:e.jsx("div",{ref:g,role:"listbox","aria-label":i??"Card list",className:T,children:t})})},ne=({children:t,className:n,ariaLabel:i,cycles:s=!1})=>{const o=D();if(o===null)throw new Error("CardList: Controlled mode requires CardListController wrapper");const d=a.useCallback(c=>{o.onFocusedIndexChange(c)},[o]),u=a.useCallback(c=>{o.onSelectCard?.(c)},[o]);return e.jsx(O,{children:t,className:n,ariaLabel:i,cycles:s,focusedIndex:o.focusedIndex,selectedIndex:o.selectedIndex,setFocusedIndex:d,onSelectCard:u})},oe=({children:t,className:n,ariaLabel:i,cycles:s=!1,defaultFocusedIndex:o=0,defaultSelectedIndex:d,onSelectCard:u})=>{const[c,g]=a.useState(o),[L,T]=a.useState(d),b=a.useCallback(M=>{u?.(M),T(M)},[u]);return e.jsx(O,{children:t,className:n,ariaLabel:i,cycles:s,focusedIndex:c,selectedIndex:L,setFocusedIndex:g,onSelectCard:b})},y=t=>D()!==null?e.jsx(ne,{...t}):e.jsx(oe,{...t});try{f.displayName="CardListController",f.__docgenInfo={description:"",displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{y.displayName="CardList",y.__docgenInfo={description:"",displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}const v=G(),ae={checkmark:v.checkmark,close:v.close,"chevron-down":v["chevron-down"],"chevron-up":v["chevron-up"]},se={getIcon:t=>te(ae,t).getOr(`<svg id="${t}"></svg>`)},z='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%234A90E2"/%3E%3Ctext x="18" y="24" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif"%3EJM%3C/text%3E%3C/svg%3E',je={title:"components/Card",component:h,decorators:[t=>e.jsx(Q,{resources:se,children:e.jsx("div",{className:"tox",children:e.jsx(t,{})})})],parameters:{layout:"centered",docs:{description:{component:`
The Card component is a reusable compound component for displaying content with actions.

## Features
- **Compound Component Pattern**: Flexible composition with Root, Header, HeaderContent, HeaderActions, Body, and Actions
- **State Management**: Supports selected and resolution states (accepted/rejected)
- **Controlled Component**: Parent manages state via props
- **Accessibility**: Proper ARIA attributes and keyboard support

## Usage Pattern

The component uses a compound component pattern with these parts:
- \`Card.Root\`: Container managing state and click handlers
- \`Card.Header\`: Title/status section
- \`Card.HeaderContent\`: Left-side header content (e.g. Profile). When present, header uses a row layout.
- \`Card.HeaderActions\`: Right-side header action buttons with visibility modes (\`hover\` default, \`focus\`, \`always\`)
- \`Card.Body\`: Main content area
- \`Card.Actions\`: Bottom button container

## Integration

Works seamlessly with other oxide-components:
- **Button** / **IconButton**: For action buttons
- **Profile**: For user info in HeaderContent
- **ExpandableBox**: For long content
- **Icon**: For status indicators
        `}}},tags:["autodocs"],args:{}},w={parameters:{docs:{description:{story:`
**Default Card**

A basic card with header, body content, and action buttons.
This demonstrates the minimal setup needed for a functional card.
Buttons use Secondary style with icons as specified, positioned on the left with 8px gap.

**Click the card** to see the selected state (2px blue border).

Spacing: 12px padding from card edge, 12px gap between sections.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(x,{children:"Review Suggestion"}),e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(m,{children:[e.jsxs(r,{variant:"outlined",children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(r,{variant:"outlined",children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]})})}},S={parameters:{docs:{description:{story:`
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        `}}},render:()=>{const[t,n]=a.useState(!1),[i,s]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(x,{title:"Lengthy Review"}),e.jsx(p,{children:e.jsx($,{maxHeight:80,expanded:i,onToggle:()=>s(!i),children:e.jsx("p",{style:{margin:0},children:`Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance in ways no other club matches. The club has been home to football's greatest talents: Pelé called it his "second home," Maradona dazzled at Camp Nou, and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona's La Masia academy is football's most successful youth system, producing world-class talents like Xavi, Iniesta, Puyol, and countless others who embody the club's values.`})})}),e.jsxs(m,{children:[e.jsxs(r,{variant:"outlined",children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(r,{variant:"outlined",children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]})})}},k={parameters:{docs:{description:{story:`
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(x,{children:"Review Suggestion"}),e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(m,{children:[e.jsxs(r,{variant:"outlined",children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(r,{variant:"outlined",children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]})})}},j={parameters:{docs:{description:{story:`
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        `}}},render:()=>{const[t,n]=a.useState(0),[i,s]=a.useState(void 0);return e.jsx("div",{style:{width:"316px"},children:e.jsx(f,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:s,children:e.jsxs(y,{ariaLabel:"Review suggestions with different states",children:[e.jsxs(h,{index:0,children:[e.jsx(x,{children:"Review Suggestion"}),e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"This card has no status yet."})}),e.jsxs(m,{children:[e.jsxs(r,{variant:"outlined",onClick:o=>o.stopPropagation(),children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(r,{variant:"outlined",onClick:o=>o.stopPropagation(),children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]}),e.jsxs(h,{index:1,hasDecision:!0,children:[e.jsx(x,{children:e.jsx("div",{className:F("tox-card","header-label"),children:"Applied"})}),e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been applied."})}),e.jsx(m,{children:e.jsxs(r,{variant:"outlined",onClick:o=>o.stopPropagation(),children:[e.jsx(l,{icon:"close"}),"Revert"]})})]}),e.jsxs(h,{index:2,hasDecision:!0,children:[e.jsx(x,{children:e.jsx("div",{className:F("tox-card","header-label"),children:"Skipped"})}),e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been skipped."})}),e.jsx(m,{children:e.jsxs(r,{variant:"outlined",onClick:o=>o.stopPropagation(),children:[e.jsx(l,{icon:"close"}),"Revert"]})})]})]})})})}},A={parameters:{docs:{description:{story:`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (440px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        `}}},render:()=>{const[t,n]=a.useState(0),[i,s]=a.useState(void 0),o=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"440px",maxHeight:"500px",overflowY:"auto",padding:"12px",backgroundColor:"#f5f5f5",borderRadius:"6px"},children:e.jsx(f,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:s,children:e.jsx(y,{ariaLabel:"Review suggestions",children:o.map((d,u)=>e.jsxs(h,{index:u,children:[e.jsx(x,{title:d.title}),e.jsx(p,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:d.content})}),e.jsxs(m,{children:[e.jsxs(r,{variant:"outlined",onClick:c=>{c.stopPropagation(),s(void 0)},children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(r,{variant:"outlined",onClick:c=>{c.stopPropagation(),s(u)},children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]},d.id))})})})}},I={parameters:{docs:{description:{story:`
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
        `}}},render:()=>{const[t,n]=a.useState(0),[i,s]=a.useState(void 0),o=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px"},children:e.jsx(f,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:s,children:e.jsx(y,{ariaLabel:"Review suggestions",cycles:!1,children:o.map((d,u)=>e.jsxs(h,{index:u,children:[e.jsx(x,{title:d.title}),e.jsx(p,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:d.content})}),e.jsxs(m,{children:[e.jsxs(r,{variant:"outlined",onClick:c=>{c.stopPropagation(),s(void 0)},children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(r,{variant:"outlined",onClick:c=>{c.stopPropagation(),s(u)},children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]},d.id))})})})}},B={parameters:{docs:{description:{story:`
**Skeleton Loading State with Transition**

Demonstrates the \`loading\` prop on Card.Root that internally handles skeleton state.
The card automatically transitions from skeleton to loaded content when \`loading\` changes from \`true\` to \`false\`.

This matches the Suggested Edits pattern where the card container remains the same but content switches between skeleton and loaded state.

**Try it:** The card shows skeleton for 2 seconds, then transitions to show the actual content.
        `}}},render:()=>{const[t,n]=a.useState(!0);return a.useEffect(()=>{const i=setTimeout(()=>n(!1),2e3);return()=>clearTimeout(i)},[]),e.jsx("div",{style:{width:"316px"},children:e.jsx(y,{children:e.jsxs(h,{loading:t,index:0,children:[e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(m,{children:[e.jsxs(r,{variant:"outlined",children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(r,{variant:"outlined",children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]})})})}},H={parameters:{docs:{description:{story:`
**Card with Header Actions and Profile**

Demonstrates the new unified card design with:
- \`Card.HeaderContent\`: Left-side content (Profile component with avatar, name, timestamp)
- \`Card.HeaderActions\`: Right-side action buttons with hover visibility
- Action buttons appear on hover/focus by default (\`visibilityMode="hover"\`)

This pattern is used across TinyMCE AI and Suggested Edits for a consistent user experience.

**Try it:** Hover over the card to see the header action buttons appear.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsxs(x,{children:[e.jsx(N,{children:e.jsxs(V,{children:[e.jsx(_,{src:z,alt:"John Mac Giolla..."}),e.jsxs(q,{children:[e.jsx(U,{children:"John Mac Giolla..."}),e.jsx(K,{children:"May 18, 9:12 AM"})]})]})}),e.jsxs(E,{visibilityMode:"hover",children:[e.jsx(C,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(C,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"Modified text"})}),e.jsx(m,{children:e.jsx(r,{variant:"outlined",className:"tox-button--stretch",children:"Provide feedback"})})]})})}},R={parameters:{docs:{description:{story:`
**Card with Always Visible Header Actions**

Same as the previous story, but with \`visibilityMode="always"\` on HeaderActions.
The action buttons remain visible at all times instead of only on hover.

This is useful when action visibility is important for discoverability.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsxs(x,{children:[e.jsx(N,{children:e.jsxs(V,{children:[e.jsx(_,{src:z,alt:"Jane Smith"}),e.jsxs(q,{children:[e.jsx(U,{children:"Jane Smith"}),e.jsx(K,{children:"May 19, 2:45 PM"})]})]})}),e.jsxs(E,{visibilityMode:"always",children:[e.jsx(C,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(C,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"Added new content"})}),e.jsx(m,{children:e.jsx(r,{variant:"outlined",className:"tox-button--stretch",children:"Provide feedback"})})]})})}},P={parameters:{docs:{description:{story:`
**Card with Header Actions Only**

Demonstrates the edge case where \`Card.HeaderActions\` is used without \`Card.HeaderContent\`.
The actions are automatically aligned to the right side of the header.

This is useful for simple cards that only need action buttons without user info or labels.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(x,{children:e.jsxs(E,{visibilityMode:"always",children:[e.jsx(C,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(C,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})}),e.jsx(p,{children:e.jsx("p",{style:{margin:0},children:"Quick action card without header content"})}),e.jsx(m,{children:e.jsx(r,{variant:"outlined",className:"tox-button--stretch",children:"More options"})})]})})}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (440px width) to demonstrate:
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
      width: '440px',
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
}`,...A.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card with Header Actions and Profile**

Demonstrates the new unified card design with:
- \\\`Card.HeaderContent\\\`: Left-side content (Profile component with avatar, name, timestamp)
- \\\`Card.HeaderActions\\\`: Right-side action buttons with hover visibility
- Action buttons appear on hover/focus by default (\\\`visibilityMode="hover"\\\`)

This pattern is used across TinyMCE AI and Suggested Edits for a consistent user experience.

**Try it:** Hover over the card to see the header action buttons appear.
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
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="John Mac Giolla..." />
                <Profile.Body>
                  <Profile.Heading>John Mac Giolla...</Profile.Heading>
                  <Profile.Subheading>May 18, 9:12 AM</Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
            <Card.HeaderActions visibilityMode="hover">
              <IconButton variant="naked" icon="close" aria-label="Reject" />
              <IconButton variant="naked" icon="checkmark" aria-label="Accept" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>
              Modified text
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined" className="tox-button--stretch">
              Provide feedback
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>;
  }
}`,...H.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card with Always Visible Header Actions**

Same as the previous story, but with \\\`visibilityMode="always"\\\` on HeaderActions.
The action buttons remain visible at all times instead of only on hover.

This is useful when action visibility is important for discoverability.
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
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="Jane Smith" />
                <Profile.Body>
                  <Profile.Heading>Jane Smith</Profile.Heading>
                  <Profile.Subheading>May 19, 2:45 PM</Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
            <Card.HeaderActions visibilityMode="always">
              <IconButton variant="naked" icon="close" aria-label="Reject" />
              <IconButton variant="naked" icon="checkmark" aria-label="Accept" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>
              Added new content
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined" className="tox-button--stretch">
              Provide feedback
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>;
  }
}`,...R.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card with Header Actions Only**

Demonstrates the edge case where \\\`Card.HeaderActions\\\` is used without \\\`Card.HeaderContent\\\`.
The actions are automatically aligned to the right side of the header.

This is useful for simple cards that only need action buttons without user info or labels.
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
            <Card.HeaderActions visibilityMode="always">
              <IconButton variant="naked" icon="close" aria-label="Reject" />
              <IconButton variant="naked" icon="checkmark" aria-label="Accept" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>
              Quick action card without header content
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined" className="tox-button--stretch">
              More options
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>;
  }
}`,...P.parameters?.docs?.source}}};const Ae=["Default","LongContent","WithActionButtons","CardStates","SidebarDensity","KeyboardNavigation","SkeletonLoading","WithHeaderActions","HeaderActionsAlwaysVisible","HeaderActionsOnly"];export{j as CardStates,w as Default,R as HeaderActionsAlwaysVisible,P as HeaderActionsOnly,I as KeyboardNavigation,S as LongContent,A as SidebarDensity,B as SkeletonLoading,k as WithActionButtons,H as WithHeaderActions,Ae as __namedExportsOrder,je as default};
