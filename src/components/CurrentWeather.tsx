import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { formatReferenceTime } from '../lib/time';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

const metricFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherCondition(current.weatherCode);
  const temperature = formatTemperature(current.temperatureC, unit);
  const reference = formatReferenceTime(
    current.referenceTime,
    current.timezone,
    current.utcOffsetSeconds,
  );
  const location = [city.admin1, city.country].filter(Boolean).join(', ');
  const formatMetric = (value: number | null | undefined, suffix: string): string =>
    typeof value === 'number' && Number.isFinite(value)
      ? `${metricFormatter.format(value)} ${suffix}`
      : 'Indisponível';
  const metrics = [
    { label: 'Umidade', value: current.humidityPercent, suffix: '%' },
    { label: 'Vento', value: current.windSpeedKmh, suffix: 'km/h' },
    { label: 'Precipitação', value: current.precipitationMm, suffix: 'mm' },
    { label: 'Pressão', value: current.pressureHpa, suffix: 'hPa' },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 font-sans text-white shadow-glass backdrop-blur-md [overflow-wrap:anywhere] sm:p-8"
    >
      <header>
        <p className="text-sm text-slate-300">Condições atuais</p>
        <h2 id={headingId} className="break-words text-2xl font-semibold sm:text-3xl">
          {city.name}
        </h2>
        <p className="mt-1 text-slate-300">{location || `${city.latitude}, ${city.longitude}`}</p>
      </header>
      <div className="my-6 flex flex-wrap items-center gap-6">
        <span aria-hidden="true" className="text-6xl text-sun sm:text-7xl">
          {condition.icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-slate-300">Temperatura atual</p>
          <p
            className={
              temperature === null
                ? 'break-words text-xl font-semibold'
                : 'break-words text-5xl font-semibold tracking-tight sm:text-7xl'
            }
          >
            {temperature ?? 'Temperatura indisponível'}
          </p>
          <p className="mt-2 text-lg">{condition.label}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, suffix }) => (
          <div key={label} className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3">
            <dt className="text-sm text-slate-300">{label}</dt>
            <dd className="mt-1 break-words text-lg font-semibold">
              {formatMetric(value, suffix)}
            </dd>
          </div>
        ))}
      </dl>
      <footer className="mt-6 space-y-1 text-sm text-slate-300">
        <p>{reference ? `Dados referentes a ${reference}` : 'Referência temporal indisponível'}</p>
        <p>Estimativa do modelo meteorológico, não uma observação local medida.</p>
      </footer>
    </section>
  );
}
