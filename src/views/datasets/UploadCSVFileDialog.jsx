import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// Material
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Project imports
import { StyledButton } from '@/ui-component/button/StyledButton'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import { SwitchInput } from '@/ui-component/switch/Switch'
import { File } from '@/ui-component/file/File'
import { TooltipWithParser } from '@/ui-component/tooltip/TooltipWithParser'

// Icons
import { IconX, IconDatabase } from '@tabler/icons-react'

// API
import datasetApi from '@/api/dataset'

// utils
import useNotifier from '@/utils/useNotifier'
import { useLanguage } from '@/store/context/LanguageContext'

// const
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@/store/actions'
const CSV_TABLE = `----------------------------
| Input      | Output      |
----------------------------
| test input | test output |
----------------------------
`

const UploadCSVFileDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
    const portalElement = document.getElementById('portal')
    const { t } = useLanguage()
    const theme = useTheme()

    const dispatch = useDispatch()

    // ==============================|| Snackbar ||============================== //

    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [datasetId, setDatasetId] = useState('')
    const [datasetName, setDatasetName] = useState('')
    const [firstRowHeaders, setFirstRowHeaders] = useState(false)
    const [selectedFile, setSelectedFile] = useState()
    const [dialogType, setDialogType] = useState('ADD')

    useEffect(() => {
        setDatasetId(dialogProps.data.datasetId)
        setDatasetName(dialogProps.data.datasetName)
        setDialogType('ADD')

        return () => {
            setDialogType('ADD')
            setDatasetId('')
            setDatasetName('')
            setFirstRowHeaders(false)
            setSelectedFile()
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
                firstRowHeaders: firstRowHeaders,
                csvFile: selectedFile
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
                                <IconX />
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
                            <IconX />
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
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            marginRight: 10,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.background.paper
                        }}
                    >
                        <IconDatabase
                            style={{
                                width: '100%',
                                height: '100%',
                                padding: 7,
                                borderRadius: '50%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    {t('Upload Items to [{name}] Dataset', { name: datasetName })}
                </div>
            </DialogTitle>
            <DialogContent>
                <Box className='nx-field' sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>
                            {t('Upload CSV')}
                            <TooltipWithParser
                                style={{ mb: 1, mt: 2 }}
                                title={`<pre>${t('Only the first 2 columns will be considered:')}
${CSV_TABLE}</pre>`}
                            />
                        </Typography>
                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <File
                        disabled={false}
                        fileType='.csv'
                        onChange={(newValue) => setSelectedFile(newValue)}
                        value={selectedFile ?? t('Choose a file to upload')}
                    />
                    <SwitchInput
                        value={firstRowHeaders}
                        onChange={setFirstRowHeaders}
                        label={t('Treat First Row as headers in the upload file?')}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()}>{t(dialogProps.cancelButtonName)}</Button>
                <StyledButton
                    disabled={!selectedFile}
                    variant='contained'
                    onClick={() => (dialogType === 'ADD' ? addNewDatasetRow() : saveDatasetRow())}
                >
                    {t(dialogProps.confirmButtonName)}
                </StyledButton>
            </DialogActions>
            <ConfirmDialog />
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

UploadCSVFileDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func
}

export default UploadCSVFileDialog
