# Backlog de Tarefas — Weather App

Backlog derivado do [plano técnico](../plans/weather-app-plan.md) e rastreado
com os requisitos e critérios de aceite da
[especificação](../specs/weather-app-spec.md). As tarefas foram divididas em
unidades testáveis, agrupadas por entrega e ordenadas respeitando dependências.

## Matriz de rastreabilidade funcional

| Requisito da spec | Tarefas de implementação | Tarefas de teste/validação | Cobertura |
| --- | --- | --- | --- |
| **FR-01 — Buscar cidades** | T-05 (geocoding), T-07 (orquestração da busca), T-09 (formulário), T-10 (resultados), T-15 (composição) | T-19 (service), T-21 (hook), T-23 (formulário), T-24 (resultados), T-29 (E2E principal) | Coberto: consulta normalizada, localização, seleção explícita e ausência de seleção automática. |
| **FR-02 — Consultar condições atuais** | T-03 (códigos WMO), T-06 (forecast), T-08 (orquestração meteorológica), T-12 (condições atuais), T-15 (composição) | T-18 (WMO), T-20 (service), T-22 (hook), T-26 (componente), T-29 e T-31 (E2E) | Coberto: temperatura, condição localizada, indisponibilidade, dados de modelo e concorrência. |
| **FR-03 — Consultar previsão** | T-03 (códigos WMO), T-06 (forecast), T-08 (orquestração meteorológica), T-13 (previsão diária), T-15 (composição) | T-18 (WMO), T-20 (service), T-27 (componente), T-29 e T-30 (E2E) | Coberto: cinco dias locais, condição e mínimas/máximas, inclusive campos ausentes. |
| **FR-04 — Alternar unidade** | T-02 (conversão/formatação), T-08 (estado da unidade), T-14 (controle de unidade), T-15 (composição) | T-17 (unitário), T-22 (hook), T-28 (componente), T-29 (E2E) | Coberto: Celsius inicial, conversão reversível, arredondamento e retorno a Celsius após recarga. |
| **FR-05 — Recuperar de falhas** | T-05 e T-06 (services/timeout), T-07 e T-08 (orquestração/retry), T-11 (mensagens e retry), T-15 (composição) | T-19 e T-20 (services), T-21 e T-22 (hook), T-25 (componente), T-30 (E2E) | Coberto: vazio distinto de erro, erro por etapa, timeout de 10 segundos e retry manual sem recarga. |
| **FR-06 — Informar referência temporal** | T-04 (formatação temporal), T-06 (normalização do forecast), T-12 (exibição atual), T-15 (composição) | T-18 (formatação), T-20 (service), T-26 (componente) | Coberto: timestamp do provedor em pt-BR com fuso/offset, sem usar horário de recebimento. |

**Lacunas:** Nenhum requisito funcional FR-01 a FR-06 está sem tarefa de
implementação e teste/validação correspondente no backlog. As tarefas indicadas
estão detalhadas nas entregas abaixo.

## Prioridade e tamanho relativo

Prioridade indica a ordem sugerida para investimento, não remoção de escopo:

- **P0:** necessário para o primeiro incremento utilizável e demonstrável.
- **P1:** necessário para completar os requisitos e validar antes do release.
- **P2:** hardening operacional de menor urgência; concluir antes do release
  quando for requisito de NFR ou condição de publicação.

Tamanho relativo é uma estimativa de esforço/complexidade: **P** (pequeno,
escopo focado), **M** (médio, integração ou vários cenários) e **G** (grande,
validação operacional ampla ou dependência de ambientes externos). O tamanho
não substitui a divisão em tarefas menores.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P0 | P |
| T-03 | P0 | M |
| T-04 | P1 | P |
| T-05 | P0 | M |
| T-06 | P0 | M |
| T-07 | P0 | M |
| T-08 | P0 | M |
| T-09 | P0 | P |
| T-10 | P0 | P |
| T-11 | P0 | P |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | P |
| T-15 | P0 | M |
| T-16 | P1 | P |
| T-17 | P0 | P |
| T-18 | P1 | M |
| T-19 | P0 | M |
| T-20 | P0 | M |
| T-21 | P1 | M |
| T-22 | P1 | M |
| T-23 | P1 | P |
| T-24 | P1 | P |
| T-25 | P0 | P |
| T-26 | P1 | P |
| T-27 | P1 | P |
| T-28 | P1 | P |
| T-29 | P0 | M |
| T-30 | P0 | M |
| T-31 | P0 | P |
| T-32 | P1 | M |
| T-33 | P1 | M |
| T-34 | P2 | G |
| T-35 | P1 | G |
| T-36 | P1 | M |
| T-37 | P1 | M |
| T-38 | P0 | M |

## Sequência sugerida em fatias verticais

