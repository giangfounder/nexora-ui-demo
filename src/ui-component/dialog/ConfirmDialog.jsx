import { createPortal } from 'react-dom'
import { useMemo } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, Dialog, Typography } from '@mui/material'

import useConfirm from '@/hooks/useConfirm'
import { useLanguage } from '@/store/context/LanguageContext'

const detectTone = (confirmText = '') => {
    const s = confirmText.toLowerCase()
    if (/(xoá|xóa|xoa|delete|remove|gỡ|huỷ vĩnh viễn|reset)/.test(s)) return 'error'
    return 'primary'
}

const ConfirmDialog = () => {
    const { onConfirm, onCancel, confirmState } = useConfirm()
    const { t } = useLanguage()
    const theme = useTheme()

    const portalElement = typeof document !== 'undefined' ? document.getElementById('portal') : null

    const tone = useMemo(() => detectTone(confirmState.confirmButtonName), [confirmState.confirmButtonName])
    const showDescription = Boolean(confirmState.description) && String(confirmState.description).trim().length > 0

    if (!confirmState.show) return portalElement ? createPortal(null, portalElement) : null

    const isDark = theme.palette.mode === 'dark'
    const hairline = isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)

    const component = (
        <Dialog
            open={confirmState.show}
            onClose={onCancel}
            aria-labelledby='confirm-dialog-title'
            aria-describedby={showDescription ? 'confirm-dialog-description' : undefined}
            slotProps={{ backdrop: { sx: { bgcolor: alpha('#000', 0.32) } } }}
            PaperProps={{
                elevation: 0,
                sx: {
                    width: 400,
                    maxWidth: '95vw',
                    borderRadius: 3,
                    border: `1px solid ${hairline}`,
                    bgcolor: 'background.paper',
                    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)',
                    overflow: 'hidden'
                }
            }}
        >
            <Box
                id='confirm-dialog-title'
                sx={{
                    px: 3,
                    py: 2,
                    borderBottom: `1px solid ${hairline}`,
                    bgcolor: 'background.paper'
                }}
            >
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 }}>{t(confirmState.title)}</Typography>
            </Box>

            {showDescription && (
                <Box id='confirm-dialog-description' sx={{ px: 3, py: 2.5 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.55 }}>
                        {t(confirmState.description)}
                    </Typography>
                </Box>
            )}

            <Box
                sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    borderTop: `1px solid ${hairline}`,
                    bgcolor: 'background.paper'
                }}
            >
                {confirmState.cancelButtonName && (
                    <Button onClick={onCancel} color='inherit' variant='text' sx={{ fontWeight: 500 }}>
                        {t(confirmState.cancelButtonName)}
                    </Button>
                )}
                <Button variant='contained' color={tone} onClick={onConfirm} sx={{ fontWeight: 600 }} disableElevation>
                    {t(confirmState.confirmButtonName)}
                </Button>
            </Box>
        </Dialog>
    )

    return portalElement ? createPortal(component, portalElement) : component
}

export default ConfirmDialog
