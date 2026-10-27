# Especificação de Produto: Weather App

## Overview

O Weather App é uma aplicação web responsiva, em português do Brasil, para consultar as condições meteorológicas atuais e a previsão de cinco dias de uma cidade escolhida pelo usuário. A aplicação usa o Open-Meteo como fonte de dados, inicia em Celsius e permite alternar para Fahrenheit. Não exige conta.

**Objetivos do produto**

- Permitir que uma pessoa encontre e selecione uma cidade pelo nome.
- Apresentar condições atuais e a previsão para hoje e os quatro dias seguintes.
- Tornar claros a unidade de temperatura e o horário de referência dos dados.
- Manter a consulta utilizável em telas móveis e diante de falhas da fonte externa.

## Functional Requirements

- **FR-01 — Buscar cidades:** Aceitar nome de cidade, opcionalmente acompanhado de região administrativa ou país; preservar acentos, espaços internos, hífens e apóstrofos; remover espaços no início e no fim; mostrar cidade, região e país retornados; exigir seleção explícita antes da consulta meteorológica. Se região e país estiverem ausentes, exibir coordenadas quando fornecidas ou “Localização não informada”; nunca selecionar automaticamente.
- **FR-02 — Consultar condições atuais:** Após a seleção, exibir cidade, temperatura atual fornecida pelo modelo meteorológico e descrição textual localizada da condição. Mapear todos os códigos WMO suportados pelo Open-Meteo para rótulos em pt-BR, conforme a descrição oficial do código; códigos desconhecidos devem aparecer como “Condição indisponível”, sem ocultar temperaturas válidas. Cada temperatura deve ter unidade explícita; dados ausentes devem ser identificados como indisponíveis. Não apresentar estimativas do provedor como observações locais medidas. Em consultas concorrentes, somente dados da cidade selecionada mais recentemente podem atualizar a tela.
- **FR-03 — Consultar previsão:** Exibir cinco resumos diários consecutivos, começando pela data local atual da cidade. Cada resumo deve incluir condição textual e temperaturas mínima e máxima. Aplicar o mesmo mapeamento WMO para rótulos em pt-BR. Se um campo não vier na resposta, identificá-lo como indisponível sem ocultar os demais dias; códigos desconhecidos devem aparecer como “Condição indisponível”.
- **FR-04 — Alternar unidade:** Iniciar em Celsius e permitir alternância reversível para Fahrenheit; aplicar a unidade a todas as temperaturas atuais, mínimas e máximas previstas. Exibir no máximo uma casa decimal, arredondada ao décimo mais próximo e sem zeros decimais finais. A escolha vale até a página ser recarregada; após recarga, voltar a Celsius.
- **FR-05 — Recuperar de falhas:** Distinguir busca sem resultados de falha do serviço. Em erro ou timeout de busca/meteorologia, informar a etapa que falhou, encerrar o carregamento e oferecer nova tentativa manual sem recarregar a página. O timeout de cada solicitação é de 10 segundos.
- **FR-06 — Informar referência temporal:** Exibir o timestamp de referência retornado junto às condições atuais, convertido para o fuso local da cidade e acompanhado do identificador/fuso UTC do provedor. Usar o rótulo “Dados referentes a”; não substituir o timestamp pela hora em que a página recebeu a resposta.

## User Stories

O discovery não define personas formais. As stories abaixo usam perfis situacionais derivados dos comportamentos e necessidades descritos, sem pressupor características demográficas.

- **US-01 (FR-01):** Como usuário que consulta cidades de seu interesse, quero buscar uma cidade pelo nome e selecionar o resultado correto para consultar o clima daquele local.
- **US-02 (FR-02, FR-06):** Como usuário que quer verificar as condições atuais, quero ver temperatura, condição e horário de referência para entender o clima no local escolhido.
- **US-03 (FR-03):** Como usuário que planeja os próximos dias, quero comparar condição e temperaturas mínima e máxima de hoje e dos quatro dias seguintes para organizar minhas atividades.
- **US-04 (FR-04):** Como usuário que prefere Fahrenheit, quero alternar a unidade de temperatura para ver os dados de acordo com minha preferência.
- **US-05 (FR-05):** Como usuário cuja consulta falhou, quero receber uma mensagem clara e poder tentar novamente para continuar minha consulta sem recarregar a página.
- **US-06 (FR-06):** Como usuário que precisa avaliar a atualidade dos dados, quero ver a data e o horário de referência para saber a que momento as informações correspondem.

## User Story Traceability

NFR-01, NFR-04, NFR-05 e NFR-06 são transversais a todas as stories. A coluna NFR destaca esses requisitos e outros aplicáveis a cada fluxo.

