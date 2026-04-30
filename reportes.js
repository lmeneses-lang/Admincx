function previewImages(inputId,previewId){let files=document.getElementById(inputId).files,preview=document.getElementById(previewId);preview.innerHTML=``,Array.from(files).forEach(file=>{let reader=new FileReader;reader.onload=e=>{let img=document.createElement(`img`);img.src=e.target.result,preview.appendChild(img)},reader.readAsDataURL(file)})}function generarSlackPreview(){let idViaje=document.getElementById(`rs-id-viaje`).value||`—`,idUsuario=document.getElementById(`rs-id-usuario`).value||`—`,idConductor=document.getElementById(`rs-id-conductor`).value||`—`,contexto=document.getElementById(`rs-contexto`).value||`—`,txt=`🚗 *REPORTE RIDERY — CX*
────────────────────────────
🆔 *ID de Viaje:*      ${idViaje}
👤 *ID de Usuario:*    ${idUsuario}
🧑‍✈️ *ID de Conductor:* ${idConductor}
👨‍💼 *Agente:*          ${currentUser!==void 0&&currentUser?currentUser:`Admin CX`}
────────────────────────────
📝 *Contexto:*
${contexto}
────────────────────────────
📎 Evidencia adjunta al reporte
📅 Fecha: ${(/* @__PURE__ */ new Date()).toLocaleDateString(`es-VE`)+` `+(/* @__PURE__ */ new Date()).toLocaleTimeString(`es-VE`,{hour:`2-digit`,minute:`2-digit`})}`;
document.getElementById(`rs-preview`).textContent=txt,document.getElementById(`rs-preview-block`).style.display=`block`,enviarASlack()}function copiarSlack(){let txt=document.getElementById(`rs-preview`).textContent;navigator.clipboard.writeText(txt).then(()=>alert(`✅ Copiado para Slack`))}
const SLACK_WEBHOOK=`https://hooks.slack.com/triggers/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`;async function enviarASlack(){let idViaje=document.getElementById(`rs-id-viaje`).value.trim()||`—`,idUsuario=document.getElementById(`rs-id-usuario`).value.trim()||`—`,idConductor=document.getElementById(`rs-id-conductor`).value.trim()||`—`,contexto=document.getElementById(`rs-contexto`).value.trim()||`—`,agente=currentUser!==void 0&&currentUser?currentUser:`Admin CX`,fecha=(/* @__PURE__ */ new Date()).toLocaleDateString(`es-VE`)+` `+(/* @__PURE__ */ new Date()).toLocaleTimeString(`es-VE`,{hour:`2-digit`,minute:`2-digit`}),status=document.getElementById(`slack-send-status`),btn=document.getElementById(`btn-send-slack`);status&&(status.className=`slack-send-status`,status.textContent=`⏳ Enviando a Slack...`,status.style.display=`block`),btn&&(btn.disabled=!0);
let payload={text:`🚗 *REPORTE RIDERY — CX*
────────────────────────────
🆔 *ID de Viaje:*      ${idViaje}
👤 *ID de Usuario:*    ${idUsuario}
🧑‍✈️ *ID de Conductor:* ${idConductor}
👨‍💼 *Agente:*          ${agente}
────────────────────────────
📝 *Contexto:*
${contexto}
────────────────────────────
📎 Evidencia adjunta al reporte
📅 ${fecha}`,attachments:[{color:`#38CEA6`,fallback:`Reporte CX — ID Viaje: `+idViaje+` | Agente: `+agente,blocks:[{type:`header`,text:{type:`plain_text`,text:`🚗 Reporte CX — Ridery`,emoji:!0}},{type:`section`,fields:[{type:`mrkdwn`,text:`*🆔 ID de Viaje*
\``+idViaje+"`"},{type:`mrkdwn`,text:`*👤 ID de Usuario*
\``+idUsuario+"`"}]},{type:`section`,fields:[{type:`mrkdwn`,text:`*🧑‍✈️ ID de Conductor*
\``+idConductor+"`"},{type:`mrkdwn`,text:`*👨‍💼 Agente*
`+agente}]},{type:`divider`},{type:`section`,text:{type:`mrkdwn`,text:`*📝 Contexto*
`+contexto}},{type:`context`,elements:[{type:`mrkdwn`,text:`🕐 *`+fecha+`*  |  📎 Revisar evidencia en el sistema admin`}]}]}]},setOk=()=>{status&&(status.textContent=`✅ Reporte enviado al canal de Slack.`,status.className=`slack-send-status ok`),btn&&(btn.disabled=!1)},setErr=msg=>{status&&(status.textContent=`❌ `+msg+` — Usa "Copiar" para enviarlo manualmente.`,status.className=`slack-send-status err`),btn&&(btn.disabled=!1)};try{let resp=await fetch(SLACK_WEBHOOK,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(payload)});if(resp.ok)setOk();else throw Error(`HTTP `+resp.status)}catch{
try{await fetch(SLACK_WEBHOOK,{method:`POST`,mode:`no-cors`,headers:{"Content-Type":`application/json`},body:JSON.stringify(payload)}),setOk()}catch(e2){setErr(e2.message)}}}function limpiarReporte(prefix){[`id-viaje`,`id-usuario`,`id-conductor`,`contexto`].forEach(f=>{let el=document.getElementById(prefix+`-`+f);el&&(el.value=``)});let prev=document.getElementById(prefix+`-previews`);prev&&(prev.innerHTML=``);let ev=document.getElementById(prefix+`-evidencia`);ev&&(ev.value=``),prefix===`rs`&&(document.getElementById(`rs-preview-block`).style.display=`none`,document.getElementById(`rs-preview`).textContent=``)}function exportarReportePDF(tipo){let prefix=tipo===`slack`?`rs`:`ri`,idViaje=document.getElementById(prefix+`-id-viaje`).value||`—`,idUsuario=document.getElementById(prefix+`-id-usuario`).value||`—`,idConductor=document.getElementById(prefix+`-id-conductor`).value||`—`,contexto=document.getElementById(prefix+`-contexto`).value||`—`,titulo=tipo===`slack`?`Reporte Slack`:`Incidencia Perfil`,imgs=document.getElementById(prefix+`-previews`),imgTags=imgs?imgs.innerHTML:``,fecha=(/* @__PURE__ */ new Date()).toLocaleDateString(`es-VE`)+` `+(/* @__PURE__ */ new Date()).toLocaleTimeString(`es-VE`,{hour:`2-digit`,minute:`2-digit`}),html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #0F111E; }
    h1 { color: #38CEA6; border-bottom: 3px solid #38CEA6; padding-bottom: 10px; }
    .row { display: flex; gap: 20px; margin-bottom: 20px; }
    .field { flex: 1; background: #f1f5f9; border-radius: 8px; padding: 14px; }
    .field label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #5A7A70; display: block; margin-bottom: 4px; }
    .field .val { font-size: 1.1rem; font-weight: 700; }
    .context-box { background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 20px; white-space: pre-wrap; line-height: 1.7; }
    .img-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .img-grid img { max-width: 200px; border-radius: 8px; border: 2px solid #38CEA6; }
    .footer { font-size: 12px; color: #9BB5AC; margin-top: 30px; border-top: 1px solid #DDE8E3; padding-top: 12px; }
    .badge { display: inline-block; background: #38CEA6; color: #0F111E; border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 800; margin-bottom: 20px; }
  </style></head><body>
  <h1>📋 ${titulo}</h1>
  <div class="badge">Ridery Admin CX</div>
  <div class="row">
    <div class="field"><label>ID de Viaje</label><div class="val">${idViaje}</div></div>
    <div class="field"><label>ID de Usuario</label><div class="val">${idUsuario}</div></div>
  </div>
  <div class="row">
    <div class="field"><label>ID de Conductor</label><div class="val">${idConductor}</div></div>
    <div class="field"><label>Fecha de Reporte</label><div class="val">${fecha}</div></div>
  </div>
  <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#5A7A70;margin-bottom:6px;">Contexto</div>
  <div class="context-box">${contexto}</div>
  ${imgTags?`<div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#5A7A70;margin-bottom:10px;">Evidencia</div><div class="img-grid">${imgTags}</div>`:``}
  <div class="footer">Generado por Admin CX · Customer Experience Center · ${fecha}</div>
  </body></html>`,win=window.open(``,`_blank`);win.document.write(html),win.document.close(),setTimeout(()=>win.print(),600)}
let vDataUsuarios=[],vDataBanco=[],vResultados=[],vFiltroActual=`all`,vBancoActual=null;const V_BANCO_CONFIG={bancamiga:{nombre:`Bancamiga`,colRef:`Ref`},bnc:{nombre:`BNC`,colRef:`ReferenciaA`},bdv:{nombre:`BDV`,colRef:`referencia`}};