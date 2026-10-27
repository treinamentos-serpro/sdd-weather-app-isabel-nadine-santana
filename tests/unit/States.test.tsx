import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('LoadingState', () => {
  it('announces the default loading message without retry controls', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('supports a message identifying the pending operation', () => {
    render(<LoadingState message="Buscando cidades..." />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades...');
  });
});

describe('ErrorState', () => {
  it.each([
    'Não foi possível concluir a busca. Tente novamente.',
    'Não foi possível carregar o clima. Tente novamente.',
    'A consulta demorou demais. Tente novamente.',
  ])('announces the supplied error: %s', (message) => {
    render(<ErrorState message={message} onRetry={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('calls retry once per click and does not submit a containing form', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ErrorState
          message="Não foi possível carregar o clima. Tente novamente."
          onRetry={onRetry}
        />
      </form>,
    );

    expect(onRetry).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(['{Enter}', ' '])('supports keyboard retry with %s', async (key) => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="A consulta demorou demais. Tente novamente." onRetry={onRetry} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard(key);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyState', () => {
  it('shows a labelled title and hint without presenting an error or retry', () => {
    render(
      <EmptyState
        title="Nenhuma cidade encontrada"
        hint="Confira o nome ou tente buscar outra cidade."
      />,
    );

    expect(screen.getByRole('region', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Confira o nome ou tente buscar outra cidade.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('state transitions', () => {
  it('removes loading when replaced by an error or empty result', () => {
    const { rerender } = render(<LoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(
      <ErrorState
        message="Não foi possível concluir a busca. Tente novamente."
        onRetry={vi.fn()}
      />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<LoadingState />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<EmptyState title="Nenhuma cidade encontrada" hint="Tente outro nome." />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
  });
});
