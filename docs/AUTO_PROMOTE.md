# Auto-Promote System

Frequency-based automatic creation of Topics and Locations.

→ Siehe Details: [../NEWS_PLUGIN_KONZEPT.md](../NEWS_PLUGIN_KONZEPT.md#-auto-promote-system)

## Thresholds

**Topics**: count >= 10, 7 days, 3 sources
**Locations (verified)**: count >= 3, sofort
**Locations (unverified)**: count >= 15, 14 days

## Workflow

1. NLP findet neuen Topic/Location
2. Frequency Tracking in `suggested_topics/locations`
3. Auto-Promote bei Threshold
4. Geodaten-Verification (Nominatim API)
5. Hierarchie-Creation (City → State → Country)
