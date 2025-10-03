import{i as ge}from"./components-cO3_4e1u.js";import"./svg-ckjYZtu2.js";import"./builder-eHfHUSQk.js";import"./storage-JQpETU5t.js";async function oe(){const e=document.getElementById("serifsGrid"),t=document.getElementById("joinsGrid");if(!e||!t)throw new Error("Grid not found. Please ensure the builder is loaded.");const r=e.getBoundingClientRect(),a=t.getBoundingClientRect(),d=Math.min(r.left,a.left),i=Math.min(r.top,a.top),o=Math.max(r.right,a.right),s=Math.max(r.bottom,a.bottom),m=o-d,h=s-i,n="http://www.w3.org/2000/svg",c=document.createElementNS(n,"svg");c.setAttribute("xmlns",n),c.setAttribute("viewBox",`0 0 ${m} ${h}`),c.setAttribute("width",m),c.setAttribute("height",h);const l=document.createElementNS(n,"g"),P=[{element:e,rect:r,name:"serifs"},{element:t,rect:a,name:"joins"}];for(const f of P)f.element.querySelectorAll(".grid-cell").forEach((p,j)=>{const K=p.querySelectorAll("svg"),X=p.querySelectorAll('[data-textured="true"]');K.forEach(x=>{const g=x.cloneNode(!0),C=p.getBoundingClientRect(),Q=C.left-d,b=C.top-i,v=window.getComputedStyle(x),E=parseFloat(v.width)||C.width,q=parseFloat(v.height)||C.height,O=v.position,A=v.top,B=v.left,L=v.right,R=v.bottom,G=v.transform;let $=Q,H=b;if(O==="absolute"){if(B!=="auto"&&B!==""){const u=parseFloat(B);$+=u}else if(L!=="auto"&&L!==""){const u=parseFloat(L);$+=C.width-E-u}if(A!=="auto"&&A!==""){const u=parseFloat(A);H+=u}else if(R!=="auto"&&R!==""){const u=parseFloat(R);H+=C.height-q-u}}const M=document.createElementNS(n,"g");let S=`translate(${$}, ${H})`;if(G&&G!=="none"){const u=G.match(/matrix\(([^)]+)\)/);if(u){const W=u[1].split(",").map(U=>parseFloat(U.trim()));if(W.length===6){const U=W[4],N=W[5];S+=` translate(${U}, ${N})`}}}M.setAttribute("transform",S);const I=g.innerHTML,J=g.getAttribute("viewBox");if(J){const u=document.createElementNS(n,"svg");u.setAttribute("viewBox",J),u.setAttribute("width",E),u.setAttribute("height",q),u.innerHTML=I,M.appendChild(u)}else{const u=document.createElementNS(n,"g");u.innerHTML=I,M.appendChild(u)}l.appendChild(M)}),X.forEach(x=>{const g=p.getBoundingClientRect(),C=g.left-d,Q=g.top-i,b=window.getComputedStyle(x),v=parseFloat(b.width)||g.width,E=parseFloat(b.height)||g.height,q=b.position,O=b.top,A=b.left,B=b.right,L=b.bottom,R=b.transform;let G=C,$=Q;if(q==="absolute"){if(A!=="auto"&&A!==""){const S=parseFloat(A);G+=S}else if(B!=="auto"&&B!==""){const S=parseFloat(B);G+=g.width-v-S}if(O!=="auto"&&O!==""){const S=parseFloat(O);$+=S}else if(L!=="auto"&&L!==""){const S=parseFloat(L);$+=g.height-E-S}}const H=x.dataset.textureId,M=b.webkitMaskImage||b.maskImage;if(M&&M.includes("data:image/svg+xml;base64,")){const S=M.match(/data:image\/svg\+xml;base64,([^)'"]+)/);if(S)try{const I=S[1],J=decodeURIComponent(escape(atob(I))),U=new DOMParser().parseFromString(J,"image/svg+xml").querySelector("svg");if(U){const N=document.createElementNS(n,"g");let ie=`translate(${G}, ${$})`;if(R&&R!=="none"){const y=R.match(/matrix\(([^)]+)\)/);if(y){const T=y[1].split(",").map(ee=>parseFloat(ee.trim()));if(T.length===6){const ee=T[4],de=T[5];ie+=` translate(${ee}, ${de})`}}}N.setAttribute("transform",ie);const re=document.createElementNS(n,"defs"),F=document.createElementNS(n,"pattern"),Z=`texture-${H}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;F.setAttribute("id",Z),F.setAttribute("patternUnits","userSpaceOnUse"),F.setAttribute("width",v),F.setAttribute("height",E);const se=b.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);if(se){const y=se[1],T=document.createElementNS(n,"image");T.setAttribute("href",y),T.setAttribute("width",v),T.setAttribute("height",E),T.setAttribute("preserveAspectRatio","xMidYMid slice"),F.appendChild(T)}re.appendChild(F),N.appendChild(re);const le=U.getAttribute("viewBox"),V=document.createElementNS(n,"svg");V.setAttribute("width",v),V.setAttribute("height",E),le&&V.setAttribute("viewBox",le);const D=U.cloneNode(!0);D.querySelectorAll("*").forEach(y=>{y.getAttribute("fill")&&y.getAttribute("fill")!=="none"&&y.setAttribute("fill",`url(#${Z})`),y.getAttribute("stroke")&&y.getAttribute("stroke")!=="none"&&y.setAttribute("stroke",`url(#${Z})`)}),D.children.length>0?Array.from(D.children).forEach(y=>{V.appendChild(y)}):V.innerHTML=D.innerHTML,N.appendChild(V),l.appendChild(N)}}catch(I){console.warn("Failed to process textured element:",I)}}})});return c.appendChild(l),{svg:c,width:m,height:h}}async function ue(){console.log("Starting SVG export...");const e=window.getPreviewMode?window.getPreviewMode():!1;window.setPreviewMode&&!e&&(window.setPreviewMode(!0),document.body.classList.add("preview-mode"),await new Promise(t=>setTimeout(t,100)));try{const{svg:t}=await oe(),a=new XMLSerializer().serializeToString(t),d=new Blob([a],{type:"image/svg+xml"}),i=URL.createObjectURL(d),o=document.createElement("a");o.href=i,o.download=`asemia-composition-${Date.now()}.svg`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(i),console.log("SVG export complete!")}catch(t){console.error("SVG export failed:",t),alert("Export failed: "+t.message)}finally{window.setPreviewMode&&!e&&(window.setPreviewMode(!1),document.body.classList.remove("preview-mode"))}}async function me(){console.log("Starting PNG export...");const e=window.getPreviewMode?window.getPreviewMode():!1;window.setPreviewMode&&!e&&(window.setPreviewMode(!0),document.body.classList.add("preview-mode"),await new Promise(t=>setTimeout(t,100)));try{const{svg:t,width:r,height:a}=await oe(),i=new XMLSerializer().serializeToString(t),o=new Blob([i],{type:"image/svg+xml;charset=utf-8"}),s=URL.createObjectURL(o),m=new Image;await new Promise((w,p)=>{m.onload=w,m.onerror=p,m.src=s});const h=document.createElement("canvas"),n=2;h.width=r*n,h.height=a*n;const c=h.getContext("2d");c.scale(n,n),c.drawImage(m,0,0,r,a),URL.revokeObjectURL(s);const l=await new Promise(w=>{h.toBlob(w,"image/png")}),P=URL.createObjectURL(l),f=document.createElement("a");f.href=P,f.download=`asemia-composition-${Date.now()}.png`,document.body.appendChild(f),f.click(),document.body.removeChild(f),URL.revokeObjectURL(P),console.log("PNG export complete!")}catch(t){console.error("PNG export failed:",t),alert("Export failed: "+t.message)}finally{window.setPreviewMode&&!e&&(window.setPreviewMode(!1),document.body.classList.remove("preview-mode"))}}async function pe(){console.log("Starting JPEG export...");const e=window.getPreviewMode?window.getPreviewMode():!1;window.setPreviewMode&&!e&&(window.setPreviewMode(!0),document.body.classList.add("preview-mode"),await new Promise(t=>setTimeout(t,100)));try{const t=document.documentElement.classList.contains("dark"),r=window.getComputedStyle(document.body),a=t?"#0f172a":"#ffffff",d=t?"#ffffff":"#000000";console.log("Theme:",t?"dark":"light"),console.log("Background color:",a),console.log("Fill color:",d);const{svg:i,width:o,height:s}=await oe(),m=i.cloneNode(!0);m.querySelectorAll("path, polygon, circle, ellipse, rect, line, polyline").forEach(g=>{(!g.hasAttribute("fill")||g.getAttribute("fill")!=="none")&&g.setAttribute("fill",d),g.hasAttribute("stroke")&&g.getAttribute("stroke")!=="none"&&g.setAttribute("stroke",d)});const c=new XMLSerializer().serializeToString(m),l=new Blob([c],{type:"image/svg+xml;charset=utf-8"}),P=URL.createObjectURL(l),f=new Image;await new Promise((g,C)=>{f.onload=g,f.onerror=C,f.src=P});const w=document.createElement("canvas"),p=2;w.width=o*p,w.height=s*p;const j=w.getContext("2d");j.scale(p,p),j.fillStyle=a,j.fillRect(0,0,o,s),j.drawImage(f,0,0,o,s),URL.revokeObjectURL(P);const K=await new Promise(g=>{w.toBlob(g,"image/jpeg",.95)}),X=URL.createObjectURL(K),x=document.createElement("a");x.href=X,x.download=`asemia-composition-${Date.now()}.jpg`,document.body.appendChild(x),x.click(),document.body.removeChild(x),URL.revokeObjectURL(X),console.log("JPEG export complete!")}catch(t){console.error("JPEG export failed:",t),alert("Export failed: "+t.message)}finally{window.setPreviewMode&&!e&&(window.setPreviewMode(!1),document.body.classList.remove("preview-mode"))}}document.addEventListener("DOMContentLoaded",()=>{window.exportAsPNG=me,window.exportAsSVG=ue,window.exportAsJPEG=pe,console.log("Export functionality initialized")});const he=[{id:"welcome",title:"Welcome to the Asemic Typeform Crafter!",generalContent:`Build unique typographic forms using the fundamental elements of type: Serifs, Bodies, and Joins.

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

💡 Tip: Check out the Archive to see examples, or try the Word and Sentence Generators for inspiration.`,desktopContent:"",mobileContent:"",desktopTargetSelector:null,mobileTargetSelector:"",position:"center",highlightPulse:!1,showSkip:!1}];let k=0,te=window.innerWidth<768,Y,z,_,ne;window.nextTutorialStep=function(){console.log("Next button clicked, current step:",k),Y();const e=z();if(k++,k>=e.length){ne();return}_(e[k])};window.previousTutorialStep=function(){console.log("Back button clicked"),Y(),k--;const e=z();k<0&&(k=0),_(e[k])};window.skipTutorial=function(){console.log("Skip button clicked"),Y(),ne()};window.resetTutorial=function(){console.log("Resetting tutorial state..."),localStorage.removeItem("hasSeenFreebuilderTutorial"),Y();const e=document.getElementById("tutorialHelpBtn");e&&e.remove(),k=0,console.log("Tutorial reset complete. Reload the page to see the tutorial again.")};function fe(){if(console.log("Initializing tutorial system..."),localStorage.getItem("hasSeenFreebuilderTutorial")){console.log("User has seen tutorial, adding help button"),ce();return}setTimeout(()=>{console.log("Starting tutorial for first-time user"),ae()},1500)}function ae(){k=0,te=window.innerWidth<768;const e=z();e.length>0&&_(e[0])}z=function(){return he.filter(e=>!(e.mobileOnly&&!te||e.desktopOnly&&te))};_=function(e){console.log("Showing tutorial step:",e.id);const t=window.innerWidth<768,r=t?e.mobileTargetSelector||e.desktopTargetSelector:e.desktopTargetSelector||e.mobileTargetSelector,a=t&&e.mobilePosition?e.mobilePosition:e.position,d=we();document.body.appendChild(d),r&&(ve(r,e.highlightPulse)||console.warn("Target element not found:",r));const i=be(e);document.body.appendChild(i),requestAnimationFrame(()=>{Se(i,r,a,e.id)}),requestAnimationFrame(()=>{d.style.opacity="1",i.style.opacity="1"})};function we(){const e=document.createElement("div");return e.id="tutorial-overlay",e.className="fixed inset-0 bg-black/30 z-[9998] transition-opacity duration-300",e.style.opacity="0",e.addEventListener("click",t=>{if(t.target===e){const a=z()[k];a&&a.showSkip&&skipTutorial()}}),e}function be(e){const t=document.createElement("div");t.id="tutorial-tooltip",t.className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 md:p-6 max-w-sm md:max-w-md transition-opacity duration-300",t.style.opacity="0";const r=z(),a=r.findIndex(s=>s.id===e.id),d=r.length,i=window.innerWidth<768;let o=e.generalContent||"";if(i&&e.mobileContent?o=e.mobileContent:!i&&e.desktopContent&&(o=e.desktopContent),e.generalContent&&(i&&e.mobileContent||!i&&e.desktopContent)){const s=i?e.mobileContent:e.desktopContent;o=e.generalContent+(s?`

`+s:"")}return t.innerHTML=`
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
  `,t}function ve(e,t=!1){const r=document.querySelector(e);if(!r)return!1;const a=r.getBoundingClientRect(),d=document.createElement("div");return d.id="tutorial-spotlight",d.className=`fixed z-[9998] border-4 border-blue-500 rounded-lg pointer-events-none transition-all duration-300 ${t?"animate-pulse":""}`,d.style.cssText=`
    top: ${a.top-8}px;
    left: ${a.left-8}px;
    width: ${a.width+16}px;
    height: ${a.height+16}px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
  `,document.body.appendChild(d),!0}function Se(e,t,r,a=null){if(!t||r==="center"){e.style.cssText+=`
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;return}const d=document.querySelector(t);if(!d){e.style.cssText+=`
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;return}const i=d.getBoundingClientRect(),o=e.getBoundingClientRect(),s=16,m=window.innerWidth,h=window.innerHeight;let n,c,l="";switch(r){case"bottom":n=i.bottom+s,c=i.left+i.width/2,l="translateX(-50%)",n+o.height>h&&(n=i.top-o.height-s);break;case"top":n=i.top-o.height-s,c=i.left+i.width/2,l="translateX(-50%)",n<0&&(n=i.bottom+s);break;case"right":n=i.top+i.height/2,c=i.right+s,l="translateY(-50%)",c+o.width>m&&(c=i.left-o.width-s);break;case"left":n=i.top+i.height/2,c=i.left-o.width-s,l="translateY(-50%)",c<0&&(c=i.right+s);break;default:n=h/2,c=m/2,l="translate(-50%, -50%)"}a==="erase-mode"&&(n-=80),a==="preview-mode"&&(n-=80);const f=window.innerWidth<768&&(a==="saving"||a==="size");let w=c,p=n;l.includes("translateX(-50%)")&&(w=c-o.width/2),l.includes("translateY(-50%)")&&(p=n-o.height/2),l==="translate(-50%, -50%)"&&(w=c-o.width/2,p=n-o.height/2),w<s&&(c=s,l.includes("translateX(-50%)")&&(c=s+o.width/2),l=l.replace("translateX(-50%)","")),w+o.width>m-s&&(c=m-o.width-s,l.includes("translateX(-50%)")&&(c=m-o.width/2-s),l=l.replace("translateX(-50%)","")),p<s&&(n=s,l.includes("translateY(-50%)")&&(n=s+o.height/2),l=l.replace("translateY(-50%)","")),p+o.height>h-s&&(n=h-o.height-s,l.includes("translateY(-50%)")&&(n=h-o.height/2-s),l=l.replace("translateY(-50%)","")),l=l.trim(),f?e.style.cssText+=`
      top: ${n}px;
      right: 30px;
      margin-left: 100px;
      left: auto;
      ${l?`transform: ${l};`:""}
    `:e.style.cssText+=`
      top: ${n}px;
      left: ${c}px;
      ${l?`transform: ${l};`:""}
    `}Y=function(){const e=document.getElementById("tutorial-overlay"),t=document.getElementById("tutorial-tooltip"),r=document.getElementById("tutorial-spotlight");e&&(e.style.opacity="0",setTimeout(()=>e.remove(),300)),t&&(t.style.opacity="0",setTimeout(()=>t.remove(),300)),r&&r.remove()};ne=function(){localStorage.setItem("hasSeenFreebuilderTutorial","true"),console.log("Tutorial completed"),ce()};function ce(){if(document.getElementById("tutorialHelpBtn"))return;const e=document.querySelector("nav");if(!e){console.warn("Nav element not found, cannot add help button");return}const t=e.querySelector(".flex.items-center.bg-gray-100");if(!t){console.warn("Middle section not found, cannot add help button");return}const r=document.createElement("button");r.id="tutorialHelpBtn",r.className="theme-btn flex items-center space-x-0 md:space-x-1 px-2 md:px-3 py-1.5 rounded transition-colors text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600",r.title="Tutorial",r.innerHTML=`
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span class="hidden md:inline">Help</span>
  `,r.addEventListener("click",()=>{console.log("Help button clicked, restarting tutorial"),ae()}),t.insertBefore(r,t.firstChild),console.log("Help button added to navigation")}ge();setTimeout(()=>{fe()},1e3);
