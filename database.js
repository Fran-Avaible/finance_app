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
    },

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
    const saved = JSON.parse(localStorage.getItem('currentGoldPrice') || '{"buy": 1000000, "sell": 980000, "lastUpdate": ""}');
    return saved;
},

saveGoldPrice(price) {
    try {
        localStorage.setItem('currentGoldPrice', JSON.stringify({
            ...price,
            lastUpdate: new Date().toISOString()
        }));
        return true;
    } catch (e) {
        console.error('Gagal menyimpan gold price:', e);
        return false;
    }
},

// Initialize gold data
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
            sell: 980000
        });
    }
},

// Tambahkan method untuk fetch harga Pegadaian
async fetchPegadaianGoldPrice() {
    try {
        // Coba method utama (API)
        let priceData = await this.tryPegadaianAPI();
        if (priceData) return priceData;
        
        // Jika gagal, coba method alternatif (HTML scraping)
        priceData = await this.fetchPegadaianGoldPriceAlternative();
        if (priceData) return priceData;
        
        // Jika semua gagal, return harga default
        return this.getDefaultGoldPrice();
        
    } catch (error) {
        console.error('All Pegadaian methods failed:', error);
        return this.getDefaultGoldPrice();
    }
},

async tryPegadaianAPI() {
    try {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = 'https://www.pegadaian.co.id/api/gold';
        
        const response = await fetch(proxyUrl + targetUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Process data sesuai struktur Pegadaian API
            // ... (sama seperti sebelumnya)
            return processedData;
        }
    } catch (error) {
        console.error('Pegadaian API failed:', error);
        return null;
    }
},

getDefaultGoldPrice() {
    // Harga default berdasarkan rata-rata market
    return {
        buy: 1250000,
        sell: 1200000,
        lastUpdate: new Date().toISOString(),
        source: 'Default Market Price'
    };
},

// Alternatif scraping method
async fetchPegadaianGoldPriceAlternative() {
    try {
        // Method alternatif: coba scraping dari halaman HTML
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = 'https://www.pegadaian.co.id/gold';
        
        const response = await fetch(proxyUrl + targetUrl);
        const html = await response.text();
        
        // Parse HTML untuk mencari harga emas
        // Ini adalah contoh - struktur HTML Pegadaian bisa berubah
        const buyMatch = html.match(/harga beli.*?([\d.,]+)/i);
        const sellMatch = html.match(/harga jual.*?([\d.,]+)/i);
        
        if (buyMatch && sellMatch) {
            const buyPrice = parseFloat(buyMatch[1].replace(/\./g, ''));
            const sellPrice = parseFloat(sellMatch[1].replace(/\./g, ''));
            
            return {
                buy: buyPrice,
                sell: sellPrice,
                lastUpdate: new Date().toISOString(),
                source: 'Pegadaian (HTML)'
            };
        }
    } catch (error) {
        console.error('Alternative scraping failed:', error);
    }
    
    return null;
}
};
