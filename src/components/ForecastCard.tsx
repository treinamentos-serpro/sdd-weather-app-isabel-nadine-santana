import { useId } from 'react';
import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

const probabilityFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const headingId = useId();
  const condition = getWeatherCondition(day.weatherCode);
  const maximum = formatTemperature(day.temperatureMaxC, unit);
  const minimum = formatTemperature(day.temperatureMinC, unit);
  const probability =
    typeof day.precipitationProbabilityPercent !== 'number' ||
    !Number.isFinite(day.precipitationProbabilityPercent) ||
    day.precipitationProbabilityPercent < 0 ||
    day.precipitationProbabilityPercent > 100
      ? 'Indisponível'
      : `${probabilityFormatter.format(day.precipitationProbabilityPercent)} %`;

  return (
    <article
      aria-labelledby={headingId}
      className="h-full min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 font-sans text-white shadow-glass backdrop-blur-md [overflow-wrap:anywhere] sm:p-4"
    >
      <h3 id={headingId} className="break-words text-sm font-semibold">
        <time dateTime={day.date}>{formatDayLabel(day.date)}</time>
      </h3>
      <span aria-hidden="true" className="my-4 block text-3xl text-sun sm:text-4xl">
        {condition.icon}
      </span>
      <p className="mb-4 break-words text-sm text-slate-300">{condition.label}</p>
      <dl className="space-y-2">
        <div>
          <dt className="text-sm text-slate-300">Máxima</dt>
          <dd className="break-words text-lg font-semibold">{maximum ?? 'Indisponível'}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-300">Mínima</dt>
          <dd className="break-words text-lg">{minimum ?? 'Indisponível'}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-300">Probabilidade de chuva</dt>
          <dd className="break-words text-sm">{probability}</dd>
        </div>
      </dl>
    </article>
  );
}
