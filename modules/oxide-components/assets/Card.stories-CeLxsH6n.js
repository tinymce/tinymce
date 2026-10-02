import{r as a,j as e}from"./iframe-BRdlIcBk.js";import{g as ee}from"./icons-BH388hKR.js";import{A as z}from"./AutoResizingTextarea-DtDFkRF0.js";import{B as c}from"./Button-xNLclziS.js";import{E as te}from"./ExpandableBox-BgweUxoY.js";import{I as u}from"./Icon-BYpotT3F.js";import{I as k}from"./IconButton-D51VNRgP.js";import{U as ne}from"./UniverseProvider-CR8E_2Ps.js";import{b as ae,e as Q}from"./Bem-Du84Tdvq.js";import{C as oe,u as X,e as se,a as h,H as m,c as x,A as g,f as w,R as C,I as f,B as y,b,S as v,E as ie,g as re,h as de,D as K,i as R}from"./Card-zCkK3mEX.js";import{a as ce,O as le,i as pe}from"./Optional-CwIPeCD0.js";import{b as ue}from"./KeyboardNavigationHooks-DJFsMcJx.js";import{g as he}from"./Obj-BEXbhZhc.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-jw9k3Vcm.js";import"./Visibility-HiPE8kkv.js";import"./Universe-Bvehd_RT.js";import"./Strings-DwL7BECk.js";import"./PredicateFind--7pRSCFh.js";import"./Num-xrWELwUY.js";const Y=t=>(t.dom.click(),le.some(!0)),B=({children:t,focusedIndex:n,onFocusedIndexChange:i,selectedIndex:r,onSelectCard:s})=>{const o=a.useMemo(()=>({focusedIndex:n,selectedIndex:r,onFocusedIndexChange:i,onSelectCard:s}),[n,r,i,s]);return e.jsx(oe.Provider,{value:o,children:t})},Z=({children:t,className:n,ariaLabel:i,cycles:r,focusedIndex:s,selectedIndex:o,setFocusedIndex:p,onSelectCard:d,execute:l})=>{const A=a.useRef(null);a.useEffect(()=>{A.current?.querySelectorAll(".tox-card")[s]?.scrollIntoView({block:"nearest",behavior:"smooth"})},[s]);const G=a.useMemo(()=>({focusedIndex:s,selectedIndex:o,setFocusedIndex:p,onSelectCard:d}),[s,o,p,d]);ue({containerRef:A,selector:".tox-card",allowVertical:!0,allowHorizontal:!1,cycles:r,closest:!1,execute:l});const q=ae("tox-card-list")+(ce(n)?` ${n}`:"");return e.jsx(se.Provider,{value:G,children:e.jsx("div",{ref:A,role:"listbox","aria-label":i??"Card list",className:q,children:t})})},xe=({children:t,className:n,ariaLabel:i,cycles:r=!1,execute:s=Y})=>{const o=X();if(o===null)throw new Error("CardList: Controlled mode requires CardListController wrapper");const p=a.useCallback(l=>{o.onFocusedIndexChange(l)},[o]),d=a.useCallback(l=>{o.onSelectCard?.(l)},[o]);return e.jsx(Z,{children:t,className:n,ariaLabel:i,cycles:r,focusedIndex:o.focusedIndex,selectedIndex:o.selectedIndex,setFocusedIndex:p,onSelectCard:d,execute:s})},me=({children:t,className:n,ariaLabel:i,cycles:r=!1,defaultFocusedIndex:s=0,defaultSelectedIndex:o,onSelectCard:p,execute:d=Y})=>{const[l,A]=a.useState(s),[G,q]=a.useState(o),W=a.useCallback($=>{p?.($),q($)},[p]);return e.jsx(Z,{children:t,className:n,ariaLabel:i,cycles:r,focusedIndex:l,selectedIndex:G,setFocusedIndex:A,onSelectCard:W,execute:d})},j=t=>X()!==null?e.jsx(xe,{...t}):e.jsx(me,{...t});try{B.displayName="CardListController",B.__docgenInfo={description:"",displayName:"CardListController",props:{focusedIndex:{defaultValue:null,description:"Index of the currently focused card (required).",name:"focusedIndex",required:!0,type:{name:"number"}},onFocusedIndexChange:{defaultValue:null,description:"Callback fired when the focused index should change (required).",name:"onFocusedIndexChange",required:!0,type:{name:"(index: number) => void"}},selectedIndex:{defaultValue:null,description:"Index of the currently selected card.",name:"selectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:"Callback fired when a card is selected.",name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}}}}}catch{}try{j.displayName="CardList",j.__docgenInfo={description:"",displayName:"CardList",props:{className:{defaultValue:null,description:"Optional CSS class name to apply to the list container.",name:"className",required:!1,type:{name:"string"}},ariaLabel:{defaultValue:null,description:"Accessible label for the card list.",name:"ariaLabel",required:!1,type:{name:"string"}},cycles:{defaultValue:{value:"false"},description:"Whether to allow cycling through cards with arrow keys.",name:"cycles",required:!1,type:{name:"boolean"}},defaultFocusedIndex:{defaultValue:{value:"0"},description:`Index of the initially focused card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultFocusedIndex",required:!1,type:{name:"number"}},defaultSelectedIndex:{defaultValue:null,description:`Index of the initially selected card (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"defaultSelectedIndex",required:!1,type:{name:"number"}},onSelectCard:{defaultValue:null,description:`Callback fired when a card is selected (uncontrolled mode only).
Ignored when used inside CardListController.`,name:"onSelectCard",required:!1,type:{name:"((index: number) => void)"}},execute:{defaultValue:{value:`(focused: SugarElement<HTMLElement>): Optional<boolean> => {
  focused.dom.click();
  return Optional.some(true);
}`},description:"Handler for Enter/Space on the focused card. Return `Optional.some(true)` when handled.\nDefaults to clicking the focused card.",name:"execute",required:!1,type:{name:"((focused: SugarElement<HTMLElement>) => Optional<boolean>)"}}}}}catch{}const P=ee(),ge={checkmark:P.checkmark,close:P.close,"chevron-down":P["chevron-down"],"chevron-up":P["chevron-up"],feedback:P.feedback},Ce={getIcon:t=>he(ge,t).getOr(`<svg id="${t}"></svg>`),translate:pe},S='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%234A90E2"/%3E%3Ctext x="18" y="24" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif"%3EJM%3C/text%3E%3C/svg%3E',De={title:"components/Card",component:h,decorators:[t=>e.jsx(ne,{resources:Ce,children:e.jsx("div",{className:"tox",children:e.jsx(t,{})})})],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},tags:["autodocs"],args:{}},I={parameters:{docs:{description:{story:`
**Default Card**

A basic card with header, body content, and action buttons.
This demonstrates the minimal setup needed for a functional card.
Buttons use Secondary style with icons as specified, positioned on the left with 8px gap.

**Click the card** to see the selected state (2px blue border).

Spacing: 12px padding from card edge, 12px gap between sections.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(m,{children:"Review Suggestion"}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(g,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},T={parameters:{docs:{description:{story:`
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        `}}},render:()=>{const[t,n]=a.useState(!1),[i,r]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(m,{title:"Lengthy Review"}),e.jsx(x,{children:e.jsx(te,{maxHeight:80,expanded:i,onToggle:()=>r(!i),children:e.jsx("p",{style:{margin:0},children:`Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance in ways no other club matches. The club has been home to football's greatest talents: Pelé called it his "second home," Maradona dazzled at Camp Nou, and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona's La Masia academy is football's most successful youth system, producing world-class talents like Xavi, Iniesta, Puyol, and countless others who embody the club's values.`})})}),e.jsxs(g,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},H={parameters:{docs:{description:{story:`
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(m,{children:"Review Suggestion"}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(g,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})}},M={parameters:{docs:{description:{story:`
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        `}}},render:()=>{const[t,n]=a.useState(0),[i,r]=a.useState(void 0);return e.jsx("div",{style:{width:"316px"},children:e.jsx(B,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:r,children:e.jsxs(j,{ariaLabel:"Review suggestions with different states",children:[e.jsxs(h,{index:0,children:[e.jsx(m,{children:"Review Suggestion"}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"This card has no status yet."})}),e.jsxs(g,{children:[e.jsxs(c,{variant:"outlined",onClick:s=>s.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:s=>s.stopPropagation(),children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]}),e.jsxs(h,{index:1,hasDecision:!0,children:[e.jsx(m,{children:e.jsx("div",{className:Q("tox-card","header-label"),children:"Applied"})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been applied."})}),e.jsx(g,{children:e.jsxs(c,{variant:"outlined",onClick:s=>s.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Revert"]})})]}),e.jsxs(h,{index:2,hasDecision:!0,children:[e.jsx(m,{children:e.jsx("div",{className:Q("tox-card","header-label"),children:"Skipped"})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"This suggestion has been skipped."})}),e.jsx(g,{children:e.jsxs(c,{variant:"outlined",onClick:s=>s.stopPropagation(),children:[e.jsx(u,{icon:"close"}),"Revert"]})})]})]})})})}},E={parameters:{docs:{description:{story:`
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (440px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        `}}},render:()=>{const[t,n]=a.useState(0),[i,r]=a.useState(void 0),s=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"440px",maxHeight:"500px",overflowY:"auto",padding:"12px",backgroundColor:"#f5f5f5",borderRadius:"6px"},children:e.jsx(B,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:r,children:e.jsx(j,{ariaLabel:"Review suggestions",children:s.map((o,p)=>e.jsxs(h,{index:p,children:[e.jsx(m,{title:o.title}),e.jsx(x,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:o.content})}),e.jsxs(g,{children:[e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),r(void 0)},children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),r(p)},children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]},o.id))})})})}},L={parameters:{docs:{description:{story:`
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
        `}}},render:()=>{const[t,n]=a.useState(0),[i,r]=a.useState(void 0),s=[{id:1,title:"Grammar Fix",content:'Change "institution club" to "club institution"'},{id:2,title:"Spelling Correction",content:'Correct "tiki-taka" spelling'},{id:3,title:"Clarity Improvement",content:"Simplify complex sentence structure"},{id:4,title:"Style Enhancement",content:"Add transition words for better flow"},{id:5,title:"Fact Check",content:"Verify the 2008-2012 era claim"}];return e.jsx("div",{style:{width:"316px"},children:e.jsx(B,{focusedIndex:t,onFocusedIndexChange:n,selectedIndex:i,onSelectCard:r,children:e.jsx(j,{ariaLabel:"Review suggestions",cycles:!1,children:s.map((o,p)=>e.jsxs(h,{index:p,children:[e.jsx(m,{title:o.title}),e.jsx(x,{children:e.jsx("p",{style:{margin:0,fontSize:"14px"},children:o.content})}),e.jsxs(g,{children:[e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),r(void 0)},children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",onClick:d=>{d.stopPropagation(),r(p)},children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]},o.id))})})})}},F={parameters:{docs:{description:{story:`
**Skeleton Loading State with Transition**

Demonstrates the \`loading\` prop on Card.Root that internally handles skeleton state.
The card automatically transitions from skeleton to loaded content when \`loading\` changes from \`true\` to \`false\`.

This matches the Suggested Edits pattern where the card container remains the same but content switches between skeleton and loaded state.

**Try it:** The card shows skeleton for 2 seconds, then transitions to show the actual content.
        `}}},render:()=>{const[t,n]=a.useState(!0);return a.useEffect(()=>{const i=setTimeout(()=>n(!1),2e3);return()=>clearTimeout(i)},[]),e.jsx("div",{style:{width:"316px"},children:e.jsx(j,{children:e.jsxs(h,{loading:t,index:0,children:[e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance."})}),e.jsxs(g,{children:[e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"close"}),"Skip"]}),e.jsxs(c,{variant:"outlined",children:[e.jsx(u,{icon:"checkmark"}),"Apply"]})]})]})})})}},V={parameters:{docs:{description:{story:`
**Card with Header Actions and Profile**

Demonstrates the new unified card design with:
- \`Card.HeaderContent\`: Left-side content (Profile component with avatar, name, timestamp)
- \`Card.HeaderActions\`: Right-side action buttons with hover visibility
- Action buttons appear on hover/focus by default (\`visibilityMode="hover"\`)

This pattern is used across TinyMCE AI and Suggested Edits for a consistent user experience.

**Try it:** Hover over the card to see the header action buttons appear.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsxs(m,{children:[e.jsx(w,{children:e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"John Mac Giolla..."}),e.jsxs(y,{children:[e.jsx(b,{children:"John Mac Giolla..."}),e.jsx(v,{children:"May 18, 9:12 AM"})]})]})}),e.jsxs(R,{visibilityMode:"hover",children:[e.jsx(k,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(k,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Modified text"})}),e.jsx(g,{children:e.jsx(c,{variant:"outlined",className:"tox-button--stretch",children:"Provide feedback"})})]})})}},D={parameters:{docs:{description:{story:`
**Card with Always Visible Header Actions**

Same as the previous story, but with \`visibilityMode="always"\` on HeaderActions.
The action buttons remain visible at all times instead of only on hover.

This is useful when action visibility is important for discoverability.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsxs(m,{children:[e.jsx(w,{children:e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"Jane Smith"}),e.jsxs(y,{children:[e.jsx(b,{children:"Jane Smith"}),e.jsx(v,{children:"May 19, 2:45 PM"})]})]})}),e.jsxs(R,{visibilityMode:"always",children:[e.jsx(k,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(k,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Added new content"})}),e.jsx(g,{children:e.jsx(c,{variant:"outlined",className:"tox-button--stretch",children:"Provide feedback"})})]})})}},O={parameters:{docs:{description:{story:`
**Card with Header Actions Only**

Demonstrates the edge case where \`Card.HeaderActions\` is used without \`Card.HeaderContent\`.
The actions are automatically aligned to the right side of the header.

This is useful for simple cards that only need action buttons without user info or labels.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>n(!t),children:[e.jsx(m,{children:e.jsxs(R,{visibilityMode:"always",children:[e.jsx(k,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(k,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Quick action card without header content"})}),e.jsx(g,{children:e.jsx(c,{variant:"outlined",className:"tox-button--stretch",children:"More options"})})]})})}},N={parameters:{docs:{description:{story:`
**Card.Expansion API Example**

Demonstrates the \`Card.Expansion\` compound components:
- \`Card.Expansion\`: Wrapper with controlled state
- \`Card.ExpansionTrigger\`: Button that toggles expansion (requires single interactive child)
- \`Card.ExpansionContent\`: Animated collapsible content region

**Try it:** Click "View feedback (2)" to expand, click again to collapse.
        `}}},render:()=>{const[t,n]=a.useState(!1);return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{children:[e.jsx(m,{children:e.jsx(w,{children:e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"John Mac Giolla..."}),e.jsxs(y,{children:[e.jsx(b,{children:"John Mac Giolla..."}),e.jsxs(v,{children:["May 18, 9:12 AM • 2 ",e.jsx(u,{icon:"feedback","aria-label":"feedback"})]})]})]})})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Modified text with suggested changes"})}),e.jsxs(ie,{open:t,onOpenChange:n,children:[e.jsx(re,{children:e.jsx(c,{variant:"outlined",className:"tox-button--stretch",children:"View feedback (2)"})}),e.jsxs(de,{children:[e.jsxs("div",{children:[e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"Sarah Chen"}),e.jsxs(y,{children:[e.jsx(b,{children:"Sarah Chen"}),e.jsx(v,{children:"May 18, 10:30 AM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"This change looks good to me."})]}),e.jsxs("div",{children:[e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"Mike Torres"}),e.jsxs(y,{children:[e.jsx(b,{children:"Mike Torres"}),e.jsx(v,{children:"May 18, 11:15 AM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"Could we keep the original phrasing instead?"})]})]})]})]})})}},_={parameters:{docs:{description:{story:`
**Card — Provide Feedback (Suggested Edits)**

Click the card to reveal the feedback composer. Focus the textarea to show action buttons.

**Try it:** Click the card → focus textarea → Cancel hides buttons, keeps textarea visible.
        `}}},render:()=>{const[t,n]=a.useState(!0),[i,r]=a.useState(!1),[s,o]=a.useState(!1),[p,d]=a.useState("");return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>{n(!t),r(!i)},children:[e.jsxs(m,{children:[e.jsx(w,{children:e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"John Mac Giolla..."}),e.jsxs(y,{children:[e.jsx(b,{children:"John Mac Giolla..."}),e.jsx(v,{children:"May 18, 9:12 AM"})]})]})}),e.jsxs(R,{visibilityMode:"hover",children:[e.jsx(k,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(k,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Modified text"})}),i&&e.jsxs(e.Fragment,{children:[e.jsx(K,{}),e.jsxs("div",{style:{paddingBottom:"16px"},onFocusCapture:()=>o(!0),onClick:l=>l.stopPropagation(),children:[e.jsx(z,{value:p,onChange:d,placeholder:"Provide feedback..."}),s&&e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"flex-end",marginTop:"8px"},children:[e.jsx(c,{variant:"outlined",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Cancel"}),e.jsx(c,{variant:"primary",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Save"})]})]})]})]})})}},J={parameters:{docs:{description:{story:`
**Card — Comment Thread (Comments)**

Click the card to reveal existing replies and a composer. Focus the textarea to show action buttons.

**Try it:** Click card → see replies + composer → focus textarea → action buttons appear.
        `}}},render:()=>{const[t,n]=a.useState(!0),[i,r]=a.useState(!1),[s,o]=a.useState(!1),[p,d]=a.useState("");return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>{n(!t),r(!i)},children:[e.jsx(m,{children:e.jsx(w,{children:e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"Jane Smith"}),e.jsxs(y,{children:[e.jsx(b,{children:"Jane Smith"}),e.jsxs(v,{children:["May 19, 2:45 PM • 2 ",e.jsx(u,{icon:"feedback","aria-label":"comments"})]})]})]})})}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Can we clarify this section before publishing?"})}),i&&e.jsxs(e.Fragment,{children:[e.jsx(K,{}),e.jsxs("div",{style:{paddingBottom:"16px",display:"flex",flexDirection:"column",gap:"12px"},onFocusCapture:()=>o(!0),onClick:l=>l.stopPropagation(),children:[e.jsxs("div",{children:[e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"Alex Rivera"}),e.jsxs(y,{children:[e.jsx(b,{children:"Alex Rivera"}),e.jsx(v,{children:"May 19, 3:10 PM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"Agreed — the wording is ambiguous."})]}),e.jsxs("div",{children:[e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"Sam Lee"}),e.jsxs(y,{children:[e.jsx(b,{children:"Sam Lee"}),e.jsx(v,{children:"May 19, 4:02 PM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"I can take a pass on a rewrite."})]}),e.jsx(z,{value:p,onChange:d,placeholder:"Add comment..."}),s&&e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"flex-end"},children:[e.jsx(c,{variant:"outlined",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Cancel"}),e.jsx(c,{variant:"primary",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Comment"})]})]})]})]})})}},U={parameters:{docs:{description:{story:`
**Card — Feedback Thread (Suggested Edits)**

Click the card to reveal existing feedback and a composer. Focus the textarea to show action buttons.

**Try it:** Click card → see feedback + composer → focus textarea → action buttons appear.
        `}}},render:()=>{const[t,n]=a.useState(!0),[i,r]=a.useState(!1),[s,o]=a.useState(!1),[p,d]=a.useState("");return e.jsx("div",{style:{width:"316px"},children:e.jsxs(h,{selected:t,onSelect:()=>{n(!t),r(!i)},children:[e.jsxs(m,{children:[e.jsx(w,{children:e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"John Mac Giolla..."}),e.jsxs(y,{children:[e.jsx(b,{children:"John Mac Giolla..."}),e.jsxs(v,{children:["May 18, 9:12 AM • 2 ",e.jsx(u,{icon:"feedback","aria-label":"feedback"})]})]})]})}),e.jsxs(R,{visibilityMode:"hover",children:[e.jsx(k,{variant:"naked",icon:"close","aria-label":"Reject"}),e.jsx(k,{variant:"naked",icon:"checkmark","aria-label":"Accept"})]})]}),e.jsx(x,{children:e.jsx("p",{style:{margin:0},children:"Modified text with suggested changes"})}),i&&e.jsxs(e.Fragment,{children:[e.jsx(K,{}),e.jsxs("div",{style:{paddingBottom:"16px",display:"flex",flexDirection:"column",gap:"12px"},onFocusCapture:()=>o(!0),onClick:l=>l.stopPropagation(),children:[e.jsxs("div",{children:[e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"Sarah Chen"}),e.jsxs(y,{children:[e.jsx(b,{children:"Sarah Chen"}),e.jsx(v,{children:"May 18, 10:30 AM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"This change looks good to me."})]}),e.jsxs("div",{children:[e.jsxs(C,{children:[e.jsx(f,{src:S,alt:"Mike Torres"}),e.jsxs(y,{children:[e.jsx(b,{children:"Mike Torres"}),e.jsx(v,{children:"May 18, 11:15 AM"})]})]}),e.jsx("p",{style:{margin:"8px 0 0"},children:"Could we keep the original phrasing instead?"})]}),e.jsx(z,{value:p,onChange:d,placeholder:"Provide feedback..."}),s&&e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"flex-end"},children:[e.jsx(c,{variant:"outlined",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Cancel"}),e.jsx(c,{variant:"primary",onClick:l=>{l.stopPropagation(),d(""),o(!1)},children:"Save"})]})]})]})]})})}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}};const Oe=["Default","LongContent","WithActionButtons","CardStates","SidebarDensity","KeyboardNavigation","SkeletonLoading","WithHeaderActions","HeaderActionsAlwaysVisible","HeaderActionsOnly","ExpansionBasic","ExpansionProvideFeedback","ExpansionCommentReplies","ExpansionFeedbackReplies"];export{M as CardStates,I as Default,N as ExpansionBasic,J as ExpansionCommentReplies,U as ExpansionFeedbackReplies,_ as ExpansionProvideFeedback,D as HeaderActionsAlwaysVisible,O as HeaderActionsOnly,L as KeyboardNavigation,T as LongContent,E as SidebarDensity,F as SkeletonLoading,H as WithActionButtons,V as WithHeaderActions,Oe as __namedExportsOrder,De as default};
