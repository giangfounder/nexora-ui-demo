import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'

const SectionShell = ({ title, children }) => (
    <Box component='section' sx={{ '& + &': { mt: 4 } }}>
        <Typography variant='h3' component='h3' sx={{ mb: 2 }}>
            {title}
        </Typography>
        {children}
    </Box>
)

SectionShell.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node
}

export default SectionShell
