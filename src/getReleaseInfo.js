import { saveData } from './utils/saveData.js';
import { sleep } from './utils/sleep.js';
import vars from './vars.js';
import fs from 'fs';

const { baseUrl, userAgent, token } = vars;

const extractReleaseData = (release) => {
  const { artists, extraartists, images } = release;
  const parsedArtists = artists?.map(({ name, anv, role, id }) => ({ name, anv, role, id }));
  const parsedExtraartists = extraartists?.map(({ name, anv, role, id }) => ({ name, anv, role, id }));
  const [cover] = images?.filter(({ type }) => type == 'primary');

  const data = {
    id: release.id,
    title: release.title,
    year: release.year,
    genres: release.genres,
    styles: release.styles,
    artists: parsedArtists,
    extraartists: parsedExtraartists,
    cover
  };

  return data;
};

fs.readFile(
  '../files/releases.csv',
  { encoding: 'utf-8' },
  async (e, data) => {
    const releaseIds = data.split('\n');
    const failedReleases = [];
    let releaseInfo = [];
    let counter = 0;

    for (const id of releaseIds) {
      try {
        const url = `${baseUrl}/releases/${id}`;
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
        const release = extractReleaseData(data);
        releaseInfo.push(release);
        
        await sleep(1000);
        counter++;
  
        if (counter == 1500) {
          saveData(`release_info_${counter}.json`, releaseInfo);
          counter = 0;
          releaseInfo = [];
        }
      } catch (e) {
        console.error(`Failed to get release info for ID ${id}: ${e}`)
        failedReleases.push(id);
      }
    }

    if (releaseInfo.length > 0) {
      saveData(`release_info_last.json`, releaseInfo);
      console.log(`Saved remaining ${releaseInfo.length} items`);
    }

    if (failedReleases.length > 0) {
      saveData('failed_releases.csv', failedReleases);
    }
  }
)
