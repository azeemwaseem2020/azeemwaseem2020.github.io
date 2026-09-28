(function(){
'use strict';
function init(){
  var section=document.getElementById('calculator-list'),input=document.getElementById('calculatorSearch');
  if(!section||!input)return;
  var cards=[].slice.call(section.querySelectorAll('.calculator-card')),button=document.getElementById('calculatorSearchButton'),count=document.getElementById('calculatorSearchCount'),noResults=section.querySelector('.calculator-no-results');
  // Build exact routes automatically from every calculator card.
  // This keeps the search bar synchronized whenever a calculator is added or renamed.
  cards.forEach(function(card){
    var link=card.getAttribute('href')||'',title=(card.querySelector('h2')||{}).textContent||'';
    var titleKey=norm(title);
    if(titleKey&&link)directRoutes[titleKey]=link;
    var fileKey=norm(link.replace(/\.html$/,'').replace(/[-_]+/g,' '));
    if(fileKey&&link)directRoutes[fileKey]=link;
    if(fileKey&&/ calculator$/.test(fileKey)===false&&fileKey.indexOf('calculator')===-1)directRoutes[fileKey+' calculator']=link;
  });
  function norm(v){return String(v||'').toLowerCase().replace(/[^a-z0-9\s]+/g,' ').replace(/\s+/g,' ').trim();}
  var directRoutes={'tmr':'tmr-feed-calculator.html','tmr calculator':'tmr-feed-calculator.html','tmr feed':'tmr-feed-calculator.html','tmr feed calculator':'tmr-feed-calculator.html','tmr dry matter':'tmr-dry-matter-calculator.html','tmr dry matter calculator':'tmr-dry-matter-calculator.html','tmr feed cost':'tmr-feed-cost-calculator.html','tmr feed cost calculator':'tmr-feed-cost-calculator.html','advanced tmr check':'tmr-check-my-ration.html','percentage calculator':'percentage-calculator.html','loan emi calculator':'loan-emi-calculator.html','loan calculator':'loan-emi-calculator.html','mortgage calculator':'mortgage-calculator.html','investment calculator':'investment-calculator.html','retirement calculator':'retirement-calculator.html','inflation calculator':'inflation-calculator.html','sales tax calculator':'sales-tax-calculator.html','amortization calculator':'amortization-calculator.html','savings calculator':'savings-calculator.html','cagr calculator':'cagr-calculator.html','apy calculator':'apy-calculator.html','bmi calculator':'bmi-calculator.html','calorie calculator':'calorie-calculator.html','bmr calculator':'bmr-calculator.html','loan payoff calculator':'loan-payoff-calculator.html','roi calculator':'roi-calculator.html','salary to hourly calculator':'salary-to-hourly-calculator.html','hourly to salary calculator':'hourly-to-salary-calculator.html','overtime calculator':'overtime-calculator.html','exponent calculator':'exponent-calculator.html','log calculator':'log-calculator.html','distance calculator':'distance-calculator.html','mean median mode calculator':'mean-median-mode-calculator.html','z score calculator':'z-score-calculator.html','confidence interval calculator':'confidence-interval-calculator.html','circle calculator':'circle-calculator.html','decimal to fraction calculator':'decimal-to-fraction.html','hex to decimal calculator':'hex-to-decimal.html','electricity cost calculator':'electricity-cost-calculator.html','psx calculator':'psx-calculator.html','psx profit calculator':'psx-calculator.html','psx average price calculator':'psx-average-price-calculator.html','solar load calculator':'solar-load-calculator.html','solar panel calculator':'solar-panel-calculator.html','solar battery calculator':'solar-battery-calculator.html','fertilizer calculator':'fertilizer-calculator.html','acceleration calculator':'acceleration-calculator.html','velocity calculator':'velocity-calculator.html','force calculator':'force-calculator.html','density calculator':'density-calculator.html','kinetic energy calculator':'kinetic-energy-calculator.html','potential energy calculator':'potential-energy-calculator.html','work calculator':'work-calculator.html','power calculator':'power-calculator.html','momentum calculator':'momentum-calculator.html'};
  var aliases={
    'loan calculator':'loan emi','personal loan calculator':'loan emi','car loan calculator':'loan emi','monthly installment calculator':'loan emi',
    'volume of a cylinder':'volume','cylinder volume formula':'volume','cube volume':'volume','rectangular prism volume':'volume','box volume calculator':'volume',
    'circle area formula':'area','area of a circle':'area','rectangle area calculator':'area','triangle area calculator':'triangle',
    'percentage from marks':'grade','test score calculator':'grade','exam percentage calculator':'grade','what grade is my score':'grade','marks to percentage':'grade',
    'hours between two times':'time','time duration calculator':'time','how long between two times':'time','minutes to hours':'time',
    'find missing value in a ratio':'proportion','cross multiplication calculator':'proportion','solve a proportion':'proportion',
    'mortgage payment calculator':'mortgage','monthly mortgage payment':'mortgage','home loan calculator':'mortgage','mortgage interest calculator':'mortgage','loan amortization calculator':'mortgage',
    '20 percent tip calculator':'tip','how much should i tip':'tip','split bill with tip':'bill split',
    'calculate age from date of birth':'age','date of birth age calculator':'age','how many days old am i':'age',
    'kilograms to pounds':'unit','f to c':'unit','fahrenheit to celsius':'unit','miles to km':'unit','km to miles':'unit','bar to psi':'unit','joules to calories':'unit','watts to kilowatts':'unit',
    'what is':'','how much':'','how many':'','find':'','solve':'','calculate':'','formula':'','equation':'','convert':'','from':'','to':'','per':'','rate':'','total':'','average':'','cost':'','price':'','needed':'','need':'','size':'','online':'','free':'','calculator':'',
    'how many solar panels':'solar panel','solar panels needed':'solar panel','solar panel size':'solar panel','monthly solar energy':'solar panel',
    'monthly loan payment':'loan emi','loan monthly payment':'loan emi','car loan payment':'loan emi','home loan payment':'mortgage',
    'take home salary':'salary tax','net salary':'salary tax','salary after tax':'salary tax',
    'psx average share price':'psx average price','average share price':'psx average price','psx profit':'psx','stock profit':'psx','share profit':'psx',
    'cow tmr ration':'tmr feed','cattle tmr ration':'tmr feed','buffalo feed ration':'tmr feed','cow feed calculator':'tmr feed',
    'fertilizer per acre':'fertilizer','fertilizer per hectare':'fertilizer','urea per acre':'fertilizer','dap per acre':'fertilizer',
    'percentage increase':'percentage','percentage decrease':'percentage','percent change':'percentage','what is x percent of y':'percentage',
    'scientific calculator online':'scientific','sin calculator':'scientific','cos calculator':'scientific','tan calculator':'scientific','square root calculator':'scientific',
    'kg to pounds':'unit','kg to lb':'unit','mph to km':'unit','mph to kmh':'unit','meters to feet':'unit','liters to gallons':'unit','celsius to fahrenheit':'unit',
    'days between dates':'date','days until':'date','how many days until':'date','date after':'date','date before':'date',
    'hours between times':'time','elapsed time':'time','add hours':'time','subtract time':'time','minutes calculator':'time',
    'age calculator':'age','how old am i':'age','exact age':'age','age in years months days':'age',
    'tip calculator':'tip','restaurant tip':'tip','tip per person':'tip','bill split calculator':'bill split','split restaurant bill':'bill split',
    'how much does each person pay':'bill split','fuel cost calculator':'fuel','petrol cost':'fuel','fuel consumption':'fuel',
    'pace calculator':'pace','running pace':'pace','minutes per kilometer':'pace','min per km':'pace',
    'gpa calculator':'gpa','grade point average':'gpa','semester gpa':'gpa','grade calculator':'grade',
    'statistics calculator':'statistics','mean calculator':'statistics','median calculator':'statistics','standard deviation calculator':'statistics',
    'fraction calculator':'fraction','add fractions':'fraction','subtract fractions':'fraction','multiply fractions':'fraction','divide fractions':'fraction',
    'simple interest calculator':'simple interest','interest on principal':'simple interest',
    'geometry calculator':'geometry','area calculator':'area','rectangle area':'area','circle area':'area','triangle area':'triangle','perimeter calculator':'geometry',
    'volume calculator':'volume','box volume':'volume','cylinder volume':'volume',
    'mortgage calculator':'mortgage','mortgage payment':'mortgage','mortgage monthly payment':'mortgage','home loan calculator':'mortgage',
    'loan interest calculator':'loan interest','total loan interest':'loan interest','loan total cost':'loan interest',
    'markup calculator':'markup','markup percentage':'markup','selling price from cost':'markup','retail markup':'markup',
    'break even calculator':'break even','break even point':'break even','break even units':'break even','break even sales':'break even',
    'proportion calculator':'proportion','solve proportion':'proportion','missing value ratio':'proportion',
    'quadratic equation calculator':'quadratic','quadratic formula calculator':'quadratic','quadratic roots':'quadratic','discriminant calculator':'quadratic',
    'permutation calculator':'permutation','combination calculator':'permutation','npr calculator':'permutation','ncr calculator':'permutation',
    'triangle calculator':'triangle','triangle perimeter':'triangle','herons formula':'triangle',
    'surface area calculator':'surface area','cylinder surface area':'surface area','cube surface area':'surface area','rectangular prism surface area':'surface area',
    'force calculator':'force','f equals ma':'force','newtons second law':'force','density calculator':'density','mass density':'density',
    'speed calculator':'speed','velocity calculator':'velocity','acceleration calculator':'acceleration','free fall calculator':'free fall',
    'projectile calculator':'projectile','projectile motion':'projectile','centripetal force':'centripetal','torque calculator':'torque',
    'kinetic energy calculator':'kinetic energy','potential energy calculator':'potential energy','momentum calculator':'momentum','work calculator':'work','power calculator':'power',
    'ohms law calculator':'ohms law','electrical power calculator':'electrical power','wave speed calculator':'wave speed','frequency calculator':'frequency',
    'heat calculator':'heat','specific heat calculator':'specific heat','ideal gas law calculator':'ideal gas','pv nrt':'ideal gas','pv=nrt':'ideal gas','ideal gas equation':'ideal gas','lens formula calculator':'lens','mirror formula calculator':'mirror',
    'photon energy calculator':'photon','mass energy calculator':'mass energy','half life calculator':'half life','coulombs law calculator':'coulomb'
  };
  var broad={
    mortgage:'home loan payment interest amortization monthly', 'loan interest':'loan interest payment repayment amortization', markup:'cost selling price retail pricing percentage', 'break even':'fixed variable cost units revenue contribution', proportion:'ratio missing value cross multiplication', quadratic:'equation roots discriminant formula', permutation:'npr ncr counting arrangements selections', triangle:'three sides area perimeter heron', area:'rectangle circle triangle geometry', 'surface area':'box cube cylinder rectangular prism geometry', 'simple interest':'principal rate time interest', 'kinetic energy':'mass velocity motion physics', 'potential energy':'mass height gravity physics', momentum:'mass velocity collision physics', work:'force distance energy physics', power:'work energy time watts physics', 'ohms law':'voltage current resistance electricity', 'electrical power':'voltage current watts electricity', 'wave speed':'wavelength frequency waves', frequency:'cycles hertz waves', heat:'thermal energy temperature mass', 'specific heat':'heat mass temperature material', 'ideal gas':'pressure volume temperature moles gas', lens:'focal length object image optics', mirror:'focal length object image optics', photon:'frequency wavelength energy light', 'mass energy':'mass energy relativity', 'half life':'decay time radioactivity', coulomb:'charge force electricity', force:'physics mass acceleration newton', velocity:'physics speed displacement time', density:'mass volume science', speed:'distance time velocity', acceleration:'velocity time motion', 'free fall':'gravity time velocity distance', projectile:'launch angle velocity range height', centripetal:'mass speed radius force', torque:'force lever arm rotation',
    emi:'loan installment monthly payment finance',loan:'emi installment monthly payment finance',tax:'salary income fbr pakistan finance',salary:'tax income pakistan',
    psx:'stock shares profit loss dividend portfolio',solar:'sun energy load system size electricity',fertilizer:'npk urea dap mop agriculture',tmr:'feed ration livestock cattle buffalo',
    age:'birthday birth date years months days',tip:'gratuity restaurant bill percentage',bill:'split shared restaurant total per person',fuel:'petrol diesel trip distance consumption cost',
    pace:'running walking speed minutes kilometer',gpa:'grade point average credits semester academic',grade:'marks percentage exam score letter grade',statistics:'mean median range standard deviation variance data',fraction:'fractions numerator denominator simplify add subtract multiply divide','simple':'interest principal rate time finance',geometry:'area perimeter shapes rectangle circle triangle',volume:'box cube cylinder capacity cubic',gpa:'grade point average credits semester education',statistics:'mean median range variance standard deviation average data',fraction:'numerator denominator add subtract multiply divide simplify',simple:'interest principal rate time finance',force:'physics mass acceleration newton',velocity:'physics speed displacement time',density:'mass volume science',
    percentage:'percent increase decrease ratio math',math:'percentage ratio equation average probability geometry',science:'physics mechanics motion force energy waves electricity',
    mortgage:'home loan payment interest amortization monthly', 'loan interest':'loan interest payment repayment amortization', markup:'cost selling price retail pricing percentage', 'break even':'fixed variable cost units revenue contribution', proportion:'ratio missing value cross multiplication', quadratic:'equation roots discriminant formula', permutation:'npr ncr counting arrangements selections', triangle:'three sides area perimeter heron', area:'rectangle circle triangle geometry', 'surface area':'box cube cylinder rectangular prism geometry',
    unit:'conversion length mass temperature speed pressure energy',date:'calendar days between add subtract',time:'hours minutes seconds duration elapsed',scientific:'sin cos tan logarithm roots powers'
  };
  function match(hay,term){if(hay.indexOf(term)!==-1)return true;if(aliases[term])return aliases[term].split(' ').every(function(x){return hay.indexOf(x)!==-1;});return false;}
  var intentPatterns=[
    [/\b\\d+(?:\\.\\d+)?%\s*(?:of|from)\s*\\d+/,'percentage'],
    [/\b(?:percentage|percent)\s+(?:increase|decrease|change|difference)\b/,'percentage'],
    [/\b(?:monthly|annual)\s+(?:loan|mortgage)\s+(?:payment|installment)\b/,'loan emi'],
    [/\b(?:home|house)\s+loan\b/,'mortgage'],
    [/\b(?:how many|number of)\s+(?:solar panels|panels)\b/,'solar panel'],
    [/\b(?:kg|kilograms?)\s+(?:to|in)\s+(?:lb|lbs|pounds?)\b/,'unit'],
    [/\b(?:miles?|mi)\s+(?:to|in)\s+(?:km|kilometers?)\b/,'unit'],
    [/\b(?:fahrenheit|celsius|f|c)\s+(?:to|in)\s+(?:fahrenheit|celsius|f|c)\b/,'unit'],
    [/\b(?:hours?|minutes?)\s+(?:between|from)\b/,'time'],
    [/\b(?:how old|age)\b.*\b(?:born|birth|date)\b/,'age'],
    [/\b(?:what|which)\s+grade\b|\b(?:marks?|score)\s+(?:to|percentage|grade)\b/,'grade'],
    [/\b(?:mean|median|average|standard deviation)\b/,'statistics'],
    [/\b(?:solve|find)\s+(?:the )?(?:missing )?(?:value|x)\b.*\b(?:ratio|proportion)\b/,'proportion'],
    [/\b(?:quadratic|ax2|ax\\^2|discriminant)\b/,'quadratic'],
    [/\b(?:npr|ncr|permutation|combination)\b/,'permutation'],
    [/\b(?:surface area|total surface area)\b/,'surface area'],
    [/\b(?:volume|capacity)\b.*\b(?:cylinder|cube|box|rectangular prism)\b/,'volume'],
    [/\b(?:area)\b.*\b(?:circle|rectangle|triangle)\b/,'area'],
    [/\bf\s*=\s*ma\b|\bforce\b.*\bmass\b.*\bacceleration\b/,'force'],
    [/\b(?:rho|ρ|density)\b.*\b(?:mass|volume)\b/,'density'],
    [/\b(?:pv\s*=\s*nrt|ideal gas)\b/,'ideal gas'],
    [/\b(?:e\s*=\s*mc2|e\s*=\s*mc\\^2|mass energy)\b/,'mass energy'],
    [/\b(?:ohm|voltage|current|resistance)\b/,'ohms law']
  ];
  function search(){
    var raw=norm(input.value),patternTarget=null;
    intentPatterns.some(function(item){if(item[0].test(raw)){patternTarget=item[1];return true;}return false;});var terms=raw?raw.split(' ').filter(function(x){return x.length>1&&!/^(the|a|an|for|to|of|in|on|do|i|need|how|what|is|my|calculate|calculator)$/.test(x);}):[],target=aliases[raw],shown=0;
    cards.forEach(function(card){
      var hay=norm(((card.querySelector('h2')||{}).textContent||'')+' '+(card.getAttribute('data-keywords')||'')+' '+card.textContent);
      var ok=!terms.length || patternTarget&&((broad[patternTarget]||'').split(' ').some(function(x){return hay.indexOf(x)!==-1;})||hay.indexOf(patternTarget)!==-1) || (target&&target.split(' ').every(function(x){return hay.indexOf(x)!==-1;})) || terms.every(function(t){return match(hay,t)||broad[t]&&broad[t].split(' ').some(function(x){return hay.indexOf(x)!==-1;});});
      card.hidden=!ok;if(ok)shown++;
    });
    if(count)count.textContent=raw?shown+' calculator'+(shown===1?'':'s')+' found':shown+' calculators available';
    if(noResults)noResults.hidden=shown!==0;
  }
  function runSearch(){
    var raw=norm(input.value);
    if(raw&&directRoutes[raw]){
      window.location.assign(new URL(directRoutes[raw],document.baseURI).href);
      return;
    }
    search();
    if(raw) section.scrollIntoView({behavior:'smooth',block:'start'});
  }
  if(button)button.addEventListener('click',function(e){e.preventDefault();runSearch();});
  input.addEventListener('input',search);
  input.addEventListener('search',search);
  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();runSearch();}
    else if(e.key==='Escape'){input.value='';search();input.focus();}
  });
  try{var q=new URLSearchParams(location.search).get('q');if(q){input.value=q;search();}}catch(e){}
  search();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();