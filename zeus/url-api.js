const CACHE_KEY = "caos_cache";
const STATUS_KEY = "caos_status";
const TTL = 1000 * 60 * 60;

const API_URL = "https://mesinhasserver.vercel.app/api/caos";

async function verificarServidor(url) {
    try {
        const res = await fetch(url + "/health", {
            cache: "no-store"
        });

        if (!res.ok) return false;

        const data = await res.json();
        return data?.status === "ok";

    } catch {
        return false;
    }
}

function setStatus(status) {
    localStorage.setItem(STATUS_KEY, JSON.stringify({
        status,
        last_check: Date.now()
    }));
}

function getStatus() {
    return JSON.parse(localStorage.getItem(STATUS_KEY));
}

export async function getCaosUrl() {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    const now = Date.now();

    let shouldRevalidate = false;

    if (cached?.data?.last_update) {
        const last = new Date(cached.data.last_update).getTime();

        if (now - last < TTL) {
            return cached.data.url;
        }

        shouldRevalidate = true;
    }

    if (shouldRevalidate && cached?.data?.url) {
        const ok = await verificarServidor(cached.data.url);

        if (ok) {
            setStatus("on");
            return cached.data.url;
        }

        setStatus("off");
    }

    try {
        const res = await fetch(API_URL + "?mode=force", {
            cache: "no-store"
        });

        const json = await res.json();

        if (!json?.data?.url) {
            setStatus("off");
            return cached?.data?.url || null;
        }

        const data = json.data;

        const newCache = {
            data: {
                url: data.url,
                last_update: data.last_update
            }
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));

        const ok = await verificarServidor(data.url);

        if (ok) {
            setStatus("on");
        } else {
            setStatus("off");
        }

        return data.url;

    } catch (err) {
        console.error("Erro ao buscar nova URL:", err);
        setStatus("off");
    }

    setStatus("off");
    return cached?.data?.url || null;
}

getCaosUrl()

setInterval(async () => {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));

    if (cached?.data?.url) {
        const ok = await verificarServidor(cached.data.url);

        setStatus(ok ? "on" : "off");
    }
}, TTL);