As camadas continuam respeitando as dependências do backlog, mas cada fatia
deve atravessá-las e terminar em uma experiência visível. Para antecipar o
primeiro resultado, não espere a conclusão de todos os testes de componente ou
de hardening para começar a conectar a tela: implemente a composição da T-15
progressivamente e mantenha os testes correspondentes junto a cada fluxo.

| Ordem | Fatia e resultado demonstrável | Tarefas principais |
| --- | --- | --- |
| 1 | **Buscar e escolher cidade:** tela inicial visível com formulário, loading/erro/vazio, resultados distinguíveis e seleção explícita; ainda sem depender de forecast para demonstrar busca e seleção. | T-01, T-05, T-07, T-09, T-10, T-11, T-15; testes T-19, T-21, T-23 a T-25. |
| 2 | **Clima atual:** após selecionar a cidade, mostrar temperatura, condição localizada e referência temporal com fuso. | T-02, T-03, T-04, T-06, T-08, T-12, T-15; testes T-17, T-18, T-20, T-22, T-26. |
| 3 | **Previsão e unidades:** mostrar cinco dias locais e alternar todas as temperaturas entre Celsius e Fahrenheit. | T-13, T-14, T-15; testes T-27, T-28 e fluxo principal T-29. |
| 4 | **Uso confiável em telas pequenas:** validar o fluxo principal em 375 CSS px e demais larguras, com mensagens recuperáveis e resposta parcial. | T-16, T-30, T-32; complementar T-29. |
| 5 | **Concorrência e prontidão para release:** proteger seleção recente, executar verificações de desempenho/acessibilidade/compatibilidade e confirmar condições do provedor. | T-31, T-33 a T-38. |

**Primeiro incremento visível recomendado:** concluir a fatia 1 e apresentar
busca/resultados funcionais antes de ampliar a tela; integrar o clima atual na
fatia 2 e só então acrescentar previsão e unidade. A T-15 é um ponto de
integração compartilhado: sua implementação deve acompanhar cada fatia, embora
sua conclusão integral dependa de todos os componentes.

## Entrega 1 — Tipos

### T-01 — Definir os tipos compartilhados do domínio

- **Descrição:** Criar contratos TypeScript para cidade, unidade, dados
  meteorológicos, estados de busca e clima e erros de requisição.
- **Critérios de aceite:**
  - `City` contém `id: string`, nome, localização opcional e latitude/longitude;
    `CurrentWeather`, `ForecastDay` e `WeatherData` contêm os campos do plano,
    com valores externos potencialmente ausentes tipados como `null`.
  - `Unit` aceita somente `celsius` ou `fahrenheit`; `SearchState` e
    `WeatherState` declaram `idle`, `loading`, `success`, `empty` e `error`,
    com query/resultados ou cidade/dados/erro conforme o status.
  - `RequestError` distingue `network`, `api`, `timeout` e `invalid-response`;
    `tsc` conclui sem erros de tipo.
- **Rastreabilidade:** FR-01 a FR-06; AC-01, AC-06 a AC-09, AC-15 a AC-20.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data

## Entrega 2 — Funções puras

### T-02 — Implementar conversão e formatação de temperaturas

- **Descrição:** Criar funções puras para conversão Celsius/Fahrenheit e
  formatação de temperatura em pt-BR.
- **Critérios de aceite:**
  - Para entrada Celsius `20`, a conversão resulta em Fahrenheit `68`; para
    `21.3`, resulta em `70.3`.
  - Formatação pt-BR arredonda para no máximo uma casa decimal, elimina zero
    decimal final e inclui `°C` ou `°F`.
  - Entrada `null` permanece indisponível (`null`) para a camada de UI, sem
    produzir `0`, `NaN` ou reutilizar temperatura anterior.
- **Rastreabilidade:** FR-04; AC-10 e AC-11.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data

### T-03 — Mapear códigos meteorológicos WMO

- **Descrição:** Mapear os códigos WMO suportados para descrições em pt-BR.
- **Critérios de aceite:**
  - A função retorna o rótulo pt-BR correspondente à descrição oficial para
    cada código `0, 1, 2, 3, 45, 48, 51–57, 61–67, 71–77, 80–82, 85–86, 95,
    96, 99`.
  - Entrada `null` e código não listado retornam exatamente “Condição
    indisponível”; o mapeamento não altera valores de temperatura.
- **Rastreabilidade:** FR-02 e FR-03; AC-07, AC-09 e AC-19.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCode.ts`
- **Tipo:** Data

### T-04 — Formatar datas e referência temporal

- **Descrição:** Criar funções puras para apresentar datas locais e timestamp
  do provedor com fuso inequívoco.
- **Critérios de aceite:**
  - A data `2026-10-27` é formatada como `27/10/2026` e o timestamp
    `2026-10-27T14:30` com `America/Sao_Paulo` resulta em
    `27/10/2026 às 14:30` no fuso informado.
  - O identificador do fuso e seu offset UTC são incluídos quando fornecidos.
  - Timestamp ou fuso ausente resulta em mensagem explícita de referência não
    fornecida; nenhum horário atual do sistema é usado.
- **Rastreabilidade:** FR-06; AC-16; NFR-06 e NFR-07.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/time.ts`
- **Tipo:** Data

