'use strict';
const $ = selector => document.querySelector(selector);
const themeStorage = {getItem(key){try{return localStorage.getItem(key)}catch{return null}},setItem(key,value){try{localStorage.setItem(key,value)}catch{}}};
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeUrl = raw => {const input = String(raw ?? '').trim();if(!input || input.startsWith('//')) return '';try {const result = new URL(input,location.href);return ['https:','http:','mailto:'].includes(result.protocol) || (location.protocol==='file:' && result.protocol==='file:' && /^(?:\.\/)?assets\/[a-z0-9_./-]+$/i.test(input) && !input.includes('..')) ? input : '';}catch{return '';}};
const asset = raw => safeUrl(raw) || '';
const liveItems = collection => (Array.isArray(collection) ? collection : []).filter(item => item && item.published !== false);
const outLink = (url,label,cls='') => {const href=safeUrl(url);return href?`<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer" class="${escapeHTML(cls)}">${escapeHTML(label)} ↗</a>`:''};
const logo = (src,label) => asset(src) ? `<img src="${escapeHTML(asset(src))}" alt="${escapeHTML(label)}" loading="lazy">` : '<span aria-hidden="true">✦</span>';
let currentPortfolio;
function render(data){
  if(!data || typeof data !== 'object')return;
  currentPortfolio=data;
  const s=data.site||{}, p=data.profile||{},social=data.socials||{};
  $('#brand').innerHTML=escapeHTML(s.brand||'XANDER.').replace(/\.$/,'<span class="brand-dot">.</span>');
  $('#footer-brand').innerHTML=$('#brand').innerHTML;
  $('#eyebrow').textContent=s.eyebrow||'PORTFOLIO';
  $('#availability').textContent=p.availability||'Open to opportunities';
  $('#hero-role').textContent=p.role||'Business Analyst';
  $('#identity-role').textContent=p.role||'Business Analyst';
  $('#hero-headline').textContent=p.headline||'';
  const headline=$('#hero-headline'), words=String(p.headline||'').trim().split(/\s+/);if(words.length>=5){const n=Math.max(2,Math.ceil(words.length*.43));headline.replaceChildren(document.createTextNode(words.slice(0,-n).join(' ')+' '));const accent=document.createElement('span');accent.textContent=words.slice(-n).join(' ');headline.append(accent);}
  $('#hero-intro').textContent=p.intro||'';
  $('#hero-location').textContent=p.location||'';
  $('#portrait-name').textContent=p.shortName||p.name||'Portfolio';
  const portrait=$('#portrait');if(asset(p.photo))portrait.src=asset(p.photo);portrait.alt='Portrait of '+(p.name||'portfolio owner');
  const cv=$('#cv-link');cv.hidden=!safeUrl(p.resumeUrl);if(!cv.hidden)cv.href=safeUrl(p.resumeUrl);
  $('#about-text').textContent=p.about||'';
  document.title=s.metaTitle||((p.name||'Portfolio')+' | Portfolio');
  $('meta[name=description]').content=s.metaDescription||p.intro||'';
  document.documentElement.dataset.accent=['blue','violet','teal'].includes(s.accent)?s.accent:'blue';
  if(!themeStorage.getItem('xander_theme'))document.documentElement.dataset.theme=s.theme==='dark'?'dark':'light';
  $('#footer-copy').textContent=`© ${new Date().getFullYear()} ${p.shortName||p.name||'Portfolio'}. ${s.footerText||''}`;
  $('#admin-link').hidden= !s.showAdminLink;
  $('#email-link').href=`mailto:${encodeURIComponent(p.email||'')}`;
  for (const key of ['linkedin','github']) {const a=$('#'+key+'-link');a.hidden=!safeUrl(social[key]);if(!a.hidden){a.href=safeUrl(social[key]);a.target='_blank';a.rel='noopener noreferrer';}}
  const icons=['✳','◇','✦'];
  $('#highlights').innerHTML=(p.highlights||[]).slice(0,6).map((h,i)=>`<div class="highlight-card"><span class="highlight-symbol">${icons[i%icons.length]}</span><span><span class="label">${escapeHTML(h.label)}</span><strong>${escapeHTML(h.value)}</strong></span></div>`).join('');
  const projects=liveItems(data.projects);
  $('#projects-empty').hidden=projects.length>0;
  $('#projects-list').innerHTML=projects.map((project,i)=>`
     <article class="project-card"><div class="project-visual ${i%2?'alt':''}"><span class="project-num">PROJECT / ${String(i+1).padStart(2,'0')}</span>${logo(project.image,'Project logo')}<span class="project-type">${escapeHTML(project.category||'Project')}</span></div>
       <div class="project-body"><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.summary)}</p><div class="project-tags">${(project.tags||[]).map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div>
        <div class="project-bottom"><span class="muted">${escapeHTML(project.period||'CASE STUDY')}</span><div>${outLink(project.url,'View project')} <button type="button" data-case="${escapeHTML(project.id)}" aria-expanded="false">Case details +</button></div></div><div class="case-slot" hidden></div>
       </div></article>`).join('');
  $('#experience-list').innerHTML=liveItems(data.experiences).map(ex=>`<article class="timeline-item"><div class="timeline-logo">${logo(ex.logo,'Organization logo')}</div><div class="timeline-content"><div class="timeline-top"><h3>${escapeHTML(ex.role)}</h3><span class="timeline-period">${escapeHTML(ex.period)}</span></div><p class="timeline-company">${escapeHTML(ex.company)}${ex.type?' · '+escapeHTML(ex.type):''}</p><p>${escapeHTML(ex.description)}</p>${outLink(ex.url,'Read more')}</div></article>`).join('');
  const groups=new Map();for(const skill of liveItems(data.skills)){const group=skill.group||'Other Skills';if(!groups.has(group))groups.set(group,[]);groups.get(group).push(skill);}
  const glyphs=['◇','⌘','✧','✳','✦'];
  $('#skills-list').innerHTML=Array.from(groups.entries()).map(([group,skills],i)=>`<article class="skill-group surface"><div class="skill-group-icon">${glyphs[i%glyphs.length]}</div><h3>${escapeHTML(group)}</h3><div class="skill-chips">${skills.map(sk=>`<span title="${escapeHTML(sk.description||'')}">${escapeHTML(sk.name)}</span>`).join('')}</div></article>`).join('');
  $('#achievements-list').innerHTML=liveItems(data.achievements).map(a=>`<article class="award-card surface"><div class="award-top"><div class="award-logo">${logo(a.image,'Achievement emblem')}</div><span class="award-year">${escapeHTML(a.year)}</span></div><h3>${escapeHTML(a.title)}</h3><p class="award-issuer">${escapeHTML(a.issuer)}</p><p>${escapeHTML(a.description)}</p>${outLink(a.url,'See credential')}</article>`).join('');
  for(const [key,element] of [['education','#education-list'],['certifications','#certifications-list']]){
    $(element).innerHTML=liveItems(data[key]).map(item=>`<div class="credential"><div class="credential-icon">${logo(item.logo||item.image,'Credential emblem')}</div><div><h3>${escapeHTML(item.institution||item.title)}</h3><p>${escapeHTML(item.degree||item.issuer)} ${item.year?'· '+escapeHTML(item.year):''}</p><p>${escapeHTML(item.description||'')}</p>${outLink(item.url,'View certificate')}</div></div>`).join('')||'<p class="empty-state">No published entries yet.</p>';
  }
}
// The pre-generated snapshot makes direct file:// opens work without disabling browser security.
// On HTTP(S), JSON remains the primary source and reflects CMS GitHub commits.
const validPortfolio = data => data && typeof data === 'object' && !Array.isArray(data) &&
  data.site && data.profile && Array.isArray(data.projects) && Array.isArray(data.experiences) &&
  Array.isArray(data.skills) && Array.isArray(data.achievements) && Array.isArray(data.certifications) && Array.isArray(data.education);
