# Publicação Firefly — 22/11/2026

Uma única configuração de entrada, com nome público **Firefly**. ID da versão `firefly`, família existente `firefly-firefly`; marca/modelo mantêm os campos separados e a apresentação elimina a repetição. Não são criadas versões Select/Comfort, nem se infere ano-modelo da data da pesquisa.

Dados: 120 kW, RWD, bateria útil 41,2 kWh, 330 km WLTP combinado, DC 100 kW, 29 min de 10–80%, V2L. Sem bomba de calor por confirmação explícita do utilizador. Fotografias representativas de cor/equipamento; não garantem acabamento ou cor contratual.

AC: 7 kW monofásico ou 11 kW trifásico, consoante configuração do carregador de bordo. Foram acrescentados os campos opcionais `charging.acSinglePhaseKW` e `charging.acThreePhaseKW`, com apresentação condicional em PT/EN/ES. `acMaxChargeKW` fica ausente nesta versão para não garantir 11 kW em todas as unidades. A potência usa `core.motorPowerKW`. Estes campos são validados e editáveis no painel; as estruturas JSONB existentes não exigem alteração do esquema SQL. O campo existente `charge10to80Min` passa a ser mostrado na ficha quando disponível.

PVP: 30.900 € com impostos, tabela portuguesa do Guia do Automóvel revista em 09/11/2026; sem pintura, opções, transporte, matrícula ou averbamento. É uma referência de tabela secundária introduzida manualmente, com confiança média e fonte pública, não uma campanha nem um orçamento chave na mão.

Fontes:

- [Firefly Portugal — produto e carregamento](https://fireflyportugal.pt/o-nosso-carro/): potência atual, RWD, DC, opções AC, intervalo de carga, V2L e volumes de bagageira.
- [Guia do Automóvel — preços](https://www.guiadoautomovel.pt/marcas/firefly/firefly/precos): PVP da configuração de entrada, IVA/impostos, exclusões, WLTP e cotas; não importar a segunda linha, cuja designação está duplicada.
- [Ensaio português](https://4gnews.pt/nio-firefly-ensaio/) e ficha europeia do fabricante, referenciados no dossiê do lote: bateria útil e restantes dimensões.
- Confirmação do utilizador em 22/11/2026: ausência de bomba de calor.

Ficheiros: `data/catalog-updates/2026-11-22-firefly.json`, `public/cars/firefly.webp`, `data/model-media.json`. A fotografia é servida como asset do site e o respetivo caminho é gravado no registo Supabase. Não são necessárias novas permissões, chaves ou buckets.

Ordem de publicação: validar lote → deploy de código/assets por GitHub/Vercel → importar através de `catalog_save` no projeto MotorZero → comparar catálogo remoto completo com os dados canónicos → verificar APIs, página e fotografia em produção. Antes da importação: 86 versões; após a importação esperam-se 87 versões e apenas uma versão na família Firefly.

Validação antes da publicação: 68 testes passaram, lint dos ficheiros alterados passou, build de produção passou e o importador validou uma adição sem escrever na base de dados.
