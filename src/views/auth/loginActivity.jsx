import PropTypes from 'prop-types'
import { forwardRef, useEffect, useState } from 'react'

// material-ui
import {
    Box,
    Checkbox,
    FormControl,
    IconButton,
    InputLabel,
    ListItemButton,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    useTheme
} from '@mui/material'

// project imports
import ErrorBoundary from '@/ErrorBoundary'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import MainCard from '@/ui-component/cards/MainCard'
import { StyledTableCell, StyledTableRow } from '@/ui-component/table/TableStyles'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// API
import auditApi from '@/api/audit'

// Hooks
import useApi from '@/hooks/useApi'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconChevronLeft, IconChevronRight, IconCircleX, IconLogin, IconLogout } from '@tabler/icons-react'

// store
import { useError } from '@/store/context/ErrorContext'
import { useLanguage } from '@/store/context/LanguageContext'

const activityTypes = [
    'Login Success',
    'Logout Success',
    'Unknown User',
    'Incorrect Credential',
    'User Disabled',
    'No Assigned Workspace',
    'Unknown Activity'
]
const MenuProps = {
    PaperProps: {
        style: {
            width: 160
        }
    }
}
const SelectStyles = {
    '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: 2
    }
}

// ==============================|| Login Activity ||============================== //

const DatePickerCustomInput = forwardRef(function DatePickerCustomInput({ value, onClick }, ref) {
    const theme = useTheme()
    return (
        <ListItemButton
            style={{ borderRadius: 15, border: `1px solid ${theme.palette.alpha?.borderStrong || theme.palette.divider}` }}
            onClick={onClick}
            ref={ref}
        >
            {value}
        </ListItemButton>
    )
})

