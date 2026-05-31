import { useState, useEffect, useMemo, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
// DATOS BASE - Angular SA / Edward
// ═══════════════════════════════════════════════════════════════════
const EMPRESA = {
  nombre: "Angular SA",
  proveedor: "Productos Edward S.A.I.",
  ruc: "en trámite",
  deposito: { nombre: "Depósito Central Angular SA", direccion: "Av. Santo Domingo, Luque", lat: -25.2896, lng: -57.5100, zona: "Z3" }
};

const ZONAS = [
  { id:"Z1", nombre:"Zona Norte",   color:"#3b82f6", centro:{lat:-25.237,lng:-57.495}, referencia:"Laurelty / Av. Sudamericana" },
  { id:"Z2", nombre:"Zona Centro",  color:"#10b981", centro:{lat:-25.268,lng:-57.492}, referencia:"Casco histórico / Mercados" },
  { id:"Z3", nombre:"Zona Sur",     color:"#f59e0b", centro:{lat:-25.298,lng:-57.498}, referencia:"Ruta Cap. Insfran / Laurelty" },
  { id:"Z4", nombre:"Zona Este",    color:"#ef4444", centro:{lat:-25.278,lng:-57.450}, referencia:"Sportivo / Ko'e Pyahu" },
  { id:"Z5", nombre:"Zona Oeste",   color:"#a78bfa", centro:{lat:-25.260,lng:-57.525}, referencia:"CONMEBOL / Shopping Estación" },
];

const RUTA_SEMANAL = {
  "Lunes":    {zonas:["Z3","Z2"], foco:"Zona propia + centro comercial"},
  "Martes":   {zonas:["Z2","Z1"], foco:"Reposición centro + norte"},
  "Miércoles":{zonas:["Z1","Z5"], foco:"Norte + corredor oeste"},
  "Jueves":   {zonas:["Z4","Z2"], foco:"Zona este + refuerzo centro"},
  "Viernes":  {zonas:["Z3","Z5"], foco:"Sur + shoppings"},
};

const CATALOGO = [
  {codigo:"DGH", nombre:"Disco Grande Horno",        categoria:"Discos",      precio:8400,  iva:10},
  {codigo:"DMH", nombre:"Disco Mediano Horno",       categoria:"Discos",      precio:6500,  iva:5 },
  {codigo:"DCH", nombre:"Disco Chico Horno",         categoria:"Discos",      precio:4450,  iva:10},
  {codigo:"DGF", nombre:"Disco Grande Freír",        categoria:"Discos",      precio:5750,  iva:10},
  {codigo:"DMF", nombre:"Disco Mediano Freír",       categoria:"Discos",      precio:4450,  iva:10},
  {codigo:"DCF", nombre:"Disco Chico Freír",         categoria:"Discos",      precio:3000,  iva:10},
  {codigo:"PBL", nombre:"Pascualina Blanca x450gr",  categoria:"Pascualinas", precio:8100,  iva:10},
  {codigo:"PCR", nombre:"Pascualina Criolla x450gr", categoria:"Pascualinas", precio:8100,  iva:10},
  {codigo:"PIN", nombre:"Pascualina Integral",       categoria:"Pascualinas", precio:8100,  iva:10},
  {codigo:"FID5",nombre:"Fideo Fresco x500gr",       categoria:"Pastas",      precio:7300,  iva:5 },
  {codigo:"FID1",nombre:"Fideo Fresco x1kg",         categoria:"Pastas",      precio:14500, iva:5 },
  {codigo:"NQS5",nombre:"Ñoquis x500gr",             categoria:"Pastas",      precio:8100,  iva:5 },
  {codigo:"NQS1",nombre:"Ñoquis x1kg",               categoria:"Pastas",      precio:6600,  iva:5 },
  {codigo:"LAS5",nombre:"Lasaña x500gr",             categoria:"Pastas",      precio:7450,  iva:5 },
  {codigo:"RVC", nombre:"Ravioles Carne x600gr",     categoria:"Pastas",      precio:24750, iva:5 },
  {codigo:"RVJQ",nombre:"Ravioles J&Q x600gr",       categoria:"Pastas",      precio:24750, iva:5 },
  {codigo:"RVP", nombre:"Ravioles Pollo x600gr",     categoria:"Pastas",      precio:24750, iva:5 },
  {codigo:"SJQ", nombre:"Sorrentinos J&Q",           categoria:"Pastas",      precio:24750, iva:5 },
  {codigo:"PMB5",nombre:"Pan Miga Blanco x500gr",    categoria:"Panificados", precio:6900,  iva:5 },
  {codigo:"PMB1",nombre:"Pan Miga Blanco x1kg",      categoria:"Panificados", precio:13800, iva:5 },
  {codigo:"PVI", nombre:"Pancito de Viena",          categoria:"Panificados", precio:6800,  iva:5 },
  {codigo:"PHA", nombre:"Pan Hamburguesa",           categoria:"Panificados", precio:6800,  iva:5 },
  {codigo:"PPZ", nombre:"Pre-Pizza",                 categoria:"Panificados", precio:4950,  iva:10},
  {codigo:"PPZA",nombre:"Pre-Pizza Artesanal",       categoria:"Panificados", precio:5750,  iva:10},
  {codigo:"GAL", nombre:"Galletita Corazón x Kilo",  categoria:"Confitería",  precio:13500, iva:10},
  {codigo:"GALE",nombre:"Galletita Especial x Kg",   categoria:"Confitería",  precio:18750, iva:10},
  {codigo:"KOK", nombre:"Kokitin 400gr",             categoria:"Panificados", precio:10650, iva:10},
  {codigo:"CH2", nombre:"Chipitas 250gr",            categoria:"Confitería",  precio:13500, iva:10},
];

const USUARIOS_INIT = [
  {id:"admin", nombre:"Administrador",      rol:"admin",    pin:"0000"},
  {id:"ruben", nombre:"Rubén",              rol:"admin",    pin:"1234"},
  {id:"oscar", nombre:"Oscar M. Dominguez", rol:"vendedor", pin:"1111"},
  {id:"vend2", nombre:"Vendedor 2",         rol:"vendedor", pin:"2222"},
];

// ═══════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════
const ST = {cli:"ang_cli_v1",ped:"ang_ped_v1",vis:"ang_vis_v1",usr:"ang_usr_v1",cat:"ang_cat_v1"};
const load = (k,fb) => { try { const v=window[k]; return v?JSON.parse(v):fb; } catch { return fb; } };
const save = (k,d) => { try { window[k]=JSON.stringify(d); } catch {} };

// ═══════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════
const hoy      = () => new Date().toISOString().split("T")[0];
const ahora    = () => new Date().toTimeString().slice(0,5);
const tsId     = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmtGs    = n  => `₲ ${Number(n||0).toLocaleString("es-PY")}`;
const fmtFecha = f  => { try { return new Date(f+"T12:00:00").toLocaleDateString("es-PY",{day:"2-digit",month:"short",year:"numeric"}); } catch { return f; } };
const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const diaHoy   = () => diasSemana[new Date().getDay()];

function calcTotales(items) {
  let b5=0,b10=0,ex=0;
  (items||[]).forEach(it=>{
    const sub=it.precio*it.cantidad;
    if(it.iva===5) b5+=sub;
    else if(it.iva===10) b10+=sub;
    else ex+=sub;
  });
  const i5=Math.round(b5/21), i10=Math.round(b10/11);
  return {base5:b5,base10:b10,exenta:ex,iva5:i5,iva10:i10,totalIva:i5+i10,total:b5+b10+ex};
}

// ═══════════════════════════════════════════════════════════════════
// TEMA — Industrial / Utilitario con acento rojo Edward
// ═══════════════════════════════════════════════════════════════════
const C = {
  r:"#D42B2B", rd:"#A51E1E", rg:"linear-gradient(135deg,#A51E1E,#D42B2B)",
  bg:"#F2F3F5", card:"#FFFFFF", txt:"#111827", mut:"#6B7280",
  grn:"#059669", blu:"#2563EB", amb:"#D97706",
  border:"#E5E7EB",
};

const S = {
  wrap:  {fontFamily:"'DM Sans','Nunito',sans-serif",background:C.bg,minHeight:"100vh",maxWidth:500,margin:"0 auto"},
  hdr:   {background:C.rg,color:"#fff",padding:"14px 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:300,boxShadow:"0 3px 16px rgba(164,30,30,.35)"},
  body:  {padding:"14px 14px 90px"},
  card:  (x={})=>({background:C.card,borderRadius:14,padding:14,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:`1px solid ${C.border}`,...x}),
  btn:   (bg=C.r,x={})=>({background:bg,color:"#fff",border:"none",borderRadius:10,padding:"11px 16px",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"opacity .15s",...x}),
  inp:   (x={})=>({border:`2px solid ${C.border}`,borderRadius:10,padding:"10px 13px",fontSize:14,width:"100%",boxSizing:"border-box",fontFamily:"inherit",outline:"none",background:"#fff",...x}),
  bdg:   (bg=C.rd,x={})=>({background:bg,color:"#fff",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700,display:"inline-block",...x}),
  row:   (x={})=>({display:"flex",alignItems:"center",gap:10,...x}),
  nav:   {position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,background:"#fff",borderTop:`1px solid ${C.border}`,display:"flex",zIndex:400,boxShadow:"0 -3px 12px rgba(0,0,0,.08)"},
  nBtn:  (a)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 0 5px",background:"none",border:"none",cursor:"pointer",color:a?C.r:C.mut,fontWeight:a?800:400,fontSize:10}),
  lbl:   {fontSize:11,fontWeight:700,color:C.mut,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:.5},
  sep:   {borderTop:`1px solid ${C.border}`,margin:"8px 0"},
  tag:   (color="#333")=>({background:color+"22",color,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}),
};

// ─── Componentes base ─────────────────────────────────────────────
const Toast = ({t}) => !t?null:(
  <div style={{position:"fixed",bottom:85,left:"50%",transform:"translateX(-50%)",background:t.tipo==="ok"?C.grn:t.tipo==="err"?C.r:C.amb,color:"#fff",borderRadius:24,padding:"10px 22px",fontWeight:700,fontSize:13,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,.25)",whiteSpace:"nowrap"}}>
    {t.msg}
  </div>
);

const Modal = ({children,onClose,full=false}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:8000,display:"flex",alignItems:full?"stretch":"flex-end",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:C.card,borderRadius:full?"0":"20px 20px 0 0",padding:20,width:"100%",maxWidth:500,maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const Confirm = ({msg,onOk,onCancel}) => (
  <Modal onClose={onCancel}>
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:8}}>⚠️</div>
      <div style={{fontWeight:700,fontSize:16,marginBottom:20,color:C.txt}}>{msg}</div>
      <div style={{display:"flex",gap:10}}>
        <button style={S.btn(C.r,{flex:1})} onClick={onOk}>Confirmar</button>
        <button style={S.btn("#9CA3AF",{flex:1})} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  </Modal>
);

const Pill = ({label,active,color,onClick}) => (
  <button onClick={onClick} style={{padding:"5px 12px",borderRadius:20,border:"none",background:active?(color||C.r):"#F3F4F6",color:active?"#fff":C.mut,fontWeight:active?700:500,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s"}}>
    {label}
  </button>
);

const Hdr = ({title,back,right,usuario,onLogout}) => (
  <div style={S.hdr}>
    {back&&<button onClick={back} style={{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer",lineHeight:1,padding:0,flexShrink:0}}>←</button>}
    <div style={{flex:1,fontWeight:800,fontSize:16,letterSpacing:.2}}>{title}</div>
    {right}
    {usuario&&<button onClick={onLogout} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>Salir</button>}
  </div>
);

// ─── Tabla de totales IVA ─────────────────────────────────────────
const TotalesIVA = ({tots,compact=false}) => (
  <div style={S.card({background:"#FAFAFA",padding:compact?10:14})}>
    {tots.base5>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.mut,marginBottom:3}}><span>Base IVA 5%</span><span>{fmtGs(tots.base5)}</span></div>}
    {tots.base10>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.mut,marginBottom:3}}><span>Base IVA 10%</span><span>{fmtGs(tots.base10)}</span></div>}
    {tots.exenta>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.mut,marginBottom:3}}><span>Exenta</span><span>{fmtGs(tots.exenta)}</span></div>}
    <div style={{...S.sep,margin:"6px 0"}}/>
    {tots.iva5>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.mut,marginBottom:3}}><span>IVA 5%</span><span>{fmtGs(tots.iva5)}</span></div>}
    {tots.iva10>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.mut,marginBottom:3}}><span>IVA 10%</span><span>{fmtGs(tots.iva10)}</span></div>}
    <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:compact?15:17,marginTop:6}}>
      <span>TOTAL</span><span style={{color:C.grn}}>{fmtGs(tots.total)}</span>
    </div>
  </div>
);

