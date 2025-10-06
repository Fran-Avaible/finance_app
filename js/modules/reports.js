// MultipleFiles/js/modules/reports.js
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class ReportsModule {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Laporan Bulanan</h3>
                    <div>
                        <select id="reportMonth" class="form-control" style="width: auto; display: inline-block;">
                            ${this.generateMonthOptions()}
                        </select>
                        <select id="reportYear" class="form-control" style="width: auto; display: inline-block;">
                            ${this.generateYearOptions()}
                        </select>
                        <button class="btn btn-primary" id="generateReportBtn">
                            Generate
                        </button>
                    </div>
                </div>
                <div id="reportContent">
                    <div class="empty-state">
                        <div class="emoji">📈</div>
                        <p>Pilih bulan dan tahun untuk generate laporan</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📈 Charts & Analytics</h3>
                </div>
                <div id="chartsContainer">
                    </div>
            </div>
        `;
        
        // PASANG EVENT LISTENER
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());

        // Lakukan inisialisasi report pertama kali
        this.generateReport();
    }

    generateMonthOptions() {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const currentMonth = new Date().getMonth();
        return months.map((month, index) => `
            <option value="${index + 1}" ${index === currentMonth ? 'selected' : ''}>${month}</option>
        `).join('');
    }

    generateYearOptions() {
        const currentYear = new Date().getFullYear();
        let options = '';
        // Ubah loop for i <= currentYear + 1 menjadi i <= currentYear untuk menghindari tahun depan
        for (let i = currentYear - 5; i <= currentYear; i++) { 
            options += `<option value="${i}" ${i === currentYear ? 'selected' : ''}>${i}</option>`;
        }
        return options;
    }

    generateReport() {
        const reportMonth = document.getElementById('reportMonth')?.value;
        const reportYear = document.getElementById('reportYear')?.value;
        const reportContentDiv = document.getElementById('reportContent');
        const chartsContainerDiv = document.getElementById('chartsContainer');

        if (!reportMonth || !reportYear || !reportContentDiv) return;

        const transactions = DB.getTransactions();
        const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            // Perlu melakukan parseInt karena value dari select adalah string
            return transactionDate.getMonth() + 1 === parseInt(reportMonth) &&
                   transactionDate.getFullYear() === parseInt(reportYear);
        });

        if (filteredTransactions.length === 0) {
            reportContentDiv.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">📝</div>
                    <p>Tidak ada transaksi untuk bulan ini.</p>
                </div>
            `;
            if (chartsContainerDiv) chartsContainerDiv.innerHTML = '';
            return;
        }

        let totalIncome = 0;
        let totalExpense = 0;
        const categorySummary = {};

        filteredTransactions.forEach(t => {
            const category = DB.getCategoryById(t.categoryId);
            const categoryName = category ? category.name : 'Uncategorized';

            if (!categorySummary[categoryName]) {
                categorySummary[categoryName] = { income: 0, expense: 0 };
            }

            if (t.type === 'income') {
                totalIncome += t.amount;
                categorySummary[categoryName].income += t.amount;
            } else if (t.type === 'expense') {
                totalExpense += t.amount;
                categorySummary[categoryName].expense += t.amount;
            }
        });

        const netBalance = totalIncome - totalExpense;
        const monthName = new Date(reportYear, reportMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

        let reportHtml = `
            <div style="text-align: center; margin-bottom: var(--spacing-lg);">
                <p style="font-size: 18px; font-weight: 600;">Ringkasan untuk ${monthName}</p>
            </div>
            <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: var(--spacing-lg);">
                <div>
                    <p style="font-size: 14px; color: #666;">Total Pemasukan</p>
                    <p style="font-weight: bold; color: var(--success-color);">${Utils.formatCurrency(totalIncome)}</p>
                </div>
                <div>
                    <p style="font-size: 14px; color: #666;">Total Pengeluaran</p>
                    <p style="font-weight: bold; color: var(--danger-color);">${Utils.formatCurrency(totalExpense)}</p>
                </div>
                <div>
                    <p style="font-size: 14px; color: #666;">Saldo Bersih</p>
                    <p style="font-weight: bold; color: ${netBalance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${Utils.formatCurrency(netBalance)}</p>
                </div>
            </div>

            <h4>Ringkasan Kategori</h4>
            <ul style="list-style: none; padding: 0;">
                ${Object.entries(categorySummary).map(([catName, totals]) => `
                    <li style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #eee;">
                        <span>${catName}</span>
                        <span>
                            ${totals.income > 0 ? `<span style="color: var(--success-color); margin-right: 10px;">+${Utils.formatCurrency(totals.income)}</span>` : ''}
                            ${totals.expense > 0 ? `<span style="color: var(--danger-color);">- ${Utils.formatCurrency(totals.expense)}</span>` : ''}
                        </span>
                    </li>
                `).join('')}
            </ul>
        `;
        reportContentDiv.innerHTML = reportHtml;

        if (chartsContainerDiv) {
            chartsContainerDiv.innerHTML = `
                <canvas id="expenseChart" width="400" height="200"></canvas>
                <canvas id="incomeExpenseChart" width="400" height="200"></canvas>
            `;
            
            const expenseData = {};
            filteredTransactions.forEach(t => {
                if (t.type === 'expense') {
                    const category = DB.getCategoryById(t.categoryId);
                    const categoryName = category ? category.name : 'Lainnya';
                    expenseData[categoryName] = (expenseData[categoryName] || 0) + t.amount;
                }
            });

            const expenseCtx = document.getElementById('expenseChart');
            if (expenseCtx && Object.keys(expenseData).length > 0) {
                // Hapus chart lama jika ada
                if (expenseCtx.chart) expenseCtx.chart.destroy();

                expenseCtx.chart = new Chart(expenseCtx, {
                    type: 'pie',
                    data: {
                        labels: Object.keys(expenseData),
                        datasets: [{
                            data: Object.values(expenseData),
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900'],
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Pengeluaran Berdasarkan Kategori'
                            }
                        }
                    }
                });
            }

            // ... (Logika Chart Pemasukan vs Pengeluaran)

            const monthlyData = {};
            filteredTransactions.forEach(t => {
                // Menggunakan format YYYY-MM untuk identifikasi bulan
                const month = t.date.substring(0, 7); 
                if (!monthlyData[month]) {
                    monthlyData[month] = { income: 0, expense: 0 };
                }
                if (t.type === 'income') {
                    monthlyData[month].income += t.amount;
                } else if (t.type === 'expense') {
                    monthlyData[month].expense += t.amount;
                }
            });

            const sortedMonths = Object.keys(monthlyData).sort();
            const incomeChartData = sortedMonths.map(month => monthlyData[month].income);
            const expenseChartData = sortedMonths.map(month => monthlyData[month].expense);
            const incomeExpenseChartLabels = sortedMonths.map(month => {
                const [year, monthNum] = month.split('-');
                return new Date(year, monthNum - 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            });

            const incomeExpenseCtx = document.getElementById('incomeExpenseChart');
            if (incomeExpenseCtx) {
                // Hapus chart lama jika ada
                if (incomeExpenseCtx.chart) incomeExpenseCtx.chart.destroy();

                incomeExpenseCtx.chart = new Chart(incomeExpenseCtx, {
                    type: 'bar',
                    data: {
                        labels: incomeExpenseChartLabels,
                        datasets: [
                            {
                                label: 'Pemasukan',
                                data: incomeChartData,
                                backgroundColor: 'rgba(46, 204, 113, 0.6)',
                                borderColor: 'rgba(46, 204, 113, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Pengeluaran',
                                data: expenseChartData,
                                backgroundColor: 'rgba(231, 76, 60, 0.6)',
                                borderColor: 'rgba(231, 76, 60, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Pemasukan vs Pengeluaran'
                            }
                        },
                        scales: {
                            x: {
                                stacked: false,
                            },
                            y: {
                                stacked: false,
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    }
}