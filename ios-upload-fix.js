(()=>{'use strict';if(window.__RECORTE_IOS_UPLOAD_FIX_144__)return;window.__RECORTE_IOS_UPLOAD_FIX_144__=true;
const input=document.getElementById('fileInput');if(!input)return;
input.accept='image/*,.png,.jpg,.jpeg,.webp,.heic,.heif';
input.setAttribute('aria-label','Selecionar imagem');
const style=document.createElement('style');style.id='iosUploadFix144';style.textContent=`
#fileInput{display:block!important;position:fixed!important;left:-10000px!important;top:0!important;width:1px!important;height:1px!important;opacity:.001!important;overflow:hidden!important;pointer-events:none!important}
.upload{position:relative!important}.rsNativeFileOverlay{position:absolute!important;inset:0!important;z-index:12!important;display:block!important;cursor:pointer!important;background:transparent!important;border:0!important;margin:0!important;padding:0!important;-webkit-tap-highlight-color:transparent!important}.heroFile[for="fileInput"],.openFile[for="fileInput"]{cursor:pointer!important}
`;document.head.appendChild(style);
// O botão do topo já contém o input principal: mantém associação nativa.
const top=input.closest('.openFile');if(top)top.setAttribute('for','fileInput');
// Remove o segundo input da chamada central e transforma o próprio label em gatilho nativo.
const hero=document.querySelector('.heroFile');if(hero){hero.querySelectorAll('input[type="file"]').forEach(el=>{if(el!==input)el.remove()});hero.setAttribute('for','fileInput')}
// A área grande era um DIV acionando input.click(). No iOS isso é instável. Uma label transparente recebe o toque nativamente.
const upload=document.querySelector('.upload');if(upload&&!upload.querySelector('.rsNativeFileOverlay')){const overlay=document.createElement('label');overlay.className='rsNativeFileOverlay';overlay.setAttribute('for','fileInput');overlay.setAttribute('aria-label','Selecionar imagem');overlay.addEventListener('click',e=>e.stopPropagation());upload.appendChild(overlay)}
// Remove inputs de arquivo órfãos/duplicados, preservando somente o canônico.
document.querySelectorAll('input[type="file"]').forEach(el=>{if(el!==input)el.remove()});
window.dispatchEvent(new CustomEvent('recorte-ios-upload-ready'));
})();