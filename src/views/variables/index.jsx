import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import moment from 'moment'

// material-ui
import {
    Button,
    Box,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    useTheme
} from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import AddEditVariableDialog from './AddEditVariableDialog'
import HowToUseVariablesDialog from './HowToUseVariablesDialog'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import { StyledPermissionButton } from '@/ui-component/button/RBACButtons'
import { Available } from '@/ui-component/rbac/available'
import { refreshVariablesCache } from '@/ui-component/input/suggestionOption'
import TablePagination, { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'

// API
import variablesApi from '@/api/variables'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconTrash, IconEdit, IconX, IconPlus, IconVariable } from '@tabler/icons-react'
import VariablesEmptySVG from '@/assets/images/variables_empty.svg'

// const
import { useError } from '@/store/context/ErrorContext'
import { SharedTableCell as StyledTableCell, SharedTableRow as StyledTableRow } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'

// ==============================|| Credentials ||============================== //

const Variables = () => {
    const { t } = useLanguage()
    const theme = useTheme()
    const dispatch = useDispatch()
    useNotifier()
    const { error, setError } = useError()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [isLoading, setLoading] = useState(true)
    const [showVariableDialog, setShowVariableDialog] = useState(false)
    const [variableDialogProps, setVariableDialogProps] = useState({})
    const [variables, setVariables] = useState([])
    const [showHowToDialog, setShowHowToDialog] = useState(false)

    const { confirm } = useConfirm()

    const getAllVariables = useApi(variablesApi.getAllVariables)
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
        getAllVariables.request(params)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }
    function filterVariables(data) {
        return data.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    const addNew = () => {
        const dialogProp = {
            type: 'ADD',
            cancelButtonName: t('Cancel'),
            confirmButtonName: t('Add'),
            customBtnId: 'btn_confirmAddingVariable',
            data: {}
        }
        setVariableDialogProps(dialogProp)
        setShowVariableDialog(true)
    }

    const edit = (variable) => {
        const dialogProp = {
            type: 'EDIT',
            cancelButtonName: t('Cancel'),
            confirmButtonName: t('Save'),
            data: variable
        }
        setVariableDialogProps(dialogProp)
        setShowVariableDialog(true)
    }

    const deleteVariable = async (variable) => {
        const confirmPayload = {
            title: t('Delete'),
            description: t('Delete variable {name}?', { name: variable.name }),
            confirmButtonName: t('Delete'),
            cancelButtonName: t('Cancel')
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await variablesApi.deleteVariable(variable.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: t('Variable deleted'),
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
                    message: t('Failed to delete Variable: {message}', {
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
            }
        }
    }

    const onConfirm = () => {
        setShowVariableDialog(false)
        refresh(currentPage, pageLimit)
        refreshVariablesCache()
    }

    useEffect(() => {
        refresh(currentPage, pageLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLoading(getAllVariables.loading)
    }, [getAllVariables.loading])

    useEffect(() => {
        if (getAllVariables.data) {
            setVariables(getAllVariables.data.data)
            setTotal(getAllVariables.data.total)
        }
    }, [getAllVariables.data])

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
                            searchPlaceholder={t('Search Variables')}
                            title={t('Variables')}
                            description='Create and manage global variables'
                        >
                            <Button variant='outlined' sx={{ height: '100%' }} onClick={() => setShowHowToDialog(true)}>
                                {t('How To Use')}
                            </Button>
                            <StyledPermissionButton
                                permissionId={'variables:create'}
                                variant='contained'
                                sx={{ height: '100%' }}
                                onClick={addNew}
                                startIcon={<IconPlus size={18} stroke={1.75} />}
                                id='btn_createVariable'
                            >
                                {t('Add Variable')}
                            </StyledPermissionButton>
                        </ViewHeader>
                        {!isLoading && variables.length === 0 ? (
                            <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                <Box sx={{ p: 2, height: 'auto' }}>
                                    <img
                                        style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                        src={VariablesEmptySVG}
                                        alt='VariablesEmptySVG'
                                    />
                                </Box>
                                <div>{t('No Variables Yet')}</div>
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
                                                <StyledTableCell>{t('Name')}</StyledTableCell>
                                                <StyledTableCell>{t('Value')}</StyledTableCell>
                                                <StyledTableCell>{t('Type')}</StyledTableCell>
                                                <StyledTableCell>{t('Last Updated')}</StyledTableCell>
                                                <StyledTableCell>{t('Created')}</StyledTableCell>
                                                <Available permissionId={'variables:update'}>
                                                    <StyledTableCell> </StyledTableCell>
                                                </Available>
                                                <Available permissionId={'variables:delete'}>
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
                                                        <Available permission={'variables:create,variables:update'}>
                                                            <StyledTableCell>
                                                                <Skeleton variant='text' />
                                                            </StyledTableCell>
                                                        </Available>
                                                        <Available permission={'variables:delete'}>
                                                            <StyledTableCell>
                                                                <Skeleton variant='text' />
                                                            </StyledTableCell>
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
                                                        <Available permission={'variables:create,variables:update'}>
                                                            <StyledTableCell>
                                                                <Skeleton variant='text' />
                                                            </StyledTableCell>
                                                        </Available>
                                                        <Available permission={'variables:delete'}>
                                                            <StyledTableCell>
                                                                <Skeleton variant='text' />
                                                            </StyledTableCell>
                                                        </Available>
                                                    </StyledTableRow>
                                                </>
                                            ) : (
                                                <>
                                                    {variables.filter(filterVariables).map((variable, index) => (
                                                        <StyledTableRow
                                                            key={index}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <StyledTableCell component='th' scope='row'>
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center'
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: 25,
                                                                            height: 25,
                                                                            marginRight: 10,
                                                                            borderRadius: '50%'
                                                                        }}
                                                                    >
                                                                        <IconVariable
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                borderRadius: '50%',
                                                                                objectFit: 'contain'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    {variable.name}
                                                                </div>
                                                            </StyledTableCell>
                                                            <StyledTableCell>{variable.value}</StyledTableCell>
                                                            <StyledTableCell>
                                                                <Chip
                                                                    color={variable.type === 'static' ? 'info' : 'secondary'}
                                                                    size='small'
                                                                    label={variable.type}
                                                                />
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                {moment(variable.updatedDate).format('MMMM Do, YYYY HH:mm:ss')}
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                {moment(variable.createdDate).format('MMMM Do, YYYY HH:mm:ss')}
                                                            </StyledTableCell>
                                                            <Available permission={'variables:create,variables:update'}>
                                                                <StyledTableCell>
                                                                    <IconButton
                                                                        title={t('Edit')}
                                                                        color='primary'
                                                                        onClick={() => edit(variable)}
                                                                    >
                                                                        <IconEdit />
                                                                    </IconButton>
                                                                </StyledTableCell>
                                                            </Available>
                                                            <Available permission={'variables:delete'}>
                                                                <StyledTableCell>
                                                                    <IconButton
                                                                        title={t('Delete')}
                                                                        color='error'
                                                                        onClick={() => deleteVariable(variable)}
                                                                    >
                                                                        <IconTrash />
                                                                    </IconButton>
                                                                </StyledTableCell>
                                                            </Available>
                                                        </StyledTableRow>
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
            <AddEditVariableDialog
                show={showVariableDialog}
                dialogProps={variableDialogProps}
                onCancel={() => setShowVariableDialog(false)}
                onConfirm={onConfirm}
                setError={setError}
            ></AddEditVariableDialog>
            <HowToUseVariablesDialog show={showHowToDialog} onCancel={() => setShowHowToDialog(false)}></HowToUseVariablesDialog>
            <ConfirmDialog />
        </>
    )
}

export default Variables
