(function(){'use strict';
var f=document.getElementById('f'),sig=document.getElementById('sig'),txt=document.getElementById('txt'),c=document.getElementById('c'),x=c.getContext('2d'),im=new Image(),si=new Image(),u='',su='',op=document.getElementById('op'),size=document.getElementById('size'),color=document.getElementById('color'),tx=document.getElementById('tx'),ty=document.getElementById('ty'),sw=document.getElementById('sw'),sx=document.getElementById('sx'),sy=document.getElementById('sy'),status=document.getElementById('wmStatus'),mode=document.getElementById('studentMode'),sc=document.getElementById('studentControls'),target=document.getElementById('studentTarget'),sh=document.getElementById('studentSigHeight'),shv=document.getElementById('studentSigHeightVal');
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function draw(){
 if(!im.naturalWidth)return;
 if(mode.value==='student'){
  var strip=Math.max(40,Math.round(im.naturalHeight*(+sh.value/100)));
  c.width=im.naturalWidth;c.height=im.naturalHeight+strip;x.clearRect(0,0,c.width,c.height);x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,im.naturalHeight);
  if(si.naturalWidth){var ratio=c.width/si.naturalWidth,hh=Math.min(strip,si.naturalHeight*ratio),ww=hh*si.naturalWidth/si.naturalHeight;x.drawImage(si,(c.width-ww)/2,im.naturalHeight+(strip-hh)/2,ww,hh)}
  status.textContent='Student photo + signature strip preview ready.';shv.textContent=sh.value+'%';return;
 }
 c.width=im.naturalWidth;c.height=im.naturalHeight;x.clearRect(0,0,c.width,c.height);x.drawImage(im,0,0);x.save();x.globalAlpha=(+op.value||70)/100;x.fillStyle=color.value;x.font='700 '+(+size.value||36)+'px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(txt.value,c.width*(+tx.value/100),c.height*(+ty.value/100));
 if(si.naturalWidth){var w=Math.max(20,Math.min(c.width*.8,c.width*(+sw.value/100))),h=w*si.naturalHeight/si.naturalWidth;x.drawImage(si,c.width*(+sx.value/100)-w/2,c.height*(+sy.value/100)-h/2,w,h)}x.restore();status.textContent='Preview updated. Use position and size controls to move the overlay.';
}
f.onchange=function(){var z=f.files&&f.files[0];if(!z)return;if(u)URL.revokeObjectURL(u);u=URL.createObjectURL(z);im.onload=draw;im.src=u};
sig.onchange=function(){var z=sig.files&&sig.files[0];if(!z)return;if(su)URL.revokeObjectURL(su);su=URL.createObjectURL(z);si.onload=draw;si.src=su};
[txt,op,size,color,tx,ty,sw,sx,sy,mode,sh,target].forEach(function(e){e&&e.addEventListener('input',draw);e&&e.addEventListener('change',function(){sc.hidden=mode.value!=='student';draw()})});
document.querySelectorAll('[data-nudge]').forEach(function(b){b.onclick=function(){var d=b.dataset.nudge.split(',').map(Number);tx.value=clamp(+tx.value+d[0],0,100);ty.value=clamp(+ty.value+d[1],0,100);draw()}});
function toBlob(q){return new Promise(function(resolve){c.toBlob(resolve,'image/jpeg',q)})}
async function makeStudentBlob(maxKB){
 var q=.94,b=await toBlob(q);
 if(!maxKB)return b;
 var targetBytes=maxKB*1024;
 for(var i=0;i<14&&b&&b.size>targetBytes;i++){q=Math.max(.05,q-.05);b=await toBlob(q)}
 if(b&&b.size>targetBytes){
  var scale=.92;
  for(var j=0;j<10&&b.size>targetBytes;j++){
   c.width=Math.max(220,Math.round(c.width*scale));c.height=Math.max(80,Math.round(c.height*scale));draw();
   b=await toBlob(q);scale-=.025;
  }
 }
 return b;
}
document.getElementById('d').onclick=async function(){
 if(!im.naturalWidth){status.textContent='Choose a base image first.';return}
 var b;
 if(mode.value==='student'){b=await makeStudentBlob(+target.value||0)}else{b=await toBlob(.92)}
 if(!b){status.textContent='Could not create the image.';return}
 var uu=URL.createObjectURL(b),a=document.createElement('a');a.href=uu;a.download=mode.value==='student'?'dsutility-photo-signature.jpg':'dsutility-watermark-signature.jpg';a.click();setTimeout(function(){URL.revokeObjectURL(uu)},1000);
 status.textContent='Done — '+Math.round(b.size/1024)+' KB output.'; 
};
})()