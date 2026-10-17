import PropTypes from 'prop-types'

import { Avatar } from '@mui/material'
import { alpha } from '@mui/material/styles'

import { AppIcon } from '@/ui-component/icons/AppIcon'
import { getInitials } from '@/views/customers/utils'

// ==============================|| PERSON AVATAR ||============================== //
// Default avatar for people (customers, employees) and assistants when there is no photo.
// A neutral rounded square with a hairline border and initials in the body text colour:
// no per-person pastel hues, no circles. Without a usable name it shows a person glyph;
// `kind='assistant'` shows a robot glyph instead of initials.

export const PersonAvatar = ({ name = '', src, size = 28, kind = 'person', sx: sxProp = {}, ...others }) => {
    const initials = kind === 'assistant' ? '' : getInitials(name)
    const radius = Math.max(4, Math.round(size * 0.28))
    return (
        <Avatar
            src={src}
            alt={name || undefined}
            variant='rounded'
            sx={(theme) => {
                const isDark = theme.palette.mode === 'dark'
                return {
                    width: size,
                    height: size,
                    flexShrink: 0,
                    borderRadius: `${radius}px`,
                    fontSize: Math.max(10, Math.round(size * 0.38)),
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    color: theme.palette.text.primary,
                    bgcolor: alpha(theme.palette.text.primary, isDark ? 0.08 : 0.04),
                    border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.16 : 0.12)}`,
                    ...(typeof sxProp === 'function' ? sxProp(theme) : sxProp)
                }
            }}
            {...others}
        >
            {initials || (
                <AppIcon
                    name={kind === 'assistant' ? 'Robot' : 'User'}
                    size={Math.round(size * 0.55)}
                    color={kind === 'assistant' ? 'primary' : undefined}
                />
            )}
        </Avatar>
    )
}

PersonAvatar.propTypes = {
    name: PropTypes.string,
    src: PropTypes.string,
    size: PropTypes.number,
    kind: PropTypes.oneOf(['person', 'assistant']),
    sx: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
}

export default PersonAvatar