| User Story | Requisitos funcionais | Acceptance Criteria | NFRs relevantes |
| --- | --- | --- | --- |
| US-01 — Buscar e selecionar cidade | FR-01 | AC-01 a AC-06, AC-17, AC-18, AC-20 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06 |
| US-02 — Consultar condições atuais | FR-02, FR-06 | AC-07, AC-08, AC-15, AC-16, AC-18, AC-19 | NFR-01, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |
| US-03 — Consultar previsão | FR-03 | AC-09, AC-15, AC-19 | NFR-01, NFR-03, NFR-04, NFR-05, NFR-06 |
| US-04 — Alternar unidade | FR-04 | AC-10, AC-11 | NFR-01, NFR-04, NFR-05, NFR-06 |
| US-05 — Recuperar de falhas | FR-05 | AC-12, AC-13, AC-14 | NFR-01, NFR-03, NFR-04, NFR-05, NFR-06 |
| US-06 — Ver referência temporal | FR-06 | AC-16 | NFR-01, NFR-04, NFR-05, NFR-06, NFR-07 |

## Acceptance Criteria

Os cenários usam respostas controladas e relógio fixo, sem chamadas reais aos serviços externos. Cada cenário começa em estado limpo, salvo quando indicar estado anterior. Mensagens e rótulos são verificados em português do Brasil.

### FR-01 — Buscar cidades

```gherkin
Scenario: [AC-01] Buscar e selecionar uma cidade
	Given que o geocoding retorna "Porto, Portugal" para a consulta normalizada "Porto"
	When o usuário informa "  Porto  " e inicia a busca
	Then a solicitação de geocoding contém exatamente "Porto"
	And o resultado exibe cidade "Porto" e país "Portugal"
	When o usuário seleciona esse resultado
	Then a cidade selecionada é identificada como "Porto, Portugal"
	And uma consulta meteorológica é iniciada para esse resultado
```

```gherkin
Scenario Outline: [AC-02] Não enviar uma busca vazia ou em branco
	Given que o campo de busca está no estado "<estado>"
	When o usuário tenta iniciar a busca
	Then nenhuma solicitação de geocoding é enviada
	And a interface informa que o nome da cidade é obrigatório

	Examples:
		| estado          |
		| vazio           |
		| apenas espaços  |
```

```gherkin
Scenario: [AC-03] Informar que não há cidades correspondentes
	Given que o serviço de geocoding retorna sucesso com uma lista vazia para "Cidade Inexistente"
	When o usuário busca "Cidade Inexistente"
	Then a interface exibe "Nenhuma cidade encontrada"
	And a interface permite editar ou limpar a busca
	And a interface não exibe uma mensagem de falha do serviço
```

```gherkin
Scenario: [AC-04] Buscar um nome de cidade com caracteres acentuados
	Given que o serviço de geocoding está configurado para retornar "São Paulo, Brasil" para a consulta "São Paulo"
	When o usuário busca "São Paulo"
	Then a solicitação contém o texto "São Paulo"
	And os resultados exibem "São Paulo, Brasil"
```

```gherkin
Scenario: [AC-05] Preservar hífens e apóstrofos em nomes de cidade
	Given que o serviço retorna resultados para "Aix-en-Provence" e "O'Fallon"
	When o usuário busca cada nome, um por vez
	Then cada solicitação preserva o texto original da busca
	And os resultados correspondentes são exibidos sem remover hífens ou apóstrofos
```

```gherkin
Scenario: [AC-06] Permitir distinguir cidades homônimas
	Given que o serviço retorna "Santiago, Chile" e "Santiago, Brasil" para "Santiago"
	When o usuário busca "Santiago"
	Then os dois resultados são exibidos com seus países
	And nenhum resultado é selecionado automaticamente
```

```gherkin
Scenario: [AC-17] Identificar resultado sem região ou país
	Given que o geocoding retorna "Springfield" sem região ou país, mas com coordenadas 39.78, -89.64
	When o usuário busca "Springfield"
	Then o resultado exibe "Springfield" e as coordenadas "39.78, -89.64"
	And o resultado não é selecionado automaticamente
```

```gherkin
Scenario: [AC-20] Identificar resultado sem qualquer contexto geográfico
	Given que o geocoding retorna "Springfield" sem região, país ou coordenadas
	When o usuário busca "Springfield"
	Then o resultado exibe "Springfield" e "Localização não informada"
	And o resultado não é selecionado automaticamente
```

