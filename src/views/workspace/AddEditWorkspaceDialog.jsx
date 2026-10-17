import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Material
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, OutlinedInput } from '@mui/material'

// Project imports
import { StyledButton } from '@/ui-component/button/StyledButton'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'

// Icons
import { AppIcon } from '@/ui-component/icons/AppIcon'

// API
import workspaceApi from '@/api/workspace'

// utils
import useNotifier from '@/utils/useNotifier'
import { useLanguage } from '@/store/context/LanguageContext'

// Store
import { store } from '@/store'
import { workspaceNameUpdated } from '@/store/reducers/authSlice'

// const
import {
    enqueueSnackbar as enqueueSnackbarAction,
    closeSnackbar as closeSnackbarAction,
    HIDE_CANVAS_DIALOG,
    SHOW_CANVAS_DIALOG
} from '@/store/actions'

const AddEditWorkspaceDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
    const portalElement = document.getElementById('portal')
    const { t } = useLanguage()

    const dispatch = useDispatch()

    // ==============================|| Snackbar ||============================== //

    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [workspaceName, setWorkspaceName] = useState('')
    const [workspaceDescription, setWorkspaceDescription] = useState('')
    const [dialogType, setDialogType] = useState('ADD')
    const [workspace, setWorkspace] = useState({})
    const currentUser = useSelector((state) => state.auth.user)

    useEffect(() => {
        if (dialogProps.type === 'EDIT' && dialogProps.data) {
            setWorkspaceName(dialogProps.data.name)
            setWorkspaceDescription(dialogProps.data.description)
            setDialogType('EDIT')
            setWorkspace(dialogProps.data)
        } else if (dialogProps.type === 'ADD') {
            setWorkspaceName('')
            setWorkspaceDescription('')
            setDialogType('ADD')
            setWorkspace({})
        }

        return () => {
            setWorkspaceName('')
            setWorkspaceDescription('')
            setDialogType('ADD')
            setWorkspace({})
        }
    }, [dialogProps])

    useEffect(() => {
        if (show) dispatch({ type: SHOW_CANVAS_DIALOG })
        else dispatch({ type: HIDE_CANVAS_DIALOG })
        return () => dispatch({ type: HIDE_CANVAS_DIALOG })
    }, [show, dispatch])

    const addNewWorkspace = async () => {
        if (workspaceName === 'Default Workspace' || workspaceName === 'Personal Workspace') {
            enqueueSnackbar({
                message: t('Workspace name cannot be Default Workspace or Personal Workspace - this is a reserved name'),
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
            return
        }
        try {
            const obj = {
                name: workspaceName,
                description: workspaceDescription,
                createdBy: currentUser.id,
                organizationId: currentUser.activeOrganizationId,
                existingWorkspaceId: currentUser.activeWorkspaceId // this is used to inherit the current role
            }
            const createResp = await workspaceApi.createWorkspace(obj)
            if (createResp.data) {
                enqueueSnackbar({
                    message: t('New Workspace added'),
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
                message: t('Failed to add new Workspace: {error}', {
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

    const saveWorkspace = async () => {
        try {
            const saveObj = {
                id: workspace.id,
                name: workspaceName,
                description: workspaceDescription,
                updatedBy: currentUser.id
            }

            const saveResp = await workspaceApi.updateWorkspace(saveObj)
            if (saveResp.data) {
                store.dispatch(workspaceNameUpdated(saveResp.data))
                enqueueSnackbar({
                    message: t('Workspace saved'),
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
                onConfirm()
            }
        } catch (error) {
            enqueueSnackbar({
                message: t('Failed to save Workspace: {error}', {
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
                    <AppIcon name='UsersThree' style={{ marginRight: '10px' }} />
                    {dialogProps.type === 'ADD' ? t('Add Workspace') : t('Edit Workspace')}
                </div>
            </DialogTitle>
            <DialogContent>
                <Box className='nx-field' sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>
                            {t('Name')}
                            <span style={{ color: 'red' }}>&nbsp;*</span>
                        </Typography>
                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <OutlinedInput
                        size='small'
                        sx={{ mt: 1 }}
                        type='string'
                        fullWidth
                        key='workspaceName'
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        value={workspaceName ?? ''}
                    />
                </Box>
                <Box className='nx-field' sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>{t('Description')}</Typography>
                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <OutlinedInput
                        size='small'
                        sx={{ mt: 1 }}
                        type='string'
                        fullWidth
                        multiline={true}
                        rows={4}
                        key='workspaceDescription'
                        onChange={(e) => setWorkspaceDescription(e.target.value)}
                        value={workspaceDescription ?? ''}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()}>{t(dialogProps.cancelButtonName)}</Button>
                <StyledButton
                    disabled={!workspaceName}
                    variant='contained'
                    onClick={() => (dialogType === 'ADD' ? addNewWorkspace() : saveWorkspace())}
                >
                    {t(dialogProps.confirmButtonName)}
                </StyledButton>
            </DialogActions>
            <ConfirmDialog />
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

AddEditWorkspaceDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func
}

export default AddEditWorkspaceDialog
