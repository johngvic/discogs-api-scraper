import { saveData } from '../utils/saveData.js';
import { sleep } from '../utils/sleep.js';
import vars from './vars.js';
import fs from 'fs';

const { baseUrl, userAgent, token } = vars;

fs.readFile(
  '../../files/masters.csv',
  { encoding: 'utf-8' },
  async (e, data) => {
    const masterIds = data.split('\n');
    let mainReleaseIds = [];
    let counter = 0;
    let cycle = 0;
    const failedIds = [];

    for (const id of masterIds) {
      try {
        const parsedId = Number(id)
        const url = `${baseUrl}/masters/${parsedId}`;
        console.log(`${counter} - ${parsedId} - Request URL called: ${url}`);
  
        const response = await fetch(
          url,
          {
            headers: {
              Authorization: `Discogs token=${token}`,
              'User-Agent': userAgent
            }
          }
        );
  
        const dt = await response.json();
        const mainReleaseId = dt.main_release;
        mainReleaseIds.push(mainReleaseId);

        console.log({ master: parsedId, release: mainReleaseId })
        
        await sleep(1000);
        counter++;
  
        if (counter == 1500) {
          saveData(`releases_${cycle}.csv`, mainReleaseIds);
          counter = 0;
          cycle++;
          mainReleaseIds = [];
        }
      } catch (e) {
        console.error(`Failed request for ID ${id}: ${e}`)
        failedIds.push(id);
      }
    }

    if (mainReleaseIds.length > 0) {
      saveData(`releases_last.csv`, mainReleaseIds);
      console.log(`Saved remaining ${mainReleaseIds.length} items`);
    }

    if (failedIds.length > 0) {
      saveData('failed_requests.csv', failedIds);
    }
  }
)
