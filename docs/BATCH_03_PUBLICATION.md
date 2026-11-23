# Batch 3 — MG, XPeng e NIO

Revisão: 23/11/2026. Publicação inicial com dados básicos: **8 modelos / 17 versões técnicas**. Não equivale a ficha completa.

| Modelo | Versões técnicas | WLTP combinado (km) | Preço de referência com IVA (€) |
| --- | --- | --- | --- |
| MG MG4 EV | RWD 64 / RWD 77 / AWD 64 kWh | 452 / 545 / 405 | 39.569,10 / 43.419,10 / 44.419,10 |
| MG MGS5 EV | 49 / 64 kWh, RWD | 340 / 480 | 33.319,10 / 36.819,10 |
| MG MGS6 EV | RWD / AWD, 77 kWh | 530 / 485 | 45.969,10 / 48.969,10 |
| MG Cyberster | RWD 77 kWh | 507 | 64.719,10 |
| XPeng G9 | RWD 79 / RWD 93,1 / AWD 93,1 kWh | 502 / 585 / 540 | 62.897,30 / 67.097,30 / 77.599,50 |
| XPeng P7+ | RWD 61,7 / RWD 74,9 / AWD 74,9 kWh | 455 / 530 / 500 | 46.997,30 / 50.997,30 / 56.999,50 |
| XPeng L03 EV | RWD Standard Range, 58 kWh anunciados | 445 | 36.211,20, campanha até 25/12/2026 |
| NIO ET5 | AWD 75 / 100 kWh | 456 / 590 | 59.900 / 69.900 |

Preços de tabela do Guia do Automóvel, salvo campanha L03 oficial. Não representam a melhor proposta disponível nem incluem necessariamente transporte/matrícula/opções. No L03, 29.440 € + IVA = 36.211,20 € com IVA de 23% em Portugal Continental; acrescem legalização/transporte/pintura, stock limitado. Não é preço de EREV.

## Versões e lacunas

- Apenas BEV. L03 PowerX EREV/REEV, MG híbridos e PHEV excluídos.
- MG4 EV atual é separado do MG4 Urban já existente. A tabela oficial PT confirma 140 kW no RWD 64 kWh, apesar do erro de potência no Guia do Automóvel. Não reusar os preços promocionais MG expirados em 30/09/2026.
- MGS5 64 kWh usa Comfort como configuração de entrada: 480 km, 1.621 mm de altura, sem bomba de calor. Luxury/Premium é acabamento do mesmo conjunto técnico (465 km, 1.633 mm e bomba de calor); não cria outro cartão nem transfere equipamento para o Comfort.
- MGS6 RWD/AWD têm motores diferentes (180/266 kW): justificam duas versões.
- Cyberster começa pelo Single Motor RWD 250 kW. Dual Motor tem dados técnicos oficiais, mas preço/oferta nova atual por confirmar. A mala de 249/200 L refere-se à capota, não a bancos rebatidos: foi usado apenas o valor conservador de 200 L. O carregador de teste de 150 kW não prova pico DC do carro.
- G9 tem 445 kW DC no Standard e 525 kW no Long Range/Performance. Usar 540 km WLTP no AWD segundo a marca, não os 585 km copiados na tabela de preços. Jantes, reboque, Premium Pack e Black Edition não criam versões técnicas. Capacidades 79/93,1 kWh ficam no nome sem atribuição bruta/útil não comprovada.
- P7+ mantém-se separado do P7 anterior. Carregamento 350/446/446 kW por versão. Só 61,7 kWh é explicitamente identificada como bruta na tabela PT; as capacidades 74,9 kWh não são classificadas por inferência. Autonomia urbana não entra no campo WLTP combinado.
- L03: publicação inicial apenas do Standard Range BEV. A campanha PT confirma a configuração e carga 10–80% em 20 min; a tabela EV portuguesa confirma 445 km e 58 kWh anunciados. As fontes discordam na potência e nas especificações europeias de carregamento: potência de motor, pico DC, AC e capacidade útil/bruta ficam ausentes. LR/AWD ficam como complementos por validar; não publicar acabamentos Ultra como versões separadas.
- ET5 é o sedan, não o Touring já existente. Manual NIO confirma 360 kW combinados. AC 11 kW é corroborado pelo catálogo europeu; os picos DC variam por revisão de bateria (125/140/170/180 kW) sem identificação do pack PT: pico e tempo ficam ausentes. Não transferir a nota CLTC de 150 kWh para o WLTP europeu, nem prometer BaaS/troca de bateria em Portugal.
- Autonomia/consumos reais e equipamento não confirmado ficam ausentes. Ano do modelo não inventado. As outras capacidades anunciadas não são automaticamente brutas/úteis.

