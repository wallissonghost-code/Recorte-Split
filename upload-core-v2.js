(()=>{'use strict';
if(window.__RECORTE_UPLOAD_SINGLE_148__)return;window.__RECORTE_UPLOAD_SINGLE_148__=true;window.__RECORTE_UPLOAD_CORE_V2__=true;
const input=document.getElementById('fileInput');if(!input)return;
input.type='file';input.accept='image/*,.png,.jpg,.jpeg,.webp,.heic,.heif';input.removeAttribute('capture');input.removeAttribute('multiple');input.setAttribute('aria-label','Abrir imagem');
// Existe somente um input real. Não cria, não clona e não dispara o picker por JavaScript.
document.querySelectorAll('input[type="file"]').forEach(el=>{if(el!==input)el.remove()});
input.classList.add('rsSingleUpload148');
// O CSS-base esconde inputs de .openFile. Esta regra, mais específica e com !important,
// transforma o input real no próprio alvo de toque do botão. Isso evita label->input.click() no iOS/WebView.
const style=document.createElement('style');style.id='recorteSingleUpload148';style.textContent=`
.topActions .openFile{position:relative!important;display:inline-flex!important;margin:0!important;overflow:hidden!important;border-radius:9px!important}
.topActions .openFile #fileInput.rsSingleUpload148{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:.001!important;z-index:20!important;margin:0!important;padding:0!important;border:0!important;pointer-events:auto!important;cursor:pointer!important;font-size:16px!important;-webkit-appearance:none!important;appearance:none!important}
.topActions .openFile>span{position:relative!important;z-index:1!important;pointer-events:none!important}
`;document.head.appendChild(style);
window.recorteUpload={version:'1.4.8',input:()=>input,singleButton:true,nativeDirect:true};
window.dispatchEvent(new CustomEvent('recorte-upload-ready',{detail:{version:'1.4.8',singleInput:true,singleButton:true,nativeDirect:true}}));
})();