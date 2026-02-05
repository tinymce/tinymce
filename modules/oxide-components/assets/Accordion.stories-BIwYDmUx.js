import{r as l,j as e}from"./iframe-6DF_EOJL.js";import{g as U}from"./icons-BBMSdiSt.js";import{c as F,f as V}from"./Strings-CdlRWgOi.js";import{i as B,O as G}from"./Optional-CilDcsXt.js";import{c as $}from"./KeyboardNavigationHooks-Bz5pCkYf.js";import{e as w}from"./Bem-C5idDC5H.js";import{I}from"./Universe-CoXogN_R.js";import{A as z}from"./AutoResizingTextarea-BCGxeEAj.js";import{B as A}from"./Button-veQh4SL2.js";import{R as M,T as S,C as N}from"./Dropdown-Dy8XJjLK.js";import{R,I as g}from"./Menu-B_5-mD0c.js";import{U as J}from"./UniverseProvider-BIGkPlQI.js";import{g as K}from"./Obj-ycCTN9Ns.js";import{n as W}from"./Fun--VEwoXIw.js";const H=l.createContext(null),Q=()=>{const t=l.useContext(H);if(t===null)throw new Error("Accordion components must be used within Accordion.Root");return t},v=({children:t,allowMultiple:c=!1,defaultExpanded:o=[],expanded:u,onExpandedChange:n})=>{const[x,r]=l.useState(o),a=l.useRef(null),s=B(u),d=s?u:x,i=l.useCallback(p=>{let m;F(d,p)?m=V(d,j=>j!==p):c?m=[...d,p]:m=[p],s?n==null||n(m):r(m)},[d,c,s,n]),b=l.useMemo(()=>({expandedItems:d,toggleItem:i,allowMultiple:c}),[d,i,c]);return $({containerRef:a,selector:'.tox-accordion__header:not([aria-disabled="true"])',allowVertical:!0,allowHorizontal:!1,cycles:!1,execute:p=>(p.dom.click(),G.some(!0))}),e.jsx(H.Provider,{value:b,children:e.jsx("div",{ref:a,className:"tox-accordion",children:t})})},h=({id:t,title:c,disabled:o=!1,headingLevel:u="h3",iconPosition:n="start",children:x})=>{const{expandedItems:r,toggleItem:a}=Q(),s=`tox-${t}-content`,d=`tox-${t}-header`,i=F(r,t),b=u,p=l.useCallback(()=>{o||a(t)},[o,a,t]),m=w("tox-accordion","item",{expanded:i}),j=w("tox-accordion","header",{expanded:i,disabled:o,"icon-end":n==="end"}),O=w("tox-accordion","content",{expanded:i,collapsed:!i}),T=e.jsx("span",{className:"tox-accordion__header-icon",children:e.jsx(I,{icon:i?"chevron-up":"chevron-down"})}),_=e.jsx("span",{className:"tox-accordion__header-text",children:c});return e.jsxs("div",{className:m,children:[e.jsx(b,{className:"tox-accordion__heading",children:e.jsx("button",{id:d,type:"button",className:j,"aria-expanded":i,"aria-controls":s,"aria-disabled":o,onClick:p,disabled:o,children:n==="start"?e.jsxs(e.Fragment,{children:[T,_]}):e.jsxs(e.Fragment,{children:[_,T]})})}),e.jsx("div",{id:s,role:"region","aria-labelledby":d,"aria-hidden":!i,className:O,children:e.jsx("div",{className:"tox-accordion__content-inner",children:x})})]})};try{v.displayName="Root",v.__docgenInfo={description:`Accordion component for displaying collapsible content sections.

Supports both controlled and uncontrolled modes, keyboard navigation,
and proper accessibility attributes.`,displayName:"Root",props:{allowMultiple:{defaultValue:{value:"false"},description:"Allow multiple accordion items to be expanded simultaneously.",name:"allowMultiple",required:!1,type:{name:"boolean"}},defaultExpanded:{defaultValue:{value:"[]"},description:"Array of item IDs that should be expanded by default (uncontrolled mode).",name:"defaultExpanded",required:!1,type:{name:"string[]"}},expanded:{defaultValue:null,description:`Array of item IDs that are currently expanded (controlled mode).
When provided, the component becomes controlled.`,name:"expanded",required:!1,type:{name:"string[]"}},onExpandedChange:{defaultValue:null,description:`Callback fired when the expanded state changes (controlled mode).
@param expanded - Array of currently expanded item IDs`,name:"onExpandedChange",required:!1,type:{name:"((expanded: string[]) => void)"}}}}}catch{}try{h.displayName="Item",h.__docgenInfo={description:`Individual accordion item containing a header button and collapsible content.
Must be used as a child of Accordion.Root.`,displayName:"Item",props:{id:{defaultValue:null,description:`Unique identifier for this accordion item.
Used to track expanded state and for accessibility attributes.`,name:"id",required:!0,type:{name:"string"}},title:{defaultValue:null,description:"Title text displayed in the accordion header button.",name:"title",required:!0,type:{name:"string"}},disabled:{defaultValue:{value:"false"},description:"Disable the accordion item, preventing user interaction.",name:"disabled",required:!1,type:{name:"boolean"}},headingLevel:{defaultValue:{value:"h3"},description:`Semantic heading level for the accordion header.
Important for document outline and screen readers.`,name:"headingLevel",required:!1,type:{name:'"h2" | "h3" | "h4" | "h5" | "h6"'}},iconPosition:{defaultValue:{value:"start"},description:"Position of the chevron icon in the header.",name:"iconPosition",required:!1,type:{name:'"start" | "end"'}}}}}catch{}const C=U(),X={"chevron-down":C["chevron-down"],"chevron-up":C["chevron-up"]},Y={getIcon:t=>K(X,t).getOrDie("Failed to get icon")},ue={title:"components/Accordion",component:v,decorators:[t=>e.jsx(J,{resources:Y,children:e.jsx(t,{})})],parameters:{layout:"centered",docs:{description:{component:`
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
        `}}},args:{allowMultiple:!1,defaultExpanded:["item1"]},argTypes:{allowMultiple:{control:"boolean",description:"Allow multiple items to be expanded at once"},defaultExpanded:{control:"object",description:"Array of item IDs expanded by default"}},render:t=>{const[c,o]=l.useState("longer"),[u,n]=l.useState("gpt-4"),x={"gpt-4":"GPT-4","gpt-3000":"GPT-3000",claude:"Claude"},r=()=>{var a,s;return(s=(a=document.querySelector("[popover]"))==null?void 0:a.hidePopover)==null?void 0:s.call(a)};return e.jsx("div",{className:"tox",style:{width:"400px"},children:e.jsxs(v,{...t,children:[e.jsx(h,{id:"item1",title:"Proofread",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Check the text for errors in grammar, spelling, and punctuation."}),e.jsx(A,{variant:"primary",children:"Run"})]})}),e.jsx(h,{id:"item2",title:"Adjust length",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Shorten or lengthen the text as needed."}),e.jsxs(M,{side:"bottom",align:"start",gap:2,children:[e.jsx(S,{children:e.jsxs("div",{className:"tox-selectfield",children:[e.jsx("button",{type:"button","aria-haspopup":"listbox",children:c==="shorter"?"Shorter":"Longer"}),e.jsx(I,{icon:"chevron-down"})]})}),e.jsx(N,{children:e.jsxs(R,{children:[e.jsx(g,{onAction:()=>{o("shorter"),r()},children:"Shorter"}),e.jsx(g,{onAction:()=>{o("longer"),r()},children:"Longer"})]})})]}),e.jsx(A,{variant:"primary",children:"Run"})]})}),e.jsx(h,{id:"item3",title:"Custom",iconPosition:"end",children:e.jsxs("div",{className:"tox-form__group",children:[e.jsx("p",{children:"Enter a custom command for a specific review."}),e.jsx(z,{value:"",placeholder:"Type a custom command",onChange:W}),e.jsxs("div",{className:"tox-button-group",children:[e.jsx(A,{variant:"primary",children:"Run"}),e.jsxs(M,{side:"top",align:"start",gap:2,children:[e.jsx(S,{children:e.jsxs("button",{type:"button",className:"tox-accordion__model-button",children:[x[u]||"Model",e.jsx(I,{icon:"chevron-down"})]})}),e.jsx(N,{children:e.jsxs(R,{children:[e.jsx(g,{onAction:()=>{n("gpt-4"),r()},children:"GPT-4"}),e.jsx(g,{onAction:()=>{n("gpt-3000"),r()},children:"GPT-3000"}),e.jsx(g,{onAction:()=>{n("claude"),r()},children:"Claude"})]})})]})]})]})}),e.jsx(h,{id:"item4",title:"Disabled Example",iconPosition:"end",disabled:!0,children:e.jsx("div",{className:"tox-form__group",children:e.jsx("p",{children:"This item is disabled."})})})]})})}};var D,E,P;f.parameters={...f.parameters,docs:{...(D=f.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(P=(E=f.parameters)==null?void 0:E.docs)==null?void 0:P.source}}};var k,L,q;y.parameters={...y.parameters,docs:{...(k=y.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(q=(L=y.parameters)==null?void 0:L.docs)==null?void 0:q.source}}};const he=["Barebone","Styled"];export{f as Barebone,y as Styled,he as __namedExportsOrder,ue as default};
