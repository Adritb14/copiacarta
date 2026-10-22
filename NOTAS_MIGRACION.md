# 📋 Notas de Migración - Lucky Luke Menu

## ✅ Completado

### Estructura del Proyecto
- ✅ Configuración de **Tailwind CSS 4** con Astro
- ✅ Layout principal con todas las dependencias (AOS, Feather Icons, Swiper)
- ✅ Sistema de componentes reutilizables

### Componentes Creados

1. **Layout.astro** - Layout base del sitio
   - Meta tags y SEO
   - Fuentes (Google Fonts + custom)
   - Scripts globales (AOS, Feather Icons, Swiper)
   - Estilos globales (fuentes custom, border-western, menu-category)

2. **Navigation.astro** - Navegación principal
   - Logo responsive
   - Menú móvil (con lógica de toggle)
   - Enlaces a secciones

3. **TableOfContents.astro** - TOC flotante móvil
   - Botón flotante inferior izquierda
   - Lista de secciones
   - Auto-cierre al hacer clic

4. **MenuSection.astro** - Contenedor de secciones
   - Título con líneas decorativas
   - Descripción opcional
   - Grid responsive

5. **MenuItem.astro** - Item de menú individual
   - Nombre, precio, descripción
   - Sistema de alérgenos con colores
   - Hover effects

6. **DrinkItem.astro** - Item simple para bebidas
   - Layout inline (nombre | precio)
   - Minimalista

7. **FeaturedCard.astro** - Cards destacadas con imagen
   - Para items especiales (ej: Burgers de Navidad)
   - Imagen, nombre, precio, descripción
   - Emojis y colores personalizables

### Contenido Migrado

- ✅ Refrescos Premium (12 items)
- ✅ Fusion Bites (6 items)
- ✅ Bocatas Gourmet (3 items)
- ✅ Patatas (4 items)
- ✅ Nachos (3 items)
- ✅ Ensaladas (3 items)
- ✅ Burgers (4 items + sección especial de Navidad)
- ✅ Carnes (2 items)
- ✅ Mexicano (3 items)
- ✅ Postres (3 items)

## ⚠️ Pendiente

### Fuentes Personalizadas
Necesitas añadir los archivos de fuente a `public/fonts/`:
- `Burford.woff2`
- `Bratton.woff2`

**Nota**: Actualmente el Layout está configurado para usar estas fuentes, pero harán fallback a las fuentes de Google (Bebas Neue y Roboto) si no las tienes.

### Sección de Cervezas
El template original tiene una sección compleja de cervezas con:
- Carrusel Swiper
- Tarjetas flip (front/back)
- Cervezas de barril y botella

**Para implementar esto necesitarías**:
1. Crear componente `FlipCard.astro` para las tarjetas con efecto flip
2. Crear componente `BeerCarousel.astro` con lógica de Swiper
3. Añadir los estilos específicos de Swiper que estaban en el HTML original

### Otras Páginas
El HTML original tiene enlaces a:
- `/reservas`
- `/eventos`
- `/contacto`

Podrías crear estas páginas siguiendo el mismo patrón de `index.astro`.

## 🎨 Personalización

### Colores
Los colores principales están definidos en Tailwind:
- Rojo: `text-red-600`, `bg-red-600` (#DC2626)
- Negro: `bg-black`
- Grises: varios tonos

Si quieres cambiar el rojo principal, puedes extender la configuración de Tailwind.

### Fuentes
Las fuentes se configuran en [Layout.astro](src/layouts/Layout.astro):
```css
.font-burford { font-family: 'Burford', 'Bebas Neue', sans-serif; }
.font-bratton { font-family: 'Bratton', 'Roboto', sans-serif; }
```

### Animaciones
AOS está configurado con:
- `duration: 800ms`
- `once: true` (solo anima una vez)
- `offset: 100px`

Puedes ajustar estos valores en el `<script>` del Layout.

## 🚀 Próximos Pasos Sugeridos

1. **Añadir las fuentes personalizadas** al proyecto
2. **Implementar la sección de cervezas** con Swiper y FlipCards
3. **Crear páginas adicionales** (reservas, eventos, contacto)
4. **Optimizar imágenes**: Actualmente las imágenes están en URLs externas de Hugging Face
   - Podrías descargarlas a `public/images/`
   - Usar el componente `<Image>` de Astro para optimización automática
5. **Mejorar SEO**: Añadir meta descriptions específicas por página
6. **Implementar filtros**: Por ejemplo, filtrar por alérgenos
7. **Añadir búsqueda**: Para buscar platos por nombre
8. **PWA**: El HTML original tenía configuración PWA (manifest.json)

## 📦 Dependencias Instaladas

```json
{
  "dependencies": {
    "astro": "^5.16.6",
    "@tailwindcss/vite": "^4.1.18",
    "tailwindcss": "^4.1.18"
  }
}
```

### CDNs Externos (cargados desde Layout)
- AOS (animaciones)
- Feather Icons (iconos)
- Swiper (carruseles)
- Google Fonts (Bebas Neue, Roboto, Creepster)

## 🎯 Ventajas de la Migración

✅ **Componentes reutilizables**: Fácil mantener y actualizar
✅ **Mejor rendimiento**: Astro genera HTML estático
✅ **Mejor DX**: TypeScript, hot reload, mejor organización
✅ **Escalable**: Fácil añadir nuevas páginas y componentes
✅ **SEO friendly**: HTML estático optimizado para buscadores
✅ **Menos código**: Los componentes evitan repetición

## 📝 Comandos Útiles

```bash
# Desarrollo
pnpm run dev

# Build para producción
pnpm run build

# Preview del build
pnpm run preview

# Añadir una integración
pnpm astro add [nombre]
```

## 🔧 Personalizar un Item del Menú

```astro
<MenuItem 
  name="TU PLATO"
  price="XX,XX€"
  description="Descripción deliciosa"
  allergens={['Gluten', 'Lácteos']}
  showAllergens={true}  <!-- opcional, por defecto false -->
/>
```

## 🎨 Añadir una Nueva Sección

```astro
<MenuSection 
  id="nueva-seccion"  <!-- para el anchor -->
  title="MI NUEVA SECCIÓN"
  description="Descripción opcional"
>
  <!-- Items aquí -->
</MenuSection>
```

No olvides añadirla al array de `sections` para el TOC!

---

¡Buen trabajo migrando a Astro! 🚀
