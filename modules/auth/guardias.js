let gvGuardias=[],gvEditId=null,gvTabActual=`vacantes`;
function gvInit(){let esAdmin=typeof loginType<`u`&&loginType===`admin`,esRemoto=typeof loginType<`u`&&loginType===`remoto`;document.getElementById(`gv-tabs`).style.display=esAdmin?`flex`:`none`,document.getElementById(`gv-admin-toolbar`).style.display=esAdmin?`flex`:`none`,esAdmin?gvCargarAdmin():gvCargarRemoto()}
async function gvCargarRemoto(){try{let json=await(await fetch(`/api/guardias?vista=remoto`)).json();if(!json.success)throw Error(json.error);gvRenderVacantesRemoto(json.data)}catch(e){console.error(`[GV] Error cargando vacantes:`,e)}
try{let agente=(typeof currentUser<`u`?currentUser:``)||``;if(!agente)return;let json2=await(await fetch(`/api/guardias?vista=mis&agente=`+encodeURIComponent(agente))).json();json2.success&&gvRenderMisGuardias(json2.data)}catch(e){console.warn(`[GV] Mis guardias no disponibles:`,e)}}function gvRenderMisGuardias(guardias){let section=document.getElementById(`gv-mis-section`);if(!guardias||!guardias.length){section&&(section.style.display=`none`);return}section.style.display=`block`;let hoy=/* @__PURE__ */ new Date;hoy.setHours(0,0,0,0);let pendientes=guardias.filter(g=>!g.pagada&&new Date(g.fecha)>=hoy),porPagar=guardias.filter(g=>!g.pagada&&new Date(g.fecha)<hoy),pagadas=guardias.filter(g=>g.pagada);function renderGrupo(containerId,groupId,lista){let grp=document.getElementById(groupId),cnt=document.getElementById(containerId);if(!lista.length){grp&&(grp.style.display=`none`);return}grp&&(grp.style.display=``),cnt.innerHTML=lista.map(g=>{let fecha=new Date(g.fecha).toLocaleDateString(`es-VE`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`}),esPend=!g.pagada&&new Date(g.fecha)>=hoy,esPorPag=!g.pagada&&new Date(g.fecha)<hoy,pillCls=g.pagada?`pagada`:esPend?`pendiente`:`por-pagar`,pillTxt=g.pagada?`✅ Pagada`:esPend?`⏳ Pendiente`:`💳 Por cobrar`;return`
        <div class="gv-mis-card">
          <div class="gv-mis-card-info">
            <div class="gv-mis-card-fecha">${fecha} · ${g.turno}</div>
            <div class="gv-mis-card-sub">📞 ${g.cola} &nbsp;·&nbsp; ⏰ ${g.horaInicio}–${g.horaFin}</div>
          </div>
          <span class="gv-mis-pill ${pillCls}">${pillTxt}</span>
        </div>`}).join(``)}renderGrupo(`gv-mis-pendientes`,`gv-mis-pendientes-group`,pendientes),renderGrupo(`gv-mis-porpagar`,`gv-mis-porpagar-group`,porPagar),renderGrupo(`gv-mis-pagadas`,`gv-mis-pagadas-group`,pagadas)}
function gvMisFiltro(tipo){
[`todas`,`pendientes`,`porpagar`,`pagadas`].forEach(t=>{let btn=document.getElementById(`gv-mis-f-`+t);btn&&btn.classList.toggle(`active`,t===tipo)});
let grupos={pendientes:document.getElementById(`gv-mis-pendientes-group`),porpagar:document.getElementById(`gv-mis-porpagar-group`),pagadas:document.getElementById(`gv-mis-pagadas-group`)};Object.entries(grupos).forEach(([key,el])=>{if(el)if(tipo===`todas`){
let cnt=el.querySelector(`[id^="gv-mis-"]`);el.style.display=cnt&&cnt.innerHTML.trim()?``:`none`}else el.style.display=key===tipo?``:`none`})}function gvRenderVacantesRemoto(guardias){let grid=document.getElementById(`gv-grid-vacantes`),empty=document.getElementById(`gv-empty-vacantes`);if(grid.innerHTML=``,!guardias.length){empty.style.display=`block`;return}empty.style.display=`none`,guardias.forEach(g=>{let card=document.createElement(`div`);card.className=`gv-card`;let fecha=new Date(g.fecha).toLocaleDateString(`es-VE`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`}),surgeHtml=g.mostrarPenalizacion&&g.montoPenalizacion>0?`<div class="gv-surge-badge">❗ SURGE — ¡Tarifa aumentada!</div>`:``;card.innerHTML=`
      <div class="gv-card-badge disponible">🟢 Disponible</div>
      <div class="gv-card-fecha">${fecha}</div>
      <div class="gv-card-info">
        <div class="gv-card-row">🔄 Turno: <span>${g.turno}</span></div>
        <div class="gv-card-row">📞 Cola: <span>${g.cola}</span></div>
        <div class="gv-card-row">⏰ Horario: <span>${g.horaInicio} – ${g.horaFin}</span></div>
      </div>
      ${surgeHtml}
      <button class="gv-btn-aceptar" onclick="gvAceptarVacante('${g._id}', this)">
        ✅ Aceptar guardia
      </button>
    `,grid.appendChild(card)})}
