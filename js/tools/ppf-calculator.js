(function(){"use strict";
function $(id){return document.getElementById(id)}
function money(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.max(0,n))}
function calc(){
  var opening=Math.max(0,+$("ppfOpening").value||0),
      annual=Math.min(150000,Math.max(0,+$("ppfContribution").value||0)),
      month=+$("ppfMonth").value||4,
      day=Math.max(1,Math.min(31,+$("ppfDay").value||1)),
      years=Math.max(1,Math.min(50,Math.round(+$("ppfYears").value||15))),
      rate=Math.max(0,+$("ppfRate").value||0)/100;
  /*
     PPF interest is based on the lowest balance between the close of the
     5th day and month-end. The account interest is credited annually.
     We model the financial year in Apr-Mar order so an April 1 deposit
     receives the full year's interest, matching the standard worked example.
  */
  var bal=opening,total=opening,fyMonths=[4,5,6,7,8,9,10,11,12,1,2,3];
  for(var y=0;y<years;y++){
    var interest=0;
    for(var i=0;i<fyMonths.length;i++){
      var m=fyMonths[i];
      if(m===month){bal+=annual;total+=annual;}
      var earns=(m===month && day>5)?false:true;
      if(earns) interest+=bal*rate/12;
      else interest+= (bal-annual)*rate/12;
    }
    bal+=interest;
  }
  $("ppfMaturity").textContent=money(bal);
  $("ppfContrib").textContent=money(total);
  $("ppfInterest").textContent=money(bal-total);
  $("ppfNote").textContent="Estimate follows the PPF monthly lowest-balance convention in an Apr–Mar financial-year model; actual account records remain authoritative.";
}
$("ppfCalculate").addEventListener("click",calc);
$("ppfReset").addEventListener("click",function(){["ppfOpening","ppfContribution","ppfDay","ppfYears","ppfRate"].forEach(function(id){var d={ppfOpening:0,ppfContribution:150000,ppfDay:1,ppfYears:15,ppfRate:7.1};$(id).value=d[id]});$("ppfMonth").value="4";calc()});
calc();
})();