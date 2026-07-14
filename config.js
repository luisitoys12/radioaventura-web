/**
 * ============================================================
 *  RADIO AVENTURA MX — CONFIGURACIÓN
 *  Este es el único archivo que necesitas tocar para conectar
 *  tu cuenta de Live365 y personalizar los enlaces del sitio.
 * ============================================================
 */
window.RA_CONFIG = {

  // ---- LIVE365 ------------------------------------------------
  // Tu ID de estación en Live365 (lo encuentras en Dashboard > Listen).
  // Ejemplo real de Live365: "a12345"
  LIVE365_STATION_ID: "TU_ID_DE_LIVE365",

  // URL directa del stream MP3 de Live365 (se arma sola con el ID de arriba,
  // normalmente NO necesitas tocar esta línea).
  get STREAM_URL() {
    return `https://streaming.live365.com/${this.LIVE365_STATION_ID}`;
  },

  // Endpoint propio (función serverless en /api/nowplaying) que lee los
  // metadatos ICY del stream para esquivar el bloqueo CORS de Live365.
  NOWPLAYING_ENDPOINT: "/api/nowplaying",

  // Cada cuántos milisegundos se consulta "qué está sonando" (15s por defecto).
  NOWPLAYING_POLL_MS: 15000,

  // ---- IDENTIDAD DE LA ESTACIÓN --------------------------------
  STATION_NAME: "Radio Aventura MX",
  STATION_FREQ: "107.9 FM",
  STATION_CITY: "Irapuato, Guanajuato",
  STATION_TAGLINE: "La radio más aventurera de Irapuato",

  // ---- REDES SOCIALES (deja "" para ocultar el ícono) ----------
  SOCIAL: {
    facebook: "https://www.facebook.com/radioaventuramx",
    instagram: "https://www.instagram.com/radioaventuramx",
    x: "https://www.x.com/radioaventuramx",
    youtube: "",
    whatsapp: "https://wa.me/524621234567",
  },

  // ---- CONTACTO --------------------------------------------------
  CONTACT_EMAIL: "contacto@radioaventuramx.com",

};
