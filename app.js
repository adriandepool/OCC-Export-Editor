console.log('App.js cargado v4');
// Estado de la aplicación
const AppState = {
    data: [],
    meta: null,
    filename: 'export.csv',
    searchQuery: '',
    currentPage: 1,
    rowsPerPage: 50,
    hiddenColumns: new Set(),
    columnWidths: {},
    originalHeader: null // Store original metadata line
};

// Elementos del DOM
const elements = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('csv-input'),
    uploadSection: document.getElementById('upload-section'),
    editorSection: document.getElementById('editor-section'),
    tableContainer: document.getElementById('table-container'),
    btnExport: document.getElementById('btn-export'),
    stats: {
        rows: document.getElementById('stat-rows'),
        cols: document.getElementById('stat-cols'),
        size: document.getElementById('stat-size')
    },
    actionAddRow: document.getElementById('action-add-row'),
    searchInput: document.getElementById('search-input'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    paginationInfo: document.getElementById('pagination-info'),
    btnToggleCols: document.getElementById('btn-toggle-cols'),
    colMenu: document.getElementById('col-menu'),
    colList: document.getElementById('col-list')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});

function initEventListeners() {
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());

    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.querySelector('.relative').classList.add('bg-slate-700/50');
    });
    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.querySelector('.relative').classList.remove('bg-slate-700/50');
    });
    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.querySelector('.relative').classList.remove('bg-slate-700/50');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    elements.btnExport.addEventListener('click', exportCSV);
    elements.actionAddRow.addEventListener('click', addNewRow);

    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            AppState.searchQuery = e.target.value.toLowerCase();
            AppState.currentPage = 1;
            renderTable();
        });
    }

    if (elements.btnPrev) {
        elements.btnPrev.addEventListener('click', () => {
            if (AppState.currentPage > 1) {
                AppState.currentPage--;
                renderTable();
            }
        });
    }

    if (elements.btnNext) {
        elements.btnNext.addEventListener('click', () => {
            const filteredData = getFilteredData();
            const totalPages = Math.ceil(filteredData.length / AppState.rowsPerPage);
            if (AppState.currentPage < totalPages) {
                AppState.currentPage++;
                renderTable();
            }
        });
    }

    if (elements.btnToggleCols) {
        elements.btnToggleCols.addEventListener('click', (e) => {
            e.stopPropagation();
            if (elements.colMenu) {
                elements.colMenu.classList.toggle('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (elements.colMenu && !elements.colMenu.contains(e.target) && e.target !== elements.btnToggleCols) {
                elements.colMenu.classList.add('hidden');
            }
        });
    }
}


function handleFile(file) {
    if (file && file.name.endsWith('.csv')) {
        AppState.filename = file.name;

        const sizeInfo = file.size > 1024 * 1024
            ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
            : (file.size / 1024).toFixed(2) + ' KB';
        elements.stats.size.innerText = sizeInfo;

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            const firstLine = text.split('\n')[0];

            const parseConfig = {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    AppState.data = results.data;
                    AppState.meta = results.meta;
                    AppState.hiddenColumns.clear();

                    if (AppState.meta.fields) {
                        AppState.meta.fields.forEach(f => AppState.columnWidths[f] = 200);
                    }
                    loadEditor();
                    renderColumnMenu();
                },
                error: (err) => {
                    console.error('Error parsing CSV:', err);
                    alert('Hubo un error al leer el archivo CSV.');
                }
            };

            if (firstLine.startsWith('/atg') || firstLine.includes('TIMEFORMAT')) {
                AppState.originalHeader = firstLine; // Guardar la línea de metadatos
                Papa.parse(text.substring(text.indexOf('\n') + 1), parseConfig);
            } else {
                AppState.originalHeader = null;
                Papa.parse(file, parseConfig);
            }
        };
        reader.readAsText(file);
    } else {
        alert('Por favor sube un archivo valido .csv');
    }
}

function loadEditor() {
    elements.uploadSection.classList.add('hidden');
    elements.editorSection.classList.remove('hidden');
    elements.btnExport.classList.remove('hidden');

    elements.stats.rows.innerText = AppState.data.length;
    elements.stats.cols.innerText = AppState.meta.fields.length;

    renderTable();
}

function renderColumnMenu() {
    if (!elements.colList || !AppState.meta.fields) return;

    elements.colList.innerHTML = '';

    AppState.meta.fields.forEach(field => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-2 px-2 py-1 hover:bg-slate-700 rounded cursor-pointer text-sm text-slate-300 select-none';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !AppState.hiddenColumns.has(field);
        checkbox.className = 'rounded border-slate-600 bg-darkBg text-accent focus:ring-accent';

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                AppState.hiddenColumns.delete(field);
            } else {
                AppState.hiddenColumns.add(field);
            }
            renderTable();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(field));
        elements.colList.appendChild(label);
    });
}

function getFilteredData() {
    if (!AppState.searchQuery) return AppState.data;
    return AppState.data.filter(row => {
        return Object.values(row).some(val =>
            String(val).toLowerCase().includes(AppState.searchQuery)
        );
    });
}

