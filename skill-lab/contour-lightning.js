(()=>{
  'use strict';
  const original=window.drawLightning;
  if(typeof original!=='function') return;

  let cachedImg=null,cachedContour=null;
  const SAMPLE=160,BINS=96,ALPHA=28;

  function buildContour(img){
    if(!img) return null;
    if(img===cachedImg&&cachedContour) return cachedContour;
    const c=document.createElement('canvas'),g=c.getContext('2d',{willReadFrequently:true});
    c.width=SAMPLE;c.height=SAMPLE;
    const ratio=Math.min(SAMPLE/img.width,SAMPLE/img.height),dw=img.width*ratio,dh=img.height*ratio,dx=(SAMPLE-dw)/2,dy=(SAMPLE-dh)/2;
    g.clearRect(0,0,SAMPLE,SAMPLE);g.drawImage(img,dx,dy,dw,dh);
    let data;
    try{data=g.getImageData(0,0,SAMPLE,SAMPLE).data}catch{return null}
    const solid=(x,y)=>x>=0&&y>=0&&x<SAMPLE&&y<SAMPLE&&data[(y*SAMPLE+x)*4+3]>ALPHA;
    const edges=[];
    for(let y=1;y<SAMPLE-1;y+=2){for(let x=1;x<SAMPLE-1;x+=2){
      if(!solid(x,y))continue;
      if(!solid(x-2,y)||!solid(x+2,y)||!solid(x,y-2)||!solid(x,y+2))edges.push([x,y]);
    }}
    if(edges.length<12)return null;
    let sx=0,sy=0;for(const p of edges){sx+=p[0];sy+=p[1]}const cx=sx/edges.length,cy=sy/edges.length;
    const bins=Array.from({length:BINS},()=>null);
    for(const p of edges){const a=(Math.atan2(p[1]-cy,p[0]-cx)+Math.PI*2)%(Math.PI*2),i=Math.floor(a/(Math.PI*2)*BINS),r=(p[0]-cx)**2+(p[1]-cy)**2;if(!bins[i]||r>bins[i].r)bins[i]={x:p[0],y:p[1],r}}
    for(let i=0;i<BINS;i++)if(!bins[i]){for(let d=1;d<BINS/2;d++){const a=bins[(i-d+BINS)%BINS],b=bins[(i+d)%BINS];if(a||b){bins[i]=a||b;break}}}
    cachedImg=img;cachedContour={bins,cx,cy,dw,dh,dx,dy};return cachedContour;
  }

  function worldContour(m,t){
    const contour=buildContour(mobImg);if(!contour)return null;
    const imageRatio=Math.min(m.w/mobImg.width,m.h/mobImg.height),rw=mobImg.width*imageRatio,rh=mobImg.height*imageRatio;
    const sx=rw/contour.dw,sy=rh/contour.dh;
    const pts=[];
    const turns=+$('orbitTurns').value||1;
    const start=Math.floor((t*22)%BINS);
    const count=Math.max(18,Math.floor(BINS*Math.min(1,t/.7)));
    for(let lap=0;lap<Math.ceil(turns);lap++){
      for(let k=0;k<count;k++){
        const idx=(start+k+Math.floor(lap*BINS/Math.max(1,turns)))%BINS,b=contour.bins[idx];if(!b)continue;
        const nx=(b.x-contour.cx)*sx,ny=(b.y-contour.cy)*sy;
        const len=Math.hypot(nx,ny)||1;
        const jitter=Math.sin((k+lap*17)*1.7+t*38)*1.8;
        pts.push([m.x+nx+nx/len*jitter,m.y+ny+ny/len*jitter]);
      }
    }
    return pts;
  }

  window.drawLightning=function(m,t){
    const path=$('lightningPath')?.value;
    if(path!=='contour'||!mobImg)return original(m,t);
    const pts=worldContour(m,t);if(!pts||pts.length<6)return original(m,t);
    const [c1,c2]=colorPair(),alpha=Math.max(0,1-t/.86),width=+$('boltWidth').value||3;
    line(pts,alpha,width,c1);
    const branches=+$('branchCount').value||0;
    for(let i=0;i<branches;i++){
      const p=pts[Math.floor((i+1)/(branches+1)*(pts.length-1))];if(!p)continue;
      const dx=m.x-p[0],dy=m.y-p[1],len=Math.hypot(dx,dy)||1;
      const reach=12+Math.random()*22;
      const end=[p[0]+dx/len*reach+(Math.random()-.5)*8,p[1]+dy/len*reach+(Math.random()-.5)*8];
      line([p,end],alpha*.62,Math.max(1,width*.45),c2);
    }
  };

  document.getElementById('mobInput')?.addEventListener('change',()=>{cachedImg=null;cachedContour=null});
})();