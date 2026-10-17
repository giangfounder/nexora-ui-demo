import PropTypes from 'prop-types'
import {
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import { SharedTableCell as StyledTableCell, SharedTableRow as StyledTableRow } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'

export const FilesTable = ({ data, isLoading, filterFunction, handleDelete }) => {
    const theme = useTheme()
    const { t } = useLanguage()

    return (
        <>
            <TableContainer
                sx={{ border: 1, borderColor: theme.palette.alpha.border, borderRadius: '10px', boxShadow: 'none' }}
                component={Paper}
            >
                <Table sx={{ minWidth: 650 }} size='small' aria-label='a dense table'>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell component='th' scope='row' style={{ width: '25%' }} key='0'>
                                {t('Name')}
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '40%' }} key='1'>
                                {t('Path')}
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '25%' }} key='2'>
                                {t('Size')}
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '10%' }} key='3'>
                                {t('Actions')}
                            </StyledTableCell>
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
                                </StyledTableRow>
                            </>
                        ) : (
                            <>
                                {data?.filter(filterFunction).map((row, index) => (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell key='0'>
                                            <Tooltip title={row.name}>
                                                <Typography
                                                    sx={{
                                                        display: '-webkit-box',
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {row.name.split('/').pop()}
                                                </Typography>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell key='1'>
                                            <Tooltip title={row.path}>
                                                <Typography
                                                    sx={{
                                                        display: '-webkit-box',
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {row.path}
                                                </Typography>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell key='2'>
                                            <Typography
                                                sx={{
                                                    alignItems: 'center',
                                                    display: 'flex',
                                                    fontSize: '.9rem',
                                                    fontWeight: 200
                                                }}
                                            >
                                                {`${row.size.toFixed(2)} MB`}
                                            </Typography>
                                        </StyledTableCell>
                                        <StyledTableCell key='3'>
                                            <IconButton
                                                aria-label={t('Delete')}
                                                color='error'
                                                onClick={() => handleDelete(row)}
                                                size='small'
                                            >
                                                <AppIcon name='Trash' />
                                            </IconButton>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

FilesTable.propTypes = {
    data: PropTypes.array,
    images: PropTypes.object,
    isLoading: PropTypes.bool,
    filterFunction: PropTypes.func,
    handleDelete: PropTypes.func
}
