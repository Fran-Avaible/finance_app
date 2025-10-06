// MultipleFiles/js/modules/gold.js
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class GoldModule {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💰 Harga Emas Hari Ini</h3>
                    <div>
                        <button class="btn btn-outline btn-sm" onclick="window.app.goldModule.updateGoldPrice()">🔄 Update</button>
                        <button class="btn btn-outline btn-sm" onclick="window.app.goldModule.forceRefreshGoldDisplay()">🔍 Refresh Display</button>
                    </div>
                </div>
                <div id="goldPriceDisplay">
                    </div>
            </div>

            <div class="quick-actions">
                <button class="btn btn-primary" onclick="window.app.goldModule.showBuyGoldModal()">
                    <span>🛒</span> Beli Emas
                </button>
                <button class="btn btn-secondary" onclick="window.app.goldModule.showSellGoldModal()">
                    <span>💰</span> Jual Emas
                </button>
                <button class="btn btn-success" onclick="window.app.goldModule.showGoldCalculator()">
                    <span>🧮</span> Kalkulator
                </button>
                <button class="btn btn-outline" onclick="window.app.goldModule.showAddGoldWalletModal()">
                    <span>🏦</span> Dompet Emas
                </button>
                <button class="btn btn-warning" onclick="window.app.goldModule.showManualGoldInputModal()">
                    <span>✨</span> Input Emas Awal
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🏦 Portfolio Emas Saya</h3>
                </div>
                <div id="goldPortfolio">
                    </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Ringkasan Investasi</h3>
                </div>
                <div id="goldSummary">
                    </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📝 Riwayat Transaksi Emas</h3>
                </div>
                <div id="goldTransactions">
                    </div>
            </div>
        `;

        this.updateGoldPriceDisplay();
        this.renderGoldPortfolio();
        this.renderGoldSummary();
        this.renderGoldTransactions();
    }

    async updateGoldPrice() {
        try {
            Utils.showToast('Mengambil harga terbaru dari Pegadaian...', 'info');
            
            const newPrice = await DB.fetchPegadaianGoldPrice();
            
            DB.saveGoldPrice(newPrice);
            
            this.updateGoldPriceDisplay();
            Utils.showToast('Harga emas berhasil diupdate!', 'success');
            
        } catch (error) {
            console.error('Update gold price error:', error);
            Utils.showToast('Gagal mengambil harga otomatis', 'error');
            this.showManualGoldPriceInput();
        }
    }

    forceRefreshGoldDisplay() {
        console.log('🔍 Force refreshing gold display...');
        this.updateGoldPriceDisplay();
        Utils.showToast('Display diperbarui!', 'info');
    }

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
                <button class="btn btn-outline btn-sm" onclick="window.app.goldModule.showManualGoldPriceInput()">
                    ✏️ Input Manual
                </button>
            </div>
        `;
    }

    showManualGoldPriceInput() {
        const currentPrice = DB.getGoldPrice();
        const modalId = 'manualGoldPriceModal';

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
                            onclick="window.app.utils.closeModal('${modalId}')">
                        ❌ Batal
                    </button>
                </div>
            </form>
        `;

        Utils.createModal(modalId, 'Input Harga Emas Manual', content);
        Utils.openModal(modalId);

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

    // --- FITUR BARU: INPUT EMAS AWAL ---
    showManualGoldInputModal() {
        const goldWallets = DB.getGoldWallets();
        
        if (goldWallets.length === 0) {
            Utils.showToast('Buat dompet emas terlebih dahulu!', 'error');
            this.showAddGoldWalletModal();
            return;
        }

        const goldOptions = goldWallets.map(w => 
            `<option value="${w.id}">${w.emoji} ${w.name} (${w.weight.toFixed(3)}g)</option>`
        ).join('');

        const modalId = 'manualGoldInputModal';
        const content = `
            <form id="manualGoldInputForm">
                <p style="margin-bottom: 15px;">
                    Masukkan total berat emas yang sudah Anda miliki untuk dompet ini.
                    Ini akan menimpa saldo emas saat ini dan menetapkan harga beli rata-rata.
                </p>
                
                <div class="form-group">
                    <label class="form-label">Ke Dompet Emas</label>
                    <select class="form-control" id="inputToWallet" required>
                        ${goldOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Total Berat Emas (gram)</label>
                    <input type="number" class="form-control" id="inputTotalGram" 
                           placeholder="Contoh: 10.5" step="0.001" required min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Total Harga Pembelian (IDR)</label>
                    <input type="number" class="form-control" id="inputTotalAmount" 
                           placeholder="Total Rupiah yang sudah diinvestasikan" required min="1">
                </div>
                
                <button type="submit" class="btn btn-warning" style="width: 100%;">💾 Set Saldo Emas</button>
            </form>
        `;

        Utils.createModal(modalId, '✨ Input Emas Awal', content);
        Utils.openModal(modalId);

        document.getElementById('manualGoldInputForm').onsubmit = (e) => {
            e.preventDefault();
            this.processManualGoldInput();
        };
    }

    processManualGoldInput() {
        const toWalletId = document.getElementById('inputToWallet').value;
        const totalGram = parseFloat(document.getElementById('inputTotalGram').value);
        const totalAmount = parseFloat(document.getElementById('inputTotalAmount').value);

        if (totalGram <= 0 || totalAmount <= 0) {
            Utils.showToast('Berat dan Nominal harus lebih dari 0!', 'error');
            return;
        }

        const avgPrice = totalAmount / totalGram;
        
        const goldWallets = DB.getGoldWallets();
        const goldWalletIndex = goldWallets.findIndex(w => w.id === toWalletId);
        
        if (goldWalletIndex === -1) return;

        // Update Wallet Balance
        goldWallets[goldWalletIndex].weight = totalGram;
        goldWallets[goldWalletIndex].buyPrice = avgPrice; 

        if (DB.saveGoldWallets(goldWallets)) {
            Utils.closeModal('manualGoldInputModal');
            this.renderGoldPortfolio();
            this.renderGoldSummary();
            Utils.showToast(`Saldo emas disetel ke ${totalGram.toFixed(3)} gram dengan rata-rata harga ${Utils.formatCurrency(avgPrice)}/g.`, 'success');
        }
    }
    // --- END FITUR BARU ---
    
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
                <div class="wallet-card" onclick="window.app.goldModule.showGoldWalletDetail('${wallet.id}')">
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
                <div class="transaction-item ${typeClass}" onclick="window.app.goldModule.showGoldTransactionDetail('${transaction.id}')">
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

    showBuyGoldModal() {
        const cashWallets = DB.getWallets().filter(w => w.balance > 0);
        const goldWallets = DB.getGoldWallets();
        const goldPrice = DB.getGoldPrice();
        
        if (cashWallets.length === 0) {
            Utils.showToast('Tidak ada dompet uang dengan saldo!', 'error');
            this.app.showAddWalletModal(); 
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
                           oninput="window.app.goldModule.calculateGoldFromIDR()">
                </div>
                <div class="form-group">
                    <label class="form-label">Harga Beli per gram</label>
                    <input type="number" class="form-control" id="buyPricePerGram" 
                           value="${goldPrice.buy}" required
                           oninput="window.app.goldModule.calculateGoldFromIDR()">
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

    processBuyGold() {
        const fromWalletId = document.getElementById('buyFromWallet').value;
        const toWalletId = document.getElementById('buyToWallet').value;
        const idrAmount = parseFloat(document.getElementById('buyAmountIDR').value);
        const pricePerGram = parseFloat(document.getElementById('buyPricePerGram').value);
        const notes = document.getElementById('buyNotes').value;

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

        const gramAmount = idrAmount / pricePerGram;

        cashWallet.balance -= idrAmount;
        DB.saveWallets(DB.getWallets().map(w => w.id === cashWallet.id ? cashWallet : w));

        const goldWallet = DB.getGoldWallets().find(w => w.id === toWalletId);
        if (goldWallet) {
            const totalValue = (goldWallet.weight * (goldWallet.buyPrice || 0)) + (gramAmount * pricePerGram);
            const totalWeight = goldWallet.weight + gramAmount;
            goldWallet.buyPrice = totalWeight > 0 ? totalValue / totalWeight : pricePerGram;
            goldWallet.weight = totalWeight;

            DB.saveGoldWallets(DB.getGoldWallets().map(w => w.id === goldWallet.id ? goldWallet : w));
        }

        const goldTransactions = DB.getGoldTransactions();
        goldTransactions.push({
            id: DB.generateId(),
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

        const transactions = DB.getTransactions();
        transactions.push({
            id: DB.generateId(),
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
        
        this.renderGoldPortfolio();
        this.renderGoldSummary();
        this.renderGoldTransactions();
        this.app.dashboardModule.renderWalletsList(); // Update wallets list on dashboard
        this.app.updateTotalBalance();
        this.app.dashboardModule.renderRecentTransactions(); // Update recent transactions on dashboard
    }

    showSellGoldModal() {
        const goldWallets = DB.getGoldWallets().filter(w => w.weight > 0);
        const cashWallets = DB.getWallets();
        const goldPrice = DB.getGoldPrice();
        const modalId = 'sellGoldModal';
        
        if (goldWallets.length === 0) {
            Utils.showToast('Tidak ada emas yang bisa dijual!', 'error');
            return;
        }
        
        if (cashWallets.length === 0) {
            Utils.showToast('Buat dompet uang terlebih dahulu!', 'error');
            this.app.showAddWalletModal(); // Panggil dari app global
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
                           oninput="window.app.goldModule.calculateIDRFromGoldSell()">
                </div>
                <div class="form-group">
                    <label class="form-label">Harga Jual per gram</label>
                    <input type="number" class="form-control" id="sellPricePerGram" 
                           value="${goldPrice.sell}" required
                           oninput="window.app.goldModule.calculateIDRFromGoldSell()">
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

        Utils.createModal(modalId, '💰 Jual Emas', content);
        Utils.openModal(modalId);

        document.getElementById('sellGoldForm').onsubmit = (e) => {
            e.preventDefault();
            this.processSellGold();
        };
    }

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

    processSellGold() {
        const fromWalletId = document.getElementById('sellFromWallet').value;
        const toWalletId = document.getElementById('sellToWallet').value;
        const gramAmount = parseFloat(document.getElementById('sellAmountGram').value);
        const pricePerGram = parseFloat(document.getElementById('sellPricePerGram').value);
        const notes = document.getElementById('sellNotes').value;

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

        const idrAmount = gramAmount * pricePerGram;

        goldWallet.weight -= gramAmount;
        if (goldWallet.weight === 0) {
            goldWallet.buyPrice = 0;
        }
        DB.saveGoldWallets(DB.getGoldWallets().map(w => w.id === goldWallet.id ? goldWallet : w));

        cashWallet.balance += idrAmount;
        DB.saveWallets(DB.getWallets().map(w => w.id === cashWallet.id ? cashWallet : w));

        const goldTransactions = DB.getGoldTransactions();
        goldTransactions.push({
            id: DB.generateId(),
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

        const transactions = DB.getTransactions();
        transactions.push({
            id: DB.generateId(),
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
        
        this.renderGoldPortfolio();
        this.renderGoldSummary();
        this.renderGoldTransactions();
        this.app.dashboardModule.renderWalletsList(); // Update wallets list on dashboard
        this.app.updateTotalBalance();
        this.app.dashboardModule.renderRecentTransactions(); // Update recent transactions on dashboard
    }

    showGoldCalculator() {
        const goldPrice = DB.getGoldPrice();
        const modalId = 'goldCalculator';
        
        const content = `
            <div class="form-group">
                <label class="form-label">Harga Emas per gram (IDR)</label>
                <input type="number" class="form-control" id="calcGoldPrice" 
                       value="${goldPrice.buy}" oninput="window.app.goldModule.calculateGoldConversion()">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                <div>
                    <div class="form-group">
                        <label class="form-label">Berat Emas (gram)</label>
                        <input type="number" class="form-control" id="calcGoldGrams" 
                               step="0.001" oninput="window.app.goldModule.calculateGoldConversion()">
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
                               oninput="window.app.goldModule.calculateGoldConversion()">
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
                <select class="form-control" id="calcPurity" onchange="window.app.goldModule.calculateGoldConversion()">
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

        Utils.createModal(modalId, '🧮 Kalkulator Emas', content);
        Utils.openModal(modalId);
    }

    calculateGoldConversion() {
        const pricePerGram = parseFloat(document.getElementById('calcGoldPrice').value) || 0;
        const goldGrams = parseFloat(document.getElementById('calcGoldGrams').value) || 0;
        const idrAmount = parseFloat(document.getElementById('calcIDRAmount').value) || 0;
        const purity = parseInt(document.getElementById('calcPurity').value) || 24;

        if (goldGrams > 0 && pricePerGram > 0) {
            const idrValue = goldGrams * pricePerGram;
            document.getElementById('calcIDRResult').textContent = Utils.formatCurrency(idrValue);
        } else {
            document.getElementById('calcIDRResult').textContent = 'Rp 0';
        }

        if (idrAmount > 0 && pricePerGram > 0) {
            const goldValue = idrAmount / pricePerGram;
            document.getElementById('calcGoldResult').textContent = goldValue.toFixed(4) + ' gram';
            
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

    showAddGoldWalletModal() {
        const modalId = 'addGoldWalletModal';
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

        Utils.createModal(modalId, 'Tambah Dompet Emas', content);
        Utils.openModal(modalId);

        document.getElementById('addGoldWalletForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('goldWalletName').value;
            const emoji = document.getElementById('goldWalletEmoji').value;
            const purity = parseInt(document.getElementById('goldWalletPurity').value);

            const wallets = DB.getGoldWallets();
            wallets.push({
                id: DB.generateId(),
                name,
                type: 'gold',
                weight: 0,
                purity: purity,
                buyPrice: 0,
                emoji
            });

            if (DB.saveGoldWallets(wallets)) {
                Utils.closeModal(modalId);
                this.renderGoldPortfolio();
                this.renderGoldSummary();
                Utils.showToast('Dompet emas berhasil ditambahkan!', 'success');
            }
        };
    }

    showGoldWalletDetail(walletId) {
        const wallet = DB.getGoldWallets().find(w => w.id === walletId);
        if (!wallet) return;
        const modalId = 'goldWalletDetailModal';

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
                    return '';
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
                <button class="btn btn-danger" onclick="window.app.goldModule.deleteGoldWallet('${wallet.id}')" style="flex: 1;">
                    🗑️ Hapus Dompet
                </button>
                <button type="button" class="btn btn-secondary" onclick="window.app.utils.closeModal('${modalId}')" style="flex: 1;">
                    Tutup
                </button>
            </div>
        `;

        Utils.createModal(modalId, 'Detail Dompet Emas', content);
        Utils.openModal(modalId);
    }

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

    getOrCreateGoldCategory() {
        const categories = DB.getCategories();
        let goldCategory = categories.find(c => c.name === 'Investasi Emas' && c.type === 'expense');
        
        if (!goldCategory) {
            goldCategory = {
                id: DB.generateId(),
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
                id: DB.generateId(),
                name: 'Penjualan Emas',
                type: 'income',
                emoji: '💰'
            };
            categories.push(goldCategory);
            DB.saveCategories(categories);
        }
        
        return goldCategory.id;
    }

    showGoldTransactionDetail(transactionId) {
        Utils.showToast('Fitur detail transaksi emas dalam pengembangan', 'info');
    }
}
