// js/modules/budget.js (Versi Final dan Lengkap dengan async/await)
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class BudgetModule {
    constructor(app) {
        this.app = app;
        this.budgetSubTab = 'budget';
    }

    async render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🎯 Budget & Tabungan</h3>
                    <div class="sub-tab-navigation">
                        <button class="btn btn-outline btn-sm ${this.budgetSubTab === 'budget' ? 'active' : ''}" id="tabBudget" data-sub-tab="budget">📊 Anggaran</button>
                        <button class="btn btn-outline btn-sm ${this.budgetSubTab === 'savings' ? 'active' : ''}" id="tabSavings" data-sub-tab="savings">🎯 Target Tabungan</button>
                    </div>
                </div>
                <div id="budgetSubContent"></div>
            </div>
        `;

        await this.renderBudgetSubContent();
        
        document.getElementById('tabBudget').addEventListener('click', (e) => this.switchBudgetSubTab('budget', e));
        document.getElementById('tabSavings').addEventListener('click', (e) => this.switchBudgetSubTab('savings', e));
    }

    async switchBudgetSubTab(subTab, event) {
        this.budgetSubTab = subTab;
        
        document.querySelectorAll('.sub-tab-navigation .btn').forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        await this.renderBudgetSubContent();
    }

    async renderBudgetSubContent() {
        const container = document.getElementById('budgetSubContent');
        if (!container) return;

        if (this.budgetSubTab === 'budget') {
            await this.renderBudgetContent(container);
        } else {
            await this.renderSavingsContent(container);
        }
    }

    async renderBudgetContent(container) {
        container.innerHTML = `
            <div style="text-align: right; margin-bottom: 15px;"><button class="btn btn-primary" id="addBudgetBtn">+ Tambah Budget</button></div>
            <div id="budgetsList"></div>
            <div class="card" style="margin-top: 20px;"><div class="card-header"><h3 class="card-title">📊 Progress Budget</h3></div><div id="budgetProgress"></div></div>
        `;
        document.getElementById('addBudgetBtn').addEventListener('click', () => this.showAddBudgetModal());
        await this.renderBudgets();
    }

    async renderSavingsContent(container) {
        container.innerHTML = `
            <div style="text-align: right; margin-bottom: 15px;"><button class="btn btn-primary" id="addSavingsGoalBtn">+ Target Tabungan Baru</button></div>
            <div id="savingsGoalsList"></div>
            <div class="card" style="margin-top: 20px;"><div class="card-header"><h3 class="card-title">💰 Progress Menabung</h3></div><div id="savingsProgress"></div></div>
        `;
        document.getElementById('addSavingsGoalBtn').addEventListener('click', () => this.showAddSavingsGoalModal());
        await this.renderSavingsGoals();
        await this.renderSavingsProgress();
    }

    async renderBudgets() {
        const [budgets, categories, transactions] = await Promise.all([DB.getBudgets(), DB.getCategories(), DB.getTransactions()]);
        const container = document.getElementById('budgetsList');
        const progressContainer = document.getElementById('budgetProgress');
        
        if (!container || !progressContainer) return;

        if (budgets.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="emoji">🎯</div><p>Belum ada anggaran. Tambahkan satu!</p></div>`;
            progressContainer.innerHTML = '';
            return;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let budgetListHtml = '';
        let budgetProgressHtml = '';

        budgets.forEach(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            if (!category) return;
            
            const spent = transactions.filter(t => {
                const tDate = new Date(t.date);
                return t.categoryId === budget.categoryId && t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
            }).reduce((sum, t) => sum + t.amount, 0);
            
            const remaining = budget.amount - spent;
            const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
            const progressBarColor = percentage >= 100 ? 'var(--danger-color)' : percentage > 75 ? 'var(--warning-color)' : 'var(--success-color)';

            budgetListHtml += `
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
                </div>`;
                
            budgetProgressHtml += `
                <div class="card progress-card">
                    <div class="card-header">
                        <h4 class="card-title">${category.emoji} ${category.name}</h4>
                        <span>${Math.round(percentage)}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%; background: ${progressBarColor};"></div>
                    </div>
                    <p class="progress-text">${Utils.formatCurrency(spent)} dari ${Utils.formatCurrency(budget.amount)}</p>
                </div>`;
        });

        container.innerHTML = budgetListHtml;
        progressContainer.innerHTML = budgetProgressHtml;
        
        container.querySelectorAll('.edit-budget-btn').forEach(btn => btn.addEventListener('click', (e) => this.showEditBudgetModal(e.target.dataset.budgetId)));
        container.querySelectorAll('.delete-budget-btn').forEach(btn => btn.addEventListener('click', (e) => this.deleteBudget(e.target.dataset.budgetId)));
    }

