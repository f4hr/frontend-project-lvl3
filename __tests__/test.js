import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import { promises as fs } from 'fs';
import path from 'path';
import init from '../src/js/init';

beforeEach(async () => {
  const pathToHtml = path.resolve(__dirname, '__fixtures__/index.html');
  const html = await fs.readFile(pathToHtml, 'utf8');
  document.body.innerHTML = html;
  await init();
});

test('initial DOM structure', () => {
  const urlInput = screen.getByLabelText('Ссылка RSS');

  expect(urlInput).toHaveFocus();
  expect(urlInput).toHaveValue('');
});
