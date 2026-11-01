import * as XLSX from 'xlsx'
import { getLanguage, getLocale, translate } from '@/i18n'

// ==============================|| TABLE EXPORT ||============================== //
// Shared exporter: turns named tables into PDF / HTML / XLSX / ODS / CSV / TSV / JSON / XML downloads.
// A table is { name, columns: [{ key, label }], rows: [{ [key]: value }] }.
// Format labels/hints/groups are Vietnamese source strings: translate at render (t) or call time (translate).
// The printable HTML/PDF output always uses a light, print-friendly palette regardless of the app theme.

export const EXPORT_FORMATS = [
    { id: 'pdf', label: 'PDF', ext: 'pdf', hint: 'Bản in đẹp, lưu thành PDF', group: 'Xem & chia sẻ' },
    { id: 'html', label: 'HTML', ext: 'html', hint: 'Mở bằng trình duyệt, gửi email', group: 'Xem & chia sẻ' },
    { id: 'xlsx', label: 'Excel', ext: 'xlsx', hint: 'Mỗi bảng một sheet', group: 'Bảng tính' },
    { id: 'ods', label: 'OpenDocument', ext: 'ods', hint: 'LibreOffice, OpenOffice', group: 'Bảng tính' },
    { id: 'csv', label: 'CSV', ext: 'csv', hint: 'Mở bằng Excel, Google Sheets', group: 'Bảng tính' },
    { id: 'tsv', label: 'TSV', ext: 'tsv', hint: 'Phân tách bằng tab', group: 'Bảng tính' },
    { id: 'json', label: 'JSON', ext: 'json', hint: 'Cho lập trình / API', group: 'Dữ liệu' },
    { id: 'xml', label: 'XML', ext: 'xml', hint: 'Cho hệ thống tích hợp', group: 'Dữ liệu' }
]

