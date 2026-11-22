# Primeiro lote de versões BEV — 22/11/2026

**Atualização:** consultar a [revisão de coerência](MODEL_EXPANSION_BATCH_01_COHESION.md) para decisões e pendências atuais. O detalhe inicial abaixo conserva a origem das divergências. Firefly fica como única configuração de entrada, com nome público Firefly.

Levantamento dos **9 modelos**, com **18 configurações selecionadas** e **9 fotografias oficiais preparadas**. As 18 entradas são configurações de equipamento, cor comercial ou revisão técnica, e não 19 acabamentos distintos. Não foram criadas variantes nem ofertas no Supabase nesta etapa. Os dados abaixo são material de preparação; as divergências estão assinaladas e não foram preenchidas com estimativas.

## Resultado por modelo

| Modelo | Configurações identificadas | Bateria anunciada | Autonomia combinada WLTP |
| --- | --- | --- | --- |
| Aion UT | Premium Green 60 kWh; Premium 60 kWh; Luxury 60 kWh | 60 kWh | 430 km |
| Aion V | Premium 75.3 kWh; Luxury 75.3 kWh | 75.3 kWh | 510 km |
| Geely E2 | PRO 35.35 kWh; MAX 47.14 kWh; ULTRA 47.14 kWh | 35.35 kWh / 47.14 kWh | 252 km / 345 km |
| Geely E5 | PRO 60.22 kWh; MAX 60.22 kWh | 60.22 kWh | 430 km / por resolver |
| Changan Deepal S05 | BEV RWD PRO 68.8 kWh; BEV RWD MAX 68.8 kWh; BEV AWD MAX 68.8 kWh | 68.8 kWh | 485 km / 445 km |
| Changan Deepal S07 | BEV RWD 79.97 kWh; BEV RWD 77.94 kWh | 79.97 kWh / 77.94 kWh | 475 km / 500 km |
| Dongfeng BOX | PLUS 42.3 kWh | 42.3 kWh | 310 km |
| Dongfeng VIGO | One Edition 51.87 kWh | 51.87 kWh | 340 km |
| Firefly | Firefly | 41.2 kWh | 330 km |

## Decisões antes de importar

- Podem avançar primeiro os S05 BEV PRO/MAX RWD e MAX AWD: preços portugueses com IVA e fichas técnicas correspondentes encontrados. Teto nas MAX é opcional.
- MY26 significa **Model Year 2026**, não um acabamento. S07 original e MY26 são revisões técnicas diferentes; o acabamento não ficou identificado e não é inventado. O preço MY26 está em conflito entre dois configuradores oficiais.
- E2 tem três versões comprovadas, com duas baterias; E5 tem PRO/MAX. Há incoerências no configurador, pelo que os preços documentados do concessionário e as condições ficam separados.
- Aion tem campanhas de novembro para particulares e empresas. O menor preço financiado ou empresarial não deve aparecer como preço a pronto para particulares.
- Dongfeng tem campanhas de concessionários atuais e uma campanha Black Friday que só começa em 26/11. A página oficial do VIGO ainda contém campanha expirada de setembro.
- Firefly exige confirmar a potência/atualização da versão portuguesa: o site atual diz 120 kW e fontes de lançamento/ensaios dizem 105 kW. AC e autonomia da Comfort também não ficaram fechados.
- Nenhuma bateria anunciada passa a bruta/útil por inferência. Valores de carga sem intervalo 10–80 ficam fora desse campo.