## Entrega 3 — Services

### T-05 — Implementar o serviço de geocoding

- **Descrição:** Consultar e normalizar resultados de cidades do Open-Meteo.
- **Critérios de aceite:**
  - Decodificar os parâmetros da URL confirma `name=São Paulo`,
    `language=pt` e `format=json` para entrada `"  São Paulo  "`; hífens,
    apóstrofos, acentos e espaços internos são preservados.
  - Cada resultado válido mapeia id, nome, latitude e longitude; `admin1` e
    país ausentes tornam-se `null`, e o id interno é uma string estável.
  - `results: []` retorna lista vazia; status HTTP não-2xx, rejeição de rede,
    timeout e JSON/estrutura inválidos produzem, respectivamente, erros
    `api`, `network`, `timeout` e `invalid-response`.
  - Request pendente é cancelado/rejeitado ao atingir 10 segundos.
- **Rastreabilidade:** FR-01 e FR-05; AC-01 a AC-06 e AC-12.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/geocoding.ts`
- **Tipo:** Data

### T-06 — Implementar o serviço de forecast

- **Descrição:** Consultar e normalizar condições atuais e previsão de cinco
  dias para as coordenadas selecionadas.
- **Critérios de aceite:**
  - A URL contém latitude/longitude da cidade, `temperature_unit=celsius`,
    `timezone=auto`, `forecast_days=5`, `current=temperature_2m,weather_code`
    e os três parâmetros `daily` definidos no plano.
  - Temperatura/código/horário atuais, timezone e offset são mapeados para os
    campos correspondentes do contrato; status não-2xx, rede, timeout e
    estrutura inválida são diferenciados.
  - Cinco índices diários geram cinco itens com a mesma data de origem; array
    curto ou valor ausente gera `null` somente para o campo/índice ausente.
  - Payload parcial com pelo menos a estrutura necessária retorna dados
    parciais; nenhum campo ausente vira zero ou valor anterior.
- **Rastreabilidade:** FR-02, FR-03, FR-05 e FR-06; AC-07 a AC-09,
  AC-13 a AC-16 e AC-19.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weather.ts`
- **Tipo:** Data

## Entrega 4 — Hook e orquestração

### T-07 — Implementar orquestração da busca de cidades

- **Descrição:** Implementar no hook o fluxo de busca, validação, estado vazio,
  erro, retry e descarte de buscas obsoletas.
- **Critérios de aceite:**
  - Enviar `""` ou espaços não chama geocoding e expõe validação; enviar
    `"  São Paulo  "` chama uma vez com `"São Paulo"`.
  - Busca altera estado observável para `loading` e termina em `success`,
    `empty` ou `error` conforme o service mockado.
  - Retry após erro chama geocoding uma vez adicional com a mesma query
    normalizada.
  - Em duas buscas pendentes resolvidas fora de ordem, somente a operação mais
    recente atualiza resultados e estado.
- **Rastreabilidade:** FR-01 e FR-05; AC-01 a AC-05 e AC-12.
- **Dependências:** T-01, T-05.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

### T-08 — Implementar seleção e consulta meteorológica

- **Descrição:** Implementar seleção explícita de cidade, consulta do forecast,
  retry e proteção contra respostas obsoletas no hook.
- **Critérios de aceite:**
  - Sem seleção, forecast não é chamado; selecionar uma cidade chama uma vez
    com sua latitude/longitude e define-a como cidade atual.
  - Estado meteorológico expõe `loading`, `success`, `empty` ou `error`
    conforme o service mockado; retry após erro repete somente forecast para a
    cidade selecionada.
  - Em duas seleções pendentes resolvidas em qualquer ordem, somente a última
    seleção atualiza cidade, dados e erro.
  - Unidade inicial é `celsius`; alterná-la muda o estado de unidade sem
    aumentar contagem de chamadas aos services.
- **Rastreabilidade:** FR-01, FR-02, FR-04 e FR-05; AC-01, AC-07,
  AC-10 a AC-14 e AC-18.
- **Dependências:** T-01, T-06, T-07.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

## Entrega 5 — Componentes

### T-09 — Criar o formulário de busca

- **Descrição:** Implementar o campo de cidade, submissão e validação acessíveis.
- **Critérios de aceite:**
  - O campo possui label acessível e a ação de busca é acionável por teclado
    (Enter quando o foco está no campo).
  - Submeter `"São Paulo"`, `"Aix-en-Provence"` e `"O'Fallon"` encaminha os
    respectivos textos sem remover acentos, hífens, apóstrofos ou espaços
    internos.
  - Submeter campo vazio ou somente espaços não encaminha busca e exibe a
    mensagem de que o nome da cidade é obrigatório.
