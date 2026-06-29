import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONSTANTES ────────────────────────────────────────────────────────────────
const ORANGE = "#ff5a00";
const DARK   = "#0d0d0d";
const GRAY   = "#f4f5f7";
const BORDER = "#dde0e5";

const STEPS = ["Réception", "Entretien", "Pneumatiques", "Freinage", "Fluides", "Éclairage", "Sous-véhicule", "Récap"];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder = "", type = "text", half = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: half ? "0 0 calc(50% - 6px)" : "1 1 100%" }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "10px 12px", border: `1.5px solid ${BORDER}`, borderRadius: 8,
          fontSize: 14, background: "#fff", outline: "none", width: "100%",
          fontFamily: "inherit", color: DARK, boxSizing: "border-box"
        }}
        onFocus={e => e.target.style.borderColor = ORANGE}
        onBlur={e => e.target.style.borderColor = BORDER}
      />
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{
      background: DARK, color: "#fff", padding: "8px 14px", borderRadius: 8,
      fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center",
      gap: 8, marginBottom: 10, letterSpacing: 0.3
    }}>
      <span>{icon}</span> {title}
    </div>
  );
}

function RadioRow({ label, name, value, onChange, options }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "7px 10px", borderBottom: `1px solid ${BORDER}`, gap: 8
    }}>
      <span style={{ fontSize: 12.5, flex: 1, color: DARK }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map(opt => (
          <label key={opt.val} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
            <input
              type="radio" name={name} value={opt.val} checked={value === opt.val}
              onChange={() => onChange(opt.val)}
              style={{ accentColor: ORANGE, width: 16, height: 16 }}
            />
            <span style={{ fontSize: 9, color: value === opt.val ? ORANGE : "#888", fontWeight: 700 }}>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
      borderBottom: `1px solid ${BORDER}`, cursor: "pointer"
    }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 20, height: 20, borderRadius: 5,
        border: `2px solid ${checked ? ORANGE : BORDER}`,
        background: checked ? ORANGE : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.15s"
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 12.5, color: DARK }}>{label}</span>
    </label>
  );
}

// ─── CANVAS SIGNATURE ──────────────────────────────────────────────────────────
function SignatureCanvas({ label, canvasRef }) {
  const drawing = useRef(false);
  const lastPos = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const start = useCallback((e) => {
    drawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
    if (e.touches) e.preventDefault();
  }, [canvasRef]);

  const move = useCallback((e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    if (e.touches) e.preventDefault();
  }, [canvasRef]);

  const stop = useCallback(() => { drawing.current = false; }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const data = canvas.toDataURL();
      canvas.width = canvas.offsetWidth;
      canvas.height = 80;
      const img = new Image();
      img.onload = () => canvas.getContext("2d").drawImage(img, 0, 0);
      img.src = data;
    };
    resize();
  }, [canvasRef]);

  return (
    <div style={{ flex: 1 }}>
      <div style={{
        background: ORANGE, color: "#fff", fontSize: 11, fontWeight: 700,
        padding: "5px 10px", borderRadius: "8px 8px 0 0", textTransform: "uppercase", letterSpacing: 0.5
      }}>{label}</div>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 80, background: "#fafafa", border: `1px solid ${BORDER}`, display: "block", touchAction: "none" }}
        onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={move} onTouchEnd={stop}
      />
      <button onClick={clear} style={{
        background: "#555", color: "#fff", border: "none", padding: "4px 10px",
        fontSize: 10, borderRadius: "0 0 8px 8px", cursor: "pointer", width: "100%"
      }}>Effacer</button>
    </div>
  );
}

// ─── ÉTAT INITIAL ──────────────────────────────────────────────────────────────
const initState = () => ({
  // Réception
  numFiche: "00001",
  date: new Date().toLocaleDateString("fr-FR"),
  client: "", tel: "", email: "", immat: "",
  marque: "", km: "", technicien: "Quentin",
  motif: "", travaux: "", observations: "",

  // Entretien
  entretien: {
    vidange: false, filtreHuile: false, filtreAir: false,
    filtreHabitacle: false, filtreCarbu: false, filtreGasoil: false,
    bougies: false, bougiesPrech: false, injecteurs: false,
    throttle: false, egr: false, fap: false,
    courroieAcc: false, remplaceCourroieAcc: false,
    distribution: false, distribChaine: false, pompeEau: false, thermostat: false,
    climRecharge: false, climFiltre: false, radiateurNett: false, courroieClim: false,
    diag: false, raz: false, parametrage: false, battRemplace: false, alternateur: false,
    huileBoite: false, huileTransfer: false, liquideFrein: false,
    bugiArret: false, adblue: false, geometrie: false,
  },

  // Pneus
  pneus: {
    ag: { usure: "", pression: "" }, ad: { usure: "", pression: "" },
    rg: { usure: "", pression: "" }, rd: { usure: "", pression: "" },
    pressionAjustee: "", roueSec: ""
  },

  // Freinage
  freinage: {
    plaqAv: "", disqAv: "", plaqAr: "", disqAr: "", freinMain: ""
  },

  // Fluides
  fluides: {
    huile: "", refroid: "", frein: "", direction: "", laveGlace: "", boiteVitesse: "", additif: "", clim: ""
  },

  // Eclairage
  eclairage: {
    fxCrois: "", fxPos: "", cligno: "", fxStop: "", eg: "", batterie: ""
  },

  // Sous-véhicule
  sousveh: {
    amort: "", rotules: "", soufflets: "", echappe: "", fuite: "", plaques: ""
  }
});

