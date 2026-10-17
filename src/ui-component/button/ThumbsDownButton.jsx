import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { IconButton } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import { useLanguage } from '@/store/context/LanguageContext'

const ThumbsDownButton = (props) => {
    const customization = useSelector((state) => state.customization)
    const { t } = useLanguage()
    return (
        <IconButton
            disabled={props.isDisabled || props.isLoading}
            onClick={props.onClick}
            size='small'
            sx={{ background: 'transparent', border: 'none' }}
            title={t('Thumbs Down')}
        >
            <AppIcon
                name='ThumbsDown'
                style={{ width: '20px', height: '20px' }}
                color={props.rating === 'THUMBS_DOWN' ? '#9e9e9e' : customization.isDarkMode ? 'white' : '#1e88e5'}
            />
        </IconButton>
    )
}

ThumbsDownButton.propTypes = {
    isDisabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    onClick: PropTypes.func,
    rating: PropTypes.string
}

export default ThumbsDownButton
