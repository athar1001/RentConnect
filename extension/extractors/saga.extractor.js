// SAGA Hamburg Extractor for WohnBoard Extension

const extractSagaHamburg = createPlatformExtractor('saga', 'SAGA Hamburg', {
  idRegex: /details\/([a-zA-Z0-9-]+)/,
  titleSelectors: ['h1']
});
