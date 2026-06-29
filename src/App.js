import { useState, useRef, useEffect, useCallback } from "react";

const ORANGE = "#ff5a00";
const DARK   = "#0d0d0d";
const GRAY   = "#f4f5f7";
const BORDER = "#dde0e5";

const STEPS_REVISION = ["Réception","Entretien","Pneumatiques","Freinage","Fluides","Éclairage","Sous-véhicule","Récap"];
const STEPS_RECEPTION = ["Client / Véhicule","Carrosserie","Équipements","Récap"];

// ─── HELPERS COMMUNS ───────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder="", type="text", half=false }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, flex: half ? "0 0 calc(50% - 6px)" : "1 1 100%" }}>
      <label style={{ fontSize:11, fontWeight:700, color:"#666", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ padding:"10px 12px", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:14, background:"#fff", outline:"none", width:"100%", fontFamily:"inherit", color:DARK, boxSizing:"border-box" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER} />
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ background:DARK, color:"#fff", padding:"8px 14px", borderRadius:8, fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:8, marginBottom:10, letterSpacing:0.3 }}>
      <span>{icon}</span> {title}
    </div>
  );
}

function RadioRow({ label, name, value, onChange, options }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", borderBottom:`1px solid ${BORDER}`, gap:8 }}>
      <span style={{ fontSize:12.5, flex:1, color:DARK }}>{label}</span>
      <div style={{ display:"flex", gap:6 }}>
        {options.map(opt => (
          <label key={opt.val} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer" }}>
            <input type="radio" name={name} value={opt.val} checked={value===opt.val} onChange={()=>onChange(opt.val)} style={{ accentColor:ORANGE, width:16, height:16 }} />
            <span style={{ fontSize:9, color:value===opt.val?ORANGE:"#888", fontWeight:700 }}>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderBottom:`1px solid ${BORDER}`, cursor:"pointer" }}>
      <div onClick={()=>onChange(!checked)} style={{ width:20, height:20, borderRadius:5, border:`2px solid ${checked?ORANGE:BORDER}`, background:checked?ORANGE:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
        {checked && <span style={{ color:"#fff", fontSize:13, lineHeight:1 }}>✓</span>}
      </div>
      <span style={{ fontSize:12.5, color:DARK }}>{label}</span>
    </label>
  );
}

function SignatureCanvas({ label, canvasRef }) {
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const getPos = (e, canvas) => { const rect=canvas.getBoundingClientRect(); const src=e.touches?e.touches[0]:e; return { x:src.clientX-rect.left, y:src.clientY-rect.top }; };
  const start = useCallback((e) => { drawing.current=true; const canvas=canvasRef.current; lastPos.current=getPos(e,canvas); if(e.touches)e.preventDefault(); }, [canvasRef]);
  const move = useCallback((e) => { if(!drawing.current)return; const canvas=canvasRef.current; const ctx=canvas.getContext("2d"); const pos=getPos(e,canvas); ctx.beginPath(); ctx.moveTo(lastPos.current.x,lastPos.current.y); ctx.lineTo(pos.x,pos.y); ctx.strokeStyle="#000"; ctx.lineWidth=2.5; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.stroke(); lastPos.current=pos; if(e.touches)e.preventDefault(); }, [canvasRef]);
  const stop = useCallback(() => { drawing.current=false; }, []);
  const clear = () => { const canvas=canvasRef.current; canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height); };
  useEffect(() => { const canvas=canvasRef.current; if(!canvas)return; canvas.width=canvas.offsetWidth; canvas.height=80; }, [canvasRef]);
  return (
    <div style={{ flex:1 }}>
      <div style={{ background:ORANGE, color:"#fff", fontSize:11, fontWeight:700, padding:"5px 10px", borderRadius:"8px 8px 0 0", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</div>
      <canvas ref={canvasRef} style={{ width:"100%", height:80, background:"#fafafa", border:`1px solid ${BORDER}`, display:"block", touchAction:"none" }}
        onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={move} onTouchEnd={stop} />
      <button onClick={clear} style={{ background:"#555", color:"#fff", border:"none", padding:"4px 10px", fontSize:10, borderRadius:"0 0 8px 8px", cursor:"pointer", width:"100%" }}>Effacer</button>
    </div>
  );
}

// ─── MODULE RÉCEPTION VÉHICULE ─────────────────────────────────────────────────

const VOYANTS = [
  ["moteur","⚠️ Moteur (MIL)"],["huile","🛢️ Pression Huile"],["temp","🌡️ Température"],
  ["batterie","🔋 Batterie / Charge"],["abs","🅱️ ABS"],["esp","🔄 ESP / Stabilité"],
  ["airbag","💥 Airbag"],["dirass","🔧 Direction Assistée"],["pneu","⭕ Pression Pneus (TPMS)"],
  ["prechauff","🔌 Préchauffage (Diesel)"],["fap","🌫️ FAP / Filtre à particules"],["adblue","💧 AdBlue"],
  ["frein","🎯 Liquide de frein"],["servofrei","🔴 Frein à main électrique"],["autre","❓ Autre voyant"]
];

const EQUIPEMENTS = [
  ["carteGrise","Carte grise"],["controleTech","Contrôle technique"],["clesDouble","Clé(s) / Double"],
  ["radioCode","Code autoradio"],["coffre","Clé coffre / Trappe"],["roueSecours","Roue de secours"],
  ["gilet","Gilet / Triangle"],["cric","Cric + Clé de roue"],["manuelUtilisateur","Manuel utilisateur"],
  ["tapis","Tapis de sol"],["antenne","Antenne de toit"],["barresRoof","Barres de toit"]
];

const ZONES_CARROSSERIE = [
  { id:"av_g",    label:"Avant G.",   x:12,  y:38,  w:14, h:22 },
  { id:"av_c",    label:"Avant",      x:28,  y:25,  w:44, h:18 },
  { id:"av_d",    label:"Avant D.",   x:74,  y:38,  w:14, h:22 },
  { id:"par_av_g",label:"Par. Av. G", x:12,  y:62,  w:14, h:16 },
  { id:"por_av_g",label:"Por. Av. G", x:12,  y:80,  w:14, h:28 },
  { id:"por_ar_g",label:"Por. Ar. G", x:12,  y:110, w:14, h:28 },
  { id:"par_ar_g",label:"Par. Ar. G", x:12,  y:140, w:14, h:16 },
  { id:"toit",    label:"Toit",       x:28,  y:45,  w:44, h:100 },
  { id:"par_av_d",label:"Par. Av. D", x:74,  y:62,  w:14, h:16 },
  { id:"por_av_d",label:"Por. Av. D", x:74,  y:80,  w:14, h:28 },
  { id:"por_ar_d",label:"Por. Ar. D", x:74,  y:110, w:14, h:28 },
  { id:"par_ar_d",label:"Par. Ar. D", x:74,  y:140, w:14, h:16 },
  { id:"ar_g",    label:"Arrière G.", x:12,  y:158, w:14, h:22 },
  { id:"ar_c",    label:"Arrière",    x:28,  y:167, w:44, h:18 },
  { id:"ar_d",    label:"Arrière D.", x:74,  y:158, w:14, h:22 },
  { id:"planch",  label:"Plancher",   x:28,  y:145, w:44, h:20 },
];

const ETAT_COLORS = { "": "#e0e0e0", "ok":"#4caf50", "rayon":"#ff9800", "choc":"#f44336", "manquant":"#9c27b0" };
const ETAT_LABELS = { "":"?", "ok":"OK", "rayon":"Rayure", "choc":"Choc", "manquant":"Manquant" };

function CarrosserieSchema({ zones, onToggle }) {
  const legende = Object.entries(ETAT_LABELS).filter(([k])=>k!=="");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Légende */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {legende.map(([k,v]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
            <div style={{ width:14, height:14, borderRadius:3, background:ETAT_COLORS[k] }} />
            <span>{v}</span>
          </div>
        ))}
      </div>
      {/* Schéma SVG vue de dessus */}
      <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${BORDER}`, padding:12, display:"flex", justifyContent:"center" }}>
        <svg viewBox="0 0 100 200" style={{ width:"100%", maxWidth:280 }}>
          {/* Carrosserie fond */}
          <rect x="26" y="23" width="48" height="162" rx="10" fill="#ddd" stroke="#aaa" strokeWidth="0.5"/>
          {/* Zones cliquables */}
          {ZONES_CARROSSERIE.map(z => (
            <g key={z.id} onClick={() => onToggle(z.id)} style={{ cursor:"pointer" }}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2"
                fill={ETAT_COLORS[zones[z.id]||""]} stroke="#fff" strokeWidth="0.8" opacity="0.9"/>
              {zones[z.id] && zones[z.id]!=="ok" && (
                <text x={z.x+z.w/2} y={z.y+z.h/2+3} textAnchor="middle" fontSize="5" fill="#fff" fontWeight="bold">
                  {zones[z.id]==="rayon"?"R":zones[z.id]==="choc"?"C":"M"}
                </text>
              )}
              {zones[z.id]==="ok" && (
                <text x={z.x+z.w/2} y={z.y+z.h/2+3} textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">✓</text>
              )}
            </g>
          ))}
          {/* Labels direction */}
          <text x="50" y="15" textAnchor="middle" fontSize="6" fill="#888" fontWeight="bold">AVANT</text>
          <text x="50" y="198" textAnchor="middle" fontSize="6" fill="#888" fontWeight="bold">ARRIÈRE</text>
          <text x="5" y="105" textAnchor="middle" fontSize="5" fill="#888" transform="rotate(-90,5,105)">GAUCHE</text>
          <text x="96" y="105" textAnchor="middle" fontSize="5" fill="#888" transform="rotate(90,96,105)">DROITE</text>
          {/* Vitres */}
          <rect x="27" y="44" width="46" height="16" rx="2" fill="#b3d9f7" opacity="0.7"/>
          <rect x="27" y="167" width="46" height="16" rx="2" fill="#b3d9f7" opacity="0.7"/>
          <rect x="13" y="82" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
          <rect x="74" y="82" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
          <rect x="13" y="112" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
          <rect x="74" y="112" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
          {/* Roues */}
          <rect x="17" y="48" width="9" height="14" rx="3" fill="#555"/>
          <rect x="74" y="48" width="9" height="14" rx="3" fill="#555"/>
          <rect x="17" y="146" width="9" height="14" rx="3" fill="#555"/>
          <rect x="74" y="146" width="9" height="14" rx="3" fill="#555"/>
        </svg>
      </div>
      {/* Sélecteur d'état - s'affiche quand on clique une zone */}
      <div style={{ background:"#f8f9fa", borderRadius:8, padding:10, border:`1px solid ${BORDER}` }}>
        <p style={{ fontSize:11, color:"#888", marginBottom:6, fontWeight:600 }}>APPUIE SUR UNE ZONE PUIS CHOISIS L'ÉTAT :</p>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {legende.map(([k,v]) => (
            <div key={k} style={{ padding:"5px 10px", borderRadius:6, background:ETAT_COLORS[k], color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}
              onClick={() => {
                const last = Object.keys(zones).find(id => zones[id] === "__selected__");
                if(last) onToggle(last, k);
              }}>
              {v}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Composant carrosserie simplifié avec sélection en 2 étapes
function CarrosserieEditor({ zones, setZones }) {
  const [selectedZone, setSelectedZone] = useState(null);

  const handleZoneClick = (id) => { setSelectedZone(id); };
  const handleEtatClick = (etat) => {
    if (selectedZone) {
      setZones({ ...zones, [selectedZone]: etat });
      setSelectedZone(null);
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Légende */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", padding:"8px 10px", background:"#f8f9fa", borderRadius:8, border:`1px solid ${BORDER}` }}>
        {Object.entries(ETAT_LABELS).filter(([k])=>k!=="").map(([k,v]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:ETAT_COLORS[k] }} />
            <span style={{ fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Zone sélectionnée */}
      {selectedZone && (
        <div style={{ background:ORANGE+"22", border:`2px solid ${ORANGE}`, borderRadius:10, padding:"10px 12px" }}>
          <p style={{ fontSize:12, fontWeight:700, color:ORANGE, marginBottom:8 }}>
            Zone sélectionnée : {ZONES_CARROSSERIE.find(z=>z.id===selectedZone)?.label}
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(ETAT_LABELS).filter(([k])=>k!=="").map(([k,v]) => (
              <button key={k} onClick={()=>handleEtatClick(k)}
                style={{ padding:"7px 14px", borderRadius:8, background:ETAT_COLORS[k], border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {v}
              </button>
            ))}
            <button onClick={()=>{ setZones({...zones,[selectedZone]:""}); setSelectedZone(null); }}
              style={{ padding:"7px 14px", borderRadius:8, background:"#ccc", border:"none", color:"#555", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* SVG Schéma */}
      <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${BORDER}`, padding:12, display:"flex", justifyContent:"center" }}>
        <svg viewBox="0 0 100 200" style={{ width:"100%", maxWidth:300 }}>
          <rect x="26" y="23" width="48" height="162" rx="10" fill="#ddd" stroke="#aaa" strokeWidth="0.5"/>
          {ZONES_CARROSSERIE.map(z => (
            <g key={z.id} onClick={()=>handleZoneClick(z.id)} style={{ cursor:"pointer" }}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2"
                fill={selectedZone===z.id ? ORANGE : ETAT_COLORS[zones[z.id]||""]}
                stroke={selectedZone===z.id?"#fff":"#fff"} strokeWidth="0.8" opacity="0.9"/>
              {zones[z.id]==="ok" && <text x={z.x+z.w/2} y={z.y+z.h/2+3} textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">✓</text>}
              {zones[z.id]==="rayon" && <text x={z.x+z.w/2} y={z.y+z.h/2+3} textAnchor="middle" fontSize="5" fill="#fff" fontWeight="bold">R</text>}
              {zones[z.id]==="choc" && <text x={z.x+z.w/2} y={z.y+z.h/2+3} textAnchor="middle" fontSize="5" fill="#fff" fontWeight="bold">C</text>}
              {zones[z.id]==="manquant" && <text x={z.x+z.w/2} y={z.y+z.h/2+3} textAnchor="middle" fontSize="5" fill="#fff" fontWeight="bold">M</text>}
            </g>
          ))}
          <text x="50" y="15" textAnchor="middle" fontSize="6" fill="#888" fontWeight="bold">AVANT</text>
          <text x="50" y="198" textAnchor="middle" fontSize="6" fill="#888" fontWeight="bold">ARRIÈRE</text>
          <text x="5" y="105" textAnchor="middle" fontSize="5" fill="#888" transform="rotate(-90,5,105)">G</text>
          <text x="96" y="105" textAnchor="middle" fontSize="5" fill="#888" transform="rotate(90,96,105)">D</text>
          <rect x="27" y="44" width="46" height="16" rx="2" fill="#b3d9f7" opacity="0.7"/>
          <rect x="27" y="167" width="46" height="16" rx="2" fill="#b3d9f7" opacity="0.7"/>
          <rect x="13" y="82" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
          <rect x="74" y="82" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
          <rect x="13" y="112" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
          <rect x="74" y="112" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
          <rect x="17" y="48" width="9" height="14" rx="3" fill="#555"/>
          <rect x="74" y="48" width="9" height="14" rx="3" fill="#555"/>
          <rect x="17" y="146" width="9" height="14" rx="3" fill="#555"/>
          <rect x="74" y="146" width="9" height="14" rx="3" fill="#555"/>
        </svg>
      </div>
      <p style={{ fontSize:11, color:"#888", textAlign:"center" }}>Appuie sur une zone du véhicule puis choisis l'état</p>
    </div>
  );
}

// Jauge carburant
function JaugeCarburant({ value, onChange }) {
  const niveaux = ["Vide","1/8","1/4","3/8","1/2","5/8","3/4","7/8","Plein"];
  return (
    <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, padding:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:13, fontWeight:700 }}>⛽ Niveau carburant</span>
        <span style={{ fontSize:14, fontWeight:900, color:ORANGE }}>{value || "—"}</span>
      </div>
      {/* Jauge visuelle */}
      <div style={{ position:"relative", height:32, background:"#f0f0f0", borderRadius:16, overflow:"hidden", marginBottom:12, border:`1px solid ${BORDER}` }}>
        <div style={{
          position:"absolute", left:0, top:0, height:"100%",
          width: value ? `${(niveaux.indexOf(value)/8)*100}%` : "0%",
          background: niveaux.indexOf(value) <= 1 ? "#e74c3c" : niveaux.indexOf(value) <= 3 ? "#f39c12" : "#27ae60",
          borderRadius:16, transition:"width 0.3s"
        }}/>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color: niveaux.indexOf(value) > 2 ? "#fff" : "#666" }}>
          {value || "Sélectionner"}
        </div>
      </div>
      {/* Boutons sélection */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(9,1fr)", gap:3 }}>
        {niveaux.map(n => (
          <button key={n} onClick={()=>onChange(n)} style={{
            padding:"6px 2px", fontSize:9, fontWeight:700, border:"none", borderRadius:6, cursor:"pointer",
            background: value===n ? ORANGE : "#f0f0f0",
            color: value===n ? "#fff" : "#555"
          }}>{n}</button>
        ))}
      </div>
    </div>
  );
}

