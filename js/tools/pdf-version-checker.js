(function(){"use strict";
var D=window.DSPDF,state={file:null,buffer:null};
function el(id){return document.getElementById(id)}
function reset(){state={file:null,buffer:null};el('version-panel').hidden=true;el('version-alert').hidden=true;el('version-results').innerHTML='';}
function getHeader(bytes){
  var n=Math.min(bytes.length,64),s='';
  for(var i=0;i<n;i++) s+=String.fromCharCode(bytes[i]);
  var m=s.match(/%PDF-(\\d+\\.\\d+)/); return m?m[1]:null;
}
async function load(file){
  reset();
  if(!file||!(file.type==='application/pdf'||/\\.pdf$/i.test(file.name))){D.showError('version-alert','Please choose a PDF.');return}
  D.showInfo('version-alert','Reading PDF…');
  try{
    state.file=file; state.buffer=await D.fileToArrayBuffer(file);
    var bytes=new Uint8Array(state.buffer), version=getHeader(bytes);
    if(!version) throw new Error('The file does not contain a readable PDF header.');
    var size=(file.size/1024).toFixed(1);
    el('version-results').innerHTML='<div class="table-wrap"><table><tbody><tr><th>File</th><td>'+escapeHtml(file.name)+'</td></tr><tr><th>PDF version</th><td><strong>PDF '+version+'</strong></td></tr><tr><th>File size</th><td>'+size+' KB</td></tr><tr><th>Header</th><td>%PDF-'+version+'</td></tr></tbody></table></div>';
    el('version-panel').hidden=false;D.clearAlert('version-alert');
  }catch(e){D.showError('version-alert',D.humanError(e,'Could not read the PDF version.'))}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function init(){new D.UploadZone('#uz-version',{accept:'application/pdf,.pdf',onFiles:function(fs){if(fs[0])load(fs[0])}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