// ─── COMPOSANTS PAR ÉTAPE ──────────────────────────────────────────────────────
function StepReception({ data, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionTitle icon="👤" title="Informations Client" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Field label="Nom / Prénom" value={data.client} onChange={v => set("client", v)} placeholder="Jean Dupont" />
        <Field label="Téléphone" value={data.tel} onChange={v => set("tel", v)} placeholder="06 XX XX XX XX" half />
        <Field label="Email" value={data.email} onChange={v => set("email", v)} placeholder="client@mail.fr" half />
      </div>

      <SectionTitle icon="🚗" title="Véhicule" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Field label="Immatriculation" value={data.immat} onChange={v => set("immat", v)} placeholder="AA-123-AA" half />
        <Field label="Marque / Modèle" value={data.marque} onChange={v => set("marque", v)} placeholder="Renault Clio" half />
        <Field label="Kilométrage" value={data.km} onChange={v => set("km", v)} placeholder="Ex: 85 000 km" half />
        <Field label="Technicien" value={data.technicien} onChange={v => set("technicien", v)} placeholder="Quentin" half />
        <Field label="Date" value={data.date} onChange={v => set("date", v)} half />
        <Field label="N° Fiche" value={data.numFiche} onChange={v => set("numFiche", v)} half />
      </div>

      <SectionTitle icon="📋" title="Motif d'intervention" />
      <textarea
        value={data.motif}
        onChange={e => set("motif", e.target.value)}
        placeholder="Décrivez le motif de la visite..."
        style={{
          width: "100%", minHeight: 80, padding: "10px 12px", border: `1.5px solid ${BORDER}`,
          borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical",
          outline: "none", boxSizing: "border-box", color: DARK
        }}
        onFocus={e => e.target.style.borderColor = ORANGE}
        onBlur={e => e.target.style.borderColor = BORDER}
      />
    </div>
  );
}

