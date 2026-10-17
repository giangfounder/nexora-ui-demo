import { useState } from 'react'
import PropTypes from 'prop-types'
import {
    Box,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    useTheme,
    Checkbox
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { IconLoader, IconCircleXFilled } from '@tabler/icons-react'
import { SharedTableCell as StyledTableCell, SharedTableRow as StyledTableRow } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'

const getIconFromStatus = (state, theme) => {
    switch (state) {
        case 'FINISHED':
            return CheckCircleIcon
        case 'ERROR':
        case 'TIMEOUT':
            return ErrorIcon
        case 'TERMINATED':
            // eslint-disable-next-line react/display-name
            return (props) => {
                const IconWrapper = (props) => <IconCircleXFilled {...props} color={theme.palette.error.main} />
                IconWrapper.displayName = 'TerminatedIcon'
                return <IconWrapper {...props} />
            }
        case 'STOPPED':
            return StopCircleIcon
        case 'INPROGRESS':
            // eslint-disable-next-line react/display-name
            return (props) => {
                const IconWrapper = (props) => (
                    // eslint-disable-next-line
                    <IconLoader {...props} color={theme.palette.warning.dark} className={`spin-animation ${props.className || ''}`} />
                )
                IconWrapper.displayName = 'InProgressIcon'
                return <IconWrapper {...props} />
            }
    }
}

const getIconColor = (state) => {
    switch (state) {
        case 'FINISHED':
            return 'success.dark'
        case 'ERROR':
        case 'TIMEOUT':
            return 'error.main'
        case 'TERMINATED':
        case 'STOPPED':
            return 'error.main'
        case 'INPROGRESS':
            return 'warning.main'
    }
}

export const ExecutionsListTable = ({ data, isLoading, onExecutionRowClick, onSelectionChange }) => {
    const theme = useTheme()
    const { t, locale } = useLanguage()

    const localStorageKeyOrder = 'executions_order'
    const localStorageKeyOrderBy = 'executions_orderBy'

    const [order, setOrder] = useState(localStorage.getItem(localStorageKeyOrder) || 'desc')
    const [orderBy, setOrderBy] = useState(localStorage.getItem(localStorageKeyOrderBy) || 'updatedDate')
    const [selected, setSelected] = useState([])

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc'
        const newOrder = isAsc ? 'desc' : 'asc'
        setOrder(newOrder)
        setOrderBy(property)
        localStorage.setItem(localStorageKeyOrder, newOrder)
        localStorage.setItem(localStorageKeyOrderBy, property)
    }

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = data.map((n) => n.id)
            setSelected(newSelected)
            onSelectionChange && onSelectionChange(newSelected)
        } else {
            setSelected([])
            onSelectionChange && onSelectionChange([])
        }
    }

    const handleClick = (event, id) => {
        event.stopPropagation()
        const selectedIndex = selected.indexOf(id)
        let newSelected = []

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id)
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1))
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1))
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
        }

        setSelected(newSelected)
        onSelectionChange && onSelectionChange(newSelected)
    }

    const isSelected = (id) => selected.indexOf(id) !== -1

    const sortedData = data
        ? [...data].sort((a, b) => {
              if (orderBy === 'name') {
                  return order === 'asc' ? (a.name || '').localeCompare(b.name || '') : (b.name || '').localeCompare(a.name || '')
              } else if (orderBy === 'updatedDate') {
                  return order === 'asc'
                      ? new Date(a.updatedDate) - new Date(b.updatedDate)
                      : new Date(b.updatedDate) - new Date(a.updatedDate)
              }
              return 0
          })
        : []

    return (
        <>
            <TableContainer
                sx={{ border: 1, borderColor: theme.palette.alpha.border, borderRadius: '10px', boxShadow: 'none' }}
                component={Paper}
            >
                <Table sx={{ minWidth: 650 }} size='small' aria-label='a dense table'>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell padding='checkbox'>
                                <Checkbox
                                    color='primary'
                                    indeterminate={selected.length > 0 && selected.length < data.length}
                                    checked={data.length > 0 && selected.length === data.length}
                                    onChange={handleSelectAllClick}
                                    inputProps={{
                                        'aria-label': 'select all executions'
                                    }}
                                />
                            </StyledTableCell>
                            <StyledTableCell>{t('Status')}</StyledTableCell>
                            <StyledTableCell>
                                <TableSortLabel
                                    active={orderBy === 'updatedDate'}
                                    direction={order}
                                    onClick={() => handleRequestSort('updatedDate')}
                                >
                                    {t('Last Updated')}
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell component='th' scope='row'>
                                <TableSortLabel active={orderBy === 'name'} direction={order} onClick={() => handleRequestSort('name')}>
                                    {t('Agentflow')}
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell>{t('Session')}</StyledTableCell>
                            <StyledTableCell>
                                <TableSortLabel
                                    active={orderBy === 'createdDate'}
                                    direction={order}
                                    onClick={() => handleRequestSort('createdDate')}
                                >
                                    {t('Created')}
                                </TableSortLabel>
                            </StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <>
                                <StyledTableRow>
                                    <StyledTableCell padding='checkbox'>
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
                                    <StyledTableCell>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow>
                                    <StyledTableCell padding='checkbox'>
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
                                    <StyledTableCell>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                </StyledTableRow>
                            </>
                        ) : (
                            <>
                                {sortedData.map((row, index) => {
                                    const isItemSelected = isSelected(row.id)
                                    const labelId = `enhanced-table-checkbox-${index}`

                                    return (
                                        <StyledTableRow
                                            hover
                                            key={index}
                                            sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <StyledTableCell padding='checkbox'>
                                                <Checkbox
                                                    color='primary'
                                                    checked={isItemSelected}
                                                    onClick={(event) => handleClick(event, row.id)}
                                                    inputProps={{
                                                        'aria-labelledby': labelId
                                                    }}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell onClick={() => onExecutionRowClick(row)}>
                                                <Box
                                                    component={getIconFromStatus(row.state, theme)}
                                                    className='labelIcon'
                                                    color={getIconColor(row.state)}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell onClick={() => onExecutionRowClick(row)}>
                                                {new Date(row.updatedDate).toLocaleString(locale, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </StyledTableCell>
                                            <StyledTableCell onClick={() => onExecutionRowClick(row)}>
                                                {row.agentflow?.name}
                                            </StyledTableCell>
                                            <StyledTableCell onClick={() => onExecutionRowClick(row)}>{row.sessionId}</StyledTableCell>
                                            <StyledTableCell onClick={() => onExecutionRowClick(row)}>
                                                {new Date(row.createdDate).toLocaleString(locale, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    )
                                })}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

ExecutionsListTable.propTypes = {
    data: PropTypes.array,
    isLoading: PropTypes.bool,
    onExecutionRowClick: PropTypes.func,
    onSelectionChange: PropTypes.func,
    className: PropTypes.string
}

ExecutionsListTable.displayName = 'ExecutionsListTable'
