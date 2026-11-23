# Batch 2 — Forthing e BYD — 23/11/2026

Cinco modelos novos, oito versões técnicas BEV. Fecha Forthing do primeiro grupo de marcas generalistas e começa a completar BYD. Payload `data/catalog-updates/2026-11-23-expansion-batch-02.json`; fontes, fotografias e decisões em `data/internal/model-expansion-batch-02-2026-11-23.json`.

| Modelo | Versão técnica | WLTP combinado | Potência | Preço particular com IVA |
| --- | --- | ---: | ---: | ---: |
| Forthing Friday EV | 64,4 kWh FWD | 400 km | 150 kW | 35.788 €, campanha oficial até 30/11 |
| Forthing Friday EV | 85,9 kWh FWD | 510 km | 150 kW | 45.907,30 €, tabela Guia |
| Forthing S7 EV | 56,8 kWh RWD | 420 km | 154 kW | 36.708 €, campanha oficial até 30/11 |
| BYD ATTO 2 | 64,8 kWh FWD | 430 km | 150 kW | 37.997,30 €, tabela Guia |
| BYD SEAL U | 71,8 kWh FWD | 420 km | 160 kW | Por confirmar |
| BYD SEAL U | 87 kWh FWD | 500 km | 160 kW | 48.997,30 €, tabela Guia |
| BYD SEALION 7 | 82,5 kWh RWD | 482 km | 230 kW | 47.997,30 €, tabela Guia |
| BYD SEALION 7 | 91,3 kWh AWD | 502 km | 390 kW | 57.999,50 €, tabela Guia |

Os preços de tabela não são campanhas nem orçamentos chave na mão. As fontes e exclusões de despesas estão em cada oferta. Os preços Forthing para empresas/ENI não foram convertidos em preços particulares: a marca publica ambos explicitamente, com valores distintos.

## Seleção e coerência

- Não há versões adicionais apenas por acabamento. Labels públicos identificam bateria e, quando relevante, tração. Friday 64,4/85,9 e SEAL U 71,8/87 diferem na bateria; SEALION 7 difere também em motor/tração/carregamento.
- ATTO 2: a página e a tabela portuguesa atuais apresentam Comfort 64,8 kWh. Active/Boost da brochura anterior ficam históricos, sem importação automática. Ignorar JSON-LD da página que ainda mistura Active/Dolphin e potência de 130 kW; o conteúdo visível e o comunicado da Comfort confirmam 150 kW/430 km.
- SEALION 7: apenas Comfort/Excellence na oferta PT atual; Design AWD da brochura antiga não é acrescentada sem correspondência comercial atual.
- Friday HEV, gasolina/GPL, U-Tour e todas as variantes BYD DM-i ficam excluídas. As páginas de preço Friday e os comparativos BYD contêm motorizações que não são BEV; apenas as configurações identificadas acima foram extraídas.
- Capacidades anunciadas não são classificadas automaticamente como úteis ou brutas. Tensão nominal Friday 312/352 V não preenche arquitetura 400 V.
- Picos DC do Friday ficam ausentes: 64,4 kWh sem potência explícita na ficha; 85,9 kWh cita um carregador de 80 kW no procedimento 30–80, sem estabelecer o pico do veículo. AC 11 kW apenas para a ficha 85,9 kWh; não copiar para a menor.
- S7: AC 6,6 kW e DC 120 kW; 25 min é 30–80, não 10–80. Mala 398 L e frunk 50 L separados; 1303 L com bancos rebatidos já inclui o compartimento de 114 L.
- ATTO 2 Comfort: 25 min 10–80 no comunicado oficial; 19 min 30–80 na página de produto. SEALION 7: 32/24 min 10–80, DC 150/230 e AC 11 kW. SEAL U: 27/28 min 30–80 não preenchem 10–80; AC pendente nesta publicação.
- Consumos WLTP não passam a consumo real; autonomias urbanas de 581/700/604/674 km não passam a WLTP combinado.
- Campanhas BYD encontradas com fim em 31/10 não são publicadas como atuais. Usam-se as tabelas particulares do Guia, rotuladas com confiança média, sem alegar que sejam o menor preço negociável.

