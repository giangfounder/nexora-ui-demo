// NEXORA unified surface — ONE component contract.
// Font size, radius, shadow, spacing phải đi qua theme hoặc primitive.
// View chỉ được quyết định bố cục — KHÔNG override radius/shadow/typography ad-hoc.

export default function componentStyleOverrides(theme) {
    const isDark = !!theme?.customization?.isDarkMode
    const hairline = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
    const hairlineStrong = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'
    const hairlineFaint = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    const hoverAlpha = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
    const focusRing = `0 0 0 3px rgba(37,99,235,0.28)`

    return {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    scrollbarColor: isDark
                        ? `${theme.colors?.grey500} ${theme.colors?.darkPrimaryMain}`
                        : `${theme.colors?.grey300} ${theme.paper}`,
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        width: 12,
                        height: 12,
                        backgroundColor: isDark ? theme.colors?.darkPrimaryMain : theme.paper
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: 6,
                        backgroundColor: isDark ? theme.colors?.grey500 : theme.colors?.grey300,
                        minHeight: 24,
                        border: `3px solid ${isDark ? theme.colors?.darkPrimaryMain : theme.paper}`
                    },
                    '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
                        backgroundColor: isDark ? theme.colors?.darkPrimary200 : theme.colors?.grey500
                    },
                    '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
                        backgroundColor: isDark ? theme.colors?.darkPrimary200 : theme.colors?.grey500
                    },
                    '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: isDark ? theme.colors?.darkPrimary200 : theme.colors?.grey500
                    },
                    '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
                        backgroundColor: isDark ? theme.colors?.darkPrimaryMain : theme.paper
                    }
                },
                // Legacy dialog fields (<Box className='nx-field'>): label row + control, aligned with the
                // dialog title and spaced exactly like FormField in the NEXORA forms.
                '.nx-field': {
                    paddingTop: '10px !important',
                    paddingBottom: '10px !important',
                    paddingLeft: '0 !important',
                    paddingRight: '0 !important'
                },
                '.nx-field > :first-child:not(.MuiInputBase-root):not(.MuiButton-root)': {
                    marginBottom: 6,
                    alignItems: 'center'
                },
                '.nx-field > :first-child.MuiTypography-root, .nx-field > :first-child > .MuiTypography-root': {
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    letterSpacing: 0,
                    textTransform: 'none',
                    color: theme.palette?.text?.primary
                },
                '.nx-field > :first-child + *': { marginTop: '0 !important' }
            }
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 6,
                    textTransform: 'none',
                    minHeight: 36,
                    padding: '8px 14px',
                    boxShadow: 'none',
                    transition: 'background-color 120ms ease-out, border-color 120ms ease-out, color 120ms ease-out',
                    '&:hover': { boxShadow: 'none' },
                    '&.Mui-focusVisible': { boxShadow: focusRing }
                },
                sizeSmall: {
                    minHeight: 30,
                    padding: '6px 10px',
                    fontSize: '0.8125rem'
                },
                sizeLarge: {
                    minHeight: 42,
                    padding: '10px 18px'
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' }
                },
                outlined: {
                    borderColor: hairlineStrong,
                    '&:hover': {
                        borderColor: hairlineStrong,
                        backgroundColor: hoverAlpha
                    }
                },
                text: {
                    '&:hover': { backgroundColor: hoverAlpha }
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    '&.Mui-focusVisible': { boxShadow: focusRing }
                }
            }
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: isDark ? theme.colors?.paper : 'inherit'
                }
            }
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none'
                },
                // Panel default = 10px. Dialog/overlay override via their own components.
                rounded: {
                    borderRadius: 10
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 2px rgba(16,24,40,0.04), 0 2px 8px -2px rgba(16,24,40,0.06)',
                    backgroundImage: 'none',
                    border: `1px solid ${hairline}`
                }
            }
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    color: theme.colors?.textDark,
                    padding: '20px 20px 12px'
                },
                title: {
                    fontSize: '1.125rem',
                    fontWeight: 600
                }
            }
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '20px',
                    '&:last-child': { paddingBottom: 20 }
                }
            }
        },
        MuiCardActions: {
            styleOverrides: {
                root: {
                    padding: '12px 20px 16px'
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    backgroundImage: 'none'
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    padding: '20px 24px 12px'
                }
            }
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '12px 24px 20px',
                    // title → content keeps one rhythm even when MUI's sibling rule kicks in
                    '.MuiDialogTitle-root + &': { paddingTop: 12 }
                },
                dividers: { padding: '20px 24px' }
            }
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '12px 24px 20px',
                    gap: 8,
                    '& > :not(style) ~ :not(style)': { marginLeft: 0 }
                }
            }
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 10,
                    border: `1px solid ${hairline}`
                }
            }
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    borderRadius: 10,
                    border: `1px solid ${hairline}`
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    color: theme.darkTextPrimary,
                    borderRadius: 6,
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    '&.Mui-selected': {
                        color: theme.menuSelected,
                        backgroundColor: theme.menuSelectedBack,
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: theme.menuSelectedBack
                        },
                        '& .MuiListItemIcon-root': {
                            color: theme.menuSelected
                        }
                    },
                    '&:hover': {
                        backgroundColor: hoverAlpha,
                        color: theme.textDark || theme.darkTextPrimary,
                        '& .MuiListItemIcon-root': {
                            color: 'inherit'
                        }
                    }
                }
            }
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: theme.darkTextPrimary,
                    minWidth: '36px'
                }
            }
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    color: theme.textDark
                }
            }
        },
        MuiInputBase: {
            styleOverrides: {
                input: {
                    color: theme.textDark,
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    '&::placeholder': {
                        color: isDark ? theme.colors?.grey500 : theme.colors?.grey400,
                        opacity: 1,
                        fontSize: '0.875rem',
                        fontWeight: 400
                    },
                    '&.Mui-disabled': {
                        WebkitTextFillColor: isDark ? theme.colors?.grey500 : theme.darkTextSecondary
                    }
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    background: isDark ? theme.colors?.darkPrimary800 : theme.paper,
                    borderRadius: 6,
                    transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: hairlineStrong,
                        borderWidth: '1px',
                        transition: 'border-color 120ms ease-out'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.22)'
                    },
                    '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.colors?.primaryMain,
                            borderWidth: '1px'
                        },
                        boxShadow: focusRing
                    },
                    '&.Mui-error': {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.colors?.errorMain
                        },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 3px ${theme.colors?.errorMain}22`
                        }
                    },
                    '&.Mui-disabled': {
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: hairline
                        }
                    },
                    '&.MuiInputBase-multiline': {
                        padding: 0
                    }
                },
                input: {
                    fontWeight: 400,
                    background: 'transparent',
                    padding: '10px 12px',
                    borderRadius: 6,
                    // Chrome autofill paints a blue fill that ignores the theme; mask it with an inset shadow.
                    '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
                        WebkitBoxShadow: `0 0 0 100px ${isDark ? theme.colors?.darkPrimary800 : theme.paper} inset`,
                        WebkitTextFillColor: isDark ? theme.colors?.paper : theme.textDark,
                        caretColor: isDark ? theme.colors?.paper : theme.textDark,
                        transition: 'background-color 9999s ease-out'
                    },
                    '&.MuiInputBase-inputSizeSmall': {
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                        '&.MuiInputBase-inputAdornedStart': {
                            paddingLeft: 0
                        }
                    },
                    '&.MuiInputBase-inputMultiline': {
                        padding: '10px 12px'
                    }
                },
                inputAdornedStart: {
                    paddingLeft: 4
                },
                notchedOutline: {
                    borderRadius: 6
                }
            }
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: theme.heading,
                    '&.Mui-focused': {
                        color: theme.colors?.primaryMain
                    },
                    '&.Mui-error': {
                        color: theme.colors?.errorMain
                    }
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                outlined: {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: theme.darkTextPrimary
                }
            }
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    '&.Mui-disabled': {
                        color: theme.colors?.grey300
                    }
                },
                mark: {
                    backgroundColor: theme.paper,
                    width: '4px'
                },
                valueLabel: {
                    color: theme?.colors?.primaryLight
                }
            }
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: hairlineFaint,
                    opacity: 1
                }
            }
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    color: theme.colors?.primaryDark,
                    background: theme.colors?.primary200
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                    '&.MuiChip-deletable .MuiChip-deleteIcon': {
                        color: 'inherit'
                    }
                },
                // Custom status variant — pill 9999 chỉ dùng cho status tag / filter đang bật.
                filledPrimary: {},
                outlined: {
                    borderColor: hairlineStrong
                }
            },
            variants: [
                {
                    props: { variant: 'status' },
                    style: {
                        borderRadius: 9999,
                        height: 22,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        paddingLeft: 4,
                        paddingRight: 4
                    }
                }
            ]
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 40,
                    borderBottom: `1px solid ${hairline}`,
                    // first tab's label lines up with the page title / content edge below it
                    '& .MuiTabs-flexContainer:not(.MuiTabs-centered) > .MuiTab-root:first-of-type': { paddingLeft: 0 }
                },
                indicator: {
                    height: 2,
                    borderRadius: 0
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 40,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    lineHeight: 1.25,
                    color: theme.darkTextPrimary,
                    opacity: 1,
                    '&:hover': { color: theme.heading },
                    '&.Mui-selected': { color: theme.colors?.primaryMain, fontWeight: 600 }
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${hairlineFaint}`
                },
                head: {
                    backgroundColor: 'transparent',
                    fontWeight: 600,
                    color: theme.darkTextSecondary,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    letterSpacing: 0
                }
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    color: isDark ? theme.colors?.paper : theme.paper,
                    background: theme.colors?.grey700,
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '6px 10px'
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                option: {
                    '&:hover': {
                        background: isDark ? '#233345 !important' : ''
                    }
                }
            }
        }
    }
}
