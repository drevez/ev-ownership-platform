# Coerência dos dados — primeiro lote BEV — 22/11/2026

Revisão de nove modelos com fontes oficiais, concessionários, Guia do Automóvel e ensaios portugueses. Esta revisão prevalece sobre as pendências históricas do levantamento inicial. Foram preparados **18 registos de configuração em nove modelos**, sem importação de variantes no Supabase. Existe ainda um candidato BOX PRO a mapear.

O Firefly tem **uma única configuração selecionada e um único nome público: Firefly**. Não são apresentadas versões Select/Comfort. A configuração de origem mais barata fica identificada apenas na proveniência, para evitar juntar especificações da versão superior.

## O que significa informação coesa

Preço com tipo (tabela/campanha), IVA, público e data; bateria/tração/WLTP da mesma configuração; carga com o intervalo correto; dimensões e bagageira com método quando disponível; fontes rastreáveis e fotografia correta. Não é necessário preencher todos os campos opcionais para publicar os restantes dados confirmados. Fontes secundárias portuguesas são utilizáveis com confiança explícita.

## Estado por modelo

| Modelo | O que esta revisão fechou | O que ainda falta | Decisão |
| --- | --- | --- | --- |
| Aion UT | Preço particular de tabela para Premium e Luxury encontrado; manter separado da campanha Premium Green. 204 cv/150 kW corroborados por tabela e concessionário Motorpor. | Decidir se Premium Green é apenas configuração de cor/preço da Premium para evitar duplicação. Campanhas próprias Premium/Luxury não confirmadas; podemos usar PVP de tabela identificado como fonte secundária. | Preparável com preços de tabela rotulados; resolver apenas apresentação Premium/Green. |
| Aion V | 11 kW AC sustentados por artigo técnico oficial PT e ensaios nacionais. 510 km combinados separados de 709 km urbanos. | Conferir 6,6 vs 11 kW na ficha da unidade/ano; 11 kW é o valor preferido, não unanimidade documental. Preço particular atual Luxury só tem referência de imprensa; confirmar campanha/tabela atual. | Premium pode avançar com condições de preço; Luxury exige fonte de preço bem rotulada. |
| Geely E2 | PRO/MAX/ULTRA, baterias 35,35/47,14 kWh e 252/345 km cruzados. Dimensões 4135×1805×1580 e entre eixos 2645 mm corroborados por concessionários PT e tabela. | Intervalo de carga de 25 min diverge entre 20–80 e 30–80; não preencher tempo 10–80. | Núcleo coerente; campo de tempo de carga pode permanecer vazio, sem impedir publicação do resto. |
| Geely E5 | Dimensões e bagageira 461/1877 L reunidas. 410 km MAX agora corroborados por Guia, concessionário e apresentação PT; 425 km isolados no configurador. Preço de tabela e campanha passaram a ter registos separados. | Confirmação final dos 410 km MAX face aos 425 do configurador. AC 11 kW fortemente documentado na Europa, mas ainda falta correspondência explícita de ficha PT; bomba de calor por versão não fechada. | PRO preparável; MAX com 410 km como valor preferido e fonte identificada, preservando o conflito para revisão. |
| Changan Deepal S05 | PRO/MAX RWD e MAX AWD com preço, bateria, tração, WLTP e carga correspondentes. Tabela secundária confirma versões BEV e contém PHEV que foram excluídos. | Método da bagageira e comprimento: ficha oficial 4580 mm, Guia 4598 mm; manter 4580 da ficha oficial até confirmação. | Mais pronto do lote; manter teto MAX como opcional e medidas oficiais. |
| Changan Deepal S07 | Na configuração 79,97 kWh: AC 11 kW, DC 93 kW em ensaio PT; mala 510 L e frunk 125 L corroborados. | Revisão 77,94 kWh tem dois preços oficiais: 44.990 e 45.728 €. O principal codifica 45.728 como preço base; não assumir que 738 € são um extra sem prova. Mala: fabricante 510 L vs Guia 445 L; identificar método de medição antes de comparar literalmente. Verificar cotas e volumes da revisão 77,94 kWh separadamente. | Anterior pode ser preparado; revisão LFP exige fechar preço e especificações correspondentes, sem MY26 no nome público. |
| Dongfeng BOX | PLUS: preço particular, IVA, validade e despesas agora explícitos na Caetano. FWD, AC 6,6 e DC 87,8 kW cruzados em fontes PT. | PRO/PLUS e TT: confirmar equipamento/posição na gama; evitar criar versões só por pintura. Comprimento difere 4020/4030 mm entre fontes; não fechar sem ficha da versão. | PLUS tem núcleo coerente; PRO fica como candidato, sem importação automática. |
| Dongfeng VIGO | Nova campanha Caetano: 24.600 € + IVA, até 30/11, One Edition e despesas identificadas. FWD e medidas 4306×1868×1654 corroboradas por tabela e ensaio PT. | Potência AC da configuração PT; 6,6 kW apenas de documentação de outros mercados. | Núcleo coerente; deixar AC não confirmado vazio e manter preços de concessionários distintos separados. |
| Firefly | 120 kW/163 cv; AC 7 kW monofásico ou 11 kW trifásico; DC 100 kW; carga 10–80% em 29 min; V2L. Fonte oficial PT reconfirmada. Uma única versão, nome Firefly. | Sem bomba de calor, por confirmação do utilizador. AC depende da configuração do carregador de bordo. | Preparável para publicação, mostrando ambas as opções AC com a condição. |

