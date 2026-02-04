# Instrucciones

## Cambios realizados en esta versión
- Actualización de documentación para reflejar la validación visual solicitada del proyecto en ejecución.
- Revisión de pasos de prueba para incluir interacción con el reproductor antes de capturar evidencia.

## Requisitos o dependencias nuevas
- Ninguno.

## Guía paso a paso para probar la funcionalidad
1. Ejecuta un servidor local:
   - `python -m http.server 8000`
2. Abre el navegador en:
   - `http://localhost:8000`
3. Interactúa con el reproductor:
   - Presiona el botón de play para verificar que inicia la reproducción.
   - Ajusta el volumen para confirmar que responde.
4. Verifica que el texto "Hecho con amor por estacionkusmedios." esté visible en el hero y footer.
