// LEG Wohnen Extractor for WohnBoard Extension

const extractLegWohnen = createPlatformExtractor('leg-wohnen', 'LEG Wohnen', {
  idRegex: /detail\/([a-zA-Z0-9-]+)/,
  titleSelectors: ['h1']
});
