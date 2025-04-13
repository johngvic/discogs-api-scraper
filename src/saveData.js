import fs from 'fs';

export const saveData = (filename, data) => {
  fs.writeFile(filename, data.join('\n'), () => console.log('saved'));
}