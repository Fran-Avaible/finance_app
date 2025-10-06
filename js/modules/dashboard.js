// MultipleFiles/js/modules/dashboard.js
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class DashboardModule {
    constructor(app) {
        this.app = app; // Referensi ke instance FinanceApp
    }

    render(container) {
        container.innerHTML = `
            <div class="quick-actions">
                <button class="btn btn-primary" onclick="window.app.showAddTransactionModal()">
                    <span>➕</span> Tambah Transaksi
                </button>
                <button class="btn btn-secondary" onclick="window.app.showTransferModal()">
                    <span>🔄</span> Transfer
                </button>
                <button class="btn btn-success" onclick="window.app.exportData()">
                    <span>📤</span> Export
                </button>
                <button class="btn btn-info" onclick="window.app.showBackupModal()">
                    <span>💾</span> Backup
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💰 Dompet Saya</h3>
                    <button class="btn btn-outline" onclick="window.app.showAddWalletModal()">+ Tambah Dompet</button>
                </div>
                <div id="walletsList"></div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📋 Transaksi Terakhir</h3>
                    <button class="btn btn-outline" onclick="window.app.switchTab('transactions')">Lihat Semua</button>
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
            <div class="wallet-card" onclick="window.app.showEditWalletModal('${wallet.id}')">
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
                <div class="transaction-item ${typeClass}" onclick="window.app.showEditTransactionModal('${transaction.id}')">
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
}