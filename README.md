# Recorte Split Studio — BETA 1.2.0

Editor web de imagens e sprite sheets com processamento local no navegador.

## Recursos atuais

- Upload de PNG, JPG e WEBP por botão ou arrastar e soltar.
- Detecção automática de transparência e preservação do canal alpha.
- Recorte de edição antes da divisão em frames.
- Brilho, contraste, saturação e rotação.
- Undo/Redo global com atalhos Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z e Ctrl/Cmd+Y.
- Zoom pelo scroll do mouse, barra de zoom, centralização e ajuste automático.
- Remoção de fundo por cor e por IA, com modos Rápido e Profissional.
- Correção manual da máscara com pincel de restaurar/apagar.
- Upscale 1×/2×/4×, nitidez, redução de ruído e melhoria automática.
- Grade configurável, presets de linha e grades até 8×8.
- Detecção de sprites baseada em transparência quando disponível.
- Proporções de frame, proporção personalizada, gap entre frames e padding na saída.
- Quadro mestre com alça arrastável para replicar o enquadramento.
- Preview individual de todos os frames antes da exportação.
- Prefixo personalizado e numeração automática dos arquivos.
- Exportação ZIP, PNG, JPG, WEBP e PDF.
- Preferências básicas preservadas no navegador com localStorage.
- Interface responsiva para desktop e celular.

## Privacidade

O processamento principal acontece no navegador. As imagens permanecem no dispositivo do usuário durante o fluxo normal de edição.

## Observações de desempenho

Operações de IA, upscale e filtros podem exigir bastante memória. O projeto aplica limites de segurança diferentes para celular e desktop para reduzir travamentos.

## Estrutura

- `app.js` — núcleo do editor, grade, histórico, preview e exportação.
- `ai-bg.js` — remoção de fundo por IA.
- `quality.js` — upscale, nitidez e redução de ruído.
- `crop-edit.js` — recorte de edição.
- `master-fix.js` — quadro mestre redimensionável.
- `styles.css` — interface responsiva.

## Uso local

Abra `index.html` em um navegador moderno ou sirva a pasta com um servidor HTTP estático.