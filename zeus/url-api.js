const CACHE_KEY = "caos_cache";
const TTL = 1000 * 60 * 60;
const API_URL = "https://mesinhasserver.vercel.app/api/caos-key";

// sua função (mantida como você mandou)
async function verificarServidor(api) {
    try {
        const response = await fetch(api + "/health");

        if (response.ok) {
            const data = await response.json();

            if (data.status === "ok") {
                console.log("Servidor ONLINE");
                return true;
            }
        }

        console.log("Servidor OFFLINE");
        return false;

    } catch (error) {
        console.log("Servidor OFFLINE");
        return false;
    }
}

async function getCaosUrl() {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    const now = Date.now();

    // 1. ainda dentro de 1h → usa cache direto
    if (cached?.data?.last_update) {
        const last = new Date(cached.data.last_update).getTime();

        if (now - last < TTL) {
            return cached.data.url;
        }
    }

    // 2. passou 1h → testa API salva
    if (cached?.data?.url) {
        const online = await verificarServidor(cached.data.url);

        if (online) {
            console.log("Usando API existente");
            return cached.data.url;
        }
    }

    // 3. fallback → busca nova URL no Firebase via Vercel
    try {
        const res = await fetch(API_URL);
        const json = await res.json();

        const data = json.data;

        const newCache = {
            data: {
                url: data.url,
                last_update: data.last_update
            }
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));

        return data.url;

    } catch (err) {
        console.error("Erro ao atualizar API:", err);

        // fallback final
        return cached?.data?.url || null;
    }
}

console.log(getCaosUrl())
