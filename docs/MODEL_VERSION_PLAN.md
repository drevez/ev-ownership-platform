# Modelos preparados e proposta de versões — 22/11/2026

Foram criados no Supabase **130 registos de modelo** em **44 marcas**, com **271 propostas de seleção de versões**. Destas, **28** têm designação ou bateria mencionada numa fonte oficial (17 modelos); **243** são hipóteses de seleção a validar, não versões comerciais confirmadas. Todas ficam fora da publicação nesta fase.

## O que é criado no Supabase

Apenas as famílias na tabela existente `vehicle_models` (slug, marca, nome). Não é necessário alterar o esquema. Não há uma coluna de estado `draft`: são famílias sem versões publicadas. Os endpoints públicos da aplicação constroem os modelos a partir de `vehicle_variants`, portanto estas famílias não aparecem automaticamente nas listagens, recomendações ou comparações. A tabela de famílias continua legível pelas permissões públicas que já existiam; nomes de modelo não são informação privada. Notas e propostas ficam nos ficheiros de trabalho do projeto, sem criação de variantes fictícias.

O seed é transacional e idempotente, verifica colisões de identidade e não altera modelos já existentes, variantes, ofertas, RLS ou permissões. A confirmação remota está no relatório de execução JSON.

## Regra de seleção de versões

1. Primeira versão: a configuração BEV portuguesa de entrada, com preço para particulares e IVA devidamente identificados.
2. Segunda versão: maior autonomia quando exista outra bateria/configuração relevante.
3. AWD/desportiva: só quando justifique a comparação e esteja oficialmente disponível; fase posterior por defeito.
4. Acabamentos: separar apenas se alterarem equipamento material, como bomba de calor, ADAS, bancos, V2L ou teto; não duplicar por cor/jante isolada.
5. MPV: confirmar bateria, comprimento e lotação de passageiros; excluir Cargo/Van de carga.

As capacidades anunciadas nas propostas não são automaticamente classificadas como brutas ou úteis. Designações de fontes antigas ou campanhas não comprovam oferta atual: confirmar o ano e o configurador português. Valores em falta continuam vazios. Nenhuma proposta recebe preço ou ano inventado.

## Proposta para todos os modelos