## Fontes e rastreabilidade

- MG Portugal: [MG4 EV](https://www.mgmotor.pt/model/mg4), [MGS5 EV](https://www.mgmotor.pt/model/mgs5), [MGS6 EV](https://www.mgmotor.pt/model/mgs6), [Cyberster](https://www.mgmotor.pt/model/cyberster). Tabelas PT completas nos atributos JSON das páginas; os resultados de pesquisa podem redirecionar para mercados estrangeiros. Os PDFs ligados no CDN responderam 403, pelo que não se afirma que tenham sido descarregados; foram usadas as tabelas PT.
- XPeng Portugal: [G9](https://www.xpeng-auto.pt/modelos/g9), [P7+](https://www.xpeng-auto.pt/modelos/p7mais), [L03 BEV](https://www.xpeng-auto.pt/campanhas/particulares/l03-ev). Dados das três versões G9/P7+ no conteúdo oficial Nuxt, não apenas a primeira tab visível. Potências P7+ corroboradas pelo [catálogo europeu do fabricante](https://s-cdn.xpeng.com/commoncms/prod/2025-09-03/d455f53a6d3c46f5970250d44ac65c2d.pdf).
- NIO: [ET5 Portugal](https://nio-portugal.pt/modelo-et5/), [manual ET5](https://cdn-udp-public.eu.nio.com/www-nio/user-instructions/ET5/index.html), [catálogo europeu ET5](https://www.nio.com/cdn-static/luban/nextjs/images/default-large-files/NIO_ET5_NL_Prijslijst_202401). Este último apenas para dados técnicos comuns; preços estrangeiros não usados.
- Preços PT: [MG4](https://www.guiadoautomovel.pt/marcas/mg/mg4/precos), [MGS5](https://www.guiadoautomovel.pt/marcas/mg/s5/precos), [MGS6](https://www.guiadoautomovel.pt/marcas/mg/s6/precos), [Cyberster](https://www.guiadoautomovel.pt/marcas/mg/cyberster/precos), [G9](https://www.guiadoautomovel.pt/marcas/xpeng/g9/precos), [P7+](https://www.guiadoautomovel.pt/marcas/xpeng/p7/precos), [L03](https://www.guiadoautomovel.pt/marcas/xpeng/l03/precos), [ET5](https://www.guiadoautomovel.pt/marcas/nio/et5/precos). L03: só linha EV, nunca REEV; ET5: só sedan, nunca Touring. Preços consultados em 23/11/2026; tabelas atualizadas em novembro.

Dossiê: [registo estruturado](../data/internal/model-expansion-batch-03-2026-11-23.json). Payload validável e idempotente: [17 adições](../data/catalog-updates/2026-11-23-expansion-batch-03.json). Fotografias oficiais representativas em 1280×720, com fontes no dossiê e em `data/model-media.json`.

## Publicação e verificação

Antes: 81 modelos / 106 versões públicas, 111 registos de origem. Esperado: **89 modelos / 123 versões públicas, 128 registos de origem**. Snapshot anterior guardado para provar que as edições anteriores não são alteradas. Importar apenas depois de publicar as fotografias e verificar o deployment.

No levantamento dos 130 novos: esperado **22 modelos colocados / 37 versões técnicas; 108 modelos pendentes**. Ver [fila de batches](MODEL_EXPANSION_BATCHES.md).

### Resultado verificado

- Commit de assets/payload `352cb831c92be1c0f068cf74a3d41162382125a2`; deployment Vercel `dpl_8CQDkrehSd8V5Xv4gBSTEqiAzpgw` READY, com os domínios MotorZero atribuídos.
- 17 adições importadas em modo idempotente. Documentos remotos correspondem ao payload canónico.
- Os 111 registos anteriores, incluindo revisões e edições do painel, permanecem integralmente iguais ao snapshot anterior.
- APIs públicas: **89 modelos / 123 versões técnicas**. Supabase: **128 registos de origem**.
- Oito páginas de modelo e 17 fichas respondem HTTP 200 e apresentam título; oito imagens em produção correspondem byte a byte aos assets revistos.
- 71 testes passaram, build de produção e whitespace passaram. Sem alteração de esquema ou permissões.
- Levantamento atualizado: **22 de 130 modelos colocados, 37 versões técnicas; 108 modelos pendentes**. Batch 4 (Zeekr/Voyah) passa a próximo, sujeito a nova validação BEV e comercial.
