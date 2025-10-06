// MultipleFiles/js/modules/liabilities.js
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class LiabilitiesModule {
    constructor(app) {
        this.app = app;
        this.liabilitiesSubTab = 'liabilities'; // Default sub-tab
    }

    render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🏦 Liabilitas & Tagihan</h3>
                    <div class="sub-tab-navigation">
                        <button class="btn btn-outline btn-sm ${this.liabilitiesSubTab === 'liabilities' ? 'active' : ''}" 
                                id="tabLiabilities" data-sub-tab="liabilities">
                            💰 Hutang
                        </button>
                        <button class="btn btn-outline btn-sm ${this.liabilitiesSubTab === 'bills' ? 'active' : ''}" 
                                id="tabBills" data-sub-tab="bills">
                            📅 Tagihan
                        </button>
                    </div>
                </div>
                <div id="liabilitiesSubContent">
                    </div>
            </div>
        `;

        this.renderLiabilitiesSubContent();
        
        // PASANG EVENT LISTENERS UNTUK SUB-TAB
        document.getElementById('tabLiabilities').addEventListener('click', (e) => this.switchLiabilitiesSubTab('liabilities', e));
        document.getElementById('tabBills').addEventListener('click', (e) => this.switchLiabilitiesSubTab('bills', e));
    }

    switchLiabilitiesSubTab(subTab, event) {
        this.liabilitiesSubTab = subTab;
        
        document.querySelectorAll('.sub-tab-navigation .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (event.target) event.target.classList.add('active');
        
        this.renderLiabilitiesSubContent();
    }

    renderLiabilitiesSubContent() {
        const container = document.getElementById('liabilitiesSubContent');
        if (!container) return;

        if (this.liabilitiesSubTab === 'liabilities') {
            this.renderLiabilitiesContent(container);
        } else {
            this.renderBillsContent(container);
        }
    }

    renderLiabilitiesContent(container) {
        container.innerHTML = `
            <div style="text-align: right; margin-bottom: 15px;">
                <button class="btn btn-primary" id="addLiabilityBtn">+ Tambah Hutang</button>
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
        document.getElementById('addLiabilityBtn').addEventListener('click', () => this.showAddLiabilityModal());
        this.renderLiabilitiesList();
        this.renderLiabilitiesSummary();
        this.renderPaymentSchedule();
    }

    renderBillsContent(container) {
        container.innerHTML = `
            <div style="text-align: right; margin-bottom: 15px;">
                <button class="btn btn-primary" id="addBillBtn">+ Tagihan Baru</button>
            </div>
            <div id="billRemindersList"></div>
            
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">🔔 Tagihan Mendatang</h3>
                </div>
                <div id="upcomingBills"></div>
            </div>
        `;
        document.getElementById('addBillBtn').addEventListener('click', () => this.showAddBillModal());
        this.renderBillReminders();
        this.renderUpcomingBills();
    }

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
                        <button class="btn btn-success btn-sm mark-paid-btn" data-bill-id="${bill.id}" 
                                ${bill.paid ? 'disabled' : ''}>
                            💸 Bayar
                        </button>
                        <button class="btn btn-info btn-sm edit-bill-btn" data-bill-id="${bill.id}">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-bill-btn" data-bill-id="${bill.id}">
                            🗑️ Hapus
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // PASANG EVENT LISTENERS UNTUK BILL ACTIONS
        container.querySelectorAll('.mark-paid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.markBillAsPaid(e.target.dataset.billId));
        });
        container.querySelectorAll('.edit-bill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showEditBillModal(e.target.dataset.billId));
        });
        container.querySelectorAll('.delete-bill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteBill(e.target.dataset.billId));
        });
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
                        <span style="color: ${daysLeft <= 7 ? 'var(--danger-color)' : daysLeft <= 30 ? 'var(--warning-color)' : 'var(--success-color)'};">
                            ${daysLeft} hari
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

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
                    <select class="form-control" id="billType" required onchange="window.app.liabilitiesModule.onBillTypeChange()">
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

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(10);
        document.getElementById('billDueDate').value = nextMonth.toISOString().split('T')[0];

        document.getElementById('addBillForm').onsubmit = (e) => {
            e.preventDefault();
            this.processAddBill();
        };
    }

    onBillTypeChange() {
        const billType = document.getElementById('billType');
        const billName = document.getElementById('billName');
        const billEmoji = document.getElementById('billEmoji');
        
        const selectedOption = billType.options[billType.selectedIndex];
        const emoji = selectedOption.getAttribute('data-emoji');
        
        if (emoji) {
            billEmoji.value = emoji;
        }
        
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
            id: DB.generateId(),
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

    markBillAsPaid(billId) {
        const bills = DB.getBillReminders();
        const billIndex = bills.findIndex(b => b.id === billId);
        if (billIndex === -1) return;

        const bill = bills[billIndex];
        
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
            wallet.balance -= bill.amount;
            DB.saveWallets(DB.getWallets().map(w => w.id === wallet.id ? wallet : w));

            bills[billIndex].paid = true;
            bills[billIndex].paidDate = new Date().toISOString();
            DB.saveBillReminders(bills);

            if (bill.recurring) {
                const nextDueDate = new Date(bill.dueDate);
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                
                bills.push({
                    id: DB.generateId(),
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

            const transactions = DB.getTransactions();
            transactions.push({
                id: DB.generateId(),
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
            this.app.dashboardModule.renderWalletsList(); // Update wallets list on dashboard
            this.app.updateTotalBalance();
            
            const message = bill.recurring ? 
                `Tagihan ${bill.name} berhasil dibayar! Tagihan berikutnya sudah dibuat.` :
                `Tagihan ${bill.name} berhasil dibayar!`;
                
            Utils.showToast(message, 'success');

        } catch (error) {
            console.error('Error paying bill:', error);
            Utils.showToast('Terjadi kesalahan saat membayar tagihan', 'error');
        }
    }

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
                    <select class="form-control" id="editBillType" required onchange="window.app.liabilitiesModule.onEditBillTypeChange()">
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
                            id="deleteEditBillBtn" data-bill-id="${bill.id}">
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
        document.getElementById('deleteEditBillBtn').addEventListener('click', () => this.deleteBill(billId));
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

    deleteBill(billId) {
        if (!confirm('Hapus tagihan ini?')) {
            return;
        }

        const bills = DB.getBillReminders().filter(b => b.id !== billId);
        if (DB.saveBillReminders(bills)) {
            Utils.closeModal('editBillModal'); // Tutup jika modal edit terbuka
            this.renderBillReminders();
            this.renderUpcomingBills();
            Utils.showToast('Tagihan berhasil dihapus!', 'success');
        }
    }

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
                id: DB.generateId(),
                name: categoryName,
                type: 'expense',
                emoji: '📄'
            };
            categories.push(billCategory);
            DB.saveCategories(categories);
        }
        
        return billCategory.id;
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
                <div class="liability-item ${statusClass}" onclick="window.app.liabilitiesModule.showLiabilityDetail('${liability.id}')">
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
                        <button class="btn btn-success btn-sm" onclick="window.app.liabilitiesModule.showPayLiabilityModal('${liability.id}'); event.stopPropagation();">
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

    calculatePaidAmount(liabilityId) {
        const payments = DB.getLiabilityPayments();
        return payments
            .filter(payment => payment.liabilityId === liabilityId)
            .reduce((total, payment) => total + payment.amount, 0);
    }

    calculateDaysLeft(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    showAddLiabilityModal() {
        const wallets = DB.getWallets();
        const walletOptions = wallets.map(w => 
            `<option value="${w.id}">${w.emoji} ${w.name} - ${Utils.formatCurrency(w.balance)}</option>`
        ).join('');
        const modalId = 'addLiabilityModal';

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

        Utils.createModal(modalId, 'Tambah Liabilitas', content);
        Utils.openModal(modalId);

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
            id: DB.generateId(),
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
        const modalId = 'payLiabilityModal';

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

        Utils.createModal(modalId, 'Bayar Liabilitas', content);
        Utils.openModal(modalId);

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

        const wallet = DB.getWallets().find(w => w.id === liability.walletId);
        if (!wallet || wallet.balance < paymentAmount) {
            Utils.showToast('Saldo dompet tidak mencukupi!', 'error');
            return;
        }

        wallet.balance -= paymentAmount;
        DB.saveWallets(DB.getWallets().map(w => w.id === wallet.id ? wallet : w));

        const payments = DB.getLiabilityPayments();
        payments.push({
            id: DB.generateId(),
            liabilityId,
            amount: paymentAmount,
            date: paymentDate,
            notes: paymentNotes,
            createdAt: new Date().toISOString()
        });

        if (DB.saveLiabilityPayments(payments)) {
            Utils.closeModal('payLiabilityModal');
            
            const transactions = DB.getTransactions();
            const category = this.getOrCreateLiabilityCategory();
            
            transactions.push({
                id: DB.generateId(),
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
            this.app.dashboardModule.renderWalletsList(); // Update wallets list on dashboard
            this.app.updateTotalBalance();
            Utils.showToast('Pembayaran berhasil!', 'success');
        }
    }

    showLiabilityDetail(liabilityId) {
        const liability = DB.getLiabilities().find(l => l.id === liabilityId);
        if (!liability) return;
        const modalId = 'liabilityDetailModal';

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
                <button class="btn btn-success" onclick="window.app.liabilitiesModule.showPayLiabilityModal('${liability.id}')" style="flex: 1;">
                    💸 Bayar
                </button>
                <button class="btn btn-danger" onclick="window.app.liabilitiesModule.deleteLiability('${liability.id}')" style="flex: 1;">
                    🗑️ Hapus
                </button>
            </div>
        `;

        Utils.createModal(modalId, 'Detail Liabilitas', content);
        Utils.openModal(modalId);
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
                Utils.showToast('Liabilitas berhasil dihapus!', 'success');
            }
        }
    }

    getOrCreateLiabilityCategory() {
        const categories = DB.getCategories();
        let liabilityCategory = categories.find(c => c.name === 'Pembayaran Hutang' && c.type === 'expense');
        
        if (!liabilityCategory) {
            liabilityCategory = {
                id: DB.generateId(),
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