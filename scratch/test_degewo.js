const { JSDOM } = require('jsdom');

const userHtml = `
<main class="c-main" id="main">
                <div class="c-section-wrapper r-raster:col-1-12-1
    c-section-wrapper--hero
    
    
    ">


        <!--TYPO3SEARCH_begin--><div class="c-hero r-raster:col-1-12-1  c-hero--simple
    " id="c7732">

        <div class="c-hero__bg c-hero__bg--color u-color-bg:surface-brand-2" aria-hidden="true"></div>




        <div class="c-hero__bubble c-hero__bubble--illustration"><svg width="1222" height="774" viewBox="0 0 1222 774" fill="none" xmlns="http://www.w3.org/2000/svg" class="c-vector">
    <path d="M345.269 723.769C434.656 648.494 446.799 514.154 372.391 423.714C297.983 333.273 165.201 320.98 75.8142 396.256C-13.5725 471.531 -25.715 605.871 48.693 696.311C123.101 786.752 255.883 799.045 345.269 723.769Z" fill="url(#paint0_linear_2672_6330-svg-3)" style=""></path>
    <path d="M1003.21 -239.008C1059.82 -334.625 1143.63 -379.176 1243.36 -350.311C1354.13 -318.253 1418.24 -201.407 1386.55 -89.3309C1368.78 -26.4717 1324.65 21.5356 1269.78 45.923L1269.78 45.924C1266.7 47.3287 1263.38 48.6987 1259.83 50.0392C1254.64 52.034 1249.36 53.8212 1244 55.3947C1210.58 65.6045 1163.61 74.174 1109.97 83.049C1034.98 95.4535 990.589 158.485 979.645 175.859C978.773 177.342 977.885 178.813 976.985 180.275C976.977 180.289 976.973 180.297 976.973 180.299L976.972 180.298C917.124 277.488 798.882 327.084 684.658 294.026C546.531 254.049 466.586 108.342 506.097 -31.4178C545.608 -171.178 689.612 -252.068 827.74 -212.092C836.604 -209.526 845.227 -206.525 853.596 -203.118C853.599 -203.117 853.602 -203.116 853.605 -203.115C900.006 -190.833 973.811 -190.924 1003.14 -238.905C1003.16 -238.939 1003.19 -238.974 1003.21 -239.008ZM1191.2 145.621C1217.73 132.659 1249.61 143.904 1262.42 170.737C1275.23 197.571 1264.12 229.832 1237.6 242.795C1211.08 255.758 1179.19 244.513 1166.38 217.679C1153.57 190.845 1164.68 158.584 1191.2 145.621Z" fill="url(#paint1_linear_2672_6330-svg-3)" style=""></path>
    <defs>
        <linearGradient id="paint0_linear_2672_6330-svg-3" x1="496" y1="304.242" x2="1487.99" y2="44.9124" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#009EE3" style="stop-color:#009EE3;stop-color:color(display-p3 0.0000 0.6196 0.8902);stop-opacity:1;"></stop>
            <stop offset="1" stop-color="#00963F" style="stop-color:#00963F;stop-color:color(display-p3 0.0000 0.5882 0.2471);stop-opacity:1;"></stop>
        </linearGradient>
        <linearGradient id="paint1_linear_2672_6330-svg-3" x1="496" y1="304.242" x2="1487.99" y2="44.9124" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#009EE3" style="stop-color:#009EE3;stop-color:color(display-p3 0.0000 0.6196 0.8902);stop-opacity:1;"></stop>
            <stop offset="1" stop-color="#00963F" style="stop-color:#00963F;stop-color:color(display-p3 0.0000 0.5882 0.2471);stop-opacity:1;"></stop>
        </linearGradient>
    </defs>
</svg>
</div>

    <div class="c-hero__content ">
        

        <h1 class="c-headline c-headline--h1 ">
            
                1-Zimmer-Wohnung in Marzahn
            
        </h1>




    </div>
</div>
<!--TYPO3SEARCH_end-->


<!--    Must be the last element so that CSS rules continue to work (for example, the first element has a certain distance above it) -->

</div>

                <div id="section-breadcrumb" class="c-section-wrapper r-raster:col-1-12-1
    c-section-wrapper--breadcrumb
    
    
    ">


        <nav class="c-nav c-nav--breadcrumb " aria-label="Brotkrumen Navigation">


        <ol class="c-nav__list ">
        <li class="c-nav__item 
                 ">

                <a class="c-link
  
   c-nav__link
  
  
  " href="/">


      <span class="c-link__label">Startseite</span>

    


  

</a>



        </li>
        <li class="c-nav__item 
                 ">

                <a class="c-link
  
   c-nav__link
  
  
  " href="/wohnung-finden">


      <span class="c-link__label">Wohnung finden</span>

    


  

</a>



        </li>
        <li class="c-nav__item 
                 ">

                <a class="c-link
  
   c-nav__link
  
  
  " href="/immosuche">


      <span class="c-link__label">Immobiliensuche</span>

    


  

</a>



        </li>
        <li class="c-nav__item 
                 " aria-current="page">

                
1-Zimmer-Wohnung in Marzahn




        </li>
</ol>



</nav>



<!--    Must be the last element so that CSS rules continue to work (for example, the first element has a certain distance above it) -->

</div>

                <div id="section-wrapper-create-update-date" class="c-section-wrapper r-raster:col-1-12-1
    c-section-wrapper--publish-date
    
    
    ">


        <div class="c-meta   ">
    <div class="c-meta__inner">
    </div>
</div>



<!--    Must be the last element so that CSS rules continue to work (for example, the first element has a certain distance above it) -->

</div>

                <!--TYPO3SEARCH_begin-->      <div id="c1798" class="c-section-wrapper r-raster:col-1-12-1
    
    
    
    ">


        <div class="c-swiper c-swiper--immo-detail
    
    " data-swiper-type="immo-detail">

    




    <div class="c-swiper__container c-swiper__container--main swiper swiper-initialized swiper-horizontal" aria-label="Karussell" role="region">
        <!-- Additional required wrapper -->
        <ul class="swiper-wrapper c-swiper__wrapper " data-original-count="11" id="swiper-wrapper-929810c395a5386fc" aria-live="polite">
            <!-- Slides -->
                <li class="swiper-slide c-swiper__slide c-swiper__slide--main swiper-slide-active" role="group" aria-label="1 von 11" data-swiper-slide-index="0" style="width: 966.621px; margin-right: 32px;">
                    <!--
    COMPONENT DEPENDENCY:
    @copyright
-->
<figure class="c-figure  ">

  <div class="c-figure__inner">

      <!-- add @picture or @img -->

      


<picture class="c-picture  ">


            <!-- max width ∞ -->
                <source media="(min-width: 1921px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_7b13c3ec28.webp">
                <source media="(min-width: 1921px)" srcset="/fileadmin/user_upload/tx_openimmo/connection-1/images/1798-degewo_9943db66-aca5-413a-a459-d4720683add3.jpg">

            <!-- max width 1920 -->
                <source media="(min-width: 1700px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_98e8161031.webp">
                <source media="(min-width: 1700px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_97127cb2ba.jpg">

            <!-- max width 1700px -->
                <source media="(min-width: 1300px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_5166a55a64.webp">
                <source media="(min-width: 1300px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_207b52d6ff.jpg">

            <!-- max width 1300px -->
                <source media="(min-width: 1100px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_73d44a478b.webp">
                <source media="(min-width: 1100px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_ba4219ea51.jpg">


            <!-- max width 1100px -->
                <source media="(min-width: 900px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_fb4d7efbdc.webp">
                <source media="(min-width: 900px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_e2515ec14f.jpg">


            <!-- max width 900px -->
                <source media="(min-width: 700px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_4d23c8d00c.webp">
                <source media="(min-width: 700px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_5db09fb63c.jpg">

            <!-- max width 700px -->
                <source media="(min-width: 500px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_3ddc313d03.webp">
                <source media="(min-width: 500px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_de695bc2c6.jpg">

            <!-- mandetory max width 500px -->
                <source srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_24ca142e2d.webp" media="(min-width: 0px)">
                <source srcset="/fileadmin/user_upload/tx_openimmo/_processed_/b/c/csm_1798-degewo_9943db66-aca5-413a-a459-d4720683add3_b590ca2492.jpg" media="(min-width: 0px)">


        <img class="c-img " src="/fileadmin/user_upload/tx_openimmo/connection-1/images/1798-degewo_9943db66-aca5-413a-a459-d4720683add3.jpg" alt="" loading="lazy" width="1600" height="1066">


</picture>







  </div>

    <figcaption class="c-figure__figcaption">
        MedienAußenansichtPrimärbid.jpg
    </figcaption>

</figure>


                    
                </li>
                <li class="swiper-slide c-swiper__slide c-swiper__slide--main swiper-slide-next" role="group" aria-label="2 von 11" data-swiper-slide-index="1" style="width: 966.621px; margin-right: 32px;">
                    <!--
    COMPONENT DEPENDENCY:
    @copyright
-->
<figure class="c-figure  ">

  <div class="c-figure__inner">

      <!-- add @picture or @img -->

      


<picture class="c-picture  ">


            <!-- max width ∞ -->
                <source media="(min-width: 1921px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_52e1663fc0.webp">
                <source media="(min-width: 1921px)" srcset="/fileadmin/user_upload/tx_openimmo/connection-1/images/1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be.jpg">

            <!-- max width 1920 -->
                <source media="(min-width: 1700px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_a9b9f21757.webp">
                <source media="(min-width: 1700px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_dd188d3126.jpg">

            <!-- max width 1700px -->
                <source media="(min-width: 1300px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_238c7a91a1.webp">
                <source media="(min-width: 1300px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_b1456d2c4e.jpg">

            <!-- max width 1300px -->
                <source media="(min-width: 1100px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_4fee8bf33f.webp">
                <source media="(min-width: 1100px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_9b971976a4.jpg">


            <!-- max width 1100px -->
                <source media="(min-width: 900px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_158262e51d.webp">
                <source media="(min-width: 900px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_e84d32190c.jpg">


            <!-- max width 900px -->
                <source media="(min-width: 700px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_32386cde58.webp">
                <source media="(min-width: 700px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_f1d3246b33.jpg">

            <!-- max width 700px -->
                <source media="(min-width: 500px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_0e3b3b391b.webp">
                <source media="(min-width: 500px)" srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_a7bc914da3.jpg">

            <!-- mandetory max width 500px -->
                <source srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_e969af06e9.webp" media="(min-width: 0px)">
                <source srcset="/fileadmin/user_upload/tx_openimmo/_processed_/3/e/csm_1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be_7dc3ea1e8e.jpg" media="(min-width: 0px)">


        <img class="c-img " src="/fileadmin/user_upload/tx_openimmo/connection-1/images/1798-degewo_2468a40e-f95c-4be9-a068-8bdaa43d31be.jpg" alt="" loading="eager" width="1600" height="1065">


</picture>







  </div>

    <figcaption class="c-figure__figcaption">
        MedienAußenansicht.jpg
    </figcaption>

</figure>


                    
                </li>
        </ul>
    </div>
</div>
</div>

<div class="c-info-box c-info-box--content-grid u-color-bg:surface-invert-pri-2">

  <div class="c-info-box__inner">

      <div class="c-info-box__content">
          <div class="c-info-box__content-item c-info-box__content-item--total ">
              <div class="c-definition-list  ">
    <dl class="c-definition-list__list">
            <div class="c-definition-list__item c-definition-list__item--total">
                <dt class="c-definition-list__term u-typo:xl">368,41</dt>
                <dd class="c-definition-list__definition u-typo:s">Euro Warmmiete</dd>
            </div>
    </dl>
</div>
          </div>
          <div class="c-info-box__content-item c-info-box__content-item--size ">
              <div class="c-definition-list  ">
    <dl class="c-definition-list__list">
            <div class="c-definition-list__item c-definition-list__item--size">
                <dt class="c-definition-list__term u-typo:xl">29,70</dt>
                <dd class="c-definition-list__definition u-typo:s">m²</dd>
            </div>
    </dl>
</div>
          </div>
          <div class="c-info-box__content-item c-info-box__content-item--room ">
              <div class="c-definition-list  ">
    <dl class="c-definition-list__list">
            <div class="c-definition-list__item c-definition-list__item--room">
                <dt class="c-definition-list__term u-typo:xl">1</dt>
                <dd class="c-definition-list__definition u-typo:s">Zimmer</dd>
            </div>
    </dl>
</div>
          </div>
          <div class="c-info-box__content-item c-info-box__content-item--availability ">
              <div class="c-definition-list  ">
    <dl class="c-definition-list__list">
            <div class="c-definition-list__item c-definition-list__item--availability">
                <dt class="c-definition-list__term u-typo:xl">sofort</dt>
                <dd class="c-definition-list__definition u-typo:s">frei ab</dd>
            </div>
    </dl>
</div>
          </div>
      </div>
  </div>
</div>

<div class="c-action-bar toolbar" data-openimmo-bookmarks="0" data-openimmo-json-api="https://www.degewo.de/immosuche/details/openimmo.json?no_cache=1&amp;tx_openimmo_jsonapi%5Baction%5D=bookmark&amp;tx_openimmo_jsonapi%5Bcontroller%5D=JsonApi&amp;cHash=d1e7faf0db8577ad620bc5300722097a">
    <div class="c-action-bar__group">
        <div class="c-action-bar__item">
            <button class="c-button mobile-icon-only" aria-label="zum Merkzettel hinzufügen" aria-pressed="false" type="button" data-action="toggle-note" data-openimmo-bookmark-item-uid="W1400.40109.0860-1204">
                <span class="c-button__label">Gemerkt</span>
            </button>
        </div>
    </div>
</div>

  <div id="section-def-list-rent-details" class="c-section-wrapper r-raster:col-1-12-1">
    <div class="c-definition-list c-definition-list--grid-col-4-span-8 mobile-flex-col">
    <div class="c-copy">
        <h2 class="c-headline c-headline--h3 ">Kosten</h2>
    </div>
    <dl class="c-definition-list__list u-typo:md">
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">Nettokaltmiete</dt>
                <dd class="c-definition-list__definition">256,45 €</dd>
            </div>
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">Betriebskosten (kalt)</dt>
                <dd class="c-definition-list__definition">72,46 €</dd>
            </div>
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">Betriebskosten (warm)</dt>
                <dd class="c-definition-list__definition">39,50 €</dd>
            </div>
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">Kaution</dt>
                <dd class="c-definition-list__definition">drei Nettokaltmieten</dd>
            </div>
    </dl>
</div>

<div class="c-definition-list c-definition-list--grid-col-4-span-8 mobile-flex-col">
    <div class="c-copy">
        <h2 class="c-headline c-headline--h3 ">Objektdetails</h2>
    </div>
    <dl class="c-definition-list__list u-typo:md">
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">Zimmer</dt>
                <dd class="c-definition-list__definition">1</dd>
            </div>
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">Wohnfläche</dt>
                <dd class="c-definition-list__definition">29,70 m²</dd>
            </div>
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">frei ab</dt>
                <dd class="c-definition-list__definition">sofort</dd>
            </div>
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">Etage</dt>
                <dd class="c-definition-list__definition">12 von 18</dd>
            </div>
            <div class="c-definition-list__item">
                <dt class="c-definition-list__term u-typo:degewo-sans-bold">Baujahr</dt>
                <dd class="c-definition-list__definition">1984</dd>
            </div>
    </dl>
</div>
</div>

  <div id="section-map-rent-details" class="c-section-wrapper r-raster:col-1-12-1">
        <div class="c-gmap c-gmap--rent-detail-map r-raster:col-1-12-1">
        <h3 class="c-headline c-headline--h3 ">Adresse: Marzahner Promenade 44, 12679 Berlin</h3>
        </div>
  </div>
</main>
`;

