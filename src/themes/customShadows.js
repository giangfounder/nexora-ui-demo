// NEXORA elevation — soft, layered, neutral. Cards get xs; raised controls sm; overlays md.
// xs / sm are the same values the assistant workspace uses (cardShadow level 1 / 2) so every
// card in every menu sits at the same depth.

const customShadows = (isDark) => ({
    // Resting card (level 1)
    xs: isDark
        ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.4), 0 6px 16px -6px rgba(0,0,0,0.55)'
        : '0 1px 2px rgba(16,24,40,0.05), 0 2px 6px -1px rgba(16,24,40,0.06), 0 10px 24px -10px rgba(16,24,40,0.12)',
    // Raised / hover (level 2)
    sm: isDark
        ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.4), 0 12px 28px -10px rgba(0,0,0,0.65)'
        : '0 1px 2px rgba(16,24,40,0.06), 0 4px 8px -2px rgba(16,24,40,0.08), 0 14px 30px -10px rgba(16,24,40,0.16)',
    // Overlay shadows — menu, popover, dialog, drawer, toast
    md: isDark
        ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 40px -8px rgba(0,0,0,0.6)'
        : '0 4px 10px -4px rgba(16,24,40,0.08), 0 18px 44px -12px rgba(16,24,40,0.18)',

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
