import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'

import { getChannelIcon } from '@/views/omnichannel/utils'

// Channel is identified by its own mark (brand logo), not by a colour dot
const ChannelName = ({ label, channelId, color }) => {
    const ChannelIcon = getChannelIcon(channelId)
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChannelIcon size={16} color={channelId ? undefined : color} />
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {label}
            </Typography>
        </Box>
    )
}

ChannelName.propTypes = {
    label: PropTypes.string.isRequired,
    channelId: PropTypes.string,
    color: PropTypes.string
}

export default ChannelName