- **Rastreabilidade:** FR-01; AC-01, AC-02, AC-04 e AC-05; NFR-04 e NFR-06.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`
- **Tipo:** UI

### T-10 — Exibir e selecionar resultados de cidades

- **Descrição:** Renderizar resultados de geocoding com localização e seleção
  explícita.
- **Critérios de aceite:**
  - Resultado com região/país exibe os três valores; sem ambos exibe
    coordenadas quando recebidas ou exatamente “Localização não informada”.
  - Fixtures de Santiago, Chile e Santiago, Brasil mostram dois resultados
    distinguíveis; após renderização, callback de seleção não foi chamado.
  - Ativar resultado por teclado chama callback uma vez com o objeto `City`
    correspondente e não chama callback para os demais resultados.
- **Rastreabilidade:** FR-01; AC-01, AC-06, AC-17 e AC-20; NFR-04 e NFR-06.
- **Dependências:** T-07, T-08.
- **Arquivos prováveis:** `src/components/CityResults.tsx`
- **Tipo:** UI

### T-11 — Exibir mensagens de status e retry

- **Descrição:** Apresentar loading, estados vazios e erros de busca/clima com
  retry acessível.
- **Critérios de aceite:**
  - Estado `empty` de busca exibe “Nenhuma cidade encontrada” sem mensagem de
    falha; estado `error` de busca exibe “Não foi possível concluir a busca.
    Tente novamente.”.
  - Erro meteorológico exibe “Não foi possível carregar o clima. Tente
    novamente.”; timeout exibe “A consulta demorou demais. Tente novamente.”.
  - Cada estado de erro mostra um botão com nome acessível “Tentar novamente”;
    ativá-lo chama apenas o callback de retry uma vez e remove o loading
    quando o estado seguinte deixa de ser `loading`.
- **Rastreabilidade:** FR-05; AC-03, AC-12 a AC-14; NFR-04 e NFR-06.
- **Dependências:** T-07, T-08.
- **Arquivos prováveis:** `src/components/StatusMessage.tsx`
- **Tipo:** UI

### T-12 — Exibir condições atuais e referência temporal

- **Descrição:** Apresentar cidade, condição atual, temperatura e referência dos
  dados do provedor.
- **Critérios de aceite:**
  - Fixture de Lisboa com `18 °C` e WMO `2` exibe “Lisboa, Portugal”,
    “18 °C” e “Parcialmente nublado”.
  - Temperatura `null` exibe indicação de indisponibilidade, não `0 °C`; código
    desconhecido exibe “Condição indisponível” mantendo a temperatura válida.
  - Timestamp `2026-10-27T14:30`, timezone `America/Sao_Paulo` e offset
    `-10800` exibem “Dados referentes a 27/10/2026 às 14:30” e
    `America/Sao_Paulo (UTC-03:00)`.
  - Conteúdo identifica os dados como estimativa/modelo e não usa a expressão
    “em tempo real” nem os rotula como observações locais medidas.
- **Rastreabilidade:** FR-02 e FR-06; AC-07, AC-08, AC-16 e AC-19;
  NFR-06 e NFR-07.
- **Dependências:** T-02, T-03, T-04, T-08.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Tipo:** UI

### T-13 — Exibir previsão diária

- **Descrição:** Renderizar os cinco resumos diários locais, mantendo campos
  ausentes explícitos.
- **Critérios de aceite:**
  - Fixture de 27/10/2026 a 31/10/2026 renderiza exatamente cinco itens nessa
    ordem, começando pela data local recebida.
  - Cada item mostra data, condição e temperaturas mínima/máxima com unidade;
    campo `null` exibe indisponibilidade apenas para aquele campo e código
    desconhecido exibe “Condição indisponível”.
  - Fixture com máximas distintas por data confirma que cada temperatura é
    renderizada junto à data do mesmo índice, sem troca entre dias.
- **Rastreabilidade:** FR-03; AC-09, AC-15 e AC-19.
- **Dependências:** T-02, T-03, T-04, T-08.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`
- **Tipo:** UI

### T-14 — Criar controle de unidade

- **Descrição:** Permitir alternância acessível entre Celsius e Fahrenheit para
  todas as temperaturas apresentadas.
- **Critérios de aceite:**
  - No estado inicial, opção Celsius está selecionada; controle tem nome
    acessível e as duas opções podem ser acionadas por teclado.
  - Com valores base 20 °C, 10 °C e 22 °C, selecionar Fahrenheit exibe 68 °F,
    50 °F e 71,6 °F em todos os campos atuais/diários.
  - Retornar a Celsius exibe novamente os valores originais; seleção de unidade
    não aumenta chamadas de serviço e, após recarga, Celsius está selecionado.
