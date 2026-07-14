/**
 * ============================================================
 *  RADIO AVENTURA MX — player.js
 *  Reproductor adaptado para Live365 (inspirado en la lógica de
 *  skyrepro/repro-zeno-1 y PLAYER-SHOUTCAST-ICECAST-ZENO-RADIO,
 *  reescrito en JS puro, sin jQuery).
 * ============================================================
 */
(function () {
  "use strict";

  var CFG = window.RA_CONFIG || {};
  var STREAM_URL = CFG.STREAM_URL || "";
  var NOWPLAYING_ENDPOINT = CFG.NOWPLAYING_ENDPOINT || "/api/nowplaying";
  var POLL_MS = CFG.NOWPLAYING_POLL_MS || 15000;
  var DEFAULT_ARTIST = CFG.STATION_NAME || "Radio Aventura MX";
  var DEFAULT_SONG = CFG.STATION_TAGLINE || "En vivo las 24 horas";
  var DEFAULT_COVER = "img/default.jpg";

  // ---------------------------------------------------------------
  // Audio
  // ---------------------------------------------------------------
  var audio = new Audio();
  audio.preload = "none";
  audio.crossOrigin = "anonymous";

  var els = {};
  function cacheEls() {
    els.playBtns = document.querySelectorAll("[data-play-btn]");
    els.cdArt = document.querySelector("[data-cd-art]");
    els.cdImg = document.querySelector("[data-cd-img]");
    els.heroEq = document.querySelector("[data-hero-eq]");
    els.npArtist = document.querySelector("[data-np-artist]");
    els.npSong = document.querySelector("[data-np-song]");
    els.heroBgImg = document.querySelector("[data-hero-bg-img]");
    els.volSlider = document.querySelector("[data-volume]");
    els.miniPlayer = document.querySelector("[data-mini-player]");
    els.miniCover = document.querySelector("[data-mini-cover]");
    els.miniSong = document.querySelector("[data-mini-song]");
    els.miniPlayBtn = document.querySelector("[data-mini-play]");
    els.miniClose = document.querySelector("[data-mini-close]");
    els.playerHero = document.querySelector(".player-hero");
  }

  var isPlaying = false;
  var isLoading = false;

  function setPlayVisualState() {
    els.playBtns.forEach(function (btn) {
      btn.classList.toggle("is-playing", isPlaying);
      btn.classList.toggle("loading", isLoading);
      btn.setAttribute("aria-label", isPlaying ? "Pausar" : "Reproducir en vivo");
    });
    if (els.miniPlayBtn) {
      els.miniPlayBtn.innerHTML = isPlaying ? iconPause() : iconPlay();
    }
    if (els.cdArt) els.cdArt.classList.toggle("spinning", isPlaying);
    if (els.heroEq) els.heroEq.classList.toggle("playing", isPlaying);
    if (els.miniPlayer) els.miniPlayer.classList.toggle("show", isPlaying || isLoading);
  }

  function iconPlay() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  function iconPause() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  }

  function play() {
    if (!STREAM_URL || STREAM_URL.indexOf("TU_ID_DE_LIVE365") !== -1) {
      alert(
        "Falta configurar el ID de tu estación de Live365.\n" +
        "Ábrelo en config.js → LIVE365_STATION_ID."
      );
      return;
    }
    if (audio.src !== STREAM_URL) audio.src = STREAM_URL;
    isLoading = true;
    setPlayVisualState();
    audio.play().catch(function () {
      isLoading = false;
      isPlaying = false;
      setPlayVisualState();
    });
  }

  function pause() {
    audio.pause();
  }

  function togglePlay() {
    if (isPlaying) pause();
    else play();
  }

  audio.addEventListener("playing", function () {
    isPlaying = true;
    isLoading = false;
    setPlayVisualState();
    fetchNowPlaying();
    startPolling();
  });
  audio.addEventListener("pause", function () {
    isPlaying = false;
    isLoading = false;
    setPlayVisualState();
    stopPolling();
  });
  audio.addEventListener("waiting", function () {
    isLoading = true;
    setPlayVisualState();
  });
  audio.addEventListener("error", function () {
    isLoading = false;
    isPlaying = false;
    setPlayVisualState();
    console.error("[RadioAventura] Error al conectar con el stream de Live365. Revisa config.js.");
  });

  // ---------------------------------------------------------------
  // Volumen (persistente)
  // ---------------------------------------------------------------
  function initVolume() {
    var saved = window.localStorage.getItem("ra_volume");
    var vol = saved !== null ? Number(saved) : 80;
    audio.volume = vol / 100;
    if (els.volSlider) {
      els.volSlider.value = vol;
      els.volSlider.addEventListener("input", function () {
        var v = Number(this.value);
        audio.volume = v / 100;
        window.localStorage.setItem("ra_volume", String(v));
      });
    }
  }

  // ---------------------------------------------------------------
  // Now playing — vía proxy propio /api/nowplaying (evita CORS de Live365)
  // ---------------------------------------------------------------
  var pollTimer = null;
  var lastSong = "";

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(fetchNowPlaying, POLL_MS);
  }
  function stopPolling() {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  function fetchNowPlaying() {
    fetch(NOWPLAYING_ENDPOINT + "?ra=" + Math.random())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var title = data && data.success && data.title ? data.title.trim() : "";
        if (!title || title === lastSong) return;
        lastSong = title;

        var parts = title.split(" - ");
        var artist = parts.length > 1 ? parts[0].trim() : DEFAULT_ARTIST;
        var song = parts.length > 1 ? parts.slice(1).join(" - ").trim() : title;

        shuffleText(els.npArtist, artist);
        shuffleText(els.npSong, song);
        if (els.miniSong) els.miniSong.textContent = title;
        document.title = title + " · " + DEFAULT_ARTIST;

        fetchCoverArt(artist, song);
      })
      .catch(function () {
        /* silencioso: el audio sigue sonando aunque falle la metadata */
      });
  }

  function fetchCoverArt(artist, song) {
    var term = encodeURIComponent((artist + " " + song).trim());
    fetch("https://itunes.apple.com/search?term=" + term + "&media=music&limit=1")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var result = data && data.results && data.results[0];
        var art = result ? result.artworkUrl100.replace("100x100bb", "600x600bb") : DEFAULT_COVER;
        setCoverArt(art);
      })
      .catch(function () { setCoverArt(DEFAULT_COVER); });
  }

  function setCoverArt(url) {
    if (els.cdImg) els.cdImg.src = url;
    if (els.miniCover) els.miniCover.src = url;
    if (els.heroBgImg) els.heroBgImg.src = url;
  }

  // ---------------------------------------------------------------
  // Efecto "shuffle letters" (reescritura sin jQuery)
  // ---------------------------------------------------------------
  var CHARS_LOWER = "abcdefghijklmnopqrstuvwxyz0123456789";
  var CHARS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  function randChar(kind) {
    var set = kind === "upper" ? CHARS_UPPER : CHARS_LOWER;
    return set[Math.floor(Math.random() * set.length)];
  }

  function shuffleText(el, text, fps) {
    if (!el || !text) return;
    fps = fps || 24;
    var target = text.split("");
    var kinds = target.map(function (ch) {
      if (ch === " ") return "space";
      return /[A-Z]/.test(ch) ? "upper" : "lower";
    });
    var step = 6;
    var frame = -step;

    function tick() {
      if (frame > target.length) return;
      var out = target.map(function (ch, i) {
        if (kinds[i] === "space") return " ";
        if (i < frame + step) return target[i];
        return randChar(kinds[i]);
      });
      el.textContent = out.join("");
      frame++;
      setTimeout(tick, 1000 / fps);
    }
    tick();
  }

  // ---------------------------------------------------------------
  // Menú hamburguesa
  // ---------------------------------------------------------------
  function initMenu() {
    var btn = document.querySelector("[data-menu-btn]");
    var links = document.querySelector("[data-nav-links]");
    if (!btn || !links) return;
    btn.addEventListener("click", function () {
      btn.classList.toggle("open");
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        btn.classList.remove("open");
        links.classList.remove("open");
      });
    });
  }

  // ---------------------------------------------------------------
  // Tabs de programación
  // ---------------------------------------------------------------
  function initScheduleTabs() {
    var tabs = document.querySelectorAll("[data-tab]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); });
        document.querySelectorAll("[data-sched-day]").forEach(function (d) { d.classList.remove("active"); });
        tab.classList.add("active");
        var target = document.querySelector('[data-sched-day="' + tab.dataset.tab + '"]');
        if (target) target.classList.add("active");
      });
    });
  }

  // ---------------------------------------------------------------
  // Popup "Anúnciate"
  // ---------------------------------------------------------------
  function initAdPopup() {
    var triggers = document.querySelectorAll("[data-ad-trigger]");
    var overlay = document.querySelector("[data-ad-overlay]");
    var closeBtn = document.querySelector("[data-ad-close]");
    if (!overlay) return;
    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        overlay.classList.add("open");
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { overlay.classList.remove("open"); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  }

  // ---------------------------------------------------------------
  // Mini player controls
  // ---------------------------------------------------------------
  function initMiniPlayer() {
    if (els.miniPlayBtn) els.miniPlayBtn.addEventListener("click", togglePlay);
    if (els.miniClose) {
      els.miniClose.addEventListener("click", function () {
        pause();
      });
    }
  }

  // ---------------------------------------------------------------
  // Aplica config.js al HTML (nombre, redes, contacto) para que
  // config.js sea de verdad el único archivo que hay que tocar.
  // ---------------------------------------------------------------
  var SOCIAL_LABELS = {
    facebook: "f",
    instagram: "IG",
    x: "X",
    youtube: "YT",
    whatsapp: "WA",
  };

  function applyConfig() {
    document.querySelectorAll("[data-cfg-name]").forEach(function (el) { el.textContent = CFG.STATION_NAME || ""; });
    document.querySelectorAll("[data-cfg-freq]").forEach(function (el) { el.textContent = CFG.STATION_FREQ || ""; });
    document.querySelectorAll("[data-cfg-city]").forEach(function (el) { el.textContent = CFG.STATION_CITY || ""; });
    document.querySelectorAll("[data-cfg-tagline]").forEach(function (el) { el.textContent = CFG.STATION_TAGLINE || ""; });
    document.querySelectorAll("[data-cfg-email]").forEach(function (el) {
      el.textContent = CFG.CONTACT_EMAIL || "";
      el.href = "mailto:" + (CFG.CONTACT_EMAIL || "");
    });

    document.querySelectorAll("[data-social-links]").forEach(function (container) {
      var social = CFG.SOCIAL || {};
      Object.keys(social).forEach(function (key) {
        var url = social[key];
        if (!url) return;
        var a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "soc-btn";
        a.setAttribute("aria-label", key);
        a.textContent = SOCIAL_LABELS[key] || key.slice(0, 2).toUpperCase();
        container.appendChild(a);
      });
    });
  }

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  function init() {
    cacheEls();
    applyConfig();
    initVolume();
    initMenu();
    initScheduleTabs();
    initAdPopup();
    initMiniPlayer();

    els.playBtns.forEach(function (btn) {
      btn.addEventListener("click", togglePlay);
    });

    if (els.npArtist) els.npArtist.textContent = DEFAULT_ARTIST;
    if (els.npSong) els.npSong.textContent = DEFAULT_SONG;

    document.documentElement.style.setProperty("--nav-h", "68px");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