// ---------- serialisers ----------
const delimited = (tables, meta, sep) => {
    const cell = (v) => {
        const s = v === null || v === undefined ? '' : String(v)
        return /["\n\r]/.test(s) || s.includes(sep) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [`# ${meta.report}`, ...meta.info.map(([k, v]) => `# ${k}: ${v}`), '']
    tables.forEach((tb) => {
        lines.push(`# ${tb.name}`)
        lines.push(tb.columns.map((c) => cell(c.label)).join(sep))
        tb.rows.forEach((r) => lines.push(tb.columns.map((c) => cell(r[c.key])).join(sep)))
        lines.push('')
    })
    // BOM so Excel opens Vietnamese text as UTF-8
    return '﻿' + lines.join('\r\n')
}

const toJson = (tables, meta) =>
    JSON.stringify(
        {
            report: meta.report,
            ...Object.fromEntries(meta.info),
            tables: tables.map((tb) => ({
                name: tb.name,
                columns: tb.columns.map((c) => ({ key: c.key, label: c.label })),
                rows: tb.rows.map((r) => Object.fromEntries(tb.columns.map((c) => [c.key, r[c.key] ?? null])))
            }))
        },
        null,
        2
    )

const xmlEscape = (v) =>
    String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

const toXml = (tables, meta, reportKey) => {
    const out = ['<?xml version="1.0" encoding="UTF-8"?>', `<report key="${xmlEscape(reportKey)}" name="${xmlEscape(meta.report)}">`]
    out.push('  <info>')
    meta.info.forEach(([k, v]) => out.push(`    <item label="${xmlEscape(k)}">${xmlEscape(v)}</item>`))
    out.push('  </info>')
    tables.forEach((tb) => {
        out.push(`  <table name="${xmlEscape(tb.name)}">`)
        tb.rows.forEach((r) => {
            out.push('    <row>')
            tb.columns.forEach((c) => out.push(`      <${c.key} label="${xmlEscape(c.label)}">${xmlEscape(r[c.key])}</${c.key}>`))
            out.push('    </row>')
        })
        out.push('  </table>')
    })
    out.push('</report>')
    return out.join('\n')
}

// Self-contained, print-ready HTML (also the source for the PDF export).
const toHtml = (tables, meta) => {
    const esc = (v) => xmlEscape(v)
    const isNum = (v) => typeof v === 'number'
    const body = tables
        .map(
            (tb) => `
    <section>
      <h2>${esc(tb.name)}</h2>
      <table>
        <thead><tr>${tb.columns
            .map((c) => `<th${tb.rows.some((r) => isNum(r[c.key])) ? ' class="n"' : ''}>${esc(c.label)}</th>`)
            .join('')}</tr></thead>
        <tbody>${tb.rows
            .map((r) => `<tr>${tb.columns.map((c) => `<td${isNum(r[c.key]) ? ' class="n"' : ''}>${esc(r[c.key])}</td>`).join('')}</tr>`)
            .join('')}</tbody>
      </table>
    </section>`
        )
        .join('')
    return `<!doctype html>
<html lang="${getLanguage()}">
<head>
<meta charset="utf-8" />
<title>${esc(meta.report)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif; color: #0B1220; margin: 0; padding: 32px; font-size: 12px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #2563EB; padding-bottom: 12px; margin-bottom: 20px; }
  .brand { font-weight: 800; letter-spacing: .08em; color: #2563EB; font-size: 13px; }
  h1 { font-size: 20px; margin: 4px 0 0; }
  dl { display: grid; grid-template-columns: auto auto; gap: 2px 12px; margin: 0; color: #475569; font-size: 11px; }
  dt { font-weight: 600; } dd { margin: 0; }
  section { margin-bottom: 22px; break-inside: avoid; }
  h2 { font-size: 14px; margin: 0 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; background: #EFF6FF; color: #1E40AF; font-weight: 700; padding: 6px 8px; border-bottom: 1px solid #BFDBFE; }
  td { padding: 5px 8px; border-bottom: 1px solid #E2E8F0; }
  th.n { text-align: right; }
  td.n { text-align: right; font-variant-numeric: tabular-nums; }
  tr:nth-child(even) td { background: #F8FAFC; }
  footer { margin-top: 24px; color: #94A3B8; font-size: 10px; }
</style>
</head>
<body>
  <header>
    <div><div class="brand">NEXORA</div><h1>${esc(meta.report)}</h1></div>
    <dl>${meta.info.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
  </header>${body}
  <footer>NEXORA — Intelligence for Tomorrow</footer>
</body>
</html>`
}

// PDF: render the print-ready HTML in a hidden frame and open the browser's print dialog ("Save as PDF").
const printAsPdf = (html) => {
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
    document.body.appendChild(frame)
    const doc = frame.contentDocument
    doc.open()
    doc.write(html)
    doc.close()
    const run = () => {
        frame.contentWindow.focus()
        frame.contentWindow.print()
        setTimeout(() => frame.remove(), 1500)
    }
    if (doc.readyState === 'complete') setTimeout(run, 50)
    else frame.onload = run
}

const toWorkbook = (tables, meta) => {
    const wb = XLSX.utils.book_new()
    const info = XLSX.utils.aoa_to_sheet([[meta.report], [], ...meta.info])
    info['!cols'] = [{ wch: 22 }, { wch: 40 }]
    const infoName = translate('Thông tin').slice(0, 31)
    XLSX.utils.book_append_sheet(wb, info, infoName)
    const used = new Set([infoName])
    tables.forEach((tb) => {
        const aoa = [tb.columns.map((c) => c.label), ...tb.rows.map((r) => tb.columns.map((c) => r[c.key] ?? ''))]
        const ws = XLSX.utils.aoa_to_sheet(aoa)
        ws['!cols'] = tb.columns.map((c, i) => ({
            wch: Math.min(40, Math.max(c.label.length, ...aoa.slice(1).map((row) => String(row[i] ?? '').length)) + 2)
        }))
        // Sheet names: max 31 chars, unique
        let name = tb.name.slice(0, 31)
        for (let n = 2; used.has(name); n++) name = `${tb.name.slice(0, 28)} ${n}`
        used.add(name)
        XLSX.utils.book_append_sheet(wb, ws, name)
    })
    return wb
}

const saveBlob = (content, type, filename) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const stamp = (d) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(
        2,
        '0'
    )}${String(d.getMinutes()).padStart(2, '0')}`

/**
 * Download tables in the chosen format.
 * @param {object} opts { title, slug, key, info: [[label, value]], tables, format }
 * @returns {string|null} saved file name (null for PDF, which opens the print dialog)
 */
export const exportTables = ({ title, slug, key = slug, info = [], tables, format }) => {
    const now = new Date()
    const meta = { report: title, info: [...info, [translate('Xuất lúc'), now.toLocaleString(getLocale())]] }
    const fmt = EXPORT_FORMATS.find((f) => f.id === format) || EXPORT_FORMATS[0]
    const filename = `nexora-${slug}-${stamp(now)}.${fmt.ext}`

    if (fmt.id === 'xlsx') {
        XLSX.writeFile(toWorkbook(tables, meta), filename, { compression: true })
    } else if (fmt.id === 'ods') {
        XLSX.writeFile(toWorkbook(tables, meta), filename, { bookType: 'ods' })
    } else if (fmt.id === 'html') {
        saveBlob(toHtml(tables, meta), 'text/html;charset=utf-8', filename)
    } else if (fmt.id === 'pdf') {
        printAsPdf(toHtml(tables, meta))
        return null
    } else if (fmt.id === 'csv') {
        saveBlob(delimited(tables, meta, ','), 'text/csv;charset=utf-8', filename)
    } else if (fmt.id === 'tsv') {
        saveBlob(delimited(tables, meta, '\t'), 'text/tab-separated-values;charset=utf-8', filename)
    } else if (fmt.id === 'json') {
        saveBlob(toJson(tables, meta), 'application/json;charset=utf-8', filename)
    } else {
        saveBlob(toXml(tables, meta, key), 'application/xml;charset=utf-8', filename)
    }
    return filename
}

// exposed for previews / tests
export const __toHtml = toHtml
