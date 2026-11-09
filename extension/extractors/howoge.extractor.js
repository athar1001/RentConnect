// Howoge Extractor for WohnBoard Extension

const extractHowoge = createPlatformExtractor('howoge', 'Howoge', {
  idRegex: /detail\/([a-zA-Z0-9-]+)/,
  titleSelectors: ['h1']
});
