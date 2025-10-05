const Utils = {
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

    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    createModal: (id, title, content) => {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="Utils.closeModal('${id}')">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
            </div>
        `;
        
        modalContainer.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) Utils.closeModal(id);
        });
    },

    openModal: (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('hidden');
    },

    closeModal: (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('hidden');
    },

    showToast: (message, type = 'info') => {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
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

    // Tambahkan di Utils object

// Theme management
getTheme: () => {
    return localStorage.getItem('theme') || 'light';
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

// Initialize theme
initTheme: () => {
    const savedTheme = Utils.getTheme();
    Utils.setTheme(savedTheme);
    
    // Add theme toggle button to DOM
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.innerHTML = '<span class="icon">🌓</span>';
    toggleBtn.title = 'Toggle Dark/Light Mode';
    toggleBtn.onclick = () => {
        const newTheme = Utils.toggleTheme();
        Utils.showToast(`Mode ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'info');
    };
    
    document.body.appendChild(toggleBtn);
},

// Di utils.js, tambahkan auto-detection:
initTheme: () => {
    let savedTheme = Utils.getTheme();
    
    // Jika belum ada preference yang disimpan, coba detect system preference
    if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        savedTheme = prefersDark ? 'dark' : 'light';
    }
    
    Utils.setTheme(savedTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) { // Only auto-change if user hasn't set preference
            const newTheme = e.matches ? 'dark' : 'light';
            Utils.setTheme(newTheme);
        }
    });
    
    // Add theme toggle button to DOM
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.innerHTML = '<span class="icon">🌓</span>';
    toggleBtn.title = 'Toggle Dark/Light Mode';
    toggleBtn.onclick = () => {
        const newTheme = Utils.toggleTheme();
        Utils.showToast(`Mode ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'info');
    };
    
    document.body.appendChild(toggleBtn);
}
};
