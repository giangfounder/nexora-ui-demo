# NEXORA — i18n & dark mode rules

## Language (vi / en)

```jsx
import { useLanguage } from '@/store/context/LanguageContext'
const { t, locale, language } = useLanguage()
<Button>{t('Lưu thay đổi')}</Button>
<TextField label={t('Email')} placeholder={t('Tìm khách hàng…')} />
t('Còn {n} ngày', { n: days })          // placeholders, same tokens in both languages
value.toLocaleString(locale)             // numbers / dates follow the language
```

-   `t()` accepts source text written in **either** language and returns the active one. Keep the literal
    as it is in the code (Vietnamese on NEXORA screens, English on legacy Flowise screens) and wrap it.
-   Add every pair to **your area file** `src/i18n/areas/<area>.js`, always shaped `{ 'Tiếng Việt': 'English' }`
    — even when the source literal is English. Files in `areas/` are picked up automatically.
-   Do not edit `i18n/index.js`, `i18n/translations.js` or `LanguageContext.jsx`.
-   Wrap everything a user reads: headings, labels, buttons, tabs, menu items, table headers, tooltips,
    placeholders, `aria-label`s, empty states, snackbars/alerts, dialog text, chart legends and axis titles.
-   Labels in module-level constants (options, column defs, status maps): keep the literal, translate at
    render: `t(option.label)`. Outside React (utils, exporters): `import { translate } from '@/i18n'` and
    call it when the code runs, never at module load.
-   Build sentences with placeholders, not by concatenating translated fragments.
-   Don't translate data: people / company / product names, message bodies, user input, IDs, code.
    Do translate enum-like values that render as UI labels (statuses, priorities, channel types).
-   Keep brand names as is: NEXORA, Mira, Pulse, Atlas, Prism, Zalo, Messenger, Shopee…

## Dark mode

-   `theme.palette.mode` is `'dark' | 'light'` and is reliable (`customization.isDarkMode` too).
-   Never hardcode neutral surface / text / border colours (`#fff`, `white`, `#000`, greys, slate hexes,
    `rgba(0,0,0,x)`). Use tokens:
    -   surfaces: `background.paper`, `background.default`, `theme.palette.surface.{main,raised,sunken}`
    -   text: `text.primary`, `text.secondary`, `text.disabled`
    -   lines/hover: `divider`, `theme.palette.alpha.{border,borderStrong,divider,hover,overlay}`
    -   tinted neutrals: `alpha(theme.palette.text.primary, 0.04–0.12)`
-   Brand / semantic / chart / channel-logo colours may stay as hex. Tinted chips: `alpha(color, 0.08–0.12)`
    in light, `0.16–0.24` in dark, with text in `color` (light) or a lighter shade (dark) so contrast ≥ 4.5:1.
-   SVG/chart text, gridlines and axes must use theme text/divider colours, not fixed greys.
-   Shadows: `theme.customShadows.*`; heavy black shadows look muddy on dark surfaces.
