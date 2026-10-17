import PropTypes from 'prop-types'
import { useState } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'

import NavItem from '../NavItem'
import { useLanguage } from '@/store/context/LanguageContext'

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'

const NavCollapse = ({ menu, level }) => {
    const theme = useTheme()
    const { t } = useLanguage()

    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState(null)

    const handleClick = () => {
        setOpen(!open)
        setSelected(!selected ? menu.id : null)
    }

    const menus = menu.children?.map((item) => {
        switch (item.type) {
            case 'collapse':
                return <NavCollapse key={item.id} menu={item} level={level + 1} />
            case 'item':
                return <NavItem key={item.id} item={item} level={level + 1} />
            default:
                return null
        }
    })

    const Icon = menu.icon
    const isActive = selected === menu.id
    const menuIcon = menu.icon ? (
        <Icon size={18} strokeWidth={isActive || open ? 2 : 1.75} />
    ) : (
        <FiberManualRecordIcon
            sx={{
                width: selected === menu.id ? 8 : 6,
                height: selected === menu.id ? 8 : 6
            }}
            fontSize={level > 0 ? 'inherit' : 'medium'}
        />
    )

    const labelColor = isActive || open ? theme.palette.text.primary : theme.palette.text.secondary
    const iconColor = isActive || open ? theme.palette.text.primary : theme.palette.text.disabled

    return (
        <>
            <ListItemButton
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
                        color: theme.palette.text.primary
                    },
                    '&:focus-visible': {
                        outline: 'none',
                        boxShadow: theme.customShadows?.focusRing
                    }
                }}
                selected={isActive}
                onClick={handleClick}
            >
                <ListItemIcon
                    sx={{
                        my: 'auto',
                        minWidth: 'auto',
                        color: iconColor,
                        transition: 'color 120ms ease-out',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    {menuIcon}
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: isActive || open ? 600 : 500,
                                lineHeight: 1.2,
                                color: 'inherit'
                            }}
                        >
                            {t(menu.title)}
                        </Typography>
                    }
                    sx={{ my: 'auto', minWidth: 0 }}
                />
                <Box
                    sx={{
                        color: theme.palette.text.disabled,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 150ms ease-out',
                        transform: open ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}
                >
                    {open ? <IconChevronDown size={14} strokeWidth={1.75} /> : <IconChevronRight size={14} strokeWidth={1.75} />}
                </Box>
            </ListItemButton>
            <Collapse in={open} timeout='auto' unmountOnExit>
                <Box
                    sx={{
                        ml: 2.5,
                        pl: 1.5,
                        borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
                    }}
                >
                    <List component='div' disablePadding>
                        {menus}
                    </List>
                </Box>
            </Collapse>
        </>
    )
}

NavCollapse.propTypes = {
    menu: PropTypes.object,
    level: PropTypes.number
}

export default NavCollapse
