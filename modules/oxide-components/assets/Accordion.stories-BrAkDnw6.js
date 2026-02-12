import{r as s,j as e}from"./iframe-BaQ164Ag.js";import{g as k}from"./icons-3YR3KKdA.js";import{c as E,f as L}from"./Strings-CwVUhXDr.js";import{i as q,O as F}from"./Optional-CuHnBc-7.js";import{c as H}from"./KeyboardNavigationHooks-FiqW_cNW.js";import{e as w}from"./Bem-By0_poOi.js";import{I}from"./Icon-BcR4jqfo.js";import{A as O}from"./AutoResizingTextarea-DBno5uRE.js";import{B as A}from"./Button-DrFUT-hA.js";import{R as M,T as C,C as S}from"./Dropdown-CLcKj9Bk.js";import{R as N,I as g}from"./Menu-CVUM-zGi.js";import{U}from"./UniverseProvider-Z-8FZKah.js";import{g as V}from"./Obj-BYXNADYo.js";import{n as B}from"./Fun--VEwoXIw.js";import"./preload-helper-PPVm8Dsz.js";const D=s.createContext(null),G=()=>{const t=s.useContext(D);if(t===null)throw new Error("Accordion components must be used within Accordion.Root");return t},v=({children:t,allowMultiple:d=!1,defaultExpanded:n=[],expanded:p,onExpandedChange:a})=>{const[h,i]=s.useState(n),x=s.useRef(null),m=q(p),r=m?p:h,o=s.useCallback(l=>{let c;E(r,l)?c=L(r,j=>j!==l):d?c=[...r,l]:c=[l],m?a?.(c):i(c)},[r,d,m,a]),b=s.useMemo(()=>({expandedItems:r,toggleItem:o,allowMultiple:d}),[r,o,d]);return H({containerRef:x,selector:'.tox-accordion__header:not([aria-disabled="true"])',allowVertical:!0,allowHorizontal:!1,cycles:!1,execute:l=>(l.dom.click(),F.some(!0))}),e.jsx(D.Provider,{value:b,children:e.jsx("div",{ref:x,className:"tox-accordion",children:t})})},u=({id:t,title:d,disabled:n=!1,headingLevel:p="h3",iconPosition:a="start",children:h})=>{const{expandedItems:i,toggleItem:x}=G(),m=`tox-${t}-content`,r=`tox-${t}-header`,o=E(i,t),b=p,l=s.useCallback(()=>{n||x(t)},[n,x,t]),c=w("tox-accordion","item",{expanded:o}),j=w("tox-accordion","header",{expanded:o,disabled:n,"icon-end":a==="end"}),P=w("tox-accordion","content",{expanded:o,collapsed:!o}),T=e.jsx("span",{className:"tox-accordion__header-icon",children:e.jsx(I,{icon:o?"chevron-up":"chevron-down"})}),_=e.jsx("span",{className:"tox-accordion__header-text",children:d});return e.jsxs("div",{className:c,children:[e.jsx(b,{className:"tox-accordion__heading",children:e.jsx("button",{id:r,type:"button",className:j,"aria-expanded":o,"aria-controls":m,"aria-disabled":n,onClick:l,disabled:n,children:a==="start"?e.jsxs(e.Fragment,{children:[T,_]}):e.jsxs(e.Fragment,{children:[_,T]})})}),e.jsx("div",{id:m,role:"region","aria-labelledby":r,"aria-hidden":!o,className:P,children:e.jsx("div",{className:"tox-accordion__content-inner",children:h})})]})};try{v.displayName="Root",v.__docgenInfo={description:`Accordion component for displaying collapsible content sections.

Supports both controlled and uncontrolled modes, keyboard navigation,
and proper accessibility attributes.`,displayName:"Root",props:{allowMultiple:{defaultValue:{value:"false"},description:"Allow multiple accordion items to be expanded simultaneously.",name:"allowMultiple",required:!1,type:{name:"boolean"}},defaultExpanded:{defaultValue:{value:"[]"},description:"Array of item IDs that should be expanded by default (uncontrolled mode).",name:"defaultExpanded",required:!1,type:{name:"string[]"}},expanded:{defaultValue:null,description:`Array of item IDs that are currently expanded (controlled mode).
When provided, the component becomes controlled.`,name:"expanded",required:!1,type:{name:"string[]"}},onExpandedChange:{defaultValue:null,description:`Callback fired when the expanded state changes (controlled mode).
@param expanded - Array of currently expanded item IDs`,name:"onExpandedChange",required:!1,type:{name:"((expanded: string[]) => void)"}}}}}catch{}try{u.displayName="Item",u.__docgenInfo={description:`Individual accordion item containing a header button and collapsible content.
Must be used as a child of Accordion.Root.`,displayName:"Item",props:{id:{defaultValue:null,description:`Unique identifier for this accordion item.
Used to track expanded state and for accessibility attributes.`,name:"id",required:!0,type:{name:"string"}},title:{defaultValue:null,description:"Title text displayed in the accordion header button.",name:"title",required:!0,type:{name:"string"}},disabled:{defaultValue:{value:"false"},description:"Disable the accordion item, preventing user interaction.",name:"disabled",required:!1,type:{name:"boolean"}},headingLevel:{defaultValue:{value:"h3"},description:`Semantic heading level for the accordion header.
Important for document outline and screen readers.`,name:"headingLevel",required:!1,type:{name:'"h2" | "h3" | "h4" | "h5" | "h6"'}},iconPosition:{defaultValue:{value:"start"},description:"Position of the chevron icon in the header.",name:"iconPosition",required:!1,type:{name:'"start" | "end"'}}}}}catch{}const R=k(),$={"chevron-down":R["chevron-down"],"chevron-up":R["chevron-up"]},z={getIcon:t=>V($,t).getOrDie("Failed to get icon")},de={title:"components/Accordion",component:v,decorators:[t=>e.jsx(U,{resources:z,children:e.jsx(t,{})})],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},tags:["autodocs","skip-visual-testing"],args:{}},f={parameters:{docs:{description:{story:`
**Native HTML Accordion**

This example uses native HTML \`<details>\` and \`<summary>\` elements.
Simple and works without JavaScript, but lacks advanced features.
        `}}},render:()=>e.jsxs("div",{style:{width:"400px"},children:[e.jsxs("details",{children:[e.jsx("summary",{children:"Proofread"}),e.jsxs("div",{style:{padding:"8px"},children:[e.jsx("p",{children:"Check the text for errors in grammar, spelling, and punctuation."}),e.jsx("button",{children:"Run"})]})]}),e.jsxs("details",{style:{marginTop:"8px"},children:[e.jsx("summary",{children:"Adjust length"}),e.jsxs("div",{style:{padding:"8px"},children:[e.jsx("p",{children:"Shorten or lengthen the text as needed."}),e.jsxs("select",{children:[e.jsx("option",{value:"shorter",children:"Shorter"}),e.jsx("option",{value:"longer",children:"Longer"})]}),e.jsx("button",{style:{marginLeft:"8px"},children:"Run"})]})]}),e.jsxs("details",{style:{marginTop:"8px"},children:[e.jsx("summary",{children:"Custom"}),e.jsxs("div",{style:{padding:"8px"},children:[e.jsx("p",{children:"Enter a custom command for a specific review."}),e.jsx("textarea",{placeholder:"Type a custom command",style:{width:"100%",minHeight:"60px"}}),e.jsxs("div",{style:{marginTop:"8px"},children:[e.jsx("button",{children:"Run"}),e.jsx("button",{style:{marginLeft:"8px"},children:"Model"})]})]})]})]})},y={parameters:{docs:{description:{story:`
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
        `}}},args:{allowMultiple:!1,defaultExpanded:["item1"]},argTypes:{allowMultiple:{control:"boolean",description:"Allow multiple items to be expanded at once"},defaultExpanded:{control:"object",description:"Array of item IDs expanded by default"}},render:t=>{const[d,n]=s.useState("longer"),[p,a]=s.useState("gpt-4"),h={"gpt-4":"GPT-4","gpt-3000":"GPT-3000",claude:"Claude"},i=()=>document.querySelector("[popover]")?.hidePopover?.();return e.jsx("div",{className:"tox",style:{width:"400px"},children:e.jsxs(v,{...t,children:[e.jsx(u,{id:"item1",title:"Proofread",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Check the text for errors in grammar, spelling, and punctuation."}),e.jsx(A,{variant:"primary",children:"Run"})]})}),e.jsx(u,{id:"item2",title:"Adjust length",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Shorten or lengthen the text as needed."}),e.jsxs(M,{side:"bottom",align:"start",gap:2,children:[e.jsx(C,{children:e.jsxs("div",{className:"tox-selectfield",children:[e.jsx("button",{type:"button","aria-haspopup":"listbox",children:d==="shorter"?"Shorter":"Longer"}),e.jsx(I,{icon:"chevron-down"})]})}),e.jsx(S,{children:e.jsxs(N,{children:[e.jsx(g,{onAction:()=>{n("shorter"),i()},children:"Shorter"}),e.jsx(g,{onAction:()=>{n("longer"),i()},children:"Longer"})]})})]}),e.jsx(A,{variant:"primary",children:"Run"})]})}),e.jsx(u,{id:"item3",title:"Custom",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Enter a custom command for a specific review."}),e.jsx(O,{value:"",placeholder:"Type a custom command",onChange:B}),e.jsxs("div",{className:"tox-button-group",children:[e.jsx(A,{variant:"primary",children:"Run"}),e.jsxs(M,{side:"top",align:"start",gap:2,children:[e.jsx(C,{children:e.jsxs("button",{type:"button",className:"tox-accordion__model-button",children:[h[p]||"Model",e.jsx(I,{icon:"chevron-down"})]})}),e.jsx(S,{children:e.jsxs(N,{children:[e.jsx(g,{onAction:()=>{a("gpt-4"),i()},children:"GPT-4"}),e.jsx(g,{onAction:()=>{a("gpt-3000"),i()},children:"GPT-3000"}),e.jsx(g,{onAction:()=>{a("claude"),i()},children:"Claude"})]})})]})]})]})}),e.jsx(u,{id:"item4",title:"Disabled Example",iconPosition:"end",disabled:!0,children:e.jsx("div",{className:"tox-form__group",children:e.jsx("p",{children:"This item is disabled."})})})]})})}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};const le=["Barebone","Styled"];export{f as Barebone,y as Styled,le as __namedExportsOrder,de as default};
