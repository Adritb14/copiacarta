# Lucky Luke - Carta Digital

Proyecto migrado de HTML vanilla a **Astro** con una arquitectura moderna basada en componentes.

## 🚀 Estructura del Proyecto

```
/
├── public/
│   └── fonts/          # Fuentes personalizadas (Burford, Bratton)
├── src/
│   ├── components/
│   │   ├── Navigation.astro      # Barra de navegación
│   │   ├── TableOfContents.astro # TOC flotante móvil
│   │   ├── MenuSection.astro     # Sección de menú
│   │   ├── MenuItem.astro        # Item individual del menú
│   │   └── DrinkItem.astro       # Item de bebida
│   ├── layouts/
│   │   └── Layout.astro          # Layout principal
│   ├── pages/
│   │   └── index.astro           # Página principal (carta)
│   └── styles/
│       └── global.css            # Estilos globales con Tailwind
└── package.json
```

## 🛠️ Tecnologías Utilizadas

- **Astro 5.16.6** - Framework principal
- **Tailwind CSS 4** - Framework de estilos
- **AOS** - Animaciones on scroll
- **Feather Icons** - Iconos
- **Swiper** - Carruseles (preparado para sección de cervezas)

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev

# Construir para producción
pnpm run build

# Preview de producción
pnpm run preview
```

## 🎨 Componentes Principales

### Layout.astro
Layout base que incluye:
- Meta tags y SEO
- Fuentes personalizadas (Burford, Bratton)
- Librerías externas (AOS, Swiper, Feather Icons)
- Estilos globales

### Navigation.astro
Barra de navegación fija con:
- Logo del restaurante
- Links a secciones
- Menú móvil responsive

### TableOfContents.astro
Menú flotante para navegación rápida en móviles:
- Botón flotante en esquina inferior izquierda
- Lista de secciones del menú
- Auto-cierre al seleccionar sección

### MenuSection.astro
Contenedor de secciones del menú con:
- Título estilizado con líneas decorativas
- Descripción opcional
- Grid responsive (1 columna móvil, 2 en desktop)

### MenuItem.astro
Card de plato individual con:
- Nombre y precio
- Descripción
- Sistema de alérgenos con colores
- Animaciones hover

### DrinkItem.astro
Item simple para bebidas:
- Nombre y precio en línea
- Estilo minimalista

## 🎯 Características

✅ **Componentes Reutilizables** - Arquitectura modular y mantenible
✅ **Responsive Design** - Optimizado para móvil y desktop
✅ **Animaciones** - Transiciones suaves con AOS
✅ **Tipografía Personalizada** - Fuentes corporativas Burford y Bratton
✅ **Sistema de Alérgenos** - Identificación visual clara
✅ **Table of Contents** - Navegación rápida en móviles
✅ **SEO Friendly** - Meta tags y estructura semántica

## 📝 Próximas Mejoras

- [ ] Añadir sección de cervezas con FlipCard component
- [ ] Integrar carrusel Swiper para cervezas de barril/botella
- [ ] Añadir las fuentes Burford.woff2 y Bratton.woff2 al proyecto
- [ ] Crear páginas adicionales (reservas, eventos, contacto)
- [ ] Implementar filtros de alérgenos
- [ ] Modo oscuro/claro
- [ ] Internacionalización (i18n)

## 🎨 Paleta de Colores

- **Principal**: `#CE1317` (Rojo Lucky Luke)
- **Fondo**: `#000000` (Negro)
- **Texto**: `#FFFFFF` (Blanco)
- **Secundario**: Grises (`#374151`, `#1F2937`)

## 📱 Responsive Breakpoints

- **Móvil**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🤝 Contribuir

Este proyecto ha sido migrado de HTML vanilla a Astro. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

© 2025 Lucky Luke Restaurante. Todos los derechos reservados.