- **Rastreabilidade:** FR-04; AC-10 e AC-11; NFR-04 e NFR-06.
- **Dependências:** T-02, T-08.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`
- **Tipo:** UI

## Entrega 6 — Integração e composição

### T-15 — Compor a tela da aplicação

- **Descrição:** Integrar hook e componentes na composição principal da tela.
- **Critérios de aceite:**
  - A aplicação monta sem erro e TypeScript compila; `App.tsx` passa estado e
    callbacks tipados aos componentes sem declarar `fetch` ou conversão WMO/
    temperatura.
  - Com hook mockado, estado `loading`, `error`, `empty` e `success` renderiza
    respectivamente os componentes/avisos correspondentes sem exibir dados de
    sucesso nos outros estados.
  - Submeter busca e selecionar resultado encaminha os callbacks corretos uma
    vez.
- **Rastreabilidade:** FR-01 a FR-06; AC-01 a AC-20.
- **Dependências:** T-09, T-10, T-11, T-12, T-13, T-14.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI

### T-16 — Ajustar layout responsivo

- **Descrição:** Ajustar estilos da tela para a faixa de viewports suportada.
- **Critérios de aceite:**
  - Em larguras de viewport 320, 375, 768, 1024 e 1440 CSS px, `scrollWidth`
    do documento não excede `clientWidth`.
  - Em cada largura, busca, resultados, estado de erro e cinco previsões estão
    visíveis/alcançáveis e seus controles permanecem acionáveis.
  - A verificação usa estados/fixtures fixos e registra o viewport de cada
    assertiva aprovada.
- **Rastreabilidade:** NFR-01.
- **Dependências:** T-15.
- **Arquivos prováveis:** `src/index.css`
- **Tipo:** UI

## Entrega 7 — Testes

### T-17 — Testar conversão e formatação de temperaturas

- **Descrição:** Testar as funções puras de conversão e formatação térmica.
- **Critérios de aceite:**
  - `temperature.test.ts` verifica `20 °C → 68 °F`, `10 °C → 50 °F`,
    `22 °C → 71,6 °F` e `21,3 °C → 70,3 °F`.
  - Testes verificam que alternar a apresentação de Celsius para Fahrenheit e
    voltar preserva o valor-base, além de ausência de zeros finais e retorno
    indisponível para `null`, sem `NaN` ou zero substituto.
  - A suíte unitária dedicada a `temperature.ts` passa isoladamente via Vitest;
    não renderiza componentes nem usa `fetch`.
- **Rastreabilidade:** FR-04; AC-10 e AC-11.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`
- **Tipo:** Test

### T-18 — Testar mapeamento WMO e referência temporal

- **Descrição:** Testar separadamente o mapeamento WMO e a formatação temporal.
- **Critérios de aceite:**
  - `weatherCode.test.ts` contém um caso para cada código listado em T-03 e
    casos para `null` e um código desconhecido.
  - `time.test.ts` verifica `27/10/2026`, o timestamp às `14:30` em
    `America/Sao_Paulo (UTC-03:00)` e timestamp/fuso ausentes.
  - Os testes usam entradas fixas, não chamam rede nem consultam relógio atual;
    ambos os arquivos passam isoladamente.
- **Rastreabilidade:** FR-02, FR-03 e FR-06; AC-07, AC-09, AC-16 e AC-19.
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `tests/unit/weatherCode.test.ts`,
  `tests/unit/time.test.ts`
- **Tipo:** Test

### T-19 — Testar o serviço de geocoding

- **Descrição:** Cobrir o serviço de geocoding com `fetch` mockado.
- **Critérios de aceite:**
  - Testes assertam endpoint, `name`, `language=pt`, `format=json` e trim sem
    alterar caracteres internos.
  - Fixtures cobrem resultado completo, localização opcional, lista vazia,
    HTTP não-2xx, rejeição de rede, timeout de 10 segundos e JSON/estrutura
    inválidos, verificando o tipo de resultado/erro em cada caso.
  - Cada caso instala um mock de `fetch`, verifica chamada e resposta, e não
    acessa a Open-Meteo real; a suíte unitária dedicada passa via Vitest.
- **Rastreabilidade:** FR-01 e FR-05; AC-01 a AC-06 e AC-12.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/geocoding.test.ts`
- **Tipo:** Test

### T-20 — Testar o serviço de forecast

- **Descrição:** Cobrir o serviço meteorológico com `fetch` mockado.
- **Critérios de aceite:**
  - Testes assertam coordenadas e todos os parâmetros de forecast definidos em
    T-06, além do mapeamento de timestamp, fuso e offset.
  - Fixtures cobrem payload completo/parcial, arrays de comprimentos diferentes,
    HTTP não-2xx, rede, timeout de 10 segundos e JSON/estrutura inválidos.
  - Cada caso instala um mock de `fetch` e verifica que cada índice conserva
    sua data e campos ausentes resultam em `null`; nenhuma chamada acessa a
    Open-Meteo real e a suíte passa via Vitest.
- **Rastreabilidade:** FR-02, FR-03, FR-05 e FR-06; AC-07 a AC-09,
  AC-13 a AC-16 e AC-19.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/weather.test.ts`
