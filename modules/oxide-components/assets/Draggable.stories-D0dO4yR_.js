import{r as n,j as i}from"./iframe-NErOP_Sc.js";const j=(e,t)=>({deltaX:t.x-e.x,deltaY:t.y-e.y}),m=(e,t,r)=>Math.min(r,Math.max(t,e)),v=(e,t,r,a)=>{const l=e.x+e.width,o=e.y+e.height;return{x:{min:Math.ceil(r.x+(t.x-e.x)),max:Math.floor(a.x-(l-t.x))},y:{min:Math.ceil(r.y+(t.y-e.y)),max:Math.floor(a.y-(o-t.y))}}},f=n.createContext(null),P=()=>{const e=n.useContext(f);if(e===null)throw new Error("Draggable compound components must be rendered within the Draggable component");return e},d=({children:e})=>{const[t,r]=n.useState({x:0,y:0}),a=n.useRef(null),l=`translate3d(${t.x}px, ${t.y}px, 0)`,o=n.useMemo(()=>({setShift:r,draggableRef:a}),[]);return i.jsx(f.Provider,{value:o,children:i.jsx("div",{ref:a,style:{transform:l},children:e})})},E=({children:e})=>{const[t,r]=n.useState(!1),a=n.useRef(null),l=n.useRef({x:0,y:0}),o=n.useRef({x:{min:0,max:0},y:{min:0,max:0}}),{setShift:h,draggableRef:g}=P(),D=n.useCallback(s=>{if(a.current===null||g.current===null)return;r(!0),a.current.setPointerCapture(s.pointerId);const c={x:Math.round(s.clientX),y:Math.round(s.clientY)};l.current=c;const x=g.current.getBoundingClientRect();o.current=v(x,c,{x:0,y:0},{x:window.innerWidth,y:window.innerHeight})},[g]),w=n.useCallback(s=>{if(t){const c={x:m(Math.round(s.clientX),o.current.x.min,o.current.x.max),y:m(Math.round(s.clientY),o.current.y.min,o.current.y.max)},{deltaX:x,deltaY:k}=j(l.current,c);l.current=c,h(({x:M,y:_})=>({x:M+x,y:_+k}))}},[t,h]),C=n.useCallback(s=>{var c;(c=a.current)==null||c.releasePointerCapture(s.pointerId),r(!1)},[]),R=n.useCallback(()=>{r(!1)},[]);return i.jsx("div",{ref:a,onPointerDown:D,onPointerUp:C,onPointerMove:w,onLostPointerCapture:R,style:{cursor:t?"grabbing":"grab"},children:e})};d.Handle=E;try{d.displayName="Draggable",d.__docgenInfo={description:"",displayName:"Draggable",props:{}}}catch{}const I={title:"components/Draggable",component:d,parameters:{layout:"centered"},tags:["autodocs","skip-visual-testing"]},H=e=>i.jsx(d,{...e}),u={args:{children:i.jsx("div",{style:{width:250,height:500,backgroundColor:"gray"},children:i.jsx(d.Handle,{children:i.jsx("div",{style:{width:"100%",height:50,backgroundColor:"black"}})})})},parameters:{},render:H};var p,y,b;u.parameters={...u.parameters,docs:{...(p=u.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    children: <div style={{
      width: 250,
      height: 500,
      backgroundColor: 'gray'
    }}>
        <Draggable.Handle>
          <div style={{
          width: '100%',
          height: 50,
          backgroundColor: 'black'
        }}></div>
        </Draggable.Handle>
      </div>
  },
  parameters: {},
  render
}`,...(b=(y=u.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};const X=["Example"];export{u as Example,X as __namedExportsOrder,I as default};
