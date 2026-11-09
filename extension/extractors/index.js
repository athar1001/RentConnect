// Extractor Router for WohnBoard Extension

function detectPlatform(url) {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.toLowerCase() || parsedUrl.hash.toLowerCase() || parsedUrl.pathname.toLowerCase();

  if (hostname.includes("immobilienscout24.de")) {
    return "IMMOSCOUT24";
  }
  if (hostname.includes("wg-gesucht.de")) {
    return "WG_GESUCHT";
  }
  if (hostname.includes("kleinanzeigen.de")) {
    return "KLEINANZEIGEN";
  }
  if (hostname.includes("immowelt.de")) {
    return "IMMOWELT";
  }
  if (hostname.includes("immonet.de")) {
    return "IMMONET";
  }
  if (hostname.includes("housinganywhere.com")) {
    return "HOUSINGANYWHERE";
  }
  if (hostname.includes("wunderflats.com")) {
    return "WUNDERFLATS";
  }
  if (hostname.includes("spotahome.com")) {
    return "SPOTAHOME";
  }
  if (hostname.includes("nestpick.com")) {
    return "NESTPICK";
  }
  if (hostname.includes("degewo.de")) {
    return "DEGEWO";
  }
  if (hostname.includes("gesobau.de")) {
    return "GESOBAU";
  }
  if (hostname.includes("howoge.de")) {
    return "HOWOGE";
  }
  if (hostname.includes("gewobag.de")) {
    return "GEWOBAG";
  }
  if (hostname.includes("wbm.de")) {
    return "WBM";
  }
  if (hostname.includes("stadtundland.de")) {
    return "STADTUNDLAND";
  }
  if (hostname.includes("berlinovo.de")) {
    return "BERLINOVO";
  }
  if (hostname.includes("vonovia.de")) {
    return "VONOVIA";
  }
  if (hostname.includes("deutsche-wohnen.com")) {
    return "DEUTSCHE_WOHNEN";
  }
  if (hostname.includes("leg-wohnen.de")) {
    return "LEG_WOHNEN";
  }
  if (hostname.includes("buwog.de")) {
    return "BUWOG";
  }
  if (hostname.includes("grandcityproperty.de")) {
    return "GRANDCITYPROPERTY";
  }
  if (hostname.includes("tag-wohnen.de")) {
    return "TAG_WOHNEN";
  }
  if (hostname.includes("saga.hamburg")) {
    return "SAGA";
  }
  if (hostname.includes("stw.berlin")) {
    return "STW_BERLIN";
  }
  if (hostname.includes("studierendenwerk-muenchen-oberbayern.de")) {
    return "STW_MUENCHEN";
  }
  if (hostname.includes("stwhh.de")) {
    return "STW_HAMBURG";
  }

  return "GENERIC";
}

function extractApartmentFromPage() {
  const platform = detectPlatform(window.location.href);

  switch (platform) {
    case "IMMOSCOUT24":
      return extractImmoScout24();
    case "WG_GESUCHT":
      return extractWGGesucht();
    case "KLEINANZEIGEN":
      return extractKleinanzeigen();
    case "IMMOWELT":
      return extractImmowelt();
    case "IMMONET":
      return extractImmonet();
    case "HOUSINGANYWHERE":
      return extractHousingAnywhere();
    case "WUNDERFLATS":
      return extractWunderflats();
    case "SPOTAHOME":
      return extractSpotahome();
    case "NESTPICK":
      return extractNestpick();
    case "DEGEWO":
      return extractDegewo();
    case "GESOBAU":
      return extractGesobau();
    case "HOWOGE":
      return extractHowoge();
    case "GEWOBAG":
      return extractGewobag();
    case "WBM":
      return extractWbm();
    case "STADTUNDLAND":
      return extractStadtUndLand();
    case "BERLINOVO":
      return extractBerlinovo();
    case "VONOVIA":
      return extractVonovia();
    case "DEUTSCHE_WOHNEN":
      return extractDeutscheWohnen();
    case "LEG_WOHNEN":
      return extractLegWohnen();
    case "BUWOG":
      return extractBuwog();
    case "GRANDCITYPROPERTY":
      return extractGrandCityProperty();
    case "TAG_WOHNEN":
      return extractTagWohnen();
    case "SAGA":
      return extractSagaHamburg();
    case "STW_BERLIN":
      return extractStwBerlin();
    case "STW_MUENCHEN":
      return extractStudierendenwerkMuenchen();
    case "STW_HAMBURG":
      return extractStwHamburg();
    default:
      return extractGeneric();
  }
}
