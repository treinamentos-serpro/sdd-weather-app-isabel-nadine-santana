# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa deseja uma aplicação de previsão do tempo para que usuários consultem as condições atuais e a previsão de cidades de seu interesse. A experiência deve funcionar também em dispositivos móveis e permitir a alternância entre Celsius e Fahrenheit.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** A escolha elimina a necessidade de gerenciar uma chave de API para a integração. Resolve qual provedor será usado; cobertura, limites de uso e requisitos de atribuição ainda precisam ser confirmados.
- **Período da previsão: hoje mais os quatro dias seguintes.** Isso define quais cinco dias compõem a previsão e confirma que o dia atual está incluído. A granularidade (diária ou por hora) e o fuso usado para determinar o dia ainda estão em aberto.
- **Unidade padrão: Celsius.** Define a unidade inicial, mantendo a alternância para Fahrenheit prevista nos requisitos. Não define se a escolha do usuário será lembrada localmente entre visitas.
- **Sem autenticação e sem persistência de servidor.** O app não terá contas nem armazenará preferências ou dados do usuário em servidor. Resolve as dúvidas sobre login e persistência no servidor; persistência local no navegador ainda não foi decidida.
- **Idioma da interface: pt-BR.** Define o idioma da UI para o lançamento. Não define a região de cobertura nem eventuais necessidades de internacionalização futura.

## Requisitos Funcionais

- Permitir buscar cidades por nome.
- Exibir o clima atual da cidade selecionada.
- Exibir a previsão para os próximos cinco dias.
- Permitir alternar a unidade de temperatura entre Celsius e Fahrenheit.
- Quando não for possível obter os dados meteorológicos, exibir uma mensagem compreensível e permitir que o usuário tente novamente.
- Informar a data e o horário de referência dos dados meteorológicos exibidos.

## Requisitos Não-Funcionais

- **Responsividade:** a interface deve funcionar em larguras de tela de 320 px a 1440 px, sem rolagem horizontal e sem perda de conteúdo ou funcionalidade.
- **Usabilidade:** busca, consulta e troca de unidade devem ser simples e claras; os critérios de validação deverão ser definidos durante a especificação.
- **Desempenho:** em condições normais de rede, os resultados da busca devem ser apresentados em até 2 segundos no percentil 95, sem considerar atrasos da API externa. Durante a espera, a interface deve permanecer responsiva e indicar carregamento.
- **Disponibilidade e resiliência:** a meta inicial é disponibilidade mensal de 99,5% para a aplicação. A falha da fonte externa não deve bloquear a interface nem impedir a apresentação de uma mensagem de erro e da opção de nova tentativa.
- **Acessibilidade:** atender ao WCAG 2.2 nível AA, incluindo operação por teclado, foco visível, contraste adequado e nomes acessíveis para controles.
- **Compatibilidade:** suportar versões atuais e anteriores dos principais navegadores desktop e móveis; a lista de navegadores e versões deverá ser definida antes do lançamento.
- **Atualidade dos dados:** os dados exibidos não devem ultrapassar a idade máxima definida para o produto; esse limite ainda precisa ser acordado com a equipe de negócio e a fonte meteorológica.

> As metas numéricas e os padrões acima são critérios iniciais para validação, não compromissos de serviço já aprovados.

## Riscos

- A busca pode retornar cidades homônimas ou resultados imprecisos sem contexto como país ou região.
- A fonte de dados pode estar indisponível, atrasar ou não oferecer cobertura para algumas localidades.
- “Previsão de 5 dias” pode ser interpretada como dados diários ou previsões em intervalos menores ao longo desses dias.
- Diferenças de fuso horário podem causar divergências na apresentação de datas e horários.
- A experiência móvel pode ficar limitada se a interface não for validada em telas pequenas e diferentes navegadores.

## Perguntas em Aberto

- A busca deve aceitar apenas o nome da cidade ou também país, estado/região e localização atual?
- Como o usuário deve escolher entre cidades com o mesmo nome?
- A previsão de hoje mais os quatro dias seguintes deve mostrar um resumo diário ou informações por hora?
- Quais dados devem aparecer junto à temperatura, como sensação térmica, umidade, vento e condições do céu?
- A escolha de Fahrenheit deve ser mantida entre visitas no próprio dispositivo, apesar de não haver persistência de servidor?
- Quais regiões terão cobertura no lançamento? Há necessidade de outros idiomas no futuro?
- As metas propostas de desempenho (2 segundos no percentil 95), disponibilidade (99,5% mensal) e responsividade (320 px a 1440 px) são adequadas?
- Qual idade máxima dos dados meteorológicos é aceitável?
- Quais navegadores e versões precisam ser suportados?
- O WCAG 2.2 nível AA é o padrão de acessibilidade esperado?
- Quais são os limites de uso, a cobertura e os requisitos de atribuição do Open-Meteo?

## Suposições

- A aplicação consultará o Open-Meteo como fonte externa de dados meteorológicos.
- O usuário selecionará uma cidade antes de visualizar as condições; a localização atual não é obrigatória.
- Celsius será a unidade inicial, e a alternância para Fahrenheit afetará o clima atual e a previsão.
- O período de previsão incluirá hoje e os quatro dias seguintes; a granularidade e o fuso ainda serão definidos.
- O suporte a dispositivos móveis implica interface responsiva em navegadores móveis, não necessariamente um aplicativo nativo.
- A busca e os dados meteorológicos dependem de conexão com a internet.
