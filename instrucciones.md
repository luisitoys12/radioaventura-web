# Instrucciones

## Cambios realizados en esta versión
- Se añadió la sección "Comunidad en vivo" con conteo de oyentes y formulario de peticiones musicales.
- El formulario de peticiones se envía a cushmediagroup@gmail.com vía mailto.
- Se incorporaron estilos dedicados para la sección de comunidad en desktop y mobile.

## Requisitos o dependencias nuevas
- Ninguno.

## Guía paso a paso para probar la funcionalidad
1. Ejecuta un servidor local:
   - `python -m http.server 8000`
2. Abre el navegador en:
   - `http://localhost:8000`
3. Verifica:
   - Que el contador de oyentes muestre valor (o "—" si la API no lo expone).
   - Que el formulario de peticiones abra tu cliente de correo al enviar.
   - Que la sección "Comunidad en vivo" se vea organizada en mobile y desktop.
