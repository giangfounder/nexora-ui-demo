import PropTypes from 'prop-types'
import { forwardRef } from 'react'

// material-ui
import { Box, Card, CardContent, CardHeader, Divider, Typography, useTheme } from '@mui/material'

// constant
const headerSX = {
    '& .MuiCardHeader-action': { mr: 0 },
    '& .MuiCardHeader-title': { fontWeight: 600 }
}

const flavorSx = (theme, flavor, boxShadow, shadow) => {
    const cs = theme.customShadows || {}
    if (flavor === 'premium') {
        return {
            borderRadius: 4, // 16px
            boxShadow: cs.warmSm || 'none',
            transition: `box-shadow ${theme.transitions?.duration?.complex || 320}ms ${
                theme.transitions?.easing?.premium || 'cubic-bezier(0.16, 1, 0.3, 1)'
            }, transform ${theme.transitions?.duration?.complex || 320}ms ${
                theme.transitions?.easing?.premium || 'cubic-bezier(0.16, 1, 0.3, 1)'
            }`,
            ':hover': {
                boxShadow: boxShadow ? shadow || cs.warmMd : cs.warmSm
            }
        }
    }
    // Standard flavor: a transparent page container — no shadow, or it draws a phantom card edge
    // that the unpadded content (titles, toolbars, tables) then sits flush against.
    return {
        borderRadius: 2, // 8px
        boxShadow: boxShadow ? cs.xs || 'none' : 'none',
        transition: `background-color ${theme.transitions?.duration?.short || 200}ms ${
            theme.transitions?.easing?.easeOut || 'cubic-bezier(0.4, 0, 0.2, 1)'
        }, border-color ${theme.transitions?.duration?.short || 200}ms ${
            theme.transitions?.easing?.easeOut || 'cubic-bezier(0.4, 0, 0.2, 1)'
        }`,
        ':hover': {
            boxShadow: boxShadow ? shadow || cs.sm : 'none'
        }
    }
}

// ==============================|| NEXORA MAIN CARD ||============================== //
// Design language: Hybrid A+B — flavor="standard" (default) or flavor="premium"
// See DESIGN_DECISIONS.md for token specs.

const MainCard = forwardRef(function MainCard(
    {
        accent, // 2026: 'rose'|'orange'|'amber'|'emerald'|'teal' — optional hairline top accent
        border,
        boxShadow,
        children,
        content = true,
        contentClass = '',
        contentSX,
        darkTitle,
        flavor = 'standard',
        maxWidth = 'full',
        secondary,
        shadow,
        sx = {},
        title,
        ...others
    },
    ref
) {
    const theme = useTheme()
    const alphaBorder = theme.palette?.alpha?.border || 'rgba(0,0,0,0.08)'
    const accentColor = accent && theme.palette?.spectrum?.[accent]?.main

    const flavorStyles = flavorSx(theme, flavor, boxShadow, shadow)
    // A transparent page container sits on the page gutter itself: no side inset, so titles, toolbars and
    // tables line up with the header logo on every screen. Visible cards (border / premium) keep their inset.
    const defaultContentSX = border || flavor === 'premium' ? { px: 2, py: 0 } : { px: 0, py: 0 }

    return (
        <Card
            ref={ref}
            {...others}
            sx={{
                position: 'relative',
                // Backward compat: transparent by default (many consumers rely on parent bg showing through).
                // Premium flavor opts into an explicit surface color.
                background: flavor === 'premium' ? theme.palette.background.paper : 'transparent',
                border: border ? `1px solid ${alphaBorder}` : 'none',
                overflow: 'hidden',
                maxWidth: maxWidth === 'sm' ? '800px' : maxWidth === 'md' ? '960px' : maxWidth === 'full' ? '100%' : '1280px',
                mx: 'auto',
                ...flavorStyles,
                ...sx
            }}
        >
            {accentColor && (
                <Box
                    aria-hidden
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        bgcolor: accentColor
                    }}
                />
            )}
            {!darkTitle && title && <CardHeader sx={headerSX} title={title} action={secondary} />}
            {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant='h3'>{title}</Typography>} action={secondary} />}

            {title && <Divider />}

            {content && (
                <CardContent sx={contentSX ?? defaultContentSX} className={contentClass}>
                    {children}
                </CardContent>
            )}
            {!content && children}
        </Card>
    )
})

MainCard.propTypes = {
    accent: PropTypes.oneOf(['rose', 'orange', 'amber', 'emerald', 'teal']),
    border: PropTypes.bool,
    boxShadow: PropTypes.bool,
    maxWidth: PropTypes.oneOf(['full', 'sm', 'md']),
    children: PropTypes.node,
    content: PropTypes.bool,
    contentClass: PropTypes.string,
    contentSX: PropTypes.object,
    darkTitle: PropTypes.bool,
    flavor: PropTypes.oneOf(['standard', 'premium']),
    secondary: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
    shadow: PropTypes.string,
    sx: PropTypes.object,
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object])
}

export default MainCard
