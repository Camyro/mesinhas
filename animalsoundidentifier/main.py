import sys
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer


# ==============================
# CONFIGURAÇÕES
# ==============================

AUDIO_FILE = "XC1083160 - Pampa Finch - Embernagra platensis.mp3"   # coloque aqui seu arquivo
LATITUDE = -23.55         # opcional (São Paulo exemplo)
LONGITUDE = -46.63        # opcional
MIN_CONFIDENCE = 0.15
TOP_N = 5


# ==============================
# PROCESSAMENTO INTELIGENTE
# ==============================

def process_detections(detections, min_conf=0.15, top_n=5):
    species_data = {}

    for d in detections:
        if d["confidence"] < min_conf:
            continue

        name = d["scientific_name"]
        common = d["common_name"]
        conf = d["confidence"]

        if name not in species_data:
            species_data[name] = {
                "common_name": common,
                "scientific_name": name,
                "max_confidence": conf,
                "total_confidence": conf,
                "count": 1
            }
        else:
            species_data[name]["count"] += 1
            species_data[name]["total_confidence"] += conf
            species_data[name]["max_confidence"] = max(
                species_data[name]["max_confidence"], conf
            )

    # calcular média + score final
    for name in species_data:
        data = species_data[name]
        avg_conf = data["total_confidence"] / data["count"]
        data["avg_confidence"] = avg_conf

        data["final_score"] = (
            data["max_confidence"] * 0.6 +
            avg_conf * 0.3 +
            min(data["count"] / 5, 1) * 0.1
        )

    sorted_species = sorted(
        species_data.values(),
        key=lambda x: x["final_score"],
        reverse=True
    )

    return sorted_species[:top_n]


# ==============================
# EXECUÇÃO
# ==============================

def main():

    print("🔍 Carregando modelo...")
    analyzer = Analyzer()

    print("🎧 Lendo áudio...")
    recording = Recording(
        analyzer,
        AUDIO_FILE,
        lat=LATITUDE,
        lon=LONGITUDE
    )

    recording.analyze()

    if not recording.detections:
        print("❌ Nenhuma ave detectada.")
        return

    results = process_detections(
        recording.detections,
        min_conf=MIN_CONFIDENCE,
        top_n=TOP_N
    )

    if not results:
        print("❌ Nenhuma ave passou do threshold mínimo.")
        return

    print("\n🐦 RESULTADO FINAL\n")

    for i, r in enumerate(results, 1):
        print(f"{i}. {r['common_name']} ({r['scientific_name']})")
        print(f"   🔹 Score Final: {r['final_score']:.2f}")
        print(f"   🔹 Confiança Máxima: {r['max_confidence']:.2f}")
        print(f"   🔹 Confiança Média: {r['avg_confidence']:.2f}")
        print(f"   🔹 Ocorrências: {r['count']}")
        print("-" * 40)


if __name__ == "__main__":
    main()
    AUDIO_FILE = "XC1083130 - Song Thrush - Turdus philomelos.mp3"
    main()
    AUDIO_FILE = "VID-20260224-WA0023.mp3.mp3"
    main()