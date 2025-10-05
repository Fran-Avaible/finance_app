// ===== MAIN APP =====
class FinanceApp {
// Di FinanceApp constructor, tambahkan:
constructor() {
    this.currentTab = 'dashboard';
    this.calendarDate = new Date();
    this.budgetSubTab = 'budget';
    this.liabilitiesSubTab = 'liabilities';
    this.init();
}

// Di method init(), tambahkan:
init() {
    DB.init();
    this.setupEventListeners();
    Utils.initTheme(); // Initialize theme
    this.render();
    this.updateTotalBalance();
}

// Tambahkan method untuk settings theme
renderThemeSettings() {
    const currentTheme = Utils.getTheme();
    
    return `
        <div class="form-group">
            <label class="form-label">🎨 Tampilan</label>
            <div style="display: flex; gap: 10px;">
                <button class="btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-outline'}" 
                        onclick="app.changeTheme('light')" style="flex: 1;">
                    ☀️ Mode Terang
                </button>
                <button class="btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-outline'}" 
                        onclick="app.changeTheme('dark')" style="flex: 1;">
                    🌙 Mode Gelap
                </button>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
            <div style="text-align: center; padding: 10px; background: ${currentTheme === 'light' ? '#ffffff' : '#2d2d2d'}; border-radius: 8px; border: 2px solid ${currentTheme === 'light' ? '#667eea' : 'transparent'};">
                <div style="font-size: 24px;">☀️</div>
                <div style="font-size: 12px; margin-top: 5px;">Terang</div>
            </div>
            <div style="text-align: center; padding: 10px; background: ${currentTheme === 'dark' ? '#2d2d2d' : '#1a1a1a'}; border-radius: 8px; border: 2px solid ${currentTheme === 'dark' ? '#7c93fb' : 'transparent'}; color: white;">
                <div style="font-size: 24px;">🌙</div>
                <div style="font-size: 12px; margin-top: 5px;">Gelap</div>
            </div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: var(--light-color); border-radius: 8px;">
            <p style="font-size: 12px; margin: 0; color: var(--text-color);">
                💡 <strong>Tips:</strong> Mode gelap lebih nyaman di malam hari dan menghemat baterai
            </p>
        </div>
    `;
}

// Method untuk ganti theme
changeTheme(theme) {
    Utils.setTheme(theme);
    Utils.showToast(`Mode ${theme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
    
    // Re-render settings tab untuk update tombol active state
    if (this.currentTab === 'settings') {
        this.renderSettings(document.getElementById('settings-tab'));
    }
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
            case 'gold':
                this.renderGold(tabContent);
                break;
            case 'liabilities':
                this.renderLiabilities(tabContent);
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
                    <button class="btn btn-warning" onclick="app.exportToCSV()">
                        <span>📤</span> Export CSV
                    </button>
                    <button class="btn btn-info" onclick="app.downloadBackup()">
                        <span>💾</span> Backup
                    </button>
                </div>
            </div>
            
            <!-- Filter section tetap sama -->
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

// ===== GOLD FEATURE METHODS =====

// ===== GOLD FEATURE IN APP.JS =====

// Tambahkan method ini di FinanceApp class

// Method utama render gold tab
renderGold(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">💰 Harga Emas Hari Ini</h3>
                <div>
                    <button class="btn btn-outline btn-sm" onclick="app.updateGoldPrice()">🔄 Update</button>
                    <button class="btn btn-outline btn-sm" onclick="app.forceRefreshGoldDisplay()">🔍 Refresh Display</button>
                </div>
            </div>
            <div id="goldPriceDisplay">
                <!-- Harga akan diisi oleh updateGoldPriceDisplay -->
            </div>
        </div>

        <div class="quick-actions">
            <button class="btn btn-primary" onclick="app.showBuyGoldModal()">
                <span>🛒</span> Beli Emas
            </button>
            <button class="btn btn-secondary" onclick="app.showSellGoldModal()">
                <span>💰</span> Jual Emas
            </button>
            <button class="btn btn-success" onclick="app.showGoldCalculator()">
                <span>🧮</span> Kalkulator
            </button>
            <button class="btn btn-outline" onclick="app.showAddGoldWalletModal()">
                <span>🏦</span> Dompet Emas
            </button>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🏦 Portfolio Emas Saya</h3>
            </div>
            <div id="goldPortfolio">
                <!-- Portfolio akan diisi oleh renderGoldPortfolio -->
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📊 Ringkasan Investasi</h3>
            </div>
            <div id="goldSummary">
                <!-- Summary akan diisi oleh renderGoldSummary -->
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📝 Riwayat Transaksi Emas</h3>
            </div>
            <div id="goldTransactions">
                <!-- Transactions akan diisi oleh renderGoldTransactions -->
            </div>
        </div>
    `;

    // Panggil fungsi untuk mengisi data
    this.updateGoldPriceDisplay();
    this.renderGoldPortfolio();
    this.renderGoldSummary();
    this.renderGoldTransactions();
}

// Method untuk update harga emas - SUDAH DIPERBAIKI
async updateGoldPrice() {
    try {
        Utils.showToast('Mengambil harga terbaru dari Pegadaian...', 'info');
        
        const newPrice = await DB.fetchPegadaianGoldPrice();
        
        // SIMPAN harga baru ke database
        DB.saveGoldPrice(newPrice);
        
        this.updateGoldPriceDisplay();
        Utils.showToast('Harga emas berhasil diupdate!', 'success');
        
    } catch (error) {
        console.error('Update gold price error:', error);
        Utils.showToast('Gagal mengambil harga otomatis', 'error');
        this.showManualGoldPriceInput();
    }
}

// Force refresh display
forceRefreshGoldDisplay() {
    console.log('🔍 Force refreshing gold display...');
    this.updateGoldPriceDisplay();
    Utils.showToast('Display diperbarui!', 'info');
}

// Display harga emas
updateGoldPriceDisplay() {
    const container = document.getElementById('goldPriceDisplay');
    if (!container) return;

    const price = DB.getGoldPrice();
    const lastUpdate = price.lastUpdate ? new Date(price.lastUpdate).toLocaleString('id-ID') : 'Belum diupdate';
    const source = price.source || 'Manual';
    
    const spread = price.buy - price.sell;
    const spreadPercentage = ((spread / price.buy) * 100).toFixed(1);
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); text-align: center;">
            <div style="border-left: 4px solid var(--success-color); padding: var(--spacing-md);">
                <div style="font-size: 12px; color: #666;">Harga Beli</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--success-color);">
                    ${Utils.formatCurrency(price.buy)}
                </div>
                <div style="font-size: 11px; color: #999;">per gram</div>
            </div>
            <div style="border-left: 4px solid var(--danger-color); padding: var(--spacing-md);">
                <div style="font-size: 12px; color: #666;">Harga Jual</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--danger-color);">
                    ${Utils.formatCurrency(price.sell)}
                </div>
                <div style="font-size: 11px; color: #999;">per gram</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
            <div style="font-size: 11px; color: #666;">
                <strong>Spread:</strong> ${Utils.formatCurrency(spread)} (${spreadPercentage}%) • 
                <strong>Sumber:</strong> ${source}
            </div>
            <div style="font-size: 10px; color: #999; margin-top: 2px;">
                Terakhir update: ${lastUpdate}
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 10px;">
            <button class="btn btn-outline btn-sm" onclick="app.showManualGoldPriceInput()">
                ✏️ Input Manual
            </button>
        </div>
    `;
}

// Input manual harga emas
showManualGoldPriceInput() {
    const currentPrice = DB.getGoldPrice();
    
    const content = `
        <form id="manualGoldPriceForm">
            <div class="form-group">
                <label class="form-label">💰 Harga Beli (per gram)</label>
                <input type="number" class="form-control" id="manualBuyPrice" 
                       value="${currentPrice.buy}" required>
                <small style="color: #666;">Harga saat Anda membeli emas</small>
            </div>
            <div class="form-group">
                <label class="form-label">💰 Harga Jual (per gram)</label>
                <input type="number" class="form-control" id="manualSellPrice" 
                       value="${currentPrice.sell}" required>
                <small style="color: #666;">Harga saat Anda menjual emas</small>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-primary" style="flex: 1;">
                    ✅ Simpan Harga
                </button>
                <button type="button" class="btn btn-outline" style="flex: 1;" 
                        onclick="Utils.closeModal('manualGoldPriceModal')">
                    ❌ Batal
                </button>
            </div>
        </form>
    `;

    Utils.createModal('manualGoldPriceModal', 'Input Harga Emas Manual', content);
    Utils.openModal('manualGoldPriceModal');

    document.getElementById('manualGoldPriceForm').onsubmit = (e) => {
        e.preventDefault();
        this.processManualGoldPrice();
    };
}

processManualGoldPrice() {
    const buyPrice = parseFloat(document.getElementById('manualBuyPrice').value);
    const sellPrice = parseFloat(document.getElementById('manualSellPrice').value);

    if (buyPrice <= 0 || sellPrice <= 0) {
        Utils.showToast('Harga harus lebih dari 0!', 'error');
        return;
    }

    if (sellPrice >= buyPrice) {
        Utils.showToast('Harga jual harus lebih rendah dari harga beli!', 'error');
        return;
    }

    const newPrice = {
        buy: buyPrice,
        sell: sellPrice,
        lastUpdate: new Date().toISOString(),
        source: 'Manual Input'
    };

    DB.saveGoldPrice(newPrice);
    Utils.closeModal('manualGoldPriceModal');
    this.updateGoldPriceDisplay();
    Utils.showToast('Harga emas berhasil disimpan!', 'success');
}

// Portfolio emas
renderGoldPortfolio() {
    const container = document.getElementById('goldPortfolio');
    const wallets = DB.getGoldWallets();
    
    if (wallets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="emoji">🪙</div>
                <p>Belum ada dompet emas. Tambahkan satu!</p>
            </div>
        `;
        return;
    }

    const currentPrice = DB.getGoldPrice();
    
    container.innerHTML = wallets.map(wallet => {
        const currentValue = wallet.weight * currentPrice.buy;
        const investedValue = wallet.weight * (wallet.buyPrice || currentPrice.buy);
        const profitLoss = currentValue - investedValue;
        const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;
        
        return `
            <div class="wallet-card" onclick="app.showGoldWalletDetail('${wallet.id}')">
                <span class="wallet-emoji">${wallet.emoji}</span>
                <div class="wallet-info">
                    <div class="wallet-name">${wallet.name}</div>
                    <div class="wallet-balance">${wallet.weight.toFixed(3)} gram (${wallet.purity}K)</div>
                    <div style="font-size: 12px; color: #666;">
                        Nilai: ${Utils.formatCurrency(currentValue)}
                        ${wallet.buyPrice > 0 ? `• Rata-rata: ${Utils.formatCurrency(wallet.buyPrice)}/g` : ''}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: ${profitLoss >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                        ${profitLoss >= 0 ? '↑' : '↓'} ${Utils.formatCurrency(Math.abs(profitLoss))}
                    </div>
                    <div style="font-size: 11px; color: #999;">
                        ${profitLossPercent.toFixed(1)}%
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Ringkasan investasi
renderGoldSummary() {
    const container = document.getElementById('goldSummary');
    const wallets = DB.getGoldWallets();
    const currentPrice = DB.getGoldPrice();
    
    let totalWeight = 0;
    let totalInvested = 0;
    let totalCurrentValue = 0;

    wallets.forEach(wallet => {
        totalWeight += wallet.weight;
        totalInvested += wallet.weight * (wallet.buyPrice || currentPrice.buy);
        totalCurrentValue += wallet.weight * currentPrice.buy;
    });

    const totalProfitLoss = totalCurrentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); text-align: center;">
            <div>
                <p style="font-size: 14px; color: #666;">Total Emas</p>
                <p style="font-weight: bold; font-size: 16px;">${totalWeight.toFixed(3)} gram</p>
            </div>
            <div>
                <p style="font-size: 14px; color: #666;">Total Investasi</p>
                <p style="font-weight: bold; font-size: 16px;">${Utils.formatCurrency(totalInvested)}</p>
            </div>
            <div>
                <p style="font-size: 14px; color: #666;">Nilai Sekarang</p>
                <p style="font-weight: bold; font-size: 16px; color: var(--success-color);">${Utils.formatCurrency(totalCurrentValue)}</p>
            </div>
            <div>
                <p style="font-size: 14px; color: #666;">Profit/Loss</p>
                <p style="font-weight: bold; font-size: 16px; color: ${totalProfitLoss >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                    ${totalProfitLoss >= 0 ? '+' : ''}${Utils.formatCurrency(totalProfitLoss)}
                </p>
                <p style="font-size: 12px; color: ${totalProfitLoss >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                    (${profitLossPercent.toFixed(1)}%)
                </p>
            </div>
        </div>
    `;
}

// Riwayat transaksi emas
renderGoldTransactions() {
    const container = document.getElementById('goldTransactions');
    const transactions = DB.getGoldTransactions().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="emoji">📝</div>
                <p>Belum ada transaksi emas</p>
            </div>
        `;
        return;
    }

    container.innerHTML = transactions.map(transaction => {
        const fromWallet = transaction.fromWalletId ? 
            (DB.getWallets().find(w => w.id === transaction.fromWalletId) || 
             DB.getGoldWallets().find(w => w.id === transaction.fromWalletId)) : null;
        const toWallet = transaction.toWalletId ? 
            (DB.getWallets().find(w => w.id === transaction.toWalletId) || 
             DB.getGoldWallets().find(w => w.id === transaction.toWalletId)) : null;
        
        const typeClass = transaction.type;
        let description = '';
        let amountText = '';

        if (transaction.type === 'buy') {
            description = `Beli ${transaction.weight.toFixed(3)}g`;
            amountText = `-${Utils.formatCurrency(transaction.totalAmount)}`;
        } else if (transaction.type === 'sell') {
            description = `Jual ${transaction.weight.toFixed(3)}g`;
            amountText = `+${Utils.formatCurrency(transaction.totalAmount)}`;
        } else if (transaction.type === 'transfer') {
            description = `Transfer ${transaction.weight.toFixed(3)}g`;
            amountText = `${transaction.weight.toFixed(3)}g`;
        }

        return `
            <div class="transaction-item ${typeClass}" onclick="app.showGoldTransactionDetail('${transaction.id}')">
                <div class="transaction-info">
                    <div class="transaction-category">${description}</div>
                    <div class="transaction-wallet">${Utils.formatDateShort(transaction.date)} • ${transaction.pricePerGram ? Utils.formatCurrency(transaction.pricePerGram) + '/g' : ''}</div>
                    ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                </div>
                <div class="transaction-amount ${typeClass}">
                    ${amountText}
                </div>
            </div>
        `;
    }).join('');
}

// Modal beli emas
showBuyGoldModal() {
    const cashWallets = DB.getWallets().filter(w => w.balance > 0);
    const goldWallets = DB.getGoldWallets();
    const goldPrice = DB.getGoldPrice();
    
    if (cashWallets.length === 0) {
        Utils.showToast('Tidak ada dompet uang dengan saldo!', 'error');
        this.showAddWalletModal();
        return;
    }
    
    if (goldWallets.length === 0) {
        Utils.showToast('Buat dompet emas terlebih dahulu!', 'error');
        this.showAddGoldWalletModal();
        return;
    }

    const cashOptions = cashWallets.map(w => 
        `<option value="${w.id}">${w.emoji} ${w.name} - ${Utils.formatCurrency(w.balance)}</option>`
    ).join('');
    
    const goldOptions = goldWallets.map(w => 
        `<option value="${w.id}">${w.emoji} ${w.name}</option>`
    ).join('');

    const content = `
        <form id="buyGoldForm">
            <div class="form-group">
                <label class="form-label">Dari Dompet Uang</label>
                <select class="form-control" id="buyFromWallet" required>
                    ${cashOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Ke Dompet Emas</label>
                <select class="form-control" id="buyToWallet" required>
                    ${goldOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Jumlah Pembelian (Rupiah)</label>
                <input type="number" class="form-control" id="buyAmountIDR" 
                       placeholder="Contoh: 1000000" required
                       oninput="app.calculateGoldFromIDR()">
            </div>
            <div class="form-group">
                <label class="form-label">Harga Beli per gram</label>
                <input type="number" class="form-control" id="buyPricePerGram" 
                       value="${goldPrice.buy}" required
                       oninput="app.calculateGoldFromIDR()">
            </div>
            <div class="form-group">
                <label class="form-label">Estimasi Emas Didapat</label>
                <input type="text" class="form-control" id="estimatedGold" 
                       placeholder="Akan terhitung otomatis" readonly style="background: #f5f5f5;">
            </div>
            <div class="form-group">
                <label class="form-label">Catatan (opsional)</label>
                <input type="text" class="form-control" id="buyNotes" placeholder="Contoh: Beli emas batangan">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">💸 Beli Emas</button>
        </form>
    `;

    Utils.createModal('buyGoldModal', '🛒 Beli Emas', content);
    Utils.openModal('buyGoldModal');

    document.getElementById('buyGoldForm').onsubmit = (e) => {
        e.preventDefault();
        this.processBuyGold();
    };
}

// Kalkulasi gram dari IDR
calculateGoldFromIDR() {
    const idrInput = document.getElementById('buyAmountIDR');
    const estimatedGoldInput = document.getElementById('estimatedGold');
    const pricePerGram = parseFloat(document.getElementById('buyPricePerGram').value);
    
    if (idrInput.value && pricePerGram > 0) {
        const idrAmount = parseFloat(idrInput.value);
        const gramAmount = idrAmount / pricePerGram;
        estimatedGoldInput.value = gramAmount.toFixed(4) + ' gram';
    } else {
        estimatedGoldInput.value = '';
    }
}

// Proses beli emas
processBuyGold() {
    const fromWalletId = document.getElementById('buyFromWallet').value;
    const toWalletId = document.getElementById('buyToWallet').value;
    const idrAmount = parseFloat(document.getElementById('buyAmountIDR').value);
    const pricePerGram = parseFloat(document.getElementById('buyPricePerGram').value);
    const notes = document.getElementById('buyNotes').value;

    // Validasi
    if (!fromWalletId || !toWalletId || !idrAmount || !pricePerGram) {
        Utils.showToast('Harap isi semua field!', 'error');
        return;
    }

    if (idrAmount <= 0 || pricePerGram <= 0) {
        Utils.showToast('Jumlah dan harga harus lebih dari 0!', 'error');
        return;
    }

    const cashWallet = DB.getWallets().find(w => w.id === fromWalletId);
    if (!cashWallet) {
        Utils.showToast('Dompet uang tidak ditemukan!', 'error');
        return;
    }

    if (cashWallet.balance < idrAmount) {
        Utils.showToast('Saldo tidak mencukupi!', 'error');
        return;
    }

    // Hitung jumlah emas yang didapat
    const gramAmount = idrAmount / pricePerGram;

    // Proses: kurangi saldo uang
    cashWallet.balance -= idrAmount;
    DB.saveWallets(DB.getWallets().map(w => w.id === cashWallet.id ? cashWallet : w));

    // Proses: tambah emas ke dompet emas
    const goldWallet = DB.getGoldWallets().find(w => w.id === toWalletId);
    if (goldWallet) {
        // Hitung harga rata-rata
        const totalValue = (goldWallet.weight * (goldWallet.buyPrice || 0)) + (gramAmount * pricePerGram);
        const totalWeight = goldWallet.weight + gramAmount;
        goldWallet.buyPrice = totalWeight > 0 ? totalValue / totalWeight : pricePerGram;
        goldWallet.weight = totalWeight;

        DB.saveGoldWallets(DB.getGoldWallets().map(w => w.id === goldWallet.id ? goldWallet : w));
    }

    // Catat transaksi emas
    const goldTransactions = DB.getGoldTransactions();
    goldTransactions.push({
        id: Utils.generateId(),
        type: 'buy',
        fromWalletId: fromWalletId,
        toWalletId: toWalletId,
        weight: gramAmount,
        pricePerGram: pricePerGram,
        totalAmount: idrAmount,
        date: new Date().toISOString().split('T')[0],
        notes: notes,
        createdAt: new Date().toISOString()
    });
    DB.saveGoldTransactions(goldTransactions);

    // Catat juga sebagai transaksi pengeluaran biasa
    const transactions = DB.getTransactions();
    transactions.push({
        id: Utils.generateId(),
        type: 'expense',
        amount: idrAmount,
        walletId: fromWalletId,
        categoryId: this.getOrCreateGoldCategory(),
        date: new Date().toISOString().split('T')[0],
        notes: `Beli emas: ${gramAmount.toFixed(4)} gram` + (notes ? ` - ${notes}` : ''),
        createdAt: new Date().toISOString()
    });
    DB.saveTransactions(transactions);

    Utils.closeModal('buyGoldModal');
    Utils.showToast(`Berhasil membeli ${gramAmount.toFixed(4)} gram emas!`, 'success');
    
    // Update semua tampilan
    this.renderGoldPortfolio();
    this.renderGoldSummary();
    this.renderGoldTransactions();
    this.renderWalletsList();
    this.updateTotalBalance();
    this.renderRecentTransactions();
}

// Modal jual emas
showSellGoldModal() {
    const goldWallets = DB.getGoldWallets().filter(w => w.weight > 0);
    const cashWallets = DB.getWallets();
    const goldPrice = DB.getGoldPrice();
    
    if (goldWallets.length === 0) {
        Utils.showToast('Tidak ada emas yang bisa dijual!', 'error');
        return;
    }
    
    if (cashWallets.length === 0) {
        Utils.showToast('Buat dompet uang terlebih dahulu!', 'error');
        this.showAddWalletModal();
        return;
    }

    const goldOptions = goldWallets.map(w => 
        `<option value="${w.id}">${w.emoji} ${w.name} - ${w.weight.toFixed(3)}g</option>`
    ).join('');
    
    const cashOptions = cashWallets.map(w => 
        `<option value="${w.id}">${w.emoji} ${w.name}</option>`
    ).join('');

    const content = `
        <form id="sellGoldForm">
            <div class="form-group">
                <label class="form-label">Dari Dompet Emas</label>
                <select class="form-control" id="sellFromWallet" required>
                    ${goldOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Ke Dompet Uang</label>
                <select class="form-control" id="sellToWallet" required>
                    ${cashOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Jumlah Penjualan (gram)</label>
                <input type="number" class="form-control" id="sellAmountGram" 
                       placeholder="Jumlah gram" step="0.001" required
                       oninput="app.calculateIDRFromGoldSell()">
            </div>
            <div class="form-group">
                <label class="form-label">Harga Jual per gram</label>
                <input type="number" class="form-control" id="sellPricePerGram" 
                       value="${goldPrice.sell}" required
                       oninput="app.calculateIDRFromGoldSell()">
            </div>
            <div class="form-group">
                <label class="form-label">Estimasi Penerimaan</label>
                <input type="text" class="form-control" id="estimatedIDR" 
                       placeholder="Akan terhitung otomatis" readonly style="background: #f5f5f5;">
            </div>
            <div class="form-group">
                <label class="form-label">Catatan (opsional)</label>
                <input type="text" class="form-control" id="sellNotes" placeholder="Contoh: Jual emas perhiasan">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">💰 Jual Emas</button>
        </form>
    `;

    Utils.createModal('sellGoldModal', '💰 Jual Emas', content);
    Utils.openModal('sellGoldModal');

    document.getElementById('sellGoldForm').onsubmit = (e) => {
        e.preventDefault();
        this.processSellGold();
    };
}

// Kalkulasi IDR dari gram
calculateIDRFromGoldSell() {
    const gramInput = document.getElementById('sellAmountGram');
    const idrInput = document.getElementById('estimatedIDR');
    const pricePerGram = parseFloat(document.getElementById('sellPricePerGram').value);
    
    if (gramInput.value && pricePerGram > 0) {
        const gramAmount = parseFloat(gramInput.value);
        const idrAmount = gramAmount * pricePerGram;
        idrInput.value = Utils.formatCurrency(idrAmount);
    } else {
        idrInput.value = '';
    }
}

// Proses jual emas
processSellGold() {
    const fromWalletId = document.getElementById('sellFromWallet').value;
    const toWalletId = document.getElementById('sellToWallet').value;
    const gramAmount = parseFloat(document.getElementById('sellAmountGram').value);
    const pricePerGram = parseFloat(document.getElementById('sellPricePerGram').value);
    const notes = document.getElementById('sellNotes').value;

    // Validasi
    if (!fromWalletId || !toWalletId || !gramAmount || !pricePerGram) {
        Utils.showToast('Harap isi semua field!', 'error');
        return;
    }

    if (gramAmount <= 0 || pricePerGram <= 0) {
        Utils.showToast('Jumlah dan harga harus lebih dari 0!', 'error');
        return;
    }

    const goldWallet = DB.getGoldWallets().find(w => w.id === fromWalletId);
    if (!goldWallet) {
        Utils.showToast('Dompet emas tidak ditemukan!', 'error');
        return;
    }

    if (goldWallet.weight < gramAmount) {
        Utils.showToast('Emas tidak mencukupi!', 'error');
        return;
    }

    const cashWallet = DB.getWallets().find(w => w.id === toWalletId);
    if (!cashWallet) {
        Utils.showToast('Dompet uang tidak ditemukan!', 'error');
        return;
    }

    // Hitung jumlah uang yang didapat
    const idrAmount = gramAmount * pricePerGram;

    // Proses: kurangi emas
    goldWallet.weight -= gramAmount;
    // Jika emas habis, reset buyPrice
    if (goldWallet.weight === 0) {
        goldWallet.buyPrice = 0;
    }
    DB.saveGoldWallets(DB.getGoldWallets().map(w => w.id === goldWallet.id ? goldWallet : w));

    // Proses: tambah uang
    cashWallet.balance += idrAmount;
    DB.saveWallets(DB.getWallets().map(w => w.id === cashWallet.id ? cashWallet : w));

    // Catat transaksi emas
    const goldTransactions = DB.getGoldTransactions();
    goldTransactions.push({
        id: Utils.generateId(),
        type: 'sell',
        fromWalletId: fromWalletId,
        toWalletId: toWalletId,
        weight: gramAmount,
        pricePerGram: pricePerGram,
        totalAmount: idrAmount,
        date: new Date().toISOString().split('T')[0],
        notes: notes,
        createdAt: new Date().toISOString()
    });
    DB.saveGoldTransactions(goldTransactions);

    // Catat juga sebagai transaksi pemasukan biasa
    const transactions = DB.getTransactions();
    transactions.push({
        id: Utils.generateId(),
        type: 'income',
        amount: idrAmount,
        walletId: toWalletId,
        categoryId: this.getOrCreateGoldIncomeCategory(),
        date: new Date().toISOString().split('T')[0],
        notes: `Jual emas: ${gramAmount.toFixed(4)} gram` + (notes ? ` - ${notes}` : ''),
        createdAt: new Date().toISOString()
    });
    DB.saveTransactions(transactions);

    Utils.closeModal('sellGoldModal');
    Utils.showToast(`Berhasil menjual ${gramAmount.toFixed(4)} gram emas!`, 'success');
    
    // Update semua tampilan
    this.renderGoldPortfolio();
    this.renderGoldSummary();
    this.renderGoldTransactions();
    this.renderWalletsList();
    this.updateTotalBalance();
    this.renderRecentTransactions();
}

// Kalkulator emas
showGoldCalculator() {
    const goldPrice = DB.getGoldPrice();
    
    const content = `
        <div class="form-group">
            <label class="form-label">Harga Emas per gram (IDR)</label>
            <input type="number" class="form-control" id="calcGoldPrice" 
                   value="${goldPrice.buy}" oninput="app.calculateGoldConversion()">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
            <div>
                <div class="form-group">
                    <label class="form-label">Berat Emas (gram)</label>
                    <input type="number" class="form-control" id="calcGoldGrams" 
                           step="0.001" oninput="app.calculateGoldConversion()">
                </div>
                <div style="background: var(--light-color); padding: 15px; border-radius: 8px; margin-top: 10px;">
                    <strong>Nilai dalam Rupiah:</strong>
                    <div id="calcIDRResult" style="font-weight: bold; color: var(--success-color); margin-top: 5px;">
                        Rp 0
                    </div>
                </div>
            </div>
            
            <div>
                <div class="form-group">
                    <label class="form-label">Jumlah Rupiah</label>
                    <input type="number" class="form-control" id="calcIDRAmount" 
                           oninput="app.calculateGoldConversion()">
                </div>
                <div style="background: var(--light-color); padding: 15px; border-radius: 8px; margin-top: 10px;">
                    <strong>Estimasi Emas:</strong>
                    <div id="calcGoldResult" style="font-weight: bold; color: var(--info-color); margin-top: 5px;">
                        0 gram
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group" style="margin-top: var(--spacing-lg);">
            <label class="form-label">Kemurnian Emas</label>
            <select class="form-control" id="calcPurity" onchange="app.calculateGoldConversion()">
                <option value="24">24K (99.9%) - Murni</option>
                <option value="22">22K (91.6%)</option>
                <option value="20">20K (83.3%)</option>
                <option value="18">18K (75.0%)</option>
            </select>
        </div>
        
        <div style="background: var(--light-color); padding: 15px; border-radius: 8px; margin-top: 15px;">
            <strong>Konversi Kemurnian:</strong>
            <div id="calcPurityResult" style="margin-top: 5px;">
                Isi berat atau jumlah untuk melihat konversi
            </div>
        </div>
    `;

    Utils.createModal('goldCalculator', '🧮 Kalkulator Emas', content);
    Utils.openModal('goldCalculator');
}

// Kalkulasi konversi emas
calculateGoldConversion() {
    const pricePerGram = parseFloat(document.getElementById('calcGoldPrice').value) || 0;
    const goldGrams = parseFloat(document.getElementById('calcGoldGrams').value) || 0;
    const idrAmount = parseFloat(document.getElementById('calcIDRAmount').value) || 0;
    const purity = parseInt(document.getElementById('calcPurity').value) || 24;

    // Calculate IDR from Gold
    if (goldGrams > 0 && pricePerGram > 0) {
        const idrValue = goldGrams * pricePerGram;
        document.getElementById('calcIDRResult').textContent = Utils.formatCurrency(idrValue);
    } else {
        document.getElementById('calcIDRResult').textContent = 'Rp 0';
    }

    // Calculate Gold from IDR
    if (idrAmount > 0 && pricePerGram > 0) {
        const goldValue = idrAmount / pricePerGram;
        document.getElementById('calcGoldResult').textContent = goldValue.toFixed(4) + ' gram';
        
        // Calculate purity conversion
        const pureGold = goldValue * (purity / 24);
        document.getElementById('calcPurityResult').innerHTML = `
            <div>${goldValue.toFixed(4)}g ${purity}K = ${pureGold.toFixed(4)}g 24K murni</div>
            <div style="font-size: 12px; color: #666;">
                Nilai murni: ${Utils.formatCurrency(pureGold * pricePerGram)}
            </div>
        `;
    } else {
        document.getElementById('calcGoldResult').textContent = '0 gram';
        document.getElementById('calcPurityResult').textContent = 'Isi berat atau jumlah untuk melihat konversi';
    }
}

// Tambah dompet emas
showAddGoldWalletModal() {
    const content = `
        <form id="addGoldWalletForm">
            <div class="form-group">
                <label class="form-label">Nama Dompet Emas</label>
                <input type="text" class="form-control" id="goldWalletName" 
                       placeholder="Contoh: Tabungan Emas, Perhiasan, dll" required>
            </div>
            <div class="form-group">
                <label class="form-label">Emoji</label>
                <input type="text" class="form-control" id="goldWalletEmoji" value="🪙" maxlength="2">
            </div>
            <div class="form-group">
                <label class="form-label">Kemurnian Default</label>
                <select class="form-control" id="goldWalletPurity">
                    <option value="24">24K (99.9%) - Murni</option>
                    <option value="22">22K (91.6%)</option>
                    <option value="20">20K (83.3%)</option>
                    <option value="18">18K (75.0%)</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">➕ Tambah Dompet Emas</button>
        </form>
    `;

    Utils.createModal('addGoldWalletModal', 'Tambah Dompet Emas', content);
    Utils.openModal('addGoldWalletModal');

    document.getElementById('addGoldWalletForm').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('goldWalletName').value;
        const emoji = document.getElementById('goldWalletEmoji').value;
        const purity = parseInt(document.getElementById('goldWalletPurity').value);

        const wallets = DB.getGoldWallets();
        wallets.push({
            id: Utils.generateId(),
            name,
            type: 'gold',
            weight: 0,
            purity: purity,
            buyPrice: 0,
            emoji
        });

        if (DB.saveGoldWallets(wallets)) {
            Utils.closeModal('addGoldWalletModal');
            this.renderGoldPortfolio();
            this.renderGoldSummary();
            Utils.showToast('Dompet emas berhasil ditambahkan!', 'success');
        }
    };
}

// Detail dompet emas
showGoldWalletDetail(walletId) {
    const wallet = DB.getGoldWallets().find(w => w.id === walletId);
    if (!wallet) return;

    const goldTransactions = DB.getGoldTransactions().filter(t => 
        t.fromWalletId === walletId || t.toWalletId === walletId
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    const currentPrice = DB.getGoldPrice();
    const currentValue = wallet.weight * currentPrice.buy;

    let transactionsHTML = '';
    if (goldTransactions.length === 0) {
        transactionsHTML = '<p style="text-align: center; color: #666; padding: 20px;">Belum ada transaksi</p>';
    } else {
        transactionsHTML = goldTransactions.map(transaction => {
            let description = '';
            let amount = '';

            if (transaction.type === 'buy' && transaction.toWalletId === walletId) {
                description = `Beli ${transaction.weight.toFixed(3)}g`;
                amount = `-${Utils.formatCurrency(transaction.totalAmount)}`;
            } else if (transaction.type === 'sell' && transaction.fromWalletId === walletId) {
                description = `Jual ${transaction.weight.toFixed(3)}g`;
                amount = `+${Utils.formatCurrency(transaction.totalAmount)}`;
            } else {
                return ''; // Skip other transactions
            }

            return `
                <div class="transaction-item ${transaction.type}">
                    <div class="transaction-info">
                        <div class="transaction-category">${description}</div>
                        <div class="transaction-wallet">${Utils.formatDateShort(transaction.date)}</div>
                        ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${amount}
                    </div>
                </div>
            `;
        }).join('');
    }

    const content = `
        <div style="margin-bottom: var(--spacing-lg);">
            <h4>${wallet.emoji} ${wallet.name}</h4>
            <p>Berat: <strong>${wallet.weight.toFixed(3)} gram</strong> (${wallet.purity}K)</p>
            <p>Harga Rata-rata: <strong>${Utils.formatCurrency(wallet.buyPrice || 0)}/g</strong></p>
            <p>Nilai Sekarang: <strong style="color: var(--success-color);">${Utils.formatCurrency(currentValue)}</strong></p>
        </div>
        
        <h5>Riwayat Transaksi</h5>
        <div style="max-height: 300px; overflow-y: auto;">
            ${transactionsHTML}
        </div>
        
        <div style="margin-top: var(--spacing-lg); display: flex; gap: 10px;">
            <button class="btn btn-danger" onclick="app.deleteGoldWallet('${wallet.id}')" style="flex: 1;">
                🗑️ Hapus Dompet
            </button>
            <button class="btn btn-secondary" onclick="Utils.closeModal('goldWalletDetailModal')" style="flex: 1;">
                Tutup
            </button>
        </div>
    `;

    Utils.createModal('goldWalletDetailModal', 'Detail Dompet Emas', content);
    Utils.openModal('goldWalletDetailModal');
}

// Hapus dompet emas
deleteGoldWallet(walletId) {
    if (confirm('Hapus dompet emas ini? Semua emas di dalamnya akan hilang!')) {
        const wallets = DB.getGoldWallets().filter(w => w.id !== walletId);
        const transactions = DB.getGoldTransactions().filter(t => 
            t.fromWalletId !== walletId && t.toWalletId !== walletId
        );
        
        if (DB.saveGoldWallets(wallets) && DB.saveGoldTransactions(transactions)) {
            Utils.closeModal('goldWalletDetailModal');
            this.renderGoldPortfolio();
            this.renderGoldSummary();
            this.renderGoldTransactions();
            Utils.showToast('Dompet emas berhasil dihapus!', 'success');
        }
    }
}

// Helper methods untuk kategori
getOrCreateGoldCategory() {
    const categories = DB.getCategories();
    let goldCategory = categories.find(c => c.name === 'Investasi Emas' && c.type === 'expense');
    
    if (!goldCategory) {
        goldCategory = {
            id: Utils.generateId(),
            name: 'Investasi Emas',
            type: 'expense',
            emoji: '🪙'
        };
        categories.push(goldCategory);
        DB.saveCategories(categories);
    }
    
    return goldCategory.id;
}

getOrCreateGoldIncomeCategory() {
    const categories = DB.getCategories();
    let goldCategory = categories.find(c => c.name === 'Penjualan Emas' && c.type === 'income');
    
    if (!goldCategory) {
        goldCategory = {
            id: Utils.generateId(),
            name: 'Penjualan Emas',
            type: 'income',
            emoji: '💰'
        };
        categories.push(goldCategory);
        DB.saveCategories(categories);
    }
    
    return goldCategory.id;
}

// Detail transaksi emas (placeholder)
showGoldTransactionDetail(transactionId) {
    Utils.showToast('Fitur detail transaksi emas dalam pengembangan', 'info');
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

// GANTI method renderBudget dengan yang INI:
renderBudget(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🎯 Budget & Tabungan</h3>
                <div class="sub-tab-navigation">
                    <button class="btn btn-outline btn-sm ${this.budgetSubTab === 'budget' ? 'active' : ''}" 
                            onclick="app.switchBudgetSubTab('budget')">
                        📊 Anggaran
                    </button>
                    <button class="btn btn-outline btn-sm ${this.budgetSubTab === 'savings' ? 'active' : ''}" 
                            onclick="app.switchBudgetSubTab('savings')">
                        🎯 Target Tabungan
                    </button>
                </div>
            </div>
            <div id="budgetSubContent">
                <!-- Konten akan diisi berdasarkan sub tab -->
            </div>
        </div>
    `;

    // Default sub tab
    if (!this.budgetSubTab) this.budgetSubTab = 'budget';
    this.renderBudgetSubContent();
}

// Method untuk switch sub tab budget
switchBudgetSubTab(subTab) {
    this.budgetSubTab = subTab;
    
    // Update active state buttons
    document.querySelectorAll('.sub-tab-navigation .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    this.renderBudgetSubContent();
}

// Render konten berdasarkan sub tab
renderBudgetSubContent() {
    const container = document.getElementById('budgetSubContent');
    if (!container) return;

    if (this.budgetSubTab === 'budget') {
        this.renderBudgetContent(container);
    } else {
        this.renderSavingsContent(container);
    }
}

// Konten budget (existing)
renderBudgetContent(container) {
    container.innerHTML = `
        <div style="text-align: right; margin-bottom: 15px;">
            <button class="btn btn-primary" onclick="app.showAddBudgetModal()">+ Tambah Budget</button>
        </div>
        <div id="budgetsList"></div>
        
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title">📊 Progress Budget</h3>
            </div>
            <div id="budgetProgress"></div>
        </div>
    `;
    this.renderBudgets();
}

// Konten savings goals (NEW)
renderSavingsContent(container) {
    container.innerHTML = `
        <div style="text-align: right; margin-bottom: 15px;">
            <button class="btn btn-primary" onclick="app.showAddSavingsGoalModal()">+ Target Tabungan Baru</button>
        </div>
        <div id="savingsGoalsList"></div>
        
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title">💰 Progress Menabung</h3>
            </div>
            <div id="savingsProgress"></div>
        </div>
    `;
    this.renderSavingsGoals();
    this.renderSavingsProgress();
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

    // Methods untuk Savings Goals
renderSavingsGoals() {
    const container = document.getElementById('savingsGoalsList');
    const goals = DB.getSavingsGoals();
    
    if (goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="emoji">🎯</div>
                <p>Belum ada target tabungan</p>
                <p style="font-size: 14px; color: #666;">Buat target pertama Anda untuk mulai menabung!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = goals.map(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const daysLeft = this.calculateDaysLeft(goal.targetDate);
        const savedPercentage = Math.min(progress, 100);
        
        let statusClass = '';
        let statusText = '';
        
        if (savedPercentage >= 100) {
            statusClass = 'success';
            statusText = '🎉 Tercapai!';
        } else if (daysLeft < 0) {
            statusClass = 'danger';
            statusText = '⏰ Terlambat';
        } else if (daysLeft <= 7) {
            statusClass = 'warning';
            statusText = `${daysLeft} hari lagi`;
        } else {
            statusText = `${daysLeft} hari lagi`;
        }

        return `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--${statusClass}-color);">
                <div class="card-header">
                    <h4 class="card-title">${goal.emoji} ${goal.name}</h4>
                    <span style="color: var(--${statusClass}-color); font-weight: bold;">${statusText}</span>
                </div>
                
                <div style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; font-size: 14px;">
                        <span>Terkumpul: <strong>${Utils.formatCurrency(goal.currentAmount)}</strong></span>
                        <span>Target: <strong>${Utils.formatCurrency(goal.targetAmount)}</strong></span>
                    </div>
                    
                    <div class="progress-bar-container" style="margin: 8px 0;">
                        <div class="progress-bar" style="width: ${savedPercentage}%; background: var(--${statusClass}-color);"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
                        <span>${Math.round(savedPercentage)}%</span>
                        <span>Sisa: ${Utils.formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success btn-sm" onclick="app.showAddToSavingsModal('${goal.id}')">
                        💰 Tambah
                    </button>
                    <button class="btn btn-info btn-sm" onclick="app.showEditSavingsGoalModal('${goal.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteSavingsGoal('${goal.id}')">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

renderSavingsProgress() {
    const container = document.getElementById('savingsProgress');
    const goals = DB.getSavingsGoals();
    
    if (goals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Tidak ada progress untuk ditampilkan</p>';
        return;
    }

    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <h4>Total Tabungan</h4>
            <p style="font-size: 24px; font-weight: bold; color: var(--success-color);">
                ${Utils.formatCurrency(totalCurrent)} / ${Utils.formatCurrency(totalTarget)}
            </p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${overallProgress}%; background: var(--success-color);"></div>
            </div>
            <p style="font-size: 14px; color: #666;">${Math.round(overallProgress)}% dari total target</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
            <div class="stat-card">
                <div style="font-size: 12px; color: #666;">Target Aktif</div>
                <div style="font-weight: bold;">${goals.length}</div>
            </div>
            <div class="stat-card">
                <div style="font-size: 12px; color: #666;">Tercapai</div>
                <div style="font-weight: bold; color: var(--success-color);">
                    ${goals.filter(g => g.currentAmount >= g.targetAmount).length}
                </div>
            </div>
        </div>
    `;
}

// Modal untuk tambah savings goal
showAddSavingsGoalModal() {
    const wallets = DB.getWallets();
    const walletOptions = wallets.map(w => 
        `<option value="${w.id}">${w.emoji} ${w.name} - ${Utils.formatCurrency(w.balance)}</option>`
    ).join('');

    const content = `
        <form id="addSavingsGoalForm">
            <div class="form-group">
                <label class="form-label">Nama Target Tabungan</label>
                <input type="text" class="form-control" id="savingsGoalName" 
                       placeholder="Contoh: Liburan Bali, DP Rumah, dll" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Emoji</label>
                <input type="text" class="form-control" id="savingsGoalEmoji" value="🎯" maxlength="2">
            </div>
            
            <div class="form-group">
                <label class="form-label">Target Jumlah</label>
                <input type="number" class="form-control" id="savingsTargetAmount" required min="1">
            </div>
            
            <div class="form-group">
                <label class="form-label">Tanggal Target</label>
                <input type="date" class="form-control" id="savingsTargetDate" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Dompet Sumber</label>
                <select class="form-control" id="savingsWallet" required>
                    ${walletOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Catatan (opsional)</label>
                <textarea class="form-control" id="savingsNotes" rows="2" placeholder="Deskripsi target tabungan..."></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">🎯 Buat Target Tabungan</button>
        </form>
    `;

    Utils.createModal('addSavingsGoalModal', 'Buat Target Tabungan', content);
    Utils.openModal('addSavingsGoalModal');

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('savingsTargetDate').min = tomorrow.toISOString().split('T')[0];

    document.getElementById('addSavingsGoalForm').onsubmit = (e) => {
        e.preventDefault();
        this.processAddSavingsGoal();
    };
}

processAddSavingsGoal() {
    const name = document.getElementById('savingsGoalName').value;
    const emoji = document.getElementById('savingsGoalEmoji').value;
    const targetAmount = parseFloat(document.getElementById('savingsTargetAmount').value);
    const targetDate = document.getElementById('savingsTargetDate').value;
    const walletId = document.getElementById('savingsWallet').value;
    const notes = document.getElementById('savingsNotes').value;

    if (!name || !targetAmount || !targetDate || !walletId) {
        Utils.showToast('Harap isi semua field yang wajib!', 'error');
        return;
    }

    const goals = DB.getSavingsGoals();
    goals.push({
        id: Utils.generateId(),
        name,
        emoji,
        targetAmount,
        currentAmount: 0,
        targetDate,
        walletId,
        notes,
        createdAt: new Date().toISOString()
    });

    if (DB.saveSavingsGoals(goals)) {
        Utils.closeModal('addSavingsGoalModal');
        this.renderSavingsGoals();
        this.renderSavingsProgress();
        Utils.showToast('Target tabungan berhasil dibuat!', 'success');
    }
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

// Di renderSettings(), perbaiki bagian Data Management:
// Di renderSettings(), tambahkan section theme:
renderSettings(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">⚙️ Pengaturan Aplikasi</h3>
            </div>
            
            <div class="tab-grid tab-grid-2">
                <div>
                    <h4>🎨 Tampilan</h4>
                    <div id="themeSettings">
                        ${this.renderThemeSettings()}
                    </div>
                    
                    <h4 style="margin-top: 20px;">💾 Data Management</h4>
                    <div class="data-management">
                        <button class="btn btn-warning" onclick="app.exportToCSV()">
                            <span>📤</span> Export CSV
                        </button>
                        <button class="btn btn-info" onclick="app.showBackupModal()">
                            <span>💾</span> Backup LENGKAP
                        </button>
                    </div>
                    
                    <div class="data-management">
                        <label class="file-input-label btn btn-primary">
                            <span>📁</span> Restore LENGKAP
                            <input type="file" id="restoreFile" class="file-input" accept=".json" 
                                   onchange="app.restoreCompleteBackup(event)">
                        </label>
                    </div>
                    
                    <button class="btn btn-danger" style="width: 100%; margin-top: 10px;" 
                            onclick="app.confirmClearAllData()">
                        <span>🗑️</span> Hapus Semua Data
                    </button>
                </div>
                
                <div>
                    <h4>🏷️ Kelola Kategori</h4>
                    <div id="categoriesManagement"></div>
                    <button class="btn btn-primary" onclick="app.showAddCategoryModal()" 
                            style="width: 100%; margin-top: 10px;">
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
                <div style="background: var(--light-color); padding: 15px; border-radius: 10px;">
                    <p><strong>Total Transaksi:</strong> <span id="totalTransactionsCount">0</span></p>
                    <p><strong>Total Wallet:</strong> <span id="totalWalletsCount">0</span></p>
                    <p><strong>Versi:</strong> 2.0.0</p>
                    <p><strong>Mode:</strong> <span id="currentThemeDisplay">${Utils.getTheme() === 'dark' ? '🌙 Gelap' : '☀️ Terang'}</span></p>
                </div>
            </div>
        </div>
    `;
    
    this.renderCategoriesManagement();
    this.updateAppInfo();
}

exportToCSV() {
    try {
        const transactions = DB.getTransactions();
        const wallets = DB.getWallets();
        const categories = DB.getCategories();

        // Header CSV
        let csv = 'Date,Type,Amount,Wallet,Category,Notes\n';

        transactions.forEach(transaction => {
            const wallet = wallets.find(w => w.id === transaction.walletId);
            const category = categories.find(c => c.id === transaction.categoryId);

            const date = transaction.date;
            const type = transaction.type;
            const amount = transaction.amount;
            const walletName = wallet ? wallet.name : 'Unknown';
            const categoryName = category ? category.name : 'Unknown';
            const notes = transaction.notes ? `"${transaction.notes.replace(/"/g, '""')}"` : '';

            csv += `${date},${type},${amount},${walletName},${categoryName},${notes}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        Utils.showToast('CSV berhasil diunduh!', 'success');
    } catch (error) {
        console.error('Export CSV error:', error);
        Utils.showToast('Gagal mengekspor CSV', 'error');
    }
}

// Tambahkan method untuk validasi data di app.js
validateBackupData(data) {
    const required = ['wallets', 'categories', 'transactions'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
        throw new Error(`Data backup tidak lengkap: ${missing.join(', ')}`);
    }
    
    // Validasi struktur data
    if (!Array.isArray(data.wallets) || !Array.isArray(data.transactions)) {
        throw new Error('Struktur data backup tidak valid');
    }
    
    return true;
}

// Update method restoreCompleteBackup dengan validasi:
restoreCompleteBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('⚠️ RESTORE akan MENGGANTI SEMUA DATA! Yakin?')) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validasi data backup
            this.validateBackupData(data);
            
            if (DB.restoreData(e.target.result)) {
                Utils.closeModal('backupModal');
                this.showRestoreSuccessMessage(data);
            }
            
        } catch (error) {
            console.error('Restore validation failed:', error);
            Utils.showToast(`Backup tidak valid: ${error.message}`, 'error');
        }
        
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

showRestoreSuccessMessage(data) {
    // Render ulang semua tab
    this.render();
    this.updateTotalBalance();
    this.updateAppInfo();
    
    // Tampilkan summary
    const counts = data.dataCount || {};
    const message = `
        ✅ Data berhasil dipulihkan!
        • ${counts.wallets || 0} Dompet
        • ${counts.transactions || 0} Transaksi  
        • ${counts.budgets || 0} Budget
        • ${counts.goldWallets || 0} Dompet Emas
        • ${counts.liabilities || 0} Liabilitas
    `;
    
    Utils.showToast(message, 'success');
    
    // Log detail untuk debugging
    console.log('🎉 Restore completed:', counts);
}

importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const csvText = e.target.result;
            const lines = csvText.split('\n');
            const headers = lines[0].split(',');

            // Skip header
            const transactions = DB.getTransactions();
            let importedCount = 0;

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const values = lines[i].split(',');
                if (values.length < 5) continue;

                const [date, type, amount, walletName, categoryName, ...noteParts] = values;
                const notes = noteParts.join(',').replace(/^"|"$/g, '');

                // Validasi data
                if (!date || !type || !amount || !walletName || !categoryName) {
                    console.warn('Data tidak valid, dilewati:', lines[i]);
                    continue;
                }

                // Cari wallet berdasarkan nama
                const wallet = DB.getWallets().find(w => w.name === walletName);
                if (!wallet) {
                    Utils.showToast(`Wallet "${walletName}" tidak ditemukan`, 'error');
                    continue;
                }

                // Cari kategori berdasarkan nama dan type
                const category = DB.getCategories().find(c => 
                    c.name === categoryName && c.type === type
                );
                if (!category) {
                    Utils.showToast(`Kategori "${categoryName}" dengan tipe "${type}" tidak ditemukan`, 'error');
                    continue;
                }

                // Tambah transaksi
                transactions.push({
                    id: Utils.generateId(),
                    type: type,
                    amount: parseFloat(amount),
                    walletId: wallet.id,
                    categoryId: category.id,
                    date: date,
                    notes: notes,
                    createdAt: new Date().toISOString()
                });

                importedCount++;
            }

            if (importedCount > 0) {
                DB.saveTransactions(transactions);
                this.renderRecentTransactions();
                this.renderAllTransactions();
                this.updateAppInfo();
                Utils.showToast(`Berhasil mengimpor ${importedCount} transaksi!`, 'success');
            } else {
                Utils.showToast('Tidak ada data yang berhasil diimpor', 'info');
            }

            // Reset input file
            event.target.value = '';

        } catch (error) {
            console.error('Import CSV error:', error);
            Utils.showToast('Gagal mengimpor CSV. Format file mungkin tidak sesuai.', 'error');
        }
    };
    reader.readAsText(file);
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

    // Method untuk menambah tabungan
showAddToSavingsModal(goalId) {
    const goal = DB.getSavingsGoals().find(g => g.id === goalId);
    if (!goal) return;

    const wallets = DB.getWallets();
    const walletOptions = wallets.map(w => 
        `<option value="${w.id}">${w.emoji} ${w.name} - ${Utils.formatCurrency(w.balance)}</option>`
    ).join('');

    const remaining = goal.targetAmount - goal.currentAmount;

    const content = `
        <form id="addToSavingsForm">
            <div class="form-group">
                <label class="form-label">Target Tabungan</label>
                <input type="text" class="form-control" value="${goal.emoji} ${goal.name}" readonly>
            </div>
            
            <div class="form-group">
                <label class="form-label">Sisa Target</label>
                <input type="text" class="form-control" value="${Utils.formatCurrency(remaining)}" readonly>
            </div>
            
            <div class="form-group">
                <label class="form-label">Jumlah yang Ditambahkan</label>
                <input type="number" class="form-control" id="savingsAddAmount" 
                       max="${remaining}" min="1" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Dari Dompet</label>
                <select class="form-control" id="savingsSourceWallet" required>
                    ${walletOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tanggal</label>
                <input type="date" class="form-control" id="savingsAddDate" 
                       value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Catatan (opsional)</label>
                <input type="text" class="form-control" id="savingsAddNotes" 
                       placeholder="Contoh: Setoran bulanan">
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">
                💰 Tambah ke Tabungan
            </button>
        </form>
    `;

    Utils.createModal('addToSavingsModal', 'Tambah Tabungan', content);
    Utils.openModal('addToSavingsModal');

    document.getElementById('addToSavingsForm').onsubmit = (e) => {
        e.preventDefault();
        this.processAddToSavings(goalId);
    };
}

processAddToSavings(goalId) {
    const goals = DB.getSavingsGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;

    const amount = parseFloat(document.getElementById('savingsAddAmount').value);
    const walletId = document.getElementById('savingsSourceWallet').value;
    const date = document.getElementById('savingsAddDate').value;
    const notes = document.getElementById('savingsAddNotes').value;

    // Validasi
    if (!amount || amount <= 0) {
        Utils.showToast('Jumlah harus lebih dari 0!', 'error');
        return;
    }

    const wallet = DB.getWallets().find(w => w.id === walletId);
    if (!wallet) {
        Utils.showToast('Dompet tidak ditemukan!', 'error');
        return;
    }

    if (wallet.balance < amount) {
        Utils.showToast('Saldo dompet tidak mencukupi!', 'error');
        return;
    }

    const remaining = goals[goalIndex].targetAmount - goals[goalIndex].currentAmount;
    if (amount > remaining) {
        Utils.showToast(`Jumlah melebihi sisa target! Sisa: ${Utils.formatCurrency(remaining)}`, 'error');
        return;
    }

    try {
        // 1. Kurangi saldo dompet
        wallet.balance -= amount;
        DB.saveWallets(DB.getWallets().map(w => w.id === wallet.id ? wallet : w));

        // 2. Tambah ke tabungan
        goals[goalIndex].currentAmount += amount;
        DB.saveSavingsGoals(goals);

        // 3. Catat transaksi tabungan
        const savingsTransactions = DB.getSavingsTransactions();
        savingsTransactions.push({
            id: Utils.generateId(),
            goalId: goalId,
            amount: amount,
            walletId: walletId,
            date: date,
            notes: notes,
            createdAt: new Date().toISOString()
        });
        DB.saveSavingsTransactions(savingsTransactions);

        // 4. Catat sebagai transaksi pengeluaran biasa
        const transactions = DB.getTransactions();
        transactions.push({
            id: Utils.generateId(),
            type: 'expense',
            amount: amount,
            walletId: walletId,
            categoryId: this.getOrCreateSavingsCategory(),
            date: date,
            notes: `Tabungan: ${goals[goalIndex].name}` + (notes ? ` - ${notes}` : ''),
            createdAt: new Date().toISOString()
        });
        DB.saveTransactions(transactions);

        Utils.closeModal('addToSavingsModal');
        this.renderSavingsGoals();
        this.renderSavingsProgress();
        this.renderWalletsList();
        this.updateTotalBalance();
        Utils.showToast(`Berhasil menambahkan ${Utils.formatCurrency(amount)} ke tabungan!`, 'success');

    } catch (error) {
        console.error('Error adding to savings:', error);
        Utils.showToast('Terjadi kesalahan saat menambah tabungan', 'error');
    }
}

// Method untuk edit savings goal
showEditSavingsGoalModal(goalId) {
    const goals = DB.getSavingsGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const wallets = DB.getWallets();
    const walletOptions = wallets.map(w => 
        `<option value="${w.id}" ${w.id === goal.walletId ? 'selected' : ''}>${w.emoji} ${w.name}</option>`
    ).join('');

    const content = `
        <form id="editSavingsGoalForm">
            <div class="form-group">
                <label class="form-label">Nama Target Tabungan</label>
                <input type="text" class="form-control" id="editSavingsGoalName" 
                       value="${goal.name}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Emoji</label>
                <input type="text" class="form-control" id="editSavingsGoalEmoji" 
                       value="${goal.emoji}" maxlength="2">
            </div>
            
            <div class="form-group">
                <label class="form-label">Target Jumlah</label>
                <input type="number" class="form-control" id="editSavingsTargetAmount" 
                       value="${goal.targetAmount}" required min="1">
            </div>
            
            <div class="form-group">
                <label class="form-label">Tanggal Target</label>
                <input type="date" class="form-control" id="editSavingsTargetDate" 
                       value="${goal.targetDate}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Dompet Sumber</label>
                <select class="form-control" id="editSavingsWallet" required>
                    ${walletOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Catatan</label>
                <textarea class="form-control" id="editSavingsNotes" rows="2">${goal.notes || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-primary" style="flex: 1;">
                    💾 Simpan Perubahan
                </button>
                <button type="button" class="btn btn-danger" style="flex: 1;" 
                        onclick="app.deleteSavingsGoal('${goal.id}')">
                    🗑️ Hapus
                </button>
            </div>
        </form>
    `;

    Utils.createModal('editSavingsGoalModal', 'Edit Target Tabungan', content);
    Utils.openModal('editSavingsGoalModal');

    document.getElementById('editSavingsGoalForm').onsubmit = (e) => {
        e.preventDefault();
        this.processEditSavingsGoal(goalId);
    };
}

processEditSavingsGoal(goalId) {
    const goals = DB.getSavingsGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;

    const name = document.getElementById('editSavingsGoalName').value;
    const emoji = document.getElementById('editSavingsGoalEmoji').value;
    const targetAmount = parseFloat(document.getElementById('editSavingsTargetAmount').value);
    const targetDate = document.getElementById('editSavingsTargetDate').value;
    const walletId = document.getElementById('editSavingsWallet').value;
    const notes = document.getElementById('editSavingsNotes').value;

    if (!name || !targetAmount || !targetDate || !walletId) {
        Utils.showToast('Harap isi semua field yang wajib!', 'error');
        return;
    }

    // Jika target amount dikurangi, pastikan tidak kurang dari current amount
    if (targetAmount < goals[goalIndex].currentAmount) {
        Utils.showToast('Target tidak boleh kurang dari jumlah yang sudah terkumpul!', 'error');
        return;
    }

    goals[goalIndex] = {
        ...goals[goalIndex],
        name,
        emoji,
        targetAmount,
        targetDate,
        walletId,
        notes
    };

    if (DB.saveSavingsGoals(goals)) {
        Utils.closeModal('editSavingsGoalModal');
        this.renderSavingsGoals();
        this.renderSavingsProgress();
        Utils.showToast('Target tabungan berhasil diperbarui!', 'success');
    }
}

// Method untuk hapus savings goal
deleteSavingsGoal(goalId) {
    if (!confirm('Hapus target tabungan ini? Semua progress akan hilang.')) {
        return;
    }

    const goals = DB.getSavingsGoals().filter(g => g.id !== goalId);
    const savingsTransactions = DB.getSavingsTransactions().filter(t => t.goalId !== goalId);
    
    if (DB.saveSavingsGoals(goals) && DB.saveSavingsTransactions(savingsTransactions)) {
        this.renderSavingsGoals();
        this.renderSavingsProgress();
        Utils.showToast('Target tabungan berhasil dihapus!', 'success');
    }
}

// Helper method untuk kategori tabungan
getOrCreateSavingsCategory() {
    const categories = DB.getCategories();
    let savingsCategory = categories.find(c => c.name === 'Tabungan' && c.type === 'expense');
    
    if (!savingsCategory) {
        savingsCategory = {
            id: Utils.generateId(),
            name: 'Tabungan',
            type: 'expense',
            emoji: '💰'
        };
        categories.push(savingsCategory);
        DB.saveCategories(categories);
    }
    
    return savingsCategory.id;
}

// Method untuk menandai tagihan sebagai sudah dibayar
markBillAsPaid(billId) {
    const bills = DB.getBillReminders();
    const billIndex = bills.findIndex(b => b.id === billId);
    if (billIndex === -1) return;

    const bill = bills[billIndex];
    
    // Validasi saldo dompet
    const wallet = DB.getWallets().find(w => w.id === bill.walletId);
    if (!wallet) {
        Utils.showToast('Dompet tidak ditemukan!', 'error');
        return;
    }

    if (wallet.balance < bill.amount) {
        Utils.showToast('Saldo dompet tidak mencukupi untuk membayar tagihan!', 'error');
        return;
    }

    if (!confirm(`Bayar tagihan ${bill.name} sebesar ${Utils.formatCurrency(bill.amount)}?`)) {
        return;
    }

    try {
        // 1. Kurangi saldo dompet
        wallet.balance -= bill.amount;
        DB.saveWallets(DB.getWallets().map(w => w.id === wallet.id ? wallet : w));

        // 2. Tandai sebagai sudah dibayar
        bills[billIndex].paid = true;
        bills[billIndex].paidDate = new Date().toISOString();
        DB.saveBillReminders(bills);

        // 3. Jika recurring, buat tagihan baru untuk bulan berikutnya
        if (bill.recurring) {
            const nextDueDate = new Date(bill.dueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            
            bills.push({
                id: Utils.generateId(),
                type: bill.type,
                name: bill.name,
                emoji: bill.emoji,
                amount: bill.amount,
                dueDate: nextDueDate.toISOString().split('T')[0],
                walletId: bill.walletId,
                recurring: true,
                notes: bill.notes,
                paid: false,
                createdAt: new Date().toISOString()
            });
            DB.saveBillReminders(bills);
        }

        // 4. Catat sebagai transaksi pengeluaran
        const transactions = DB.getTransactions();
        transactions.push({
            id: Utils.generateId(),
            type: 'expense',
            amount: bill.amount,
            walletId: bill.walletId,
            categoryId: this.getOrCreateBillCategory(bill.type),
            date: new Date().toISOString().split('T')[0],
            notes: `Tagihan: ${bill.name}` + (bill.notes ? ` - ${bill.notes}` : ''),
            createdAt: new Date().toISOString()
        });
        DB.saveTransactions(transactions);

        this.renderBillReminders();
        this.renderUpcomingBills();
        this.renderWalletsList();
        this.updateTotalBalance();
        
        const message = bill.recurring ? 
            `Tagihan ${bill.name} berhasil dibayar! Tagihan berikutnya sudah dibuat.` :
            `Tagihan ${bill.name} berhasil dibayar!`;
            
        Utils.showToast(message, 'success');

    } catch (error) {
        console.error('Error paying bill:', error);
        Utils.showToast('Terjadi kesalahan saat membayar tagihan', 'error');
    }
}

// Method untuk edit bill
showEditBillModal(billId) {
    const bills = DB.getBillReminders();
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const wallets = DB.getWallets();
    const walletOptions = wallets.map(w => 
        `<option value="${w.id}" ${w.id === bill.walletId ? 'selected' : ''}>${w.emoji} ${w.name}</option>`
    ).join('');

    const billTypes = [
        { value: 'electricity', name: '⚡ Listrik (PLN)', emoji: '⚡' },
        { value: 'water', name: '💧 Air (PDAM)', emoji: '💧' },
        { value: 'internet', name: '🌐 Internet', emoji: '🌐' },
        { value: 'phone', name: '📱 Pulsa & Paket Data', emoji: '📱' },
        { value: 'subscription', name: '📺 Streaming & Subscription', emoji: '📺' },
        { value: 'credit-card', name: '💳 Kartu Kredit', emoji: '💳' },
        { value: 'insurance', name: '🛡️ Asuransi', emoji: '🛡️' },
        { value: 'other', name: '📄 Lainnya', emoji: '📄' }
    ];

    const billTypeOptions = billTypes.map(type => 
        `<option value="${type.value}" ${type.value === bill.type ? 'selected' : ''} data-emoji="${type.emoji}">${type.name}</option>`
    ).join('');

    const content = `
        <form id="editBillForm">
            <div class="form-group">
                <label class="form-label">Jenis Tagihan</label>
                <select class="form-control" id="editBillType" required onchange="app.onEditBillTypeChange()">
                    <option value="">Pilih jenis tagihan</option>
                    ${billTypeOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Nama Tagihan</label>
                <input type="text" class="form-control" id="editBillName" value="${bill.name}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Emoji</label>
                <input type="text" class="form-control" id="editBillEmoji" value="${bill.emoji}" maxlength="2">
            </div>
            
            <div class="form-group">
                <label class="form-label">Jumlah Tagihan</label>
                <input type="number" class="form-control" id="editBillAmount" value="${bill.amount}" required min="1">
            </div>
            
            <div class="form-group">
                <label class="form-label">Tanggal Jatuh Tempo</label>
                <input type="date" class="form-control" id="editBillDueDate" value="${bill.dueDate}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Dompet untuk Pembayaran</label>
                <select class="form-control" id="editBillWallet" required>
                    ${walletOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">
                    <input type="checkbox" id="editBillRecurring" ${bill.recurring ? 'checked' : ''}>
                    Berulang Setiap Bulan
                </label>
            </div>
            
            <div class="form-group">
                <label class="form-label">Catatan</label>
                <textarea class="form-control" id="editBillNotes" rows="2">${bill.notes || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-primary" style="flex: 1;">
                    💾 Simpan Perubahan
                </button>
                <button type="button" class="btn btn-danger" style="flex: 1;" 
                        onclick="app.deleteBill('${bill.id}')">
                    🗑️ Hapus
                </button>
            </div>
        </form>
    `;

    Utils.createModal('editBillModal', 'Edit Tagihan', content);
    Utils.openModal('editBillModal');

    document.getElementById('editBillForm').onsubmit = (e) => {
        e.preventDefault();
        this.processEditBill(billId);
    };
}

onEditBillTypeChange() {
    const billType = document.getElementById('editBillType');
    const billName = document.getElementById('editBillName');
    const billEmoji = document.getElementById('editBillEmoji');
    
    const selectedOption = billType.options[billType.selectedIndex];
    const emoji = selectedOption.getAttribute('data-emoji');
    
    if (emoji) {
        billEmoji.value = emoji;
    }
}

processEditBill(billId) {
    const bills = DB.getBillReminders();
    const billIndex = bills.findIndex(b => b.id === billId);
    if (billIndex === -1) return;

    const type = document.getElementById('editBillType').value;
    const name = document.getElementById('editBillName').value;
    const emoji = document.getElementById('editBillEmoji').value;
    const amount = parseFloat(document.getElementById('editBillAmount').value);
    const dueDate = document.getElementById('editBillDueDate').value;
    const walletId = document.getElementById('editBillWallet').value;
    const recurring = document.getElementById('editBillRecurring').checked;
    const notes = document.getElementById('editBillNotes').value;

    if (!type || !name || !amount || !dueDate || !walletId) {
        Utils.showToast('Harap isi semua field yang wajib!', 'error');
        return;
    }

    bills[billIndex] = {
        ...bills[billIndex],
        type,
        name,
        emoji,
        amount,
        dueDate,
        walletId,
        recurring,
        notes
    };

    if (DB.saveBillReminders(bills)) {
        Utils.closeModal('editBillModal');
        this.renderBillReminders();
        this.renderUpcomingBills();
        Utils.showToast('Tagihan berhasil diperbarui!', 'success');
    }
}

// Method untuk hapus bill
deleteBill(billId) {
    if (!confirm('Hapus tagihan ini?')) {
        return;
    }

    const bills = DB.getBillReminders().filter(b => b.id !== billId);
    if (DB.saveBillReminders(bills)) {
        this.renderBillReminders();
        this.renderUpcomingBills();
        Utils.showToast('Tagihan berhasil dihapus!', 'success');
    }
}

// Helper method untuk kategori tagihan
getOrCreateBillCategory(billType) {
    const categories = DB.getCategories();
    const categoryNames = {
        'electricity': 'Listrik',
        'water': 'Air',
        'internet': 'Internet',
        'phone': 'Telepon & Data',
        'subscription': 'Subscription',
        'credit-card': 'Kartu Kredit',
        'insurance': 'Asuransi',
        'other': 'Tagihan Lainnya'
    };
    
    const categoryName = categoryNames[billType] || 'Tagihan Lainnya';
    let billCategory = categories.find(c => c.name === categoryName && c.type === 'expense');
    
    if (!billCategory) {
        billCategory = {
            id: Utils.generateId(),
            name: categoryName,
            type: 'expense',
            emoji: '📄'
        };
        categories.push(billCategory);
        DB.saveCategories(categories);
    }
    
    return billCategory.id;
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

// GANTI method showBackupModal dengan yang INI:
    showBackupModal() {
        const content = `
            <div style="margin-bottom: 20px;">
                <h4>💾 Backup Data Lengkap</h4>
                <p>Backup akan menyimpan <strong>SEMUA data</strong> termasuk:</p>
                <ul style="text-align: left; font-size: 14px;">
                    <li>💵 Dompet & Saldo</li>
                    <li>📊 Transaksi & Kategori</li>
                    <li>🎯 Budget & Anggaran</li>
                    <li>🪙 Data Emas (Portfolio & Transaksi)</li>
                    <li>🏦 Liabilitas & Pembayaran Hutang</li>
                    <li>⚙️ Semua pengaturan</li>
                </ul>
            </div>
            
            <button class="btn btn-primary" style="width: 100%; margin-bottom: 10px;" 
                    onclick="app.downloadCompleteBackup()">
                💾 Download Backup LENGKAP
            </button>
            
            <label class="btn btn-outline" style="width: 100%; display: block; text-align: center; margin-bottom: 10px;">
                📁 Restore Backup LENGKAP
                <input type="file" id="restoreFile" accept=".json" style="display: none;" 
                    onchange="app.restoreCompleteBackup(event)">
            </label>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <h5>⚠️ Penting!</h5>
                <p style="font-size: 12px; margin: 0;">
                    • Backup hanya file .json<br>
                    • Restore akan <strong>mengganti semua data</strong><br>
                    • Simpan backup di tempat aman
                </p>
            </div>
        `;

        Utils.createModal('backupModal', 'Backup & Restore LENGKAP', content);
        Utils.openModal('backupModal');
    }

    // TAMBAHKAN method baru:
    downloadCompleteBackup() {
        if (DB.backupData()) {
            Utils.closeModal('backupModal');
        }
    }

    restoreCompleteBackup(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Konfirmasi restore
        if (!confirm('RESTORE akan MENGGANTI SEMUA DATA yang ada! Yakin ingin melanjutkan?')) {
            event.target.value = ''; // Reset file input
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validasi file backup
                if (!data.wallets || !data.transactions) {
                    throw new Error('File backup tidak valid');
                }
                
                if (DB.restoreData(e.target.result)) {
                    Utils.closeModal('backupModal');
                    app.render();
                    app.updateTotalBalance();
                    app.updateAppInfo();
                    
                    // Tampilkan summary data yang dipulihkan
                    setTimeout(() => {
                        const summary = data.dataCount ? `
                            Dompet: ${data.dataCount.wallets || 0}
                            Transaksi: ${data.dataCount.transactions || 0}
                            Budget: ${data.dataCount.budgets || 0}
                            Dompet Emas: ${data.dataCount.goldWallets || 0}
                            Liabilitas: ${data.dataCount.liabilities || 0}
                        ` : 'Data berhasil dipulihkan!';
                        
                        Utils.showToast('Backup LENGKAP berhasil dipulihkan!', 'success');
                        console.log('📊 Restore summary:', data.dataCount);
                    }, 500);
                    
                } else {
                    throw new Error('Gagal memproses file backup');
                }
                
            } catch (error) {
                console.error('Restore error:', error);
                Utils.showToast('File backup tidak valid atau rusak!', 'error');
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        reader.onerror = () => {
            Utils.showToast('Gagal membaca file!', 'error');
            event.target.value = '';
        };
        
        reader.readAsText(file);
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

    // Ganti method renderDiabilitas dengan renderLiabilities

// GANTI method renderLiabilities dengan yang INI:
renderLiabilities(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🏦 Liabilitas & Tagihan</h3>
                <div class="sub-tab-navigation">
                    <button class="btn btn-outline btn-sm ${this.liabilitiesSubTab === 'liabilities' ? 'active' : ''}" 
                            onclick="app.switchLiabilitiesSubTab('liabilities')">
                        💰 Hutang
                    </button>
                    <button class="btn btn-outline btn-sm ${this.liabilitiesSubTab === 'bills' ? 'active' : ''}" 
                            onclick="app.switchLiabilitiesSubTab('bills')">
                        📅 Tagihan
                    </button>
                </div>
            </div>
            <div id="liabilitiesSubContent">
                <!-- Konten akan diisi berdasarkan sub tab -->
            </div>
        </div>
    `;

    // Default sub tab
    if (!this.liabilitiesSubTab) this.liabilitiesSubTab = 'liabilities';
    this.renderLiabilitiesSubContent();
}

// Method untuk switch sub tab liabilities
switchLiabilitiesSubTab(subTab) {
    this.liabilitiesSubTab = subTab;
    
    // Update active state buttons
    document.querySelectorAll('.sub-tab-navigation .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    this.renderLiabilitiesSubContent();
}

// Render konten berdasarkan sub tab
renderLiabilitiesSubContent() {
    const container = document.getElementById('liabilitiesSubContent');
    if (!container) return;

    if (this.liabilitiesSubTab === 'liabilities') {
        this.renderLiabilitiesContent(container);
    } else {
        this.renderBillsContent(container);
    }
}

// Konten liabilitas (existing)
renderLiabilitiesContent(container) {
    container.innerHTML = `
        <div style="text-align: right; margin-bottom: 15px;">
            <button class="btn btn-primary" onclick="app.showAddLiabilityModal()">+ Tambah Hutang</button>
        </div>
        <div id="liabilitiesList"></div>
        
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title">📊 Ringkasan Hutang</h3>
            </div>
            <div id="liabilitiesSummary"></div>
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title">📅 Jadwal Pembayaran</h3>
            </div>
            <div id="paymentSchedule"></div>
        </div>
    `;
    this.renderLiabilitiesList();
    this.renderLiabilitiesSummary();
    this.renderPaymentSchedule();
}

// Konten bill reminders (NEW)
renderBillsContent(container) {
    container.innerHTML = `
        <div style="text-align: right; margin-bottom: 15px;">
            <button class="btn btn-primary" onclick="app.showAddBillModal()">+ Tagihan Baru</button>
        </div>
        <div id="billRemindersList"></div>
        
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title">🔔 Tagihan Mendatang</h3>
            </div>
            <div id="upcomingBills"></div>
        </div>
    `;
    this.renderBillReminders();
    this.renderUpcomingBills();
}

// Methods untuk Bill Reminders
renderBillReminders() {
    const container = document.getElementById('billRemindersList');
    const bills = DB.getBillReminders();
    
    if (bills.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="emoji">📅</div>
                <p>Belum ada pengingat tagihan</p>
                <p style="font-size: 14px; color: #666;">Tambahkan tagihan rutin seperti listrik, air, atau internet!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = bills.map(bill => {
        const daysLeft = this.calculateDaysLeft(bill.dueDate);
        let statusClass = '';
        let statusText = '';
        
        if (bill.paid) {
            statusClass = 'success';
            statusText = '✅ Lunas';
        } else if (daysLeft < 0) {
            statusClass = 'danger';
            statusText = '⏰ Terlambat';
        } else if (daysLeft === 0) {
            statusClass = 'warning';
            statusText = '⚠️ Hari ini';
        } else if (daysLeft <= 3) {
            statusClass = 'warning';
            statusText = `${daysLeft} hari lagi`;
        } else {
            statusText = `${daysLeft} hari lagi`;
        }

        return `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--${statusClass}-color);">
                <div class="card-header">
                    <h4 class="card-title">${bill.emoji} ${bill.name}</h4>
                    <span style="color: var(--${statusClass}-color); font-weight: bold;">${statusText}</span>
                </div>
                
                <div style="margin: 10px 0;">
                    <p style="margin: 5px 0;"><strong>${Utils.formatCurrency(bill.amount)}</strong></p>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">
                        Jatuh tempo: ${Utils.formatDate(bill.dueDate)}
                    </p>
                    ${bill.notes ? `<p style="margin: 5px 0; font-size: 14px; color: #666;">${bill.notes}</p>` : ''}
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success btn-sm" onclick="app.markBillAsPaid('${bill.id}')" 
                            ${bill.paid ? 'disabled' : ''}>
                        💸 Bayar
                    </button>
                    <button class="btn btn-info btn-sm" onclick="app.showEditBillModal('${bill.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteBill('${bill.id}')">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

renderUpcomingBills() {
    const container = document.getElementById('upcomingBills');
    const bills = DB.getBillReminders()
        .filter(bill => !bill.paid)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    if (bills.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Tidak ada tagihan mendatang</p>';
        return;
    }

    container.innerHTML = bills.map(bill => {
        const daysLeft = this.calculateDaysLeft(bill.dueDate);
        return `
            <div class="payment-schedule-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${bill.emoji} ${bill.name}</strong>
                        <p style="margin: 0; font-size: 12px; color: #666;">
                            ${Utils.formatDate(bill.dueDate)} • ${Utils.formatCurrency(bill.amount)}
                        </p>
                    </div>
                    <span style="color: ${daysLeft <= 3 ? 'var(--danger-color)' : daysLeft <= 7 ? 'var(--warning-color)' : 'var(--success-color)'};">
                        ${daysLeft} hari
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Modal untuk tambah bill reminder
showAddBillModal() {
    const wallets = DB.getWallets();
    const walletOptions = wallets.map(w => 
        `<option value="${w.id}">${w.emoji} ${w.name} - ${Utils.formatCurrency(w.balance)}</option>`
    ).join('');

    const billTypes = [
        { value: 'electricity', name: '⚡ Listrik (PLN)', emoji: '⚡' },
        { value: 'water', name: '💧 Air (PDAM)', emoji: '💧' },
        { value: 'internet', name: '🌐 Internet', emoji: '🌐' },
        { value: 'phone', name: '📱 Pulsa & Paket Data', emoji: '📱' },
        { value: 'subscription', name: '📺 Streaming & Subscription', emoji: '📺' },
        { value: 'credit-card', name: '💳 Kartu Kredit', emoji: '💳' },
        { value: 'insurance', name: '🛡️ Asuransi', emoji: '🛡️' },
        { value: 'other', name: '📄 Lainnya', emoji: '📄' }
    ];

    const billTypeOptions = billTypes.map(type => 
        `<option value="${type.value}" data-emoji="${type.emoji}">${type.name}</option>`
    ).join('');

    const content = `
        <form id="addBillForm">
            <div class="form-group">
                <label class="form-label">Jenis Tagihan</label>
                <select class="form-control" id="billType" required onchange="app.onBillTypeChange()">
                    <option value="">Pilih jenis tagihan</option>
                    ${billTypeOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Nama Tagihan</label>
                <input type="text" class="form-control" id="billName" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Emoji</label>
                <input type="text" class="form-control" id="billEmoji" value="📄" maxlength="2">
            </div>
            
            <div class="form-group">
                <label class="form-label">Jumlah Tagihan</label>
                <input type="number" class="form-control" id="billAmount" required min="1">
            </div>
            
            <div class="form-group">
                <label class="form-label">Tanggal Jatuh Tempo</label>
                <input type="date" class="form-control" id="billDueDate" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Dompet untuk Pembayaran</label>
                <select class="form-control" id="billWallet" required>
                    ${walletOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Berulang Setiap Bulan</label>
                <input type="checkbox" id="billRecurring" checked>
            </div>
            
            <div class="form-group">
                <label class="form-label">Catatan (opsional)</label>
                <textarea class="form-control" id="billNotes" rows="2" placeholder="No. pelanggan atau info tambahan..."></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">📅 Tambah Pengingat Tagihan</button>
        </form>
    `;

    Utils.createModal('addBillModal', 'Tambah Pengingat Tagihan', content);
    Utils.openModal('addBillModal');

    // Set default due date to 10th of next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(10);
    document.getElementById('billDueDate').value = nextMonth.toISOString().split('T')[0];

    document.getElementById('addBillForm').onsubmit = (e) => {
        e.preventDefault();
        this.processAddBill();
    };
}

// Handler untuk perubahan jenis tagihan
onBillTypeChange() {
    const billType = document.getElementById('billType');
    const billName = document.getElementById('billName');
    const billEmoji = document.getElementById('billEmoji');
    
    const selectedOption = billType.options[billType.selectedIndex];
    const emoji = selectedOption.getAttribute('data-emoji');
    
    if (emoji) {
        billEmoji.value = emoji;
    }
    
    // Auto-fill name based on type
    if (billType.value && !billName.value) {
        billName.value = selectedOption.text;
    }
}

processAddBill() {
    const type = document.getElementById('billType').value;
    const name = document.getElementById('billName').value;
    const emoji = document.getElementById('billEmoji').value;
    const amount = parseFloat(document.getElementById('billAmount').value);
    const dueDate = document.getElementById('billDueDate').value;
    const walletId = document.getElementById('billWallet').value;
    const recurring = document.getElementById('billRecurring').checked;
    const notes = document.getElementById('billNotes').value;

    if (!type || !name || !amount || !dueDate || !walletId) {
        Utils.showToast('Harap isi semua field yang wajib!', 'error');
        return;
    }

    const bills = DB.getBillReminders();
    bills.push({
        id: Utils.generateId(),
        type,
        name,
        emoji,
        amount,
        dueDate,
        walletId,
        recurring,
        notes,
        paid: false,
        createdAt: new Date().toISOString()
    });

    if (DB.saveBillReminders(bills)) {
        Utils.closeModal('addBillModal');
        this.renderBillReminders();
        this.renderUpcomingBills();
        Utils.showToast('Pengingat tagihan berhasil ditambahkan!', 'success');
    }
}

renderLiabilitiesList() {
    const container = document.getElementById('liabilitiesList');
    const liabilities = DB.getLiabilities();
    
    if (liabilities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="emoji">😊</div>
                <p>Tidak ada liabilitas. Tambahkan liabilitas pertama Anda!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = liabilities.map(liability => {
        const paidAmount = this.calculatePaidAmount(liability.id);
        const remaining = liability.amount - paidAmount;
        const progressPercent = (paidAmount / liability.amount) * 100;
        const daysLeft = this.calculateDaysLeft(liability.dueDate);
        
        let statusClass = '';
        if (paidAmount >= liability.amount) {
            statusClass = 'paid';
        } else if (daysLeft < 0) {
            statusClass = 'overdue';
        }

        return `
            <div class="liability-item ${statusClass}" onclick="app.showLiabilityDetail('${liability.id}')">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <h4>${liability.name}</h4>
                        <p>${Utils.formatCurrency(liability.amount)} • ${liability.interestRate}% • Jatuh tempo: ${Utils.formatDate(liability.dueDate)}</p>
                        <div class="debt-progress">
                            <div class="debt-progress-bar" style="width: ${progressPercent}%"></div>
                        </div>
                        <p style="font-size: 12px; color: #666;">
                            Terbayar: ${Utils.formatCurrency(paidAmount)} | Sisa: ${Utils.formatCurrency(remaining)}
                            ${daysLeft > 0 ? `• ${daysLeft} hari lagi` : '<span style="color: var(--danger-color);">• Terlambat!</span>'}
                        </p>
                    </div>
                    <button class="btn btn-success btn-sm" onclick="app.showPayLiabilityModal('${liability.id}'); event.stopPropagation();">
                        Bayar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

renderLiabilitiesSummary() {
    const container = document.getElementById('liabilitiesSummary');
    const liabilities = DB.getLiabilities();
    
    let totalAmount = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let overdueCount = 0;

    liabilities.forEach(liability => {
        totalAmount += liability.amount;
        const paid = this.calculatePaidAmount(liability.id);
        totalPaid += paid;
        totalRemaining += (liability.amount - paid);
        
        if (this.calculateDaysLeft(liability.dueDate) < 0 && paid < liability.amount) {
            overdueCount++;
        }
    });

    container.innerHTML = `
        <div class="liability-stats">
            <div class="stat-card">
                <div class="stat-label">Total Liabilitas</div>
                <div class="stat-value" style="color: var(--danger-color);">${Utils.formatCurrency(totalAmount)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Terbayar</div>
                <div class="stat-value" style="color: var(--success-color);">${Utils.formatCurrency(totalPaid)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Sisa Hutang</div>
                <div class="stat-value" style="color: var(--warning-color);">${Utils.formatCurrency(totalRemaining)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Terlambat</div>
                <div class="stat-value" style="color: ${overdueCount > 0 ? 'var(--danger-color)' : 'var(--success-color)'};">${overdueCount}</div>
            </div>
        </div>
    `;
}

renderPaymentSchedule() {
    const container = document.getElementById('paymentSchedule');
    const liabilities = DB.getLiabilities()
        .filter(liability => {
            const paid = this.calculatePaidAmount(liability.id);
            return paid < liability.amount;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    if (liabilities.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Tidak ada jadwal pembayaran</p>';
        return;
    }

    container.innerHTML = liabilities.map(liability => {
        const daysLeft = this.calculateDaysLeft(liability.dueDate);
        const paid = this.calculatePaidAmount(liability.id);
        const remaining = liability.amount - paid;

        return `
            <div class="payment-schedule-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${liability.name}</strong>
                        <p style="margin: 0; font-size: 12px; color: #666;">
                            ${Utils.formatDate(liability.dueDate)} • ${Utils.formatCurrency(remaining)}
                        </p>
                    </div>
                    <span style="color: ${daysLeft <= 7 ? 'var(--danger-color)' : daysLeft <= 30 ? 'var(--warning-color)' : 'var(--success-color)'};">
                        ${daysLeft} hari
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

renderPaymentHistory() {
    const container = document.getElementById('paymentHistory');
    const payments = DB.getLiabilityPayments()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    if (payments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Belum ada riwayat pembayaran</p>';
        return;
    }

    container.innerHTML = payments.map(payment => {
        const liability = DB.getLiabilities().find(l => l.id === payment.liabilityId);
        return `
            <div class="payment-history-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${liability?.name || 'Unknown'}</strong>
                        <p style="margin: 0; font-size: 12px; color: #666;">
                            ${Utils.formatDate(payment.date)}
                        </p>
                    </div>
                    <span style="color: var(--success-color); font-weight: bold;">
                        -${Utils.formatCurrency(payment.amount)}
                    </span>
                </div>
                ${payment.notes ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${payment.notes}</p>` : ''}
            </div>
        `;
    }).join('');
}

// Helper methods
calculatePaidAmount(liabilityId) {
    const payments = DB.getLiabilityPayments();
    return payments
        .filter(payment => payment.liabilityId === liabilityId)
        .reduce((total, payment) => total + payment.amount, 0);
}

calculateDaysLeft(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

showAddLiabilityModal() {
    const wallets = DB.getWallets();
    const walletOptions = wallets.map(w => 
        `<option value="${w.id}">${w.emoji} ${w.name} - ${Utils.formatCurrency(w.balance)}</option>`
    ).join('');

    const content = `
        <form id="addLiabilityForm">
            <div class="form-group">
                <label class="form-label">Nama Liabilitas</label>
                <input type="text" class="form-control" id="liabilityName" placeholder="Contoh: Kredit Mobil, Kartu Kredit BCA, dll" required>
            </div>
            <div class="form-group">
                <label class="form-label">Jenis Liabilitas</label>
                <select class="form-control" id="liabilityType" required>
                    <option value="credit-card">Kartu Kredit</option>
                    <option value="loan">Pinjaman Bank</option>
                    <option value="mortgage">KPR</option>
                    <option value="personal">Pinjaman Pribadi</option>
                    <option value="other">Lainnya</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Jumlah Hutang</label>
                <input type="number" class="form-control" id="liabilityAmount" required min="1">
            </div>
            <div class="form-group">
                <label class="form-label">Suku Bunga (%) per tahun</label>
                <input type="number" class="form-control" id="liabilityInterest" step="0.1" value="0">
            </div>
            <div class="form-group">
                <label class="form-label">Tanggal Jatuh Tempo</label>
                <input type="date" class="form-control" id="liabilityDueDate" required>
            </div>
            <div class="form-group">
                <label class="form-label">Dompet untuk Pembayaran</label>
                <select class="form-control" id="liabilityWallet" required>
                    ${walletOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Catatan (opsional)</label>
                <textarea class="form-control" id="liabilityNotes" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">➕ Tambah Liabilitas</button>
        </form>
    `;

    Utils.createModal('addLiabilityModal', 'Tambah Liabilitas', content);
    Utils.openModal('addLiabilityModal');

    // Set minimum date to today
    document.getElementById('liabilityDueDate').min = new Date().toISOString().split('T')[0];

    document.getElementById('addLiabilityForm').onsubmit = (e) => {
        e.preventDefault();
        this.processAddLiability();
    };
}

processAddLiability() {
    const name = document.getElementById('liabilityName').value;
    const type = document.getElementById('liabilityType').value;
    const amount = parseFloat(document.getElementById('liabilityAmount').value);
    const interestRate = parseFloat(document.getElementById('liabilityInterest').value);
    const dueDate = document.getElementById('liabilityDueDate').value;
    const walletId = document.getElementById('liabilityWallet').value;
    const notes = document.getElementById('liabilityNotes').value;

    if (!name || !amount || !dueDate || !walletId) {
        Utils.showToast('Harap isi semua field yang wajib!', 'error');
        return;
    }

    const liabilities = DB.getLiabilities();
    liabilities.push({
        id: Utils.generateId(),
        name,
        type,
        amount,
        interestRate,
        dueDate,
        walletId,
        notes,
        createdAt: new Date().toISOString()
    });

    if (DB.saveLiabilities(liabilities)) {
        Utils.closeModal('addLiabilityModal');
        this.renderLiabilitiesList();
        this.renderLiabilitiesSummary();
        this.renderPaymentSchedule();
        Utils.showToast('Liabilitas berhasil ditambahkan!', 'success');
    }
}

showPayLiabilityModal(liabilityId) {
    const liability = DB.getLiabilities().find(l => l.id === liabilityId);
    if (!liability) return;

    const paidAmount = this.calculatePaidAmount(liabilityId);
    const remaining = liability.amount - paidAmount;

    const content = `
        <form id="payLiabilityForm">
            <div class="form-group">
                <label class="form-label">Liabilitas</label>
                <input type="text" class="form-control" value="${liability.name}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Sisa Hutang</label>
                <input type="text" class="form-control" value="${Utils.formatCurrency(remaining)}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Jumlah Pembayaran</label>
                <input type="number" class="form-control" id="paymentAmount" 
                       max="${remaining}" min="1" required>
            </div>
            <div class="form-group">
                <label class="form-label">Tanggal Pembayaran</label>
                <input type="date" class="form-control" id="paymentDate" 
                       value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Catatan (opsional)</label>
                <input type="text" class="form-control" id="paymentNotes" 
                       placeholder="Contoh: Angsuran ke-1">
            </div>
            <button type="submit" class="btn btn-success" style="width: 100%;">💸 Bayar</button>
        </form>
    `;

    Utils.createModal('payLiabilityModal', 'Bayar Liabilitas', content);
    Utils.openModal('payLiabilityModal');

    document.getElementById('payLiabilityForm').onsubmit = (e) => {
        e.preventDefault();
        this.processPayment(liabilityId);
    };
}

processPayment(liabilityId) {
    const liability = DB.getLiabilities().find(l => l.id === liabilityId);
    if (!liability) return;

    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentNotes = document.getElementById('paymentNotes').value;

    const paidAmount = this.calculatePaidAmount(liabilityId);
    const remaining = liability.amount - paidAmount;

    if (paymentAmount > remaining) {
        Utils.showToast('Jumlah pembayaran melebihi sisa hutang!', 'error');
        return;
    }

    // Check if wallet has enough balance
    const wallet = DB.getWallets().find(w => w.id === liability.walletId);
    if (!wallet || wallet.balance < paymentAmount) {
        Utils.showToast('Saldo dompet tidak mencukupi!', 'error');
        return;
    }

    // Deduct from wallet
    wallet.balance -= paymentAmount;
    DB.saveWallets(DB.getWallets().map(w => w.id === wallet.id ? wallet : w));

    // Record payment
    const payments = DB.getLiabilityPayments();
    payments.push({
        id: Utils.generateId(),
        liabilityId,
        amount: paymentAmount,
        date: paymentDate,
        notes: paymentNotes,
        createdAt: new Date().toISOString()
    });

    if (DB.saveLiabilityPayments(payments)) {
        Utils.closeModal('payLiabilityModal');
        
        // Record as expense transaction
        const transactions = DB.getTransactions();
        const category = this.getOrCreateLiabilityCategory();
        
        transactions.push({
            id: Utils.generateId(),
            type: 'expense',
            amount: paymentAmount,
            walletId: liability.walletId,
            categoryId: category,
            date: paymentDate,
            notes: `Pembayaran liabilitas: ${liability.name}` + (paymentNotes ? ` - ${paymentNotes}` : ''),
            createdAt: new Date().toISOString()
        });
        DB.saveTransactions(transactions);

        this.renderLiabilitiesList();
        this.renderLiabilitiesSummary();
        this.renderPaymentSchedule();
        this.renderPaymentHistory();
        this.renderWalletsList();
        this.updateTotalBalance();
        Utils.showToast('Pembayaran berhasil!', 'success');
    }
}

showLiabilityDetail(liabilityId) {
    const liability = DB.getLiabilities().find(l => l.id === liabilityId);
    if (!liability) return;

    const payments = DB.getLiabilityPayments()
        .filter(p => p.liabilityId === liabilityId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const paidAmount = this.calculatePaidAmount(liabilityId);
    const remaining = liability.amount - paidAmount;
    const progressPercent = (paidAmount / liability.amount) * 100;

    const paymentsHTML = payments.length === 0 ? 
        '<p style="text-align: center; color: #666;">Belum ada pembayaran</p>' :
        payments.map(payment => `
            <div class="payment-item">
                <div style="display: flex; justify-content: space-between;">
                    <span>${Utils.formatDate(payment.date)}</span>
                    <span style="color: var(--success-color);">-${Utils.formatCurrency(payment.amount)}</span>
                </div>
                ${payment.notes ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${payment.notes}</p>` : ''}
            </div>
        `).join('');

    const content = `
        <div style="margin-bottom: 20px;">
            <h4>${liability.name}</h4>
            <p><strong>Jenis:</strong> ${this.getLiabilityTypeName(liability.type)}</p>
            <p><strong>Total Hutang:</strong> ${Utils.formatCurrency(liability.amount)}</p>
            <p><strong>Suku Bunga:</strong> ${liability.interestRate}% per tahun</p>
            <p><strong>Jatuh Tempo:</strong> ${Utils.formatDate(liability.dueDate)}</p>
            <p><strong>Terbayar:</strong> <span style="color: var(--success-color);">${Utils.formatCurrency(paidAmount)}</span></p>
            <p><strong>Sisa:</strong> <span style="color: var(--warning-color);">${Utils.formatCurrency(remaining)}</span></p>
            
            <div class="debt-progress">
                <div class="debt-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
        </div>

        <h5>Riwayat Pembayaran</h5>
        <div style="max-height: 300px; overflow-y: auto;">
            ${paymentsHTML}
        </div>

        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button class="btn btn-success" onclick="app.showPayLiabilityModal('${liability.id}')" style="flex: 1;">
                💸 Bayar
            </button>
            <button class="btn btn-danger" onclick="app.deleteLiability('${liability.id}')" style="flex: 1;">
                🗑️ Hapus
            </button>
        </div>
    `;

    Utils.createModal('liabilityDetailModal', 'Detail Liabilitas', content);
    Utils.openModal('liabilityDetailModal');
}

getLiabilityTypeName(type) {
    const types = {
        'credit-card': 'Kartu Kredit',
        'loan': 'Pinjaman Bank',
        'mortgage': 'KPR',
        'personal': 'Pinjaman Pribadi',
        'other': 'Lainnya'
    };
    return types[type] || type;
}

deleteLiability(liabilityId) {
    if (confirm('Hapus liabilitas ini? Riwayat pembayaran juga akan dihapus.')) {
        let liabilities = DB.getLiabilities().filter(l => l.id !== liabilityId);
        let payments = DB.getLiabilityPayments().filter(p => p.liabilityId !== liabilityId);
        
        if (DB.saveLiabilities(liabilities) && DB.saveLiabilityPayments(payments)) {
            Utils.closeModal('liabilityDetailModal');
            this.renderLiabilitiesList();
            this.renderLiabilitiesSummary();
            this.renderPaymentSchedule();
            this.renderPaymentHistory();
            Utils.showToast('Liabilitas berhasil dihapus!', 'success');
        }
    }
}

getOrCreateLiabilityCategory() {
    const categories = DB.getCategories();
    let liabilityCategory = categories.find(c => c.name === 'Pembayaran Hutang' && c.type === 'expense');
    
    if (!liabilityCategory) {
        liabilityCategory = {
            id: Utils.generateId(),
            name: 'Pembayaran Hutang',
            type: 'expense',
            emoji: '🏦'
        };
        categories.push(liabilityCategory);
        DB.saveCategories(categories);
    }
    
    return liabilityCategory.id;
}
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FinanceApp();
    window.app = app;
});
