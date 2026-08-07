import{r as s,j as e}from"./iframe-CPZZlvxG.js";import{g as F}from"./icons-CeCQNAbo.js";import{B as c}from"./Button-BbHXeIa6.js";import{C as D,u as P,a as N,R as p,H as x,B as h,A as m}from"./Card-_niv91jc.js";import{E as H}from"./ExpandableBox-CNnT73Ko.js";import{I as l}from"./Icon-CNBvtFNu.js";import{U as V}from"./UniverseProvider-CIrK0iAr.js";import{b as _,e as T}from"./Bem-Bvj_EqVZ.js";import{O as q,i as M}from"./Optional-BNsUfA-0.js";import{b as K}from"./KeyboardNavigationHooks-DYzmIhK8.js";import{g as U}from"./Obj-SoxFuRAr.js";import"./preload-helper-PPVm8Dsz.js";import"./Strings-C1h4ndsz.js";import"./Fun-DfA6N4bS.js";import"./SugarElement-HgeWKcVW.js";import"./PredicateFind-DCGfX9bu.js";import"./Num-xrWELwUY.js";import"./Visibility-HiPE8kkv.js";const y=({children:t,focusedIndex:o,onFocusedIndexChange:i,selectedIndex:a,onSelectCard:n})=>{const r=s.useMemo(()=>({focusedIndex:o,selectedIndex:a,onFocusedIndexChange:i,onSelectCard:n}),[o,a,i,n]);return e.jsx(D.Provider,{value:r,children:t})},E=({children:t,className:o,ariaLabel:i,cycles:a,focusedIndex:n,selectedIndex:r,setFocusedIndex:u,onSelectCard:d})=>{const g=s.useRef(null);s.useEffect(()=>{g.current?.querySelectorAll(".tox-card")[n]?.scrollIntoView({block:"nearest",behavior:"smooth"})},[n]);const A=s.useMemo(()=>({focusedIndex:n,selectedIndex:r,setFocusedIndex:u,onSelectCard:d}),[n,r,u,d]);K({containerRef:g,selector:".tox-card",allowVertical:!0,allowHorizontal:!1,cycles:a,closest:!1,execute:f=>(f.dom.click(),q.some(!0))});const L=_("tox-card-list")+(M(o)?` ${o}`:"");return e.jsx(N.Provider,{value:A,children:e.jsx("div",{ref:g,role:"listbox","aria-label":i??"Card list",className:L,children:t})})},z=({children:t,className:o,ariaLabel:i,cycles:a=!1})=>{const n=P();if(n===null)throw new Error("CardList: Controlled mode requires CardListController wrapper");const r=s.useCallback(d=>{n.onFocusedIndexChange(d)},[n]),u=s.useCallback(d=>{n.onSelectCard?.(d)},[n]);return e.jsx(E,{children:t,className:o,ariaLabel:i,cycles:a,focusedIndex:n.focusedIndex,selectedIndex:n.selectedIndex,setFocusedIndex:r,onSelectCard:u})},O=({children:t,className:o,ariaLabel:i,cycles:a=!1,defaultFocusedIndex:n=0,defaultSelectedIndex:r,onSelectCard:u})=>{const[d,g]=s.useState(n),[A,L]=s.useState(r),f=s.useCallback(R=>{u?.(R),L(R)},[u]);return e.jsx(E,{children:t,className:o,ariaLabel:i,cycles:a,focusedIndex:d,selectedIndex:A,setFocusedIndex:g,onSelectCard:f})},C=t=>P()!==null?e.jsx(z,{...t}):e.jsx(O,{...t});try{y.displayName="CardListController",y.__docgenInfo={description:"",displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{C.displayName="CardList",C.__docgenInfo={description:"",displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}const b=F(),G={checkmark:b.checkmark,close:b.close,"chevron-down":b["chevron-down"],"chevron-up":b["chevron-up"]},W={getIcon:t=>U(G,t).getOr(`<svg id="${t}"></svg>`)},pe={title:"components/Card",component:p,decorators:[t=>e.jsx(V,{resources:W,children:e.jsx("div",{className:"tox",children:e.jsx(t,{})})})],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},tags:["autodocs"],args:{}},w={parameters:{docs:{description:{story:`
**Default Card**

A basic card with header, body content, and action buttons.
This demonstrates the minimal setup needed for a functional card.
Buttons use Secondary style with icons as specified, positioned on the left with 8px gap.

**Click the card** to see the selected state (2px blue border).

Spacing: 12px padding from card edge, 12px gap between sections.
        `}}},render:()=>{const[t,o]=s.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(p,{selected:t,onSelect:()=>o(!t),children:[e.jsx(x,{children:"Review Suggestion"}),e.jsx(h,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(m,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]})})}},v={parameters:{docs:{description:{story:`
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        `}}},render:()=>{const[t,o]=s.useState(!1),[i,a]=s.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(p,{selected:t,onSelect:()=>o(!t),children:[e.jsx(x,{title:"Lengthy Review"}),e.jsx(h,{children:e.jsx(H,{maxHeight:80,expanded:i,onToggle:()=>a(!i),children:e.jsx("p",{style:{margin:0},children:`Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance in ways no other club matches. The club has been home to football's greatest talents: Pelé called it his "second home," Maradona dazzled at Camp Nou, and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona's La Masia academy is football's most successful youth system, producing world-class talents like Xavi, Iniesta, Puyol, and countless others who embody the club's values.`})})}),e.jsxs(m,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]})})}},S={parameters:{docs:{description:{story:`
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        `}}},render:()=>{const[t,o]=s.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(p,{selected:t,onSelect:()=>o(!t),children:[e.jsx(x,{children:"Review Suggestion"}),e.jsx(h,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(m,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]})})}},k={parameters:{docs:{description:{story:`
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        `}}},render:()=>{const[t,o]=s.useState(0),[i,a]=s.useState(void 0);return e.jsx("div",{style:{width:"316px"},children:e.jsx(y,{focusedIndex:t,onFocusedIndexChange:o,selectedIndex:i,onSelectCard:a,children:e.jsxs(C,{ariaLabel:"Review suggestions with different states",children:[e.jsxs(p,{index:0,children:[e.jsx(x,{children:"Review Suggestion"}),e.jsx(h,{children:e.jsx("p",{style:{margin:0},children:"This card has no status yet."})}),e.jsxs(m,{children:[e.jsxs(c,{variant:"outlined",onClick:n=>n.stopPropagation(),children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:n=>n.stopPropagation(),children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]}),e.jsxs(p,{index:1,hasDecision:!0,children:[e.jsx(x,{children:e.jsx("div",{className:T("tox-card","header-label"),children:"Applied"})}),e.jsx(h,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been applied."})}),e.jsx(m,{children:e.jsxs(c,{variant:"outlined",onClick:n=>n.stopPropagation(),children:[e.jsx(l,{icon:"close"}),"Revert"]})})]}),e.jsxs(p,{index:2,hasDecision:!0,children:[e.jsx(x,{children:e.jsx("div",{className:T("tox-card","header-label"),children:"Skipped"})}),e.jsx(h,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been skipped."})}),e.jsx(m,{children:e.jsxs(c,{variant:"outlined",onClick:n=>n.stopPropagation(),children:[e.jsx(l,{icon:"close"}),"Revert"]})})]})]})})})}},I={parameters:{docs:{description:{story:`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (440px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        `}}},render:()=>{const[t,o]=s.useState(0),[i,a]=s.useState(void 0),n=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"440px",maxHeight:"500px",overflowY:"auto",padding:"12px",backgroundColor:"#f5f5f5",borderRadius:"6px"},children:e.jsx(y,{focusedIndex:t,onFocusedIndexChange:o,selectedIndex:i,onSelectCard:a,children:e.jsx(C,{ariaLabel:"Review suggestions",children:n.map((r,u)=>e.jsxs(p,{index:u,children:[e.jsx(x,{title:r.title}),e.jsx(h,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:r.content})}),e.jsxs(m,{children:[e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),a(void 0)},children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),a(u)},children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]},r.id))})})})}},j={parameters:{docs:{description:{story:`
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
        `}}},render:()=>{const[t,o]=s.useState(0),[i,a]=s.useState(void 0),n=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px"},children:e.jsx(y,{focusedIndex:t,onFocusedIndexChange:o,selectedIndex:i,onSelectCard:a,children:e.jsx(C,{ariaLabel:"Review suggestions",cycles:!1,children:n.map((r,u)=>e.jsxs(p,{index:u,children:[e.jsx(x,{title:r.title}),e.jsx(h,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:r.content})}),e.jsxs(m,{children:[e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),a(void 0)},children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),a(u)},children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]},r.id))})})})}},B={parameters:{docs:{description:{story:`
**Skeleton Loading State with Transition**

Demonstrates the \`loading\` prop on Card.Root that internally handles skeleton state.
The card automatically transitions from skeleton to loaded content when \`loading\` changes from \`true\` to \`false\`.

This matches the Suggested Edits pattern where the card container remains the same but content switches between skeleton and loaded state.

**Try it:** The card shows skeleton for 2 seconds, then transitions to show the actual content.
        `}}},render:()=>{const[t,o]=s.useState(!0);return s.useEffect(()=>{const i=setTimeout(()=>o(!1),2e3);return()=>clearTimeout(i)},[]),e.jsx("div",{style:{width:"316px"},children:e.jsx(C,{children:e.jsxs(p,{loading:t,index:0,children:[e.jsx(h,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(m,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(l,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(l,{icon:"checkmark"}),"Apply"]})]})]})})})}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};const he=["Default","LongContent","WithActionButtons","CardStates","SidebarDensity","KeyboardNavigation","SkeletonLoading"];export{k as CardStates,w as Default,j as KeyboardNavigation,v as LongContent,I as SidebarDensity,B as SkeletonLoading,S as WithActionButtons,he as __namedExportsOrder,pe as default};
