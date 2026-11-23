# Publicação do primeiro lote — 23/11/2026

Integração dos carros reais do levantamento no catálogo Supabase MotorZero. Payload: `data/catalog-updates/2026-11-23-expansion-batch-01.json`. Proveniência e decisões: `data/internal/batch-01-publication-audit-2026-11-23.json`. O levantamento original de 22/11 mantém os dados e conflitos históricos.

| Modelo | Versões integradas |
| --- | --- |
| Aion UT | Premium 60 kWh; Luxury 60 kWh |
| Aion V | Premium 75,3 kWh; Luxury 75,3 kWh |
| Geely E2 | PRO 35,35 kWh; MAX e ULTRA 47,14 kWh |
| Geely E5 | PRO e MAX 60,22 kWh |
| Changan Deepal S05 | RWD PRO; RWD MAX; AWD MAX — 68,8 kWh |
| Changan Deepal S07 | RWD 79,97 kWh; RWD 77,94 kWh |
| Dongfeng BOX | PLUS 42,3 kWh |
| Dongfeng VIGO | One Edition 51,87 kWh |

Total: **oito modelos / 16 versões**, todos BEV. Firefly já publicado e preservado. Premium Green permanece uma configuração comercial candidata, sem criar duplicação mecânica ou transferir a sua campanha para Premium enquanto faltar o mapeamento de equipamento. BOX PRO continua candidato. O nome público do S07 não contém MY26; 2026 fica apenas no campo de ano da revisão documentada.

## Tratamento dos dados

- Preços particulares a pronto com IVA; campanhas e tabela ficam como ofertas separadas, com fonte e condições. Fontes secundárias são identificadas e têm confiança média. Não são importados descontos dependentes de financiamento ou preços empresariais como se fossem particulares.
- Aion V Luxury e S07 de 77,94 kWh ficam com preço por confirmar: a primeira só tinha referência de ensaio; o segundo tem conflito entre dois configuradores. As especificações confirmadas podem ser publicadas independentemente do preço.
- VIGO: 30.258 € é cálculo explícito de 24.600 € + IVA continental de 23%, com campanha até 30/11/2026 e despesas excluídas. A elegibilidade deve ser confirmada no orçamento.
- Capacidades anunciadas sem distinção bruto/útil aparecem no nome da configuração e na auditoria. Os campos de bateria bruta/útil ficam vazios, sem inventar a classificação.
- Tempos 20–80/30–80 não preenchem 10–80. Autonomias e consumos reais não são deduzidos do WLTP.
- AC do Aion V fica ausente por divergência 6,6/11 kW; VIGO e E5 ficam sem AC PT comprovado. WLTP E5 MAX: 410 km, preferência documentada na revisão de coerência; preservar divergência com 425 km do configurador.
- Volumes do S05 pelo método de gotas e volume em disputa do S07 ficam ausentes. Medidas da revisão anterior do S07 não são copiadas para a revisão LFP sem correspondência confirmada.
- Oito fotografias oficiais preparadas e revistas no levantamento são promovidas para `public/cars/`; cada caminho é também gravado no Supabase, com fotografia representativa de cor/equipamento.

## Fontes reconfirmadas em 23/11

- [Geely E2 — Caetano](https://caetano.pt/geely/carros-novos/e2/): versões, bateria, potência e preços particulares.
- [Geely E5 — Caetano](https://caetano.pt/geely/carros-novos/e5/): PRO/MAX, 430/410 km e preços.
- [Changan S05 — configurador oficial](https://changan-auto.pt/configurador/deepal-s05/): apenas BEV, três versões e preços.
- [Changan S07 — configurador oficial](https://changan-auto.pt/configurador/deepal-s07/): separar revisões técnicas e preservar conflito de preço.
- [Dongfeng BOX — Caetano](https://caetano.pt/dongfeng/carros-novos/box/) e [VIGO](https://caetano.pt/dongfeng/carros-novos/vigo/): campanhas, IVA, configuração e WLTP combinado.
- [Aion UT — tabela portuguesa](https://www.guiadoautomovel.pt/marcas/aion/ut/precos): Premium 29.003,30 €; Luxury 31.003,30 €, impostos e exclusões. [Campanha Premium Green](https://gac-portugal.pt/campanhas/aion-ut-preco-particulares/) preservada separadamente no levantamento.
- [Aion V — fabricante](https://gac-portugal.pt/aion-v/). A página de financiamento não foi acessível nesta revalidação; a referência da Premium conserva a consulta documentada de 22/11, válida até 30/11, sem alegar nova confirmação do preço.

## Publicação e verificação

Sequência: validar payload → testes/build → publicar fotografias via GitHub/Vercel → importar novos registos com `catalog_save` em modo `import` → verificar catálogo e páginas públicas.

Antes: **87 versões / 68 modelos públicos**. Esperado depois: **103 versões / 76 modelos públicos**. Snapshot privado temporário dos 87 registos anteriores permite confirmar que nenhum foi alterado. O importador recusa sobrescrever registos existentes diferentes.

Estado: preparado para publicação; resultados finais acrescentados após verificação.
