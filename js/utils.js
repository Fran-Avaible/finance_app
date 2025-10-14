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
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="window.app.utils.closeModal('${id}')">&times;</button>
            </div>
            <div class="modal-body">${content}</div>
        </div>
    `;
    
    modalContainer.appendChild(modal);
    
    // Eksekusi script yang ada dalam modal
    const scripts = modal.querySelectorAll('script');
    scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
            newScript.src = script.src;
        } else {
            newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript).remove();
    });
    
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
};

console.log('✅ Utils loaded as module');
