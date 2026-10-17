import PropTypes from 'prop-types'
import { forwardRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { alpha, useTheme } from '@mui/material/styles'
import { Avatar, Box, Chip, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material'

import { MENU_OPEN, SET_MENU } from '@/store/actions'
import config from '@/config'
import { useLanguage } from '@/store/context/LanguageContext'

import { AppIcon } from '@/ui-component/icons/AppIcon'

const NavItem = ({ item, level, navType, onClick, onUploadFile }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const customization = useSelector((state) => state.customization)
    const matchesSM = useMediaQuery(theme.breakpoints.down('lg'))
    const { t } = useLanguage()

    const Icon = item.icon
    const isActive = customization.isOpen.findIndex((id) => id === item.id) > -1
    const itemIcon = item?.icon ? (
        <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
    ) : (
        <AppIcon
            name='Circle'
            sx={{
                width: customization.isOpen.findIndex((id) => id === item?.id) > -1 ? 8 : 6,
                height: customization.isOpen.findIndex((id) => id === item?.id) > -1 ? 8 : 6
            }}
            fontSize={level > 0 ? 'inherit' : 'medium'}
        />
    )

    let itemTarget = '_self'
    if (item.target) itemTarget = '_blank'

    let listItemProps = {
        component: forwardRef(function ListItemPropsComponent(props, ref) {
            return <Link ref={ref} {...props} to={`${config.basename}${item.url}`} target={itemTarget} />
        })
    }
    if (item?.external) listItemProps = { component: 'a', href: item.url, target: itemTarget }
    if (item?.id === 'loadChatflow') listItemProps.component = 'label'

    const handleFileUpload = (e) => {
        if (!e.target.files) return
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = (evt) => {
            if (!evt?.target?.result) return
            onUploadFile(evt.target.result)
        }
        reader.readAsText(file)
    }

    const itemHandler = (id) => {
        if (navType === 'SETTINGS' && id !== 'loadChatflow') {
            onClick(id)
        } else {
            dispatch({ type: MENU_OPEN, id })
            if (matchesSM) dispatch({ type: SET_MENU, opened: false })
        }
    }

    useEffect(() => {
        if (navType === 'MENU') {
            const currentIndex = document.location.pathname
                .toString()
                .split('/')
                .findIndex((id) => id === item.id)
            if (currentIndex > -1) {
                dispatch({ type: MENU_OPEN, id: item.id })
            }
            if (!document.location.pathname.toString().split('/')[1]) {
                itemHandler('chatflows')
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navType])

    const baseColor = theme.palette.text.secondary
    const iconColor = isActive ? theme.palette.text.primary : theme.palette.text.disabled
    const labelColor = isActive ? theme.palette.text.primary : baseColor

    return (
        <ListItemButton
            {...listItemProps}
            disabled={item.disabled}
            disableRipple
            sx={{
                position: 'relative',
                borderRadius: '6px',
                mx: 1,
                my: 0.125,
                px: 2,
                py: 1,
                minHeight: 36,
                gap: '12px',
                color: labelColor,
                backgroundColor: 'transparent',
                transition: 'background-color 120ms ease-out, color 120ms ease-out',
                '&::after': isActive
                    ? {
                          content: '""',
                          position: 'absolute',
                          right: 0,
                          top: 6,
                          bottom: 6,
                          width: 2,
                          borderRadius: 1,
                          backgroundColor: theme.palette.primary.main
                      }
                    : {},
                '&:hover': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.04),
                    color: theme.palette.text.primary,
                    '& .nav-item-icon': { color: theme.palette.text.primary }
                },
                '&.Mui-selected, &.Mui-selected:hover': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.04)
                },
                '&:focus-visible': {
                    outline: 'none',
                    boxShadow: theme.customShadows?.focusRing
                }
            }}
            selected={isActive}
            onClick={() => itemHandler(item.id)}
        >
            {item.id === 'loadChatflow' && <input type='file' hidden accept='.json' onChange={(e) => handleFileUpload(e)} />}
            <ListItemIcon
                className='nav-item-icon'
                sx={{
                    my: 'auto',
                    minWidth: 'auto',
                    color: iconColor,
                    transition: 'color 120ms ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {itemIcon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography
                        sx={{
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 600 : 500,
                            lineHeight: 1.2,
                            color: 'inherit'
                        }}
                    >
                        {t(item.title)}
                    </Typography>
                }
                sx={{ my: 'auto', minWidth: 0 }}
            />
            {typeof item.count === 'number' && (
                <Box
                    sx={{
                        px: '6px',
                        py: '1px',
                        borderRadius: '999px',
                        backgroundColor: alpha(theme.palette.text.primary, 0.06),
                        color: theme.palette.text.secondary,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        minWidth: 18,
                        textAlign: 'center'
                    }}
                >
                    {item.count}
                </Box>
            )}
            {item.chip && (
                <Chip
                    color={item.chip.color}
                    variant={item.chip.variant}
                    size={item.chip.size}
                    label={item.chip.label}
                    avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
                />
            )}
            {item.isBeta && (
                <Box
                    sx={{
                        px: '6px',
                        py: '1px',
                        borderRadius: '999px',
                        backgroundColor: alpha(theme.palette.text.primary, 0.06),
                        color: theme.palette.text.secondary,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em'
                    }}
                >
                    BETA
                </Box>
            )}
        </ListItemButton>
    )
}

NavItem.propTypes = {
    item: PropTypes.object,
    level: PropTypes.number,
    navType: PropTypes.string,
    onClick: PropTypes.func,
    onUploadFile: PropTypes.func
}

export default NavItem
