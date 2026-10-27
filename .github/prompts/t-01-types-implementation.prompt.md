---
description: "Implementa T-01: contratos TypeScript compartilhados do Weather App."
agent: "code"
---

# Implementar T-01 — Definir os tipos compartilhados do domínio

Implemente somente a tarefa **T-01** do backlog do Weather App. Este prompt é
autocontido para uso futuro pelo Coding Agent.

## Contexto

O projeto é uma aplicação client-side em React e TypeScript strict. A arquitetura
separa apresentação (`components/`), orquestração (`hooks/`), acesso a dados
(`services/`) e funções puras (`lib/`). Os tipos desta tarefa definem o contrato
interno entre essas camadas; os componentes não devem consumir nem conhecer
diretamente os formatos JSON da API.

Os services validarão e normalizarão respostas externas. Campos meteorológicos
potencialmente ausentes devem permanecer explicitamente como `null`; nunca
representá-los como zero ou reutilizar dados anteriores. Temperaturas recebidas
são armazenadas em Celsius.

## Escopo

Crie ou atualize somente:

- `src/types/weather.ts`

Antes de editar, verifique se o arquivo e a pasta existem e siga as convenções
locais. Não altere componentes, services, hooks, configuração, dependências ou
outros arquivos. Não implemente lógica de conversão, formatação, acesso à API ou
UI nesta tarefa.

## Contratos a declarar e exportar

```ts
export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: string;
  name: string;
  admin1: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  referenceTime: string | null;
  timezone: string | null;
  utcOffsetSeconds: number | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
}

export interface WeatherData {
  current: CurrentWeather;
  days: ForecastDay[];
}

export type RequestError =
  | { kind: 'network' }
  | { kind: 'api'; message?: string }
  | { kind: 'timeout' }
  | { kind: 'invalid-response' };

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; results: City[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: RequestError };

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading'; city: City }
  | { status: 'success'; city: City; data: WeatherData }
  | { status: 'empty'; city: City; message: string }
  | { status: 'error'; city: City; error: RequestError };
```

Mantenha os contratos e os nomes de propriedades exatamente como especificados
acima.

## Critérios de aceite

- O arquivo exporta `Unit`, `City`, `CurrentWeather`, `ForecastDay`,
  `WeatherData`, `RequestError`, `SearchState` e `WeatherState`.
- `Unit` aceita somente `'celsius'` ou `'fahrenheit'`.
- `SearchState` e `WeatherState` permitem narrowing seguro pelo campo `status`;
  cada variante declara somente os campos pertinentes a seu estado.
- `RequestError` permite narrowing pelo campo `kind`; somente a variante `api`
  tem `message` opcional.
- Campos meteorológicos potencialmente ausentes aceitam `null`; latitude e
  longitude de `City` continuam obrigatórias e numéricas.
- Não há `any`, casts para contornar tipos, tipos de payload externo ou novas
  dependências.
- A compilação TypeScript strict termina sem erros.
- Nenhum arquivo fora de `src/types/weather.ts` é modificado.

## Validação

Execute os comandos padrão do projeto:

1. `pnpm lint`
2. `pnpm build`
3. `pnpm test`

Corrija falhas causadas por esta tarefa sem sair do escopo de edição. Se um
comando falhar por motivo preexistente ou alheio ao arquivo de tipos, informe o
comando, a falha observada e por que ela não foi causada por esta tarefa. Não
omita falhas nem faça alterações fora do escopo para contorná-las.

## Relato final

Ao concluir, informe:

- arquivo alterado;
- tipos exportados;
- resultado exato dos três comandos de validação;
- bloqueios ou falhas não relacionadas à tarefa.
