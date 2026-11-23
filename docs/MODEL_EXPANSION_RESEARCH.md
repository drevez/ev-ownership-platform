# Modelos a adicionar ao MotorZero — 22/11/2026

**Estado atualizado em 23/11/2026 — apenas os modelos novos:** [lista de acompanhamento](MODEL_EXPANSION_STATUS.md). Dos 130 candidatos, **9 já estão colocados com dados básicos**, em **12 versões técnicas públicas**; **121** continuam por colocar. Os acabamentos equivalentes estão agrupados. Abaixo conserva-se o levantamento original e a fotografia do catálogo antes das importações.

O catálogo público consultado tem **67 grupos de modelo e 86 versões**. O levantamento identifica **130 candidatos ausentes** (incluindo carroçarias e novas gerações), dos quais **29 em marcas chinesas/SAIC**, além de uma lista de acompanhamento. Não é um censo exaustivo do mercado nem uma lista pronta para importação: confirma presença em gamas/ofertas oficiais, mas falta recolher versões, preços e especificações de cada configuração. Nenhum registo foi adicionado ao Supabase nesta fase.

## Segunda passagem: só 100% elétricos

A lista principal tem agora **130 candidatos BEV**, mais **25** do que na primeira passagem. Cada linha do JSON tem `powertrain: BEV`, fonte de evidência e restrição de elegibilidade. Essa revisão confirma a configuração elétrica elegível; não equivale a confirmar todas as versões, homologação, stock ou preço atual. A recolha detalhada antes da importação continua obrigatória.

**Critério:** bateria recarregável e ausência de motor de combustão ou extensor. HEV, MHEV, PHEV, REEV/EREV e FCEV ficam fora. Nomes como E-Tech, E-Tense, SHS ou “eletrificado” não bastam por si só. Não usar a autonomia total de um híbrido como autonomia de um BEV.

### Novos candidatos desta passagem

