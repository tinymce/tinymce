import{j as o,c as i}from"./iframe-DyWTEy9f.js";const n=({icon:e,resolver:t,...r})=>o.jsx("span",{className:i(["tox-icon"]),dangerouslySetInnerHTML:{__html:t(e)},...r});try{n.displayName="Icon",n.__docgenInfo={description:"",displayName:"Icon",props:{icon:{defaultValue:null,description:"The name of the icon",name:"icon",required:!0,type:{name:"string"}},resolver:{defaultValue:null,description:`The function to resolve the icon name to an html string.

This would eventually default to retrieving the icon from the editor's registry.
(name: string) => editor.ui.registry.getAll().icons[name] ?? 'temporary-placeholder'

Returns the html string representation of the icon.`,name:"resolver",required:!0,type:{name:"(icon: string) => string"}}}}}catch{}export{n as I};
