# Recorte Split

Editor web para posicionar uma imagem sobre uma grade e exportar cada célula como arquivo independente.

## Recursos

- Upload de PNG, JPG e WEBP.
- Preserva transparência de imagens que já possuem alpha.
- Remoção opcional de fundo por cor com seletor e tolerância.
- Amostragem da cor diretamente na imagem.
- Grade configurável por linhas e colunas e presets 2×2, 3×3, 4×4 e 5×5.
- Arrastar a imagem e aplicar zoom para posicionar os cortes visualmente.
- Proporções automática, 1:1, 1:2, 2:1, 9:16 e 16:9.
- Exportação dos recortes em PNG/WEBP dentro de um único ZIP.
- Exportação da composição como sprite sheet PNG.
- Interface responsiva para desktop e celular.

## Uso local

Abra `index.html` em um navegador moderno. Para desenvolvimento, também pode servir a pasta com qualquer servidor HTTP estático.

## Privacidade

O processamento é feito no navegador. A imagem não precisa ser enviada a um servidor para ser recortada.

## Observação sobre remoção de fundo

A versão inicial usa remoção por similaridade de cor. Funciona melhor com fundos uniformes. Uma etapa futura pode adicionar segmentação por IA para fundos complexos.