(function(){
var f=document.getElementById('f'),c=document.getElementById('c'),x=c.getContext('2d'),col=document.getElementById('col'),gap=document.getElementById('gap'),bg=document.getElementById('bgColor'),radius=document.getElementById('radius'),rv=document.getElementById('radiusVal'),fit=document.getElementById('fitMode'),cell=document.getElementById('cell'),frame=document.getElementById('frame'),quality=document.getElementById('quality'),qv=document.getElementById('qualityVal'),shuffle=document.getElementById('shuffle'),ims=[];
function draw(){
 if(!ims.length)return;
 var n=ims.length,cc=Math.max(1,+col.value||2),g=Math.max(0,+gap.value||0),sz=Math.max(100,+cell.value||500),rr=Math.ceil(n/cc),fr=Math.max(0,+frame.value||0);
 c.width=cc*sz+(cc+1)*g;c.height=rr*sz+(rr+1)*g;
 x.fillStyle=bg.value;x.fillRect(0,0,c.width,c.height);
 ims.forEach(function(im,i){
  var boxX=g+(i%cc)*(sz+g),boxY=g+Math.floor(i/cc)*(sz+g),w,h;
  var sc=fit.value==='cover'?Math.max(sz/im.width,sz/im.height):Math.min(sz/im.width,sz/im.height);
  w=im.width*sc;h=im.height*sc;
  var cx=boxX+(sz-w)/2,cy=boxY+(sz-h)/2;
  x.save();
  if(+radius.value){var r=Math.min(+radius.value,sz/2);x.beginPath();x.moveTo(boxX+r,boxY);x.arcTo(boxX+sz,boxY,boxX+sz,boxY+sz,r);x.arcTo(boxX+sz,boxY+sz,boxX,boxY+sz,r);x.arcTo(boxX,boxY+sz,boxX,boxY,r);x.arcTo(boxX,boxY,boxX+sz,boxY,r);x.clip()}
  x.drawImage(im,cx,cy,w,h);x.restore();
  if(fr){x.strokeStyle='#ffffff';x.lineWidth=fr;x.strokeRect(boxX+fr/2,boxY+fr/2,sz-fr,sz-fr)}
 });
 rv.textContent=radius.value+'px';if(qv)qv.textContent=quality.value+'%';
}
f.onchange=function(){
 ims=[];Array.from(f.files||[]).slice(0,20).forEach(function(z){
  var im=new Image(),u=URL.createObjectURL(z);
  im.onload=function(){URL.revokeObjectURL(u);ims.push(im);if(ims.length===Math.min((f.files||[]).length,20))draw()};
  im.onerror=function(){URL.revokeObjectURL(u)};
  im.src=u;
 });
};
[col,gap,bg,radius,fit,cell,frame,quality].forEach(function(a){a.addEventListener('input',draw);a.addEventListener('change',draw)});
if(shuffle)shuffle.onclick=function(){for(var i=ims.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=ims[i];ims[i]=ims[j];ims[j]=tmp}draw()};
document.getElementById('d').onclick=function(){if(!ims.length)return; c.toBlob(function(b){if(!b)return;var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='dsutility-collage.jpg';a.click();setTimeout(function(){URL.revokeObjectURL(u)},1000)},'image/jpeg',Math.max(.4,Math.min(1,+quality.value/100)))};
})()