import { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
    Box,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    useTheme,
    Typography
} from '@mui/material'
import DocumentStoreStatus from '@/views/docstore/DocumentStoreStatus'
import { IconDotsVertical } from '@tabler/icons-react'
import { SharedTableCell as StyledTableCell, SharedTableRow as StyledTableRow } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'

export const DocumentStoreTable = ({ data, isLoading, onRowClick, images, showActions, onActionMenuClick, actionButtonSx }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const customization = useSelector((state) => state.customization)

    const localStorageKeyOrder = 'doc_store_order'
    const localStorageKeyOrderBy = 'doc_store_orderBy'

    const [order, setOrder] = useState(localStorage.getItem(localStorageKeyOrder) || 'desc')
    const [orderBy, setOrderBy] = useState(localStorage.getItem(localStorageKeyOrderBy) || 'name')

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc'
        const newOrder = isAsc ? 'desc' : 'asc'
        setOrder(newOrder)
        setOrderBy(property)
        localStorage.setItem(localStorageKeyOrder, newOrder)
        localStorage.setItem(localStorageKeyOrderBy, property)
    }

    const sortedData = data
        ? [...data].sort((a, b) => {
              if (orderBy === 'name') {
                  return order === 'asc' ? (a.name || '').localeCompare(b.name || '') : (b.name || '').localeCompare(a.name || '')
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
                <Table sx={{ minWidth: 650 }} size='small' aria-label='document_store_table'>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>&nbsp;</StyledTableCell>
                            <StyledTableCell>
                                <TableSortLabel active={orderBy === 'name'} direction={order} onClick={() => handleRequestSort('name')}>
                                    {t('Name')}
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell>{t('Description')}</StyledTableCell>
                            <StyledTableCell>{t('Connected flows')}</StyledTableCell>
                            <StyledTableCell>{t('Total characters')}</StyledTableCell>
                            <StyledTableCell>{t('Total chunks')}</StyledTableCell>
                            <StyledTableCell>{t('Loader Types')}</StyledTableCell>
                            {showActions && (
                                <StyledTableCell align='right' sx={{ width: 44, pr: 1 }}>
                                    &nbsp;
                                </StyledTableCell>
                            )}
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
                                    <StyledTableCell>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                    {showActions && (
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                    )}
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
                                    <StyledTableCell>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                    {showActions && (
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                    )}
                                </StyledTableRow>
                            </>
                        ) : (
                            <>
                                {sortedData.map((row) => {
                                    return (
                                        <StyledTableRow
                                            onClick={() => onRowClick(row)}
                                            hover
                                            key={row.id}
                                            sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <StyledTableCell>
                                                <DocumentStoreStatus isTableView={true} status={row.status} />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 5,
                                                        WebkitBoxOrient: 'vertical',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {row.name}
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 5,
                                                        WebkitBoxOrient: 'vertical',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {row?.description}
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>{row.whereUsed?.length ?? 0}</StyledTableCell>
                                            <StyledTableCell>{row.totalChars}</StyledTableCell>
                                            <StyledTableCell>{row.totalChunks}</StyledTableCell>
                                            <StyledTableCell>
                                                {images && images[row.id] && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'start',
                                                            gap: 1
                                                        }}
                                                    >
                                                        {images[row.id]
                                                            .slice(0, images[row.id].length > 3 ? 3 : images[row.id].length)
                                                            .map((img) => (
                                                                <Box
                                                                    key={img}
                                                                    sx={{
                                                                        width: 30,
                                                                        height: 30,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: customization.isDarkMode
                                                                            ? theme.palette.common.white
                                                                            : theme.palette.alpha.border
                                                                    }}
                                                                >
                                                                    <img
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            padding: 5,
                                                                            objectFit: 'contain'
                                                                        }}
                                                                        alt=''
                                                                        src={img}
                                                                    />
                                                                </Box>
                                                            ))}
                                                        {images?.length > 3 && (
                                                            <Typography
                                                                sx={{
                                                                    alignItems: 'center',
                                                                    display: 'flex',
                                                                    fontSize: '.9rem',
                                                                    fontWeight: 200
                                                                }}
                                                            >
                                                                + {images.length - 3} {t('More')}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </StyledTableCell>
                                            {showActions && (
                                                <StyledTableCell align='right' sx={{ width: 44, mr: 1 }}>
                                                    <IconButton
                                                        size='small'
                                                        aria-label={t('Document store options')}
                                                        sx={actionButtonSx}
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            onActionMenuClick(event, row)
                                                        }}
                                                    >
                                                        <IconDotsVertical size={18} />
                                                    </IconButton>
                                                </StyledTableCell>
                                            )}
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

DocumentStoreTable.propTypes = {
    data: PropTypes.array,
    isLoading: PropTypes.bool,
    images: PropTypes.object,
    onRowClick: PropTypes.func,
    showActions: PropTypes.bool,
    onActionMenuClick: PropTypes.func,
    actionButtonSx: PropTypes.object
}

DocumentStoreTable.displayName = 'DocumentStoreTable'
