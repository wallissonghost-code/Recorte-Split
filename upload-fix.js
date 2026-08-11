(()=>{'use strict';if(window.__RECORTE_UPLOAD_FIX__)return;window.__RECORTE_UPLOAD_FIX__=true;
const input=document.getElementById('fileInput');if(!input)return;
function openPicker(e){if(e){e.preventDefault();e.stopPropagation()}try{input.click()}catch(err){console.error('Recorte Split: falha ao abrir seletor',err)}}
// Mantem um unico input principal e redireciona todos os gatilhos para ele.
document.querySelectorAll('.upload').forEach(el=>{el.style.cursor='pointer';el.addEventListener('click',openPicker,true)});
document.querySelectorAll('.openFile').forEach(label=>{const own=label.querySelector('input[type="file"]');if(own===input)return;label.addEventListener('click',e=>{if(e.target?.matches?.('input[type="file"]'))return;openPicker(e)},true);if(own){own.addEventListener('change',()=>{const f=own.files?.[0];if(!f)return;try{const dt=new DataTransfer();dt.items.add(f);input.files=dt.files}catch{}input.dispatchEvent(new Event('change',{bubbles:true}));own.value=''},true)}});
// iOS/Safari: garante que selecionar o mesmo arquivo duas vezes continue funcionando.
input.addEventListener('click',()=>{try{input.value=''}catch{}},{capture:true});
// Diagnostico visivel somente se o app nao reagir ao change.
input.addEventListener('change',()=>{const f=input.files?.[0];if(!f)return;setTimeout(()=>{if(!window.recorteSplit?.getCurrent?.()){console.warn('Recorte Split: arquivo selecionado, mas app nao carregou a imagem.');const s=document.getElementById('fileInfo');if(s){s.classList.remove('hidden');s.textContent='Arquivo selecionado, mas houve falha ao carregar. Recarregue a pagina e tente novamente.'}}},1800)},{capture:false});
})();