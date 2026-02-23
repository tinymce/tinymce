import{j as e,n as i,o as r}from"./iframe-BC5SEvUl.js";import{useMDXComponents as s}from"./index-Bw-_p7lu.js";import"./preload-helper-PPVm8Dsz.js";const a=`# Styling Oxide Components

To ensure backward compatibility with existing skins, all oxide-components should be styled inside **Oxide** library. 

Currently, we are migrating from LESS to CSS. 
See the **three migration stages** of Oxide components:

| Stage Name | Description | Key Characteristics |
| --- | --- | --- |
| **Legacy** | The current version of the component, fully styled in LESS. | No modern CSS features, fully dependent on LESS variables |
| **Transitional** | The transitional state where modern CSS is introduced alongside existing LESS styles. | CSS Custom Properties introduced behind a feature flag, LESS variables still present, CSS uses fallbacks to LESS, backward compatible with old skins |
| **Modern CSS** | The final, fully modernized version of the component. | Fully styled with modern CSS, LESS completely removed, no dependency on LESS variables, breaking change, old skins are no longer supported |

All new components should be written in the **Transitional** stage to minimize adding to the tech debt. To learn more read \`Converting a Legacy Component to the Transitional Stage\` documentation.`;function o(n){return e.jsxs(e.Fragment,{children:[e.jsx(i,{title:"Styling guide"}),`
`,e.jsx(r,{children:a})]})}function m(n={}){const{wrapper:t}={...s(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o()}export{m as default};
