# Segunda verificação: catálogo exclusivamente BEV

Revisão: **22/11/2026**. O utilizador confirmou que só pretende carros 100%
elétricos. O levantamento fica limitado a **BEV**: veículos a bateria sem motor
térmico e sem extensor de autonomia. Excluem-se HEV, MHEV, PHEV, REEV/EREV e FCEV.

A lista principal tem **130 candidatos**, dos quais 25 acrescentados nesta passagem.
Cada candidato no JSON tem a configuração `powertrain: BEV`, a fonte de evidência
(`bevReview.evidenceUrl`) e uma restrição para excluir outras motorizações da mesma
família. A evidência usada é a designação elétrica do produto/variante em fonte
oficial, não uma classificação automática baseada na marca, no nome comercial
ou na possibilidade de ligar o carro à tomada.

A verificação de motorização não substitui a verificação comercial: continuam por
fechar versões portuguesas concretas, bateria, ano, preço, condições e entrega.
Não se afirma que as 130 entradas sejam 130 famílias novas disponíveis para entrega
imediata; a contagem inclui carroçarias, MPVs de passageiros e gerações distintas.

## Casos em que o nome pode induzir em erro

| Família | Elegível | Excluir | Evidência |
| --- | --- | --- | --- |
| Mitsubishi Eclipse Cross | Nova geração **Eclipse Cross EV** | Eclipse Cross PHEV/térmico anterior | [Página portuguesa 100% elétrica](https://www.mitsubishi-motors.pt/novo-eclipse-cross-ev) |
| BYD ATTO 2 / SEAL U | Configurações BEV | DM-i | [Gama oficial distingue motorizações](https://byd-auto.pt/modelos) |
| Zeekr | X, 001, 7X e 7GT elétricos | 9X Super Hybrid | [Comunicação oficial do 9X híbrido](https://www.zeekrgroup.com/en/news/202509291) |
| Geely | E2 e E5 BEV | Starray EM-i | [Lançamento nacional](https://www.geelyauto.eu/posts/geely-auto-official-launch-in-portugal) |
| Changan Deepal | S05 / S07 **BEV** | S05 PHEV e variantes com extensor | [Configurador S05 BEV](https://changan-auto.pt/configurador/deepal-s05/) e [comunicação nacional](https://changan-auto.pt/changan-portugal-celebra-primeiro-aniversario-com-perto-de-1-000-unidades-entre-matriculas-e-vendas-confirmadas-numa-gama-em-expansao/) |
| XPeng L03 | **L03 EV** | L03 EREV | [Campanha portuguesa 100% EV](https://www.xpeng-auto.pt/campanhas/particulares/l03-ev) |
| Denza | Z9GT EV, ainda com validação comercial pendente | Z9GT DM e D9 DM-i | [Gama em português distingue elétricos e PHEV](https://www.denza.com/pt/experience/events) |
| Forthing | Friday **EV** e S7 **EV** | Friday HEV/térmico e U-Tour térmico | [Gama nacional](https://www.forthing.pt/) |
| Voyah | Free, Dream e Courage na configuração BEV portuguesa | Versões PHEV/REEV com nomes semelhantes noutros mercados | [Gama nacional BEV na rede oficial](https://caetano.pt/voyah/), [Dream elétrico](https://www.voyah.pt/modelos/voyah-dream) |
| KGM | Torres **EVX** | Torres HEV/térmico | [Site nacional separa elétricos e híbridos](https://kgm.pt/) |
| Maserati | Grecale / GranTurismo / GranCabrio **Folgore** | Versões térmicas e Grecale híbrido | [Configurador português](https://www.maserati.com/pt/pt/shopping-tools/configurator) |
| Jeep | Avenger / Compass **Electric** | e-Hybrid, 4xe e PHEV | [Gama eletrificada com motorizações separadas](https://www.jeep.pt/eletrificacao) |
| Mercedes | Configuração **Elétrico** de CLA/GLA/GLB/GLC; famílias EQ BEV | Homónimos PHEV, gasolina e diesel | [Configurador nacional com filtros e combustível](https://www.mercedes-benz.pt/passengercars/configurator.html) |
| Renault | Configuração E-Tech **elétrico** | E-Tech full hybrid/plug-in de outras gamas | [Gama elétrica](https://www.renault.pt/veiculos-eletricos.html) |
| DS | N°4/N°7/DS 3 na configuração **100% elétrica** | Híbridos e plug-in; E-Tense sem confirmação adicional | [Eletrificação DS](https://www.dsautomobiles.pt/eletrico-hibrido.html) |
| Fiat | 500e, 600e, Grande Panda elétrico, E-Ulysse elétrico | 500 Hybrid, 600/Grande Panda híbridos, Ulysse diesel | [Gama Fiat](https://www.fiat.pt/) e [E-Ulysse](https://www.fiat.pt/professional/modelo/e-ulysse) |
| Toyota | bZ4X, C-HR+, bZ4X Touring, Proace Verso/City Verso **Electric** | HEV/PHEV, Proace diesel e Mirai FCEV | [Gama nacional](https://www.toyota.pt/carros), [Proace Verso elétrico](https://www.toyota.pt/carros/proace-verso/configurador) |

## Passageiros não significa furgão de carga

Os novos E-Tourneo, ë-Berlingo, ë-SpaceTourer, E-Rifter, E-Traveller,
Combo Electric, Zafira Electric, Proace Verso/City Verso Electric, E-Ulysse,
Kangoo E-Tech, EQV e EQT são candidatos apenas nas versões de passageiros.
Antes da importação, confirmar a lotação, carroçaria e categoria do veículo.
Uma ficha de Van/Cargo não serve de prova para uma versão de passageiros.

Musso EV e Hilux BEV são efetivamente elétricos, mas ficaram num bloco opcional
separado de pick-ups. Não foram somados à lista principal de 130 candidatos.

## BEV confirmado, oferta nacional ainda pendente

- **Denza Z9GT EV**: a variante elétrica está identificada. A página apresenta
  também híbridos; não importar toda a gama como elétrica. Confirmar oferta
  portuguesa, preço oficial, versão e entrega antes de marcar disponível.
- **Subaru Solterra, Uncharted e E-Outback**: a marca confirma as três propostas
  BEV europeias; falta validar a oferta portuguesa. [Fonte Subaru Europe](https://www.subaru.eu/media/subaru-confirms-new-electric-range-for-europe).
- **Lotus Eletre BEV e Emeya**: configuração elétrica confirmada; oferta nova
  nacional ainda por comprovar nesta auditoria. Eletre X/PHEV e Emira não entram.
  [Fonte oficial Emeya](https://www.lotuscars.com/en/press/models/emeya).
- **Rolls-Royce Spectre**: BEV confirmado; prioridade baixa e canal nacional de
  encomenda a confirmar. [Fonte oficial](https://www.press.rolls-roycemotorcars.com/rolls-royce-motor-cars-pressclub/article/detail/T0462144EN/spectre-series-ii-makes-its-debut-on-public-roads-in-stockholm).

Uma presença em anúncios usados ou um lançamento europeu não prova disponibilidade
nova em Portugal. Marcas com informação nacional insuficiente continuam em
acompanhamento; não receberam preços estrangeiros convertidos nem estatuto de
“disponível” por inferência.

## Regra para o futuro lote de usados

Manter gerações e motorizações separadas. Exemplos: BMW i3 BEV não é i3 REx;
Opel Ampera-e BEV não é Ampera com extensor; Hyundai Ioniq Electric não é Ioniq
Hybrid/PHEV; Kia Niro EV/e-Niro não é Niro HEV/PHEV. O mesmo cuidado aplica-se
às versões antigas do Leaf e aos veículos importados com designações diferentes.

## Validação realizada

- Todas as 130 entradas principais têm elegibilidade BEV e fonte de evidência.
- Não existem candidatos principais com designação PHEV, REEV/EREV, DM-i, REx ou
  FCEV; essas designações aparecem apenas em restrições/exclusões.
- Não há duplicados exatos de marca + modelo na lista nem com os nomes do catálogo
  usado como referência. Aliases e carroçarias serão normalizados antes da importação.
- Não foram criadas ofertas no Supabase nem publicados novos modelos nesta fase.

## Atualização após a fase de levantamento

Em 22/11/2026, por instrução do utilizador, foram criadas as 130 famílias de modelo no Supabase, sem variantes ou ofertas novas. O catálogo público mantém as 86 versões existentes. A proposta de versões e a verificação da criação encontram-se em [MODEL_VERSION_PLAN.md](MODEL_VERSION_PLAN.md). As afirmações anteriores sobre ausência de escritas referem-se à fase de pesquisa.