function notifyPreviewReady(){
  if(window.parent !== window) window.parent.postMessage({type:'XANDER_SITE_READY'}, location.protocol === 'file:' ? '*' : location.origin);
}
async function load(){
  const fallback = window.XANDER_PORTFOLIO_FALLBACK;
  try {
    let data;
    if(location.protocol === 'file:') {
      if(!validPortfolio(fallback)) throw new Error('Local fallback JavaScript is missing or invalid.');
      data = fallback;
    } else {
      try {
        const response = await fetch('data/portfolio.json',{cache:'no-store'});
        if(!response.ok) throw new Error('HTTP '+response.status);
        data = await response.json();
        if(!validPortfolio(data)) throw new Error('The JSON format is invalid.');
      } catch(networkError) {
        console.warn('Using bundled portfolio snapshot because JSON could not be loaded:',networkError);
        if(!validPortfolio(fallback)) throw networkError;
        data = fallback;
      }
    }
    render(data);
    $('#site-error').hidden=true;
    notifyPreviewReady();
  } catch(err) {
    console.error('Could not load portfolio data', err);
    $('#site-error').hidden=false;
  }
}
$('#theme-toggle').addEventListener('click',()=>{const newTheme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=newTheme;themeStorage.setItem('xander_theme',newTheme);});
const savedTheme=themeStorage.getItem('xander_theme');if(savedTheme==='light'||savedTheme==='dark')document.documentElement.dataset.theme=savedTheme;
$('#mobile-menu-btn').addEventListener('click',()=>{const nav=$('#mobile-nav');nav.hidden=!nav.hidden;$('#mobile-menu-btn').setAttribute('aria-expanded',String(!nav.hidden));$('#mobile-menu-btn').textContent=nav.hidden?'☰':'✕';});
$('#mobile-nav').addEventListener('click',e=>{if(e.target.closest('a')){$('#mobile-nav').hidden=true;$('#mobile-menu-btn').setAttribute('aria-expanded','false');$('#mobile-menu-btn').textContent='☰';}});
$('#projects-list').addEventListener('click',e=>{const btn=e.target.closest('[data-case]');if(!btn)return;const data=currentPortfolio?.projects?.find(p=>p.id===btn.dataset.case);if(!data)return;const slot=btn.closest('.project-body').querySelector('.case-slot');slot.hidden=!slot.hidden;btn.setAttribute('aria-expanded',String(!slot.hidden));btn.textContent=slot.hidden?'Case details +':'Close details −';if(!slot.hidden)slot.innerHTML=`<div class="case-details"><strong>Challenge</strong><p>${escapeHTML(data.challenge||'Not specified')}</p><strong>My contribution</strong><p>${escapeHTML(data.contribution||'Not specified')}</p><strong>Outcome</strong><p>${escapeHTML(data.result||'Not specified')}</p></div>`;});
window.addEventListener('message',event=>{if((location.protocol !== 'file:' && event.origin!==location.origin) || (location.protocol === 'file:' && event.origin !== 'null') || event.source!==window.parent || event.data?.type!=='XANDER_CMS_PREVIEW')return;render(event.data.payload);});
load();