- **Tipo:** Test

### T-21 — Testar orquestração de busca

- **Descrição:** Testar comportamento do fluxo de busca usando service mockado.
- **Critérios de aceite:**
  - Testes assertam validação e zero chamadas para entrada vazia, e transições
    `loading → success`, `loading → empty` e `loading → error`.
  - Após falha, retry incrementa geocoding em exatamente uma chamada e não
    chama forecast.
  - Com busca A pendente, busca B concluída e A concluída depois, resultados e
    query continuam sendo os de B.
  - A suíte do arquivo passa isoladamente.
- **Rastreabilidade:** FR-01 e FR-05; AC-01 a AC-05 e AC-12.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`
- **Tipo:** Test

### T-22 — Testar orquestração meteorológica e unidade

- **Descrição:** Testar seleção, forecast, retry, concorrência e unidade no hook.
- **Critérios de aceite:**
  - Testes assertam que seleção dispara forecast uma vez e verifica transições
    `loading → success`, `loading → empty` e `loading → error`.
  - Retry após falha incrementa forecast em uma chamada, sem nova busca.
  - Testes com duas seleções e respostas/erros fora de ordem mantêm somente a
    cidade selecionada por último e seus dados.
  - Alterar unidade atualiza `unit`, mantém os valores-base e não incrementa
    chamadas de geocoding ou forecast; a suíte passa isoladamente.
- **Rastreabilidade:** FR-02, FR-04 e FR-05; AC-07, AC-10 a AC-14 e AC-18.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/useWeatherForecast.test.ts`
- **Tipo:** Test

### T-23 — Testar o formulário de busca

- **Descrição:** Testar submissão, validação e acessibilidade do formulário.
- **Critérios de aceite:**
  - Testes verificam submissão de `São Paulo`, `Aix-en-Provence` e `O'Fallon`
    sem alteração dos caracteres, além da validação de vazio/somente espaços.
  - Campo é encontrado por label e botão por role/nome; Enter no campo submete
    uma vez e busca vazia não submete.
  - A suíte do arquivo passa isoladamente.
- **Rastreabilidade:** FR-01; AC-01, AC-02, AC-04 e AC-05; NFR-04.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/unit/SearchForm.test.tsx`
- **Tipo:** Test

### T-24 — Testar resultados de cidades

- **Descrição:** Testar renderização, localização incompleta e seleção de cidade.
- **Critérios de aceite:**
  - Testes verificam renderização de Santiago, Chile e Santiago, Brasil como
    opções separadas e ausência de chamada automática do callback.
  - Testes verificam região/país ausentes com coordenadas e sem coordenadas,
    incluindo o texto “Localização não informada”.
  - Enter/Space no resultado focado chama callback uma vez para o `City` correto;
    a suíte do arquivo passa isoladamente.
- **Rastreabilidade:** FR-01; AC-01, AC-06, AC-17 e AC-20; NFR-04.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/CityResults.test.tsx`
- **Tipo:** Test

### T-25 — Testar componente de status nos estados loading, erro e vazio

- **Descrição:** Testar isoladamente o componente de status com props controladas
  para loading, vazio e erros.
- **Critérios de aceite:**
  - Com prop de loading, o indicador é renderizado; com prop de busca vazia,
    aparece “Nenhuma cidade encontrada”; nenhum desses estados exibe controles
    de retry.
  - Com erro de busca, erro meteorológico ou timeout, o componente exibe,
    respectivamente, as mensagens de AC-12, AC-13 e AC-14 e um botão acessível
    “Tentar novamente”.
  - Acionar retry chama o callback uma vez; ao renderizar o estado terminal
    seguinte, o indicador de loading não permanece visível.
  - Testes usam Testing Library e props controladas, sem service ou rede; a
    suíte `tests/unit/StatusMessage.test.tsx` passa isoladamente via Vitest.
- **Rastreabilidade:** FR-05; AC-03, AC-12 a AC-14; NFR-04.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/unit/StatusMessage.test.tsx`
- **Tipo:** Test

### T-26 — Testar apresentação das condições atuais

- **Descrição:** Testar campos meteorológicos atuais e referência temporal na UI.
- **Critérios de aceite:**
  - Testes verificam fixture de 18 °C/WMO 2, temperatura ausente, código WMO
    desconhecido e preservação da temperatura válida.
  - Fixture temporal fixa confirma texto exato “Dados referentes a
    27/10/2026 às 14:30” e `America/Sao_Paulo (UTC-03:00)`.
  - Teste confirma identificação de estimativa do modelo e ausência de
    rotulagem como observação em tempo real; suíte passa isoladamente.
- **Rastreabilidade:** FR-02 e FR-06; AC-07, AC-08, AC-16 e AC-19; NFR-07.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`
- **Tipo:** Test

