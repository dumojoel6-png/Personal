const SERVICES=[
 {k:"IT",t:"Wi-Fi and network",d:"Can't connect, slow connection, or eduroam won't sign in.",m:"Usually fixed same day"},
 {k:"Pw",t:"Accounts and passwords",d:"Reset a password, unlock your account or set up two-step sign-in.",m:"Often fixed in minutes"},
 {k:"Pt",t:"Student portal",d:"Course registration, results, missing units or portal errors.",m:"1 working day"},
 {k:"ID",t:"ID cards",d:"Lost, damaged or first-time student and staff ID cards.",m:"2–3 working days"},
 {k:"Fe",t:"Fees and payments",d:"Payment not showing, receipts, balances and clearance.",m:"1–2 working days"},
 {k:"Ac",t:"Academic records",d:"Transcripts, timetables, exam clashes and letters.",m:"3 working days"},
 {k:"Fa",t:"Facilities",d:"Broken projector, lights, locks or booking a room.",m:"1–2 working days"},
 {k:"LF",t:"Lost and found",d:"Report a lost item or check what has been handed in.",m:"Check at the desk"}
];
const FAQ=[
 ["How do I reset my student portal password?","Open the portal sign-in page and choose Forgot password. A reset link goes to your personal email on file. If you no longer have access to that email, bring your ID to the desk and we will verify you in person."],
 ["The campus Wi-Fi connects but has no internet.","Forget the network, reconnect, and sign in again with your student account. If it still fails, note the building and room and send a ticket so we can check that access point."],
 ["I lost my student ID card. What now?","Report it in a ticket or at the desk so the old card is blocked. A replacement takes 2 to 3 working days after the replacement fee is paid and the receipt is shown."],
 ["I paid my fees but the portal still shows a balance.","Payments can take up to 24 hours to appear. After that, send a ticket with your payment reference and a photo of the receipt."],
 ["How do I get a transcript or a recommendation letter?","Request it through a ticket under Academic records. Transcripts take about 3 working days, and you must have no fee balance."],
 ["Can I get help outside desk hours?","Yes. Submit a ticket at any time and we will reply on the next working day. For emergencies, call campus security."],
 ["How do I book a room or projector?","Choose Facilities when you submit a ticket, name the room, date and time, and we will confirm by email."]
];
const $=id=>document.getElementById(id);

// services + category list
const cats=SERVICES.map(s=>s.t).concat("Something else");
$("cat").innerHTML=cats.map(c=>`<option>${c}</option>`).join("");
$("services-grid").innerHTML=SERVICES.map((s,i)=>`
  <div class="card"><div class="tag" aria-hidden="true">${s.k}</div><h3>${s.t}</h3><p>${s.d}</p>
  <div class="meta">${s.m}</div>
  <button class="btn alt" type="button" data-i="${i}">Start a ticket</button></div>`).join("");
$("services-grid").addEventListener("click",e=>{
  const b=e.target.closest("button[data-i]"); if(!b) return;
  $("cat").value=SERVICES[+b.dataset.i].t;
  $("ticket").scrollIntoView(); $("name").focus();
});

// open / closed
function deskStatus(){
  const n=new Date(), d=n.getDay(), m=n.getHours()*60+n.getMinutes();
  let o=0,c=0;
  if(d>=1&&d<=5){o=480;c=1020} else if(d===6){o=540;c=780}
  const open=c&&m>=o&&m<c, p=$("pill");
  p.className="pill"+(open?" open":"");
  p.textContent=open?"Open now":"Closed now";
}
deskStatus(); setInterval(deskStatus,60000);

// FAQ + search
function esc(s){return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function renderFaq(q){
  q=(q||"").trim().toLowerCase();
  const list=FAQ.filter(([a,b])=>!q||(a+" "+b).toLowerCase().includes(q));
  $("faqlist").innerHTML=list.map(([a,b])=>`<details><summary>${esc(a)}</summary><p>${esc(b)}</p></details>`).join("");
  $("nores").style.display=list.length?"none":"block";
  $("faqsub").textContent=q?`${list.length} answer${list.length===1?"":"s"} for "${q}"`:"Most questions are covered here.";
}
renderFaq();
$("searchForm").addEventListener("submit",e=>{e.preventDefault();renderFaq($("q").value);$("faq").scrollIntoView()});
$("q").addEventListener("input",()=>renderFaq($("q").value));

// tickets (browser-only demo)
const KEY="helpdesk-tickets";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}
let tickets=load();
function showMine(){
  $("mine").innerHTML=tickets.slice().reverse().slice(0,4).map(t=>`
    <div class="ticket"><span class="st">${t.status}</span><b>${t.id}</b>
    <small>${esc(t.cat)} · ${new Date(t.at).toLocaleDateString()}</small></div>`).join("");
}
showMine();
$("tform").addEventListener("submit",e=>{
  e.preventDefault();
  const m=$("tmsg"), v=id=>$(id).value.trim();
  const bad=!v("name")||!v("sid")||!/^\S+@\S+\.\S+$/.test(v("email"))||v("desc").length<10;
  if(bad){m.className="msg err";m.textContent="Please fill in your name, ID, a valid email, and at least a sentence describing the problem.";return}
  const id="HD-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*9000)+1000);
  tickets.push({id,cat:v("cat"),status:"Received",at:Date.now()}); save(tickets);
  m.className="msg ok"; m.textContent=`Ticket ${id} received. Keep this number to track it.`;
  $("tform").reset(); showMine();
});
$("trackform").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("tid").value.trim().toUpperCase(), m=$("trmsg"), t=tickets.find(x=>x.id===id);
  if(t){m.className="msg ok";m.textContent=`${t.id}: ${t.status}. Category: ${t.cat}.`}
  else{m.className="msg err";m.textContent="No ticket with that number was found. Check it and try again."}
});