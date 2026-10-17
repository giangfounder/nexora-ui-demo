import { forwardRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Box, Slide, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'

const DialogTransition = forwardRef(function DialogTransition(props, ref) {
    return (
        <Slide
            direction='up'
            ref={ref}
            timeout={{ enter: 320, exit: 280 }}
            easing={{
                enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
                exit: 'cubic-bezier(0.55, 0, 0.7, 0.2)'
            }}
            {...props}
        />
    )
})

const SIZE_MAP = {
    xs: { width: 400, height: 360 },
    sm: { width: 480, height: 520 },
    md: { width: 640, height: 620 },
    lg: { width: 840, height: 720 },
    xl: { width: 1080, height: 780 }
}

const useDialogShell = ({ size = 'md' } = {}) => {
    const theme = useTheme()

    return useMemo(() => {
        const dims = SIZE_MAP[size] || SIZE_MAP.md
        const isDark = theme.palette.mode === 'dark'
        const alphaBorder = theme.palette.alpha?.border || 'rgba(0,0,0,0.08)'
        const hairline = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

        return {
            dialogProps: {
                TransitionComponent: DialogTransition,
                transitionDuration: { enter: 320, exit: 280 },
                TransitionProps: { appear: true, mountOnEnter: true, unmountOnExit: true },
                fullWidth: true,
                maxWidth: false,
                scroll: 'paper',
                PaperProps: {
                    elevation: 0,
                    sx: {
                        width: dims.width,
                        maxWidth: '95vw',
                        borderRadius: 3,
                        border: `1px solid ${alphaBorder}`,
                        bgcolor: theme.palette.surface?.raised || theme.palette.background.paper,
                        boxShadow: theme.customShadows?.lg || '0 24px 48px -12px rgba(0,0,0,0.25)',
                        overflow: 'hidden',
                        ...(isDark && {
                            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 40%)'
                        })
                    }
                },
                slotProps: {
                    backdrop: {
                        transitionDuration: { enter: 320, exit: 280 },
                        sx: {
                            bgcolor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(15,15,15,0.45)',
                            backdropFilter: 'blur(12px) saturate(140%)',
                            WebkitBackdropFilter: 'blur(12px) saturate(140%)'
                        }
                    }
                },
                BackdropProps: {
                    transitionDuration: { enter: 320, exit: 280 },
                    sx: {
                        bgcolor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(15,15,15,0.45)',
                        backdropFilter: 'blur(12px) saturate(140%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(140%)'
                    }
                }
            },
            titleProps: {
                sx: {
                    p: 3,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    lineHeight: 1.35,
                    textTransform: 'none',
                    letterSpacing: 0,
                    borderBottom: `1px solid ${hairline}`,
                    '& p, & .MuiTypography-caption': { display: 'none' }
                }
            },
            contentProps: {
                dividers: false,
                sx: {
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    overflowY: 'auto'
                }
            },
            actionsProps: {
                sx: {
                    p: 2,
                    gap: 1,
                    justifyContent: 'flex-end',
                    borderTop: `1px solid ${hairline}`,
                    '& > :not(:first-of-type)': { ml: 1 }
                }
            }
        }
    }, [size, theme])
}

export const SHEET_WIDTHS = { sm: 400, md: 480, lg: 720, xl: 960 }

export const useSheetShell = ({ width = 'md' } = {}) => {
    const theme = useTheme()
    const alphaBorder = alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.06)
    return {
        drawerProps: {
            anchor: 'right',
            PaperProps: {
                sx: {
                    width: { xs: '100%', sm: SHEET_WIDTHS[width] || width },
                    maxWidth: '100vw',
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.08)'
                }
            },
            ModalProps: { keepMounted: false },
            slotProps: { backdrop: { sx: { bgcolor: alpha('#000', 0.32) } } }
        },
        headerProps: {
            sx: {
                position: 'sticky',
                top: 0,
                zIndex: 1,
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${alphaBorder}`
            }
        },
        contentProps: {
            sx: {
                flex: 1,
                overflowY: 'auto',
                px: 3,
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5
            }
        },
        footerProps: {
            sx: {
                position: 'sticky',
                bottom: 0,
                px: 3,
                py: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
                bgcolor: 'background.paper',
                borderTop: `1px solid ${alphaBorder}`
            }
        }
    }
}

const FormField = ({ label, hint, required, htmlFor, children, sx }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }}>
            {label && (
                <Typography
                    component='label'
                    htmlFor={htmlFor}
                    sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 0.75,
                        lineHeight: 1.4,
                        letterSpacing: 0
                    }}
                >
                    {label}
                    {required && (
                        <Box component='span' sx={{ ml: 0.5, color: theme.palette.error.main }}>
                            *
                        </Box>
                    )}
                </Typography>
            )}
            {children}
            {hint && (
                <Typography sx={{ mt: 0.75, fontSize: '0.75rem', color: theme.palette.text.secondary, lineHeight: 1.5 }}>{hint}</Typography>
            )}
        </Box>
    )
}

FormField.propTypes = {
    label: PropTypes.node,
    hint: PropTypes.node,
    required: PropTypes.bool,
    htmlFor: PropTypes.string,
    children: PropTypes.node,
    sx: PropTypes.object
}

export default useDialogShell
export { DialogTransition, FormField }
