/**
 * 偶成移动端诗词创作工具 - 主要交互功能
 * 实现专业创作、AI图章、背景定制、海报导出等核心功能
 */

// 全局配置
const CONFIG = {
    ANIMATION_DURATION: 400,
    STAGGER_DELAY: 80,
    SCROLL_THRESHOLD: 0.1,
    DEBOUNCE_DELAY: 300
};

// 词牌数据库
const CI_PATTERNS = {
    // 小令
    cisangzi: {
        name: '采桑子',
        lines: ['仄仄平平平仄仄', '平平仄仄平平仄', '仄仄平平平仄仄', '平平仄仄平平仄'],
        rhymes: [1, 3]
    },
    rumengling: {
        name: '如梦令',
        lines: ['仄仄平平仄仄', '仄仄平平仄仄', '仄仄仄平平', '仄仄平平仄仄'],
        rhymes: [0, 1, 3]
    },
    huanxisha: {
        name: '浣溪沙',
        lines: ['仄仄平平仄仄平', '平平仄仄仄平平', '平平仄仄平平仄', '仄仄平平平仄仄', '平平仄仄平平仄', '仄仄平平仄仄平'],
        rhymes: [1, 5]
    },
    yijianmei: {
        name: '一剪梅',
        lines: ['仄仄平平仄仄平', '仄仄平平仄仄平', '平平仄仄平平仄', '仄仄平平仄仄平', '仄仄平平仄仄平', '平平仄仄平平仄'],
        rhymes: [1, 4, 5]
    },
    pozhenzi: {
        name: '破阵子',
        lines: ['仄仄平平仄仄', '平平仄仄平平', '仄仄平平平仄仄', '仄仄平平仄仄平', '平平仄仄平'],
        rhymes: [1, 3, 4]
    },
    // 中调
    dielianhua: {
        name: '蝶恋花',
        lines: ['仄仄平平平仄仄', '仄仄平平仄仄平平仄', '仄仄平平平仄仄', '仄仄平平仄仄平平仄', '仄仄平平平仄仄'],
        rhymes: [1, 3, 4]
    },
    linjiangxian: {
        name: '临江仙',
        lines: ['仄仄平平平仄仄', '平平仄仄仄平平', '平平仄仄平平仄', '仄仄平平平仄仄', '平平仄仄仄平平', '平平仄仄平平仄'],
        rhymes: [1, 3, 5]
    },
    shuidiaogetou: {
        name: '水调歌头',
        lines: ['仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄'],
        rhymes: [1, 3, 5, 7]
    },
    // 长调
    niannujiao: {
        name: '念奴娇',
        lines: ['仄仄平平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄'],
        rhymes: [1, 3, 5, 7, 9]
    },
    manjianghong: {
        name: '满江红',
        lines: ['仄仄平平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄'],
        rhymes: [1, 3, 5, 7, 9]
    },
    qinyuanchun: {
        name: '沁园春',
        lines: ['仄仄平平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄', '仄仄平平仄仄'],
        rhymes: [1, 3, 5, 7, 9, 11]
    }
};

