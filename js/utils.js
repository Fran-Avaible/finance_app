// MultipleFiles/js/utils.js

export const Utils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatDateShort: (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    },

    // generateId dipindahkan ke DB.js karena DB adalah sumber data utama
    
    createModal: (id, title, content) => {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;
        
        // Hapus modal lama jika ada
        const existingModal = document.getElementById(id);
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal hidden';
        modal.id = id;
        
        // Ganti 'onclick="app.' menjadi 'onclick="window.app.' di dalam konten modal
        const contentWithGlobalApp = content.replace(/onclick="app\./g, 'onclick="window.app.');
        // Ganti 'onclick="Utils.' menjadi 'onclick="window.app.utils.'
        const finalContent = contentWithGlobalApp.replace(/onclick="Utils\./g, 'onclick="window.app.utils.');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="window.app.utils.closeModal('${id}')">&times;</button>
                </div>
                <div class="modal-body">${finalContent}</div>
            </div>
        `;
        
        modalContainer.appendChild(modal);
        // Event listener untuk menutup saat klik di luar modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) Utils.closeModal(id);
        });
    },

    openModal: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
            console.log(`Modal ${id} opened`);
        }
    },

    closeModal: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
            console.log(`Modal ${id} closed`);
        }
    },

    showToast: (message, type = 'info') => {
        // Hapus toast lama
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    getTheme: () => {
        return localStorage.getItem('theme') || '';
    },

    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    },

    toggleTheme: () => {
        const currentTheme = Utils.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        Utils.setTheme(newTheme);
        return newTheme;
    },

    initTheme: () => {
        let savedTheme = Utils.getTheme();
        
        if (!savedTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            savedTheme = prefersDark ? 'dark' : 'light';
        }
        
        Utils.setTheme(savedTheme);
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                Utils.setTheme(newTheme);
            }
        });
        
        // PASANG EVENT LISTENER UNTUK TOMBOL THEME TOGGLE DARI SINI
        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const newTheme = Utils.toggleTheme();
                Utils.showToast(`Mode ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'info');
                
                // Panggil render ulang settings jika sedang dibuka
                if (window.app && window.app.currentTab === 'settings') {
                    window.app.renderTabContent('settings');
                }
            };
        }
    }
};

console.log('✅ Utils loaded as module');