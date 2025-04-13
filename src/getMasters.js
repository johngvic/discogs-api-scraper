import { saveData } from './saveData.js';
import vars from './vars.js';

const sleep = async (ms) => {
  await new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const { baseUrl, userAgent, token } = vars;
  let masterIds = [];
  let page = 91;
  const perPage = 100;

  while (true) {
    console.log(`Processing page ${page}. Already ${masterIds.length} processed IDs`);

    const response = await fetch(
      `${baseUrl}/search?type=master&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Discogs token=${token}`,
          'User-Agent': userAgent
        }
      }
    );

    if (response.status !== 200) break;

    const data = await response.json();
    masterIds.push(...data.results.map(result => String(result.id)));

    if (page % 10 === 0) {
      saveData(`masters_${page}.csv`, masterIds);
      masterIds = []
    }
    
    if (!data.pagination.urls.next) break;

    page++;
    sleep(1000);
  }
})()