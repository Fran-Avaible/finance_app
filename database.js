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

// GANTI method backupData dengan yang INI:
// Pastikan backupData() mencakup data baru
backupData() {
    try {
        const data = {
            // Data utama
            wallets: this.getWallets(),
            categories: this.getCategories(),
            transactions: this.getTransactions(),
            budgets: this.getBudgets(),
            
            // Data emas
            goldWallets: this.getGoldWallets(),
            goldTransactions: this.getGoldTransactions(),
            currentGoldPrice: this.getGoldPrice(),
            
            // Data liabilitas
            liabilities: this.getLiabilities(),
            liabilityPayments: this.getLiabilityPayments(),
            
            // === TAMBAHKAN DATA BARU ===
            savingsGoals: this.getSavingsGoals(),
            savingsTransactions: this.getSavingsTransactions(),
            billReminders: this.getBillReminders(),
            // ===========================
            theme: Utils.getTheme(),
            
            // Metadata
            exportedAt: new Date().toISOString(),
            version: '3.0',
            type: 'complete-backup',
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
        Utils.showToast('Backup LENGKAP berhasil diunduh!', 'success');
        return true;
    } catch (e) {
        console.error('Backup error:', e);
        Utils.showToast('Gagal membuat backup lengkap', 'error');
        return false;
    }
},

// Pastikan restoreData() mencakup data baru
restoreData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        // Validasi basic structure
        if (!data.wallets || !data.categories || !data.transactions) {
            throw new Error('Format backup tidak valid');
        }

        console.log('🔄 Restoring data:', data.dataCount || 'Unknown version');

        // Restore data utama
        this.saveWallets(data.wallets);
        this.saveCategories(data.categories);
        this.saveTransactions(data.transactions);
        this.saveBudgets(data.budgets || []);

        // Restore data emas
        if (data.goldWallets) this.saveGoldWallets(data.goldWallets);
        if (data.goldTransactions) this.saveGoldTransactions(data.goldTransactions);
        if (data.currentGoldPrice) this.saveGoldPrice(data.currentGoldPrice);

        // Restore data liabilitas
        if (data.liabilities) this.saveLiabilities(data.liabilities);
        if (data.liabilityPayments) this.saveLiabilityPayments(data.liabilityPayments);

        // === RESTORE DATA BARU ===
        if (data.savingsGoals) this.saveSavingsGoals(data.savingsGoals);
        if (data.savingsTransactions) this.saveSavingsTransactions(data.savingsTransactions);
        if (data.billReminders) this.saveBillReminders(data.billReminders);
        // =========================
        if (data.theme) {Utils.setTheme(data.theme); }

        console.log('🎉 Complete restore successful!');
        return true;
        
    } catch (e) {
        console.error('Restore error:', e);
        Utils.showToast('Gagal memulihkan data! File mungkin rusak.', 'error');
        return false;
    }
},

// PERBAIKI method restoreData:
restoreData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        // Validasi basic structure
        if (!data.wallets || !data.categories || !data.transactions) {
            throw new Error('Format backup tidak valid');
        }

        console.log('🔄 Restoring data:', data.dataCount || 'Unknown version');

        // Restore data utama
        this.saveWallets(data.wallets);
        this.saveCategories(data.categories);
        this.saveTransactions(data.transactions);
        this.saveBudgets(data.budgets || []);

        // === RESTORE DATA BARU ===
        // Restore data emas
        if (data.goldWallets) {
            this.saveGoldWallets(data.goldWallets);
            console.log('✅ Restored gold wallets:', data.goldWallets.length);
        }
        
        if (data.goldTransactions) {
            this.saveGoldTransactions(data.goldTransactions);
            console.log('✅ Restored gold transactions:', data.goldTransactions.length);
        }
        
        if (data.currentGoldPrice) {
            this.saveGoldPrice(data.currentGoldPrice);
            console.log('✅ Restored gold price');
        }

        // Restore data liabilitas
        if (data.liabilities) {
            this.saveLiabilities(data.liabilities);
            console.log('✅ Restored liabilities:', data.liabilities.length);
        }
        
        if (data.liabilityPayments) {
            this.saveLiabilityPayments(data.liabilityPayments);
            console.log('✅ Restored liability payments:', data.liabilityPayments.length);
        }

        // Restore data tambahan jika ada
        if (data.savingsGoals) this.saveSavingsGoals(data.savingsGoals);
        if (data.billReminders) this.saveBillReminders(data.billReminders);

        console.log('🎉 Complete restore successful!');
        return true;
        
    } catch (e) {
        console.error('Restore error:', e);
        Utils.showToast('Gagal memulihkan data! File mungkin rusak.', 'error');
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
    },

// Tambahkan methods untuk savings goals
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

// Tambahkan methods untuk bill reminders
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
    // Tambahkan di DB object

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

// ===== GOLD FEATURE IN DATABASE.JS =====

// Tambahkan di DB object
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
        // Return default price jika belum ada
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

// Method untuk fetch harga emas yang sudah diperbaiki
async fetchPegadaianGoldPrice() {
    try {
        console.log('🔄 Fetching gold price from Pegadaian...');
        
        // Simulasi fetching harga dengan variasi realistis
        const priceData = await this.simulateGoldPriceFetch();
        if (priceData && priceData.buy > 0) {
            console.log('✅ Gold price fetched:', priceData);
            return priceData;
        }
        
        // Fallback ke harga default
        return this.getDefaultGoldPrice();
        
    } catch (error) {
        console.error('❌ Gold price fetch failed:', error);
        return this.getDefaultGoldPrice();
    }
},

// Simulasi fetch harga emas yang lebih realistis
simulateGoldPriceFetch() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Harga dasar dengan variasi acak yang realistis
            const basePrice = 1200000; // Harga dasar per gram
            const randomVariation = Math.random() * 50000 - 25000; // ±25k variation
            const currentBuy = Math.round(basePrice + randomVariation);
            const currentSell = Math.round(currentBuy * 0.96); // Spread 4%
            
            resolve({
                buy: currentBuy,
                sell: currentSell,
                lastUpdate: new Date().toISOString(),
                source: 'Pegadaian (Simulated)'
            });
        }, 2000); // Simulasi delay network
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

// Initialize gold data - PASTIKAN DIPANGGIL DI INIT()
init() {
    // ... existing init code ...

    // Initialize gold data
    if (!localStorage.getItem('goldWallets')) {
        const defaultGoldWallets = [
            { 
                id: Utils.generateId(), 
                name: 'Tabungan Emas', 
                type: 'gold',
                weight: 0,           // dalam gram
                purity: 24,          // karat
                buyPrice: 0,         // harga beli rata-rata
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
},
};