```gherkin
Scenario: [AC-18] Ignorar resposta atrasada de uma cidade anterior
	Given que a consulta meteorológica de "Porto, Portugal" está pendente
	When o usuário seleciona "Lisboa, Portugal" e a resposta de Lisboa chega primeiro
	And a resposta atrasada de Porto chega depois
	Then "Lisboa, Portugal" continua selecionada
	And somente os dados de Lisboa são exibidos
```

### FR-02 — Consultar condições atuais

```gherkin
Scenario: [AC-07] Exibir a temperatura e a condição atual
	Given que "Lisboa, Portugal" está selecionada
	And o serviço meteorológico retorna temperatura atual de 18 °C para essa cidade
	And retorna o código WMO 2 (parcialmente nublado)
	When a consulta meteorológica termina com sucesso
	Then a interface exibe "Lisboa, Portugal"
	And identifica "18 °C" como a temperatura atual
	And exibe "Parcialmente nublado" como condição atual
```

```gherkin
Scenario: [AC-19] Manter temperatura quando o código da condição é desconhecido
	Given que a resposta contém temperatura atual de 18 °C e códigos WMO sem mapeamento para as condições atuais e previstas
	And a resposta contém temperaturas mínima e máxima válidas para os cinco dias
	When a consulta meteorológica termina com sucesso
	Then a interface exibe "18 °C"
	And exibe "Condição indisponível" para as condições atuais e previstas
	And exibe as temperaturas previstas válidas
```

```gherkin
Scenario: [AC-08] Não apresentar temperatura ausente como valor válido
	Given que "Lisboa, Portugal" está selecionada
	And a resposta meteorológica não contém temperatura atual
	When a consulta meteorológica termina com sucesso
	Then a interface indica que a temperatura atual não está disponível
	And não exibe zero nem um valor anterior como temperatura atual
```

### FR-03 — Consultar previsão

```gherkin
Scenario: [AC-09] Exibir cinco resumos diários completos
	Given que a data local atual retornada para a cidade é 27/10/2026
	And o serviço retorna a previsão diária:

		| Data       | Código WMO | Condição exibida       | Mínima | Máxima |
		| 27/10/2026 | 0          | Céu limpo              | 12 °C  | 21 °C  |
		| 28/10/2026 | 2          | Parcialmente nublado   | 13 °C  | 22 °C  |
		| 29/10/2026 | 3          | Nublado                | 11 °C  | 20 °C  |
		| 30/10/2026 | 61         | Chuva fraca            | 10 °C  | 19 °C  |
		| 31/10/2026 | 0          | Céu limpo              | 9 °C   | 18 °C  |
	When a consulta meteorológica termina com sucesso
	Then a previsão exibe exatamente cinco itens diários, em ordem cronológica
	And cada item exibe a data, condição, temperaturas mínima e máxima com unidade
	And cada item corresponde aos valores retornados para a mesma data
```

### FR-04 — Alternar unidade

```gherkin
Scenario: [AC-10] Iniciar em Celsius e alternar todas as temperaturas para Fahrenheit
	Given que o serviço retorna temperatura atual de 20 °C e previsões com mínima de 10 °C e máxima de 22 °C
	When os dados meteorológicos são exibidos pela primeira vez
	Then a unidade selecionada é Celsius
	And todas as temperaturas atuais e previstas usam °C
	When o usuário seleciona Fahrenheit
	Then a unidade selecionada é Fahrenheit
	And a temperatura atual exibida é 68 °F
	And a mínima prevista exibida é 50 °F
	And a máxima prevista exibida é 71,6 °F
	When o usuário seleciona Celsius
	Then a unidade selecionada é Celsius
	And a temperatura atual e as mínimas e máximas previstas voltam a exibir os valores originais em °C
	When o usuário seleciona Fahrenheit e recarrega a página
	Then a unidade selecionada volta a ser Celsius
	And as temperaturas são exibidas em °C
```

```gherkin
Scenario: [AC-11] Arredondar conversões para no máximo uma casa decimal
	Given que o serviço retorna uma temperatura de 21.3 °C
	When o usuário seleciona Fahrenheit
	Then a temperatura é exibida como 70,3 °F
```

### FR-05 — Recuperar de falhas

```gherkin
Scenario: [AC-12] Informar falha na busca e permitir nova tentativa
  Given que a próxima solicitação de geocoding retornará erro
  When o usuário inicia uma busca por "Recife"
  Then a interface exibe a mensagem "Não foi possível concluir a busca. Tente novamente."
	And a interface oferece um botão com nome acessível "Tentar novamente"
  When o usuário aciona "Tentar novamente" e o serviço retorna "Recife, Brasil"
  Then os resultados de "Recife, Brasil" são exibidos sem recarregar a página
```

