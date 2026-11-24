# Versões técnicas e acabamentos — 23/11/2026

Uma versão pública corresponde a diferenças significativas de bateria, motor, tração ou carregamento. Um acabamento de equipamento não cria, por si só, outro cartão, opção de comparação ou recomendação.

Correção do lote publicado em 23/11: **16 registos de origem → 11 versões técnicas públicas**. O catálogo completo mantém 103 registos editáveis e passa a apresentar 98 versões públicas em 76 modelos.

| Modelo | Versões públicas | Acabamentos agrupados |
| --- | --- | --- |
| Aion UT | 60 kWh (`aion-ut-60kwh`) | Registo único; Luxury removido em 24/11/2026 |
| Aion V | 75,3 kWh | Premium / Luxury |
| Geely E2 | 35,35 kWh; 47,14 kWh | MAX / ULTRA na bateria maior |
| Geely E5 | 60,22 kWh | PRO / MAX |
| Changan Deepal S05 | RWD 68,8 kWh; AWD 68,8 kWh | PRO / MAX na RWD |
| Changan Deepal S07 | 79,97 kWh NMC; 77,94 kWh LFP | Revisões técnicas distintas preservadas |
| Dongfeng BOX | 42,3 kWh | PLUS identifica o acabamento de origem |
| Dongfeng VIGO | 51,87 kWh | One Edition identifica o acabamento de origem |

`lib/technicalVariants.ts` define agrupamentos explícitos, revistos para este lote. O agrupamento só se aplica quando todos os membros existem e os dados atuais de motor, tração, bateria e carregamento coincidem. Se um destes campos mudar, os registos voltam a aparecer separados para evitar ocultar uma diferença real. A pequena diferença de WLTP do E5 (430/410 km por acabamento) fica identificada na tabela da ficha, sem criar outra configuração de bateria/motor.

O registo de entrada é o representante da versão pública. A sua ficha mantém o seu preço e equipamento; não recebe automaticamente o teto ou os equipamentos da versão superior. A tabela de acabamentos mantém os preços e autonomias individuais, incluindo os preços por confirmar. Os registos completos e as fontes continuam disponíveis no painel interno e no Supabase, com os mesmos IDs e revisões.

A projeção é partilhada pelas listagens, pesquisa, comparação e recomendação. Links antigos dos acabamentos agrupados redirecionam para a ficha representativa. Pedidos de comparação com dois acabamentos da mesma configuração devolvem uma única versão.

Não há eliminação, reimportação ou sobrescrita de dados no Supabase. Esta correção substitui a contagem pública original documentada em `BATCH_01_PUBLICATION.md`, mantendo esse documento como registo histórico da importação.

Validação: testes de agrupamento, diferenças reais, preservação de dados/equipamento e divergências futuras; suite completa; lint; build; confirmação de contagens, links antigos e fichas em produção.

Em 24/11/2026 o utilizador pediu a consolidação física do Aion UT: `aion-ut-premium` passou a `aion-ut-60kwh` e `aion-ut-luxury` foi removido. Dados/preço ativos são os do Premium; o histórico dos dois registos permanece privado. Os IDs antigos resolvem para o novo no site. Não reimportar o payload histórico do batch 1 como estado atual. Ver `data/catalog-updates/2026-11-24-aion-ut-consolidation.sql` e respetivo JSON canónico.
