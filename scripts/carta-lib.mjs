// Mezcla los platos que llegan de Control Financiero (/api/carta/platos) con los ficheros de src/data.
// Función pura (sin red ni disco): la prueba es tests/carta-lib.test.mjs.
//
// Reglas:
//  · Control Financiero manda en nombre, precio, descripción, alérgenos, etiquetas, ficha de cerveza, formatos, foto y si se ve (available).
//  · Lo que el plato no tiene en Control Financiero (theme, special, badge de diseño…) se conserva del fichero.
//  · Un artículo del fichero que Control Financiero no conoce se conserva (salvo modo estricto, y salvo en las secciones «libres», p. ej. la tienda): así una carta a medio migrar no pierde platos.
//  · Un plato de Control Financiero cuya sección existe en los ficheros se añade al final de ella; si la sección no existe se avisa.

const SIN_FOTO = /COMING-SOON/i;

export const clave = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** 13.9 → "13,90€" (el formato que ya usan los ficheros). */
export const textoPrecio = (n) => `${Number(n).toFixed(2).replace('.', ',')}€`;

/** Sección a la que pertenece cada contenedor de un fichero: el `id` de la sección o, en una lista plana, el nombre del fichero. */
export function contenedores(json, base) {
  const lista = Array.isArray(json) ? json : [json];
  const salida = [];
  for (const bloque of lista) {
    if (bloque && Array.isArray(bloque.items)) salida.push({ seccion: String(bloque.id || base), items: bloque.items, bloque });
  }
  if (!salida.length && Array.isArray(json)) salida.push({ seccion: base, items: json, bloque: null });
  return salida;
}

/** Un plato de Control Financiero → los campos que tiene un artículo de la carta. */
export function camposDePlato(p, existente) {
  const c = p.carta || {};
  const cv = c.cerveza || {};
  const campos = { name: p.nombre, available: p.visible !== false };
  if (c.formatos?.length) campos.prices = c.formatos.map((f) => ({ label: f.etiqueta, price: textoPrecio(f.precio) }));
  else campos.price = typeof existente?.price === 'number' ? Number(p.precio) : textoPrecio(p.precio);
  if (c.descripcion !== undefined) campos.description = c.descripcion;
  if (c.alergenos) campos.allergens = c.alergenos;
  if (c.etiquetas) campos.tags = c.etiquetas;
  if (c.destacado) campos.featured = true;
  if (c.insignia) campos.badge = c.insignia;
  if (cv.pais) campos.country = cv.pais;
  if (cv.estilo) campos.style = cv.estilo;
  if (cv.color) campos.color = cv.color;
  if (cv.abv !== undefined) campos.abv = cv.abv;
  if (cv.ibu !== undefined) campos.ibu = cv.ibu;
  if (cv.maridaje) campos.pairing = cv.maridaje;
  if (cv.formato) campos.format = cv.formato;
  // Las fotos son las de la web de la carta: la ruta de la ficha, si no la que ya tenía el artículo y, sólo como último recurso, la subida a la ficha.
  const foto = [c.foto, existente?.image, p.fotoGuardada].find((f) => f && !SIN_FOTO.test(f));
  if (foto) campos.image = foto;
  return campos;
}

/**
 * Devuelve { json, resumen } con el fichero actualizado (el original no se modifica).
 * `platos` = respuesta de /api/carta/platos; `base` = nombre del fichero sin .json; `fotoDe(plato)` = ruta de la foto ya guardada en disco (o undefined).
 */
export function aplicarPlatos(json, base, platos, { estricta = false, libres = [], fotoDe = () => undefined } = {}) {
  const copia = structuredClone(json);
  const resumen = { actualizados: 0, nuevos: 0, sinCambioDeControl: 0, quitados: 0, quitadosNombres: [], sinFoto: [] };
  for (const cont of contenedores(copia, base)) {
    const suyos = platos.filter((p) => String(p.carta?.seccion || '') === cont.seccion);
    const porClave = new Map(suyos.map((p) => [clave(p.nombre), p]));
    const usados = new Set();
    const nuevoItems = [];
    for (const it of cont.items) {
      const p = porClave.get(clave(it.name ?? it.title));
      if (!p) {
        if (estricta && !libres.includes(cont.seccion)) {
          resumen.quitados++;
          resumen.quitadosNombres.push(`${cont.seccion}: ${it.name ?? it.title}`);
        }
        else {
          nuevoItems.push(it);
          resumen.sinCambioDeControl++;
        }
        continue;
      }
      usados.add(p);
      const foto = fotoDe(p);
      const campos = camposDePlato({ ...p, fotoGuardada: foto }, it);
      const fusion = { ...it, ...campos };
      // Un plato pasa de «precio único» a «formatos» (o al revés): no debe quedar el campo del modo anterior.
      if (campos.prices) delete fusion.price;
      else if (campos.price !== undefined && !p.carta?.formatos?.length) delete fusion.prices;
      nuevoItems.push(fusion);
      resumen.actualizados++;
      if (fusion.available !== false && !fusion.image && cont.seccion !== 'cocteles') resumen.sinFoto.push(`${cont.seccion}: ${fusion.name}`);
    }
    for (const p of suyos) {
      if (usados.has(p)) continue;
      const nuevo = camposDePlato({ ...p, fotoGuardada: fotoDe(p) }, undefined);
      nuevoItems.push(nuevo);
      resumen.nuevos++;
      if (nuevo.available !== false && !nuevo.image) resumen.sinFoto.push(`${cont.seccion}: ${nuevo.name}`);
    }
    cont.items.splice(0, cont.items.length, ...nuevoItems);
  }
  return { json: copia, resumen };
}

/** Secciones de Control Financiero que no existen en ningún fichero (para avisar). */
export function seccionesHuerfanas(platos, secciones) {
  const conocidas = new Set(secciones);
  return [...new Set(platos.map((p) => String(p.carta?.seccion || '')).filter((s) => s && !conocidas.has(s)))];
}