| Modelo | Slug | Versões a trabalhar primeiro | Estado |
| --- | --- | --- | --- |
| Aion UT | `aion-ut` | Premium 60 kWh<br>Luxury 60 kWh | Fonte encontrada; validar oferta atual |
| Aion V | `aion-v` | Premium<br>Luxury | Fonte encontrada; validar oferta atual |
| Geely E2 | `geely-e2` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Geely E5 | `geely-e5` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Changan Deepal S05 | `changan-deepal-s05` | BEV RWD PRO | Fonte encontrada; validar oferta atual |
| Changan Deepal S07 | `changan-deepal-s07` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Dongfeng BOX | `dongfeng-box` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Dongfeng VIGO | `dongfeng-vigo` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Forthing Friday EV | `forthing-friday-ev` | EV 64.4 kWh | Fonte encontrada; validar oferta atual |
| Forthing S7 EV | `forthing-s7-ev` | EV 56.8 kWh | Fonte encontrada; validar oferta atual |
| Firefly | `firefly-firefly` | Firefly — única configuração de entrada, sem acabamento no nome público | Fonte encontrada; validar AC/potência PT |
| Voyah Courage | `voyah-courage` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Voyah Free | `voyah-free` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Voyah Dream | `voyah-dream` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Zeekr X | `zeekr-x` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Zeekr 001 | `zeekr-001` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Zeekr 7X | `zeekr-7x` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Zeekr 7GT | `zeekr-7gt` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| BYD ATTO 2 | `byd-atto-2` | Active BEV<br>Boost BEV | Fonte encontrada; validar oferta atual |
| BYD SEAL U | `byd-seal-u` | Comfort BEV<br>Design BEV | Fonte encontrada; validar oferta atual |
| BYD SEALION 7 | `byd-sealion-7` | Comfort RWD<br>Excellence AWD | Fonte encontrada; validar oferta atual |
| MG MG4 EV | `mg-mg4-ev` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| MG MGS5 EV | `mg-mgs5-ev` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| MG MGS6 EV | `mg-mgs6-ev` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| MG Cyberster | `mg-cyberster` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| NIO ET5 | `nio-et5` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| XPeng G9 | `xpeng-g9` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| XPeng P7+ | `xpeng-p7-plus` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| XPeng L03 EV | `xpeng-l03-ev` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Dacia Spring | `dacia-spring` | electric 70<br>electric 100 | Fonte encontrada; validar oferta atual |
| Renault Twingo E-Tech | `renault-twingo-e-tech` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Renault 4 E-Tech | `renault-4-e-tech` | 40 kWh — acabamento a confirmar<br>52 kWh — acabamento a confirmar | Fonte encontrada; validar oferta atual |
| Hyundai INSTER | `hyundai-inster` | 42 kWh — acabamento a confirmar<br>49 kWh — acabamento a confirmar | Fonte encontrada; validar oferta atual |
| Hyundai IONIQ 3 | `hyundai-ioniq-3` | Trend Standard Range 42.2 kWh<br>Trend Long Range 61 kWh<br>N Line Long Range 61 kWh | Fonte encontrada; validar oferta atual |
| Kia EV2 | `kia-ev2` | Urban 42.2 kWh | Fonte encontrada; validar oferta atual |
| Kia EV4 | `kia-ev4` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Kia EV4 Fastback | `kia-ev4-fastback` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Nissan Micra | `nissan-micra` | 40 kWh 2WD — acabamento a confirmar<br>52 kWh 2WD — acabamento a confirmar | Fonte encontrada; validar oferta atual |
| Fiat Grande Panda Electric | `fiat-grande-panda-electric` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Opel Corsa Electric | `opel-corsa-electric` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Ford Puma Gen-E | `ford-puma-gen-e` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Cupra Raval | `cupra-raval` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Volkswagen ID. Polo | `volkswagen-id-polo` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Skoda Epiq | `skoda-epiq` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Fiat 500e | `fiat-500e` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Fiat 600e | `fiat-600e` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Opel Mokka Electric | `opel-mokka-electric` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Opel Astra Electric | `opel-astra-electric` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Opel Astra Sports Tourer Electric | `opel-astra-sports-tourer-electric` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Opel Frontera Electric | `opel-frontera-electric` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Opel Grandland Electric | `opel-grandland-electric` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Peugeot E-2008 | `peugeot-e-2008` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Peugeot E-308 | `peugeot-e-308` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Peugeot E-308 SW | `peugeot-e-308-sw` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Peugeot E-408 | `peugeot-e-408` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Peugeot E-5008 | `peugeot-e-5008` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Citroen e-C4 X | `citroen-e-c4-x` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Citroen e-C5 Aircross | `citroen-e-c5-aircross` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Ford Mustang Mach-E | `ford-mustang-mach-e` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Toyota bZ4X | `toyota-bz4x` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Toyota C-HR+ | `toyota-c-hr-plus` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Toyota bZ4X Touring | `toyota-bz4x-touring` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Kia EV9 | `kia-ev9` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Kia PV5 Passenger | `kia-pv5-passenger` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Hyundai IONIQ 9 | `hyundai-ioniq-9` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Mazda 6e | `mazda-6e` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Mazda CX-6e | `mazda-cx-6e` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| MINI Aceman | `mini-aceman` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| smart #5 | `smart-5` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| DS Automobiles DS 3 E-Tense | `ds-automobiles-ds-3-e-tense` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| DS Automobiles N°4 E-Tense | `ds-automobiles-n-4-e-tense` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| DS Automobiles N°7 E-Tense | `ds-automobiles-n-7-e-tense` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Jeep Avenger Electric | `jeep-avenger-electric` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Jeep Compass Electric | `jeep-compass-electric` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Audi A6 Sportback e-tron | `audi-a6-sportback-e-tron` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Audi A6 Avant e-tron | `audi-a6-avant-e-tron` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Audi Q6 e-tron | `audi-q6-e-tron` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Audi Q6 Sportback e-tron | `audi-q6-sportback-e-tron` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Audi e-tron GT | `audi-e-tron-gt` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| BMW i3 Neue Klasse | `bmw-i3-neue-klasse` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| BMW iX3 Neue Klasse | `bmw-ix3-neue-klasse` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| BMW i5 | `bmw-i5` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| BMW i5 Touring | `bmw-i5-touring` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| BMW i7 | `bmw-i7` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| BMW iX | `bmw-ix` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Volvo EX60 | `volvo-ex60` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Volvo EX90 | `volvo-ex90` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Volvo ES90 | `volvo-es90` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Polestar 3 | `polestar-3` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Polestar 5 | `polestar-5` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Polestar 4 SUV | `polestar-4-suv` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Suzuki e Vitara | `suzuki-e-vitara` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Alpine A390 | `alpine-a390` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Abarth 500e | `abarth-500e` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Abarth 600e | `abarth-600e` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Lexus RZ | `lexus-rz` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Volkswagen ID.7 Tourer | `volkswagen-id-7-tourer` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Volkswagen ID. Buzz | `volkswagen-id-buzz` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Skoda Enyaq Coupé | `skoda-enyaq-coupe` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz CLA Electric | `mercedes-benz-cla-electric` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz CLA Shooting Brake Electric | `mercedes-benz-cla-shooting-brake-electric` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz GLB Electric | `mercedes-benz-glb-electric` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz GLC Electric | `mercedes-benz-glc-electric` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz EQS | `mercedes-benz-eqs` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz G 580 EQ | `mercedes-benz-g-580-eq` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| KGM Torres EVX | `kgm-torres-evx` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Mitsubishi Eclipse Cross EV | `mitsubishi-eclipse-cross-ev` | BEV de entrada — bateria/tração/acabamento a confirmar<br>BEV de maior autonomia — apenas se existir versão distinta em Portugal | Hipótese de seleção; mapear configurador |
| Maserati Grecale Folgore | `maserati-grecale-folgore` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Maserati GranTurismo Folgore | `maserati-granturismo-folgore` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Maserati GranCabrio Folgore | `maserati-grancabrio-folgore` | BEV de entrada — motorização e acabamento oficiais a confirmar | Hipótese de seleção; mapear configurador |
| Porsche Taycan Sport Turismo | `porsche-taycan-sport-turismo` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Porsche Taycan Cross Turismo | `porsche-taycan-cross-turismo` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz EQV | `mercedes-benz-eqv` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz EQT | `mercedes-benz-eqt` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz EQE | `mercedes-benz-eqe` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz EQE SUV | `mercedes-benz-eqe-suv` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz EQS SUV | `mercedes-benz-eqs-suv` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Mercedes-Benz GLA Electric | `mercedes-benz-gla-electric` | BEV de entrada — bateria e tração oficiais a confirmar<br>BEV de maior autonomia — apenas se a oferta portuguesa o confirmar<br>BEV AWD — apenas se distinto e oferecido em Portugal | Hipótese de seleção; mapear configurador |
| Ford E-Tourneo Courier | `ford-e-tourneo-courier` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Ford E-Tourneo Custom | `ford-e-tourneo-custom` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Citroen e-Berlingo | `citroen-e-berlingo` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Citroen e-SpaceTourer | `citroen-e-spacetourer` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Peugeot E-Rifter | `peugeot-e-rifter` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Peugeot E-Traveller | `peugeot-e-traveller` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Opel Combo Electric | `opel-combo-electric` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Opel Zafira Electric | `opel-zafira-electric` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Toyota Proace City Verso Electric | `toyota-proace-city-verso-electric` | Exclusive Electric 50 kWh | Fonte encontrada; validar oferta atual |
| Toyota Proace Verso Electric | `toyota-proace-verso-electric` | Electric 50 kWh — acabamento e comprimento a confirmar | Fonte encontrada; validar oferta atual |
| Fiat E-Ulysse | `fiat-e-ulysse` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |
| Renault Kangoo E-Tech Electric | `renault-kangoo-e-tech-electric` | Passageiros BEV — bateria de entrada e menor lotação adequada<br>Passageiros BEV — maior bateria/lotação, se existir em Portugal | Hipótese de seleção; mapear configurador |

