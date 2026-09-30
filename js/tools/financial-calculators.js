(function(){
'use strict';
function v(id){var e=document.getElementById(id);var n=e?Number(e.value):0;return Number.isFinite(n)&&n>=0?n:0}
function money(x){var n=Number(x);if(!Number.isFinite(n))n=0;return '₹'+Math.max(0,n).toLocaleString('en-IN',{maximumFractionDigits:2})}
function set(id,val){var e=document.getElementById(id);if(e)e.textContent=money(val)}
function sipFuture(p,r,n){var i=Math.pow(1+r/100,1/12)-1;return i?p*((Math.pow(1+i,n)-1)/i)*(1+i):p*n}
function rdFuture(monthly,annualRate,months){
  var qRate=annualRate/100/4, total=0;
  for(var k=0;k<months;k++){
    var monthsRemaining=months-k-1;
    total += monthly*Math.pow(1+qRate,monthsRemaining/3);
  }
  return total;
}
function calc(){
  var m=document.body.dataset.m;
  if(m==='sip'){
    var mode=document.querySelector('[name=sipMode]:checked')?.value||'sip';
    var r=v('sipR'),y=v('sipYears'),n=Math.max(0,Math.round(y*12));
    var amt=v(mode==='sip'?'sipP':'sipL');
    var f=mode==='sip'?sipFuture(amt,r,n):amt*Math.pow(1+r/100,y);
    var inv=mode==='sip'?amt*n:amt;
    set('sipX',f);set('sipInvested',inv);set('sipGain',f-inv);
  }else if(m==='swp'){
    var start=v('swpP'),annual=v('swpR'),w=v('swpW'),n=Math.max(0,Math.round(v('swpYears')*12));
    var rate=Math.pow(1+annual/100,1/12)-1,b=start,total=0;
    for(var i=0;i<n&&b>0;i++){
      var growth=b*rate;
      b+=growth;
      var take=Math.min(w,b);
      b-=take;
      total+=take;
    }
    set('swpX',b);set('swpInvested',start);set('swpWithdrawals',total);
  }else if(m==='fd'){
    var p=v('fdP'),r=v('fdR')/100,y=v('fdY'),f=p*Math.pow(1+r/4,4*y);
    set('fdX',f);set('fdInterest',f-p);set('fdPrincipal',p);
  }else if(m==='rd'){
    var p=v('rdP'),r=v('rdR'),y=v('rdY'),n=Math.max(0,Math.round(y*12));
    var f=rdFuture(p,r,n),inv=p*n;
    set('rdX',f);set('rdInvested',inv);set('rdInterest',f-inv);
  }
}
document.querySelectorAll('.fin-input').forEach(function(e){e.addEventListener('input',calc);e.addEventListener('change',calc)});
var c=document.getElementById('calculate');if(c)c.addEventListener('click',calc);
var rst=document.getElementById('rst');if(rst)rst.addEventListener('click',function(){location.reload()});
document.querySelectorAll('[name=sipMode]').forEach(function(e){e.addEventListener('change',function(){
  var sip=document.getElementById('sipPWrap'),l=document.getElementById('sipLWrap');
  if(sip)sip.hidden=this.value!=='sip';if(l)l.hidden=this.value!=='lumpsum';calc();
})});
calc();
})();