const dom = new JSDOM(userHtml, { url: "https://www.degewo.de/immosuche/details/1-zimmer-wohnung-in-marzahn" });
global.window = dom.window;
global.document = dom.window.document;
global.console = console;

function extractDegewo() {
  const url = window.location.href;

  function parseCleanNumber(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    let clean = text.replace(/[^0-9,.-]/g, '').trim();
    if (!clean) return null;

    if (clean.includes('.') && !clean.includes(',')) {
      const parts = clean.split('.');
      if (parts[parts.length - 1].length <= 2) {
        let num = parseFloat(clean);
        return isNaN(num) ? null : num;
      }
    }

    let num = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  // 1. Title
  let title = document.querySelector('h1.c-headline')?.textContent?.trim();
  if (!title) {
    title = document.title || 'Degewo Apartment';
  }

  // 2. Listing ID
  const bookmarkButton = document.querySelector('[data-openimmo-bookmark-item-uid]');
  let listingId = bookmarkButton ? bookmarkButton.getAttribute('data-openimmo-bookmark-item-uid') : null;
  if (!listingId) {
    const match = url.match(/details\/([a-zA-Z0-9-]+)/);
    if (match) listingId = match[1];
  }

  // 3. Extracted variables
  let warmRent = null;
  let coldRent = null;
  let utilityCosts = null;
  let heatingCosts = null;
  let deposit = null;
  let rooms = 1;
  let squareMeters = null;
  let availability = null;
  let floor = null;
  let constructionYear = null;

  // Scan hero box items
  document.querySelectorAll('.c-definition-list__item').forEach(item => {
    const dt = item.querySelector('dt');
    const dd = item.querySelector('dd');
    if (dt && dd) {
      const dtText = dt.textContent.trim().replace(/\s+/g, ' ');
      const ddText = dd.textContent.trim().replace(/\s+/g, ' ');

      if (ddText.toLowerCase().includes('warmmiete')) {
        warmRent = parseCleanNumber(dtText);
      } else if (ddText.toLowerCase().includes('zimmer')) {
        rooms = parseCleanNumber(dtText) || rooms;
      } else if (ddText.toLowerCase().includes('m²')) {
        squareMeters = parseCleanNumber(dtText);
      } else if (ddText.toLowerCase().includes('frei ab')) {
        availability = dtText;
      }
    }
  });

  // Scan detail table/list keys
  document.querySelectorAll('dt').forEach(dt => {
    const parent = dt.closest('.c-definition-list__item, div');
    if (parent) {
      const dd = parent.querySelector('dd');
      if (dd) {
        const key = dt.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
        const val = dd.textContent.trim().replace(/\s+/g, ' ');

        if (key.includes('nettokaltmiete')) {
          coldRent = parseCleanNumber(val);
        } else if (key.includes('betriebskosten (kalt)')) {
          utilityCosts = parseCleanNumber(val);
        } else if (key.includes('betriebskosten (warm)')) {
          heatingCosts = parseCleanNumber(val);
        } else if (key.includes('kaution')) {
          if (val.toLowerCase().includes('drei') || val.toLowerCase().includes('3')) {
            deposit = 3;
          } else if (val.toLowerCase().includes('zwei') || val.toLowerCase().includes('2')) {
            deposit = 2;
          } else {
            const parsedDep = parseCleanNumber(val);
            if (parsedDep) deposit = parsedDep;
          }
        } else if (key.includes('zimmer')) {
          rooms = parseCleanNumber(val) || rooms;
        } else if (key.includes('wohnfläche')) {
          squareMeters = parseCleanNumber(val);
        } else if (key.includes('etage')) {
          floor = val;
        } else if (key.includes('baujahr')) {
          constructionYear = parseCleanNumber(val);
        }
      }
    }
  });

  // Resolve deposit multiplier
  if (deposit === 3 || deposit === 2) {
    if (coldRent) {
      deposit = coldRent * deposit;
    } else {
      deposit = null;
    }
  }

  // 4. Address parsing
  let address = null;
  let zipCode = null;
  let city = null;
  const addressHeadline = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.toLowerCase().includes('adresse:'));
  if (addressHeadline) {
    const rawAddress = addressHeadline.textContent.replace(/Adresse:\s*/i, '').trim();
    const parts = rawAddress.split(',').map(p => p.trim());
    if (parts.length > 0) address = parts[0];
    if (parts.length > 1) {
      const zipCityMatch = parts[parts.length - 1].match(/(\d{5})\s+(.*)/);
      if (zipCityMatch) {
        zipCode = zipCityMatch[1];
        city = zipCityMatch[2].trim();
      } else {
        city = parts[parts.length - 1];
      }
    }
  }

  // 5. Images Extraction (from Swiper slides)
  const rawImages = [];
  document.querySelectorAll('.c-swiper__slide--main img.c-img').forEach(img => {
    let src = img.getAttribute('src') || img.src;
    if (src) {
      if (src.startsWith('/')) {
        src = window.location.origin + src;
      }
      if (!rawImages.includes(src)) {
        rawImages.push(src);
      }
    }
  });

  // Fallbacks for Swiper main container images
  if (rawImages.length === 0) {
    document.querySelectorAll('.c-swiper__container--main img').forEach(img => {
      let src = img.getAttribute('src') || img.src;
      if (src) {
        if (src.startsWith('/')) {
          src = window.location.origin + src;
        }
        if (!rawImages.includes(src)) {
          rawImages.push(src);
        }
      }
    });
  }

  const coverImage = rawImages.length > 0 ? rawImages[0] : null;

  return {
    title,
    rentPrice: warmRent || coldRent,
    warmRent,
    coldRent,
    deposit,
    rooms,
    squareMeters,
    address,
    city,
    zipCode,
    floor,
    availability,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'degewo',
    coverImage,
    images: rawImages.slice(0, 10),
    utilityCosts,
    heatingCosts,
    constructionYear
  };
}

const result = extractDegewo();
console.log(JSON.stringify(result, null, 2));

// Verify images extraction
if (result.images && result.images.length === 2) {
  console.log("PASS: Images extracted successfully: " + JSON.stringify(result.images));
} else {
  console.error("FAIL: Expected 2 images, but got: " + (result.images ? result.images.length : 0));
}
