// MultipleFiles/js/database.js

export const DB = {
    init() {
        console.log('🔄 Initializing DB...');
        if (!localStorage.getItem('wallets')) {
            const defaultWallets = [
                { id: this.generateId(), name: 'Cash', balance: 500000, emoji: '💵' },
                { id: this.generateId(), name: 'Bank Account', balance: 1500000, emoji: '💳' }
            ];
            localStorage.setItem('wallets', JSON.stringify(defaultWallets));
            console.log('✅ Default wallets created');
        }

        if (!localStorage.getItem('categories')) {
            const defaultCategories = [
                { id: this.generateId(), name: 'Food', type: 'expense', emoji: '🍔' },
                { id: this.generateId(), name: 'Transport', type: 'expense', emoji: '🚌' },
                { id: this.generateId(), name: 'Salary', type: 'income', emoji: '💰' },
                { id: this.generateId(), name: 'Shopping', type: 'expense', emoji: '🛍️' },
                { id: this.generateId(), name: 'Entertainment', type: 'expense', emoji: '🎬' },
                { id: this.generateId(), name: 'Utilities', type: 'expense', emoji: '💡' },
                { id: this.generateId(), name: 'Transfer', type: 'transfer', emoji: '🔄' }
            ];
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
            console.log('✅ Default categories created');
        }

        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
        }

        if (!localStorage.getItem('budgets')) {
            localStorage.setItem('budgets', JSON.stringify([]));
        }

        // Initialize gold data
        if (!localStorage.getItem('goldWallets')) {
            const defaultGoldWallets = [
                { 
                    id: this.generateId(), 
                    name: 'Tabungan Emas', 
                    type: 'gold',
                    weight: 0,
                    purity: 24,
                    buyPrice: 0,
                    emoji: '🪙'
                }
            ];
            localStorage.setItem('goldWallets', JSON.stringify(defaultGoldWallets));
        }
        
        if (!localStorage.getItem('goldTransactions')) {
            localStorage.setItem('goldTransactions', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('currentGoldPrice')) {
            this.saveGoldPrice({
                buy: 1000000,
                sell: 980000,
                source: 'Initial'
            });
        }

        // Initialize savings goals
        if (!localStorage.getItem('savingsGoals')) {
            localStorage.setItem('savingsGoals', JSON.stringify([]));
        }
        if (!localStorage.getItem('savingsTransactions')) {
            localStorage.setItem('savingsTransactions', JSON.stringify([]));
        }

        // Initialize bill reminders
        if (!localStorage.getItem('billReminders')) {
            localStorage.setItem('billReminders', JSON.stringify([]));
        }

        // Initialize liabilities
        if (!localStorage.getItem('liabilities')) {
            localStorage.setItem('liabilities', JSON.stringify([]));
        }
        if (!localStorage.getItem('liabilityPayments')) {
            localStorage.setItem('liabilityPayments', JSON.stringify([]));
        }

        console.log('✅ DB initialization complete');
    },

    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
            window.app.utils.showToast('Gagal menyimpan data dompet', 'error');
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
            window.app.utils.showToast('Gagal menyimpan data kategori', 'error');
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
            window.app.utils.showToast('Gagal menyimpan data transaksi', 'error');
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
            window.app.utils.showToast('Gagal menyimpan data budget', 'error');
            return false;
        }
    },

    getCategoryById(categoryId) {
        return this.getCategories().find(c => c.id === categoryId);
    },

    getGoldWallets() {
        return JSON.parse(localStorage.getItem('goldWallets') || '[]');
    },

    saveGoldWallets(wallets) {
        try {
            localStorage.setItem('goldWallets', JSON.stringify(wallets));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan goldWallets:', e);
            return false;
        }
    },

    getGoldTransactions() {
        return JSON.parse(localStorage.getItem('goldTransactions') || '[]');
    },

    saveGoldTransactions(transactions) {
        try {
            localStorage.setItem('goldTransactions', JSON.stringify(transactions));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan goldTransactions:', e);
            return false;
        }
    },

    getGoldPrice() {
        const saved = localStorage.getItem('currentGoldPrice');
        if (!saved) {
            return { buy: 1000000, sell: 980000, lastUpdate: '', source: 'Default' };
        }
        return JSON.parse(saved);
    },

    saveGoldPrice(price) {
        try {
            const completePrice = {
                buy: price.buy,
                sell: price.sell,
                lastUpdate: new Date().toISOString(),
                source: price.source || 'Manual Input'
            };
            
            localStorage.setItem('currentGoldPrice', JSON.stringify(completePrice));
            console.log('💾 Gold price saved:', completePrice);
            return true;
        } catch (e) {
            console.error('Gagal menyimpan gold price:', e);
            return false;
        }
    },

    async fetchPegadaianGoldPrice() {
        try {
            console.log('🔄 Fetching gold price from Pegadaian...');
            
            const priceData = await this.simulateGoldPriceFetch();
            if (priceData && priceData.buy > 0) {
                console.log('✅ Gold price fetched:', priceData);
                return priceData;
            }
            
            return this.getDefaultGoldPrice();
            
        } catch (error) {
            console.error('❌ Gold price fetch failed:', error);
            return this.getDefaultGoldPrice();
        }
    },

    simulateGoldPriceFetch() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const basePrice = 1200000;
                const randomVariation = Math.random() * 50000 - 25000;
                const currentBuy = Math.round(basePrice + randomVariation);
                const currentSell = Math.round(currentBuy * 0.96);
                
                resolve({
                    buy: currentBuy,
                    sell: currentSell,
                    lastUpdate: new Date().toISOString(),
                    source: 'Pegadaian (Simulated)'
                });
            }, 2000);
        });
    },

    getDefaultGoldPrice() {
        return {
            buy: 1200000,
            sell: 1150000,
            lastUpdate: new Date().toISOString(),
            source: 'Default'
        };
    },

    getSavingsGoals() {
        return JSON.parse(localStorage.getItem('savingsGoals') || '[]');
    },

    saveSavingsGoals(goals) {
        try {
            localStorage.setItem('savingsGoals', JSON.stringify(goals));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan savings goals:', e);
            return false;
        }
    },

    getSavingsTransactions() {
        return JSON.parse(localStorage.getItem('savingsTransactions') || '[]');
    },

    saveSavingsTransactions(transactions) {
        try {
            localStorage.setItem('savingsTransactions', JSON.stringify(transactions));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan savings transactions:', e);
            return false;
        }
    },

    getBillReminders() {
        return JSON.parse(localStorage.getItem('billReminders') || '[]');
    },

    saveBillReminders(reminders) {
        try {
            localStorage.setItem('billReminders', JSON.stringify(reminders));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan bill reminders:', e);
            return false;
        }
    },

    getLiabilities() {
        return JSON.parse(localStorage.getItem('liabilities') || '[]');
    },

    saveLiabilities(liabilities) {
        try {
            localStorage.setItem('liabilities', JSON.stringify(liabilities));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan liabilities:', e);
            return false;
        }
    },

    getLiabilityPayments() {
        return JSON.parse(localStorage.getItem('liabilityPayments') || '[]');
    },

    saveLiabilityPayments(payments) {
        try {
            localStorage.setItem('liabilityPayments', JSON.stringify(payments));
            return true;
        } catch (e) {
            console.error('Gagal menyimpan liability payments:', e);
            return false;
        }
    },

    backupData() {
        try {
            const data = {
                wallets: this.getWallets(),
                categories: this.getCategories(),
                transactions: this.getTransactions(),
                budgets: this.getBudgets(),
                goldWallets: this.getGoldWallets(),
                goldTransactions: this.getGoldTransactions(),
                currentGoldPrice: this.getGoldPrice(),
                liabilities: this.getLiabilities(),
                liabilityPayments: this.getLiabilityPayments(),
                savingsGoals: this.getSavingsGoals(),
                savingsTransactions: this.getSavingsTransactions(),
                billReminders: this.getBillReminders(),
                theme: window.app.utils.getTheme(),
                exportedAt: new Date().toISOString(),
                version: '3.0',
                dataCount: {
                    wallets: this.getWallets().length,
                    transactions: this.getTransactions().length,
                    budgets: this.getBudgets().length,
                    goldWallets: this.getGoldWallets().length,
                    goldTransactions: this.getGoldTransactions().length,
                    liabilities: this.getLiabilities().length,
                    liabilityPayments: this.getLiabilityPayments().length,
                    savingsGoals: this.getSavingsGoals().length,
                    billReminders: this.getBillReminders().length
                }
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance_complete_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            console.log('💾 Complete backup created:', data.dataCount);
            window.app.utils.showToast('Backup berhasil diunduh!', 'success');
            return true;
        } catch (e) {
            console.error('Backup error:', e);
            window.app.utils.showToast('Gagal membuat backup ', 'error');
            return false;
        }
    },

    restoreData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.wallets || !data.categories || !data.transactions) {
                throw new Error('Format backup tidak valid');
            }

            console.log('🔄 Restoring data:', data.dataCount || 'Unknown version');

            this.saveWallets(data.wallets);
            this.saveCategories(data.categories);
            this.saveTransactions(data.transactions);
            this.saveBudgets(data.budgets || []);

            if (data.goldWallets) this.saveGoldWallets(data.goldWallets);
            if (data.goldTransactions) this.saveGoldTransactions(data.goldTransactions);
            if (data.currentGoldPrice) this.saveGoldPrice(data.currentGoldPrice);

            if (data.liabilities) this.saveLiabilities(data.liabilities);
            if (data.liabilityPayments) this.saveLiabilityPayments(data.liabilityPayments);

            if (data.savingsGoals) this.saveSavingsGoals(data.savingsGoals);
            if (data.savingsTransactions) this.saveSavingsTransactions(data.savingsTransactions);
            if (data.billReminders) this.saveBillReminders(data.billReminders);

            if (data.theme) window.app.utils.setTheme(data.theme);

            console.log('🎉 Complete restore successful!');
            return true;
        } catch (e) {
            console.error('Restore error:', e);
            window.app.utils.showToast('Gagal memulihkan data! File mungkin rusak.', 'error');
            return false;
        }
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

console.log('✅ DB loaded as module');