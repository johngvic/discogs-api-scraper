import docs from './data.json' assert { type: 'json' };
import { SearchSetup } from './SearchSetup.js';

const searchSetup = new SearchSetup(docs);
// searchSetup.buildInvertedIndex()
console.log(searchSetup.buildTokensMatrix);
