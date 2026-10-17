import PropTypes from 'prop-types'

import { List, Typography } from '@mui/material'

import NavItem from '../NavItem'
import NavCollapse from '../NavCollapse'
import { useAuth } from '@/hooks/useAuth'
import { Available } from '@/ui-component/rbac/available'
import { useLanguage } from '@/store/context/LanguageContext'

const NavGroup = ({ item }) => {
    const { hasPermission, hasDisplay } = useAuth()
    const { t } = useLanguage()

    const shouldDisplayMenu = (menu) => {
        if (menu.permission && !hasPermission(menu.permission)) return false
        if (menu.display) return hasDisplay(menu.display)
        return true
    }

    const renderMenu = (menu, level = 1) => {
        if (!shouldDisplayMenu(menu)) return null
        switch (menu.type) {
            case 'collapse':
                return <NavCollapse key={menu.id} menu={menu} level={level} />
            case 'item':
                return <NavItem key={menu.id} item={menu} level={level} navType='MENU' />
            default:
                return null
        }
    }

    const groups = (item.children || [])
        .map((group) => ({
            ...group,
            children: (group.children || []).filter((menu) => shouldDisplayMenu(menu))
        }))
        .filter((group) => group.children.length > 0)

    return (
        <>
            {groups.map((group) => {
                const groupPermissions = group.children
                    .map((menu) => menu.permission)
                    .filter(Boolean)
                    .join(',')
                const listContent = (
                    <List
                        key={group.id}
                        disablePadding
                        subheader={
                            group.title ? (
                                <Typography
                                    display='block'
                                    sx={{
                                        px: 2,
                                        pt: 3,
                                        pb: 1,
                                        fontSize: '0.6875rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        color: 'text.disabled'
                                    }}
                                >
                                    {t(group.title)}
                                </Typography>
                            ) : null
                        }
                        sx={{ display: 'flex', flexDirection: 'column' }}
                    >
                        {group.children.map((menu) => renderMenu(menu))}
                    </List>
                )
                return groupPermissions ? (
                    <Available key={group.id} permission={groupPermissions}>
                        {listContent}
                    </Available>
                ) : (
                    listContent
                )
            })}
        </>
    )
}

NavGroup.propTypes = {
    item: PropTypes.object
}

export default NavGroup