// ─── ÉTAPES RÉCEPTION VÉHICULE ─────────────────────────────────────────────────
function RecepStep0({ data, set }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <SectionTitle icon="👤" title="Informations Client"/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
        <Field label="Nom / Prénom" value={data.client} onChange={v=>set("client",v)} placeholder="Jean Dupont"/>
        <Field label="Téléphone" value={data.tel} onChange={v=>set("tel",v)} placeholder="06 XX XX XX XX" half/>
        <Field label="Email" value={data.email} onChange={v=>set("email",v)} placeholder="client@mail.fr" half/>
      </div>

      <SectionTitle icon="🚗" title="Véhicule"/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
        <Field label="Immatriculation" value={data.immat} onChange={v=>set("immat",v)} placeholder="AA-123-AA" half/>
        <Field label="Marque / Modèle" value={data.marque} onChange={v=>set("marque",v)} placeholder="Renault Clio" half/>
        <Field label="Couleur" value={data.couleur} onChange={v=>set("couleur",v)} placeholder="Blanc" half/>
        <Field label="Kilométrage" value={data.km} onChange={v=>set("km",v)} placeholder="85 000 km" half/>
        <Field label="Date de réception" value={data.date} onChange={v=>set("date",v)} half/>
        <Field label="N° Bon" value={data.numBon} onChange={v=>set("numBon",v)} half/>
      </div>

      <JaugeCarburant value={data.carburant} onChange={v=>set("carburant",v)}/>

      <SectionTitle icon="📋" title="Motif de la prise en charge"/>
      <textarea value={data.motif} onChange={e=>set("motif",e.target.value)} placeholder="Décrivez la demande du client..."
        style={{ width:"100%", minHeight:80, padding:"10px 12px", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:DARK, background:"#fff" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>

      <SectionTitle icon="⚠️" title="Voyants allumés au tableau de bord"/>
      <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
        {VOYANTS.map(([key,label]) => (
          <CheckItem key={key} label={label} checked={!!data.voyants[key]} onChange={v=>set("voyants",{...data.voyants,[key]:v})}/>
        ))}
      </div>
      {data.voyants.autre && (
        <input value={data.voyantAutreDetail} onChange={e=>set("voyantAutreDetail",e.target.value)}
          placeholder="Précisez le voyant..."
          style={{ padding:"10px 12px", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:13, outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" }}
          onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
      )}
    </div>
  );
}

function RecepStep1({ data, set }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <SectionTitle icon="🚘" title="État de la carrosserie"/>
      <p style={{ fontSize:12, color:"#888", marginTop:-6 }}>Appuie sur chaque zone pour indiquer l'état</p>
      <CarrosserieEditor zones={data.carrosserie} setZones={v=>set("carrosserie",v)}/>
      <SectionTitle icon="📝" title="Observations carrosserie"/>
      <textarea value={data.obsCarrosserie} onChange={e=>set("obsCarrosserie",e.target.value)}
        placeholder="Rayures, chocs, dommages particuliers..."
        style={{ width:"100%", minHeight:70, padding:"10px 12px", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:DARK, background:"#fff" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
    </div>
  );
}

function RecepStep2({ data, set }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <SectionTitle icon="🔑" title="Équipements remis avec le véhicule"/>
      <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
        {EQUIPEMENTS.map(([key,label]) => (
          <CheckItem key={key} label={label} checked={!!data.equipements[key]} onChange={v=>set("equipements",{...data.equipements,[key]:v})}/>
        ))}
      </div>
      <SectionTitle icon="📝" title="Observations complémentaires"/>
      <textarea value={data.obsEquipements} onChange={e=>set("obsEquipements",e.target.value)}
        placeholder="Accessoires, valeur déclarée, demandes spéciales..."
        style={{ width:"100%", minHeight:70, padding:"10px 12px", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:DARK, background:"#fff" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
    </div>
  );
}

function RecepStep3({ data, set, sigTech, sigClient }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <SectionTitle icon="📋" title="Récapitulatif"/>
      <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, padding:14, display:"flex", flexDirection:"column", gap:8 }}>
        {[["Client",data.client],["Immat.",data.immat],["Véhicule",data.marque],["Couleur",data.couleur],["Kilométrage",data.km],["Carburant",data.carburant],["Date",data.date]].map(([l,v])=>
          <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13, borderBottom:`1px solid ${BORDER}`, paddingBottom:6 }}>
            <span style={{ fontWeight:700, color:"#666" }}>{l}</span>
            <span style={{ color:DARK, fontWeight:600 }}>{v||"—"}</span>
          </div>
        )}
        {/* Voyants */}
        <div style={{ fontSize:12, color:"#888", marginTop:4 }}>
          <span style={{ fontWeight:700, color:DARK }}>Voyants : </span>
          {Object.entries(data.voyants).filter(([,v])=>v).map(([k])=>VOYANTS.find(([id])=>id===k)?.[1]).filter(Boolean).join(", ") || "Aucun"}
        </div>
      </div>

      <SectionTitle icon="✍️" title="Signatures — Bon de réception"/>
      <p style={{ fontSize:12, color:"#888", marginTop:-6 }}>En signant, le client confirme l'état du véhicule décrit ci-dessus.</p>
      <div style={{ display:"flex", gap:12 }}>
        <SignatureCanvas label="Technicien" canvasRef={sigTech}/>
        <SignatureCanvas label="Client (Lu et approuvé)" canvasRef={sigClient}/>
      </div>
    </div>
  );
}

