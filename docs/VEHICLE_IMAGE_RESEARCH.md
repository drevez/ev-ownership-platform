# Levantamento de imagens em falta — 22/11/2026

O catálogo contém 84 versões. Faltam ficheiros locais de imagem em 66 versões, correspondentes a 56 grupos de modelo. Esta lista cobre todos os registos em falta na auditoria. As 18 versões restantes já têm ficheiro local; a qualidade dessas fotos não foi reavaliada aqui.

## Aplicação autorizada — 22/11/2026

As 66 versões receberam os ficheiros WebP nos caminhos que o catálogo já referencia. Foram obtidas 56 fotografias por GET (HTTP 200), descodificadas e revistas visualmente por Codex por delegação do utilizador. As respostas HEAD 403 da auditoria inicial não impediam o download normal.

As imagens foram preparadas até 1280×720, sem ampliar o original e preservando a fotografia inteira, com WebP qualidade 84. As variantes do mesmo modelo partilham a fotografia representativa; cor, jantes e acabamento podem diferir. Não se afirma uma correspondência fotográfica exata à bateria/acabamento de cada versão.

O manifesto de revisão guarda fonte, revisor e metadados. A rejeição anterior do BMW iX1 permanece no histórico do ficheiro de pesquisa; foi escolhida e revista uma alternativa a ¾. Não foi necessário alterar dados no Supabase: apenas adicionar os ficheiros locais que faltavam.

Os parágrafos seguintes descrevem o estado na fase inicial de levantamento, antes da aplicação.

## Estado e critério na auditoria inicial

Para cada versão foram identificados o destino esperado, uma página de modelo e uma imagem candidata. Todas as 56 páginas responderam HTTP 200. As imagens foram identificadas pelo HTML das páginas e verificadas por HEAD; não foram descarregadas nem revistas visualmente. A correspondência é de modelo/geração candidata: não confirma cor, jantes, acabamento ou bateria da unidade fotografada. O ano 2026 no catálogo não basta para provar o facelift.

As imagens candidatas vêm de uma fonte editorial (EV Database); as referências oficiais adicionais, quando disponíveis, servem para procurar o original e confirmar a geração na fase de aplicação. Identificação de uma imagem não equivale a aprovação para publicação. Na aplicação, preferir o original oficial adequado e confirmar condições de utilização, enquadramento lateral/¾ exterior e ausência de marca de água.

Não houve alterações ao Supabase, ao manifesto de aprovação existente, às imagens públicas ou ao site. A rejeição anterior da foto do BMW iX1 está preservada nos dados da pesquisa.

Dados completos, incluindo IDs, caminhos de destino, URLs diretos e histórico de candidatas: [vehicle-image-research-2026-11-22.json](../data/internal/vehicle-image-research-2026-11-22.json). Este ficheiro é pesquisa; não é uma entrada pronta para aprovação automática.

## Lotes propostos

| Lote | Modelos | Versões |
| --- | ---: | ---: |
| 1 | 12 | 13 |
| 2 | 12 | 14 |
| 3 | 12 | 15 |
| 4 | 12 | 15 |
| 5 | 8 | 9 |

Cada lote deve passar por revisão visual, confirmação de geração/acabamento, preparação WebP e verificação dos caminhos antes de publicação. Variantes de bateria podem partilhar foto apenas quando a carroçaria e os elementos exteriores são compatíveis; uma foto genérica deve ser tratada como tal.

## Lote 1

