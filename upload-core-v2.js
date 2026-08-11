(()=>{'use strict';
if(window.__RECORTE_UPLOAD_NATIVE_152__)return;window.__RECORTE_UPLOAD_NATIVE_152__=true;
const VERSION='1.5.2',IMAGE_EXT=/\.(png|jpe?g|webp|heic|heif)$/i,ZIP_EXT=/\.zip$/i,$=s=>document.querySelector(s);
const topInput=document.getElementById('fileInput');
const heroInput=document.querySelector('.heroFile input[type="file"]');
const inputs=[topInput,heroInput].filter(Boolean);
if(!inputs.length)return;

function unwrapNativeInput(input,kind){
  const host=input.closest('label');
  input.type='file';
  input.removeAttribute('capture');
  input.removeAttribute('multiple');
  input.removeAttribute('onchange');
  input.accept='.zip,application/zip,application/x-zip-compressed,image/*,.png,.jpg,.jpeg,.webp,.heic,.heif';
  input.className='rsDirectNativeFile rsDirectNativeFile-'+kind;
  input.setAttribute('aria-label',kind==='top'?'Abrir imagem ou ZIP':'Selecionar arquivo ou ZIP');
  if(host){
    const parent=host.parentNode;
    if(parent){parent.insertBefore(input,host);host.remove();}
  }
}
unwrapNativeInput(topInput,'top');
unwrapNativeInput(heroInput,'hero');

const style=document.createElement('style');style.id='rsNative152';style.textContent=`
.rsDirectNativeFile{display:block!important;position:relative!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;width:210px!important;max-width:48vw!important;height:44px!important;min-height:44px!important;margin:0!important;padding:0!important;color:#eee9ff!important;background:#17111f!important;border:1px solid #7c3aed!important;border-radius:10px!important;font-size:12px!important;line-height:42px!important;-webkit-appearance:auto!important;appearance:auto!important;-webkit-user-select:auto!important;user-select:auto!important;-webkit-touch-callout:default!important;touch-action:auto!important;z-index:1000!important}
.rsDirectNativeFile-hero{width:250px!important;max-width:82vw!important;margin-top:15px!important}
.rsDirectNativeFile::file-selector-button{height:42px;border:0;border-right:1px solid #7c3aed;background:#6d28d9;color:#fff;font-weight:800;padding:0 12px;margin-right:8px}
.rsDirectNativeFile::-webkit-file-upload-button{height:42px;border:0;border-right:1px solid #7c3aed;background:#6d28d9;color:#fff;font-weight:800;padding:0 12px;margin-right:8px}
#stageWrap .rsDirectNativeFile{touch-action:auto!important;-webkit-user-select:auto!important;user-select:auto!important;-webkit-touch-callout:default!important}
@media(max-width:430px){.rsDirectNativeFile-top{width:158px!important;max-width:44vw!important;font-size:10px!important}.rsDirectNativeFile-hero{width:235px!important;max-width:84vw!important}}
`;document.head.appendChild(style);

function isImage(f){return!!f&&(String(f.type||'').startsWith('image/')||IMAGE_EXT.test(f.name||''))}function isZip(f){return!!f&&(/zip/i.test(String(f.type||''))||ZIP_EXT.test(f.name||''))}
function timeout(p,ms){return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('Tempo esgotado ao abrir arquivo.')),ms))])}
function viaURL(file){return new Promise((ok,no)=>{let url;try{url=URL.createObjectURL(file)}catch(e){no(e);return}const im=new Image();im.onload=()=>{try{URL.revokeObjectURL(url)}catch{};ok(im)};im.onerror=()=>{try{URL.revokeObjectURL(url)}catch{};no(new Error('Falha ao decodificar imagem.'))};im.src=url})}
async function viaBitmap(file){if(typeof createImageBitmap!=='function')throw new Error('createImageBitmap indisponível');const b=await createImageBitmap(file),c=document.createElement('canvas');c.width=b.width;c.height=b.height;c.getContext('2d',{alpha:true}).drawImage(b,0,0);try{b.close?.()}catch{}return c}
function viaReader(file){return new Promise((ok,no)=>{const r=new FileReader();r.onerror=()=>no(r.error||new Error('Falha no FileReader'));r.onload=()=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('Falha ao abrir DataURL'));im.src=r.result};r.readAsDataURL(file)})}
async function decode(file){try{return await timeout(viaURL(file),15000)}catch{}try{return await timeout(viaBitmap(file),15000)}catch{}return timeout(viaReader(file),20000)}
async function fromZip(file){if(!window.JSZip)throw new Error('Leitor ZIP ainda não carregou.');const zip=await window.JSZip.loadAsync(file),entries=Object.values(zip.files).filter(e=>!e.dir&&IMAGE_EXT.test(e.name||'')).sort((a,b)=>String(a.name).localeCompare(String(b.name),undefined,{numeric:true}));if(!entries.length)throw new Error('O ZIP não contém PNG, JPG, WEBP, HEIC ou HEIF.');const entry=entries[0],blob=await entry.async('blob'),name=(entry.name||'imagem.png').split('/').pop();let f;try{f=new File([blob],name,{type:/\.png$/i.test(name)?'image/png':/\.jpe?g$/i.test(name)?'image/jpeg':/\.webp$/i.test(name)?'image/webp':''})}catch{f=blob;try{Object.defineProperty(f,'name',{value:name})}catch{}}return{file:f,name,total:entries.length}}
function enable(){['aiRemoveBtn','aiProRemoveBtn','autoDetect','applyEdit','exportZip','exportSheet','exportPdf','cropStart','centerImage'].forEach(id=>{const e=document.getElementById(id);if(e)e.disabled=false})}
function status(title,sub,error=false){const b=$('#fileInfo');if(!b)return;b.classList.remove('hidden');b.innerHTML=`<div class="fileMeta"><b>${title}</b><span>${sub||''}</span></div>`;b.classList.toggle('error',error)}
let seq=0;async function handle(input){const original=input.files?.[0];if(!original)return;const mine=++seq;try{let target=original,zipMeta=null;if(isZip(original)){status('Abrindo ZIP…','Processando no dispositivo');zipMeta=await fromZip(original);target=zipMeta.file}else if(!isImage(original))throw new Error('Escolha uma imagem ou ZIP.');else status('Abrindo imagem…','Processando no dispositivo');const im=await decode(target);if(mine!==seq)return;if(!window.recorteSplit?.setAIResult)throw new Error('Editor ainda não carregou completamente.');window.recorteGrid?.reset?.();window.recorteSplit.setAIResult(im);enable();const w=im.naturalWidth||im.width||0,h=im.naturalHeight||im.height||0;status(zipMeta?zipMeta.name:(original.name||'Imagem'),zipMeta?`ZIP com ${zipMeta.total} imagem(ns) · ${w}×${h}px`:`${w}×${h}px`);window.dispatchEvent(new CustomEvent('recorte-file-loaded',{detail:{name:original.name,width:w,height:h,fromZip:!!zipMeta,version:VERSION}}))}catch(err){console.error('Recorte Split upload '+VERSION,err);status('Não foi possível abrir',err?.message||'Formato não suportado',true)}finally{try{input.value=''}catch{}}}
inputs.forEach(input=>{input.addEventListener('change',e=>{e.stopImmediatePropagation();handle(input)},{capture:true});input.addEventListener('cancel',()=>{try{input.value=''}catch{}})});
window.recorteUpload={version:VERSION,inputs:()=>inputs,native:true,zip:true,noProgrammaticClick:true,directInputs:true};window.dispatchEvent(new CustomEvent('recorte-upload-ready',{detail:{version:VERSION,native:true,zip:true,noProgrammaticClick:true,directInputs:true}}));
})();