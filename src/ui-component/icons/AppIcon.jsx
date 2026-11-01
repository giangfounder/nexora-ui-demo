import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { Box } from '@mui/material'
import { GLYPHS } from './bootstrapGlyphs'

// Single entry point for every UI icon in the app: Bootstrap Icons (solid "-fill" glyphs), inlined in
// bootstrapGlyphs.js so there is no icon package to install. Call sites address icons by a stable name
// (<AppIcon name='House' />); to change the icon set, regenerate bootstrapGlyphs.js and keep this file.

// One small component per icon name, cached so the element type stays stable between renders.
const glyphCache = new Map()
const glyphComponent = (name) => {
    if (!GLYPHS[name]) return null
    if (!glyphCache.has(name)) {
        const Glyph = forwardRef(function BootstrapGlyph({ size = 24, color = 'currentColor', ...rest }, ref) {
            return (
                <svg
                    ref={ref}
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 16 16'
                    width={size}
                    height={size}
                    fill={color}
                    focusable='false'
                    dangerouslySetInnerHTML={{ __html: GLYPHS[name] }}
                    {...rest}
                />
            )
        })
        Glyph.displayName = `Glyph(${name})`
        Glyph.propTypes = { size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), color: PropTypes.string }
        glyphCache.set(name, Glyph)
    }
    return glyphCache.get(name)
}

export const ICON_NAMES = Object.keys(GLYPHS)

// Standard sizes: 16 (dense UI), 20 (default controls), 24 (headers, empty states)
export const ICON_SIZES = { sm: 16, md: 20, lg: 24 }

// Compatibility with props that MUI SvgIcon callers used to pass
const MUI_FONT_SIZES = { small: 20, medium: 24, large: 35, inherit: '1em' }
const THEME_COLORS = {
    primary: 'primary.main',
    secondary: 'secondary.main',
    error: 'error.main',
    warning: 'warning.main',
    info: 'info.main',
    success: 'success.main',
    action: 'action.active',
    disabled: 'action.disabled'
}

export const AppIcon = forwardRef(function AppIcon(
    // stroke / strokeWidth / weight are accepted for backward compatibility and ignored: every glyph is solid
    { name, size, weight: _weight, color = 'currentColor', fontSize, htmlColor, sx, stroke: _stroke, strokeWidth: _strokeWidth, ...rest },
    ref
) {
    const Glyph = glyphComponent(name)
    if (!Glyph) return null
    const themeColor = THEME_COLORS[color]
    const labelled = rest['aria-label'] || rest['aria-labelledby']
    // No explicit size: behave like a MUI SvgIcon (1em box, 1.5rem default font-size) so sx={{ fontSize }} keeps working
    const cssSized = size === undefined && fontSize === undefined
    const props = {
        ref,
        size: cssSized ? '1em' : size ?? MUI_FONT_SIZES[fontSize],
        color: themeColor || color === 'inherit' ? 'currentColor' : htmlColor ?? color,
        ...(labelled ? { role: 'img' } : { 'aria-hidden': true }),
        ...rest
    }
    if (sx || themeColor || cssSized) {
        return (
            <Box
                component={Glyph}
                {...props}
                sx={[
                    cssSized ? { fontSize: '1.5rem' } : null,
                    themeColor ? { color: themeColor } : null,
                    ...(Array.isArray(sx) ? sx : [sx])
                ]}
            />
        )
    }
    return <Glyph {...props} />
})

AppIcon.propTypes = {
    name: PropTypes.oneOf(ICON_NAMES).isRequired,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    weight: PropTypes.string,
    color: PropTypes.string,
    fontSize: PropTypes.oneOf(['small', 'medium', 'large', 'inherit']),
    htmlColor: PropTypes.string,
    sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
    stroke: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    strokeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

const componentCache = new Map()

// Component form for places that take an icon component rather than an element
// (menu items, `icon: X` config objects, `<item.icon />`).
export function iconComponent(name) {
    const key = name
    if (!componentCache.has(key)) {
        const Bound = forwardRef(function BoundAppIcon(props, ref) {
            return <AppIcon ref={ref} name={name} {...props} />
        })
        Bound.displayName = `AppIcon(${name})`
        componentCache.set(key, Bound)
    }
    return componentCache.get(key)
}
