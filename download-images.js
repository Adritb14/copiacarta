import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Base URL del repositorio HuggingFace
const BASE_URL = 'https://restauranteluckyluke-restauranteluckyluke.static.hf.space/images';

// Imágenes a descargar
const images = [
	// Logos y principales
	{ url: `${BASE_URL}/Lucky_Horizontal_Principal%20negativo.png`, path: 'public/images/Lucky_Horizontal_Principal_negativo.png' },
	{ url: `${BASE_URL}/Lucky_Simple_principal.png`, path: 'public/images/Lucky_Simple_principal.png' },
	{ url: `${BASE_URL}/BFbanner.jpeg`, path: 'public/images/BFbanner.jpeg' },
	{ url: `${BASE_URL}/SWEETSANTA.jpeg`, path: 'public/images/SWEETSANTA.jpeg' },
	{ url: `${BASE_URL}/GINGERGRINCH.jpeg`, path: 'public/images/GINGERGRINCH.jpeg' },
	{ url: `${BASE_URL}/tMQfBYwOpdA0mnxUByTu0.webp`, path: 'public/images/tMQfBYwOpdA0mnxUByTu0.webp' },
	
	// Cervezas de BARRIL
	{ url: `${BASE_URL}/barril/1906-reserva.jpg`, path: 'public/images/barril/1906-reserva.jpg' },
	{ url: `${BASE_URL}/barril/brewdog-punk-ipa.jpg`, path: 'public/images/barril/brewdog-punk-ipa.jpg' },
	{ url: `${BASE_URL}/barril/brugse-zot-dubbel.jpg`, path: 'public/images/barril/brugse-zot-dubbel.jpg' },
	{ url: `${BASE_URL}/barril/budvar.jpg`, path: 'public/images/barril/budvar.jpg' },
	{ url: `${BASE_URL}/barril/cherry-chouffe.jpg`, path: 'public/images/barril/cherry-chouffe.jpg' },
	{ url: `${BASE_URL}/barril/chouffe-blonde.jpg`, path: 'public/images/barril/chouffe-blonde.jpg' },
	{ url: `${BASE_URL}/barril/duvel-666.jpg`, path: 'public/images/barril/duvel-666.jpg' },
	{ url: `${BASE_URL}/barril/erdinger.jpg`, path: 'public/images/barril/erdinger.jpg' },
	{ url: `${BASE_URL}/barril/grimbergen.jpg`, path: 'public/images/barril/grimbergen.jpg' },
	{ url: `${BASE_URL}/barril/guinness.jpg`, path: 'public/images/barril/guinness.jpg' },
	{ url: `${BASE_URL}/barril/gulden.webp`, path: 'public/images/barril/gulden.webp' },
	{ url: `${BASE_URL}/barril/ij-ipa.jpg`, path: 'public/images/barril/ij-ipa.jpg' },
	{ url: `${BASE_URL}/barril/liefmans.jpg`, path: 'public/images/barril/liefmans.jpg' },
	{ url: `${BASE_URL}/barril/maredsous.jpg`, path: 'public/images/barril/maredsous.jpg' },
	{ url: `${BASE_URL}/barril/straffe-hendrick.jpg`, path: 'public/images/barril/straffe-hendrick.jpg' },
	
	// Cervezas de BOTELLA
	{ url: `${BASE_URL}/botella/affligem-triple.png`, path: 'public/images/botella/affligem-triple.png' },
	{ url: `${BASE_URL}/botella/anvers.png`, path: 'public/images/botella/anvers.png' },
	{ url: `${BASE_URL}/botella/asahi.png`, path: 'public/images/botella/asahi.png' },
	{ url: `${BASE_URL}/botella/augustinj.png`, path: 'public/images/botella/augustinj.png' },
	{ url: `${BASE_URL}/botella/belztriple.png`, path: 'public/images/botella/belztriple.png' },
	{ url: `${BASE_URL}/botella/bieredudemon.png`, path: 'public/images/botella/bieredudemon.png' },
	{ url: `${BASE_URL}/botella/bourgogne.png`, path: 'public/images/botella/bourgogne.png' },
	{ url: `${BASE_URL}/botella/budweisser.png`, path: 'public/images/botella/budweisser.png' },
	{ url: `${BASE_URL}/botella/carlsberg.png`, path: 'public/images/botella/carlsberg.png' },
	{ url: `${BASE_URL}/botella/chapeau-pina-exotic.png`, path: 'public/images/botella/chapeau-pina-exotic.png' },
	{ url: `${BASE_URL}/botella/cherie-granada.png`, path: 'public/images/botella/cherie-granada.png' },
	{ url: `${BASE_URL}/botella/cherie-melocoton.png`, path: 'public/images/botella/cherie-melocoton.png' },
	{ url: `${BASE_URL}/botella/chouffe-houblon.png`, path: 'public/images/botella/chouffe-houblon.png' },
	{ url: `${BASE_URL}/botella/ciucas.png`, path: 'public/images/botella/ciucas.png' },
	{ url: `${BASE_URL}/botella/corona.png`, path: 'public/images/botella/corona.png' },
	{ url: `${BASE_URL}/botella/cuvee-des-trolls.png`, path: 'public/images/botella/cuvee-des-trolls.png' },
	{ url: `${BASE_URL}/botella/duvel.png`, path: 'public/images/botella/duvel.png' },
	{ url: `${BASE_URL}/botella/hoegaarden.png`, path: 'public/images/botella/hoegaarden.png' },
	{ url: `${BASE_URL}/botella/negramodelo.png`, path: 'public/images/botella/negramodelo.png' },
	{ url: `${BASE_URL}/botella/palma.png`, path: 'public/images/botella/palma.png' },
	{ url: `${BASE_URL}/botella/pink-killer.png`, path: 'public/images/botella/pink-killer.png' },
	{ url: `${BASE_URL}/botella/rince.png`, path: 'public/images/botella/rince.png' },
	{ url: `${BASE_URL}/botella/rivera.png`, path: 'public/images/botella/rivera.png' }
];

async function downloadImage(url, filepath) {
	try {
		console.log(`📥 Descargando: ${url}`);
		
		const response = await fetch(url);
		
		if (!response.ok) {
			console.log(`⚠️  No encontrada (${response.status}): ${url}`);
			return false;
		}
		
		const buffer = await response.arrayBuffer();
		const fullPath = join(__dirname, filepath);
		
		// Crear directorio si no existe
		await mkdir(dirname(fullPath), { recursive: true });
		
		// Guardar imagen
		await writeFile(fullPath, Buffer.from(buffer));
		
		console.log(`✅ Guardada: ${filepath}`);
		return true;
	} catch (error) {
		console.error(`❌ Error descargando ${url}:`, error.message);
		return false;
	}
}

async function downloadAll() {
	console.log('🚀 Iniciando descarga de imágenes...\n');
	
	let downloaded = 0;
	let failed = 0;
	
	for (const image of images) {
		const success = await downloadImage(image.url, image.path);
		if (success) {
			downloaded++;
		} else {
			failed++;
		}
		
		// Pequeña pausa entre descargas para no saturar
		await new Promise(resolve => setTimeout(resolve, 200));
	}
	
	console.log('\n✨ Descarga completada!');
	console.log(`✅ Descargadas: ${downloaded}`);
	console.log(`⚠️  Fallidas: ${failed}`);
}

downloadAll();
