# MotorZero — aplicação do logo

O desenho aprovado mantém a palavra MotorZero, o Z elétrico e o último o cortado. Os SVG são vetores com fundo transparente e preenchimentos sólidos; não incluem o fundo da prévia gerada. As formas foram vetorizadas a partir da referência aprovada em `design/brand/motorzero-reference.png`.

| Ficheiro em public/brand | Cores | Utilização |
| --- | --- | --- |
| motorzero-dark.svg | branco + verde #34D399 | Cabeçalho, rodapé e banner de cookies sobre fundos escuros |
| motorzero-light.svg | preto #18181B + verde #059669 | Páginas legais, login e identificação do painel interno sobre fundos claros; logo da organização nos dados estruturados |
| motorzero-white.svg | branco | Aplicações monocromáticas futuras sobre fundos escuros |
| motorzero-black.svg | preto #18181B | Aplicações monocromáticas futuras sobre fundos claros |

O componente `BrandLogo` centraliza os ficheiros, proporções e texto alternativo. O cabeçalho usa 170 px em mobile e 220 px a partir de sm; o rodapé usa 280/320 px. O logo tem dimensões intrínsecas para evitar saltos de layout e mantém o link para a página inicial no idioma atual.

Nomes em copyright, metadados e textos corridos continuam como texto. O favicon existente não foi alterado nesta publicação. Os ficheiros em `output/favicon` não fazem parte desta alteração.

Verificação: build de produção, lint dos componentes alterados, inspeção visual dos SVG sobre fundo escuro/claro e verificação das páginas e assets após deploy. Os SVG não contêm scripts, fontes remotas ou recursos externos.
