/** PDF → Markdown — lightweight browser-side text extraction. */
(function(){
  "use strict";
  var D=window.DSPDF, log=window.dspdfLog||function(){};
  var PDFJS_URL="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  var PDFJS_WORKER="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  var state={file:null,pdfDoc:null};
  var progressUI=null;
  function el(id){return document.getElementById(id);}
  function loadScript(src){return new Promise(function(resolve,reject){if(window.pdfjsLib)return resolve();var s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=function(){reject(new Error("Could not load the PDF reader."));};document.head.appendChild(s);});}
  function esc(s){return String(s||"").replace(/[\\`*_{}\[\]()<>#+\-.!|]/g,function(c){return "\\"+c;});}
  async function loadPdf(file){
    D.clearAlert("p2m-alert"); el("p2m-toolbar").hidden=true;
    if(!(file.type==="application/pdf"||/\.pdf$/i.test(file.name))){D.showError("p2m-alert","Please choose a PDF.");return;}
    try{
      D.showInfo("p2m-alert","Reading PDF…");
      await loadScript(PDFJS_URL);
      window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_WORKER;
      var buf=await D.fileToArrayBuffer(file);
      state.file=file; state.pdfDoc=await window.pdfjsLib.getDocument({data:buf}).promise;
      el("p2m-info").textContent=file.name+" — "+state.pdfDoc.numPages+" page(s)";
      el("p2m-toolbar").hidden=false; D.clearAlert("p2m-alert");
    }catch(err){log(err);D.showError("p2m-alert",D.humanError(err,"Could not open this PDF."));}
  }
  async function extract(){
    if(!state.pdfDoc)return;
    progressUI.show(); progressUI.set(2,"Starting…");
    try{
      var sections=[];
      for(var p=1;p<=state.pdfDoc.numPages;p++){
        var page=await state.pdfDoc.getPage(p), tc=await page.getTextContent(), lastY=null, line="", lines=[];
        for(var i=0;i<tc.items.length;i++){
          var item=tc.items[i], y=item.transform&&item.transform.length?item.transform[5]:null;
          if(lastY!==null&&y!==null&&Math.abs(y-lastY)>4){if(line.trim())lines.push(line.trim());line="";}
          line+=(item.str||""); lastY=y;
        }
        if(line.trim())lines.push(line.trim());
        var body=lines.map(function(x){return esc(x);}).join("  \n");
        sections.push("## Page "+p+"\n\n"+(body||"_No selectable text found on this page._"));
        progressUI.set(5+(p/state.pdfDoc.numPages)*90,"Extracted page "+p+" / "+state.pdfDoc.numPages);
      }
      var title=(state.file.name||"document").replace(/\.pdf$/i,"");
      var md="# "+title.replace(/[\\#]/g,"\\$&")+"\n\n"+sections.join("\n\n---\n\n")+"\n";
      var blob=new Blob([md],{type:"text/markdown;charset=utf-8"});
      D.downloadBlob(blob,title+"-markdown.md");
      progressUI.set(100,"Done — Markdown file downloaded.");
      if(window.dspdfToast)window.dspdfToast("Markdown file saved","success");
    }catch(err){log(err);progressUI.error("Conversion failed.");D.showError("p2m-alert",D.humanError(err,"Could not convert this PDF to Markdown."));}
  }
  function init(){
    progressUI=new D.ProgressUI(el("p2m-progress"));
    new D.UploadZone("#uz-p2m",{accept:"application/pdf,.pdf",multiple:false,onFiles:function(files){if(files[0])loadPdf(files[0]);}});
    el("p2m-apply").addEventListener("click",extract);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
