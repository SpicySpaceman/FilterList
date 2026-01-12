# AdGuard Filter List

Collection of custom AdGuard filters properly versioned and validated.

## Available Filters

| Filter | Description | Subscription Link |
|--------|-------------|-------------------|
| **English Filter** | Custom rules for English sites. This filter currently has no rules. Rules will be added in the future for sites AdGuard won't fix. | [Subscribe](https://raw.githubusercontent.com/SpicySpaceman/FilterList/main/filters/english.txt) |
| **German Filter** | Custom rules for German sites. This filter currently has no rules. Rules will be added in the future for sites AdGuard won't fix. | [Subscribe](https://raw.githubusercontent.com/SpicySpaceman/FilterList/main/filters/german.txt) |
| **Thai Filter** | Custom rules for Thai sites. Mostly covering movie/video streaming sites. | [Subscribe](https://raw.githubusercontent.com/SpicySpaceman/FilterList/main/filters/thai.txt) |

## Contributing

1. Edit rules in `src/` directory.
2. Open a Pull Request.
3. Once merged, the GitHub Action will automatically:
   - Validate syntax using `aglint`.
   - Increment the version.
   - Update the files in `filters/`.

## Validation

This repository uses [@adguard/aglint](https://github.com/AdguardTeam/AGLint) to ensure rule validity.
