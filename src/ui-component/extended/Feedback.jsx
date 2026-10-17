import { Alert, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import PropTypes from 'prop-types'

import { AppIcon } from '@/ui-component/icons/AppIcon'

const ThumbsUpIcon = () => <AppIcon name='ThumbsUp' size={20} />

const ThumbsDownIcon = () => <AppIcon name='ThumbsDown' size={20} />

const Feedback = ({ content, rating }) => {
    const theme = useTheme()

    return (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
            {content ? (
                <Alert
                    icon={rating === 'THUMBS_UP' ? <ThumbsUpIcon /> : <ThumbsDownIcon />}
                    severity={rating === 'THUMBS_UP' ? 'success' : 'error'}
                    style={{ marginBottom: 14 }}
                    variant='outlined'
                >
                    {content ? <span style={{ color: theme.palette.text.primary }}>{content}</span> : null}
                </Alert>
            ) : (
                <IconButton color={rating === 'THUMBS_UP' ? 'success' : 'error'} style={{ marginBottom: 14 }}>
                    {rating === 'THUMBS_UP' ? <ThumbsUpIcon /> : <ThumbsDownIcon />}
                </IconButton>
            )}
        </div>
    )
}

Feedback.propTypes = {
    rating: PropTypes.oneOf(['THUMBS_UP', 'THUMBS_DOWN']),
    content: PropTypes.string
}

export default Feedback