// ─── PDF RÉCEPTION ─────────────────────────────────────────────────────────────
function buildReceptionPDF(d, sigTechData, sigClientData) {
  const O = "#ff5a00", DK = "#0d0d0d";
  const checkVal = v => v ? `<span style="color:${O};font-weight:900;">✓</span>` : `<span style="color:#ddd;">☐</span>`;

  const voyantsList = Object.entries(d.voyants).filter(([,v])=>v)
    .map(([k]) => VOYANTS.find(([id])=>id===k)?.[1]).filter(Boolean);
  const equipList = Object.entries(d.equipements).filter(([,v])=>v)
    .map(([k]) => EQUIPEMENTS.find(([id])=>id===k)?.[1]).filter(Boolean);
  const equipNon = EQUIPEMENTS.filter(([k])=>!d.equipements[k]).map(([,l])=>l);

  const niveaux = ["Vide","1/8","1/4","3/8","1/2","5/8","3/4","7/8","Plein"];
  const pct = d.carburant ? (niveaux.indexOf(d.carburant)/8*100) : 0;
  const couleurJauge = pct <= 12 ? "#e74c3c" : pct <= 37 ? "#f39c12" : "#27ae60";

  // Générer zones carrosserie en SVG pour le PDF
  const svgCarrosserie = `<svg viewBox="0 0 100 200" style="width:180px;height:auto;">
    <rect x="26" y="23" width="48" height="162" rx="10" fill="#ddd" stroke="#aaa" stroke-width="0.5"/>
    ${ZONES_CARROSSERIE.map(z=>`
      <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="2"
        fill="${ETAT_COLORS[d.carrosserie[z.id]||""]}" stroke="#fff" stroke-width="0.8" opacity="0.9"/>
      ${d.carrosserie[z.id]==="ok"?`<text x="${z.x+z.w/2}" y="${z.y+z.h/2+3}" text-anchor="middle" font-size="6" fill="#fff" font-weight="bold">✓</text>`:""}
      ${d.carrosserie[z.id]==="rayon"?`<text x="${z.x+z.w/2}" y="${z.y+z.h/2+3}" text-anchor="middle" font-size="5" fill="#fff" font-weight="bold">R</text>`:""}
      ${d.carrosserie[z.id]==="choc"?`<text x="${z.x+z.w/2}" y="${z.y+z.h/2+3}" text-anchor="middle" font-size="5" fill="#fff" font-weight="bold">C</text>`:""}
      ${d.carrosserie[z.id]==="manquant"?`<text x="${z.x+z.w/2}" y="${z.y+z.h/2+3}" text-anchor="middle" font-size="5" fill="#fff" font-weight="bold">M</text>`:""}
    `).join("")}
    <text x="50" y="15" text-anchor="middle" font-size="6" fill="#888" font-weight="bold">AVANT</text>
    <text x="50" y="198" text-anchor="middle" font-size="6" fill="#888" font-weight="bold">ARRIÈRE</text>
    <rect x="27" y="44" width="46" height="16" rx="2" fill="#b3d9f7" opacity="0.7"/>
    <rect x="27" y="167" width="46" height="16" rx="2" fill="#b3d9f7" opacity="0.7"/>
    <rect x="13" y="82" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
    <rect x="74" y="82" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
    <rect x="13" y="112" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
    <rect x="74" y="112" width="13" height="24" rx="1" fill="#b3d9f7" opacity="0.7"/>
    <rect x="17" y="48" width="9" height="14" rx="3" fill="#555"/>
    <rect x="74" y="48" width="9" height="14" rx="3" fill="#555"/>
    <rect x="17" y="146" width="9" height="14" rx="3" fill="#555"/>
    <rect x="74" y="146" width="9" height="14" rx="3" fill="#555"/>
  </svg>`;

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{background:#fff;color:#1a1a1a;}
.page{width:210mm;min-height:297mm;padding:8px 14px;display:flex;flex-direction:column;gap:8px;}
.hdr{background:${DK};color:#fff;padding:7px 12px;border-radius:5px;}
.hdr-top{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid ${O};padding-bottom:5px;margin-bottom:4px;}
.logo-main{font-size:22px;font-weight:900;font-style:italic;letter-spacing:-1px;}
.logo-main span{color:${O};}
.logo-sub{font-size:8px;font-weight:700;letter-spacing:3px;color:#aaa;}
.hdr-title{font-size:17px;font-weight:900;text-transform:uppercase;text-align:center;}
.hdr-sub{color:${O};font-size:9px;font-weight:700;letter-spacing:2px;text-align:center;}
.bon-no{border:1.5px solid ${O};padding:3px 8px;border-radius:4px;font-size:10px;color:#fff;text-align:center;}
.bon-no strong{color:${O};font-size:13px;}
.contacts{display:flex;justify-content:space-between;font-size:9px;color:#ddd;margin-top:3px;flex-wrap:wrap;gap:2px;}
.contacts span{color:${O};margin-right:2px;}
.sec{background:${DK};color:#fff;padding:3px 8px;font-size:9.5px;font-weight:700;text-transform:uppercase;border-radius:4px;margin-bottom:5px;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.field label{font-size:8.5px;font-weight:700;color:#666;text-transform:uppercase;display:block;margin-bottom:2px;}
.field .val{padding:3px 6px;border:1px solid #dde0e5;border-radius:4px;font-size:11px;background:#fff;min-height:18px;}
.main-grid{display:grid;grid-template-columns:180px 1fr;gap:12px;}
.chk-item{display:flex;align-items:center;gap:4px;padding:2.5px 6px;border-bottom:1px solid #f0f0f0;font-size:9.5px;}
table{border-collapse:collapse;width:100%;font-size:9.5px;}
th{background:#eaedf1;font-weight:700;font-size:8.5px;padding:3px 5px;border:1px solid #ccc;text-align:left;text-transform:uppercase;}
td{padding:3px 5px;border:1px solid #ccc;}
.jauge-wrap{border:1px solid #dde0e5;border-radius:5px;overflow:hidden;margin-bottom:6px;}
.jauge-bar{height:18px;background:${couleurJauge};width:${pct}%;min-width:2px;display:flex;align-items:center;padding-left:6px;font-size:10px;font-weight:700;color:#fff;}
.sigs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px;}
.sig-box{border:1px dashed #ccc;border-radius:5px;overflow:hidden;}
.sig-head{background:${O};color:#fff;font-size:9px;font-weight:700;padding:3px;text-align:center;text-transform:uppercase;}
.sig-img{width:100%;height:55px;object-fit:contain;background:#fafafa;}
.sig-empty{width:100%;height:55px;background:#fafafa;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:10px;}
.footer{background:${DK};color:#fff;text-align:center;padding:5px;border-radius:4px;font-size:8.5px;margin-top:auto;}
.footer-tag{color:${O};font-weight:700;font-size:9.5px;margin-bottom:1px;}
.legende{display:flex;gap:8px;flex-wrap:wrap;font-size:8px;margin-bottom:4px;}
.legende-item{display:flex;align-items:center;gap:3px;}
.legende-dot{width:10px;height:10px;border-radius:2px;}
.mention{font-size:8px;color:#888;border-top:1px solid #dde0e5;padding-top:4px;margin-top:4px;}
@media print{@page{size:A4 portrait;margin:6mm;}body{margin:0;padding:0;}.page{width:100%;padding:0;}}
</style></head><body><div class="page">

<div class="hdr">
  <div class="hdr-top">
    <div><div class="logo-main">QM <span>GARAGE</span></div><div class="logo-sub">RÉPARATION AUTOMOBILE</div></div>
    <div><div class="hdr-title">Bon de Réception</div><div class="hdr-sub">— État du Véhicule à l'Entrée —</div></div>
    <div class="bon-no">N° <strong>${d.numBon}</strong></div>
  </div>
  <div class="contacts">
    <div><span>📞</span>06 61 02 55 54</div>
    <div><span>✉️</span>qm.garage45@gmail.com</div>
    <div><span>📸</span>@qm.garage</div>
    <div><span>📍</span>94 impasse de la fosse aux loups, 45210 Nargis</div>
  </div>
</div>

<!-- INFOS CLIENT + VÉHICULE -->
<div>
  <div class="sec">👤 Client & Véhicule</div>
  <div class="grid3" style="background:#f8f9fa;padding:8px;border:1px solid #dde0e5;border-radius:5px;">
    <div class="field"><label>Client</label><div class="val">${d.client||"—"}</div></div>
    <div class="field"><label>Téléphone</label><div class="val">${d.tel||"—"}</div></div>
    <div class="field"><label>Email</label><div class="val">${d.email||"—"}</div></div>
    <div class="field"><label>Immatriculation</label><div class="val">${d.immat||"—"}</div></div>
    <div class="field"><label>Marque / Modèle</label><div class="val">${d.marque||"—"}</div></div>
    <div class="field"><label>Couleur</label><div class="val">${d.couleur||"—"}</div></div>
    <div class="field"><label>Kilométrage</label><div class="val">${d.km||"—"}</div></div>
    <div class="field"><label>Date réception</label><div class="val">${d.date}</div></div>
    <div class="field"><label>Motif</label><div class="val">${d.motif||"—"}</div></div>
  </div>
</div>

<!-- CARBURANT -->
<div>
  <div class="sec">⛽ Niveau Carburant</div>
  <div style="border:1px solid #dde0e5;border-radius:5px;padding:6px;">
    <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px;">
      <span>Vide</span><span style="font-weight:700;color:${O}">${d.carburant||"—"}</span><span>Plein</span>
    </div>
    <div style="background:#f0f0f0;border-radius:8px;overflow:hidden;height:16px;">
      <div style="height:100%;width:${pct}%;background:${couleurJauge};border-radius:8px;"></div>
    </div>
  </div>
</div>

<!-- CARROSSERIE + VOYANTS + EQUIPEMENTS -->
<div class="grid2">
  <!-- Carrosserie -->
  <div>
    <div class="sec">🚘 État Carrosserie</div>
    <div class="legende">
      ${Object.entries(ETAT_LABELS).filter(([k])=>k!=="").map(([k,v])=>`<div class="legende-item"><div class="legende-dot" style="background:${ETAT_COLORS[k]}"></div><span>${v}</span></div>`).join("")}
    </div>
    <div style="display:flex;justify-content:center;border:1px solid #dde0e5;border-radius:5px;padding:6px;background:#f8f9fa;">
      ${svgCarrosserie}
    </div>
    ${d.obsCarrosserie?`<div style="font-size:9.5px;margin-top:5px;padding:5px;border:1px solid #dde0e5;border-radius:4px;color:#555;">${d.obsCarrosserie}</div>`:""}
  </div>

  <!-- Voyants + Équipements -->
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div>
      <div class="sec">⚠️ Voyants Allumés</div>
      ${voyantsList.length > 0
        ? `<div style="border:1px solid #dde0e5;border-radius:5px;overflow:hidden;">${voyantsList.map(v=>`<div class="chk-item"><span style="color:${O};font-weight:900;">⚠</span> ${v}</div>`).join("")}</div>`
        : `<div style="padding:8px;font-size:10px;color:#27ae60;font-weight:700;border:1px solid #dde0e5;border-radius:5px;">✓ Aucun voyant allumé</div>`
      }
    </div>
    <div>
      <div class="sec">🔑 Équipements Remis</div>
      <div style="border:1px solid #dde0e5;border-radius:5px;overflow:hidden;">
        ${EQUIPEMENTS.map(([k,label])=>`<div class="chk-item">${checkVal(d.equipements[k])} ${label}</div>`).join("")}
      </div>
    </div>
  </div>
</div>

${d.obsEquipements?`<div><div class="sec">📝 Observations</div><div style="font-size:10px;padding:5px;border:1px solid #dde0e5;border-radius:4px;">${d.obsEquipements}</div></div>`:""}

<!-- SIGNATURES -->
<div>
  <div class="sec">✍️ Signatures — Bon de Réception</div>
  <div class="sigs">
    <div class="sig-box"><div class="sig-head">Signature Technicien</div>${sigTechData?`<img class="sig-img" src="${sigTechData}"/>`:`<div class="sig-empty">Pas de signature</div>`}</div>
    <div class="sig-box"><div class="sig-head">Signature Client (Lu et approuvé)</div>${sigClientData?`<img class="sig-img" src="${sigClientData}"/>`:`<div class="sig-empty">Pas de signature</div>`}</div>
  </div>
  <div class="mention">Je soussigné(e) ${d.client||"_______________"} certifie avoir pris connaissance de l'état de mon véhicule tel que décrit ci-dessus et en accepte les termes.</div>
</div>

<div class="footer">
  <div class="footer-tag">QM GARAGE — ENTRETIEN • RÉPARATION • DIAGNOSTIC AUTOMOBILE</div>
  <div>Merci de votre confiance ! Laissez-nous votre avis 5 étoiles sur Google ★★★★★</div>
</div>
</div></body></html>`;
}

// ─── ÉTAT INITIAL ──────────────────────────────────────────────────────────────
const initRevision = () => ({
  numFiche:"00001", date:new Date().toLocaleDateString("fr-FR"),
  client:"", tel:"", email:"", immat:"", marque:"", km:"", technicien:"Quentin",
  motif:"", travaux:"", observations:"",
  entretien:{
    vidange:false,filtreHuile:false,filtreAir:false,filtreHabitacle:false,filtreCarbu:false,filtreGasoil:false,
    bougies:false,bougiesPrech:false,injecteurs:false,throttle:false,egr:false,fap:false,
    courroieAcc:false,remplaceCourroieAcc:false,distribution:false,distribChaine:false,pompeEau:false,thermostat:false,
    climRecharge:false,climFiltre:false,radiateurNett:false,courroieClim:false,
    diag:false,raz:false,parametrage:false,battRemplace:false,alternateur:false,
    huileBoite:false,huileTransfer:false,liquideFrein:false,bugiArret:false,adblue:false,geometrie:false,
  },
  pneus:{ ag:{usure:"",pression:""}, ad:{usure:"",pression:""}, rg:{usure:"",pression:""}, rd:{usure:"",pression:""}, pressionAjustee:"", roueSec:"" },
  freinage:{ plaqAv:"", disqAv:"", plaqAr:"", disqAr:"", freinMain:"" },
  fluides:{ huile:"", refroid:"", frein:"", direction:"", laveGlace:"", boiteVitesse:"", additif:"", clim:"" },
  eclairage:{ fxCrois:"", fxPos:"", cligno:"", fxStop:"", eg:"", batterie:"" },
  sousveh:{ amort:"", rotules:"", soufflets:"", echappe:"", fuite:"", plaques:"" }
});

const initReception = () => ({
  numBon:"R00001", date:new Date().toLocaleDateString("fr-FR"),
  client:"", tel:"", email:"", immat:"", marque:"", couleur:"", km:"",
  carburant:"", motif:"",
  voyants: Object.fromEntries(VOYANTS.map(([k])=>[k,false])),
  voyantAutreDetail:"",
  carrosserie: {},
  obsCarrosserie:"",
  equipements: Object.fromEntries(EQUIPEMENTS.map(([k])=>[k,false])),
  obsEquipements:""
});

// ─── ÉTAPES RÉVISION ──────────────────────────────────────────────────────────
function StepReception({ data, set }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <SectionTitle icon="👤" title="Informations Client"/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
        <Field label="Nom / Prénom" value={data.client} onChange={v=>set("client",v)} placeholder="Jean Dupont"/>
        <Field label="Téléphone" value={data.tel} onChange={v=>set("tel",v)} placeholder="06 XX XX XX XX" half/>
        <Field label="Email" value={data.email} onChange={v=>set("email",v)} placeholder="client@mail.fr" half/>
      </div>
      <SectionTitle icon="🚗" title="Véhicule"/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
        <Field label="Immatriculation" value={data.immat} onChange={v=>set("immat",v)} placeholder="AA-123-AA" half/>
        <Field label="Marque / Modèle" value={data.marque} onChange={v=>set("marque",v)} placeholder="Renault Clio" half/>
        <Field label="Kilométrage" value={data.km} onChange={v=>set("km",v)} placeholder="85 000 km" half/>
        <Field label="Technicien" value={data.technicien} onChange={v=>set("technicien",v)} placeholder="Quentin" half/>
        <Field label="Date" value={data.date} onChange={v=>set("date",v)} half/>
        <Field label="N° Fiche" value={data.numFiche} onChange={v=>set("numFiche",v)} half/>
      </div>
      <SectionTitle icon="📋" title="Motif d'intervention"/>
      <textarea value={data.motif} onChange={e=>set("motif",e.target.value)} placeholder="Décrivez le motif de la visite..."
        style={{ width:"100%", minHeight:80, padding:"10px 12px", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:DARK, background:"#fff" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
    </div>
  );
}

function StepEntretien({ data, set }) {
  const groups = [
    {icon:"🛢️",title:"Vidange & Filtres",items:[["vidange","Vidange Moteur effectuée"],["filtreHuile","Remplacement Filtre à Huile"],["filtreAir","Remplacement Filtre à Air"],["filtreHabitacle","Remplacement Filtre Habitacle"],["filtreCarbu","Remplacement Filtre Carburant"],["filtreGasoil","Remplacement Filtre Gasoil (Décanteur)"]]},
    {icon:"⚙️",title:"Allumage & Injection",items:[["bougies","Contrôle / Remplacement Bougies"],["bougiesPrech","Remplacement Bougies de Préchauffage"],["injecteurs","Nettoyage / Contrôle Injecteurs"],["throttle","Nettoyage Corps Papillon"],["egr","Nettoyage Vanne EGR"],["fap","Régénération / Nettoyage FAP/DPF"]]},
    {icon:"🔗",title:"Courroies & Distribution",items:[["courroieAcc","Contrôle Courroie Accessoire"],["remplaceCourroieAcc","Remplacement Courroie Accessoire + Galets"],["distribution","Remplacement Kit Distribution (Courroie)"],["distribChaine","Remplacement Kit Distribution (Chaîne)"],["pompeEau","Remplacement Pompe à Eau"],["thermostat","Remplacement Thermostat"]]},
    {icon:"💨",title:"Climatisation & Refroidissement",items:[["climRecharge","Recharge Climatisation (R1234yf / R134a)"],["climFiltre","Remplacement Filtre Déshydrateur Clim"],["radiateurNett","Nettoyage Radiateur"],["courroieClim","Contrôle Poulie Compresseur Clim"]]},
    {icon:"🔌",title:"Électronique & Diagnostic",items:[["diag","Lecture / Effacement Codes Défauts (OBD)"],["raz","Remise à zéro Service / Maintenance"],["parametrage","Paramétrage / Calibration électronique"],["battRemplace","Remplacement Batterie 12V"],["alternateur","Contrôle Alternateur / Démarreur"]]},
    {icon:"🧹",title:"Révision & Divers",items:[["huileBoite","Vidange Huile Boîte de Vitesse"],["huileTransfer","Vidange Huile Pont / Transfert"],["liquideFrein","Remplacement Liquide de Frein"],["bugiArret","Vérification Système Stop & Start"],["adblue","Appoint AdBlue / Urée"],["geometrie","Contrôle Géométrie / Parallélisme"]]}
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {groups.map(({ icon, title, items }) => (
        <div key={title}>
          <SectionTitle icon={icon} title={title}/>
          <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            {items.map(([key,label]) => (<CheckItem key={key} label={label} checked={!!data[key]} onChange={v=>set(key,v)}/>))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepPneus({ data, set }) {
  const positions = [["ag","Avant Gauche"],["ad","Avant Droit"],["rg","Arrière Gauche"],["rd","Arrière Droit"]];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <SectionTitle icon="⭕" title="Liaison au Sol & Pneus"/>
      <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px", background:GRAY, padding:"6px 10px", borderBottom:`1px solid ${BORDER}` }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase" }}>Position</span>
          <span style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", textAlign:"center" }}>Usure (mm)</span>
          <span style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", textAlign:"center" }}>Pression</span>
        </div>
        {positions.map(([key,label]) => (
          <div key={key} style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px", padding:"6px 10px", borderBottom:`1px solid ${BORDER}`, alignItems:"center" }}>
            <span style={{ fontSize:13 }}>{label}</span>
            <input value={data[key].usure} onChange={e=>set(key,{...data[key],usure:e.target.value})} placeholder="ex: 4"
              style={{ textAlign:"center", border:`1px solid ${BORDER}`, borderRadius:6, padding:"5px", fontSize:13, width:"100%", boxSizing:"border-box", fontFamily:"inherit" }}/>
            <input value={data[key].pression} onChange={e=>set(key,{...data[key],pression:e.target.value})} placeholder="2.2"
              style={{ textAlign:"center", border:`1px solid ${BORDER}`, borderRadius:6, padding:"5px", fontSize:13, width:"100%", boxSizing:"border-box", fontFamily:"inherit" }}/>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ flex:1, background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
          <RadioRow label="Pression ajustée" name="p_aj" value={data.pressionAjustee} onChange={v=>set("pressionAjustee",v)} options={[{val:"oui",label:"OUI"},{val:"non",label:"NON"}]}/>
        </div>
        <div style={{ flex:1, background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
          <RadioRow label="Roue de secours" name="r_sec" value={data.roueSec} onChange={v=>set("roueSec",v)} options={[{val:"ok",label:"OK"},{val:"nok",label:"NOK"}]}/>
        </div>
      </div>
    </div>
  );
}

function StepFreinage({ data, set }) {
  const items = [["plaqAv","Plaquettes AV"],["disqAv","Disques AV"],["plaqAr","Plaquettes AR"],["disqAr","Disques AR"],["freinMain","Frein à main"]];
  const opts = [{val:"bon",label:"BON"},{val:"moy",label:"MOY."},{val:"prev",label:"À PRÉVOIR"}];
  return (
    <div>
      <SectionTitle icon="🎯" title="Système de Freinage"/>
      <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
        {items.map(([key,label]) => (<RadioRow key={key} label={label} name={`fr_${key}`} value={data[key]} onChange={v=>set(key,v)} options={opts}/>))}
      </div>
    </div>
  );
}

function StepFluides({ data, set }) {
  const items = [["huile","Huile Moteur"],["refroid","Liquide Refroidissement"],["frein","Liquide de Frein"],["direction","Direction Assistée"],["laveGlace","Lave-Glace"],["boiteVitesse","Huile Boîte de Vitesse"],["additif","Additif / AdBlue (Urée)"],["clim","Fluide Climatisation"]];
  const opts = [{val:"ok",label:"OK"},{val:"appoint",label:"APPOINT"}];
  return (
    <div>
      <SectionTitle icon="💧" title="Niveaux, Fluides & Appoints"/>
      <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
        {items.map(([key,label]) => (<RadioRow key={key} label={label} name={`fl_${key}`} value={data[key]} onChange={v=>set(key,v)} options={opts}/>))}
      </div>
    </div>
  );
}

function StepEclairage({ data, set }) {
  const items = [["fxCrois","Feux Croisement / Route"],["fxPos","Feux de Position / Plaque"],["cligno","Clignotants & Warning"],["fxStop","Feux Stop & Recul"],["eg","Essuie-Glaces & Pare-Brise"],["batterie","État Batterie (Test de charge)"]];
  const opts = [{val:"ok",label:"OK"},{val:"nok",label:"NOK"}];
  return (
    <div>
      <SectionTitle icon="💡" title="Éclairage & Visibilité"/>
      <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
        {items.map(([key,label]) => (<RadioRow key={key} label={label} name={`ec_${key}`} value={data[key]} onChange={v=>set(key,v)} options={opts}/>))}
      </div>
    </div>
  );
}

function StepSousVeh({ data, set }) {
  const items = [["amort","Amortisseurs (Étanchéité)"],["rotules","Rotules & Trains (Jeu)"],["soufflets","Soufflets de Cardan / Direction"],["echappe","Ligne d'Échappement / FAP"],["fuite","Absence de Fuite Moteur / Boîte"],["plaques","Plaques de Protection Sous Bloc"]];
  const opts = [{val:"ok",label:"OK"},{val:"prev",label:"À PRÉVOIR"}];
  return (
    <div>
      <SectionTitle icon="🔍" title="Train Roulant & Sous Véhicule"/>
      <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
        {items.map(([key,label]) => (<RadioRow key={key} label={label} name={`sv_${key}`} value={data[key]} onChange={v=>set(key,v)} options={opts}/>))}
      </div>
    </div>
  );
}

function StepRecap({ data, set, sigTech, sigClient }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <SectionTitle icon="⚠️" title="Travaux urgents à prévoir"/>
      <textarea value={data.travaux} onChange={e=>set("travaux",e.target.value)} placeholder="Rien à signaler..."
        style={{ width:"100%", minHeight:70, padding:"10px 12px", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:DARK, background:"#fff" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
      <SectionTitle icon="📝" title="Observations & Recommandations"/>
      <textarea value={data.observations} onChange={e=>set("observations",e.target.value)} placeholder="Notes complémentaires..."
        style={{ width:"100%", minHeight:70, padding:"10px 12px", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:DARK, background:"#fff" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
      <SectionTitle icon="✍️" title="Signatures"/>
      <div style={{ display:"flex", gap:12 }}>
        <SignatureCanvas label="Technicien" canvasRef={sigTech}/>
        <SignatureCanvas label="Client (Bon pour accord)" canvasRef={sigClient}/>
      </div>
    </div>
  );
}

// ─── PDF RÉVISION ──────────────────────────────────────────────────────────────
function buildPDFHtml(d, sigTechData, sigClientData) {
  const O = "#ff5a00", DK = "#0d0d0d";
  const radioVal = (v, expected) => v === expected ? `<span style="color:${O};font-weight:900;font-size:14px;">●</span>` : `<span style="color:#ccc;font-size:14px;">○</span>`;
  const checkVal = (v) => v ? `<span style="color:${O};font-weight:900;">✓</span>` : `<span style="color:#ddd;">☐</span>`;
  const freins = [["plaqAv","Plaquettes AV"],["disqAv","Disques AV"],["plaqAr","Plaquettes AR"],["disqAr","Disques AR"],["freinMain","Frein à main"]];
  const fluides = [["huile","Huile Moteur"],["refroid","Liquide Refroidissement"],["frein","Liquide de Frein"],["direction","Direction Assistée"],["laveGlace","Lave-Glace"],["boiteVitesse","Huile Boîte"],["additif","Additif / AdBlue"],["clim","Fluide Climatisation"]];
  const eclairs = [["fxCrois","Feux Croisement/Route"],["fxPos","Feux Position/Plaque"],["cligno","Clignotants & Warning"],["fxStop","Feux Stop & Recul"],["eg","Essuie-Glaces"],["batterie","Batterie (Charge)"]];
  const sousveh = [["amort","Amortisseurs"],["rotules","Rotules & Trains"],["soufflets","Soufflets Cardan"],["echappe","Échappement / FAP"],["fuite","Fuites Moteur/Boîte"],["plaques","Plaques Protection"]];
  const pneuPos = [["ag","Avant Gauche"],["ad","Avant Droit"],["rg","Arrière Gauche"],["rd","Arrière Droit"]];
  const entretienGroups = [
    {title:"🛢️ Vidange & Filtres",items:[["vidange","Vidange Moteur"],["filtreHuile","Filtre à Huile"],["filtreAir","Filtre à Air"],["filtreHabitacle","Filtre Habitacle"],["filtreCarbu","Filtre Carburant"],["filtreGasoil","Filtre Gasoil"]]},
    {title:"⚙️ Allumage & Injection",items:[["bougies","Bougies"],["bougiesPrech","Bougies Préchauffage"],["injecteurs","Injecteurs"],["throttle","Corps Papillon"],["egr","Vanne EGR"],["fap","FAP/DPF"]]},
    {title:"🔗 Courroies & Distribution",items:[["courroieAcc","Courroie Acc. (ctrl)"],["remplaceCourroieAcc","Courroie Acc. + Galets"],["distribution","Kit Distribution Courroie"],["distribChaine","Kit Distribution Chaîne"],["pompeEau","Pompe à Eau"],["thermostat","Thermostat"]]},
    {title:"💨 Climatisation",items:[["climRecharge","Recharge Clim"],["climFiltre","Filtre Déshydrateur"],["radiateurNett","Nettoyage Radiateur"],["courroieClim","Poulie Compresseur"]]},
    {title:"🔌 Électronique",items:[["diag","Lecture Codes Défauts"],["raz","RAZ Maintenance"],["parametrage","Paramétrage Élec."],["battRemplace","Batterie 12V"],["alternateur","Alternateur/Démarreur"]]},
    {title:"🧹 Révision & Divers",items:[["huileBoite","Huile Boîte"],["huileTransfer","Huile Pont/Transfert"],["liquideFrein","Liquide de Frein"],["bugiArret","Stop & Start"],["adblue","AdBlue / Urée"],["geometrie","Géométrie"]]}
  ];
  const entretienCols = [[entretienGroups[0],entretienGroups[1]],[entretienGroups[2],entretienGroups[3]],[entretienGroups[4],entretienGroups[5]]];

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{background:#fff;color:#1a1a1a;}
.page{width:210mm;min-height:297mm;padding:8px 14px;display:flex;flex-direction:column;gap:7px;}
.hdr{background:${DK};color:#fff;padding:7px 12px;border-radius:5px;}
.hdr-top{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid ${O};padding-bottom:5px;margin-bottom:4px;}
.logo-main{font-size:22px;font-weight:900;font-style:italic;letter-spacing:-1px;}
.logo-main span{color:${O};}
.logo-sub{font-size:8px;font-weight:700;letter-spacing:3px;color:#aaa;}
.hdr-title{font-size:17px;font-weight:900;text-transform:uppercase;letter-spacing:1px;text-align:center;}
.hdr-sub{color:${O};font-size:9px;font-weight:700;letter-spacing:2px;text-align:center;}
.fiche-no{border:1.5px solid ${O};padding:3px 8px;border-radius:4px;font-size:10px;color:#fff;text-align:center;}
.fiche-no strong{color:${O};font-size:13px;}
.contacts{display:flex;justify-content:space-between;font-size:9px;color:#ddd;margin-top:3px;flex-wrap:wrap;gap:2px;}
.contacts span{color:${O};margin-right:2px;}
.grid-client{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;background:#f8f9fa;padding:7px;border:1px solid #dde0e5;border-radius:5px;}
.field label{font-size:8.5px;font-weight:700;color:#666;text-transform:uppercase;display:block;margin-bottom:2px;}
.field .val{padding:3px 5px;border:1px solid #dde0e5;border-radius:4px;font-size:10.5px;background:#fff;min-height:18px;}
.sec{background:${DK};color:#fff;padding:3px 7px;font-size:9.5px;font-weight:700;text-transform:uppercase;border-radius:4px;margin-bottom:4px;letter-spacing:0.3px;}
.entretien-wrap{border:1px solid #dde0e5;border-radius:5px;overflow:hidden;}
.entretien-cols{display:grid;grid-template-columns:1fr 1fr 1fr;}
.entretien-col{border-right:1px solid #dde0e5;}
.entretien-col:last-child{border-right:none;}
.grp-head{font-size:8px;font-weight:700;text-transform:uppercase;color:#fff;padding:3px 6px;background:#333;border-bottom:1px solid #555;}
.chk-item{display:flex;align-items:center;gap:4px;padding:2.5px 6px;border-bottom:1px solid #f0f0f0;font-size:9.5px;line-height:1.3;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;}
table{border-collapse:collapse;width:100%;font-size:9.5px;}
th{background:#eaedf1;font-weight:700;font-size:8.5px;text-transform:uppercase;padding:3px 4px;border:1px solid #ccc;text-align:left;}
td{padding:3px 4px;border:1px solid #ccc;font-size:9.5px;}
td.c{padding:3px 4px;border:1px solid #ccc;text-align:center;width:35px;}
.comments{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.comment-box{border:1px solid #dde0e5;border-radius:4px;padding:5px;min-height:42px;font-size:10.5px;color:#1a1a1a;white-space:pre-wrap;}
.sigs{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.sig-box{border:1px dashed #ccc;border-radius:5px;overflow:hidden;}
.sig-head{background:${O};color:#fff;font-size:9px;font-weight:700;padding:3px;text-align:center;text-transform:uppercase;}
.sig-img{width:100%;height:60px;object-fit:contain;background:#fafafa;}
.sig-empty{width:100%;height:60px;background:#fafafa;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:10px;}
.footer{background:${DK};color:#fff;text-align:center;padding:5px;border-radius:4px;font-size:8.5px;}
.footer-tag{color:${O};font-weight:700;font-size:9.5px;letter-spacing:1px;margin-bottom:1px;}
@media print{@page{size:A4 portrait;margin:6mm;}body{margin:0;padding:0;}.page{width:100%;padding:0;}}
</style></head><body><div class="page">
<div class="hdr">
  <div class="hdr-top">
    <div><div class="logo-main">QM <span>GARAGE</span></div><div class="logo-sub">RÉPARATION AUTOMOBILE</div></div>
    <div><div class="hdr-title">Fiche de Révision</div><div class="hdr-sub">— Contrôle Multi-Point —</div></div>
    <div class="fiche-no">N° <strong>${d.numFiche}</strong></div>
  </div>
  <div class="contacts">
    <div><span>📞</span>06 61 02 55 54</div><div><span>✉️</span>qm.garage45@gmail.com</div>
    <div><span>📸</span>@qm.garage</div><div><span>📍</span>94 impasse de la fosse aux loups, 45210 Nargis</div>
  </div>
</div>
<div class="grid-client">
  <div class="field"><label>Client</label><div class="val">${d.client||"—"}</div></div>
  <div class="field"><label>Téléphone</label><div class="val">${d.tel||"—"}</div></div>
  <div class="field"><label>Email</label><div class="val">${d.email||"—"}</div></div>
  <div class="field"><label>Immatriculation</label><div class="val">${d.immat||"—"}</div></div>
  <div class="field"><label>Marque / Modèle</label><div class="val">${d.marque||"—"}</div></div>
  <div class="field"><label>Kilométrage</label><div class="val">${d.km||"—"}</div></div>
  <div class="field"><label>Date</label><div class="val">${d.date}</div></div>
  <div class="field"><label>Technicien</label><div class="val">${d.technicien}</div></div>
</div>
${d.motif?`<div><div class="sec">📋 Motif d'intervention</div><div style="font-size:10px;padding:4px 6px;border:1px solid #dde0e5;border-radius:4px;background:#f8f9fa;">${d.motif}</div></div>`:""}
<div>
  <div class="sec">🛠️ Entretien & Filtres</div>
  <div class="entretien-wrap"><div class="entretien-cols">
    ${entretienCols.map(colGroups=>`<div class="entretien-col">${colGroups.map(g=>`<div class="grp-head">${g.title}</div>${g.items.map(([k,label])=>`<div class="chk-item">${checkVal(d.entretien[k])} ${label}</div>`).join("")}`).join("")}</div>`).join("")}
  </div></div>
</div>
<div class="row2">
  <div>
    <div class="sec">⭕ Pneus & Liaison sol</div>
    <table><thead><tr><th>Position</th><th style="text-align:center;">Usure mm</th><th style="text-align:center;">Pression</th></tr></thead><tbody>
    ${pneuPos.map(([k,label])=>`<tr><td>${label}</td><td class="c">${d.pneus[k].usure||"—"}</td><td class="c">${d.pneus[k].pression||"—"}</td></tr>`).join("")}
    </tbody></table>
    <div style="display:flex;gap:8px;margin-top:4px;font-size:9.5px;">
      <div>Pression ajustée : <strong style="color:${O}">${d.pneus.pressionAjustee==="oui"?"OUI":d.pneus.pressionAjustee==="non"?"NON":"—"}</strong></div>
      <div>Roue secours : <strong style="color:${O}">${d.pneus.roueSec==="ok"?"OK":d.pneus.roueSec==="nok"?"NOK":"—"}</strong></div>
    </div>
  </div>
  <div>
    <div class="sec">🎯 Freinage</div>
    <table><thead><tr><th>Élément</th><th class="c">Bon</th><th class="c">Moy.</th><th class="c">À Prév.</th></tr></thead><tbody>
    ${freins.map(([k,label])=>`<tr><td>${label}</td><td class="c">${radioVal(d.freinage[k],"bon")}</td><td class="c">${radioVal(d.freinage[k],"moy")}</td><td class="c">${radioVal(d.freinage[k],"prev")}</td></tr>`).join("")}
    </tbody></table>
  </div>
</div>
<div class="row3">
  <div>
    <div class="sec">💧 Fluides & Niveaux</div>
    <table><thead><tr><th>Fluide</th><th class="c">OK</th><th class="c">Appoint</th></tr></thead><tbody>
    ${fluides.map(([k,label])=>`<tr><td>${label}</td><td class="c">${radioVal(d.fluides[k],"ok")}</td><td class="c">${radioVal(d.fluides[k],"appoint")}</td></tr>`).join("")}
    </tbody></table>
  </div>
  <div>
    <div class="sec">💡 Éclairage & Visibilité</div>
    <table><thead><tr><th>Élément</th><th class="c">OK</th><th class="c">NOK</th></tr></thead><tbody>
    ${eclairs.map(([k,label])=>`<tr><td>${label}</td><td class="c">${radioVal(d.eclairage[k],"ok")}</td><td class="c">${radioVal(d.eclairage[k],"nok")}</td></tr>`).join("")}
    </tbody></table>
  </div>
  <div>
    <div class="sec">🔍 Sous Véhicule</div>
    <table><thead><tr><th>Organe</th><th class="c">OK</th><th class="c">À Prév.</th></tr></thead><tbody>
    ${sousveh.map(([k,label])=>`<tr><td>${label}</td><td class="c">${radioVal(d.sousveh[k],"ok")}</td><td class="c">${radioVal(d.sousveh[k],"prev")}</td></tr>`).join("")}
    </tbody></table>
  </div>
</div>
<div class="comments">
  <div><div class="sec">⚠️ Travaux urgents</div><div class="comment-box">${d.travaux||"Rien à signaler"}</div></div>
  <div><div class="sec">📝 Observations</div><div class="comment-box">${d.observations||"—"}</div></div>
</div>
<div class="sigs">
  <div class="sig-box"><div class="sig-head">Signature Technicien</div>${sigTechData?`<img class="sig-img" src="${sigTechData}"/>`:`<div class="sig-empty">Pas de signature</div>`}</div>
  <div class="sig-box"><div class="sig-head">Signature Client (Bon pour accord)</div>${sigClientData?`<img class="sig-img" src="${sigClientData}"/>`:`<div class="sig-empty">Pas de signature</div>`}</div>
</div>
<div class="footer">
  <div class="footer-tag">QM GARAGE — ENTRETIEN • RÉPARATION • DIAGNOSTIC AUTOMOBILE</div>
  <div>Merci de votre confiance ! Laissez-nous votre avis 5 étoiles sur Google ★★★★★</div>
</div>
</div></body></html>`;
}

// ─── APP PRINCIPALE ────────────────────────────────────────────────────────────
export default function App() {
  const [module, setModule] = useState(null); // null=accueil, "revision", "reception"
  const [stepRev, setStepRev] = useState(0);
  const [stepRec, setStepRec] = useState(0);
  const [dataRev, setDataRev] = useState(initRevision());
  const [dataRec, setDataRec] = useState(initReception());
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const sigTech = useRef(null);
  const sigClient = useRef(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const setFieldRev = (section, key, val) => {
    if (section==="root") setDataRev(d=>({...d,[key]:val}));
    else setDataRev(d=>({...d,[section]:{...d[section],[key]:val}}));
  };

  const setFieldRec = (key, val) => setDataRec(d=>({...d,[key]:val}));

  const getSigData = (ref) => {
    const canvas=ref.current; if(!canvas)return null;
    const pixels=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height).data;
    return pixels.some((v,i)=>i%4===3&&v>0)?canvas.toDataURL("image/png"):null;
  };

  const openPrint = (html) => {
    const w = window.open('','_blank');
    if (w) {
      w.document.open(); w.document.write(html); w.document.close();
      w.onload = () => setTimeout(()=>{w.focus();w.print();},400);
      setTimeout(()=>{try{w.focus();w.print();}catch(e){}},900);
    }
  };

  const exportRevision = async () => {
    setGenerating(true);
    try { openPrint(buildPDFHtml(dataRev, getSigData(sigTech), getSigData(sigClient))); }
    catch(e) { showToast("❌ Erreur : "+e.message,"error"); }
    setGenerating(false);
  };

  const exportReception = async () => {
    setGenerating(true);
    try { openPrint(buildReceptionPDF(dataRec, getSigData(sigTech), getSigData(sigClient))); }
    catch(e) { showToast("❌ Erreur : "+e.message,"error"); }
    setGenerating(false);
  };

  const sendMail = (data, type) => {
    const sub = encodeURIComponent(`${type==="revision"?"Fiche révision":"Bon de réception"} QM Garage - ${data.immat||"Véhicule"} - N°${data.numFiche||data.numBon}`);
    const body = encodeURIComponent(`Bonjour ${data.client||""},\n\nVeuillez trouver ci-joint votre document.\n\nDate : ${data.date}\nVéhicule : ${data.marque||"—"} - ${data.immat||"—"}\nKilométrage : ${data.km||"—"}\n\nCordialement,\nQM Garage\n📞 06 61 02 55 54`);
    window.location.href = `mailto:${data.email||""}?subject=${sub}&body=${body}`;
    showToast("📧 Client mail ouvert !");
  };

  // ── ÉCRAN ACCUEIL ────────────────────────────────────────────────────────────
  if (!module) return (
    <div style={{ minHeight:"100vh", background:DARK, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, gap:32 }}>
      {/* Logo */}
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:42, fontWeight:900, fontStyle:"italic", color:"#fff", letterSpacing:-2 }}>QM <span style={{ color:ORANGE }}>GARAGE</span></div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:4, color:"#666", marginTop:2 }}>RÉPARATION AUTOMOBILE</div>
        <div style={{ width:60, height:3, background:ORANGE, borderRadius:2, margin:"10px auto 0" }}/>
      </div>

      {/* Boutons modules */}
      <div style={{ display:"flex", flexDirection:"column", gap:16, width:"100%", maxWidth:340 }}>
        <button onClick={()=>setModule("reception")} style={{
          padding:"20px 24px", background:"#1a1a1a", border:`2px solid ${ORANGE}`, borderRadius:16,
          color:"#fff", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:16
        }}>
          <span style={{ fontSize:32 }}>🚗</span>
          <div>
            <div style={{ fontSize:17, fontWeight:900, letterSpacing:0.5 }}>Réception Véhicule</div>
            <div style={{ fontSize:12, color:"#888", marginTop:2 }}>État carrosserie • Voyants • Équipements • Signature</div>
          </div>
        </button>
        <button onClick={()=>setModule("revision")} style={{
          padding:"20px 24px", background:ORANGE, border:"none", borderRadius:16,
          color:"#fff", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:16
        }}>
          <span style={{ fontSize:32 }}>🛠️</span>
          <div>
            <div style={{ fontSize:17, fontWeight:900, letterSpacing:0.5 }}>Fiche de Révision</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:2 }}>Contrôle multi-point • Entretien • PDF A4</div>
          </div>
        </button>
      </div>

      <div style={{ fontSize:10, color:"#444", letterSpacing:1 }}>QM GARAGE © 2026 — Nargis</div>
    </div>
  );

  // ── MODULE RÉVISION ──────────────────────────────────────────────────────────
  if (module === "revision") {
    const step = stepRev;
    const setStep = setStepRev;
    const data = dataRev;
    const progress = ((step+1)/STEPS_REVISION.length)*100;

    const renderStep = () => {
      switch(step) {
        case 0: return <StepReception data={data} set={(k,v)=>setFieldRev("root",k,v)}/>;
        case 1: return <StepEntretien data={data.entretien} set={(k,v)=>setFieldRev("entretien",k,v)}/>;
        case 2: return <StepPneus data={data.pneus} set={(k,v)=>setFieldRev("pneus",k,v)}/>;
        case 3: return <StepFreinage data={data.freinage} set={(k,v)=>setFieldRev("freinage",k,v)}/>;
        case 4: return <StepFluides data={data.fluides} set={(k,v)=>setFieldRev("fluides",k,v)}/>;
        case 5: return <StepEclairage data={data.eclairage} set={(k,v)=>setFieldRev("eclairage",k,v)}/>;
        case 6: return <StepSousVeh data={data.sousveh} set={(k,v)=>setFieldRev("sousveh",k,v)}/>;
        case 7: return <StepRecap data={data} set={(k,v)=>setFieldRev("root",k,v)} sigTech={sigTech} sigClient={sigClient}/>;
        default: return null;
      }
    };

    return (
      <div style={{ minHeight:"100vh", background:"#eef1f5" }}>
        <div style={{ background:DARK, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>
          <div style={{ padding:"10px 16px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`2px solid ${ORANGE}`, paddingBottom:8, marginBottom:8 }}>
              <button onClick={()=>{setModule(null);setStep(0);}} style={{ background:"none", border:"none", color:"#888", fontSize:20, cursor:"pointer", padding:"0 4px" }}>←</button>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:14, fontWeight:900, color:"#fff", textTransform:"uppercase" }}>Fiche Révision</div>
                <div style={{ fontSize:9, color:ORANGE, fontWeight:700, letterSpacing:1.5 }}>CONTRÔLE MULTI-POINT</div>
              </div>
              <div style={{ border:`1.5px solid ${ORANGE}`, borderRadius:4, padding:"2px 6px", display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ color:"#aaa", fontSize:10, fontWeight:700 }}>N°</span>
                <input value={data.numFiche} onChange={e=>setFieldRev("root","numFiche",e.target.value)}
                  style={{ width:58, background:"transparent", border:"none", outline:"none", color:ORANGE, fontWeight:700, fontSize:13, textAlign:"center", padding:0 }} maxLength={10}/>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, paddingBottom:10 }}>
              <div style={{ flex:1, height:4, background:"#333", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:ORANGE, borderRadius:2, transition:"width 0.3s" }}/>
              </div>
              <span style={{ fontSize:10, color:"#aaa", whiteSpace:"nowrap" }}>{step+1}/{STEPS_REVISION.length}</span>
            </div>
          </div>
          <div style={{ display:"flex", overflowX:"auto", padding:"0 8px", gap:4, scrollbarWidth:"none" }}>
            {STEPS_REVISION.map((s,i) => (
              <button key={i} onClick={()=>setStep(i)} style={{ padding:"6px 10px", whiteSpace:"nowrap", border:"none", borderBottom:i===step?`3px solid ${ORANGE}`:"3px solid transparent", background:"transparent", color:i===step?ORANGE:"#888", fontSize:11, fontWeight:i===step?700:500, cursor:"pointer", flexShrink:0 }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ padding:"16px", maxWidth:600, margin:"0 auto", paddingBottom:100 }}>{renderStep()}</div>
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:`1px solid ${BORDER}`, padding:"10px 16px", display:"flex", gap:10, boxShadow:"0 -2px 8px rgba(0,0,0,0.08)", paddingBottom:"calc(10px + env(safe-area-inset-bottom))" }}>
          {step>0 && <button onClick={()=>setStep(s=>s-1)} style={{ flex:1, padding:"12px", background:GRAY, border:`1px solid ${BORDER}`, borderRadius:10, fontSize:14, fontWeight:700, color:DARK, cursor:"pointer" }}>← Retour</button>}
          {step<STEPS_REVISION.length-1
            ? <button onClick={()=>setStep(s=>s+1)} style={{ flex:2, padding:"12px", background:ORANGE, border:"none", borderRadius:10, fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer" }}>Suivant →</button>
            : <>
                <button onClick={()=>sendMail(data,"revision")} style={{ flex:1, padding:"12px", background:"#1a1a2e", border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>📧 Email</button>
                <button onClick={exportRevision} disabled={generating} style={{ flex:2, padding:"12px", background:generating?"#ccc":ORANGE, border:"none", borderRadius:10, fontSize:14, fontWeight:700, color:"#fff", cursor:generating?"not-allowed":"pointer" }}>{generating?"⏳...":"🖨️ Exporter PDF"}</button>
              </>
          }
        </div>
        {toast && <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:toast.type==="error"?"#c0392b":DARK, color:"#fff", padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:600, zIndex:9999, boxShadow:"0 4px 16px rgba(0,0,0,0.3)", maxWidth:"90vw", textAlign:"center" }}>{toast.msg}</div>}
      </div>
    );
  }

  // ── MODULE RÉCEPTION ─────────────────────────────────────────────────────────
  if (module === "reception") {
    const step = stepRec;
    const setStep = setStepRec;
    const data = dataRec;
    const progress = ((step+1)/STEPS_RECEPTION.length)*100;

    const renderStep = () => {
      switch(step) {
        case 0: return <RecepStep0 data={data} set={setFieldRec}/>;
        case 1: return <RecepStep1 data={data} set={setFieldRec}/>;
        case 2: return <RecepStep2 data={data} set={setFieldRec}/>;
        case 3: return <RecepStep3 data={data} set={setFieldRec} sigTech={sigTech} sigClient={sigClient}/>;
        default: return null;
      }
    };

    return (
      <div style={{ minHeight:"100vh", background:"#eef1f5" }}>
        <div style={{ background:DARK, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>
          <div style={{ padding:"10px 16px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`2px solid ${ORANGE}`, paddingBottom:8, marginBottom:8 }}>
              <button onClick={()=>{setModule(null);setStep(0);}} style={{ background:"none", border:"none", color:"#888", fontSize:20, cursor:"pointer", padding:"0 4px" }}>←</button>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:14, fontWeight:900, color:"#fff", textTransform:"uppercase" }}>Réception Véhicule</div>
                <div style={{ fontSize:9, color:ORANGE, fontWeight:700, letterSpacing:1.5 }}>BON D'ENTRÉE</div>
              </div>
              <div style={{ border:`1.5px solid ${ORANGE}`, borderRadius:4, padding:"2px 6px", display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ color:"#aaa", fontSize:10, fontWeight:700 }}>N°</span>
                <input value={data.numBon} onChange={e=>setFieldRec("numBon",e.target.value)}
                  style={{ width:64, background:"transparent", border:"none", outline:"none", color:ORANGE, fontWeight:700, fontSize:13, textAlign:"center", padding:0 }} maxLength={10}/>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, paddingBottom:10 }}>
              <div style={{ flex:1, height:4, background:"#333", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:ORANGE, borderRadius:2, transition:"width 0.3s" }}/>
              </div>
              <span style={{ fontSize:10, color:"#aaa", whiteSpace:"nowrap" }}>{step+1}/{STEPS_RECEPTION.length}</span>
            </div>
          </div>
          <div style={{ display:"flex", overflowX:"auto", padding:"0 8px", gap:4, scrollbarWidth:"none" }}>
            {STEPS_RECEPTION.map((s,i) => (
              <button key={i} onClick={()=>setStep(i)} style={{ padding:"6px 10px", whiteSpace:"nowrap", border:"none", borderBottom:i===step?`3px solid ${ORANGE}`:"3px solid transparent", background:"transparent", color:i===step?ORANGE:"#888", fontSize:11, fontWeight:i===step?700:500, cursor:"pointer", flexShrink:0 }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ padding:"16px", maxWidth:600, margin:"0 auto", paddingBottom:100 }}>{renderStep()}</div>
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:`1px solid ${BORDER}`, padding:"10px 16px", display:"flex", gap:10, boxShadow:"0 -2px 8px rgba(0,0,0,0.08)", paddingBottom:"calc(10px + env(safe-area-inset-bottom))" }}>
          {step>0 && <button onClick={()=>setStep(s=>s-1)} style={{ flex:1, padding:"12px", background:GRAY, border:`1px solid ${BORDER}`, borderRadius:10, fontSize:14, fontWeight:700, color:DARK, cursor:"pointer" }}>← Retour</button>}
          {step<STEPS_RECEPTION.length-1
            ? <button onClick={()=>setStep(s=>s+1)} style={{ flex:2, padding:"12px", background:ORANGE, border:"none", borderRadius:10, fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer" }}>Suivant →</button>
            : <>
                <button onClick={()=>sendMail(data,"reception")} style={{ flex:1, padding:"12px", background:"#1a1a2e", border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>📧 Email</button>
                <button onClick={exportReception} disabled={generating} style={{ flex:2, padding:"12px", background:generating?"#ccc":ORANGE, border:"none", borderRadius:10, fontSize:14, fontWeight:700, color:"#fff", cursor:generating?"not-allowed":"pointer" }}>{generating?"⏳...":"🖨️ Exporter PDF"}</button>
              </>
          }
        </div>
        {toast && <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:toast.type==="error"?"#c0392b":DARK, color:"#fff", padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:600, zIndex:9999, boxShadow:"0 4px 16px rgba(0,0,0,0.3)", maxWidth:"90vw", textAlign:"center" }}>{toast.msg}</div>}
      </div>
    );
  }
}
