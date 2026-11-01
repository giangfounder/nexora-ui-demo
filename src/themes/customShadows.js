// NEXORA elevation — flat. Cards are defined by a 1px hairline, not a shadow; only overlays (menu, popover,
// dialog) lift off the page. Resting cards get a bare 1px contact line so legacy `boxShadow: xs` call sites stay flat.
// xs / sm are the same values the assistant workspace uses (cardShadow level 1 / 2) so every
// card in every menu sits at the same depth.

const customShadows = (isDark) => ({
    // Resting card (level 1)
    xs: 'none',
    // Raised / hover (level 2): one tight contact shadow
    sm: isDark ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(16,24,40,0.08)',
    // Overlay shadows — menu, popover, dialog, drawer, toast
    md: isDark ? '0 12px 32px -8px rgba(0,0,0,0.6)' : '0 8px 24px -8px rgba(16,24,40,0.16)',

    // Focus ring — WCAG AA, alpha 0.28
    focusRing: '0 0 0 3px rgba(37,99,235,0.28)',

    // @deprecated — DO NOT USE. Kept as `md` alias for legacy imports only.
    lg: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.08)',
    warmSm: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.06)',
    warmMd: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.08)',
    warmLg: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.08)',
    legacyCard: 'none'
})

export default customShadows
