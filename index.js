var f=require("path"),h=require("react"),$=require("node:fs/promises"),w=require("react-dom/server"),{renderToString:D}=w,{readFile:E,writeFile:P,cp:x,readdir:y}=$,p={DEV:"development",PROD:"production"},C=process.env.NODE_ENV||p.DEV,d=process.cwd(),m=t=>typeof t=="string"&&t.length>0,I=t=>{let e=f.basename(t,f.extname(t)),o=e.substring(0,e.indexOf(".static"));return`${o.slice(0,1).toLowerCase()}${o.slice(1)}`},N=t=>{let e=require(t);return e.default&&(e=e.default),D(h.createElement(e,null))},O=(t,e,o)=>{let s=e.indexOf(o)+o.length+2,a=e.substring(0,s),n=e.substring(s);return`${a}${t}${n}`};module.exports=(t={})=>{let e=m(t.outDir)?`${d}/${t.outDir}`:`${d}/out`,o=m(t.pages)?`${d}/${t.pages}`:null,s=[];return{name:"reactStaticPlugin",setup:a=>{a.onStart(async()=>{try{if(!o)throw new Error("Must specify a html page");await x(o,e,{recursive:!0});let r=(await y(o)).map(async l=>new Promise((i,c)=>{let g=`${e}/${l}`;E(g,"utf8").then(u=>{u||c(`Can't read file ${l}`),i({path:g,content:u})}).catch(u=>c(u))}));s=await Promise.all(r)}catch(n){console.log(n.message)}}),a.onLoad({filter:/\.static.jsx$/},n=>{let r=n.path,l=N(r),i=I(r);return C===p.PROD&&s.forEach(c=>{c.content.includes(`id="${i}"`)&&(console.log("Component:",i),console.log("Injected in:",c.path),console.log("-------------------------------------------"),console.log("-------------------------------------------"),c.content=O(l,c.content,i))}),{loader:"jsx"}}),a.onEnd(async()=>{for(let n=0;n<s.length;n++){let r=s[n];await P(r.path,r.content)}})}}};