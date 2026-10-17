import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// Material
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, OutlinedInput } from '@mui/material'

// Project imports
import { StyledPermissionButton } from '@/ui-component/button/RBACButtons'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'

// Icons
import { AppIcon } from '@/ui-component/icons/AppIcon'

// API
import datasetApi from '@/api/dataset'

// Hooks

// utils
import useNotifier from '@/utils/useNotifier'
import { useLanguage } from '@/store/context/LanguageContext'

// const
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@/store/actions'

const AddEditDatasetRowDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
    const portalElement = document.getElementById('portal')
    const { t } = useLanguage()

    const dispatch = useDispatch()

    // ==============================|| Snackbar ||============================== //

    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [datasetId, setDatasetId] = useState('')
    const [datasetName, setDatasetName] = useState('')
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [dialogType, setDialogType] = useState('ADD')
    const [row, setRow] = useState({})

    useEffect(() => {
        if (dialogProps.type === 'EDIT' && dialogProps.data) {
            setDatasetId(dialogProps.data.datasetId)
            setDatasetName(dialogProps.data.datasetName)
            setDialogType('EDIT')
            setRow(dialogProps.data)
            setInput(dialogProps.data.input)
            setOutput(dialogProps.data.output)
        } else if (dialogProps.type === 'ADD') {
            setDatasetId(dialogProps.data.datasetId)
            setDatasetName(dialogProps.data.datasetName)
            setDialogType('ADD')
            setRow({})
        }

        return () => {
            setInput('')
            setOutput('')
            setDialogType('ADD')
            setRow({})
        }
    }, [dialogProps])

    useEffect(() => {
        if (show) dispatch({ type: SHOW_CANVAS_DIALOG })
        else dispatch({ type: HIDE_CANVAS_DIALOG })
        return () => dispatch({ type: HIDE_CANVAS_DIALOG })
    }, [show, dispatch])

    const addNewDatasetRow = async () => {
        try {
            const obj = {
                datasetId: datasetId,
                input: input,
                output: output
            }
            const createResp = await datasetApi.createDatasetRow(obj)
            if (createResp.data) {
                enqueueSnackbar({
                    message: t('New Row added for the given Dataset'),
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <AppIcon name='X' />
                            </Button>
                        )
                    }
                })
                onConfirm(createResp.data.id)
            }
        } catch (error) {
            enqueueSnackbar({
                message: t('Failed to add new row in the Dataset: {error}', {
                    error: typeof error.response.data === 'object' ? error.response.data.message : error.response.data
                }),
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
            onCancel()
        }
    }

    const saveDatasetRow = async () => {
        try {
            const saveObj = {
                input: input,
                output: output
            }

            const saveResp = await datasetApi.updateDatasetRow(row.id, saveObj)
            if (saveResp.data) {
                enqueueSnackbar({
                    message: t('Dataset Row saved'),
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <AppIcon name='X' />
                            </Button>
                        )
                    }
                })
                onConfirm(saveResp.data.id)
            }
        } catch (error) {
            enqueueSnackbar({
                message: t('Failed to save Dataset Row: {error}', {
                    error: typeof error.response.data === 'object' ? error.response.data.message : error.response.data
                }),
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
            onCancel()
        }
    }

    const component = show ? (
        <Dialog
            fullWidth
            maxWidth='sm'
            open={show}
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <AppIcon name='Database' style={{ marginRight: '10px' }} />
                    {dialogProps.type === 'ADD'
                        ? t('Add Item to {name} Dataset', { name: datasetName })
                        : t('Edit Item in {name} Dataset', { name: datasetName })}
                </div>
            </DialogTitle>
            <DialogContent>
                <Box className='nx-field' sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>
                            {t('Input')}
                            <span style={{ color: 'red' }}>&nbsp;*</span>
                        </Typography>

                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <OutlinedInput
                        size='small'
                        sx={{ mt: 1 }}
                        multiline={true}
                        rows={4}
                        type='string'
                        fullWidth
                        key='input'
                        onChange={(e) => setInput(e.target.value)}
                        value={input ?? ''}
                    />
                </Box>
                <Box className='nx-field' sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>
                            {t('Anticipated Output')}
                            <span style={{ color: 'red' }}>&nbsp;*</span>
                        </Typography>

                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <OutlinedInput
                        size='small'
                        sx={{ mt: 1 }}
                        multiline={true}
                        rows={4}
                        type='string'
                        fullWidth
                        key='output'
                        onChange={(e) => setOutput(e.target.value)}
                        value={output ?? ''}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()}>{t(dialogProps.cancelButtonName)}</Button>
                <StyledPermissionButton
                    permissionId={'datasets:create,datasets:update'}
                    disabled={!input || !output}
                    variant='contained'
                    onClick={() => (dialogType === 'ADD' ? addNewDatasetRow() : saveDatasetRow())}
                >
                    {t(dialogProps.confirmButtonName)}
                </StyledPermissionButton>
            </DialogActions>
            <ConfirmDialog />
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

AddEditDatasetRowDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func
}

export default AddEditDatasetRowDialog
