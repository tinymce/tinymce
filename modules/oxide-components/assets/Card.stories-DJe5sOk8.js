import{r as a,j as e}from"./iframe-D90U2Saj.js";import{g as se}from"./icons-BH388hKR.js";import{A as Y}from"./AutoResizingTextarea-BiwxzJQ2.js";import{B as c}from"./Button-Ds6O2MiH.js";import{E as ie}from"./ExpandableBox-B6k13S5M.js";import{I as u}from"./Icon-mC9KzXoQ.js";import{I as w}from"./IconButton-by9h_iSC.js";import{U as re}from"./UniverseProvider-B0Edqm3I.js";import{b as ee,e as I}from"./Bem-BDvzWjIo.js";import{C as de,u as te,e as ce,a as h,H as m,c as x,A as f,f as T,R as y,I as b,B as v,b as S,S as k,E as le,g as pe,h as ue,D as Q,i as M}from"./Card-Bz_3ZBfj.js";import{a as ne,O as he,i as xe}from"./Optional-CwIPeCD0.js";import{b as me}from"./KeyboardNavigationHooks-1TkN92t8.js";import{h as Z,g as ge}from"./Obj-dSJWADda.js";import{f as fe}from"./Strings-DwL7BECk.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-jw9k3Vcm.js";import"./Visibility-HiPE8kkv.js";import"./Universe-CnNU8XH_.js";import"./PredicateFind--7pRSCFh.js";import"./Num-xrWELwUY.js";const ae=t=>(t.dom.click(),he.some(!0)),R=({children:t,focusedIndex:n,onFocusedIndexChange:i,selectedIndex:r,onSelectCard:s})=>{const o=a.useMemo(()=>({focusedIndex:n,selectedIndex:r,onFocusedIndexChange:i,onSelectCard:s}),[n,r,i,s]);return e.jsx(de.Provider,{value:o,children:t})},oe=({children:t,className:n,ariaLabel:i,cycles:r,focusedIndex:s,selectedIndex:o,setFocusedIndex:p,onSelectCard:d,execute:l})=>{const A=a.useRef(null);a.useEffect(()=>{A.current?.querySelectorAll(".tox-card")[s]?.scrollIntoView({block:"nearest",behavior:"smooth"})},[s]);const C=a.useMemo(()=>({focusedIndex:s,selectedIndex:o,setFocusedIndex:p,onSelectCard:d}),[s,o,p,d]);me({containerRef:A,selector:".tox-card",allowVertical:!0,allowHorizontal:!1,cycles:r,closest:!1,execute:l});const g=ee("tox-card-list")+(ne(n)?` ${n}`:"");return e.jsx(ce.Provider,{value:C,children:e.jsx("div",{ref:A,role:"listbox","aria-label":i??"Card list",className:g,children:t})})},Ce=({children:t,className:n,ariaLabel:i,cycles:r=!1,execute:s=ae})=>{const o=te();if(o===null)throw new Error("CardList: Controlled mode requires CardListController wrapper");const p=a.useCallback(l=>{o.onFocusedIndexChange(l)},[o]),d=a.useCallback(l=>{o.onSelectCard?.(l)},[o]);return e.jsx(oe,{children:t,className:n,ariaLabel:i,cycles:r,focusedIndex:o.focusedIndex,selectedIndex:o.selectedIndex,setFocusedIndex:p,onSelectCard:d,execute:s})},ye=({children:t,className:n,ariaLabel:i,cycles:r=!1,defaultFocusedIndex:s=0,defaultSelectedIndex:o,onSelectCard:p,execute:d=ae})=>{const[l,A]=a.useState(s),[C,g]=a.useState(o),P=a.useCallback(X=>{p?.(X),g(X)},[p]);return e.jsx(oe,{children:t,className:n,ariaLabel:i,cycles:r,focusedIndex:l,selectedIndex:C,setFocusedIndex:A,onSelectCard:P,execute:d})},B=t=>te()!==null?e.jsx(Ce,{...t}):e.jsx(ye,{...t});try{R.displayName="CardListController",R.__docgenInfo={description:"",displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{B.displayName="CardList",B.__docgenInfo={description:"",displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}},execute:{defaultValue:{value:`(focused: SugarElement<HTMLElement>): Optional<boolean> => {
  focused.dom.click();
  return Optional.some(true);
}`},description:"Handler for Enter/Space on the focused card. Return `Optional.some(true)` when handled.\nDefaults to clicking the focused card.",name:"execute",required:!1,type:{name:"((focused: SugarElement<HTMLElement>) => Optional<boolean>)"}}}}}catch{}const $=({children:t,status:n,title:i})=>{const r=a.useId(),s=a.useId(),o=ne(n),p=o?`${r} ${s}`:r;return e.jsxs("div",{className:ee("tox-card-group"),children:[e.jsxs("div",{className:I("tox-card-group","title"),children:[e.jsx("span",{id:r,className:I("tox-card-group","title-text"),children:i}),o&&e.jsx("span",{id:s,className:I("tox-card-group","status"),children:n})]}),e.jsx("div",{className:I("tox-card-group","content"),role:"group","aria-labelledby":p,children:t})]})};try{$.displayName="CardGroup",$.__docgenInfo={description:"Groups any number of cards of a CardList under one heading.",displayName:"CardGroup",props:{title:{defaultValue:null,description:"Heading rendered above the cards of the group",name:"title",required:!0,type:{name:"string"}},status:{defaultValue:null,description:`Already formatted secondary text rendered at the end of the heading, e.g. how many cards of the group still
need a decision. The component stays generic, so the caller does the translating and the number formatting.`,name:"status",required:!1,type:{name:"string"}}}}}catch{}const H=se(),be={checkmark:H.checkmark,close:H.close,"chevron-down":H["chevron-down"],"chevron-up":H["chevron-up"],feedback:H.feedback},ve={getIcon:t=>ge(be,t).getOr(`<svg id="${t}"></svg>`),translate:xe},j='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%234A90E2"/%3E%3Ctext x="18" y="24" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif"%3EJM%3C/text%3E%3C/svg%3E',Ge={title:"components/Card",component:h,decorators:[t=>e.jsx(re,{resources:ve,children:e.jsx("div",{className:"tox",children:e.jsx(t,{})})})],parameters:{layout:"centered",docs:{description:{component:`
The Card component is a reusable compound component for displaying content with actions.

## Features
- **Compound Component Pattern**: Flexible composition with Root, Header, HeaderContent, HeaderActions, Body, Actions, and Expansion
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

## Feedback/Comment Threads

For feedback and comment threads, click the card to reveal the thread content:
1. **Click card** → Shows divider + existing replies + textarea
2. **Focus textarea** → Shows Cancel/Save buttons
3. **Click Cancel** → Hides buttons, keeps textarea visible

The feedback count is shown in the \`Profile.Subheading\` with an icon.

## Integration

Works seamlessly with other oxide-components:
- **Button** / **IconButton**: For action buttons
- **Profile**: For user info in HeaderContent
- **ExpandableBox**: For long content
- **AutoResizingTextarea**: For feedback/comment editors
- **Icon**: For status indicators

## Advanced: Card.Expansion

For custom expandable sections, use the \`Card.Expansion\` compound components:
- \`Card.Expansion\`: Expandable section wrapper (controlled)
- \`Card.ExpansionTrigger\`: Button that toggles the expansion
- \`Card.ExpansionContent\`: Animated collapsible content region
        `}}},tags:["autodocs"],args:{}},E={parameters:{docs:{description:{story:`
**Default Card**

A basic card with header, body content, and action buttons.
This demonstrates the minimal setup needed for a functional card.
Buttons use Secondary style with icons as specified, positioned on the left with 8px gap.

**Click the card** to see the selected state (2px blue border).

Spacing: 12px padding from card edge, 12px gap between sections.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(m,{children:"Review Suggestion"}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(f,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},L={parameters:{docs:{description:{story:`
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        `}}},render:()=>{const[t,n]=a.useState(!1),[i,r]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(m,{title:"Lengthy Review"}),e.jsx(x,{children:e.jsx(ie,{maxHeight:80,expanded:i,onToggle:()=>r(!i),children:e.jsx("p",{style:{margin:0},children:`Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance in ways no other club matches. The club has been home to football's greatest talents: Pelé called it his "second home," Maradona dazzled at Camp Nou, and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona's La Masia academy is football's most successful youth system, producing world-class talents like Xavi, Iniesta, Puyol, and countless others who embody the club's values.`})})}),e.jsxs(f,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},F={parameters:{docs:{description:{story:`
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(m,{children:"Review Suggestion"}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(f,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},V={parameters:{docs:{description:{story:`
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        `}}},render:()=>{const[t,n]=a.useState(0),[i,r]=a.useState(void 0);return e.jsx("div",{style:{width:"316px"},children:e.jsx(R,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:r,children:e.jsxs(B,{ariaLabel:"Review suggestions with different states",children:[e.jsxs(h,{index:0,children:[e.jsx(m,{children:"Review Suggestion"}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"This card has no status yet."})}),e.jsxs(f,{children:[e.jsxs(c,{variant:"outlined",onClick:s=>s.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:s=>s.stopPropagation(),children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]}),e.jsxs(h,{index:1,hasDecision:!0,children:[e.jsx(m,{children:e.jsx("div",{className:I("tox-card","header-label"),children:"Applied"})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been applied."})}),e.jsx(f,{children:e.jsxs(c,{variant:"outlined",onClick:s=>s.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Revert"]})})]}),e.jsxs(h,{index:2,hasDecision:!0,children:[e.jsx(m,{children:e.jsx("div",{className:I("tox-card","header-label"),children:"Skipped"})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been skipped."})}),e.jsx(f,{children:e.jsxs(c,{variant:"outlined",onClick:s=>s.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Revert"]})})]})]})})})}},D={parameters:{docs:{description:{story:`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (440px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        `}}},render:()=>{const[t,n]=a.useState(0),[i,r]=a.useState(void 0),s=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"440px",maxHeight:"500px",overflowY:"auto",padding:"12px",backgroundColor:"#f5f5f5",borderRadius:"6px"},children:e.jsx(R,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:r,children:e.jsx(B,{ariaLabel:"Review suggestions",children:s.map((o,p)=>e.jsxs(h,{index:p,children:[e.jsx(m,{title:o.title}),e.jsx(x,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:o.content})}),e.jsxs(f,{children:[e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),r(void 0)},children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),r(p)},children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]},o.id))})})})}},O={parameters:{docs:{description:{story:`
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
        `}}},render:()=>{const[t,n]=a.useState(0),[i,r]=a.useState(void 0),s=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px"},children:e.jsx(R,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:r,children:e.jsx(B,{ariaLabel:"Review suggestions",cycles:!1,children:s.map((o,p)=>e.jsxs(h,{index:p,children:[e.jsx(m,{title:o.title}),e.jsx(x,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:o.content})}),e.jsxs(f,{children:[e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),r(void 0)},children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),r(p)},children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]},o.id))})})})}},N={parameters:{docs:{description:{story:`
**Cards grouped under a heading**

\`Card.CardGroup\` holds any number of cards of a list under one title, for a list whose cards come from more
than one source. The cards stay descendants of the list, so the arrow key navigation and the focused index run
across the groups as one sequence rather than restarting in each of them.

Scroll the list to see the headings: each one sits in the flow until it would scroll out of view, then pins
to the top of the list. A heading is pinned only within its own group, so the next one pushes it out as it
arrives rather than stacking under it.

A heading can carry a \`status\`, which joins the accessible name of the group so a screen reader announces it
with the title. It is muted text at the far end of the heading, already formatted so the caller owns the
wording — skip or apply the cards of a group to watch it fall to \`0 pending\`.
        `}}},render:()=>{const[t,n]=a.useState(0),[i,r]=a.useState(void 0),[s,o]=a.useState({}),p=[{title:"Real Madrid article",cards:["One","Two","Three"]},{title:"Barcelona article",cards:["Four","Five","Six"]},{title:"Athletic Bilbao article",cards:["Seven","Eight","Nine"]}],d=(C,g)=>o(P=>({...P,[C]:g})),l=C=>fe(C,g=>!Z(s,g)).length;let A=-1;return e.jsx("div",{style:{width:"316px",height:"400px",overflowY:"auto"},children:e.jsx(R,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:r,children:e.jsx(B,{ariaLabel:"Suggestions of two documents",children:p.map(C=>e.jsx($,{title:C.title,status:`${l(C.cards)} pending`,children:C.cards.map(g=>(A++,e.jsxs(h,{index:A,hasDecision:Z(s,g),children:[e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:`Suggestion ${g}`})}),e.jsxs(f,{children:[e.jsxs(c,{variant:"outlined",onClick:P=>{P.stopPropagation(),d(g,"skip")},children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:P=>{P.stopPropagation(),d(g,"apply")},children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]},g)))},C.title))})})})}},_={parameters:{docs:{description:{story:`
**Skeleton Loading State with Transition**

Demonstrates the \`loading\` prop on Card.Root that internally handles skeleton state.
The card automatically transitions from skeleton to loaded content when \`loading\` changes from \`true\` to \`false\`.

This matches the Suggested Edits pattern where the card container remains the same but content switches between skeleton and loaded state.

**Try it:** The card shows skeleton for 2 seconds, then transitions to show the actual content.
        `}}},render:()=>{const[t,n]=a.useState(!0);return a.useEffect(()=>{const i=setTimeout(()=>n(!1),2e3);return()=>clearTimeout(i)},[]),e.jsx("div",{style:{width:"316px"},children:e.jsx(B,{children:e.jsxs(h,{loading:t,index:0,children:[e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(f,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})})}},G={parameters:{docs:{description:{story:`
**Card with Header Actions and Profile**

Demonstrates the new unified card design with:
- \`Card.HeaderContent\`: Left-side content (Profile component with avatar, name, timestamp)
- \`Card.HeaderActions\`: Right-side action buttons with hover visibility
- Action buttons appear on hover/focus by default (\`visibilityMode="hover"\`)

This pattern is used across TinyMCE AI and Suggested Edits for a consistent user experience.

**Try it:** Hover over the card to see the header action buttons appear.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsxs(m,{children:[e.jsx(T,{children:e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"John Mac Giolla..."}),e.jsxs(v,{children:[e.jsx(S,{children:"John Mac Giolla..."}),e.jsx(k,{children:"May 18, 9:12 AM"})]})]})}),e.jsxs(M,{visibilityMode:"hover",children:[e.jsx(w,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(w,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Modified text"})}),e.jsx(f,{children:e.jsx(c,{variant:"outlined",className:"tox-button--stretch",children:"Provide feedback"})})]})})}},J={parameters:{docs:{description:{story:`
**Card with Always Visible Header Actions**

Same as the previous story, but with \`visibilityMode="always"\` on HeaderActions.
The action buttons remain visible at all times instead of only on hover.

This is useful when action visibility is important for discoverability.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsxs(m,{children:[e.jsx(T,{children:e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"Jane Smith"}),e.jsxs(v,{children:[e.jsx(S,{children:"Jane Smith"}),e.jsx(k,{children:"May 19, 2:45 PM"})]})]})}),e.jsxs(M,{visibilityMode:"always",children:[e.jsx(w,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(w,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Added new content"})}),e.jsx(f,{children:e.jsx(c,{variant:"outlined",className:"tox-button--stretch",children:"Provide feedback"})})]})})}},U={parameters:{docs:{description:{story:`
**Card with Header Actions Only**

Demonstrates the edge case where \`Card.HeaderActions\` is used without \`Card.HeaderContent\`.
The actions are automatically aligned to the right side of the header.

This is useful for simple cards that only need action buttons without user info or labels.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(m,{children:e.jsxs(M,{visibilityMode:"always",children:[e.jsx(w,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(w,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Quick action card without header content"})}),e.jsx(f,{children:e.jsx(c,{variant:"outlined",className:"tox-button--stretch",children:"More options"})})]})})}},q={parameters:{docs:{description:{story:`
**Card.Expansion API Example**

Demonstrates the \`Card.Expansion\` compound components:
- \`Card.Expansion\`: Wrapper with controlled state
- \`Card.ExpansionTrigger\`: Button that toggles expansion (requires single interactive child)
- \`Card.ExpansionContent\`: Animated collapsible content region

**Try it:** Click "View feedback (2)" to expand, click again to collapse.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{children:[e.jsx(m,{children:e.jsx(T,{children:e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"John Mac Giolla..."}),e.jsxs(v,{children:[e.jsx(S,{children:"John Mac Giolla..."}),e.jsxs(k,{children:["May 18, 9:12 AM • 2 ",e.jsx(u,{icon:"feedback","aria-label":"feedback"})]})]})]})})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Modified text with suggested changes"})}),e.jsxs(le,{open:t,onOpenChange:n,children:[e.jsx(pe,{children:e.jsx(c,{variant:"outlined",className:"tox-button--stretch",children:"View feedback (2)"})}),e.jsxs(ue,{children:[e.jsxs("div",{children:[e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"Sarah Chen"}),e.jsxs(v,{children:[e.jsx(S,{children:"Sarah Chen"}),e.jsx(k,{children:"May 18, 10:30 AM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"This change looks good to me."})]}),e.jsxs("div",{children:[e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"Mike Torres"}),e.jsxs(v,{children:[e.jsx(S,{children:"Mike Torres"}),e.jsx(k,{children:"May 18, 11:15 AM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"Could we keep the original phrasing instead?"})]})]})]})]})})}},z={parameters:{docs:{description:{story:`
**Card — Provide Feedback (Suggested Edits)**

Click the card to reveal the feedback composer. Focus the textarea to show action buttons.

**Try it:** Click the card → focus textarea → Cancel hides buttons, keeps textarea visible.
        `}}},render:()=>{const[t,n]=a.useState(!0),[i,r]=a.useState(!1),[s,o]=a.useState(!1),[p,d]=a.useState("");return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>{n(!t),r(!i)},children:[e.jsxs(m,{children:[e.jsx(T,{children:e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"John Mac Giolla..."}),e.jsxs(v,{children:[e.jsx(S,{children:"John Mac Giolla..."}),e.jsx(k,{children:"May 18, 9:12 AM"})]})]})}),e.jsxs(M,{visibilityMode:"hover",children:[e.jsx(w,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(w,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Modified text"})}),i&&e.jsxs(e.Fragment,{children:[e.jsx(Q,{}),e.jsxs("div",{style:{paddingBottom:"16px"},onFocusCapture:()=>o(!0),onClick:l=>l.stopPropagation(),children:[e.jsx(Y,{value:p,onChange:d,placeholder:"Provide feedback..."}),s&&e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"flex-end",marginTop:"8px"},children:[e.jsx(c,{variant:"outlined",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Cancel"}),e.jsx(c,{variant:"primary",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Save"})]})]})]})]})})}},K={parameters:{docs:{description:{story:`
**Card — Comment Thread (Comments)**

Click the card to reveal existing replies and a composer. Focus the textarea to show action buttons.

**Try it:** Click card → see replies + composer → focus textarea → action buttons appear.
        `}}},render:()=>{const[t,n]=a.useState(!0),[i,r]=a.useState(!1),[s,o]=a.useState(!1),[p,d]=a.useState("");return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>{n(!t),r(!i)},children:[e.jsx(m,{children:e.jsx(T,{children:e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"Jane Smith"}),e.jsxs(v,{children:[e.jsx(S,{children:"Jane Smith"}),e.jsxs(k,{children:["May 19, 2:45 PM • 2 ",e.jsx(u,{icon:"feedback","aria-label":"comments"})]})]})]})})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Can we clarify this section before publishing?"})}),i&&e.jsxs(e.Fragment,{children:[e.jsx(Q,{}),e.jsxs("div",{style:{paddingBottom:"16px",display:"flex",flexDirection:"column",gap:"12px"},onFocusCapture:()=>o(!0),onClick:l=>l.stopPropagation(),children:[e.jsxs("div",{children:[e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"Alex Rivera"}),e.jsxs(v,{children:[e.jsx(S,{children:"Alex Rivera"}),e.jsx(k,{children:"May 19, 3:10 PM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"Agreed — the wording is ambiguous."})]}),e.jsxs("div",{children:[e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"Sam Lee"}),e.jsxs(v,{children:[e.jsx(S,{children:"Sam Lee"}),e.jsx(k,{children:"May 19, 4:02 PM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"I can take a pass on a rewrite."})]}),e.jsx(Y,{value:p,onChange:d,placeholder:"Add comment..."}),s&&e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"flex-end"},children:[e.jsx(c,{variant:"outlined",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Cancel"}),e.jsx(c,{variant:"primary",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Comment"})]})]})]})]})})}},W={parameters:{docs:{description:{story:`
**Card — Feedback Thread (Suggested Edits)**

Click the card to reveal existing feedback and a composer. Focus the textarea to show action buttons.

**Try it:** Click card → see feedback + composer → focus textarea → action buttons appear.
        `}}},render:()=>{const[t,n]=a.useState(!0),[i,r]=a.useState(!1),[s,o]=a.useState(!1),[p,d]=a.useState("");return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>{n(!t),r(!i)},children:[e.jsxs(m,{children:[e.jsx(T,{children:e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"John Mac Giolla..."}),e.jsxs(v,{children:[e.jsx(S,{children:"John Mac Giolla..."}),e.jsxs(k,{children:["May 18, 9:12 AM • 2 ",e.jsx(u,{icon:"feedback","aria-label":"feedback"})]})]})]})}),e.jsxs(M,{visibilityMode:"hover",children:[e.jsx(w,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(w,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Modified text with suggested changes"})}),i&&e.jsxs(e.Fragment,{children:[e.jsx(Q,{}),e.jsxs("div",{style:{paddingBottom:"16px",display:"flex",flexDirection:"column",gap:"12px"},onFocusCapture:()=>o(!0),onClick:l=>l.stopPropagation(),children:[e.jsxs("div",{children:[e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"Sarah Chen"}),e.jsxs(v,{children:[e.jsx(S,{children:"Sarah Chen"}),e.jsx(k,{children:"May 18, 10:30 AM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"This change looks good to me."})]}),e.jsxs("div",{children:[e.jsxs(y,{children:[e.jsx(b,{src:j,alt:"Mike Torres"}),e.jsxs(v,{children:[e.jsx(S,{children:"Mike Torres"}),e.jsx(k,{children:"May 18, 11:15 AM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"Could we keep the original phrasing instead?"})]}),e.jsx(Y,{value:p,onChange:d,placeholder:"Provide feedback..."}),s&&e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"flex-end"},children:[e.jsx(c,{variant:"outlined",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Cancel"}),e.jsx(c,{variant:"primary",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Save"})]})]})]})]})})}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Cards grouped under a heading**

\\\`Card.CardGroup\\\` holds any number of cards of a list under one title, for a list whose cards come from more
than one source. The cards stay descendants of the list, so the arrow key navigation and the focused index run
across the groups as one sequence rather than restarting in each of them.

Scroll the list to see the headings: each one sits in the flow until it would scroll out of view, then pins
to the top of the list. A heading is pinned only within its own group, so the next one pushes it out as it
arrives rather than stacking under it.

A heading can carry a \\\`status\\\`, which joins the accessible name of the group so a screen reader announces it
with the title. It is muted text at the far end of the heading, already formatted so the caller owns the
wording — skip or apply the cards of a group to watch it fall to \\\`0 pending\\\`.
        \`
      }
    }
  },
  render: () => {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
    const [decisions, setDecisions] = useState<Record<string, 'skip' | 'apply'>>({});
    const groups = [{
      title: 'Real Madrid article',
      cards: ['One', 'Two', 'Three']
    }, {
      title: 'Barcelona article',
      cards: ['Four', 'Five', 'Six']
    }, {
      title: 'Athletic Bilbao article',
      cards: ['Seven', 'Eight', 'Nine']
    }];
    const decide = (card: string, decision: 'skip' | 'apply') => setDecisions(current => ({
      ...current,
      [card]: decision
    }));
    const countPending = (cards: string[]) => Arr.filter(cards, card => !Obj.has(decisions, card)).length;
    let index = -1;
    return <div style={{
      width: '316px',
      height: '400px',
      overflowY: 'auto'
    }}>
        <Card.CardListController focusedIndex={focusedIndex} onFocusedIndexChange={setFocusedIndex} selectedIndex={selectedIndex} onSelectCard={setSelectedIndex}>
          <Card.CardList ariaLabel="Suggestions of two documents">
            {groups.map(group => <Card.CardGroup key={group.title} title={group.title} status={\`\${countPending(group.cards)} pending\`}>
                {group.cards.map(card => {
              index++;
              return <Card.Root key={card} index={index} hasDecision={Obj.has(decisions, card)}>
                      <Card.Body>
                        <p style={{
                    margin: 0
                  }}>{\`Suggestion \${card}\`}</p>
                      </Card.Body>
                      <Card.Actions>
                        <Button variant="outlined" onClick={e => {
                    e.stopPropagation();
                    decide(card, 'skip');
                  }}>
                          <Icon icon="close" />
                          Skip
                        </Button>
                        <Button variant="outlined" onClick={e => {
                    e.stopPropagation();
                    decide(card, 'apply');
                  }}>
                          <Icon icon="checkmark" />
                          Apply
                        </Button>
                      </Card.Actions>
                    </Card.Root>;
            })}
              </Card.CardGroup>)}
          </Card.CardList>
        </Card.CardListController>
      </div>;
  }
}`,...N.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card.Expansion API Example**

Demonstrates the \\\`Card.Expansion\\\` compound components:
- \\\`Card.Expansion\\\`: Wrapper with controlled state
- \\\`Card.ExpansionTrigger\\\`: Button that toggles expansion (requires single interactive child)
- \\\`Card.ExpansionContent\\\`: Animated collapsible content region

**Try it:** Click "View feedback (2)" to expand, click again to collapse.
        \`
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <div style={{
      width: '316px'
    }}>
        <Card.Root>
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="John Mac Giolla..." />
                <Profile.Body>
                  <Profile.Heading>John Mac Giolla...</Profile.Heading>
                  <Profile.Subheading>
                    May 18, 9:12 AM • 2 <Icon icon="feedback" aria-label="feedback" />
                  </Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>Modified text with suggested changes</p>
          </Card.Body>
          <Card.Expansion open={open} onOpenChange={setOpen}>
            <Card.ExpansionTrigger>
              <Button variant="outlined" className="tox-button--stretch">
                View feedback (2)
              </Button>
            </Card.ExpansionTrigger>
            <Card.ExpansionContent>
              <div>
                <Profile.Root>
                  <Profile.Image src={AVATAR_URL} alt="Sarah Chen" />
                  <Profile.Body>
                    <Profile.Heading>Sarah Chen</Profile.Heading>
                    <Profile.Subheading>May 18, 10:30 AM</Profile.Subheading>
                  </Profile.Body>
                </Profile.Root>
                <p style={{
                margin: '8px 0 0'
              }}>This change looks good to me.</p>
              </div>
              <div>
                <Profile.Root>
                  <Profile.Image src={AVATAR_URL} alt="Mike Torres" />
                  <Profile.Body>
                    <Profile.Heading>Mike Torres</Profile.Heading>
                    <Profile.Subheading>May 18, 11:15 AM</Profile.Subheading>
                  </Profile.Body>
                </Profile.Root>
                <p style={{
                margin: '8px 0 0'
              }}>Could we keep the original phrasing instead?</p>
              </div>
            </Card.ExpansionContent>
          </Card.Expansion>
        </Card.Root>
      </div>;
  }
}`,...q.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card — Provide Feedback (Suggested Edits)**

Click the card to reveal the feedback composer. Focus the textarea to show action buttons.

**Try it:** Click the card → focus textarea → Cancel hides buttons, keeps textarea visible.
        \`
      }
    }
  },
  render: () => {
    const [selected, setSelected] = useState(true);
    const [threadOpen, setThreadOpen] = useState(false);
    const [actionsVisible, setActionsVisible] = useState(false);
    const [feedback, setFeedback] = useState('');
    return <div style={{
      width: '316px'
    }}>
        <Card.Root selected={selected} onSelect={() => {
        setSelected(!selected);
        setThreadOpen(!threadOpen);
      }}>
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
          }}>Modified text</p>
          </Card.Body>
          {threadOpen && <>
              <Card.Divider />
              <div style={{
            paddingBottom: '16px'
          }} onFocusCapture={() => setActionsVisible(true)} onClick={e => e.stopPropagation()}>
                <AutoResizingTextarea value={feedback} onChange={setFeedback} placeholder="Provide feedback..." />
                {actionsVisible && <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '8px'
            }}>
                    <Button variant="outlined" onClick={e => {
                e.stopPropagation();
                setFeedback('');
                setActionsVisible(false);
              }}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={e => {
                e.stopPropagation();
                setFeedback('');
                setActionsVisible(false);
              }}>
                      Save
                    </Button>
                  </div>}
              </div>
            </>}
        </Card.Root>
      </div>;
  }
}`,...z.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card — Comment Thread (Comments)**

Click the card to reveal existing replies and a composer. Focus the textarea to show action buttons.

**Try it:** Click card → see replies + composer → focus textarea → action buttons appear.
        \`
      }
    }
  },
  render: () => {
    const [selected, setSelected] = useState(true);
    const [threadOpen, setThreadOpen] = useState(false);
    const [actionsVisible, setActionsVisible] = useState(false);
    const [reply, setReply] = useState('');
    return <div style={{
      width: '316px'
    }}>
        <Card.Root selected={selected} onSelect={() => {
        setSelected(!selected);
        setThreadOpen(!threadOpen);
      }}>
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="Jane Smith" />
                <Profile.Body>
                  <Profile.Heading>Jane Smith</Profile.Heading>
                  <Profile.Subheading>
                    May 19, 2:45 PM • 2 <Icon icon="feedback" aria-label="comments" />
                  </Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
          </Card.Header>
          <Card.Body>
            <p style={{
            margin: 0
          }}>
              Can we clarify this section before publishing?
            </p>
          </Card.Body>

          {threadOpen && <>
              <Card.Divider />
              <div style={{
            paddingBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }} onFocusCapture={() => setActionsVisible(true)} onClick={e => e.stopPropagation()}>
                <div>
                  <Profile.Root>
                    <Profile.Image src={AVATAR_URL} alt="Alex Rivera" />
                    <Profile.Body>
                      <Profile.Heading>Alex Rivera</Profile.Heading>
                      <Profile.Subheading>May 19, 3:10 PM</Profile.Subheading>
                    </Profile.Body>
                  </Profile.Root>
                  <p style={{
                margin: '8px 0 0'
              }}>Agreed — the wording is ambiguous.</p>
                </div>
                <div>
                  <Profile.Root>
                    <Profile.Image src={AVATAR_URL} alt="Sam Lee" />
                    <Profile.Body>
                      <Profile.Heading>Sam Lee</Profile.Heading>
                      <Profile.Subheading>May 19, 4:02 PM</Profile.Subheading>
                    </Profile.Body>
                  </Profile.Root>
                  <p style={{
                margin: '8px 0 0'
              }}>I can take a pass on a rewrite.</p>
                </div>

                <AutoResizingTextarea value={reply} onChange={setReply} placeholder="Add comment..." />
                {actionsVisible && <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end'
            }}>
                    <Button variant="outlined" onClick={e => {
                e.stopPropagation();
                setReply('');
                setActionsVisible(false);
              }}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={e => {
                e.stopPropagation();
                setReply('');
                setActionsVisible(false);
              }}>
                      Comment
                    </Button>
                  </div>}
              </div>
            </>}
        </Card.Root>
      </div>;
  }
}`,...K.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Card — Feedback Thread (Suggested Edits)**

Click the card to reveal existing feedback and a composer. Focus the textarea to show action buttons.

**Try it:** Click card → see feedback + composer → focus textarea → action buttons appear.
        \`
      }
    }
  },
  render: () => {
    const [selected, setSelected] = useState(true);
    const [threadOpen, setThreadOpen] = useState(false);
    const [actionsVisible, setActionsVisible] = useState(false);
    const [reply, setReply] = useState('');
    return <div style={{
      width: '316px'
    }}>
        <Card.Root selected={selected} onSelect={() => {
        setSelected(!selected);
        setThreadOpen(!threadOpen);
      }}>
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="John Mac Giolla..." />
                <Profile.Body>
                  <Profile.Heading>John Mac Giolla...</Profile.Heading>
                  <Profile.Subheading>
                    May 18, 9:12 AM • 2 <Icon icon="feedback" aria-label="feedback" />
                  </Profile.Subheading>
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
          }}>Modified text with suggested changes</p>
          </Card.Body>

          {threadOpen && <>
              <Card.Divider />
              <div style={{
            paddingBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }} onFocusCapture={() => setActionsVisible(true)} onClick={e => e.stopPropagation()}>
                <div>
                  <Profile.Root>
                    <Profile.Image src={AVATAR_URL} alt="Sarah Chen" />
                    <Profile.Body>
                      <Profile.Heading>Sarah Chen</Profile.Heading>
                      <Profile.Subheading>May 18, 10:30 AM</Profile.Subheading>
                    </Profile.Body>
                  </Profile.Root>
                  <p style={{
                margin: '8px 0 0'
              }}>This change looks good to me.</p>
                </div>
                <div>
                  <Profile.Root>
                    <Profile.Image src={AVATAR_URL} alt="Mike Torres" />
                    <Profile.Body>
                      <Profile.Heading>Mike Torres</Profile.Heading>
                      <Profile.Subheading>May 18, 11:15 AM</Profile.Subheading>
                    </Profile.Body>
                  </Profile.Root>
                  <p style={{
                margin: '8px 0 0'
              }}>Could we keep the original phrasing instead?</p>
                </div>

                <AutoResizingTextarea value={reply} onChange={setReply} placeholder="Provide feedback..." />
                {actionsVisible && <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end'
            }}>
                    <Button variant="outlined" onClick={e => {
                e.stopPropagation();
                setReply('');
                setActionsVisible(false);
              }}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={e => {
                e.stopPropagation();
                setReply('');
                setActionsVisible(false);
              }}>
                      Save
                    </Button>
                  </div>}
              </div>
            </>}
        </Card.Root>
      </div>;
  }
}`,...W.parameters?.docs?.source}}};const Je=["Default","LongContent","WithActionButtons","CardStates","SidebarDensity","KeyboardNavigation","GroupedCards","SkeletonLoading","WithHeaderActions","HeaderActionsAlwaysVisible","HeaderActionsOnly","ExpansionBasic","ExpansionProvideFeedback","ExpansionCommentReplies","ExpansionFeedbackReplies"];export{V as CardStates,E as Default,q as ExpansionBasic,K as ExpansionCommentReplies,W as ExpansionFeedbackReplies,z as ExpansionProvideFeedback,N as GroupedCards,J as HeaderActionsAlwaysVisible,U as HeaderActionsOnly,O as KeyboardNavigation,L as LongContent,D as SidebarDensity,_ as SkeletonLoading,F as WithActionButtons,G as WithHeaderActions,Je as __namedExportsOrder,Ge as default};
