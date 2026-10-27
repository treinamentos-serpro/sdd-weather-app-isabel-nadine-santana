import { useId } from 'react';
import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ days, unit }: ForecastListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="font-sans text-white">
      <h2 id={headingId} className="mb-4 text-2xl font-semibold">
        Previsão de 5 dias
      </h2>
      {days.length === 0 ? (
        <p role="status" className="text-slate-300">
          Previsão indisponível.
        </p>
      ) : (
        // biome-ignore lint/a11y/noRedundantRoles: Preserva a lista no VoiceOver/Safari com list-style none do Tailwind.
        <ul role="list" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {days.map((day) => (
            <li key={day.date} className="min-w-0">
              <ForecastCard day={day} unit={unit} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
