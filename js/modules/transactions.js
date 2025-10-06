// MultipleFiles/js/modules/transactions.js
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class TransactionsModule {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🔍 Semua Transaksi</h3>
                    <div class="data-management">
                        <button class="btn btn-warning" onclick="window.app.exportToCSV()">
                            <span>📤</span> Export CSV
                        </button>
                        <button class="btn btn-info" onclick="window.app.downloadCompleteBackup()">
                            <span>💾</span> Backup
                        </button>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div class="tab-grid tab-grid-2">
                        <div>
                            <label class="form-label">Filter by Wallet:</label>
                            <select id="filterWallet" class="form-control" onchange="window.app.transactionsModule.applyFilters()">
                                <option value="">Semua Wallet</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Filter by Kategori:</label>
                            <select id="filterCategory" class="form-control" onchange="window.app.transactionsModule.applyFilters()">
                                <option value="">Semua Kategori</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Dari Tanggal:</label>
                            <input type="date" id="filterDateFrom" class="form-control" onchange="window.app.transactionsModule.applyFilters()">
                        </div>
                        <div>
                            <label class="form-label">Sampai Tanggal:</label>
                            <input type="date" id="filterDateTo" class="form-control" onchange="window.app.transactionsModule.applyFilters()">
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
}