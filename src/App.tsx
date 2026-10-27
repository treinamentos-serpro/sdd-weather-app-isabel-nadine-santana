import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import type { Unit, WeatherState } from './types/weather';
import { mockCity, mockWeatherData } from './types/weather';

const demoStates = [
  { status: 'idle', label: 'Inicial' },
  { status: 'loading', label: 'Carregando' },
  { status: 'empty', label: 'Sem dados' },
  { status: 'error', label: 'Erro' },
  { status: 'success', label: 'Sucesso' },
] as const;

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [state, setState] = useState<WeatherState>({ status: 'idle' });
  const mainRef = useRef<HTMLElement>(null);
  const focusResults = useRef(false);

  useEffect(() => {
    if (focusResults.current && state.status === 'success') {
      mainRef.current?.focus();
      focusResults.current = false;
    }
  }, [state]);

  function showMockWeather() {
    setState({ status: 'success', city: mockCity, data: mockWeatherData });
  }

  function showSearchResults() {
    focusResults.current = true;
    showMockWeather();
  }

  function selectDemoState(status: WeatherState['status']) {
    switch (status) {
      case 'idle':
        setState({ status: 'idle' });
        break;
      case 'loading':
        setState({ status, city: mockCity });
        break;
      case 'empty':
        setState({ status, city: mockCity, message: 'Dados meteorológicos indisponíveis' });
        break;
      case 'error':
        setState({ status, city: mockCity, error: { kind: 'network' } });
        break;
      case 'success':
        showMockWeather();
        break;
    }
  }

  return (
    <div className="min-h-screen bg-night-900 font-sans text-white">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-accent-400 p-3 text-night-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-10"
      >
        Ir para o conteúdo
      </a>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:py-10">
        <header className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <span aria-hidden="true" className="mr-2 text-sun">
                ☀
              </span>
              SDD Weather
            </h1>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
          <SearchBar onSearch={showSearchResults} disabled={state.status === 'loading'} />
          <p className="text-sm text-slate-300">
            Demonstração sem API: qualquer busca válida mostra dados fictícios de Porto, Portugal,
            com datas fixas. Os controles abaixo simulam os estados da tela.
          </p>
          <div role="group" aria-label="Estados de demonstração" className="flex flex-wrap gap-2">
            {demoStates.map(({ status, label }) => (
              <button
                key={status}
                type="button"
                aria-pressed={state.status === status}
                onClick={() => selectDemoState(status)}
                className="min-h-11 min-w-11 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 aria-pressed:bg-accent-400 aria-pressed:text-night-900"
              >
                {label}
              </button>
            ))}
          </div>
        </header>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {state.status === 'empty' && state.message}
          {state.status === 'success' &&
            `Clima de ${state.city.name} disponível. Temperaturas em ${unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}.`}
        </div>
        <main
          id="main-content"
          ref={mainRef}
          aria-label="Clima e previsão"
          tabIndex={-1}
          className="space-y-8 rounded-xl [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-4 focus-visible:ring-offset-night-900"
        >
          {state.status === 'idle' && (
            <EmptyState
              title="Consulte o clima de uma cidade"
              hint="Digite uma cidade e selecione Buscar para visualizar o exemplo de Porto."
            />
          )}
          {state.status === 'loading' && <LoadingState message="Carregando o clima de Porto..." />}
          {state.status === 'empty' && (
            <EmptyState
              title={state.message}
              hint="Tente buscar novamente para ver os dados de exemplo."
            />
          )}
          {state.status === 'error' && (
            <ErrorState
              message="Não foi possível carregar o clima. Tente novamente."
              onRetry={showSearchResults}
            />
          )}
          {state.status === 'success' && (
            <>
              <CurrentWeather city={state.city} current={state.data.current} unit={unit} />
              <ForecastList days={state.data.days} unit={unit} />
            </>
          )}
        </main>
        <footer className="border-t border-white/10 pt-4 text-sm text-slate-300">
          Interface em desenvolvimento · Dados fictícios, não use como previsão real.
        </footer>
      </div>
    </div>
  );
}
