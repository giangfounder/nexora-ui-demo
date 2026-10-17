import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// material-ui
import { Chip, Skeleton, Box, Stack, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import AddEditEvaluatorDialog from '@/views/evaluators/AddEditEvaluatorDialog'
import { StyledTableCell, StyledTableRow } from '@/ui-component/table/TableStyles'
import { PermissionIconButton, StyledPermissionButton } from '@/ui-component/button/RBACButtons'
import TablePagination, { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'
import { truncateString } from '@/utils/genericHelper'

// API
import evaluatorsApi from '@/api/evaluators'
import moment from 'moment/moment'

// Hooks
import useNotifier from '@/utils/useNotifier'
import useConfirm from '@/hooks/useConfirm'
import useApi from '@/hooks/useApi'
import { useError } from '@/store/context/ErrorContext'
import { useLanguage } from '@/store/context/LanguageContext'

// icons
import empty_evaluatorSVG from '@/assets/images/empty_evaluators.svg'
import { AppIcon } from '@/ui-component/icons/AppIcon'

// const
import { evaluators as evaluatorsOptions, numericOperators } from '../evaluators/evaluatorConstant'

// ==============================|| Evaluators ||============================== //

const Evaluators = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const { confirm } = useConfirm()
    useNotifier()
    const { error } = useError()
    const { t } = useLanguage()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [search, setSearch] = useState('')
    const [isLoading, setLoading] = useState(true)
    const [showEvaluatorDialog, setShowEvaluatorDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [evaluators, setEvaluators] = useState([])

    const getAllEvaluators = useApi(evaluatorsApi.getAllEvaluators)

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
        getAllEvaluators.request(params)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const newEvaluator = () => {
        const dialogProp = {
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add',
            data: {}
        }
        setDialogProps(dialogProp)
        setShowEvaluatorDialog(true)
    }

    const edit = (item) => {
        const dialogProp = {
            type: 'EDIT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Save',
            data: item
        }
        setDialogProps(dialogProp)
        setShowEvaluatorDialog(true)
    }

    const deleteEvaluator = async (item) => {
        const confirmPayload = {
            title: t('Delete'),
            description: t('Delete Evaluator {name}?', { name: item.name }),
            confirmButtonName: t('Delete'),
            cancelButtonName: t('Cancel')
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await evaluatorsApi.deleteEvaluator(item.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: t('Evaluator deleted'),
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
                    message: t('Failed to delete Evaluator: {error}', {
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
            }
        }
    }

    const onConfirm = () => {
        setShowEvaluatorDialog(false)
        refresh(currentPage, pageLimit)
    }

    function filterDatasets(data) {
        return data.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    useEffect(() => {
        refresh(currentPage, pageLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getAllEvaluators.data) {
            setEvaluators(getAllEvaluators.data.data)
            setTotal(getAllEvaluators.data.total)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAllEvaluators.data])

    useEffect(() => {
        setLoading(getAllEvaluators.loading)
    }, [getAllEvaluators.loading])

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                    <Stack flexDirection='column' sx={{ gap: 3 }}>
                        <ViewHeader
                            isBackButton={false}
                            isEditButton={false}
                            onSearchChange={onSearchChange}
                            search={true}
                            title={t('Evaluators')}
                            searchPlaceholder='Search Name'
                            description=''
                        >
                            <StyledPermissionButton
                                permissionId={'evaluators:create'}
                                sx={{ borderRadius: 2, height: '100%' }}
                                variant='contained'
                                onClick={newEvaluator}
                                startIcon={<AppIcon name='Plus' />}
                            >
                                {t('New Evaluator')}
                            </StyledPermissionButton>
                        </ViewHeader>
                        {!isLoading && evaluators.length <= 0 ? (
                            <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                <Box sx={{ p: 2, height: 'auto' }}>
                                    <img
                                        style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                        src={empty_evaluatorSVG}
                                        alt='empty_evaluatorSVG'
                                    />
                                </Box>
                                <div>{t('No Evaluators Yet')}</div>
                            </Stack>
                        ) : (
                            <>
                                <TableContainer
                                    sx={{ border: 1, borderColor: theme.palette.alpha.border, borderRadius: 2 }}
                                    component={Paper}
                                >
                                    <Table sx={{ minWidth: 650 }}>
                                        <TableHead
                                            sx={{
                                                backgroundColor: theme.palette.surface.sunken,
                                                height: 56
                                            }}
                                        >
                                            <TableRow>
                                                <TableCell>{t('Type')}</TableCell>
                                                <TableCell>{t('Name')}</TableCell>
                                                <TableCell>{t('Details')}</TableCell>
                                                <TableCell>{t('Last Updated')}</TableCell>
                                                <TableCell> </TableCell>
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
                                                    </StyledTableRow>
                                                </>
                                            ) : (
                                                <>
                                                    {evaluators.filter(filterDatasets).map((ds, index) => (
                                                        <>
                                                            <StyledTableRow
                                                                hover
                                                                key={index}
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    '&:last-child td, &:last-child th': { border: 0 }
                                                                }}
                                                            >
                                                                <TableCell onClick={() => edit(ds)}>
                                                                    {ds?.type === 'numeric' && (
                                                                        <Stack flexDirection='row' sx={{ alignItems: 'center' }}>
                                                                            <Chip
                                                                                icon={<AppIcon name='NumberSquareOne' />}
                                                                                label={t('Numeric')}
                                                                                variant='outlined'
                                                                            />
                                                                        </Stack>
                                                                    )}
                                                                    {ds?.type === 'text' && (
                                                                        <Stack flexDirection='row' sx={{ alignItems: 'center' }}>
                                                                            <Chip
                                                                                icon={<AppIcon name='TextAa' />}
                                                                                label={t('Text Based')}
                                                                                variant='outlined'
                                                                            />
                                                                        </Stack>
                                                                    )}
                                                                    {ds?.type === 'json' && (
                                                                        <Stack flexDirection='row' sx={{ alignItems: 'center' }}>
                                                                            <Chip
                                                                                icon={<AppIcon name='BracketsCurly' />}
                                                                                label={t('JSON Based')}
                                                                                variant='outlined'
                                                                            />
                                                                        </Stack>
                                                                    )}
                                                                    {ds?.type === 'llm' && (
                                                                        <Stack flexDirection='row' sx={{ alignItems: 'center' }}>
                                                                            <Chip
                                                                                icon={<AppIcon name='CubeFocus' />}
                                                                                label={t('LLM Based')}
                                                                                variant='outlined'
                                                                            />
                                                                        </Stack>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell onClick={() => edit(ds)} component='th' scope='row'>
                                                                    {ds.name}
                                                                </TableCell>
                                                                <TableCell style={{ width: '40%' }} onClick={() => edit(ds)}>
                                                                    {ds?.type === 'numeric' && (
                                                                        <Stack
                                                                            flexDirection='row'
                                                                            gap={1}
                                                                            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                                                                        >
                                                                            <Chip
                                                                                variant='outlined'
                                                                                size='small'
                                                                                color='default'
                                                                                sx={{
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': {
                                                                                        display: 'block',
                                                                                        whiteSpace: 'normal'
                                                                                    },
                                                                                    p: 0.5
                                                                                }}
                                                                                label={
                                                                                    <span>
                                                                                        <b>{t('Measure')}</b>:{' '}
                                                                                        {t(
                                                                                            [
                                                                                                ...evaluatorsOptions,
                                                                                                ...numericOperators
                                                                                            ].find((item) => item.name === ds?.measure)
                                                                                                ?.label || ''
                                                                                        )}
                                                                                    </span>
                                                                                }
                                                                            />
                                                                            <Chip
                                                                                variant='outlined'
                                                                                size='small'
                                                                                color='default'
                                                                                sx={{
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': {
                                                                                        display: 'block',
                                                                                        whiteSpace: 'normal'
                                                                                    },
                                                                                    p: 0.5
                                                                                }}
                                                                                label={
                                                                                    <span>
                                                                                        <b>{t('Operator')}</b>:{' '}
                                                                                        {t(
                                                                                            [
                                                                                                ...evaluatorsOptions,
                                                                                                ...numericOperators
                                                                                            ].find((item) => item.name === ds?.operator)
                                                                                                ?.label || ''
                                                                                        )}
                                                                                    </span>
                                                                                }
                                                                            />
                                                                            <Chip
                                                                                variant='outlined'
                                                                                size='small'
                                                                                color='default'
                                                                                sx={{
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': {
                                                                                        display: 'block',
                                                                                        whiteSpace: 'normal'
                                                                                    },
                                                                                    p: 0.5
                                                                                }}
                                                                                label={
                                                                                    <span>
                                                                                        <b>{t('Value')}</b>: {ds?.value}
                                                                                    </span>
                                                                                }
                                                                            />
                                                                        </Stack>
                                                                    )}
                                                                    {ds?.type === 'text' && (
                                                                        <Stack
                                                                            flexDirection='row'
                                                                            gap={1}
                                                                            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                                                                        >
                                                                            <Chip
                                                                                variant='outlined'
                                                                                size='small'
                                                                                color='default'
                                                                                sx={{
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': {
                                                                                        display: 'block',
                                                                                        whiteSpace: 'normal'
                                                                                    },
                                                                                    p: 0.5
                                                                                }}
                                                                                label={
                                                                                    <span>
                                                                                        <b>{t('Operator')}</b>:{' '}
                                                                                        {t(
                                                                                            [
                                                                                                ...evaluatorsOptions,
                                                                                                ...numericOperators
                                                                                            ].find((item) => item.name === ds?.operator)
                                                                                                ?.label || ''
                                                                                        )}
                                                                                    </span>
                                                                                }
                                                                            />
                                                                            <Chip
                                                                                variant='outlined'
                                                                                size='small'
                                                                                color='default'
                                                                                sx={{
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': {
                                                                                        display: 'block',
                                                                                        whiteSpace: 'normal'
                                                                                    },
                                                                                    p: 0.5
                                                                                }}
                                                                                label={
                                                                                    <span>
                                                                                        <b>{t('Value')}</b>: {ds?.value}
                                                                                    </span>
                                                                                }
                                                                            />
                                                                        </Stack>
                                                                    )}
                                                                    {ds?.type === 'json' && (
                                                                        <Stack
                                                                            flexDirection='row'
                                                                            gap={1}
                                                                            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                                                                        >
                                                                            <Chip
                                                                                variant='outlined'
                                                                                size='small'
                                                                                color='default'
                                                                                sx={{
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': {
                                                                                        display: 'block',
                                                                                        whiteSpace: 'normal'
                                                                                    },
                                                                                    p: 0.5
                                                                                }}
                                                                                label={
                                                                                    <span>
                                                                                        <b>{t('Operator')}</b>:{' '}
                                                                                        {t(
                                                                                            [...evaluatorsOptions].find(
                                                                                                (item) => item.name === ds?.operator
                                                                                            )?.label || ''
                                                                                        )}
                                                                                    </span>
                                                                                }
                                                                            />
                                                                        </Stack>
                                                                    )}
                                                                    {ds?.type === 'llm' && (
                                                                        <Stack
                                                                            flexDirection='row'
                                                                            gap={1}
                                                                            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                                                                        >
                                                                            <Chip
                                                                                variant='outlined'
                                                                                size='small'
                                                                                color='default'
                                                                                sx={{
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': {
                                                                                        display: 'block',
                                                                                        whiteSpace: 'normal'
                                                                                    },
                                                                                    p: 0.5
                                                                                }}
                                                                                label={
                                                                                    <span>
                                                                                        <b>Prompt</b>: {truncateString(ds?.prompt, 100)}
                                                                                    </span>
                                                                                }
                                                                            />
                                                                            <Chip
                                                                                variant='outlined'
                                                                                size='small'
                                                                                color='default'
                                                                                sx={{
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': {
                                                                                        display: 'block',
                                                                                        whiteSpace: 'normal'
                                                                                    },
                                                                                    p: 0.5
                                                                                }}
                                                                                label={
                                                                                    <span>
                                                                                        <b>{t('Output Schema Elements')}</b>:{' '}
                                                                                        {ds?.outputSchema.length > 0
                                                                                            ? ds?.outputSchema
                                                                                                  .map((item) => item.property)
                                                                                                  .join(', ')
                                                                                            : t('None')}
                                                                                    </span>
                                                                                }
                                                                            />
                                                                        </Stack>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell onClick={() => edit(ds)}>
                                                                    {moment(ds.updatedDate).format('MMMM Do YYYY, hh:mm A')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <PermissionIconButton
                                                                        permissionId={'evaluators:delete'}
                                                                        title={t('Delete')}
                                                                        color='error'
                                                                        onClick={() => deleteEvaluator(ds)}
                                                                    >
                                                                        <AppIcon name='Trash' />
                                                                    </PermissionIconButton>
                                                                </TableCell>
                                                            </StyledTableRow>
                                                        </>
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
            {showEvaluatorDialog && (
                <AddEditEvaluatorDialog
                    show={showEvaluatorDialog}
                    dialogProps={dialogProps}
                    onCancel={() => setShowEvaluatorDialog(false)}
                    onConfirm={onConfirm}
                ></AddEditEvaluatorDialog>
            )}
            <ConfirmDialog />
        </>
    )
}

export default Evaluators