## Aion UT

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"batteryChemistry": "LFP", "acMaxKW": 11, "dcMaxKW": 87, "chargeInterval": {"fromPct": 30, "toPct": 80, "minutes": 24}, "lengthMM": 4270, "widthMM": 1850, "heightMM": 1575, "cargoSeatsUpL": 440, "powerKW": 150, "torqueNm": 210, "zeroTo100Seconds": 7.3}`.

Fontes comuns: [ut](https://gac-portugal.pt/aion-ut/), [ut-range](https://gac-portugal.pt/universo-gac/carro-eletrico-citadino/).

### Premium Green 60 kWh

- Tração: FWD. Bateria anunciada: 60 kWh (base: unspecified). WLTP combinado: 430 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"commercialColorConfiguration": true}`.
- Preço de referência: **26,560.00 €**, com IVA; público `private`; tipo `cash_campaign`; estado `current_reference`; validade início não indicado → 2026-11-30. IVA e pintura metalizada incluídos; sem legalização/transporte; stock. Oferta particular explícita. [Fonte](https://gac-portugal.pt/campanhas/aion-ut-preco-particulares/).
- Preço de referência: **26,060.00 €**, com IVA; público `private`; tipo `cash_campaign`; estado `current_reference`; validade início não indicado → 2026-11-30. PVP sem financiamento expresso na campanha financeira; diverge da campanha a pronto de 26.560 €. Manter fontes separadas. [Fonte](https://gac-portugal.pt/campanhas/aion-ut-financiamento/).
- Preço de referência: **25,060.00 €**, com IVA; público `private`; tipo `finance_conditional`; estado `current_reference`; validade início não indicado → 2026-11-30. Só com financiamento; não usar como preço a pronto. [Fonte](https://gac-portugal.pt/campanhas/aion-ut-financiamento/).

### Premium 60 kWh

- Tração: FWD. Bateria anunciada: 60 kWh (base: unspecified). WLTP combinado: 430 km. Modelo/ano: não inferido da data da pesquisa.
- Preço de referência: **21,803.00 €**, sem IVA; público `business_eni`; tipo `cash_campaign`; estado `current_reference`; validade início não indicado → 2026-11-30. Inclui pintura; sem legalização/transporte; não é preço para particulares. [Fonte](https://gac-portugal.pt/campanhas/aion-ut-preco-empresas/).
- Pendente: Falta preço particular atual específico da Premium.

### Luxury 60 kWh

- Tração: FWD. Bateria anunciada: 60 kWh (base: unspecified). WLTP combinado: 430 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"panoramicRoof": true, "electricTailgate": true, "wirelessPhoneChargeW": 50, "ventilatedDriverSeat": true}`.
- Preço de referência: **31,003.30 €**, com IVA; público `private`; tipo `list_price`; estado `secondary_reference_only`; validade início não indicado → fim não indicado. Tabela de 16/11/2026; preço oficial a pronto ainda por confirmar. [Fonte](https://www.guiadoautomovel.pt/marcas/aion/ut/precos).
- Pendente: Falta tabela/campanha oficial atual para particulares.

- Atenção: Não converter 24 min de 30–80% em 10–80%.
- Atenção: A página de produto tem 149 kW/203 cv no destaque e 150 kW na tabela; usar tabela e verificar homologação se adicionarmos potência.
- Atenção: Premium Green parece configuração comercial/cor da Premium; manter identificada no levantamento e evitar duplicação mecânica desnecessária.

Foto oficial: [origem](https://gac-portugal.pt/wp-content/uploads/2026/04/GAC-MI-AION-UT-NEUTRAL-2-scaled.webp); preparada internamente em `data/internal/prepared-model-media/aion-ut.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão.

## Aion V

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"batteryChemistry": "LFP", "dcMaxKW": 180, "chargeInterval": {"fromPct": 10, "toPct": 80, "minutes": 24}, "lengthMM": 4605, "widthMM": 1876, "heightMM": 1686, "wheelbaseMM": 2775, "seats": 5, "cargoSeatsUpL": 427, "cargoSeatsDownL": 978, "powerKW": 150}`.

Fontes comuns: [v](https://gac-portugal.pt/aion-v/), [v-range](https://gac-portugal.pt/universo-gac/carro-eletrico-familiar/), [aion-charge](https://gac-portugal.pt/universo-gac/carregar-carro-eletrico/).

### Premium 75.3 kWh

- Tração: FWD. Bateria anunciada: 75.3 kWh (base: unspecified). WLTP combinado: 510 km. Modelo/ano: não inferido da data da pesquisa.
- Preço de referência: **34,844.00 €**, com IVA; público `private`; tipo `cash_campaign`; estado `current_reference`; validade início não indicado → 2026-11-30. PVP sem financiamento publicado; IVA implícito no PVP particular, confirmar no orçamento; sem pintura/transportes/documentação. [Fonte](https://gac-portugal.pt/campanhas/aion-v-financiamento/).
- Preço de referência: **33,344.00 €**, com IVA; público `private`; tipo `finance_conditional`; estado `current_reference`; validade início não indicado → 2026-11-30. Desconto associado a financiamento; não confundir com PVP a pronto. [Fonte](https://gac-portugal.pt/campanhas/aion-v-financiamento/).
- Preço de referência: **27,663.00 €**, sem IVA; público `business`; tipo `cash_campaign`; estado `current_reference`; validade início não indicado → 2026-11-30. Pintura metalizada mono-tom incluída; sem legalização/transporte. [Fonte](https://gac-portugal.pt/campanhas/aion-v-preco-empresas/).

### Luxury 75.3 kWh

- Tração: FWD. Bateria anunciada: 75.3 kWh (base: unspecified). WLTP combinado: 510 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"frontSeatMassage": true, "fridge": true, "rearFoldingTable": true}`.
- Preço de referência: **42,490.00 €**, com IVA; público `private`; tipo `list_price`; estado `secondary_reference_only`; validade início não indicado → fim não indicado.  [Fonte](https://evmag.pt/ensaio-aion-v-conforto-a-serio-software-pior/).
- Pendente: Falta preço oficial atual da Luxury; o valor de ensaio não substitui campanha/tabela.

- Atenção: AC em conflito: ficha de produto 6,6 kW; artigo técnico oficial recente 11 kW. Não fixar sem ficha portuguesa da unidade.
- Atenção: Não usar 709 km urbanos como autonomia combinada.
- Atenção: Bateria anunciada 75,3 kWh; não classificar automaticamente como útil ou bruta.

Foto oficial: [origem](https://gac-portugal.pt/wp-content/uploads/2026/04/133ebcc9edde627efe657413856456f3c86fc9f3.webp); preparada internamente em `data/internal/prepared-model-media/aion-v.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão.

## Geely E2

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"batteryChemistry": "LFP", "acMaxKW": 6.6, "seats": 5, "cargoSeatsUpL": 375, "cargoSeatsDownL": 1320, "frunkL": 70, "lengthMM": 4135, "widthMM": 1805, "heightMM": 1580, "wheelbaseMM": 2645, "vehicleToLoad": true}`.

Fontes comuns: [e2](https://www.geely-auto.pt/modelos/geely-e2), [e2-dealer](https://caetano.pt/geely/carros-novos/e2/), [e2-campaign](https://campanhas.geely-auto.pt/geely-e2/), [geely-config-data](https://www.geely-auto.pt/assets/ModelPage-6ko6VLZ6.js), [e2-check](https://www.razaoautomovel.com/noticias/apresentacao-geely-e2-sahe-2026/).

### PRO 35.35 kWh

- Tração: RWD. Bateria anunciada: 35.35 kWh (base: unspecified). WLTP combinado: 252 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"powerKW": 60, "dcMaxKW": 60, "chargeInterval": {"fromPct": 20, "toPct": 80, "minutes": 25}}`.
- Preço de referência: **21,894.00 €**, com IVA; público `private`; tipo `cash_campaign`; estado `current_reference`; validade início não indicado → 2026-11-30. IVA incluído; sem legalização/transporte/pintura. PRO equivale a 17.800 € + IVA; MAX/ULTRA são PVP indicativos declarados pelo concessionário. [Fonte](https://caetano.pt/geely/carros-novos/e2/).

### MAX 47.14 kWh

- Tração: RWD. Bateria anunciada: 47.14 kWh (base: unspecified). WLTP combinado: 345 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"powerKW": 85, "dcMaxKW": 80, "chargeInterval": {"fromPct": 20, "toPct": 80, "minutes": 25}}`.
- Preço de referência: **24,900.00 €**, com IVA; público `private`; tipo `indicative_pvp`; estado `current_reference`; validade início não indicado → fim não indicado. IVA incluído; sem legalização/transporte/pintura. PRO equivale a 17.800 € + IVA; MAX/ULTRA são PVP indicativos declarados pelo concessionário. [Fonte](https://caetano.pt/geely/carros-novos/e2/).

### ULTRA 47.14 kWh

- Tração: RWD. Bateria anunciada: 47.14 kWh (base: unspecified). WLTP combinado: 345 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"powerKW": 85, "dcMaxKW": 80, "chargeInterval": {"fromPct": 20, "toPct": 80, "minutes": 25}, "electricTailgate": true, "wirelessPhoneCharge": true, "camera540": true, "speakers": 6}`.
- Preço de referência: **27,800.00 €**, com IVA; público `private`; tipo `indicative_pvp`; estado `current_reference`; validade início não indicado → fim não indicado. IVA incluído; sem legalização/transporte/pintura. PRO equivale a 17.800 € + IVA; MAX/ULTRA são PVP indicativos declarados pelo concessionário. [Fonte](https://caetano.pt/geely/carros-novos/e2/).

- Atenção: Carga de 25 min: configurador e concessionário dizem 20–80%; landing diz 30–80%. Deixar 10–80 vazio.
- Atenção: Configuração de 35/47 kWh europeia; não substituir pelos dados EX2 de outros mercados.
- Atenção: Dimensões do concessionário atual diferem de notícias de lançamento (4125 mm). Priorizar ficha atual, confirmar homologação.
- Atenção: Há divergência de IVA/preços no configurador; preço com IVA usado abaixo vem do concessionário e tem condições expressas.

Foto oficial: [origem](https://www.geely-auto.pt/assets/desktop/e2/Exterior_1_E2.webp); preparada internamente em `data/internal/prepared-model-media/geely-e2.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão. Original vertical: procurar enquadramento horizontal antes da publicação.

## Geely E5

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"advertisedBatteryKWh": 60.22, "batteryChemistry": "LFP", "powerKW": 160, "dcMaxKW": 120, "chargeInterval": {"fromPct": 30, "toPct": 80, "minutes": 20}}`.

Fontes comuns: [e5](https://www.geely-auto.pt/modelos/geely-e5), [e5-dealer](https://caetano.pt/geely/carros-novos/e5/), [geely-config-data](https://www.geely-auto.pt/assets/ModelPage-6ko6VLZ6.js), [e5-check](https://www.razaoautomovel.com/noticias/lancamento-marca-geely-portugal-2026/).

### PRO 60.22 kWh

- Tração: FWD. Bateria anunciada: 60.22 kWh (base: unspecified). WLTP combinado: 430 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"wheelInches": 18}`.
- Preço de referência: **35,658.00 €**, com IVA; público `private`; tipo `cash_campaign`; estado `current_reference`; validade início não indicado → 2026-11-30. IVA incluído; 28.990 € + IVA; sem legalização/transporte/pintura; stock. 5 anos/80.000 km de manutenção. [Fonte](https://caetano.pt/geely/carros-novos/e5/).

### MAX 60.22 kWh

- Tração: FWD. Bateria anunciada: 60.22 kWh (base: unspecified). WLTP combinado: por resolver. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"wheelInches": 19, "panoramicRoof": true, "electricTailgate": true, "frontSeatMassage": true, "speakers": 16}`.
- Preço de referência: **38,118.00 €**, com IVA; público `private`; tipo `indicative_pvp`; estado `current_reference`; validade início não indicado → fim não indicado. IVA incluído; 30.990 € + IVA; sem legalização/transporte/pintura; confirmar validade específica da MAX. [Fonte](https://caetano.pt/geely/carros-novos/e5/).
- Pendente: WLTP em disputa: 410 km no concessionário vs 425 km no configurador; preservar como claims, não valor final.

- Atenção: E5 é a designação portuguesa; EX5 é alias internacional, não criar família duplicada.
- Atenção: Configuração MAX: concessionário/lançamento indicam 410 km; configurador público mostra 425 km. Não fechar WLTP MAX até resolver.
- Atenção: Preços do configurador 35.700/38.200 e metadados 35.628 divergem do concessionário 35.658/38.118; manter preço e fonte juntos.
- Atenção: Não usar dados do STARRAY EM-i (PHEV) nem das versões 68,39 kWh de outros países.
- Atenção: Faltam AC, dimensões/bagageira e bomba de calor comprovados para versão PT.

Foto oficial: [origem](https://www.geely-auto.pt/assets/desktop/e5/1766025472-exterior-bold-first-impressions.webp); preparada internamente em `data/internal/prepared-model-media/geely-e5.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão.

## Changan Deepal S05

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"batteryChemistry": "LFP", "acMaxKW": 11, "dcMaxKW": 200, "chargeInterval": {"fromPct": 10, "toPct": 80, "minutes": 23}, "lengthMM": 4580, "widthMM": 1900, "heightMM": 1600, "wheelbaseMM": 2880, "seats": 5, "cargoSeatsUpL": 492, "frunkL": 159, "heatPump": true, "vehicleToLoad": true}`.

Fontes comuns: [s05](https://changan-auto.pt/configurador/deepal-s05/), [s05-spec](https://changan-auto.pt/ficha-tecnica-s05/), [s05-awd](https://changan-auto.pt/modelos/deepal-s05-awd/).

### BEV RWD PRO 68.8 kWh

- Tração: RWD. Bateria anunciada: 68.8 kWh (base: unspecified). WLTP combinado: 485 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"powerKW": 200, "commercialColorConfiguration": true, "wheelInches": 18}`.
- Preço de referência: **36,990.00 €**, com IVA; público `private`; tipo `configurator_pvp`; estado `current_reference`; validade início não indicado → fim não indicado. IVA incluído; sem transporte/legalização; base de versão, não total com opções; sujeito a revisão pelo concessionário. [Fonte](https://changan-auto.pt/configurador/deepal-s05/).

### BEV RWD MAX 68.8 kWh

- Tração: RWD. Bateria anunciada: 68.8 kWh (base: unspecified). WLTP combinado: 485 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"powerKW": 200, "panoramicRoof": "optional", "wheelInches": 20}`.
- Preço de referência: **39,990.00 €**, com IVA; público `private`; tipo `configurator_pvp`; estado `current_reference`; validade início não indicado → fim não indicado. IVA incluído; sem transporte/legalização; base de versão, não total com opções; sujeito a revisão pelo concessionário. [Fonte](https://changan-auto.pt/configurador/deepal-s05/).

### BEV AWD MAX 68.8 kWh

- Tração: AWD. Bateria anunciada: 68.8 kWh (base: unspecified). WLTP combinado: 445 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"powerKW": 320, "panoramicRoof": "optional", "wheelInches": 20}`.
- Preço de referência: **42,990.00 €**, com IVA; público `private`; tipo `configurator_pvp`; estado `current_reference`; validade início não indicado → fim não indicado. IVA incluído; sem transporte/legalização; base de versão, não total com opções; sujeito a revisão pelo concessionário. [Fonte](https://changan-auto.pt/configurador/deepal-s05/).

- Atenção: Excluir S05 Ultra-Hybrid/PHEV: os preços inferiores de 31.990 € não são deste BEV.
- Atenção: Bagageiras medidas por método de gotas; não equiparar silenciosamente a VDA.
- Atenção: DC 200 kW é pico; página AWD também refere 167 kW no contexto do carregamento.
- Atenção: Teto panorâmico é opcional nas MAX, ausente na PRO; não tratar como série.

Foto oficial: [origem](https://changan-auto.pt/wp-content/uploads/2025/11/design-1-1.webp); preparada internamente em `data/internal/prepared-model-media/changan-deepal-s05.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão.

## Changan Deepal S07

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"lengthMM": 4750, "widthMM": 1930, "heightMM": 1625, "wheelbaseMM": 2900, "seats": 5, "vehicleToLoad": true, "panoramicRoof": true}`.

Fontes comuns: [s07](https://changan-auto.pt/configurador/deepal-s07/), [s07-spec](https://changan-auto.pt/ficha-tecnica-s07/).

### BEV RWD 79.97 kWh (ano/acabamento não identificados)

- Tração: RWD. Bateria anunciada: 79.97 kWh (base: unspecified). WLTP combinado: 475 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"batteryChemistry": "NMC", "powerKW": 160, "chargeInterval": {"fromPct": 10, "toPct": 80, "minutes": 48}}`.
- Preço de referência: **44,990.00 €**, com IVA; público `private`; tipo `configurator_pvp`; estado `current_reference`; validade início não indicado → fim não indicado. IVA incluído; sem transporte/legalização; jante 19 de base. [Fonte](https://changan-auto.pt/configurador/deepal-s07/).
- Pendente: Confirmar AC/DC máximos; não copiar os 200 kW do MY26.

### BEV RWD 77.94 kWh

- Tração: RWD. Bateria anunciada: 77.94 kWh (base: unspecified). WLTP combinado: 500 km. Modelo/ano: 2026.
- Dados específicos: `{"batteryChemistry": "LFP", "powerKW": 190, "acMaxKW": 11, "dcMaxKW": 200, "chargeInterval": {"fromPct": 10, "toPct": 80, "minutes": 24}, "heatPump": true, "vehicleToLoadKW": 6, "wheelInches": 20}`.
- Preço de referência: **45,728.00 €**, com IVA; público `private`; tipo `configurator_pvp`; estado `conflicting_reference`; validade início não indicado → fim não indicado. Configurador principal; divergência com outro configurador oficial de 44.990 €. [Fonte](https://changan-auto.pt/configurador/deepal-s07/).
- Preço de referência: **44,990.00 €**, com IVA; público `private`; tipo `configurator_pvp`; estado `conflicting_reference`; validade início não indicado → fim não indicado.  [Fonte](https://changan-auto.pt/configurador-my26/).
- Pendente: Resolver preço MY26 entre configuradores; não publicar menor valor como confirmado.

- Atenção: Separar versão original NMC da MY26 LFP; não combinar bateria/preço/carregamento.
- Atenção: Dimensões da ficha original; confirmar no MY26 antes de replicar.
- Atenção: Faltam volumes de bagageira e frunk PT da configuração exata.

Foto oficial: [origem](https://changan-auto.pt/wp-content/uploads/2025/10/s07-4.webp); preparada internamente em `data/internal/prepared-model-media/changan-deepal-s07.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão.

## Dongfeng BOX

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"batteryChemistry": "LFP", "cargoSeatsUpL": 326, "chargeInterval": {"fromPct": 30, "toPct": 80, "minutes": 30}}`.

Fontes comuns: [box](https://www.dongfeng-auto.pt/modelos/dongfeng-box), [df-black](https://www.amfmobilidade.pt/campanhas/black-friday-dongfeng-ate-5-500e-de-desconto-no-box-mage-e-vigo/).

### PLUS 42.3 kWh

- Tração: por confirmar em fonte primária PT (hipótese FWD). Bateria anunciada: 42.3 kWh (base: unspecified). WLTP combinado: 310 km. Modelo/ano: não inferido da data da pesquisa.
- Preço de referência: **23,500.00 €**, IVA por confirmar; público `private`; tipo `cash_campaign`; estado `needs_terms_confirmation`; validade 2026-11-10 → 2026-11-30. Conteúdo atual da página; nome da URL conserva preço antigo. Confirmar IVA, despesas e acabamento antes de usar como oferta da PLUS. [Fonte](https://www.filintomota.pt/campanhas/novo-dongfeng-box-a-partir-de-24680-euros/).
- Preço de referência: **24,725.00 €**, com IVA; público `private`; tipo `cash_campaign`; estado `upcoming`; validade 2026-11-26 → 2026-11-29. PLUS 42 kWh; legalização/transporte/pintura incluídos. Página não explicita IVA separadamente; confirmar no orçamento. [Fonte](https://www.amfmobilidade.pt/campanhas/black-friday-dongfeng-ate-5-500e-de-desconto-no-box-mage-e-vigo/).
- Pendente: Confirmar tração PT e ficha técnica completa; fonte de produto nacional não a explicita.

- Atenção: Apenas 42,3 kWh/PLUS confirmada neste levantamento PT; não importar 31,4 kWh de outros mercados.
- Atenção: AC 6,6 kW/DC 87,8 kW são referências de ficha europeia; confirmar versão PT antes de preencher.
- Atenção: Campanha Filinto Mota atual não explicita acabamento, IVA e despesas no corpo; confirmar associação à PLUS.
- Atenção: AMF 24.725 € só começa em 26/11, logo ainda não está ativa em 22/11.

Foto oficial: [origem](https://stwfccmsprodwesteurope01.blob.core.windows.net/dongfengpt-682326be8578fb1e857c7d06-prod/imgpip1920x1080-1.webp); preparada internamente em `data/internal/prepared-model-media/dongfeng-box.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão.

## Dongfeng VIGO

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"batteryChemistry": "LFP", "dcMaxKW": 167, "chargeInterval": {"fromPct": 30, "toPct": 80, "minutes": 18}, "cargoSeatsUpL": 500, "cargoSeatsDownL": 1040, "hiddenCargoL": 72, "wheelbaseMM": 2715, "heatPump": true, "vehicleToLoadKW": 3.3, "powerKW": 120, "torqueNm": 230}`.

Fontes comuns: [vigo](https://www.dongfeng-auto.pt/modelos/dongfeng-vigo), [vigo-check](https://4gnews.pt/dongfeng-vigo-ensaio/).

### One Edition 51.87 kWh

- Tração: FWD. Bateria anunciada: 51.87 kWh (base: unspecified). WLTP combinado: 340 km. Modelo/ano: não inferido da data da pesquisa.
- Preço de referência: **25,585.00 €**, sem IVA; público `unspecified`; tipo `cash_campaign`; estado `current_reference`; validade 2026-11-10 → 2026-11-30. Concessionário anuncia +IVA e menciona dedutibilidade para empresas; com taxa continental de 23% equivale a 31.469,55 €. Confirmar elegibilidade particular, versão e despesas. [Fonte](https://www.filintomota.pt/campanhas/novo-dongfeng-vigo-a-partir-de-25585-euros/).
- Preço de referência: **26,990.00 €**, sem IVA; público `unspecified`; tipo `cash_campaign`; estado `expired`; validade início não indicado → 2026-09-30. Incluía legalização/transporte Portugal Continental; excluía pintura. Não usar como preço atual. [Fonte](https://www.dongfeng-auto.pt/modelos/dongfeng-vigo).
- Pendente: Tração FWD corroborada por ensaio PT; ficha primária nacional ainda por obter.

- Atenção: Preço oficial de 26.990 € + IVA tem condição até 30/09/2026: expirado, não é campanha atual.
- Atenção: AC/dimensões exteriores/tração: confrontar ficha portuguesa; fontes de outros mercados têm motor e até tração diferentes.
- Atenção: 500 L e 72 L ocultos são apresentados separadamente; não somar automaticamente.

Foto oficial: [origem](https://stwfccmsprodwesteurope01.blob.core.windows.net/dongfengpt-682326be8578fb1e857c7d06-prod/img-slide1-a-1-desktop-1.webp); preparada internamente em `data/internal/prepared-model-media/dongfeng-vigo.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão.

## Firefly

Estado: pesquisa concluída com pendências explícitas; **sem publicação automática**.

Factos comuns recolhidos: `{"dcMaxKW": 100, "chargeInterval": {"fromPct": 10, "toPct": 80, "minutes": 29}, "cargoSeatsUpL": 404, "cargoSeatsDownL": 1253, "frunkL": 92, "vehicleToLoad": true}`.

Fontes comuns: [firefly](https://fireflyportugal.pt/o-nosso-carro/), [firefly-check](https://www.razaoautomovel.com/noticias/lancamento-precos-firefly-2025/), [firefly-test](https://4gnews.pt/nio-firefly-ensaio/).

### Firefly

- Tração: RWD. Bateria anunciada: 41.2 kWh (base: net_in_european_manufacturer_document_pending_current_pt_match). WLTP combinado: 330 km. Modelo/ano: não inferido da data da pesquisa.
- Dados específicos: `{"heatedFrontSeats": true, "heatedSteeringWheel": true}`.
- Preço de referência: **30,900.00 €**, com IVA; público `private`; tipo `model_starting_price`; estado `model_price_needs_trim_confirmation`; validade início não indicado → fim não indicado. Preço de entrada no site PT atual; associação Select corroborada pela apresentação nacional, não por tabela atual por acabamento. [Fonte](https://fireflyportugal.pt/o-nosso-carro/).
- Pendente: 41,2 kWh líquida confirmada em ficha europeia; rever correspondência com veículo PT atual.

Foto oficial: [origem](https://fireflyportugal.pt/wp-content/uploads/1753091864687-1753091863279-7BBE23F55268DA69-scaled-1.webp); preparada internamente em `data/internal/prepared-model-media/firefly-firefly.webp` (1280×720). Fotografia oficial representativa; cor, jantes e equipamento não garantem a configuração de cada versão.

## Ficheiros e validação

- [Dados estruturados, fontes e pendências](../data/internal/model-expansion-batch-01-2026-11-22.json).
- Fotografias em `data/internal/prepared-model-media/`, fora dos assets públicos. Identidade dos nove modelos revista numa folha de contacto; não asseguram acabamento/cor da versão.
- Impressões SHA-256 das páginas obtidas diretamente no JSON permitem distinguir a recolha do conteúdo indexado em cache. Não foi guardada cópia integral dos sites no repositório.
- O plano original de 130 famílias mantém os totais históricos; os nove modelos apontam agora para este lote, sem substituir hipóteses por alegações de publicação.
- Próximo passo concreto: montar payloads apenas com campos comprovados; fechar preço/IVA/acabamento onde assinalado; promover as fotos; validar e importar versões. Campanhas com fim em 30/11 precisam de nova revisão se a importação ocorrer depois dessa data.
