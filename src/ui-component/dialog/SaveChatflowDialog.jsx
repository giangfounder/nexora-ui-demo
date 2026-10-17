import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { Button, Dialog, DialogActions, DialogContent, OutlinedInput, DialogTitle } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { useLanguage } from '@/store/context/LanguageContext'

const SaveChatflowDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
    const { t } = useLanguage()
    const portalElement = document.getElementById('portal')

    const [chatflowName, setChatflowName] = useState('')
    const [isReadyToSave, setIsReadyToSave] = useState(false)

    useEffect(() => {
        if (chatflowName) setIsReadyToSave(true)
        else setIsReadyToSave(false)
    }, [chatflowName])

    const component = show ? (
        <Dialog
            open={show}
            fullWidth
            maxWidth='xs'
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            disableRestoreFocus // needed due to StrictMode
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {t(dialogProps.title)}
            </DialogTitle>
            <DialogContent>
                <OutlinedInput
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    sx={{ mt: 1 }}
                    id='chatflow-name'
                    type='text'
                    fullWidth
                    placeholder={t('My New Chatflow')}
                    value={chatflowName}
                    onChange={(e) => setChatflowName(e.target.value)}
                    onKeyDown={(e) => {
                        if (isReadyToSave && e.key === 'Enter') onConfirm(e.target.value)
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{t(dialogProps.cancelButtonName)}</Button>
                <StyledButton disabled={!isReadyToSave} variant='contained' onClick={() => onConfirm(chatflowName)}>
                    {t(dialogProps.confirmButtonName)}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

SaveChatflowDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func
}

export default SaveChatflowDialog