DatePickerCustomInput.propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func
}
const LoginActivity = () => {
    const theme = useTheme()
    const { t, locale } = useLanguage()
    useNotifier()
    const { error, setError } = useError()

    const [isLoading, setLoading] = useState(true)

    const getLoginActivityApi = useApi(auditApi.fetchLoginActivity)
    const [activity, setActivity] = useState([])
    const [typeFilter, setTypeFilter] = useState([])
    const [totalRecords, setTotalRecords] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [start, setStart] = useState(1)
    const [end, setEnd] = useState(50)
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)))
    const [endDate, setEndDate] = useState(new Date())

    const onStartDateSelected = (date) => {
        setStartDate(date)
        refreshData(currentPage, date, endDate, typeFilter)
    }

    const onEndDateSelected = (date) => {
        setEndDate(date)
        refreshData(currentPage, startDate, date, typeFilter)
    }

    const refreshData = (_page, _start, _end, _filter) => {
        const activityCodes = []
        if (_filter.length > 0) {
            _filter.forEach((type) => {
                activityCodes.push(getActivityCode(type))
            })
        }
        getLoginActivityApi.request({
            pageNo: _page,
            startDate: _start,
            endDate: _end,
            activityCodes: activityCodes
        })
    }

    const changePage = (newPage) => {
        setLoading(true)
        setCurrentPage(newPage)
        refreshData(newPage, startDate, endDate, typeFilter)
    }

    const handleTypeFilterChange = (event) => {
        const {
            target: { value }
        } = event
        let newVar = typeof value === 'string' ? value.split(',') : value
        setTypeFilter(newVar)
        refreshData(currentPage, startDate, endDate, newVar)
    }

    function getActivityDescription(activityCode) {
        switch (activityCode) {
            case 0:
                return 'Login Success'
            case 1:
                return 'Logout Success'
            case -1:
                return 'Unknown User'
            case -2:
                return 'Incorrect Credential'
            case -3:
                return 'User Disabled'
            case -4:
                return 'No Assigned Workspace'
            default:
                return 'Unknown Activity'
        }
    }

    function getActivityCode(activityDescription) {
        switch (activityDescription) {
            case 'Login Success':
                return 0
            case 'Logout Success':
                return 1
            case 'Unknown User':
                return -1
            case 'Incorrect Credential':
                return -2
            case 'User Disabled':
                return -3
            case 'No Assigned Workspace':
                return -4
            default:
                return -99
        }
    }

    useEffect(() => {
        getLoginActivityApi.request({
            pageNo: 1
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLoading(getLoginActivityApi.loading)
    }, [getLoginActivityApi.loading])

    useEffect(() => {
        if (getLoginActivityApi.error) {
            setError(getLoginActivityApi.error)
        }
    }, [getLoginActivityApi.error, setError])

    useEffect(() => {
        if (getLoginActivityApi.data) {
            const data = getLoginActivityApi.data
            setTotalRecords(data.count)
            setLoading(false)
            setCurrentPage(data.currentPage)
            setStart(data.currentPage * data.pageSize - (data.pageSize - 1))
            setEnd(data.currentPage * data.pageSize > data.count ? data.count : data.currentPage * data.pageSize)
            setActivity(data.data)
        }
    }, [getLoginActivityApi.data])

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                    <Stack flexDirection='column' sx={{ gap: 3 }}>
                        <ViewHeader search={false} title={t('Login Activity')}></ViewHeader>
                        <Stack flexDirection='row'>
                            <Box sx={{ p: 2, height: 'auto', width: '100%' }}>
                                <div
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        overflow: 'hidden',
                                        marginBottom: 10
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <div style={{ marginRight: 10 }}>
                                            <b style={{ marginRight: 10 }}>{t('From:')} </b>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => onStartDateSelected(date)}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                customInput={<DatePickerCustomInput />}
                                            />
                                        </div>
                                        <div style={{ marginRight: 10 }}>
                                            <b style={{ marginRight: 10 }}>{t('To:')} </b>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => onEndDateSelected(date)}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate}
                                                maxDate={new Date()}
                                                customInput={<DatePickerCustomInput />}
                                            />
                                        </div>
                                        <div>
                                            <FormControl
                                                sx={{
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'end',
                                                    minWidth: 300,
                                                    maxWidth: 300
                                                }}
                                            >
                                                <InputLabel size='small' id='type-label'>
                                                    {t('Filter By')}
                                                </InputLabel>
                                                <Select
                                                    size='small'
                                                    labelId='type-label'
                                                    multiple
                                                    value={typeFilter}
                                                    onChange={handleTypeFilterChange}
                                                    id='type-checkbox'
                                                    input={<OutlinedInput label={t('Filter By')} />}
                                                    renderValue={(selected) => selected.map((s) => t(s)).join(', ')}
                                                    MenuProps={MenuProps}
                                                    sx={SelectStyles}
                                                >
                                                    {activityTypes.map((name) => (
                                                        <MenuItem
                                                            key={name}
                                                            value={name}
                                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}
                                                        >
                                                            <Checkbox checked={typeFilter.indexOf(name) > -1} sx={{ p: 0 }} />
                                                            <ListItemText primary={t(name)} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <div
                                            style={{
                                                marginRight: 10,
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <IconButton
                                                size='small'
                                                onClick={() => changePage(currentPage - 1)}
                                                style={{ marginRight: 10 }}
                                                variant='outlined'
                                                disabled={currentPage === 1}
                                            >
                                                <IconChevronLeft
                                                    color={currentPage === 1 ? theme.palette.text.disabled : theme.palette.text.primary}
                                                />
                                            </IconButton>
                                            {t('Showing {from}-{to} of {total} Records', {
                                                from: Math.min(start, totalRecords),
                                                to: end,
                                                total: totalRecords
                                            })}
                                            <IconButton
                                                size='small'
                                                onClick={() => changePage(currentPage + 1)}
                                                style={{ marginLeft: 10 }}
                                                variant='outlined'
                                                disabled={end >= totalRecords}
                                            >
                                                <IconChevronRight
                                                    color={end >= totalRecords ? theme.palette.text.disabled : theme.palette.text.primary}
                                                />
                                            </IconButton>
                                        </div>
                                    </div>
                                </div>
                                <TableContainer
                                    style={{ display: 'flex', flexDirection: 'row' }}
                                    sx={{ border: 1, borderColor: theme.palette.alpha?.border || theme.palette.divider, borderRadius: 2 }}
                                    component={Paper}
                                >
                                    <Table sx={{ minWidth: 650 }} aria-label={t('Login Activity')}>
                                        <TableHead
                                            sx={{
                                                backgroundColor: theme.palette.surface?.sunken || theme.palette.background.default,
                                                height: 40
                                            }}
                                        >
                                            <TableRow>
                                                <StyledTableCell>{t('Activity')}</StyledTableCell>
                                                <StyledTableCell>{t('User')}</StyledTableCell>
                                                <StyledTableCell>{t('Date')}</StyledTableCell>
                                                <StyledTableCell>{t('Method')}</StyledTableCell>
                                                <StyledTableCell>{t('Message')}</StyledTableCell>
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
                                                    {activity.map((item, index) => (
                                                        <StyledTableRow
                                                            hover
                                                            key={index}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <StyledTableCell component='th' scope='row'>
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'row',
                                                                        alignItems: 'left'
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: 25,
                                                                            height: 25,
                                                                            borderRadius: '50%',
                                                                            marginRight: 10
                                                                        }}
                                                                    >
                                                                        {item.activityCode === 0 && (
                                                                            <IconLogin
                                                                                style={{
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    borderRadius: '50%',
                                                                                    objectFit: 'contain',
                                                                                    color: theme.palette.success.dark
                                                                                }}
                                                                            />
                                                                        )}
                                                                        {item.activityCode === 1 && (
                                                                            <IconLogout
                                                                                style={{
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    borderRadius: '50%',
                                                                                    objectFit: 'contain',
                                                                                    color: theme.palette.secondary.dark
                                                                                }}
                                                                            />
                                                                        )}
                                                                        {item.activityCode < 0 && (
                                                                            <IconCircleX
                                                                                style={{
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    borderRadius: '50%',
                                                                                    objectFit: 'contain',
                                                                                    color: theme.palette.error.dark
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div>{t(getActivityDescription(item.activityCode))}</div>
                                                                </div>
                                                            </StyledTableCell>
                                                            <StyledTableCell>{item.username}</StyledTableCell>
                                                            <StyledTableCell>
                                                                {new Date(item.attemptedDateTime).toLocaleString(locale, {
                                                                    dateStyle: 'long',
                                                                    timeStyle: 'short'
                                                                })}
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                {item.loginMode ? item.loginMode : t('Email/Password')}
                                                            </StyledTableCell>
                                                            <StyledTableCell>{item.message}</StyledTableCell>
                                                        </StyledTableRow>
                                                    ))}
                                                </>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Stack>
                    </Stack>
                )}
            </MainCard>
        </>
    )
}

export default LoginActivity
