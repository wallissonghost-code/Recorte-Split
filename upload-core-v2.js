(()=>{'use strict';
if(window.__RECORTE_UPLOAD_SINGLE_147__)return;window.__RECORTE_UPLOAD_SINGLE_147__=true;window.__RECORTE_UPLOAD_CORE_V2__=true;
const input=document.getElementById('fileInput');if(!input)return;
input.accept='image/*,.png,.jpg,.jpeg,.webp,.heic,.heif';input.removeAttribute('capture');input.removeAttribute('multiple');
// Um único seletor real: o input do botão “Abrir imagem” no topo.
document.querySelectorAll('input[type="file"]').forEach(el=>{if(el!==input)el.remove()});
document.querySelectorAll('.heroFile,.rsUploadNativeOverlay,.rsNativeFileOverlay').forEach(el=>el.remove());
// Não adiciona click(), pointerdown, clone de input, overlay ou segundo listener de change.
// O app.js continua sendo o único responsável por processar o arquivo escolhido.
window.recorteUpload={version:'1.4.7',input:()=>input,singleButton:true};
window.dispatchEvent(new CustomEvent('recorte-upload-ready',{detail:{version:'1.4.7',native:true,singleInput:true,singleButton:true}}));
})();