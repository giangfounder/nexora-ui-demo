import { useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useLanguage } from '@/store/context/LanguageContext'

const DocumentStoreStatus = ({ status, isTableView }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const customization = useSelector((state) => state.customization)

    const getColor = (status) => {
        switch (status) {
            case 'STALE':
                return [
                    alpha(theme.palette.text.primary, customization.isDarkMode ? 0.16 : 0.1),
                    theme.palette.text.disabled,
                    theme.palette.text.secondary
                ]
            case 'EMPTY':
                return [theme.palette.alpha.borderStrong, theme.palette.text.disabled, theme.palette.text.secondary]
            case 'SYNCING':
                return customization.isDarkMode
                    ? ['#ff6f00', '#ff8f00', '#ffffff'] // Amber
                    : ['#fff8e1', '#ffe57f', '#ffc107']
            case 'UPSERTING':
                return customization.isDarkMode
                    ? ['#01579b', '#0277bd', '#ffffff'] // Light Blue
                    : ['#e1f5fe', '#4fc3f7', '#0288d1']
            case 'SYNC':
                return customization.isDarkMode
                    ? ['#1b5e20', '#2e7d32', '#ffffff'] // Green
                    : ['#e8f5e9', '#81c784', '#43a047']
            case 'UPSERTED':
                return customization.isDarkMode
                    ? ['#004d40', '#00695c', '#ffffff'] // Teal
                    : ['#e0f2f1', '#4db6ac', '#00897b']
            case 'NEW':
                return customization.isDarkMode
                    ? ['#0d47a1', '#1565c0', '#ffffff'] // Blue
                    : ['#e3f2fd', '#64b5f6', '#1e88e5']
            default:
                return [
                    alpha(theme.palette.text.primary, customization.isDarkMode ? 0.12 : 0.08),
                    theme.palette.text.disabled,
                    theme.palette.text.secondary
                ]
        }
    }

    return (
        <>
            {!isTableView && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        background: status === 'EMPTY' ? 'transparent' : getColor(status)[0],
                        border: status === 'EMPTY' ? '1px solid' : 'none',
                        borderColor: status === 'EMPTY' ? getColor(status)[0] : 'transparent',
                        borderRadius: '25px',
                        paddingTop: '3px',
                        paddingBottom: '3px',
                        paddingLeft: '10px',
                        paddingRight: '10px',
                        width: 'fit-content'
                    }}
                >
                    <div
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: status === 'EMPTY' ? 'transparent' : getColor(status)[1],
                            border: status === 'EMPTY' ? '3px solid' : 'none',
                            borderColor: status === 'EMPTY' ? getColor(status)[1] : 'transparent'
                        }}
                    />
                    <span style={{ fontSize: '0.7rem', color: getColor(status)[2], marginLeft: 5 }}>{t(status)}</span>
                </div>
            )}
            {isTableView && (
                <div
                    style={{
                        display: 'flex',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: status === 'EMPTY' ? 'transparent' : getColor(status)[1],
                        border: status === 'EMPTY' ? '3px solid' : 'none',
                        borderColor: status === 'EMPTY' ? getColor(status)[1] : 'transparent'
                    }}
                    title={t(status)}
                ></div>
            )}
        </>
    )
}

DocumentStoreStatus.propTypes = {
    status: PropTypes.string,
    isTableView: PropTypes.bool
}

export default DocumentStoreStatus
