import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import moment from 'moment/moment'
import * as PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// material-ui
import {
    Box,
    Button,
    Chip,
    Collapse,
    IconButton,
    Paper,
    Popover,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import ErrorBoundary from '@/ErrorBoundary'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { StyledPermissionButton } from '@/ui-component/button/RBACButtons'
import MainCard from '@/ui-component/cards/MainCard'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import TablePagination, { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'
import { Available } from '@/ui-component/rbac/available'
import APIKeyDialog from './APIKeyDialog'

// API
import apiKeyApi from '@/api/apikey'
import { useError } from '@/store/context/ErrorContext'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import APIEmptySVG from '@/assets/images/api_empty.svg'
import { IconChevronsDown, IconChevronsUp, IconCopy, IconEdit, IconEye, IconEyeOff, IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import { SharedTableCell as StyledTableCell, SharedTableRow as StyledTableRow } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'

// ==============================|| APIKey ||============================== //

function APIKeyRow(props) {
    const [open, setOpen] = useState(false)
    const theme = useTheme()

    const permissions = props.apiKey.permissions || []

    return (
        <>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <StyledTableCell scope='row' style={{ width: '15%' }}>
                    {props.apiKey.keyName}
                </StyledTableCell>
                <StyledTableCell style={{ width: '25%' }}>
                    {props.showApiKeys.includes(props.apiKey.apiKey)
                        ? props.apiKey.apiKey
                        : `${props.apiKey.apiKey.substring(0, 2)}${'•'.repeat(18)}${props.apiKey.apiKey.substring(
                              props.apiKey.apiKey.length - 5
                          )}`}
                    <IconButton title={t('Copy')} color='success' onClick={props.onCopyClick}>
                        <IconCopy />
                    </IconButton>
                    <IconButton title={t('Show')} color='inherit' onClick={props.onShowAPIClick}>
                        {props.showApiKeys.includes(props.apiKey.apiKey) ? <IconEyeOff /> : <IconEye />}
                    </IconButton>
                    <Popover
                        open={props.open}
                        anchorEl={props.anchorEl}
                        onClose={props.onClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left'
                        }}
                    >
                        <Typography variant='h6' sx={{ pl: 1, pr: 1, color: 'white', background: props.theme.palette.success.dark }}>
                            {t('Copied!')}
                        </Typography>
                    </Popover>
                </StyledTableCell>
                <StyledTableCell sx={{ width: '25%' }}>
                    <Stack sx={{ flexDirection: 'row' }}>
                        <Typography
                            variant='subtitle2'
                            color='textPrimary'
                            sx={{
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: '2',
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {permissions.map((d, key) => (
                                <React.Fragment key={key}>
                                    {d}
                                    {', '}
                                </React.Fragment>
                            ))}
                        </Typography>
                    </Stack>
                </StyledTableCell>
                <StyledTableCell>
                    {props.apiKey.chatFlows.length}{' '}
                    {props.apiKey.chatFlows.length > 0 && (
                        <IconButton aria-label='expand row' size='small' color='inherit' onClick={() => setOpen(!open)}>
                            {props.apiKey.chatFlows.length > 0 && open ? <IconChevronsUp /> : <IconChevronsDown />}
                        </IconButton>
                    )}
                </StyledTableCell>
                <StyledTableCell>{moment(props.apiKey.createdAt).format('MMMM Do, YYYY')}</StyledTableCell>
                <Available permission={'apikeys:update,apikeys:create'}>
                    <StyledTableCell>
                        <IconButton title={t('Edit')} color='primary' onClick={props.onEditClick}>
                            <IconEdit />
                        </IconButton>
                    </StyledTableCell>
                </Available>
                <Available permission={'apikeys:delete'}>
                    <StyledTableCell>
                        <IconButton title={t('Delete')} color='error' onClick={props.onDeleteClick}>
                            <IconTrash />
                        </IconButton>
                    </StyledTableCell>
                </Available>
            </TableRow>
            {open && (
                <TableRow sx={{ '& td': { border: 0 } }}>
                    <StyledTableCell sx={{ p: 2 }} colSpan={7}>
                        <Collapse in={open} timeout='auto' unmountOnExit>
                            <Box sx={{ borderRadius: 2, border: 1, borderColor: theme.palette.alpha.border, overflow: 'hidden' }}>
                                <Table aria-label='chatflow table'>
                                    <TableHead sx={{ height: 48 }}>
                                        <TableRow>
                                            <StyledTableCell sx={{ width: '30%' }}>{t('Chatflow Name')}</StyledTableCell>
                                            <StyledTableCell sx={{ width: '20%' }}>{t('Modified On')}</StyledTableCell>
                                            <StyledTableCell sx={{ width: '50%' }}>{t('Category')}</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {props.apiKey.chatFlows.map((flow, index) => (
                                            <TableRow key={index}>
                                                <StyledTableCell>{flow.flowName}</StyledTableCell>
                                                <StyledTableCell>{moment(flow.updatedDate).format('MMMM Do, YYYY')}</StyledTableCell>
                                                <StyledTableCell>
                                                    &nbsp;
                                                    {flow.category &&
                                                        flow.category
                                                            .split(';')
                                                            .map((tag, index) => (
                                                                <Chip key={index} label={tag} style={{ marginRight: 5, marginBottom: 5 }} />
                                                            ))}
                                                </StyledTableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </StyledTableCell>
                </TableRow>
            )}
        </>
    )
}

APIKeyRow.propTypes = {
    apiKey: PropTypes.any,
    showApiKeys: PropTypes.arrayOf(PropTypes.any),
    onCopyClick: PropTypes.func,
    onShowAPIClick: PropTypes.func,
    open: PropTypes.bool,
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    theme: PropTypes.any,
    onEditClick: PropTypes.func,
    onDeleteClick: PropTypes.func
}
const APIKey = () => {
    const { t } = useLanguage()
    const theme = useTheme()

    const dispatch = useDispatch()
    useNotifier()
    const { error, setError } = useError()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [isLoading, setLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [apiKeys, setAPIKeys] = useState([])
    const [anchorEl, setAnchorEl] = useState(null)
    const [showApiKeys, setShowApiKeys] = useState([])
    const openPopOver = Boolean(anchorEl)

    const [search, setSearch] = useState('')

    /* Table Pagination */
    const [currentPage, setCurrentPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(DEFAULT_ITEMS_PER_PAGE)
    const [total, setTotal] = useState(0)

    const onChange = (page, pageLimit) => {
        setCurrentPage(page)
        setPageLimit(pageLimit)
        refresh(page, pageLimit)
    }

    const refresh = (page, limit) => {
        const params = {
            page: page || currentPage,
            limit: limit || pageLimit
        }
        getAllAPIKeysApi.request(params)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }
    function filterKeys(data) {
        return data.keyName.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    const { confirm } = useConfirm()

    const getAllAPIKeysApi = useApi(apiKeyApi.getAllAPIKeys)

    const onShowApiKeyClick = (apikey) => {
        const index = showApiKeys.indexOf(apikey)
        if (index > -1) {
            //showApiKeys.splice(index, 1)
            const newShowApiKeys = showApiKeys.filter(function (item) {
                return item !== apikey
            })
            setShowApiKeys(newShowApiKeys)
        } else {
            setShowApiKeys((prevkeys) => [...prevkeys, apikey])
        }
    }

    const handleClosePopOver = () => {
        setAnchorEl(null)
    }

    const addNew = () => {
        const dialogProp = {
            title: t('Add New API Key'),
            type: 'ADD',
            cancelButtonName: t('Cancel'),
            confirmButtonName: t('Add'),
            customBtnId: 'btn_confirmAddingApiKey'
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const edit = (key) => {
        const dialogProp = {
            title: t('Edit API Key'),
            type: 'EDIT',
            cancelButtonName: t('Cancel'),
            confirmButtonName: t('Save'),
            customBtnId: 'btn_confirmEditingApiKey',
            key
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const deleteKey = async (key) => {
        const confirmPayload = {
            title: t('Delete'),
            description:
                key.chatFlows.length === 0
                    ? t('Delete key [{name}]?', { name: key.keyName })
                    : t('Delete key [{name}]?\n There are {count} chatflows using this key.', {
                          name: key.keyName,
                          count: key.chatFlows.length
                      }),
            confirmButtonName: t('Delete'),
            cancelButtonName: t('Cancel'),
            customBtnId: 'btn_initiateDeleteApiKey'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await apiKeyApi.deleteAPI(key.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: t('API key deleted'),
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
                    onConfirm()
                }
            } catch (error) {
                enqueueSnackbar({
                    message: t('Failed to delete API key: {message}', {
                        message: typeof error.response.data === 'object' ? error.response.data.message : error.response.data
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
    }

    const onConfirm = () => {
        setShowDialog(false)
        refresh(currentPage, pageLimit)
    }

    useEffect(() => {
        refresh(currentPage, pageLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLoading(getAllAPIKeysApi.loading)
    }, [getAllAPIKeysApi.loading])

    useEffect(() => {
        if (getAllAPIKeysApi.data) {
            setAPIKeys(getAllAPIKeysApi.data?.data)
            setTotal(getAllAPIKeysApi.data?.total)
        }
    }, [getAllAPIKeysApi.data])

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                    <Stack flexDirection='column' sx={{ gap: 3 }}>
                        <ViewHeader
                            onSearchChange={onSearchChange}
                            search={true}
                            searchPlaceholder={t('Search API Keys')}
                            title={t('API Keys')}
                            description='Nexora API & SDK authentication keys'
                        >
                            <StyledPermissionButton
                                permissionId={'apikeys:create'}
                                variant='contained'
                                sx={{ height: '100%' }}
                                onClick={addNew}
                                startIcon={<IconPlus size={18} stroke={1.75} />}
                                id='btn_createApiKey'
                            >
                                {t('Create Key')}
                            </StyledPermissionButton>
                        </ViewHeader>
                        {!isLoading && apiKeys?.length <= 0 ? (
                            <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                <Box sx={{ p: 2, height: 'auto' }}>
                                    <img
                                        style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                        src={APIEmptySVG}
                                        alt='APIEmptySVG'
                                    />
                                </Box>
                                <div>{t('No API Keys Yet')}</div>
                            </Stack>
                        ) : (
                            <>
                                <TableContainer
                                    sx={{ border: 1, borderColor: theme.palette.alpha.border, borderRadius: '10px', boxShadow: 'none' }}
                                    component={Paper}
                                >
                                    <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>{t('Key Name')}</StyledTableCell>
                                                <StyledTableCell>{t('API Key')}</StyledTableCell>
                                                <StyledTableCell>{t('Permissions')}</StyledTableCell>
                                                <StyledTableCell>{t('Usage')}</StyledTableCell>
                                                <StyledTableCell>{t('Updated')}</StyledTableCell>
                                                <Available permission={'apikeys:update,apikeys:create'}>
                                                    <StyledTableCell> </StyledTableCell>
                                                </Available>
                                                <Available permission={'apikeys:delete'}>
                                                    <StyledTableCell> </StyledTableCell>
                                                </Available>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {isLoading ? (
                                                <>
                                                    <StyledTableRow>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <Available permission={'apikeys:update,apikeys:create'}>
                                                            <StyledTableCell> </StyledTableCell>
                                                        </Available>
                                                        <Available permission={'apikeys:delete'}>
                                                            <StyledTableCell> </StyledTableCell>
                                                        </Available>
                                                    </StyledTableRow>
                                                    <StyledTableRow>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Skeleton variant='text' />
                                                        </StyledTableCell>
                                                        <Available permission={'apikeys:update,apikeys:create'}>
                                                            <StyledTableCell> </StyledTableCell>
                                                        </Available>
                                                        <Available permission={'apikeys:delete'}>
                                                            <StyledTableCell> </StyledTableCell>
                                                        </Available>
                                                    </StyledTableRow>
                                                </>
                                            ) : (
                                                <>
                                                    {apiKeys?.filter(filterKeys).map((key, index) => (
                                                        <APIKeyRow
                                                            key={index}
                                                            apiKey={key}
                                                            showApiKeys={showApiKeys}
                                                            onCopyClick={(event) => {
                                                                navigator.clipboard.writeText(key.apiKey)
                                                                setAnchorEl(event.currentTarget)
                                                                setTimeout(() => {
                                                                    handleClosePopOver()
                                                                }, 1500)
                                                            }}
                                                            onShowAPIClick={() => onShowApiKeyClick(key.apiKey)}
                                                            open={openPopOver}
                                                            anchorEl={anchorEl}
                                                            onClose={handleClosePopOver}
                                                            theme={theme}
                                                            onEditClick={() => edit(key)}
                                                            onDeleteClick={() => deleteKey(key)}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {/* Pagination and Page Size Controls */}
                                <TablePagination currentPage={currentPage} limit={pageLimit} total={total} onChange={onChange} />
                            </>
                        )}
                    </Stack>
                )}
            </MainCard>
            <APIKeyDialog
                show={showDialog}
                dialogProps={dialogProps}
                onCancel={() => setShowDialog(false)}
                onConfirm={onConfirm}
                setError={setError}
            ></APIKeyDialog>
            <ConfirmDialog />
        </>
    )
}

export default APIKey