```gherkin
Scenario: [AC-13] Informar falha na consulta meteorológica e permitir nova tentativa
	Given que "Recife, Brasil" está selecionada
	And a próxima solicitação meteorológica retornará erro
	When a consulta meteorológica é iniciada
	Then a interface exibe a mensagem "Não foi possível carregar o clima. Tente novamente."
	And a interface oferece um botão com nome acessível "Tentar novamente"
	When o usuário aciona "Tentar novamente" e o serviço retorna temperatura atual de 27 °C
	Then a interface exibe a temperatura atual de 27 °C sem recarregar a página
```

```gherkin
Scenario: [AC-14] Encerrar uma consulta que excede o tempo limite
	Given que "Recife, Brasil" está selecionada
	And a solicitação meteorológica não retorna resposta
	When o relógio de teste avança 10 segundos
	Then o indicador de carregamento é removido
	And a interface exibe "A consulta demorou demais. Tente novamente."
	And um botão com nome acessível "Tentar novamente" está disponível
```

```gherkin
Scenario: [AC-15] Identificar campos ausentes em resposta parcial
	Given que a resposta contém condição e temperaturas mínima e máxima válidas para 27/10/2026 a 30/10/2026
	And a resposta de 31/10/2026 contém condição e mínima, mas não contém máxima
	And a resposta não contém temperatura atual
	When a consulta meteorológica termina
	Then os cinco dias e todos os campos válidos são exibidos
	And a máxima de 31/10/2026 é identificada como indisponível
	And a interface indica que a temperatura atual não está disponível
	And nenhum valor ausente é apresentado como zero ou como dado atual
```

### FR-06 — Informar referência temporal

```gherkin
Scenario: [AC-16] Exibir data, horário local e fuso da referência
	Given que o serviço retorna referência temporal local de 27/10/2026 às 14:30 no fuso America/Sao_Paulo (UTC-03:00)
	When os dados meteorológicos são exibidos
	Then a interface exibe "Dados referentes a 27/10/2026 às 14:30"
	And a interface identifica o fuso "America/Sao_Paulo (UTC-03:00)"
```

## Non-Functional Requirements

- **NFR-01 — Responsividade:** Em viewports de 320, 375, 768, 1024 e 1440 CSS px, não pode haver rolagem horizontal nem perda de conteúdo ou função. Verificar busca, resultados, consulta, falha e troca de unidade em todas as larguras.
- **NFR-02 — Desempenho:** Em 100 execuções com geocoding controlado, o intervalo entre envio da busca e resultados visíveis deve ser de até 2 segundos no percentil 95, sem incluir latência externa. A interface deve continuar interativa e mostrar carregamento enquanto espera.
- **NFR-03 — Disponibilidade:** Meta mensal de 99,5%, medida por uma verificação sintética em navegador a cada minuto. Uma verificação é bem-sucedida quando a página carrega em até 5 segundos e os controles de busca ficam acessíveis e habilitados; falha da API externa conta como disponibilidade somente se a interface mostrar o estado de erro e a nova tentativa.
- **NFR-04 — Acessibilidade:** Atender WCAG 2.2 nível AA. Validar todos os fluxos por teclado e ferramenta automatizada, seguido de inspeção manual; contraste mínimo de 4,5:1 para texto normal e 3:1 para texto grande e componentes gráficos aplicáveis.
- **NFR-05 — Compatibilidade:** A cada release, suportar a versão estável atual e a imediatamente anterior de Chrome, Edge e Firefox em desktop; Safari em macOS e iOS; e Chrome em Android. Executar busca, seleção, consulta, troca de unidade e recuperação de erro na matriz.
- **NFR-06 — Idioma e formatos:** Toda a interface deve estar em pt-BR. Datas, horas, separadores decimais e nomes das condições devem seguir convenções brasileiras; identificadores de fuso devem permanecer inequívocos.
- **NFR-07 — Transparência temporal:** Exibir o timestamp fornecido para as condições atuais e não descrever os dados como observações em tempo real. A idade real dos dados de origem não é garantida pelo produto.

## Edge Cases

