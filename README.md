# Tienda natural: demo de portafolio

Este proyecto es una demo ficticia y estática. Los productos, precios y usuarios
son de ejemplo. No se realizan pagos, envíos ni comunicaciones reales.

## Ejecutar el frontend

Desde `frontend`, con las dependencias instaladas:

```text
npm run dev
npm run build
npm run preview
```

La demo no necesita variables de entorno, backend ni base de datos. El acceso
como cliente o administrador se elige en la pantalla inicial; no ofrece
autenticación real ni debe utilizarse para información sensible.

Los cambios y compras simuladas se guardan en el `localStorage` del navegador.
El botón «Restablecer datos de demo» elimina las claves de la demo y vuelve a
cargar sus datos iniciales. Las imágenes seleccionadas en administración no se
suben ni se conservan: se utiliza una imagen local de ejemplo.

## Publicar en Netlify

Configurar `frontend` como directorio base, `npm run build` como comando de
compilación y `dist` como directorio de publicación. `public/_redirects`
permite abrir directamente las rutas de React Router. El directorio backend no
forma parte del sitio publicado; mantenelo fuera de la configuración de build.

El proyecto usa `noindex` y `robots.txt`, pero estas instrucciones no sustituyen
el control de acceso. La demo y sus datos locales no son privados.
