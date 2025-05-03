export class SearchSetup {
  static STOP_WORDS = [
    'a', 'an', 'the', 'of', 'and', 'in', 'about', 'to', 'for'
  ];

  constructor(documents) {
    this.documents = documents;
    this.buildTokensMatrix();
    this.buildInvertedIndex();
    this.buildStoredFields();
    this.buildDocValues();
  }

  normalizeTokens(text) {
    const tokens = text.toLowerCase().split(' ');
    return tokens.filter(it => !SearchSetup.STOP_WORDS.includes(it));
  }

  tokenizeField(field, value) {
    let normalizedTokens;

    if (Array.isArray(value)) {
      normalizedTokens = value.map((it) => this.normalizeTokens(it))
    } else {
      normalizedTokens = this.normalizeTokens(value)
    }

    const tokensDict = normalizedTokens.map((it) => ({ field, value: it }));
    return tokensDict;
  }

  buildTokensMatrix() {
    const tokensMap = {};

    this.documents.forEach(({ id, title, author, genre }) => {
      const tokens = [
        ...this.tokenizeField('title', title),
        ...this.tokenizeField('author', author),
        ...this.tokenizeField('genre', genre)
      ]
    
      tokensMap[id] = tokens;
    })

    this.tokensMatrix = Object.values(tokensMap);
  }

  buildInvertedIndex() {
    const matrix = this.tokensMatrix;
    const invertedIndex = {};

    // Iterates over each token array of each document
    matrix.forEach((tokens, index) => {
      const docId = index + 1;
      tokens.forEach((token) => {
        const value = token.value;
        if (!invertedIndex[value]) {
          invertedIndex[value] = [{ docId, field: token.field }]
        } else {
          invertedIndex[value] = [...invertedIndex[value], { docId, field: token.field }]
        }
      })
    });

    const sortedInvertedIndex = {};
    Object.keys(invertedIndex).sort().forEach((it) => {
      sortedInvertedIndex[it] = invertedIndex[it];
    });

    this.invertedIndex = sortedInvertedIndex;
  }

  buildStoredFields() {
    const storedFields = {};

    this.documents.forEach((it) => {
      storedFields[it.id] = it;
    });

    this.storedFields = storedFields;
  }

  buildDocValues() {
    const docValues = {
      genre: [],
      publishedYear: []
    };

    this.documents.forEach(({ genre, publishedYear }) => {
      docValues.genre.push(genre ?? null);
      docValues.publishedYear.push(publishedYear ?? null);
    })

    this.docValues = docValues;
  }

  search(query, options = { field: 'title' }) {
    const { field } = options;
    const tokens = this.normalizeTokens(query);
    const matchingDocs = new Set();

    tokens.forEach((it) => {
      const postings = this.invertedIndex[it] || [];
      
      postings.forEach((posting) => {
        if (field == posting.field) {
          matchingDocs.add(posting.docId)
        }
      })
    })

    const docIds = Array.from(matchingDocs);
    const hits = docIds.map((id) => this.storedFields[id]);

    return { hits };
  }

  print() {
    console.log('Inverted Index:', this.invertedIndex);
    console.log('Stored Fields:', this.storedFields);
    console.log('Doc Values:', this.docValues);
  }
}
