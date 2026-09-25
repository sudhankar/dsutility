(function(){"use strict";
  var D=window.DSPDF;
  var state={file:null,buffer:null,pdfDoc:null,pageCount:0,previewToken:0};
  function el(id){return document.getElementById(id)}
  function setPosition(index){
    var sel=el('blank-position');
    if(sel){sel.value=String(index);}
    updatePreviewSelection();
  }
  function updatePreviewSelection(){
    var sel=el('blank-position');
    var strip=el('blank-preview-strip');
    if(!sel||!strip)return;
    var value=Number(sel.value||0);
    Array.prototype.forEach.call(strip.querySelectorAll('[data-before]'),function(card){
      var before=Number(card.getAttribute('data-before'));
      card.classList.toggle('is-insert-target',before===value);
      var badge=card.querySelector('.blank-insert-badge');
      if(badge) badge.hidden=before!==value;
    });
    var after=strip.querySelector('[data-after-last]');
    if(after){after.classList.toggle('is-insert-target',value===state.pageCount);var b=after.querySelector('.blank-insert-badge');if(b)b.hidden=value!==state.pageCount;}
  }
  async function renderPreview(){
    var host=el('blank-preview'),strip=el('blank-preview-strip');
    if(!host||!strip||!state.pdfDoc)return;
    var token=++state.previewToken;
    host.hidden=false;strip.innerHTML='<p class="text-muted">Rendering page preview…</p>';
    try{
      var frag=document.createDocumentFragment();
      var max=Math.min(state.pageCount,20);
      for(var i=1;i<=max;i++){
        if(token!==state.previewToken)return;
        var item=document.createElement('button');
        item.type='button'; item.className='preview-pdf-item blank-preview-item';
        item.setAttribute('data-before',String(i-1));
        item.setAttribute('aria-label','Insert blank page before page '+i);
        item.innerHTML='<span class="blank-insert-badge" hidden>Blank page here</span><canvas></canvas><small>Page '+i+'</small>';
        item.addEventListener('click',(function(index){return function(){setPosition(index)}})(i-1));
        frag.appendChild(item);
        try{
          var page=await state.pdfDoc.getPage(i), vp=page.getViewport({scale:.52}), c=item.querySelector('canvas');
          c.width=Math.ceil(vp.width);c.height=Math.ceil(vp.height);
          await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
        }catch(e){item.classList.add('preview-error');}
      }
      if(state.pageCount>20){
        var more=document.createElement('p');more.className='text-muted';more.textContent='Preview shows the first 20 pages for performance. Use the position menu for later pages.';frag.appendChild(more);
      }
      var after=document.createElement('button');after.type='button';after.className='preview-pdf-item blank-preview-item blank-preview-after';after.setAttribute('data-after-last','true');after.setAttribute('aria-label','Insert blank page after the last page');after.innerHTML='<span class="blank-insert-badge" hidden>Blank page here</span><span class="blank-page-placeholder">＋</span><small>After last page</small>';
      after.addEventListener('click',function(){setPosition(state.pageCount)});frag.appendChild(after);
      strip.innerHTML='';strip.appendChild(frag);updatePreviewSelection();
    }catch(e){strip.innerHTML='<p class="text-muted">Preview unavailable. You can still choose the insertion position from the menu.</p>';}
  }
  async function load(file){
    el('blank-alert').hidden=true;el('blank-panel').hidden=true;el('blank-preview').hidden=true;
    if(!file||!(file.type==='application/pdf'||/\.pdf$/i.test(file.name))){D.showError('blank-alert','Please choose a PDF.');return;}
    try{
      state.file=file;state.buffer=await D.fileToArrayBuffer(file);D.showInfo('blank-alert','Reading PDF…');
      await D.ensurePdfLib();
      var L=await D.ensurePdfLib();var doc=await L.PDFDocument.load(state.buffer);
      state.pageCount=doc.getPageCount();
      el('blank-count').textContent=state.pageCount+' existing pages. Choose where to add a blank page.';
      var sel=el('blank-position');sel.innerHTML='';
      for(var i=0;i<=state.pageCount;i++){var o=document.createElement('option');o.value=i;o.textContent=i===0?'Before page 1':i===state.pageCount?'After last page':'Before page '+(i+1);sel.appendChild(o)}
      el('blank-panel').hidden=false;el('blank-alert').hidden=true;
      await loadPdfJs();
      state.pdfDoc=await window.pdfjsLib.getDocument({data:state.buffer.slice(0)}).promise;
      await renderPreview();
    }catch(e){D.showError('blank-alert',D.humanError(e,'Could not open this PDF.'));}
  }
  function loadPdfJs(){
    if(window.pdfjsLib){window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';return Promise.resolve();}
    return new Promise(function(resolve,reject){var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=function(){window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve()};s.onerror=function(){reject(new Error('PDF preview library could not be loaded.'))};document.head.appendChild(s)});
  }
  async function apply(){try{el('blank-progress').hidden=false;var r=await D.runPdfOperation('insertBlankPage',{buffer:state.buffer.slice(0),position:Number(el('blank-position').value||0),width:Number(el('blank-width').value||612),height:Number(el('blank-height').value||792)});var blob=new Blob([r.bytes],{type:'application/pdf'});var base=(state.file.name||'document.pdf').replace(/\.pdf$/i,'');D.downloadBlob(blob,'dspdf-'+base+'-blank-page.pdf');if(D.setProgress)D.setProgress('blank-progress',100,'Done — PDF downloaded.');}catch(e){D.showError('blank-alert',D.humanError(e,'Could not add the blank page.'));}}
  function init(){new D.UploadZone('#uz-blank',{accept:'application/pdf,.pdf',onFiles:function(fs){if(fs[0])load(fs[0])}});el('blank-apply').addEventListener('click',apply);el('blank-position').addEventListener('change',updatePreviewSelection);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
