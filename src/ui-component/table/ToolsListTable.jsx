import PropTypes from 'prop-types'
import { Button, Paper, Skeleton, Table, TableBody, TableContainer, TableHead, TableRow, Typography, useTheme } from '@mui/material'
import { SharedTableCell as StyledTableCell, SharedTableRow as StyledTableRow } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'

export const ToolsTable = ({ data, isLoading, onSelect }) => {
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
                            <StyledTableCell component='th' scope='row' key='0'>
                                {t('Name')}
                            </StyledTableCell>
                            <StyledTableCell key='1'>{t('Description')}</StyledTableCell>
                            <StyledTableCell component='th' scope='row' key='3'>
                                &nbsp;
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
                                </StyledTableRow>
                            </>
                        ) : (
                            <>
                                {data?.map((row, index) => (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }} key='0'>
                                            <div
                                                style={{
                                                    width: 35,
                                                    height: 35,
                                                    display: 'flex',
                                                    flexShrink: 0,
                                                    marginRight: 10,
                                                    borderRadius: '50%',
                                                    backgroundImage: `url(${row.iconSrc})`,
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center center'
                                                }}
                                            ></div>
                                            <Typography
                                                sx={{
                                                    display: '-webkit-box',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <Button onClick={() => onSelect(row)} sx={{ textAlign: 'left' }}>
                                                    {row.templateName || row.name}
                                                </Button>
                                            </Typography>
                                        </StyledTableCell>
                                        <StyledTableCell key='1'>
                                            <Typography sx={{ overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                                                {row.description || ''}
                                            </Typography>
                                        </StyledTableCell>
                                        <StyledTableCell key='3'></StyledTableCell>
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

ToolsTable.propTypes = {
    data: PropTypes.array,
    isLoading: PropTypes.bool,
    onSelect: PropTypes.func
}
