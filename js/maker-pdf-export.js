(function(){
  'use strict';
  function safeName(name){ return String(name||'DSUTILITY-Document').replace(/[^a-z0-9._-]+/gi,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')+'.pdf'; }
  async function download(element, filename){
    if(!element) throw new Error('PDF preview is not available.');
    if(!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) throw new Error('PDF export libraries are unavailable.');
    var canvas=await window.html2canvas(element,{scale:2,backgroundColor:'#ffffff',useCORS:true,allowTaint:false,logging:false,imageTimeout:15000});
    var JsPDF=window.jspdf.jsPDF, pdf=new JsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    var pageW=190, pageH=277, ratio=pageW/canvas.width, sliceH=Math.max(1,Math.floor(pageH/ratio));
    var y=0, first=true;
    while(y<canvas.height){
      var h=Math.min(sliceH,canvas.height-y), slice=document.createElement('canvas');
      slice.width=canvas.width; slice.height=h;
      slice.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
      if(!first) pdf.addPage(); first=false;
      pdf.addImage(slice.toDataURL('image/jpeg',0.94),'JPEG',10,10,pageW,h*ratio,undefined,'FAST');
      y+=h;
    }
    pdf.save(safeName(filename));
  }
  window.DSUTILITYMakerPDF={download:download};
})();
