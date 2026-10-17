import { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar, Typography } from '@mui/material'
import {
    IconBraces,
    IconChevronDown,
    IconCode,
    IconDownload,
    IconFileSpreadsheet,
    IconFileText,
    IconFileTypePdf,
    IconTable,
    IconWorld
} from '@tabler/icons-react'

import { useLanguage } from '@/store/context/LanguageContext'
import { EXPORT_FORMATS } from '@/utils/tableExport'

const FORMAT_ICONS = {
    pdf: IconFileTypePdf,
    html: IconWorld,
    xlsx: IconFileSpreadsheet,
    ods: IconFileSpreadsheet,
    csv: IconTable,
    tsv: IconFileText,
    json: IconBraces,
    xml: IconCode
}

// ==============================|| EXPORT MENU ||============================== //
// "Xuất báo cáo" button + grouped format menu. `onExport(format)` returns the saved file name
// (or null when nothing was downloaded, e.g. PDF opens the print dialog).

const ExportMenu = ({ caption, onExport, label, formats = EXPORT_FORMATS, buttonProps }) => {
    const { t } = useLanguage()
    const [anchor, setAnchor] = useState(null)
    const [savedFile, setSavedFile] = useState(null)

    const handle = (format) => {
        setAnchor(null)
        const filename = onExport(format)
        if (filename) setSavedFile(filename)
    }

    return (
        <>
            <Button
                variant='outlined'
                color='inherit'
                startIcon={<IconDownload size={18} stroke={1.75} />}
                endIcon={<IconChevronDown size={16} stroke={2} />}
                aria-haspopup='true'
                aria-expanded={Boolean(anchor)}
                onClick={(e) => setAnchor(e.currentTarget)}
                {...buttonProps}
                sx={{ flexShrink: 0, borderRadius: '10px', ...buttonProps?.sx }}
            >
                {label || t('Xuất báo cáo')}
            </Button>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { minWidth: 260, borderRadius: '12px', mt: 0.5 } }}
            >
                {caption && (
                    <Typography
                        component='li'
                        variant='caption'
                        sx={{ display: 'block', px: 2, pt: 1, pb: 0.25, listStyle: 'none', color: 'text.secondary' }}
                    >
                        {caption}
                    </Typography>
                )}
                {formats.flatMap((f, i) => {
                    const Icon = FORMAT_ICONS[f.id] || IconFileText
                    const startsGroup = f.group && f.group !== formats[i - 1]?.group
                    return [
                        startsGroup && (
                            <Typography
                                key={`g-${f.group}`}
                                component='li'
                                sx={{ typography: 'eyebrow', px: 2, pt: i === 0 ? 1 : 1.5, pb: 0.5, listStyle: 'none' }}
                            >
                                {t(f.group)}
                            </Typography>
                        ),
                        <MenuItem key={f.id} onClick={() => handle(f.id)} sx={{ py: 0.875 }}>
                            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
                                <Icon size={20} stroke={1.75} />
                            </ListItemIcon>
                            <ListItemText
                                primary={`${f.label} (.${f.ext})`}
                                secondary={t(f.hint)}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </MenuItem>
                    ].filter(Boolean)
                })}
            </Menu>
            <Snackbar
                open={Boolean(savedFile)}
                autoHideDuration={3500}
                onClose={() => setSavedFile(null)}
                message={t('Đã tải về {file}', { file: savedFile || '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </>
    )
}

ExportMenu.propTypes = {
    caption: PropTypes.node,
    onExport: PropTypes.func.isRequired,
    label: PropTypes.node,
    formats: PropTypes.array,
    buttonProps: PropTypes.object
}

export default ExportMenu
