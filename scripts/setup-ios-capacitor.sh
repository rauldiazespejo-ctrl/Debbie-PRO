#!/usr/bin/env bash
# Genera o actualiza el proyecto Xcode (Capacitor) a partir de /public.
# Requisitos: Node.js 18+, Xcode 15+, CocoaPods (gem install cocoapods o brew install cocoapods).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: no se encontró npm. Instala Node.js 18 LTS desde https://nodejs.org e inténtalo de nuevo."
  exit 1
fi

npm install

if [[ ! -d "$ROOT/ios" ]]; then
  echo "Creando plataforma iOS (primera vez)…"
  npx cap add ios
else
  echo "Sincronizando web → iOS…"
  npx cap sync ios
fi

echo ""
echo "Listo. Pasos siguientes:"
echo "  1) Abrir Xcode:  npx cap open ios"
echo "  2) Elegir tu equipo de firma en el target App (Signing & Capabilities)."
echo "  3) Compilar dispositivo/simulador: Cmd+B"
echo "  4) Archivo para distribución: menú Product → Archive (requiere cuenta Apple Developer)."
echo ""