### T-27 — Testar previsão diária

- **Descrição:** Testar os cinco dias e os campos de previsão na interface.
- **Critérios de aceite:**
  - Fixture de cinco datas renderiza exatamente cinco itens na ordem fornecida
    e confere data/temperaturas distintas para cada item.
  - Testes verificam mínima ausente em um dia sem ocultar máxima nem os outros
    quatro dias, e código WMO desconhecido apresenta “Condição indisponível”.
  - A suíte do arquivo passa isoladamente.
- **Rastreabilidade:** FR-03; AC-09, AC-15 e AC-19.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`
- **Tipo:** Test

### T-28 — Testar controle e conversão de unidade na UI

- **Descrição:** Testar a alternância de unidade e sua aplicação consistente às
  temperaturas apresentadas.
- **Critérios de aceite:**
  - Teste verifica seleção inicial de Celsius, conversão de 20 °C para 68 °F e
    retorno a 20 °C.
  - Teste de teclado alterna as opções; spies confirmam zero chamadas adicionais
    de serviços ao trocar unidade.
  - A suíte do arquivo passa isoladamente.
- **Rastreabilidade:** FR-04; AC-10 e AC-11; NFR-04.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`
- **Tipo:** Test

### T-29 — Testar o fluxo principal ponta a ponta

- **Descrição:** Validar no navegador busca, seleção, consulta e troca de unidade
  com fixtures e interceptação de rede, incluindo viewport mobile.
- **Critérios de aceite:**
  - Com fixtures interceptadas, o teste busca Porto, seleciona o resultado,
    verifica chamada de forecast para suas coordenadas e exibe cidade,
    temperatura/condição atuais e cinco datas.
  - O teste verifica 20 °C como 68 °F após alternar e 20 °C após retornar; um
    reload inicia novamente com Celsius.
  - O mesmo fluxo principal é executado em viewport mobile de 375 CSS px; busca,
    seleção, temperaturas, previsão e alternância de unidade continuam
    acessíveis e utilizáveis.
  - Toda rota de geocoding e forecast é interceptada e a contagem de requests
    externos não interceptados é zero.
- **Rastreabilidade:** FR-01 a FR-04; AC-01, AC-06 a AC-11.
- **Dependências:** T-15, T-17, T-18, T-19, T-20, T-21, T-22, T-23, T-24,
  T-25, T-26, T-27, T-28.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-30 — Testar erros e respostas parciais ponta a ponta

- **Descrição:** Validar estados recuperáveis e resposta parcial pelo fluxo real
  da aplicação.
- **Critérios de aceite:**
  - Fixtures E2E verificam busca vazia sem erro, erro de busca e erro
    meteorológico, incluindo os textos de AC-03, AC-12 e AC-13 e retry sem
    recarregar a página.
  - Relógio controlado avançado em 10 segundos remove loading, mostra a mensagem
    de timeout de AC-14 e mantém botão de retry acionável.
  - Fixture parcial mostra os cinco dias e marca a máxima ausente do último dia
    e a temperatura atual ausente sem exibir zero ou ocultar campos válidos.
- **Rastreabilidade:** FR-03 e FR-05; AC-03, AC-12 a AC-15.
- **Dependências:** T-15, T-29.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-31 — Testar concorrência de consultas ponta a ponta

- **Descrição:** Verificar que uma resposta atrasada não substitui a cidade
  selecionada mais recentemente.
- **Critérios de aceite:**
  - Teste inicia forecast de Porto e depois Lisboa, resolve Lisboa antes de
    Porto e verifica que Lisboa e seus dados continuam visíveis após ambas
    respostas serem concluídas.
  - Variante em que o request antigo rejeita após o sucesso de Lisboa verifica
    que a cidade/dados de Lisboa permanecem sem mensagem de erro de Porto.
- **Rastreabilidade:** FR-02; AC-18.
- **Dependências:** T-15, T-29.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-32 — Verificar responsividade ponta a ponta

- **Descrição:** Validar conteúdo, controles e ausência de rolagem horizontal nos
  viewports definidos.
- **Critérios de aceite:**
  - Playwright define e executa o fluxo nos viewports de 320, 375, 768, 1024 e
    1440 CSS px.
  - Em cada viewport, `document.documentElement.scrollWidth` é menor ou igual a
    `clientWidth`, e busca, resultado, mensagem e previsão são localizáveis e
    acionáveis.
  - Os cinco viewports são reportados como casos de teste independentes.
- **Rastreabilidade:** NFR-01.
- **Dependências:** T-16, T-15.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

## Entrega 8 — Hardening e liberação

### T-33 — Medir desempenho da busca

- **Descrição:** Medir o tempo de envio da busca até resultados visíveis em
  condições controladas.
