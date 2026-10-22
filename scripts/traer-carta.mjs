// Se ejecuta ANTES de construir la web (npm run build): pide a Control Financiero los platos de la carta y reescribe src/data/*.json.
//   · CONTROL_URL     dirección de Control Financiero (https://…vercel.app), sin barra final
//   · CARTA_API_KEY   la misma clave que se pone en las variables de Vercel de Control Financiero
//   · CARTA_FOTOS_CONTROL  "1" = si un plato no tiene foto en esta web, usar la subida a su ficha de Control Financiero (por defecto NO: las fotos son las de public/images)
//   · CARTA_SECCIONES_LIBRES  secciones que el modo estricto no toca (por defecto "shop": la tienda no son platos). Lista separada por comas
//   · CARTA_ESTRICTA  "1" = los artículos que Control Financiero no tiene desaparecen de la carta (úsalo cuando la migración esté completa)
// Si falta una variable, no hay conexión o la respuesta no es válida, NO se toca nada y la web se construye con los ficheros que ya hay:
// una caída de Control Financiero nunca puede dejar la carta vacía.
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aplicarPlatos, contenedores, seccionesHuerfanas } from './carta-lib.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const datos = join(raiz, 'src', 'data');
const fotos = join(raiz, 'public', 'images', 'carta');
const url = String(process.env.CONTROL_URL || '').trim().replace(/\/+$/, '');
const clave = String(process.env.CARTA_API_KEY || '').trim();
const estricta = process.env.CARTA_ESTRICTA === '1';
const fotosDeControl = process.env.CARTA_FOTOS_CONTROL === '1'; // por defecto las fotos son SÓLO las de public/images de esta web
// Secciones que NO son platos de Control Financiero (por defecto la tienda): el modo estricto no las toca.
const libres = String(process.env.CARTA_SECCIONES_LIBRES ?? 'shop').split(',').map((s) => s.trim()).filter(Boolean);
const simular = process.env.CARTA_SIMULAR === '1'; // sólo cuenta y enseña lo que haría: no escribe ficheros ni fotos

const aviso = (m) => console.log(`[carta] ${m}`);

async function pedirPlatos() {
  const r = await fetch(`${url}/api/carta/platos${fotosDeControl ? '?imagenes=1' : ''}`, { headers: { Authorization: `Bearer ${clave}`, Accept: 'application/json' }, signal: AbortSignal.timeout(60_000) });
  if (!r.ok) throw new Error(`Control Financiero respondió ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j.platos)) throw new Error('respuesta sin lista de platos');
  return j.platos;
}

/** Guarda la foto subida en la ficha (data:image/…;base64) y devuelve su ruta dentro de la web. */
async function guardarFoto(p) {
  const m = /^data:image\/(webp|png|jpe?g);base64,(.+)$/s.exec(String(p.imagen || ''));
  if (!m) return undefined;
  const nombre = `plato-${p.id}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
  if (simular) return `images/carta/${nombre}`;
  await mkdir(fotos, { recursive: true });
  await writeFile(join(fotos, nombre), Buffer.from(m[2], 'base64'));
  return `images/carta/${nombre}`;
}

async function main() {
  if (!url || !clave) return aviso('CONTROL_URL o CARTA_API_KEY sin definir: se usa la carta de src/data tal cual.');
  let platos;
  try {
    platos = await pedirPlatos();
  } catch (e) {
    return aviso(`No se pudo leer Control Financiero (${e.message}): se usa la carta de src/data tal cual.`);
  }
  if (!platos.length) return aviso('Control Financiero no tiene todavía platos con ficha de carta: se usa src/data tal cual.');

  const rutas = new Map();
  if (fotosDeControl) for (const p of platos) if (p.visible && !p.carta?.foto && p.imagen) rutas.set(p.id, await guardarFoto(p));
  const fotoDe = (p) => rutas.get(p.id);

  const ficheros = (await readdir(datos)).filter((f) => f.endsWith('.json'));
  const secciones = [];
  let cambiados = 0;
  const total = { actualizados: 0, nuevos: 0, sinCambioDeControl: 0, quitados: 0 };
  const quitadosNombres = [];
  const sinFoto = [];
  const fotosQueFaltan = [];
  for (const f of ficheros) {
    const base = f.replace(/\.json$/, '');
    const original = JSON.parse(await readFile(join(datos, f), 'utf8'));
    for (const c of contenedores(original, base)) secciones.push(c.seccion);
    const { json, resumen } = aplicarPlatos(original, base, platos, { estricta, libres, fotoDe });
    for (const k of Object.keys(total)) total[k] += resumen[k];
    for (const c of contenedores(json, base)) {
      for (const it of c.items) {
        const ruta = String(it.image || '').replace(/^\/+/, '');
        if (it.available !== false && ruta && !existsSync(join(raiz, 'public', ruta))) fotosQueFaltan.push(`${c.seccion}: ${it.name} → ${ruta}`);
      }
    }
    quitadosNombres.push(...resumen.quitadosNombres);
    sinFoto.push(...resumen.sinFoto);
    const texto = `${JSON.stringify(json, null, 2)}\n`;
    if (JSON.stringify(json) !== JSON.stringify(original)) {
      if (!simular) await writeFile(join(datos, f), texto);
      cambiados++;
    }
  }
  const huerfanas = seccionesHuerfanas(platos, secciones);
  if (huerfanas.length) aviso(`Platos con sección que no existe en la web (no salen): ${huerfanas.join(', ')}`);
  aviso(`${platos.length} platos recibidos · ${total.actualizados} actualizados · ${total.nuevos} nuevos · ${total.sinCambioDeControl} que Control Financiero aún no tiene (se conservan)${estricta ? ` · ${total.quitados} quitados` : ''} · ${cambiados} ficheros ${simular ? 'cambiarían (SIMULACIÓN: no se ha escrito nada)' : 'reescritos'}.`);
  const cuenta = (lista) => lista.reduce((m, s) => ((m[s] = (m[s] || 0) + 1), m), {});
  const texto2 = (m) => Object.entries(m).map(([s, n]) => `${s} ${n}`).join(' · ') || 'ninguna';
  aviso(`Por sección · SALEN (desde Control Financiero): ${texto2(cuenta(platos.map((p) => String(p.carta?.seccion || '(sin sección)'))))}`);
  if (quitadosNombres.length) {
    aviso(`Por sección · SE QUITAN (no están en Control Financiero): ${texto2(cuenta(quitadosNombres.map((n) => n.split(':')[0])))}`);
    if (simular) {
      const porSeccion = {};
      for (const n of quitadosNombres) (porSeccion[n.split(':')[0]] ||= []).push(n.slice(n.indexOf(':') + 2));
      for (const [s, lista] of Object.entries(porSeccion)) aviso(`   se quita de ${s}: ${lista.join(' | ')}`);
    }
  }
  if (fotosQueFaltan.length) aviso(`Fotos que NO existen en public/ (saldrían rotas): ${fotosQueFaltan.length}${simular ? ` → ${fotosQueFaltan.slice(0, 60).join(' | ')}` : ''}`);
  if (sinFoto.length) aviso(`Visibles SIN foto: ${sinFoto.length}${simular ? ` → ${sinFoto.slice(0, 60).join(' | ')}` : ''}`);
}

main().catch((e) => {
  // Nunca debe impedir que se construya la web.
  aviso(`Error inesperado, se usa src/data tal cual: ${e.stack || e.message}`);
});