## Execução em lotes

Criar todas as famílias numa única transação; depois fechar versões em lotes de 8–12 modelos, começando pelos P1 e novas marcas chinesas. O lote de publicação deve incluir fotografia, dados técnicos e preço/estado comercial revistos antes de importar versões. Nunca converter automaticamente estas hipóteses em `vehicle_variants`.

Ficheiros: [plano estruturado](../data/internal/model-creation-plan-2026-11-22.json), [seed de famílias](../supabase/seeds/20261122_model_families.sql), [levantamento](MODEL_EXPANSION_RESEARCH.md) e [critérios BEV](BEV_ONLY_CATALOG_AUDIT.md).

## Resultado da execução

Criação aplicada e verificada no MotorZero em 22/11/2026: **130/130 famílias correspondem ao plano**. Total de famílias na base de dados: **197**, das quais **130 sem versões**. Permanecem **86 versões e 135 ofertas**. O fingerprint canónico do catálogo público é idêntico antes e depois da operação.

A primeira tentativa foi integralmente recusada por colisão entre P7 e P7+; não gravou famílias. A normalização partilhada passou a preservar `+` como `plus` (P7+ → `xpeng-p7-plus`, C-HR+ → `toyota-c-hr-plus`). Os 67 URLs atuais mantêm os identificadores, cobertos por teste. A segunda execução criou as famílias numa só transação.

Validação: 64 testes passaram, incluindo repetição idempotente, recusa transacional de colisões, preservação do P7 existente e dos URLs públicos. Lint dos ficheiros alterados e build de produção passaram.

## Pesquisa detalhada do primeiro lote

Em 22/11/2026 foram identificadas 18 configurações para os nove primeiros modelos, com fontes, preços condicionais, divergências e fotos preparadas. Ver [levantamento do lote 1](MODEL_EXPANSION_BATCH_01.md). Estes registos ainda não foram importados como variantes; os totais de propostas acima descrevem o plano inicial, não o resultado desta pesquisa.

Revisão atual: [coerência e pendências por modelo](MODEL_EXPANSION_BATCH_01_COHESION.md). O plano foi atualizado para uma única proposta Firefly por indicação do utilizador.