## Fontes

- [Friday EV — produto, duas baterias e preço particular](https://www.forthing.pt/friday-ev/); fichas [64,4 kWh](https://www.forthing.pt/wp-content/uploads/2026/10/Ficha-Tecnica-Friday-EV_64.4-kWh.pdf) e [85,9 kWh](https://www.forthing.pt/wp-content/uploads/2026/10/Ficha-Tecnica-Friday-EV.pdf), ambas revistas visualmente em duas páginas; [tabela de preços](https://www.guiadoautomovel.pt/marcas/forthing/friday/precos), apenas linhas EV.
- [S7 EV — produto e preço](https://www.forthing.pt/s7-ev/), [ficha técnica](https://www.forthing.pt/wp-content/uploads/2026/10/Ficha-Tecnica-S7-EV.pdf), revista visualmente.
- [ATTO 2 — produto atual](https://www.byd-auto.pt/modelos/byd-atto-2), [comunicado Comfort](https://www.byd-auto.pt/destaques/byd-novos-byd-atto-2-dmi-e-atto-2-comfort) e [tabela atual](https://www.guiadoautomovel.pt/marcas/byd/atto-2/precos).
- [SEAL U — apenas 100% elétrico](https://www.byd-auto.pt/modelos/byd-seal-u) e [tabela Design BEV](https://www.guiadoautomovel.pt/marcas/byd/seal-u/precos).
- [SEALION 7 — gama PT atual](https://www.byd-auto.pt/modelos/byd-sealion-7), [ficha Comfort/Excellence](https://api.byd-auto.pt/files/byd-sealion-7.pdf), cujos dados foram consultados no texto indexado oficial, e [tabela de preços](https://www.guiadoautomovel.pt/marcas/byd/sealion-7/precos).

Fotografias oficiais de produto: cinco WebP 1280×720, identidade revista visualmente, representativas de cor/equipamento. As fontes e hashes constam do dossiê estruturado. Publicar assets antes da importação.

## Publicação

Estado inicial: 76 modelos / 98 versões técnicas públicas, 103 registos de origem. Esperado após importação: **81 modelos / 106 versões públicas, 111 registos de origem**. No levantamento dos novos: **14 de 130 modelos colocados, 20 versões técnicas; 116 modelos pendentes**.

Validação: importador validou oito adições; snapshot dos 103 registos anteriores guardado para comparação; publicação e resultados finais registados após verificação.

### Resultado verificado

- Fotografias e payload publicados no commit `933c1895c0792c007be035092cb945485bfb838b`; Vercel `dpl_Hjpj9SBmHgLLExb8YNqWf4u2WS7T`, READY em produção, domínios MotorZero atribuídos.
- `apply-catalog-update` aplicou oito adições em modo import. Os oito documentos remotos correspondem ao payload canónico validado.
- Os 103 registos anteriores, incluindo revisões e edições do painel, correspondem integralmente ao snapshot anterior à importação.
- APIs públicas confirmam **81 modelos / 106 versões técnicas**. Supabase contém **111 registos de origem**, incluindo acabamentos agrupados do batch anterior.
- Cinco páginas de modelo e oito fichas respondem HTTP 200. As cinco imagens em produção correspondem byte a byte aos assets revistos.
- 71 testes passaram; build de produção e verificação de whitespace passaram. Não houve alterações de esquema ou permissões.
- [Fila de batches](MODEL_EXPANSION_BATCHES.md) e [estado do levantamento](MODEL_EXPANSION_STATUS.md) atualizados: 14 novos modelos com dados básicos, 116 pendentes. Batch 3 reúne oito famílias MG/XPeng/NIO para a próxima verificação.
