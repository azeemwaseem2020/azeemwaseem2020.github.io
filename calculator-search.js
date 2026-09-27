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
    emi:'loan installment monthly payment finance',loan:'emi installment monthly payment markup borrowing',
    tax:'salary income fbr pakistan finance',salary:'tax income pakistan',zakat:'islamic charity nisab assets',
    psx:'stock shares profit loss dividend capital gain portfolio',stock:'psx shares profit dividend',shares:'psx stock portfolio',
    solar:'sun energy load system size electricity',electricity:'solar energy load',
    fertilizer:'npk urea dap mop potash agriculture',npk:'fertilizer nitrogen phosphorus potassium',
    tmr:'feed ration livestock cattle buffalo agriculture',feed:'tmr ration livestock cattle',
    force:'physics mass acceleration newton',velocity:'physics speed displacement time',acceleration:'physics velocity time',
    kinetic:'energy physics mass velocity',density:'mass volume measurement science',
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
    var terms=raw?raw.split(' '):[];
    var shown=0;

    cards.forEach(function(card){
      var title=normalize((card.querySelector('h2')||{}).textContent);
      var keywords=normalize(card.getAttribute('data-keywords'));
      var body=normalize(card.textContent);
      var haystack=(title+' '+keywords+' '+body).trim();
      var match=!terms.length || terms.every(function(term){return matches(haystack,term);});
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