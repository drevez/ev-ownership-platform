# Publicação do primeiro lote — 23/11/2026

**Correção de apresentação:** os 16 registos de origem deste lote correspondem a 11 versões técnicas públicas. Acabamentos com a mesma bateria/motor/tração são agrupados. Ver [versões técnicas e acabamentos](TECHNICAL_VERSIONS.md). A contagem de 103 abaixo descreve os registos importados; após esta correção são 98 versões públicas, mantendo os 103 registos de origem.

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

## Resultado verificado

- Assets/código: commit `ef29ae6840c648ac9a3e5f41051c0ab4e8f48f7c`; Vercel `dpl_92a9XZFAvdMYeBsAmqGTCj6FPkuL`, READY/production, domínio MotorZero atribuído.
- Supabase: 16 versões novas importadas numa única instrução SQL através do RPC existente em modo `import`. Duas ofertas sem preço receberam depois a data mensal de revisão exigida pela normalização canónica, com controlo de revisão; nenhum preço foi acrescentado.
- Comparação dos 16 registos novos com o payload canónico: passou. Comparação integral dos 87 registos anteriores com o snapshot imediatamente anterior à importação, incluindo revisões: passou, todos intactos.
- APIs públicas: **76 modelos / 103 versões**. As oito páginas de modelo e 16 páginas de versão respondem HTTP 200 e contêm H1.
- Oito fotografias em produção: HTTP 200 e SHA-256 idêntico aos assets revistos.
- 68 testes passaram; build de produção e verificação de whitespace passaram. O primeiro build sem rede falhou apenas ao obter Google Fonts; repetição com rede passou.
- Limitação do verificador histórico `npm run catalog:verify`: encontra divergência no Firefly face ao payload original porque houve edições no painel antes deste lote. Essas edições foram preservadas integralmente; não foram substituídas pelo ficheiro antigo. A verificação deste lote compara os novos registos com os payloads e os anteriores com o snapshot vivo, evitando apagar alterações editoriais.

O lote está publicado. Continuam pendentes Premium Green/BOX PRO como candidatos e os campos explicitamente indicados acima. O restante levantamento de famílias ainda exige preparação de versões; criar uma família no Supabase não equivale a ter uma ficha pública completa.
