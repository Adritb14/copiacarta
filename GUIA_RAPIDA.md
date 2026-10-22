# 🎯 Guía Rápida - Extender el Proyecto

## Añadir un Nuevo Plato

### Opción 1: Con alérgenos ocultos por defecto
```astro
<MenuItem 
  name="NOMBRE DEL PLATO"
  price="XX,XX€"
  description="Descripción del plato aquí."
  allergens={['Gluten', 'Lácteos']}
/>
```

### Opción 2: Con alérgenos visibles
```astro
<MenuItem 
  name="NOMBRE DEL PLATO"
  price="XX,XX€"
  description="Descripción del plato aquí."
  allergens={['Gluten', 'Lácteos']}
  showAllergens={true}
/>
```

## Añadir una Nueva Sección

1. Añade la sección al array de TOC:
```typescript
const sections = [
  // ... otras secciones
  { id: 'mi-seccion', label: 'Mi Sección' },
];
```

2. Añade la sección en el HTML:
```astro
<MenuSection 
  id="mi-seccion"
  title="MI NUEVA SECCIÓN"
  description="Descripción opcional"
>
  <MenuItem name="..." price="..." description="..." />
  <MenuItem name="..." price="..." description="..." />
</MenuSection>
```

## Añadir un Item Destacado con Imagen

```astro
<FeaturedCard 
  name="Plato Especial"
  price="XX,XX €"
  description="Descripción del plato especial con imagen."
  image="URL_DE_LA_IMAGEN"
  emoji="🎉"
  color="text-red-600"
/>
```

## Modificar Colores de Alérgenos

Edita [MenuItem.astro](src/components/MenuItem.astro):

```typescript
const allergenColors: Record<string, string> = {
  'NuevoAlergeno': 'bg-purple-600',
  // ... otros
};
```

## Añadir una Nueva Página

1. Crea el archivo en `src/pages/`:
```bash
touch src/pages/reservas.astro
```

2. Usa el mismo layout:
```astro
---
import Layout from '../layouts/Layout.astro';
import Navigation from '../components/Navigation.astro';
---

<Layout title="Reservas - Lucky Luke">
  <Navigation />
  <main class="pt-28 md:pt-32 px-4">
    <!-- Tu contenido aquí -->
  </main>
</Layout>
```

## Cambiar Estilos Globales

Edita [Layout.astro](src/layouts/Layout.astro) en la sección `<style is:global>`:

```css
/* Ejemplo: cambiar el color del borde western */
.border-western {
  border: 2px solid rgba(206, 19, 23, 0.5);
  /* ... */
}
```

## Usar Tailwind Classes Personalizadas

Edita `src/styles/global.css` y añade:

```css
@import "tailwindcss";

@layer utilities {
  .my-custom-class {
    /* tus estilos */
  }
}
```

## Integrar React (si lo necesitas)

```bash
pnpm astro add react
```

Luego crea componentes `.tsx` en `src/components/` y úsalos normalmente.

## Optimizar Imágenes

1. Descarga las imágenes a `public/images/`
2. Instala la integración de imágenes de Astro:
```bash
pnpm astro add image
```
3. Usa el componente Image:
```astro
---
import { Image } from 'astro:assets';
import miImagen from '../assets/imagen.jpg';
---

<Image src={miImagen} alt="..." />
```

## Deploy

### Vercel
```bash
pnpm astro add vercel
pnpm run build
```

### Netlify
```bash
pnpm astro add netlify
pnpm run build
```

### GitHub Pages
```bash
# Configura en astro.config.mjs:
export default defineConfig({
  site: 'https://tu-usuario.github.io',
  base: '/tu-repo'
});
```

## Tips de Rendimiento

1. **Lazy load de imágenes**: Ya está implementado con `loading="lazy"`
2. **Minificar CSS/JS**: Astro lo hace automáticamente en build
3. **Preload de fuentes**: Ya está configurado en Layout
4. **Code splitting**: Astro lo hace por página automáticamente

## Debugging

### Ver errores de Tailwind
Si Tailwind no funciona:
1. Verifica que `global.css` esté importado en Layout
2. Reinicia el servidor de desarrollo

### Ver errores de componentes
Revisa la consola del navegador y la terminal donde corre `pnpm run dev`

### Purgar caché
```bash
rm -rf .astro node_modules/.vite
pnpm install
pnpm run dev
```

## Estructura de un Componente Astro

```astro
---
// 1. IMPORTS
import OtroComponente from './OtroComponente.astro';

// 2. PROPS (TypeScript)
interface Props {
  titulo: string;
  opcional?: boolean;
}

const { titulo, opcional = false } = Astro.props;

// 3. LÓGICA (JavaScript/TypeScript)
const datos = await fetch('...');
---

<!-- 4. TEMPLATE (HTML + componentes) -->
<div class="mi-componente">
  <h1>{titulo}</h1>
  <OtroComponente />
</div>

<!-- 5. ESTILOS SCOPED -->
<style>
  .mi-componente {
    /* Solo afecta a este componente */
  }
</style>

<!-- 6. SCRIPTS INTERACTIVOS -->
<script>
  // Se ejecuta en el cliente
  console.log('Hola desde el navegador');
</script>
```

¡Feliz coding! 🚀
