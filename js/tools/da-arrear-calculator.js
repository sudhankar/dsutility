(function(){
  "use strict";
  var $=function(id){return document.getElementById(id)};
  var from=$('fromMonth'),to=$('toMonth'),due=$('dueDA'),drawn=$('drawnDA'),head=$('headRow'),body=$('employeeBody'),foot=$('totalRow'),note=$('rateNote'),status=$('calcStatus'),exports=$('exportActions');
  var months=[], employees=[], calculated=false;
  var monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var money=function(n){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(n)||0)};
  function ym(d){return d.getFullYear()*12+d.getMonth()}
  function labelFromIndex(i){var y=2020+Math.floor(i/12),m=i%12;return {value:y+'-'+String(m+1).padStart(2,'0'),label:monthNames[m]+' '+y};}
  for(var i=0;i<12*16;i++){months.push(labelFromIndex(i));}
  months.forEach(function(m){var o1=document.createElement('option');o1.value=m.value;o1.textContent=m.label;from.appendChild(o1);var o2=o1.cloneNode(true);to.appendChild(o2);});
  from.value='2025-07';to.value='2026-01';
  function selectedMonths(){var a=from.value.split('-').map(Number),b=to.value.split('-').map(Number),s=a[0]*12+a[1]-1,e=b[0]*12+b[1]-1;if(e<s)return [];var out=[];for(var x=s;x<=e;x++){var y=Math.floor(x/12),m=x%12;out.push({value:y+'-'+String(m+1).padStart(2,'0'),label:monthNames[m]+'-'+String(y).slice(-2)});}return out;}
  function defaultEmployee(){return {name:'',type:'GPF',account:'',basic:'',deduction:'',deductionEdited:false,monthly:[],total:0,net:0};}
  function defaultDeduction(type,total){if(type==='GPF')return total;return total*0.10;}
  function calcRow(emp,ms){var b=Number(emp.basic)||0,diff=(Number(due.value)||0)-(Number(drawn.value)||0),monthly=ms.map(function(){return Math.max(0,b*diff/100)}),total=monthly.reduce(function(a,v){return a+v},0);var ded=emp.deductionEdited?Math.max(0,Number(emp.deduction)||0):defaultDeduction(emp.type,total);emp.monthly=monthly;emp.total=total;emp.deduction=ded;emp.net=Math.max(0,total-ded);return emp;}
  function updateNote(){var ms=selectedMonths(),diff=(Number(due.value)||0)-(Number(drawn.value)||0);if(!ms.length){note.innerHTML='<strong>To Month must be the same as or after From Month.</strong>';return;}note.innerHTML='DA difference: <strong>'+diff.toFixed(2)+'%</strong> · '+ms.length+' month'+(ms.length===1?'':'s')+' selected · Monthly amount = Basic Pay × DA difference.';}
  function buildHead(){var ms=selectedMonths();head.innerHTML='';['Employee Name','Type','GPF / NPS / UPS No.','Basic Pay'].forEach(function(t){var th=document.createElement('th');th.textContent=t;head.appendChild(th)});ms.forEach(function(m){var th=document.createElement('th');th.textContent=m.label;head.appendChild(th)});['Total Arrear','Deduction','Net Pay',''].forEach(function(t){var th=document.createElement('th');th.textContent=t;head.appendChild(th)});}
  function input(cls,val,type){var i=document.createElement('input');i.className=cls;i.type=type||'text';i.value=val==null?'':val;return i;}
  function render(){buildHead();body.innerHTML='';var ms=selectedMonths();if(!ms.length){foot.innerHTML='';return;}
    employees.forEach(function(emp,idx){var tr=document.createElement('tr');
      var td=document.createElement('td');var ni=input('name-input',emp.name);ni.setAttribute('aria-label','Employee name');ni.addEventListener('input',function(){emp.name=this.value;});td.appendChild(ni);tr.appendChild(td);
      td=document.createElement('td');var sel=document.createElement('select');sel.className='type-select';['GPF','NPS','UPS'].forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;if(v===emp.type)o.selected=true;sel.appendChild(o)});sel.addEventListener('change',function(){emp.type=this.value;emp.deductionEdited=false;emp.deduction='';render();});td.appendChild(sel);tr.appendChild(td);
      td=document.createElement('td');var ai=input('account-input',emp.account);ai.addEventListener('input',function(){emp.account=this.value;});td.appendChild(ai);tr.appendChild(td);
      td=document.createElement('td');var bi=input('basic-input',emp.basic,'number');bi.min='0';bi.step='0.01';bi.addEventListener('input',function(){emp.basic=this.value;});td.appendChild(bi);tr.appendChild(td);
      var diff=(Number(due.value)||0)-(Number(drawn.value)||0),monthAmt=Math.max(0,(Number(emp.basic)||0)*diff/100);
      ms.forEach(function(m,j){td=document.createElement('td');td.className='month-cell';td.textContent=money(calculated?emp.monthly[j]:monthAmt);tr.appendChild(td);});
      td=document.createElement('td');td.className='total-cell';td.textContent=money(calculated?emp.total:monthAmt*ms.length);tr.appendChild(td);
      td=document.createElement('td');td.className='deduction-cell';var di=input('money-input',calculated||emp.deductionEdited?emp.deduction:defaultDeduction(emp.type,monthAmt*ms.length),'number');di.min='0';di.step='0.01';di.addEventListener('input',function(){emp.deduction=this.value;emp.deductionEdited=true;});var help=document.createElement('span');help.className='deduction-help';help.textContent=emp.type==='GPF'?'Default 100%': 'Default 10%';td.appendChild(di);td.appendChild(help);tr.appendChild(td);
      td=document.createElement('td');td.className='total-cell';td.textContent=money(calculated?emp.net:(monthAmt*ms.length-defaultDeduction(emp.type,monthAmt*ms.length)));tr.appendChild(td);
      td=document.createElement('td');td.className='delete-cell';var db=document.createElement('button');db.className='row-delete';db.type='button';db.title='Remove employee';db.setAttribute('aria-label','Remove employee');db.textContent='✕';db.addEventListener('click',function(){employees.splice(idx,1);calculated=false;exports.hidden=true;render();});td.appendChild(db);tr.appendChild(td);body.appendChild(tr);
    });
    var totalAr=0,totalDed=0,totalNet=0,gpf=0,nps=0,ups=0;employees.forEach(function(e){var b=Number(e.basic)||0,diff=(Number(due.value)||0)-(Number(drawn.value)||0),ta=Math.max(0,b*diff/100)*ms.length,total=calculated?e.total:ta,ded=calculated?e.deduction:defaultDeduction(e.type,ta),net=Math.max(0,total-ded);totalAr+=total;totalDed+=ded;totalNet+=net;if(e.type==='GPF')gpf+=ded;if(e.type==='NPS')nps+=ded;if(e.type==='UPS')ups+=ded;});
    foot.innerHTML='';var labels=['TOTAL','','',''];labels.forEach(function(t){var td=document.createElement('td');td.textContent=t;foot.appendChild(td)});ms.forEach(function(m){var td=document.createElement('td');td.textContent=money(employees.reduce(function(s,e){return s+(calculated?(e.monthly[ms.indexOf(m)]||0):((Number(e.basic)||0)*(Number(due.value)-Number(drawn.value))/100||0))},0));foot.appendChild(td);});var td=document.createElement('td');td.textContent=money(totalAr);foot.appendChild(td);td=document.createElement('td');td.textContent=money(totalDed);foot.appendChild(td);td=document.createElement('td');td.textContent=money(totalNet);foot.appendChild(td);td=document.createElement('td');foot.appendChild(td);
    $('sumArrear').textContent=money(totalAr);$('sumGPF').textContent=money(gpf);$('sumNPS').textContent=money(nps);$('sumUPS').textContent=money(ups);$('sumNet').textContent=money(totalNet);updateNote();
  }
  function calculate(){var ms=selectedMonths();if(!ms.length){status.textContent='Please select a valid month range.';return;}if(!employees.length){employees.push(defaultEmployee());}var diff=(Number(due.value)||0)-(Number(drawn.value)||0);if(diff<0){status.textContent='Due DA should normally be equal to or higher than Drawn DA.';return;}employees.forEach(function(e){calcRow(e,ms)});calculated=true;exports.hidden=false;status.textContent='Calculated '+employees.length+' employee row'+(employees.length===1?'':'s')+' for '+ms.length+' month'+(ms.length===1?'':'s')+'.';render();}
  $('addEmployee').addEventListener('click',function(){employees.push(defaultEmployee());calculated=false;exports.hidden=true;render();var inputs=body.querySelectorAll('.name-input');if(inputs.length)inputs[inputs.length-1].focus();});
  $('calculateBtn').addEventListener('click',calculate);
  $('resetBtn').addEventListener('click',function(){employees=[];from.value='2025-07';to.value='2026-01';due.value='60';drawn.value='58';calculated=false;exports.hidden=true;status.textContent='';employees.push(defaultEmployee());render();});
  [from,to,due,drawn].forEach(function(el){el.addEventListener('change',function(){calculated=false;exports.hidden=true;status.textContent='';render();});el.addEventListener('input',function(){calculated=false;exports.hidden=true;render();});});
  function statementData(){var ms=selectedMonths();var diff=(Number(due.value)||0)-(Number(drawn.value)||0);return {ms:ms,due:Number(due.value)||0,drawn:Number(drawn.value)||0,diff:diff,employees:employees.map(function(e){var b=Number(e.basic)||0,monthly=ms.map(function(){return Math.max(0,b*diff/100)}),total=monthly.reduce(function(a,v){return a+v},0),ded=e.deductionEdited?Math.max(0,Number(e.deduction)||0):defaultDeduction(e.type,total);return {name:e.name,type:e.type,account:e.account,basic:b,monthly:monthly,total:total,deduction:ded,net:Math.max(0,total-ded)}})}};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
  $('excelBtn').addEventListener('click', function(){
    var d=statementData();
    var rows=[];
    rows.push(['DA ARREAR STATEMENT']);
    rows.push(['Period',d.ms[0].label+' to '+d.ms[d.ms.length-1].label]);
    rows.push(['Due DA %',d.due,'Drawn DA %',d.drawn,'DA Difference %',d.diff]);
    rows.push([]);
    var h=['Employee Name','Type','GPF / NPS / UPS No.','Basic Pay']
      .concat(d.ms.map(function(m){return m.label;}))
      .concat(['Total Arrear','Deduction','Net Pay']);
    rows.push(h);
    d.employees.forEach(function(e){
      rows.push([e.name,e.type,e.account,e.basic].concat(e.monthly).concat([e.total,e.deduction,e.net]));
    });
    var totals=['TOTAL','','',''];
    d.ms.forEach(function(m,j){
      totals.push(d.employees.reduce(function(s,e){return s+e.monthly[j];},0));
    });
    totals.push(d.employees.reduce(function(s,e){return s+e.total;},0));
    totals.push(d.employees.reduce(function(s,e){return s+e.deduction;},0));
    totals.push(d.employees.reduce(function(s,e){return s+e.net;},0));
    rows.push(totals);
    var html='<html><head><meta charset="utf-8"><style>table{border-collapse:collapse}td,th{border:1px solid #999;padding:6px}th{background:#eee}</style></head><body><table>';
    rows.forEach(function(r,i){
      html+='<tr>'+r.map(function(v){
        var text=typeof v==='number'?v.toFixed(2):v;
        return i===4?'<th>'+esc(text)+'</th>':'<td>'+esc(text)+'</td>';
      }).join('')+'</tr>';
    });
    html+='</table></body></html>';
    var blob=new Blob([html],{type:'application/vnd.ms-excel'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='DA-Arrear-Statement.xls';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
  });
  function preparePrint(){calculate();setTimeout(function(){window.print()},80)}
  $('pdfBtn').addEventListener('click',preparePrint);$('printBtn').addEventListener('click',preparePrint);
  employees.push(defaultEmployee());render();
})();
