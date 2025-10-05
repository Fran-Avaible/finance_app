// ===== MAIN APP =====
class FinanceApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.calendarDate = new Date();
        this.init();
    }

    init() {
        DB.init();
        this.setupEventListeners();
        this.render();
        this.updateTotalBalance();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelector('.tab-navigation').addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Show active tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;
        this.renderTabContent(tabName);
    }

    updateTotalBalance() {
        const wallets = DB.getWallets();
        const total = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
        document.getElementById('totalBalance').textContent = Utils.formatCurrency(total);
    }

    renderTabContent(tabName) {
        const tabContent = document.getElementById(`${tabName}-tab`);
        
        switch(tabName) {
            case 'dashboard':
                this.renderDashboard(tabContent);
                break;
            case 'transactions':
                this.renderTransactions(tabContent);
                break;
            case 'budget':
                this.renderBudget(tabContent);
                break;
            case 'reports':
                this.renderReports(tabContent);
                break;
            case 'calendar':
                this.renderCalendar(tabContent);
                break;
            case 'settings':
                this.renderSettings(tabContent);
                break;
            default:
                tabContent.innerHTML = '<div class="card"><p>Tab sedang dalam pengembangan</p></div>';
        }
    }

    renderDashboard(container) {
        container.innerHTML = `
            <div class="quick-actions">
                <button class="btn btn-primary" onclick="app.showAddTransactionModal()">
                    <span>➕</span> Tambah Transaksi
                </button>
                <button class="btn btn-secondary" onclick="app.showTransferModal()">
                    <span>🔄</span> Transfer
                </button>
                <button class="btn btn-success" onclick="app.exportData()">
                    <span>📤</span> Export
                </button>
                <button class="btn btn-info" onclick="app.showBackupModal()">
                    <span>💾</span> Backup
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💰 Dompet Saya</h3>
                    <button class="btn btn-outline" onclick="app.showAddWalletModal()">+ Tambah Dompet</button>
                </div>
                <div id="walletsList"></div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📋 Transaksi Terakhir</h3>
                    <button class="btn btn-outline" onclick="app.switchTab('transactions')">Lihat Semua</button>
                </div>
                <div id="recentTransactions"></div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Quick Stats</h3>
                </div>
                <div id="quickStats"></div>
            </div>
        `;

        this.renderWalletsList();
        this.renderRecentTransactions();
        this.renderQuickStats();
    }

    renderWalletsList() {
        const wallets = DB.getWallets();
        const container = document.getElementById('walletsList');
        
        if (wallets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">😔</div>
                    <p>Belum ada dompet. Tambahkan satu!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = wallets.map(wallet => `
            <div class="wallet-card" onclick="app.showEditWalletModal('${wallet.id}')">
                <span class="wallet-emoji">${wallet.emoji}</span>
                <div class="wallet-info">
                    <div class="wallet-name">${wallet.name}</div>
                    <div class="wallet-balance">${Utils.formatCurrency(wallet.balance)}</div>
                </div>
            </div>
        `).join('');
    }

    renderRecentTransactions() {
        const transactions = DB.getTransactions()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
            
        const container = document.getElementById('recentTransactions');
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">📝</div>
                    <p>Belum ada transaksi. Tambahkan satu!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => {
            const wallet = DB.getWallets().find(w => w.id === transaction.walletId);
            const category = DB.getCategories().find(c => c.id === transaction.categoryId);
            const typeClass = transaction.type;
            const amountPrefix = transaction.type === 'income' ? '+' : 
                               transaction.type === 'expense' ? '-' : '';

            return `
                <div class="transaction-item ${typeClass}" onclick="app.showEditTransactionModal('${transaction.id}')">
                    <div class="transaction-info">
                        <div class="transaction-category">${category?.emoji || ''} ${category?.name || 'Unknown'}</div>
                        <div class="transaction-wallet">${wallet?.name || 'Unknown'} • ${Utils.formatDateShort(transaction.date)}</div>
                        ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                    </div>
                    <div class="transaction-amount ${typeClass}">
                        ${amountPrefix}${Utils.formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderQuickStats() {
        const transactions = DB.getTransactions();
        const container = document.getElementById('quickStats');
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const netBalance = totalIncome - totalExpense;

        container.innerHTML = `
            <div style="display: flex; justify-content: space-around; text-align: center;">
                <div>
                    <p style="font-size: 14px; color: #666;">Total Pemasukan</p>
                    <p style="font-weight: bold; color: var(--success-color);">${Utils.formatCurrency(totalIncome)}</p>
                </div>
                <div>
                    <p style="font-size: 14px; color: #666;">Total Pengeluaran</p>
                    <p style="font-weight: bold; color: var(--danger-color);">${Utils.formatCurrency(totalExpense)}</p>
                </div>
                <div>
                    <p style="font-size: 14px; color: #666;">Saldo Bersih</p>
                    <p style="font-weight: bold; color: ${netBalance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${Utils.formatCurrency(netBalance)}</p>
                </div>
            </div>
        `;
    }

    renderTransactions(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🔍 Semua Transaksi</h3>
                    <div class="data-management">
                        <button class="btn btn-warning" onclick="app.exportData()">
                            <span>📤</span> Export
                        </button>
                        <button class="btn btn-info" onclick="app.showBackupModal()">
                            <span>💾</span> Backup
                        </button>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div class="tab-grid tab-grid-2">
                        <div>
                            <label class="form-label">Filter by Wallet:</label>
                            <select id="filterWallet" class="form-control" onchange="app.applyFilters()">
                                <option value="">Semua Wallet</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Filter by Kategori:</label>
                            <select id="filterCategory" class="form-control" onchange="app.applyFilters()">
                                <option value="">Semua Kategori</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Dari Tanggal:</label>
                            <input type="date" id="filterDateFrom" class="form-control" onchange="app.applyFilters()">
                        </div>
                        <div>
                            <label class="form-label">Sampai Tanggal:</label>
                            <input type="date" id="filterDateTo" class="form-control" onchange="app.applyFilters()">
                        </div>
                    </div>
                </div>
                
                <div id="allTransactions"></div>
            </div>
        `;
        
        this.populateFilterOptions();
        this.renderAllTransactions();
    }

    populateFilterOptions() {
        const wallets = DB.getWallets();
        const categories = DB.getCategories();
        
        const walletSelect = document.getElementById('filterWallet');
        const categorySelect = document.getElementById('filterCategory');
        
        walletSelect.innerHTML = '<option value="">Semua Wallet</option>' +
            wallets.map(w => `<option value="${w.id}">${w.emoji} ${w.name}</option>`).join('');
            
        categorySelect.innerHTML = '<option value="">Semua Kategori</option>' +
            categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name} (${c.type})</option>`).join('');
            
        // Set default date range (last 30 days)
        const dateTo = new Date();
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 30);
        
        document.getElementById('filterDateFrom').value = dateFrom.toISOString().split('T')[0];
        document.getElementById('filterDateTo').value = dateTo.toISOString().split('T')[0];
    }

    applyFilters() {
        this.renderAllTransactions();
    }

    renderAllTransactions() {
        const walletFilter = document.getElementById('filterWallet').value;
        const categoryFilter = document.getElementById('filterCategory').value;
        const dateFrom = document.getElementById('filterDateFrom').value;
        const dateTo = document.getElementById('filterDateTo').value;
        
        let transactions = DB.getTransactions()
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Apply filters
        if (walletFilter) {
            transactions = transactions.filter(t => t.walletId === walletFilter);
        }
        
        if (categoryFilter) {
            transactions = transactions.filter(t => t.categoryId === categoryFilter);
        }
        
        if (dateFrom) {
            transactions = transactions.filter(t => t.date >= dateFrom);
        }
        
        if (dateTo) {
            transactions = transactions.filter(t => t.date <= dateTo);
        }
        
        const container = document.getElementById('allTransactions');
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🤷‍♀️</div>
                    <p>Tidak ada transaksi yang cocok dengan filter Anda.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => {
            const wallet = DB.getWallets().find(w => w.id === transaction.walletId);
            const category = DB.getCategories().find(c => c.id === transaction.categoryId);
            const typeClass = transaction.type;
            const amountPrefix = transaction.type === 'income' ? '+' : 
                               transaction.type === 'expense' ? '-' : '';

            return `
                <div class="transaction-item ${typeClass}" onclick="app.showEditTransactionModal('${transaction.id}')">
                    <div class="transaction-info">
                        <div class="transaction-category">${category?.emoji || ''} ${category?.name || 'Unknown'}</div>
                        <div class="transaction-wallet">${wallet?.name || 'Unknown'} • ${Utils.formatDateShort(transaction.date)}</div>
                        ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                    </div>
                    <div class="transaction-amount ${typeClass}">
                        ${amountPrefix}${Utils.formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderBudget(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🎯 Budget & Anggaran</h3>
                    <button class="btn btn-primary" onclick="app.showAddBudgetModal()">+ Tambah Budget</button>
                </div>
                <div id="budgetsList"></div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Progress Budget</h3>
                </div>
                <div id="budgetProgress"></div>
            </div>
        `;
        this.renderBudgets();
    }

    renderBudgets() {
        const budgets = DB.getBudgets();
        const container = document.getElementById('budgetsList');
        const progressContainer = document.getElementById('budgetProgress');
        
        if (budgets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🎯</div>
                    <p>Belum ada anggaran. Tambahkan satu!</p>
                </div>
            `;
            progressContainer.innerHTML = '';
            return;
        }

        // Calculate current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        container.innerHTML = budgets.map(budget => {
            const category = DB.getCategories().find(c => c.id === budget.categoryId);
            if (!category) return '';
            
            // Calculate spent amount for this budget
            const transactions = DB.getTransactions();
            const spent = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.categoryId === budget.categoryId &&
                           t.type === 'expense' &&
                           tDate.getMonth() === currentMonth &&
                           tDate.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + t.amount, 0);
                
            const remaining = budget.amount - spent;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const progressBarColor = percentage > 100 ? 'var(--danger-color)' : 
                                   percentage > 75 ? 'var(--warning-color)' : 'var(--success-color)';

            return `
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header">
                        <h4 class="card-title">${category.emoji} ${category.name}</h4>
                        <div>
                            <button class="btn btn-sm btn-info" onclick="app.showEditBudgetModal('${budget.id}')">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="app.deleteBudget('${budget.id}')">Hapus</button>
                        </div>
                    </div>
                    <p>Anggaran: ${Utils.formatCurrency(budget.amount)}</p>
                    <p>Terpakai: ${Utils.formatCurrency(spent)}</p>
                    <p>Sisa: <span style="color: ${remaining >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${Utils.formatCurrency(remaining)}</span></p>
                </div>
            `;
        }).join('');
        
        // Render budget progress
        progressContainer.innerHTML = budgets.map(budget => {
            const category = DB.getCategories().find(c => c.id === budget.categoryId);
            if (!category) return '';
            
            const transactions = DB.getTransactions();
            const spent = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.categoryId === budget.categoryId &&
                           t.type === 'expense' &&
                           tDate.getMonth() === currentMonth &&
                           tDate.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + t.amount, 0);
                
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const progressBarColor = percentage > 100 ? 'var(--danger-color)' : 
                                   percentage > 75 ? 'var(--warning-color)' : 'var(--success-color)';

            return `
                <div class="card progress-card">
                    <div class="card-header">
                        <h4 class="card-title">${category.emoji} ${category.name}</h4>
                        <span>${Math.round(percentage)}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%; background: ${progressBarColor};"></div>
                    </div>
                    <p class="progress-text">
                        ${Utils.formatCurrency(spent)} dari ${Utils.formatCurrency(budget.amount)}
                    </p>
                </div>
            `;
        }).join('');
    }

    renderReports(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Laporan Bulanan</h3>
                    <div>
                        <select id="reportMonth" class="form-control" style="width: auto; display: inline-block;">
                            ${this.generateMonthOptions()}
                        </select>
                        <select id="reportYear" class="form-control" style="width: auto; display: inline-block;">
                            ${this.generateYearOptions()}
                        </select>
                        <button class="btn btn-primary" onclick="app.generateReport()">
                            Generate
                        </button>
                    </div>
                </div>
                <div id="reportContent">
                    <div class="empty-state">
                        <div class="emoji">📈</div>
                        <p>Pilih bulan dan tahun untuk generate laporan</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📈 Charts & Analytics</h3>
                </div>
                <div id="chartsContainer">
                    <!-- Charts will be rendered here -->
                </div>
            </div>
        `;
        
        // Generate report for current month by default
        this.generateReport();
    }

    generateMonthOptions() {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const currentMonth = new Date().getMonth();
        return months.map((month, index) => `
            <option value="${index + 1}" ${index === currentMonth ? 'selected' : ''}>${month}</option>
        `).join('');
    }

    generateYearOptions() {
        const currentYear = new Date().getFullYear();
        let options = '';
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            options += `<option value="${i}" ${i === currentYear ? 'selected' : ''}>${i}</option>`;
        }
        return options;
    }

    generateReport() {
        const reportMonth = document.getElementById('reportMonth').value;
        const reportYear = document.getElementById('reportYear').value;
        const reportContentDiv = document.getElementById('reportContent');
        const chartsContainerDiv = document.getElementById('chartsContainer');

        if (!reportMonth || !reportYear || !reportContentDiv) return;

        const transactions = DB.getTransactions();
        const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() + 1 === parseInt(reportMonth) &&
                   transactionDate.getFullYear() === parseInt(reportYear);
        });

        if (filteredTransactions.length === 0) {
            reportContentDiv.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">😔</div>
                    <p>Tidak ada transaksi untuk bulan ini.</p>
                </div>
            `;
            if (chartsContainerDiv) chartsContainerDiv.innerHTML = '';
            return;
        }

        let totalIncome = 0;
        let totalExpense = 0;
        const categorySummary = {};

        filteredTransactions.forEach(t => {
            const category = DB.getCategoryById(t.categoryId);
            const categoryName = category ? category.name : 'Uncategorized';

            if (!categorySummary[categoryName]) {
                categorySummary[categoryName] = { income: 0, expense: 0 };
            }

            if (t.type === 'income') {
                totalIncome += t.amount;
                categorySummary[categoryName].income += t.amount;
            } else if (t.type === 'expense') {
                totalExpense += t.amount;
                categorySummary[categoryName].expense += t.amount;
            }
        });

        const netBalance = totalIncome - totalExpense;
        const monthName = new Date(reportYear, reportMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

        let reportHtml = `
            <div style="text-align: center; margin-bottom: var(--spacing-lg);">
                <p style="font-size: 18px; font-weight: 600;">Ringkasan untuk ${monthName}</p>
            </div>
            <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: var(--spacing-lg);">
                <div>
                    <p style="font-size: 14px; color: #666;">Total Pemasukan</p>
                    <p style="font-weight: bold; color: var(--success-color);">${Utils.formatCurrency(totalIncome)}</p>
                </div>
                <div>
                    <p style="font-size: 14px; color: #666;">Total Pengeluaran</p>
                    <p style="font-weight: bold; color: var(--danger-color);">${Utils.formatCurrency(totalExpense)}</p>
                </div>
                <div>
                    <p style="font-size: 14px; color: #666;">Saldo Bersih</p>
                    <p style="font-weight: bold; color: ${netBalance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${Utils.formatCurrency(netBalance)}</p>
                </div>
            </div>

            <h4>Ringkasan Kategori</h4>
            <ul style="list-style: none; padding: 0;">
                ${Object.entries(categorySummary).map(([catName, totals]) => `
                    <li style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #eee;">
                        <span>${catName}</span>
                        <span>
                            ${totals.income > 0 ? `<span style="color: var(--success-color); margin-right: 10px;">+${Utils.formatCurrency(totals.income)}</span>` : ''}
                            ${totals.expense > 0 ? `<span style="color: var(--danger-color);">- ${Utils.formatCurrency(totals.expense)}</span>` : ''}
                        </span>
                    </li>
                `).join('')}
            </ul>
        `;
        reportContentDiv.innerHTML = reportHtml;

        // Render charts
        if (chartsContainerDiv) {
            chartsContainerDiv.innerHTML = `
                <canvas id="expenseChart" width="400" height="200"></canvas>
                <canvas id="incomeExpenseChart" width="400" height="200"></canvas>
            `;
            
            // Expense by category chart
            const expenseData = {};
            filteredTransactions.forEach(t => {
                if (t.type === 'expense') {
                    const category = DB.getCategoryById(t.categoryId);
                    const categoryName = category ? category.name : 'Lainnya';
                    expenseData[categoryName] = (expenseData[categoryName] || 0) + t.amount;
                }
            });

            const expenseCtx = document.getElementById('expenseChart');
            if (expenseCtx && Object.keys(expenseData).length > 0) {
                new Chart(expenseCtx, {
                    type: 'pie',
                    data: {
                        labels: Object.keys(expenseData),
                        datasets: [{
                            data: Object.values(expenseData),
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900'],
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Pengeluaran Berdasarkan Kategori'
                            }
                        }
                    }
                });
            }

            // Income vs Expense chart (monthly trend)
            const monthlyData = {};
            filteredTransactions.forEach(t => {
                const month = t.date.substring(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = { income: 0, expense: 0 };
                }
                if (t.type === 'income') {
                    monthlyData[month].income += t.amount;
                } else if (t.type === 'expense') {
                    monthlyData[month].expense += t.amount;
                }
            });

            const sortedMonths = Object.keys(monthlyData).sort();
            const incomeChartData = sortedMonths.map(month => monthlyData[month].income);
            const expenseChartData = sortedMonths.map(month => monthlyData[month].expense);
            const incomeExpenseChartLabels = sortedMonths.map(month => {
                const [year, monthNum] = month.split('-');
                return new Date(year, monthNum - 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            });

            const incomeExpenseCtx = document.getElementById('incomeExpenseChart');
            if (incomeExpenseCtx) {
                new Chart(incomeExpenseCtx, {
                    type: 'bar',
                    data: {
                        labels: incomeExpenseChartLabels,
                        datasets: [
                            {
                                label: 'Pemasukan',
                                data: incomeChartData,
                                backgroundColor: 'rgba(46, 204, 113, 0.6)',
                                borderColor: 'rgba(46, 204, 113, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Pengeluaran',
                                data: expenseChartData,
                                backgroundColor: 'rgba(231, 76, 60, 0.6)',
                                borderColor: 'rgba(231, 76, 60, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Pemasukan vs Pengeluaran'
                            }
                        },
                        scales: {
                            x: {
                                stacked: false,
                            },
                            y: {
                                stacked: false,
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    }

renderCalendar(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🗓️ Kalender Transaksi</h3>
                <div>
                    <button class="btn btn-outline btn-sm" onclick="app.prevMonth()">← Prev</button>
                    <span id="currentMonthYear" style="margin: 0 15px;"></span>
                    <button class="btn btn-outline btn-sm" onclick="app.nextMonth()">Next →</button>
                </div>
            </div>
            <div id="calendarContainer"></div>
        </div>
    `;
    
    this.renderCalendarView();
}

prevMonth() {
    this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
    this.renderCalendarView();
}

nextMonth() {
    this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
    this.renderCalendarView();
}

renderCalendarView() {
    const calendarContainer = document.getElementById('calendarContainer');
    const currentMonthYearSpan = document.getElementById('currentMonthYear');
    
    if (!calendarContainer || !currentMonthYearSpan) return;

    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();

    currentMonthYearSpan.textContent = this.calendarDate.toLocaleDateString('id-ID', { 
        month: 'long', 
        year: 'numeric' 
    });

    // PERBAIKAN: Hitung dengan benar
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDay = firstDayOfMonth.getDay(); // 0=Minggu, 1=Senin, ..., 6=Sabtu
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    console.log(`Debug: ${year}-${month+1}, Hari pertama: ${firstDay} (0=Minggu), Jumlah hari: ${daysInMonth}`);

    let calendarHTML = `
        <div class="calendar-grid">
            <div class="calendar-day-header">Min</div>
            <div class="calendar-day-header">Sen</div>
            <div class="calendar-day-header">Sel</div>
            <div class="calendar-day-header">Rab</div>
            <div class="calendar-day-header">Kam</div>
            <div class="calendar-day-header">Jum</div>
            <div class="calendar-day-header">Sab</div>
    `;

    // HARI KOSONG: Untuk kalender Minggu pertama, langsung pakai firstDay
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    // Get transactions by date
    const transactionsByDate = {};
    DB.getTransactions().forEach(transaction => {
        if (!transactionsByDate[transaction.date]) {
            transactionsByDate[transaction.date] = [];
        }
        transactionsByDate[transaction.date].push(transaction);
    });

    // Days of the month - PERBAIKAN FORMAT TANGGAL
    for (let day = 1; day <= daysInMonth; day++) {
        // FIX: Buat dateString dengan format yang konsisten
        const yyyy = year;
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;
        
        const date = new Date(dateString);
        const today = new Date().toISOString().split('T')[0];
        const isToday = dateString === today;
        const dayTransactions = transactionsByDate[dateString] || [];

        const dayClass = isToday ? 'today' : '';
        let transactionDots = '';

        // Generate dots for transactions
        dayTransactions.slice(0, 4).forEach(transaction => {
            const typeClass = transaction.type === 'income' ? 'income' : 
                            transaction.type === 'expense' ? 'expense' : 'transfer';
            transactionDots += `<span class="transaction-dot ${typeClass}"></span>`;
        });
        
        if (dayTransactions.length > 4) {
            transactionDots += `<span class="transaction-dot more">...</span>`;
        }

        // FIX: Tambahkan debug info dan pastikan onclick bekerja
        calendarHTML += `
            <div class="calendar-day ${dayClass}" 
                 data-date="${dateString}" 
                 onclick="app.showDayTransactions('${dateString}')"
                 title="Klik untuk lihat transaksi ${dd}/${mm}/${yyyy}">
                <div class="day-number">${day}</div>
                <div class="day-transactions">${transactionDots}</div>
            </div>
        `;
    }

    // Fill remaining empty cells
    const totalCells = 42;
    const filledCells = firstDay + daysInMonth;
    for (let i = filledCells; i < totalCells; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    calendarHTML += `</div>`;
    calendarContainer.innerHTML = calendarHTML;
}

showDayTransactions(dateString) {
    console.log('🟡 DEBUG: User klik tanggal:', dateString);
    
    // Validasi dateString
    if (!dateString || dateString === 'undefined' || !dateString.includes('-')) {
        console.error('❌ Tanggal tidak valid:', dateString);
        Utils.showToast('Tanggal tidak valid', 'error');
        return;
    }

    // Pastikan format konsisten
    const transactions = DB.getTransactions().filter(t => {
        console.log('🔍 Comparing:', t.date, 'with', dateString);
        return t.date === dateString;
    });
    
    console.log('✅ Ditemukan transaksi:', transactions.length, 'untuk tanggal:', dateString);

    if (transactions.length === 0) {
        const formattedDate = Utils.formatDate(dateString);
        Utils.showToast(`Tidak ada transaksi pada ${formattedDate}`, 'info');
        return;
    }

    const transactionsHTML = transactions.map(transaction => {
        const wallet = DB.getWallets().find(w => w.id === transaction.walletId);
        const category = DB.getCategories().find(c => c.id === transaction.categoryId);
        const typeClass = transaction.type;
        const amountPrefix = transaction.type === 'income' ? '+' : 
                           transaction.type === 'expense' ? '-' : '';

        return `
            <div class="transaction-item ${typeClass}" onclick="app.showEditTransactionModal('${transaction.id}')">
                <div class="transaction-info">
                    <div class="transaction-category">${category?.emoji || ''} ${category?.name || 'Unknown'}</div>
                    <div class="transaction-wallet">${wallet?.name || 'Unknown'}</div>
                    ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                </div>
                <div class="transaction-amount ${typeClass}">
                    ${amountPrefix}${Utils.formatCurrency(transaction.amount)}
                </div>
            </div>
        `;
    }).join('');

    const formattedDate = Utils.formatDate(dateString);
    const content = `
        <div style="max-height: 400px; overflow-y: auto;">
            <h4 style="margin-bottom: 15px; text-align: center;">Transaksi pada ${formattedDate}</h4>
            ${transactionsHTML}
            <div style="text-align: center; margin-top: 15px;">
                <button class="btn btn-secondary" onclick="Utils.closeModal('dayTransactionsModal')" style="width: 100%;">Tutup</button>
            </div>
        </div>
    `;

    Utils.createModal('dayTransactionsModal', `Transaksi ${formattedDate}`, content);
    Utils.openModal('dayTransactionsModal');
}

    renderSettings(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⚙️ Pengaturan Aplikasi</h3>
                </div>
                
                <div class="tab-grid tab-grid-2">
                    <div>
                        <h4>💾 Data Management</h4>
                        <div class="data-management">
                            <button class="btn btn-warning" onclick="app.exportData()">
                                <span>📤</span> Export CSV
                            </button>
                            <button class="btn btn-info" onclick="app.downloadBackup()">
                                <span>💾</span> Backup Data
                            </button>
                        </div>
                        <div class="data-management">
                            <label class="file-input-label btn btn-primary">
                                <span>📁</span> Restore Backup
                                <input type="file" id="restoreFile" class="file-input" accept=".json" onchange="app.restoreBackup(event)">
                            </label>
                            <label class="file-input-label btn btn-primary">
                                <span>📄</span> Import CSV
                                <input type="file" id="csvFile" class="file-input" accept=".csv" onchange="app.importFromCSV(event)">
                            </label>
                        </div>
                        <button class="btn btn-danger" style="width: 100%; margin-top: 10px;" onclick="app.confirmClearAllData()">
                            <span>🗑️</span> Hapus Semua Data
                        </button>
                    </div>
                    
                    <div>
                        <h4>🏷️ Kelola Kategori</h4>
                        <div id="categoriesManagement"></div>
                        <button class="btn btn-primary" onclick="app.showAddCategoryModal()" style="width: 100%; margin-top: 10px;">
                            + Tambah Kategori
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ℹ️ Informasi Aplikasi</h3>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🤖</div>
                    <h3>Finance Super App</h3>
                    <p style="color: #666; margin-bottom: 15px;">Aplikasi manajemen keuangan offline</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                        <p><strong>Total Transaksi:</strong> <span id="totalTransactionsCount">0</span></p>
                        <p><strong>Total Wallet:</strong> <span id="totalWalletsCount">0</span></p>
                        <p><strong>Versi:</strong> 1.0.0</p>
                    </div>
                </div>
            </div>
        `;
        
        this.renderCategoriesManagement();
        this.updateAppInfo();
    }

    renderCategoriesManagement() {
        const categories = DB.getCategories();
        const container = document.getElementById('categoriesManagement');
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🏷️</div>
                    <p>Belum ada kategori. Tambahkan satu!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <ul style="list-style: none; padding: 0;">
                ${categories.map(cat => `
                    <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
                        <span>${cat.emoji} ${cat.name} (${cat.type})</span>
                        <div>
                            <button class="btn btn-sm btn-info" onclick="app.showEditCategoryModal('${cat.id}')" style="margin-right: 5px;">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="app.confirmDeleteCategory('${cat.id}')">Hapus</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    updateAppInfo() {
        document.getElementById('totalTransactionsCount').textContent = DB.getTransactions().length;
        document.getElementById('totalWalletsCount').textContent = DB.getWallets().length;
    }

    // === MODAL METHODS ===
    showAddWalletModal() {
        const content = `
            <form id="addWalletForm">
                <div class="form-group">
                    <label class="form-label">Nama Dompet</label>
                    <input type="text" class="form-control" id="walletName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Saldo Awal</label>
                    <input type="number" class="form-control" id="walletBalance" value="0" min="0" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Emoji</label>
                    <input type="text" class="form-control" id="walletEmoji" value="💰" maxlength="2">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Dompet</button>
            </form>
        `;

        Utils.createModal('addWalletModal', 'Tambah Dompet', content);
        Utils.openModal('addWalletModal');

        document.getElementById('addWalletForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('walletName').value;
            const balance = parseFloat(document.getElementById('walletBalance').value);
            const emoji = document.getElementById('walletEmoji').value;

            const wallets = DB.getWallets();
            wallets.push({
                id: Utils.generateId(),
                name,
                balance,
                emoji
            });
            
            if (DB.saveWallets(wallets)) {
                Utils.closeModal('addWalletModal');
                this.renderWalletsList();
                this.updateTotalBalance();
                this.updateAppInfo();
                Utils.showToast('Dompet berhasil ditambahkan!', 'success');
            }
        };
    }

    showEditWalletModal(walletId) {
        const wallet = DB.getWallets().find(w => w.id === walletId);
        if (!wallet) return;

        const content = `
            <form id="editWalletForm">
                <div class="form-group">
                    <label class="form-label">Nama Dompet</label>
                    <input type="text" class="form-control" id="editWalletName" value="${wallet.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Saldo</label>
                    <input type="number" class="form-control" id="editWalletBalance" value="${wallet.balance}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Emoji</label>
                    <input type="text" class="form-control" id="editWalletEmoji" value="${wallet.emoji}" maxlength="2">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: var(--spacing-sm);">Simpan Perubahan</button>
                <button type="button" class="btn btn-danger" style="width: 100%;" onclick="app.confirmDeleteWallet('${wallet.id}')">Hapus Dompet</button>
            </form>
        `;

        Utils.createModal('editWalletModal', 'Edit Dompet', content);
        Utils.openModal('editWalletModal');

        document.getElementById('editWalletForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('editWalletName').value;
            const balance = parseFloat(document.getElementById('editWalletBalance').value);
            const emoji = document.getElementById('editWalletEmoji').value;

            const wallets = DB.getWallets().map(w => 
                w.id === walletId ? { ...w, name, balance, emoji } : w
            );
            
            if (DB.saveWallets(wallets)) {
                Utils.closeModal('editWalletModal');
                this.renderWalletsList();
                this.updateTotalBalance();
                Utils.showToast('Dompet berhasil diperbarui!', 'success');
            }
        };
    }

    confirmDeleteWallet(walletId) {
        if (confirm('Apakah Anda yakin ingin menghapus dompet ini? Semua transaksi terkait juga akan dihapus.')) {
            let wallets = DB.getWallets().filter(w => w.id !== walletId);
            let transactions = DB.getTransactions().filter(t => t.walletId !== walletId);
            
            if (DB.saveWallets(wallets) && DB.saveTransactions(transactions)) {
                Utils.closeModal('editWalletModal');
                this.renderWalletsList();
                this.renderRecentTransactions();
                this.renderAllTransactions();
                this.updateTotalBalance();
                this.updateAppInfo();
                Utils.showToast('Dompet dan transaksi terkait berhasil dihapus.', 'success');
            }
        }
    }

    showAddTransactionModal() {
        const wallets = DB.getWallets();
        const categories = DB.getCategories();

        if (wallets.length === 0) {
            Utils.showToast('Tambahkan dompet terlebih dahulu!', 'error');
            this.showAddWalletModal();
            return;
        }

        if (categories.length === 0) {
            Utils.showToast('Tambahkan kategori terlebih dahulu!', 'error');
            this.showAddCategoryModal();
            return;
        }

        const walletOptions = wallets.map(w => 
            `<option value="${w.id}">${w.emoji} ${w.name}</option>`
        ).join('');

        const categoryOptions = categories.map(c => 
            `<option value="${c.id}">${c.emoji} ${c.name}</option>`
        ).join('');

        const content = `
            <form id="addTransactionForm">
                <div class="form-group">
                    <label class="form-label">Tipe Transaksi</label>
                    <select class="form-control" id="transactionType" required>
                        <option value="expense">Pengeluaran</option>
                        <option value="income">Pemasukan</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Jumlah</label>
                    <input type="number" class="form-control" id="transactionAmount" required min="1">
                </div>
                <div class="form-group">
                    <label class="form-label">Dompet</label>
                    <select class="form-control" id="transactionWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <select class="form-control" id="transactionCategory" required>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Tanggal</label>
                    <input type="date" class="form-control" id="transactionDate" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan (opsional)</label>
                    <input type="text" class="form-control" id="transactionNotes">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Transaksi</button>
            </form>
        `;

        Utils.createModal('addTransactionModal', 'Tambah Transaksi', content);
        Utils.openModal('addTransactionModal');

        document.getElementById('addTransactionForm').onsubmit = (e) => {
            e.preventDefault();
            const type = document.getElementById('transactionType').value;
            const amount = parseFloat(document.getElementById('transactionAmount').value);
            const walletId = document.getElementById('transactionWallet').value;
            const categoryId = document.getElementById('transactionCategory').value;
            const date = document.getElementById('transactionDate').value;
            const notes = document.getElementById('transactionNotes').value;

            // Validation
            if (isNaN(amount) || amount <= 0) {
                Utils.showToast('Jumlah harus lebih dari 0', 'error');
                return;
            }

            // Update wallet balance
            const wallets = DB.getWallets();
            const wallet = wallets.find(w => w.id === walletId);
            if (wallet) {
                if (type === 'income') {
                    wallet.balance += amount;
                } else {
                    if (wallet.balance < amount) {
                        Utils.showToast('Saldo dompet tidak mencukupi!', 'error');
                        return;
                    }
                    wallet.balance -= amount;
                }
                
                if (!DB.saveWallets(wallets)) return;
            }

            // Add transaction
            const transactions = DB.getTransactions();
            transactions.push({
                id: Utils.generateId(),
                type,
                amount,
                walletId,
                categoryId,
                date,
                notes,
                createdAt: new Date().toISOString()
            });
            
            if (DB.saveTransactions(transactions)) {
                Utils.closeModal('addTransactionModal');
                this.renderRecentTransactions();
                this.renderAllTransactions();
                this.renderWalletsList();
                this.updateTotalBalance();
                this.updateAppInfo();
                Utils.showToast('Transaksi berhasil ditambahkan!', 'success');
            }
        };
    }

    showEditTransactionModal(transactionId) {
        const transaction = DB.getTransactions().find(t => t.id === transactionId);
        if (!transaction) return;

        const wallets = DB.getWallets();
        const categories = DB.getCategories();

        const walletOptions = wallets.map(w => 
            `<option value="${w.id}" ${w.id === transaction.walletId ? 'selected' : ''}>${w.emoji} ${w.name}</option>`
        ).join('');

        const categoryOptions = categories.map(c => 
            `<option value="${c.id}" ${c.id === transaction.categoryId ? 'selected' : ''}>${c.emoji} ${c.name}</option>`
        ).join('');

        const content = `
            <form id="editTransactionForm">
                <div class="form-group">
                    <label class="form-label">Tipe Transaksi</label>
                    <select class="form-control" id="editTransactionType" required>
                        <option value="expense" ${transaction.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
                        <option value="income" ${transaction.type === 'income' ? 'selected' : ''}>Pemasukan</option>
                        <option value="transfer" ${transaction.type === 'transfer' ? 'selected' : ''}>Transfer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Jumlah</label>
                    <input type="number" class="form-control" id="editTransactionAmount" value="${transaction.amount}" min="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Dompet</label>
                    <select class="form-control" id="editTransactionWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <select class="form-control" id="editTransactionCategory" required>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Tanggal</label>
                    <input type="date" class="form-control" id="editTransactionDate" value="${transaction.date}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan (opsional)</label>
                    <input type="text" class="form-control" id="editTransactionNotes" value="${transaction.notes || ''}">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: var(--spacing-sm);">Simpan Perubahan</button>
                <button type="button" class="btn btn-danger" style="width: 100%;" onclick="app.confirmDeleteTransaction('${transaction.id}')">Hapus Transaksi</button>
            </form>
        `;

        Utils.createModal('editTransactionModal', 'Edit Transaksi', content);
        Utils.openModal('editTransactionModal');

        document.getElementById('editTransactionForm').onsubmit = (e) => {
            e.preventDefault();
            const type = document.getElementById('editTransactionType').value;
            const amount = parseFloat(document.getElementById('editTransactionAmount').value);
            const walletId = document.getElementById('editTransactionWallet').value;
            const categoryId = document.getElementById('editTransactionCategory').value;
            const date = document.getElementById('editTransactionDate').value;
            const notes = document.getElementById('editTransactionNotes').value;

            // Validation
            if (isNaN(amount) || amount <= 0) {
                Utils.showToast('Jumlah harus lebih dari 0', 'error');
                return;
            }

            // Revert old transaction effect on wallet
            const oldWallet = DB.getWallets().find(w => w.id === transaction.walletId);
            if (oldWallet) {
                if (transaction.type === 'income') {
                    oldWallet.balance -= transaction.amount;
                } else if (transaction.type === 'expense') {
                    oldWallet.balance += transaction.amount;
                }
                
                if (!DB.saveWallets(DB.getWallets().map(w => 
                    w.id === oldWallet.id ? oldWallet : w
                ))) return;
            }

            // Apply new transaction effect on wallet
            const newWallet = DB.getWallets().find(w => w.id === walletId);
            if (newWallet) {
                if (type === 'income') {
                    newWallet.balance += amount;
                } else if (type === 'expense') {
                    if (newWallet.balance < amount) {
                        Utils.showToast('Saldo dompet tidak mencukupi!', 'error');
                        // Revert changes
                        if (oldWallet) {
                            if (transaction.type === 'income') {
                                oldWallet.balance += transaction.amount;
                            } else if (transaction.type === 'expense') {
                                oldWallet.balance -= transaction.amount;
                            }
                            DB.saveWallets(DB.getWallets().map(w => 
                                w.id === oldWallet.id ? oldWallet : w
                            ));
                        }
                        return;
                    }
                    newWallet.balance -= amount;
                }
                
                if (!DB.saveWallets(DB.getWallets().map(w => 
                    w.id === newWallet.id ? newWallet : w
                ))) return;
            }

            // Update transaction
            const transactions = DB.getTransactions().map(t => 
                t.id === transactionId ? { 
                    ...t, 
                    type, 
                    amount, 
                    walletId, 
                    categoryId, 
                    date, 
                    notes 
                } : t
            );
            
            if (DB.saveTransactions(transactions)) {
                Utils.closeModal('editTransactionModal');
                this.renderRecentTransactions();
                this.renderAllTransactions();
                this.renderWalletsList();
                this.updateTotalBalance();
                this.updateAppInfo();
                Utils.showToast('Transaksi berhasil diperbarui!', 'success');
            }
        };
    }

    confirmDeleteTransaction(transactionId) {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            const transaction = DB.getTransactions().find(t => t.id === transactionId);
            if (!transaction) return;

            // Revert transaction effect on wallet
            const wallet = DB.getWallets().find(w => w.id === transaction.walletId);
            if (wallet) {
                if (transaction.type === 'income') {
                    wallet.balance -= transaction.amount;
                } else if (transaction.type === 'expense') {
                    wallet.balance += transaction.amount;
                }
                
                if (!DB.saveWallets(DB.getWallets().map(w => 
                    w.id === wallet.id ? wallet : w
                ))) return;
            }

            // Delete transaction
            const transactions = DB.getTransactions().filter(t => t.id !== transactionId);
            
            if (DB.saveTransactions(transactions)) {
                Utils.closeModal('editTransactionModal');
                this.renderRecentTransactions();
                this.renderAllTransactions();
                this.renderWalletsList();
                this.updateTotalBalance();
                this.updateAppInfo();
                Utils.showToast('Transaksi berhasil dihapus!', 'success');
            }
        }
    }

    showAddCategoryModal() {
        const content = `
            <form id="addCategoryForm">
                <div class="form-group">
                    <label class="form-label">Nama Kategori</label>
                    <input type="text" class="form-control" id="categoryName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Tipe</label>
                    <select class="form-control" id="categoryType" required>
                        <option value="expense">Pengeluaran</option>
                        <option value="income">Pemasukan</option>
                        <option value="transfer">Transfer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Emoji</label>
                    <input type="text" class="form-control" id="categoryEmoji" value="🏷️" maxlength="2">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Kategori</button>
            </form>
        `;

        Utils.createModal('addCategoryModal', 'Tambah Kategori', content);
        Utils.openModal('addCategoryModal');

        document.getElementById('addCategoryForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('categoryName').value;
            const type = document.getElementById('categoryType').value;
            const emoji = document.getElementById('categoryEmoji').value;

            const categories = DB.getCategories();
            categories.push({
                id: Utils.generateId(),
                name,
                type,
                emoji
            });
            
            if (DB.saveCategories(categories)) {
                Utils.closeModal('addCategoryModal');
                this.renderCategoriesManagement();
                this.updateAppInfo();
                Utils.showToast('Kategori berhasil ditambahkan!', 'success');
            }
        };
    }

    showEditCategoryModal(categoryId) {
        const category = DB.getCategories().find(c => c.id === categoryId);
        if (!category) return;

        const content = `
            <form id="editCategoryForm">
                <div class="form-group">
                    <label class="form-label">Nama Kategori</label>
                    <input type="text" class="form-control" id="editCategoryName" value="${category.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Tipe</label>
                    <select class="form-control" id="editCategoryType" required>
                        <option value="expense" ${category.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
                        <option value="income" ${category.type === 'income' ? 'selected' : ''}>Pemasukan</option>
                        <option value="transfer" ${category.type === 'transfer' ? 'selected' : ''}>Transfer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Emoji</label>
                    <input type="text" class="form-control" id="editCategoryEmoji" value="${category.emoji}" maxlength="2">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: var(--spacing-sm);">Simpan Perubahan</button>
                <button type="button" class="btn btn-danger" style="width: 100%;" onclick="app.confirmDeleteCategory('${category.id}')">Hapus Kategori</button>
            </form>
        `;

        Utils.createModal('editCategoryModal', 'Edit Kategori', content);
        Utils.openModal('editCategoryModal');

        document.getElementById('editCategoryForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('editCategoryName').value;
            const type = document.getElementById('editCategoryType').value;
            const emoji = document.getElementById('editCategoryEmoji').value;

            const categories = DB.getCategories().map(c => 
                c.id === categoryId ? { ...c, name, type, emoji } : c
            );
            
            if (DB.saveCategories(categories)) {
                Utils.closeModal('editCategoryModal');
                this.renderCategoriesManagement();
                Utils.showToast('Kategori berhasil diperbarui!', 'success');
            }
        };
    }

    confirmDeleteCategory(categoryId) {
        if (confirm('Hapus kategori ini?')) {
            this.deleteCategory(categoryId);
        }
    }

    deleteCategory(categoryId) {
        if (confirm('Hapus kategori ini?')) {
            const categories = DB.getCategories().filter(c => c.id !== categoryId);
            
            if (DB.saveCategories(categories)) {
                this.renderCategoriesManagement();
                this.updateAppInfo();
                Utils.showToast('Kategori berhasil dihapus!', 'success');
            }
        }
    }

    showAddBudgetModal() {
        const categories = DB.getCategories().filter(c => c.type === 'expense');
        
        if (categories.length === 0) {
            Utils.showToast('Tambahkan kategori pengeluaran terlebih dahulu!', 'error');
            this.showAddCategoryModal();
            return;
        }

        const categoryOptions = categories.map(c => 
            `<option value="${c.id}">${c.emoji} ${c.name}</option>`
        ).join('');

        const content = `
            <form id="addBudgetForm">
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <select class="form-control" id="budgetCategory" required>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Jumlah Anggaran (Bulanan)</label>
                    <input type="number" class="form-control" id="budgetAmount" required min="1">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Budget</button>
            </form>
        `;

        Utils.createModal('addBudgetModal', 'Tambah Budget', content);
        Utils.openModal('addBudgetModal');

        document.getElementById('addBudgetForm').onsubmit = (e) => {
            e.preventDefault();
            const categoryId = document.getElementById('budgetCategory').value;
            const amount = parseFloat(document.getElementById('budgetAmount').value);

            // Check if budget already exists for this category
            const existingBudget = DB.getBudgets().find(b => b.categoryId === categoryId);
            if (existingBudget) {
                Utils.showToast('Budget untuk kategori ini sudah ada!', 'error');
                return;
            }

            const budgets = DB.getBudgets();
            budgets.push({
                id: Utils.generateId(),
                categoryId,
                amount,
                period: 'monthly'
            });
            
            if (DB.saveBudgets(budgets)) {
                Utils.closeModal('addBudgetModal');
                this.renderBudgets();
                Utils.showToast('Budget berhasil ditambahkan!', 'success');
            }
        };
    }

    showEditBudgetModal(budgetId) {
        const budget = DB.getBudgets().find(b => b.id === budgetId);
        if (!budget) return;

        const category = DB.getCategories().find(c => c.id === budget.categoryId);
        if (!category) return;

        const content = `
            <form id="editBudgetForm">
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <input type="text" class="form-control" value="${category.emoji} ${category.name}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Jumlah Anggaran (Bulanan)</label>
                    <input type="number" class="form-control" id="editBudgetAmount" value="${budget.amount}" min="1" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: var(--spacing-sm);">Simpan Perubahan</button>
                <button type="button" class="btn btn-danger" style="width: 100%;" onclick="app.deleteBudget('${budget.id}')">Hapus Budget</button>
            </form>
        `;

        Utils.createModal('editBudgetModal', 'Edit Budget', content);
        Utils.openModal('editBudgetModal');

        document.getElementById('editBudgetForm').onsubmit = (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('editBudgetAmount').value);

            const budgets = DB.getBudgets().map(b => 
                b.id === budgetId ? { ...b, amount } : b
            );
            
            if (DB.saveBudgets(budgets)) {
                Utils.closeModal('editBudgetModal');
                this.renderBudgets();
                Utils.showToast('Budget berhasil diperbarui!', 'success');
            }
        };
    }

    deleteBudget(budgetId) {
        if (confirm('Hapus budget ini?')) {
            const budgets = DB.getBudgets().filter(b => b.id !== budgetId);
            
            if (DB.saveBudgets(budgets)) {
                this.renderBudgets();
                Utils.showToast('Budget berhasil dihapus!', 'success');
            }
        }
    }

    showTransferModal() {
        const wallets = DB.getWallets();
        
        if (wallets.length < 2) {
            Utils.showToast('Anda perlu setidaknya 2 dompet untuk transfer!', 'error');
            return;
        }

        const walletOptions = wallets.map(w => 
            `<option value="${w.id}">${w.emoji} ${w.name}</option>`
        ).join('');

        const content = `
            <form id="transferForm">
                <div class="form-group">
                    <label class="form-label">Dari Dompet</label>
                    <select class="form-control" id="transferFrom" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Ke Dompet</label>
                    <select class="form-control" id="transferTo" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Jumlah Transfer</label>
                    <input type="number" class="form-control" id="transferAmount" required min="1">
                </div>
                <div class="form-group">
                    <label class="form-label">Tanggal</label>
                    <input type="date" class="form-control" id="transferDate" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan (opsional)</label>
                    <input type="text" class="form-control" id="transferNotes">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Lakukan Transfer</button>
            </form>
        `;

        Utils.createModal('transferModal', 'Transfer Dana', content);
        Utils.openModal('transferModal');

        // Prevent same wallet selection
        const fromSelect = document.getElementById('transferFrom');
        const toSelect = document.getElementById('transferTo');
        
        fromSelect.addEventListener('change', () => {
            if (fromSelect.value === toSelect.value) {
                toSelect.value = '';
            }
        });
        
        toSelect.addEventListener('change', () => {
            if (toSelect.value === fromSelect.value) {
                fromSelect.value = '';
            }
        });

        document.getElementById('transferForm').onsubmit = (e) => {
            e.preventDefault();
            const fromWalletId = document.getElementById('transferFrom').value;
            const toWalletId = document.getElementById('transferTo').value;
            const amount = parseFloat(document.getElementById('transferAmount').value);
            const date = document.getElementById('transferDate').value;
            const notes = document.getElementById('transferNotes').value;

            if (fromWalletId === toWalletId) {
                Utils.showToast('Tidak bisa transfer ke dompet yang sama!', 'error');
                return;
            }

            const fromWallet = DB.getWallets().find(w => w.id === fromWalletId);
            const toWallet = DB.getWallets().find(w => w.id === toWalletId);

            if (!fromWallet || !toWallet) {
                Utils.showToast('Dompet tidak ditemukan!', 'error');
                return;
            }

            if (fromWallet.balance < amount) {
                Utils.showToast('Saldo dompet asal tidak mencukupi!', 'error');
                return;
            }

            // Update wallet balances
            fromWallet.balance -= amount;
            toWallet.balance += amount;
            
            if (!DB.saveWallets(DB.getWallets().map(w => {
                if (w.id === fromWalletId) return fromWallet;
                if (w.id === toWalletId) return toWallet;
                return w;
            }))) return;

            // Get transfer category or create one
            let transferCategory = DB.getCategories().find(c => c.name === 'Transfer' && c.type === 'transfer');
            if (!transferCategory) {
                transferCategory = {
                    id: Utils.generateId(),
                    name: 'Transfer',
                    type: 'transfer',
                    emoji: '🔄'
                };
                const categories = DB.getCategories();
                categories.push(transferCategory);
                if (!DB.saveCategories(categories)) return;
            }

            // Add transfer transactions
            const transactions = DB.getTransactions();
            transactions.push({
                id: Utils.generateId(),
                type: 'transfer',
                amount: amount,
                walletId: fromWalletId,
                categoryId: transferCategory.id,
                date: date,
                notes: `Transfer ke ${toWallet.name}` + (notes ? ` - ${notes}` : ''),
                createdAt: new Date().toISOString()
            });
            
            transactions.push({
                id: Utils.generateId(),
                type: 'transfer',
                amount: amount,
                walletId: toWalletId,
                categoryId: transferCategory.id,
                date: date,
                notes: `Transfer dari ${fromWallet.name}` + (notes ? ` - ${notes}` : ''),
                createdAt: new Date().toISOString()
            });
            
            if (DB.saveTransactions(transactions)) {
                Utils.closeModal('transferModal');
                this.renderRecentTransactions();
                this.renderAllTransactions();
                this.renderWalletsList();
                this.updateTotalBalance();
                this.updateAppInfo();
                Utils.showToast('Transfer berhasil!', 'success');
            }
        };
    }

    showBackupModal() {
        const content = `
            <p>Backup data Anda untuk keamanan.</p>
            <button class="btn btn-primary" style="width: 100%; margin-bottom: var(--spacing-sm);" onclick="app.downloadBackup()">
                💾 Download Backup
            </button>
            <label class="btn btn-outline" style="width: 100%; display: block; text-align: center;">
                📁 Restore Backup
                <input type="file" id="restoreFile" accept=".json" style="display: none;" onchange="app.restoreBackup(event)">
            </label>
        `;

        Utils.createModal('backupModal', 'Backup Data', content);
        Utils.openModal('backupModal');
    }

    downloadBackup() {
        if (DB.backupData()) {
            Utils.closeModal('backupModal');
            Utils.showToast('Backup berhasil diunduh!', 'success');
        }
    }

    restoreBackup(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (DB.restoreData(e.target.result)) {
                Utils.closeModal('backupModal');
                this.render();
                this.updateTotalBalance();
                this.updateAppInfo();
                Utils.showToast('Data berhasil dipulihkan!', 'success');
            } else {
                Utils.showToast('Gagal memulihkan data! File tidak valid.', 'error');
            }
        };
        reader.readAsText(file);
    }

    exportData() {
        this.downloadBackup();
    }

    importFromCSV(event) {
        // Placeholder for CSV import functionality
        Utils.showToast('Fitur import CSV sedang dalam pengembangan', 'info');
    }

    confirmClearAllData() {
        if (confirm('HAPUS SEMUA DATA? Tindakan ini tidak dapat dibatalkan!')) {
            if (confirm('Anda yakin? Semua data akan hilang permanen!')) {
                localStorage.clear();
                DB.init();
                this.render();
                this.updateTotalBalance();
                this.updateAppInfo();
                Utils.showToast('Data berhasil direset!', 'success');
            }
        }
    }

    render() {
        this.renderTabContent(this.currentTab);
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FinanceApp();
    window.app = app;
});
