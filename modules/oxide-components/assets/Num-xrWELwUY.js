const s=(t,e,r,a)=>{const n=t+e;return n>a?r:n<r?a:n},c=(t,e,r)=>Math.min(Math.max(t,e),r),o=()=>window.crypto.getRandomValues(new Uint32Array(1))[0]/4294967295;export{s as a,c,o as r};
