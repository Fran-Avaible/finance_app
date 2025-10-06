// MultipleFiles/js/modules/calendar.js
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class CalendarModule {
    constructor(app) {
        this.app = app;
        this.calendarDate = new Date(); // State lokal untuk kalender
    }

    render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🗓️ Kalender Transaksi</h3>
                    <div>
                        <button class="btn btn-outline btn-sm" id="prevMonthBtn">← Prev</button>
                        <span id="currentMonthYear" style="margin: 0 15px;"></span>
                        <button class="btn btn-outline btn-sm" id="nextMonthBtn">Next →</button>
                    </div>
                </div>
                <div id="calendarContainer"></div>
            </div>
        `;
        
        this.renderCalendarView();
        
        // PASANG EVENT LISTENERS UNTUK NAVIGASI BULAN
        document.getElementById('prevMonthBtn').addEventListener('click', () => {
            this.prevMonth();
        });
        document.getElementById('nextMonthBtn').addEventListener('click', () => {
            this.nextMonth();
        });
    }

    prevMonth() {
        this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
        this.renderCalendarView();
    }

    nextMonth() {
        this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
        this.renderCalendarView();
    }

    renderCalendarView() {
        const calendarContainer = document.getElementById('calendarContainer');
        const currentMonthYearSpan = document.getElementById('currentMonthYear');
        
        if (!calendarContainer || !currentMonthYearSpan) return;

        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();

        currentMonthYearSpan.textContent = this.calendarDate.toLocaleDateString('id-ID', { 
            month: 'long', 
            year: 'numeric' 
        });

        const firstDayOfMonth = new Date(year, month, 1);
        const firstDay = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let calendarHTML = `
            <div class="calendar-grid">
                <div class="calendar-day-header">Min</div>
                <div class="calendar-day-header">Sen</div>
                <div class="calendar-day-header">Sel</div>
                <div class="calendar-day-header">Rab</div>
                <div class="calendar-day-header">Kam</div>
                <div class="calendar-day-header">Jum</div>
                <div class="calendar-day-header">Sab</div>
        `;

        // Tambahkan hari kosong awal. Kalender dimulai hari Minggu (0).
        // Kita perlu hari kosong jika hari pertama bukan hari Minggu.
        const startDayIndex = (firstDay === 0) ? 0 : firstDay; 
        
        for (let i = 0; i < startDayIndex; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }

        const transactionsByDate = {};
        DB.getTransactions().forEach(transaction => {
            if (!transactionsByDate[transaction.date]) {
                transactionsByDate[transaction.date] = [];
            }
            transactionsByDate[transaction.date].push(transaction);
        });

        for (let day = 1; day <= daysInMonth; day++) {
            const yyyy = year;
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const dateString = `${yyyy}-${mm}-${dd}`;
            
            const today = new Date().toISOString().split('T')[0];
            const isToday = dateString === today;
            const dayTransactions = transactionsByDate[dateString] || [];

            const dayClass = isToday ? 'today' : '';
            let transactionDots = '';

            dayTransactions.slice(0, 4).forEach(transaction => {
                const typeClass = transaction.type === 'income' ? 'income' : 
                                transaction.type === 'expense' ? 'expense' : 'transfer';
                transactionDots += `<span class="transaction-dot ${typeClass}"></span>`;
            });
            
            if (dayTransactions.length > 4) {
                transactionDots += `<span class="transaction-dot more">...</span>`;
            }

            calendarHTML += `
                <div class="calendar-day ${dayClass}" 
                     data-date="${dateString}" 
                     data-action="show-day-transactions"
                     title="Klik untuk lihat transaksi ${dd}/${mm}/${yyyy}">
                    <div class="day-number">${day}</div>
                    <div class="day-transactions">${transactionDots}</div>
                </div>
            `;
        }

        // Tambahkan hari kosong akhir
        const totalCells = 42;
        const filledCells = startDayIndex + daysInMonth;
        for (let i = filledCells; i < totalCells; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }

        calendarHTML += `</div>`;
        calendarContainer.innerHTML = calendarHTML;
        
        // PASANG EVENT LISTENERS UNTUK KLIK HARI
        calendarContainer.querySelectorAll('[data-action="show-day-transactions"]').forEach(dayElement => {
            dayElement.addEventListener('click', () => {
                const dateString = dayElement.getAttribute('data-date');
                this.showDayTransactions(dateString);
            });
        });
    }

    showDayTransactions(dateString) {
        if (!dateString || dateString === 'undefined' || !dateString.includes('-')) {
            Utils.showToast('Tanggal tidak valid', 'error');
            return;
        }

        const transactions = DB.getTransactions().filter(t => {
            return t.date === dateString;
        });
        
        if (transactions.length === 0) {
            const formattedDate = Utils.formatDate(dateString);
            Utils.showToast(`Tidak ada transaksi pada ${formattedDate}`, 'info');
            return;
        }

        const transactionsHTML = transactions.map(transaction => {
            const wallet = DB.getWallets().find(w => w.id === transaction.walletId);
            const category = DB.getCategories().find(c => c.id === transaction.categoryId);
            const typeClass = transaction.type;
            const amountPrefix = transaction.type === 'income' ? '+' : 
                               transaction.type === 'expense' ? '-' : '';

            // Menggunakan window.app.showEditTransactionModal agar event inline tetap berfungsi
            return `
                <div class="transaction-item ${typeClass}" onclick="window.app.showEditTransactionModal('${transaction.id}')">
                    <div class="transaction-info">
                        <div class="transaction-category">${category?.emoji || ''} ${category?.name || 'Unknown'}</div>
                        <div class="transaction-wallet">${wallet?.name || 'Unknown'} • ${Utils.formatDateShort(transaction.date)}</div>
                        ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                    </div>
                    <div class="transaction-amount ${typeClass}">
                        ${amountPrefix}${Utils.formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
        }).join('');

        const formattedDate = Utils.formatDate(dateString);
        const modalId = 'dayTransactionsModal';
        
        const content = `
            <div style="max-height: 400px; overflow-y: auto;">
                <h4 style="margin-bottom: 15px; text-align: center;">Transaksi pada ${formattedDate}</h4>
                ${transactionsHTML}
                <div style="text-align: center; margin-top: 15px;">
                    <button class="btn btn-secondary" id="closeDayTransactionsModalBtn" style="width: 100%;">Tutup</button>
                </div>
            </div>
        `;

        Utils.createModal(modalId, `Transaksi ${formattedDate}`, content);
        Utils.openModal(modalId);
        
        // PASANG EVENT LISTENER UNTUK TOMBOL TUTUP MODAL
        document.getElementById('closeDayTransactionsModalBtn').addEventListener('click', () => {
            Utils.closeModal(modalId);
        });
    }
}