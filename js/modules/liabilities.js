// js/modules/liabilities.js (Versi Final dan Lengkap dengan async/await)
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class LiabilitiesModule {
    constructor(app) {
        this.app = app;
        this.liabilitiesSubTab = 'liabilities';
    }

    async render(container) {
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
                <div id="liabilitiesSubContent"></div>
            </div>
        `;

        await this.renderLiabilitiesSubContent();
        
        document.getElementById('tabLiabilities').addEventListener('click', (e) => this.switchLiabilitiesSubTab('liabilities', e));
        document.getElementById('tabBills').addEventListener('click', (e) => this.switchLiabilitiesSubTab('bills', e));
    }

    async switchLiabilitiesSubTab(subTab, event) {
        this.liabilitiesSubTab = subTab;
        document.querySelectorAll('.sub-tab-navigation .btn').forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        await this.renderLiabilitiesSubContent();
    }

    async renderLiabilitiesSubContent() {
        const container = document.getElementById('liabilitiesSubContent');
        if (!container) return;

        if (this.liabilitiesSubTab === 'liabilities') {
            await this.renderLiabilitiesContent(container);
        } else {
            await this.renderBillsContent(container);
        }
    }

    // --- RENDER CONTENT SECTION ---
    async renderLiabilitiesContent(container) {
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
        await this.renderLiabilitiesList();
        await this.renderLiabilitiesSummary();
        await this.renderPaymentSchedule();
    }

    async renderBillsContent(container) {
        container.innerHTML = `
            <div style="text-align: right; margin-bottom: 15px;"><button class="btn btn-primary" id="addBillBtn">+ Tagihan Baru</button></div>
            <div id="billRemindersList"></div>
            <div class="card" style="margin-top: 20px;"><div class="card-header"><h3 class="card-title">🔔 Tagihan Mendatang</h3></div><div id="upcomingBills"></div></div>
        `;
        document.getElementById('addBillBtn').addEventListener('click', () => this.showAddBillModal());
        await this.renderBillReminders();
        await this.renderUpcomingBills();
    }

    // --- BILLS SECTION ---

    async renderBillReminders() {
        const container = document.getElementById('billRemindersList');
        if(!container) return;
        const bills = await DB.getBillReminders();
        
        if (bills.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="emoji">📅</div><p>Belum ada pengingat tagihan.</p></div>`;
            return;
        }

        container.innerHTML = bills.map(bill => {
            const daysLeft = this.calculateDaysLeft(bill.dueDate);
            let statusClass = bill.paid ? 'success' : daysLeft < 0 ? 'danger' : daysLeft <= 3 ? 'warning' : '';
            let statusText = bill.paid ? '✅ Lunas' : daysLeft < 0 ? '⏰ Terlambat' : daysLeft === 0 ? '⚠️ Hari ini' : `${daysLeft} hari lagi`;
            return `
                <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--${statusClass}-color);">
                    <div class="card-header"><h4 class="card-title">${bill.emoji} ${bill.name}</h4><span style="font-weight: bold;">${statusText}</span></div>
                    <p><strong>${Utils.formatCurrency(bill.amount)}</strong> | Jatuh tempo: ${Utils.formatDate(bill.dueDate)}</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-success btn-sm mark-paid-btn" data-bill-id="${bill.id}" ${bill.paid ? 'disabled' : ''}>💸 Bayar</button>
                        <button class="btn btn-info btn-sm edit-bill-btn" data-bill-id="${bill.id}">✏️ Edit</button>
                        <button class="btn btn-danger btn-sm delete-bill-btn" data-bill-id="${bill.id}">🗑️ Hapus</button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.querySelectorAll('.mark-paid-btn').forEach(btn => btn.addEventListener('click', (e) => this.markBillAsPaid(e.target.dataset.billId)));
        container.querySelectorAll('.edit-bill-btn').forEach(btn => btn.addEventListener('click', (e) => this.showEditBillModal(e.target.dataset.billId)));
        container.querySelectorAll('.delete-bill-btn').forEach(btn => btn.addEventListener('click', (e) => this.deleteBill(e.target.dataset.billId)));
    }
    
    async renderUpcomingBills() {
        const container = document.getElementById('upcomingBills');
        if(!container) return;
        const bills = await DB.getBillReminders();
        const upcoming = bills.filter(bill => !bill.paid).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);
        if (upcoming.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Tidak ada tagihan mendatang</p>';
            return;
        }
        container.innerHTML = upcoming.map(bill => {
            const daysLeft = this.calculateDaysLeft(bill.dueDate);
            const statusClass = daysLeft < 0 ? 'danger' : daysLeft <= 3 ? 'warning' : '';
            return `
                <div class="payment-schedule-item" style="border-left-color: var(--${statusClass}-color);">
                    <div style="display: flex; justify-content: between; align-items: center;">
                        <span>${bill.emoji} ${bill.name}</span>
                        <span style="color: var(--${statusClass}-color); font-weight: bold;">
                            ${daysLeft < 0 ? 'Terlambat' : daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari`}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: between; font-size: 12px; color: #666;">
                        <span>${Utils.formatCurrency(bill.amount)}</span>
                        <span>${Utils.formatDateShort(bill.dueDate)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    async showAddBillModal() {
        const wallets = await DB.getWallets();
        const walletOptions = wallets.map(w => `<option value="${w.id}">${w.emoji} ${w.name}</option>`).join('');
        const content = `
            <form id="addBillForm">
                <div class="form-group">
                    <label>Nama Tagihan</label>
                    <input type="text" class="form-control" id="billName" required>
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="form-control" id="billEmoji" value="📄" required>
                </div>
                <div class="form-group">
                    <label>Jumlah</label>
                    <input type="number" class="form-control" id="billAmount" required min="1">
                </div>
                <div class="form-group">
                    <label>Tanggal Jatuh Tempo</label>
                    <input type="date" class="form-control" id="billDueDate" required>
                </div>
                <div class="form-group">
                    <label>Dompet untuk Pembayaran</label>
                    <select class="form-control" id="billWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipe Tagihan</label>
                    <select class="form-control" id="billType">
                        <option value="electricity">⚡ Listrik</option>
                        <option value="water">💧 Air</option>
                        <option value="internet">🌐 Internet</option>
                        <option value="phone">📱 Telepon</option>
                        <option value="subscription">🔄 Langganan</option>
                        <option value="credit-card">💳 Kartu Kredit</option>
                        <option value="insurance">🛡️ Asuransi</option>
                        <option value="other">📄 Lainnya</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="billRecurring"> Berulang setiap bulan?
                    </label>
                </div>
                <div class="form-group">
                    <label>Catatan (Opsional)</label>
                    <input type="text" class="form-control" id="billNotes" placeholder="Catatan tagihan">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Tagihan</button>
            </form>
        `;
        Utils.createModal('addBillModal', 'Tambah Pengingat Tagihan', content);
        Utils.openModal('addBillModal');
        document.getElementById('addBillForm').onsubmit = (e) => {
            e.preventDefault();
            this.processAddBill();
        };
    }
    
    async processAddBill() {
        const name = document.getElementById('billName').value;
        const emoji = document.getElementById('billEmoji').value;
        const amount = parseFloat(document.getElementById('billAmount').value);
        const dueDate = document.getElementById('billDueDate').value;
        const walletId = document.getElementById('billWallet').value;
        const type = document.getElementById('billType').value;
        const recurring = document.getElementById('billRecurring').checked;
        const notes = document.getElementById('billNotes').value;

        if (amount <= 0) {
            return Utils.showToast('Jumlah tagihan harus lebih dari 0', 'error');
        }

        const bills = await DB.getBillReminders();
        bills.push({ 
            id: DB.generateId(), 
            name, 
            emoji, 
            amount, 
            dueDate, 
            walletId, 
            type, 
            recurring, 
            notes,
            paid: false,
            createdAt: new Date().toISOString()
        });
        
        await DB.saveBillReminders(bills);
        Utils.closeModal('addBillModal');
        await this.renderBillsContent(document.getElementById('liabilitiesSubContent'));
        Utils.showToast('Pengingat tagihan berhasil ditambahkan!', 'success');
    }

    async showEditBillModal(billId) {
        const bills = await DB.getBillReminders();
        const bill = bills.find(b => b.id === billId);
        if (!bill) return;

        const wallets = await DB.getWallets();
        const walletOptions = wallets.map(w => `<option value="${w.id}" ${w.id === bill.walletId ? 'selected' : ''}>${w.emoji} ${w.name}</option>`).join('');

        const content = `
            <form id="editBillForm">
                <div class="form-group">
                    <label>Nama Tagihan</label>
                    <input type="text" class="form-control" id="editBillName" value="${bill.name}" required>
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="form-control" id="editBillEmoji" value="${bill.emoji}" required>
                </div>
                <div class="form-group">
                    <label>Jumlah</label>
                    <input type="number" class="form-control" id="editBillAmount" value="${bill.amount}" required min="1">
                </div>
                <div class="form-group">
                    <label>Tanggal Jatuh Tempo</label>
                    <input type="date" class="form-control" id="editBillDueDate" value="${bill.dueDate}" required>
                </div>
                <div class="form-group">
                    <label>Dompet untuk Pembayaran</label>
                    <select class="form-control" id="editBillWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipe Tagihan</label>
                    <select class="form-control" id="editBillType">
                        <option value="electricity" ${bill.type === 'electricity' ? 'selected' : ''}>⚡ Listrik</option>
                        <option value="water" ${bill.type === 'water' ? 'selected' : ''}>💧 Air</option>
                        <option value="internet" ${bill.type === 'internet' ? 'selected' : ''}>🌐 Internet</option>
                        <option value="phone" ${bill.type === 'phone' ? 'selected' : ''}>📱 Telepon</option>
                        <option value="subscription" ${bill.type === 'subscription' ? 'selected' : ''}>🔄 Langganan</option>
                        <option value="credit-card" ${bill.type === 'credit-card' ? 'selected' : ''}>💳 Kartu Kredit</option>
                        <option value="insurance" ${bill.type === 'insurance' ? 'selected' : ''}>🛡️ Asuransi</option>
                        <option value="other" ${bill.type === 'other' ? 'selected' : ''}>📄 Lainnya</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="editBillRecurring" ${bill.recurring ? 'checked' : ''}> Berulang setiap bulan?
                    </label>
                </div>
                <div class="form-group">
                    <label>Catatan (Opsional)</label>
                    <input type="text" class="form-control" id="editBillNotes" value="${bill.notes || ''}" placeholder="Catatan tagihan">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Update Tagihan</button>
            </form>
        `;
        
        Utils.createModal('editBillModal', 'Edit Tagihan', content);
        Utils.openModal('editBillModal');

        document.getElementById('editBillForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('editBillName').value;
            const emoji = document.getElementById('editBillEmoji').value;
            const amount = parseFloat(document.getElementById('editBillAmount').value);
            const dueDate = document.getElementById('editBillDueDate').value;
            const walletId = document.getElementById('editBillWallet').value;
            const type = document.getElementById('editBillType').value;
            const recurring = document.getElementById('editBillRecurring').checked;
            const notes = document.getElementById('editBillNotes').value;

            const updatedBills = bills.map(b => 
                b.id === billId ? { ...b, name, emoji, amount, dueDate, walletId, type, recurring, notes } : b
            );
            
            await DB.saveBillReminders(updatedBills);
            Utils.closeModal('editBillModal');
            await this.renderBillsContent(document.getElementById('liabilitiesSubContent'));
            Utils.showToast('Tagihan berhasil diperbarui!', 'success');
        };
    }

    async markBillAsPaid(billId) {
        const allBills = await DB.getBillReminders();
        const bill = allBills.find(b => b.id === billId);
        if (!bill || bill.paid) return;
        
        if (!confirm(`Bayar tagihan ${bill.name} sebesar ${Utils.formatCurrency(bill.amount)}?`)) return;

        const [wallets, transactions] = await Promise.all([DB.getWallets(), DB.getTransactions()]);
        const wallet = wallets.find(w => w.id === bill.walletId);
        
        if (!wallet || wallet.balance < bill.amount) {
            return Utils.showToast('Saldo dompet tidak cukup!', 'error');
        }

        // Update saldo dompet
        wallet.balance -= bill.amount;
        
        // Tandai tagihan sebagai lunas
        bill.paid = true;
        bill.paidDate = new Date().toISOString();
        
        // Jika tagihan berulang, buat tagihan baru untuk bulan depan
        if (bill.recurring) {
            const nextDueDate = new Date(bill.dueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            
            allBills.push({ 
                ...bill, 
                id: DB.generateId(),
                paid: false,
                paidDate: null,
                dueDate: nextDueDate.toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            });
        }

        // Buat transaksi pengeluaran
        const categoryId = await this.getOrCreateBillCategory(bill.type);
        transactions.push({ 
            id: DB.generateId(), 
            type: 'expense', 
            amount: bill.amount, 
            walletId: bill.walletId, 
            categoryId: categoryId, 
            date: new Date().toISOString().split('T')[0], 
            notes: `Tagihan: ${bill.name}` 
        });

        await Promise.all([
            DB.saveWallets(wallets),
            DB.saveBillReminders(allBills),
            DB.saveTransactions(transactions)
        ]);
        
        await this.renderBillsContent(document.getElementById('liabilitiesSubContent'));
        await this.app.updateTotalBalance();
        await this.app.dashboardModule.render();
        Utils.showToast('Tagihan berhasil dibayar!', 'success');
    }

    async deleteBill(billId) {
        if (!confirm('Hapus tagihan ini?')) return;
        let bills = await DB.getBillReminders();
        bills = bills.filter(b => b.id !== billId);
        await DB.saveBillReminders(bills);
        await this.renderBillsContent(document.getElementById('liabilitiesSubContent'));
        Utils.showToast('Tagihan berhasil dihapus!', 'success');
    }

    // --- LIABILITIES (HUTANG) SECTION ---

    async renderLiabilitiesList() {
        const container = document.getElementById('liabilitiesList');
        if (!container) return;
        
        const [liabilities, payments] = await Promise.all([DB.getLiabilities(), DB.getLiabilityPayments()]);
        
        if (liabilities.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="emoji">😊</div><p>Tidak ada liabilitas.</p></div>`;
            return;
        }

        container.innerHTML = liabilities.map(liability => {
            const paidAmount = this.calculatePaidAmount(liability.id, payments);
            const remaining = liability.amount - paidAmount;
            const progressPercent = (paidAmount / liability.amount) * 100;
            const daysLeft = this.calculateDaysLeft(liability.dueDate);
            
            let statusClass = '';
            let statusText = '';
            
            if (remaining <= 0) {
                statusClass = 'success';
                statusText = '✅ Lunas';
            } else if (daysLeft < 0) {
                statusClass = 'danger';
                statusText = '⏰ Terlambat';
            } else if (daysLeft <= 7) {
                statusClass = 'warning';
                statusText = `${daysLeft} hari lagi`;
            } else {
                statusText = `${daysLeft} hari lagi`;
            }

            return `
                <div class="liability-item ${statusClass}" style="border-left-color: var(--${statusClass}-color);">
                    <div class="card-header">
                        <h4 class="card-title">${liability.emoji} ${liability.name}</h4>
                        <span style="color: var(--${statusClass}-color); font-weight: bold;">${statusText}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                        <span>Total: <strong>${Utils.formatCurrency(liability.amount)}</strong></span>
                        <span>Tersisa: <strong style="color: var(--${statusClass}-color);">${Utils.formatCurrency(remaining)}</strong></span>
                    </div>
                    <div class="debt-progress">
                        <div class="debt-progress-bar" style="width: ${progressPercent}%;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 4px;">
                        <span>Terbayar: ${Utils.formatCurrency(paidAmount)}</span>
                        <span>Jatuh tempo: ${Utils.formatDateShort(liability.dueDate)}</span>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn btn-success btn-sm pay-liability-btn" data-liability-id="${liability.id}">💸 Bayar</button>
                        <button class="btn btn-info btn-sm edit-liability-btn" data-liability-id="${liability.id}">✏️ Edit</button>
                        <button class="btn btn-danger btn-sm delete-liability-btn" data-liability-id="${liability.id}">🗑️ Hapus</button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.querySelectorAll('.pay-liability-btn').forEach(btn => btn.addEventListener('click', (e) => this.showPayLiabilityModal(e.target.dataset.liabilityId)));
        container.querySelectorAll('.edit-liability-btn').forEach(btn => btn.addEventListener('click', (e) => this.showEditLiabilityModal(e.target.dataset.liabilityId)));
        container.querySelectorAll('.delete-liability-btn').forEach(btn => btn.addEventListener('click', (e) => this.deleteLiability(e.target.dataset.liabilityId)));
    }

    calculatePaidAmount(liabilityId, allPayments) {
        return allPayments
            .filter(p => p.liabilityId === liabilityId)
            .reduce((total, p) => total + p.amount, 0);
    }
    
    async renderLiabilitiesSummary() {
        const container = document.getElementById('liabilitiesSummary');
        if (!container) return;
        
        const [liabilities, payments] = await Promise.all([DB.getLiabilities(), DB.getLiabilityPayments()]);
        
        const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalRemaining = totalLiabilities - totalPaid;
        
        const overdueLiabilities = liabilities.filter(l => {
            const daysLeft = this.calculateDaysLeft(l.dueDate);
            const paidAmount = this.calculatePaidAmount(l.id, payments);
            return daysLeft < 0 && paidAmount < l.amount;
        });
        
        const totalOverdue = overdueLiabilities.reduce((sum, l) => {
            const paidAmount = this.calculatePaidAmount(l.id, payments);
            return sum + (l.amount - paidAmount);
        }, 0);

        container.innerHTML = `
            <div class="liability-stats">
                <div class="stat-card">
                    <div class="stat-label">Total Hutang</div>
                    <div class="stat-value" style="color: var(--danger-color);">${Utils.formatCurrency(totalLiabilities)}</div>
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
                    <div class="stat-label">Hutang Terlambat</div>
                    <div class="stat-value" style="color: var(--danger-color);">${Utils.formatCurrency(totalOverdue)}</div>
                </div>
            </div>
        `;
    }

    async renderPaymentSchedule() {
        const container = document.getElementById('paymentSchedule');
        if (!container) return;
        
        const [liabilities, payments] = await Promise.all([DB.getLiabilities(), DB.getLiabilityPayments()]);
        
        // Filter liabilitas yang belum lunas
        const activeLiabilities = liabilities.filter(liability => {
            const paidAmount = this.calculatePaidAmount(liability.id, payments);
            return paidAmount < liability.amount;
        });
        
        if (activeLiabilities.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Tidak ada jadwal pembayaran</p>';
            return;
        }

        // Urutkan berdasarkan tanggal jatuh tempo
        const sortedLiabilities = activeLiabilities.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        container.innerHTML = sortedLiabilities.map(liability => {
            const paidAmount = this.calculatePaidAmount(liability.id, payments);
            const remaining = liability.amount - paidAmount;
            const daysLeft = this.calculateDaysLeft(liability.dueDate);
            
            let statusClass = '';
            let statusText = '';
            
            if (daysLeft < 0) {
                statusClass = 'danger';
                statusText = 'Terlambat';
            } else if (daysLeft === 0) {
                statusClass = 'warning';
                statusText = 'Hari ini';
            } else if (daysLeft <= 7) {
                statusClass = 'warning';
                statusText = `${daysLeft} hari`;
            } else {
                statusText = `${daysLeft} hari`;
            }

            return `
                <div class="payment-schedule-item" style="border-left-color: var(--${statusClass}-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${liability.emoji} ${liability.name}</span>
                        <span style="color: var(--${statusClass}-color); font-weight: bold;">${statusText}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
                        <span>${Utils.formatCurrency(remaining)}</span>
                        <span>${Utils.formatDateShort(liability.dueDate)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    async showAddLiabilityModal() {
        const wallets = await DB.getWallets();
        const walletOptions = wallets.map(w => `<option value="${w.id}">${w.emoji} ${w.name}</option>`).join('');
        
        const content = `
            <form id="addLiabilityForm">
                <div class="form-group">
                    <label>Nama Hutang</label>
                    <input type="text" class="form-control" id="liabilityName" required>
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="form-control" id="liabilityEmoji" value="💰" required>
                </div>
                <div class="form-group">
                    <label>Jumlah Hutang</label>
                    <input type="number" class="form-control" id="liabilityAmount" required min="1">
                </div>
                <div class="form-group">
                    <label>Tanggal Jatuh Tempo</label>
                    <input type="date" class="form-control" id="liabilityDueDate" required>
                </div>
                <div class="form-group">
                    <label>Dompet untuk Pembayaran</label>
                    <select class="form-control" id="liabilityWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Kreditur (Pemberi Pinjaman)</label>
                    <input type="text" class="form-control" id="liabilityCreditor" placeholder="Nama bank/teman/keluarga">
                </div>
                <div class="form-group">
                    <label>Catatan (Opsional)</label>
                    <input type="text" class="form-control" id="liabilityNotes" placeholder="Catatan hutang">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Hutang</button>
            </form>
        `;
        
        Utils.createModal('addLiabilityModal', 'Tambah Hutang', content);
        Utils.openModal('addLiabilityModal');

        document.getElementById('addLiabilityForm').onsubmit = (e) => {
            e.preventDefault();
            this.processAddLiability();
        };
    }

    async processAddLiability() {
        const name = document.getElementById('liabilityName').value;
        const emoji = document.getElementById('liabilityEmoji').value;
        const amount = parseFloat(document.getElementById('liabilityAmount').value);
        const dueDate = document.getElementById('liabilityDueDate').value;
        const walletId = document.getElementById('liabilityWallet').value;
        const creditor = document.getElementById('liabilityCreditor').value;
        const notes = document.getElementById('liabilityNotes').value;

        if (amount <= 0) {
            return Utils.showToast('Jumlah hutang harus lebih dari 0', 'error');
        }

        const liabilities = await DB.getLiabilities();
        liabilities.push({ 
            id: DB.generateId(), 
            name, 
            emoji, 
            amount, 
            dueDate, 
            walletId, 
            creditor, 
            notes,
            createdAt: new Date().toISOString()
        });
        
        await DB.saveLiabilities(liabilities);
        Utils.closeModal('addLiabilityModal');
        await this.renderLiabilitiesContent(document.getElementById('liabilitiesSubContent'));
        Utils.showToast('Hutang berhasil ditambahkan!', 'success');
    }

    async showEditLiabilityModal(liabilityId) {
        const liabilities = await DB.getLiabilities();
        const liability = liabilities.find(l => l.id === liabilityId);
        if (!liability) return;

        const wallets = await DB.getWallets();
        const walletOptions = wallets.map(w => `<option value="${w.id}" ${w.id === liability.walletId ? 'selected' : ''}>${w.emoji} ${w.name}</option>`).join('');

        const content = `
            <form id="editLiabilityForm">
                <div class="form-group">
                    <label>Nama Hutang</label>
                    <input type="text" class="form-control" id="editLiabilityName" value="${liability.name}" required>
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="form-control" id="editLiabilityEmoji" value="${liability.emoji}" required>
                </div>
                <div class="form-group">
                    <label>Jumlah Hutang</label>
                    <input type="number" class="form-control" id="editLiabilityAmount" value="${liability.amount}" required min="1">
                </div>
                <div class="form-group">
                    <label>Tanggal Jatuh Tempo</label>
                    <input type="date" class="form-control" id="editLiabilityDueDate" value="${liability.dueDate}" required>
                </div>
                <div class="form-group">
                    <label>Dompet untuk Pembayaran</label>
                    <select class="form-control" id="editLiabilityWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Kreditur (Pemberi Pinjaman)</label>
                    <input type="text" class="form-control" id="editLiabilityCreditor" value="${liability.creditor || ''}" placeholder="Nama bank/teman/keluarga">
                </div>
                <div class="form-group">
                    <label>Catatan (Opsional)</label>
                    <input type="text" class="form-control" id="editLiabilityNotes" value="${liability.notes || ''}" placeholder="Catatan hutang">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Update Hutang</button>
            </form>
        `;
        
        Utils.createModal('editLiabilityModal', 'Edit Hutang', content);
        Utils.openModal('editLiabilityModal');

        document.getElementById('editLiabilityForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('editLiabilityName').value;
            const emoji = document.getElementById('editLiabilityEmoji').value;
            const amount = parseFloat(document.getElementById('editLiabilityAmount').value);
            const dueDate = document.getElementById('editLiabilityDueDate').value;
            const walletId = document.getElementById('editLiabilityWallet').value;
            const creditor = document.getElementById('editLiabilityCreditor').value;
            const notes = document.getElementById('editLiabilityNotes').value;

            const updatedLiabilities = liabilities.map(l => 
                l.id === liabilityId ? { ...l, name, emoji, amount, dueDate, walletId, creditor, notes } : l
            );
            
            await DB.saveLiabilities(updatedLiabilities);
            Utils.closeModal('editLiabilityModal');
            await this.renderLiabilitiesContent(document.getElementById('liabilitiesSubContent'));
            Utils.showToast('Hutang berhasil diperbarui!', 'success');
        };
    }

    async showPayLiabilityModal(liabilityId) {
        const [liability, payments] = await Promise.all([
            DB.getLiabilities().then(l => l.find(li => li.id === liabilityId)),
            DB.getLiabilityPayments()
        ]);
        
        if (!liability) return;

        const paidAmount = this.calculatePaidAmount(liabilityId, payments);
        const remaining = liability.amount - paidAmount;

        const content = `
            <form id="payLiabilityForm">
                <div class="form-group">
                    <label>Hutang: ${liability.name}</label>
                    <div style="font-size: 14px; color: #666;">
                        Total: ${Utils.formatCurrency(liability.amount)} | 
                        Terbayar: ${Utils.formatCurrency(paidAmount)} | 
                        Sisa: ${Utils.formatCurrency(remaining)}
                    </div>
                </div>
                <div class="form-group">
                    <label>Jumlah Pembayaran</label>
                    <input type="number" class="form-control" id="paymentAmount" required min="1" max="${remaining}">
                    <small>Maksimal: ${Utils.formatCurrency(remaining)}</small>
                </div>
                <div class="form-group">
                    <label>Tanggal Pembayaran</label>
                    <input type="date" class="form-control" id="paymentDate" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Catatan Pembayaran (Opsional)</label>
                    <input type="text" class="form-control" id="paymentNotes" placeholder="Catatan pembayaran">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Bayar Hutang</button>
            </form>
        `;
        
        Utils.createModal('payLiabilityModal', 'Bayar Hutang', content);
        Utils.openModal('payLiabilityModal');

        document.getElementById('payLiabilityForm').onsubmit = (e) => {
            e.preventDefault();
            this.processPayment(liabilityId);
        };
    }

    async processPayment(liabilityId) {
        const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
        const paymentDate = document.getElementById('paymentDate').value;
        const paymentNotes = document.getElementById('paymentNotes').value;

        const [liabilities, wallets, payments, transactions] = await Promise.all([
            DB.getLiabilities(), DB.getWallets(), DB.getLiabilityPayments(), DB.getTransactions()
        ]);
        
        const liability = liabilities.find(l => l.id === liabilityId);
        const wallet = wallets.find(w => w.id === liability.walletId);
        const paidAmount = this.calculatePaidAmount(liabilityId, payments);

        // Validasi
        if (paymentAmount > (liability.amount - paidAmount)) {
            return Utils.showToast('Pembayaran melebihi sisa hutang!', 'error');
        }
        
        if (!wallet || wallet.balance < paymentAmount) {
            return Utils.showToast('Saldo dompet tidak cukup!', 'error');
        }

        // Update saldo dompet
        wallet.balance -= paymentAmount;
        
        // Tambahkan pembayaran
        payments.push({ 
            id: DB.generateId(), 
            liabilityId, 
            amount: paymentAmount, 
            date: paymentDate, 
            notes: paymentNotes 
        });
        
        // Buat transaksi pengeluaran
        const categoryId = await this.getOrCreateLiabilityCategory();
        transactions.push({ 
            id: DB.generateId(), 
            type: 'expense', 
            amount: paymentAmount, 
            walletId: liability.walletId, 
            categoryId, 
            date: paymentDate, 
            notes: `Pembayaran hutang: ${liability.name}` 
        });

        await Promise.all([
            DB.saveWallets(wallets),
            DB.saveLiabilityPayments(payments),
            DB.saveTransactions(transactions)
        ]);

        Utils.closeModal('payLiabilityModal');
        await this.renderLiabilitiesContent(document.getElementById('liabilitiesSubContent'));
        await this.app.updateTotalBalance();
        Utils.showToast('Pembayaran berhasil!', 'success');
    }
    
    async deleteLiability(liabilityId) {
        if (confirm('Hapus liabilitas ini? Riwayat pembayaran juga akan dihapus.')) {
            let [liabilities, payments] = await Promise.all([DB.getLiabilities(), DB.getLiabilityPayments()]);
            liabilities = liabilities.filter(l => l.id !== liabilityId);
            payments = payments.filter(p => p.liabilityId !== liabilityId);
            await Promise.all([DB.saveLiabilities(liabilities), DB.saveLiabilityPayments(payments)]);
            await this.renderLiabilitiesContent(document.getElementById('liabilitiesSubContent'));
            Utils.showToast('Hutang berhasil dihapus!', 'success');
        }
    }

    async getOrCreateLiabilityCategory() {
        let categories = await DB.getCategories();
        let liabilityCategory = categories.find(c => c.name === 'Pembayaran Hutang');
        if (!liabilityCategory) {
            liabilityCategory = { id: DB.generateId(), name: 'Pembayaran Hutang', type: 'expense', emoji: '🏦' };
            categories.push(liabilityCategory);
            await DB.saveCategories(categories);
        }
        return liabilityCategory.id;
    }

    async getOrCreateBillCategory(billType) {
        let categories = await DB.getCategories();
        let categoryName = '';
        let categoryEmoji = '';
        
        switch(billType) {
            case 'electricity':
                categoryName = 'Listrik';
                categoryEmoji = '⚡';
                break;
            case 'water':
                categoryName = 'Air';
                categoryEmoji = '💧';
                break;
            case 'internet':
                categoryName = 'Internet';
                categoryEmoji = '🌐';
                break;
            case 'phone':
                categoryName = 'Telepon';
                categoryEmoji = '📱';
                break;
            case 'subscription':
                categoryName = 'Langganan';
                categoryEmoji = '🔄';
                break;
            case 'credit-card':
                categoryName = 'Kartu Kredit';
                categoryEmoji = '💳';
                break;
            case 'insurance':
                categoryName = 'Asuransi';
                categoryEmoji = '🛡️';
                break;
            default:
                categoryName = 'Tagihan';
                categoryEmoji = '📄';
        }

        let billCategory = categories.find(c => c.name === categoryName && c.type === 'expense');
        if (!billCategory) {
            billCategory = { id: DB.generateId(), name: categoryName, type: 'expense', emoji: categoryEmoji };
            categories.push(billCategory);
            await DB.saveCategories(categories);
        }
        return billCategory.id;
    }

    calculateDaysLeft(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
