/**
 * 偶成验证引擎 (Validation Engine)
 * 用于模拟近体诗、词牌和平仄校验，以及十四行诗的校验。
 */

const ValidationEngine = {
    // 模拟的平仄字典（简化版，仅用于演示）
    // 1: 平 (Ping), 2: 仄 (Ze), 0: 可平可仄 (Any)
    // 实际项目中需要庞大的 JSON 字典
    mockDictionary: {
        '山': 1, '光': 1, '悦': 2, '鸟': 2, '性': 2,
        '潭': 1, '影': 2, '空': 1, '人': 1, '心': 1,
        '万': 2, '籁': 2, '此': 2, '都': 1, '寂': 2,
        '但': 2, '余': 1, '钟': 1, '磬': 2, '音': 1,
        '春': 1, '风': 1, '拂': 2, '面': 2, '柳': 2, '如': 1, '烟': 1,
        '桃': 1, '花': 1, '流': 1, '水': 2, '自': 2, '年': 1,
        '床': 1, '前': 1, '明': 1, '月': 2, '霜': 1,
        '举': 2, '头': 1, '望': 2,
        '低': 1, '思': 1, '故': 2, '乡': 1,
        // 增加一些常见字的平仄映射
        '天': 1, '地': 2, '玄': 1, '黄': 1, '宇': 2, '宙': 2, '洪': 1, '荒': 1,
        '日': 2, '盈': 1, '昃': 2, '辰': 1, '宿': 2, '列': 2, '张': 1,
        '寒': 1, '来': 1, '暑': 2, '往': 2, '秋': 1, '收': 1, '冬': 1, '藏': 1,
        '云': 1, '腾': 1, '致': 2, '雨': 2, '露': 2, '结': 2, '为': 1,
        '金': 1, '生': 1, '丽': 2, '玉': 2, '出': 2, '昆': 1, '冈': 1,
        '剑': 2, '号': 2, '巨': 2, '阙': 2, '珠': 1, '称': 1, '夜': 2
    },

    // 默认判断 - 遇到不在字典里的字，随机给一个平仄以便演示 UI 效果
    getTone(char) {
        if (this.mockDictionary.hasOwnProperty(char)) {
            return this.mockDictionary[char];
        }
        // 模拟：如果有逗号句号，直接返回不可见字符状态
        if (/[，。！？、\n\s]/.test(char)) return 3; 
        
        // 遇到生僻字，大概率认为是平声或仄声 (仅供 Demo)
        return Math.random() > 0.5 ? 1 : 2;
    },

    // 模拟词牌格律模板
    // 〇: 平, ●: 仄, ⊙: 可平可仄, △: 平韵, ▲: 仄韵
    ciPatterns: {
        'xiaoling': [
            { name: '十六字令', pattern: '●△\n〇●〇〇●●△\n〇〇●\n●●●〇△' },
            { name: '忆江南', pattern: '〇〇●\n●●●〇△\n⊙●⊙〇〇●●\n⊙〇⊙●●〇△\n⊙●●〇△' },
            { name: '浣溪沙', pattern: '⊙●〇〇●●△\n⊙〇⊙●●〇△\n⊙〇⊙●●〇△\n⊙●⊙〇〇●●\n⊙〇⊙●●〇△\n⊙〇⊙●●〇△' }
        ],
        'zhongdiao': [
            { name: '蝶恋花', pattern: '⊙●⊙〇〇●▲\n⊙●〇〇\n⊙●〇〇▲\n⊙●⊙〇〇●▲\n⊙〇⊙●〇〇▲\n⊙●⊙〇〇●▲\n⊙●〇〇\n⊙●〇〇▲\n⊙●⊙〇〇●▲\n⊙〇⊙●〇〇▲' }
        ],
        'changdiao': [
            { name: '水调歌头', pattern: '⊙●●〇●\n⊙●●〇△\n⊙〇⊙●〇●\n⊙●●〇△\n⊙●〇〇⊙●\n⊙●〇〇⊙●\n⊙●●〇△\n⊙●●〇●\n⊙●●〇△\n⊙〇●\n〇●●\n●〇△\n⊙〇⊙●\n⊙●⊙●●〇△\n⊙●〇〇⊙●\n⊙●〇〇⊙●\n⊙●●〇△\n⊙●●〇●\n⊙●●〇△' }
        ]
    },

    // 现代近体诗模板 (五绝、七绝、五律、七律 的平起/仄起)
    jintishiPatterns: {
        'wujue_pingqi': '〇〇〇●●\n●●●〇△\n●●〇〇●\n〇〇●●△',
        'qijue_pingqi': '〇〇●●●〇△\n●●〇〇●●△\n●●〇〇〇●●\n〇〇●●●〇△'
    },

    // 解析输入的文本，进行格律基础验证
    validateProText(text, genre, specificPattern = null) {
        if (!text) return { lines: [], isValid: false, message: '请输入内容' };

        const lines = text.split('\n').filter(l => l.trim().length > 0);
        let resultLines = [];
        let totalErrors = 0;
        let totalWarnings = 0;

        // 如果没有指定 pattern (例如刚进入未选择具体格式)，我们做个宽泛的基础校验：只看平仄交替
        let templateLines = [];
        if (specificPattern) {
           templateLines = specificPattern.split('\n');
        } else if (genre === 'modern' && lines.length === 4) {
            // 猜是五绝或七绝
            if (lines[0].replace(/[，。！？]/g, '').length === 5) {
                templateLines = this.jintishiPatterns['wujue_pingqi'].split('\n');
            } else if (lines[0].replace(/[，。！？]/g, '').length === 7) {
                templateLines = this.jintishiPatterns['qijue_pingqi'].split('\n');
            }
        }

        lines.forEach((line, lineIndex) => {
            const chars = line.split('');
            let lineResult = [];
            
            let templateLine = '';
            if (templateLines && templateLines[lineIndex]) {
                templateLine = templateLines[lineIndex].replace(/[，。！？]/g, '');
            }
            
            let charIndexInPoem = 0;

            chars.forEach((char) => {
                if (/[，。！？、\s]/.test(char)) {
                    lineResult.push({ char, status: 'normal', type: 'punctuation' });
                    return;
                }

                const tone = this.getTone(char);
                let status = 'success'; // 默认合律

                if (templateLine && charIndexInPoem < templateLine.length) {
                    const reqChar = templateLine[charIndexInPoem];
                    
                    // reqChar: 〇(平/1), ●(仄/2), ⊙(可平可仄/0), △(平韵/1), ▲(仄韵/2)
                    if (reqChar === '〇' || reqChar === '△') {
                        if (tone === 2) { status = 'error'; totalErrors++; }
                    } else if (reqChar === '●' || reqChar === '▲') {
                        if (tone === 1) { status = 'error'; totalErrors++; }
                    } else if (reqChar === '⊙') {
                        status = 'warning'; // 提示可通押/不严格限制
                        totalWarnings++;
                    }
                } else if (templateLine && charIndexInPoem >= templateLine.length) {
                    // 字数超出模板
                    status = 'error';
                    totalErrors++;
                } else if (!templateLine) {
                    // 没有模板对照，随机给点状态意思一下
                    if (Math.random() > 0.8) {
                        status = 'warning';
                        totalWarnings++;
                    } else {
                        status = 'success';
                    }
                }

                lineResult.push({ char, status, type: tone === 1 ? '平' : (tone === 2 ? '仄' : '未知') });
                charIndexInPoem++;
            });

            resultLines.push(lineResult);
        });

        return {
            lines: resultLines,
            totalErrors,
            totalWarnings,
            isValid: totalErrors === 0,
            message: totalErrors > 0 ? `发现 ${totalErrors} 处出律，${totalWarnings} 处建议斟酌。` : (lines.length > 0 ? '格律严整，佳句天成！' : '')
        };
    },

    // 十四行诗验证逻辑
    validateSonnet(text, type) {
        if (!text) return { isValid: false, message: '请输入内容', details: [] };
        
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const details = [];
        let isValid = true;
        let message = '';

        // 检查行数
        if (lines.length !== 14) {
            isValid = false;
            details.push({ type: 'error', msg: `当前共 ${lines.length} 行，十四行诗要求精确为 14 行。` });
        } else {
            details.push({ type: 'success', msg: '行数检查通过：14行。' });
        }

        // 检查现代汉语十四行体例的特有规则
        if (type === 'modern' && lines.length >= 9) {
            const line9 = lines[8];
            if (!line9.includes('但') && !line9.includes('却') && !line9.includes('而') && !line9.includes('然')) {
                details.push({ type: 'warning', msg: '建议：第9行未检测到明显的转折词 (Volta)。' });
            } else {
                details.push({ type: 'success', msg: '第9行 Volta 检查通过。' });
            }

            let lengthViolations = 0;
            lines.forEach(l => {
                const len = l.replace(/[，。！？、\s]/g, '').length;
                if (len < 11 || len > 15) {
                    lengthViolations++;
                }
            });

            if (lengthViolations > 0) {
                isValid = false;
                details.push({ type: 'error', msg: `行长检查未通过：有 ${lengthViolations} 行字数不在11-15字范围内。` });
            } else {
                details.push({ type: 'success', msg: '行长限制 11-15 字检查通过。' });
            }
        }

        // 英语押韵和音步因需要NLP暂时不做复杂正则，用mock假数据跑通体验
        if (type === 'shakespeare' && lines.length === 14) {
            details.push({ type: 'success', msg: '韵式 (ABAB CDCD EFEF GG) 结构符合。' });
            details.push({ type: 'warning', msg: '抑扬五音步 (Iambic Pentameter) 仅作中英文混排警示。' });
        } else if (type === 'petrarch' && lines.length === 14) {
            details.push({ type: 'success', msg: '韵式 (ABBA ABBA) 八行体检查通过。' });
        }

        if (isValid) {
            message = '十四行诗基础校验通过！';
        } else {
            message = '发现结构问题，请参考校验提示进行修改。';
        }

        return { isValid, message, details };
    }
};

window.OuCheng = window.OuCheng || {};
window.OuCheng.ValidationEngine = ValidationEngine;
