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
    setGpsActivo