- Busca vazia ou composta apenas por espaços: não enviar solicitação de geocoding; informar que o nome da cidade é obrigatório e manter o campo editável.
- Cidade inexistente ou geocoding bem-sucedido sem correspondências: exibir estado vazio distinto de erro do serviço e permitir editar ou limpar a busca.
- Cidades homônimas: exibir país/região nos resultados quando disponíveis; não selecionar automaticamente um resultado ambíguo.
- Caracteres especiais em nomes válidos: preservar acentos, espaços, apóstrofos e hífens na consulta e nos resultados.
- Falha de rede ou resposta de erro de um serviço: identificar qual etapa falhou em mensagem compreensível e oferecer nova tentativa para essa etapa.
- Timeout: após 10 segundos sem resposta, encerrar o carregamento, informar a demora e oferecer nova tentativa manual.
- Cidade sem cobertura: informar que os dados meteorológicos não estão disponíveis para o local selecionado; não exibir zero nem dados antigos como atuais.
- Resposta parcial: exibir separadamente os campos válidos; identificar cada campo ou dia indisponível e não indicar a previsão como completa.
- Unidade alterada durante uma consulta ou após seus resultados carregarem: manter todos os valores meteorológicos visíveis coerentes com a unidade selecionada.
- Mudança de dia ou diferença de fuso: as datas da previsão devem seguir o calendário local da cidade retornado pela fonte. O horário de referência deve incluir o fuso ou deslocamento UTC quando fornecido pela fonte.
- Timestamp ausente: indicar que o horário de referência não foi fornecido; não inventar data ou hora e não afirmar que os dados são atuais.
- Dados antigos: exibir o timestamp do provedor sem prometer uma idade máxima ou atualização em tempo real.
- Tela estreita ou zoom: controles, resultados e mensagens continuam acessíveis sem rolagem horizontal dentro da faixa definida em NFR-01.

## Assumptions

- Open-Meteo será a fonte de geocodificação e dados meteorológicos, sem chave de API, sujeito à confirmação de cobertura, limites de uso e atribuição.
- O usuário selecionará uma cidade antes de consultar o clima; localização atual não é obrigatória. Só há cobertura para localidades retornadas pelo geocoding.
- As condições atuais são estimativas fornecidas pelo modelo meteorológico do provedor, não observações garantidas por uma estação local.
- Celsius é a unidade inicial; Fahrenheit também está disponível.
- A previsão de lançamento é diária, cobre hoje e os quatro dias seguintes e apresenta condição textual localizada e temperaturas mínima e máxima.
- O produto do lançamento é uma aplicação web responsiva, não um aplicativo nativo.
- A busca e a consulta de dados dependem de conexão com a internet.
- Não haverá autenticação nem persistência em servidor. A unidade não é salva entre recargas.

## Risks

- **Resultados ambíguos:** cidades homônimas podem levar à consulta do local errado. **Mitigação:** exibir país/região quando disponível e validar a experiência de seleção antes do lançamento.
- **Indisponibilidade, atraso ou cobertura incompleta da fonte:** pode impedir ou degradar a consulta. **Mitigação:** tratar falhas e respostas parciais, informar a indisponibilidade e oferecer nova tentativa; confirmar cobertura e limites do Open-Meteo.
- **Campos meteorológicos incompletos:** dados ausentes podem fazer uma previsão parecer completa ou atual. **Mitigação:** indicar campos indisponíveis e validar cada dia da previsão com respostas controladas.
- **Divergência de data e horário por fuso:** o usuário pode interpretar incorretamente o período previsto ou a atualidade dos dados. **Mitigação:** definir a referência de fuso e apresentar claramente o horário fornecido para a localidade.
- **Dados de origem antigos ou baseados em modelo:** o timestamp pode não representar a hora de uma observação local. **Mitigação:** rotular como referência do provedor e não prometer observação em tempo real.
- **Problemas de usabilidade ou compatibilidade móvel:** telas pequenas e diferenças entre navegadores podem dificultar a consulta. **Mitigação:** validar a faixa de viewport e aprovar uma matriz de navegadores antes do lançamento.
- **Dependências de operação não confirmadas:** limites de uso, atribuição e disponibilidade do provedor podem impactar a publicação. **Mitigação:** confirmar condições de uso e requisitos de atribuição antes do lançamento.

## Out of Scope

- Contas, autenticação e sincronização de preferências em servidor.
- Aplicativos nativos para iOS ou Android.
- Uso obrigatório de localização atual ou solicitação de permissão de geolocalização.
- Alertas meteorológicos, notificações, mapas, radar ou recomendações personalizadas.
- Persistência local ou em servidor da unidade escolhida entre recargas.
- Suporte a idiomas além de português do Brasil no lançamento.
- Garantia de cobertura para qualquer cidade ou região antes de a cobertura do provedor ser confirmada.

## Open Questions

- Antes do lançamento, confirmar nos termos oficiais do Open-Meteo os limites de uso, a atribuição exigida e a cobertura para as localidades previstas; bloquear a publicação se o uso planejado não for permitido.