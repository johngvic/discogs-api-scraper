import { saveData } from './utils/saveData.js';
import { sleep } from './utils/sleep.js';
import vars from './vars.js';
import fs from 'fs';

const { baseUrl, userAgent, token } = vars;

fs.readFile(
  '../files/masters.csv',
  { encoding: 'utf-8' },
  async (e, data) => {
    const masterIds = data.split('\n');
    let mainReleaseIds = [];
    let counter = 0;
    const failedIds = [];

    for (const id of masterIds) {
      try {
        const url = `${baseUrl}/masters/${id}`;
        console.log(`${counter} - Request URL called: ${url}`);
  
        const response = await fetch(
          url,
          {
            headers: {
              Authorization: `Discogs token=${token}`,
              'User-Agent': userAgent
            }
          }
        );
  
        const data = await response.json();
        const mainReleaseId = data.main_release;
        mainReleaseIds.push(mainReleaseId);
        
        await sleep(1000);
        counter++;
  
        if (counter == 1500) {
          saveData(`releases_${counter}.csv`, mainReleaseIds);
          counter = 0;
          mainReleaseIds = [];
        }
      } catch (e) {
        console.error(`Failed request for ID ${id}: ${e}`)
        failedIds.push(id);
      }
    }

    saveData('failed_requests.csv', failedIds);
  }
)
