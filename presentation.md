# main
- personifierad sök
- oauth flöde för aktorisering
- sök inbyggd i platform site
- utmaning: sök ska bli eget team och finnas på många platformar

# feature/spa-web-component
- custom element till team 2
- custom element React SPA
- sök anrop går genom platform site som lägger på oauth session, och landar i team 2 api
- utmaning: css läcker igenom från main site

# feature/spa-web-component-with-shadow-dom
- shadow dom isolerar, skyddar mot css krockar
- utmaning: extra hopp till proxy, run time beroende, fördröjd initial rendering
