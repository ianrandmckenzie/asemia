import{i as Q}from"./components-cO3_4e1u.js";import"./svg-ckjYZtu2.js";import"./builder-eHfHUSQk.js";import"./storage-BsTmBsHt.js";async function V(){const e=document.getElementById("serifsGrid"),t=document.getElementById("joinsGrid");if(!e||!t)throw new Error("Grid not found. Please ensure the builder is loaded.");const n=e.getBoundingClientRect(),a=t.getBoundingClientRect(),d=Math.min(n.left,a.left),i=Math.min(n.top,a.top),o=Math.max(n.right,a.right),r=Math.max(n.bottom,a.bottom),u=o-d,p=r-i,s="http://www.w3.org/2000/svg",c=document.createElementNS(s,"svg");c.setAttribute("xmlns",s),c.setAttribute("viewBox",`0 0 ${u} ${p}`),c.setAttribute("width",u),c.setAttribute("height",p);const l=document.createElementNS(s,"g"),v=[{element:e,rect:n,name:"serifs"},{element:t,rect:a,name:"joins"}];for(const h of v)h.element.querySelectorAll(".grid-cell").forEach((f,k)=>{f.querySelectorAll("svg").forEach(C=>{const y=C.cloneNode(!0),m=f.getBoundingClientRect(),E=m.left-d,D=m.top-i,S=window.getComputedStyle(C),F=parseFloat(S.width)||m.width,H=parseFloat(S.height)||m.height,_=S.position,M=S.top,L=S.left,G=S.right,R=S.bottom,A=S.transform;let $=E,U=D;if(_==="absolute"){if(L!=="auto"&&L!==""){const g=parseFloat(L);$+=g}else if(G!=="auto"&&G!==""){const g=parseFloat(G);$+=m.width-F-g}if(M!=="auto"&&M!==""){const g=parseFloat(M);U+=g}else if(R!=="auto"&&R!==""){const g=parseFloat(R);U+=m.height-H-g}}const P=document.createElementNS(s,"g");let Y=`translate(${$}, ${U})`;if(A&&A!=="none"){const g=A.match(/matrix\(([^)]+)\)/);if(g){const z=g[1].split(",").map(N=>parseFloat(N.trim()));if(z.length===6){const N=z[4],K=z[5];Y+=` translate(${N}, ${K})`}}}P.setAttribute("transform",Y);const X=y.innerHTML,q=y.getAttribute("viewBox");if(q){const g=document.createElementNS(s,"svg");g.setAttribute("viewBox",q),g.setAttribute("width",F),g.setAttribute("height",H),g.innerHTML=X,P.appendChild(g)}else{const g=document.createElementNS(s,"g");g.innerHTML=X,P.appendChild(g)}l.appendChild(P)})});return c.appendChild(l),{svg:c,width:u,height:p}}async function Z(){console.log("Starting SVG export...");const e=window.getPreviewMode?window.getPreviewMode():!1;window.setPreviewMode&&!e&&(window.setPreviewMode(!0),document.body.classList.add("preview-mode"),await new Promise(t=>setTimeout(t,100)));try{const{svg:t}=await V(),a=new XMLSerializer().serializeToString(t),d=new Blob([a],{type:"image/svg+xml"}),i=URL.createObjectURL(d),o=document.createElement("a");o.href=i,o.download=`asemia-composition-${Date.now()}.svg`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(i),console.log("SVG export complete!")}catch(t){console.error("SVG export failed:",t),alert("Export failed: "+t.message)}finally{window.setPreviewMode&&!e&&(window.setPreviewMode(!1),document.body.classList.remove("preview-mode"))}}async function ee(){console.log("Starting PNG export...");const e=window.getPreviewMode?window.getPreviewMode():!1;window.setPreviewMode&&!e&&(window.setPreviewMode(!0),document.body.classList.add("preview-mode"),await new Promise(t=>setTimeout(t,100)));try{const{svg:t,width:n,height:a}=await V(),i=new XMLSerializer().serializeToString(t),o=new Blob([i],{type:"image/svg+xml;charset=utf-8"}),r=URL.createObjectURL(o),u=new Image;await new Promise((w,f)=>{u.onload=w,u.onerror=f,u.src=r});const p=document.createElement("canvas"),s=2;p.width=n*s,p.height=a*s;const c=p.getContext("2d");c.scale(s,s),c.drawImage(u,0,0,n,a),URL.revokeObjectURL(r);const l=await new Promise(w=>{p.toBlob(w,"image/png")}),v=URL.createObjectURL(l),h=document.createElement("a");h.href=v,h.download=`asemia-composition-${Date.now()}.png`,document.body.appendChild(h),h.click(),document.body.removeChild(h),URL.revokeObjectURL(v),console.log("PNG export complete!")}catch(t){console.error("PNG export failed:",t),alert("Export failed: "+t.message)}finally{window.setPreviewMode&&!e&&(window.setPreviewMode(!1),document.body.classList.remove("preview-mode"))}}async function te(){console.log("Starting JPEG export...");const e=window.getPreviewMode?window.getPreviewMode():!1;window.setPreviewMode&&!e&&(window.setPreviewMode(!0),document.body.classList.add("preview-mode"),await new Promise(t=>setTimeout(t,100)));try{const t=document.documentElement.classList.contains("dark"),n=window.getComputedStyle(document.body),a=t?"#0f172a":"#ffffff",d=t?"#ffffff":"#000000";console.log("Theme:",t?"dark":"light"),console.log("Background color:",a),console.log("Fill color:",d);const{svg:i,width:o,height:r}=await V(),u=i.cloneNode(!0);u.querySelectorAll("path, polygon, circle, ellipse, rect, line, polyline").forEach(m=>{(!m.hasAttribute("fill")||m.getAttribute("fill")!=="none")&&m.setAttribute("fill",d),m.hasAttribute("stroke")&&m.getAttribute("stroke")!=="none"&&m.setAttribute("stroke",d)});const c=new XMLSerializer().serializeToString(u),l=new Blob([c],{type:"image/svg+xml;charset=utf-8"}),v=URL.createObjectURL(l),h=new Image;await new Promise((m,E)=>{h.onload=m,h.onerror=E,h.src=v});const w=document.createElement("canvas"),f=2;w.width=o*f,w.height=r*f;const k=w.getContext("2d");k.scale(f,f),k.fillStyle=a,k.fillRect(0,0,o,r),k.drawImage(h,0,0,o,r),URL.revokeObjectURL(v);const O=await new Promise(m=>{w.toBlob(m,"image/jpeg",.95)}),C=URL.createObjectURL(O),y=document.createElement("a");y.href=C,y.download=`asemia-composition-${Date.now()}.jpg`,document.body.appendChild(y),y.click(),document.body.removeChild(y),URL.revokeObjectURL(C),console.log("JPEG export complete!")}catch(t){console.error("JPEG export failed:",t),alert("Export failed: "+t.message)}finally{window.setPreviewMode&&!e&&(window.setPreviewMode(!1),document.body.classList.remove("preview-mode"))}}document.addEventListener("DOMContentLoaded",()=>{window.exportAsPNG=ee,window.exportAsSVG=Z,window.exportAsJPEG=te,console.log("Export functionality initialized")});const oe=[{id:"welcome",title:"Welcome to the Asemic Typeform Crafter!",generalContent:`Build unique typographic forms using the fundamental elements of type: Serifs, Bodies, and Joins.

Let's take a quick tour.`,desktopContent:"",mobileContent:"",desktopTargetSelector:null,mobileTargetSelector:"",position:"center",showSkip:!0,highlightPulse:!1},{id:"grids",title:"Understanding the Grids",generalContent:`You work with two overlapping grids:

• 5×5 Serifs Grid (white cells)
• 4×4 Joins Grid (inset, connecting elements)

Click anywhere in the grid to place shapes.`,desktopContent:"",mobileContent:"",desktopTargetSelector:".builder-grids-wrapper",mobileTargetSelector:"",position:"bottom",highlightPulse:!0,showSkip:!0},{id:"mobile-tabs",title:"Selecting Shapes",generalContent:`Tap a tab to view available shapes in that category.

Then tap a shape to select it.`,desktopContent:"",mobileContent:"",desktopTargetSelector:"#mobileSerifTab",mobileTargetSelector:"",position:"bottom",highlightPulse:!0,showSkip:!0,mobileOnly:!0},{id:"desktop-sidebar",title:"Selecting Shapes",generalContent:"",desktopContent:`Choose from Bodies/Serifs or Joins in the sidebar.

Click a shape to select it.

Your selected shape becomes highlighted.`,mobileContent:`Choose from Bodies/Serifs or Joins in the topbar.
Tap a shape to select it.

Your selected shape becomes highlighted.`,desktopTargetSelector:"#sidebar",mobileTargetSelector:"",position:"right",highlightPulse:!0,showSkip:!0,desktopOnly:!0},{id:"placing-shapes",title:"Placing Shapes",generalContent:"",desktopContent:`Click any grid cell to place your selected shape.

• Serifs/Bodies go in the 5×5 grid
• Joins go in the 4×4 grid.`,mobileContent:`Tap any grid cell to place your selected shape.

• Serifs/Bodies go in the 5×5 grid
• Joins go in the 4×4 grid.`,desktopTargetSelector:".builder-grids-wrapper",mobileTargetSelector:"",position:"bottom",highlightPulse:!0,showSkip:!0},{id:"erase-mode",title:"Erase Mode",generalContent:"Toggle Erase Mode to quickly remove shapes.",desktopContent:"Click the Erase button, then click any shape to remove it.",mobileContent:"Tap the Erase button, then tap any shape to target it for deletion. Tap again to confirm the removal.",desktopTargetSelector:"#desktopEraseBtn",mobileTargetSelector:"#mobileEraseBtn",position:"bottom",mobilePosition:"top",highlightPulse:!0,showSkip:!0},{id:"preview-mode",title:"Preview Mode",generalContent:`Hide grid lines to see your form without distractions.

Toggle Preview Mode to view your composition cleanly.`,desktopContent:"",mobileContent:"",desktopTargetSelector:"#desktopPreviewBtn",mobileTargetSelector:"#mobilePreviewBtn",position:"bottom",mobilePosition:"top",highlightPulse:!0,showSkip:!0},{id:"saving",title:"Saving & Loading",generalContent:`Save your work to browser storage or download as JSON.

Use the Save menu to manage your compositions.`,desktopContent:"",mobileContent:"",desktopTargetSelector:null,mobileTargetSelector:"#mobileSettingsBtn",position:"center",mobilePosition:"top",highlightPulse:!0,showSkip:!0},{id:"size",title:"Adjusting Size",generalContent:`Change the grid size to view your form at different scales.

Experiment with different sizes to see how your composition looks.`,desktopContent:"",mobileContent:"",desktopTargetSelector:null,mobileTargetSelector:"#mobileSizeBtn",position:"center",mobilePosition:"top",highlightPulse:!0,showSkip:!0},{id:"complete",title:"You're Ready to Create!",generalContent:`Start building your asemic typeforms.

Experiment, explore, and have fun.

💡 Tip: Check out the Archive to see examples, or try the Word and Sentence Generators for inspiration.`,desktopContent:"",mobileContent:"",desktopTargetSelector:null,mobileTargetSelector:"",position:"center",highlightPulse:!1,showSkip:!1}];let b=0,j=window.innerWidth<768,T,x,B,I;window.nextTutorialStep=function(){console.log("Next button clicked, current step:",b),T();const e=x();if(b++,b>=e.length){I();return}B(e[b])};window.previousTutorialStep=function(){console.log("Back button clicked"),T(),b--;const e=x();b<0&&(b=0),B(e[b])};window.skipTutorial=function(){console.log("Skip button clicked"),T(),I()};window.resetTutorial=function(){console.log("Resetting tutorial state..."),localStorage.removeItem("hasSeenFreebuilderTutorial"),T();const e=document.getElementById("tutorialHelpBtn");e&&e.remove(),b=0,console.log("Tutorial reset complete. Reload the page to see the tutorial again.")};function ie(){if(console.log("Initializing tutorial system..."),localStorage.getItem("hasSeenFreebuilderTutorial")){console.log("User has seen tutorial, adding help button"),W();return}setTimeout(()=>{console.log("Starting tutorial for first-time user"),J()},1500)}function J(){b=0,j=window.innerWidth<768;const e=x();e.length>0&&B(e[0])}x=function(){return oe.filter(e=>!(e.mobileOnly&&!j||e.desktopOnly&&j))};B=function(e){console.log("Showing tutorial step:",e.id);const t=window.innerWidth<768,n=t?e.mobileTargetSelector||e.desktopTargetSelector:e.desktopTargetSelector||e.mobileTargetSelector,a=t&&e.mobilePosition?e.mobilePosition:e.position,d=ne();document.body.appendChild(d),n&&(se(n,e.highlightPulse)||console.warn("Target element not found:",n));const i=re(e);document.body.appendChild(i),requestAnimationFrame(()=>{le(i,n,a,e.id)}),requestAnimationFrame(()=>{d.style.opacity="1",i.style.opacity="1"})};function ne(){const e=document.createElement("div");return e.id="tutorial-overlay",e.className="fixed inset-0 bg-black/30 z-[9998] transition-opacity duration-300",e.style.opacity="0",e.addEventListener("click",t=>{if(t.target===e){const a=x()[b];a&&a.showSkip&&skipTutorial()}}),e}function re(e){const t=document.createElement("div");t.id="tutorial-tooltip",t.className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 md:p-6 max-w-sm md:max-w-md transition-opacity duration-300",t.style.opacity="0";const n=x(),a=n.findIndex(r=>r.id===e.id),d=n.length,i=window.innerWidth<768;let o=e.generalContent||"";if(i&&e.mobileContent?o=e.mobileContent:!i&&e.desktopContent&&(o=e.desktopContent),e.generalContent&&(i&&e.mobileContent||!i&&e.desktopContent)){const r=i?e.mobileContent:e.desktopContent;o=e.generalContent+(r?`

`+r:"")}return t.innerHTML=`
    <div class="space-y-3 md:space-y-4">
      <div class="flex items-start justify-between">
        <h3 class="text-lg md:text-xl font-serif font-bold text-gray-900 dark:text-gray-100 pr-8 leading-tight">
          ${e.title}
        </h3>
        ${e.showSkip?`
          <button onclick="window.skipTutorial()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm font-medium">
            Skip
          </button>
        `:""}
      </div>

      <p class="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        ${o}
      </p>

      <div class="flex items-center justify-between pt-3 md:pt-4">
        <div class="text-xs md:text-sm text-gray-500">
          Step ${a+1} of ${d}
        </div>

        <div class="flex gap-2">
          ${a>0?`
            <button onclick="window.previousTutorialStep()"
              class="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200">
              Back
            </button>
          `:""}

          <button onclick="window.nextTutorialStep()"
            class="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            ${a===d-1?"Finish":"Next"}
          </button>
        </div>
      </div>
    </div>
  `,t}function se(e,t=!1){const n=document.querySelector(e);if(!n)return!1;const a=n.getBoundingClientRect(),d=document.createElement("div");return d.id="tutorial-spotlight",d.className=`fixed z-[9998] border-4 border-blue-500 rounded-lg pointer-events-none transition-all duration-300 ${t?"animate-pulse":""}`,d.style.cssText=`
    top: ${a.top-8}px;
    left: ${a.left-8}px;
    width: ${a.width+16}px;
    height: ${a.height+16}px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
  `,document.body.appendChild(d),!0}function le(e,t,n,a=null){if(!t||n==="center"){e.style.cssText+=`
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;return}const d=document.querySelector(t);if(!d){e.style.cssText+=`
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;return}const i=d.getBoundingClientRect(),o=e.getBoundingClientRect(),r=16,u=window.innerWidth,p=window.innerHeight;let s,c,l="";switch(n){case"bottom":s=i.bottom+r,c=i.left+i.width/2,l="translateX(-50%)",s+o.height>p&&(s=i.top-o.height-r);break;case"top":s=i.top-o.height-r,c=i.left+i.width/2,l="translateX(-50%)",s<0&&(s=i.bottom+r);break;case"right":s=i.top+i.height/2,c=i.right+r,l="translateY(-50%)",c+o.width>u&&(c=i.left-o.width-r);break;case"left":s=i.top+i.height/2,c=i.left-o.width-r,l="translateY(-50%)",c<0&&(c=i.right+r);break;default:s=p/2,c=u/2,l="translate(-50%, -50%)"}a==="erase-mode"&&(s-=80),a==="preview-mode"&&(s-=80);const h=window.innerWidth<768&&(a==="saving"||a==="size");let w=c,f=s;l.includes("translateX(-50%)")&&(w=c-o.width/2),l.includes("translateY(-50%)")&&(f=s-o.height/2),l==="translate(-50%, -50%)"&&(w=c-o.width/2,f=s-o.height/2),w<r&&(c=r,l.includes("translateX(-50%)")&&(c=r+o.width/2),l=l.replace("translateX(-50%)","")),w+o.width>u-r&&(c=u-o.width-r,l.includes("translateX(-50%)")&&(c=u-o.width/2-r),l=l.replace("translateX(-50%)","")),f<r&&(s=r,l.includes("translateY(-50%)")&&(s=r+o.height/2),l=l.replace("translateY(-50%)","")),f+o.height>p-r&&(s=p-o.height-r,l.includes("translateY(-50%)")&&(s=p-o.height/2-r),l=l.replace("translateY(-50%)","")),l=l.trim(),h?e.style.cssText+=`
      top: ${s}px;
      right: 30px;
      margin-left: 100px;
      left: auto;
      ${l?`transform: ${l};`:""}
    `:e.style.cssText+=`
      top: ${s}px;
      left: ${c}px;
      ${l?`transform: ${l};`:""}
    `}T=function(){const e=document.getElementById("tutorial-overlay"),t=document.getElementById("tutorial-tooltip"),n=document.getElementById("tutorial-spotlight");e&&(e.style.opacity="0",setTimeout(()=>e.remove(),300)),t&&(t.style.opacity="0",setTimeout(()=>t.remove(),300)),n&&n.remove()};I=function(){localStorage.setItem("hasSeenFreebuilderTutorial","true"),console.log("Tutorial completed"),W()};function W(){if(document.getElementById("tutorialHelpBtn"))return;const e=document.querySelector("nav");if(!e){console.warn("Nav element not found, cannot add help button");return}const t=e.querySelector(".flex.items-center.bg-gray-100");if(!t){console.warn("Middle section not found, cannot add help button");return}const n=document.createElement("button");n.id="tutorialHelpBtn",n.className="theme-btn flex items-center space-x-0 md:space-x-1 px-2 md:px-3 py-1.5 rounded transition-colors text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600",n.title="Tutorial",n.innerHTML=`
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span class="hidden md:inline">Help</span>
  `,n.addEventListener("click",()=>{console.log("Help button clicked, restarting tutorial"),J()}),t.insertBefore(n,t.firstChild),console.log("Help button added to navigation")}Q();setTimeout(()=>{ie()},1e3);
