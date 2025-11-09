// js/modules/settings.js (Versi Final dengan async/await - DIKOREKSI)
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class SettingsModule {
    constructor(app) {
        this.app = app;
    }

    async render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header"><h3 class="card-title">⚙️ Pengaturan Aplikasi</h3></div>
                <div class="tab-grid tab-grid-2">
                    <div>
                        <h4 style="margin-top: 20px;">💾 Data Management</h4>
                        <div class="data-management">
                            <button class="btn btn-info" id="backupSettingsBtn"><span>💾</span> Backup</button>
                        </div>
                        <div class="data-management">
                             <label class="file-input-label btn btn-primary">
                                <span>📁</span> Restore 
                                <input type="file" id="restoreFile" class="file-input" accept=".json" onchange="window.app.settingsModule.handleRestore(event)">
                            </label>
                        </div>
                        <button class="btn btn-danger" style="width: 100%; margin-top: 10px;" onclick="window.app.confirmClearAllData()"><span>🗑️</span> Hapus Semua Data</button>
                    </div>
                    <div>
                        <h4>🏷️ Kelola Kategori</h4>
                        <div id="categoriesManagement"></div>
                        <button class="btn btn-primary" id="addCategoryBtn" style="width: 100%; margin-top: 10px;">+ Tambah Kategori</button>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">ℹ️ Informasi Aplikasi</h3></div>
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🤖</div>
                    <h3>Finance Super App</h3>
                    <p style="color: #666; margin-bottom: 15px;">Aplikasi manajemen keuangan offline</p>
                    <div style="background: var(--light-color); padding: 15px; border-radius: 10px;">
                        <p><strong>Total Transaksi:</strong> <span id="totalTransactionsCount">0</span></p>
                        <p><strong>Total Wallet:</strong> <span id="totalWalletsCount">0</span></p>
                        <p><strong>Versi:</strong> 3.0 (IndexedDB)</p>
                    <div style="font-size: 48px; margin-bottom: 10px;">Sampai Jumpa dan Terimakasih</div>
                    <p style="color: #666; margin-bottom: 15px;">Kunjungi Aplikasi Innovation Beta untuk akses online https://my-finance-tracker-56f33.web.app/</p>
                    <div style="background: var(--light-color); padding: 15px; border-radius: 10px;">
                    </div>
                </div>
            </div>
        `;
        
        await this.renderCategoriesManagement();
        await this.updateAppInfo();
        this.setupListeners();
    }

    setupListeners() {
        document.querySelector('.light-theme-btn')?.addEventListener('click', () => this.app.changeTheme('light'));
        document.querySelector('.dark-theme-btn')?.addEventListener('click', () => this.app.changeTheme('dark'));
        document.getElementById('addCategoryBtn')?.addEventListener('click', () => this.showAddCategoryModal());
        
        // Event listener untuk backup button
        document.getElementById('backupSettingsBtn')?.addEventListener('click', async () => {
            try {
                await DB.backupData();
                Utils.showToast('Backup berhasil didownload!', 'success');
            } catch (error) {
                console.error('Backup error:', error);
                Utils.showToast('Gagal membuat backup', 'error');
            }
        });
    }

    async handleRestore(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('⚠️ RESTORE akan MENGGANTI SEMUA DATA yang ada saat ini! Yakin ingin melanjutkan?')) {
            event.target.value = ''; // Reset input file
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const jsonData = e.target.result;
                const success = await DB.restoreData(jsonData);
                if (success) {
                    Utils.showToast('Data berhasil dipulihkan! Aplikasi akan dimuat ulang.', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                }
            } catch (error) {
                console.error('Restore failed:', error);
                Utils.showToast(`Gagal memulihkan: ${error.message}`, 'error');
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    }

    async renderCategoriesManagement() {
        const container = document.getElementById('categoriesManagement');
        if (!container) return;
        const categories = await DB.getCategories();
        
        if (categories.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding: 20px;"><div class="emoji">🏷️</div><p>Belum ada kategori.</p></div>`;
            return;
        }

        container.innerHTML = `<ul style="list-style: none; padding: 0;">${categories.map(cat => `
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span>${cat.emoji} ${cat.name} (${cat.type})</span>
                <div>
                    <button class="btn btn-sm btn-info edit-category-btn" data-id="${cat.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-category-btn" data-id="${cat.id}">Hapus</button>
                </div>
            </li>`).join('')}</ul>`;
        
        container.querySelectorAll('.edit-category-btn').forEach(btn => btn.addEventListener('click', (e) => this.showEditCategoryModal(e.target.dataset.id)));
        container.querySelectorAll('.delete-category-btn').forEach(btn => btn.addEventListener('click', (e) => this.confirmDeleteCategory(e.target.dataset.id)));
    }

    async updateAppInfo() {
        const [transactions, wallets] = await Promise.all([DB.getTransactions(), DB.getWallets()]);
        document.getElementById('totalTransactionsCount').textContent = transactions.length;
        document.getElementById('totalWalletsCount').textContent = wallets.length;
    }

    showAddCategoryModal() {
        const content = `
            <form id="addCategoryForm">
                <div class="form-group">
                    <label>Nama Kategori</label>
                    <input type="text" class="form-control" id="categoryName" required placeholder="Contoh: Makanan, Transportasi">
                </div>
                <div class="form-group">
                    <label>Tipe</label>
                    <select class="form-control" id="categoryType" required>
                        <option value="expense">Pengeluaran</option>
                        <option value="income">Pemasukan</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="form-control" id="categoryEmoji" value="🏷️" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Tambah Kategori</button>
            </form>
        `;
        Utils.createModal('addCategoryModal', 'Tambah Kategori', content);
        Utils.openModal('addCategoryModal');

        document.getElementById('addCategoryForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('categoryName').value;
            const type = document.getElementById('categoryType').value;
            const emoji = document.getElementById('categoryEmoji').value;

            // Validasi input
            if (!name.trim()) {
                return Utils.showToast('Nama kategori tidak boleh kosong!', 'error');
            }

            const categories = await DB.getCategories();
            
            // Cek duplikasi kategori
            const existingCategory = categories.find(c => c.name === name && c.type === type);
            if (existingCategory) {
                return Utils.showToast('Kategori dengan nama dan tipe yang sama sudah ada!', 'error');
            }

            categories.push({ id: DB.generateId(), name, type, emoji });
            
            await DB.saveCategories(categories);
            Utils.closeModal('addCategoryModal');
            await this.renderCategoriesManagement();
            Utils.showToast('Kategori berhasil ditambahkan!', 'success');
        };
    }

    async showEditCategoryModal(categoryId) {
        const categories = await DB.getCategories();
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;
        
        const content = `
            <form id="editCategoryForm">
                <div class="form-group">
                    <label>Nama Kategori</label>
                    <input type="text" class="form-control" id="editCategoryName" value="${category.name}" required>
                </div>
                <div class="form-group">
                    <label>Tipe</label>
                    <select class="form-control" id="editCategoryType" required>
                        <option value="expense" ${category.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
                        <option value="income" ${category.type === 'income' ? 'selected' : ''}>Pemasukan</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="form-control" id="editCategoryEmoji" value="${category.emoji}" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Update Kategori</button>
            </form>
        `;
        Utils.createModal('editCategoryModal', 'Edit Kategori', content);
        Utils.openModal('editCategoryModal');

        document.getElementById('editCategoryForm').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('editCategoryName').value;
            const type = document.getElementById('editCategoryType').value;
            const emoji = document.getElementById('editCategoryEmoji').value;

            // Validasi input
            if (!name.trim()) {
                return Utils.showToast('Nama kategori tidak boleh kosong!', 'error');
            }

            // Cek duplikasi (kecuali kategori yang sedang diedit)
            const existingCategory = categories.find(c => c.name === name && c.type === type && c.id !== categoryId);
            if (existingCategory) {
                return Utils.showToast('Kategori dengan nama dan tipe yang sama sudah ada!', 'error');
            }

            const updatedCategories = categories.map(c => c.id === categoryId ? { ...c, name, type, emoji } : c);
            
            await DB.saveCategories(updatedCategories);
            Utils.closeModal('editCategoryModal');
            await this.renderCategoriesManagement();
            Utils.showToast('Kategori berhasil diperbarui!', 'success');
        };
    }

    async confirmDeleteCategory(categoryId) {
        const categories = await DB.getCategories();
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        // Cek apakah kategori digunakan dalam transaksi
        const transactions = await DB.getTransactions();
        const isCategoryUsed = transactions.some(t => t.categoryId === categoryId);

        let warningMessage = 'Yakin ingin menghapus kategori ini?';
        if (isCategoryUsed) {
            warningMessage += '\n\n⚠️ PERINGATAN: Kategori ini digunakan dalam beberapa transaksi. Transaksi tersebut akan kehilangan kategorinya.';
        }

        if (confirm(warningMessage)) {
            let categories = await DB.getCategories();
            categories = categories.filter(c => c.id !== categoryId);
            await DB.saveCategories(categories);
            await this.renderCategoriesManagement();
            Utils.showToast('Kategori berhasil dihapus!', 'success');
        }
    }
}