// 高频关键词数据
const HOT_KEYWORDS = [
    { text: '明月', value: 100, dynasty: '唐', poems: ['静夜思', '水调歌头'] },
    { text: '春风', value: 85, dynasty: '唐', poems: ['春晓', '咏柳'] },
    { text: '相思', value: 90, dynasty: '宋', poems: ['相思', '蝶恋花'] },
    { text: '江南', value: 75, dynasty: '唐', poems: ['江南春', '忆江南'] },
    { text: '青山', value: 70, dynasty: '宋', poems: ['青山行', '临江仙'] },
    { text: '流水', value: 65, dynasty: '唐', poems: ['登鹳雀楼', '相思'] },
    { text: '桃花', value: 80, dynasty: '唐', poems: ['桃花溪', '题都城南庄'] },
    { text: '梅花', value: 85, dynasty: '宋', poems: ['梅花', '暗香'] },
    { text: '秋风', value: 70, dynasty: '唐', poems: ['秋风引', '秋夕'] },
    { text: '白云', value: 60, dynasty: '唐', poems: ['白云泉', '山中'] },
    { text: '黄鹤', value: 55, dynasty: '唐', poems: ['黄鹤楼', '送孟浩然之广陵'] },
    { text: '芳草', value: 65, dynasty: '宋', poems: ['芳草渡', '蝶恋花'] },
    { text: '长亭', value: 50, dynasty: '宋', poems: ['长亭怨慢', '雨霖铃'] },
    { text: '杨柳', value: 75, dynasty: '唐', poems: ['杨柳枝', '送别'] },
    { text: '杜鹃', value: 45, dynasty: '宋', poems: ['杜鹃声里', '浣溪沙'] },
    { text: '燕子', value: 55, dynasty: '唐', poems: ['燕子楼', '春燕'] },
    { text: '梧桐', value: 60, dynasty: '宋', poems: ['梧桐影', '声声慢'] },
    { text: '芭蕉', value: 40, dynasty: '宋', poems: ['芭蕉雨', '添字浣溪沙'] },
    { text: '杏花', value: 50, dynasty: '宋', poems: ['杏花天', '临江仙'] },
    { text: '荷花', value: 65, dynasty: '宋', poems: ['荷花', '浣溪沙'] }
];

// 全局变量
let currentMode = 'free';
let currentPreview = 'vertical';
let currentGenre = 'modern';
let currentPattern = null;
let currentBackground = 'xuan';
let currentSeal = 'default';

// 工具函数
const Utils = {
    debounce(func, wait) {
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

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// 动画管理器
const AnimationManager = {
    fadeIn(elements, options = {}) {
        const defaults = {
            duration: CONFIG.ANIMATION_DURATION,
            delay: 0,
            easing: 'easeOutQuart'
        };
        const config = { ...defaults, ...options };

        return anime({
            targets: elements,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: config.duration,
            delay: config.delay,
            easing: config.easing
        });
    },

    stagger(elements, options = {}) {
        const defaults = {
            duration: CONFIG.ANIMATION_DURATION,
            delay: anime.stagger(CONFIG.STAGGER_DELAY),
            easing: 'easeOutQuart'
        };
        const config = { ...defaults, ...options };

        return anime({
            targets: elements,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: config.duration,
            delay: config.delay,
            easing: config.easing
        });
    }
};

// 通知管理器
const NotificationManager = {
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // 动画显示
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 关闭按钮
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hide(notification);
        });

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }

        return notification;
    },

    hide(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
};

// 存储管理器
const StorageManager = {
    prefix: 'oucheng_mobile_',

    set(key, value) {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, data);
            return true;
        } catch (error) {
            console.error('存储失败:', error);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('读取失败:', error);
            return defaultValue;
        }
    }
};

// 词牌管理器
const PatternManager = {
    showPattern(patternKey) {
        const pattern = CI_PATTERNS[patternKey];
        if (!pattern) return;

        currentPattern = patternKey;
        const template = document.getElementById('patternTemplate');
        const title = document.getElementById('patternTitle');
        const lines = document.getElementById('patternLines');

        title.textContent = pattern.name;
        lines.innerHTML = pattern.lines.map((line, index) => {
            const isRhyme = pattern.rhymes.includes(index);
            return `<div class="pattern-line ${isRhyme ? 'rhyme' : ''}">${line}</div>`;
        }).join('');

        template.classList.add('show');
    },

    hidePattern() {
        currentPattern = null;
        document.getElementById('patternTemplate').classList.remove('show');
    }
};

