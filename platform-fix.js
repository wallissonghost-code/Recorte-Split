(()=>{'use strict';if(window.__recortePlatformFixLoaded)return;window.__recortePlatformFixLoaded=true;
const stage=document.querySelector('#stageWrap'),canvas=document.querySelector('#canvas');
const block=e=>{if(e.target.closest('input[type="text"],input[type="number"],textarea,input[type="file"]'))return;e.preventDefault()};
document.addEventListener('selectstart',block,{passive:false});
document.addEventListener('dragstart',e=>{if(e.target.closest('#stageWrap,.framePreview,.frameViewer'))e.preventDefault()},{passive:false});
document.addEventListener('contextmenu',e=>{if(e.target.closest('#stageWrap,#canvas,.framePreview,.gridHandle,#cropOverlay'))e.preventDefault()},{passive:false});
if(stage){stage.style.webkitUserSelect='none';stage.style.userSelect='none';stage.style.webkitTouchCallout='none'}
if(canvas){canvas.style.webkitUserSelect='none';canvas.style.userSelect='none';canvas.style.webkitTouchCallout='none'}
const lockImages=root=>{root.querySelectorAll?.('img').forEach(i=>{i.draggable=false;i.style.webkitUserDrag='none'})};lockImages(document);
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches?.('img')){n.draggable=false;n.style.webkitUserDrag='none'}lockImages(n)}}).observe(document.body,{childList:true,subtree:true});
const VERSION='1.5.0';const BUILD='150-20260811-native-upload';window.__RECORTE_BUILD__=BUILD;window.__RECORTE_VERSION__=VERSION;
const badge=document.querySelector('.version');if(badge){badge.textContent='BETA '+VERSION;badge.dataset.build=BUILD}
async function loadSequential(src){if(document.querySelector(`script[data-rs-extra="${src}"]`))return;const already=[...document.scripts].some(s=>(s.getAttribute('src')||'').split('?')[0].endsWith('/'+src)||(s.getAttribute('src')||'').split('?')[0]===src);if(already)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`${src}?v=${VERSION}&build=${BUILD}`;s.dataset.rsExtra=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Falha ao carregar '+src));document.body.appendChild(s)})}
(async()=>{const modules=['viewport-lock.js','precision-lines.js','detector-precision.js','precision-split.js','line-lock.js','precision-touch.js','display-quality-fix.js','version-lock.js'];for(const src of modules){try{await loadSequential(src)}catch(err){console.error('Recorte Split bootstrap:',err)}}window.dispatchEvent(new CustomEvent('recorte-bootstrap-ready',{detail:{version:VERSION,build:BUILD}}))})();
})();