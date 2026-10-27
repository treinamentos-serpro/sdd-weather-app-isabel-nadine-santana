import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('exposes an accessible search landmark, input and button', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Nome da cidade' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
  });

  it.each([
    'São Paulo',
    'Aix-en-Provence',
    "O'Fallon",
    'Rio  de Janeiro',
  ])('trims only the edges of %s when searching by button', async (city) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Nome da cidade'), `  ${city}  `);
    expect(onSearch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith(city);
  });

  it('submits once when pressing Enter in the input', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Nome da cidade'), '  Porto  {Enter}');

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Porto');
  });

  it.each(['', '   '])('rejects an empty query %j and announces the error', async (city) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByLabelText('Nome da cidade');
    if (city) await user.type(input, city);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('O nome da cidade é obrigatório.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription('O nome da cidade é obrigatório.');

    await user.type(input, 'Porto{Enter}');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Porto');
  });

  it('disables both controls and blocks submissions while disabled', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByLabelText('Nome da cidade'), 'Porto');

    rerender(<SearchBar onSearch={onSearch} disabled />);

    expect(screen.getByLabelText('Nome da cidade')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).not.toHaveBeenCalled();

    rerender(<SearchBar onSearch={onSearch} disabled={false} />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Porto');
  });

  it('gives each instance a unique label association', () => {
    render(
      <>
        <SearchBar onSearch={vi.fn()} />
        <SearchBar onSearch={vi.fn()} />
      </>,
    );

    const inputs = screen.getAllByLabelText('Nome da cidade');
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });
});
