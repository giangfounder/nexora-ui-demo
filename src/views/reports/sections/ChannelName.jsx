import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'

const ChannelName = ({ label, color }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
        <Typography variant='body2' sx={{ fontWeight: 500 }}>
            {label}
        </Typography>
    </Box>
)

ChannelName.propTypes = {
    label: PropTypes.string.isRequired,
    color: PropTypes.string
}

export default ChannelName
