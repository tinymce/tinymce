import{r,j as e}from"./iframe-CWoD32K7.js";import{g as z}from"./icons-CodEqhdW.js";import{c as O,f as J}from"./Strings-tLOZuS7x.js";import{i as V,O as _}from"./Optional-DbTLtGQT.js";import{c as W}from"./KeyboardNavigationHooks-CerbKSYL.js";import{a as k,e as M}from"./Bem-BaJhmSJn.js";import{I as S}from"./Icon-0sbNJHhZ.js";import{A as Q}from"./AutoResizingTextarea-B5bYV2eE.js";import{B as E}from"./Button-DIjDgZCf.js";import{R as P,T as L,C as H}from"./Dropdown-CVYPg3bn.js";import{R as q,I}from"./Menu-DT4WlYOR.js";import{U as X}from"./UniverseProvider-B0Up_XOP.js";import{g as Y}from"./Obj-DUQpguIS.js";import{n as Z}from"./Fun--VEwoXIw.js";import"./preload-helper-PPVm8Dsz.js";const x='button, a, input, textarea, select, [contenteditable], [role="textbox"]',U=r.createContext(null),ee=()=>{const t=r.useContext(U);if(t===null)throw new Error("Accordion components must be used within Accordion.Root");return t},T=({children:t,allowMultiple:h=!1,defaultExpanded:o=[],expanded:f,onExpandedChange:c})=>{const[b,l]=r.useState(o),i=r.useRef(null),v=V(f),p=v?f:b,s=r.useCallback(m=>{let d;O(p,m)?d=J(p,j=>j!==m):h?d=[...p,m]:d=[m],v?c?.(d):l(d)},[p,h,v,c]),C=r.useMemo(()=>({expandedItems:p,toggleItem:s,allowMultiple:h}),[p,s,h]);return W({containerRef:i,selector:'.tox-accordion__item:not([aria-disabled="true"])',allowVertical:!0,allowHorizontal:!1,cycles:!1,focusIn:!0,execute:m=>{const d=document.activeElement;return d?.matches(x)??!1?_.none():d===m.dom?_.none():(m.dom.click(),_.some(!0))}}),e.jsx(U.Provider,{value:C,children:e.jsx("div",{ref:i,className:"tox-accordion",tabIndex:0,children:t})})},y=({id:t,title:h,disabled:o=!1,headingLevel:f="h3",iconPosition:c="start",children:b})=>{const{expandedItems:l,toggleItem:i}=ee(),v=`tox-${t}-content`,p=`tox-${t}-header`,s=O(l,t),C=f,m=r.useCallback(()=>{o||i(t)},[o,i,t]),d=r.useCallback(n=>{const a=n.target,u=n.currentTarget;!a.closest(k("tox-accordion","header"))&&a!==u||a!==u&&(a.matches(x)||a.closest(x))||(u.focus(),o||i(t))},[o,i,t]),j=r.useCallback(n=>{if(n.key!=="Enter"&&n.key!==" "||(document.activeElement?.matches(x)??!1))return;const g=n.target,D=n.currentTarget;if(g===D)n.preventDefault(),o||i(t);else{if(g.matches(x)||g.closest(x))return;n.preventDefault(),o||i(t)}},[o,i,t]),B=r.useCallback(n=>{if(n.key!=="Escape")return;const a=n.target,u=n.currentTarget;a!==u&&(n.preventDefault(),u.focus(),a.matches(x)||n.stopPropagation())},[]),G=M("tox-accordion","item",{expanded:s}),K=M("tox-accordion","header",{expanded:s,disabled:o,"icon-end":c==="end"}),$=M("tox-accordion","content",{expanded:s,collapsed:!s}),R=e.jsx("span",{className:"tox-accordion__header-icon",children:e.jsx(S,{icon:s?"chevron-up":"chevron-down"})}),N=e.jsx("span",{className:"tox-accordion__header-text",children:h});return e.jsxs("div",{className:G,tabIndex:-1,"aria-disabled":o,onMouseDown:n=>{const a=n.target,u=n.currentTarget,g=a.closest(k("tox-accordion","header"));(V(g)||a===u)&&(n.currentTarget.focus(),n.preventDefault())},onClick:d,onKeyDown:n=>{j(n),B(n)},children:[e.jsx(C,{className:"tox-accordion__heading",children:e.jsx("button",{id:p,type:"button",className:K,"aria-expanded":s,"aria-controls":v,"aria-disabled":o,onClick:m,disabled:o,tabIndex:-1,children:c==="start"?e.jsxs(e.Fragment,{children:[R,N]}):e.jsxs(e.Fragment,{children:[N,R]})})}),e.jsx("div",{id:v,role:"region","aria-labelledby":p,"aria-hidden":!s,className:$,children:e.jsx("div",{className:"tox-accordion__content-inner",children:b})})]})};try{T.displayName="Root",T.__docgenInfo={description:`Accordion component for displaying collapsible content sections.

Supports both controlled and uncontrolled modes, keyboard navigation,
and proper accessibility attributes.`,displayName:"Root",props:{allowMultiple:{defaultValue:{value:"false"},description:"Allow multiple accordion items to be expanded simultaneously.",name:"allowMultiple",required:!1,type:{name:"boolean"}},defaultExpanded:{defaultValue:{value:"[]"},description:"Array of item IDs that should be expanded by default (uncontrolled mode).",name:"defaultExpanded",required:!1,type:{name:"string[]"}},expanded:{defaultValue:null,description:`Array of item IDs that are currently expanded (controlled mode).
When provided, the component becomes controlled.`,name:"expanded",required:!1,type:{name:"string[]"}},onExpandedChange:{defaultValue:null,description:`Callback fired when the expanded state changes (controlled mode).
@param expanded - Array of currently expanded item IDs`,name:"onExpandedChange",required:!1,type:{name:"((expanded: string[]) => void)"}}}}}catch{}try{y.displayName="Item",y.__docgenInfo={description:`Individual accordion item containing a header button and collapsible content.
Must be used as a child of Accordion.Root.`,displayName:"Item",props:{id:{defaultValue:null,description:`Unique identifier for this accordion item.
Used to track expanded state and for accessibility attributes.`,name:"id",required:!0,type:{name:"string"}},title:{defaultValue:null,description:"Title text displayed in the accordion header button.",name:"title",required:!0,type:{name:"string"}},disabled:{defaultValue:{value:"false"},description:"Disable the accordion item, preventing user interaction.",name:"disabled",required:!1,type:{name:"boolean"}},headingLevel:{defaultValue:{value:"h3"},description:`Semantic heading level for the accordion header.
Important for document outline and screen readers.`,name:"headingLevel",required:!1,type:{name:'"h2" | "h3" | "h4" | "h5" | "h6"'}},iconPosition:{defaultValue:{value:"start"},description:"Position of the chevron icon in the header.",name:"iconPosition",required:!1,type:{name:'"start" | "end"'}}}}}catch{}const F=z(),te={"chevron-down":F["chevron-down"],"chevron-up":F["chevron-up"]},ne={getIcon:t=>Y(te,t).getOrDie("Failed to get icon")},ye={title:"components/Accordion",component:T,decorators:[t=>e.jsx(X,{resources:ne,children:e.jsx(t,{})})],parameters:{layout:"centered",docs:{description:{component:`
The Accordion component provides collapsible content sections with full keyboard navigation and accessibility support.

## Features
- **Controlled & Uncontrolled modes**: Use \`defaultExpanded\` for uncontrolled or \`expanded\`+\`onExpandedChange\` for controlled
- **Single or multi-expand**: Control with \`allowMultiple\` prop
- **Full keyboard support**: Arrow keys, Home, End for navigation
- **Accessibility**: Proper ARIA attributes, semantic headings, focus management
- **Customizable**: Icon position, heading levels, disabled states

## Usage Pattern

The component uses a compound component pattern with two parts:
- \`Accordion.Root\`: Container that manages expansion state
- \`Accordion.Item\`: Individual collapsible sections

## Accessibility

Each accordion item includes:
- Semantic heading elements (configurable via \`headingLevel\`)
- Proper ARIA attributes (\`aria-expanded\`, \`aria-controls\`, \`aria-labelledby\`)
- Keyboard navigation following WAI-ARIA Accordion pattern
- Focus management for intuitive navigation
        `}}},tags:["autodocs","skip-visual-testing"],args:{}},w={parameters:{docs:{description:{story:`
**Native HTML Accordion**

This example uses native HTML \`<details>\` and \`<summary>\` elements.
Simple and works without JavaScript, but lacks advanced features.
        `}}},render:()=>e.jsxs("div",{style:{width:"400px"},children:[e.jsxs("details",{children:[e.jsx("summary",{children:"Proofread"}),e.jsxs("div",{style:{padding:"8px"},children:[e.jsx("p",{children:"Check the text for errors in grammar, spelling, and punctuation."}),e.jsx("button",{children:"Run"})]})]}),e.jsxs("details",{style:{marginTop:"8px"},children:[e.jsx("summary",{children:"Adjust length"}),e.jsxs("div",{style:{padding:"8px"},children:[e.jsx("p",{children:"Shorten or lengthen the text as needed."}),e.jsxs("select",{children:[e.jsx("option",{value:"shorter",children:"Shorter"}),e.jsx("option",{value:"longer",children:"Longer"})]}),e.jsx("button",{style:{marginLeft:"8px"},children:"Run"})]})]}),e.jsxs("details",{style:{marginTop:"8px"},children:[e.jsx("summary",{children:"Custom"}),e.jsxs("div",{style:{padding:"8px"},children:[e.jsx("p",{children:"Enter a custom command for a specific review."}),e.jsx("textarea",{placeholder:"Type a custom command",style:{width:"100%",minHeight:"60px"}}),e.jsxs("div",{style:{marginTop:"8px"},children:[e.jsx("button",{children:"Run"}),e.jsx("button",{style:{marginLeft:"8px"},children:"Model"})]})]})]})]})},A={parameters:{docs:{description:{story:`
**Styled Accordion for TinyMCE AI**

This is the enhanced accordion component used in the TinyMCE AI plugin with full styling and features.

**Features demonstrated:**
- **Single vs Multi-expand**: Toggle \`allowMultiple\` prop to enable multiple items to be expanded simultaneously (default is single-expand mode)
- **Keyboard Navigation**:
  - **Enter/Space**: Toggle accordion item
  - **Arrow Down/Up**: Navigate between headers
  - **Home/End**: Jump to first/last item
- **Controlled State**: Manage expansion state programmatically
- **Icon Position**: Icon can be at start (default) or end of header
- **Disabled State**: Individual items can be disabled
- **Accessibility**: Full ARIA support, semantic headings, focus management

Try using keyboard navigation and toggling the controls below.
        `}}},args:{allowMultiple:!1,defaultExpanded:["item1"]},argTypes:{allowMultiple:{control:"boolean",description:"Allow multiple items to be expanded at once"},defaultExpanded:{control:"object",description:"Array of item IDs expanded by default"}},render:t=>{const[h,o]=r.useState("longer"),[f,c]=r.useState("gpt-4"),b={"gpt-4":"GPT-4","gpt-3000":"GPT-3000",claude:"Claude"},l=()=>document.querySelector("[popover]")?.hidePopover?.();return e.jsx("div",{className:"tox",style:{width:"400px"},children:e.jsxs(T,{...t,children:[e.jsx(y,{id:"item1",title:"Proofread",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Check the text for errors in grammar, spelling, and punctuation."}),e.jsx(E,{variant:"primary",children:"Run"})]})}),e.jsx(y,{id:"item2",title:"Adjust length",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Shorten or lengthen the text as needed."}),e.jsxs(P,{side:"bottom",align:"start",gap:2,children:[e.jsx(L,{children:e.jsxs("div",{className:"tox-selectfield",children:[e.jsx("button",{type:"button","aria-haspopup":"listbox",children:h==="shorter"?"Shorter":"Longer"}),e.jsx(S,{icon:"chevron-down"})]})}),e.jsx(H,{children:e.jsxs(q,{children:[e.jsx(I,{onAction:()=>{o("shorter"),l()},children:"Shorter"}),e.jsx(I,{onAction:()=>{o("longer"),l()},children:"Longer"})]})})]}),e.jsx(E,{variant:"primary",children:"Run"})]})}),e.jsx(y,{id:"item3",title:"Custom",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Enter a custom command for a specific review."}),e.jsx(Q,{value:"",placeholder:"Type a custom command",onChange:Z}),e.jsxs("div",{className:"tox-button-group",children:[e.jsx(E,{variant:"primary",children:"Run"}),e.jsxs(P,{side:"top",align:"start",gap:2,children:[e.jsx(L,{children:e.jsxs("button",{type:"button",className:"tox-accordion__model-button",children:[b[f]||"Model",e.jsx(S,{icon:"chevron-down"})]})}),e.jsx(H,{children:e.jsxs(q,{children:[e.jsx(I,{onAction:()=>{c("gpt-4"),l()},children:"GPT-4"}),e.jsx(I,{onAction:()=>{c("gpt-3000"),l()},children:"GPT-3000"}),e.jsx(I,{onAction:()=>{c("claude"),l()},children:"Claude"})]})})]})]})]})}),e.jsx(y,{id:"item4",title:"Disabled Example",iconPosition:"end",disabled:!0,children:e.jsx("div",{className:"tox-form__group",children:e.jsx("p",{children:"This item is disabled."})})})]})})}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Native HTML Accordion**

This example uses native HTML \\\`<details>\\\` and \\\`<summary>\\\` elements.
Simple and works without JavaScript, but lacks advanced features.
        \`
      }
    }
  },
  render: () => {
    return <div style={{
      width: '400px'
    }}>
        <details>
          <summary>Proofread</summary>
          <div style={{
          padding: '8px'
        }}>
            <p>Check the text for errors in grammar, spelling, and punctuation.</p>
            <button>Run</button>
          </div>
        </details>

        <details style={{
        marginTop: '8px'
      }}>
          <summary>Adjust length</summary>
          <div style={{
          padding: '8px'
        }}>
            <p>Shorten or lengthen the text as needed.</p>
            <select>
              <option value="shorter">Shorter</option>
              <option value="longer">Longer</option>
            </select>
            <button style={{
            marginLeft: '8px'
          }}>Run</button>
          </div>
        </details>

        <details style={{
        marginTop: '8px'
      }}>
          <summary>Custom</summary>
          <div style={{
          padding: '8px'
        }}>
            <p>Enter a custom command for a specific review.</p>
            <textarea placeholder="Type a custom command" style={{
            width: '100%',
            minHeight: '60px'
          }}></textarea>
            <div style={{
            marginTop: '8px'
          }}>
              <button>Run</button>
              <button style={{
              marginLeft: '8px'
            }}>Model</button>
            </div>
          </div>
        </details>
      </div>;
  }
}`,...w.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: \`
**Styled Accordion for TinyMCE AI**

This is the enhanced accordion component used in the TinyMCE AI plugin with full styling and features.

**Features demonstrated:**
- **Single vs Multi-expand**: Toggle \\\`allowMultiple\\\` prop to enable multiple items to be expanded simultaneously (default is single-expand mode)
- **Keyboard Navigation**:
  - **Enter/Space**: Toggle accordion item
  - **Arrow Down/Up**: Navigate between headers
  - **Home/End**: Jump to first/last item
- **Controlled State**: Manage expansion state programmatically
- **Icon Position**: Icon can be at start (default) or end of header
- **Disabled State**: Individual items can be disabled
- **Accessibility**: Full ARIA support, semantic headings, focus management

Try using keyboard navigation and toggling the controls below.
        \`
      }
    }
  },
  args: {
    allowMultiple: false,
    defaultExpanded: ['item1']
  },
  argTypes: {
    allowMultiple: {
      control: 'boolean',
      description: 'Allow multiple items to be expanded at once'
    },
    defaultExpanded: {
      control: 'object',
      description: 'Array of item IDs expanded by default'
    }
  },
  render: args => {
    const [lengthOption, setLengthOption] = useState('longer');
    const [selectedModel, setSelectedModel] = useState('gpt-4');
    const modelNames: Record<string, string> = {
      'gpt-4': 'GPT-4',
      'gpt-3000': 'GPT-3000',
      'claude': 'Claude'
    };
    const closeDropdown = () => document.querySelector<HTMLElement>('[popover]')?.hidePopover?.();
    return <div className="tox" style={{
      width: '400px'
    }}>
        <Accordion.Root {...args}>
          <Accordion.Item id="item1" title="Proofread" iconPosition="end">
            <div className="tox-form__group">
              <p>Check the text for errors in grammar, spelling, and punctuation.</p>
              <Button variant="primary">Run</Button>
            </div>
          </Accordion.Item>
          <Accordion.Item id="item2" title="Adjust length" iconPosition="end">
            <div className="tox-form__group">
              <p>Shorten or lengthen the text as needed.</p>
              <Dropdown.Root side="bottom" align="start" gap={2}>
                <Dropdown.Trigger>
                  <div className="tox-selectfield">
                    <button type="button" aria-haspopup="listbox">
                      {lengthOption === 'shorter' ? 'Shorter' : 'Longer'}
                    </button>
                    <Icon icon="chevron-down" />
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Content>
                  <Menu.Root>
                    <Menu.Item onAction={() => {
                    setLengthOption('shorter');
                    closeDropdown();
                  }}>
                      Shorter
                    </Menu.Item>
                    <Menu.Item onAction={() => {
                    setLengthOption('longer');
                    closeDropdown();
                  }}>
                      Longer
                    </Menu.Item>
                  </Menu.Root>
                </Dropdown.Content>
              </Dropdown.Root>
              <Button variant="primary">Run</Button>
            </div>
          </Accordion.Item>
          <Accordion.Item id="item3" title="Custom" iconPosition="end">
            <div className="tox-form__group">
              <p>Enter a custom command for a specific review.</p>
              <AutoResizingTextarea value="" placeholder="Type a custom command" onChange={Fun.noop} />
              <div className="tox-button-group">
                <Button variant="primary">Run</Button>
                <Dropdown.Root side="top" align="start" gap={2}>
                  <Dropdown.Trigger>
                    <button type="button" className="tox-accordion__model-button">
                      {modelNames[selectedModel] || 'Model'}
                      <Icon icon="chevron-down" />
                    </button>
                  </Dropdown.Trigger>
                  <Dropdown.Content>
                    <Menu.Root>
                      <Menu.Item onAction={() => {
                      setSelectedModel('gpt-4');
                      closeDropdown();
                    }}>
                        GPT-4
                      </Menu.Item>
                      <Menu.Item onAction={() => {
                      setSelectedModel('gpt-3000');
                      closeDropdown();
                    }}>
                        GPT-3000
                      </Menu.Item>
                      <Menu.Item onAction={() => {
                      setSelectedModel('claude');
                      closeDropdown();
                    }}>
                        Claude
                      </Menu.Item>
                    </Menu.Root>
                  </Dropdown.Content>
                </Dropdown.Root>
              </div>
            </div>
          </Accordion.Item>
          <Accordion.Item id="item4" title="Disabled Example" iconPosition="end" disabled>
            <div className="tox-form__group">
              <p>This item is disabled.</p>
            </div>
          </Accordion.Item>
        </Accordion.Root>
      </div>;
  }
}`,...A.parameters?.docs?.source}}};const be=["Barebone","Styled"];export{w as Barebone,A as Styled,be as __namedExportsOrder,ye as default};
