import PropTypes from 'prop-types'
import { Alert } from '@mui/material'
import { useLanguage } from '@/store/context/LanguageContext'

// NEXORA announcement banner. Copy is empty by default — set via i18n key `announcement.banner`
// or wire a runtime source. Kept as no-op when message is empty.
const AnnouncementBanner = ({ onClose }) => {
    const { t } = useLanguage()
    const message = t('announcement.banner')
    // If key not translated (returns itself) treat as empty
    if (!message || message === 'announcement.banner') return null
    return (
        <Alert
            severity='info'
            onClose={onClose}
            sx={{
                position: 'relative',
                borderRadius: 0,
                py: 0.5,
                '& .MuiAlert-icon': { display: 'none' },
                '& .MuiAlert-message': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    width: '100%'
                },
                '& .MuiAlert-action': { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', p: 0 }
            }}
        >
            {message}
        </Alert>
    )
}

AnnouncementBanner.propTypes = {
    onClose: PropTypes.func
}

export default AnnouncementBanner
