# Acesso ao painel MotorZero

Painel: https://www.motorzero.pt/internal/vehicles

Firefly: https://www.motorzero.pt/internal/vehicles/firefly/edit

O formulário de entrada usa `INTERNAL_AUTH_USERNAME` e `INTERNAL_AUTH_PASSWORD`, configurados como variáveis privadas do projeto Vercel `ev-ownership-platform`. O acesso ao painel é independente do login de administração do Supabase ou da Vercel.

Em 22/11/2026, o proprietário autorizou repor o utilizador `admin` e a palavra-passe existente no seu `.env.local`. Os dois valores foram atualizados diretamente nas variáveis Secret existentes, mantendo o âmbito partilhado production/preview. A palavra-passe não é documentada nem incluída no Git. O `.env.local` é ignorado pelo Git; alterar esse ficheiro não atualiza as variáveis Vercel automaticamente.

É necessário um novo deploy para aplicar alterações às credenciais. A reposição foi iniciada pelo redeploy `dpl_GbByMvmfd7ureDsP5HUx4EHTMNDa`. Para futuras reposições, atualizar os valores sem remover previamente as variáveis de produção. Não tentar recuperar valores Secret ocultos nem copiar palavras-passe para issues, commits ou conversas.

Para editar um carro:

1. Entrar no painel com o utilizador e a palavra-passe de administração.
2. Selecionar o veículo e abrir Edit.
3. Alterar os campos, corrigir os itens em Required before save e carregar em Save changes.
4. Aguardar Saved successfully e atualizar a ficha pública para confirmar.

Com `VEHICLE_DATA_SOURCE=supabase`, as edições de veículos são gravadas diretamente no Supabase e não precisam de novo deploy. O controlo de revisão recusa guardar por cima de alterações concorrentes. Fotografias e ficheiros do site mantêm o respetivo fluxo de publicação de assets.

## Verificação da reposição — 22/11/2026

O redeploy ficou READY em produção, com os domínios MotorZero atribuídos. O login com as credenciais locais aprovadas devolveu HTTP 200 e cookie de sessão. O editor Firefly abriu com HTTP 200 após o redirecionamento normal para `/pt/internal/veiculos/firefly/edit`, com o botão Save changes presente. O endpoint interno sem autenticação continuou a devolver HTTP 401. Nenhum dado de veículo foi alterado durante o teste e nenhum valor de palavra-passe ou cookie foi incluído nesta documentação.