async function gvAceptarVacante(guardiaId,btn){if(!confirm(`¿Confirmas que quieres tomar esta guardia?`))return;btn.disabled=!0,btn.textContent=`⏳ Procesando...`;
let agenteId=``,nombreAgente=(typeof currentUser<`u`?currentUser:``)||``;try{let json=await(await fetch(`/api/guardias`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({accion:`aceptar`,guardiaId,agenteId:``,nombreAgente})})).json();if(!json.success)throw Error(json.error);btn.closest(`.gv-card`).style.transition=`opacity .3s`,btn.closest(`.gv-card`).style.opacity=`0`,setTimeout(()=>{
btn.closest(`.gv-card`).remove(),document.querySelectorAll(`.gv-card`).length||(document.getElementById(`gv-empty-vacantes`).style.display=`block`),gvCargarRemoto()},320)}catch(e){alert(`❌ `+(e.message||`No se pudo aceptar la guardia. Intenta de nuevo.`)),btn.disabled=!1,btn.textContent=`✅ Aceptar guardia`}}
async function gvCargarAdmin(){try{let json=await(await fetch(`/api/guardias?vista=admin`)).json();if(!json.success)throw Error(json.error);gvGuardias=json.data,gvRenderVacantesAdmin(),gvRenderTabla(),gvRenderResumen(),gvLlenarFiltroAgentes()}catch(e){console.error(`[GV] Error cargando admin:`,e)}}
function gvRenderVacantesAdmin(){let disponibles=gvGuardias.filter(g=>g.estado===`disponible`),grid=document.getElementById(`gv-grid-vacantes`),empty=document.getElementById(`gv-empty-vacantes`);if(grid.innerHTML=``,!disponibles.length){empty.style.display=`block`;return}empty.style.display=`none`,disponibles.forEach(g=>{let card=document.createElement(`div`);card.className=`gv-card`;let fecha=new Date(g.fecha).toLocaleDateString(`es-VE`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`}),montoLabel=g.tipoPago===`horas`?`$${g.montoPago}/hora`:`$${g.montoPago} fijo`,penHtml=g.mostrarPenalizacion&&g.montoPenalizacion>0?`<div class="gv-penalizacion">⚠️ Penalización: $${g.montoPenalizacion}</div>`:``;card.innerHTML=`
      <div class="gv-card-badge disponible">🟢 Disponible</div>
      <div class="gv-card-fecha">${fecha}</div>
      <div class="gv-card-info">
        <div class="gv-card-row">🔄 Turno: <span>${g.turno}</span></div>
        <div class="gv-card-row">📞 Cola: <span>${g.cola}</span></div>
        <div class="gv-card-row">⏰ Horario: <span>${g.horaInicio} – ${g.horaFin}</span></div>
        <div class="gv-card-row">💵 Pago: <span>${montoLabel}</span></div>
      </div>
      ${penHtml}
      <div class="gv-table-btns" style="margin-top:4px">
        <button class="gv-btn-edit" onclick="gvAbrirModal('${g._id}')">✏️ Editar</button>
        <button class="gv-btn-del"  onclick="gvEliminar('${g._id}')">🗑️ Eliminar</button>
      </div>
    `,grid.appendChild(card)})}
function gvRenderTabla(){let filtroAgente=document.getElementById(`gv-filtro-agente`)?.value||``,filtroPago=document.getElementById(`gv-filtro-pago`)?.value||``,data=gvGuardias.filter(g=>g.estado===`aceptada`||g.estado===`vencida`);filtroAgente&&(data=data.filter(g=>g.nombreAgente===filtroAgente)),filtroPago===`pagada`&&(data=data.filter(g=>g.pagada)),filtroPago===`no-pagada`&&(data=data.filter(g=>!g.pagada));let tbody=document.getElementById(`gv-tabla-body`);if(tbody.innerHTML=``,!data.length){tbody.innerHTML=`<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--gris-3);font-weight:600">Sin registros</td></tr>`;return}data.forEach(g=>{let fecha=new Date(g.fecha).toLocaleDateString(`es-VE`),pagoPill=g.pagada?`<span class="gv-pill pagada">✅ Pagada</span>`:`<span class="gv-pill no-pagada">❌ Pendiente</span>`,estadoPill=`<span class="gv-pill ${g.estado}">${g.estado===`aceptada`?`✔️ Aceptada`:`⚫ Vencida`}</span>`,montoMostrar=`$${g.montoPago}`;if(g.tipoPago===`horas`){let[hI,mI]=g.horaInicio.split(`:`).map(Number),[hF,mF]=g.horaFin.split(`:`).map(Number),horas=(hF*60+mF-(hI*60+mI))/60;montoMostrar=`$${(horas*g.montoPago).toFixed(2)} (${horas}h × $${g.montoPago})`}let tr=document.createElement(`tr`);tr.innerHTML=`
      <td>${fecha}</td>
      <td>${g.turno}</td>
      <td>${g.cola}</td>
      <td>${g.horaInicio} – ${g.horaFin}</td>
      <td><strong>${g.nombreAgente||`—`}</strong></td>
      <td>${g.tipoPago===`horas`?`⏱️ Por horas`:`💵 Fijo`}</td>
      <td>${montoMostrar}</td>
      <td>${estadoPill}</td>
      <td>${pagoPill}</td>
      <td>
        <div class="gv-table-btns">
          <button class="gv-btn-edit" onclick="gvAbrirModal('${g._id}')">✏️ Editar</button>
          ${!g.pagada&&g.estado===`aceptada`?`<button class="gv-btn-pago" onclick="gvAbrirModalPago('${g._id}')">💰 Pagar</button>`:``}
          <button class="gv-btn-del"  onclick="gvEliminar('${g._id}')">🗑️</button>
        </div>
      </td>
    `,tbody.appendChild(tr)})}
function gvRenderResumen(){let aceptadas=gvGuardias.filter(g=>g.estado===`aceptada`),mapa={};aceptadas.forEach(g=>{let nombre=g.nombreAgente||`Sin asignar`;mapa[nombre]||(mapa[nombre]={total:0,pagadas:0,pendientes:0,montoPagado:0,montoPendiente:0});let monto=g.montoPago;if(g.tipoPago===`horas`){let[hI,mI]=g.horaInicio.split(`:`).map(Number),[hF,mF]=g.horaFin.split(`:`).map(Number);monto=(hF*60+mF-(hI*60+mI))/60*g.montoPago}mapa[nombre].total++,g.pagada?(mapa[nombre].pagadas++,mapa[nombre].montoPagado+=monto):(mapa[nombre].pendientes++,mapa[nombre].montoPendiente+=monto)});let cont=document.getElementById(`gv-resumen-agentes`);cont.innerHTML=``,Object.entries(mapa).forEach(([nombre,d])=>{let div=document.createElement(`div`);div.className=`gv-resumen-card`,div.innerHTML=`
      <div class="gv-r-nombre">👤 ${nombre}</div>
      <div class="gv-r-stat">Guardias totales <span>${d.total}</span></div>
      <div class="gv-r-stat">Pagadas <span>${d.pagadas}</span></div>
      <div class="gv-r-stat">Pendientes <span>${d.pendientes}</span></div>
      <div class="gv-r-total">
        <span>Por pagar</span>
        <span class="${d.montoPendiente>0?`gv-r-deuda`:`gv-r-ok`}">
          $${d.montoPendiente.toFixed(2)}
        </span>
      </div>
    `,cont.appendChild(div)}),Object.keys(mapa).length||(cont.innerHTML=`<p style="color:var(--gris-3);font-size:.85rem;font-weight:600">Aún no hay guardias aceptadas.</p>`)}
function gvLlenarFiltroAgentes(){let select=document.getElementById(`gv-filtro-agente`);select&&[...new Set(gvGuardias.filter(g=>g.nombreAgente).map(g=>g.nombreAgente))].forEach(n=>{let opt=document.createElement(`option`);opt.value=n,opt.textContent=n,select.appendChild(opt)})}
function gvSetTab(tab){gvTabActual=tab,document.querySelectorAll(`.gv-tab`).forEach((t,i)=>{t.classList.toggle(`active`,i===0&&tab===`vacantes`||i===1&&tab===`registro`)}),document.getElementById(`gv-panel-vacantes`).style.display=tab===`vacantes`?`block`:`none`,document.getElementById(`gv-panel-registro`).style.display=tab===`registro`?`block`:`none`}
function gvAbrirModal(id=null){gvEditId=id;let modal=document.getElementById(`gv-modal`);if(document.getElementById(`gv-modal-title`).textContent=id?`✏️ Editar guardia`:`➕ Nueva guardia vacante`,document.getElementById(`gv-modal-error`).style.display=`none`,document.getElementById(`gv-modal-success`).style.display=`none`,id){
let g=gvGuardias.find(x=>x._id===id);g&&(document.getElementById(`gv-f-fecha`).value=g.fecha?.slice(0,10)||``,document.getElementById(`gv-f-turno`).value=g.turno,document.getElementById(`gv-f-cola`).value=g.cola,document.getElementById(`gv-f-hora-inicio`).value=g.horaInicio,document.getElementById(`gv-f-hora-fin`).value=g.horaFin,document.getElementById(`gv-f-tipo-pago`).value=g.tipoPago,document.getElementById(`gv-f-monto`).value=g.montoPago,document.getElementById(`gv-f-pen-toggle`).checked=g.mostrarPenalizacion,document.getElementById(`gv-f-pen-monto`).value=g.montoPenalizacion||0,document.getElementById(`gv-pen-bloque`).style.display=g.mostrarPenalizacion?`block`:`none`,gvTipoPagoChange())}else [`gv-f-fecha`,`gv-f-cola`,`gv-f-monto`,`gv-f-pen-monto`].forEach(id=>document.getElementById(id).value=``),document.getElementById(`gv-f-turno`).value=`Mañana`,document.getElementById(`gv-f-tipo-pago`).value=`fijo`,document.getElementById(`gv-f-hora-inicio`).value=``,document.getElementById(`gv-f-hora-fin`).value=``,document.getElementById(`gv-f-pen-toggle`).checked=!1,document.getElementById(`gv-pen-bloque`).style.display=`none`,gvTipoPagoChange();modal.classList.add(`open`)}function gvCerrarModal(){document.getElementById(`gv-modal`).classList.remove(`open`),gvEditId=null}function gvModalClickOutside(e){e.target===document.getElementById(`gv-modal`)&&gvCerrarModal()}function gvTipoPagoChange(){let tipo=document.getElementById(`gv-f-tipo-pago`).value;document.getElementById(`gv-monto-label`).textContent=tipo===`horas`?`Precio por hora ($)`:`Monto fijo ($)`}function gvPenalizacionToggle(){let checked=document.getElementById(`gv-f-pen-toggle`).checked;document.getElementById(`gv-pen-bloque`).style.display=checked?`block`:`none`}async function gvGuardar(){let btn=document.getElementById(`gv-btn-guardar`),errEl=document.getElementById(`gv-modal-error`),succEl=document.getElementById(`gv-modal-success`);errEl.style.display=succEl.style.display=`none`;let fecha=document.getElementById(`gv-f-fecha`).value,cola=document.getElementById(`gv-f-cola`).value.trim(),horaInicio=document.getElementById(`gv-f-hora-inicio`).value,horaFin=document.getElementById(`gv-f-hora-fin`).value,monto=parseFloat(document.getElementById(`gv-f-monto`).value);if(!fecha||!cola||!horaInicio||!horaFin){errEl.textContent=`⚠️ Completa todos los campos obligatorios (fecha, cola, hora inicio y hora fin).`,errEl.style.display=`block`;return}if(isNaN(monto)||monto<0){errEl.textContent=`⚠️ Ingresa un monto válido (mayor o igual a 0).`,errEl.style.display=`block`;return}btn.disabled=!0,btn.textContent=`⏳ Guardando...`;
let safetyTimer=setTimeout(()=>{btn.disabled=!1,btn.textContent=`💾 Guardar`},12e3),payload={fecha,turno:document.getElementById(`gv-f-turno`).value,cola,horaInicio,horaFin,tipoPago:document.getElementById(`gv-f-tipo-pago`).value,montoPago:monto,mostrarPenalizacion:document.getElementById(`gv-f-pen-toggle`).checked,montoPenalizacion:parseFloat(document.getElementById(`gv-f-pen-monto`).value)||0,creadaPor:(typeof currentUser<`u`?currentUser:``)||``};try{let res;res=gvEditId?await fetch(`/api/guardias`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({id:gvEditId,...payload})}):await fetch(`/api/guardias`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(payload)});let json=await res.json();if(!json.success)throw Error(json.error);succEl.textContent=gvEditId?`✅ Guardia actualizada.`:`✅ Guardia creada.`,succEl.style.display=`block`,clearTimeout(safetyTimer),setTimeout(()=>{gvCerrarModal(),gvCargarAdmin()},1400)}catch(e){errEl.textContent=`❌ `+(e.message||`Error al guardar. Verifica tu conexión.`),errEl.style.display=`block`,clearTimeout(safetyTimer)}finally{btn.disabled=!1,btn.textContent=`💾 Guardar`}}
async function gvEliminar(id){if(confirm(`¿Eliminar esta guardia? No se puede deshacer.`))try{await fetch(`/api/guardias`,{method:`DELETE`,headers:{"Content-Type":`application/json`},body:JSON.stringify({id})}),gvGuardias=gvGuardias.filter(g=>g._id!==id),gvRenderVacantesAdmin(),gvRenderTabla(),gvRenderResumen()}catch{alert(`❌ Error al eliminar.`)}}
let gvPagoId=null;function gvAbrirModalPago(id){gvPagoId=id;let g=gvGuardias.find(x=>x._id===id);document.getElementById(`gv-pago-desc`).textContent=g?`${g.nombreAgente} — ${new Date(g.fecha).toLocaleDateString(`es-VE`)} (${g.turno})`:``,document.getElementById(`gv-pago-nota`).value=``,document.getElementById(`gv-pago-error`).style.display=`none`,document.getElementById(`gv-pago-success`).style.display=`none`,document.getElementById(`gv-modal-pago`).classList.add(`open`)}function gvCerrarModalPago(){document.getElementById(`gv-modal-pago`).classList.remove(`open`),gvPagoId=null}async function gvConfirmarPago(){let nota=document.getElementById(`gv-pago-nota`).value.trim(),errEl=document.getElementById(`gv-pago-error`),succEl=document.getElementById(`gv-pago-success`);errEl.style.display=succEl.style.display=`none`;try{let json=await(await fetch(`/api/guardias`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({id:gvPagoId,pagada:!0,fechaPago:/* @__PURE__ */ new Date,notaPago:nota})})).json();if(!json.success)throw Error(json.error);
let idx=gvGuardias.findIndex(g=>g._id===gvPagoId);idx!==-1&&(gvGuardias[idx].pagada=!0,gvGuardias[idx].notaPago=nota),succEl.textContent=`✅ Pago registrado correctamente.`,succEl.style.display=`block`,setTimeout(()=>{gvCerrarModalPago(),gvRenderTabla(),gvRenderResumen()},1400)}catch(e){errEl.textContent=`❌ `+(e.message||`Error al registrar pago.`),errEl.style.display=`block`}}
function gvExportarExcel(){if(!window.XLSX){alert(`La librería XLSX no está disponible.`);return}let rows=gvGuardias.filter(g=>g.estado===`aceptada`).map(g=>{let monto=g.montoPago;if(g.tipoPago===`horas`){let[hI,mI]=g.horaInicio.split(`:`).map(Number),[hF,mF]=g.horaFin.split(`:`).map(Number);monto=(hF*60+mF-(hI*60+mI))/60*g.montoPago}return{Fecha:new Date(g.fecha).toLocaleDateString(`es-VE`),Turno:g.turno,Cola:g.cola,Horario:`${g.horaInicio} – ${g.horaFin}`,Agente:g.nombreAgente,"Tipo pago":g.tipoPago===`horas`?`Por horas`:`Fijo`,"Monto ($)":monto.toFixed(2),Pagada:g.pagada?`Sí`:`No`,"Nota pago":g.notaPago||``,"Fecha aceptación":g.fechaAceptacion?new Date(g.fechaAceptacion).toLocaleDateString(`es-VE`):``}}),ws=XLSX.utils.json_to_sheet(rows),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,`Guardias Vacantes`),XLSX.writeFile(wb,`guardias_vacantes_${(/* @__PURE__ */ new Date()).toISOString().slice(0,10)}.xlsx`)}

let _notifItems=[],_notifPollTimer=null,_notifLastCheck=0;
function notifTogglePanel(){let panel=document.getElementById(`notifPanel`);panel.classList.toggle(`open`),panel.classList.contains(`open`)&&notifRender()}
document.addEventListener(`click`,function(e){let btn=document.getElementById(`notifBellBtn`),panel=document.getElementById(`notifPanel`);!btn||!panel||!btn.contains(e.target)&&!panel.contains(e.target)&&panel.classList.remove(`open`)});
function notifRender(){let list=document.getElementById(`notifList`),countEl=document.getElementById(`notifPanelCount`),bellCount=document.getElementById(`notifBellCount`);if(!list)return;let unread=_notifItems.filter(n=>n.unread).length;if(countEl.textContent=unread>0?unread+` sin leer`:``,bellCount.textContent=unread,bellCount.style.display=unread>0?`flex`:`none`,!_notifItems.length){list.innerHTML=`<div class="notif-empty">Sin notificaciones nuevas</div>`;return}list.innerHTML=_notifItems.map((n,i)=>`
    <div class="notif-item ${n.unread?`unread`:``}" onclick="notifMarkRead(${i})">
      <div class="notif-item-title">${n.title}</div>
      <div class="notif-item-sub">${n.body}</div>
      <div class="notif-item-sub" style="margin-top:2px">${new Date(n.ts).toLocaleString(`es-VE`,{hour:`2-digit`,minute:`2-digit`,day:`numeric`,month:`short`})}</div>
    </div>
  `).join(``)}
function notifMarkRead(idx){_notifItems[idx]&&(_notifItems[idx].unread=!1),notifRender()}
function notifClearAll(){_notifItems.forEach(n=>n.unread=!1),notifRender()}
function notifPush(title,body){_notifItems.unshift({id:Date.now(),title,body,unread:!0,ts:Date.now()}),_notifItems.length>30&&(_notifItems=_notifItems.slice(0,30)),notifRender()}
async function notifPoll(){let esAdmin=typeof loginType<`u`&&loginType===`admin`,esRemoto=typeof loginType<`u`&&loginType===`remoto`;if(!(!esAdmin&&!esRemoto)){try{if(esRemoto){let json=await(await fetch(`/api/guardias?vista=remoto&since=`+_notifLastCheck)).json();json.success&&json.data&&json.data.length&&json.data.forEach(g=>{if(!_notifItems.some(n=>n.id===g._id)){let fecha=new Date(g.fecha).toLocaleDateString(`es-VE`,{day:`numeric`,month:`short`});notifPush(`🛡️ Nueva guardia disponible`,`Cola: ${g.cola} · ${fecha} · ${g.horaInicio}–${g.horaFin}`),_notifItems[0].id=g._id}})}else if(esAdmin){let json=await(await fetch(`/api/guardias?vista=admin&aceptadas_recientes=1&since=`+_notifLastCheck)).json();json.success&&json.data&&json.data.length&&json.data.forEach(g=>{!_notifItems.some(n=>n.id===`acept-`+g._id)&&g.estado===`aceptada`&&(notifPush(`✅ Guardia vacante tomada`,`${g.nombreAgente||`Un agente`} aceptó la guardia del ${new Date(g.fecha).toLocaleDateString(`es-VE`,{day:`numeric`,month:`short`})} · Cola: ${g.cola}. ¡Contáctale!`),_notifItems[0].id=`acept-`+g._id)})}}catch{}_notifLastCheck=Date.now()}}
function notifStartPolling(){_notifPollTimer&&clearInterval(_notifPollTimer),notifPoll(),_notifPollTimer=setInterval(notifPoll,3e4)}
function notifStopPolling(){_notifPollTimer&&clearInterval(_notifPollTimer),_notifPollTimer=null,_notifItems=[],notifRender()}
function _gvExportarImagenResumen(){let aceptadas=gvGuardias.filter(g=>g.estado===`aceptada`);if(!aceptadas.length){alert(`No hay guardias aceptadas para exportar`);return}let mapa={};aceptadas.forEach(g=>{let nombre=g.nombreAgente||`Sin asignar`;mapa[nombre]||(mapa[nombre]={remoto:0,horas:0,presencial:0,km:0,tr:0,th:0,tp:0,total:0});let monto=parseFloat(g.montoPago)||0;if(g.tipoPago===`horas`&&g.horaInicio&&g.horaFin){let[hI,mI]=g.horaInicio.split(`:`).map(Number),[hF,mF]=g.horaFin.split(`:`).map(Number);monto=(hF*60+mF-(hI*60+mI))/60*monto,mapa[nombre].horas++,mapa[nombre].th+=monto}else g.tipoPago===`presencial`?(mapa[nombre].presencial++,mapa[nombre].tp+=monto):(mapa[nombre].remoto++,mapa[nombre].tr+=monto);mapa[nombre].km+=parseFloat(g.km)||0,mapa[nombre].total+=monto});let registros=Object.entries(mapa),totGeneral=registros.reduce((s,[,d])=>s+d.total,0),fecha=(/* @__PURE__ */ new Date()).toLocaleDateString(`es-VE`,{day:`numeric`,month:`long`,year:`numeric`}),html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Urbanist',Arial,sans-serif;background:#F6FAF9;padding:36px;color:#0F111E}
.card{background:#fff;border-radius:18px;padding:36px;box-shadow:0 4px 32px rgba(0,0,0,.09);max-width:980px;margin:0 auto}
.hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #E8FAF5}
.logo{display:flex;align-items:center;gap:14px}
.lm{width:52px;height:52px;background:linear-gradient(135deg,#0F111E,#1A1D30);border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.7rem;font-weight:900;color:#38CEA6}
.lt h1{font-size:1.45rem;font-weight:900;color:#0F111E}
.lt p{font-size:.72rem;font-weight:700;color:#9BB5AC;text-transform:uppercase;letter-spacing:.08em}
.badge{background:#E8FAF5;border:1.5px solid rgba(56,206,166,.3);border-radius:999px;padding:8px 18px;font-size:.78rem;font-weight:800;color:#0F111E}
h2{font-size:.72rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#38CEA6;border-left:3px solid #D71D5C;padding-left:9px;margin-bottom:16px}
table{width:100%;border-collapse:collapse;font-size:.85rem}
thead{background:#0F111E}
th{padding:12px 16px;text-align:left;font-size:.62rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7);white-space:nowrap}
tbody tr{border-bottom:1px solid #EEF2F0}
tbody tr:last-child{border-bottom:none}
td{padding:11px 16px;vertical-align:middle}
small{display:block;font-size:.7rem;color:#9BB5AC;font-weight:600}
.tot{font-size:1.05rem;font-weight:900;color:#38CEA6}
.footer{margin-top:20px;background:#0F111E;border-radius:12px;padding:20px 28px;display:flex;align-items:center;justify-content:space-between}
.fl{font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.fs{font-size:.7rem;color:rgba(255,255,255,.3);margin-top:4px;font-weight:600}
.fv{font-size:2.2rem;font-weight:900;color:#fbbf24;letter-spacing:1px}
</style></head><body>
<div class="card">
  <div class="hdr">
    <div class="logo"><div class="lm">R</div><div class="lt"><h1>Guardia Vacante</h1><p>Ridery Admin CX · Reporte de Pagos</p></div></div>
    <div class="badge">📅 ${fecha}</div>
  </div>
  <h2>📋 Registros del período</h2>
  <table>
    <thead><tr><th>#</th><th>Agente</th><th>🖥️ Remoto C.</th><th>⏱️ Por Horas</th><th>🏢 Presencial</th><th>🗺️ KM</th><th>Total</th></tr></thead>
    <tbody>${registros.map(([nombre,r],i)=>`
    <tr>
      <td>${i+1}</td>
      <td><strong>${nombre}</strong></td>
      <td>${r.remoto}<br><small>($${r.tr.toFixed(2)})</small></td>
      <td>${r.horas}<br><small>($${r.th.toFixed(2)})</small></td>
      <td>${r.presencial}<br><small>($${r.tp.toFixed(2)})</small></td>
      <td>${r.km} km</td>
      <td class="tot">$${r.total.toFixed(2)}</td>
    </tr>`).join(``)}</tbody>
  </table>
  <div class="footer">
    <div><div class="fl">Total General a Pagar</div><div class="fs">${registros.length} agente(s) · Generado el ${fecha}</div></div>
    <div class="fv">$${totGeneral.toFixed(2)}</div>
  </div>
</div>
<script>
window.onload = function() {
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  s.onload = function() {
    setTimeout(function() {
      html2canvas(document.querySelector('.card'), { scale:2, useCORS:true, backgroundColor:'#F6FAF9' }).then(function(canvas) {
        var a = document.createElement('a');
        a.download = 'guardia_vacante_${(/* @__PURE__ */ new Date()).toISOString().slice(0,10)}.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        setTimeout(function(){ window.close(); }, 1000);
      });
    }, 800);
  };
  document.head.appendChild(s);
};
<\/script>
</body></html>`,win=window.open(``,`_blank`,`width=1060,height=700`);win.document.write(html),win.document.close()}

// ─── Exports para uso desde index.html ───
export {
  gvInit, gvCargarRemoto, gvAceptarVacante,
  gvAbrirModal, gvCerrarModal, gvGuardar, gvEliminar,
  gvSetTab, gvMisFiltro, gvRenderTabla, gvRenderResumen,
  gvExportarExcel, gvConfirmarPago, gvAbrirModalPago,
  gvCerrarModalPago, gvModalClickOutside, gvTipoPagoChange,
  gvPenalizacionToggle,
  _gvExportarImagenResumen as gvExportarImagenResumen,
  notifTogglePanel, notifClearAll, notifMarkRead
};
