(()=>{'use strict';
if(window.__RECORTE_UPLOAD_149__)return;
window.__RECORTE_UPLOAD_149__=true;
window.__RECORTE_UPLOAD_CORE_V2__=true;
const VERSION='1.4.9';
const $=s=>document.querySelector(s);
const IMAGE_EXT=/\.(png|jpe?g|webp|heic|heif)$/i;
const ZIP_EXT=/\.zip$/i;
const isImage=f=>!!f&&(String(f.type||'').startsWith('image/')||IMAGE_EXT.test(f.name||''));
const isZip=f=>!!f&&(/zip/i.test(String(f.type||''))||ZIP_EXT.test(f.name||''));
const mimeForName=name=>/\.png$/i.test(name)?'image/png':/\.jpe?g$/i.test(name)?'image/jpeg':/\.webp$/i.test(name)?'image/webp':/\.heic$/i.test(name)?'image/heic':/\.heif$/i.test(name)?'image/heif':'application/octet-stream';

const old=document.getElementById('fileInput');
if(!old)return;
const photoInput=old.cloneNode(false);
old.replaceWith(photoInput);
photoInput.id='fileInput';
photoInput.type='file';
photoInput.accept='image/*';
photoInput.removeAttribute('capture');
photoInput.removeAttribute('multiple');
photoInput.className='rsNativePicker rsPhotoPicker';
photoInput.setAttribute('aria-label','Selecionar foto');

const photoHost=photoInput.closest('.openFile');
if(photoHost){
  photoHost.classList.add('rsPhotoHost');
  const span=photoHost.querySelector('span');
  if(span)span.textContent='＋ Fotos';
}

let filesHost=document.querySelector('.rsFilesHost');
if(!filesHost){
  filesHost=document.createElement('label');
  filesHost.className='openFile rsFilesHost';
  const filesInput=document.createElement('input');
  filesInput.id='fileInputFiles';
  filesInput.type='file';
  filesInput.accept='.zip,.png,.jpg,.jpeg,.webp,.heic,.heif,application/zip,application/x-zip-compressed';
  filesInput.className='rsNativePicker rsFilesPicker';
  filesInput.setAttribute('aria-label','Selecionar arquivo ou ZIP');
  const span=document.createElement('span');
  span.textContent='▣ Arquivos / ZIP';
  filesHost.append(filesInput,span);
  photoHost?.after(filesHost);
}
const filesInput=document.getElementById('fileInputFiles');

document.querySelectorAll('input[type="file"]').forEach(el=>{
  if(el!==photoInput&&el!==filesInput)el.remove();
});

const style=document.createElement('style');
style.id='recorteUpload149Styles';
style.textContent=`
.topActions .openFile{position:relative!important;display:inline-flex!important;margin:0!important;overflow:hidden!important;border-radius:9px!important}
.topActions .openFile .rsNativePicker{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:.001!important;z-index:30!important;margin:0!important;padding:0!important;border:0!important;pointer-events:auto!important;cursor:pointer!important;font-size:16px!important;-webkit-appearance:none!important;appearance:none!important}
.topActions .openFile>span{position:relative!important;z-index:1!important;pointer-events:none!important}
.topActions .rsFilesHost>span{border-color:#3b4455!important;background:linear-gradient(135deg,#171c27,#10141d)!important;color:#e5e7eb!important;box-shadow:none!important}
@media(max-width:800px){.topActions{gap:5px!important}.topActions .openFile>span{padding:8px 9px!important;font-size:9px!important}.topActions .rsFilesHost>span{padding-left:8px!important;padding-right:8px!important}}
@media(max-width:430px){.topActions .openFile>span{font-size:8px!important;padding:8px 7px!important}.topActions{gap:4px!important}.brandline .version{display:none!important}}
`;
document.head.appendChild(style);

function timeout(p,ms,label){return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error(label||'timeout')),ms))])}
function viaObjectURL(file){return new Promise((ok,no)=>{let url;try{url=URL.createObjectURL(file)}catch(e){no(e);return}const im=new Image();let done=false;const finish=(value,err)=>{if(done)return;done=true;try{URL.revokeObjectURL(url)}catch{};err?no(err):ok(value)};im.onload=()=>finish(im);im.onerror=()=>finish(null,new Error('object-url decode failed'));im.src=url})}
async function viaBitmap(file){if(typeof createImageBitmap!=='function')throw new Error('bitmap unavailable');const b=await createImageBitmap(file);const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d',{alpha:true});x.drawImage(b,0,0);try{b.close?.()}catch{}const im=new Image();await new Promise((ok,no)=>{im.onload=ok;im.onerror=no;im.src=c.toDataURL('image/png')});return im}
function viaReader(file){return new Promise((ok,no)=>{const r=new FileReader();r.onerror=()=>no(r.error||new Error('reader failed'));r.onload=()=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('reader decode failed'));im.src=r.result};r.readAsDataURL(file)})}
async function decodeImage(file){
  try{return await timeout(viaObjectURL(file),15000,'object-url timeout')}catch(e){console.warn('Recorte Split: ObjectURL falhou, tentando bitmap.',e)}
  try{return await timeout(viaBitmap(file),15000,'bitmap timeout')}catch(e){console.warn('Recorte Split: bitmap falhou, tentando FileReader.',e)}
  return timeout(viaReader(file),20000,'reader timeout');
}
function naturalSort(a,b){return String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:'base'})}
async function extractZip(file){
  if(!window.JSZip)throw new Error('JSZip indisponível');
  const zip=await window.JSZip.loadAsync(file);
  const entries=Object.values(zip.files).filter(e=>!e.dir&&IMAGE_EXT.test(e.name||'')).sort((a,b)=>naturalSort(a.name,b.name));
  if(!entries.length)throw new Error('O ZIP não contém PNG, JPG, WEBP, HEIC ou HEIF.');
  const entry=entries[0];
  const blob=await entry.async('blob');
  const name=(entry.name||'imagem.png').split('/').pop()||'imagem.png';
  let imageFile;
  try{imageFile=new File([blob],name,{type:mimeForName(name),lastModified:Date.now()})}catch{imageFile=blob;try{Object.defineProperty(imageFile,'name',{value:name})}catch{}}
  return{imageFile,entryName:name,total:entries.length};
}
function dimensions(im){return{w:im.naturalWidth||im.width||0,h:im.naturalHeight||im.height||0}}
function hasTransparency(im){try{const {w,h}=dimensions(im),max=500,s=Math.min(1,max/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*s));c.height=Math.max(1,Math.round(h*s));const x=c.getContext('2d',{willReadFrequently:true,alpha:true});x.drawImage(im,0,0,c.width,c.height);const d=x.getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i]<250)return true}catch{}return false}
function enableEditor(){['aiRemoveBtn','aiProRemoveBtn','autoDetect','applyEdit','exportZip','exportSheet','exportPdf','cropStart','centerImage'].forEach(id=>{const e=document.getElementById(id);if(e)e.disabled=false})}
function setStatus(html,error=false){const box=$('#fileInfo');if(!box)return;box.classList.remove('hidden');box.innerHTML=html;box.classList.toggle('error',error)}
function setLoadedInfo(original,im,meta={}){const {w,h}=dimensions(im),alpha=hasTransparency(im),size=((original?.size||0)/1048576).toFixed(2),zipLine=meta.fromZip?`<span>ZIP: ${original.name||'arquivo.zip'} · ${meta.total} imagem(ns) · aberta ${meta.entryName}</span>`:`<span>${w}×${h}px · ${size} MB</span>`;setStatus(`<div class="fileMeta"><b>${meta.fromZip?meta.entryName:(original.name||'Imagem')}</b>${zipLine}</div><div class="alphaBadge ${alpha?'ok':'solid'}">${alpha?'✓ Imagem transparente':'✓ Imagem carregada'}</div>`);const fmt=$('#format');if(fmt&&(alpha||/\.(png|webp|heic|heif)$/i.test(meta.entryName||original.name||'')))fmt.value='png'}
function setBusy(text){setStatus(`<div class="fileMeta"><b>${text}</b><span>Processando no dispositivo…</span></div>`)}
function setError(text){setStatus(`<div class="fileMeta"><b>Não foi possível abrir</b><span>${text}</span></div>`,true)}
let token=0;
async function handleFile(file,input){
  if(!file)return;
  const my=++token;
  try{
    let decodeTarget=file,meta={fromZip:false};
    if(isZip(file)){
      setBusy('Abrindo ZIP…');
      const z=await extractZip(file);
      if(my!==token)return;
      decodeTarget=z.imageFile;
      meta={fromZip:true,entryName:z.entryName,total:z.total};
    }else if(!isImage(file)){
      throw new Error('Escolha uma imagem ou um arquivo .ZIP com imagens.');
    }else setBusy('Abrindo imagem…');
    const im=await decodeImage(decodeTarget);
    if(my!==token)return;
    if(!window.recorteSplit?.setAIResult)throw new Error('O editor ainda não terminou de carregar. Reabra a página e tente novamente.');
    window.recorteGrid?.reset?.();
    window.recorteSplit.setAIResult(im);
    enableEditor();
    setLoadedInfo(file,im,meta);
    window.dispatchEvent(new CustomEvent('recorte-file-loaded',{detail:{name:file.name,width:dimensions(im).w,height:dimensions(im).h,fromZip:meta.fromZip,version:VERSION}}));
  }catch(err){
    if(my!==token)return;
    console.error('Recorte Split upload '+VERSION+':',err);
    setError(err?.message||'Formato não suportado. Tente PNG/JPG ou outro ZIP.');
  }finally{
    try{input.value=''}catch{}
  }
}
function bind(input){if(!input)return;input.addEventListener('change',e=>{e.stopImmediatePropagation();const file=input.files?.[0];handleFile(file,input)},{capture:true});input.addEventListener('cancel',()=>{try{input.value=''}catch{};const box=$('#fileInfo');if(box&&!window.recorteSplit?.getCurrent?.()){box.classList.remove('hidden');box.innerHTML='<div class="fileMeta"><b>Seleção cancelada</b><span>Use Fotos ou Arquivos / ZIP para tentar novamente.</span></div>'}})}
bind(photoInput);bind(filesInput);

window.recorteUpload={version:VERSION,photoInput:()=>photoInput,filesInput:()=>filesInput,photosAndFiles:true,zip:true,nativeDirect:true};
window.__RECORTE_VERSION__=VERSION;
const badge=document.querySelector('.version');if(badge)badge.textContent='BETA '+VERSION;
window.dispatchEvent(new CustomEvent('recorte-upload-ready',{detail:{version:VERSION,photos:true,files:true,zip:true,nativeDirect:true}}));
})();