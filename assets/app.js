(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

  /* ---------------- i18n ---------------- */
  var DICT=window.POCA_I18N||{};
  var HTML_LANG={ko:'ko',en:'en',ja:'ja',zh:'zh-CN'};
  var KO={};
  $$('[data-i18n]').forEach(function(el){KO[el.dataset.i18n]=el.textContent});
  $$('[data-i18n-html]').forEach(function(el){KO[el.dataset.i18nHtml]=el.innerHTML});
  $$('[data-i18n-ph]').forEach(function(el){KO[el.dataset.i18nPh]=el.getAttribute('placeholder')});
  var metaDesc=$('meta[name="description"]');
  KO['meta.title']=document.title; KO['meta.desc']=metaDesc?metaDesc.content:'';
  var current='ko';

  function t(lang,key){var d=lang==='ko'?KO:(DICT[lang]||{});return d[key]!=null?d[key]:KO[key]}
  function setLang(lang,push){
    if(!HTML_LANG[lang]) lang='ko';
    current=lang;
    document.documentElement.lang=HTML_LANG[lang];
    $$('[data-i18n]').forEach(function(el){var v=t(lang,el.dataset.i18n);if(v!=null)el.textContent=v});
    $$('[data-i18n-html]').forEach(function(el){var v=t(lang,el.dataset.i18nHtml);if(v!=null)el.innerHTML=v});
    $$('[data-i18n-ph]').forEach(function(el){var v=t(lang,el.dataset.i18nPh);if(v!=null)el.setAttribute('placeholder',v)});
    document.title=t(lang,'meta.title'); if(metaDesc) metaDesc.content=t(lang,'meta.desc');
    $$('[data-lang]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.lang===lang?'true':'false')});
    store.set('pocaverse-lang',lang);
    if(push && history.replaceState){var u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u.pathname+u.search+u.hash)}
  }
  $$('[data-lang]').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang,true);closeMenu()})});
  var qs=new URLSearchParams(location.search).get('lang');
  var nav=(navigator.language||'ko').slice(0,2).toLowerCase();
  var initial=qs||store.get('pocaverse-lang')||(HTML_LANG[nav]?nav:'ko');
  if(initial!=='ko') setLang(initial,false); else setLang('ko',false);

  /* ---------------- header / menu ---------------- */
  var header=$('#header'), toTop=$('#toTop');
  function onScroll(){
    var y=window.scrollY||window.pageYOffset;
    header.classList.toggle('scrolled',y>24);
    toTop.classList.toggle('show',y>900);
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  var burger=$('.burger'), drawer=$('#drawer');
  function closeMenu(){document.body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false');drawer.setAttribute('aria-hidden','true')}
  burger.addEventListener('click',function(){
    var open=!document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    drawer.setAttribute('aria-hidden',open?'false':'true');
  });
  $$('#drawer nav a, #drawer .btn').forEach(function(a){a.addEventListener('click',closeMenu)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});
  window.addEventListener('resize',function(){if(window.innerWidth>1024)closeMenu()});

  /* active nav */
  var navLinks=$$('.nav a');
  if('IntersectionObserver' in window){
    var secObs=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting){
          navLinks.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+en.target.id)});
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    ['brand','machine','photocard','goods','partner','contact'].forEach(function(id){var s=document.getElementById(id);if(s)secObs.observe(s)});
  }

  /* ---------------- reveal ---------------- */
  var rvs=$$('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.05});
    rvs.forEach(function(el){io.observe(el)});
  } else rvs.forEach(function(el){el.classList.add('in')});

  /* ---------------- hero card stack: holo + tilt ---------------- */
  var stack=$('#stack');
  var fine=window.matchMedia('(pointer:fine)').matches;
  if(stack && fine){
    stack.addEventListener('mousemove',function(e){
      var r=stack.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      $$('.pc',stack).forEach(function(c){c.style.setProperty('--hx',(x*100)+'%');c.style.setProperty('--hy',(y*100)+'%')});
      stack.style.transform='rotateY('+((x-.5)*8)+'deg) rotateX('+((.5-y)*6)+'deg)';
    });
    stack.addEventListener('mouseleave',function(){stack.style.transform=''});
    stack.style.transition='transform .6s cubic-bezier(.2,.7,.1,1)';
    stack.style.transformStyle='preserve-3d';
  }
  /* rail cards holo on hover */
  $$('#rail .pc').forEach(function(c){
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--hx',((e.clientX-r.left)/r.width*100)+'%');c.style.setProperty('--hy',((e.clientY-r.top)/r.height*100)+'%')});
  });

  /* ---------------- photocard rail ---------------- */
  var rail=$('#rail');
  if(rail){
    $$('.theme-tabs button').forEach(function(b){
      b.addEventListener('click',function(){
        $$('.theme-tabs button').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
        var f=b.dataset.filter;
        $$('.pc',rail).forEach(function(c){c.classList.toggle('hide',f!=='all'&&c.dataset.theme!==f)});
        rail.scrollTo({left:0,behavior:'smooth'});
      });
    });
    $$('.rail-ctrl button').forEach(function(b){
      b.addEventListener('click',function(){
        var card=$('.pc:not(.hide)',rail); var w=card?card.getBoundingClientRect().width+20:260;
        rail.scrollBy({left:w*(+b.dataset.dir)*2,behavior:'smooth'});
      });
    });
    var down=false,sx=0,sl=0,moved=false;
    rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=rail.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;rail.classList.add('drag')}rail.scrollLeft=sl-dx});
    window.addEventListener('pointerup',function(){if(!down)return;down=false;rail.classList.remove('drag')});
    rail.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation()}},true);
    rail.addEventListener('dragstart',function(e){e.preventDefault()});
  }

  /* ---------------- contact form ---------------- */
  var form=$('#form');
  // links that pre-select an inquiry type
  $$('[data-type]').forEach(function(a){
    a.addEventListener('click',function(){
      var r=form&&form.querySelector('input[name="type"][value="'+a.dataset.type+'"]');
      if(r){r.checked=true;r.closest('.field').classList.remove('err')}
    });
  });
  if(form){
    var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function check(field){
      var inputs=$$('input,select,textarea',field); if(!inputs.length) return true;
      var ok=true, first=inputs[0];
      if(first.type==='radio'){ok=inputs.some(function(i){return i.checked})}
      else if(first.type==='checkbox'){ok=!first.required||first.checked}
      else {
        var v=first.value.trim();
        if(first.required&&!v) ok=false;
        else if(first.type==='email'&&v&&!emailRe.test(v)) ok=false;
      }
      field.classList.toggle('err',!ok);
      return ok;
    }
    $$('.field',form).forEach(function(f){
      f.addEventListener('input',function(){if(f.classList.contains('err'))check(f)});
      f.addEventListener('change',function(){if(f.classList.contains('err'))check(f)});
      var el=f.querySelector('input[type=email],textarea,input[required]:not([type=radio]):not([type=checkbox])');
      if(el) el.addEventListener('blur',function(){if(el.value.trim())check(f)});
    });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=null;
      $$('.field',form).forEach(function(f){if(f.querySelector('[required]')&&!check(f)&&!bad)bad=f});
      if(bad){var i=bad.querySelector('input,select,textarea');bad.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){i&&i.focus({preventScroll:true})},350);return}
      var btn=form.querySelector('[type=submit]'); btn.disabled=true; btn.style.opacity=.6;
      setTimeout(function(){
        form.classList.add('done'); btn.disabled=false; btn.style.opacity='';
        form.closest('.contact-card').scrollIntoView({behavior:'smooth',block:'start'});
      },700);
    });
    $('#form-reset').addEventListener('click',function(){form.reset();$$('.field',form).forEach(function(f){f.classList.remove('err')});form.classList.remove('done')});
  }
})();