// ─── Detalle de pedido ────────────────────────────────────────────
const DetallePedido = ({ped,onClose,onEliminar,esAdmin,titulo="Detalle del Pedido"}) => {
  const tots = calcTotales(ped.items);
  const totsdev = calcTotales(ped.devoluciones||[]);
  return (
    <>
      <div style={S.row({marginBottom:12})}>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:16,color:C.txt}}>{ped.clienteNombre}</div>
          <div style={{fontSize:12,color:C.mut}}>Cód: {ped.clienteCodigo} · {fmtFecha(ped.fecha)}</div>
          <div style={{fontSize:11,color:C.mut}}>Vendedor: {ped.vendedorNombre} · {ped.horaVisita||""}</div>
          {ped.zona&&<span style={S.tag(ZONAS.find(z=>z.id===ped.zona)?.color||"#666")}>{ZONAS.find(z=>z.id===ped.zona)?.nombre}</span>}
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:C.mut}}>×</button>
      </div>

      {/* Items pedido */}
      <div style={{fontWeight:700,fontSize:12,color:C.mut,marginBottom:6,textTransform:"uppercase"}}>📦 Pedido</div>
      <div style={{overflowX:"auto",marginBottom:10}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:`2px solid ${C.r}`,color:C.mut}}>
            <th style={{textAlign:"left",padding:"4px 3px"}}>Cód</th>
            <th style={{textAlign:"left",padding:"4px 3px"}}>Descripción</th>
            <th style={{textAlign:"center",padding:"4px 3px"}}>Cant</th>
            <th style={{textAlign:"right",padding:"4px 3px"}}>P.Unit</th>
            <th style={{textAlign:"right",padding:"4px 3px"}}>Total</th>
          </tr></thead>
          <tbody>
            {(ped.items||[]).map(it=>(
              <tr key={it.codigo} style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"5px 3px"}}><span style={S.bdg(C.rd,{fontSize:10})}>{it.codigo}</span></td>
                <td style={{padding:"5px 3px",fontWeight:600}}>{it.nombre}</td>
                <td style={{padding:"5px 3px",textAlign:"center",fontWeight:800,color:C.r}}>{it.cantidad}</td>
                <td style={{padding:"5px 3px",textAlign:"right",color:C.mut}}>{fmtGs(it.precio)}</td>
                <td style={{padding:"5px 3px",textAlign:"right",fontWeight:700}}>{fmtGs(it.precio*it.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TotalesIVA tots={tots} compact/>

      {/* Devoluciones */}
      {(ped.devoluciones||[]).length>0&&<>
        <div style={{fontWeight:700,fontSize:12,color:C.amb,margin:"14px 0 6px",textTransform:"uppercase"}}>↩️ Nota de Crédito — Devolución de Vencidos</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:8}}>
          <thead><tr style={{borderBottom:`2px solid ${C.amb}`,color:C.mut}}>
            <th style={{textAlign:"left",padding:"4px 3px"}}>Producto</th>
            <th style={{textAlign:"center",padding:"4px 3px"}}>Cant</th>
            <th style={{textAlign:"right",padding:"4px 3px"}}>Total NC</th>
          </tr></thead>
          <tbody>
            {ped.devoluciones.map(it=>(
              <tr key={it.codigo} style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"5px 3px",fontWeight:600}}>{it.nombre} <span style={S.bdg(C.amb,{fontSize:9})}>{it.codigo}</span></td>
                <td style={{padding:"5px 3px",textAlign:"center",fontWeight:800,color:C.amb}}>{it.cantidad}</td>
                <td style={{padding:"5px 3px",textAlign:"right",fontWeight:700,color:C.amb}}>{fmtGs(it.precio*it.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{...S.card({background:"#FFF8EC",padding:10}),display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:14}}>
          <span style={{color:C.amb}}>TOTAL NOTA DE CRÉDITO</span>
          <span style={{color:C.amb}}>{fmtGs(totsdev.total)}</span>
        </div>
        <div style={{...S.card({background:"#F0FDF4",padding:10}),display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:15,marginTop:6}}>
          <span>NETO A COBRAR</span>
          <span style={{color:C.grn}}>{fmtGs(tots.total-totsdev.total)}</span>
        </div>
      </>}

      {esAdmin&&onEliminar&&(
        <button style={S.btn(C.r,{width:"100%",marginTop:12})} onClick={onEliminar}>🗑 Eliminar pedido</button>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [clientes,  setClientes]  = useState(()=>load(ST.cli,[]));
  const [pedidos,   setPedidos]   = useState(()=>load(ST.ped,[]));
  const [visitas,   setVisitas]   = useState(()=>load(ST.vis,[]));
  const [usuarios,  setUsuarios]  = useState(()=>load(ST.usr,USUARIOS_INIT));
  const [catalogo,  setCatalogo]  = useState(()=>load(ST.cat,CATALOGO));

  const [usuario,   setUsuario]   = useState(null);
  const [vista,     setVista]     = useState("login");
  const [tab,       setTab]       = useState("hoy");

  // Jornada activa
  const [jornadaActiva, setJornadaActiva] = useState(null);
  const [recorrido,     setRecorrido]     = useState([]); // [{lat,lng,ts}]
  const [gpsActivo,     setGpsActivo]     = useState(false);
  const gpsWatchRef = useRef(null);

  // Pedido en curso
  const [pedCli,    setPedCli]    = useState(null);
  const [pedItems,  setPedItems]  = useState([]);
  const [devItems,  setDevItems]  = useState([]);
  const [pedGPS,    setPedGPS]    = useState(null);
  const [pedTab,    setPedTab]    = useState("pedido"); // pedido | devolucion
  const [prodSel,   setProdSel]   = useState(null);
  const [devSel,    setDevSel]    = useState(null);
  const [cantMap,   setCantMap]   = useState({});
  const [devMap,    setDevMap]    = useState({});

  // Búsquedas / filtros
  const [busqPedCli,setBusqPedCli]=useState("");
  const [busqCat,   setBusqCat]   = useState("");
  const [filCat,    setFilCat]    = useState("Todos");
  const [busqCli,   setBusqCli]   = useState("");
  const [busqHist,  setBusqHist]  = useState("");
  const [impTxt,    setImpTxt]    = useState("");

  // UI
  const [modal,     setModal]     = useState(null);
  const [detPed,    setDetPed]    = useState(null);
  const [confirm,   setConfirm]   = useState(null);
  const [toast,     setToast]     = useState(null);
  const [fCli,      setFCli]      = useState({codigo:"",razonSocial:"",zona:"",telefono:"",lat:"",lng:""});
  const [login,     setLogin]     = useState({userId:"",pin:""});

  useEffect(()=>save(ST.cli,clientes),[clientes]);
  useEffect(()=>save(ST.ped,pedidos),[pedidos]);
  useEffect(()=>save(ST.vis,visitas),[visitas]);
  useEffect(()=>save(ST.usr,usuarios),[usuarios]);
  useEffect(()=>save(ST.cat,catalogo),[catalogo]);

  const msg = (m,tipo="ok")=>{ setToast({msg:m,tipo}); setTimeout(()=>setToast(null),2600); };
  const esAdmin = usuario?.rol==="admin";

  // ── GPS ────────────────────────────────────────────────────────
  const iniciarGPS = useCallback(()=>{
    if(!navigator.geolocation){msg("GPS no disponible en este dispositivo","err");return;}
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      pos=>{
        const pt={lat:pos.coords.latitude,lng:pos.coords.longitude,ts:Date.now()};
        setRecorrido(prev=>[...prev,pt]);
      },
      err=>msg("Error GPS: "+err.message,"err"),
      {enableHighAccuracy:true,maximumAge:10000,timeout:15000}
    );
    setGpsActivo(true);
  },[]);

  const detenerGPS = useCallback(()=>{
    if(gpsWatchRef.current!==null){ navigator.geolocation.clearWatch(gpsWatchRef.current); gpsWatchRef.current=null; }
    setGpsActivo(false);
  },[]);

  const getPos = ()=>new Promise((res,rej)=>{
    if(!navigator.geolocation){rej("no gps");return;}
    navigator.geolocation.getCurrentPosition(pos=>res({lat:pos.coords.latitude,lng:pos.coords.longitude}),rej,{enableHighAccuracy:true,timeout:10000});
  });

  // ── JORNADA ────────────────────────────────────────────────────
  const iniciarJornada = async()=>{
    let gpsPos=null;
    try { gpsPos=await getPos(); } catch {}
    const j={
      id:tsId(), vendedorId:usuario.id, vendedorNombre:usuario.nombre,
      fecha:hoy(), horaInicio:ahora(), horaFin:null,
      zonasDia: RUTA_SEMANAL[diaHoy()]?.zonas||[],
      focoDia:  RUTA_SEMANAL[diaHoy()]?.foco||"",
      posInicio:gpsPos, estado:"activa",
    };
    setJornadaActiva(j);
    setRecorrido(gpsPos?[{...gpsPos,ts:Date.now()}]:[]);
    iniciarGPS();
    msg("Jornada iniciada ✓");
  };

  const finalizarJornada = ()=>{
    if(!jornadaActiva) return;
    detenerGPS();
    const jFin={...jornadaActiva,horaFin:ahora(),recorrido,estado:"finalizada"};
    setVisitas(prev=>[...prev,jFin]);
    setJornadaActiva(null);
    setRecorrido([]);
    setVista("home");
    msg("Jornada finalizada y guardada ✓");
  };

  // ── LOGIN ──────────────────────────────────────────────────────
  const doLogin=()=>{
    const u=usuarios.find(x=>x.id===login.userId&&x.pin===login.pin);
    if(!u){msg("Usuario o PIN incorrecto","err");return;}
    setUsuario(u); setVista("home"); setLogin({userId:"",pin:""}); msg(`Bienvenido, ${u.nombre}`);
  };

  // ── CLIENTES ───────────────────────────────────────────────────
  const guardarCli=()=>{
    if(!fCli.codigo||!fCli.razonSocial){msg("Código y razón social requeridos","err");return;}
    if(clientes.find(c=>c.codigo===fCli.codigo)){msg("Código ya existe","err");return;}
    setClientes(p=>[...p,{...fCli,id:tsId()}]);
    setFCli({codigo:"",razonSocial:"",zona:"",telefono:"",lat:"",lng:""}); setModal(null); msg("Cliente creado");
  };

  const importarClis=()=>{
    const lines=impTxt.trim().split("\n").filter(Boolean);
    const nuevos=[]; let err=0;
    lines.forEach(l=>{
      const p=l.split(/[,;\t]+/).map(s=>s.trim());
      if(p.length<2){err++;return;}
      const [codigo,razonSocial,zona="",telefono="",lat="",lng=""]=p;
      if(!codigo||!razonSocial){err++;return;}
      if(!clientes.find(c=>c.codigo===codigo)&&!nuevos.find(c=>c.codigo===codigo))
        nuevos.push({id:tsId(),codigo,razonSocial,zona,telefono,lat:parseFloat(lat)||"",lng:parseFloat(lng)||""});
    });
    setClientes(p=>[...p,...nuevos]);
    setImpTxt(""); setModal(null); msg(`${nuevos.length} clientes importados${err?` (${err} errores)`:""}`);
  };

  // ── PEDIDOS ────────────────────────────────────────────────────
  const iniciarPedido=async(cli)=>{
    if(!jornadaActiva){msg("Debes iniciar la jornada primero","err");return;}
    let gpsPos=null;
    try { gpsPos=await getPos(); } catch {}
    setPedCli(cli); setPedItems([]); setDevItems([]);
    setPedGPS(gpsPos); setProdSel(null); setDevSel(null);
    setCantMap({}); setDevMap({});
    setBusqCat(""); setFilCat("Todos"); setPedTab("pedido");
    setVista("pedido");
  };

  const agregarItem=(prod,esDevolucion=false)=>{
    const mapa=esDevolucion?devMap:cantMap;
    const setMapa=esDevolucion?setDevMap:setCantMap;
    const setItems=esDevolucion?setDevItems:setPedItems;
    const cant=parseInt(mapa[prod.codigo]||"");
    if(!cant||cant<=0){msg("Ingresá una cantidad","err");return;}
    setItems(prev=>{
      const idx=prev.findIndex(i=>i.codigo===prod.codigo);
      if(idx>=0){const u=[...prev];u[idx]={...u[idx],cantidad:u[idx].cantidad+cant};return u;}
      return [...prev,{codigo:prod.codigo,nombre:prod.nombre,categoria:prod.categoria,precio:prod.precio,iva:prod.iva||10,cantidad:cant}];
    });
    setMapa(p=>({...p,[prod.codigo]:""}));
    esDevolucion?setDevSel(null):setProdSel(null);
    msg(`${cant}× ${prod.nombre} ${esDevolucion?"(dev.)":""}✓`);
  };

  const guardarPedido=()=>{
    if(!pedCli||pedItems.length===0){msg("El pedido está vacío","err");return;}
    const tots=calcTotales(pedItems);
    const totsdev=calcTotales(devItems);
    const nuevo={
      id:tsId(), fecha:hoy(), horaVisita:ahora(),
      clienteCodigo:pedCli.codigo, clienteNombre:pedCli.razonSocial,
      clienteZona:pedCli.zona||"", zona:pedCli.zona||"",
      vendedorId:usuario.id, vendedorNombre:usuario.nombre,
      jornadaId:jornadaActiva?.id,
      items:pedItems, devoluciones:devItems,
      gps:pedGPS,
      ...tots,
      totalDevolucion:totsdev.total,
      neto:tots.total-totsdev.total,
    };
    setPedidos(p=>[...p,nuevo]);
    setPedCli(null); setPedItems([]); setDevItems([]);
    setVista("ruta");
    msg(`✓ Pedido de ${pedCli.razonSocial} guardado`);
  };

  // ── FILTROS ────────────────────────────────────────────────────
  const catsDisp  = useMemo(()=>["Todos",...new Set(catalogo.map(p=>p.categoria))],[catalogo]);
  const catFilt   = useMemo(()=>catalogo.filter(p=>{
    const mC=filCat==="Todos"||p.categoria===filCat;
    const mB=!busqCat||p.nombre.toLowerCase().includes(busqCat.toLowerCase())||p.codigo.toLowerCase().includes(busqCat.toLowerCase());
    return mC&&mB;
  }),[catalogo,filCat,busqCat]);

  const cliPedFilt = useMemo(()=>clientes.filter(c=>
    !busqPedCli||c.razonSocial.toLowerCase().includes(busqPedCli.toLowerCase())||c.codigo.toLowerCase().includes(busqPedCli.toLowerCase())
  ),[clientes,busqPedCli]);

  const cliFilt = useMemo(()=>clientes.filter(c=>
    !busqCli||c.razonSocial.toLowerCase().includes(busqCli.toLowerCase())||c.codigo.includes(busqCli)
  ),[clientes,busqCli]);

  const pedFilt = useMemo(()=>{
    const h=hoy();
    let base=[...pedidos].sort((a,b)=>b.fecha.localeCompare(a.fecha));
    if(tab==="hoy") base=base.filter(p=>p.fecha===h);
    if(tab==="semana"){const d=new Date();d.setDate(d.getDate()-7);base=base.filter(p=>new Date(p.fecha+"T12:00:00")>=d);}
    if(tab==="mes") base=base.filter(p=>p.fecha.startsWith(h.slice(0,7)));
    if(!esAdmin) base=base.filter(p=>p.vendedorId===usuario?.id);
    if(busqHist) base=base.filter(p=>p.clienteNombre.toLowerCase().includes(busqHist.toLowerCase())||p.clienteCodigo.includes(busqHist));
    return base;
  },[pedidos,tab,busqHist,esAdmin,usuario]);

  // Picking consolidado
  const picking = useMemo(()=>{
    const map={};
    pedFilt.forEach(ped=>(ped.items||[]).forEach(it=>{
      if(!map[it.codigo])map[it.codigo]={...it,cantidad:0,totalGs:0,clientes:[]};
      map[it.codigo].cantidad+=it.cantidad;
      map[it.codigo].totalGs+=it.precio*it.cantidad;
      if(!map[it.codigo].clientes.includes(ped.clienteNombre)) map[it.codigo].clientes.push(ped.clienteNombre);
    }));
    return Object.values(map).sort((a,b)=>b.cantidad-a.cantidad);
  },[pedFilt]);

  // ── NAV ────────────────────────────────────────────────────────
  const navItems=[
    {id:"home",    icon:"🏠", label:"Inicio"},
    {id:"ruta",    icon:"📍", label:"Ruta"},
    {id:"picking", icon:"📦", label:"Picking"},
    ...(esAdmin?[
      {id:"clientes",icon:"🏪",label:"Clientes"},
      {id:"informes",icon:"📊",label:"Informes"},
    ]:[
      {id:"informes",icon:"📊",label:"Mis ventas"},
    ]),
  ];

  const NavBar=()=>(
    <div style={S.nav}>
      {navItems.map(n=>(
        <button key={n.id} style={S.nBtn(vista===n.id||(vista==="pedido"&&n.id==="ruta")||(vista==="pedido_sel"&&n.id==="ruta"))}
          onClick={()=>setVista(n.id)}>
          <span style={{fontSize:18}}>{n.icon}</span><span>{n.label}</span>
        </button>
      ))}
    </div>
  );

  const TabsPeriodo=()=>(
    <div style={{...S.card({padding:8}),display:"flex",gap:4,marginBottom:12}}>
      {[["hoy","Hoy"],["semana","7 días"],["mes","Mes"],["todo","Todo"]].map(([k,l])=>(
        <button key={k} style={{flex:1,padding:"8px 4px",background:tab===k?C.r:"transparent",color:tab===k?"#fff":C.mut,border:"none",borderRadius:8,fontWeight:tab===k?700:500,fontSize:12,cursor:"pointer"}}
          onClick={()=>setTab(k)}>{l}</button>
      ))}
    </div>
  );

  const logout=()=>{
    detenerGPS(); setJornadaActiva(null); setRecorrido([]);
    setUsuario(null); setVista("login");
  };

  // ════════════════════════════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════════════════════════════
  if(vista==="login") return (
    <div style={S.wrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}button:active{opacity:.7}input:focus,select:focus{border-color:${C.r}!important;outline:none}`}</style>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`linear-gradient(160deg,${C.rd} 0%,#0F0F0F 100%)`,padding:24}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:60,marginBottom:4}}>🍞</div>
          <div style={{color:"#fff",fontSize:28,fontWeight:900,letterSpacing:1}}>ANGULAR SA</div>
          <div style={{color:"rgba(255,255,255,.5)",fontSize:13,marginTop:2}}>Distribución · Productos Edward</div>
        </div>
        <div style={{background:C.card,borderRadius:20,padding:26,width:"100%",maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:16,color:C.txt}}>Iniciar sesión</div>
          <label style={S.lbl}>Usuario</label>
          <select style={{...S.inp(),marginBottom:12}} value={login.userId} onChange={e=>setLogin(p=>({...p,userId:e.target.value}))}>
            <option value="">Seleccioná...</option>
            {usuarios.map(u=><option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>)}
          </select>
          <label style={S.lbl}>PIN</label>
          <input type="password" maxLength={6} style={{...S.inp(),marginBottom:18}} placeholder="••••"
            value={login.pin} onChange={e=>setLogin(p=>({...p,pin:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
          <button style={S.btn(C.r,{width:"100%",padding:14,fontSize:15})} onClick={doLogin}>Ingresar →</button>
        </div>
        <Toast t={toast}/>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // HOME
  // ════════════════════════════════════════════════════════════════
  if(vista==="home"){
    const pedHoy=pedidos.filter(p=>p.fecha===hoy());
    const miosPedHoy=pedHoy.filter(p=>p.vendedorId===usuario.id);
    const totHoy=pedHoy.reduce((s,p)=>s+p.total,0);
    const rutaHoy=RUTA_SEMANAL[diaHoy()];
    return (
      <div style={S.wrap}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}button:active{opacity:.7}input:focus,select:focus,textarea:focus{border-color:${C.r}!important;outline:none}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#DDD;border-radius:4px}`}</style>
        <Hdr title="🍞 Angular SA" usuario={usuario} onLogout={logout}/>
        <div style={S.body}>

          {/* Banner jornada */}
          {!jornadaActiva ? (
            <div style={S.card({background:C.rg,color:"#fff",padding:16})}>
              <div style={{fontSize:11,opacity:.75,marginBottom:2}}>{diaHoy().toUpperCase()} · {fmtFecha(hoy())}</div>
              {rutaHoy&&<div style={{fontSize:13,opacity:.8,marginBottom:10}}>🗺 {rutaHoy.foco}</div>}
              <button style={S.btn("rgba(255,255,255,.25)",{width:"100%",fontSize:14,padding:13,border:"1px solid rgba(255,255,255,.4)"})} onClick={iniciarJornada}>
                ▶ Iniciar jornada del día
              </button>
            </div>
          ):(
            <div style={S.card({background:"#F0FDF4",borderLeft:`4px solid ${C.grn}`,padding:14})}>
              <div style={S.row({marginBottom:8})}>
                <div style={{width:10,height:10,borderRadius:"50%",background:C.grn,boxShadow:`0 0 0 3px ${C.grn}44`,animation:"pulse 1.5s infinite"}}/>
                <div style={{fontWeight:800,fontSize:14,color:C.grn}}>Jornada activa desde {jornadaActiva.horaInicio}</div>
              </div>
              {gpsActivo&&<div style={{fontSize:11,color:C.grn,marginBottom:8}}>📍 GPS activo · {recorrido.length} puntos registrados</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <button style={S.btn(C.r,{fontSize:12,padding:"9px 8px"})} onClick={()=>setVista("ruta")}>
                  📍 Ver ruta
                </button>
                <button style={S.btn("#6B7280",{fontSize:12,padding:"9px 8px"})} onClick={()=>setConfirm({msg:"¿Finalizar la jornada del día?",fn:finalizarJornada})}>
                  ⏹ Finalizar
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:4}}>
            {[[pedHoy.length,"Pedidos hoy",C.r],[fmtGs(totHoy),"Ventas hoy",C.grn],[miosPedHoy.length,"Mis pedidos",C.blu]].map(([v,l,col])=>(
              <div key={l} style={S.card({textAlign:"center",padding:12})}>
                <div style={{fontSize:l==="Ventas hoy"?13:22,fontWeight:900,color:col}}>{v}</div>
                <div style={{fontSize:10,color:C.mut,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Ruta sugerida del día */}
          {rutaHoy&&(
            <div style={S.card({padding:14})}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:C.txt}}>🗓 Ruta de hoy — {diaHoy()}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {rutaHoy.zonas.map(zid=>{
                  const z=ZONAS.find(x=>x.id===zid);
                  return z?<span key={zid} style={S.tag(z.color)}>{z.nombre}</span>:null;
                })}
              </div>
              <div style={{fontSize:12,color:C.mut,marginTop:6}}>{rutaHoy.foco}</div>
            </div>
          )}

          {/* Mis pedidos de hoy */}
          {miosPedHoy.length>0&&<>
            <div style={{fontWeight:800,fontSize:14,color:C.txt,margin:"14px 0 8px"}}>Mis pedidos de hoy</div>
            {miosPedHoy.slice(-5).reverse().map(p=>(
              <div key={p.id} style={{...S.card(),display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer"}} onClick={()=>{setDetPed(p);setModal("det");}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{p.clienteNombre}</div>
                  <div style={{fontSize:11,color:C.mut}}>#{p.clienteCodigo} · {p.items.length} prod. · {p.horaVisita}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800,fontSize:13,color:C.grn}}>{fmtGs(p.total)}</div>
                  {(p.devoluciones||[]).length>0&&<div style={{fontSize:10,color:C.amb}}>NC: {fmtGs(p.totalDevolucion)}</div>}
                </div>
              </div>
            ))}
          </>}
        </div>

        {modal==="det"&&detPed&&<Modal onClose={()=>setModal(null)}><DetallePedido ped={detPed} onClose={()=>setModal(null)} esAdmin={esAdmin} onEliminar={esAdmin?()=>setConfirm({msg:`¿Eliminar pedido de ${detPed.clienteNombre}?`,fn:()=>{setPedidos(p=>p.filter(x=>x.id!==detPed.id));setModal(null);msg("Eliminado","warning");}}):null}/></Modal>}
        <NavBar/><Toast t={toast}/>
        {confirm&&<Confirm msg={confirm.msg} onOk={()=>{confirm.fn();setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
        <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 3px ${C.grn}44}50%{box-shadow:0 0 0 6px ${C.grn}22}}`}</style>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // RUTA — lista de clientes + GPS
  // ════════════════════════════════════════════════════════════════
  if(vista==="ruta"||vista==="pedido_sel"){
    const pedHoy=pedidos.filter(p=>p.fecha===hoy()&&p.vendedorId===usuario.id);
    const clientesConPedido=new Set(pedHoy.map(p=>p.clienteCodigo));
    const rutaHoy=RUTA_SEMANAL[diaHoy()];
    const clientesRuta=rutaHoy
      ? clientes.filter(c=>rutaHoy.zonas.includes(c.zona))
      : clientes;

    return (
      <div style={S.wrap}>
        <Hdr title="📍 Ruta del Día" usuario={usuario} onLogout={logout}
          right={jornadaActiva&&<span style={{...S.bdg(C.grn,{fontSize:10})}}>● ACTIVA</span>}/>
        <div style={S.body}>

          {/* Banner GPS */}
          {jornadaActiva&&(
            <div style={S.card({background:gpsActivo?"#F0FDF4":"#FFF8EC",borderLeft:`4px solid ${gpsActivo?C.grn:C.amb}`,padding:12})}>
              <div style={S.row()}>
                <div style={{fontSize:20}}>{gpsActivo?"📍":"⚠️"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:gpsActivo?C.grn:C.amb}}>
                    {gpsActivo?"GPS activo — recorrido registrando":"GPS inactivo"}
                  </div>
                  <div style={{fontSize:11,color:C.mut}}>{recorrido.length} puntos · Inicio: {jornadaActiva.horaInicio}</div>
                </div>
                {!gpsActivo&&<button style={S.btn(C.amb,{padding:"7px 12px",fontSize:12})} onClick={iniciarGPS}>Activar</button>}
              </div>
            </div>
          )}

          {/* Mapa simplificado — zona del día */}
          {rutaHoy&&(
            <div style={S.card({padding:14})}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:8}}>🗺 Zonas de hoy</div>
              {rutaHoy.zonas.map(zid=>{
                const z=ZONAS.find(x=>x.id===zid);
                const cliZona=clientes.filter(c=>c.zona===zid);
                const pedZona=pedHoy.filter(p=>cliZona.map(c=>c.codigo).includes(p.clienteCodigo));
                return z?(
                  <div key={zid} style={{...S.card({padding:10,marginBottom:6,borderLeft:`4px solid ${z.color}`})}}>
                    <div style={S.row()}>
                      <span style={S.tag(z.color)}>{z.nombre}</span>
                      <div style={{flex:1,fontSize:12,color:C.mut}}>{z.referencia}</div>
                      <span style={{fontSize:12,fontWeight:700}}>{pedZona.length}/{cliZona.length}</span>
                    </div>
                  </div>
                ):null;
              })}
              <div style={{fontSize:11,color:C.mut,marginTop:4}}>Progreso: {pedHoy.length} pedidos tomados hoy</div>
            </div>
          )}

          {/* Buscador + lista clientes */}
          {!jornadaActiva&&(
            <div style={{...S.card({background:"#FFF8EC",padding:12}),fontSize:13,color:C.amb,fontWeight:600}}>
              ⚠️ Iniciá la jornada desde Inicio para poder tomar pedidos con GPS
            </div>
          )}

          <div style={S.card({padding:12})}>
            <input style={S.inp()} placeholder="🔍 Buscar cliente..." value={busqPedCli} onChange={e=>setBusqPedCli(e.target.value)}/>
          </div>

          {(busqPedCli?cliPedFilt:clientesRuta).slice(0,40).map(c=>{
            const tienePedido=clientesConPedido.has(c.codigo);
            const pedCli=pedHoy.find(p=>p.clienteCodigo===c.codigo);
            const zona=ZONAS.find(z=>z.id===c.zona);
            return (
              <div key={c.id} style={{...S.card({borderLeft:`4px solid ${tienePedido?C.grn:C.border}`,padding:"12px 14px"})}}>
                <div style={S.row()}>
                  <div style={{flex:1}}>
                    <div style={S.row({marginBottom:3})}>
                      <span style={S.bdg(C.r,{fontSize:10})}>#{c.codigo}</span>
                      {zona&&<span style={S.tag(zona.color,{fontSize:10})}>{zona.nombre}</span>}
                      {tienePedido&&<span style={S.tag(C.grn,{fontSize:10})}>✓ Pedido</span>}
                    </div>
                    <div style={{fontWeight:700,fontSize:14}}>{c.razonSocial}</div>
                    {pedCli&&<div style={{fontSize:11,color:C.grn}}>{pedCli.items.length} prod. · {fmtGs(pedCli.total)}</div>}
                  </div>
                  <button style={S.btn(tienePedido?C.grn:C.r,{padding:"9px 13px",fontSize:12})}
                    onClick={()=>iniciarPedido(c)}>
                    {tienePedido?"✎ Editar":"📝 Pedido"}
                  </button>
                </div>
              </div>
            );
          })}

          {clientes.length===0&&<div style={{...S.card(),textAlign:"center",color:C.mut,padding:36}}>
            Sin clientes. Cargalos en la sección Clientes.
          </div>}
        </div>
        <NavBar/><Toast t={toast}/>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // PEDIDO — productos + devoluciones
  // ════════════════════════════════════════════════════════════════
  if(vista==="pedido"){
    const tots=calcTotales(pedItems);
    const totsdev=calcTotales(devItems);
    const esDev=pedTab==="devolucion";
    const itemsActivos=esDev?devItems:pedItems;
    const prodActivoSel=esDev?devSel:prodSel;
    const setProdActivo=esDev?setDevSel:setProdSel;
    const mapaActivo=esDev?devMap:cantMap;
    const setMapaActivo=esDev?setDevMap:setCantMap;

    return (
      <div style={S.wrap}>
        <Hdr title={pedCli?.razonSocial||"Pedido"} back={()=>{setPedCli(null);setVista("ruta");}}/>
        <div style={S.body}>

          {/* Tab pedido / devolución */}
          <div style={{...S.card({padding:6}),display:"flex",gap:4,marginBottom:10}}>
            <button style={{flex:1,padding:"10px 4px",background:pedTab==="pedido"?C.r:"transparent",color:pedTab==="pedido"?"#fff":C.mut,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={()=>setPedTab("pedido")}>
              📦 Pedido {pedItems.length>0&&`(${pedItems.length})`}
            </button>
            <button style={{flex:1,padding:"10px 4px",background:pedTab==="devolucion"?C.amb:"transparent",color:pedTab==="devolucion"?"#fff":C.mut,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={()=>setPedTab("devolucion")}>
              ↩️ Devolución {devItems.length>0&&`(${devItems.length})`}
            </button>
          </div>

          {/* GPS badge */}
          {pedGPS&&<div style={{...S.card({padding:8,marginBottom:6}),fontSize:11,color:C.grn,display:"flex",alignItems:"center",gap:6}}>
            <span>📍</span><span>Ubicación registrada: {pedGPS.lat.toFixed(5)}, {pedGPS.lng.toFixed(5)}</span>
          </div>}

          {/* Resumen items activos */}
          {itemsActivos.length>0&&(
            <div style={S.card({borderLeft:`4px solid ${esDev?C.amb:C.grn}`,padding:14,marginBottom:8})}>
              <div style={{fontWeight:800,fontSize:12,color:esDev?C.amb:C.grn,marginBottom:8}}>
                {esDev?"↩️ Devoluciones":"🛒 Pedido en curso"} · {itemsActivos.length} ítems
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{color:C.mut,borderBottom:`1px solid ${C.border}`}}>
                  <th style={{textAlign:"left",padding:"3px 2px"}}>Producto</th>
                  <th style={{textAlign:"center",padding:"3px 2px"}}>Cant</th>
                  <th style={{textAlign:"right",padding:"3px 2px"}}>Subtotal</th>
                  <th style={{width:20}}/>
                </tr></thead>
                <tbody>
                  {itemsActivos.map(it=>(
                    <tr key={it.codigo} style={{borderBottom:`1px solid ${C.border}`}}>
                      <td style={{padding:"5px 2px"}}>
                        <div style={{fontWeight:700,fontSize:12}}>{it.nombre}</div>
                        <span style={S.bdg(C.rd,{fontSize:9})}>{it.codigo}</span>
                      </td>
                      <td style={{textAlign:"center",fontWeight:800,color:esDev?C.amb:C.r,padding:"5px 2px"}}>×{it.cantidad}</td>
                      <td style={{textAlign:"right",fontWeight:700,padding:"5px 2px",fontSize:12}}>{fmtGs(it.precio*it.cantidad)}</td>
                      <td style={{textAlign:"center"}}>
                        <button onClick={()=>(esDev?setDevItems:setPedItems)(p=>p.filter(x=>x.codigo!==it.codigo))} style={{background:"none",border:"none",color:"#CCC",fontSize:16,cursor:"pointer",padding:"3px"}}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={S.sep}/>
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:15}}>
                <span>{esDev?"TOTAL NC":"TOTAL"}</span>
                <span style={{color:esDev?C.amb:C.grn}}>{fmtGs(esDev?totsdev.total:tots.total)}</span>
              </div>
            </div>
          )}

          {/* Botón guardar */}
          {pedItems.length>0&&(
            <button style={S.btn(C.grn,{width:"100%",padding:13,fontSize:14,marginBottom:8})} onClick={guardarPedido}>
              💾 Confirmar pedido{devItems.length>0?" + devolución":""}
            </button>
          )}

          {/* Buscador catálogo */}
          <div style={S.card({padding:12})}>
            <input style={S.inp()} placeholder={`🔍 ${esDev?"Buscar producto a devolver...":"Buscar producto..."}`}
              value={busqCat} onChange={e=>setBusqCat(e.target.value)}/>
            <div style={{display:"flex",gap:6,overflowX:"auto",marginTop:8,paddingBottom:2}}>
              {catsDisp.map(c=><Pill key={c} label={c} active={filCat===c} onClick={()=>setFilCat(c)}/>)}
            </div>
          </div>

          {/* Lista productos */}
          {catFilt.map(prod=>(
            <div key={prod.codigo} style={S.card({border:prodActivoSel?.codigo===prod.codigo?`2px solid ${esDev?C.amb:C.r}`:`2px solid transparent`,padding:"11px 13px"})}>
              <div style={S.row()}>
                <span style={S.bdg("#374151")}>{prod.codigo}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{prod.nombre}</div>
                  <div style={{fontSize:11,color:C.mut}}>{prod.categoria} · <b style={{color:C.txt}}>{fmtGs(prod.precio)}</b> · IVA {prod.iva}%</div>
                </div>
                <button style={S.btn(prodActivoSel?.codigo===prod.codigo?C.mut:(esDev?C.amb:C.r),{padding:"8px 11px",fontSize:12})}
                  onClick={()=>setProdActivo(prodActivoSel?.codigo===prod.codigo?null:prod)}>
                  {prodActivoSel?.codigo===prod.codigo?"✕":"+ Agregar"}
                </button>
              </div>
              {prodActivoSel?.codigo===prod.codigo&&(
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <input type="number" min="1" style={S.inp({width:90,textAlign:"center"})}
                    placeholder="Cant." value={mapaActivo[prod.codigo]||""}
                    onChange={e=>setMapaActivo(p=>({...p,[prod.codigo]:e.target.value}))}
                    autoFocus onKeyDown={e=>e.key==="Enter"&&agregarItem(prod,esDev)}/>
                  {mapaActivo[prod.codigo]&&parseInt(mapaActivo[prod.codigo])>0&&(
                    <div style={{flex:1,background:"#F9FAFB",borderRadius:10,padding:"0 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:11,color:C.mut}}>Subtotal</span>
                      <span style={{fontWeight:800,fontSize:13}}>{fmtGs(prod.precio*parseInt(mapaActivo[prod.codigo]))}</span>
                    </div>
                  )}
                  <button style={S.btn(esDev?C.amb:C.grn)} onClick={()=>agregarItem(prod,esDev)}>✓</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <Toast t={toast}/>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // PICKING — resumen para depósito
  // ════════════════════════════════════════════════════════════════
  if(vista==="picking"){
    const totGral=pedFilt.reduce((s,p)=>s+(p.total||0),0);
    const totDev=pedFilt.reduce((s,p)=>s+(p.totalDevolucion||0),0);
    const categorias=[...new Set(picking.map(p=>p.categoria))];

    return (
      <div style={S.wrap}>
        <Hdr title="📦 Picking" usuario={usuario} onLogout={logout}/>
        <div style={S.body}>
          <TabsPeriodo/>

          {/* KPIs */}
          <div style={S.card({background:"#111",color:"#fff",padding:16})}>
            <div style={{fontSize:11,opacity:.6,marginBottom:4}}>RESUMEN DEL PERÍODO</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><div style={{fontSize:22,fontWeight:900}}>{pedFilt.length}</div><div style={{fontSize:11,opacity:.6}}>pedidos</div></div>
              <div><div style={{fontSize:16,fontWeight:900,color:"#4ADE80"}}>{fmtGs(totGral)}</div><div style={{fontSize:11,opacity:.6}}>total ventas</div></div>
              <div><div style={{fontSize:22,fontWeight:900,color:"#FCD34D"}}>{picking.length}</div><div style={{fontSize:11,opacity:.6}}>SKUs a preparar</div></div>
              <div><div style={{fontSize:14,fontWeight:900,color:"#FCA5A5"}}>{fmtGs(totDev)}</div><div style={{fontSize:11,opacity:.6}}>devoluciones</div></div>
            </div>
          </div>

          {/* Picking por categoría */}
          {picking.length===0
            ? <div style={{...S.card(),textAlign:"center",color:C.mut,padding:36}}>Sin pedidos en este período</div>
            : categorias.map(cat=>(
              <div key={cat}>
                <div style={{fontWeight:800,fontSize:13,color:C.mut,margin:"14px 0 6px",textTransform:"uppercase",letterSpacing:.5,paddingLeft:4}}>
                  {cat}
                </div>
                {picking.filter(p=>p.categoria===cat).map(it=>(
                  <div key={it.codigo} style={{...S.card({padding:"11px 14px"}),display:"flex",alignItems:"center",gap:10}}>
                    <span style={S.bdg(C.rd)}>{it.codigo}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{it.nombre}</div>
                      <div style={{fontSize:11,color:C.mut}}>{it.clientes.length} cliente{it.clientes.length!==1?"s":""} · {fmtGs(it.totalGs)}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:30,fontWeight:900,color:C.r,lineHeight:1}}>{it.cantidad}</div>
                      <div style={{fontSize:10,color:C.mut}}>unid.</div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          }

          {/* Detalle por cliente */}
          {pedFilt.length>0&&<>
            <div style={{fontWeight:800,fontSize:13,color:C.mut,margin:"16px 0 6px",textTransform:"uppercase",letterSpacing:.5,paddingLeft:4}}>
              Por cliente
            </div>
            {pedFilt.map(ped=>(
              <div key={ped.id} style={{...S.card({padding:"12px 14px"}),cursor:"pointer"}} onClick={()=>{setDetPed(ped);setModal("det");}}>
                <div style={S.row()}>
                  <span style={S.bdg(C.r,{fontSize:11})}>#{ped.clienteCodigo}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{ped.clienteNombre}</div>
                    <div style={{fontSize:11,color:C.mut}}>{fmtFecha(ped.fecha)} · {ped.vendedorNombre} · {ped.horaVisita}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,color:C.grn,fontSize:13}}>{fmtGs(ped.total)}</div>
                    {(ped.devoluciones||[]).length>0&&<div style={{fontSize:10,color:C.amb}}>NC: {fmtGs(ped.totalDevolucion)}</div>}
                  </div>
                </div>
              </div>
            ))}
          </>}
        </div>

        {modal==="det"&&detPed&&<Modal onClose={()=>setModal(null)}><DetallePedido ped={detPed} onClose={()=>setModal(null)} esAdmin={esAdmin} onEliminar={esAdmin?()=>setConfirm({msg:`¿Eliminar pedido?`,fn:()=>{setPedidos(p=>p.filter(x=>x.id!==detPed.id));setModal(null);msg("Eliminado","warning");}}):null}/></Modal>}
        <NavBar/><Toast t={toast}/>
        {confirm&&<Confirm msg={confirm.msg} onOk={()=>{confirm.fn();setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // CLIENTES
  // ════════════════════════════════════════════════════════════════
  if(vista==="clientes") return (
    <div style={S.wrap}>
      <Hdr title="🏪 Clientes" usuario={usuario} onLogout={logout}/>
      <div style={S.body}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <button style={S.btn(C.r,{flex:1})} onClick={()=>setModal("addCli")}>+ Nuevo</button>
          <button style={S.btn(C.blu,{flex:1})} onClick={()=>setModal("impCli")}>📥 Importar</button>
        </div>
        <input style={{...S.inp(),marginBottom:8}} placeholder="🔍 Buscar..." value={busqCli} onChange={e=>setBusqCli(e.target.value)}/>
        <div style={{fontSize:12,color:C.mut,marginBottom:8}}>{cliFilt.length} clientes</div>
        {cliFilt.map(c=>{
          const zona=ZONAS.find(z=>z.id===c.zona);
          return (
            <div key={c.id} style={{...S.card({padding:"12px 14px"}),display:"flex",alignItems:"center",gap:10}}>
              <span style={S.bdg(C.r)}>#{c.codigo}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13}}>{c.razonSocial}</div>
                <div style={S.row({gap:6,marginTop:3,flexWrap:"wrap"})}>
                  {zona&&<span style={S.tag(zona.color,{fontSize:10})}>{zona.nombre}</span>}
                  {c.telefono&&<span style={{fontSize:11,color:C.mut}}>☎ {c.telefono}</span>}
                </div>
              </div>
              <button onClick={()=>setConfirm({msg:`¿Eliminar a ${c.razonSocial}?`,fn:()=>{setClientes(p=>p.filter(x=>x.id!==c.id));msg("Eliminado","warning");}})}
                style={{background:"none",border:"none",color:"#D1D5DB",fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
          );
        })}
        {cliFilt.length===0&&<div style={{...S.card(),textAlign:"center",color:C.mut,padding:36}}>
          {clientes.length===0?"Sin clientes. Creá uno o importá una lista.":"Sin resultados"}
        </div>}
      </div>

      {modal==="addCli"&&<Modal onClose={()=>setModal(null)}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:14,color:C.txt}}>Nuevo cliente</div>
        {[["codigo","Código *"],["razonSocial","Razón Social *"],["telefono","Teléfono"]].map(([k,l])=>(
          <div key={k} style={{marginBottom:10}}><label style={S.lbl}>{l}</label>
            <input style={S.inp()} value={fCli[k]} onChange={e=>setFCli(p=>({...p,[k]:e.target.value}))}/></div>
        ))}
        <div style={{marginBottom:10}}>
          <label style={S.lbl}>Zona</label>
          <select style={S.inp()} value={fCli.zona} onChange={e=>setFCli(p=>({...p,zona:e.target.value}))}>
            <option value="">Sin zona</option>
            {ZONAS.map(z=><option key={z.id} value={z.id}>{z.nombre} — {z.referencia}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={S.btn(C.r,{flex:1})} onClick={guardarCli}>Guardar</button>
          <button style={S.btn("#9CA3AF",{flex:1})} onClick={()=>setModal(null)}>Cancelar</button>
        </div>
      </Modal>}

      {modal==="impCli"&&<Modal onClose={()=>setModal(null)}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:8,color:C.txt}}>Importar clientes</div>
        <div style={{fontSize:12,color:C.mut,marginBottom:10,lineHeight:1.7}}>
          Una línea por cliente:<br/>
          <code style={{background:"#F3F4F6",padding:"2px 6px",borderRadius:4,fontSize:11}}>CODIGO, RAZÓN SOCIAL, ZONA_ID, TELÉFONO</code><br/>
          Zonas: Z1 Norte · Z2 Centro · Z3 Sur · Z4 Este · Z5 Oeste
        </div>
        <textarea style={{...S.inp(),minHeight:160,resize:"vertical",fontFamily:"monospace",fontSize:12}}
          placeholder={"41144, Lider Cuello Candia, Z2, 0981111222\n41539, Fátima Almacén, Z3\n52722, Alex Neorkel, Z1"} value={impTxt} onChange={e=>setImpTxt(e.target.value)}/>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <button style={S.btn(C.r,{flex:1})} onClick={importarClis}>Importar</button>
          <button style={S.btn("#9CA3AF",{flex:1})} onClick={()=>setModal(null)}>Cancelar</button>
        </div>
      </Modal>}

      <NavBar/><Toast t={toast}/>
      {confirm&&<Confirm msg={confirm.msg} onOk={()=>{confirm.fn();setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // INFORMES
  // ════════════════════════════════════════════════════════════════
  if(vista==="informes"){
    const totPer=pedFilt.reduce((s,p)=>s+p.total,0);
    const totDevPer=pedFilt.reduce((s,p)=>s+(p.totalDevolucion||0),0);
    const rankClis=useMemo(()=>{
      const m={};
      pedFilt.forEach(p=>{
        if(!m[p.clienteCodigo])m[p.clienteCodigo]={nombre:p.clienteNombre,codigo:p.clienteCodigo,total:0,pedidos:0,dev:0};
        m[p.clienteCodigo].total+=p.total;
        m[p.clienteCodigo].pedidos+=1;
        m[p.clienteCodigo].dev+=(p.totalDevolucion||0);
      });
      return Object.values(m).sort((a,b)=>b.total-a.total).slice(0,10);
    },[pedFilt]);

    return (
      <div style={S.wrap}>
        <Hdr title="📊 Informes" usuario={usuario} onLogout={logout}/>
        <div style={S.body}>
          <TabsPeriodo/>
          <input style={{...S.inp(),marginBottom:10}} placeholder="🔍 Buscar cliente..." value={busqHist} onChange={e=>setBusqHist(e.target.value)}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={S.card({textAlign:"center",padding:14})}>
              <div style={{fontSize:22,fontWeight:900,color:C.r}}>{pedFilt.length}</div>
              <div style={{fontSize:11,color:C.mut}}>Pedidos</div>
            </div>
            <div style={S.card({textAlign:"center",padding:14})}>
              <div style={{fontSize:15,fontWeight:900,color:C.grn}}>{fmtGs(totPer)}</div>
              <div style={{fontSize:11,color:C.mut}}>Ventas brutas</div>
            </div>
            <div style={S.card({textAlign:"center",padding:14})}>
              <div style={{fontSize:15,fontWeight:900,color:C.amb}}>{fmtGs(totDevPer)}</div>
              <div style={{fontSize:11,color:C.mut}}>Devoluciones</div>
            </div>
            <div style={S.card({textAlign:"center",padding:14})}>
              <div style={{fontSize:15,fontWeight:900,color:C.grn}}>{fmtGs(totPer-totDevPer)}</div>
              <div style={{fontSize:11,color:C.mut}}>Ventas netas</div>
            </div>
          </div>

          {rankClis.length>0&&<>
            <div style={{fontWeight:800,fontSize:13,color:C.mut,margin:"8px 0 8px",textTransform:"uppercase",letterSpacing:.5}}>🏆 Top clientes</div>
            {rankClis.map((c,i)=>(
              <div key={c.codigo} style={{...S.card({padding:"11px 14px"}),display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:i<3?C.r:"#F3F4F6",color:i<3?"#fff":C.mut,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{c.nombre}</div>
                  <div style={{fontSize:11,color:C.mut}}>{c.pedidos} pedido{c.pedidos!==1?"s":""}{c.dev>0?` · NC: ${fmtGs(c.dev)}`:""}</div>
                </div>
                <div style={{fontWeight:800,color:C.grn,fontSize:13}}>{fmtGs(c.total)}</div>
              </div>
            ))}
          </>}

          <div style={{fontWeight:800,fontSize:13,color:C.mut,margin:"16px 0 8px",textTransform:"uppercase",letterSpacing:.5}}>Pedidos del período</div>
          {pedFilt.length===0
            ? <div style={{...S.card(),textAlign:"center",color:C.mut,padding:36}}>Sin pedidos</div>
            : pedFilt.map(ped=>(
              <div key={ped.id} style={{...S.card({padding:"12px 14px"}),cursor:"pointer"}} onClick={()=>{setDetPed(ped);setModal("det");}}>
                <div style={S.row()}>
                  <span style={S.bdg(C.r,{fontSize:11})}>#{ped.clienteCodigo}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{ped.clienteNombre}</div>
                    <div style={{fontSize:11,color:C.mut}}>{fmtFecha(ped.fecha)} · {ped.vendedorNombre}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,color:C.grn,fontSize:13}}>{fmtGs(ped.total)}</div>
                    {(ped.devoluciones||[]).length>0&&<div style={{fontSize:10,color:C.amb}}>NC: {fmtGs(ped.totalDevolucion)}</div>}
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {modal==="det"&&detPed&&<Modal onClose={()=>setModal(null)}><DetallePedido ped={detPed} onClose={()=>setModal(null)} esAdmin={esAdmin} onEliminar={esAdmin?()=>setConfirm({msg:`¿Eliminar pedido?`,fn:()=>{setPedidos(p=>p.filter(x=>x.id!==detPed.id));setModal(null);msg("Eliminado","warning");}}):null}/></Modal>}
        <NavBar/><Toast t={toast}/>
        {confirm&&<Confirm msg={confirm.msg} onOk={()=>{confirm.fn();setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
      </div>
    );
  }

  return null;
}
