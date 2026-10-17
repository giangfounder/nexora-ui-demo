import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction, REMOVE_DIRTY } from '@/store/actions'
import { exportData, stringify } from '@/utils/exportImport'
import useNotifier from '@/utils/useNotifier'

// material-ui
import {
    Box,
    Button,
    ButtonBase,
    Checkbox,
    ClickAwayListener,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grow,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Popper,
    Stack,
    Typography
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

// third-party

// project imports
import { PermissionListItemButton } from '@/ui-component/button/RBACButtons'
import { useLanguage } from '@/store/context/LanguageContext'
import AboutDialog from '@/ui-component/dialog/AboutDialog'

// assets
import ExportingGIF from '@/assets/images/Exporting.gif'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'
import './index.css'

// API
import exportImportApi from '@/api/exportimport'

// Hooks
import useApi from '@/hooks/useApi'
import { getErrorMessage } from '@/utils/errorHandler'

const dataToExport = [
    'Agentflows',
    'Agentflows V2',
    'Assistants Custom',
    'Assistants OpenAI',
    'Assistants Azure',
    'Chatflows',
    'Chat Messages',
    'Chat Feedbacks',
    'Custom Templates',
    'Document Stores',
    'Executions',
    'Tools',
    'Variables'
]

const ExportDialog = ({ show, onCancel, onExport }) => {
    const { t } = useLanguage()
    const portalElement = document.getElementById('portal')

    const [selectedData, setSelectedData] = useState(dataToExport)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        if (show) setIsExporting(false)

        return () => {
            setIsExporting(false)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show])

    const component = show ? (
        <Dialog
            onClose={!isExporting ? onCancel : undefined}
            open={show}
            fullWidth
            maxWidth='sm'
            aria-labelledby='export-dialog-title'
            aria-describedby='export-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='export-dialog-title'>
                {!isExporting ? t('Select Data to Export') : t('Exporting..')}
            </DialogTitle>
            <DialogContent>
                {!isExporting && (
                    <Stack
                        direction='row'
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1
                        }}
                    >
                        {dataToExport.map((data, index) => (
                            <FormControlLabel
                                key={index}
                                size='small'
                                control={
                                    <Checkbox
                                        color='success'
                                        checked={selectedData.includes(data)}
                                        onChange={(event) => {
                                            setSelectedData(
                                                event.target.checked
                                                    ? [...selectedData, data]
                                                    : selectedData.filter((item) => item !== data)
                                            )
                                        }}
                                    />
                                }
                                label={t(data)}
                            />
                        ))}
                    </Stack>
                )}
                {isExporting && (
                    <Box sx={{ height: 'auto', display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <img
                                style={{
                                    objectFit: 'cover',
                                    height: 'auto',
                                    width: 'auto'
                                }}
                                src={ExportingGIF}
                                alt='ExportingGIF'
                            />
                            <span>{t('Exporting data might takes a while')}</span>
                        </div>
                    </Box>
                )}
            </DialogContent>
            {!isExporting && (
                <DialogActions>
                    <Button onClick={onCancel}>{t('Cancel')}</Button>
                    <Button
                        disabled={selectedData.length === 0}
                        variant='contained'
                        onClick={() => {
                            setIsExporting(true)
                            onExport(selectedData)
                        }}
                    >
                        {t('Export')}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

ExportDialog.propTypes = {
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onExport: PropTypes.func
}

const ImportDialog = ({ show }) => {
    const { t } = useLanguage()
    const portalElement = document.getElementById('portal')

    const component = show ? (
        <Dialog open={show} fullWidth maxWidth='sm' aria-labelledby='import-dialog-title' aria-describedby='import-dialog-description'>
            <DialogTitle sx={{ fontSize: '1rem' }} id='import-dialog-title'>
                {t('Importing...')}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ height: 'auto', display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <img
                            style={{
                                objectFit: 'cover',
                                height: 'auto',
                                width: 'auto'
                            }}
                            src={ExportingGIF}
                            alt='ImportingGIF'
                        />
                        <span>{t('Importing data might takes a while')}</span>
                    </div>
                </Box>
            </DialogContent>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

ImportDialog.propTypes = {
    show: PropTypes.bool
}

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = ({ handleLogout }) => {
    const theme = useTheme()
    const { t } = useLanguage()

    const [open, setOpen] = useState(false)
    const [aboutDialogOpen, setAboutDialogOpen] = useState(false)

    const [exportDialogOpen, setExportDialogOpen] = useState(false)
    const [importDialogOpen, setImportDialogOpen] = useState(false)

    const anchorRef = useRef(null)
    const inputRef = useRef()

    const navigate = useNavigate()
    const currentUser = useSelector((state) => state.auth.user)
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

    const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || t('Người dùng')

    const importAllApi = useApi(exportImportApi.importData)
    const exportAllApi = useApi(exportImportApi.exportData)
    const prevOpen = useRef(open)

    // ==============================|| Snackbar ||============================== //

    useNotifier()
    const dispatch = useDispatch()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return
        }
        setOpen(false)
    }

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    const errorFailed = (message) => {
        enqueueSnackbar({
            message: message,
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

    const fileChange = (e) => {
        if (!e.target.files) return

        const file = e.target.files[0]
        setImportDialogOpen(true)

        const reader = new FileReader()
        reader.onload = (evt) => {
            if (!evt?.target?.result) {
                return
            }
            const body = JSON.parse(evt.target.result)
            importAllApi.request(body)
        }
        reader.readAsText(file)
    }

    const importAllSuccess = () => {
        setImportDialogOpen(false)
        dispatch({ type: REMOVE_DIRTY })
        enqueueSnackbar({
            message: t('Import All successful'),
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
    }

    const importAll = () => {
        inputRef.current.click()
    }

    const onExport = (data) => {
        const body = {}
        if (data.includes('Agentflows')) body.agentflow = true
        if (data.includes('Agentflows V2')) body.agentflowv2 = true
        if (data.includes('Assistants Custom')) body.assistantCustom = true
        if (data.includes('Assistants OpenAI')) body.assistantOpenAI = true
        if (data.includes('Assistants Azure')) body.assistantAzure = true
        if (data.includes('Chatflows')) body.chatflow = true
        if (data.includes('Chat Messages')) body.chat_message = true
        if (data.includes('Chat Feedbacks')) body.chat_feedback = true
        if (data.includes('Custom Templates')) body.custom_template = true
        if (data.includes('Document Stores')) body.document_store = true
        if (data.includes('Executions')) body.execution = true
        if (data.includes('Tools')) body.tool = true
        if (data.includes('Variables')) body.variable = true

        exportAllApi.request(body)
    }

    useEffect(() => {
        if (importAllApi.data) {
            importAllSuccess()
            navigate(0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [importAllApi.data])

    useEffect(() => {
        if (importAllApi.error) {
            setImportDialogOpen(false)
            let errMsg = t('Invalid Imported File')
            let error = importAllApi.error
            if (error?.response?.data) {
                errMsg = typeof error.response.data === 'object' ? error.response.data.message : error.response.data
            }
            errorFailed(t('Failed to import: {error}', { error: errMsg }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [importAllApi.error])

    useEffect(() => {
        if (exportAllApi.data) {
            setExportDialogOpen(false)
            try {
                const dataStr = stringify(exportData(exportAllApi.data))
                //const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
                const blob = new Blob([dataStr], { type: 'application/json' })
                const dataUri = URL.createObjectURL(blob)

                const linkElement = document.createElement('a')
                linkElement.setAttribute('href', dataUri)
                linkElement.setAttribute('download', exportAllApi.data.FileDefaultName)
                linkElement.click()
            } catch (error) {
                errorFailed(t('Failed to export all: {error}', { error: getErrorMessage(error) }))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportAllApi.data])

    useEffect(() => {
        if (exportAllApi.error) {
            setExportDialogOpen(false)
            let errMsg = t('Internal Server Error')
            let error = exportAllApi.error
            if (error?.response?.data) {
                errMsg = typeof error.response.data === 'object' ? error.response.data.message : error.response.data
            }
            errorFailed(t('Failed to export: {error}', { error: errMsg }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportAllApi.error])

    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus()
        }
        prevOpen.current = open
    }, [open])

    return (
        <>
            <ButtonBase
                ref={anchorRef}
                onClick={handleToggle}
                aria-label={t('Tài khoản')}
                aria-haspopup='true'
                aria-expanded={open}
                sx={{
                    alignSelf: 'center',
                    flexShrink: 0,
                    borderRadius: '11px',
                    p: '3px',
                    transition: 'box-shadow 160ms ease-out',
                    boxShadow: open ? `0 0 0 2px ${theme.palette.primary.main}` : `0 0 0 1px ${alpha(theme.palette.text.primary, 0.1)}`,
                    '&:hover': { boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, open ? 1 : 0.45)}` },
                    '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                }}
            >
                <PersonAvatar name={displayName} size={30} />
            </ButtonBase>
            <Popper
                placement='bottom-end'
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, 10] } }] }}
                sx={{ zIndex: 1300 }}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps} style={{ transformOrigin: 'top right' }} timeout={{ enter: 180, exit: 120 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: 296,
                                borderRadius: '14px',
                                border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                                boxShadow: theme.customShadows?.md,
                                overflow: 'hidden'
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <Box>
                                    {/* who is signed in */}
                                    <Stack direction='row' spacing={1.5} alignItems='center' sx={{ px: 2, pt: 2, pb: 1.75 }}>
                                        <PersonAvatar name={displayName} size={42} />
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant='body2' sx={{ fontWeight: 700, color: 'grey.900' }} noWrap>
                                                {displayName}
                                            </Typography>
                                            {currentUser?.email && (
                                                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                                                    {currentUser.email}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>

                                    <Divider />

                                    <List
                                        component='nav'
                                        dense
                                        sx={{
                                            px: 1,
                                            py: 0.75,
                                            '& .MuiListItemButton-root': {
                                                borderRadius: '10px',
                                                py: 0.875,
                                                px: 1.25,
                                                transition: 'background-color 120ms ease-out'
                                            },
                                            '& .MuiListItemIcon-root': { minWidth: 34, color: 'text.secondary' }
                                        }}
                                    >
                                        {isAuthenticated && !currentUser?.isSSO && (
                                            <ListItemButton
                                                onClick={() => {
                                                    setOpen(false)
                                                    navigate('/account')
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <AppIcon name='UserCircleGear' size={19} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={t('Cài đặt tài khoản')}
                                                    secondary={t('Hồ sơ, mật khẩu')}
                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                    secondaryTypographyProps={{ variant: 'caption' }}
                                                />
                                            </ListItemButton>
                                        )}
                                        <PermissionListItemButton permissionId='workspace:export' onClick={() => setExportDialogOpen(true)}>
                                            <ListItemIcon>
                                                <AppIcon name='Export' size={19} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={t('Sao lưu dữ liệu')}
                                                secondary={t('Xuất cấu hình ra file .json')}
                                                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </PermissionListItemButton>
                                        <PermissionListItemButton permissionId='workspace:import' onClick={() => importAll()}>
                                            <ListItemIcon>
                                                <AppIcon name='FileArrowUp' size={19} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={t('Khôi phục dữ liệu')}
                                                secondary={t('Nhập từ file sao lưu')}
                                                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </PermissionListItemButton>
                                        <input ref={inputRef} type='file' hidden onChange={fileChange} accept='.json' />
                                    </List>

                                    <Divider />

                                    <List dense sx={{ px: 1, py: 0.75 }}>
                                        <ListItemButton
                                            onClick={() => {
                                                setOpen(false)
                                                handleLogout?.()
                                            }}
                                            sx={{
                                                borderRadius: '10px',
                                                py: 0.875,
                                                px: 1.25,
                                                color: theme.palette.error.main,
                                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                                                <AppIcon name='SignOut' size={19} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={t('Đăng xuất')}
                                                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                                sx={{ '& .MuiListItemText-primary': { color: 'error.main' } }}
                                            />
                                        </ListItemButton>
                                    </List>

                                    {/* quiet footer */}
                                    <ButtonBase
                                        onClick={() => {
                                            setOpen(false)
                                            setAboutDialogOpen(true)
                                        }}
                                        sx={{
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            px: 2,
                                            py: 1,
                                            bgcolor: alpha(theme.palette.text.primary, 0.025),
                                            borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
                                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                                        }}
                                    >
                                        <Typography
                                            variant='caption'
                                            sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}
                                        >
                                            NEXORA
                                        </Typography>
                                        <Stack direction='row' spacing={0.5} alignItems='center' sx={{ color: 'text.secondary' }}>
                                            <AppIcon name='Info' size={14} />
                                            <Typography variant='caption' sx={{ color: 'inherit' }}>
                                                {t('Phiên bản')}
                                            </Typography>
                                        </Stack>
                                    </ButtonBase>
                                </Box>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
            <AboutDialog show={aboutDialogOpen} onCancel={() => setAboutDialogOpen(false)} />
            <ExportDialog show={exportDialogOpen} onCancel={() => setExportDialogOpen(false)} onExport={(data) => onExport(data)} />
            <ImportDialog show={importDialogOpen} />
        </>
    )
}

ProfileSection.propTypes = {
    handleLogout: PropTypes.func
}

export default ProfileSection
