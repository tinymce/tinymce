import{j as n}from"./iframe-Phrq4Xly.js";import{I as c}from"./Universe-BGVFRU4m.js";import{U as i}from"./UniverseProvider-CRvKBadQ.js";import{g as a}from"./Obj-0QrmN1ba.js";import"./Optional-DGH8Y1w3.js";const d={"chevron-down":'<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',"chevron-up":'<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>'},p={getIcon:e=>a(d,e).getOrDie("Failed to get icon")},x={title:"components/Icon",parameters:{docs:{description:{component:`
An icon component that renders an SVG icon based on the provided icon name and resolver function.

## Usage

\`\`\`tsx
import { Icon } from 'oxide-components';

<Icon icon="chevron-down" />
\`\`\`

## Example

\`\`\`tsx
<Icon icon="chevron-down" />
\`\`\`

## How it works

The \`Icon\` component uses the underlying UniverseContext state to fetch the SVG markup for the specified \`icon\`. This means that the Icon component always needs to be nested within a UniverseProvider.
        `}}},component:c,decorators:[e=>n.jsx(i,{resources:p,children:n.jsx(e,{})})],tags:["autodocs","skip-visual-testing"]},m=e=>n.jsx("div",{style:{padding:"20px",border:"1px solid lightgray",display:"inline-block"},children:n.jsx(c,{...e})}),l={icon:"chevron-down"},o={args:{...l},render:m};var t,r,s;o.parameters={...o.parameters,docs:{...(t=o.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    ...defaultProps
  },
  render
}`,...(s=(r=o.parameters)==null?void 0:r.docs)==null?void 0:s.source}}};const w=["Default"];export{o as Default,w as __namedExportsOrder,x as default};
