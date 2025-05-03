import { saveData } from '../utils/saveData.js';
import { sleep } from '../utils/sleep.js';
import vars from './vars.js';
import fs from 'fs';

const { baseUrl, userAgent, token } = vars;

const extractReleaseData = (release) => {
  const { artists, extraartists, images } = release;
  const parsedArtists = artists?.map(({ name, anv, role, id }) => ({ name, anv, role, id }));
  const parsedExtraartists = extraartists?.map(({ name, anv, role, id }) => ({ name, anv, role, id }));
  const [image] = images?.filter(({ uri }) => uri);

  const data = {
    id: release.id,
    title: release.title,
    year: release.year,
    cover: image.uri ?? '',
    genres: release.genres,
    styles: release.styles,
    artists: parsedArtists,
    extraartists: parsedExtraartists
  };

  return data;
};

fs.readFile(
  '../../files/releases.csv',
  { encoding: 'utf-8' },
  async (e, data) => {
    const releaseIds = data.split('\n');
    const failedReleases = [];
    let releaseInfo = [];
    let counter = 0;
    let cycle = 0;

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
          saveData(`release_info_${cycle}.json`, releaseInfo);
          counter = 0;
          cycle++;
          releaseInfo = [];
        }

        // TODO: Remove this afterwards...
        if (cycle == 4) {
          break;
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