// 背景管理器
const BackgroundManager = {
    backgrounds: {
        xuan: {
            name: '宣纸',
            class: 'xuan',
            image: 'resources/xuan-paper-bg.png'
        },
        plum: {
            name: '梅花笺',
            class: 'plum',
            color: 'var(--plum-pink)'
        },
        cloud: {
            name: '云纹笺',
            class: 'cloud',
            color: 'var(--cloud-blue)'
        },
        bamboo: {
            name: '竹纹笺',
            class: 'bamboo',
            color: 'var(--bamboo-green)'
        },
        lotus: {
            name: '莲花笺',
            class: 'lotus',
            color: 'var(--lotus-purple)'
        }
    },

    setBackground(bgKey) {
        currentBackground = bgKey;
        const bg = this.backgrounds[bgKey];
        const previewContent = document.getElementById('previewContent');
        
        // 清除之前的背景类
        previewContent.className = 'preview-content';
        
        if (bg.class === 'xuan') {
            previewContent.style.backgroundImage = `url('${bg.image}')`;
            previewContent.style.backgroundColor = '';
        } else {
            previewContent.style.backgroundImage = '';
            previewContent.style.backgroundColor = bg.color;
            previewContent.classList.add(bg.class);
        }

        // 更新背景选择器状态
        document.querySelectorAll('.background-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-bg="${bgKey}"]`).classList.add('active');
    }
};

// 图章管理器
const SealManager = {
    seals: {
        default: 'resources/seal-logo.png',
        style1: 'resources/seal-style1.png',
        style2: 'resources/seal-style2.png',
        style3: 'resources/seal-style3.png'
    },

    setSeal(sealKey) {
        currentSeal = sealKey;
        const sealDisplay = document.getElementById('sealDisplay');
        
        if (sealKey === 'default') {
            sealDisplay.textContent = '偶';
            sealDisplay.style.backgroundImage = '';
        } else {
            sealDisplay.textContent = '';
            sealDisplay.style.backgroundImage = `url('${this.seals[sealKey]}')`;
            sealDisplay.style.backgroundSize = 'contain';
            sealDisplay.style.backgroundRepeat = 'no-repeat';
            sealDisplay.style.backgroundPosition = 'center';
        }

        // 更新图章选择器状态
        document.querySelectorAll('.seal-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-seal="${sealKey}"]`).classList.add('active');
    },

    generateAISeal() {
        const penname = document.getElementById('penname').value || document.getElementById('proPenname').value;
        if (!penname) {
            NotificationManager.show('请先输入笔名', 'warning');
            return;
        }

        NotificationManager.show('正在生成AI图章...', 'info');
        
        // 模拟AI生成过程
        setTimeout(() => {
            const styles = ['style1', 'style2', 'style3'];
            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            this.setSeal(randomStyle);
            NotificationManager.show('AI图章生成完成', 'success');
        }, 2000);
    }
};

// 词云管理器
const WordCloudManager = {
    init() {
        this.renderWordCloud();
    },

    renderWordCloud() {
        const chartDom = document.getElementById('wordcloudContainer');
        const myChart = echarts.init(chartDom);
        
        const data = HOT_KEYWORDS.map(item => ({
            name: item.text,
            value: item.value,
            dynasty: item.dynasty,
            poems: item.poems
        }));

        const option = {
            tooltip: {
                show: true,
                formatter: function(params) {
                    const data = params.data;
                    return `${data.name}<br/>朝代: ${data.dynasty}<br/>相关诗词: ${data.poems.join(', ')}`;
                }
            },
            series: [{
                type: 'wordCloud',
                shape: 'circle',
                left: 'center',
                top: 'center',
                width: '90%',
                height: '90%',
                right: null,
                bottom: null,
                sizeRange: [12, 30],
                rotationRange: [-45, 45],
                rotationStep: 15,
                gridSize: 8,
                drawOutOfBound: false,
                textStyle: {
                    fontFamily: 'Ma Shan Zheng',
                    fontWeight: 'bold',
                    color: function(params) {
                        const colors = ['#B22222', '#2d5a3d', '#d4af37', '#666666'];
                        return colors[Math.floor(Math.random() * colors.length)];
                    }
                },
                emphasis: {
                    focus: 'self',
                    textStyle: {
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                },
                data: data
            }]
        };

        myChart.setOption(option);

        // 点击事件
        myChart.on('click', (params) => {
            this.showKeywordPoems(params.data);
        });

        // 响应式
        window.addEventListener('resize', () => {
            myChart.resize();
        });
    },

    showKeywordPoems(keywordData) {
        const poems = keywordData.poems;
        NotificationManager.show(`关键词"${keywordData.name}"相关诗词: ${poems.join(', ')}`, 'info', 5000);
        
        // 这里可以展开显示具体的诗词内容
        // 实现云雾散开的效果
        anime({
            targets: '#wordcloudContainer',
            scale: [1, 1.1, 1],
            duration: 600,
            easing: 'easeInOutQuad'
        });
    }
};

// 海报导出管理器
const PosterManager = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportModal();
        });

        document.getElementById('exportVerticalBtn').addEventListener('click', () => {
            this.generatePoster('vertical');
        });

        document.getElementById('exportHorizontalBtn').addEventListener('click', () => {
            this.generatePoster('horizontal');
        });

        document.getElementById('downloadPosterBtn').addEventListener('click', () => {
            this.downloadPoster();
        });

        document.getElementById('modalClose').addEventListener('click', () => {
            this.hideExportModal();
        });
    },

    showExportModal() {
        const modal = document.getElementById('exportModal');
        modal.classList.add('show');
        
        // 生成预览
        this.generatePreview();
    },

    hideExportModal() {
        const modal = document.getElementById('exportModal');
        modal.classList.remove('show');
    },

    generatePreview() {
        const preview = document.getElementById('posterPreview');
        const text = currentMode === 'free' 
            ? document.getElementById('creationText').value
            : document.getElementById('proCreationText').value;
        
        const penname = currentMode === 'free' 
            ? document.getElementById('penname').value
            : document.getElementById('proPenname').value;

        if (!text.trim()) {
            preview.innerHTML = '<div style="text-align: center; color: var(--gray);"><div style="font-size: 48px; margin-bottom: 10px;">📝</div><div>请输入诗句生成海报</div></div>';
            return;
        }

        // 创建海报预览
        const lines = text.split('\\n').filter(line => line.trim());
        const author = penname || '佚名';

        preview.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; background: var(--paper-white); position: relative;">
                <div style="font-size: 18px; line-height: 2; text-align: center; margin-bottom: 20px;">
                    ${lines.map(line => `<div>${line}</div>`).join('')}
                </div>
                <div style="font-size: 14px; color: var(--cinnabar-red);">—— ${author}</div>
                <div style="position: absolute; bottom: 10px; right: 10px; width: 30px; height: 30px; background: var(--cinnabar-red); border-radius: 2px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">偶</div>
            </div>
        `;
    },

    generatePoster(format) {
        NotificationManager.show(`正在生成${format === 'vertical' ? '竖排' : '横排'}海报...`, 'info');
        
        // 这里可以使用 html2canvas 生成海报
        setTimeout(() => {
            NotificationManager.show('海报生成完成，可以下载了', 'success');
        }, 1500);
    },

    downloadPoster() {
        const preview = document.getElementById('posterPreview');
        
        html2canvas(preview, {
            backgroundColor: null,
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `偶成诗词_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            NotificationManager.show('海报已下载', 'success');
            this.hideExportModal();
        }).catch(error => {
            console.error('海报生成失败:', error);
            NotificationManager.show('海报生成失败，请重试', 'error');
        });
    }
};

