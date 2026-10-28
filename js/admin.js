'use strict';
if (sessionStorage.getItem('xander_cms_session') !== 'active') throw Error('CMS UI session is not active.');
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clone=x=>JSON.parse(JSON.stringify(x));
const STORAGE_DRAFT='xander_cms_local_draft_v1', STORAGE_REPO='xander_cms_repo_v1', STORAGE_VAULT='xander_cms_token_vault_v2';
const defaultRepo={owner:'',repo:'',branch:'main'};
const navNames={dashboard:'Dashboard',profile:'Profile & About',projects:'Projects',experiences:'Experience',skills:'Skills',achievements:'Achievements',certifications:'Certifications',education:'Education',appearance:'Appearance & SEO',socials:'Social & Contact',media:'Media Library',publish:'GitHub & Publish'};
const titles={dashboard:['OVERVIEW','Portfolio dashboard','Manage your digital presence from one workspace.'],profile:['IDENTITY','Profile & about','Control how your story appears to visitors.'],projects:['PORTFOLIO','Featured projects','Showcase your best work and describe its impact.'],experiences:['CAREER','Work experiences','Keep your professional journey up to date.'],skills:['CAPABILITIES','Skills & tools','Group the tools and strengths that define your work.'],achievements:['RECOGNITION','Achievements','Highlight awards, milestones, and competition results.'],certifications:['CREDENTIALS','Certifications','Publish courses, certificates, and professional learning.'],education:['ACADEMIC','Education','Edit education and learning background.'],appearance:['PERSONALIZATION','Appearance & SEO','Customize your branding and search-engine metadata.'],socials:['CONTACT','Social & contact','Manage safe ways for recruiters to reach you.'],media:['ASSETS','Media library','Upload images directly to GitHub and reuse their paths.'],publish:['DEPLOYMENT','GitHub & publish','Publish public portfolio data to GitHub using one atomic commit.']};
const specs={
projects:[['title','Project title'],['category','Category'],['period','Period / label'],['summary','Short summary','textarea'],['challenge','Business challenge','textarea'],['contribution','My contribution','textarea'],['result','Outcome / result (verified)','textarea'],['tags','Tags (comma-separated)','tags'],['image','Project image / logo path'],['url','Project documentation / live URL','url'],['featured','Featured project','check'],['published','Visible on public website','check']],
experiences:[['role','Role / position'],['company','Company / organization'],['period','Period (e.g. Jan 2025 – Present)'],['type','Employment type'],['description','Responsibilities / contribution','textarea'],['logo','Company logo path'],['url','Reference / proof URL','url'],['published','Visible on public website','check']],
skills:[['name','Skill / tool name'],['group','Skill category (group)'],['description','Optional details','textarea'],['published','Visible on public website','check']],
achievements:[['title','Achievement title'],['issuer','Awarding body / event'],['year','Year'],['description','Description','textarea'],['image','Logo path'],['url','Certificate URL','url'],['published','Visible on public website','check']],
certifications:[['title','Certification title'],['issuer','Issuer / organizer'],['year','Year'],['description','Description','textarea'],['image','Logo path'],['url','Certificate URL','url'],['published','Visible on public website','check']],
education:[['institution','Institution name'],['degree','Degree / major'],['period','Study period'],['description','Additional information','textarea'],['logo','Institution logo path'],['published','Visible on public website','check']]
};
const defaults={projects:{title:'Untitled project',category:'Project',period:'',summary:'',challenge:'',contribution:'',result:'',tags:[],image:'',url:'',featured:true,published:true},experiences:{role:'New position',company:'',period:'',type:'',description:'',logo:'',url:'',published:true},skills:{name:'New skill',group:'Business & Product',description:'',published:true},achievements:{title:'New achievement',issuer:'',year:'',description:'',image:'',url:'',published:true},certifications:{title:'New certification',issuer:'',year:'',description:'',image:'',url:'',published:true},education:{institution:'New institution',degree:'',period:'',description:'',logo:'',published:true}};
let draft=null, original=null, section='dashboard', token='', githubLogin='', repoConfig=readRepo(), connectedSha='', stateDirty=false, toastTimer;
function readRepo(){try{return {...defaultRepo,...JSON.parse(localStorage.getItem(STORAGE_REPO)||'{}')};}catch{return {...defaultRepo}}}
function saveDraft(){localStorage.setItem(STORAGE_DRAFT,JSON.stringify(draft));stateDirty=true;$('#draft-status').textContent='● Local draft saved';$('#draft-status').classList.add('saved');}
function toast(message){const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4000);}
function field(scope,key,label,type='text',item=null,index=null,full=false){
 const source=item||draft[scope]||{}, raw=source[key], value=type==='tags'?(Array.isArray(raw)?raw.join(', '):raw||''):(raw??'');
 const attrs=`data-scope="${esc(scope)}" data-key="${esc(key)}" ${index===null?'':`data-index="${index}"`}`;
 if(type==='check')return `<label class="field-check ${full?'full':''}"><input type="checkbox" ${attrs} ${value?'checked':''}> ${esc(label)}</label>`;
 if(type==='textarea')return `<div class="field full"><label>${esc(label)}</label><textarea rows="3" ${attrs}>${esc(value)}</textarea></div>`;
 if(type==='select-accent'){return `<div class="field"><label>${esc(label)}</label><select ${attrs}><option value="blue" ${value==='blue'?'selected':''}>Electric blue</option><option value="violet" ${value==='violet'?'selected':''}>Modern violet</option><option value="teal" ${value==='teal'?'selected':''}>Professional teal</option></select></div>`;}
 if(type==='select-theme'){return `<div class="field"><label>${esc(label)}</label><select ${attrs}><option value="light" ${value==='light'?'selected':''}>Light</option><option value="dark" ${value==='dark'?'selected':''}>Dark</option></select></div>`;}
 return `<div class="field ${full?'full':''}"><label>${esc(label)}</label><input type="${type==='url'?'url':'text'}" ${attrs} value="${esc(value)}" placeholder="${type==='url'?'https://example.com':'Enter '+esc(label.toLowerCase())}"></div>`;
}
function renderFields(scope,defs,item=null,index=null){return `<div class="fields-grid">${defs.map(([key,label,type,full])=>field(scope,key,label,type,item,index,!!full)).join('')}</div>`;}
function setTitle(active){const h=titles[active];$('#section-kicker').textContent=h[0];$('#section-title').textContent=h[1];$('#section-description').textContent=h[2];$('#breadcrumb').textContent=navNames[active];}
function navTo(id){section=id;setTitle(id);for(const btn of document.querySelectorAll('[data-section]'))btn.classList.toggle('active',btn.dataset.section===id);$('#section-action').innerHTML='';const renderers={dashboard:dashboard,profile:profile,appearance:appearance,socials:socials,media:media,publish:publish};const content=renderers[id]?renderers[id]():collection(id);$('#cms-content').innerHTML=content;$('#sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'instant'});}
function dashboard(){const groups=[['Projects','projects','▣'],['Experiences','experiences','▥'],['Skills','skills','✳'],['Achievements','achievements','◇']];return `<div class="stat-grid">${groups.map(([label,key,icon])=>`<div class="stat-card"><span class="stat-icon">${icon}</span><strong>${(draft[key]||[]).filter(x=>x.published!==false).length}</strong><small>Published ${label.toLowerCase()}</small></div>`).join('')}</div><div class="dashboard-grid"><section class="panel"><h2>Quick management</h2><p>Update the most important sections of your portfolio with just a few clicks.</p><div class="quick-list">${[['profile','Profile & headline','Edit your identity and personal introduction'],['projects','Project showcase','Add results, contributions, and case studies'],['experiences','Professional experience','Present your career timeline'],['appearance','Design & discoverability','Theme, branding, and SEO']].map(([k,title,desc])=>`<div class="quick-row"><div><strong>${title}</strong><small>${desc}</small></div><button data-go="${k}">Edit ↗</button></div>`).join('')}</div></section><section class="panel notice-panel"><h2>Ready to publish?</h2><p>Draft edits are saved in this browser. Published items become visible through public JSON; hidden items remain local. Publishing requires GitHub authorization.</p><button class="action-btn" data-go="publish">GitHub publishing →</button></section></div><div class="panel" style="margin-top:18px"><h2>Helpful workflow</h2><p>1. Edit any section. 2. Click <strong>Preview</strong> to inspect the website. 3. Connect your GitHub repository using a fine-grained token. 4. Click <strong>Publish</strong>. GitHub Pages will deploy the changed JSON from your configured branch.</p><div class="github-buttons"><button data-action="export" class="action-btn">↓ Export JSON backup</button><button data-action="import" class="action-btn">↑ Import JSON backup</button><button data-action="export-offline" class="action-btn">↓ Export offline JS</button><button data-action="reset" class="action-btn">↻ Reload published JSON</button></div></div>`;}
function profile(){const basics=[['name','Full name'],['shortName','Display name'],['role','Professional role / headline label'],['headline','Hero headline','textarea'],['intro','Short introduction','textarea'],['about','About me','textarea'],['location','Public location (city or country only)'],['email','Public contact email'],['photo','Portrait image path'],['resumeUrl','CV / résumé public link','url'],['availability','Opportunity status']];const highs=(draft.profile.highlights||[]).map((item,i)=>`<div class="editor-card"><div class="editor-card-top"><strong>Highlight ${i+1}</strong><button class="mini-btn danger" data-action="remove-highlight" data-index="${i}">Delete</button></div><div class="fields-grid">${field('highlights','label','Label','text',item,i)}${field('highlights','value','Value','text',item,i)}</div></div>`).join('');return `<div class="hint-box">Keep your public introduction concise and achievement-oriented. <strong>Do not add your full residential address or confidential company information.</strong></div><section class="editor-card"><h3>Personal details & hero</h3>${renderFields('profile',basics)}</section><h3 class="subsection-heading">Hero highlight cards</h3>${highs}<button class="action-btn" data-action="add-highlight">+ Add highlight</button>`;}
function socials(){return `<div class="hint-box">Only links and contact information you enter here will appear publicly. Empty social links are hidden.</div><section class="editor-card"><h3>Social profiles</h3>${renderFields('socials',[['linkedin','LinkedIn URL','url'],['github','GitHub profile URL','url'],['instagram','Instagram URL','url'],['other','Other relevant URL','url']])}</section><section class="editor-card"><h3>Public email</h3>${renderFields('profile',[['email','Contact email']])}</section>`;}
function appearance(){return `<div class="hint-box">Changes to the color palette and SEO metadata apply to the public site after publishing. The visitor's light/dark preference may override the default theme.</div><section class="editor-card"><h3>Site identity & colors</h3>${renderFields('site',[['brand','Brand wordmark'],['eyebrow','Hero eyebrow'],['accent','Accent color','select-accent'],['theme','Default theme','select-theme'],['footerText','Footer message'],['showAdminLink','Show admin link publicly','check']])}</section><section class="editor-card"><h3>Search engine optimization</h3>${renderFields('site',[['metaTitle','Page title (SEO)'],['metaDescription','Search description','textarea']])}</section>`;}
function itemHeading(group,item,index){return esc(item.title||item.role||item.name||item.institution||`${navNames[group]} ${index+1}`)}
function collection(group){const entries=Array.isArray(draft[group])?draft[group]:[];$('#section-action').innerHTML=`<button class="action-btn primary" data-action="add" data-collection="${group}">+ Add new</button>`;return `<div class="hint-box">Changes are automatically saved as a <strong>local draft</strong>. Use the arrows to reorder items and the visibility checkbox to hide them from the public website. Click <strong>Publish</strong> when ready.</div>${entries.map((item,i)=>`<article class="editor-card"><div class="editor-card-top"><div><strong>${String(i+1).padStart(2,'0')} · ${itemHeading(group,item,i)}</strong><small>${item.published===false?'Hidden from visitors':'Visible on public website'}</small></div><div class="card-btns"><button class="mini-btn" data-action="up" data-collection="${group}" data-index="${i}" ${i===0?'disabled':''} title="Move up">↑</button><button class="mini-btn" data-action="down" data-collection="${group}" data-index="${i}" ${i===entries.length-1?'disabled':''} title="Move down">↓</button><button class="mini-btn danger" data-action="delete" data-collection="${group}" data-index="${i}">Delete</button></div></div>${renderFields(group,specs[group],item,i)}</article>`).join('')||'<div class="empty-editor">There are no items yet. Click <strong>Add new</strong> to begin.</div>'}<div class="section-actions"><button class="action-btn primary" data-action="add" data-collection="${group}">+ Add another</button><button class="action-btn" data-action="preview">◉ Preview website</button></div>`;}
function media(){const assetPaths=new Set();const add=v=>{if(typeof v==='string'&&v.trim())assetPaths.add(v)};add(draft.profile?.photo);for(const group of ['projects','experiences','achievements','certifications','education'])for(const item of draft[group]||[])add(item.image||item.logo);return `<div class="hint-box warning"><strong>Media uploads commit immediately to GitHub.</strong> Uploading an image requires a connected repository token and creates a commit. To display it publicly, enter its returned <code>assets/uploads/...</code> path into the relevant content field and publish JSON afterward. Uploaded images are public.</div><section class="panel"><h2>Upload image to GitHub</h2><p>Accepts PNG, JPG, WEBP, GIF, SVG (max 2 MB). Avoid confidential documents or sensitive images.</p><div class="media-form"><input type="file" id="media-file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"><button class="action-btn primary" data-action="upload">↑ Upload to repository</button></div><p class="media-result" id="media-result"></p></section><section class="panel" style="margin-top:17px"><h2>Media paths currently in use</h2><div class="quick-list">${[...assetPaths].map(path=>`<div class="quick-row"><div><strong>${esc(path)}</strong></div><button data-copy="${esc(path)}">Copy path</button></div>`).join('')||'<p>No linked media.</p>'}</div></section>`;}
function publish(){
 const connected=!!token&&!!githubLogin, saved=!!localStorage.getItem(STORAGE_VAULT);
 return `<div class="repo-banner"><span class="repo-icon">⌘</span><div><b>${connected?'Connected to GitHub as '+esc(githubLogin):(saved?'Encrypted GitHub token saved on this device':'GitHub connection required')}</b><small>${connected?'Authenticated for this browser tab. Your raw token is never added to website files.':(saved?'Enter your vault passphrase to unlock the saved token. You do not need to paste the token again.':'Connect a repository-scoped fine-grained token with Contents: Read and write permission.')}</small></div></div>
 <section class="panel"><h2>Repository & publishing</h2><p>Use a fine-grained token limited to this repository. Public visitors can read public website data. Your token is never committed.</p>
 <div class="github-form"><div><label for="repo-owner">GitHub owner / account</label><input id="repo-owner" placeholder="e.g. CAlexander2004" value="${esc(repoConfig.owner)}"></div><div><label for="repo-name">Repository name</label><input id="repo-name" placeholder="e.g. Christopher_Alexander_Sutandhya" value="${esc(repoConfig.repo)}"></div><div><label for="repo-branch">Publishing branch</label><input id="repo-branch" placeholder="main" value="${esc(repoConfig.branch)}"></div><div><label for="repo-token">GitHub token (only for initial connection or replacement)</label><div class="token-wrap"><input id="repo-token" type="password" autocomplete="off" placeholder="${connected?'Connected — no need to enter again':'github_pat_...'}"><button id="token-toggle" data-action="reveal-token">Show</button></div></div></div>
 <div class="hint-box"><strong>Remember token securely on this device:</strong> Enter a long, unique <em>vault passphrase</em> below and click Test &amp; connect. The token is saved encrypted using AES-GCM; only the encrypted value is stored in this browser. On later visits use Unlock saved token and the same passphrase. Do not reuse your GitHub or CMS password. Do not use this feature on a shared computer.</div>
 <div class="github-form"><div><label for="vault-passphrase">Vault passphrase (not your GitHub token)</label><div class="token-wrap"><input id="vault-passphrase" type="password" autocomplete="new-password" placeholder="Minimum 12 characters (longer is better)"><button data-action="reveal-vault">Show</button></div></div></div>
 <div class="github-buttons"><button class="action-btn" data-action="connect">⌁ Test &amp; connect${saved?' / replace token':''}</button>${saved?'<button class="action-btn" data-action="unlock-token">↳ Unlock saved token</button>':''}<button class="action-btn" data-action="disconnect">Disconnect</button>${saved?'<button class="action-btn" data-action="forget-token">Forget saved token</button>':''}<button class="action-btn primary" data-action="publish-json">↑ Publish changes (one commit)</button></div>
 <div id="publish-result"></div></section>
 <section class="panel" style="margin-top:18px"><h2>Public JSON &amp; privacy</h2><p>This site runs on public GitHub Pages. Browser-readable content and publicly committed repository files cannot be kept secret. When publishing, CMS exports only supported public fields and omits all items marked <strong>Visible on public website = Off</strong>. Unpublished entries remain solely in your current browser draft (and optional manual backups). Avoid entering private addresses, secrets, tokens, or confidential work data.</p><div class="hint-box warning"><strong>Existing commits:</strong> Previously uploaded data remains accessible in Git history. Filtering future commits does not erase Git history.</div></section>
 <section class="panel" style="margin-top:18px"><h2>Backup &amp; recovery</h2><p>Export your CMS draft for offline backup. JSON and offline JS will be updated in one Git commit on publication, triggering a single Pages deployment.</p><div class="github-buttons"><button class="action-btn" data-action="export">↓ Export JSON</button><button class="action-btn" data-action="import">↑ Import JSON</button><button class="action-btn" data-action="export-offline">↓ Export offline JS</button><button class="action-btn" data-action="reset">↻ Reload published JSON</button></div></section>
 <section class="panel" style="margin-top:18px"><h2>Security &amp; deployment</h2><p>Token storage here protects against casual reading of browser storage, but browser-only encryption cannot defend against malicious extensions, browser malware, compromised JavaScript, or a weak vault passphrase. Use HTTPS, a trusted personal computer, and least-privilege GitHub tokens. GitHub Pages still controls deployment time even when the CMS uses one commit.</p></section>`;
}
function onField(event){const el=event.target.closest('[data-scope][data-key]');if(!el)return;const {scope,key,index}=el.dataset;let target;if(scope==='highlights'){target=draft.profile.highlights[Number(index)];}else if(index!==undefined){target=draft[scope]?.[Number(index)];}else{target=draft[scope];}if(!target)return;let value=el.type==='checkbox'?el.checked:el.value;if(key==='tags')value=value.split(',').map(x=>x.trim()).filter(Boolean);target[key]=value;saveDraft();}
function handleAction(button){const {action,collection:group,index:indexStr}=button.dataset,index=Number(indexStr);if(action==='add'){draft[group].push({...clone(defaults[group]),id:(crypto.randomUUID?.()||String(Date.now()))});saveDraft();navTo(group);toast('New item added to your draft.');return;}
 if(action==='delete'){if(confirm('Delete this item from your local draft?')){draft[group].splice(index,1);saveDraft();navTo(group);toast('Item removed from draft.');}return;}
 if(action==='up'||action==='down'){const target=action==='up'?index-1:index+1;if(target<0||target>=draft[group].length)return;[draft[group][index],draft[group][target]]=[draft[group][target],draft[group][index]];saveDraft();navTo(group);return;}
 if(action==='add-highlight'){draft.profile.highlights ||= [];draft.profile.highlights.push({label:'New label',value:'New value'});saveDraft();navTo('profile');return;}
 if(action==='remove-highlight'){draft.profile.highlights.splice(index,1);saveDraft();navTo('profile');return;}
 if(action==='preview'){openPreview();return;}
 if(action==='export'){exportData();return;}
 if(action==='export-offline'){exportOfflineSnapshot();return;}
 if(action==='import'){$('#import-json-input').click();return;}
 if(action==='reset'){reloadProduction();return;}
 if(action==='reveal-token'){const input=$('#repo-token');if(!input)return;input.type=input.type==='password'?'text':'password';button.textContent=input.type==='password'?'Show':'Hide';return;}
 if(action==='connect'){connectGitHub();return;}
 if(action==='disconnect'){token='';githubLogin='';connectedSha='';toast('Disconnected in this tab. Encrypted saved token (if any) was retained.');navTo('publish');return;}
 if(action==='forget-token'){if(confirm('Delete the encrypted saved token from this browser?')){localStorage.removeItem(STORAGE_VAULT);token='';githubLogin='';connectedSha='';navTo('publish');toast('Saved token forgotten from this browser.');}return;}
 if(action==='unlock-token'){unlockSavedToken();return;}
 if(action==='reveal-vault'){const input=$('#vault-passphrase');if(!input)return;input.type=input.type==='password'?'text':'password';button.textContent=input.type==='password'?'Show':'Hide';return;}
 if(action==='publish-json'){publishJSON();return;}
 if(action==='upload'){uploadImage();return;}
}
function closePreview(){$('#preview-overlay').hidden=true;}
function sendPreview(){const iframe=$('#preview-frame');if(iframe.contentWindow&&draft)iframe.contentWindow.postMessage({type:'XANDER_CMS_PREVIEW',payload:clone(draft)},location.protocol==='file:'?'*':location.origin);}
function openPreview(){$('#preview-overlay').hidden=false;const frame=$('#preview-frame');frame.onload=()=>{sendPreview();setTimeout(sendPreview,150)};frame.src='index.html?cms_preview='+Date.now();}
function downloadBlob(content, name, mime){
  const blob=new Blob([content],{type:mime});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}
function exportData(){
  downloadBlob(JSON.stringify(draft,null,2)+'\n','portfolio.json','application/json');
  toast('JSON downloaded. Put it in the data/ folder to update the local JSON.');
}
function offlineSnapshotContent(data){
  const serialized=JSON.stringify(data,null,2).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return '// Offline public copy of portfolio.json. On GitHub Pages, the website reads JSON directly.\nwindow.XANDER_PORTFOLIO_FALLBACK = '+serialized+';\n';
}
function exportOfflineSnapshot(){
  downloadBlob(offlineSnapshotContent(publicPortfolio(draft)),'portfolio-fallback.js','text/javascript');
  toast('Offline JS downloaded. Put it inside data/ alongside portfolio.json.');
}
function validateData(data){return data && typeof data==='object' && !Array.isArray(data) && data.site && data.profile && Array.isArray(data.projects) && Array.isArray(data.experiences) && Array.isArray(data.skills) && Array.isArray(data.achievements) && Array.isArray(data.certifications) && Array.isArray(data.education);}
async function readPortfolioSource(){
  const fallback = window.XANDER_PORTFOLIO_FALLBACK;
  if(location.protocol==='file:'){
    if(!validateData(fallback)) throw Error('Local portfolio-fallback.js is unavailable or invalid.');
    return clone(fallback);
  }
  try{
    const res=await fetch('data/portfolio.json?refresh='+Date.now(),{cache:'no-store'});
    if(!res.ok) throw Error('HTTP '+res.status);
    const data=await res.json();
    if(!validateData(data)) throw Error('Invalid portfolio JSON');
    return data;
  }catch(error){
    if(!validateData(fallback))throw error;
    console.warn('CMS is using bundled snapshot because portfolio JSON could not load:',error);
    return clone(fallback);
  }
}
async function reloadProduction(){
  if(!confirm(location.protocol==='file:' ? 'Discard your draft and restore the bundled local portfolio snapshot?' : 'Discard your local draft and reload data/portfolio.json from the deployed website?'))return;
  try{const data=await readPortfolioSource();draft=clone(data);original=clone(data);localStorage.removeItem(STORAGE_DRAFT);stateDirty=false;navTo(section);toast('Portfolio data reloaded.');}catch(e){toast(e.message);}
}
// Only publish explicit public fields. Never serialize arbitrary CMS/draft properties.
// Visibility=Off means omitted from BOTH public JSON and offline JS, not merely hidden by CSS.
function publicPortfolio(src){
 const allowed={
  site:['brand','eyebrow','metaTitle','metaDescription','accent','theme','footerText','showAdminLink'],
  profile:['name','shortName','role','headline','intro','about','location','email','photo','resumeUrl','availability','highlights'],
  socials:['linkedin','github','instagram','other'],
  projects:['id','title','category','period','summary','challenge','contribution','result','tags','image','url','featured','published'],
  experiences:['id','role','company','period','type','description','logo','url','published'],
  skills:['id','name','group','description','published'],
  achievements:['id','title','issuer','year','description','image','url','published'],
  certifications:['id','title','issuer','year','description','image','url','published'],
  education:['id','institution','degree','period','description','logo','published']
 };
 const pick=(item,keys)=>Object.fromEntries(keys.filter(key=>Object.hasOwn(item||{},key)).map(key=>[key,clone(item[key])]));
 const output={};
 for(const key of ['site','profile','socials']) output[key]=pick(src[key],allowed[key]);
 output.profile.highlights=(Array.isArray(src.profile?.highlights)?src.profile.highlights:[]).map(item=>pick(item,['label','value']));
 for(const key of ['projects','experiences','skills','achievements','certifications','education']) output[key]=(src[key]||[]).filter(item=>item&&item.published!==false).map(item=>pick(item,allowed[key]));
 return output;
}
const countHidden=src=>['projects','experiences','skills','achievements','certifications','education'].reduce((count,key)=>count+(src[key]||[]).filter(x=>x?.published===false).length,0);
function repoFromForm(){const owner=$('#repo-owner')?.value.trim()||'',repo=$('#repo-name')?.value.trim()||'',branch=$('#repo-branch')?.value.trim()||'main';if(!/^[a-zA-Z0-9-]{1,39}$/.test(owner)||! /^[a-zA-Z0-9._-]{1,100}$/.test(repo)||! /^[a-zA-Z0-9._/-]{1,150}$/.test(branch)||branch.includes('..')||branch.startsWith('/')||branch.endsWith('/'))throw Error('Enter valid GitHub owner, repository, and branch names.');return {owner,repo,branch};}
const repoURL=(path='data/portfolio.json')=>`https://api.github.com/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
async function api(url,method='GET',body){if(!token)throw Error('Connect your GitHub token first.');const r=await fetch(url,{method,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});let data;try{data=await r.json();}catch{data={}}if(!r.ok)throw Error(`GitHub ${r.status}: ${data.message||'Request failed. Please check your token, repository permission, and branch.'}`);return data;}
function base64Unicode(str){const bytes=new TextEncoder().encode(str);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
// GitHub token vault: AES-256-GCM, random IV & salt, PBKDF2 key derivation.
// No password, key or raw token is stored in localStorage. Users must unlock after refresh.
const enc=new TextEncoder(), dec=new TextDecoder();
const bytesToBase64=bytes=>{let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result);};
const base64ToBytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function vaultKey(passphrase,salt,iterations){
 if(!crypto?.subtle)throw Error('Encrypted vault needs HTTPS or localhost.');
 const keyMaterial=await crypto.subtle.importKey('raw',enc.encode(passphrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},keyMaterial,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function storeVault(passphrase,value,config){
 if(passphrase.length<12)throw Error('Use a vault passphrase with at least 12 characters.');
 const salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12)), iterations=350000;
 const key=await vaultKey(passphrase,salt,iterations);
 const payload=enc.encode(JSON.stringify({token:value,config}));
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,payload);
 localStorage.setItem(STORAGE_VAULT,JSON.stringify({v:1,kdf:'PBKDF2-SHA256',iterations,salt:bytesToBase64(salt),iv:bytesToBase64(iv),ciphertext:bytesToBase64(new Uint8Array(cipher))}));
}
async function decryptVault(passphrase){
 const raw=localStorage.getItem(STORAGE_VAULT);if(!raw)throw Error('No saved encrypted token on this device.');
 const v=JSON.parse(raw);
 if(v.v!==1||v.iterations!==350000)throw Error('Unsupported saved token format. Forget it and connect again.');
 const key=await vaultKey(passphrase,base64ToBytes(v.salt),v.iterations);
 let clear;
 try{clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(v.iv)},key,base64ToBytes(v.ciphertext));}
 catch{throw Error('Incorrect vault passphrase or corrupted saved token.');}
 const decoded=JSON.parse(dec.decode(clear));
 if(!decoded.token||!decoded.config)throw Error('Invalid saved token data.');
 return decoded;
}
async function verifyGitHub(config){
 repoConfig=config;
 const user=await api('https://api.github.com/user');
 const repo=await api(`https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`);
 if(repo.permissions&&repo.permissions.push===false)throw Error('This token does not have push access to the repository.');
 const file=await api(repoURL()+`?ref=${encodeURIComponent(config.branch)}`);
 connectedSha=file.sha;
 githubLogin=user.login||'GitHub user';
 localStorage.setItem(STORAGE_REPO,JSON.stringify(repoConfig));
}
async function connectGitHub(){
 const button=document.querySelector('[data-action=connect]');
 try{
  const config=repoFromForm(), candidate=$('#repo-token').value.trim(), passphrase=$('#vault-passphrase').value;
  if(candidate)token=candidate;
  if(!token)throw Error('Enter your GitHub token, or use Unlock saved token.');
  if(passphrase && passphrase.length<12)throw Error('Use a vault passphrase of at least 12 characters.');
  button.disabled=true;button.textContent='Connecting…';
  await verifyGitHub(config);
  if(passphrase)await storeVault(passphrase,token,config);
  toast(`Connected as ${githubLogin}.${passphrase?' Token encrypted and saved on this device.':' Token kept for this tab only.'}`);
  navTo('publish');
 }catch(e){githubLogin='';connectedSha='';token='';toast(e.message);if(button){button.disabled=false;button.textContent='⌁ Test & connect';}}
}
async function unlockSavedToken(){
 const button=document.querySelector('[data-action=unlock-token]');
 try{
  const passphrase=$('#vault-passphrase')?.value||'';
  if(!passphrase)throw Error('Enter your vault passphrase to unlock the saved token.');
  button.disabled=true;button.textContent='Unlocking…';
  const saved=await decryptVault(passphrase);
  token=saved.token;
  await verifyGitHub(saved.config);
  toast(`Saved token unlocked. Connected as ${githubLogin}.`);
  navTo('publish');
 }catch(e){token='';githubLogin='';connectedSha='';toast(e.message);if(button){button.disabled=false;button.textContent='↳ Unlock saved token';}}
}
async function publishJSON(){
 const button=document.querySelector('[data-action=publish-json]');
 try{
  if(!githubLogin||!token){navTo('publish');throw Error('Unlock or connect your GitHub token first.');}
  const inputConfig=repoFromForm();if(JSON.stringify(inputConfig)!==JSON.stringify(repoConfig))throw Error('Repository settings changed. Please connect again.');
  if(!validateData(draft))throw Error('Portfolio JSON is missing required fields.');
  const publicData=publicPortfolio(draft), currentPublic=publicPortfolio(original);
  if(JSON.stringify(publicData)===JSON.stringify(currentPublic)){toast('No changes to public content. No commit or deployment needed.');return;}
  button.disabled=true;button.textContent='Publishing one commit…';
  const base=`https://api.github.com/repos/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}`;
  const branchPath=repoConfig.branch.split('/').map(encodeURIComponent).join('/');
  const refPath=`${base}/git/ref/heads/${branchPath}`;
  const branchRef=await api(refPath);
  const parentSHA=branchRef.object.sha;
  const parent=await api(`${base}/git/commits/${encodeURIComponent(parentSHA)}`);
  const json=JSON.stringify(publicData,null,2)+'\n';
  const tree=await api(`${base}/git/trees`,'POST',{base_tree:parent.tree.sha,tree:[
   {path:'data/portfolio.json',mode:'100644',type:'blob',content:json},
   {path:'data/portfolio-fallback.js',mode:'100644',type:'blob',content:offlineSnapshotContent(publicData)}
  ]});
  const commit=await api(`${base}/git/commits`,'POST',{message:'cms: publish portfolio and offline snapshot',tree:tree.sha,parents:[parentSHA]});
  try{await api(`${base}/git/refs/heads/${branchPath}`,'PATCH',{sha:commit.sha,force:false});}
  catch(error){throw Error('Could not update GitHub branch (perhaps someone committed concurrently). Reload published data and retry. '+error.message);}
  // Successful atomic update: both public files are in ONE commit / ONE Pages deployment.
  original=clone(draft);
  const hiddenCount=countHidden(draft);
  if(hiddenCount){localStorage.setItem(STORAGE_DRAFT,JSON.stringify(draft));stateDirty=true;}
  else{localStorage.removeItem(STORAGE_DRAFT);stateDirty=false;}
  $('#draft-status').textContent=hiddenCount?'● Published; hidden drafts kept locally':'● Published to GitHub';
  $('#draft-status').classList.add('saved');
  $('#publish-result').innerHTML=`<div class="published-state">✓ Published 2 public data files in <strong>one Git commit</strong> as ${esc(githubLogin)}. Only GitHub Pages controls production deployment duration. ${hiddenCount?' '+hiddenCount+' hidden entries kept in local browser only.':''} <a href="https://github.com/${encodeURIComponent(repoConfig.owner)}/${encodeURIComponent(repoConfig.repo)}/commit/${encodeURIComponent(commit.sha)}" target="_blank" rel="noopener noreferrer">View commit ↗</a></div>`;
  toast('One Git commit created. Production updates after GitHub Pages deploys.');
 }catch(e){toast(e.message);}finally{if(button){button.disabled=false;button.textContent='↑ Publish changes (one commit)';}}
}
async function uploadImage(){const input=$('#media-file');const file=input?.files?.[0];if(!file){toast('Choose an image first.');return;}if(!token||!githubLogin){toast('Connect to GitHub from GitHub & Publish first.');return;}const permitted=['image/png','image/jpeg','image/webp','image/gif','image/svg+xml'];if(!permitted.includes(file.type)||file.size>2*1024*1024){toast('Please choose a PNG, JPG, WEBP, GIF, or SVG image up to 2 MB.');return;}
const normalized=file.name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9_.-]/g,'-').replace(/-+/g,'-').slice(-80);const path=`assets/uploads/${Date.now()}-${normalized}`;const button=document.querySelector('[data-action=upload]');try{button.disabled=true;button.textContent='Uploading…';const arr=await file.arrayBuffer();let bin='';const bytes=new Uint8Array(arr);for(let i=0;i<bytes.length;i+=8192)bin+=String.fromCharCode(...bytes.subarray(i,i+8192));await api(repoURL(path),'PUT',{message:`cms: upload ${normalized}`,content:btoa(bin),branch:repoConfig.branch});$('#media-result').textContent=path;await navigator.clipboard?.writeText(path).catch(()=>{});toast('Image uploaded! Path shown below and copied when available.');}catch(e){toast(e.message)}finally{button.disabled=false;button.textContent='↑ Upload to repository';}}
$('#sidebar-nav').addEventListener('click',e=>{const b=e.target.closest('[data-section]');if(b)navTo(b.dataset.section);});
$('#cms-content').addEventListener('input',onField);$('#cms-content').addEventListener('change',onField);
$('#cms-content').addEventListener('click',e=>{const go=e.target.closest('[data-go]');if(go){navTo(go.dataset.go);return;}const copy=e.target.closest('[data-copy]');if(copy){navigator.clipboard?.writeText(copy.dataset.copy).then(()=>toast('Path copied to clipboard.')).catch(()=>toast(copy.dataset.copy));return;}const b=e.target.closest('[data-action]');if(b)handleAction(b);});
$('#section-action').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)handleAction(b);});
$('#preview-button').addEventListener('click',openPreview);$('#top-publish').addEventListener('click',()=>navTo('publish'));
$('#close-preview').addEventListener('click',closePreview);$('#refresh-preview').addEventListener('click',sendPreview);
window.addEventListener('message',e=>{if((location.protocol==='file:' ? e.origin==='null' : e.origin===location.origin)&&e.source===$('#preview-frame').contentWindow&&e.data?.type==='XANDER_SITE_READY')sendPreview();});
$('#preview-overlay').addEventListener('click',e=>{if(e.target.id==='preview-overlay')closePreview();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closePreview();});
$('#sidebar-trigger').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#logout-button').addEventListener('click',()=>{if(stateDirty&&!confirm('Your unpublished draft is saved in this browser. Sign out?'))return;token='';githubLogin='';connectedSha='';sessionStorage.removeItem('xander_cms_session');location.replace('Sign-In.html');});
$('#import-json-input').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const json=JSON.parse(await file.text());if(!validateData(json))throw Error('Invalid portfolio JSON. Expected site, profile, and content arrays.');if(!confirm('Replace the current local draft with this imported JSON?'))return;draft=json;saveDraft();navTo(section);toast('JSON imported successfully. Preview and publish when ready.');}catch(err){toast(err.message);}finally{e.target.value='';}});
(async()=>{try{const data=await readPortfolioSource();original=clone(data);draft=clone(data);const local=localStorage.getItem(STORAGE_DRAFT);if(local){try{const saved=JSON.parse(local);if(validateData(saved)&&confirm('An unpublished CMS draft exists in this browser. Restore it?')){draft=saved;stateDirty=true;}else localStorage.removeItem(STORAGE_DRAFT);}catch{localStorage.removeItem(STORAGE_DRAFT);}}navTo('dashboard');}catch(error){$('#cms-content').innerHTML=`<div class="hint-box warning">Unable to load portfolio data: ${esc(error.message)}. Check data/portfolio.json and data/portfolio-fallback.js.</div>`;toast('Could not load portfolio data.');}})();
