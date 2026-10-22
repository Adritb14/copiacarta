// node --test tests/*.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { aplicarPlatos, camposDePlato, clave, seccionesHuerfanas, textoPrecio } from '../scripts/carta-lib.mjs';

const burgers = () => [
  { id: 'burgers', title: 'BURGERS', description: 'Sólo la mejor carne', allergenNotice: { text: 'TODAS CONTIENEN:', allergens: ['Gluten'] }, available: true,
    items: [
      { available: true, name: 'RIBS BURGER', featured: true, theme: 'ribs', image: 'images/ribs.webp', price: '12,90€', description: 'vieja', allergens: ['Gluten'] },
      { available: true, name: 'Solo en la web', price: '9,00€', description: 'x' },
    ] },
];
const plato = (id, nombre, precio, carta, extra = {}) => ({ id, nombre, precio, iva: 10, categoria: '', visible: true, carta, ...extra });

test('precio con el formato de los ficheros', () => {
  assert.equal(textoPrecio(13.9), '13,90€');
  assert.equal(textoPrecio(5), '5,00€');
  assert.equal(clave('Ribs  BURGER!'), clave('ribs burger'));
});

test('Control Financiero manda en lo suyo y se conserva lo que no tiene (theme, cabecera de la sección)', () => {
  const { json, resumen } = aplicarPlatos(burgers(), 'burgers', [plato(1, 'Ribs Burger', 13.5, { seccion: 'burgers', descripcion: 'nueva', alergenos: ['Gluten', 'Lácteos'], destacado: true })]);
  const it = json[0].items[0];
  assert.deepEqual([it.name, it.price, it.description, it.allergens, it.theme, it.image], ['Ribs Burger', '13,50€', 'nueva', ['Gluten', 'Lácteos'], 'ribs', 'images/ribs.webp']);
  assert.equal(json[0].title, 'BURGERS');
  assert.deepEqual(json[0].allergenNotice.allergens, ['Gluten']);
  assert.equal(json[0].items[1].name, 'Solo en la web'); // la carta a medio migrar no pierde platos
  assert.deepEqual([resumen.actualizados, resumen.nuevos, resumen.sinCambioDeControl, resumen.quitados], [1, 0, 1, 0]);
});

test('modo estricto: lo que Control Financiero no tiene desaparece', () => {
  const { json, resumen } = aplicarPlatos(burgers(), 'burgers', [plato(1, 'Ribs Burger', 12.9, { seccion: 'burgers' })], { estricta: true });
  assert.deepEqual(json[0].items.map((i) => i.name), ['Ribs Burger']);
  assert.equal(resumen.quitados, 1);
  assert.deepEqual(resumen.quitadosNombres, ['burgers: Solo en la web']);
});

test('oculto en Control Financiero → available:false; un plato nuevo se añade al final de su sección', () => {
  const { json } = aplicarPlatos(burgers(), 'burgers', [
    plato(1, 'Ribs Burger', 12.9, { seccion: 'burgers', visible: false }, { visible: false }),
    plato(7, 'Burger Nueva', 11, { seccion: 'burgers', descripcion: 'Recién llegada' }),
  ]);
  assert.equal(json[0].items[0].available, false);
  assert.deepEqual(json[0].items.at(-1), { name: 'Burger Nueva', available: true, price: '11,00€', description: 'Recién llegada' });
});

test('formatos con precio: se usa «prices» y desaparece «price» (y al revés)', () => {
  const barril = [{ name: 'Nitro', price: '5,50€', description: 'd' }];
  const a = aplicarPlatos(barril, 'barril', [plato(1, 'Nitro', 5.5, { seccion: 'barril', formatos: [{ etiqueta: '50cl', precio: 5.5 }, { etiqueta: 'Jarra', precio: 9 }] })]).json[0];
  assert.deepEqual(a.prices, [{ label: '50cl', price: '5,50€' }, { label: 'Jarra', price: '9,00€' }]);
  assert.equal('price' in a, false);
  const b = aplicarPlatos([{ name: 'Nitro', prices: [{ label: '50cl', price: '5,50€' }] }], 'barril', [plato(1, 'Nitro', 6, { seccion: 'barril' })]).json[0];
  assert.equal(b.price, '6,00€');
  assert.equal('prices' in b, false);
});

