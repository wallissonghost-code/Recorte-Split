const $=s=>document.querySelector(s);

function clamp(v,a=0,b=255){return Math.max(a,Math.min(b,v))}
function imageFromCanvas(c){return new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=c.toDataURL('image/png')})}

export async function cleanResult(img,{level='normal',removeLightHalo=true}={}){
  if(!img)return img;
  const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
  if(!w||!h)return img;
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d',{willReadFrequently:true,alpha:true});
  x.clearRect(0,0,w,h);x.drawImage(img,0,0,w,h);
  const id=x.getImageData(0,0,w,h),src=new Uint8ClampedArray(id.data),d=id.data;
  const cfg={soft:{shrink:5,blend:.35,feather:.12},normal:{shrink:12,blend:.58,feather:.18},strong:{shrink:22,blend:.78,feather:.24}}[level]||{shrink:0,blend:0,feather:0};
  if(level==='off'&&!removeLightHalo)return img;
  const idx=(xx,yy)=>(yy*w+xx)*4;
  for(let y=1;y<h-1;y++)for(let xx=1;xx<w-1;xx++){
    const i=idx(xx,y),a=src[i+3];if(a===0)continue;
    let minA=255,maxA=0,sumA=0,n=0,rr=0,gg=0,bb=0,wn=0;
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
      if(!ox&&!oy)continue;const j=idx(xx+ox,y+oy),na=src[j+3];minA=Math.min(minA,na);maxA=Math.max(maxA,na);sumA+=na;n++;
      if(na>=Math.max(150,a)){const wt=na/255;rr+=src[j]*wt;gg+=src[j+1]*wt;bb+=src[j+2]*wt;wn+=wt}
    }
    const edge=minA<245||a<245;if(!edge)continue;
    if(wn>0&&removeLightHalo){
      const nr=rr/wn,ng=gg/wn,nb=bb/wn,lum=(src[i]+src[i+1]+src[i+2])/3,nlum=(nr+ng+nb)/3;
      const neutral=Math.max(src[i],src[i+1],src[i+2])-Math.min(src[i],src[i+1],src[i+2])<38;
      const light=lum>nlum+12||lum>214;
      if(light||neutral&&lum>185){const edgeWeight=(1-a/255)*.9+(1-minA/255)*.7;const k=clamp(cfg.blend*edgeWeight,0,1);d[i]=Math.round(src[i]*(1-k)+nr*k);d[i+1]=Math.round(src[i+1]*(1-k)+ng*k);d[i+2]=Math.round(src[i+2]*(1-k)+nb*k)}
    }
    if(level!=='off'){
      const avg=sumA/n,boundary=(255-minA)/255;
      let na=a-cfg.shrink*boundary;
      na=na*(1-cfg.feather)+avg*cfg.feather;
      if(a>246&&minA>80)na=Math.max(na,242);
      d[i+3]=Math.round(clamp(na));
    }
  }
  x.putImageData(id,0,0);
  return imageFromCanvas(c);
}

export function initEdgeUI(){
  const mask=$('#maskTools');if(!mask||$('#edgeCleanupPanel'))return;
  const panel=document.createElement('div');panel.id='edgeCleanupPanel';panel.className='subcard';
  panel.innerHTML=`<div class="subHead"><b>Limpeza de borda</b><span>Pro</span></div><p>Remove halo branco/cinza e suaviza o recorte da IA.</p><label>Intensidade<select id="edgeCleanupLevel"><option value="soft">Suave</option><option value="normal" selected>Normal</option><option value="strong">Forte</option><option value="off">Desativada</option></select></label><label class="checkrow"><input id="removeLightHalo" type="checkbox" checked><b>Remover halo claro</b></label><button id="applyEdgeCleanup" class="secondary" disabled>✦ Aplicar limpeza de borda</button><div id="edgeCleanupStatus" class="info hidden"></div>`;
  mask.parentNode.insertBefore(panel,mask);
  const btn=$('#applyEdgeCleanup');btn?.addEventListener('click',async()=>{const im=window.recorteSplit?.getCurrent?.();if(!im)return;btn.disabled=true;const st=$('#edgeCleanupStatus');if(st){st.classList.remove('hidden');st.textContent='Limpando bordas…'}try{const out=await cleanResult(im,{level:$('#edgeCleanupLevel')?.value||'normal',removeLightHalo:$('#removeLightHalo')?.checked!==false});window.recorteSplit?.setAIResult?.(out);if(st)st.textContent='Bordas refinadas ✓'}catch(e){console.error(e);if(st)st.textContent='Não foi possível refinar as bordas.'}finally{btn.disabled=false}});
}

export function enableEdgeCleanup(){const b=$('#applyEdgeCleanup');if(b)b.disabled=false}
