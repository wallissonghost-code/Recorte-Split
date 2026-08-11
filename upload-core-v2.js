(()=>{'use strict';
if(window.__RECORTE_UPLOAD_SINGLE_148__)return;window.__RECORTE_UPLOAD_SINGLE_148__=true;window.__RECORTE_UPLOAD_CORE_V2__=true;
const input=document.getElementById('fileInput');if(!input)return;
input.type='file';input.accept='image/*,.png,.jpg,.jpeg,.webp,.heic,.heif';input.removeAttribute('capture');input.removeAttribute('multiple');input.setAttribute('aria-label','Abrir imagem');
// Existe somente um input real. Não cria, não clona e não dispara o picker por JavaScript.
document.querySelectorAll('input[type="file"]').forEach(el=>{if(el!==input)el.remove()});
// O próprio input fica sobre o botão visual e recebe o toque diretamente no iOS.
input.classList.add('rsSingleUpload148');
window.recorteUpload={version:'1.4.8',input:()=>input,singleButton:true,nativeDirect:true};
window.dispatchEvent(new CustomEvent('recorte-upload-ready',{detail:{version:'1.4.8',singleInput:true,singleButton:true,nativeDirect:true}}));
})();