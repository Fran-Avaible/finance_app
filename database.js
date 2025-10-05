// ===== DATABASE =====
const DB = {
    init() {
        if (!localStorage.getItem('wallets')) {
            const defaultWallets = [
                { id: Utils.generateId(), name: 'Cash', balance: 500000, emoji: '💵' },
                { id: Utils.generateId(), name: 'Bank Account', balance: 1500000, emoji: '💳' }
            ];
            localStorage.setItem('wallets', JSON.stringify(defaultWallets));
        }

        if (!localStorage.getItem('categories')) {
            const defaultCategories = [
                { id: Utils.generateId(), name: 'Food', type: 'expense', emoji: '🍔' },
                { id: Utils.generateId(), name: 'Transport', type: 'expense', emoji: '🚌' },
                { id: Utils.generateId(), name: 'Salary', type: 'income', emoji: '💰' },
                { id: Utils.generateId(), name: 'Shopping', type: 'expense', emoji: '🛍️' },
                { id: Utils.generateId(), name: 'Entertainment', type: 'expense', emoji: '🎬' },
                { id: Utils.generateId(), name: 'Utilities', type: 'expense', emoji: '💡' },
                { id: Utils.generateId(), name: 'Transfer', type: 'transfer', emoji: '🔄' }
            ];
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }

        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
        }

        if (!localStorage.getItem('budgets')) {
            localStorage.setItem('budgets', JSON.stringify([]));
        }
    },

    getWallets() {
        return JSON.parse(localStorage.getItem('wallets') || '[]');
    },

    saveWallets(wallets) {
        try {
            localStorage.setItem('wallets', JSON.stringify(wallets));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan wallets:', e);
            Utils.showToast('Gagal menyimpan data dompet', 'error');
            return false;
        }
    },

    getCategories() {
        return JSON.parse(localStorage.getItem('categories') || '[]');
    },

    saveCategories(categories) {
        try {
            localStorage.setItem('categories', JSON.stringify(categories));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan categories:', e);
            Utils.showToast('Gagal menyimpan data kategori', 'error');
            return false;
        }
    },

    getTransactions() {
        return JSON.parse(localStorage.getItem('transactions') || '[]');
    },

    saveTransactions(transactions) {
        try {
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan transactions:', e);
            Utils.showToast('Gagal menyimpan data transaksi', 'error');
            return false;
        }
    },

    getBudgets() {
        return JSON.parse(localStorage.getItem('budgets') || '[]');
    },

    saveBudgets(budgets) {
        try {
            localStorage.setItem('budgets', JSON.stringify(budgets));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan budgets:', e);
            Utils.showToast('Gagal menyimpan data budget', 'error');
            return false;
        }
    },

    getCategoryById(categoryId) {
        return this.getCategories().find(c => c.id === categoryId);
    },

backupData() {
    try {
        const data = {
            wallets: this.getWallets(),
            categories: this.getCategories(),
            transactions: this.getTransactions(),
            budgets: this.getBudgets(),
            exportedAt: new Date().toISOString(),
            type: 'backup'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        Utils.showToast('Backup JSON berhasil diunduh!', 'success');
        return true;
    } catch (e) {
        console.error('Backup error:', e);
        Utils.showToast('Gagal membuat backup', 'error');
        return false;
    }
},

    restoreData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.wallets && data.categories && data.transactions) {
                this.saveWallets(data.wallets);
                this.saveCategories(data.categories);
                this.saveTransactions(data.transactions);
                this.saveBudgets(data.budgets || []);
                return true;
            }
        } catch (e) {
            console.error('Restore error:', e);
        }
        return false;
    },

    autoBackup() {
        const lastBackup = localStorage.getItem('lastBackup');
        const today = new Date().toDateString();
        
        if (lastBackup !== today) {
            this.backupData();
            localStorage.setItem('lastBackup', today);
        }
    }
};
