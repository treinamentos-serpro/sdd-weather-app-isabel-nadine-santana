import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import useWeather from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, city, error, search, retry } = useWeather();
  const mainRef = useRef<HTMLElement>(null);
  const focusResults = useRef(false);

  useEffect(() => {
    if (focusResults.current && status !== 'idle' && status !== 'loading') {
      mainRef.current?.focus();
      focusResults.current = false;
    }
  }, [status]);

  function handleSearch(name: string) {
    focusResults.current = true;
    void search(name);
  }

  function handleRetry() {
    focusResults.current = true;
    void retry();
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
          <SearchBar onSearch={handleSearch} disabled={status === 'loading'} />
        </header>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {status === 'empty' && 'Nenhuma cidade encontrada'}
          {status === 'success' &&
            city &&
            `Clima de ${city.name} disponível. Temperaturas em ${unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}.`}
        </div>
        <main
          id="main-content"
          ref={mainRef}
          aria-label="Clima e previsão"
          tabIndex={-1}
          className="space-y-8 rounded-xl [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-4 focus-visible:ring-offset-night-900"
        >
          {status === 'idle' && (
            <EmptyState
              title="Consulte o clima de uma cidade"
              hint="Digite uma cidade e selecione Buscar para consultar o clima."
            />
          )}
          {status === 'loading' && <LoadingState message="Carregando dados meteorológicos..." />}
          {status === 'empty' && (
            <EmptyState
              title="Nenhuma cidade encontrada"
              hint="Verifique o nome ou tente buscar outra cidade."
            />
          )}
          {status === 'error' && (
            <ErrorState
              message={error ?? 'Não foi possível carregar o clima. Tente novamente.'}
              onRetry={handleRetry}
            />
          )}
          {status === 'success' && data && city && (
            <>
              <CurrentWeather city={city} current={data.current} unit={unit} />
              <ForecastList days={data.days} unit={unit} />
            </>
          )}
        </main>
        <footer className="border-t border-white/10 pt-4 text-sm text-slate-300">
          Dados meteorológicos fornecidos pela{' '}
          <a className="underline" href="https://open-meteo.com/">
            Open-Meteo
          </a>
          .
        </footer>
      </div>
    </div>
  );
}
