import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type Operation = { type: 'search'; name: string } | { type: 'select'; city: City };

interface WeatherHookState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  data: WeatherData | null;
  cities: City[];
  city: City | null;
  error: string | null;
  query: string;
}

export function useWeather() {
  const [state, setState] = useState<WeatherHookState>({
    status: 'idle',
    data: null,
    cities: [],
    city: null,
    error: null,
    query: '',
  });
  const requestId = useRef(0);
  const lastOperation = useRef<Operation | null>(null);

  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  const execute = useCallback(async (operation: Operation): Promise<void> => {
    const id = ++requestId.current;
    lastOperation.current = operation;
    setState((previous) => ({
      ...previous,
      status: 'loading',
      data: null,
      error: null,
      city: operation.type === 'select' ? operation.city : null,
      ...(operation.type === 'search' ? { query: operation.name, cities: [] } : {}),
    }));

    try {
      let city: City;
      if (operation.type === 'search') {
        if (!operation.name) {
          throw new Error('O nome da cidade é obrigatório.');
        }
        const cities = await searchCities(operation.name);
        if (id !== requestId.current) return;
        const firstCity = cities[0];
        setState((previous) => ({
          ...previous,
          cities,
          city: firstCity ?? null,
          status: firstCity ? 'loading' : 'empty',
        }));
        if (!firstCity) return;
        city = firstCity;
      } else {
        city = operation.city;
      }

      const data = await getWeather(city);
      if (id !== requestId.current) return;
      setState((previous) => ({ ...previous, status: 'success', data }));
    } catch (error) {
      if (id !== requestId.current) return;
      setState((previous) => ({
        ...previous,
        status: 'error',
        error: error instanceof Error ? error.message : 'Não foi possível consultar o clima.',
      }));
    }
  }, []);

  const search = useCallback(
    (name: string) => execute({ type: 'search', name: name.trim() }),
    [execute],
  );
  const selectCity = useCallback((city: City) => execute({ type: 'select', city }), [execute]);
  const retry = useCallback(async (): Promise<void> => {
    if (lastOperation.current) await execute(lastOperation.current);
  }, [execute]);

  return { ...state, search, selectCity, retry };
}

export default useWeather;
