(()=>{'use strict';
if(window.__RECORTE_UPLOAD_NATIVE_146__)return;window.__RECORTE_UPLOAD_NATIVE_146__=true;window.__RECORTE_UPLOAD_CORE_V2__=true;
const input=document.getElementById('fileInput');if(!input)return;
const ACCEPT='image/*,.png,.jpg,.jpeg,.webp,.heic,.heif';
input.accept=ACCEPT;input.classList.add('rsCanonicalFile');input.removeAttribute('capture');input.removeAttribute('multiple');
const style=document.createElement('style');style.id='recorteUploadNative146';style.textContent=`
.openFile{position:relative!important}.openFile #fileInput.rsCanonicalFile{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;opacity:.001!important;z-index:100!important;margin:0!important;padding:0!important;border:0!important;cursor:pointer!important;pointer-events:auto!important;font-size:16px!important}
.rsUploadNativeOverlay{position:absolute!important;inset:0!important;z-index:90!important;display:block!important;cursor:pointer!important;background:transparent!important;border:0!important;margin:0!important;padding:0!important;-webkit-tap-highlight-color:transparent!important}
.heroFile,.upload{position:relative!important}
`;document.head.appendChild(style);
// Mantém UM único input real. O app.js já possui o change handler e limpa o valor após carregar.
document.querySelectorAll('input[type="file"]').forEach(el=>{if(el!==input)el.remove()});
// Botão central aponta para o mesmo input canônico, sem criar outro seletor.
const hero=document.querySelector('.heroFile');if(hero){hero.setAttribute('for','fileInput');hero.querySelectorAll('input[type="file"]').forEach(el=>el.remove())}
// Área grande usa label nativa sobreposta. Sem input.click(), sem clone e sem listeners de captura.
const upload=document.querySelector('.upload');if(upload&&!upload.querySelector('.rsUploadNativeOverlay')){const label=document.createElement('label');label.className='rsUploadNativeOverlay';label.setAttribute('for','fileInput');label.setAttribute('aria-label','Selecionar imagem');upload.appendChild(label)}
window.recorteUpload={version:'1.4.6',input:()=>input};window.dispatchEvent(new CustomEvent('recorte-upload-ready',{detail:{version:'1.4.6',native:true,singleInput:true}}));
})();