/**
 * ============================================================
 *  /api/nowplaying — función serverless (Vercel, Node.js)
 *
 *  Equivalente en Node del "api.php" de PLAYER-SHOUTCAST-ICECAST-
 *  ZENO-RADIO: se conecta al stream MP3 de Live365 pidiendo
 *  metadatos ICY (header "Icy-MetaData: 1") y extrae el
 *  "StreamTitle" (Artista - Canción) actual.
 *
 *  Existe porque Live365 bloquea CORS en el navegador: el fetch
 *  tiene que hacerse desde el servidor, no desde el cliente.
 *
 *  Configura el ID de tu estación en config.js (LIVE365_STATION_ID).
 *  Aquí abajo solo necesitas confirmar STREAM_URL si prefieres
 *  fijarlo directo en el servidor en vez de mandarlo por query.
 * ============================================================
 */

const http = require("http");
const https = require("https");

// Si prefieres no depender del query param, puedes fijar aquí
// directamente tu URL de stream de Live365 y listo:
// const DEFAULT_STREAM_URL = "https://streaming.live365.com/TU_ID_DE_LIVE365";
const DEFAULT_STREAM_URL = "";

const FETCH_TIMEOUT_MS = 6000;
const MAX_METADATA_BYTES = 4080; // 255 * 16, límite del protocolo ICY

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const streamUrl =
    (req.query && req.query.url) || DEFAULT_STREAM_URL || "";

  if (!streamUrl) {
    res.status(400).json({
      success: false,
      title: "",
      error: "Falta la URL del stream (parámetro ?url= o DEFAULT_STREAM_URL en api/nowplaying.js)",
    });
    return;
  }

  try {
    const title = await fetchIcyTitle(streamUrl);
    if (title) {
      res.status(200).json({ success: true, title: title, error: "" });
    } else {
      res.status(200).json({
        success: false,
        title: "",
        error: "El stream no envió metadatos ICY (StreamTitle vacío).",
      });
    }
  } catch (err) {
    res.status(200).json({
      success: false,
      title: "",
      error: "No se pudo conectar al stream: " + (err && err.message ? err.message : "error desconocido"),
    });
  }
};

function fetchIcyTitle(streamUrl) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try {
      urlObj = new URL(streamUrl);
    } catch (e) {
      reject(new Error("URL de stream inválida"));
      return;
    }

    const client = urlObj.protocol === "http:" ? http : https;
    const req = client.get(
      streamUrl,
      {
        headers: {
          "Icy-MetaData": "1",
          "User-Agent": "Mozilla/5.0 (compatible; RadioAventuraMX-NowPlaying/1.0)",
        },
        timeout: FETCH_TIMEOUT_MS,
      },
      (response) => {
        // Algunos servidores Shoutcast antiguos responden "ICY 200 OK"
        // en vez de "HTTP/1.1 200 OK". Node normalmente lo tolera si
        // llega hasta aquí; si no, el evento 'error' de abajo lo atrapa.
        if (response.statusCode && response.statusCode >= 400) {
          response.destroy();
          reject(new Error("El stream respondió con código " + response.statusCode));
          return;
        }

        const metaIntHeader = response.headers["icy-metaint"];
        const metaInt = metaIntHeader ? parseInt(metaIntHeader, 10) : 0;

        if (!metaInt || isNaN(metaInt) || metaInt <= 0) {
          response.destroy();
          reject(new Error("El stream no expone icy-metaint (sin metadatos en vivo)"));
          return;
        }

        let received = 0;
        let audioBytesLeft = metaInt;
        let metaLengthByte = -1; // -1 = aún no leído
        let metaBytesLeft = 0;
        const metaChunks = [];
        let done = false;

        const finish = (title) => {
          if (done) return;
          done = true;
          response.destroy();
          clearTimeout(safety);
          resolve(title);
        };

        const safety = setTimeout(() => {
          finish("");
        }, FETCH_TIMEOUT_MS);

        response.on("data", (chunk) => {
          if (done) return;
          let offset = 0;

          while (offset < chunk.length && !done) {
            if (audioBytesLeft > 0) {
              const skip = Math.min(audioBytesLeft, chunk.length - offset);
              audioBytesLeft -= skip;
              offset += skip;
              continue;
            }

            if (metaLengthByte === -1) {
              metaLengthByte = chunk[offset] * 16;
              offset += 1;
              metaBytesLeft = metaLengthByte;
              if (metaBytesLeft === 0) {
                // sin metadata este bloque, reinicia el ciclo de audio
                metaLengthByte = -1;
                audioBytesLeft = metaInt;
              } else if (metaBytesLeft > MAX_METADATA_BYTES) {
                finish("");
              }
              continue;
            }

            const take = Math.min(metaBytesLeft, chunk.length - offset);
            if (take > 0) {
              metaChunks.push(chunk.slice(offset, offset + take));
              offset += take;
              metaBytesLeft -= take;
            }

            if (metaBytesLeft === 0) {
              const metaText = Buffer.concat(metaChunks).toString("utf8");
              const match = /StreamTitle='([^']*)'/.exec(metaText);
              const rawTitle = match ? match[1] : "";
              const cleaned = rawTitle
                .replace(/^(now\s+(on\s+air|playing)|on\s+air)\s*[:\-]\s*/i, "")
                .trim();
              finish(cleaned);
              return;
            }
          }

          received += chunk.length;
        });

        response.on("error", () => finish(""));
        response.on("end", () => finish(""));
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Tiempo de espera agotado conectando al stream"));
    });
    req.on("error", (err) => reject(err));
  });
}
