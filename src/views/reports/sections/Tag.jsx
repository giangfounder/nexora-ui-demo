import PropTypes from 'prop-types'
import { alpha, useTheme } from '@mui/material/styles'
import { Chip } from '@mui/material'

const Tag = ({ label, tone, icon }) => {
    const theme = useTheme()
    const color = tone || theme.palette.text.primary
    return (
        <Chip
            size='small'
            label={label}
            icon={icon}
            sx={{
                bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                color: 'text.primary',
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                '& .MuiChip-icon': { color, ml: 0.75, mr: -0.25 }
            }}
        />
    )
}

Tag.propTypes = {
    label: PropTypes.node.isRequired,
    tone: PropTypes.string,
    icon: PropTypes.element
}

export default Tag