function renderTable() {
    elements.tableContainer.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'text-left text-sm text-gray-300 border-separate border-spacing-0';
    table.style.tableLayout = 'fixed';

    const visibleFields = AppState.meta.fields.filter(f => !AppState.hiddenColumns.has(f));

    // Colgroup
    const colgroup = document.createElement('colgroup');

    // Column 0: Delete Action
    const colAction = document.createElement('col');
    colAction.style.width = '50px';
    colgroup.appendChild(colAction);

    // Data Columns
    visibleFields.forEach(field => {
        const col = document.createElement('col');
        col.style.width = (AppState.columnWidths[field] || 200) + 'px';
        colgroup.appendChild(col);
    });
    table.appendChild(colgroup);

    // HEADER
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // 1. Action Header (Sticky Left)
    const thAction = document.createElement('th');
    thAction.className = 'px-2 py-3 w-[50px] sticky top-0 left-0 z-30 bg-panelBg border-b border-slate-700 text-center font-bold text-white shadow-[2px_0_5px_rgba(0,0,0,0.1)]';
    thAction.textContent = 'x';
    headerRow.appendChild(thAction);

    // 2. Data Headers
    visibleFields.forEach(field => {
        const th = document.createElement('th');
        th.className = 'px-4 py-3 font-semibold text-white whitespace-nowrap bg-panelBg border-b border-slate-700 sticky top-0 z-20 relative group select-none';

        const span = document.createElement('span');
        span.textContent = field;
        th.appendChild(span);

        // Resizer Handle
        const resizer = document.createElement('div');
        resizer.className = 'absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent z-40';
        resizer.style.userSelect = 'none';

        let startX, startWidth;

        const onMouseMove = (e) => {
            const diff = e.clientX - startX;
            const newWidth = Math.max(50, startWidth + diff);
            AppState.columnWidths[field] = newWidth;
            renderTable();
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';
        };

        resizer.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startWidth = AppState.columnWidths[field] || 200;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'col-resize';
            e.stopPropagation();
        });

        th.appendChild(resizer);
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // BODY
    const tbody = document.createElement('tbody');
    const fragment = document.createDocumentFragment();

    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / AppState.rowsPerPage) || 1;

    if (AppState.currentPage > totalPages) AppState.currentPage = totalPages;
    if (AppState.currentPage < 1) AppState.currentPage = 1;

    const startIdx = (AppState.currentPage - 1) * AppState.rowsPerPage;
    const endIdx = startIdx + AppState.rowsPerPage;
    const pageData = filteredData.slice(startIdx, endIdx);

    if (elements.paginationInfo) {
        elements.paginationInfo.innerText = `Mostrando ${filteredData.length > 0 ? startIdx + 1 : 0}-${Math.min(endIdx, filteredData.length)} de ${filteredData.length}`;
        elements.btnPrev.disabled = AppState.currentPage === 1;
        elements.btnNext.disabled = AppState.currentPage === totalPages;
        elements.btnPrev.classList.toggle('opacity-50', AppState.currentPage === 1);
        elements.btnNext.classList.toggle('opacity-50', AppState.currentPage === totalPages);
    }

    pageData.forEach((row) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-700/30 transition-colors border-b border-slate-700/50';

        // 1. Action Cell (Sticky Left)
        const tdAction = document.createElement('td');
        tdAction.className = 'text-center cursor-pointer text-slate-500 hover:text-red-400 transition-colors border-b border-slate-700/50 sticky left-0 z-10 bg-panelBg shadow-[2px_0_5px_rgba(0,0,0,0.1)]';

        tdAction.innerHTML = '&times;';
        tdAction.onclick = () => {
            const realIndex = AppState.data.indexOf(row);
            if (realIndex > -1) deleteRow(realIndex);
        };
        tr.appendChild(tdAction);

        // 2. Data Cells
        visibleFields.forEach(field => {
            const td = document.createElement('td');
            td.className = 'border-b border-slate-700/50 whitespace-nowrap overflow-hidden relative';

            const input = document.createElement('input');
            input.type = 'text';
            input.value = row[field] || '';
            input.title = row[field] || '';
            input.className = 'bg-transparent text-slate-300 w-full px-3 py-2 outline-none focus:text-accent focus:bg-slate-700/50 transition-colors truncate focus:text-clip';

            input.addEventListener('change', (e) => {
                row[field] = e.target.value;
            });

            td.appendChild(input);
            tr.appendChild(td);
        });

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
    table.appendChild(tbody);

    elements.tableContainer.appendChild(table);
    elements.tableContainer.scrollTop = 0;
}

function addNewRow() {
    const newRow = {};
    AppState.meta.fields.forEach(field => {
        newRow[field] = "";
    });
    AppState.data.unshift(newRow);
    AppState.currentPage = 1;
    AppState.searchQuery = '';
    if (elements.searchInput) elements.searchInput.value = '';

    renderTable();
    elements.stats.rows.innerText = AppState.data.length;
}

function deleteRow(index) {
    if (confirm('¿Estás seguro de eliminar esta fila?')) {
        AppState.data.splice(index, 1);
        renderTable();
        elements.stats.rows.innerText = AppState.data.length;
    }
}

function exportCSV() {
    let csv = Papa.unparse(AppState.data);

    // Restaurar metadatos si existían
    if (AppState.originalHeader) {
        csv = AppState.originalHeader + '\n' + csv;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', 'edited_' + AppState.filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
