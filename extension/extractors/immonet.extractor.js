// Immonet Extractor for WohnBoard Extension

const extractImmonet = createPlatformExtractor('immonet', 'Immonet', {
  idRegex: /angebot\/([a-zA-Z0-9]+)/,
  titleSelectors: ['h1']
});
