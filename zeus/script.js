let fazendo = false;
let response_text = document.getElementById("resp");
let cached = JSON.parse(localStorage.getItem(CACHE_KEY));

async function chamarCaos(prompt, models, temperature, api_key, api) {

    console.log("Enviando");
    response_text.textContent = "";
    fazendo = true;

    let respostaFinal = "";

    try {
        const response = await fetch(api + "/caos-1", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_key: api_key,
                model: models,
                input: prompt,
                temperature: temperature,
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (let line of lines) {
                if (!line.startsWith("data: ")) continue;
                const dataStr = line.replace("data: ", "").trim();
                if (!dataStr || dataStr === "[DONE]") continue;

                try {
                    const data = JSON.parse(dataStr);

                    if (data.type === "token") {
                        respostaFinal += data.content;
                        response_text.innerHTML = marked.parse(respostaFinal);
                    }
                    if (data.type === "final") {
                        respostaFinal = data.response;
                    }
                    if (data.type === "done") {
                        fazendo = false;
                        console.log("DONE");
                    }
                } catch (err) {
                    console.log("JSON inválido ignorado:", dataStr);
                }
            }
        }

    } catch (error) {
        console.error("Erro:", error);
        fazendo = false;
    }
}

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

async function response() {
    cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    const prompt_text = document.getElementById("imput-chat").value;

    console.log(prompt_text)
    response_text.textContent = "Iniciando";

    const verificador = await verificarServidor(cached.data.url);

    console.log("gg")

    if (!fazendo){
        if (verificador) {
            if (prompt_text.trim() !== "") {
                fazendo = true
                console.log("Começando")
                const caos_response = chamarCaos(prompt_text, 
                    "google/gemma-3-1b", 0.67, 
                    "cs-global", 
                    cached.data.url
                )
            }
        }
    } else {console.log("to respondendo outra pergunta")}
}
