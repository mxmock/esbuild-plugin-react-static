var p=require("path"),u=require("react"),v=require("node:fs/promises"),x=require("html-minifier").minify,C=require("react-dom/server"),{renderToString:m}=C,{readFile:I,writeFile:F,cp:q,readdir:D}=v,d=process.cwd(),h=t=>typeof t=="string"&&t.length>0,y=async t=>{let r=await D(t,{withFileTypes:!0}),e=await Promise.all(r.map(s=>{let o=p.resolve(t,s.name);return s.isDirectory()?y(o):o}));return Array.prototype.concat(...e)},S=async t=>{let r=[];try{let e=t.map(async s=>new Promise((o,a)=>{I(s,"utf8").then(n=>{n||a(`Can't read file ${s}`);let c=x(n,{caseSensitive:!0,collapseWhitespace:!0,conservativeCollapse:!0});o({path:s,content:c})}).catch(n=>a(n))}));r=await Promise.all(e)}catch(e){console.error("Can't read files",e.message)}finally{return r}},E=t=>{let r=p.basename(t,p.extname(t)),e=r.substring(0,r.indexOf(".static"));return`${e.slice(0,1).toLowerCase()}${e.slice(1)}`},O=t=>{let{content:r,attrData:e,attrId:s,componentPath:o,suffix:a,redux:n}=t,c=r.indexOf(s),i=b(r,c,e),l=j(o,i,a,n);return A(l,r,c,s.length)},b=(t,r,e)=>{if(!t.includes(e))return{};let s=t.indexOf(e)+e.length+1,o=r-2,a=t.substring(s,o);try{let n=JSON.parse(a);return console.log(`${e}`,n),n}catch(n){return console.error(`Can't parse ${a} from html:`,n.message),{}}},j=(t,r,e,s)=>{let o=require(t);if(o.default&&(o=o.default),e.includes("provider"))if(s.store&&s.Provider){let{store:a,Provider:n}=s;return m(u.createElement(n,{store:a},u.createElement(o,{data:r})))}else throw new Error(`You must provide a store and Provider for ${t}`);else return m(u.createElement(o,{data:r}))},A=(t,r,e,s)=>{let o=r.substring(0,e+s),a=r.substring(e+s);return`${o}${t}${a}`};module.exports=(t={})=>{let r=h(t.outDir)?`${d}/${t.outDir}`:`${d}/out`,e=h(t.pages)?`${d}/${t.pages}`:null,s=t.redux||{store:null,Provider:null},o=[];return{name:"reactStaticPlugin",setup:a=>{a.onStart(async()=>{try{if(!e)throw new Error("Must specify a html page");await q(e,r,{recursive:!0});let n=await y(r);o=await S(n)}catch(n){console.error("Can't get html outputs paths",n.message)}}),a.onLoad({filter:/\.static.jsx$/},n=>{let c=n.path,i=E(c),l=`id="${i}">`,$=`data-${i}=`;for(let f of o){let{content:g,path:w}=f;if(!g.includes(l))continue;let P={redux:s,attrId:l,content:g,attrData:$,componentPath:c,suffix:n.suffix};f.content=O(P),console.log("Component:",i),console.log("Injected in:",w),console.log("-------------------------------------------"),console.log("-------------------------------------------")}return{loader:"jsx"}}),a.onEnd(async()=>{for(let n of o)await F(n.path,n.content)})}}};