async renderSavingsGoals() {
    const goals = await DB.getSavingsGoals();
    const container = document.getElementById('savingsGoalsList');
    if (!container) return;

    if (goals.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="emoji">🎯</div><p>Belum ada target tabungan</p></div>`;
        return;
    }

    container.innerHTML = goals.map(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const daysLeft = this.calculateDaysLeft(goal.targetDate);
        const savedPercentage = Math.min(progress, 100);
        
        // Tentukan warna berdasarkan progress
        let progressColor = '';
        if (savedPercentage >= 100) {
            progressColor = 'var(--success-color)'; // Hijau untuk tercapai
        } else if (daysLeft < 0) {
            progressColor = 'var(--danger-color)'; // Merah untuk terlambat
        } else if (savedPercentage >= 70) {
            progressColor = '#FFA500'; // Orange untuk hampir tercapai
        } else if (savedPercentage >= 40) {
            progressColor = '#2196F3'; // Biru untuk progress menengah
        } else {
            progressColor = '#FF9800'; // Orange muda untuk progress awal
        }

        let statusClass = '';
        let statusText = '';
        
        if (savedPercentage >= 100) {
            statusClass = 'success';
            statusText = '🎉 Tercapai!';
        } else if (daysLeft < 0) {
            statusClass = 'danger';
            statusText = '⏰ Terlambat';
        } else {
            statusText = `${daysLeft} hari lagi`;
        }

        return `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid ${progressColor};">
                <div class="card-header">
                    <h4 class="card-title">${goal.emoji} ${goal.name}</h4>
                    <span style="color: var(--${statusClass}-color); font-weight: bold;">${statusText}</span>
                </div>
                
                <!-- Progress Bar Section -->
                <div style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span>Terkumpul: <strong>${Utils.formatCurrency(goal.currentAmount)}</strong></span>
                        <span>Target: <strong>${Utils.formatCurrency(goal.targetAmount)}</strong></span>
                    </div>
                    
                    <!-- Progress Bar Container - Diperbaiki -->
                    <div style="background: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden; position: relative; width: 100%;">
                        <div style="width: ${savedPercentage}%; 
                                 background: ${progressColor}; 
                                 height: 100%; 
                                 border-radius: 10px;
                                 transition: width 0.5s ease-in-out;
                                 position: relative;
                                 display: flex;
                                 align-items: center;
                                 justify-content: flex-end;
                                 padding-right: 8px;
                                 font-size: 12px;
                                 font-weight: bold;
                                 color: ${savedPercentage > 50 ? 'white' : '#333'};">
                            ${Math.round(savedPercentage)}%
                        </div>
                    </div>
                    
                    <!-- Progress Stats -->
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                        <span>${Math.round(savedPercentage)}% tercapai</span>
                        <span>${Utils.formatCurrency(goal.targetAmount - goal.currentAmount)} lagi</span>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-success btn-sm add-savings-btn" data-goal-id="${goal.id}">💰 Tambah</button>
                    <button class="btn btn-info btn-sm edit-savings-btn" data-goal-id="${goal.id}">✏️ Edit</button>
                    <button class="btn btn-danger btn-sm delete-savings-btn" data-goal-id="${goal.id}">🗑️ Hapus</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.add-savings-btn').forEach(btn => btn.addEventListener('click', (e) => this.showAddToSavingsModal(e.target.dataset.goalId)));
    container.querySelectorAll('.edit-savings-btn').forEach(btn => btn.addEventListener('click', (e) => this.showEditSavingsGoalModal(e.target.dataset.goalId)));
    container.querySelectorAll('.delete-savings-btn').forEach(btn => btn.addEventListener('click', (e) => this.deleteSavingsGoal(e.target.dataset.goalId)));
}

    async renderSavingsProgress() {
        const goals = await DB.getSavingsGoals();
        const container = document.getElementById('savingsProgress');
        if (!container) return;

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
                <p style="font-size: 24px; font-weight: bold; color: var(--success-color);">${Utils.formatCurrency(totalCurrent)} / ${Utils.formatCurrency(totalTarget)}</p>
                <div class="progress-bar-container"><div class="progress-bar" style="width: ${overallProgress}%; background: var(--success-color);"></div></div>
            </div>
        `;
    }

    async showAddBudgetModal() {
        const categories = await DB.getCategories().then(cats => cats.filter(c => c.type === 'expense'));
        if (categories.length === 0) {
            return Utils.showToast('Tambahkan kategori pengeluaran terlebih dahulu!', 'error');
        }
        const categoryOptions = categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
        const content = `
            <form id="addBudgetForm">
                <div class="form-group"><label>Kategori</label><select class="form-control" id="budgetCategory" required>${categoryOptions}</select></div>
                <div class="form-group"><label>Jumlah Anggaran (Bulanan)</label><input type="number" class="form-control" id="budgetAmount" required min="1"></div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Budget</button>
            </form>
        `;
        Utils.createModal('addBudgetModal', 'Tambah Budget', content);
        Utils.openModal('addBudgetModal');

        document.getElementById('addBudgetForm').onsubmit = async (e) => {
            e.preventDefault();
            const categoryId = document.getElementById('budgetCategory').value;
            const amount = parseFloat(document.getElementById('budgetAmount').value);
            const budgets = await DB.getBudgets();
            if (budgets.find(b => b.categoryId === categoryId)) {
                return Utils.showToast('Budget untuk kategori ini sudah ada!', 'error');
            }
            budgets.push({ id: DB.generateId(), categoryId, amount, period: 'monthly' });
            await DB.saveBudgets(budgets);
            Utils.closeModal('addBudgetModal');
            await this.renderBudgets();
            Utils.showToast('Budget berhasil ditambahkan!', 'success');
        };
    }

    async showEditBudgetModal(budgetId) {
        const budgets = await DB.getBudgets();
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return;
        const categories = await DB.getCategories().then(cats => cats.filter(c => c.type === 'expense'));
        const category = categories.find(c => c.id === budget.categoryId);
        if (!category) return;
        
        const categoryOptions = categories.map(c => `<option value="${c.id}" ${c.id === budget.categoryId ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('');
        
        const content = `
            <form id="editBudgetForm">
                <div class="form-group">
                    <label>Kategori</label>
                    <select class="form-control" id="editBudgetCategory" required>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Jumlah Anggaran (Bulanan)</label>
                    <input type="number" class="form-control" id="editBudgetAmount" value="${budget.amount}" required min="1">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Update Budget</button>
            </form>
        `;
        
        Utils.createModal('editBudgetModal', 'Edit Budget', content);
        Utils.openModal('editBudgetModal');

        document.getElementById('editBudgetForm').onsubmit = async (e) => {
            e.preventDefault();
            const categoryId = document.getElementById('editBudgetCategory').value;
            const amount = parseFloat(document.getElementById('editBudgetAmount').value);
            
            const updatedBudgets = budgets.map(b => 
                b.id === budgetId ? { ...b, categoryId, amount } : b
            );
            
            await DB.saveBudgets(updatedBudgets);
            Utils.closeModal('editBudgetModal');
            await this.renderBudgets();
            Utils.showToast('Budget berhasil diperbarui!', 'success');
        };
    }

    async deleteBudget(budgetId) {
        if (confirm('Hapus budget ini?')) {
            const budgets = await DB.getBudgets();
            const updatedBudgets = budgets.filter(b => b.id !== budgetId);
            await DB.saveBudgets(updatedBudgets);
            await this.renderBudgets();
            Utils.showToast('Budget berhasil dihapus!', 'success');
        }
    }

    async showAddSavingsGoalModal() {
        const wallets = await DB.getWallets();
        const walletOptions = wallets.map(w => `<option value="${w.id}">${w.emoji} ${w.name}</option>`).join('');
        
        const content = `
            <form id="addSavingsGoalForm">
                <div class="form-group">
                    <label>Nama Target Tabungan</label>
                    <input type="text" class="form-control" id="savingsGoalName" required>
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="form-control" id="savingsGoalEmoji" value="💰" required>
                </div>
                <div class="form-group">
                    <label>Target Amount</label>
                    <input type="number" class="form-control" id="savingsGoalTargetAmount" required min="1">
                </div>
                <div class="form-group">
                    <label>Tanggal Target</label>
                    <input type="date" class="form-control" id="savingsGoalTargetDate" required>
                </div>
                <div class="form-group">
                    <label>Dompet</label>
                    <select class="form-control" id="savingsGoalWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Buat Target Tabungan</button>
            </form>
        `;
        
        Utils.createModal('addSavingsGoalModal', 'Buat Target Tabungan', content);
        Utils.openModal('addSavingsGoalModal');

        document.getElementById('addSavingsGoalForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('savingsGoalName').value;
            const emoji = document.getElementById('savingsGoalEmoji').value;
            const targetAmount = parseFloat(document.getElementById('savingsGoalTargetAmount').value);
            const targetDate = document.getElementById('savingsGoalTargetDate').value;
            const walletId = document.getElementById('savingsGoalWallet').value;

            const goals = await DB.getSavingsGoals();
            goals.push({ 
                id: DB.generateId(), 
                name, 
                emoji, 
                targetAmount, 
                currentAmount: 0, 
                targetDate, 
                walletId 
            });
            
            await DB.saveSavingsGoals(goals);
            Utils.closeModal('addSavingsGoalModal');
            await this.renderSavingsGoals();
            await this.renderSavingsProgress();
            Utils.showToast('Target tabungan berhasil dibuat!', 'success');
        };
    }

    async showEditSavingsGoalModal(goalId) {
        const goals = await DB.getSavingsGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;
        
        const wallets = await DB.getWallets();
        const walletOptions = wallets.map(w => `<option value="${w.id}" ${w.id === goal.walletId ? 'selected' : ''}>${w.emoji} ${w.name}</option>`).join('');
        
        const content = `
            <form id="editSavingsGoalForm">
                <div class="form-group">
                    <label>Nama Target Tabungan</label>
                    <input type="text" class="form-control" id="editSavingsGoalName" value="${goal.name}" required>
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="form-control" id="editSavingsGoalEmoji" value="${goal.emoji}" required>
                </div>
                <div class="form-group">
                    <label>Target Amount</label>
                    <input type="number" class="form-control" id="editSavingsGoalTargetAmount" value="${goal.targetAmount}" required min="1">
                </div>
                <div class="form-group">
                    <label>Tanggal Target</label>
                    <input type="date" class="form-control" id="editSavingsGoalTargetDate" value="${goal.targetDate}" required>
                </div>
                <div class="form-group">
                    <label>Dompet</label>
                    <select class="form-control" id="editSavingsGoalWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Update Target Tabungan</button>
            </form>
        `;
        
        Utils.createModal('editSavingsGoalModal', 'Edit Target Tabungan', content);
        Utils.openModal('editSavingsGoalModal');

        document.getElementById('editSavingsGoalForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('editSavingsGoalName').value;
            const emoji = document.getElementById('editSavingsGoalEmoji').value;
            const targetAmount = parseFloat(document.getElementById('editSavingsGoalTargetAmount').value);
            const targetDate = document.getElementById('editSavingsGoalTargetDate').value;
            const walletId = document.getElementById('editSavingsGoalWallet').value;

            const updatedGoals = goals.map(g => 
                g.id === goalId ? { ...g, name, emoji, targetAmount, targetDate, walletId } : g
            );
            
            await DB.saveSavingsGoals(updatedGoals);
            Utils.closeModal('editSavingsGoalModal');
            await this.renderSavingsGoals();
            await this.renderSavingsProgress();
            Utils.showToast('Target tabungan berhasil diperbarui!', 'success');
        };
    }

    async showAddToSavingsModal(goalId) {
        const goals = await DB.getSavingsGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;
        
        const wallets = await DB.getWallets();
        const walletOptions = wallets.map(w => `<option value="${w.id}">${w.emoji} ${w.name}</option>`).join('');
        
        const content = `
            <form id="addToSavingsForm">
                <div class="form-group">
                    <label>Jumlah</label>
                    <input type="number" class="form-control" id="savingsAddAmount" required min="1" max="${goal.targetAmount - goal.currentAmount}">
                    <small>Sisa target: ${Utils.formatCurrency(goal.targetAmount - goal.currentAmount)}</small>
                </div>
                <div class="form-group">
                    <label>Dari Dompet</label>
                    <select class="form-control" id="savingsSourceWallet" required>
                        ${walletOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tanggal</label>
                    <input type="date" class="form-control" id="savingsAddDate" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Catatan (Opsional)</label>
                    <input type="text" class="form-control" id="savingsAddNotes">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Tabungan</button>
            </form>
        `;
        
        Utils.createModal('addToSavingsModal', 'Tambah Tabungan', content);
        Utils.openModal('addToSavingsModal');

        document.getElementById('addToSavingsForm').onsubmit = (e) => {
            e.preventDefault();
            this.processAddToSavings(goalId);
        };
    }
    
    async processAddToSavings(goalId) {
        const amount = parseFloat(document.getElementById('savingsAddAmount').value);
        const walletId = document.getElementById('savingsSourceWallet').value;
        const date = document.getElementById('savingsAddDate').value;
        const notes = document.getElementById('savingsAddNotes').value;

        const [goals, wallets, transactions, savingsTransactions] = await Promise.all([
            DB.getSavingsGoals(), DB.getWallets(), DB.getTransactions(), DB.getSavingsTransactions()
        ]);

        const goalIndex = goals.findIndex(g => g.id === goalId);
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet || wallet.balance < amount) return Utils.showToast('Saldo tidak cukup!', 'error');

        wallet.balance -= amount;
        goals[goalIndex].currentAmount += amount;
        const categoryId = await this.getOrCreateSavingsCategory();
        transactions.push({ 
            id: DB.generateId(), 
            type: 'expense', 
            amount, 
            walletId, 
            categoryId, 
            date, 
            notes: `Tabungan: ${goals[goalIndex].name}` 
        });
        savingsTransactions.push({ 
            id: DB.generateId(), 
            goalId, 
            amount, 
            walletId, 
            date, 
            notes 
        });

        await Promise.all([
            DB.saveWallets(wallets),
            DB.saveSavingsGoals(goals),
            DB.saveTransactions(transactions),
            DB.saveSavingsTransactions(savingsTransactions)
        ]);
        
        Utils.closeModal('addToSavingsModal');
        await this.renderSavingsGoals();
        await this.renderSavingsProgress();
        await this.app.updateTotalBalance();
        Utils.showToast('Berhasil menambahkan ke tabungan!', 'success');
    }

    async deleteSavingsGoal(goalId) {
        if (!confirm('Hapus target tabungan ini? Progress akan hilang.')) return;
        let [goals, savingsTransactions] = await Promise.all([DB.getSavingsGoals(), DB.getSavingsTransactions()]);
        goals = goals.filter(g => g.id !== goalId);
        savingsTransactions = savingsTransactions.filter(t => t.goalId !== goalId);
        await Promise.all([DB.saveSavingsGoals(goals), DB.saveSavingsTransactions(savingsTransactions)]);
        await this.renderSavingsGoals();
        await this.renderSavingsProgress();
        Utils.showToast('Target tabungan berhasil dihapus!', 'success');
    }
    
    async getOrCreateSavingsCategory() {
        const categories = await DB.getCategories();
        let savingsCategory = categories.find(c => c.name === 'Tabungan' && c.type === 'expense');
        
        if (!savingsCategory) {
            savingsCategory = { id: DB.generateId(), name: 'Tabungan', type: 'expense', emoji: '💰' };
            categories.push(savingsCategory);
            await DB.saveCategories(categories);
        }
        return savingsCategory.id;
    }

    calculateDaysLeft(dueDate) {
        const diffTime = new Date(dueDate) - new Date();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
