/**
 * 偶成诗词创作工具 - 主要交互功能
 * 实现丰富的动画效果、用户交互和数据处理
 */

// 全局配置
const CONFIG = {
    ANIMATION_DURATION: 600,
    STAGGER_DELAY: 100,
    SCROLL_THRESHOLD: 0.1,
    DEBOUNCE_DELAY: 300
};

// 工具函数
const Utils = {
    // 防抖函数
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

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    },

    // 生成随机ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('复制失败:', err);
            return false;
        }
    },

    // 下载文件
    downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// 动画管理器
const AnimationManager = {
    // 淡入动画
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

    // 滑入动画
    slideIn(elements, direction = 'left', options = {}) {
        const defaults = {
            duration: CONFIG.ANIMATION_DURATION,
            delay: 0,
            easing: 'easeOutQuart'
        };
        const config = { ...defaults, ...options };

        const transform = direction === 'left' ? 
            { translateX: [-50, 0] } : 
            { translateX: [50, 0] };

        return anime({
            targets: elements,
            opacity: [0, 1],
            ...transform,
            duration: config.duration,
            delay: config.delay,
            easing: config.easing
        });
    },

    // 交错动画
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
    },

    // 缩放动画
    scale(elements, options = {}) {
        const defaults = {
            scale: [0.8, 1],
            duration: CONFIG.ANIMATION_DURATION,
            easing: 'easeOutBack'
        };
        const config = { ...defaults, ...options };

        return anime({
            targets: elements,
            opacity: [0, 1],
            scale: config.scale,
            duration: config.duration,
            easing: config.easing
        });
    },

    // 脉冲动画
    pulse(element, options = {}) {
        const defaults = {
            scale: [1, 1.05, 1],
            duration: 600,
            loop: 3,
            direction: 'alternate',
            easing: 'easeInOutSine'
        };
        const config = { ...defaults, ...options };

        return anime({
            targets: element,
            scale: config.scale,
            duration: config.duration,
            loop: config.loop,
            direction: config.direction,
            easing: config.easing
        });
    }
};

// 滚动观察器
const ScrollObserver = {
    observer: null,
    
    init() {
        const options = {
            threshold: CONFIG.SCROLL_THRESHOLD,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);

        // 观察所有需要动画的元素
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            this.observer.observe(el);
        });
    },

    animateElement(element) {
        if (element.classList.contains('fade-in')) {
            AnimationManager.fadeIn(element);
        } else if (element.classList.contains('slide-in-left')) {
            AnimationManager.slideIn(element, 'left');
        } else if (element.classList.contains('slide-in-right')) {
            AnimationManager.slideIn(element, 'right');
        }
        
        this.observer.unobserve(element);
    }
};

// 通知系统
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

        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: white;
            border-radius: 8px;
            padding: 16px 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.1);
            border-left: 4px solid ${this.getColor(type)};
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // 动画显示
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
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
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
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
    },

    getColor(type) {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }
};

// 本地存储管理器
const StorageManager = {
    prefix: 'oucheng_',

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
    },

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('删除失败:', error);
            return false;
        }
    },

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('清空失败:', error);
            return false;
        }
    }
};

// 主题管理器
const ThemeManager = {
    currentTheme: 'light',

    init() {
        this.currentTheme = StorageManager.get('theme', 'light');
        this.applyTheme(this.currentTheme);
    },

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        StorageManager.set('theme', this.currentTheme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // 触发主题变更事件
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme }
        }));
    }
};

// 性能监控
const PerformanceMonitor = {
    marks: new Map(),

    start(name) {
        this.marks.set(name, performance.now());
    },

    end(name) {
        const startTime = this.marks.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`${name}: ${duration.toFixed(2)}ms`);
            this.marks.delete(name);
            return duration;
        }
        return null;
    },

    measure(name, fn) {
        this.start(name);
        const result = fn();
        this.end(name);
        return result;
    }
};

// 错误处理
const ErrorHandler = {
    init() {
        window.addEventListener('error', (event) => {
            console.error('JavaScript错误:', event.error);
            this.logError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            this.logError(event.reason);
        });
    },

    logError(error) {
        // 在实际应用中，这里可以发送错误到监控服务
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('错误信息:', errorInfo);
        
        // 显示用户友好的错误消息
        NotificationManager.show(
            '发生了一个错误，请刷新页面重试',
            'error'
        );
    }
};

