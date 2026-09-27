(function(){
'use strict';
function init(){
  var section=document.getElementById('calculator-list'),input=document.getElementById('calculatorSearch');
  if(!section||!input)return;
  var cards=[].slice.call(section.querySelectorAll('.calculator-card')),button=document.getElementById('calculatorSearchButton'),count=document.getElementById('calculatorSearchCount'),noResults=section.querySelector('.calculator-no-results');
  function norm(v){return String(v||'').toLowerCase().replace(/[^a-z0-9\\s]+/g,' ').replace(/\\s+/g,' ').trim();}
  var aliases={
    'how many solar panels':'solar panel','solar panels needed':'solar panel','monthly loan payment':'loan emi','loan monthly payment':'loan emi',
    'take home salary':'salary tax','net salary':'salary tax','salary after tax':'salary tax','psx average share price':'psx average price','average share price':'psx average price',
    'cow tmr ration':'tmr feed','cattle tmr ration':'tmr feed','buffalo feed ration':'tmr feed','fertilizer per acre':'fertilizer','urea per acre':'fertilizer',
    'percentage increase':'percentage','percentage decrease':'percentage','scientific calculator online':'scientific','sin calculator':'scientific','cos calculator':'scientific','tan calculator':'scientific',
    'square root calculator':'scientific','kg to pounds':'unit','mph to km':'unit','meters to feet':'unit','liters to gallons':'unit','celsius to fahrenheit':'unit',
    'days between dates':'date','days until':'date','how many days until':'date','date after':'date','date before':'date','hours between times':'time','elapsed time':'time','add hours':'time','minutes calculator':'time',
    'age calculator':'age','how old am i':'age','exact age':'age','age in years months days':'age','tip calculator':'tip','restaurant tip':'tip','tip per person':'tip',
    'bill split calculator':'bill split','split restaurant bill':'bill split','how much does each person pay':'bill split','fuel cost calculator':'fuel','petrol cost':'fuel','fuel consumption':'fuel',
    'pace calculator':'pace','running pace':'pace','minutes per kilometer':'pace','min per km':'pace',
    'what is x percent of y':'percentage','psx profit':'psx','stock profit':'psx','share profit':'psx','gpa calculator':'gpa','grade point average':'gpa','semester gpa':'gpa','statistics calculator':'statistics','mean calculator':'statistics','median calculator':'statistics','standard deviation calculator':'statistics','fraction calculator':'fraction','add fractions':'fraction','subtract fractions':'fraction','multiply fractions':'fraction','divide fractions':'fraction','simple interest calculator':'simple interest','interest on principal':'simple interest'
  };
  var broad={
    emi:'loan installment monthly payment finance',loan:'emi installment monthly payment finance',tax:'salary income fbr pakistan finance',salary:'tax income pakistan',
    psx:'stock shares profit loss dividend portfolio',solar:'sun energy load system size electricity',fertilizer:'npk urea dap mop agriculture',tmr:'feed ration livestock cattle buffalo',
    age:'birthday birth date years months days',tip:'gratuity restaurant bill percentage',bill:'split shared restaurant total per person',fuel:'petrol diesel trip distance consumption cost',
    pace:'running walking speed minutes kilometer',gpa:'grade point average credits semester education',statistics:'mean median range variance standard deviation average data',fraction:'numerator denominator add subtract multiply divide simplify',simple:'interest principal rate time finance',force:'physics mass acceleration newton',velocity:'physics speed displacement time',density:'mass volume science',
    percentage:'percent increase decrease ratio math',math:'percentage ratio equation average probability geometry',science:'physics mechanics motion force energy waves electricity',
    unit:'conversion length mass temperature speed pressure energy',date:'calendar days between add subtract',time:'hours minutes seconds duration elapsed',scientific:'sin cos tan logarithm roots powers'
  };
  function match(hay,term){if(hay.indexOf(term)!==-1)return true;if(aliases[term])return aliases[term].split(' ').every(function(x){return hay.indexOf(x)!==-1;});return false;}
  function search(){
    var raw=norm(input.value),terms=raw?raw.split(' ').filter(function(x){return x.length>1&&!/^(the|a|an|for|to|of|in|on|do|i|need|how|what|is|my|calculate|calculator)$/.test(x);}):[],target=aliases[raw],shown=0;
    cards.forEach(function(card){
      var hay=norm(((card.querySelector('h2')||{}).textContent||'')+' '+(card.getAttribute('data-keywords')||'')+' '+card.textContent);
      var ok=!terms.length || (target&&target.split(' ').every(function(x){return hay.indexOf(x)!==-1;})) || terms.every(function(t){return match(hay,t)||broad[t]&&broad[t].split(' ').some(function(x){return hay.indexOf(x)!==-1;});});
      card.hidden=!ok;if(ok)shown++;
    });
    if(count)count.textContent=raw?shown+' calculator'+(shown===1?'':'s')+' found':shown+' calculators available';
    if(noResults)noResults.hidden=shown!==0;
  }
  if(button)button.addEventListener('click',function(){search();if(norm(input.value)){section.scrollIntoView({behavior:'smooth',block:'start');}});
  input.addEventListener('input',search);input.addEventListener('search',search);
  input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();search();section.scrollIntoView({behavior:'smooth',block:'start');}else if(e.key==='Escape'){input.value='';search();input.focus();}});
  try{var q=new URLSearchParams(location.search).get('q');if(q)input.value=q;}catch(e){}
  search();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();