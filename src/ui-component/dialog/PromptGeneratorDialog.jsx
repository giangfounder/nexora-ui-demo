import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { OutlinedInput, DialogActions, Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'
import assistantsApi from '@/api/assistants'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import useNotifier from '@/utils/useNotifier'
import { LoadingButton } from '@mui/lab'
import { useLanguage } from '@/store/context/LanguageContext'

const defaultInstructions = [
    {
        text: 'Summarize a document',
        img: <AppIcon name='Notebook' />
    },
    {
        text: 'Translate the language',
        img: <AppIcon name='Translate' />
    },
    {
        text: 'Write me an email',
        img: <AppIcon name='Envelope' />
    },
    {
        text: 'Convert the code to another language',
        img: <AppIcon name='Code' />
    },
    {
        text: 'Research and generate a report',
        img: <AppIcon name='Notebook' />
    },
    {
        text: 'Plan a trip',
        img: <AppIcon name='Globe' />
    }
]

const AssistantPromptGenerator = ({ show, dialogProps, onCancel, onConfirm }) => {
    const { t } = useLanguage()
    const portalElement = document.getElementById('portal')
    const [customAssistantInstruction, setCustomAssistantInstruction] = useState('')
    const [generatedInstruction, setGeneratedInstruction] = useState('')
    const [loading, setLoading] = useState(false)

    // ==============================|| Snackbar ||============================== //
    const dispatch = useDispatch()
    useNotifier()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const onGenerate = async () => {
        try {
            setLoading(true)
            const selectedChatModelObj = {
                name: dialogProps.data.selectedChatModel.name,
                inputs: dialogProps.data.selectedChatModel.inputs
            }
            const resp = await assistantsApi.generateAssistantInstruction({
                selectedChatModel: selectedChatModelObj,
                task: customAssistantInstruction
            })

            if (resp.data) {
                setLoading(false)
                if (resp.data.content) {
                    setGeneratedInstruction(resp.data.content)
                }
            }
        } catch (error) {
            setLoading(false)
            enqueueSnackbar({
                message: typeof error.response.data === 'object' ? error.response.data.message : error.response.data,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <AppIcon name='X' />
                        </Button>
                    )
                }
            })
        }
    }

    // clear the state when dialog is closed
    useEffect(() => {
        if (!show) {
            setCustomAssistantInstruction('')
            setGeneratedInstruction('')
        }
    }, [show])

    const component = show ? (
        <>
            <Dialog
                fullWidth
                maxWidth='md'
                open={show}
                onClose={onCancel}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                    {t(dialogProps.title)}
                </DialogTitle>
                <DialogContent>
                    <span>{t(dialogProps.description)}</span>
                    <div
                        style={{
                            display: 'block',
                            flexDirection: 'row',
                            width: '100%',
                            marginTop: '15px'
                        }}
                    >
                        {defaultInstructions.map((instruction, index) => {
                            return (
                                <Button
                                    size='small'
                                    key={index}
                                    sx={{ textTransform: 'none', mr: 1, mb: 1, borderRadius: '16px' }}
                                    variant='outlined'
                                    color='inherit'
                                    onClick={() => {
                                        setCustomAssistantInstruction(instruction.text)
                                        setGeneratedInstruction('')
                                    }}
                                    startIcon={instruction.img}
                                >
                                    {instruction.text}
                                </Button>
                            )
                        })}
                    </div>
                    {!generatedInstruction && (
                        <OutlinedInput
                            sx={{ mt: 2, width: '100%' }}
                            type={'text'}
                            multiline={true}
                            rows={12}
                            disabled={loading}
                            value={customAssistantInstruction}
                            placeholder={t('Describe your task here')}
                            onChange={(event) => setCustomAssistantInstruction(event.target.value)}
                        />
                    )}
                    {generatedInstruction && (
                        <OutlinedInput
                            sx={{ mt: 2, width: '100%' }}
                            type={'text'}
                            multiline={true}
                            rows={12}
                            value={generatedInstruction}
                            onChange={(event) => setGeneratedInstruction(event.target.value)}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ pb: 3, pr: 3 }}>
                    {!generatedInstruction && (
                        <LoadingButton
                            loading={loading}
                            variant='contained'
                            onClick={() => {
                                onGenerate()
                            }}
                            startIcon={<AppIcon name='NotePencil' size={20} />}
                        >
                            {t('Generate')}
                        </LoadingButton>
                    )}
                    {generatedInstruction && (
                        <Button
                            variant='outlined'
                            startIcon={<AppIcon name='ArrowLeft' size={20} />}
                            onClick={() => {
                                setGeneratedInstruction('')
                            }}
                        >
                            {t('Back')}
                        </Button>
                    )}
                    {generatedInstruction && (
                        <StyledButton variant='contained' onClick={() => onConfirm(generatedInstruction)}>
                            {t('Apply')}
                        </StyledButton>
                    )}
                </DialogActions>
            </Dialog>
        </>
    ) : null

    return createPortal(component, portalElement)
}

AssistantPromptGenerator.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func
}

export default AssistantPromptGenerator
