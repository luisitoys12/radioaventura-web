# Instrucciones

## Cambios realizados en esta versión
- Eliminé estilos no usados y afiné microcopy de la tarjeta de comunidad para mantener el diseño limpio.
- Ajusté el markup para mantener la estructura HTML consistente.
- Mantuve la identidad `radioaventuramx`, el reloj de Irapuato y el layout claro sin texto redundante.

## Requisitos o dependencias nuevas
- Ninguno.

## Guía paso a paso para probar la funcionalidad
1. Ejecuta un servidor local:
   - `python -m http.server 8000`
2. Abre el navegador en:
   - `http://localhost:8000`
3. (Opcional) Valida el HTML con htmlhint:
   - `npx htmlhint index.html`
4. Verifica:
   - Que el menú principal funcione correctamente.
   - Que el reloj muestre la hora de Irapuato y se actualice cada segundo.
   - Que la tarjeta de comunidad muestre el estado "En vivo ahora".