test('ficha de cerveza y foto subida en la ficha', () => {
  const campos = camposDePlato({ ...plato(3, 'Sake', 8, { seccion: 'beers', cerveza: { pais: 'Japón', estilo: 'Sake', abv: 14, ibu: 0, maridaje: 'Sushi', formato: '33cl' }, etiquetas: ['SAKE'] }), fotoGuardada: 'images/carta/plato-3.webp' });
  assert.deepEqual(campos, { name: 'Sake', available: true, price: '8,00€', tags: ['SAKE'], country: 'Japón', style: 'Sake', abv: 14, ibu: 0, pairing: 'Sushi', format: '33cl', image: 'images/carta/plato-3.webp' });
});

test('la ruta de foto de la ficha gana a la foto del fichero; COMING-SOON no cuenta como foto', () => {
  const j = [{ name: 'A', price: '1,00€', image: 'images/vieja.webp' }];
  assert.equal(aplicarPlatos(j, 'x', [plato(1, 'A', 1, { seccion: 'x', foto: 'images/nueva.webp' })]).json[0].image, 'images/nueva.webp');
  assert.equal(aplicarPlatos(j, 'x', [plato(1, 'A', 1, { seccion: 'x', foto: 'images/COMING-SOON.webp' })]).json[0].image, 'images/vieja.webp');
});

test('listas planas (beers) usan el nombre del fichero como sección; el original no se modifica; secciones huérfanas se avisan', () => {
  const original = [{ name: 'Estrella', price: '3,00€' }];
  const copiaOriginal = structuredClone(original);
  const { json } = aplicarPlatos(original, 'beers', [plato(1, 'Estrella', 3.2, { seccion: 'beers' }), plato(2, 'Estrella', 9, { seccion: 'barril' })]);
  assert.equal(json[0].price, '3,20€');
  assert.deepEqual(original, copiaOriginal);
  assert.deepEqual(seccionesHuerfanas([plato(1, 'a', 1, { seccion: 'beers' }), plato(2, 'b', 1, { seccion: 'inventada' }), plato(3, 'c', 1, {})], ['beers']), ['inventada']);
});

test('el informe avisa de los platos visibles sin foto', () => {
  const { resumen } = aplicarPlatos([{ name: 'Con foto', price: '1,00€', image: 'images/a.webp' }, { name: 'Sin foto', price: '2,00€' }, { name: 'Oculto sin foto', price: '2,00€', available: false }], 'x', [
    plato(1, 'Con foto', 1, { seccion: 'x' }), plato(2, 'Sin foto', 2, { seccion: 'x' }), plato(3, 'Oculto sin foto', 2, { seccion: 'x' }, { visible: false }), plato(4, 'Nuevo con foto subida', 3, { seccion: 'x' }), plato(5, 'Nuevo sin foto', 3, { seccion: 'x' }),
  ], { fotoDe: (p) => (p.id === 4 ? 'images/carta/plato-4.webp' : undefined) });
  assert.deepEqual(resumen.sinFoto, ['x: Sin foto', 'x: Nuevo sin foto']);
});

test('la foto que ya tiene el artículo en la web gana a la subida a la ficha de Control Financiero', () => {
  const j = [{ name: 'A', price: '1,00€', image: '/images/propia.webp' }];
  assert.equal(aplicarPlatos(j, 'x', [plato(1, 'A', 1, { seccion: 'x' })], { fotoDe: () => 'images/carta/plato-1.webp' }).json[0].image, '/images/propia.webp');
});

test('modo estricto: las secciones libres (la tienda) no se tocan', () => {
  const shop = [{ name: 'Gorra', price: 0 }];
  assert.deepEqual(aplicarPlatos(shop, 'shop', [], { estricta: true, libres: ['shop'] }).json, shop);
  assert.deepEqual(aplicarPlatos(shop, 'shop', [], { estricta: true }).json, []);
});
