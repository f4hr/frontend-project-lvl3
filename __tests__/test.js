// eslint-disable-next-line testing-library/no-dom-import
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { promises as fs } from 'fs';
import path from 'path';
import init from '../src/js/app';

beforeEach(async () => {
  const pathToHtml = path.resolve(__dirname, '../__fixtures__/index.html');
  const html = await fs.readFile(pathToHtml, 'utf8');
  document.body.innerHTML = html;
  await init();
});

test('initial DOM structure', () => {
  const urlInput = screen.getByLabelText('Ссылка RSS');

  expect(urlInput).toHaveFocus();
  expect(urlInput).toHaveValue('');
});

describe('add RSS feed', () => {
  it('should add valid RSS', async () => {
    userEvent.type(screen.getByRole('textbox', { name: 'url' }), 'https://ru.hexlet.io/lessons.rss');
    userEvent.click(screen.getByRole('button', { name: 'add' }));

    expect(await screen.findByText(/RSS успешно загружен/i)).toBeInTheDocument();
  });

  it('should not add already existing feed', async () => {
    userEvent.type(screen.getByRole('textbox', { name: 'url' }), 'https://ru.hexlet.io/lessons.rss');
    userEvent.click(screen.getByRole('button', { name: 'add' }));

    expect(await screen.findByText(/RSS успешно загружен/i)).toBeInTheDocument();

    userEvent.type(screen.getByRole('textbox', { name: 'url' }), 'https://ru.hexlet.io/lessons.rss');
    userEvent.click(screen.getByRole('button', { name: 'add' }));

    expect(await screen.findByText(/RSS уже существует/i)).toBeInTheDocument();
  });

  it('should not add invalid URL', async () => {
    userEvent.clear(screen.getByRole('textbox', { name: 'url' }));
    userEvent.type(screen.getByRole('textbox', { name: 'url' }), '123');
    userEvent.click(screen.getByRole('button', { name: 'add' }));

    expect(await screen.findByText(/Ссылка должна быть валидным URL/i)).toBeInTheDocument();
  });
});
