(function(){
'use strict';

function init(){
  var section=document.getElementById('calculator-list');
  var input=document.getElementById('calculatorSearch');
  if(!section||!input)return;

  var cards=Array.prototype.slice.call(section.querySelectorAll('.calculator-card'));
  var searchButton=document.getElementById('calculatorSearchButton');
  var count=document.getElementById('calculatorSearchCount');
  var noResults=section.querySelector('.calculator-no-results');

  function normalize(value){
    return String(value||'').toLowerCase().replace(/[^a-z0-9\s]+/g,' ').replace(/\s+/g,' ').trim();
  }

  var aliases={
    'how many solar panels':'solar panel',
    'solar panels needed':'solar panel',
    'monthly loan payment':'loan emi',
    'loan monthly payment':'loan emi',
    'take home salary':'salary tax',
    'net salary':'salary tax',
    'salary after tax':'salary tax',
    'psx average share price':'psx average price',
    'average share price':'psx average price',
    'stock average price':'psx average price',
    'cow tmr ration':'tmr feed',
    'cattle tmr ration':'tmr feed',
    'buffalo feed ration':'tmr feed',
    'fertilizer per acre':'fertilizer',
    'urea per acre':'fertilizer',
    'percentage increase':'percentage',
    'percentage decrease':'percentage',
    emi:'loan installment monthly payment finance',loan:'emi installment monthly payment markup borrowing',
    tax:'salary income fbr pakistan finance',salary:'tax income pakistan',zakat:'islamic charity nisab assets',
    psx:'stock shares profit loss dividend capital gain portfolio',stock:'psx shares profit dividend',shares:'psx stock portfolio',
    solar:'sun energy load system size electricity',electricity:'solar energy load',
    fertilizer:'npk urea dap mop potash agriculture',npk:'fertilizer nitrogen phosphorus potassium',
    tmr:'feed ration livestock cattle buffalo agriculture',feed:'tmr ration livestock cattle',
    force:'physics mass acceleration newton mechanics',velocity:'physics speed displacement time motion',acceleration:'physics velocity time motion',speed:'physics motion distance time average speed',free:'free fall gravity falling drop time velocity',projectile:'projectile motion range height flight angle',centripetal:'circular motion centripetal force radius speed',torque:'moment force lever arm rotation',spring:'hooke law spring force constant displacement',ohm:'ohm law voltage current resistance electricity circuit',resistance:'ohm resistance resistor circuit electricity series',voltage:'ohm voltage current resistance electricity',current:'electric current ampere voltage resistance',power:'electrical power watt voltage current electricity',wave:'wave speed frequency wavelength sound physics',frequency:'frequency period cycles hertz waves sound',wavelength:'wavelength wave frequency speed sound',heat:'heat energy specific heat temperature thermodynamics',thermodynamics:'heat gas temperature pressure volume thermodynamics',gas:'ideal gas law pressure volume moles temperature pv nrt',
    kinetic:'energy physics mass velocity',density:'mass volume measurement science',physics:'science mechanics motion force energy waves electricity thermodynamics optics',science:'physics mechanics calculation formula student',
    math:'percentage ratio equation quadratic average probability geometry'
  };

  function matches(haystack, term){
    if(haystack.indexOf(term)!==-1)return true;
    if(aliases[term]){
      return aliases[term].split(' ').some(function(alias){return haystack.indexOf(alias)!==-1;});
    }
    return false;
  }

  function search(){
    var raw=normalize(input.value);
    var phrase=raw;
    var stopwords={the:1,a:1,an:1,for:1,to:1,of:1,in:1,on:1,do:1,i:1,need:1,how:1,what:1,is:1,my:1,calculate:1,calculator:1};
    var terms=raw?raw.split(' ').filter(function(t){return t.length>1&&!stopwords[t];}):[];
    var shown=0;

    cards.forEach(function(card){
      var title=normalize((card.querySelector('h2')||{}).textContent);
      var keywords=normalize(card.getAttribute('data-keywords'));
      var body=normalize(card.textContent);
      var haystack=(title+' '+keywords+' '+body).trim();
      var phraseTarget=aliases[phrase];
      var phraseMatch=phraseTarget && phraseTarget.split(' ').every(function(term){return haystack.indexOf(term)!==-1;});
      var match=!terms.length || phraseMatch || terms.every(function(term){return matches(haystack,term);});
      card.hidden=!match;
      if(match)shown++;
    });

    if(count)count.textContent=raw ? shown+' calculator'+(shown===1?'':'s')+' found' : shown+' calculators available';
    if(noResults)noResults.hidden=shown!==0;
    if(searchButton)searchButton.setAttribute('aria-label',raw?'Search for '+input.value:'Search calculators');
  }

  if(searchButton)searchButton.addEventListener('click',function(){
    search();
    if(normalize(input.value)){
      var list=document.getElementById('calculator-list');
      if(list)list.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });

  input.addEventListener('input',search);
  input.addEventListener('search',search);
  input.addEventListener('keydown',function(event){
    if(event.key==='Enter'){
      event.preventDefault();
      search();
      var list=document.getElementById('calculator-list');
      if(list)list.scrollIntoView({behavior:'smooth',block:'start'});
    }else if(event.key==='Escape'){
      input.value='';
      search();
      input.focus();
    }
  });

  try{
    var params=new URLSearchParams(window.location.search);
    if(params.get('q'))input.value=params.get('q');
  }catch(e){}

  search();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();