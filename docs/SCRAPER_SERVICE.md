# News-Scraping Service

→ Siehe Details: [../NEWS_PLUGIN_KONZEPT.md](../NEWS_PLUGIN_KONZEPT.md#-news-scraping-service)

## Stack

- Node.js/TypeScript oder Python
- RSS Parser + NLP (spaCy, Hugging Face)
- Nominatim API (Geodaten-Verification)
- Gun.js SDK

## Workflow

1. RSS Aggregation
2. NLP Topic/Location Extraction
3. Matching gegen TopLocs Entities
4. Auto-Promote Check
5. Geodaten-Verification
6. Gun.js Publishing

## Deployment

- Docker Container
- Heroku/Railway/AWS Lambda
- Community-betrieben möglich
