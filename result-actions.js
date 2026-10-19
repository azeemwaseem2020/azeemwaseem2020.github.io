(()=>{ 
  if(window.__calcoraResultActionsLoaded)return;
  window.__calcoraResultActionsLoaded=true;
  const style=document.createElement('style');
  style.textContent='.calcora-result-actions{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px;padding:10px 0;border:0;background:transparent}.calcora-result-actions button{border:1px solid #cfdbe6;background:#f7fafc;color:#233149;border-radius:9px;padding:9px 13px;font:inherit;font-size:.9rem;font-weight:750;cursor:pointer;min-height:40px}.calcora-result-actions .calcora-copy{background:#087f70;border-color:#087f70;color:#fff}.calcora-result-actions button:focus-visible{outline:3px solid #ffb84d;outline-offset:3px}@media print{.calcora-result-actions,.site-header,.topbar,.tool-tabs,.footer-main,footer,.skip-link{display:none!important}body{background:#fff!important;color:#000!important}.result-box,#result,#out,#divout,#avgout,#bonusout,#rightout,#loadOut,#output,#answer{box-shadow:none!important;break-inside:avoid}}';
  document.head.appendChild(style);
  const selectors='.result-box,.calculator-result,#result,#out,#o,#divout,#avgout,#bonusout,#rightout,#loadOut,[id$=\"Out\"],#output,#answer,#result-content,#salary-tax-result-content,#home-emi-result,#extra-payoff-result,#reverse-tax-result,#aff-result';
  function plainResult(el){
    const clone=el.cloneNode(true);
    clone.querySelectorAll('.calcora-result-actions,button,script,style').forEach(n=>n.remove());
    const heading=document.querySelector('main h1')?.textContent||document.querySelector('h1')?.textContent||document.title;
    return (heading.trim()+'\n\n'+clone.innerText.trim()+'\n\nPage: '+location.href).trim();
  }
  function add(el){
    if(!el||el.dataset.calcoraActions==='1'||el.querySelector(':scope > .calcora-result-actions'))return;
    if(!el.textContent.trim())return;
    if(el.querySelector(selectors))return;
    const actions=document.createElement('div');
    actions.className='calcora-result-actions';
    actions.setAttribute('role','group');
    actions.setAttribute('aria-label','Calculator result actions');
    actions.innerHTML='<button class="calcora-copy" type="button">Copy Result</button><button class="calcora-print" type="button">Download PDF / Print</button>';
    el.appendChild(actions);
    el.dataset.calcoraActions='1';
    const copy=actions.querySelector('.calcora-copy');
    copy.addEventListener('click',async()=>{
      const text=plainResult(el);
      try{
        if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);
        else{
          const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
          const ok=document.execCommand('copy');ta.remove();if(!ok)throw new Error('Copy unavailable');
        }
        copy.textContent='Copied ✓';copy.setAttribute('aria-live','polite');
        setTimeout(()=>{copy.textContent='Copy Result'},1800);
      }catch(e){
        copy.textContent='Select result to copy';setTimeout(()=>{copy.textContent='Copy Result'},2200);
      }
    });
    actions.querySelector('.calcora-print').addEventListener('click',()=>window.print());
  }
  function scan(){
    document.querySelectorAll(selectors).forEach(el=>{
      if(el.querySelector(selectors))return;
      add(el);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();
  new MutationObserver(scan).observe(document.documentElement,{subtree:true,childList:true});

  // Load the shared feedback widget on every page that uses result actions.
  if (!document.querySelector('script[src$="feedback.js"]')) {
    const feedbackScript = document.createElement('script');
    feedbackScript.src = 'feedback.js';
    feedbackScript.defer = true;
    document.head.appendChild(feedbackScript);
  }
})();