| Modelo | Versões sem foto | Candidata e fonte | Verificação necessária |
| --- | --- | --- | --- |
| Audi Q4 Sportback e-tron | `audi-q4-sportback-etron-45` | [Imagem candidata](https://ev-database.org/img/auto/Audi_Q4_e-tron_Sportback_2021/Audi_Q4_e-tron_Sportback_2021-01@2x.jpg) · [Audi Q4 Sportback e-tron 45 quattro](https://ev-database.org/car/2017/Audi-Q4-Sportback-e-tron-45-quattro) · [Referência oficial](https://www.audi.de/de/neuwagen/q4-e-tron/q4-sportback-e-tron/) | Sportback, não SUV; escolher a geração 45, não o novo modelo 2027. |
| BMW iX1 | `bmw-ix1-xdrive30` | [Imagem candidata](https://ev-database.org/img/auto/BMW_iX1_2022/BMW_iX1_2022-01@2x.jpg) · [BMW iX1 xDrive30](https://ev-database.org/car/1701/BMW-iX1-xDrive30) | Preservar rejeição anterior: não reutilizar P90479818 (frente) nem imagem com marca de água. Esta alternativa ainda exige revisão visual. |
| BMW iX2 | `bmw-ix2-edrive20` | [Imagem candidata](https://ev-database.org/img/auto/BMW_iX2_2024/BMW_iX2_2024-01@2x.jpg) · [BMW iX2 eDrive20](https://ev-database.org/car/3460/BMW-iX2-eDrive20) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| BYD Atto 3 Evo | `byd-atto-3-evo` | [Imagem candidata](https://ev-database.org/img/auto/BYD_ATTO_3_EVO_2026/BYD_ATTO_3_EVO_2026-01@2x.jpg) · [BYD ATTO 3 Evo RWD Design](https://ev-database.org/car/3474/BYD-ATTO-3-Evo-RWD-Design) · [Referência oficial](https://www.byd-auto.pt/modelos/byd-atto-3-evo) | Evo 2026; não usar a foto do Atto 3 original existente no projeto. |
| BYD Dolphin | `byd-dolphin-comfort-60kwh` | [Imagem candidata](https://ev-database.org/img/auto/BYD_DOLPHIN_2025/BYD_DOLPHIN_2025-01@2x.jpg) · [BYD DOLPHIN 60.4 kWh](https://ev-database.org/car/3297/BYD-DOLPHIN-604-kWh) | Não confundir Dolphin com Dolphin Surf; confirmar facelift do Comfort no catálogo. |
| BYD Dolphin Surf | `byd-dolphin-surf-boost-43kwh` | [Imagem candidata](https://ev-database.org/img/auto/BYD_DOLPHIN_SURF/BYD_DOLPHIN_SURF-01@2x.jpg) · [BYD DOLPHIN SURF 43.2 kWh Boost](https://ev-database.org/car/3194/BYD-DOLPHIN-SURF-432-kWh-Boost) · [Referência oficial](https://www.byd-auto.pt/modelos/byd-dolphin-surf) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Citroen e-C3 | `citroen-e-c3-30kwh-you`<br>`citroen-e-c3-44kwh-plus` | [Imagem candidata](https://ev-database.org/img/auto/Citroen_e-C3/Citroen_e-C3-01@2x.jpg) · [Citroën ë-C3 Urban Range 30 kWh](https://ev-database.org/car/3280/Citroen-e-C3-Urban-Range-30-kWh) · [Referência oficial](https://www.citroen.pt/modelos/e-c3.html) | You e Plus podem ter diferenças de equipamento exterior; foto de modelo não comprova acabamento. |
| Citroen e-C3 Aircross | `citroen-e-c3-aircross-54kwh` | [Imagem candidata](https://ev-database.org/img/auto/Citroen_e-C3_Aircross/Citroen_e-C3_Aircross-01@2x.jpg) · [Citroën ë-C3 Aircross Extended Range 54 kWh](https://ev-database.org/car/3228/Citroen-e-C3-Aircross-Extended-Range-54-kWh) · [Referência oficial](https://www.citroen.pt/modelos/novo-ec3aircross.html) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Citroen e-C4 | `citroen-e-c4-54kwh` | [Imagem candidata](https://ev-database.org/img/auto/Citroen_e-C4_2024/Citroen_e-C4_2024-01@2x.jpg) · [Citroën ë-C4 54 kWh](https://ev-database.org/car/3048/Citroen-e-C4-54-kWh) | Hatchback facelift; não ë-C4 X. |
| Cupra Born | `cupra-born-79kwh-231cv` | [Imagem candidata](https://ev-database.org/img/auto/Cupra_el-Born/Cupra_el-Born-01@2x.jpg) · [CUPRA Born 170 kW - 79 kWh](https://ev-database.org/car/3263/CUPRA-Born-170-kW---79-kWh) · [Referência oficial](https://www.cupraofficial.pt/cupra-born/versoes-e-equipamento) | 79 kWh/231 cv da geração anterior ao facelift 2027; não VZ. |
| Cupra Tavascan | `cupra-tavascan-endurance-77kwh-286cv` | [Imagem candidata](https://ev-database.org/img/auto/CUPRA_Tavascan_2024/CUPRA_Tavascan_2024-01@2x.jpg) · [CUPRA Tavascan Endurance](https://ev-database.org/car/1971/CUPRA-Tavascan-Endurance) · [Referência oficial](https://www.cupraofficial.pt/cupra-tavascan/cupra-tavascan) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| DS Automobiles N°8 | `ds-n8-97kwh` | [Imagem candidata](https://ev-database.org/img/auto/DS_No8_2024/DS_No8_2024-01@2x.jpg) · [DS Automobiles N°8 FWD Long Range](https://ev-database.org/car/3077/DS-Automobiles-N8-FWD-Long-Range) · [Referência oficial](https://www.dsautomobiles.pt/comprar-alugar/ofertas-particulares/n8-pallas-fwd.html) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |

## Lote 2

| Modelo | Versões sem foto | Candidata e fonte | Verificação necessária |
| --- | --- | --- | --- |
| Ford Capri | `ford-capri-79kwh` | [Imagem candidata](https://ev-database.org/img/auto/Ford_Capri_2024/Ford_Capri_2024-01@2x.jpg) · [Ford Capri Extended Range RWD](https://ev-database.org/car/3648/Ford-Capri-Extended-Range-RWD) · [Referência oficial](https://www.ford.pt/passageiros/capri-eletrico) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Ford Explorer | `ford-explorer-79kwh` | [Imagem candidata](https://ev-database.org/img/auto/Ford_Explorer_2024/Ford_Explorer_2024-01@2x.jpg) · [Ford Explorer Extended Range RWD](https://ev-database.org/car/2168/Ford-Explorer-Extended-Range-RWD) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Honda e:Ny1 | `honda-eny1-62kwh` | [Imagem candidata](https://ev-database.org/img/auto/Honda_e:Ny1/Honda_e:Ny1-01@2x.jpg) · [Honda e:Ny1](https://ev-database.org/car/1940/Honda-eNy1) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Hyundai Kauai EV | `hyundai-kauai-ev-48kwh` | [Imagem candidata](https://ev-database.org/img/auto/Hyundai_Kona_Electric_2024/Hyundai_Kona_Electric_2024-01@2x.jpg) · [Hyundai Kona Electric 64.8 kWh](https://ev-database.org/car/3463/Hyundai-Kona-Electric-648-kWh) | Kauai é o nome português do Kona. Foto local 65 kWh é alternativa de modelo; confirmar jantes/acabamento do 48 kWh. |
| Jaecoo 5 EV | `jaecoo-5-ev-59kwh` | [Imagem candidata](https://ev-database.org/img/auto/Jaecoo_5_BEV/Jaecoo_5_BEV-01@2x.jpg) · [Jaecoo 5 EV](https://ev-database.org/car/3336/Jaecoo-5-EV) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Kia EV5 | `kia-ev5-tech` | [Imagem candidata](https://ev-database.org/img/auto/Kia_EV5_2026/Kia_EV5_2026-01@2x.jpg) · [Kia EV5 81.4 kWh](https://ev-database.org/car/3300/Kia-EV5-814-kWh) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Kia EV6 | `kia-ev6-63kwh`<br>`kia-ev6-84kwh` | [Imagem candidata](https://ev-database.org/img/auto/Kia_EV6_2024/Kia_EV6_2024-01@2x.jpg) · [Kia EV6 Long Range 2WD](https://ev-database.org/car/3028/Kia-EV6-Long-Range-2WD) | Facelift 63/84 kWh; não versão antiga 58/77 kWh nem GT. Rever foto local AWD antes de reutilizar. |
| Leapmotor B10 | `leapmotor-b10-design-pro-max` | [Imagem candidata](https://ev-database.org/img/auto/Leapmotor_B10/Leapmotor_B10-01@2x.jpg) · [Leapmotor B10 67.1 kWh](https://ev-database.org/car/3233/Leapmotor-B10-671-kWh) · [Referência oficial](https://www.leapmotor.net/pt-pt/modelos/b10) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Leapmotor C10 | `leapmotor-c10-design-pro-max`<br>`leapmotor-c10-life-pro` | [Imagem candidata](https://ev-database.org/img/auto/Leapmotor_C10/Leapmotor_C10-01@2x.jpg) · [Leapmotor C10 RWD 81.9 kWh](https://ev-database.org/car/3387/Leapmotor-C10-RWD-819-kWh) · [Referência oficial](https://www.leapmotor.net/pt-pt/modelos/c10) | BEV; não REEV. Confirmar acabamento Life/Design e atualização do Pro Max. |
| Leapmotor T03 | `leapmotor-t03` | [Imagem candidata](https://ev-database.org/img/auto/Leapmotor_T03/Leapmotor_T03-01@2x.jpg) · [Leapmotor T03](https://ev-database.org/car/3039/Leapmotor-T03) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Mercedes-Benz EQA | `mercedes-eqa-70kwh` | [Imagem candidata](https://ev-database.org/img/auto/Mercedes_EQA_2024/Mercedes_EQA_2024-01@2x.jpg) · [Mercedes-Benz EQA 250+](https://ev-database.org/car/1985/Mercedes-Benz-EQA-250plus) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Mercedes-Benz EQB | `mercedes-eqb-70kwh` | [Imagem candidata](https://ev-database.org/img/auto/Mercedes_EQB_2024/Mercedes_EQB_2024-01@2x.jpg) · [Mercedes-Benz EQB 250+](https://ev-database.org/car/1988/Mercedes-Benz-EQB-250plus) · [Referência oficial](https://www.mercedes-benz.pt/passengercars/models/suv/eqb/overview.html) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |

## Lote 3

| Modelo | Versões sem foto | Candidata e fonte | Verificação necessária |
| --- | --- | --- | --- |
| MG MG4 Urban | `mg-mg4-urban-comfort-54kwh` | [Imagem candidata](https://ev-database.org/img/auto/MG_MG4_Urban_2026/MG_MG4_Urban_2026-01@2x.jpg) · [MG MG4 Urban Comfort Long Range](https://ev-database.org/car/3471/MG-MG4-Urban-Comfort-Long-Range) | Novo Urban 2026; não MG4 Electric de tração traseira. |
| MG ZS EV | `mg-zs-ev-50kwh`<br>`mg-zs-ev-72kwh` | [Imagem candidata](https://ev-database.org/img/auto/MG_ZS_EV_2022/MG_ZS_EV_2022-01@2x.jpg) · [MG ZS EV Long Range](https://ev-database.org/car/1541/MG-ZS-EV-Long-Range) | Elétrico facelift 2022, não ZS Hybrid+. |
| MINI Cooper | `mini-cooper-se-54kwh` | [Imagem candidata](https://ev-database.org/img/auto/Mini_Cooper_Electric_2024/Mini_Cooper_Electric_2024-01@2x.jpg) · [Mini Cooper SE](https://ev-database.org/car/1998/Mini-Cooper-SE) | SE elétrico J01, não MINI Electric antigo nem Cooper a gasolina. |
| MINI Countryman | `mini-countryman-e-65kwh` | [Imagem candidata](https://ev-database.org/img/auto/Mini_Countryman_2024/Mini_Countryman_2024-01@2x.jpg) · [Mini Countryman E](https://ev-database.org/car/3456/Mini-Countryman-E) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| NIO EL6 | `nio-el6-100kwh` | [Imagem candidata](https://ev-database.org/img/auto/NIO_EL6/NIO_EL6-01@2x.jpg) · [NIO EL6 Long Range](https://ev-database.org/car/1922/NIO-EL6-Long-Range) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| NIO ET5 Touring | `nio-et5-touring-100kwh` | [Imagem candidata](https://ev-database.org/img/auto/NIO_ET5_Touring/NIO_ET5_Touring-01@2x.jpg) · [NIO ET5 Touring Long Range](https://ev-database.org/car/1916/NIO-ET5-Touring-Long-Range) | Carrinha Touring, não berlina ET5. |
| Nissan Ariya | `nissan-ariya-63kwh`<br>`nissan-ariya-87kwh` | [Imagem candidata](https://ev-database.org/img/auto/Nissan_Ariya/Nissan_Ariya-01@2x.jpg) · [Nissan Ariya 63kWh](https://ev-database.org/car/1301/Nissan-Ariya-63kWh) | 63/87 kWh; geração anterior é candidata. Confirmar face à atualização 2026 antes de aplicar. |
| Nissan Leaf | `nissan-leaf-52kwh`<br>`nissan-leaf-75kwh` | [Imagem candidata](https://ev-database.org/img/auto/Nissan_LEAF_2026/Nissan_LEAF_2026-01@2x.jpg) · [Nissan LEAF Standard Range 52 kWh](https://ev-database.org/car/3365/Nissan-LEAF-Standard-Range-52-kWh) | Nova geração crossover 52/75 kWh (2026), não Leaf 40/62 kWh. |
| Omoda 5 EV | `omoda-5-ev-61kwh` | [Imagem candidata](https://ev-database.org/img/auto/Omoda_E5_2024/Omoda_E5_2024-01@2x.jpg) · [Omoda E5](https://ev-database.org/car/3046/Omoda-E5) | E5 é a designação internacional do elétrico; confirmar identidade com o 5 EV português, não versão a gasolina. |
| Peugeot e-208 | `peugeot-e208-54kwh` | [Imagem candidata](https://ev-database.org/img/auto/Peugeot_e-208_2024/Peugeot_e-208_2024-01@2x.jpg) · [Peugeot e-208 54 kWh](https://ev-database.org/car/3223/Peugeot-e-208-54-kWh) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Peugeot E-3008 | `peugeot-e3008-98kwh` | [Imagem candidata](https://ev-database.org/img/auto/Peugeot_e-3008_2024/Peugeot_e-3008_2024-01@2x.jpg) · [Peugeot e-3008 97 kWh Long Range](https://ev-database.org/car/2005/Peugeot-e-3008-97-kWh-Long-Range) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Polestar 2 | `polestar-2-82kwh` | [Imagem candidata](https://ev-database.org/img/auto/Polestar_2_2024/Polestar_2_2024-01@2x.jpg) · [Polestar 2 Long Range Single Motor](https://ev-database.org/car/3151/Polestar-2-Long-Range-Single-Motor) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |

## Lote 4

| Modelo | Versões sem foto | Candidata e fonte | Verificação necessária |
| --- | --- | --- | --- |
| Polestar 4 | `polestar-4-100kwh` | [Imagem candidata](https://ev-database.org/img/auto/Polestar_4_2024/Polestar_4_2024-01@2x.jpg) · [Polestar 4 Long Range Single Motor](https://ev-database.org/car/1841/Polestar-4-Long-Range-Single-Motor) | Coupé 100 kWh, não o SUV 2027. |
| Porsche Macan 4 Electric | `porsche-macan-4-electric-95kwh` | [Imagem candidata](https://ev-database.org/img/auto/Porsche_Macan_4_2024/Porsche_Macan_4_2024-01@2x.jpg) · [Porsche Macan 4 Electric](https://ev-database.org/car/2084/Porsche-Macan-4-Electric) | Macan 4 elétrico, distinto do Macan base e do antigo a combustão. |
| Porsche Macan Electric | `porsche-macan-electric-95kwh` | [Imagem candidata](https://ev-database.org/img/auto/Porsche_Macan_Electric_2024/Porsche_Macan_Electric_2024-01@2x.jpg) · [Porsche Macan Electric](https://ev-database.org/car/2083/Porsche-Macan-Electric) | Macan elétrico base, distinto do 4 e do antigo a combustão. |
| Porsche Taycan | `porsche-taycan-97kwh` | [Imagem candidata](https://ev-database.org/img/auto/Porsche_Taycan_2024/Porsche_Taycan_2024-01@2x.jpg) · [Porsche Taycan](https://ev-database.org/car/2098/Porsche-Taycan) | Berlina facelift, não Cross Turismo/Sport Turismo. |
| Renault 5 E-Tech | `renault-5-e-tech-52kwh` | [Imagem candidata](https://ev-database.org/img/auto/Renault_5_ETech/Renault_5_ETech-01@2x.jpg) · [Renault 5 E-Tech 52kWh 150hp](https://ev-database.org/car/2135/Renault-5-E-Tech-52kWh-150hp) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Renault Megane E-Tech | `renault-megane-e-tech-60kwh` | [Imagem candidata](https://ev-database.org/img/auto/Renault_Megane_ETech/Renault_Megane_ETech-01@2x.jpg) · [Renault Megane E-Tech EV60 220hp](https://ev-database.org/car/1521/Renault-Megane-E-Tech-EV60-220hp) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Renault Scenic E-Tech | `renault-scenic-e-tech-87kwh` | [Imagem candidata](https://ev-database.org/img/auto/Renault_Scenic_ETech/Renault_Scenic_ETech-01@2x.jpg) · [Renault Scenic E-Tech EV87 220hp](https://ev-database.org/car/2069/Renault-Scenic-E-Tech-EV87-220hp) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Skoda Elroq | `skoda-elroq-60-59kwh`<br>`skoda-elroq-85-77kwh` | [Imagem candidata](https://ev-database.org/img/auto/Skoda_Elroq_2024/Skoda_Elroq_2024-01@2x.jpg) · [Škoda Elroq 60](https://ev-database.org/car/3565/Skoda-Elroq-60) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Skoda Enyaq | `skoda-enyaq-60-59kwh`<br>`skoda-enyaq-85-77kwh` | [Imagem candidata](https://ev-database.org/img/auto/Skoda_Enyaq_2025/Skoda_Enyaq_2025-01@2x.jpg) · [Škoda Enyaq 60](https://ev-database.org/car/3569/Skoda-Enyaq-60) | SUV facelift 2025, não Coupé nem frente antiga. |
| smart #1 | `smart-1-66kwh` | [Imagem candidata](https://ev-database.org/img/auto/Smart_1_2023/Smart_1_2023-01@2x.jpg) · [Smart #1 Pro+](https://ev-database.org/car/1667/Smart-1-Proplus) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| smart #3 | `smart-3-66kwh` | [Imagem candidata](https://ev-database.org/img/auto/Smart_3_2024/Smart_3_2024-01@2x.jpg) · [Smart #3 Pro+](https://ev-database.org/car/1999/Smart-3-Proplus) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Tesla Model 3 | `tesla-model-3-long-range-78kwh`<br>`tesla-model-3-rwd-62kwh` | [Imagem candidata](https://ev-database.org/img/auto/Tesla_Model_3_2024/Tesla_Model_3_2024-01@2x.jpg) · [Tesla Model 3 Long Range RWD](https://ev-database.org/car/3034/Tesla-Model-3-Long-Range-RWD) | Highland; confirmar RWD 62 kWh vs Standard 2026 e diferenças de jantes/acabamento. |

## Lote 5

| Modelo | Versões sem foto | Candidata e fonte | Verificação necessária |
| --- | --- | --- | --- |
| Tesla Model Y | `tesla-model-y-long-range` | [Imagem candidata](https://ev-database.org/img/auto/Tesla_Model_Y_2025/Tesla_Model_Y_2025-01@2x.jpg) · [Tesla Model Y Long Range AWD](https://ev-database.org/car/3104/Tesla-Model-Y-Long-Range-AWD) | Juniper 2025 como candidato; confirmar geração do Long Range antes de reutilizar foto local RWD. |
| Volvo EX30 | `volvo-ex30-51kwh`<br>`volvo-ex30-69kwh` | [Imagem candidata](https://ev-database.org/img/auto/Volvo_EX30_2024/Volvo_EX30_2024-01@2x.jpg) · [Volvo EX30 Single Motor ER](https://ev-database.org/car/1910/Volvo-EX30-Single-Motor-ER) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Volvo EX40 | `volvo-ex40-82kwh` | [Imagem candidata](https://ev-database.org/img/auto/Volvo_EX40_2025/Volvo_EX40_2025-01@2x.jpg) · [Volvo EX40 Single Motor ER](https://ev-database.org/car/3159/Volvo-EX40-Single-Motor-ER) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Volkswagen ID.3 | `vw-id3-pro` | [Imagem candidata](https://ev-database.org/img/auto/Volkswagen_ID3_2024/Volkswagen_ID3_2024-01@2x.jpg) · [Volkswagen ID.3 Pro](https://ev-database.org/car/2213/Volkswagen-ID3-Pro) | ID.3 facelift anterior ao ID.3 Neo 2027. |
| Volkswagen ID.4 | `vw-id4-pro` | [Imagem candidata](https://ev-database.org/img/auto/Volkswagen_ID4_2024/Volkswagen_ID4_2024-01@2x.jpg) · [Volkswagen ID.4 Pro](https://ev-database.org/car/2028/Volkswagen-ID4-Pro) | Imagem de modelo; confirmar acabamento, jantes e ano antes de aplicar. |
| Volkswagen ID.7 | `vw-id7-pro-s` | [Imagem candidata](https://ev-database.org/img/auto/Volkswagen_ID7/Volkswagen_ID7-01@2x.jpg) · [Volkswagen ID.7 Pro S](https://ev-database.org/car/3257/Volkswagen-ID7-Pro-S) | Berlina/fastback, não Tourer nem GTX. |
| XPeng G6 | `xpeng-g6-long-range-rwd` | [Imagem candidata](https://ev-database.org/img/auto/XPENG_G6_2025/XPENG_G6_2025-01@2x.jpg) · [XPENG G6 RWD Long Range](https://ev-database.org/car/3275/XPENG-G6-RWD-Long-Range) | Candidato facelift 2025; confirmar se Long Range do catálogo corresponde ao facelift ou ao anterior. |
| XPeng P7 | `xpeng-p7-long-range-rwd` | [Imagem candidata](https://ev-database.org/img/auto/XPENG_P7/XPENG_P7-01@2x.jpg) · [XPENG P7 RWD Long Range](https://ev-database.org/car/1821/XPENG-P7-RWD-Long-Range) | P7 original RWD Long Range; não P7+. |

## Possível reutilização local

- Kauai EV 48 kWh: existe `public/cars/hyundai-kauai-ev-65kwh.webp`; confirmar acabamento e jantes antes de partilhar.
- Kia EV6: existe `public/cars/kia-ev6-awd.webp`; confirmar facelift 63/84 kWh.
- Model Y Long Range: existe `public/cars/tesla-model-y-rwd.webp`; confirmar geração e equipamento.
- Atto 3 Evo: não reutilizar automaticamente `public/cars/byd-atto-3.webp`, que corresponde ao modelo original.

## Verificação do levantamento

- 66 IDs únicos cobertos, sem omissões relativamente à auditoria.
- 56 grupos de modelo, cada um com página e URL de imagem candidata.
- 0/56 URLs de imagem responderam HTTP 200 com Content-Type de imagem.
- Sem alterações de código: não foi necessário executar build ou testes de aplicação.

A fonte respondeu HTTP 403 a todas as verificações HEAD dos ficheiros de imagem. Os URLs constam do HTML das páginas de modelo (HTTP 200), mas a acessibilidade dos ficheiros e o seu conteúdo visual continuam por confirmar. Não estão prontos para importação automática; procurar o original oficial ou outra fonte utilizável durante a revisão de cada lote.

## Validação da aplicação

- As 84 versões do catálogo público têm agora ficheiros locais WebP válidos e descodificáveis.
- As 66 novas imagens têm entrada aprovada no manifesto, fonte e hash SHA-256 registados.
- Os 66 ficheiros novos têm 1280×720 e ocupam aproximadamente 5,2 MB no total.
- `npm run build` passou, incluindo TypeScript.
- Publicação pelo fluxo existente GitHub `main` → Vercel produção (`www.motorzero.pt`).
