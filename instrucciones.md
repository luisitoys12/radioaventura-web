<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estación Kusmedios - En Vivo</title>
    <style>
        :root {
            --primary-color: #6200ee;
            --accent-color: #03dac6;
            --bg-color: #f5f5f5;
            --text-color: #333;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        header, footer {
            background-color: var(--primary-color);
            color: white;
            padding: 1rem;
            text-align: center;
        }

        main {
            flex: 1;
            padding: 20px;
            max-width: 1200px;
            margin: auto;
            width: 100%;
            box-sizing: border-box;
        }

        /* Sección Hero y Reproductor */
        .hero {
            text-align: center;
            padding: 40px 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .player-container {
            margin: 20px 0;
        }

        audio {
            width: 100%;
            max-width: 400px;
        }

        /* Sección Comunidad en Vivo */
        .community-section {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 30px;
        }

        .card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            flex: 1;
            min-width: 300px;
        }

        .listener-count {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color);
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        input, textarea, button {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }

        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            transition: opacity 0.3s;
        }

        button:hover {
            opacity: 0.9;
        }

        .love-note {
            font-size: 0.9rem;
            font-style: italic;
            margin-top: 10px;
            display: block;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .community-section {
                flex-direction: column;
            }
            .card {
                min-width: 100%;
            }
        }
    </style>
</head>
<body>

    <header>
        <h1>Estación Kusmedios</h1>
    </header>

    <main>
        <section class="hero">
            <h2>Escucha nuestra señal en directo</h2>
            <div class="player-container">
                <audio controls>
                    <source src="URL_DE_TU_STREAMING" type="audio/mpeg">
                    Tu navegador no soporta el elemento de audio.
                </audio>
            </div>
            <span class="love-note">Hecho con amor por estacionkusmedios.</span>
        </section>

        <div class="community-section">
            <div class="card">
                <h3>Comunidad en vivo</h3>
                <p>Oyentes actuales:</p>
                <div id="counter" class="listener-count">—</div>
                <p><small>Sincronizado en tiempo real</small></p>
            </div>

            <div class="card">
                <h3>Peticiones Musicales</h3>
                <form action="mailto:cushmediagroup@gmail.com" method="post" enctype="text/plain">
                    <input type="text" name="Nombre" placeholder="Tu nombre" required>
                    <input type="text" name="Cancion" placeholder="Canción que deseas pedir" required>
                    <textarea name="Mensaje" rows="3" placeholder="Mensaje para el locutor"></textarea>
                    <button type="submit">Enviar Petición</button>
                </form>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; 2026 Estación Kusmedios. Hecho con amor por estacionkusmedios.</p>
    </footer>

    <script>
        // Lógica simple para simular o cargar conteo de oyentes
        // Aquí podrías integrar un fetch a la API de tu servidor de streaming (Icecast/Shoutcast)
        async function updateListeners() {
            try {
                // Ejemplo: const response = await fetch('api_url');
                // document.getElementById('counter').innerText = data.listeners;
                console.log("Actualizando contador...");
            } catch (e) {
                document.getElementById('counter').innerText = "—";
            }
        }
        
        // Ejecutar al cargar
        updateListeners();
    </script>
</body>
</html>