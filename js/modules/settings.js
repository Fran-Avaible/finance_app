// MultipleFiles/js/modules/settings.js
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class SettingsModule {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⚙️ Pengaturan Aplikasi</h3>
                </div>
                
                <div class="tab-grid tab-grid-2">
                    <div>
                        <h4>🎨 Tampilan</h4>
                        <div id="themeSettings">
                            ${this.renderThemeSettings()}
                        </div>
                        
                        <h4 style="margin-top: 20px;">💾 Data Management</h4>
                        <div class="data-management">
                            <button class="btn btn-warning" onclick="window.app.exportToCSV()">
                                <span>📤</span> Export CSV
                            </button>
                            <button class="btn btn-info" onclick="window.app.showBackupModal()">
                                <span>💾</span> Backup 
                            </button>
                        </div>
                        
                        <div class="data-management">
                            <label class="file-input-label btn btn-primary">
                                <span>📁</span> Restore 
                                <input type="file" id="restoreFile" class="file-input" accept=".json">
                            </label>
                        </div>
                        
                        <button class="btn btn-danger" style="width: 100%; margin-top: 10px;" 
                                onclick="window.app.confirmClearAllData()">
                            <span>🗑️</span> Hapus Semua Data
                        </button>
                    </div>
                    
                    <div>
                        <h4>🏷️ Kelola Kategori</h4>
                        <div id="categoriesManagement"></div>
                        <button class="btn btn-primary" id="addCategoryBtn"
                                style="width: 100%; margin-top: 10px;">
                            + Tambah Kategori
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ℹ️ Informasi Aplikasi</h3>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🤖</div>
                    <h3>Finance Super App</h3>
                    <p style="color: #666; margin-bottom: 15px;">Aplikasi manajemen keuangan offline</p>
                    <div style="background: var(--light-color); padding: 15px; border-radius: 10px;">
                        <p><strong>Total Transaksi:</strong> <span id="totalTransactionsCount">0</span></p>
                        <p><strong>Total Wallet:</strong> <span id="totalWalletsCount">0</span></p>
                        <p><strong>Versi:</strong> 2.2.1</p>
                        <p><strong>Mode:</strong> <span id="currentThemeDisplay">${Utils.getTheme() === 'dark' ? '🌙 Gelap' : '☀️ Terang'}</span></p>
                    </div>
                </div>
            </div>
        `;
        
        this.renderCategoriesManagement();
        this.updateAppInfo();
        this.setupListeners();
    }

    renderThemeSettings() {
        const currentTheme = Utils.getTheme();
        
        return `
            <div class="form-group">
                <label class="form-label">🎨 Tampilan</label>
                <div style="display: flex; gap: 10px;">
                    <button class="btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-outline'} light-theme-btn" style="flex: 1;">
                        ☀️ Mode Terang
                    </button>
                    <button class="btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-outline'} dark-theme-btn" style="flex: 1;">
                        🌙 Mode Gelap
                    </button>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                <div style="text-align: center; padding: 10px; background: ${currentTheme === 'light' ? '#ffffff' : '#2d2d2d'}; border-radius: 8px; border: 2px solid ${currentTheme === 'light' ? '#667eea' : 'transparent'};">
                    <div style="font-size: 24px;">☀️</div>
                    <div style="font-size: 12px; margin-top: 5px;">Terang</div>
                </div>
                <div style="text-align: center; padding: 10px; background: ${currentTheme === 'dark' ? '#2d2d2d' : '#1a1a1a'}; border-radius: 8px; border: 2px solid ${currentTheme === 'dark' ? '#7c93fb' : 'transparent'}; color: ${currentTheme === 'dark' ? 'white' : 'var(--dark-color)'};">
                    <div style="font-size: 24px;">🌙</div>
                    <div style="font-size: 12px; margin-top: 5px;">Gelap</div>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background: var(--light-color); border-radius: 8px;">
                <p style="font-size: 12px; margin: 0; color: var(--text-color);">
                    💡 <strong>Tips:</strong> Mode gelap lebih nyaman di malam hari dan menghemat baterai
                </p>
            </div>
        `;
    }

    setupListeners() {
        // Listener untuk Theme Buttons
        document.querySelector('.light-theme-btn')?.addEventListener('click', () => this.app.changeTheme('light'));
        document.querySelector('.dark-theme-btn')?.addEventListener('click', () => this.app.changeTheme('dark'));

        // Listener untuk Restore Data
        document.getElementById('restoreFile')?.addEventListener('change', (e) => this.restoreCompleteBackup(e));

        // Listener untuk Tambah Kategori
        document.getElementById('addCategoryBtn')?.addEventListener('click', () => this.showAddCategoryModal());
    }

    validateBackupData(data) {
        const required = ['wallets', 'categories', 'transactions'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Data backup tidak lengkap: ${missing.join(', ')}`);
        }
        
        if (!Array.isArray(data.wallets) || !Array.isArray(data.transactions)) {
            throw new Error('Struktur data backup tidak valid');
        }
        
        return true;
    }

    restoreCompleteBackup(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('⚠️ RESTORE akan MENGGANTI SEMUA DATA! Yakin?')) {
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = e.target.result;
                const data = JSON.parse(jsonData);
                
                this.validateBackupData(data);
                
                if (DB.restoreData(jsonData)) {
                    // Cek apakah 'backupModal' terbuka dan tutup
                    if (document.getElementById('backupModal')) Utils.closeModal('backupModal');
                    
                    this.showRestoreSuccessMessage(data);
                }
                
            } catch (error) {
                console.error('Restore validation failed:', error);
                Utils.showToast(`Backup tidak valid: ${error.message}`, 'error');
            }
            
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }

    showRestoreSuccessMessage(data) {
        this.app.render(); // Re-render all tabs
        this.app.updateTotalBalance();
        this.updateAppInfo();
        
        const counts = data.dataCount || {};
        // Gunakan Utils.showToast karena pesan ini terlalu panjang untuk toast
        const message = `
            ✅ Data berhasil dipulihkan!
            - ${counts.wallets || 0} Dompet
            - ${counts.transactions || 0} Transaksi  
            - ${counts.budgets || 0} Budget
            - ${counts.goldWallets || 0} Dompet Emas
            - ${counts.liabilities || 0} Liabilitas
        `;
        
        Utils.showToast('Pemulihan data berhasil! Silakan cek konsol untuk detail.', 'success');
        
        console.log('🎉 Restore completed:', counts);
    }

    renderCategoriesManagement() {
        const categories = DB.getCategories();
        const container = document.getElementById('categoriesManagement');
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 20px;">
                    <div class="emoji">🏷️</div>
                    <p>Belum ada kategori. Tambahkan satu!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <ul style="list-style: none; padding: 0;">
                ${categories.map(cat => `
                    <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
                        <span>${cat.emoji} ${cat.name} (${cat.type})</span>
                        <div>
                            <button class="btn btn-sm btn-info" onclick="window.app.settingsModule.showEditCategoryModal('${cat.id}')" style="margin-right: 5px;">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="window.app.settingsModule.confirmDeleteCategory('${cat.id}')">Hapus</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    updateAppInfo() {
        document.getElementById('totalTransactionsCount').textContent = DB.getTransactions().length;
        document.getElementById('totalWalletsCount').textContent = DB.getWallets().length;
        document.getElementById('currentThemeDisplay').textContent = Utils.getTheme() === 'dark' ? '🌙 Gelap' : '☀️ Terang';
    }

    showAddCategoryModal() {
        const content = `
            <form id="addCategoryForm">
                <div class="form-group">
                    <label class="form-label">Nama Kategori</label>
                    <input type="text" class="form-control" id="categoryName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Tipe</label>
                    <select class="form-control" id="categoryType" required>
                        <option value="expense">Pengeluaran</option>
                        <option value="income">Pemasukan</option>
                        <option value="transfer">Transfer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Emoji</label>
                    <input type="text" class="form-control" id="categoryEmoji" value="🏷️" maxlength="2">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Kategori</button>
            </form>
        `;

        Utils.createModal('addCategoryModal', 'Tambah Kategori', content);
        Utils.openModal('addCategoryModal');

        document.getElementById('addCategoryForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('categoryName').value;
            const type = document.getElementById('categoryType').value;
            const emoji = document.getElementById('categoryEmoji').value;

            const categories = DB.getCategories();
            categories.push({
                id: DB.generateId(),
                name,
                type,
                emoji
            });
            
            if (DB.saveCategories(categories)) {
                Utils.closeModal('addCategoryModal');
                this.renderCategoriesManagement();
                this.updateAppInfo();
                Utils.showToast('Kategori berhasil ditambahkan!', 'success');
            }
        };
    }

    showEditCategoryModal(categoryId) {
        const category = DB.getCategories().find(c => c.id === categoryId);
        if (!category) return;

        const content = `
            <form id="editCategoryForm">
                <div class="form-group">
                    <label class="form-label">Nama Kategori</label>
                    <input type="text" class="form-control" id="editCategoryName" value="${category.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Tipe</label>
                    <select class="form-control" id="editCategoryType" required>
                        <option value="expense" ${category.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
                        <option value="income" ${category.type === 'income' ? 'selected' : ''}>Pemasukan</option>
                        <option value="transfer" ${category.type === 'transfer' ? 'selected' : ''}>Transfer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Emoji</label>
                    <input type="text" class="form-control" id="editCategoryEmoji" value="${category.emoji}" maxlength="2">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: var(--spacing-sm);">Simpan Perubahan</button>
                <button type="button" class="btn btn-danger" style="width: 100%;" onclick="window.app.settingsModule.confirmDeleteCategory('${category.id}')">Hapus Kategori</button>
            </form>
        `;

        Utils.createModal('editCategoryModal', 'Edit Kategori', content);
        Utils.openModal('editCategoryModal');

        document.getElementById('editCategoryForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('editCategoryName').value;
            const type = document.getElementById('editCategoryType').value;
            const emoji = document.getElementById('editCategoryEmoji').value;

            const categories = DB.getCategories().map(c => 
                c.id === categoryId ? { ...c, name, type, emoji } : c
            );
            
            if (DB.saveCategories(categories)) {
                Utils.closeModal('editCategoryModal');
                this.renderCategoriesManagement();
                Utils.showToast('Kategori berhasil diperbarui!', 'success');
            }
        };
    }

    confirmDeleteCategory(categoryId) {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            this.deleteCategory(categoryId);
        }
    }

    deleteCategory(categoryId) {
        if (confirm('HAPUS kategori ini? Transaksi yang menggunakan kategori ini akan tetap ada, tetapi tanpa kategori.')) {
            const categories = DB.getCategories().filter(c => c.id !== categoryId);
            
            if (DB.saveCategories(categories)) {
                Utils.closeModal('editCategoryModal');
                this.renderCategoriesManagement();
                this.updateAppInfo();
                
                // Panggil render di modul lain yang mungkin terpengaruh
                this.app.dashboardModule.renderRecentTransactions();
                // Asumsi BudgetModule punya renderBudgets
                if (this.app.budgetModule && typeof this.app.budgetModule.renderBudgets === 'function') {
                    this.app.budgetModule.renderBudgets();
                }
                
                Utils.showToast('Kategori berhasil dihapus!', 'success');
            }
        }
    }

}
