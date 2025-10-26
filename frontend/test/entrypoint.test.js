const fs = require('fs');
const path = require('path');

describe('Entrypoint integrity', () => {
  test('main.jsx imports ./App', () => {
    const filePath = path.join(__dirname, '..', 'src', 'main.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toMatch(/from\s+['"]\.\/App['"]/);
  });
});
