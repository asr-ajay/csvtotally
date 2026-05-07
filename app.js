document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const previewSection = document.getElementById('preview-section');
    const resultSection = document.getElementById('result-section');
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    const convertBtn = document.getElementById('convert-btn');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');
    const globalVchInput = document.getElementById('global-vch-type');
    const templateSelector = document.getElementById('template-selector');
    const templateLinks = document.querySelectorAll('[data-template]');
    const newConversionBtn = document.getElementById('new-conversion-btn');
    
    // Master Import & Viewer
    const masterFiles = document.querySelectorAll('input[id^="m-"]');
    const viewMastersBtn = document.getElementById('view-masters-btn');
    const masterModal = document.getElementById('master-modal');
    const closeModal = document.getElementById('close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const masterTableWrapper = document.getElementById('master-table-wrapper');

    // Help Modal
    const helpLink = document.getElementById('help-link');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModal = document.getElementById('close-help-modal');
    
    const templatesBtn = document.getElementById('templates-btn');
    const templatesModal = document.getElementById('templates-modal');
    const closeTemplatesModal = document.getElementById('close-templates-modal');

    // Privacy Modal
    const privacyLink = document.getElementById('privacy-link');
    const disclaimerLink = document.getElementById('disclaimer-link');
    const privacyModal = document.getElementById('privacy-modal');
    const closePrivacyModal = document.getElementById('close-privacy-modal');

    // Error Log
    const errorLogSection = document.getElementById('error-log-section');
    const errorList = document.getElementById('error-list');
    const ignoreErrorsBtn = document.getElementById('ignore-errors-btn');
    const fixErrorsBtn = document.getElementById('fix-errors-btn');

    // --- Dynamic Year ---
    const yearElem = document.getElementById('current-year');
    if (yearElem) yearElem.textContent = new Date().getFullYear();

    let csvData = null;
    let generatedXml = null;
    let activeMode = 'single-simple';
    let currentTab = 'ledgers';

    const masters = {
        ledgers: [],
        vouchers: [],
        items: [],
        units: []
    };

    // --- Persistence Logic ---
    function saveMastersToSession() {
        sessionStorage.setItem('csvToTallyMasters', JSON.stringify(masters));
    }

    function loadMastersFromSession() {
        const saved = sessionStorage.getItem('csvToTallyMasters');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.keys(parsed).forEach(key => {
                    masters[key] = parsed[key];
                    const statusElem = document.getElementById(`s-${key}`);
                    if (statusElem) statusElem.textContent = masters[key].length;
                });
            } catch (e) {
                console.error("Error loading masters from session:", e);
            }
        }
    }

    loadMastersFromSession();

    const templates = {
        'single-simple': "Date,DebitLedger,CreditLedger,Amount,Narration\n01-04-2024,HDFC Bank,Sales Account,15000.00,Being sales made",
        'single-combined': "Date,VoucherType,DebitLedger,CreditLedger,Amount,Narration\n01-04-2024,Sales,HDFC Bank,Sales Account,15000.00,Being sales\n02-04-2024,Payment,Rent,Cash,5000.00,Office rent",
        'multiple-simple': "VoucherNo,Date,Narration,LedgerName1,Amount1,DrCr1,LedgerName2,Amount2,DrCr2,LedgerName3,Amount3,DrCr3\n1,01-04-2024,Multiple entry,Customer A,10000.00,Dr,Sales,10000.00,Cr,,,\n2,02-04-2024,Cash Sales,Cash,5000.00,Dr,Sales,5000.00,Cr,,,",
        'multiple-combined': "VoucherNo,Date,VoucherType,Narration,LedgerName1,Amount1,DrCr1,LedgerName2,Amount2,DrCr2,LedgerName3,Amount3,DrCr3\n1,01-04-2024,Sales,Multiple entry,Customer A,10000.00,Dr,Sales,10000.00,Cr,,,\n2,02-04-2024,Receipt,Payment recd,HDFC Bank,5000.00,Dr,Customer B,5000.00,Cr,,,",
        'inventory-simple': "Date,VoucherType,VoucherNo,PartyLedger,PartyDrCr,ItemLedger,StockItem,Qty,Rate,Unit,Amount,TaxLedger1,TaxAmt1,TaxLedger2,TaxAmt2,TaxLedger3,TaxAmt3,ExpLedger1,ExpAmt1,ExpLedger2,ExpAmt2,Narration\n01-04-2024,Sales,1,Customer A,Dr,Sales Account,Laptop,10,25000,Nos,250000,Output IGST,45000,,,,,Freight,500,,,Being items sold",
        'inventory-multiple': "VoucherNo,Date,VoucherType,PartyLedger,PartyDrCr,ItemLedger,StockItem,Qty,Rate,Unit,Amount,TaxLedger1,TaxAmt1,TaxLedger2,TaxAmt2,TaxLedger3,TaxAmt3,ExpLedger1,ExpAmt1,ExpLedger2,ExpAmt2,Narration\n1,01-04-2024,Sales,Customer A,Dr,Sales Account,Laptop,2,25000,Nos,50000,Output IGST,9000,,,,,Freight,100,,,Bulk Sale\n1,01-04-2024,Sales,Customer A,Dr,Sales Account,Mouse,5,500,Nos,2500,Output IGST,450,,,,,Freight,20,,,Bulk Sale",
        'master-ledger': "Name,Parent,OpeningBalance,DrCr\nCustomer A,Sundry Debtors,1000,Dr\nBank Loan,Secured Loans,50000,Cr",
        'master-item': "Name,Parent,Unit,OpeningQty,OpeningValue\nLaptop,Electronics,Nos,10,250000\nMouse,Electronics,Nos,20,10000"
    };

    // --- Template Selection ---
    if (templateSelector) {
        activeMode = templateSelector.value;
        
        templateSelector.addEventListener('change', () => {
            activeMode = templateSelector.value;
            updateVoucherTypeVisibility();
        });
    }

    function updateVoucherTypeVisibility() {
        const simpleVchContainer = document.getElementById('simple-vch-type-container');
        const globalVchSelect = document.getElementById('global-vch-type');
        if (!simpleVchContainer || !globalVchSelect) return;
        
        // Disable if it's a Combined template, Inventory template, or Master creation
        const isDisabled = activeMode.includes('combined') || activeMode.includes('inventory') || activeMode.includes('master');
        
        if (!isDisabled) {
            simpleVchContainer.style.opacity = '1';
            simpleVchContainer.style.pointerEvents = 'all';
            simpleVchContainer.classList.remove('disabled-config');
            globalVchSelect.disabled = false;
        } else {
            simpleVchContainer.style.opacity = '0.5';
            simpleVchContainer.style.pointerEvents = 'none';
            simpleVchContainer.classList.add('disabled-config');
            globalVchSelect.disabled = true;
        }
    }
    
    // Run initial visibility check
    updateVoucherTypeVisibility();

    // --- Master Import Logic ---
    masterFiles.forEach(input => {
        input.addEventListener('change', (e) => {
            const type = input.dataset.type;
            if (e.target.files.length) {
                const reader = new FileReader();
                reader.onload = (event) => parseTallyMasters(event.target.result, type);
                reader.readAsText(e.target.files[0]);
            }
        });
    });

    function parseTallyMasters(html, type) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const textContent = doc.body.textContent.toLowerCase();
        const pageTitle = (doc.title || "").toLowerCase();
        const fullContent = (pageTitle + " " + textContent).trim();

        // --- Strict Content Validation ---
        const config = {
            ledgers: {
                required: ['group under', 'name of ledger', 'ledger name'],
                forbidden: ['stock item', 'opening qty', 'item name'],
                label: 'Ledgers'
            },
            vouchers: {
                required: ['voucher type', 'vch type'],
                forbidden: ['ledger name', 'stock item'],
                label: 'Voucher Types'
            },
            items: {
                required: ['stock item', 'opening qty'],
                forbidden: ['group under'],
                label: 'Stock Items'
            },
            units: {
                required: ['unit', 'symbol', 'formal name'],
                forbidden: ['group under', 'opening balance'],
                label: 'Units'
            }
        };

        const rule = config[type];
        const hasRequired = rule.required.some(kw => fullContent.includes(kw));
        const hasForbidden = rule.forbidden.some(kw => fullContent.includes(kw));

        if (!hasRequired || hasForbidden || fullContent.length < 50) {
            alert(`❌ INVALID FILE TYPE!\n\nThe file you uploaded is not a valid Tally "${rule.label}" export.\n\nExpected headers were not found, or it contains data from another category.\nPlease export the correct "${rule.label}" HTML from Tally and try again.`);
            const input = document.getElementById(`m-${type}`);
            if (input) input.value = '';
            return;
        }

        const rows = doc.querySelectorAll('tr');
        
        // Reset the specific master list to replace with new data
        masters[type] = [];
        const list = masters[type];
        
        let addedCount = 0;
        rows.forEach(row => {
            if (row.querySelector('table')) return;

            const allCells = Array.from(row.querySelectorAll('td, th'));
            const dataCells = allCells.filter(c => {
                const text = c.textContent.replace(/\u00A0/g, ' ').trim();
                return text.length > 0;
            });

            // Changed from >= 2 to >= 1 to support simple lists without spacers or serial numbers
            if (dataCells.length >= 1) {
                let name = "";
                let secondary = "";
                let extra = "";
                
                const cell0 = dataCells[0].textContent.trim();
                const cell1 = dataCells.length > 1 ? dataCells[1].textContent.trim() : '';
                const cell2 = dataCells.length > 2 ? dataCells[2].textContent.trim() : '';
                const cell3 = dataCells.length > 3 ? dataCells[3].textContent.trim() : '';

                // Handle Sl. No. if present (only if it's purely numeric)
                if (/^\d+$/.test(cell0) && dataCells.length > 1) {
                    name = cell1;
                    secondary = cell2;
                    extra = cell3;
                } else {
                    name = cell0;
                    secondary = cell1;
                    extra = cell2;
                }

                // --- Filtering ---
                if (!name || name.length < 2) return;
                
                // Skip headers using 'includes' and exact matches
                const skipKeywords = ['Chart of Accounts', 'Sl. No.', 'S.No.', 'Particulars', 'Name', 'Voucher Type', 'Item Name', 'Unit', 'Alias', 'List of', 'Report Name', 'Group Under'];
                if (skipKeywords.some(kw => name.toLowerCase().includes(kw.toLowerCase()) || name.includes('(s)') || name.includes('Group(s)') || name.includes('Ledger(s)'))) return;
                
                if (name.length > 100 || name.split(' ').length > 8) return;

                if (!list.find(m => m.lower === name.toLowerCase())) {
                    list.push({ 
                        original: name, 
                        lower: name.toLowerCase(),
                        secondary: secondary,
                        extra: extra
                    });
                    addedCount++;
                }
            }
        });

        document.getElementById(`s-${type}`).textContent = list.length;
        saveMastersToSession();
    }

    // --- Help Modal Logic ---
    helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        helpModal.classList.remove('hidden');
    });
    closeHelpModal.addEventListener('click', () => helpModal.classList.add('hidden'));
    
    // --- Templates Modal Logic ---
    if (templatesBtn) {
        templatesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            templatesModal.classList.remove('hidden');
        });
    }
    if (closeTemplatesModal) {
        closeTemplatesModal.addEventListener('click', () => templatesModal.classList.add('hidden'));
    }

    // Handle template downloads inside modal
    document.querySelectorAll('.dl-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.template;
            downloadTemplate(type);
            templatesModal.classList.add('hidden');
        });
    });
    
    const inlineHelpTrigger = document.getElementById('inline-help-trigger');
    if (inlineHelpTrigger) {
        inlineHelpTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            helpModal.classList.remove('hidden');
        });
    }

    // --- Privacy Modal Logic ---
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            privacyModal.classList.remove('hidden');
        });
    }
    if (disclaimerLink) {
        disclaimerLink.addEventListener('click', (e) => {
            e.preventDefault();
            privacyModal.classList.remove('hidden');
        });
    }
    
    document.querySelectorAll('.inline-privacy-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            privacyModal.classList.remove('hidden');
        });
    });
    if (closePrivacyModal) {
        closePrivacyModal.addEventListener('click', () => privacyModal.classList.add('hidden'));
    }

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === masterModal) masterModal.classList.add('hidden');
        if (e.target === helpModal) helpModal.classList.add('hidden');
        if (e.target === templatesModal) templatesModal.classList.add('hidden');
        if (e.target === privacyModal) privacyModal.classList.add('hidden');
    });

    // --- Master Viewer Logic ---
    viewMastersBtn.addEventListener('click', () => {
        renderMasterList();
        masterModal.classList.remove('hidden');
    });
    closeModal.addEventListener('click', () => masterModal.classList.add('hidden'));
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            renderMasterList();
        });
    });

    function renderMasterList() {
        masterTableWrapper.innerHTML = '';
        const list = masters[currentTab];
        
        if (list.length === 0) {
            masterTableWrapper.innerHTML = `<div style="color: #94a3b8; text-align: center; padding: 4rem;">No ${currentTab} uploaded yet.</div>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'tally-structured-table';
        
        // Header Row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        let headers = ['S.No.'];
        if (currentTab === 'ledgers') headers.push('Ledger Name', 'Group Under');
        else if (currentTab === 'vouchers') headers.push('Name of Vouchers');
        else if (currentTab === 'items') headers.push('Item Name', 'Group', 'Unit');
        else headers.push('Unit Name');

        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body Rows
        const tbody = document.createElement('tbody');
        list.sort((a, b) => a.original.localeCompare(b.original)).forEach((item, index) => {
            const tr = document.createElement('tr');
            
            const tdNo = document.createElement('td');
            tdNo.textContent = index + 1;
            tdNo.style.textAlign = 'center';
            tr.appendChild(tdNo);
            
            const tdName = document.createElement('td');
            tdName.textContent = item.original;
            tr.appendChild(tdName);

            if (currentTab === 'ledgers') {
                const tdSecondary = document.createElement('td');
                tdSecondary.textContent = item.secondary || '-';
                tr.appendChild(tdSecondary);
            } else if (currentTab === 'items') {
                const tdGroup = document.createElement('td');
                tdGroup.textContent = item.secondary || '-';
                tr.appendChild(tdGroup);
                
                const tdUnit = document.createElement('td');
                tdUnit.textContent = item.extra || '-';
                tr.appendChild(tdUnit);
            }
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        // Footer (Total)
        const tfoot = document.createElement('tfoot');
        const footerRow = document.createElement('tr');
        
        const totalTd = document.createElement('td');
        totalTd.colSpan = headers.length;
        totalTd.style.fontWeight = '800';
        totalTd.style.padding = '0.75rem';
        
        let label = '';
        if (currentTab === 'ledgers') label = 'Ledger(s)';
        else if (currentTab === 'vouchers') label = 'Voucher Type(s)';
        else if (currentTab === 'items') label = 'Stock Item(s)';
        else label = 'Unit(s)';
        
        totalTd.textContent = `${list.length} ${label}`;
        footerRow.appendChild(totalTd);
        tfoot.appendChild(footerRow);
        table.appendChild(tfoot);
        
        masterTableWrapper.appendChild(table);
    }

    // --- Helper for Strict Lookup ---
    function masterExists(name, type) {
        if (!name) return true;
        const list = masters[type];
        // Mandatory check: if list is empty, validation FAILS for that item
        return list.some(m => m.lower === name.trim().toLowerCase());
    }

    // --- Template Download ---
    templateLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const content = templates[link.dataset.template];
            const blob = new Blob([content], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `template_${link.dataset.template}.csv`; a.click();
            window.URL.revokeObjectURL(url);
        });
    });

    // --- File Handlers ---
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });

    function handleFile(file) {
        fileNameDisplay.textContent = file.name;
        Papa.parse(file, {
            header: true, skipEmptyLines: true,
            complete: function(results) {
                if (results.data.length === 0) return alert('The CSV file is empty.');
                
                // --- Header Validation ---
                const templateContent = templates[activeMode];
                if (templateContent) {
                    const expectedHeaders = templateContent.split('\n')[0].split(',').map(h => h.trim());
                    const uploadedHeaders = results.meta.fields.map(h => h.trim());
                    
                    // Check if all expected headers exist in the uploaded file
                    const missingHeaders = expectedHeaders.filter(h => !uploadedHeaders.includes(h));
                    
                    if (missingHeaders.length > 0) {
                        alert(`❌ Template Mismatch!\n\nYou have selected the "${activeMode.replace('-', ' ').toUpperCase()}" template, but the uploaded file is missing required columns: \n\n${missingHeaders.join(', ')}\n\nPlease ensure you are using the correct template.`);
                        resetAll();
                        return;
                    }
                }
                
                csvData = results.data;
                showPreview(results);
            }
        });
    }

    function showPreview(results) {
        const fields = results.meta.fields;
        tableHead.innerHTML = ''; tableBody.innerHTML = '';
        fields.forEach(field => { const th = document.createElement('th'); th.textContent = field; tableHead.appendChild(th); });
        results.data.slice(0, 10).forEach(row => {
            const tr = document.createElement('tr');
            fields.forEach(field => {
                const td = document.createElement('td');
                const val = (row[field] || '').trim();
                td.textContent = val;
                if (val) {
                    const isMasterMode = activeMode.startsWith('master');
                    const isItemMaster = activeMode === 'master-item';
                    
                    if (!isMasterMode) {
                        if ((field.includes('Ledger') || field === 'LedgerName' || field === 'PartyLedger' || field === 'ItemLedger' || field === 'SalesLedger' || field.startsWith('TaxLedger') || field.startsWith('ExpLedger')) && !masterExists(val, 'ledgers')) {
                            td.style.color = '#f87171';
                        }
                        if (field === 'VoucherType' && !masterExists(val, 'vouchers')) {
                            td.style.color = '#f87171';
                        }
                        if (field === 'StockItem' && !masterExists(val, 'items')) {
                            td.style.color = '#f87171';
                        }
                    }
                    
                    // Unit validation is relevant for inventory and item masters
                    if ((field === 'Unit' || (isItemMaster && field === 'Unit')) && !masterExists(val, 'units')) {
                        td.style.color = '#f87171';
                    }
                }
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
        previewSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        errorLogSection.classList.add('hidden');
        dropZone.classList.add('hidden');
        previewSection.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Validation & Generation ---
    convertBtn.addEventListener('click', () => {
        if (!csvData) return;
        const errors = validateData(csvData);
        if (errors.length > 0) {
            showErrorLog(errors);
        } else {
            generateFinalXml();
        }
    });

    ignoreErrorsBtn.addEventListener('click', () => generateFinalXml());
    fixErrorsBtn.addEventListener('click', () => {
        errorLogSection.classList.add('hidden');
        previewSection.scrollIntoView({ behavior: 'smooth' });
    });

    function validateData(data) {
        const errors = [];
        const globalVchType = globalVchInput.value;
        
        const isMasterMode = activeMode.startsWith('master');
        const isItemMaster = activeMode === 'master-item';
        
        if (!isMasterMode) {
            if (masters.ledgers.length === 0) errors.push("CRITICAL: No Ledgers uploaded. Please upload your Ledger HTML file for validation.");
            if (masters.vouchers.length === 0) errors.push("CRITICAL: No Voucher Types uploaded. Please upload your Voucher Type HTML file for validation.");
        } else if (isItemMaster) {
            if (masters.units.length === 0) errors.push("CRITICAL: No Units uploaded. Please upload your Units HTML file for validation.");
        }

        data.forEach((row, index) => {
            const line = index + 1;
            if (!isMasterMode) {
                const vType = row.VoucherType || globalVchType;
                if (!masterExists(vType, 'vouchers')) errors.push(`Row ${line}: Voucher Type "${vType}" is not verified.`);
                
                const ledgersToCheck = [];
                if (row.DebitLedger) ledgersToCheck.push(row.DebitLedger);
                if (row.CreditLedger) ledgersToCheck.push(row.CreditLedger);
                if (row.PartyLedger) ledgersToCheck.push(row.PartyLedger);
                if (row.ItemLedger) ledgersToCheck.push(row.ItemLedger);
                if (row.SalesLedger) ledgersToCheck.push(row.SalesLedger);
                
                for (let i = 1; i <= 20; i++) {
                    if (row[`LedgerName${i}`]) ledgersToCheck.push(row[`LedgerName${i}`]);
                    if (row[`TaxLedger${i}`]) ledgersToCheck.push(row[`TaxLedger${i}`]);
                    if (row[`ExpLedger${i}`]) ledgersToCheck.push(row[`ExpLedger${i}`]);
                }

                ledgersToCheck.forEach(l => {
                    if (l && !masterExists(l, 'ledgers')) errors.push(`Row ${line}: Ledger "${l}" is not verified.`);
                });
            }

            if (!isMasterMode) {
                if (row.StockItem && !masterExists(row.StockItem, 'items')) errors.push(`Row ${line}: Stock Item "${row.StockItem}" is not verified.`);
            }
            
            if ((activeMode.includes('inventory') || isItemMaster) && row.Unit) {
                if (!masterExists(row.Unit, 'units')) errors.push(`Row ${line}: Unit "${row.Unit}" is not verified.`);
            }
        });
        return [...new Set(errors)];
    }

    function showErrorLog(errors) {
        errorList.innerHTML = '';
        errors.forEach(err => {
            const li = document.createElement('li');
            li.textContent = err;
            errorList.appendChild(li);
        });
        errorLogSection.classList.remove('hidden');
        errorLogSection.scrollIntoView({ behavior: 'smooth' });
    }

    function generateFinalXml() {
        try {
            if (activeMode.startsWith('single')) {
                generatedXml = generateSingleVoucherXml(csvData);
            } else if (activeMode.startsWith('multiple')) {
                generatedXml = generateMultipleVoucherXml(csvData);
            } else if (activeMode.startsWith('inventory')) {
                generatedXml = generateInventoryXml(csvData);
            } else if (activeMode === 'master-ledger') {
                generatedXml = generateMasterLedgerXml(csvData);
            } else if (activeMode === 'master-item') {
                generatedXml = generateMasterItemXml(csvData);
            }
            errorLogSection.classList.add('hidden');
            previewSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            alert('Error during XML generation: ' + err.message);
        }
    }

    function generateSingleVoucherXml(data) {
        let xml = getXmlHeader();
        const globalVchType = globalVchInput.value || 'Journal';
        data.forEach(row => {
            const date = formatDate(row.Date || '');
            const vchType = escapeXml(row.VoucherType || globalVchType);
            const vchNo = escapeXml(row.VoucherNo || '');
            const drLedger = escapeXml(row.DebitLedger || '');
            const crLedger = escapeXml(row.CreditLedger || '');
            
            // Robust amount parsing (removes commas and currency symbols)
            const amountRaw = (row.Amount || '0').toString().replace(/[^0-9\.-]+/g,"");
            const amount = parseFloat(amountRaw);
            
            const narration = escapeXml(row.Narration || '');
            if (!drLedger || !crLedger || isNaN(amount)) return;
            xml += `
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <VOUCHER VCHTYPE="${vchType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
                        <DATE>${date}</DATE>
                        <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
                        <VOUCHERNUMBER>${vchNo}</VOUCHERNUMBER>
                        <NARRATION>${narration}</NARRATION>
                        <ALLLEDGERENTRIES.LIST>
                            <LEDGERNAME>${drLedger}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                            <AMOUNT>-${amount.toFixed(2)}</AMOUNT>
                        </ALLLEDGERENTRIES.LIST>
                        <ALLLEDGERENTRIES.LIST>
                            <LEDGERNAME>${crLedger}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                            <AMOUNT>${amount.toFixed(2)}</AMOUNT>
                        </ALLLEDGERENTRIES.LIST>
                    </VOUCHER>
                </TALLYMESSAGE>`;
        });
        return xml + getXmlFooter();
    }

    function generateMultipleVoucherXml(data) {
        let xml = getXmlHeader();
        const globalVchType = globalVchInput.value || 'Journal';
        
        const groups = {};
        data.forEach(row => {
            const key = row.VoucherNo || 'NoID';
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
        });

        Object.keys(groups).forEach(vchNo => {
            const rows = groups[vchNo];
            const firstRow = rows[0];
            const date = formatDate(firstRow.Date || '');
            const vchType = escapeXml(firstRow.VoucherType || globalVchType);
            const narration = escapeXml(firstRow.Narration || '');
            
            xml += `
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <VOUCHER VCHTYPE="${vchType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
                        <DATE>${date}</DATE>
                        <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
                        <VOUCHERNUMBER>${escapeXml(vchNo === 'NoID' ? '' : vchNo)}</VOUCHERNUMBER>
                        <NARRATION>${narration}</NARRATION>`;
            
            rows.forEach(row => {
                // Collect all horizontal ledger entries (LedgerName1, Amount1, DrCr1, etc.)
                for (let i = 1; i <= 20; i++) {
                    const ledger = row[`LedgerName${i}`];
                    const amountRaw = row[`Amount${i}`];
                    const drCr = row[`DrCr${i}`];
                    
                    if (ledger && amountRaw) {
                        const amount = parseFloat(amountRaw.toString().replace(/[^0-9\.-]+/g,""));
                        if (isNaN(amount)) continue;

                        const isDr = (drCr || '').toLowerCase().startsWith('d') || (drCr || '').toLowerCase() === 'yes';
                        
                        xml += `
                            <ALLLEDGERENTRIES.LIST>
                                <LEDGERNAME>${escapeXml(ledger.trim())}</LEDGERNAME>
                                <ISDEEMEDPOSITIVE>${isDr ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
                                <AMOUNT>${isDr ? '-' : ''}${amount.toFixed(2)}</AMOUNT>
                            </ALLLEDGERENTRIES.LIST>`;
                    }
                }
            });

            xml += `
                    </VOUCHER>
                </TALLYMESSAGE>`;
        });
        return xml + getXmlFooter();
    }

    function generateInventoryXml(data) {
        let xml = getXmlHeader();
        const globalVchType = globalVchInput.value || 'Sales';
        const groups = {};
        data.forEach(row => {
            const key = row.VoucherNo || 'NoID';
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
        });

        Object.keys(groups).forEach(vchNo => {
            const rows = groups[vchNo];
            const firstRow = rows[0];
            const date = formatDate(firstRow.Date || '');
            const vchType = escapeXml(firstRow.VoucherType || globalVchType);
            const partyLedger = escapeXml(firstRow.PartyLedger || '');
            const narration = escapeXml(firstRow.Narration || '');
            
            // Determine direction: default to Dr (Sales) if not specified
            const partyDrCr = (firstRow.PartyDrCr || 'Dr').trim().toLowerCase();
            const isPartyDr = partyDrCr.startsWith('d') || partyDrCr === 'yes';
            
            let totalItemAmount = 0;
            const taxEntries = {}; // ledgerName -> amount
            const expEntries = {}; // ledgerName -> amount

            rows.forEach(r => {
                const itemAmt = parseFloat((r.Amount || '0').toString().replace(/[^0-9\.-]+/g,""));
                totalItemAmount += isNaN(itemAmt) ? 0 : itemAmt;

                // Aggregate Taxes (3 columns)
                for (let i = 1; i <= 3; i++) {
                    const lName = r[`TaxLedger${i}`];
                    const lAmt = parseFloat((r[`TaxAmt${i}`] || '0').toString().replace(/[^0-9\.-]+/g,""));
                    if (lName && !isNaN(lAmt) && lAmt !== 0) {
                        taxEntries[lName] = (taxEntries[lName] || 0) + lAmt;
                    }
                }
                // Aggregate Expenses (2 columns)
                for (let i = 1; i <= 2; i++) {
                    const lName = r[`ExpLedger${i}`];
                    const lAmt = parseFloat((r[`ExpAmt${i}`] || '0').toString().replace(/[^0-9\.-]+/g,""));
                    if (lName && !isNaN(lAmt) && lAmt !== 0) {
                        expEntries[lName] = (expEntries[lName] || 0) + lAmt;
                    }
                }
            });

            const totalTaxAmount = Object.values(taxEntries).reduce((a, b) => a + b, 0);
            const totalExpAmount = Object.values(expEntries).reduce((a, b) => a + b, 0);
            const grandTotal = totalItemAmount + totalTaxAmount + totalExpAmount;

            xml += `
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <VOUCHER VCHTYPE="${vchType}" ACTION="Create">
                        <DATE>${date}</DATE>
                        <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
                        <VOUCHERNUMBER>${escapeXml(vchNo === 'NoID' ? '' : vchNo)}</VOUCHERNUMBER>
                        <PARTYLEDGERNAME>${partyLedger}</PARTYLEDGERNAME>
                        <NARRATION>${narration}</NARRATION>
                        <ASINVOICE>Yes</ASINVOICE>
                        <LEDGERENTRIES.LIST>
                            <LEDGERNAME>${partyLedger}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>${isPartyDr ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
                            <AMOUNT>${isPartyDr ? '-' : ''}${grandTotal.toFixed(2)}</AMOUNT>
                        </LEDGERENTRIES.LIST>`;

            // Inventory Entries
            rows.forEach(row => {
                const item = escapeXml(row.StockItem || '');
                const itemLedger = escapeXml(row.ItemLedger || row.SalesLedger || '');
                const qty = escapeXml(`${row.Qty || ''} ${row.Unit || ''}`);
                const rate = parseFloat((row.Rate || '0').toString().replace(/[^0-9\.-]+/g,""));
                const amount = parseFloat((row.Amount || '0').toString().replace(/[^0-9\.-]+/g,""));
                
                if (!item || isNaN(amount)) return;

                xml += `
                        <INVENTORYENTRIES.LIST>
                            <STOCKITEMNAME>${item}</STOCKITEMNAME>
                            <ISDEEMEDPOSITIVE>${isPartyDr ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
                            <RATE>${rate.toFixed(2)}</RATE>
                            <AMOUNT>${isPartyDr ? '' : '-'}${amount.toFixed(2)}</AMOUNT>
                            <ACTUALQTY>${qty}</ACTUALQTY>
                            <BILLEDQTY>${qty}</BILLEDQTY>
                            <ACCOUNTINGALLOCATIONS.LIST>
                                <LEDGERNAME>${itemLedger}</LEDGERNAME>
                                <ISDEEMEDPOSITIVE>${isPartyDr ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
                                <AMOUNT>${isPartyDr ? '' : '-'}${amount.toFixed(2)}</AMOUNT>
                            </ACCOUNTINGALLOCATIONS.LIST>
                        </INVENTORYENTRIES.LIST>`;
            });

            // Additional Ledgers (Taxes)
            Object.keys(taxEntries).forEach(lName => {
                const amt = taxEntries[lName];
                xml += `
                        <LEDGERENTRIES.LIST>
                            <LEDGERNAME>${escapeXml(lName)}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>${isPartyDr ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
                            <AMOUNT>${isPartyDr ? '' : '-'}${amt.toFixed(2)}</AMOUNT>
                        </LEDGERENTRIES.LIST>`;
            });

            // Additional Ledgers (Expenses)
            Object.keys(expEntries).forEach(lName => {
                const amt = expEntries[lName];
                xml += `
                        <LEDGERENTRIES.LIST>
                            <LEDGERNAME>${escapeXml(lName)}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>${isPartyDr ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
                            <AMOUNT>${isPartyDr ? '' : '-'}${amt.toFixed(2)}</AMOUNT>
                        </LEDGERENTRIES.LIST>`;
            });

            xml += `
                    </VOUCHER>
                </TALLYMESSAGE>`;
        });
        return xml + getXmlFooter();
    }

    function generateMasterLedgerXml(data) {
        let xml = getXmlHeader('All Masters');
        data.forEach(row => {
            const name = escapeXml(row.Name || '');
            const parent = escapeXml(row.Parent || 'Primary');
            const openingRaw = parseFloat((row.OpeningBalance || '0').toString().replace(/[^0-9\.-]+/g,""));
            const drCr = (row.DrCr || 'Dr').trim().toLowerCase();
            const isDr = drCr.startsWith('d') || drCr === 'yes';
            
            // Tally expects Negative for Dr (Asset) and Positive for Cr (Liability)
            const opening = isDr ? -Math.abs(openingRaw) : Math.abs(openingRaw);
            
            if (!name) return;
            xml += `
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <LEDGER NAME="${name}" ACTION="Create">
                        <NAME>${name}</NAME>
                        <PARENT>${parent}</PARENT>
                        <OPENINGBALANCE>${opening.toFixed(2)}</OPENINGBALANCE>
                    </LEDGER>
                </TALLYMESSAGE>`;
        });
        return xml + getXmlFooter();
    }

    function generateMasterItemXml(data) {
        let xml = getXmlHeader('All Masters');
        data.forEach(row => {
            const name = escapeXml(row.Name || '');
            const parent = escapeXml(row.Parent || 'Primary');
            const unit = escapeXml(row.Unit || '');
            const qty = parseFloat((row.OpeningQty || '0').toString().replace(/[^0-9\.-]+/g,""));
            const valRaw = parseFloat((row.OpeningValue || '0').toString().replace(/[^0-9\.-]+/g,""));
            
            // Opening Stock Value is always a Debit (Negative in Tally XML)
            const val = -Math.abs(valRaw);
            const rate = qty !== 0 ? Math.abs(valRaw / qty) : 0;
            
            if (!name) return;
            xml += `
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <STOCKITEM NAME="${name}" ACTION="Create">
                        <NAME>${name}</NAME>
                        <PARENT>${parent}</PARENT>
                        <BASEUNITS>${unit}</BASEUNITS>
                        <OPENINGBALANCE>${qty.toFixed(2)} ${unit}</OPENINGBALANCE>
                        <OPENINGVALUE>${val.toFixed(2)}</OPENINGVALUE>
                        ${qty !== 0 ? `<OPENINGRATE>${rate.toFixed(2)} per ${unit}</OPENINGRATE>` : ''}
                        <BATCHALLOCATIONS.LIST>
                            <GODOWNNAME>Main Location</GODOWNNAME>
                            <BATCHNAME>Primary Batch</BATCHNAME>
                            <OPENINGBALANCE>${qty.toFixed(2)} ${unit}</OPENINGBALANCE>
                            <OPENINGVALUE>${val.toFixed(2)}</OPENINGVALUE>
                        </BATCHALLOCATIONS.LIST>
                    </STOCKITEM>
                </TALLYMESSAGE>`;
        });
        return xml + getXmlFooter();
    }

    function getXmlHeader(reportName = 'All Masters') { return `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE>\n<HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>\n<BODY>\n<IMPORTDATA>\n<REQUESTDESC><REPORTNAME>${reportName}</REPORTNAME></REQUESTDESC>\n<REQUESTDATA>`; }
    function getXmlFooter() { return `\n</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`; }
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const clean = dateStr.replace(/[\/\.]/g, '-');
        const parts = clean.split('-');
        if (parts.length === 3) {
            let d = parts[0].padStart(2, '0');
            let m = parts[1].padStart(2, '0');
            let y = parts[2];
            if (y.length === 2) y = '20' + y;
            return `${y}${m}${d}`;
        }
        return dateStr;
    }
    function escapeXml(unsafe) { if (!unsafe) return ""; return unsafe.toString().replace(/[<>&"']/g, m => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":"&apos;"}[m])); }

    function resetAll() {
        csvData = null; 
        generatedXml = null; 
        fileInput.value = '';
        fileNameDisplay.textContent = 'Supports .csv files in fixed format';
        previewSection.classList.add('hidden'); 
        resultSection.classList.add('hidden');
        errorLogSection.classList.add('hidden'); 
        dropZone.classList.remove('hidden');
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetBtn.addEventListener('click', resetAll);
    if (newConversionBtn) newConversionBtn.addEventListener('click', resetAll);

    downloadBtn.addEventListener('click', () => {
        if (!generatedXml) return;
        const blob = new Blob([generatedXml], { type: 'text/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `Tally_${activeMode}_${new Date().getTime()}.xml`; a.click();
        window.URL.revokeObjectURL(url);
    });
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker failed', err));
    });
}
