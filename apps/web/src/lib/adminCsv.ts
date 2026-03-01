export function downloadCsv(filename: string, headers: string[], rows: Array<Record<string, any>>) {
    const csvRows = [
        headers.join(','),
        ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ];
    const blob = new Blob([`\uFEFF${csvRows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

export function parseCsv(content: string): Array<Record<string, string>> {
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (!lines.length) return [];
    const headers = splitCsvLine(lines[0]).map((header, index) => {
        const cleanHeader = header.trim();
        return index === 0 ? cleanHeader.replace(/^\uFEFF/, '') : cleanHeader;
    });
    return lines.slice(1).map((line) => {
        const values = splitCsvLine(line);
        return headers.reduce<Record<string, string>>((acc, header, index) => {
            acc[header] = (values[index] || '').trim();
            return acc;
        }, {});
    });
}

function splitCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];
        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    values.push(current);
    return values;
}

function escapeCsvValue(value: any): string {
    if (value === undefined || value === null) return '';
    const stringValue = String(value);
    if (/[,"\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}
