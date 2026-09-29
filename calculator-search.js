(function () {
  'use strict';

  function init() {
    var section = document.getElementById('calculator-list');
    var input = document.getElementById('calculatorSearch');
    if (!section || !input) return;

    var cards = Array.prototype.slice.call(section.querySelectorAll('.calculator-card'));
    var button = document.getElementById('calculatorSearchButton');
    var count = document.getElementById('calculatorSearchCount');
    var noResults = section.querySelector('.calculator-no-results');
    var originalOrder = cards.slice();

    function norm(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Natural-language aliases map user intent to concepts already represented by
    // Calcora cards. This is deliberately small and task-focused rather than a
    // keyword-stuffing dictionary.
    var aliases = {
      'monthly loan payment': 'loan emi',
      'loan monthly payment': 'loan emi',
      'car loan payment': 'loan emi',
      'personal loan payment': 'loan emi',
      'take home salary': 'salary tax',
      'net salary': 'salary tax',
      'salary after tax': 'salary tax',
      'psx profit': 'psx',
      'stock profit': 'psx',
      'share profit': 'psx',
      'average share price': 'psx average price',
      'psx average share price': 'psx average price',
      'cow tmr ration': 'tmr feed',
      'cattle tmr ration': 'tmr feed',
      'buffalo feed ration': 'tmr feed',
      'cow feed calculator': 'tmr feed',
      'fertilizer per acre': 'fertilizer',
      'fertilizer per hectare': 'fertilizer',
      'urea per acre': 'fertilizer',
      'dap per acre': 'fertilizer',
      'how many solar panels': 'solar panel',
      'solar panels needed': 'solar panel',
      'solar panel size': 'solar panel',
      'percentage increase': 'percentage',
      'percentage decrease': 'percentage',
      'percent change': 'percentage',
      'scientific calculator online': 'scientific',
      'sin calculator': 'scientific',
      'cos calculator': 'scientific',
      'square root calculator': 'scientific',
      'days between dates': 'date',
      'days to weeks': 'week',
      'weeks to days': 'week',
      'weeks between dates': 'week',
      'number of weeks between dates': 'week',
      'how many weeks between dates': 'week',
      'add weeks to a date': 'week',
      'days until': 'date',
      'how many days until': 'date',
      'hours between times': 'time',
      'elapsed time': 'time',
      'how old am i': 'age',
      'exact age': 'age',
      'restaurant tip': 'tip',
      'tip per person': 'tip',
      'split restaurant bill': 'bill split',
      'petrol cost': 'fuel',
      'fuel consumption': 'fuel',
      'running pace': 'pace',
      'grade point average': 'gpa',
      'standard deviation calculator': 'statistics',
      'add fractions': 'fraction',
      'subtract fractions': 'fraction',
      'multiply fractions': 'fraction',
      'divide fractions': 'fraction',
      'home loan': 'mortgage',
      'mortgage payment': 'mortgage',
      'loan interest': 'loan interest',
      'break even point': 'break even',
      'selling price from cost': 'markup',
      'missing value in ratio': 'proportion',
      'quadratic formula': 'quadratic',
      'npr calculator': 'permutation',
      'ncr calculator': 'permutation',
      'surface area': 'surface area',
      'mass density': 'density',
      'f equals ma': 'force',
      'speed from distance and time': 'speed',
      'free fall': 'free fall',
      'projectile motion': 'projectile',
      'centripetal force': 'centripetal',
      'kinetic energy': 'kinetic energy',
      'potential energy': 'potential energy',
      'ohms law': 'ohms law',
      'electrical power': 'electrical power',
      'wave speed': 'wave speed',
      'ideal gas law': 'ideal gas',
      'mass energy': 'mass energy'
    };

    var broad = {
      'loan emi': 'loan installment monthly payment finance repayment',
      loan: 'emi installment monthly payment finance borrowing',
      mortgage: 'home loan payment interest amortization monthly',
      'salary tax': 'salary income tax pakistan fbr take home net',
      psx: 'stock shares profit loss dividend portfolio return',
      'psx average price': 'stock shares average cost average buy price',
      solar: 'sun energy load system size electricity panels battery',
      'solar panel': 'solar panels pv energy load',
      fertilizer: 'npk urea dap mop agriculture acre hectare',
      tmr: 'feed ration livestock cattle buffalo dry matter',
      percentage: 'percent increase decrease change ratio math',
      unit: 'conversion length mass temperature speed pressure energy volume',
      date: 'calendar days between add subtract deadline',
      week: 'weeks days duration calendar date add subtract',
      time: 'hours minutes seconds duration elapsed',
      age: 'birthday birth date years months days',
      tip: 'gratuity restaurant bill percentage',
      'bill split': 'shared restaurant total per person tip',
      fuel: 'petrol diesel trip distance consumption cost',
      pace: 'running walking speed minutes kilometer',
      gpa: 'grade point average credits semester education',
      grade: 'marks percentage exam score letter grade',
      statistics: 'mean median range standard deviation variance average data',
      fraction: 'numerator denominator add subtract multiply divide simplify',
      scientific: 'sin cos tan logarithm roots powers constants',
      geometry: 'area perimeter shapes rectangle circle triangle',
      volume: 'box cube cylinder capacity cubic',
      area: 'rectangle circle triangle geometry',
      proportion: 'ratio missing value cross multiplication',
      quadratic: 'equation roots discriminant formula',
      permutation: 'npr ncr counting arrangements selections',
      'surface area': 'box cube cylinder rectangular prism geometry',
      force: 'physics mass acceleration newton',
      velocity: 'physics speed displacement time',
      density: 'mass volume science',
      speed: 'distance time velocity',
      acceleration: 'velocity time motion',
      'free fall': 'gravity time velocity distance',
      projectile: 'launch angle velocity range height',
      centripetal: 'mass speed radius force rotation',
      torque: 'force lever arm rotation',
      'kinetic energy': 'mass velocity motion physics',
      'potential energy': 'mass height gravity physics',
      momentum: 'mass velocity collision',
      work: 'force distance energy physics',
      power: 'work energy time watts physics',
      'ohms law': 'voltage current resistance electricity',
      'electrical power': 'voltage current watts electricity',
      'wave speed': 'wavelength frequency waves',
      frequency: 'cycles hertz waves',
      'ideal gas': 'pressure volume temperature moles gas',
      'mass energy': 'mass energy relativity'
    };

    var stopWords = {
      the: true, a: true, an: true, for: true, to: true, of: true, in: true,
      on: true, do: true, i: true, need: true, how: true, what: true, is: true,
      my: true, calculate: true, calculator: true, online: true, free: true,
      find: true, solve: true, from: true, and: true, please: true
    };

    var patterns = [
      [/\b\d+(?:\.\d+)?\s*%\s*(?:of|from)\s*\d+/i, 'percentage'],
      [/\b(?:percentage|percent)\s+(?:increase|decrease|change|difference)\b/i, 'percentage'],
      [/\b(?:monthly|annual)\s+(?:loan|mortgage)\s+(?:payment|installment)\b/i, 'loan emi'],
      [/\b(?:home|house)\s+loan\b/i, 'mortgage'],
      [/\b(?:how many|number of)\s+(?:solar panels|panels)\b/i, 'solar panel'],
      [/\b(?:kg|kilograms?)\s+(?:to|in)\s+(?:lb|lbs|pounds?)\b/i, 'unit'],
      [/\b(?:miles?|mi)\s+(?:to|in)\s+(?:km|kilometers?)\b/i, 'unit'],
      [/\b(?:hours?|minutes?)\s+(?:between|from)\b/i, 'time'],
      [/\b(?:how old|age)\b.*\b(?:born|birth|date)\b/i, 'age'],
      [/\b(?:mean|median|average|standard deviation)\b/i, 'statistics'],
      [/\b(?:solve|find)\b.*\b(?:ratio|proportion)\b/i, 'proportion'],
      [/\b(?:quadratic|discriminant)\b/i, 'quadratic'],
      [/\b(?:npr|ncr|permutation|combination)\b/i, 'permutation'],
      [/\b(?:surface area)\b/i, 'surface area'],
      [/\b(?:force)\b.*\b(?:mass|acceleration)\b/i, 'force'],
      [/\b(?:density|rho)\b.*\b(?:mass|volume)\b/i, 'density'],
      [/\b(?:pv\s*=\s*nrt|ideal gas)\b/i, 'ideal gas'],
      [/\b(?:ohm|voltage|current|resistance)\b/i, 'ohms law']
    ];

    // Build routes from real cards only. This prevents a search alias from
    // sending a visitor to a page that is not actually present in the library.
    var routes = {};
    cards.forEach(function (card) {
      var link = card.getAttribute('href') || '';
      var title = (card.querySelector('h2, h3') || {}).textContent || '';
      var titleKey = norm(title);
      var fileKey = norm(link.replace(/\.html$/, '').replace(/[-_]+/g, ' '));
      if (link && titleKey) routes[titleKey] = link;
      if (link && fileKey) routes[fileKey] = link;
      if (link && fileKey.indexOf('calculator') === -1) routes[fileKey + ' calculator'] = link;
    });

    var meta = cards.map(function (card, index) {
      var title = norm((card.querySelector('h2, h3') || {}).textContent || '');
      var keywords = norm(card.getAttribute('data-keywords') || '');
      var text = norm(card.textContent || '');
      var hay = title + ' ' + keywords + ' ' + text;
      return { card: card, index: index, title: title, keywords: keywords, text: text, hay: hay };
    });

    function tokenMatch(hay, token) {
      if (hay.indexOf(token) !== -1) return 1;
      if (token.length >= 4) {
        var words = hay.split(' ');
        for (var i = 0; i < words.length; i++) {
          if (words[i].indexOf(token) === 0 || token.indexOf(words[i]) === 0) return 0.55;
        }
      }
      return 0;
    }

    function semanticTerms(target) {
      var source = (broad[target] || target || '').split(' ');
      return source.filter(function (term) { return term.length > 1; });
    }

    function score(item, query, queryTokens, target) {
      if (!query) return 0;
      var scoreValue = 0;
      var exactTitle = item.title === query;
      var titleContains = item.title.indexOf(query) !== -1;
      var targetTerms = semanticTerms(target);

      if (exactTitle) scoreValue += 100;
      else if (titleContains) scoreValue += 55;

      if (item.keywords.indexOf(query) !== -1) scoreValue += 35;
      if (item.hay.indexOf(query) !== -1) scoreValue += 20;

      queryTokens.forEach(function (token) {
        var m = tokenMatch(item.hay, token);
        if (m) scoreValue += 7 * m;
        if (item.title.indexOf(token) !== -1) scoreValue += 5;
      });

      targetTerms.forEach(function (term) {
        if (item.hay.indexOf(term) !== -1) scoreValue += 3;
      });

      return scoreValue;
    }

    function detectTarget(rawQuery) {
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i][0].test(rawQuery)) return patterns[i][1];
      }
      if (aliases[rawQuery]) return aliases[rawQuery];
      return null;
    }

    function render() {
      var raw = String(input.value || '').trim();
      var query = norm(raw);
      var target = detectTarget(raw);
      var tokens = query.split(' ').filter(function (token) {
        return token.length > 1 && !stopWords[token];
      });

      if (!query) {
        meta.forEach(function (item) {
          item.card.hidden = false;
          item.card.style.removeProperty('order');
        });
        cards.forEach(function (card, index) {
          card.style.order = String(index);
        });
        if (count) count.textContent = cards.length + ' calculators available';
        if (noResults) noResults.hidden = true;
        return;
      }

      var ranked = meta.map(function (item) {
        return { item: item, score: score(item, query, tokens, target) };
      }).filter(function (entry) {
        return entry.score > 0;
      });

      ranked.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.index - b.item.index;
      });

      var visible = ranked.map(function (entry) { return entry.item.card; });
      meta.forEach(function (item) {
        var show = visible.indexOf(item.card) !== -1;
        item.card.hidden = !show;
      });

      visible.forEach(function (card, index) {
        card.style.order = String(index);
      });

      var shown = visible.length;
      if (count) count.textContent = shown + ' calculator' + (shown === 1 ? '' : 's') + ' found';
      if (noResults) noResults.hidden = shown !== 0;
    }

    function runSearch() {
      var raw = norm(input.value);
      if (raw && routes[raw]) {
        window.location.assign(new URL(routes[raw], document.baseURI).href);
        return;
      }

      // For a natural-language query, keep the ranked result list visible rather
      // than guessing a destination. This avoids incorrect redirects.
      render();
      if (raw) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        runSearch();
      });
    }

    input.addEventListener('input', render);
    input.addEventListener('search', render);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        runSearch();
      } else if (event.key === 'Escape') {
        input.value = '';
        render();
        input.focus();
      }
    });

    try {
      var params = new URLSearchParams(location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
        render();
      }
    } catch (error) {
      // Older browsers can simply start with an empty search.
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();