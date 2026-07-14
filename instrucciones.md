# Instrucciones — Radio Aventura MX (rediseño Live365)

## Qué cambió en esta versión
- Se rediseñó **todo el sitio y el reproductor**, inspirado en el look & feel de
  `skyrepro/repro-zeno-1` y `skyrepro/PLAYER-SHOUTCAST-ICECAST-ZENO-RADIO`
  (disco giratorio, efecto de letras, menú hamburguesa), pero adaptado a
  **Live365** como proveedor de streaming en lugar de Zeno FM.
- Se quitó la dependencia de jQuery; todo el JS es vanilla (`js/player.js`).
- Se eliminaron los archivos placeholder (`reproductor.html`, `sticky.html`,
  `player.html` viejo) y las librerías jQuery sin uso.
- Se agregó `api/nowplaying.js`, una función serverless de Vercel que lee los
  metadatos ICY directo del stream de Live365, porque **Live365 bloquea CORS**
  y el navegador no puede leer esos metadatos directamente (esto reemplaza al
  `api.php` del proyecto de referencia, que no puede correr en Vercel).
- `config.js` es ahora el único archivo que hay que tocar para conectar tu
  estación y tus redes sociales.

## 🔴 Antes de publicar — datos que faltan
1. **`config.js` → `LIVE365_STATION_ID`**: pon tu ID real de Live365
   (lo ves en tu Dashboard → *Listen*, ejemplo: `a12345`). Sin esto el botón
   de reproducir mostrará una alerta.
2. **`config.js` → `SOCIAL`**: revisa/ajusta tus links reales de Facebook,
   Instagram, X, WhatsApp, YouTube.
3. **`config.js` → `CONTACT_EMAIL`**: correo real de contacto.
4. Revisa que tu estación en Live365 tenga **metadatos ICY habilitados** en tu
   encoder (Artista - Canción). Si tu proveedor de automatización no manda esa
   metadata, `/api/nowplaying` seguirá funcionando pero mostrará el nombre de
   la estación en lugar de la canción — el audio sigue sonando normal de
   todas formas.

## Cómo probarlo en local
```bash
python -m http.server 8000
```
Abre `http://localhost:8000`. **Ojo:** `/api/nowplaying` es una función
serverless de Vercel — en local con `python -m http.server` el audio
reproducirá pero el "now playing" no podrá consultarse (no hay servidor
Node corriendo esa ruta). Para probar la función completa localmente usa
`vercel dev` (requiere `npm i -g vercel` y estar logueado).

## Despliegue
El repo sigue apuntando a Vercel (`radioaventura-web.vercel.app`). Como ya
existe la carpeta `/api`, Vercel detecta automáticamente `nowplaying.js`
como función serverless — no requiere `vercel.json` ni `package.json`
adicionales.

## Verifica al publicar
- [ ] El botón de play conecta al stream de Live365 y suena.
- [ ] El disco gira y el ecualizador se anima mientras reproduce.
- [ ] `/api/nowplaying` responde `{"success":true,"title":"..."}` (pruébalo
      directo en el navegador: `tudominio.vercel.app/api/nowplaying`).
- [ ] El menú hamburguesa abre/cierra en móvil.
- [ ] El reproductor mini aparece al reproducir y desaparece con ✕.
- [ ] `player.html` abre como ventana emergente compacta (útil para el botón
      "Escuchar en vivo" en apps de terceros o directorios de radio).
