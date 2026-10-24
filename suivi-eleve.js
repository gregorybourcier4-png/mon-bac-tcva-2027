(function(){
'use strict';
const $=id=>document.getElementById(id), KEY='tcva_student_link_v11';
const url=new URL(location.href), fromUrl=url.searchParams.get('eleve');
if(fromUrl&&/^[a-f0-9]{48}$/.test(fromUrl)){localStorage.setItem(KEY,fromUrl);url.searchParams.delete('eleve');history.replaceState(null,'',url.toString());}
const token=localStorage.getItem(KEY)||'';let busy=false;
const status=t=>{$('studentSyncStatus').textContent=t};
const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return {}}};
const fields=['studentFirst','studentLast'];
fields.forEach((f,i)=>{$(f).value=localStorage.getItem('tcva_'+f)||''});
function payload(){const ex=get('tcva_training_scores_v6'),courses=get('tcva_courses_studied_v10'),e5=get('tcva_e5_v9_answers');const topics={};
Object.entries(ex).forEach(([k,v])=>{if(!/^\d+-\d+$/.test(k)||!v?.done)return;const chapter=Number(k.split('-')[0]);if(!topics[chapter])topics[chapter]={attempted:0,correct:0};topics[chapter].attempted++;if(v.good)topics[chapter].correct++});
const nc=Object.values(courses).filter(Boolean).length,ne=Object.values(ex).filter(v=>v&&v.done).length,n5=Object.values(e5).filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').length;
return {token,first:$('studentFirst').value.trim(),last:$('studentLast').value.trim(),courses:Math.min(8,nc),exercises:Math.min(320,ne),e5:Math.min(20,n5),progress:Math.round(100*(Math.min(8,nc)+Math.min(320,ne)+Math.min(20,n5))/348),topics,clientTime:new Date().toISOString()};}
async function sync(){if(busy)return;const endpoint=window.TCVA_SYNC_ENDPOINT;if(!endpoint){status('Suivi local uniquement : le lycée doit encore configurer la synchronisation.');return}if(!token){status('Ouvre ton lien personnel fourni par ton enseignant pour activer le suivi.');return}const p=payload();if(!p.first||!p.last){status('Renseigne ton prénom et ton nom.');return}busy=true;status('Envoi en cours…');try{const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p),redirect:'follow'});const json=await res.json();if(!json.ok)throw Error(json.error||'Réponse invalide');status('✓ Progression envoyée au professeur : '+p.progress+' % · '+new Date().toLocaleTimeString('fr-FR'));localStorage.setItem('tcva_last_sync_v11',new Date().toISOString())}catch(e){status('Synchronisation impossible. Ton travail reste enregistré sur cet appareil. Vérifie le lien et la connexion.')}finally{busy=false}}
$('studentConnect').onclick=()=>{fields.forEach(f=>localStorage.setItem('tcva_'+f,$(f).value.trim()));if(!token){status('Nom enregistré localement. Pour activer le suivi distant, utilise ton lien personnel.')}else{status('Identité renseignée. Envoi de la progression…');sync()}};
$('studentSync').onclick=sync;
if(token)status('Lien personnel reconnu. Renseigne ton identité, puis active le suivi.');
let timer;function queue(){if(!token||!window.TCVA_SYNC_ENDPOINT)return;clearTimeout(timer);timer=setTimeout(()=>{if($('studentFirst').value&&$('studentLast').value)sync()},2500)};
window.addEventListener('storage',queue);document.addEventListener('click',queue);document.addEventListener('change',queue);window.addEventListener('pageshow',queue);
})();
