import{r as o,j as e}from"./iframe-VuuwYRqM.js";import{g as le}from"./icons-DeTwHuaL.js";import{B as l}from"./Button-DbbLUioC.js";import{b as se,e as S}from"./Bem-DWdSENOI.js";import{O as ce,i as q}from"./Optional-CilDcsXt.js";import{E as ue}from"./ExpandableBox--a__HVMY.js";import{I as c}from"./Universe-CYCaTkch.js";import{U as pe}from"./UniverseProvider-PiUETxw8.js";import{g as he}from"./Obj-ycCTN9Ns.js";import{c as me}from"./KeyboardNavigationHooks-DmedjvyH.js";import"./Strings-BDyhe4Of.js";import"./Fun--VEwoXIw.js";const re=o.createContext(null),ie=o.createContext(null),xe=()=>o.useContext(re),Ce=()=>o.useContext(ie),I=({children:t,focusedIndex:n,onFocusedIndexChange:r,selectedIndex:i,onSelectCard:d})=>{const u=o.useMemo(()=>({focusedIndex:n,selectedIndex:i,onFocusedIndexChange:r,onSelectCard:d}),[n,i,r,d]);return e.jsx(ie.Provider,{value:u,children:t})},k=({children:t,className:n,ariaLabel:r,cycles:i=!1,defaultFocusedIndex:d=0,defaultSelectedIndex:u,onSelectCard:s})=>{const a=o.useRef(null),p=Ce(),g=p!==null,[N,P]=o.useState(d),[T,V]=o.useState(u),m=g?p.focusedIndex:N,x=g?p.selectedIndex:T,v=o.useCallback(b=>{g?p.onFocusedIndexChange(b):P(b)},[g,p]),w=o.useCallback(b=>{var H;g?(H=p.onSelectCard)==null||H.call(p,b):(s==null||s(b),V(b))},[g,p,s]),D=o.useMemo(()=>({focusedIndex:m,selectedIndex:x,setFocusedIndex:v,onSelectCard:w}),[m,x,v,w]);me({containerRef:a,selector:".tox-card",allowVertical:!0,allowHorizontal:!1,cycles:i,closest:!1,execute:b=>(b.dom.click(),ce.some(!0))});const de=se("tox-card-list")+(q(n)?` ${n}`:"");return e.jsx(re.Provider,{value:D,children:e.jsx("div",{ref:a,role:"listbox","aria-label":r??"Card list",className:de,children:t})})};try{I.displayName="CardListController",I.__docgenInfo={description:`CardListController provides controlled state for CardList via context.

Wrap CardList with this component when you need to control the focus
and selection state externally.`,displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{k.displayName="CardList",k.__docgenInfo={description:`CardList component for managing a collection of cards with keyboard navigation.

Can be used in two modes:
- **Uncontrolled**: Use directly with \`defaultFocusedIndex\` and \`defaultSelectedIndex\`
- **Controlled**: Wrap with \`CardListController\` to manage state externally

Provides arrow key navigation between cards. Focus is managed programmatically.
Follows WCAG accessibility guidelines for listbox pattern.`,displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}const h=({children:t,className:n,onSelect:r,selected:i=!1,ariaLabel:d,hasDecision:u=!1,index:s})=>{const a=xe(),p=(a==null?void 0:a.focusedIndex)===s,g=(a==null?void 0:a.selectedIndex)===s,N=o.useCallback(m=>{var w;const x=m.target,v=m.currentTarget;x!==v&&(x.matches("button, a, input, textarea, select")||x.closest("button, a, input, textarea, select"))||(a&&s!==void 0&&((w=a.onSelectCard)==null||w.call(a,s),a.setFocusedIndex(s)),r==null||r())},[r,a,s]),P=o.useCallback(m=>{if(m.key!=="Enter"&&m.key!==" ")return;const x=m.target,v=m.currentTarget;x!==v&&(x.matches("button, a, input, textarea, select")||x.closest("button, a, input, textarea, select"))},[]),T=o.useCallback(()=>{a&&s!==void 0&&a.setFocusedIndex(s)},[a,s]),V=se("tox-card",{selected:p||i,"has-decision":u})+(q(n)?` ${n}`:"");return e.jsx("div",{className:V,onClick:N,onKeyDown:P,onFocus:T,tabIndex:-1,role:"option","aria-label":d??`Card ${(s??0)+1}`,"aria-selected":g,children:t})},C=({children:t,title:n})=>e.jsx("div",{className:S("tox-card","header"),children:q(n)?n:t}),y=({children:t})=>e.jsx("div",{className:S("tox-card","body"),children:t}),f=({children:t,layout:n="flex-start"})=>e.jsx("div",{className:S("tox-card","actions",{"space-between":n==="space-between","flex-start":n==="flex-start"}),children:t}),E=({children:t,type:n})=>e.jsx("div",{className:S("tox-card","highlight",{added:n==="added",deleted:n==="deleted",modified:n==="modified"}),children:t});try{h.displayName="Root",h.__docgenInfo={description:`Card Root component.
Container for a card with support for selection states.
Must be used within a CardList for proper keyboard navigation.`,displayName:"Root",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}},onSelect:{defaultValue:null,description:"",name:"onSelect",required:!1,type:{name:"(() => void)"}},selected:{defaultValue:{value:"false"},description:"",name:"selected",required:!1,type:{name:"boolean"}},ariaLabel:{defaultValue:null,description:"",name:"ariaLabel",required:!1,type:{name:"string"}},hasDecision:{defaultValue:{value:"false"},description:"",name:"hasDecision",required:!1,type:{name:"boolean"}},index:{defaultValue:null,description:`Index of this card within a CardList.
Required when used inside CardList for proper keyboard navigation.`,name:"index",required:!1,type:{name:"number"}}}}}catch{}try{C.displayName="Header",C.__docgenInfo={description:`Card Header component.
Displays the header/title section of the card.`,displayName:"Header",props:{title:{defaultValue:null,description:"",name:"title",required:!1,type:{name:"string"}}}}}catch{}try{y.displayName="Body",y.__docgenInfo={description:`Card Body component.
Contains the main content of the card.`,displayName:"Body",props:{}}}catch{}try{f.displayName="Actions",f.__docgenInfo={description:`Card Actions component.
Contains action buttons (Skip, Apply, Revert, etc.)
Default layout is flex-start (buttons on left with gap between them)`,displayName:"Actions",props:{layout:{defaultValue:{value:"flex-start"},description:"",name:"layout",required:!1,type:{name:"CardLayout"}}}}}catch{}try{E.displayName="Highlight",E.__docgenInfo={description:`Card Highlight component.
Displays highlighted text with added/deleted/modified styling.`,displayName:"Highlight",props:{type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"CardHighlightType"}}}}}catch{}try{CardList.displayName="CardList",CardList.__docgenInfo={description:`CardList component for managing a collection of cards with keyboard navigation.

Can be used in two modes:
- **Uncontrolled**: Use directly with \`defaultFocusedIndex\` and \`defaultSelectedIndex\`
- **Controlled**: Wrap with \`CardListController\` to manage state externally

Provides arrow key navigation between cards. Focus is managed programmatically.
Follows WCAG accessibility guidelines for listbox pattern.`,displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{CardListController.displayName="CardListController",CardListController.__docgenInfo={description:`CardListController provides controlled state for CardList via context.

Wrap CardList with this component when you need to control the focus
and selection state externally.`,displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}const j=le(),ye={checkmark:j.checkmark,close:j.close,"chevron-down":j["chevron-down"],"chevron-up":j["chevron-up"]},fe={getIcon:t=>he(ye,t).getOr(`<svg id="${t}"></svg>`)},Fe={title:"components/Card",component:h,decorators:[t=>e.jsx(pe,{resources:fe,children:e.jsx("div",{className:"tox",children:e.jsx(t,{})})})],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},render:()=>{const[t,n]=o.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(C,{children:"Review Suggestion"}),e.jsx(y,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(f,{children:[e.jsxs(l,{variant:"outlined",children:[e.jsx(c,{icon:"close"}),"Skip"]}),e.jsxs(l,{variant:"outlined",children:[e.jsx(c,{icon:"checkmark"}),"Apply"]})]})]})})}},L={parameters:{docs:{description:{story:`
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        `}}},render:()=>{const[t,n]=o.useState(!1),[r,i]=o.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(C,{title:"Lengthy Review"}),e.jsx(y,{children:e.jsx(ue,{maxHeight:80,expanded:r,onToggle:()=>i(!r),children:e.jsx("p",{style:{margin:0},children:`Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance in ways no other club matches. The club has been home to football's greatest talents: Pelé called it his "second home," Maradona dazzled at Camp Nou, and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona's La Masia academy is football's most successful youth system, producing world-class talents like Xavi, Iniesta, Puyol, and countless others who embody the club's values.`})})}),e.jsxs(f,{children:[e.jsxs(l,{variant:"outlined",children:[e.jsx(c,{icon:"close"}),"Skip"]}),e.jsxs(l,{variant:"outlined",children:[e.jsx(c,{icon:"checkmark"}),"Apply"]})]})]})})}},_={parameters:{docs:{description:{story:`
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        `}}},render:()=>{const[t,n]=o.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(C,{children:"Review Suggestion"}),e.jsx(y,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(f,{children:[e.jsxs(l,{variant:"outlined",children:[e.jsx(c,{icon:"close"}),"Skip"]}),e.jsxs(l,{variant:"outlined",children:[e.jsx(c,{icon:"checkmark"}),"Apply"]})]})]})})}},A={parameters:{docs:{description:{story:`
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        `}}},render:()=>{const[t,n]=o.useState(0),[r,i]=o.useState(void 0);return e.jsx("div",{style:{width:"316px"},children:e.jsx(I,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:r,onSelectCard:i,children:e.jsxs(k,{ariaLabel:"Review suggestions with different states",children:[e.jsxs(h,{index:0,children:[e.jsx(C,{children:"Review Suggestion"}),e.jsx(y,{children:e.jsx("p",{style:{margin:0},children:"This card has no status yet."})}),e.jsxs(f,{children:[e.jsxs(l,{variant:"outlined",onClick:d=>d.stopPropagation(),children:[e.jsx(c,{icon:"close"}),"Skip"]}),e.jsxs(l,{variant:"outlined",onClick:d=>d.stopPropagation(),children:[e.jsx(c,{icon:"checkmark"}),"Apply"]})]})]}),e.jsxs(h,{index:1,hasDecision:!0,children:[e.jsx(C,{children:e.jsx("div",{className:S("tox-card","header-label"),children:"Applied"})}),e.jsx(y,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been applied."})}),e.jsx(f,{children:e.jsxs(l,{variant:"outlined",onClick:d=>d.stopPropagation(),children:[e.jsx(c,{icon:"close"}),"Revert"]})})]}),e.jsxs(h,{index:2,hasDecision:!0,children:[e.jsx(C,{children:e.jsx("div",{className:S("tox-card","header-label"),children:"Skipped"})}),e.jsx(y,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been skipped."})}),e.jsx(f,{children:e.jsxs(l,{variant:"outlined",onClick:d=>d.stopPropagation(),children:[e.jsx(c,{icon:"close"}),"Revert"]})})]})]})})})}},F={parameters:{docs:{description:{story:`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (316px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        `}}},render:()=>{const[t,n]=o.useState(0),[r,i]=o.useState(void 0),d=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px",maxHeight:"500px",overflowY:"auto",padding:"12px",backgroundColor:"#f5f5f5",borderRadius:"6px"},children:e.jsx(I,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:r,onSelectCard:i,children:e.jsx(k,{ariaLabel:"Review suggestions",children:d.map((u,s)=>e.jsxs(h,{index:s,children:[e.jsx(C,{title:u.title}),e.jsx(y,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:u.content})}),e.jsxs(f,{children:[e.jsxs(l,{variant:"outlined",onClick:a=>{a.stopPropagation(),i(void 0)},children:[e.jsx(c,{icon:"close"}),"Skip"]}),e.jsxs(l,{variant:"outlined",onClick:a=>{a.stopPropagation(),i(s)},children:[e.jsx(c,{icon:"checkmark"}),"Apply"]})]})]},u.id))})})})}},R={parameters:{docs:{description:{story:`
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
        `}}},render:()=>{const[t,n]=o.useState(0),[r,i]=o.useState(void 0),d=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px"},children:e.jsx(I,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:r,onSelectCard:i,children:e.jsx(k,{ariaLabel:"Review suggestions",cycles:!1,children:d.map((u,s)=>e.jsxs(h,{index:s,children:[e.jsx(C,{title:u.title}),e.jsx(y,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:u.content})}),e.jsxs(f,{children:[e.jsxs(l,{variant:"outlined",onClick:a=>{a.stopPropagation(),i(void 0)},children:[e.jsx(c,{icon:"close"}),"Skip"]}),e.jsxs(l,{variant:"outlined",onClick:a=>{a.stopPropagation(),i(s)},children:[e.jsx(c,{icon:"checkmark"}),"Apply"]})]})]},u.id))})})})}};var U,K,M;B.parameters={...B.parameters,docs:{...(U=B.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(M=(K=B.parameters)==null?void 0:K.docs)==null?void 0:M.source}}};var W,z,G;L.parameters={...L.parameters,docs:{...(W=L.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(G=(z=L.parameters)==null?void 0:z.docs)==null?void 0:G.source}}};var $,O,X;_.parameters={..._.parameters,docs:{...($=_.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(X=(O=_.parameters)==null?void 0:O.docs)==null?void 0:X.source}}};var Y,J,Q;A.parameters={...A.parameters,docs:{...(Y=A.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(Q=(J=A.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var Z,ee,te;F.parameters={...F.parameters,docs:{...(Z=F.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(te=(ee=F.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ne,ae,oe;R.parameters={...R.parameters,docs:{...(ne=R.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(oe=(ae=R.parameters)==null?void 0:ae.docs)==null?void 0:oe.source}}};const Re=["Default","LongContent","WithActionButtons","CardStates","SidebarDensity","KeyboardNavigation"];export{A as CardStates,B as Default,R as KeyboardNavigation,L as LongContent,F as SidebarDensity,_ as WithActionButtons,Re as __namedExportsOrder,Fe as default};