function StepEntretien({ data, set }) {
  const groups = [
    {
      icon: "🛢️", title: "Vidange & Filtres",
      items: [
        ["vidange",         "Vidange Moteur effectuée"],
        ["filtreHuile",     "Remplacement Filtre à Huile"],
        ["filtreAir",       "Remplacement Filtre à Air"],
        ["filtreHabitacle", "Remplacement Filtre Habitacle"],
        ["filtreCarbu",     "Remplacement Filtre Carburant"],
        ["filtreGasoil",    "Remplacement Filtre Gasoil (Décanteur)"],
      ]
    },
    {
      icon: "⚙️", title: "Allumage & Injection",
      items: [
        ["bougies",         "Contrôle / Remplacement Bougies"],
        ["bougiesPrech",    "Remplacement Bougies de Préchauffage"],
        ["injecteurs",      "Nettoyage / Contrôle Injecteurs"],
        ["throttle",        "Nettoyage Corps Papillon"],
        ["egr",             "Nettoyage Vanne EGR"],
        ["fap",             "Régénération / Nettoyage FAP/DPF"],
      ]
    },
    {
      icon: "🔗", title: "Courroies & Distribution",
      items: [
        ["courroieAcc",     "Contrôle Courroie Accessoire"],
        ["remplaceCourroieAcc", "Remplacement Courroie Accessoire + Galets"],
        ["distribution",    "Remplacement Kit Distribution (Courroie)"],
        ["distribChaine",   "Remplacement Kit Distribution (Chaîne)"],
        ["pompeEau",        "Remplacement Pompe à Eau"],
        ["thermostat",      "Remplacement Thermostat"],
      ]
    },
    {
      icon: "💨", title: "Climatisation & Refroidissement",
      items: [
        ["climRecharge",    "Recharge Climatisation (R1234yf / R134a)"],
        ["climFiltre",      "Remplacement Filtre Déshydrateur Clim"],
        ["radiateurNett",   "Nettoyage Radiateur"],
        ["courroieClim",    "Contrôle Poulie Compresseur Clim"],
      ]
    },
    {
      icon: "🔌", title: "Électronique & Diagnostic",
      items: [
        ["diag",            "Lecture / Effacement Codes Défauts (OBD)"],
        ["raz",             "Remise à zéro Service / Maintenance"],
        ["parametrage",     "Paramétrage / Calibration électronique"],
        ["battRemplace",    "Remplacement Batterie 12V"],
        ["alternateur",     "Contrôle Alternateur / Démarreur"],
      ]
    },
    {
      icon: "🧹", title: "Révision & Divers",
      items: [
        ["huileBoite",      "Vidange Huile Boîte de Vitesse"],
        ["huileTransfer",   "Vidange Huile Pont / Transfert"],
        ["liquideFrein",    "Remplacement Liquide de Frein"],
        ["bugiArret",       "Vérification Système Stop & Start"],
        ["adblue",          "Appoint AdBlue / Urée"],
        ["geometrie",       "Contrôle Géométrie / Parallélisme"],
      ]
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {groups.map(({ icon, title, items }) => (
        <div key={title}>
          <SectionTitle icon={icon} title={title} />
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {items.map(([key, label]) => (
              <CheckItem key={key} label={label} checked={!!data[key]} onChange={v => set(key, v)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepPneus({ data, set }) {
  const positions = [
    ["ag", "Avant Gauche"], ["ad", "Avant Droit"],
    ["rg", "Arrière Gauche"], ["rd", "Arrière Droit"]
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionTitle icon="⭕" title="Liaison au Sol & Pneus" />
      <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px", background: GRAY, padding: "6px 10px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Position</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", textAlign: "center" }}>Usure (mm)</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", textAlign: "center" }}>Pression</span>
        </div>
        {positions.map(([key, label]) => (
          <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px", padding: "6px 10px", borderBottom: `1px solid ${BORDER}`, alignItems: "center" }}>
            <span style={{ fontSize: 13 }}>{label}</span>
            <input value={data[key].usure} onChange={e => set(key, { ...data[key], usure: e.target.value })}
              placeholder="ex: 4" style={{ textAlign: "center", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px", fontSize: 13, width: "100%", boxSizing: "border-box", fontFamily: "inherit" }} />
            <input value={data[key].pression} onChange={e => set(key, { ...data[key], pression: e.target.value })}
              placeholder="2.2 bar" style={{ textAlign: "center", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px", fontSize: 13, width: "100%", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <RadioRow label="Pression ajustée" name="p_aj" value={data.pressionAjustee} onChange={v => set("pressionAjustee", v)}
            options={[{ val: "oui", label: "OUI" }, { val: "non", label: "NON" }]} />
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <RadioRow label="Roue de secours" name="r_sec" value={data.roueSec} onChange={v => set("roueSec", v)}
            options={[{ val: "ok", label: "OK" }, { val: "nok", label: "NOK" }]} />
        </div>
      </div>
    </div>
  );
}

function StepFreinage({ data, set }) {
  const items = [
    ["plaqAv", "Plaquettes AV"], ["disqAv", "Disques AV"],
    ["plaqAr", "Plaquettes AR"], ["disqAr", "Disques AR"],
    ["freinMain", "Frein à main"]
  ];
  const opts = [{ val: "bon", label: "BON" }, { val: "moy", label: "MOY." }, { val: "prev", label: "À PRÉVOIR" }];
  return (
    <div>
      <SectionTitle icon="🎯" title="Système de Freinage" />
      <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {items.map(([key, label]) => (
          <RadioRow key={key} label={label} name={`fr_${key}`} value={data[key]} onChange={v => set(key, v)} options={opts} />
        ))}
      </div>
    </div>
  );
}

function StepFluides({ data, set }) {
  const items = [
    ["huile", "Huile Moteur"], ["refroid", "Liquide Refroidissement"],
    ["frein", "Liquide de Frein"], ["direction", "Direction Assistée"],
    ["laveGlace", "Lave-Glace"], ["boiteVitesse", "Huile Boîte de Vitesse"],
    ["additif", "Additif / AdBlue (Urée)"], ["clim", "Fluide Climatisation"]
  ];
  const opts = [{ val: "ok", label: "OK" }, { val: "appoint", label: "APPOINT" }];
  return (
    <div>
      <SectionTitle icon="💧" title="Niveaux, Fluides & Appoints" />
      <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {items.map(([key, label]) => (
          <RadioRow key={key} label={label} name={`fl_${key}`} value={data[key]} onChange={v => set(key, v)} options={opts} />
        ))}
      </div>
    </div>
  );
}

function StepEclairage({ data, set }) {
  const items = [
    ["fxCrois", "Feux Croisement / Route"], ["fxPos", "Feux de Position / Plaque"],
    ["cligno", "Clignotants & Warning"], ["fxStop", "Feux Stop & Recul"],
    ["eg", "Essuie-Glaces & Pare-Brise"], ["batterie", "État Batterie (Test de charge)"]
  ];
  const opts = [{ val: "ok", label: "OK" }, { val: "nok", label: "NOK" }];
  return (
    <div>
      <SectionTitle icon="💡" title="Éclairage & Visibilité" />
      <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {items.map(([key, label]) => (
          <RadioRow key={key} label={label} name={`ec_${key}`} value={data[key]} onChange={v => set(key, v)} options={opts} />
        ))}
      </div>
    </div>
  );
}

function StepSousVeh({ data, set }) {
  const items = [
    ["amort", "Amortisseurs (Étanchéité)"], ["rotules", "Rotules & Trains (Jeu)"],
    ["soufflets", "Soufflets de Cardan / Direction"], ["echappe", "Ligne d'Échappement / FAP"],
    ["fuite", "Absence de Fuite Moteur / Boîte"], ["plaques", "Plaques de Protection Sous Bloc"]
  ];
  const opts = [{ val: "ok", label: "OK" }, { val: "prev", label: "À PRÉVOIR" }];
  return (
    <div>
      <SectionTitle icon="🔍" title="Train Roulant & Sous Véhicule" />
      <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {items.map(([key, label]) => (
          <RadioRow key={key} label={label} name={`sv_${key}`} value={data[key]} onChange={v => set(key, v)} options={opts} />
        ))}
      </div>
    </div>
  );
}

// ─── RECAP / SIGNATURES / EXPORT ───────────────────────────────────────────────
function StepRecap({ data, set, sigTech, sigClient }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle icon="⚠️" title="Travaux urgents à prévoir" />
      <textarea
        value={data.travaux}
        onChange={e => set("travaux", e.target.value)}
        placeholder="Rien à signaler..."
        style={{
          width: "100%", minHeight: 70, padding: "10px 12px", border: `1.5px solid ${BORDER}`,
          borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical",
          outline: "none", boxSizing: "border-box", color: DARK
        }}
        onFocus={e => e.target.style.borderColor = ORANGE}
        onBlur={e => e.target.style.borderColor = BORDER}
      />

      <SectionTitle icon="📝" title="Observations & Recommandations" />
      <textarea
        value={data.observations}
        onChange={e => set("observations", e.target.value)}
        placeholder="Notes complémentaires..."
        style={{
          width: "100%", minHeight: 70, padding: "10px 12px", border: `1.5px solid ${BORDER}`,
          borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical",
          outline: "none", boxSizing: "border-box", color: DARK
        }}
        onFocus={e => e.target.style.borderColor = ORANGE}
        onBlur={e => e.target.style.borderColor = BORDER}
      />

      <SectionTitle icon="✍️" title="Signatures" />
      <div style={{ display: "flex", gap: 12 }}>
        <SignatureCanvas label="Technicien" canvasRef={sigTech} />
        <SignatureCanvas label="Client (Bon pour accord)" canvasRef={sigClient} />
      </div>
    </div>
  );
}

// ─── GENERATEUR HTML → PDF ─────────────────────────────────────────────────────
function buildPDFHtml(d, sigTechData, sigClientData) {
  const O = "#ff5a00", DK = "#0d0d0d";
  const tableStyle = `border-collapse:collapse;width:100%;font-size:11px;`;
  const thStyle = `background:#eaedf1;font-weight:700;font-size:10px;text-transform:uppercase;padding:5px 6px;border:1px solid #ccc;text-align:left;`;
  const tdStyle = `padding:5px 6px;border:1px solid #ccc;`;
  const tdCStyle = `padding:5px 6px;border:1px solid #ccc;text-align:center;width:50px;`;

  const radioVal = (v, expected) => v === expected
    ? `<span style="color:${O};font-weight:900;font-size:14px;">●</span>`
    : `<span style="color:#ccc;font-size:14px;">○</span>`;

  const checkVal = (v) => v
    ? `<span style="color:${O};font-weight:900;">✓</span>`
    : `<span style="color:#ddd;">☐</span>`;

  const freins = [
    ["plaqAv","Plaquettes AV"],["disqAv","Disques AV"],
    ["plaqAr","Plaquettes AR"],["disqAr","Disques AR"],["freinMain","Frein à main"]
  ];
  const fluides = [
    ["huile","Huile Moteur"],["refroid","Liquide Refroidissement"],
    ["frein","Liquide de Frein"],["direction","Direction Assistée"],
    ["laveGlace","Lave-Glace"],["boiteVitesse","Huile Boîte"],
    ["additif","Additif / AdBlue"],["clim","Fluide Climatisation"]
  ];
  const eclairs = [
    ["fxCrois","Feux Croisement/Route"],["fxPos","Feux Position/Plaque"],
    ["cligno","Clignotants & Warning"],["fxStop","Feux Stop & Recul"],
    ["eg","Essuie-Glaces"],["batterie","Batterie (Charge)"]
  ];
  const sousveh = [
    ["amort","Amortisseurs"],["rotules","Rotules & Trains"],
    ["soufflets","Soufflets Cardan"],["echappe","Échappement / FAP"],
    ["fuite","Fuites Moteur/Boîte"],["plaques","Plaques Protection"]
  ];
  const entretienGroups = [
    { title: "🛢️ Vidange & Filtres", items: [
      ["vidange","Vidange Moteur"],["filtreHuile","Filtre à Huile"],
      ["filtreAir","Filtre à Air"],["filtreHabitacle","Filtre Habitacle"],
      ["filtreCarbu","Filtre Carburant"],["filtreGasoil","Filtre Gasoil (Décanteur)"],
    ]},
    { title: "⚙️ Allumage & Injection", items: [
      ["bougies","Bougies"],["bougiesPrech","Bougies de Préchauffage"],
      ["injecteurs","Injecteurs"],["throttle","Corps Papillon"],
      ["egr","Vanne EGR"],["fap","FAP/DPF"],
    ]},
    { title: "🔗 Courroies & Distribution", items: [
      ["courroieAcc","Courroie Accessoire (contrôle)"],["remplaceCourroieAcc","Courroie Accessoire + Galets (rempl.)"],
      ["distribution","Kit Distribution Courroie"],["distribChaine","Kit Distribution Chaîne"],
      ["pompeEau","Pompe à Eau"],["thermostat","Thermostat"],
    ]},
    { title: "💨 Climatisation & Refroid.", items: [
      ["climRecharge","Recharge Climatisation"],["climFiltre","Filtre Déshydrateur Clim"],
      ["radiateurNett","Nettoyage Radiateur"],["courroieClim","Poulie Compresseur Clim"],
    ]},
    { title: "🔌 Électronique & Diag.", items: [
      ["diag","Lecture/Effacement Codes Défauts"],["raz","RAZ Maintenance"],
      ["parametrage","Paramétrage Électronique"],["battRemplace","Batterie 12V"],
      ["alternateur","Alternateur / Démarreur"],
    ]},
    { title: "🧹 Révision & Divers", items: [
      ["huileBoite","Huile Boîte de Vitesse"],["huileTransfer","Huile Pont / Transfert"],
      ["liquideFrein","Liquide de Frein"],["bugiArret","Stop & Start"],
      ["adblue","AdBlue / Urée"],["geometrie","Géométrie / Parallélisme"],
    ]},
  ];
  const pneuPos = [["ag","Avant Gauche"],["ad","Avant Droit"],["rg","Arrière Gauche"],["rd","Arrière Droit"]];

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  body{background:#fff;color:#1a1a1a;}
  .page{width:210mm;min-height:297mm;padding:12px 18px;display:flex;flex-direction:column;gap:10px;}
  .hdr{background:${DK};color:#fff;padding:10px 16px;border-radius:5px;}
  .hdr-top{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid ${O};padding-bottom:8px;margin-bottom:6px;}
  .logo-main{font-size:26px;font-weight:900;font-style:italic;letter-spacing:-1px;}
  .logo-main span{color:${O};}
  .logo-sub{font-size:10px;font-weight:700;letter-spacing:3px;color:#aaa;}
  .hdr-title{font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:1px;text-align:center;}
  .hdr-sub{color:${O};font-size:10px;font-weight:700;letter-spacing:2px;text-align:center;}
  .fiche-no{border:1.5px solid ${O};padding:4px 10px;border-radius:4px;font-size:12px;color:#fff;text-align:center;}
  .fiche-no strong{color:${O};font-size:14px;}
  .contacts{display:flex;justify-content:space-between;font-size:10.5px;color:#ddd;margin-top:4px;flex-wrap:wrap;gap:3px;}
  .contacts span{color:${O};margin-right:3px;}
  .grid-client{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#f8f9fa;padding:10px;border:1px solid #dde0e5;border-radius:5px;}
  .field label{font-size:9.5px;font-weight:700;color:#666;text-transform:uppercase;display:block;margin-bottom:3px;}
  .field .val{padding:5px 7px;border:1px solid #dde0e5;border-radius:4px;font-size:12px;background:#fff;min-height:22px;}
  .sec{background:${DK};color:#fff;padding:5px 10px;font-size:11px;font-weight:700;text-transform:uppercase;border-radius:4px;margin-bottom:6px;letter-spacing:0.3px;}
  .cols3{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:10px;}
  .cols3b{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
  .cols2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  table{${tableStyle}}
  th{${thStyle}}
  td{${tdStyle}}
  td.c{${tdCStyle}}
  .chk-item{display:flex;align-items:center;gap:6px;padding:4px 6px;border-bottom:1px solid #eee;font-size:11px;}
  .comments{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .comment-box{border:1px solid #dde0e5;border-radius:4px;padding:8px;min-height:60px;font-size:11.5px;color:#1a1a1a;white-space:pre-wrap;}
  .sigs{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .sig-box{border:1px dashed #ccc;border-radius:5px;overflow:hidden;}
  .sig-head{background:${O};color:#fff;font-size:10px;font-weight:700;padding:4px;text-align:center;text-transform:uppercase;}
  .sig-img{width:100%;height:75px;object-fit:contain;background:#fafafa;}
  .sig-empty{width:100%;height:75px;background:#fafafa;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:11px;}
  .footer{background:${DK};color:#fff;text-align:center;padding:8px;border-radius:4px;font-size:10px;}
  .footer-tag{color:${O};font-weight:700;font-size:10.5px;letter-spacing:1px;margin-bottom:2px;}
  .stars{color:#ffcc00;}
</style></head><body>
<div class="page">

  <!-- HEADER -->
  <div class="hdr">
    <div class="hdr-top">
      <div><div class="logo-main">QM <span>GARAGE</span></div><div class="logo-sub">RÉPARATION AUTOMOBILE</div></div>
      <div><div class="hdr-title">Fiche de Révision</div><div class="hdr-sub">— Contrôle Multi-Point —</div></div>
      <div class="fiche-no">N° <strong>${d.numFiche}</strong></div>
    </div>
    <div class="contacts">
      <div><span>📞</span>06 61 02 55 54</div>
      <div><span>✉️</span>qm.garage45@gmail.com</div>
      <div><span>📸</span>@qm.garage</div>
      <div><span>📍</span>94 impasse de la fosse aux loups, 45210 Nargis</div>
    </div>
  </div>

  <!-- CLIENT / VÉHICULE -->
  <div class="grid-client">
    <div class="field"><label>Client</label><div class="val">${d.client || "—"}</div></div>
    <div class="field"><label>Téléphone</label><div class="val">${d.tel || "—"}</div></div>
    <div class="field"><label>Email</label><div class="val">${d.email || "—"}</div></div>
    <div class="field"><label>Immatriculation</label><div class="val">${d.immat || "—"}</div></div>
    <div class="field"><label>Marque / Modèle</label><div class="val">${d.marque || "—"}</div></div>
    <div class="field"><label>Kilométrage</label><div class="val">${d.km || "—"}</div></div>
    <div class="field"><label>Date</label><div class="val">${d.date}</div></div>
    <div class="field"><label>Technicien</label><div class="val">${d.technicien}</div></div>
  </div>

  ${d.motif ? `<div><div class="sec">📋 Motif d'intervention</div><div style="font-size:12px;padding:6px 8px;border:1px solid #dde0e5;border-radius:4px;background:#f8f9fa;">${d.motif}</div></div>` : ""}

  <!-- LIGNE 1 : ENTRETIEN / PNEUS / FREINAGE -->
  <div class="cols3">
    <div>
      <div class="sec">🛠️ Entretien & Filtres</div>
      <div>
        ${entretienGroups.map(g => `
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#888;padding:4px 6px;background:#f0f0f0;letter-spacing:0.5px;">${g.title}</div>
          ${g.items.map(([k, label]) => `<div class="chk-item">${checkVal(d.entretien[k])} ${label}</div>`).join("")}
        `).join("")}
      </div>
    </div>
    <div>
      <div class="sec">⭕ Pneus & Liaison sol</div>
      <table>
        <thead><tr><th>Position</th><th style="text-align:center;">mm</th><th style="text-align:center;">Bar</th></tr></thead>
        <tbody>
          ${pneuPos.map(([k, label]) => `<tr><td>${label}</td><td class="c">${d.pneus[k].usure || "—"}</td><td class="c">${d.pneus[k].pression || "—"}</td></tr>`).join("")}
        </tbody>
      </table>
      <div style="display:flex;gap:8px;margin-top:6px;font-size:11px;">
        <div>Pression ajustée : <strong style="color:${O}">${d.pneus.pressionAjustee === "oui" ? "OUI" : d.pneus.pressionAjustee === "non" ? "NON" : "—"}</strong></div>
        <div>Roue secours : <strong style="color:${O}">${d.pneus.roueSec === "ok" ? "OK" : d.pneus.roueSec === "nok" ? "NOK" : "—"}</strong></div>
      </div>
    </div>
    <div>
      <div class="sec">🎯 Freinage</div>
      <table>
        <thead><tr><th>Élément</th><th class="c">Bon</th><th class="c">Moy.</th><th class="c">À Prév.</th></tr></thead>
        <tbody>
          ${freins.map(([k, label]) => `<tr><td>${label}</td><td class="c">${radioVal(d.freinage[k],"bon")}</td><td class="c">${radioVal(d.freinage[k],"moy")}</td><td class="c">${radioVal(d.freinage[k],"prev")}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- LIGNE 2 : FLUIDES / ECLAIRAGE / SOUS-VÉH -->
  <div class="cols3b">
    <div>
      <div class="sec">💧 Fluides & Niveaux</div>
      <table>
        <thead><tr><th>Fluide</th><th class="c">OK</th><th class="c">Appoint</th></tr></thead>
        <tbody>
          ${fluides.map(([k, label]) => `<tr><td>${label}</td><td class="c">${radioVal(d.fluides[k],"ok")}</td><td class="c">${radioVal(d.fluides[k],"appoint")}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div>
      <div class="sec">💡 Éclairage & Visibilité</div>
      <table>
        <thead><tr><th>Élément</th><th class="c">OK</th><th class="c">NOK</th></tr></thead>
        <tbody>
          ${eclairs.map(([k, label]) => `<tr><td>${label}</td><td class="c">${radioVal(d.eclairage[k],"ok")}</td><td class="c">${radioVal(d.eclairage[k],"nok")}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div>
      <div class="sec">🔍 Sous Véhicule</div>
      <table>
        <thead><tr><th>Organe</th><th class="c">OK</th><th class="c">À Prév.</th></tr></thead>
        <tbody>
          ${sousveh.map(([k, label]) => `<tr><td>${label}</td><td class="c">${radioVal(d.sousveh[k],"ok")}</td><td class="c">${radioVal(d.sousveh[k],"prev")}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- OBSERVATIONS -->
  <div class="comments">
    <div>
      <div class="sec">⚠️ Travaux urgents</div>
      <div class="comment-box">${d.travaux || "Rien à signaler"}</div>
    </div>
    <div>
      <div class="sec">📝 Observations</div>
      <div class="comment-box">${d.observations || "—"}</div>
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="sigs">
    <div class="sig-box">
      <div class="sig-head">Signature Technicien</div>
      ${sigTechData ? `<img class="sig-img" src="${sigTechData}" />` : `<div class="sig-empty">Pas de signature</div>`}
    </div>
    <div class="sig-box">
      <div class="sig-head">Signature Client (Bon pour accord)</div>
      ${sigClientData ? `<img class="sig-img" src="${sigClientData}" />` : `<div class="sig-empty">Pas de signature</div>`}
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-tag">QM GARAGE — ENTRETIEN • RÉPARATION • DIAGNOSTIC AUTOMOBILE</div>
    <div>Merci de votre confiance ! Laissez-nous votre avis 5 étoiles sur Google <span class="stars">★★★★★</span></div>
  </div>

</div>
</body></html>`;
}

// ─── APP PRINCIPALE ────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initState());
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const sigTech = useRef(null);
  const sigClient = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const setField = (section, key, val) => {
    if (section === "root") {
      setData(d => ({ ...d, [key]: val }));
    } else {
      setData(d => ({ ...d, [section]: { ...d[section], [key]: val } }));
    }
  };

  const getSigData = (ref) => {
    const canvas = ref.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasContent = pixels.some((v, i) => i % 4 === 3 && v > 0);
    return hasContent ? canvas.toDataURL("image/png") : null;
  };

  const generateAndDownload = async () => {
    setGenerating(true);
    try {
      const html = buildPDFHtml(data, getSigData(sigTech), getSigData(sigClient));
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `Fiche-${data.numFiche}-${(data.immat || "SANS-IMMAT").replace(/[^a-zA-Z0-9]/g, "")}.html`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast("✅ Fiche téléchargée ! Ouvre le fichier dans Chrome puis imprime en PDF A4.");
    } catch (e) {
      showToast("❌ Erreur : " + e.message, "error");
    }
    setGenerating(false);
  };

  const sendByMail = () => {
    const sub = encodeURIComponent(`Fiche révision QM Garage - ${data.immat || "Véhicule"} - N°${data.numFiche}`);
    const body = encodeURIComponent(
      `Bonjour ${data.client || ""},\n\nVeuillez trouver ci-joint la fiche de révision de votre véhicule (${data.marque || "—"} - ${data.immat || "—"}).\n\nDate : ${data.date}\nKilométrage : ${data.km || "—"}\nTechnicien : ${data.technicien}\n\n${data.travaux ? `Travaux urgents :\n${data.travaux}\n\n` : ""}${data.observations ? `Observations :\n${data.observations}\n\n` : ""}Merci de votre confiance !\n\nQM Garage\n📞 06 61 02 55 54\n✉️ qm.garage45@gmail.com`
    );
    window.location.href = `mailto:${data.email || ""}?subject=${sub}&body=${body}`;
    showToast("📧 Client mail ouvert !");
  };

  // Composant de l'étape active
  const renderStep = () => {
    switch (step) {
      case 0: return <StepReception data={data} set={(k, v) => setField("root", k, v)} />;
      case 1: return <StepEntretien data={data.entretien} set={(k, v) => setField("entretien", k, v)} />;
      case 2: return <StepPneus data={data.pneus} set={(k, v) => setField("pneus", k, v)} />;
      case 3: return <StepFreinage data={data.freinage} set={(k, v) => setField("freinage", k, v)} />;
      case 4: return <StepFluides data={data.fluides} set={(k, v) => setField("fluides", k, v)} />;
      case 5: return <StepEclairage data={data.eclairage} set={(k, v) => setField("eclairage", k, v)} />;
      case 6: return <StepSousVeh data={data.sousveh} set={(k, v) => setField("sousveh", k, v)} />;
      case 7: return <StepRecap data={data} set={(k, v) => setField("root", k, v)} sigTech={sigTech} sigClient={sigClient} />;
      default: return null;
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f5", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* HEADER FIXE */}
      <div style={{ background: DARK, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "10px 16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${ORANGE}`, paddingBottom: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, fontStyle: "italic", color: "#fff", letterSpacing: -1 }}>
                QM <span style={{ color: ORANGE }}>GARAGE</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa" }}>RÉPARATION AUTOMOBILE</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Fiche Révision</div>
              <div style={{ fontSize: 9, color: ORANGE, fontWeight: 700, letterSpacing: 1.5 }}>CONTRÔLE MULTI-POINT</div>
            </div>
            <div style={{ border: `1.5px solid ${ORANGE}`, padding: "4px 8px", borderRadius: 4, color: "#fff", fontSize: 11 }}>
              N° <span style={{ color: ORANGE, fontWeight: 700 }}>{data.numFiche}</span>
            </div>
          </div>
          {/* Barre de progression */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10 }}>
            <div style={{ flex: 1, height: 4, background: "#333", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: ORANGE, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 10, color: "#aaa", whiteSpace: "nowrap" }}>{step + 1}/{STEPS.length}</span>
          </div>
        </div>

        {/* ONGLETS navigation */}
        <div style={{ display: "flex", overflowX: "auto", padding: "0 8px 0", gap: 4, scrollbarWidth: "none" }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              padding: "6px 10px", whiteSpace: "nowrap", border: "none",
              borderBottom: i === step ? `3px solid ${ORANGE}` : "3px solid transparent",
              background: "transparent", color: i === step ? ORANGE : "#888",
              fontSize: 11, fontWeight: i === step ? 700 : 500, cursor: "pointer",
              transition: "all 0.15s", flexShrink: 0, fontFamily: "inherit"
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ padding: "16px", maxWidth: 600, margin: "0 auto" }}>
        {renderStep()}
      </div>

      {/* NAVIGATION BAS + ACTIONS FINALES */}
      <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: `1px solid ${BORDER}`, padding: "10px 16px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 -2px 8px rgba(0,0,0,0.08)" }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{
            flex: 1, padding: "12px", background: GRAY, border: `1px solid ${BORDER}`,
            borderRadius: 10, fontSize: 14, fontWeight: 700, color: DARK, cursor: "pointer", fontFamily: "inherit"
          }}>← Retour</button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} style={{
            flex: 2, padding: "12px", background: ORANGE, border: "none",
            borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit"
          }}>Suivant →</button>
        ) : (
          <>
            <button onClick={sendByMail} style={{
              flex: 1, padding: "12px", background: "#1a1a2e", border: "none",
              borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit"
            }}>📧 Email</button>
            <button onClick={generateAndDownload} disabled={generating} style={{
              flex: 2, padding: "12px", background: generating ? "#ccc" : ORANGE, border: "none",
              borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#fff", cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit"
            }}>{generating ? "⏳ Génération..." : "🖨️ Télécharger PDF"}</button>
          </>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? "#c0392b" : DARK,
          color: "#fff", padding: "10px 20px", borderRadius: 10,
          fontSize: 13, fontWeight: 600, zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)", maxWidth: "90vw", textAlign: "center"
        }}>{toast.msg}</div>
      )}
    </div>
  );
}
