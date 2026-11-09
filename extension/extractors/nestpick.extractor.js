// Nestpick Extractor for WohnBoard Extension

const extractNestpick = createPlatformExtractor('nestpick', 'Nestpick', {
  idRegex: /show\/([a-zA-Z0-9-]+)/,
  titleSelectors: ['h1']
});
