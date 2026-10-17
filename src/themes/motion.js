// NEXORA motion tokens — see DESIGN_DECISIONS.md
// Unified surface: 120–240ms ease-out. No bounce/lift on cards.
// Consumers must honor prefers-reduced-motion → duration.instant.

export const duration = {
    instant: 0, // used when prefers-reduced-motion is active
    fast: 120, // hover color, chip click, focus ring
    standard: 180, // card hover, tab switch, dialog enter
    drawer: 240, // drawer, sheet, page enter
    slow: 500, // orchestrated staggers only
    // @deprecated — kept as alias to `drawer` for legacy consumers
    premium: 240
}

export const easing = {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)', // material emphasized decel
    // @deprecated — no spring/bounce in the unified surface
    premium: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

// Preset transitions ready to drop into sx / styled
export const transition = {
    fast: `all ${duration.fast}ms ${easing.standard}`,
    standard: `all ${duration.standard}ms ${easing.standard}`,
    drawer: `all ${duration.drawer}ms ${easing.standard}`,
    opacity: `opacity ${duration.standard}ms ${easing.standard}`,
    colors: `background-color ${duration.fast}ms ${easing.standard}, border-color ${duration.fast}ms ${easing.standard}, color ${duration.fast}ms ${easing.standard}`
}

// Helper for consumers that need to gate motion by user pref
export const motionSafe = (value, reducedValue = 'none') => ({
    '@media (prefers-reduced-motion: no-preference)': value,
    '@media (prefers-reduced-motion: reduce)': typeof reducedValue === 'string' ? { transition: reducedValue } : reducedValue
})
