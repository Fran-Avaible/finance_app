// js/modules/personalization.js (Versi Enhanced dengan 10 Tema Bawaan)
import { DB } from '../database.js';
import { Utils } from '../utils.js';

export class PersonalizationModule {
    constructor(app) {
        this.app = app;
        this.customSettings = this.loadCustomSettings();
        this.isApplying = false;
        
        // Auto-apply tema saat modul di-load
        this.applyToApp();
    }

async render(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🎨 Personalisasi Tampilan</h3>
                <p>Kustomisasi aplikasi sesuai preferensi Anda</p>
            </div>
            
            <!-- Quick Actions -->
            <div class="quick-actions" style="margin-bottom: 20px;">
                <button class="btn btn-primary" data-preset="mineral">💎 Mineral Green</button>
                <button class="btn btn-primary" data-preset="ocean">🌊 Ocean Blue</button>
                <button class="btn btn-success" data-preset="nature">🌿 Nature Fresh</button>
                <button class="btn btn-warning" data-preset="sunset">🌅 Sunset</button>
                <button class="btn btn-info" data-preset="cyber">🚀 Cyber Punk</button>
                <button class="btn btn-danger" data-preset="crimson">❤️ Crimson Red</button>
                <button class="btn btn-outline" data-preset="glass">🔮 Glass Morphism</button>
                <button class="btn btn-outline" data-preset="dark">🌙 Dark Pro</button>
                <button class="btn btn-outline" data-preset="purple">👑 Purple Royal</button>
                <button class="btn btn-outline" data-preset="gold">⭐ Golden Luxury</button>
            </div>
            
            <!-- FLOATING PREVIEW TOGGLE -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h4>👁️ Pratinjau Real-time</h4>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <label class="checkbox-label">
                            <input type="checkbox" id="floatingPreviewToggle" ${localStorage.getItem('floatingPreview') === 'true' ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Mode Mengambang (Masih dalam Pengembangan)
                        </label>
                        <button class="btn btn-sm btn-outline" id="refreshPreview">🔄 Refresh</button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="livePreview" class="${localStorage.getItem('floatingPreview') === 'true' ? 'floating-preview' : ''}">
                        <div class="color-info">
                            <div class="color-swatch primary" title="Primary Color"></div>
                            <div class="color-swatch secondary" title="Secondary Color"></div>
                            <div class="color-swatch accent" title="Accent Color"></div>
                            <div class="color-swatch background" title="Background Color"></div>
                            <div class="color-info-text">
                                <strong>Brand Colors:</strong> <span id="currentThemeName">Mineral Green • Twine • Cape Palliser • Ecru White</span>
                            </div>
                        </div>
                        <div class="preview-dashboard">
                            <div class="preview-header">
                                <h5>Dashboard Preview</h5>
                                <span class="preview-badge">Live</span>
                            </div>
                            <div class="preview-stats">
                                <div class="preview-stat-card">
                                    <div class="preview-stat-value">Rp 5.250.000</div>
                                    <div class="preview-stat-label">Total Balance</div>
                                </div>
                                <div class="preview-stat-card">
                                    <div class="preview-stat-value">Rp 2.100.000</div>
                                    <div class="preview-stat-label">Monthly Income</div>
                                </div>
                            </div>
                            <div class="preview-transaction">
                                <div class="preview-transaction-info">
                                    <span class="preview-emoji">🍔</span>
                                    <div>
                                        <div class="preview-transaction-title">Makan Siang</div>
                                        <div class="preview-transaction-subtitle">Food & Drink • Today</div>
                                    </div>
                                </div>
                                <div class="preview-transaction-amount expense">-Rp 75.000</div>
                            </div>
                            <div class="preview-progress">
                                <div class="preview-progress-header">
                                    <span>Budget Progress</span>
                                    <span>65%</span>
                                </div>
                                <div class="preview-progress-bar">
                                    <div class="preview-progress-fill" style="width: 65%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-grid tab-grid-2">
                <div>
                    <!-- THEME CUSTOMIZATION -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h4>🎯 Skema Warna</h4>
                        </div>
                        <div class="card-body">
                            <div id="themeCustomization"></div>
                        </div>
                    </div>
                    
                    <!-- WIDGETS MANAGEMENT -->
                    <div class="card">
                        <div class="card-header">
                            <h4>📊 Tata Letak Dashboard</h4>
                        </div>
                        <div class="card-body">
                            <div id="widgetsManagement"></div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <!-- TYPOGRAPHY -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h4>🔤 Tipografi</h4>
                        </div>
                        <div class="card-body">
                            <div id="fontCustomization"></div>
                        </div>
                    </div>
                    
                    <!-- EFFECTS & ANIMATIONS -->
                    <div class="card">
                        <div class="card-header">
                            <h4>🎪 Efek & Animasi</h4>
                        </div>
                        <div class="card-body">
                            <div id="effectsCustomization"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ACTION BUTTONS -->
            <div class="action-buttons" style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                <button class="btn btn-primary" id="applyPersonalization">
                    💾 Terapkan Perubahan
                </button>
                <button class="btn btn-success" id="saveAsTheme">
                    📁 Simpan sebagai Tema
                </button>
                <button class="btn btn-outline" id="resetPersonalization">
                    🔄 Reset Default
                </button>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-info" id="exportTheme">📤 Export</button>
                    <label class="btn btn-info">
                        📁 Import
                        <input type="file" id="importThemeFile" accept=".json" style="display: none;">
                    </label>
                </div>
            </div>
        </div>
        
        <!-- SAVED THEMES MODAL -->
        <div id="savedThemesModal" class="modal hidden">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>💾 Tema Tersimpan</h3>
                    <button class="modal-close" onclick="Utils.closeModal('savedThemesModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="savedThemesList"></div>
                    <div class="form-group" style="margin-top: 15px;">
                        <label>Nama Tema Baru:</label>
                        <input type="text" id="newThemeName" class="form-control" placeholder="Masukkan nama tema">
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="window.app.personalizationModule.saveCurrentAsTheme()">
                        💾 Simpan Tema Sekarang
                    </button>
                </div>
            </div>
        </div>
    `;

    await this.renderThemeCustomization();
    await this.renderFontCustomization();
    await this.renderEffectsCustomization();
    await this.renderWidgetsManagement();
    this.setupEventListeners();
    this.updateLivePreview();
    this.setupFloatingPreview(); // Setup floating preview
}

    loadCustomSettings() {
        const saved = localStorage.getItem('personalizationSettings');
        const defaultSettings = {
            theme: {
                primaryColor: '#415c5f',       // Mineral Green - Brand utama
                secondaryColor: '#bd9b5f',     // Twine - Brand sekunder
                accentColor: '#93713d',        // Cape Palliser - Brand aksen
                backgroundColor: '#f6f1e9',    // Ecru White - Brand background
                cardBackground: '#ffffff',     // Pure White
                textColor: '#1a1a1a',          // Almost Black
                mutedColor: '#6c757d',         // Modern Gray
                borderColor: '#e9ecef'         // Light Gray
            },
            typography: {
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                fontSize: '14px',
                headingSize: '18px',
                fontWeight: '400',
                lineHeight: '1.6'
            },
            effects: {
                animations: true,
                shadows: true,
                borderRadius: '12px',
                transitionSpeed: '0.3s',
                hoverEffects: true,
                glassEffect: false
            },
            layout: {
                showQuickStats: true,
                showRecentTransactions: true,
                showBudgetProgress: true,
                showSavingsGoals: true,
                compactMode: false,
                cardSpacing: '20px',
                sidebarWidth: '250px'
            },
            advanced: {
                cssOverrides: '',
                customVariables: {}
            }
        };
        
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveCustomSettings() {
        localStorage.setItem('personalizationSettings', JSON.stringify(this.customSettings));
    }

    async renderThemeCustomization() {
        const container = document.getElementById('themeCustomization');
        const colors = this.customSettings.theme;

        container.innerHTML = `
            <div class="color-grid">
                ${this.createColorPicker('primaryColor', 'Warna Primer', colors.primaryColor, 'Warna utama untuk button dan aksen')}
                ${this.createColorPicker('secondaryColor', 'Warna Sekunder', colors.secondaryColor, 'Warna kedua untuk variasi')}
                ${this.createColorPicker('accentColor', 'Warna Aksen', colors.accentColor, 'Warna untuk highlight dan perhatian')}
                ${this.createColorPicker('backgroundColor', 'Background', colors.backgroundColor, 'Warna background aplikasi')}
                ${this.createColorPicker('cardBackground', 'Card Background', colors.cardBackground, 'Warna background card')}
                ${this.createColorPicker('textColor', 'Warna Teks', colors.textColor, 'Warna teks utama')}
                ${this.createColorPicker('mutedColor', 'Warna Muted', colors.mutedColor, 'Warna teks sekunder')}
                ${this.createColorPicker('borderColor', 'Warna Border', colors.borderColor, 'Warna garis dan border')}
            </div>
            
            <div class="preset-themes">
                <label class="form-label">🎨 Preset Cepat:</label>
                <div class="preset-grid">
                    <div class="preset-item" data-preset="mineral" style="background: linear-gradient(135deg, #415c5f 50%, #bd9b5f 50%);" title="Mineral Green"></div>
                    <div class="preset-item" data-preset="ocean" style="background: linear-gradient(135deg, #0077b6 50%, #00b4d8 50%);" title="Ocean Blue"></div>
                    <div class="preset-item" data-preset="nature" style="background: linear-gradient(135deg, #2a9d8f 50%, #e9c46a 50%);" title="Nature Fresh"></div>
                    <div class="preset-item" data-preset="sunset" style="background: linear-gradient(135deg, #ff6b35 50%, #ff9e00 50%);" title="Sunset"></div>
                    <div class="preset-item" data-preset="cyber" style="background: linear-gradient(135deg, #7209b7 50%, #3a86ff 50%);" title="Cyber Punk"></div>
                    <div class="preset-item" data-preset="crimson" style="background: linear-gradient(135deg, #dc2626 50%, #ef4444 50%);" title="Crimson Red"></div>
                    <div class="preset-item" data-preset="glass" style="background: linear-gradient(135deg, #6366f1 50%, #8b5cf6 50%);" title="Glass Morphism"></div>
                    <div class="preset-item" data-preset="dark" style="background: linear-gradient(135deg, #1e293b 50%, #475569 50%);" title="Dark Pro"></div>
                    <div class="preset-item" data-preset="purple" style="background: linear-gradient(135deg, #7e22ce 50%, #c084fc 50%);" title="Purple Royal"></div>
                    <div class="preset-item" data-preset="gold" style="background: linear-gradient(135deg, #d97706 50%, #f59e0b 50%);" title="Golden Luxury"></div>
                </div>
            </div>
        `;

        this.setupColorPickers();
        this.setupPresetThemes();
    }

    createColorPicker(id, label, value, tooltip) {
        const brandDescriptions = {
            primaryColor: 'Warna utama brand untuk tombol dan elemen penting',
            secondaryColor: 'Warna sekunder untuk variasi dan aksen', 
            accentColor: 'Warna aksen untuk highlight dan perhatian',
            backgroundColor: 'Background utama aplikasi'
        };

        const description = brandDescriptions[id] || tooltip;
        
        return `
            <div class="color-picker-item" title="${description}">
                <label class="color-label">${label}</label>
                <div class="color-input-group">
                    <input type="color" class="color-picker" id="${id}" value="${value}" data-original="${value}">
                    <input type="text" class="color-hex" id="${id}Hex" value="${value}" maxlength="7">
                    <button class="btn btn-sm btn-outline reset-color" data-target="${id}">↺</button>
                </div>
                <div class="color-value" style="font-size: 11px; color: var(--muted-color); margin-top: 2px;">${value}</div>
            </div>
        `;
    }

    setupColorPickers() {
        // Sync color pickers dengan hex inputs
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('input', (e) => {
                const hexInput = document.getElementById(e.target.id + 'Hex');
                const colorValue = e.target.parentElement.parentElement.querySelector('.color-value');
                hexInput.value = e.target.value;
                colorValue.textContent = e.target.value;
                this.updateLivePreview();
            });
        });

        document.querySelectorAll('.color-hex').forEach(hexInput => {
            hexInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const colorValue = e.target.parentElement.parentElement.querySelector('.color-value');
                if (value.startsWith('#') && value.length === 7) {
                    const colorPicker = document.getElementById(e.target.id.replace('Hex', ''));
                    colorPicker.value = value;
                    colorValue.textContent = value;
                    this.updateLivePreview();
                }
            });
            
            hexInput.addEventListener('blur', (e) => {
                const value = e.target.value;
                const colorValue = e.target.parentElement.parentElement.querySelector('.color-value');
                if (!value.startsWith('#')) {
                    e.target.value = '#' + value.replace('#', '');
                    colorValue.textContent = e.target.value;
                }
            });
        });

        // Reset color buttons
        document.querySelectorAll('.reset-color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                const colorPicker = document.getElementById(targetId);
                const hexInput = document.getElementById(targetId + 'Hex');
                const colorValue = colorPicker.parentElement.parentElement.querySelector('.color-value');
                const originalValue = colorPicker.dataset.original;
                
                colorPicker.value = originalValue;
                hexInput.value = originalValue;
                colorValue.textContent = originalValue;
                this.updateLivePreview();
            });
        });
    }

    setupPresetThemes() {
        const presets = {
            // 10 TEMA BAWAAAN
            mineral: {
                name: "Mineral Green",
                primaryColor: '#415c5f',       // Mineral Green
                secondaryColor: '#bd9b5f',     // Twine
                accentColor: '#93713d',        // Cape Palliser
                backgroundColor: '#f6f1e9',    // Ecru White
                cardBackground: '#ffffff',
                textColor: '#1a1a1a',
                mutedColor: '#6c757d',
                borderColor: '#e9ecef'
            },
            ocean: {
                name: "Ocean Blue",
                primaryColor: '#0077b6',       // Deep Ocean
                secondaryColor: '#00b4d8',     // Vibrant Teal
                accentColor: '#ff6b6b',        // Coral
                backgroundColor: '#f0f8ff',
                cardBackground: '#ffffff',
                textColor: '#1a1a1a',
                mutedColor: '#6c757d',
                borderColor: '#e1f5fe'
            },
            nature: {
                name: "Nature Fresh",
                primaryColor: '#2a9d8f',       // Tropical Teal
                secondaryColor: '#e9c46a',     // Sunny Yellow
                accentColor: '#e76f51',        // Coral Orange
                backgroundColor: '#fefae0',
                cardBackground: '#ffffff',
                textColor: '#264653',
                mutedColor: '#6b9080',
                borderColor: '#ccd5ae'
            },
            sunset: {
                name: "Sunset",
                primaryColor: '#ff6b35',       // Vibrant Orange
                secondaryColor: '#ff9e00',     // Golden Yellow
                accentColor: '#00a8e8',        // Sky Blue
                backgroundColor: '#f8f5f2',
                cardBackground: '#ffffff',
                textColor: '#2d3047',
                mutedColor: '#6d7275',
                borderColor: '#e6e6e6'
            },
            cyber: {
                name: "Cyber Punk",
                primaryColor: '#7209b7',       // Electric Purple
                secondaryColor: '#3a86ff',     // Bright Blue
                accentColor: '#ff006e',        // Hot Pink
                backgroundColor: '#0d1b2a',
                cardBackground: '#1b263b',
                textColor: '#e0e1dd',
                mutedColor: '#778da9',
                borderColor: '#415a77'
            },
            crimson: {
                name: "Crimson Red",
                primaryColor: '#dc2626',       // Crimson Red
                secondaryColor: '#ef4444',     // Light Red
                accentColor: '#f59e0b',        // Amber
                backgroundColor: '#fef2f2',
                cardBackground: '#ffffff',
                textColor: '#1f2937',
                mutedColor: '#9ca3af',
                borderColor: '#fecaca'
            },
            glass: {
                name: "Glass Morphism",
                primaryColor: '#6366f1',       // Indigo
                secondaryColor: '#8b5cf6',     // Violet
                accentColor: '#06d6a0',        // Emerald
                backgroundColor: '#0f172a',
                cardBackground: 'rgba(30, 41, 59, 0.8)',
                textColor: '#f1f5f9',
                mutedColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)'
            },
            dark: {
                name: "Dark Pro",
                primaryColor: '#3b82f6',       // Blue
                secondaryColor: '#1e40af',     // Dark Blue
                accentColor: '#10b981',        // Green
                backgroundColor: '#111827',
                cardBackground: '#1f2937',
                textColor: '#f9fafb',
                mutedColor: '#9ca3af',
                borderColor: '#374151'
            },
            purple: {
                name: "Purple Royal",
                primaryColor: '#7e22ce',       // Purple
                secondaryColor: '#c084fc',     // Light Purple
                accentColor: '#f0abfc',        // Pink
                backgroundColor: '#faf5ff',
                cardBackground: '#ffffff',
                textColor: '#1e1b4b',
                mutedColor: '#7e22ce',
                borderColor: '#e9d5ff'
            },
            gold: {
                name: "Golden Luxury",
                primaryColor: '#d97706',       // Amber
                secondaryColor: '#f59e0b',     // Yellow
                accentColor: '#fbbf24',        // Light Yellow
                backgroundColor: '#fffbeb',
                cardBackground: '#ffffff',
                textColor: '#78350f',
                mutedColor: '#d97706',
                borderColor: '#fcd34d'
            }
        };

        document.querySelectorAll('.preset-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const presetName = e.target.dataset.preset;
                this.applyThemePreset(presets[presetName]);
            });
        });

        // Quick action buttons
        document.querySelectorAll('.quick-actions [data-preset]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetName = e.target.dataset.preset;
                this.applyThemePreset(presets[presetName]);
                Utils.showToast(`🎨 Tema "${presets[presetName].name}" diterapkan!`, 'success');
            });
        });
    }

    applyThemePreset(preset) {
        Object.keys(preset).forEach(colorKey => {
            if (colorKey !== 'name') {
                const picker = document.getElementById(colorKey);
                const hexInput = document.getElementById(colorKey + 'Hex');
                
                if (picker && hexInput) {
                    picker.value = preset[colorKey];
                    hexInput.value = preset[colorKey];
                    // Update color value display
                    const colorValue = picker.parentElement.parentElement.querySelector('.color-value');
                    if (colorValue) {
                        colorValue.textContent = preset[colorKey];
                    }
                }
            }
        });
        
        // Update theme name in preview
        const themeNameElement = document.getElementById('currentThemeName');
        if (themeNameElement && preset.name) {
            themeNameElement.textContent = preset.name;
        }
        
        this.updateLivePreview();
    }

    async renderFontCustomization() {
        const container = document.getElementById('fontCustomization');
        const fonts = this.customSettings.typography;

        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Font Family</label>
                <select class="form-control" id="fontFamily">
                    <option value="system-ui, -apple-system, sans-serif" ${fonts.fontFamily.includes('system-ui') ? 'selected' : ''}>System Default</option>
                    <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" ${fonts.fontFamily.includes('Segoe') ? 'selected' : ''}>Segoe UI</option>
                    <option value="'Inter', sans-serif" ${fonts.fontFamily.includes('Inter') ? 'selected' : ''}>Inter (Modern)</option>
                    <option value="'Roboto', sans-serif" ${fonts.fontFamily.includes('Roboto') ? 'selected' : ''}>Roboto (Google)</option>
                    <option value="'Open Sans', sans-serif" ${fonts.fontFamily.includes('Open Sans') ? 'selected' : ''}>Open Sans</option>
                    <option value="'Poppins', sans-serif" ${fonts.fontFamily.includes('Poppins') ? 'selected' : ''}>Poppins (Elegant)</option>
                    <option value="'Montserrat', sans-serif" ${fonts.fontFamily.includes('Montserrat') ? 'selected' : ''}>Montserrat (Bold)</option>
                </select>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label class="form-label">Ukuran Font</label>
                    <select class="form-control" id="fontSize">
                        <option value="12px" ${fonts.fontSize === '12px' ? 'selected' : ''}>Kecil (12px)</option>
                        <option value="14px" ${fonts.fontSize === '14px' ? 'selected' : ''}>Normal (14px)</option>
                        <option value="16px" ${fonts.fontSize === '16px' ? 'selected' : ''}>Besar (16px)</option>
                        <option value="18px" ${fonts.fontSize === '18px' ? 'selected' : ''}>Extra Besar (18px)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Ukuran Heading</label>
                    <select class="form-control" id="headingSize">
                        <option value="16px" ${fonts.headingSize === '16px' ? 'selected' : ''}>Kecil (16px)</option>
                        <option value="18px" ${fonts.headingSize === '18px' ? 'selected' : ''}>Normal (18px)</option>
                        <option value="20px" ${fonts.headingSize === '20px' ? 'selected' : ''}>Besar (20px)</option>
                        <option value="24px" ${fonts.headingSize === '24px' ? 'selected' : ''}>Extra Besar (24px)</option>
                    </select>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label class="form-label">Ketebalan Font</label>
                    <select class="form-control" id="fontWeight">
                        <option value="300" ${fonts.fontWeight === '300' ? 'selected' : ''}>Light (300)</option>
                        <option value="400" ${fonts.fontWeight === '400' ? 'selected' : ''}>Normal (400)</option>
                        <option value="500" ${fonts.fontWeight === '500' ? 'selected' : ''}>Medium (500)</option>
                        <option value="600" ${fonts.fontWeight === '600' ? 'selected' : ''}>Semi Bold (600)</option>
                        <option value="700" ${fonts.fontWeight === '700' ? 'selected' : ''}>Bold (700)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Tinggi Baris</label>
                    <select class="form-control" id="lineHeight">
                        <option value="1.2" ${fonts.lineHeight === '1.2' ? 'selected' : ''}>Compact (1.2)</option>
                        <option value="1.5" ${fonts.lineHeight === '1.5' ? 'selected' : ''}>Normal (1.5)</option>
                        <option value="1.8" ${fonts.lineHeight === '1.8' ? 'selected' : ''}>Spacious (1.8)</option>
                    </select>
                </div>
            </div>
        `;

        // Add event listeners for live preview
        ['fontFamily', 'fontSize', 'headingSize', 'fontWeight', 'lineHeight'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateLivePreview());
        });
    }

    async renderEffectsCustomization() {
        const container = document.getElementById('effectsCustomization');
        const effects = this.customSettings.effects;

        container.innerHTML = `
            <div class="form-grid-2">
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="enableAnimations" ${effects.animations ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Animasi
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="enableShadows" ${effects.shadows ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Bayangan
                    </label>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="hoverEffects" ${effects.hoverEffects ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Efek Hover
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="glassEffect" ${effects.glassEffect ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Glass Effect
                    </label>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label class="form-label">Border Radius</label>
                    <select class="form-control" id="borderRadius">
                        <option value="5px" ${effects.borderRadius === '5px' ? 'selected' : ''}>Minimal (5px)</option>
                        <option value="8px" ${effects.borderRadius === '8px' ? 'selected' : ''}>Sedang (8px)</option>
                        <option value="10px" ${effects.borderRadius === '10px' ? 'selected' : ''}>Normal (10px)</option>
                        <option value="15px" ${effects.borderRadius === '15px' ? 'selected' : ''}>Rounded (15px)</option>
                        <option value="20px" ${effects.borderRadius === '20px' ? 'selected' : ''}>Very Rounded (20px)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Kecepatan Transisi</label>
                    <select class="form-control" id="transitionSpeed">
                        <option value="0.1s" ${effects.transitionSpeed === '0.1s' ? 'selected' : ''}>Cepat (0.1s)</option>
                        <option value="0.3s" ${effects.transitionSpeed === '0.3s' ? 'selected' : ''}>Normal (0.3s)</option>
                        <option value="0.5s" ${effects.transitionSpeed === '0.5s' ? 'selected' : ''}>Lambat (0.5s)</option>
                    </select>
                </div>
            </div>
        `;

        // Add event listeners
        ['enableAnimations', 'enableShadows', 'hoverEffects', 'glassEffect', 'borderRadius', 'transitionSpeed'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateLivePreview());
        });
    }

    async renderWidgetsManagement() {
        const container = document.getElementById('widgetsManagement');
        const layout = this.customSettings.layout;

        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Tata Letak Dashboard</label>
                <div class="widget-grid">
                    <label class="checkbox-label full-width">
                        <input type="checkbox" id="showQuickStats" ${layout.showQuickStats ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Tampilkan Quick Stats
                    </label>
                    <label class="checkbox-label full-width">
                        <input type="checkbox" id="showRecentTransactions" ${layout.showRecentTransactions ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Tampilkan Transaksi Terakhir
                    </label>
                    <label class="checkbox-label full-width">
                        <input type="checkbox" id="showBudgetProgress" ${layout.showBudgetProgress ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Tampilkan Progress Budget
                    </label>
                    <label class="checkbox-label full-width">
                        <input type="checkbox" id="showSavingsGoals" ${layout.showSavingsGoals ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Tampilkan Target Tabungan
                    </label>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="compactMode" ${layout.compactMode ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Mode Compact
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label">Spacing Card</label>
                    <select class="form-control" id="cardSpacing">
                        <option value="10px" ${layout.cardSpacing === '10px' ? 'selected' : ''}>Rapat (10px)</option>
                        <option value="15px" ${layout.cardSpacing === '15px' ? 'selected' : ''}>Normal (15px)</option>
                        <option value="20px" ${layout.cardSpacing === '20px' ? 'selected' : ''}>Longgar (20px)</option>
                    </select>
                </div>
            </div>
        `;
    }

    setupFloatingPreview() {
    const toggle = document.getElementById('floatingPreviewToggle');
    const preview = document.getElementById('livePreview');
    
    if (!toggle || !preview) return;
    
    // Load saved preference
    const isFloating = localStorage.getItem('floatingPreview') === 'true';
    this.toggleFloatingPreview(isFloating);
    
    // Toggle event
    toggle.addEventListener('change', (e) => {
        const isFloating = e.target.checked;
        localStorage.setItem('floatingPreview', isFloating);
        this.toggleFloatingPreview(isFloating);
    });
    
    // Make floating preview draggable
    this.makePreviewDraggable();
}

toggleFloatingPreview(isFloating) {
    const preview = document.getElementById('livePreview');
    const toggle = document.getElementById('floatingPreviewToggle');
    
    if (!preview) return;
    
    if (isFloating) {
        preview.classList.add('floating-preview');
        preview.classList.add('floating-active');
        if (toggle) toggle.checked = true;
    } else {
        preview.classList.remove('floating-preview');
        preview.classList.remove('floating-active');
        if (toggle) toggle.checked = false;
    }
}

makePreviewDraggable() {
    const preview = document.getElementById('livePreview');
    if (!preview) return;
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    // Load saved position
    const savedPosition = localStorage.getItem('floatingPreviewPosition');
    if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        preview.style.left = x + 'px';
        preview.style.top = y + 'px';
        xOffset = x;
        yOffset = y;
    }
    
    preview.addEventListener('mousedown', dragStart);
    preview.addEventListener('touchstart', dragStart);
    
    function dragStart(e) {
        if (!preview.classList.contains('floating-active')) return;
        
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        
        if (e.target.closest('.preview-dashboard')) {
            isDragging = true;
            preview.style.cursor = 'grabbing';
        }
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }
        
        xOffset = currentX;
        yOffset = currentY;
        
        setTranslate(currentX, currentY, preview);
    }
    
    function dragEnd() {
        isDragging = false;
        preview.style.cursor = 'grab';
        
        // Save position
        localStorage.setItem('floatingPreviewPosition', JSON.stringify({
            x: xOffset,
            y: yOffset
        }));
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchend', dragEnd);
    }
    
    function setTranslate(xPos, yPos, el) {
        el.style.left = xPos + 'px';
        el.style.top = yPos + 'px';
    }
}

setupEventListeners() {
    document.getElementById('applyPersonalization').addEventListener('click', () => this.applyPersonalization());
    document.getElementById('saveAsTheme').addEventListener('click', () => this.showSaveThemeModal());
    document.getElementById('resetPersonalization').addEventListener('click', () => this.resetPersonalization());
    document.getElementById('exportTheme').addEventListener('click', () => this.exportTheme());
    document.getElementById('importThemeFile').addEventListener('change', (e) => this.importTheme(e));
    document.getElementById('refreshPreview').addEventListener('click', () => this.updateLivePreview());
    
    // Floating preview toggle
    const floatingToggle = document.getElementById('floatingPreviewToggle');
    if (floatingToggle) {
        floatingToggle.addEventListener('change', (e) => {
            this.toggleFloatingPreview(e.target.checked);
        });
    }
}

    updateLivePreview() {
        const preview = document.getElementById('livePreview');
        if (!preview) return;

        // Collect current values
        const theme = {
            primaryColor: document.getElementById('primaryColor')?.value || this.customSettings.theme.primaryColor,
            secondaryColor: document.getElementById('secondaryColor')?.value || this.customSettings.theme.secondaryColor,
            backgroundColor: document.getElementById('backgroundColor')?.value || this.customSettings.theme.backgroundColor,
            cardBackground: document.getElementById('cardBackground')?.value || this.customSettings.theme.cardBackground,
            textColor: document.getElementById('textColor')?.value || this.customSettings.theme.textColor,
            mutedColor: document.getElementById('mutedColor')?.value || this.customSettings.theme.mutedColor,
            borderColor: document.getElementById('borderColor')?.value || this.customSettings.theme.borderColor
        };

        const typography = {
            fontFamily: document.getElementById('fontFamily')?.value || this.customSettings.typography.fontFamily,
            fontSize: document.getElementById('fontSize')?.value || this.customSettings.typography.fontSize,
            fontWeight: document.getElementById('fontWeight')?.value || this.customSettings.typography.fontWeight
        };

        const effects = {
            borderRadius: document.getElementById('borderRadius')?.value || this.customSettings.effects.borderRadius,
            shadows: document.getElementById('enableShadows')?.checked || this.customSettings.effects.shadows
        };

        // Update color swatches in preview
        const primarySwatch = preview.querySelector('.color-swatch.primary');
        const secondarySwatch = preview.querySelector('.color-swatch.secondary');
        const accentSwatch = preview.querySelector('.color-swatch.accent');
        const backgroundSwatch = preview.querySelector('.color-swatch.background');
        
        if (primarySwatch) primarySwatch.style.backgroundColor = theme.primaryColor;
        if (secondarySwatch) secondarySwatch.style.backgroundColor = theme.secondaryColor;
        if (accentSwatch) accentSwatch.style.backgroundColor = theme.accentColor;
        if (backgroundSwatch) backgroundSwatch.style.backgroundColor = theme.backgroundColor;

        // Apply to preview
        preview.style.fontFamily = typography.fontFamily;
        preview.style.fontSize = typography.fontSize;
        preview.style.fontWeight = typography.fontWeight;
        preview.style.backgroundColor = theme.backgroundColor;
        preview.style.color = theme.textColor;
        preview.style.borderRadius = effects.borderRadius;
        preview.style.boxShadow = effects.shadows ? '0 2px 10px rgba(0,0,0,0.1)' : 'none';

        // Update preview elements
        const previewElements = {
            '.preview-dashboard': {
                backgroundColor: theme.cardBackground,
                color: theme.textColor,
                borderRadius: effects.borderRadius,
                border: `1px solid ${theme.borderColor}`
            },
            '.preview-header h5': { 
                color: theme.textColor,
                fontSize: this.customSettings.typography.headingSize
            },
            '.preview-badge': { 
                backgroundColor: theme.primaryColor,
                color: '#ffffff'
            },
            '.preview-stat-card': {
                backgroundColor: this.lightenColor(theme.cardBackground, 5),
                color: theme.textColor,
                borderRadius: effects.borderRadius
            },
            '.preview-stat-label': { color: theme.mutedColor },
            '.preview-transaction': {
                backgroundColor: this.lightenColor(theme.cardBackground, 5),
                borderRadius: effects.borderRadius
            },
            '.preview-transaction-subtitle': { color: theme.mutedColor },
            '.preview-transaction-amount.expense': { color: '#e74c3c' },
            '.preview-progress': {
                backgroundColor: this.lightenColor(theme.cardBackground, 5),
                borderRadius: effects.borderRadius
            },
            '.preview-progress-bar': {
                backgroundColor: theme.borderColor
            },
            '.preview-progress-fill': { 
                backgroundColor: theme.primaryColor 
            }
        };

        Object.keys(previewElements).forEach(selector => {
            const element = preview.querySelector(selector);
            if (element) {
                Object.assign(element.style, previewElements[selector]);
            }
        });
    }

    async applyPersonalization() {
        if (this.isApplying) return;
        this.isApplying = true;

        try {
            // Collect all settings from UI
            this.customSettings.theme = {
                primaryColor: document.getElementById('primaryColor').value,
                secondaryColor: document.getElementById('secondaryColor').value,
                accentColor: document.getElementById('accentColor').value,
                backgroundColor: document.getElementById('backgroundColor').value,
                cardBackground: document.getElementById('cardBackground').value,
                textColor: document.getElementById('textColor').value,
                mutedColor: document.getElementById('mutedColor').value,
                borderColor: document.getElementById('borderColor').value
            };

            this.customSettings.typography = {
                fontFamily: document.getElementById('fontFamily').value,
                fontSize: document.getElementById('fontSize').value,
                headingSize: document.getElementById('headingSize').value,
                fontWeight: document.getElementById('fontWeight').value,
                lineHeight: document.getElementById('lineHeight').value
            };

            this.customSettings.effects = {
                animations: document.getElementById('enableAnimations').checked,
                shadows: document.getElementById('enableShadows').checked,
                hoverEffects: document.getElementById('hoverEffects').checked,
                glassEffect: document.getElementById('glassEffect').checked,
                borderRadius: document.getElementById('borderRadius').value,
                transitionSpeed: document.getElementById('transitionSpeed').value
            };

            this.customSettings.layout = {
                showQuickStats: document.getElementById('showQuickStats').checked,
                showRecentTransactions: document.getElementById('showRecentTransactions').checked,
                showBudgetProgress: document.getElementById('showBudgetProgress').checked,
                showSavingsGoals: document.getElementById('showSavingsGoals').checked,
                compactMode: document.getElementById('compactMode').checked,
                cardSpacing: document.getElementById('cardSpacing').value,
                sidebarWidth: '250px'
            };

            // Save settings
            this.saveCustomSettings();

            // Apply to actual app
            this.applyToApp();

            Utils.showToast('🎨 Personalisasi berhasil diterapkan!', 'success');
            
            // Refresh dashboard if we're on it
            if (this.app.currentTab === 'dashboard') {
                setTimeout(() => {
                    this.app.renderTabContent('dashboard');
                }, 500);
            }

            // Refresh floating preview jika aktif
            if (document.getElementById('livePreview')?.classList.contains('floating-active')) {
                this.updateLivePreview();
            }

        } catch (error) {
            console.error('Error applying personalization:', error);
            Utils.showToast('❌ Gagal menerapkan personalisasi', 'error');
        } finally {
            this.isApplying = false;
        }
    }

    applyToApp() {
        const settings = this.customSettings;
        
        console.log('🔧 Applying personalization with settings:', settings);
        
        // Create or update style element
        let styleElement = document.getElementById('personalization-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'personalization-styles';
            document.head.appendChild(styleElement);
            console.log('✅ Created new style element');
        }

        // Generate comprehensive CSS
        const css = this.generatePersonalizationCSS(settings);
        styleElement.textContent = css;
        
        console.log('📝 Generated CSS with primary color:', settings.theme.primaryColor);

        // Set data-theme attribute for dark/light mode detection
        const isDark = this.isDarkColor(settings.theme.backgroundColor);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        console.log('🌓 Theme set to:', isDark ? 'dark' : 'light');
    }

    generatePersonalizationCSS(settings) {
        return `
            :root {
                /* Theme Colors - FORCE dengan !important */
                --primary-color: ${settings.theme.primaryColor} !important;
                --secondary-color: ${settings.theme.secondaryColor} !important;
                --accent-color: ${settings.theme.accentColor} !important;
                --success-color: #27ae60 !important;
                --warning-color: #f39c12 !important;
                --danger-color: #e74c3c !important;
                --info-color: #3498db !important;
                
                /* Background Colors */
                --background-color: ${settings.theme.backgroundColor} !important;
                --card-bg: ${settings.theme.cardBackground} !important;
                --light-color: ${this.lightenColor(settings.theme.cardBackground, 20)} !important;
                --dark-color: ${this.darkenColor(settings.theme.cardBackground, 20)} !important;
                
                /* Text Colors */
                --text-color: ${settings.theme.textColor} !important;
                --muted-color: ${settings.theme.mutedColor} !important;
                --border-color: ${settings.theme.borderColor} !important;
                
                /* Typography */
                --font-family: ${settings.typography.fontFamily} !important;
                --base-font-size: ${settings.typography.fontSize} !important;
                --heading-size: ${settings.typography.headingSize} !important;
                --font-weight: ${settings.typography.fontWeight} !important;
                --line-height: ${settings.typography.lineHeight} !important;
                
                /* Effects */
                --border-radius: ${settings.effects.borderRadius} !important;
                --transition-speed: ${settings.effects.transitionSpeed} !important;
                --shadow-effect: ${settings.effects.shadows ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'} !important;
                --shadow-effect-strong: ${settings.effects.shadows ? '0 4px 20px rgba(0,0,0,0.15)' : 'none'} !important;
            }

            /* Force apply styles dengan specificity tinggi */
            body {
                font-family: var(--font-family) !important;
                font-size: var(--base-font-size) !important;
                font-weight: var(--font-weight) !important;
                line-height: var(--line-height) !important;
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%) !important;
                color: var(--text-color) !important;
                transition: all var(--transition-speed) !important;
            }

            .card {
                background: var(--card-bg) !important;
                border-radius: var(--border-radius) !important;
                box-shadow: var(--shadow-effect) !important;
                border: 1px solid var(--border-color) !important;
                color: var(--text-color) !important;
            }

            .card-header {
                color: var(--text-color) !important;
            }

            .card-title {
                color: var(--text-color) !important;
                font-size: var(--heading-size) !important;
            }

            .btn-primary {
                background-color: var(--primary-color) !important;
                border-color: var(--primary-color) !important;
                color: white !important;
            }

            .btn-secondary {
                background-color: var(--secondary-color) !important;
                border-color: var(--secondary-color) !important;
                color: white !important;
            }

            .btn-outline {
                background: transparent !important;
                border: 2px solid var(--primary-color) !important;
                color: var(--primary-color) !important;
            }

            .form-control {
                background: var(--card-bg) !important;
                border: 2px solid var(--border-color) !important;
                color: var(--text-color) !important;
                border-radius: var(--border-radius) !important;
            }

            .form-control:focus {
                border-color: var(--primary-color) !important;
            }

            .form-label {
                color: var(--text-color) !important;
            }

            .modal-content {
                background: var(--card-bg) !important;
                color: var(--text-color) !important;
            }

            .modal-title {
                color: var(--text-color) !important;
            }

            .wallet-card, .transaction-item, .liability-item {
                background: var(--light-color) !important;
                color: var(--text-color) !important;
            }

            .wallet-name, .transaction-category {
                color: var(--text-color) !important;
            }

            .transaction-wallet, .transaction-notes {
                color: var(--muted-color) !important;
            }

            /* Progress bars */
            .progress-bar {
                background-color: var(--primary-color) !important;
            }

            .preview-progress-fill {
                background-color: var(--primary-color) !important;
            }

            /* Hover Effects */
            ${settings.effects.hoverEffects ? `
            .card:hover {
                transform: translateY(-2px) !important;
                box-shadow: var(--shadow-effect-strong) !important;
            }
            
            .btn:hover {
                transform: translateY(-1px) !important;
                filter: brightness(110%) !important;
            }
            ` : ''}

            /* Glass Effect */
            ${settings.effects.glassEffect ? `
            .card.glass {
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            ` : ''}

            /* Animations */
            ${!settings.effects.animations ? `
            * {
                animation: none !important;
                transition: none !important;
            }
            ` : ''}

            /* Compact Mode */
            ${settings.layout.compactMode ? `
            .card {
                padding: 12px !important;
            }
            .card-header {
                padding: 12px 15px !important;
            }
            .transaction-item {
                padding: 8px 12px !important;
            }
            .btn {
                padding: 6px 12px !important;
                font-size: 13px !important;
            }
            .form-control {
                padding: 6px 10px !important;
                font-size: 13px !important;
            }
            ` : ''}

            /* Custom CSS Overrides */
            ${settings.advanced.cssOverrides}
        `;
    }

    showSaveThemeModal() {
        Utils.createModal('savedThemesModal', '💾 Simpan Tema', `
            <div id="savedThemesList">
                <div style="text-align: center; padding: 20px; color: #666;">
                    <div class="emoji">💾</div>
                    <p>Simpan konfigurasi saat ini sebagai tema</p>
                </div>
            </div>
            <div class="form-group" style="margin-top: 15px;">
                <label>Nama Tema:</label>
                <input type="text" id="newThemeName" class="form-control" placeholder="Masukkan nama tema" value="My Theme ${new Date().toLocaleDateString()}">
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="window.app.personalizationModule.saveCurrentAsTheme()">
                💾 Simpan Tema Sekarang
            </button>
        `);
        Utils.openModal('savedThemesModal');
    }

    saveCurrentAsTheme() {
        const themeName = document.getElementById('newThemeName').value.trim();
        if (!themeName) {
            Utils.showToast('Masukkan nama tema terlebih dahulu', 'warning');
            return;
        }

        // Save to localStorage
        const savedThemes = JSON.parse(localStorage.getItem('savedThemes') || '{}');
        savedThemes[themeName] = {
            ...this.customSettings,
            name: themeName,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('savedThemes', JSON.stringify(savedThemes));
        Utils.closeModal('savedThemesModal');
        Utils.showToast(`Tema "${themeName}" berhasil disimpan!`, 'success');
    }

    resetPersonalization() {
        if (confirm('Reset semua pengaturan personalisasi ke default?')) {
            localStorage.removeItem('personalizationSettings');
            this.customSettings = this.loadCustomSettings();
            this.applyToApp();
            this.render(document.getElementById('personalization-tab'));
            Utils.showToast('🔄 Pengaturan berhasil direset!', 'success');
        }
    }

    exportTheme() {
        const themeData = {
            name: 'Custom Finance App Theme',
            version: '1.0',
            settings: this.customSettings,
            exportedAt: new Date().toISOString(),
            appVersion: '3.0'
        };

        const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-theme-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        Utils.showToast('📤 Tema berhasil diexport!', 'success');
    }

    importTheme(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const themeData = JSON.parse(e.target.result);
                
                if (themeData.settings) {
                    this.customSettings = { ...this.customSettings, ...themeData.settings };
                    this.saveCustomSettings();
                    this.applyToApp();
                    this.render(document.getElementById('personalization-tab'));
                    Utils.showToast('📁 Tema berhasil diimport!', 'success');
                } else {
                    throw new Error('Format file tema tidak valid');
                }
            } catch (error) {
                Utils.showToast('❌ Gagal import tema: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // Helper methods for color manipulation
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 0 ? R > 255 ? 255 : R : 0) * 0x10000 + (G > 0 ? G > 255 ? 255 : G : 0) * 0x100 + (B > 0 ? B > 255 ? 255 : B : 0)).toString(16).slice(1);
    }

    isDarkColor(hexColor) {
        const hex = hexColor.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    }
}