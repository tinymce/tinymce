import{j as e}from"./iframe-DrWVuu1b.js";import{R as a,H as s}from"./Draggable-EiI0LnRf.js";import"./Optional-CHj922Ci.js";import"./Fun--VEwoXIw.js";const u={title:"components/Draggable",component:a,parameters:{layout:"fullscreen",docs:{description:{component:`A draggable container component that allows users to reposition elements by dragging them around the viewport.

## How it works

The Draggable component consists of two parts:

- **\`Draggable.Root\`** - The container element that will be moved. It handles positioning and bounds checking.
- **\`Draggable.Handle\`** - The area within the container that can be grabbed to initiate dragging. This typically represents a title bar or header.

During a drag operation, the component uses CSS transform \`translate3d\` and automatically constrains the element within the viewport bounds.
When dragging stops, the position is converted to absolute CSS positioning.

### Positioning

The component does not apply any \`position\` style by default, giving you the flexibility to choose the positioning strategy that fits your use case.
You must manually set the position using \`style={{ position: "absolute" }}\`, \`style={{ position: "fixed" }}\`, or use the Popover API.
The component will work with any positioning strategy as long as \`top\` and \`left\` CSS properties are supported.

### Viewport boundaries

By default, the entire draggable element must stay within the viewport (fully visible). You can customize this behavior using the \`allowedOverflow\` prop to allow portions of the element to move outside the viewport while maintaining minimum visibility.

### Window resize handling

To ensure the draggable element stays within the viewport after window resize, you must provide the \`declaredSize\` prop with the element's width and height.
This allows the component to use CSS \`min()\` to constrain the position and prevent the element from ending up outside the visible area.
If you don't provide \`declaredSize\`, the element may move outside the viewport on window resize.`}}},argTypes:{popover:{table:{disable:!0}},initialPosition:{description:"The initial position of the draggable element. `top` and `left` can be provided as any valid CSS."},allowedOverflow:{description:"Controls how much of the draggable element is allowed to overflow outside the viewport. Values are decimals between 0 and 1.\n\n**Default behavior:** When not provided, the entire element must stay within the viewport (equivalent to `{ horizontal: 0, vertical: 0 }` - no overflow allowed).\n\n**Properties:**\n- `horizontal` (optional): Fraction of element width that can overflow outside viewport (0-1). Defaults to 0 (no overflow) if omitted.\n- `vertical` (optional): Fraction of element height that can overflow outside viewport (0-1). Defaults to 0 (no overflow) if omitted.\n\n**Examples:**\n- `{ horizontal: 0.9, vertical: 0.9 }` - Up to 90% of each dimension can overflow (10% must remain visible)\n- `{ horizontal: 0.8 }` - Up to 80% of width can overflow (20% must be visible), full height must stay on screen (default)\n- `{ vertical: 0.5 }` - Up to 50% of height can overflow, full width must stay on screen (default)"},declaredSize:{description:`Optional declared size of the draggable element. This is used to ensure the Draggable element will not end up out of window on window resize.
You can omit setting this property if you don't care about window resize.
If you do care about it, but don't know the exact size of the element you'll have to calculate it using javascript.`}},tags:["autodocs","skip-visual-testing"]},l=r=>e.jsx(a,{...r,style:{position:"fixed"},children:e.jsx("div",{style:{width:250,height:250,backgroundColor:"#fef68a"},children:e.jsx(s,{children:e.jsx("div",{style:{width:"100%",height:50,backgroundColor:"#e8d96f",display:"flex",alignItems:"center",justifyContent:"center"},children:"Drag me"})})})}),t={args:{initialPosition:{top:"50px",left:"50px"},allowedOverflow:{horizontal:.6,vertical:0},declaredSize:{width:"250px",height:"250px"}},parameters:{docs:{story:{inline:!1,iframeHeight:700}}},render:l};var o,i,n;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    initialPosition: {
      top: '50px',
      left: '50px'
    },
    allowedOverflow: {
      horizontal: 0.6,
      vertical: 0
    },
    declaredSize: {
      width: '250px',
      height: '250px'
    }
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
}`,...(n=(i=t.parameters)==null?void 0:i.docs)==null?void 0:n.source}}};const m=["Example"];export{t as Example,m as __namedExportsOrder,u as default};
