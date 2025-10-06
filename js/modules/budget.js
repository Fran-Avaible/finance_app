// MultipleFiles/js/modules/budget.js
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class BudgetModule {
    constructor(app) {
        this.app = app;
        this.budgetSubTab = 'budget'; // Default sub-tab
    }

    render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🎯 Budget & Tabungan</h3>
                    <div class="sub-tab-navigation">
                        <button class="btn btn-outline btn-sm ${this.budgetSubTab === 'budget' ? 'active' : ''}" 
                                id="tabBudget" data-sub-tab="budget">
                            📊 Anggaran
                        </button>
                        <button class="btn btn-outline btn-sm ${this.budgetSubTab === 'savings' ? 'active' : ''}" 
                                id="tabSavings" data-sub-tab="savings">
                            🎯 Target Tabungan
                        </button>
                    </div>
                </div>
                <div id="budgetSubContent">
                    </div>
            </div>
        `;

        this.renderBudgetSubContent();
        
        // PASANG EVENT LISTENERS UNTUK SUB-TAB NAVIGATION
        document.getElementById('tabBudget').addEventListener('click', (e) => this.switchBudgetSubTab('budget', e));
        document.getElementById('tabSavings').addEventListener('click', (e) => this.switchBudgetSubTab('savings', e));
    }

    switchBudgetSubTab(subTab, event) {
        this.budgetSubTab = subTab;
        
        document.querySelectorAll('.sub-tab-navigation .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (event.target) event.target.classList.add('active');
        
        this.renderBudgetSubContent();
    }

    renderBudgetSubContent() {
        const container = document.getElementById('budgetSubContent');
        if (!container) return;

        if (this.budgetSubTab === 'budget') {
            this.renderBudgetContent(container);
        } else {
            this.renderSavingsContent(container);
        }
    }

    renderBudgetContent(container) {
        container.innerHTML = `
            <div style="text-align: right; margin-bottom: 15px;">
                <button class="btn btn-primary" id="addBudgetBtn">+ Tambah Budget</button>
            </div>
            <div id="budgetsList"></div>
            
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">📊 Progress Budget</h3>
                </div>
                <div id="budgetProgress"></div>
            </div>
        `;
        document.getElementById('addBudgetBtn').addEventListener('click', () => this.showAddBudgetModal());
        this.renderBudgets();
    }

    renderSavingsContent(container) {
        container.innerHTML = `
            <div style="text-align: right; margin-bottom: 15px;">
                <button class="btn btn-primary" id="addSavingsGoalBtn">+ Target Tabungan Baru</button>
            </div>
            <div id="savingsGoalsList"></div>
            
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">💰 Progress Menabung</h3>
                </div>
                <div id="savingsProgress"></div>
            </div>
        `;
        document.getElementById('addSavingsGoalBtn').addEventListener('click', () => this.showAddSavingsGoalModal());
        this.renderSavingsGoals();
        this.renderSavingsProgress();
    }

    renderBudgets() {
        const budgets = DB.getBudgets();
        const container = document.getElementById('budgetsList');
        const progressContainer = document.getElementById('budgetProgress');
        
        if (budgets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🎯</div>
                    <p>Belum ada anggaran. Tambahkan satu!</p>
                </div>
            `;
            progressContainer.innerHTML = '';
            return;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        container.innerHTML = budgets.map(budget => {
            const category = DB.getCategories().find(c => c.id === budget.categoryId);
            if (!category) return '';
            
            const transactions = DB.getTransactions();
            const spent = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.categoryId === budget.categoryId &&
                           t.type === 'expense' &&
                           tDate.getMonth() === currentMonth &&
                           tDate.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + t.amount, 0);
                
            const remaining = budget.amount - spent;

            return `
                <div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-header">
                        <h4 class="card-title">${category.emoji} ${category.name}</h4>
                        <div>
                            <button class="btn btn-sm btn-info edit-budget-btn" data-budget-id="${budget.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-budget-btn" data-budget-id="${budget.id}">Hapus</button>
                        </div>
                    </div>
                    <p>Anggaran: ${Utils.formatCurrency(budget.amount)}</p>
                    <p>Terpakai: ${Utils.formatCurrency(spent)}</p>
                    <p>Sisa: <span style="color: ${remaining >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${Utils.formatCurrency(remaining)}</span></p>
                </div>
            `;
        }).join('');
        
        // PASANG EVENT LISTENERS UNTUK BUDGET ACTIONS
        container.querySelectorAll('.edit-budget-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showEditBudgetModal(e.target.dataset.budgetId));
        });
        container.querySelectorAll('.delete-budget-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteBudget(e.target.dataset.budgetId));
        });

        progressContainer.innerHTML = budgets.map(budget => {
            const category = DB.getCategories().find(c => c.id === budget.categoryId);
            if (!category) return '';
            
            const transactions = DB.getTransactions();
            const spent = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.categoryId === budget.categoryId &&
                           t.type === 'expense' &&
                           tDate.getMonth() === currentMonth &&
                           tDate.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + t.amount, 0);
                
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const progressBarColor = percentage > 100 ? 'var(--danger-color)' : 
                                   percentage > 75 ? 'var(--warning-color)' : 'var(--success-color)';

            return `
                <div class="card progress-card">
                    <div class="card-header">
                        <h4 class="card-title">${category.emoji} ${category.name}</h4>
                        <span>${Math.round(percentage)}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%; background: ${progressBarColor};"></div>
                    </div>
                    <p class="progress-text">
                        ${Utils.formatCurrency(spent)} dari ${Utils.formatCurrency(budget.amount)}
                    </p>
                </div>
            `;
        }).join('');
    }

    renderSavingsGoals() {
        const container = document.getElementById('savingsGoalsList');
        const goals = DB.getSavingsGoals();
        
        if (goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🎯</div>
                    <p>Belum ada target tabungan</p>
                    <p style="font-size: 14px; color: #666;">Buat target pertama Anda untuk mulai menabung!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = this.calculateDaysLeft(goal.targetDate);
            const savedPercentage = Math.min(progress, 100);
            
            let statusClass = '';
            let statusText = '';
            
            if (savedPercentage >= 100) {
                statusClass = 'success';
                statusText = '🎉 Tercapai!';
            } else if (daysLeft < 0) {
                statusClass = 'danger';
                statusText = '⏰ Terlambat';
            } else if (daysLeft === 0) {
                statusClass = 'warning';
                statusText = '⚠️ Hari ini';
            } else if (daysLeft <= 7) {
                statusClass = 'warning';
                statusText = `${daysLeft} hari lagi`;
            } else {
                statusText = `${daysLeft} hari lagi`;
            }

            return `
                <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--${statusClass}-color);">
                    <div class="card-header">
                        <h4 class="card-title">${goal.emoji} ${goal.name}</h4>
                        <span style="color: var(--${statusClass}-color); font-weight: bold;">${statusText}</span>
                    </div>
                    
                    <div style="margin: 10px 0;">
                        <div style="display: flex; justify-content: space-between; font-size: 14px;">
                            <span>Terkumpul: <strong>${Utils.formatCurrency(goal.currentAmount)}</strong></span>
                            <span>Target: <strong>${Utils.formatCurrency(goal.targetAmount)}</strong></span>
                        </div>
                        
                        <div class="progress-bar-container" style="margin: 8px 0;">
                            <div class="progress-bar" style="width: ${savedPercentage}%; background: var(--${statusClass}-color);"></div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
                            <span>${Math.round(savedPercentage)}%</span>
                            <span>Sisa: ${Utils.formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-success btn-sm add-savings-btn" data-goal-id="${goal.id}">
                            💰 Tambah
                        </button>
                        <button class="btn btn-info btn-sm edit-savings-btn" data-goal-id="${goal.id}">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-savings-btn" data-goal-id="${goal.id}">
                            🗑️ Hapus
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // PASANG EVENT LISTENERS UNTUK SAVINGS ACTIONS
        container.querySelectorAll('.add-savings-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showAddToSavingsModal(e.target.dataset.goalId));
        });
        container.querySelectorAll('.edit-savings-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showEditSavingsGoalModal(e.target.dataset.goalId));
        });
        container.querySelectorAll('.delete-savings-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteSavingsGoal(e.target.dataset.goalId));
        });
    }

    renderSavingsProgress() {
        const container = document.getElementById('savingsProgress');
        const goals = DB.getSavingsGoals();
        
        if (goals.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Tidak ada progress untuk ditampilkan</p>';
            return;
        }

        const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
        const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <h4>Total Tabungan</h4>
                <p style="font-size: 24px; font-weight: bold; color: var(--success-color);">
                    ${Utils.formatCurrency(totalCurrent)} / ${Utils.formatCurrency(totalTarget)}
                </p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${overallProgress}%; background: var(--success-color);"></div>
                </div>
                <p style="font-size: 14px; color: #666;">${Math.round(overallProgress)}% dari total target</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
                <div class="stat-card">
                    <div style="font-size: 12px; color: #666;">Target Aktif</div>
                    <div style="font-weight: bold;">${goals.length}</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 12px; color: #666;">Tercapai</div>
                    <div style="font-weight: bold; color: var(--success-color);">
                        ${goals.filter(g => g.currentAmount >= g.targetAmount).length}
                    </div>
                </div>
            </div>
        `;
    }

    showAddSavingsGoalModal() {
        const wallets = DB.getWallets();
        const walletOptions = wallets.map(w => 
            `<option value="${w.id}">${w.emoji} ${w.name} - ${Utils.formatCurrency(w.balance)}</option>`
        ).join('');

        const content = `
            <form id="addSavingsGoalForm">
                <div class="form-group">
                    <label class="form-label">Nama Target Tabungan</label>
                    <input type="text" class="form-control" id="savingsGoalName" 
                           placeholder="Contoh: Liburan Bali, DP Rumah, dll" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Emoji</label>
                    <input type="text" class="form-control" id="savingsGoalEmoji" value="🎯" maxlength="2">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Jumlah</label>
                    <input type="number" class="form-control" id="savingsTargetAmount" required min="1">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tanggal Target</label>
                    <input type="date" class="form-control" id="savingsTargetDate" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Dompet Sumber</label>
                    <select class="form-control" id="savingsWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Catatan (opsional)</label>
                    <textarea class="form-control" id="savingsNotes" rows="2" placeholder="Deskripsi target tabungan..."></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%;">🎯 Buat Target Tabungan</button>
            </form>
        `;

        Utils.createModal('addSavingsGoalModal', 'Buat Target Tabungan', content);
        Utils.openModal('addSavingsGoalModal');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('savingsTargetDate').min = tomorrow.toISOString().split('T')[0];

        document.getElementById('addSavingsGoalForm').onsubmit = (e) => {
            e.preventDefault();
            this.processAddSavingsGoal();
        };
    }

    processAddSavingsGoal() {
        const name = document.getElementById('savingsGoalName').value;
        const emoji = document.getElementById('savingsGoalEmoji').value;
        const targetAmount = parseFloat(document.getElementById('savingsTargetAmount').value);
        const targetDate = document.getElementById('savingsTargetDate').value;
        const walletId = document.getElementById('savingsWallet').value;
        const notes = document.getElementById('savingsNotes').value;

        if (!name || !targetAmount || !targetDate || !walletId) {
            Utils.showToast('Harap isi semua field yang wajib!', 'error');
            return;
        }

        const goals = DB.getSavingsGoals();
        goals.push({
            id: DB.generateId(),
            name,
            emoji,
            targetAmount,
            currentAmount: 0,
            targetDate,
            walletId,
            notes,
            createdAt: new Date().toISOString()
        });

        if (DB.saveSavingsGoals(goals)) {
            Utils.closeModal('addSavingsGoalModal');
            this.renderSavingsGoals();
            this.renderSavingsProgress();
            Utils.showToast('Target tabungan berhasil dibuat!', 'success');
        }
    }

    showAddToSavingsModal(goalId) {
        const goal = DB.getSavingsGoals().find(g => g.id === goalId);
        if (!goal) return;

        const wallets = DB.getWallets();
        const walletOptions = wallets.map(w => 
            `<option value="${w.id}">${w.emoji} ${w.name} - ${Utils.formatCurrency(w.balance)}</option>`
        ).join('');

        const remaining = goal.targetAmount - goal.currentAmount;
        const modalId = 'addToSavingsModal';

        const content = `
            <form id="addToSavingsForm">
                <div class="form-group">
                    <label class="form-label">Target Tabungan</label>
                    <input type="text" class="form-control" value="${goal.emoji} ${goal.name}" readonly>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Sisa Target</label>
                    <input type="text" class="form-control" value="${Utils.formatCurrency(remaining)}" readonly>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Jumlah yang Ditambahkan</label>
                    <input type="number" class="form-control" id="savingsAddAmount" 
                           max="${remaining}" min="1" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Dari Dompet</label>
                    <select class="form-control" id="savingsSourceWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tanggal</label>
                    <input type="date" class="form-control" id="savingsAddDate" 
                           value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Catatan (opsional)</label>
                    <input type="text" class="form-control" id="savingsAddNotes" 
                           placeholder="Contoh: Setoran bulanan">
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    💰 Tambah ke Tabungan
                </button>
            </form>
        `;

        Utils.createModal(modalId, 'Tambah Tabungan', content);
        Utils.openModal(modalId);

        document.getElementById('addToSavingsForm').onsubmit = (e) => {
            e.preventDefault();
            this.processAddToSavings(goalId);
        };
    }

    processAddToSavings(goalId) {
        const goals = DB.getSavingsGoals();
        const goalIndex = goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return;

        const amount = parseFloat(document.getElementById('savingsAddAmount').value);
        const walletId = document.getElementById('savingsSourceWallet').value;
        const date = document.getElementById('savingsAddDate').value;
        const notes = document.getElementById('savingsAddNotes').value;

        if (!amount || amount <= 0) {
            Utils.showToast('Jumlah harus lebih dari 0!', 'error');
            return;
        }

        const wallet = DB.getWallets().find(w => w.id === walletId);
        if (!wallet) {
            Utils.showToast('Dompet tidak ditemukan!', 'error');
            return;
        }

        if (wallet.balance < amount) {
            Utils.showToast('Saldo dompet tidak mencukupi!', 'error');
            return;
        }

        const remaining = goals[goalIndex].targetAmount - goals[goalIndex].currentAmount;
        if (amount > remaining) {
            Utils.showToast(`Jumlah melebihi sisa target! Sisa: ${Utils.formatCurrency(remaining)}`, 'error');
            return;
        }

        try {
            wallet.balance -= amount;
            DB.saveWallets(DB.getWallets().map(w => w.id === wallet.id ? wallet : w));

            goals[goalIndex].currentAmount += amount;
            DB.saveSavingsGoals(goals);

            const savingsTransactions = DB.getSavingsTransactions();
            savingsTransactions.push({
                id: DB.generateId(),
                goalId: goalId,
                amount: amount,
                walletId: walletId,
                date: date,
                notes: notes,
                createdAt: new Date().toISOString()
            });
            DB.saveSavingsTransactions(savingsTransactions);

            const transactions = DB.getTransactions();
            transactions.push({
                id: DB.generateId(),
                type: 'expense',
                amount: amount,
                walletId: walletId,
                categoryId: this.getOrCreateSavingsCategory(),
                date: date,
                notes: `Tabungan: ${goals[goalIndex].name}` + (notes ? ` - ${notes}` : ''),
                createdAt: new Date().toISOString()
            });
            DB.saveTransactions(transactions);

            Utils.closeModal('addToSavingsModal');
            this.renderSavingsGoals();
            this.renderSavingsProgress();
            this.app.dashboardModule.renderWalletsList(); 
            this.app.updateTotalBalance();
            Utils.showToast(`Berhasil menambahkan ${Utils.formatCurrency(amount)} ke tabungan!`, 'success');

        } catch (error) {
            console.error('Error adding to savings:', error);
            Utils.showToast('Terjadi kesalahan saat menambah tabungan', 'error');
        }
    }

    showEditSavingsGoalModal(goalId) {
        const goals = DB.getSavingsGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const wallets = DB.getWallets();
        const walletOptions = wallets.map(w => 
            `<option value="${w.id}" ${w.id === goal.walletId ? 'selected' : ''}>${w.emoji} ${w.name}</option>`
        ).join('');

        const modalId = 'editSavingsGoalModal';

        const content = `
            <form id="editSavingsGoalForm">
                <div class="form-group">
                    <label class="form-label">Nama Target Tabungan</label>
                    <input type="text" class="form-control" id="editSavingsGoalName" 
                           value="${goal.name}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Emoji</label>
                    <input type="text" class="form-control" id="editSavingsGoalEmoji" 
                           value="${goal.emoji}" maxlength="2">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Jumlah</label>
                    <input type="number" class="form-control" id="editSavingsTargetAmount" 
                           value="${goal.targetAmount}" required min="1">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tanggal Target</label>
                    <input type="date" class="form-control" id="editSavingsTargetDate" 
                           value="${goal.targetDate}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Dompet Sumber</label>
                    <select class="form-control" id="editSavingsWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-control" id="editSavingsNotes" rows="2">${goal.notes || ''}</textarea>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        💾 Simpan Perubahan
                    </button>
                    <button type="button" class="btn btn-danger" style="flex: 1;" 
                            id="deleteEditGoalBtn" data-goal-id="${goal.id}">
                        🗑️ Hapus
                    </button>
                </div>
            </form>
        `;

        Utils.createModal(modalId, 'Edit Target Tabungan', content);
        Utils.openModal(modalId);

        document.getElementById('editSavingsGoalForm').onsubmit = (e) => {
            e.preventDefault();
            this.processEditSavingsGoal(goalId);
        };
        document.getElementById('deleteEditGoalBtn').addEventListener('click', () => this.deleteSavingsGoal(goalId));
    }

    processEditSavingsGoal(goalId) {
        const goals = DB.getSavingsGoals();
        const goalIndex = goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return;

        const name = document.getElementById('editSavingsGoalName').value;
        const emoji = document.getElementById('editSavingsGoalEmoji').value;
        const targetAmount = parseFloat(document.getElementById('editSavingsTargetAmount').value);
        const targetDate = document.getElementById('editSavingsTargetDate').value;
        const walletId = document.getElementById('editSavingsWallet').value;
        const notes = document.getElementById('editSavingsNotes').value;

        if (!name || !targetAmount || !targetDate || !walletId) {
            Utils.showToast('Harap isi semua field yang wajib!', 'error');
            return;
        }

        if (targetAmount < goals[goalIndex].currentAmount) {
            Utils.showToast('Target tidak boleh kurang dari jumlah yang sudah terkumpul!', 'error');
            return;
        }

        goals[goalIndex] = {
            ...goals[goalIndex],
            name,
            emoji,
            targetAmount,
            targetDate,
            walletId,
            notes
        };

        if (DB.saveSavingsGoals(goals)) {
            Utils.closeModal('editSavingsGoalModal');
            this.renderSavingsGoals();
            this.renderSavingsProgress();
            Utils.showToast('Target tabungan berhasil diperbarui!', 'success');
        }
    }

    deleteSavingsGoal(goalId) {
        if (!confirm('Hapus target tabungan ini? Semua progress akan hilang.')) {
            return;
        }

        const goals = DB.getSavingsGoals().filter(g => g.id !== goalId);
        const savingsTransactions = DB.getSavingsTransactions().filter(t => t.goalId !== goalId);
        
        if (DB.saveSavingsGoals(goals) && DB.saveSavingsTransactions(savingsTransactions)) {
            Utils.closeModal('editSavingsGoalModal');
            this.renderSavingsGoals();
            this.renderSavingsProgress();
            Utils.showToast('Target tabungan berhasil dihapus!', 'success');
        }
    }

    getOrCreateSavingsCategory() {
        const categories = DB.getCategories();
        let savingsCategory = categories.find(c => c.name === 'Tabungan' && c.type === 'expense');
        
        if (!savingsCategory) {
            savingsCategory = {
                id: DB.generateId(),
                name: 'Tabungan',
                type: 'expense',
                emoji: '💰'
            };
            categories.push(savingsCategory);
            DB.saveCategories(categories);
        }
        
        return savingsCategory.id;
    }

    showAddBudgetModal() {
        const categories = DB.getCategories().filter(c => c.type === 'expense');
        
        if (categories.length === 0) {
            Utils.showToast('Tambahkan kategori pengeluaran terlebih dahulu!', 'error');
            this.app.showAddCategoryModal(); 
            return;
        }

        const categoryOptions = categories.map(c => 
            `<option value="${c.id}">${c.emoji} ${c.name}</option>`
        ).join('');

        const modalId = 'addBudgetModal';
        
        const content = `
            <form id="addBudgetForm">
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <select class="form-control" id="budgetCategory" required>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Jumlah Anggaran (Bulanan)</label>
                    <input type="number" class="form-control" id="budgetAmount" required min="1">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Budget</button>
            </form>
        `;

        Utils.createModal(modalId, 'Tambah Budget', content);
        Utils.openModal(modalId);

        document.getElementById('addBudgetForm').onsubmit = (e) => {
            e.preventDefault();
            const categoryId = document.getElementById('budgetCategory').value;
            const amount = parseFloat(document.getElementById('budgetAmount').value);

            const existingBudget = DB.getBudgets().find(b => b.categoryId === categoryId);
            if (existingBudget) {
                Utils.showToast('Budget untuk kategori ini sudah ada!', 'error');
                return;
            }

            const budgets = DB.getBudgets();
            budgets.push({
                id: DB.generateId(),
                categoryId,
                amount,
                period: 'monthly'
            });
            
            if (DB.saveBudgets(budgets)) {
                Utils.closeModal(modalId);
                this.renderBudgets();
                Utils.showToast('Budget berhasil ditambahkan!', 'success');
            }
        };
    }

    showEditBudgetModal(budgetId) {
        const budget = DB.getBudgets().find(b => b.id === budgetId);
        if (!budget) return;

        const category = DB.getCategories().find(c => c.id === budget.categoryId);
        if (!category) return;

        const modalId = 'editBudgetModal';
        
        const content = `
            <form id="editBudgetForm">
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <input type="text" class="form-control" value="${category.emoji} ${category.name}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Jumlah Anggaran (Bulanan)</label>
                    <input type="number" class="form-control" id="editBudgetAmount" value="${budget.amount}" min="1" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: var(--spacing-sm);">Simpan Perubahan</button>
                <button type="button" class="btn btn-danger" style="width: 100%;" id="deleteEditBudgetBtn" data-budget-id="${budget.id}">Hapus Budget</button>
            </form>
        `;

        Utils.createModal(modalId, 'Edit Budget', content);
        Utils.openModal(modalId);

        document.getElementById('editBudgetForm').onsubmit = (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('editBudgetAmount').value);

            const budgets = DB.getBudgets().map(b => 
                b.id === budgetId ? { ...b, amount } : b
            );
            
            if (DB.saveBudgets(budgets)) {
                Utils.closeModal(modalId);
                this.renderBudgets();
                Utils.showToast('Budget berhasil diperbarui!', 'success');
            }
        };
        document.getElementById('deleteEditBudgetBtn').addEventListener('click', () => this.deleteBudget(budgetId));
    }

    deleteBudget(budgetId) {
        if (confirm('Hapus budget ini?')) {
            const budgets = DB.getBudgets().filter(b => b.id !== budgetId);
            
            if (DB.saveBudgets(budgets)) {
                Utils.closeModal('editBudgetModal');
                this.renderBudgets();
                Utils.showToast('Budget berhasil dihapus!', 'success');
            }
        }
    }

    calculateDaysLeft(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        today.setHours(0, 0, 0, 0); // Normalize today to start of day
        due.setHours(0, 0, 0, 0);   // Normalize due date to start of day
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
