import{cleanResult,initEdgeUI,enableEdgeCleanup}from'./edge-cleanup.js?v=1.3.0';
const btn=document.querySelector('#aiRemoveBtn'),proBtn=document.querySelector('#aiProRemoveBtn'),status=document.querySelector('#aiStatus');
let modulePromise=null,running=false;
const ua=navigator.userAgent||'',platform=navigator.platform||'',touches=navigator.maxTouchPoints||0;
const isIPad=/iPad/i.test(ua)||((/MacIntel|Macintosh|Mac/i.test(platform)||/Macintosh|Mac OS X/i.test(ua))&&touches>1)||(('ontouchend'in document)&&/Mac/i.test(ua));
const isIPhone=/iPhone|iPod/i.test(ua),isIOS=isIPad||isIPhone,isAndroid=/Android/i.test(ua);
initEdgeUI();
function msg(t,error=false){if(!status)return;status.classList.remove('hidden');status.textContent=t;status.classList.toggle('error',error)}
function loadModel(){return modulePromise||(modulePromise=import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm'))}
function canvasBlob(c){return new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('Falha ao preparar imagem')),'image/png',1))}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function timeout(promise,ms){return Promise.race([promise,new Promise((_,rej)=>setTimeout(()=>rej(new Error('Tempo limite excedido')),ms))])}
async function prepareInput(im,maxPixels){const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,pixels=iw*ih,k=Math.min(1,Math.sqrt(maxPixels/Math.max(1,pixels))),w=Math.max(1,Math.round(iw*k)),h=Math.max(1,Math.round(ih*k)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{alpha:true});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.clearRect(0,0,w,h);x.drawImage(im,0,0,w,h);const blob=await canvasBlob(c);c.width=1;c.height=1;return{blob,w,h,iw,ih}}
async function callRemove(removeBackground,input,mode,profile){const label=mode==='pro'?'IA Profissional':'IA Rápida',config={debug:false,rescale:true,device:profile.device,model:profile.model,proxyToWorker:false,output:{format:'image/png',quality:1},progress:(key,current,total)=>{if(total>0)msg(`${label}: ${Math.max(0,Math.min(100,Math.round(current/total*100)))}% • ${key||'processando'}`)}};return timeout(removeBackground(input.blob,config),isIPad?120000:180000)}
async function run(mode='fast'){
  if(running)return;const im=window.recorteSplit?.getSource?.();if(!im)return;
  running=true;[btn,proBtn].forEach(b=>b&&(b.disabled=true));
  try{
    const label=mode==='pro'?'IA Profissional':'IA Rápida';
    msg(isIPad?`${label}: modo de compatibilidade iPad ativado…`:`${label}: preparando imagem…`);
    const mod=await timeout(loadModel(),30000),removeBackground=mod.default||mod.removeBackground;if(typeof removeBackground!=='function')throw new Error('Módulo indisponível');
    const maxPixels=isIPad?(mode==='pro'?900000:650000):isIPhone?(mode==='pro'?1400000:900000):isAndroid?(mode==='pro'?3500000:2200000):(mode==='pro'?12000000:7000000);
    const input=await prepareInput(im,maxPixels);msg(`${label}: analisando ${input.w}×${input.h}px${isIPad?' em modo seguro':''}…`);await sleep(60);
    const profiles=[];
    if(isIPad||isIPhone)profiles.push({model:'isnet_quint8',device:'cpu'});else{const gpu=!!navigator.gpu;profiles.push({model:mode==='pro'?'isnet_fp16':'isnet_quint8',device:gpu?'gpu':'cpu'});if(mode==='pro')profiles.push({model:'isnet_quint8',device:'cpu'})}
    let result=null,lastError=null;
    for(let i=0;i<profiles.length;i++)try{if(i)msg(`${label}: tentando modo compatível…`);result=await callRemove(removeBackground,input,mode,profiles[i]);if(result)break}catch(e){lastError=e;console.warn('Background removal profile failed',profiles[i],e);await sleep(120)}
    if(!result)throw lastError||new Error('Resultado vazio');
    msg(`${label}: refinando transparência e removendo halo…`);
    const url=URL.createObjectURL(result),raw=new Image();
    raw.onload=async()=>{
      try{
        const rc=document.createElement('canvas');rc.width=raw.width;rc.height=raw.height;const rx=rc.getContext('2d',{willReadFrequently:true});rx.drawImage(raw,0,0);
        if(mode==='pro'){
          const id=rx.getImageData(0,0,rc.width,rc.height),a=id.data;
          for(let i=3;i<a.length;i+=4){let v=a[i]/255;v=v*v*(3-2*v);if(isIPad)v=Math.min(1,Math.max(0,(v-.03)/.94));a[i]=Math.round(v*255)}rx.putImageData(id,0,0)
        }
        let final=new Image();await new Promise((ok,no)=>{final.onload=ok;final.onerror=no;final.src=rc.toDataURL('image/png')});
        const level=mode==='pro'?'normal':'soft';
        final=await cleanResult(final,{level,removeLightHalo:true});
        finish(final,url,mode,input)
      }catch(e){console.error('Edge cleanup:',e);fail('A IA removeu o fundo, mas houve erro ao refinar as bordas.',url)}
    };
    raw.onerror=()=>fail('O resultado não pôde ser aberto.',url);raw.src=url
  }catch(e){
    console.error('Background removal:',e);modulePromise=null;
    const detail=isIPad?' O iPad usa um modo especial de baixa memória; tente novamente após fechar outras abas se o Safari tiver encerrado o processamento.':'';
    fail((mode==='pro'?'A IA Profissional não conseguiu concluir.':'Não foi possível remover o fundo.')+detail,null)
  }
}
function finish(out,url,mode,input){window.recorteSplit?.setAIResult?.(out);window.recorteSplit?.enableMaskCorrection?.();enableEdgeCleanup();if(url)URL.revokeObjectURL(url);const reduced=input&&input.w<input.iw;msg(`${mode==='pro'?'IA Profissional':'IA Rápida'} concluída ✓ Bordas refinadas e halo claro reduzido.${isIPad?' Modo iPad seguro.':''}${reduced?' Imagem otimizada durante a IA para reduzir uso de memória.':''}`);running=false;[btn,proBtn].forEach(b=>b&&(b.disabled=false))}
function fail(t,url){if(url)URL.revokeObjectURL(url);msg(t,true);running=false;[btn,proBtn].forEach(b=>b&&(b.disabled=false))}
btn?.addEventListener('click',()=>run('fast'));proBtn?.addEventListener('click',()=>run('pro'));
if(!isIOS&&'requestIdleCallback'in window)requestIdleCallback(()=>loadModel().catch(()=>{modulePromise=null}),{timeout:7000});