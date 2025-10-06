// MultipleFiles/js/main.js
import { DB } from './database.js';
import { Utils } from './utils.js';

// Import semua modul
import { DashboardModule } from './modules/dashboard.js';
import { TransactionsModule } from './modules/transactions.js';
import { BudgetModule } from './modules/budget.js';
import { ReportsModule } from './modules/reports.js';
import { CalendarModule } from './modules/calendar.js';
import { SettingsModule } from './modules/settings.js';
import { GoldModule } from './modules/gold.js';
import { LiabilitiesModule } from './modules/liabilities.js';

// ===== MAIN APP =====
class FinanceApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.calendarDate = new Date(); 
        this.budgetSubTab = 'budget';
        this.liabilitiesSubTab = 'liabilities';

        // Sediakan Utils dan DB di scope App dan Global (untuk kompatibilitas onclick)
        this.utils = Utils;
        window.DB = DB;
        
        // Properti untuk Quick Notes
        this.QUICK_NOTE_KEY = 'quickNoteContent';
        
        // Inisialisasi modul-modul
        this.dashboardModule = new DashboardModule(this);
        this.transactionsModule = new TransactionsModule(this);
        this.budgetModule = new BudgetModule(this);
        this.reportsModule = new ReportsModule(this);
        this.calendarModule = new CalendarModule(this);
        this.settingsModule = new SettingsModule(this);
        this.goldModule = new GoldModule(this);
        this.liabilitiesModule = new LiabilitiesModule(this);

        this.init();
    }

    init() {
        DB.init();
        this.setupEventListeners();
        Utils.initTheme();
        this.loadQuickNote(); // Muat catatan saat app dimulai
        this.render();
        this.updateTotalBalance();
    }

    setupEventListeners() {
        document.querySelector('.tab-navigation').addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });
        
        // PASANG EVENT LISTENERS UNTUK QUICK NOTE
        const toggleBtn = document.getElementById('quickNoteToggleBtn');
        const saveBtn = document.getElementById('saveQuickNoteBtn');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleQuickNotePopup());
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveQuickNote());
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

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
        
        tabContent.innerHTML = '';

        switch(tabName) {
            case 'dashboard':
                this.dashboardModule.render(tabContent);
                break;
            case 'transactions':
                this.transactionsModule.render(tabContent);
                break;
            case 'budget':
                this.budgetModule.render(tabContent);
                break;
            case 'reports':
                this.reportsModule.render(tabContent);
                break;
            case 'calendar':
                this.calendarModule.render(tabContent);
                break;
            case 'settings':
                this.settingsModule.render(tabContent);
                break;
            case 'gold':
                this.goldModule.render(tabContent);
                break;
            case 'saham':
                tabContent.innerHTML = '<div class="card"><p>Tab Saham sedang dalam pengembangan</p></div>';
                break;
            case 'liabilities':
                this.liabilitiesModule.render(tabContent);
                break;
            case 'Personalisasi':
                tabContent.innerHTML = '<div class="card"><p>Tab Personalisasi sedang dalam pengembangan</p></div>';
                break; 
           case 'Net Worth':
                tabContent.innerHTML = '<div class="card"><p>Tab Net Worth sedang dalam pengembangan</p></div>';
                break;
           case 'Kurs':
                tabContent.innerHTML = '<div class="card"><p>Tab Kurs sedang dalam pengembangan</p></div>';
                break;
            default:
                tabContent.innerHTML = '<div class="card"><p>Tab sedang dalam pengembangan</p></div>';
        }
    }

    render() {
        this.renderTabContent(this.currentTab);
    }

    // ====================================================================
    // Metode Global (Lanjutan) - Quick Note Logic
    // ====================================================================

    loadQuickNote() {
        const content = localStorage.getItem(this.QUICK_NOTE_KEY) || '';
        const textarea = document.getElementById('quickNoteContent');
        if (textarea) {
            textarea.value = content;
        }
    }

    saveQuickNote() {
        const content = document.getElementById('quickNoteContent').value;
        localStorage.setItem(this.QUICK_NOTE_KEY, content);
        Utils.showToast('Catatan berhasil disimpan!', 'info');
    }

    toggleQuickNotePopup() {
        const popup = document.getElementById('quickNotePopup');
        if (popup) {
            const isHidden = popup.classList.toggle('hidden');
            
            if (!isHidden) {
                this.loadQuickNote();
                document.getElementById('quickNoteContent').focus();
            }
        }
    }

    // ====================================================================
    // Metode Global (Lanjutan) - Wallet/Transaction/Data Management
    // Semua metode di bawah ini diakses melalui window.app.method() dari HTML inline
    // ====================================================================

    // Theme
    changeTheme(theme) {
        Utils.setTheme(theme);
        Utils.showToast(`Mode ${theme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
        if (this.currentTab === 'settings') {
            this.settingsModule.render(document.getElementById('settings-tab'));
        }
    }

    // Wallet
    showAddWalletModal() {
        // Logika Add Wallet Modal
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
                id: DB.generateId(),
                name,
                balance,
                emoji
            });
            
            if (DB.saveWallets(wallets)) {
                Utils.closeModal('addWalletModal');
                this.dashboardModule.renderWalletsList();
                this.updateTotalBalance();
                if (this.settingsModule && typeof this.settingsModule.updateAppInfo === 'function') {
                    this.settingsModule.updateAppInfo();
                }
                Utils.showToast('Dompet berhasil ditambahkan!', 'success');
            }
        };
    }

    showEditWalletModal(walletId) {
        // Logika Edit Wallet Modal
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
                <button type="button" class="btn btn-danger" style="width: 100%;" onclick="window.app.confirmDeleteWallet('${wallet.id}')">Hapus Dompet</button>
            </form>
        `;

        Utils.createModal('editWalletModal', 'Edit Dompet', content);
        Utils.openModal('editWalletModal');

        document.getElementById('editWalletForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('editWalletName').value;
            const newBalance = parseFloat(document.getElementById('editWalletBalance').value);
            const emoji = document.getElementById('editWalletEmoji').value;

            const updatedWallets = DB.getWallets().map(w => {
                if (w.id === walletId) {
                    return { ...w, name, balance: newBalance, emoji };
                }
                return w;
            });
            
            if (DB.saveWallets(updatedWallets)) {
                Utils.closeModal('editWalletModal');
                this.dashboardModule.renderWalletsList();
                this.updateTotalBalance();
                if (this.settingsModule && typeof this.settingsModule.updateAppInfo === 'function') {
                    this.settingsModule.updateAppInfo();
                }
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
                this.dashboardModule.renderWalletsList();
                this.dashboardModule.renderRecentTransactions();
                this.transactionsModule.renderAllTransactions();
                this.updateTotalBalance();
                if (this.settingsModule && typeof this.settingsModule.updateAppInfo === 'function') {
                    this.settingsModule.updateAppInfo();
                }
                Utils.showToast('Dompet dan transaksi terkait berhasil dihapus.', 'success');
            }
        }
    }

    // Transaction
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
            if (this.settingsModule && typeof this.settingsModule.showAddCategoryModal === 'function') {
                this.settingsModule.showAddCategoryModal();
            }
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

            if (isNaN(amount) || amount <= 0) {
                Utils.showToast('Jumlah harus lebih dari 0', 'error');
                return;
            }

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

            const transactions = DB.getTransactions();
            transactions.push({
                id: DB.generateId(),
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
                this.dashboardModule.renderRecentTransactions();
                this.transactionsModule.renderAllTransactions();
                this.dashboardModule.renderWalletsList();
                this.updateTotalBalance();
                if (this.settingsModule && typeof this.settingsModule.updateAppInfo === 'function') {
                    this.settingsModule.updateAppInfo();
                }
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
                <button type="button" class="btn btn-danger" style="width: 100%;" onclick="window.app.confirmDeleteTransaction('${transaction.id}')">Hapus Transaksi</button>
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

            if (isNaN(amount) || amount <= 0) {
                Utils.showToast('Jumlah harus lebih dari 0', 'error');
                return;
            }

            // Mengembalikan saldo dompet lama (rollback)
            const oldWallet = DB.getWallets().find(w => w.id === transaction.walletId);
            if (oldWallet) {
                if (transaction.type === 'income') {
                    oldWallet.balance -= transaction.amount;
                } else if (transaction.type === 'expense') {
                    oldWallet.balance += transaction.amount;
                }
                // Simpan sementara (akan di-overwrite sebentar lagi)
                DB.saveWallets(DB.getWallets().map(w => w.id === oldWallet.id ? oldWallet : w));
            }
            
            // Mengubah saldo dompet baru
            const newWallet = DB.getWallets().find(w => w.id === walletId);
            if (newWallet) {
                if (type === 'income') {
                    newWallet.balance += amount;
                } else if (type === 'expense') {
                    // Cek saldo untuk pengeluaran baru
                    if (newWallet.balance < amount) {
                        Utils.showToast('Saldo dompet tidak mencukupi!', 'error');
                        return;
                    }
                    newWallet.balance -= amount;
                }
                
                if (!DB.saveWallets(DB.getWallets().map(w => w.id === newWallet.id ? newWallet : w))) return;
            }

            // Memperbarui transaksi
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
                this.dashboardModule.renderRecentTransactions();
                this.transactionsModule.renderAllTransactions();
                this.dashboardModule.renderWalletsList();
                this.updateTotalBalance();
                if (this.settingsModule && typeof this.settingsModule.updateAppInfo === 'function') {
                    this.settingsModule.updateAppInfo();
                }
                Utils.showToast('Transaksi berhasil diperbarui!', 'success');
            }
        };
    }

    confirmDeleteTransaction(transactionId) {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            const transaction = DB.getTransactions().find(t => t.id === transactionId);
            if (!transaction) return;

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

            const transactions = DB.getTransactions().filter(t => t.id !== transactionId);
            
            if (DB.saveTransactions(transactions)) {
                Utils.closeModal('editTransactionModal');
                this.dashboardModule.renderRecentTransactions();
                this.transactionsModule.renderAllTransactions();
                this.dashboardModule.renderWalletsList();
                this.updateTotalBalance();
                if (this.settingsModule && typeof this.settingsModule.updateAppInfo === 'function') {
                    this.settingsModule.updateAppInfo();
                }
                Utils.showToast('Transaksi berhasil dihapus!', 'success');
            }
        }
    }

    // Transfer
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

            fromWallet.balance -= amount;
            toWallet.balance += amount;
            
            if (!DB.saveWallets(DB.getWallets().map(w => {
                if (w.id === fromWalletId) return fromWallet;
                if (w.id === toWalletId) return toWallet;
                return w;
            }))) return;

            let transferCategory = DB.getCategories().find(c => c.name === 'Transfer' && c.type === 'transfer');
            if (!transferCategory) {
                transferCategory = {
                    id: DB.generateId(),
                    name: 'Transfer',
                    type: 'transfer',
                    emoji: '🔄'
                };
                const categories = DB.getCategories();
                categories.push(transferCategory);
                if (!DB.saveCategories(categories)) return;
            }

            const transactions = DB.getTransactions();
            transactions.push({
                id: DB.generateId(),
                type: 'transfer',
                amount: amount,
                walletId: fromWalletId,
                categoryId: transferCategory.id,
                date: date,
                notes: `Transfer ke ${toWallet.name}` + (notes ? ` - ${notes}` : ''),
                createdAt: new Date().toISOString()
            });
            
            transactions.push({
                id: DB.generateId(),
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
                this.dashboardModule.renderRecentTransactions();
                this.transactionsModule.renderAllTransactions();
                this.dashboardModule.renderWalletsList();
                this.updateTotalBalance();
                if (this.settingsModule && typeof this.settingsModule.updateAppInfo === 'function') {
                    this.settingsModule.updateAppInfo();
                }
                Utils.showToast('Transfer berhasil!', 'success');
            }
        };
    }

    // Backup & Restore
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
                    onclick="window.app.downloadCompleteBackup()">
                💾 Download Backup 
            </button>
            
            <label class="btn btn-outline" style="width: 100%; display: block; text-align: center; margin-bottom: 10px;">
                📁 Restore Backup 
                <input type="file" id="restoreFile" accept=".json" style="display: none;" 
                    onchange="window.app.settingsModule.restoreCompleteBackup(event)">
            </label>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <h5>⚠️ Penting!</h5>
                <p style="font-size: 12px; margin: 0;">
                    - Backup hanya file .json<br>
                    - Restore akan <strong>mengganti semua data</strong><br>
                    - Simpan backup di tempat aman
                </p>
            </div>
        `;

        Utils.createModal('backupModal', 'Backup & Restore LENGKAP', content);
        Utils.openModal('backupModal');
    }

    downloadCompleteBackup() {
        if (DB.backupData()) {
            Utils.closeModal('backupModal');
        }
    }

    exportData() {
        this.downloadCompleteBackup();
    }

    exportToCSV() {
        // Logika exportToCSV
        try {
            const transactions = DB.getTransactions();
            const wallets = DB.getWallets();
            const categories = DB.getCategories();

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

    confirmClearAllData() {
        if (confirm('HAPUS SEMUA DATA? Tindakan ini tidak dapat dibatalkan!')) {
            if (confirm('Anda yakin? Semua data akan hilang permanen!')) {
                localStorage.clear();
                DB.init();
                this.render();
                this.updateTotalBalance();
                if (this.settingsModule && typeof this.settingsModule.updateAppInfo === 'function') {
                    this.settingsModule.updateAppInfo();
                }
                Utils.showToast('Data berhasil direset!', 'success');
            }
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FinanceApp();
    window.app = app; // Membuat instance app tersedia secara global untuk HTML inline onclick
});