// 键盘快捷键管理器
const KeyboardManager = {
    shortcuts: new Map(),

    init() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
    },

    registerShortcut(key, callback, description = '') {
        this.shortcuts.set(key.toLowerCase(), {
            callback,
            description
        });
    },

    handleKeyPress(event) {
        // 忽略输入框中的快捷键
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = this.getKeyString(event);
        const shortcut = this.shortcuts.get(key);

        if (shortcut) {
            event.preventDefault();
            shortcut.callback(event);
        }
    },

    getKeyString(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        
        parts.push(event.key.toLowerCase());
        
        return parts.join('+');
    }
};

// 触摸手势管理器
const TouchManager = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    minSwipeDistance: 50,

    init() {
        document.addEventListener('touchstart', (event) => {
            this.startX = event.touches[0].clientX;
            this.startY = event.touches[0].clientY;
        });

        document.addEventListener('touchend', (event) => {
            this.endX = event.changedTouches[0].clientX;
            this.endY = event.changedTouches[0].clientY;
            this.handleSwipe();
        });
    },

    handleSwipe() {
        const deltaX = this.endX - this.startX;
        const deltaY = this.endY - this.startY;

        // 水平滑动
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
            if (deltaX > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        }
        // 垂直滑动
        else if (Math.abs(deltaY) > this.minSwipeDistance) {
            if (deltaY > 0) {
                this.onSwipeDown();
            } else {
                this.onSwipeUp();
            }
        }
    },

    onSwipeLeft() {
        document.dispatchEvent(new CustomEvent('swipeLeft'));
    },

    onSwipeRight() {
        document.dispatchEvent(new CustomEvent('swipeRight'));
    },

    onSwipeUp() {
        document.dispatchEvent(new CustomEvent('swipeUp'));
    },

    onSwipeDown() {
        document.dispatchEvent(new CustomEvent('swipeDown'));
    }
};

// 主应用初始化
const App = {
    init() {
        // 初始化各个管理器
        ErrorHandler.init();
        ScrollObserver.init();
        ThemeManager.init();
        KeyboardManager.init();
        TouchManager.init();

        // 注册常用快捷键
        this.registerShortcuts();

        // 初始化页面特定功能
        this.initPageFeatures();

        // 显示欢迎消息
        this.showWelcomeMessage();
    },

    registerShortcuts() {
        // Ctrl/Cmd + K: 搜索
        KeyboardManager.registerShortcut('ctrl+k', () => {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
                NotificationManager.show('快捷键：搜索', 'info', 1000);
            }
        }, '搜索');

        // Ctrl/Cmd + N: 新建作品
        KeyboardManager.registerShortcut('ctrl+n', () => {
            window.location.href = 'create.html';
        }, '新建作品');

        // Ctrl/Cmd + S: 保存
        KeyboardManager.registerShortcut('ctrl+s', (event) => {
            event.preventDefault();
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn) {
                saveBtn.click();
                NotificationManager.show('快捷键：保存', 'info', 1000);
            }
        }, '保存');

        // ESC: 关闭模态框
        KeyboardManager.registerShortcut('escape', () => {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                modal.classList.remove('show');
            });
        }, '关闭模态框');
    },

    initPageFeatures() {
        // 根据当前页面初始化特定功能
        const path = window.location.pathname;
        
        if (path.includes('create.html')) {
            this.initCreatePage();
        } else if (path.includes('works.html')) {
            this.initWorksPage();
        } else if (path.includes('classics.html')) {
            this.initClassicsPage();
        }
    },

    initCreatePage() {
        // 创作页面特定功能
        console.log('初始化创作页面功能');
    },

    initWorksPage() {
        // 作品管理页面特定功能
        console.log('初始化作品页面功能');
    },

    initClassicsPage() {
        // 经典赏读页面特定功能
        console.log('初始化赏读页面功能');
    },

    showWelcomeMessage() {
        // 只在首页显示欢迎消息
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            const hasVisited = StorageManager.get('hasVisited');
            if (!hasVisited) {
                setTimeout(() => {
                    NotificationManager.show('欢迎来到偶成诗词创作工具！', 'info', 5000);
                    StorageManager.set('hasVisited', true);
                }, 2000);
            }
        }
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 导出全局对象供其他脚本使用
window.OuCheng = {
    Utils,
    AnimationManager,
    NotificationManager,
    StorageManager,
    ThemeManager,
    PerformanceMonitor,
    KeyboardManager,
    TouchManager
};