| Marca | Modelo/variante elegível | Âmbito | Fonte |
| --- | --- | --- | --- |
| KGM | Torres EVX | Automóvel BEV | [Fonte oficial](https://kgm.pt/) |
| Mitsubishi | Eclipse Cross EV | Automóvel BEV | [Fonte oficial](https://www.mitsubishi-motors.pt/novo-eclipse-cross-ev) |
| Maserati | Grecale Folgore | Automóvel BEV | [Fonte oficial](https://www.maserati.com/pt/pt/shopping-tools/configurator) |
| Maserati | GranTurismo Folgore | Automóvel BEV | [Fonte oficial](https://www.maserati.com/pt/pt/shopping-tools/configurator) |
| Maserati | GranCabrio Folgore | Automóvel BEV | [Fonte oficial](https://www.maserati.com/pt/pt/shopping-tools/configurator) |
| Porsche | Taycan Sport Turismo | Automóvel BEV | [Fonte oficial](https://www.porsche.com/portugal/models/) |
| Porsche | Taycan Cross Turismo | Automóvel BEV | [Fonte oficial](https://www.porsche.com/portugal/models/) |
| Mercedes-Benz | EQV | Passageiros/MPV BEV | [Fonte oficial](https://www.mercedes-benz.pt/passengercars/models/van/eqv/overview.html/) |
| Mercedes-Benz | EQT | Passageiros/MPV BEV | [Fonte oficial](https://www.mercedes-benz.pt/passengercars/models/van/eqt/overview.html) |
| Mercedes-Benz | EQE | Automóvel BEV | [Fonte oficial](https://www.mercedes-benz.pt/passengercars/configurator.html) |
| Mercedes-Benz | EQE SUV | Automóvel BEV | [Fonte oficial](https://www.mercedes-benz.pt/passengercars/configurator.html) |
| Mercedes-Benz | EQS SUV | Automóvel BEV | [Fonte oficial](https://www.mercedes-benz.pt/passengercars/configurator.html) |
| Mercedes-Benz | GLA Electric | Automóvel BEV | [Fonte oficial](https://www.mercedes-benz.pt/passengercars/configurator.html) |
| Ford | E-Tourneo Courier | Passageiros/MPV BEV | [Fonte oficial](https://www.ford.pt/experiencia-ford/ford-blog/carros-familiares-5-7-9-lugares) |
| Ford | E-Tourneo Custom | Passageiros/MPV BEV | [Fonte oficial](https://www.ford.pt/experiencia-ford/ford-blog/carros-familiares-5-7-9-lugares) |
| Citroen | e-Berlingo | Passageiros/MPV BEV | [Fonte oficial](https://www.citroen.pt/transporte-pessoas.html) |
| Citroen | e-SpaceTourer | Passageiros/MPV BEV | [Fonte oficial](https://www.citroen.pt/transporte-pessoas.html) |
| Peugeot | E-Rifter | Passageiros/MPV BEV | [Fonte oficial](https://www.peugeot.pt/apos-venda/peugeot-care.html) |
| Peugeot | E-Traveller | Passageiros/MPV BEV | [Fonte oficial](https://www.peugeot.pt/apos-venda/peugeot-care.html) |
| Opel | Combo Electric | Passageiros/MPV BEV | [Fonte oficial](https://rede.opel.pt/stellantisandyouportugal/veiculos/carros-passageiros-novos) |
| Opel | Zafira Electric | Passageiros/MPV BEV | [Fonte oficial](https://rede.opel.pt/stellantisandyouportugal/veiculos/carros-passageiros-novos) |
| Toyota | Proace City Verso Electric | Passageiros/MPV BEV | [Fonte oficial](https://www.toyota.pt/carros/proace-city-verso/features-and-specs.PF.epr.6b5fcb43-489d-41e8-89d6-f62a2570617d) |
| Toyota | Proace Verso Electric | Passageiros/MPV BEV | [Fonte oficial](https://www.toyota.pt/carros/proace-verso/configurador) |
| Fiat | E-Ulysse | Passageiros/MPV BEV | [Fonte oficial](https://www.fiat.pt/professional/modelo/e-ulysse) |
| Renault | Kangoo E-Tech Electric | Passageiros/MPV BEV | [Fonte oficial](https://www.renault.pt/veiculos-passageiros/kangoo/configurador.html) |

Mitsubishi, KGM e Maserati são marcas adicionais a cobrir; não são marcas chinesas. Os monovolumes entram apenas em configurações de passageiros. Furgões de carga, pick-ups e derivados comerciais não são acrescentados automaticamente.

### Novas verificações e acompanhamento

- **Denza Z9GT EV:** a variante elétrica está identificada no site português; a oferta comercial concreta continua pendente. Z9GT DM e D9 DM-i estão excluídos.
- **Lotus Eletre BEV/Emeya e Subaru Solterra/Uncharted/E-Outback:** BEV europeus confirmados; sem confirmação suficiente da oferta nova portuguesa nesta passagem.
- **Volkswagen ID. Cross e Rolls-Royce Spectre:** acrescentados ao acompanhamento, com verificação comercial portuguesa pendente.
- **Mercedes GLA Electric:** passou do acompanhamento para a lista principal por aparecer no configurador nacional como elétrico; GLA híbrido e térmico continuam fora.
- **Musso EV e Hilux BEV:** guardados num bloco opcional de pick-ups; não misturados com os automóveis de passageiros.

A análise específica dos casos ambíguos está em [BEV_ONLY_CATALOG_AUDIT.md](BEV_ONLY_CATALOG_AUDIT.md). Não foram alterados dados no Supabase nem publicados novos modelos no site.

## Prioridade e método

Cruzei o catálogo público com páginas de marcas, configuradores nacionais e comunicados oficiais, usando agregadores apenas para descobrir possíveis lacunas. Uma homologação europeia ou página em português não prova vendas oficiais em Portugal. “Oferta identificada” pode significar encomenda/pré-venda; não garante entrega imediata. Preços de pesquisa e anúncios podem divergir: na importação deve prevalecer a página atual do configurador e as condições da versão exata.

Há **8 marcas chinesas ausentes com gama/oferta nacional identificada**: Aion, Geely, Changan, Dongfeng, Forthing, Firefly, Voyah, Zeekr. Changan/Deepal conta como uma família comercial nesta análise; GAC/Aion também. Forthing, Voyah e Dongfeng são marcas distintas mesmo partilhando grupo. MG aparece na secção chinesa por pertencer à SAIC, preservando a sua origem britânica. Volvo, Polestar, smart e Lotus não são contadas como novas marcas chinesas apenas pela estrutura acionista.

P1 dá prioridade a preços acessíveis, concorrentes diretos e lacunas de marca. P2 completa gama, carroçarias e segmentos premium. Há modelos antigos ainda essenciais (Spring, 500e, Corsa, Mach-E), não apenas lançamentos de 2026. Geely tem lançamento nacional oficial em setembro; IONIQ 3 em outubro.

## Marcas chinesas e SAIC — candidatos identificados

| Marca | Modelos ausentes | Fonte e observações |
| --- | --- | --- |
| Aion — nova no catálogo | UT, V | [Fonte](https://gac-portugal.pt/) — Marca ausente; gama portuguesa confirmada. Normalizar Aion como marca e GAC como grupo. |
| Geely — nova no catálogo | E2, E5 | [Fonte](https://www.geelyauto.eu/posts/geely-auto-official-launch-in-portugal) — Entrada oficial em Portugal em 24/09/2026; confirmar nome nacional E5 e aliases EX5. |
| Changan — nova no catálogo | Deepal S05, Deepal S07 | [Fonte](https://changan-auto.pt/modelos/) — Marca ausente; escolher variantes BEV e não PHEV. Evitar duplicar Changan e Deepal como o mesmo carro. |
| Dongfeng — nova no catálogo | BOX, VIGO | [Fonte](https://caetano.pt/dongfeng/) — Citadino e SUV ausentes; rede oficial portuguesa. Confirmar campanhas atuais e IVA. |
| Forthing — nova no catálogo | Friday EV, S7 EV | [Fonte](https://www.forthing.pt/) — Oferta portuguesa e campanhas de novembro; não misturar Friday EV com gasolina/HEV. |
| Firefly — nova no catálogo | Firefly | [Fonte](https://fireflyportugal.pt/o-nosso-carro/) — Marca e citadino ausentes. Não reutilizar campanhas financeiras expiradas. |
| Voyah — nova no catálogo | Courage, Free, Dream | [Fonte](https://caetano.pt/voyah/) — Gama elétrica portuguesa ausente; confirmar versão local e preço com bateria e IVA. |
| Zeekr — nova no catálogo | X, 001, 7X, 7GT | [Fonte](https://configurador.zeekr.pt/) — Configurador português com modelos e preços; confirmar versões, despesas e entregas. |
| BYD | ATTO 2, SEAL U, SEALION 7 | [Fonte](https://byd-auto.pt/modelos) — Lacuna na marca já presente. Incluir só BEV; ATTO 2 e SEAL U também têm versões DM-i distintas. |
| MG | MG4 EV, MGS5 EV, MGS6 EV, Cyberster | [Fonte](https://www.mgmotor.eu/pt-PT) — MG4 EV é distinto do MG4 Urban existente; faltam também SUVs atuais e roadster. |
| NIO | ET5 | [Fonte](https://nio-portugal.pt/) — Berlina ausente; ET5 Touring e EL6 já existem. Confirmar preço com bateria, separando eventual subscrição. |
| XPeng | G9, P7+, L03 EV | [Fonte](https://www.xpeng-auto.pt/) — G9 ausente; P7+ não deve substituir o P7 já registado.<br>[Fonte](https://www.xpeng-auto.pt/campanhas/particulares/l03-ev) — Existe oferta portuguesa BEV separada do EREV. Confirmar datas de entrega; campanha de lançamento até 25/12/2026. |

## Restantes marcas — candidatos identificados

| Marca | Modelos/carroçarias em falta | Prioridade e fonte |
| --- | --- | --- |
| Dacia | Spring (P1) | [Fonte](https://www.dacia.pt/gama-hibrida-eletrica/spring-citadino/configurador.html) |
| Renault | Twingo E-Tech (P1), 4 E-Tech (P1) | [Fonte](https://www.renault.pt/veiculos-eletricos.html?gradeCode=ENS_MDL2P1SERIELIM4) |
| Hyundai | INSTER (P1), IONIQ 3 (P1), IONIQ 9 (P2) | [Fonte](https://www.hyundai.pt/campanhas-automoveis/hyundai-inster-preco/) · [Fonte](https://www.hyundai.pt/ioniq-3-chega-a-portugal/) · [Fonte](https://www.hyundai.pt/configurador/) |
| Kia | EV2 (P1), EV4 (P1), EV4 Fastback (P1), EV9 (P2), PV5 Passenger (P2) | [Fonte](https://m.kia.pt/configurador/) |
| Nissan | Micra (P1) | [Fonte](https://configurador.nissan.pt/) |
| Fiat | Grande Panda Electric (P1), 500e (P2), 600e (P2) | [Fonte](https://www.fiat.pt/modelos/grande-panda-electrico) · [Fonte](https://www.fiat.pt/?brand=NewMOC&language=%5Bfiatprofessional%2Cpt%2Cpt%5D) |
| Opel | Corsa Electric (P1), Mokka Electric (P2), Astra Electric (P2), Astra Sports Tourer Electric (P2), Frontera Electric (P2), Grandland Electric (P2) | [Fonte](https://www.opel.pt/) |
| Ford | Puma Gen-E (P1), Mustang Mach-E (P2) | [Fonte](https://www.ford.pt/experiencia-ford/ford-blog/como-escolher-carro-eletrico) |
| Cupra | Raval (P1) | [Fonte](https://www.cupraofficial.pt/cupra-raval/cupra-raval) |
| Volkswagen | ID. Polo (P1), ID.7 Tourer (P2), ID. Buzz (P2) | [Fonte](https://www.volkswagen.pt/eletricos/eletricos) |
| Skoda | Epiq (P1), Enyaq Coupé (P2) | [Fonte](https://www.skoda.pt/models/overview) |
| Peugeot | E-2008 (P2), E-308 (P2), E-308 SW (P2), E-408 (P2), E-5008 (P2) | [Fonte](https://www.peugeot.pt/conselhos-sugestoes/eletrificacao/carregamento/tempo-de-carregamento-rapido-em-autoestrada-para-carros-eletricos.html) |
| Citroen | e-C4 X (P2), e-C5 Aircross (P2) | [Fonte](https://www.citroen.pt/gama-electrificada.html) |
| Toyota | bZ4X (P2), C-HR+ (P2), bZ4X Touring (P2) | [Fonte](https://www.toyota.pt/eletrificacao/mobilidade-ev) |
| Mazda | 6e (P2), CX-6e (P2) | [Fonte](https://www.mazda.pt/ev/overview/) |
| MINI | Aceman (P2) | [Fonte](https://www.mini.pt/pt_PT/home.html) |
| smart | #5 (P2) | [Fonte](https://pt.smart.com/pt/models/hashtag-five/specifications/) |
| DS Automobiles | DS 3 E-Tense (P2), N°4 E-Tense (P2), N°7 E-Tense (P2) | [Fonte](https://www.dsautomobiles.pt/eletrico-hibrido.html) |
| Jeep | Avenger Electric (P2), Compass Electric (P2) | [Fonte](https://www.jeep.pt/eletrificacao) |
| Audi | A6 Sportback e-tron (P2), A6 Avant e-tron (P2), Q6 e-tron (P2), Q6 Sportback e-tron (P2), e-tron GT (P2) | [Fonte](https://www.audi.pt/modelos/todos-os-modelos) |
| BMW | i3 Neue Klasse (P2), iX3 Neue Klasse (P2), i5 (P2), i5 Touring (P2), i7 (P2), iX (P2) | [Fonte](https://www.bmw.pt/pt/all-models.html) |
| Volvo | EX60 (P2), EX90 (P2), ES90 (P2) | [Fonte](https://www.volvocars.com/pt/build/) |
| Polestar | 3 (P2), 5 (P2), 4 SUV (P2) | [Fonte](https://www.polestar.com/pt/configure/) |
| Suzuki | e Vitara (P2) | [Fonte](https://www.suzukiauto.pt/precios/evitara) |
| Alpine | A390 (P2) | [Fonte](https://www.alpinecars.pt/configurador.html) |
| Abarth | 500e (P2), 600e (P2) | [Fonte](https://www.abarth.pt/) |
| Lexus | RZ (P2) | [Fonte](https://www.lexus.pt/) |
| Mercedes-Benz | CLA Electric (P2), CLA Shooting Brake Electric (P2), GLB Electric (P2), GLC Electric (P2), EQS (P2), G 580 EQ (P2) | [Fonte](https://www.mercedes-benz.pt/passengercars/models/electric.html) |

## Pré-vendas e preços: o que não se deve confundir

- CUPRA Raval: o site oficial indica pré-venda. Registar esse estado e as condições da versão; não o promover automaticamente como entrega imediata.
- XPeng L03: existem **duas propostas**, EV e EREV. A página oficial EV tem campanha de lançamento própria; o EREV não entra na mesma ficha. Confirmar entregas.
- Aion UT: já há gama e campanha nacional; a página de manuais ainda diz “brevemente”, mostrando que nem todas as secções estão sincronizadas. Uma campanha de setembro não é automaticamente válida em novembro.
- Denza: já existe site português; isso não bastou para comprovar aqui a oferta BEV, preço e entrega nacionais. Vai para acompanhamento, não para “disponível”.
- Não copiar preços “+ IVA”, rendas mensais, promoções expiradas ou preços de variantes híbridas para ofertas BEV particulares.

## Acompanhar / confirmar antes de publicar como novo disponível

| Marca | Modelos | Pendência |
| --- | --- | --- |
| Denza | Z9GT BEV | Z9GT EV identificado; confirmar oferta comercial portuguesa, preço e entregas. Z9GT DM e D9 DM-i excluídos. [Referência](https://www.denza.com/pt) |
| XPeng | G9L | Concessionário oficial anuncia chegada brevemente; confirmar lançamento e preços. [Referência](https://caetano.pt/xpeng/) |
| Lynk & Co | 02 | Produto europeu confirmado; não foi confirmada oferta oficial portuguesa nesta pesquisa. [Referência](https://www.lynkco.com/en/cars/02) |
| Hongqi | EH7, EHS7 | Produtos internacionais confirmados; falta comprovar representação, versões e oferta portuguesa. [Referência](https://www.hongqi-auto.com/) |
| Maxus | Euniq 6, MIFA 7, MIFA 9 | Há presença no mercado de usados; isso não confirma uma oferta nova nacional atual destas três famílias. Verificar importador e separar MPV/comerciais. [Referência](https://www.piscapisca.pt/carros/maxus) |
| Aiways | U5, U6 | Presença em usados confirmada; falta oferta nova nacional atual. Prioridade futura para usados/importação. [Referência](https://encontracarros.pt/marca/aiways) |
| Neta | Gama por confirmar | Matrículas históricas não estabelecem gama atual e suporte comercial; confirmar importador antes de criar ofertas disponíveis. |
| Seres | 3, 5 | Pesquisar separadamente oferta oficial nova e anúncios usados; presença nova nacional por confirmar. |
| Skywell | ET5/BE11 | Pesquisar oferta nacional atual; anúncio usado ou apresentação noutro país não confirma disponibilidade oficial. |
| GWM/Ora | 03 | Verificar distribuição e oferta portuguesa atual; não assumir por existir noutros mercados europeus. |
| Lepas / Exlantix / Avatr / Onvo / Xiaomi | Gama por confirmar | Monitorizar por marca; não foi comprovada nesta auditoria uma oferta BEV portuguesa pronta para importação. |
| Leapmotor | B03 | Há referência a apresentação; dados comerciais/técnicos nacionais insuficientes nesta pesquisa. Não confundir com B03X já adicionado. [Referência](https://grupoleapmotor.pt/) |
| Toyota | Urban Cruiser | Anúncio oficial; confirmar configuração/preço e estado nacional antes de adicionar como disponível. [Referência](https://www.toyota.pt/mundo-toyota/noticias/toyota-e-marca-de-confianca-ambiente-em-2025) |
| smart | #2 | Site nacional já menciona; faltam confirmação de versões/preço e distinguir dados preliminares. [Referência](https://pt.smart.com/pt/) |
| Lancia | Ypsilon Electric | Página nacional de produto existe, mas a informação encontrada não basta para confirmar campanha e encomenda atuais. [Referência](https://www.lancia.pt/ypsilon/edizione-limitata-cassina) |
| Lexus | ES Electric, UX 300e | Validar nova geração e motorização BEV do ES; UX 300e pode ser mais relevante em stock/usados. [Referência](https://www.lexus.pt/) |
| Mercedes-Benz | Classe C Electric, VLE, AMG GT Electric | Novidades já mencionadas no site nacional; confirmar preços, homologação e abertura efetiva de encomendas antes de criar ofertas disponíveis. [Referência](https://www.mercedes-benz.pt/passengercars/models/electric.html) |
| Skoda | Peaq | Novidade no site nacional; confirmar dados finais e oferta comercial. [Referência](https://www.skoda.pt/models/overview) |

## Exclusões do primeiro lote

- **Zeekr 9X**: Não integrar automaticamente em BEV: validar motorização híbrida plug-in.
- **BYD DM-i, Geely Starray EM-i, Changan S05 PHEV, Omoda/Jaecoo SHS híbridos, Leapmotor REEV, XPeng L03 EREV**: Ofertas eletrificadas distintas de 100% elétrico. Criar categoria própria só se o âmbito do produto for alargado.
- **Farizon, Foton, Victory, DFSK comerciais, Maxus Cargo**: Gamas comerciais e/ou motorizações diversas: levantamento separado; não são lacunas automáticas do catálogo de passageiros BEV.

## Ordem proposta para execução

1. **Novas marcas chinesas generalistas**: Aion UT/V, Geely E2/E5, Changan Deepal S05/S07, Dongfeng BOX/VIGO, Firefly e Forthing Friday EV/S7 EV — 11 modelos.
2. **Completar marcas chinesas já presentes**: BYD ATTO 2/SEAL U/SEALION 7, MG4 EV/MGS5 EV/MGS6 EV/Cyberster, XPeng G9/P7+/L03 EV e NIO ET5 — 11 modelos.
3. **Chineses premium**: Zeekr X/001/7X/7GT e Voyah Courage/Free/Dream — 7 modelos.
4. **Lacunas acessíveis das restantes marcas**: Spring, INSTER, Twingo, Renault 4, Micra, Grande Panda, EV2, EV4, Raval, ID. Polo e Epiq; manter pré-vendas identificadas.
5. **Restante gama familiar/premium**: Opel, Peugeot, Toyota, Hyundai, BMW, Audi, Volvo e restantes linhas P2, em sublotes de 8–12 modelos.

Cada modelo pode exigir várias versões: a unidade de trabalho real é a configuração bateria/tração/acabamento. Não criar todas as combinações sem prova de oferta nacional. Por versão, recolher: preço e condição fiscal com data; bateria bruta/útil sem confundir; WLTP combinado; DC/AC e janela de carregamento; dimensões; fonte e fotografia. Publicar assets antes da importação validada, seguindo o fluxo usado no B03X.

## Revisões necessárias no catálogo existente

- Rever preços/datas e versões de entrada: muitos modelos têm apenas uma configuração. Não criar um modelo novo por mudança de bateria ou acabamento.
- Confirmar separação de gerações em Born, ID.3/Neo, Q4 e-tron e iX3/i3.
- Rever o P7 existente face ao P7+; manter identidades diferentes.
- Corrigir eventual divisão do Macan base e Macan 4 como duas famílias, em vez de versões do mesmo modelo.
- Usados/importação merecem outro lote: Zoe, e-Golf, i3 antigo, Ioniq Electric, Soul/e-Niro, Leaf antigo e smart EQ são lacunas possíveis, com ano e estado comercial corretos.

O ficheiro [model-expansion-research-2026-11-22.json](../data/internal/model-expansion-research-2026-11-22.json) guarda os candidatos individualmente, prioridades, URLs, pendências e a fotografia do catálogo atual. Os candidatos foram verificados contra os nomes atuais para evitar duplicados exatos; aliases e carroçarias precisam de normalização na fase de importação.

## Atualização após a fase de levantamento

Em 22/11/2026, por instrução do utilizador, foram criadas as 130 famílias de modelo no Supabase, inicialmente sem variantes ou ofertas novas. Naquela fase, o catálogo público mantinha as 86 versões existentes. A proposta de versões e a verificação da criação encontram-se em [MODEL_VERSION_PLAN.md](MODEL_VERSION_PLAN.md). As afirmações anteriores sobre ausência de escritas referem-se à fase de pesquisa.

Após as publicações e o agrupamento de acabamentos, o estado dos novos modelos é acompanhado em [MODEL_EXPANSION_STATUS.md](MODEL_EXPANSION_STATUS.md), verificado em 23/11/2026: nove modelos com dados básicos e 121 famílias ainda sem ficha pública. Esta atualização de acompanhamento não altera dados dos carros.
