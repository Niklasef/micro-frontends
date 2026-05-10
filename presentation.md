# main
- personifierad sök
- oauth flöde för aktorisering
- sök inbyggd i platform site
- utmaning: sök ska bli eget team och finnas på många platformar

# feature/spa-web-component

# feature/spa-web-component-with-shadow-dom
- custom element till team 2
- custom element React SPA
- shadow dom isolerar, skyddar mot css krockar
- sök anrop går genom platform site som lägger på oauth session, och landar i team 2 api
- utmaning: extra hopp till proxy, run time beroende, fördröjd initial rendering

# feature/astro-ssr-web-component
- custom element Astro SSR (ingen fördröjd initial rendering)
- anrop direkt från browser till sök api via subdoman och delad server kaka (ingen proxy i mellan)
- utmaning: Jag kunde inte få Next JS att hantera att shadow dom element skiljer sig i server och klient (verkar vara problem med hydration när markup inte matchar). Kakan blev väldigt stor för hela oauth sessionen

# nästa steg?
- Dela sessioner asynkront mellan team?