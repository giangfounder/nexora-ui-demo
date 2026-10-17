import { forwardRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './DateField.css'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import { useLanguage } from '@/store/context/LanguageContext'

const VI_WEEKDAY = {
    Sunday: 'CN',
    Monday: 'T2',
    Tuesday: 'T3',
    Wednesday: 'T4',
    Thursday: 'T5',
    Friday: 'T6',
    Saturday: 'T7',
    Sun: 'CN',
    Mon: 'T2',
    Tue: 'T3',
    Wed: 'T4',
    Thu: 'T5',
    Fri: 'T6',
    Sat: 'T7'
}

const MONTHS_VI = ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12']

const pad = (n) => String(n).padStart(2, '0')
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseValue = (v) => {
    if (!v) return null
    if (v instanceof Date) return isNaN(v) ? null : v
    const d = new Date(v)
    return isNaN(d) ? null : d
}

const DateField = ({
    value,
    onChange,
    placeholder = 'dd/mm/yyyy',
    size = 'small',
    fullWidth = true,
    minDate,
    maxDate,
    showTimeSelect = false,
    disabled = false,
    error = false,
    clearable = true,
    ...rest
}) => {
    const theme = useTheme()
    const { t, language, locale } = useLanguage()
    const isDark = theme.palette.mode === 'dark'
    const selected = useMemo(() => parseValue(value), [value])

    const handleChange = (d) => {
        if (!onChange) return
        if (!d) return onChange('')
        onChange(showTimeSelect ? d.toISOString() : toISODate(d))
    }

    // eslint-disable-next-line react/prop-types
    const TriggerInput = forwardRef(({ value: displayValue, onClick }, ref) => (
        <TextField
            inputRef={ref}
            size={size}
            fullWidth={fullWidth}
            value={displayValue || ''}
            onClick={disabled ? undefined : onClick}
            onChange={() => {}}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            InputProps={{
                readOnly: true,
                sx: { cursor: disabled ? 'default' : 'pointer', pr: 0.5 },
                startAdornment: (
                    <InputAdornment position='start' sx={{ ml: 0.5, mr: 0.75 }}>
                        <AppIcon name='Calendar' size={15} style={{ opacity: 0.55 }} />
                    </InputAdornment>
                ),
                endAdornment:
                    clearable && displayValue && !disabled ? (
                        <InputAdornment position='end'>
                            <IconButton
                                size='small'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleChange(null)
                                }}
                                aria-label={t('Xoá ngày')}
                                sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 1,
                                    color: 'text.disabled',
                                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.primary' }
                                }}
                            >
                                <AppIcon name='X' size={13} />
                            </IconButton>
                        </InputAdornment>
                    ) : null
            }}
        />
    ))
    TriggerInput.displayName = 'DateFieldTrigger'

    return (
        <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
            <DatePicker
                selected={selected}
                onChange={handleChange}
                minDate={minDate}
                maxDate={maxDate}
                dateFormat={showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
                showTimeSelect={showTimeSelect}
                timeIntervals={15}
                timeCaption={t('Giờ')}
                customInput={<TriggerInput />}
                popperClassName={`gtech-datepicker-popper${isDark ? ' gtech-datepicker-dark' : ''}`}
                calendarClassName='gtech-datepicker-calendar'
                showPopperArrow={false}
                popperPlacement='bottom-start'
                disabled={disabled}
                formatWeekDay={(name) => t(VI_WEEKDAY[name] || name.slice(0, 2))}
                renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                    <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
                        <IconButton
                            size='small'
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            aria-label={t('Tháng trước')}
                            sx={{
                                width: 26,
                                height: 26,
                                borderRadius: 1,
                                color: 'text.secondary',
                                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) }
                            }}
                        >
                            <AppIcon name='CaretLeft' size={15} />
                        </IconButton>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                            {language === 'vi'
                                ? `${MONTHS_VI[date.getMonth()]} ${date.getFullYear()}`
                                : date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                        </Typography>
                        <IconButton
                            size='small'
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            aria-label={t('Tháng sau')}
                            sx={{
                                width: 26,
                                height: 26,
                                borderRadius: 1,
                                color: 'text.secondary',
                                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) }
                            }}
                        >
                            <AppIcon name='CaretRight' size={15} />
                        </IconButton>
                    </Stack>
                )}
                {...rest}
            />
        </Box>
    )
}

DateField.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium']),
    fullWidth: PropTypes.bool,
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    showTimeSelect: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    clearable: PropTypes.bool
}

export default DateField
