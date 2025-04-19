import fs from 'fs';

export const saveData = (filename, data) => {
  const [_, fileExtension] = filename.split('.');

  switch (fileExtension) {
    case 'csv':
      fs.writeFile(filename, data.join('\n'), () => console.log('saved'));
      break;
    case 'json':
      fs.writeFile(filename, JSON.stringify(data), () => console.log('saved'));
      break;
  }
}
