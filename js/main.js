// js/main.js (Versi Final dan Lengkap dengan async/await untuk IndexedDB)

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
import { PersonalizationModule } from './modules/personalization.js';

// ===== MAIN APP =====
class FinanceApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.calendarDate = new Date();
        this.budgetSubTab = 'budget';
        this.liabilitiesSubTab = 'liabilities';

        this.utils = Utils;
        window.DB = DB;
        
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
        this.personalizationModule = new PersonalizationModule(this);

        this.init();
    }

    async init() {
        try {
            await DB.init();
            this.setupEventListeners();
            this.personalizationModule.applyToApp();
            this.loadQuickNote();
            this.renderNewsTicker();
            await this.render();
            await this.updateTotalBalance();
        } catch (error) {
            console.error("Failed to initialize the app:", error);
            document.body.innerHTML = '<div style="text-align: center; padding: 50px;"><h1>Error</h1><p>Gagal memuat database aplikasi. Silakan coba segarkan halaman.</p></div>';
        }
    }

    setupEventListeners() {
        document.querySelector('.tab-navigation').addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });
        
        const toggleBtn = document.getElementById('quickNoteToggleBtn');
        const saveBtn = document.getElementById('saveQuickNoteBtn');

        if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleQuickNotePopup());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveQuickNote());
    }
    
    renderNewsTicker() {
        const container = document.getElementById('newsTickerContainer');
        if (!container) return;
        
        const newsContent = [
            '⚠️ PERINGATAN: Kami bersiap migrasi besar ke V3.9.0 untuk stabilitas dan fitur baru! Harap Backup Data Anda.',
            '📞 Kontak WA: 082181238808 (Hanya Chat)',
            '📧 Feedback & Saran: afrandsyahromi08@gmail.com',
            '✨ Terima kasih telah menggunakan Super App ini!'
        ];

        container.innerHTML = `<div class="news-ticker-content">${newsContent.join(' | ')} |</div>`;
    }

    async switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;
        await this.renderTabContent(tabName);
    }

    async updateTotalBalance() {
        const wallets = await DB.getWallets();
        const total = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
        document.getElementById('totalBalance').textContent = Utils.formatCurrency(total);
    }

    async renderTabContent(tabName) {
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (!tabContent) return;
        tabContent.innerHTML = '';

        switch(tabName) {
            case 'dashboard': await this.dashboardModule.render(tabContent); break;
            case 'transactions': await this.transactionsModule.render(tabContent); break;
            case 'budget': await this.budgetModule.render(tabContent); break;
            case 'reports': await this.reportsModule.render(tabContent); break;
            case 'calendar': await this.calendarModule.render(tabContent); break;
            case 'settings': await this.settingsModule.render(tabContent); break;
            case 'gold': await this.goldModule.render(tabContent); break;
            case 'liabilities': await this.liabilitiesModule.render(tabContent); break;
            case 'personalization': await this.personalizationModule.render(tabContent); break;
            default:
                tabContent.innerHTML = '<div class="card"><p>Tab sedang dalam pengembangan</p></div>';
        }
    }

    

    async render() {
        await this.renderTabContent(this.currentTab);
    }

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
    // Metode Global yang menjadi async
    // ====================================================================

    async showAddWalletModal() {
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

        document.getElementById('addWalletForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('walletName').value;
            const balance = parseFloat(document.getElementById('walletBalance').value);
            const emoji = document.getElementById('walletEmoji').value;

            const wallets = await DB.getWallets();
            wallets.push({ 
                id: DB.generateId(), 
                name, 
                balance, 
                emoji 
            });
            
            await DB.saveWallets(wallets);
            Utils.closeModal('addWalletModal');
            await this.render();
            await this.updateTotalBalance();
            Utils.showToast('Dompet berhasil ditambahkan!', 'success');
        };
    }

    async showEditWalletModal(walletId) {
        const wallets = await DB.getWallets();
        const wallet = wallets.find(w => w.id === walletId);
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

        document.getElementById('editWalletForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('editWalletName').value;
            const balance = parseFloat(document.getElementById('editWalletBalance').value);
            const emoji = document.getElementById('editWalletEmoji').value;

            const wallets = await DB.getWallets();
            const updatedWallets = wallets.map(w => 
                w.id === walletId ? { ...w, name, balance, emoji } : w
            );
            
            await DB.saveWallets(updatedWallets);
            Utils.closeModal('editWalletModal');
            await this.render();
            await this.updateTotalBalance();
            Utils.showToast('Dompet berhasil diperbarui!', 'success');
        };
    }

    async confirmDeleteWallet(walletId) {
        if (confirm('Yakin hapus dompet ini? Semua transaksi terkait juga akan dihapus.')) {
            const [wallets, transactions] = await Promise.all([
                DB.getWallets(), 
                DB.getTransactions()
            ]);
            
            const updatedWallets = wallets.filter(w => w.id !== walletId);
            const updatedTransactions = transactions.filter(t => t.walletId !== walletId);
            
            await Promise.all([
                DB.saveWallets(updatedWallets),
                DB.saveTransactions(updatedTransactions)
            ]);
            
            Utils.closeModal('editWalletModal');
            await this.render();
            await this.updateTotalBalance();
            Utils.showToast('Dompet berhasil dihapus.', 'success');
        }
    }

    async showAddTransactionModal() {
        const [wallets, categories] = await Promise.all([
            DB.getWallets(), 
            DB.getCategories()
        ]);
        
        if (wallets.length === 0) {
            Utils.showToast('Tambahkan dompet terlebih dahulu!', 'error');
            return this.showAddWalletModal();
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

        const incomeCategories = categories.filter(c => c.type === 'income');
        const expenseCategories = categories.filter(c => c.type === 'expense');
        
        const incomeOptions = incomeCategories.map(c => 
            `<option value="${c.id}">${c.emoji} ${c.name}</option>`
        ).join('');
        
        const expenseOptions = expenseCategories.map(c => 
            `<option value="${c.id}">${c.emoji} ${c.name}</option>`
        ).join('');

        const content = `
            <form id="addTransactionForm">
                <div class="form-group">
                    <label class="form-label">Tipe Transaksi</label>
                    <select class="form-control" id="transactionType" required>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
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
                        <option value="">Pilih kategori</option>
                        <optgroup label="Pemasukan" id="incomeCategories" style="display: none;">
                            ${incomeOptions}
                        </optgroup>
                        <optgroup label="Pengeluaran" id="expenseCategories">
                            ${expenseOptions}
                        </optgroup>
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
            
            <script>
                document.getElementById('transactionType').addEventListener('change', function() {
                    const type = this.value;
                    const incomeGroup = document.getElementById('incomeCategories');
                    const expenseGroup = document.getElementById('expenseCategories');
                    
                    if (type === 'income') {
                        incomeGroup.style.display = 'block';
                        expenseGroup.style.display = 'none';
                        if (incomeGroup.children.length > 0) {
                            document.getElementById('transactionCategory').value = incomeGroup.children[0].value;
                        }
                    } else {
                        incomeGroup.style.display = 'none';
                        expenseGroup.style.display = 'block';
                        if (expenseGroup.children.length > 0) {
                            document.getElementById('transactionCategory').value = expenseGroup.children[0].value;
                        }
                    }
                });
                
                document.getElementById('transactionType').dispatchEvent(new Event('change'));
            </script>
        `;
        
        Utils.createModal('addTransactionModal', 'Tambah Transaksi', content);
        Utils.openModal('addTransactionModal');

        setTimeout(() => {
            const form = document.getElementById('addTransactionForm');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    await this.processAddTransaction();
                };
            }
        }, 100);
    }

    async processAddTransaction() {
        const type = document.getElementById('transactionType').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const walletId = document.getElementById('transactionWallet').value;
        const categoryId = document.getElementById('transactionCategory').value;
        const date = document.getElementById('transactionDate').value;
        const notes = document.getElementById('transactionNotes').value;

        if (!categoryId) {
            return Utils.showToast('Pilih kategori terlebih dahulu!', 'error');
        }

        const [allWallets, transactions] = await Promise.all([
            DB.getWallets(), 
            DB.getTransactions()
        ]);
        
        const wallet = allWallets.find(w => w.id === walletId);
        
        if (!wallet) {
            return Utils.showToast('Dompet tidak ditemukan!', 'error');
        }
        
        if (type === 'expense' && wallet.balance < amount) {
            return Utils.showToast('Saldo dompet tidak mencukupi!', 'error');
        }
        
        // Update saldo dompet
        wallet.balance += (type === 'income' ? amount : -amount);
        await DB.saveWallets(allWallets);

        // Tambahkan transaksi
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
        await DB.saveTransactions(transactions);

        Utils.closeModal('addTransactionModal');
        await this.render();
        await this.updateTotalBalance();
        Utils.showToast('Transaksi berhasil ditambahkan!', 'success');
    }

    async showEditTransactionModal(transactionId) {
        const transactions = await DB.getTransactions();
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const [wallets, categories] = await Promise.all([
            DB.getWallets(), 
            DB.getCategories()
        ]);

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

        document.getElementById('editTransactionForm').onsubmit = async (e) => {
            e.preventDefault();
            const newType = document.getElementById('editTransactionType').value;
            const newAmount = parseFloat(document.getElementById('editTransactionAmount').value);
            const newWalletId = document.getElementById('editTransactionWallet').value;
            const newCategoryId = document.getElementById('editTransactionCategory').value;
            const newDate = document.getElementById('editTransactionDate').value;
            const newNotes = document.getElementById('editTransactionNotes').value;

            // Proses rumit: Rollback saldo lama, terapkan saldo baru
            const allWallets = await DB.getWallets();
            const oldWallet = allWallets.find(w => w.id === transaction.walletId);
            const newWallet = allWallets.find(w => w.id === newWalletId);

            // 1. Kembalikan saldo dari transaksi lama
            if (oldWallet) {
                oldWallet.balance += (transaction.type === 'income' ? -transaction.amount : transaction.amount);
            }

            // 2. Cek saldo dan terapkan transaksi baru
            if (newType === 'expense' && newWallet.balance < newAmount) {
                 // Batalkan rollback jika saldo tidak cukup
                if (oldWallet) oldWallet.balance -= (transaction.type === 'income' ? -transaction.amount : transaction.amount);
                return Utils.showToast('Saldo dompet tujuan tidak mencukupi!', 'error');
            }
            
            newWallet.balance += (newType === 'income' ? newAmount : -newAmount);
            await DB.saveWallets(allWallets);

            // 3. Update data transaksi
            const updatedTransactions = transactions.map(t => 
                t.id === transactionId ? { 
                    ...t, 
                    type: newType,
                    amount: newAmount,
                    walletId: newWalletId,
                    categoryId: newCategoryId,
                    date: newDate,
                    notes: newNotes
                } : t
            );
            await DB.saveTransactions(updatedTransactions);

            Utils.closeModal('editTransactionModal');
            await this.render();
            await this.updateTotalBalance();
            Utils.showToast('Transaksi berhasil diperbarui!', 'success');
        };
    }

    async confirmDeleteTransaction(transactionId) {
        if (confirm('Yakin hapus transaksi ini?')) {
            const [transactions, wallets] = await Promise.all([
                DB.getTransactions(), 
                DB.getWallets()
            ]);
            
            const transaction = transactions.find(t => t.id === transactionId);
            if (!transaction) return;

            const wallet = wallets.find(w => w.id === transaction.walletId);
            if (wallet) {
                wallet.balance += (transaction.type === 'income' ? -transaction.amount : transaction.amount);
                await DB.saveWallets(wallets);
            }

            const updatedTransactions = transactions.filter(t => t.id !== transactionId);
            await DB.saveTransactions(updatedTransactions);

            Utils.closeModal('editTransactionModal');
            await this.render();
            await this.updateTotalBalance();
            Utils.showToast('Transaksi berhasil dihapus!', 'success');
        }
    }

    async showTransferModal() {
        const wallets = await DB.getWallets();
        if (wallets.length < 2) {
            return Utils.showToast('Anda perlu minimal 2 dompet untuk transfer!', 'error');
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

        document.getElementById('transferForm').onsubmit = async (e) => {
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

            const allWallets = await DB.getWallets();
            const fromWallet = allWallets.find(w => w.id === fromWalletId);
            const toWallet = allWallets.find(w => w.id === toWalletId);

            if (!fromWallet || !toWallet) {
                Utils.showToast('Dompet tidak ditemukan!', 'error');
                return;
            }

            if (fromWallet.balance < amount) {
                Utils.showToast('Saldo dompet asal tidak cukup!', 'error');
                return;
            }
            
            fromWallet.balance -= amount;
            toWallet.balance += amount;
            await DB.saveWallets(allWallets);

            // Buat 2 entri transaksi transfer
            let transferCategory = await DB.getCategories().then(cats => 
                cats.find(c => c.name === 'Transfer' && c.type === 'transfer')
            );
            
            if (!transferCategory) {
                transferCategory = {
                    id: DB.generateId(),
                    name: 'Transfer',
                    type: 'transfer',
                    emoji: '🔄'
                };
                const categories = await DB.getCategories();
                categories.push(transferCategory);
                await DB.saveCategories(categories);
            }

            const transactions = await DB.getTransactions();
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
            
            await DB.saveTransactions(transactions);

            Utils.closeModal('transferModal');
            await this.render();
            await this.updateTotalBalance();
            Utils.showToast('Transfer berhasil!', 'success');
        };
    }

    async showBackupModal() {
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
                💾 Download Backup LENGKAP
            </button>
            
            <label class="btn btn-outline" style="width: 100%; display: block; text-align: center; margin-bottom: 10px;">
                📁 Restore Backup LENGKAP
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

    async downloadCompleteBackup() {
        if (await DB.backupData()) {
            Utils.closeModal('backupModal');
        }
    }

    async exportToCSV() {
        try {
            const [transactions, wallets, categories] = await Promise.all([
                DB.getTransactions(), 
                DB.getWallets(), 
                DB.getCategories()
            ]);

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

    async confirmClearAllData() {
        if (confirm('HAPUS SEMUA DATA? Tindakan ini tidak dapat dibatalkan!')) {
            if (confirm('Anda yakin? Semua data akan hilang permanen!')) {
                // Hapus database IndexedDB
                await new Promise((resolve, reject) => {
                    const deleteRequest = indexedDB.deleteDatabase(DB.dbName);
                    deleteRequest.onsuccess = () => { 
                        console.log("Database deleted"); 
                        resolve(); 
                    };
                    deleteRequest.onerror = () => { 
                        console.error("Error deleting database"); 
                        reject(); 
                    };
                    deleteRequest.onblocked = () => { 
                        console.warn("Database delete blocked"); 
                        reject(); 
                    };
                });
                
                // Hapus juga local storage untuk item non-db seperti catatan
                localStorage.clear();
                
                // Refresh halaman untuk re-inisialisasi dari awal
                Utils.showToast('Data berhasil direset! Aplikasi akan dimuat ulang.', 'success');
                setTimeout(() => window.location.reload(), 2000);
            }
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FinanceApp();
    window.app = app;
});
