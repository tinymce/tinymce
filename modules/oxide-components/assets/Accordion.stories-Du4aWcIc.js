import{r as a,j as e}from"./iframe-m8jlWi5a.js";import{g as V}from"./icons-BH388hKR.js";import{A as q}from"./AutoResizingTextarea-BnN_tguZ.js";import{B as C}from"./Button-C4Pj9Hl_.js";import{R as _,T as k,C as P}from"./Dropdown-aYgGxssW.js";import{I as E}from"./Icon-B82XuRAQ.js";import{R as L,I as b}from"./Menu-DwCcKtyP.js";import{U as W}from"./UniverseProvider-6Km2qX_O.js";import{c as O,f as Q}from"./Strings-0z8lz2Ma.js";import{a as B,O as M,n as X,i as Y}from"./Optional-C7ZieBtS.js";import{b as Z}from"./KeyboardNavigationHooks-DDqxoP3O.js";import{a as H,e as S}from"./Bem-uABtowwn.js";import{g as ee}from"./Obj-DJRegViB.js";import"./preload-helper-PPVm8Dsz.js";import"./SugarElement-v4NJLiy_.js";import"./Visibility-HiPE8kkv.js";import"./Context-D-gsCzRv.js";import"./Id--8xy-NHg.js";import"./Num-xrWELwUY.js";import"./Universe-DM4c6Udm.js";import"./PredicateFind-cjflXcNJ.js";const x='button, a, input, textarea, select, [contenteditable], [role="textbox"]',U=a.createContext(null),ne=()=>{const t=a.useContext(U);if(t===null)throw new Error("Accordion components must be used within Accordion.Root");return t},G=({children:t,allowMultiple:g=!1,defaultExpanded:o=[],expanded:v,onExpandedChange:d})=>{const[y,l]=a.useState(o),s=a.useRef(null),f=B(v),p=f?v:y,i=a.useCallback(m=>{let c;O(p,m)?c=Q(p,j=>j!==m):g?c=[...p,m]:c=[m],f?d?.(c):l(c)},[p,g,f,d]),T=a.useMemo(()=>({expandedItems:p,toggleItem:i,allowMultiple:g}),[p,i,g]);return Z({containerRef:s,selector:'.tox-accordion__item:not([aria-disabled="true"])',allowVertical:!0,allowHorizontal:!1,cycles:!1,focusIn:!0,execute:m=>{const c=document.activeElement;return c?.matches(x)??!1?M.none():c===m.dom?M.none():(m.dom.click(),M.some(!0))}}),e.jsx(U.Provider,{value:T,children:e.jsx("div",{ref:s,className:"tox-accordion",tabIndex:0,children:t})})},I=({id:t,title:g,disabled:o=!1,headingLevel:v="h3",iconPosition:d="start",children:y})=>{const{expandedItems:l,toggleItem:s}=ne(),f=`tox-${t}-content`,p=`tox-${t}-header`,i=O(l,t),T=v,m=a.useCallback(()=>{o||s(t)},[o,s,t]),c=a.useCallback(n=>{const r=n.target,u=n.currentTarget;!r.closest(H("tox-accordion","header"))&&r!==u||r!==u&&(r.matches(x)||r.closest(x))||(u.focus(),o||s(t))},[o,s,t]),j=a.useCallback(n=>{if(n.key!=="Enter"&&n.key!==" "||(document.activeElement?.matches(x)??!1))return;const h=n.target,D=n.currentTarget;if(h===D)n.preventDefault(),o||s(t);else{if(h.matches(x)||h.closest(x))return;n.preventDefault(),o||s(t)}},[o,s,t]),K=a.useCallback(n=>{if(n.key!=="Escape")return;const r=n.target,u=n.currentTarget;r!==u&&(n.preventDefault(),u.focus(),r.matches(x)||n.stopPropagation())},[]),$=S("tox-accordion","item",{expanded:i}),z=S("tox-accordion","header",{expanded:i,disabled:o,"icon-end":d==="end"}),J=S("tox-accordion","content",{expanded:i,collapsed:!i}),R=e.jsx("span",{className:"tox-accordion__header-icon",children:e.jsx(E,{icon:i?"chevron-up":"chevron-down"})}),N=e.jsx("span",{className:"tox-accordion__header-text",children:g});return e.jsxs("div",{className:$,tabIndex:-1,"aria-disabled":o,onMouseDown:n=>{const r=n.target,u=n.currentTarget,h=r.closest(H("tox-accordion","header"));(B(h)||r===u)&&(n.currentTarget.focus(),n.preventDefault())},onClick:c,onKeyDown:n=>{j(n),K(n)},children:[e.jsx(T,{className:"tox-accordion__heading",children:e.jsx("button",{id:p,type:"button",className:z,"aria-expanded":i,"aria-controls":f,"aria-disabled":o,onClick:m,disabled:o,tabIndex:-1,children:d==="start"?e.jsxs(e.Fragment,{children:[R,N]}):e.jsxs(e.Fragment,{children:[N,R]})})}),e.jsx("div",{id:f,role:"region","aria-labelledby":p,"aria-hidden":!i,className:J,children:e.jsx("div",{className:"tox-accordion__content-inner",children:y})})]})},F=V(),te={"chevron-down":F["chevron-down"],"chevron-up":F["chevron-up"]},oe={getIcon:t=>ee(te,t).getOrDie("Failed to get icon"),translate:Y},Ce={title:"components/Accordion",component:G,decorators:[t=>e.jsx(W,{resources:oe,children:e.jsx(t,{})})],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},tags:["autodocs"],args:{}},w={parameters:{docs:{description:{story:`
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
        `}}},args:{allowMultiple:!1,defaultExpanded:["item1"]},argTypes:{allowMultiple:{control:"boolean",description:"Allow multiple items to be expanded at once"},defaultExpanded:{control:"object",description:"Array of item IDs expanded by default"}},render:t=>{const[g,o]=a.useState("longer"),[v,d]=a.useState("gpt-4"),y={"gpt-4":"GPT-4","gpt-3000":"GPT-3000",claude:"Claude"},l=()=>document.querySelector("[popover]")?.hidePopover?.();return e.jsx("div",{className:"tox",style:{width:"400px"},children:e.jsxs(G,{...t,children:[e.jsx(I,{id:"item1",title:"Proofread",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Check the text for errors in grammar, spelling, and punctuation."}),e.jsx(C,{variant:"primary",children:"Run"})]})}),e.jsx(I,{id:"item2",title:"Adjust length",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Shorten or lengthen the text as needed."}),e.jsxs(_,{side:"bottom",align:"start",gap:2,children:[e.jsx(k,{children:e.jsxs("div",{className:"tox-selectfield",children:[e.jsx("button",{type:"button","aria-haspopup":"listbox",children:g==="shorter"?"Shorter":"Longer"}),e.jsx(E,{icon:"chevron-down"})]})}),e.jsx(P,{children:e.jsxs(L,{children:[e.jsx(b,{onAction:()=>{o("shorter"),l()},children:"Shorter"}),e.jsx(b,{onAction:()=>{o("longer"),l()},children:"Longer"})]})})]}),e.jsx(C,{variant:"primary",children:"Run"})]})}),e.jsx(I,{id:"item3",title:"Custom",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Enter a custom command for a specific review."}),e.jsx(q,{value:"",placeholder:"Type a custom command",onChange:X}),e.jsxs("div",{className:"tox-button-group",children:[e.jsx(C,{variant:"primary",children:"Run"}),e.jsxs(_,{side:"top",align:"start",gap:2,children:[e.jsx(k,{children:e.jsxs("button",{type:"button",className:"tox-accordion__model-button",children:[y[v]||"Model",e.jsx(E,{icon:"chevron-down"})]})}),e.jsx(P,{children:e.jsxs(L,{children:[e.jsx(b,{onAction:()=>{d("gpt-4"),l()},children:"GPT-4"}),e.jsx(b,{onAction:()=>{d("gpt-3000"),l()},children:"GPT-3000"}),e.jsx(b,{onAction:()=>{d("claude"),l()},children:"Claude"})]})})]})]})]})}),e.jsx(I,{id:"item4",title:"Disabled Example",iconPosition:"end",disabled:!0,children:e.jsx("div",{className:"tox-form__group",children:e.jsx("p",{children:"This item is disabled."})})})]})})}},Me=["Barebone","Styled"];w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};export{w as Barebone,A as Styled,Me as __namedExportsOrder,Ce as default};
