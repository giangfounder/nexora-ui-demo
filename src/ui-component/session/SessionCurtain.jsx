import PropTypes from 'prop-types'
import { createPortal } from 'react-dom'
import { useTheme } from '@mui/material/styles'
import { Box } from '@mui/material'

// ==============================|| SESSION CURTAIN ||============================== //
// Sign-out: the app fades into the sign-in screen's own background, leaving only the logo and Mira in
// view (the logo is redrawn on top at its header spot; Mira's dock sits above the curtain). The sign-in
// screen then starts both of them from exactly those spots, so the whole hop reads as one motion.
// Kept deliberately empty in the middle — a spinner that vanishes mid-transition is what feels janky.

const SessionCurtain = ({ open, label, logoRect, logoSrc }) => {
    const theme = useTheme()
    if (!open) return null
    const bg = theme.palette.mode === 'dark' ? theme.palette.background.default : '#FFFFFF'
    return createPortal(
        <Box
            role='status'
            aria-live='polite'
            sx={{
                position: 'fixed',
                inset: 0,
                // above the header (1100), below Mira's dock (1150) so she stays in view
                zIndex: 1140,
                bgcolor: bg,
                '@keyframes curtainIn': { from: { opacity: 0 }, to: { opacity: 1 } },
                animation: 'curtainIn 260ms cubic-bezier(0.4, 0, 0.2, 1) both',
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
            }}
        >
            <Box component='span' sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                {label}
            </Box>
            {logoRect && logoSrc && (
                <Box
                    component='img'
                    src={logoSrc}
                    alt=''
                    sx={{ position: 'fixed', left: logoRect.x, top: logoRect.y, width: logoRect.width, height: logoRect.height }}
                />
            )}
        </Box>,
        document.body
    )
}

SessionCurtain.propTypes = { open: PropTypes.bool, label: PropTypes.node, logoRect: PropTypes.object, logoSrc: PropTypes.string }

export default SessionCurtain
