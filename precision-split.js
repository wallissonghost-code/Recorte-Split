(()=>{'use strict';
if(window.__RECORTE_PRECISION_SPLIT__)return;window.__RECORTE_PRECISION_SPLIT__=true;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const VERSION='1.4.0';
let selected=null,snapEnabled=true,manualMode=true,previewTimer=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const current=()=>window.recorteSplit?.getCurrent?.();
const iw=im=>im?.naturalWidth||im?.width||0, ih=im=>im?.naturalHeight||im?.height||0;

/* UI */
const gridSec=$('#gridSec');
if(gridSec&&!$('#precisionTools')){
 const box=document.createElement('div');box.id='precisionTools';box.className='subcard precisionTools';
 box.innerHTML=`<div class="subHead"><b>Recorte de precisão</b><span>SPRITES</span></div>
 <div class="precisionModeRow"><button id="manualGridMode" class="secondary active">▦ Grade manual</button><button id="snapToggle" class="secondary active">⌁ Snap suave</button></div>
 <div class="precisionLineRow"><button id="addVLine" class="secondary">＋ Linha vertical</button><button id="addHLine" class="secondary">＋ Linha horizontal</button><button id="deleteLine" class="secondary danger" disabled>Excluir linha</button></div>
 <div id="linePosition" class="info">Selecione uma linha para ver a posição exata.</div>
 <label>Margem transparente<select id="transparentMargin"><option value="0">0 px</option><option value="5">5 px</option><option value="10">10 px</option><option value="20" selected>20 px</option><option value="30">30 px</option><option value="40">40 px</option></select></label>
 <label class="checkrow"><input id="uniformFrames" type="checkbox"><b>Mesmo tamanho para todos os frames</b></label>
 <div class="info">A margem é adicionada somente depois do recorte. O conteúdo original nunca é reduzido ou esticado.</div>`;
 const auto=$('#autoDetect');auto?.after(box);
}
const css=document.createElement('style');css.id='precisionSplitStyles';css.textContent=`
.precisionTools{border-color:#32284a!important}.precisionModeRow,.precisionLineRow{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.precisionLineRow{grid-template-columns:1fr 1fr 1fr}.precisionTools button.active{border-color:#8b5cf6!important;background:#21143b!important;color:#eee7ff!important}.precisionTools .danger:not(:disabled){border-color:#7f1d1d!important;color:#fecaca!important}.gridHandle{--line:#a855f7}.gridHandle:before{box-shadow:none!important;background:var(--line)!important}.gridHandle.v:before{width:1px!important;left:50%!important;transform:translateX(-.5px)!important}.gridHandle.h:before{height:1px!important;top:50%!important;transform:translateY(-.5px)!important}.gridHandle.selected:before,.gridHandle.dragging:before{background:#d8b4fe!important}.gridHandle.v.selected:before,.gridHandle.v.dragging:before{width:2px!important;transform:translateX(-1px)!important}.gridHandle.h.selected:before,.gridHandle.h.dragging:before{height:2px!important;transform:translateY(-1px)!important}.gridHandle.locked:before{background:#60a5fa!important}.gridHandle:after{opacity:.32!important;transform:scale(.72)!important}.gridHandle:hover:after,.gridHandle.selected:after,.gridHandle.dragging:after{opacity:.85!important}.linePixelTag{position:absolute;z-index:30;pointer-events:none;padding:3px 6px;border:1px solid #7c3aed;background:#0b0d13e8;color:#f5f3ff;border-radius:6px;font:700 9px/1 system-ui;transform:translate(-50%,-130%);white-space:nowrap}.snapGuide{position:absolute;z-index:15;pointer-events:none;background:#22c55e;opacity:.6}.snapGuide.v{width:1px}.snapGuide.h{height:1px}.previewZoomBar{display:flex;align-items:center;justify-content:center;gap:8px;margin:6px 0 0}.previewZoomBar button{width:34px;height:30px;padding:0;margin:0}.previewZoomBar span{font-size:9px;color:#a5acb8;min-width:42px;text-align:center}.animStage{overflow:auto!important}.animStage img{transform-origin:center center;transition:transform .08s linear}.frameThumb.precisionWarn{border-color:#fb7185!important}.precisionAutoInfo{font-size:9px;color:#8f95a3;margin-top:7px}@media(max-width:700px){.precisionLineRow{grid-template-columns:1fr 1fr}.precisionLineRow #deleteLine{grid-column:1/-1}.gridHandle.v{width:20px!important}.gridHandle.h{height:20px!important}.gridHandle.v:before{left:10px!important}.gridHandle.h:before{top:10px!important}.gridHandle:after{display:none!important}.linePixelTag{font-size:8px}.precisionModeRow{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(css);

const marginEl=$('#transparentMargin'), uniformEl=$('#uniformFrames');
try{marginEl.value=localStorage.getItem('recorteSplit.margin')||'0';uniformEl.checked=localStorage.getItem('recorteSplit.uniform')==='1'}catch{}
marginEl?.addEventListener('change',()=>{try{localStorage.setItem('recorteSplit.margin',marginEl.value)}catch{};refreshPreview()});
uniformEl?.addEventListener('change',()=>{try{localStorage.setItem('recorteSplit.uniform',uniformEl.checked?'1':'0')}catch{};refreshPreview()});
$('#gridGap') && ($('#gridGap').value='0');

function lineState(){const cols=Math.max(1,+$('#cols')?.value||1),rows=Math.max(1,+$('#rows')?.value||1);return{cols,rows,x:window.recorteGrid?.getLines?.('x',cols)||Array.from({length:cols+1},(_,i)=>i/cols),y:window.recorteGrid?.getLines?.('y',rows)||Array.from({length:rows+1},(_,i)=>i/rows)}}
function setExactLines(axis,arr){const count=arr.length-1;const el=$(axis==='x'?'#cols':'#rows');if(el)el.value=count;window.recorteGrid?.ensure?.(+$('#cols').value,+$('#rows').value);const target=window.recorteGrid?.getLines?.(axis,count);for(let i=1;i<arr.length-1;i++)window.recorteGrid?.setLine?.(axis,i,arr[i]);window.dispatchEvent(new CustomEvent('recorte-grid-rebuild'));window.recorteSplit?.redraw?.();refreshPreview()}

/* improved detector: band occupancy + corridor valleys */
function analysisCanvas(){const im=current();if(!im)return null;const max=900,s=Math.min(1,max/Math.max(iw(im),ih(im))),c=document.createElement('canvas');c.width=Math.max(32,Math.round(iw(im)*s));c.height=Math.max(32,Math.round(ih(im)*s));const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,c.width,c.height);const id=x.getImageData(0,0,c.width,c.height),d=id.data;
 const corners=[[2,2],[c.width-3,2],[2,c.height-3],[c.width-3,c.height-3]].map(([px,py])=>{const k=(py*c.width+px)*4;return[d[k],d[k+1],d[k+2],d[k+3]]});
 const bg=[0,1,2].map(ch=>corners.map(v=>v[ch]).sort((a,b)=>a-b)[1]);
 let transparent=false;for(let k=3;k<d.length;k+=4){if(d[k]<245){transparent=true;break}}
 const mask=new Uint8Array(c.width*c.height);for(let p=0,k=0;p<mask.length;p++,k+=4){const a=d[k+3];if(transparent){mask[p]=a>28?1:0}else{const dr=d[k]-bg[0],dg=d[k+1]-bg[1],db=d[k+2]-bg[2];mask[p]=(dr*dr+dg*dg+db*db)>900?1:0}}
 return{c,mask,w:c.width,h:c.height,s};}
function smooth(a,r=3){return a.map((_,i)=>{let s=0,n=0;for(let j=Math.max(0,i-r);j<=Math.min(a.length-1,i+r);j++){s+=a[j];n++}return s/n})}
function projection(A,axis){const n=axis==='x'?A.w:A.h,m=axis==='x'?A.h:A.w,out=new Array(n).fill(0);for(let p=0;p<n;p++){let hit=0;for(let q=0;q<m;q++){const xx=axis==='x'?p:q,yy=axis==='x'?q:p;hit+=A.mask[yy*A.w+xx]}out[p]=hit/m}return smooth(out,Math.max(2,Math.round(n/250)))}
function corridors(proj){const sorted=proj.slice().sort((a,b)=>a-b),q=sorted[Math.floor(sorted.length*.28)]||0,thr=Math.min(.16,Math.max(.015,q*1.7+.008));const groups=[];let start=-1;for(let i=1;i<proj.length-1;i++){if(proj[i]<=thr&&start<0)start=i;if((proj[i]>thr||i===proj.length-2)&&start>=0){const end=i-1;if(end-start+1>=2){let best=start;for(let j=start+1;j<=end;j++)if(proj[j]<proj[best])best=j;groups.push({start,end,best,score:proj[best]})}start=-1}}return groups.filter(g=>g.best>proj.length*.035&&g.best<proj.length*.965)}
function regularize(groups,n){if(groups.length<1)return groups;const minDist=Math.max(3,n*.035);const out=[];for(const g of groups){if(!out.length||g.best-out.at(-1).best>=minDist)out.push(g);else if(g.score<out.at(-1).score)out[out.length-1]=g}return out}
function detectGrid(){const A=analysisCanvas();if(!A)return null;const vx=regularize(corridors(projection(A,'x')),A.w),hy=regularize(corridors(projection(A,'y')),A.h);let cols=clamp(vx.length+1,1,30),rows=clamp(hy.length+1,1,30);const x=[0,...vx.map(g=>g.best/A.w),1],y=[0,...hy.map(g=>g.best/A.h),1];return{cols,rows,x,y,vx,hy,A}}
$('#autoDetect')?.addEventListener('click',e=>{if(!current())return;e.preventDefault();e.stopImmediatePropagation();const d=detectGrid();if(!d)return;$('#cols').value=d.cols;$('#rows').value=d.rows;window.recorteGrid?.ensure?.(d.cols,d.rows);window.recorteGrid?.reset?.();requestAnimationFrame(()=>{for(let i=1;i<d.x.length-1;i++)window.recorteGrid?.setLine?.('x',i,d.x[i]);for(let i=1;i<d.y.length-1;i++)window.recorteGrid?.setLine?.('y',i,d.y[i]);window.dispatchEvent(new CustomEvent('recorte-grid-rebuild'));window.recorteSplit?.redraw?.();refreshPreview()});const s=$('#detectStatus');if(s){s.classList.remove('hidden');s.innerHTML=`Sugestão: <b>${d.cols}×${d.rows}</b> (${d.cols*d.rows} frames). Detectado por corredores de baixa ocupação em faixas da imagem.`}},true);

/* snap */
function snapFor(axis,norm){if(!snapEnabled)return norm;const d=detectGrid();if(!d)return norm;const groups=axis==='x'?d.vx:d.hy,size=axis==='x'?d.A.w:d.A.h;let best=null,dist=Infinity;for(const g of groups){const v=g.best/size,dd=Math.abs(v-norm);if(dd<dist){dist=dd;best=v}}return dist<.018?best:norm}

/* selection/add/delete */
document.addEventListener('pointerdown',e=>{const h=e.target.closest?.('.gridHandle');if(!h)return;$$('.gridHandle').forEach(x=>x.classList.remove('selected'));h.classList.add('selected');selected={axis:h.dataset.axis,index:+h.dataset.index};updatePosLabel();},true);
function updatePosLabel(){const out=$('#linePosition');if(!out||!selected||!current())return;const st=lineState(),arr=selected.axis==='x'?st.x:st.y,px=Math.round(arr[selected.index]*(selected.axis==='x'?iw(current()):ih(current())));out.textContent=`Linha ${selected.axis==='x'?'vertical':'horizontal'} • ${px}px • ${Math.round(arr[selected.index]*10000)/100}%`;$('#deleteLine').disabled=false}
window.addEventListener('recorte-grid-change',()=>{updatePosLabel();refreshPreview()});
$('#manualGridMode')?.addEventListener('click',e=>{manualMode=!manualMode;e.currentTarget.classList.toggle('active',manualMode)});
$('#snapToggle')?.addEventListener('click',e=>{snapEnabled=!snapEnabled;e.currentTarget.classList.toggle('active',snapEnabled)});
function addLine(axis){const st=lineState(),arr=(axis==='x'?st.x:st.y).slice();let pos=.5;if(selected&&selected.axis===axis){const i=selected.index;pos=(arr[i]+(arr[i+1]??1))/2}else{let widest=-1;for(let i=0;i<arr.length-1;i++){const w=arr[i+1]-arr[i];if(w>widest){widest=w;pos=(arr[i]+arr[i+1])/2}}}arr.push(pos);arr.sort((a,b)=>a-b);setExactLines(axis,arr)}
$('#addVLine')?.addEventListener('click',()=>addLine('x'));$('#addHLine')?.addEventListener('click',()=>addLine('y'));
$('#deleteLine')?.addEventListener('click',()=>{if(!selected)return;const st=lineState(),arr=(selected.axis==='x'?st.x:st.y).slice();if(arr.length<=2)return;arr.splice(selected.index,1);setExactLines(selected.axis,arr);selected=null;$('#deleteLine').disabled=true;$('#linePosition').textContent='Selecione uma linha para ver a posição exata.'});

/* click near canvas edge adds a line only while explicit modifier button is active */
let addAxis=null;$('#addVLine')?.addEventListener('dblclick',()=>addAxis='x');$('#addHLine')?.addEventListener('dblclick',()=>addAxis='y');

/* hook setLine for soft snap + exact UI */
const wait=setInterval(()=>{if(!window.recorteGrid?.setLine)return;clearInterval(wait);if(window.recorteGrid.__precisionWrapped)return;const raw=window.recorteGrid.setLine.bind(window.recorteGrid);window.recorteGrid.setLine=(axis,index,value)=>{const v=snapFor(axis,value);raw(axis,index,v);if(selected&&selected.axis===axis&&selected.index===index)requestAnimationFrame(updatePosLabel)};window.recorteGrid.__precisionWrapped=true},80);

/* exact export engine */
function getRects(){const im=current();if(!im)return[];const st=lineState(),W=iw(im),H=ih(im),rects=[];for(let r=0;r<st.rows;r++)for(let c=0;c<st.cols;c++){const x0=Math.round(st.x[c]*W),x1=Math.round(st.x[c+1]*W),y0=Math.round(st.y[r]*H),y1=Math.round(st.y[r+1]*H);rects.push({c,r,sx:x0,sy:y0,sw:Math.max(1,x1-x0),sh:Math.max(1,y1-y0)})}return rects}
function outputCanvases(){const im=current(),rects=getRects(),m=Math.max(0,+marginEl?.value||0),uniform=!!uniformEl?.checked;if(!im)return[];let maxW=0,maxH=0;if(uniform){for(const r of rects){maxW=Math.max(maxW,r.sw+2*m);maxH=Math.max(maxH,r.sh+2*m)}}return rects.map((r,i)=>{const c=document.createElement('canvas');c.width=uniform?maxW:r.sw+2*m;c.height=uniform?maxH:r.sh+2*m;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const dx=Math.round((c.width-r.sw)/2),dy=Math.round((c.height-r.sh)/2);x.drawImage(im,r.sx,r.sy,r.sw,r.sh,dx,dy,r.sw,r.sh);c.dataset.frame=i+1;return c})}
function refreshPreview(){clearTimeout(previewTimer);previewTimer=setTimeout(()=>{const wrap=$('#framePreview');if(!wrap||!current())return;const cs=outputCanvases();wrap.innerHTML='';cs.forEach((c,i)=>{const b=document.createElement('button');b.className='frameThumb';b.type='button';b.innerHTML=`<img src="${c.toDataURL('image/png')}"><span>${String(i+1).padStart(2,'0')}</span>`;b.addEventListener('click',()=>{wrap.querySelectorAll('.active').forEach(x=>x.classList.remove('active'));b.classList.add('active')});wrap.appendChild(b)});if($('#frameCount'))$('#frameCount').textContent=`${cs.length} frames`;window.dispatchEvent(new CustomEvent('recorte-preview-refreshed'))},70)}
window.addEventListener('recorte-grid-change',refreshPreview);['cols','rows','transparentMargin','uniformFrames'].forEach(id=>$('#'+id)?.addEventListener('input',refreshPreview));setTimeout(refreshPreview,700);

function mime(){const f=$('#format')?.value||'png';return f==='jpeg'?'image/jpeg':f==='webp'?'image/webp':'image/png'}
function q(){return Math.max(.4,Math.min(1,(+$('#jpegQuality')?.value||100)/100))}
function toBlob(c){return new Promise(ok=>c.toBlob(ok,mime(),q()))}
function dl(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()}
$('#exportZip')?.addEventListener('click',async e=>{if(!current()||!window.JSZip)return;e.preventDefault();e.stopImmediatePropagation();const zip=new JSZip(),cs=outputCanvases(),prefix=$('#filePrefix')?.value||'frame',ext=($('#format')?.value||'png').replace('jpeg','jpg');for(let i=0;i<cs.length;i++)zip.file(`${prefix}_${String(i+1).padStart(2,'0')}.${ext}`,await toBlob(cs[i]));const blob=await zip.generateAsync({type:'blob'}),u=URL.createObjectURL(blob);dl(u,`${prefix}_frames.zip`);setTimeout(()=>URL.revokeObjectURL(u),3000)},true);
$('#exportSheet')?.addEventListener('click',e=>{if(!current())return;e.preventDefault();e.stopImmediatePropagation();const cs=outputCanvases(),cols=Math.max(1,+$('#cols').value||1),rows=Math.ceil(cs.length/cols),cw=Math.max(...cs.map(c=>c.width)),ch=Math.max(...cs.map(c=>c.height)),sheet=document.createElement('canvas');sheet.width=cw*cols;sheet.height=ch*rows;const x=sheet.getContext('2d');cs.forEach((c,i)=>x.drawImage(c,(i%cols)*cw+Math.round((cw-c.width)/2),Math.floor(i/cols)*ch+Math.round((ch-c.height)/2)));dl(sheet.toDataURL(mime(),q()),`sprite_sheet.${($('#format')?.value||'png').replace('jpeg','jpg')}`)},true);

/* animation zoom */
function addPreviewZoom(){const stage=$('.animStage');if(!stage||$('.previewZoomBar'))return;let z=1;const bar=document.createElement('div');bar.className='previewZoomBar';bar.innerHTML='<button class="secondary" data-z="-">−</button><span>100%</span><button class="secondary" data-z="+">＋</button><button class="secondary" data-z="0">1:1</button>';stage.after(bar);const apply=()=>{const im=$('#animPreviewImg');if(im)im.style.transform=`scale(${z})`;bar.querySelector('span').textContent=Math.round(z*100)+'%'};bar.addEventListener('click',e=>{const v=e.target.dataset.z;if(!v)return;z=v==='+'?Math.min(4,z+.25):v==='-'?Math.max(.5,z-.25):1;apply()});}
setTimeout(addPreviewZoom,900);new MutationObserver(addPreviewZoom).observe(document.body,{childList:true,subtree:true});

/* version */
const badge=$('.version');if(badge)badge.textContent='BETA '+VERSION;
})();