- **Critérios de aceite:**
  - Teste executa exatamente 100 buscas com resposta geocoding controlada e
    atraso externo excluído da janela medida.
  - Mede cada intervalo do evento de submissão até resultados visíveis e
    calcula p95; a execução passa somente se p95 ≤ 2.000 ms.
  - Durante resposta pendente, loading é visível e um controle de busca/editável
    permanece interativo.
  - Relatório registra as 100 amostras, p95 calculado e resultado pass/fail.
- **Rastreabilidade:** NFR-02.
- **Dependências:** T-29.
- **Arquivos prováveis:** `tests/performance/geocoding.spec.ts`
- **Tipo:** Test

### T-34 — Configurar verificação sintética de disponibilidade

- **Descrição:** Criar a verificação de navegador prevista para monitorar
  disponibilidade da interface.
- **Critérios de aceite:**
  - Configuração do monitor declara intervalo de 1 minuto e timeout de 5.000 ms.
  - Verificação aprova somente se a página carregar em até 5 segundos e o campo
    de busca identificado por label estiver acessível e habilitado.
  - Com API indisponível simulada, resultado só é aprovado quando estado de erro
    e botão “Tentar novamente” estão visíveis e acionáveis; ausência de ambos
    falha a verificação.
  - Relatório mensal calcula disponibilidade como verificações aprovadas sobre
    verificações executadas e sinaliza falha se ficar abaixo de 99,5%.
- **Rastreabilidade:** NFR-03.
- **Dependências:** T-29, T-30.
- **Arquivos prováveis:** configuração de monitoramento ou workflow existente,
  `tests/e2e/availability.spec.ts`
- **Tipo:** Infra

### T-35 — Validar compatibilidade entre navegadores

- **Descrição:** Executar os fluxos essenciais na matriz de navegadores definida
  para release.
- **Critérios de aceite:**
  - Matriz de release lista versão estável atual e anterior de Chrome, Edge e
    Firefox desktop e inclui Safari macOS, Safari iOS e Chrome Android.
  - Em cada ambiente, resultados separados de busca, seleção, consulta, troca
    de unidade e retry ficam registrados como passou/falhou/não executado.
  - Release não é marcado como compatível enquanto houver fluxo obrigatório
    falhando ou ambiente obrigatório sem resultado registrado.
- **Rastreabilidade:** NFR-05.
- **Dependências:** T-29, T-30.
- **Arquivos prováveis:** configuração de browsers ou workflow existente,
  documentação de release existente
- **Tipo:** Infra

### T-36 — Automatizar verificações de acessibilidade

- **Descrição:** Integrar verificações automatizadas de acessibilidade nos
  fluxos essenciais.
- **Critérios de aceite:**
  - Uma ferramenta automatizada WCAG 2.2 AA é executada em páginas/estados de
    busca, resultados, loading, erro e sucesso com dados atuais/previsão.
  - Relatório é anexado à execução; zero violações é o resultado aprovado.
  - Cada violação encontrada tem referência ao nó/regra e fica corrigida e
    reexecutada, ou registrada como bloqueio de release.
- **Rastreabilidade:** NFR-04.
- **Dependências:** T-29, T-30.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`,
  configuração de acessibilidade existente
- **Tipo:** Test

### T-37 — Conduzir revisão manual de acessibilidade

- **Descrição:** Validar manualmente teclado, contraste e critérios WCAG 2.2 AA
  antes do release.
- **Critérios de aceite:**
  - Checklist registra conclusão por teclado dos fluxos busca, seleção, retry e
    troca de unidade, sem uso de mouse.
  - Contraste medido atende pelo menos 4,5:1 em texto normal e 3:1 em texto
    grande/componentes gráficos aplicáveis; cada medida registra cores e razão.
  - Resultado e achados são registrados com status, evidência e correção
    pendente/concluída antes do release.
- **Rastreabilidade:** NFR-04.
- **Dependências:** T-32, T-36.
- **Arquivos prováveis:** documentação de release existente
- **Tipo:** Infra

### T-38 — Confirmar condições de uso do provedor

- **Descrição:** Confirmar limites, atribuição e cobertura do Open-Meteo antes
  da publicação.
- **Critérios de aceite:**
  - Registro cita os termos oficiais consultados e a data da verificação.
  - Limites aplicáveis e requisito de atribuição ficam documentados; requisito
    de atribuição está implementado quando exigido.
  - Cobertura é verificada para cada localidade-alvo acordada; localidade sem
    confirmação consta como pendência e impede liberação correspondente.
  - A decisão final é registrada como aprovada ou bloqueada, com responsável e
    restrições identificadas.
- **Rastreabilidade:** Questão aberta e riscos da especificação sobre limites,
  atribuição e cobertura.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** documentação de release existente; `src/components/`
  somente se houver requisito de atribuição na interface
- **Tipo:** Infra