// 主应用
const App = {
    init() {
        this.initializeElements();
        this.setupEventListeners();
        this.initializeAnimations();
        this.loadSavedData();
        
        // 初始化各个管理器
        WordCloudManager.init();
        PosterManager.init();
    },

    initializeElements() {
        // 初始化模式
        this.toggleMode('free');
        
        // 初始化预览
        this.updatePreview();
        
        // 初始化背景
        BackgroundManager.setBackground('xuan');
        
        // 初始化图章
        SealManager.setSeal('default');
    },

    setupEventListeners() {
        // 模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.toggleMode(mode);
            });
        });

        // 预览切换
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preview = e.target.dataset.preview;
                this.togglePreview(preview);
            });
        });

        // 体裁切换
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const genre = e.target.dataset.genre;
                this.toggleGenre(genre);
            });
        });

        // 词牌选择
        document.querySelectorAll('.ci-pattern').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pattern = e.target.dataset.pattern;
                this.selectPattern(pattern);
            });
        });

        // 背景选择
        document.querySelectorAll('.background-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const bg = e.target.dataset.bg;
                BackgroundManager.setBackground(bg);
            });
        });

        // 图章选择
        document.querySelectorAll('.seal-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const seal = e.target.dataset.seal;
                SealManager.setSeal(seal);
            });
        });

        // AI生成图章
        document.getElementById('generateSealBtn').addEventListener('click', () => {
            SealManager.generateAISeal();
        });

        // 文本输入
        const textareas = document.querySelectorAll('.creation-textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', Utils.debounce(() => {
                this.updatePreview();
                this.generateAIComment();
            }, 500));
        });

        // 保存作品
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveWork();
        });

        // 清空重写
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });

        // 底部导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                if (href === '#create') {
                    document.getElementById('create').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    },

    toggleMode(mode) {
        currentMode = mode;
        
        // 更新按钮状态
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        // 显示/隐藏对应面板
        const freeCreation = document.querySelector('.free-creation');
        const proCreation = document.querySelector('.pro-creation');
        
        if (mode === 'free') {
            freeCreation.style.display = 'block';
            proCreation.style.display = 'none';
        } else {
            freeCreation.style.display = 'none';
            proCreation.style.display = 'block';
        }

        this.updatePreview();
    },

    togglePreview(preview) {
        currentPreview = preview;
        
        // 更新按钮状态
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-preview="${preview}"]`).classList.add('active');

        // 切换预览模式
        const verticalPreview = document.getElementById('verticalPreview');
        const horizontalPreview = document.getElementById('horizontalPreview');
        
        if (preview === 'vertical') {
            verticalPreview.classList.add('show');
            horizontalPreview.classList.remove('show');
        } else {
            verticalPreview.classList.remove('show');
            horizontalPreview.classList.add('show');
        }
    },

    toggleGenre(genre) {
        currentGenre = genre;
        
        // 更新按钮状态
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-genre="${genre}"]`).classList.add('active');

        // 显示/隐藏词牌选择
        const ciTypes = document.getElementById('ciTypes');
        if (genre === 'ci') {
            ciTypes.classList.add('show');
        } else {
            ciTypes.classList.remove('show');
            PatternManager.hidePattern();
        }
    },

    selectPattern(patternKey) {
        // 更新按钮状态
        document.querySelectorAll('.ci-pattern').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-pattern="${patternKey}"]`).classList.add('active');

        PatternManager.showPattern(patternKey);
    },

    updatePreview() {
        const text = currentMode === 'free' 
            ? document.getElementById('creationText').value
            : document.getElementById('proCreationText').value;
        
        const penname = currentMode === 'free' 
            ? document.getElementById('penname').value
            : document.getElementById('proPenname').value;
        
        const lines = text.split('\\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            lines.push('山光悦鸟性', '潭影空人心', '万籁此都寂', '但余钟磬音');
        }
        
        // 更新竖排预览
        const verticalPreview = document.getElementById('verticalPreview');
        verticalPreview.innerHTML = '';
        
        lines.forEach(line => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'line';
            lineDiv.textContent = line;
            verticalPreview.appendChild(lineDiv);
        });
        
        const authorDiv = document.createElement('div');
        authorDiv.className = 'poem-author';
        authorDiv.textContent = `—— ${penname || '佚名'}`;
        verticalPreview.appendChild(authorDiv);
        
        // 更新横排预览
        const horizontalPreview = document.getElementById('horizontalPreview');
        horizontalPreview.innerHTML = '';
        
        lines.forEach(line => {
            const lineDiv = document.createElement('div');
            lineDiv.textContent = line;
            horizontalPreview.appendChild(lineDiv);
        });
        
        const hAuthorDiv = document.createElement('div');
        hAuthorDiv.className = 'poem-author';
        hAuthorDiv.textContent = `—— ${penname || '佚名'}`;
        horizontalPreview.appendChild(hAuthorDiv);
    },

    generateAIComment() {
        const text = currentMode === 'free' 
            ? document.getElementById('creationText').value
            : document.getElementById('proCreationText').value;
        
        const aiCommentElement = currentMode === 'free' 
            ? document.getElementById('aiComment')
            : document.getElementById('proAiComment');
        
        if (text.trim()) {
            const comments = [
                "此诗格律工整，意境深远，颇有唐人风骨。",
                "词语清丽，情感真挚，如能加强意象层次更佳。",
                "起承转合自然流畅，末句余韵悠长。",
                "意境空灵，语言凝练，深得古典诗词精髓。",
                "情景交融，韵味十足，炼字上再下功夫必成大器。"
            ];
            const randomComment = comments[Math.floor(Math.random() * comments.length)];
            aiCommentElement.innerHTML = `<strong>AI点评：</strong>${randomComment}`;
        } else {
            aiCommentElement.innerHTML = `<strong>AI点评：</strong>请输入诗句，我将为您提供${currentMode === 'free' ? '雅致' : '格律分析和雅致'}点评...`;
        }
    },

    saveWork() {
        const work = {
            id: Utils.generateId(),
            title: currentMode === 'free' 
                ? document.getElementById('creationText').value.slice(0, 12)
                : document.getElementById('proCreationText').value.slice(0, 12),
            content: currentMode === 'free' 
                ? document.getElementById('creationText').value
                : document.getElementById('proCreationText').value,
            author: currentMode === 'free' 
                ? document.getElementById('penname').value
                : document.getElementById('proPenname').value,
            date: new Date().toISOString(),
            format: currentPreview,
            mode: currentMode,
            pattern: currentPattern,
            background: currentBackground,
            seal: currentSeal,
            thoughts: document.getElementById('thoughtsText').value
        };

        // 保存到本地存储
        const works = StorageManager.get('works', []);
        works.unshift(work);
        StorageManager.set('works', works);

        NotificationManager.show('作品已保存', 'success');
        
        // 动画反馈
        anime({
            targets: '#saveBtn',
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeInOutQuad'
        });
    },

    clearAll() {
        if (confirm('确定要清空所有内容吗？')) {
            // 清空所有输入框
            document.querySelectorAll('.creation-textarea, .control-input').forEach(input => {
                input.value = '';
            });

            // 重置AI点评
            this.generateAIComment();

            // 重置预览
            this.updatePreview();

            NotificationManager.show('已清空所有内容', 'info');
        }
    },

    loadSavedData() {
        // 加载保存的设置
        const settings = StorageManager.get('settings', {});
        if (settings.background) {
            BackgroundManager.setBackground(settings.background);
        }
        if (settings.seal) {
            SealManager.setSeal(settings.seal);
        }
    },

    initializeAnimations() {
        // 页面加载动画
        AnimationManager.fadeIn('.hero-title', { delay: 200 });
        AnimationManager.fadeIn('.hero-subtitle', { delay: 400 });
        AnimationManager.fadeIn('.hero-description', { delay: 600 });
        AnimationManager.fadeIn('.cta-button', { delay: 800 });

        // 内容交错动画
        setTimeout(() => {
            AnimationManager.stagger('.fade-in');
            AnimationManager.slideIn('.slide-in-left', 'left');
            AnimationManager.slideIn('.slide-in-right', 'right');
        }, 1000);
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 触摸手势支持
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;
    
    if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
            // 向上滑动
            document.getElementById('create').scrollIntoView({ behavior: 'smooth' });
        }
    }
}