## Correções e fontes principais

- **Firefly:** [site oficial português](https://fireflyportugal.pt/o-nosso-carro/) reconfirmado: motor de 120 kW/163 cv, AC 7 kW monofásico ou 11 kW trifásico, DC 100 kW, 29 min 10–80 e V2L. O [Guia](https://www.guiadoautomovel.pt/marcas/firefly/firefly/precos) sustenta o preço de entrada de 30.900 € e 330 km. As referências anteriores de 105 kW ficam históricas; não é necessário deduzir uma atualização chinesa para usar os dados portugueses atuais. Não assumir que 11 kW equipa todas as unidades. A referência monofásica usada é 7 kW, tal como no site oficial, sem substituir por 7,4 kW de fontes secundárias.
- **BOX PLUS:** a [Caetano](https://caetano.pt/dongfeng/carros-novos/box/) explicita 23.500 € com IVA para particulares até 30/11/2026, mais 1.045,50 € de legalização/transporte e pintura metalizada de 450 €. Não confundir com o preço empresarial ou com campanha que só começa em 26/11.
- **VIGO:** [campanha Caetano](https://caetano.pt/dongfeng/carros-novos/vigo/) de 24.600 € + IVA até 30/11/2026, One Edition, sem legalização/transporte/pintura. 30.258 € com IVA continental é conversão aritmética, não novo preço observado.
- **E5 MAX:** [Guia](https://www.guiadoautomovel.pt/marcas/geely/e5/precos), [Caetano](https://caetano.pt/geely/carros-novos/e5/) e apresentação nacional convergem em 410 km. Este passa a ser o valor preferido da revisão; os 425 km do configurador ficam registados como divergência, sem alegar que houve confirmação do fabricante.
- **Aion V AC:** o [artigo técnico oficial PT de 29/10](https://gac-portugal.pt/universo-gac/carregar-carro-eletrico/) sustenta 11 kW. A ficha de produto ainda mostra 6,6 kW; a divergência é mantida com preferência fundamentada por 11 kW.
- **S07 anterior:** [fabricante europeu](https://www.changaneurope.com/uk/models/changan-deepal-s07-bev/specifications) e [ensaio ACP](https://www.acp.pt/o-clube/revista-acp/ensaios/detalhe/ao-volante-do-changan-deepal-s07) sustentam AC 11 kW; ACP indica DC 93 kW. A mala de 510 L e frunk de 125 L têm corroboração, mas o Guia diz 445 L; falta identificar método de medição. O preço 44.990/45.728 € da revisão LFP continua por resolver.

## Regras de integração

- PVP de tabela e campanha são duas ofertas/referências, não um único número que muda conforme a fonte. O Guia inclui componentes que podem originar pequenas diferenças face ao PVP base anunciado; não atribuir a diferença a uma taxa concreta sem decomposição.
- O Guia mistura S05 BEV e PHEV. Foram consideradas apenas linhas EV/BEV. Capacidades 68/79/51 kWh arredondadas não substituem 68,8/79,97/51,87 documentadas.
- No BOX, PRO/PLUS e TT aparecem na tabela. PRO fica candidato até mapear equipamento; não criar automaticamente uma versão mecânica por pintura de teto.
- Os tempos 20–80/30–80 não preenchem o campo 10–80. Consumo WLTP não passa a consumo real.
- Autonomia real/autoestrada, capacidade útil/bruta e equipamento não comprovado continuam ausentes. Isto não deve bloquear preço, WLTP ou dimensões já sustentados.
- Manter 500 L e 72 L ocultos do VIGO separados; no S05 manter o método de gotas e teto opcional nas MAX.
- Não alterar IDs/slugs para eliminar nomes repetidos da apresentação. A aplicação já mostra Firefly uma só vez.

## Prioridade para terminar

1. S05, E2 e BOX PLUS: montar dados com os campos confirmados, mantendo carga não documentada e medidas em disputa vazias/assinaladas.
2. Aion UT/V, VIGO e E5: usar referências portuguesas já reunidas, preço de tabela separado de campanha e confiança de campo explícita.
3. S07 LFP: fechar preço/configuração da revisão. Firefly: dados essenciais fechados; preparar uma única versão, mantendo as opções AC condicionadas à configuração.

Ficheiro estruturado: [dados e proveniência](../data/internal/model-expansion-batch-01-2026-11-22.json). Os campos `cohesionReview`, `fieldReview` e `preferredWltpCombinedKm` distinguem decisão editorial, corroboração e conflito ainda aberto. Nenhuma destas pesquisas escreve na base de dados automaticamente.

Confirmação do utilizador em 22/11/2026: **Firefly sem bomba de calor**. Campo preparado como `heatPumpAvailable: false`; deixa de ser informação desconhecida.
