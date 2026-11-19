let currentLang = 'ar';
let chartInstance = null;
let lastStepsCount = 0;

const translations = {
    ar: {
        title: "حاسبة نيوتن-رافسون",
        subtitle: "حل سريع وذكي للجذور العددية",
        langBtn: "English",
        settingsTitle: "إعدادات المعادلة",
        lblFx: "الدالة f(x):",
        phFx: "مثال: x^3 - 4*x - 9",
        lblDfx: "المشتقة f'(x) (اختياري):",
        phDfx: "تُحسب تلقائياً",
        lblX0: "القيمة الأولية (x₀):",
        phX0: "مثال: 2",
        btnCalc: "احسب الآن",
        lblRootFound: "الجذر النهائي (عند تطابق آخر ناتجين):",
        lblChartTitle: "الرسم البياني للدالة والجذر",
        lblTableTitle: "جدول خطوات التكرار",
        thIter: "الخطوة (i)",
        thXi: "xᵢ",
        thFXi: "f(xᵢ)",
        thDFXi: "f'(xᵢ)",
        chartFuncLabel: "منحنى الدالة f(x)",
        chartRootLabel: "الجذر التقريبي",
        rowsCount: (n) => `إجمالي الخطوات: ${n}`,
        alertInvalidInput: "يرجى إدخال معادلة صحيحة وقيمة أولية مناسبة.",
        alertZeroDeriv: "المشتقة تساوي صفراً، تعذر إكمال الحساب.",
        alertUndefined: "ظهرت قيمة غير معرفة أثناء التكرار.",
        alertSyntax: "تأكد من كتابة صيغة الدالة بشكل صحيح."
    },
    en: {
        title: "Newton-Raphson Studio",
        subtitle: "Fast & Smart Numerical Root Finder",
        langBtn: "عربي",
        settingsTitle: "Equation Settings",
        lblFx: "Function f(x):",
        phFx: "e.g. x^3 - 4*x - 9",
        lblDfx: "Derivative f'(x) (Optional):",
        phDfx: "Auto-computed",
        lblX0: "Initial Guess (x₀):",
        phX0: "e.g. 2",
        btnCalc: "Solve Now",
        lblRootFound: "Final Root (Matched Last Two Results):",
        lblChartTitle: "Function Curve & Root",
        lblTableTitle: "Iterations Table",
        thIter: "Step (i)",
        thXi: "xᵢ",
        thFXi: "f(xᵢ)",
        thDFXi: "f'(xᵢ)",
        chartFuncLabel: "Function f(x)",
        chartRootLabel: "Approximate Root",
        rowsCount: (n) => `Total Steps: ${n}`,
        alertInvalidInput: "Please enter a valid function and initial guess.",
        alertZeroDeriv: "Derivative is zero. Method cannot continue.",
        alertUndefined: "Undefined value encountered during iteration.",
        alertSyntax: "Please check the mathematical syntax of your function."
    }
};

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    const isAr = currentLang === 'ar';
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLang);

    const t = translations[currentLang];
    document.getElementById('app-title').innerText = t.title;
    document.getElementById('app-subtitle').innerText = t.subtitle;
    document.getElementById('lang-btn-text').innerText = t.langBtn;
    document.getElementById('settings-title').innerHTML = `<i class="fa-solid fa-sliders text-rose-400"></i><span>${t.settingsTitle}</span>`;
    document.getElementById('lbl-fx').innerText = t.lblFx;
    document.getElementById('fx-input').placeholder = t.phFx;
    document.getElementById('lbl-dfx').innerText = t.lblDfx;
    document.getElementById('dfx-input').placeholder = t.phDfx;
    document.getElementById('lbl-x0').innerText = t.lblX0;
    document.getElementById('x0-input').placeholder = t.phX0;
    document.getElementById('btn-calc').innerHTML = `<i class="fa-solid fa-play"></i><span>${t.btnCalc}</span>`;
    document.getElementById('lbl-root-found').innerText = t.lblRootFound;

    document.getElementById('lbl-chart-title').innerHTML = `
        <span class="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center text-sm">
            <i class="fa-solid fa-chart-line"></i>
        </span>
        <span>${t.lblChartTitle}</span>
    `;

    document.getElementById('lbl-table-title').innerHTML = `
        <span class="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-300 flex items-center justify-center text-sm">
            <i class="fa-solid fa-table-list"></i>
        </span>
        <span>${t.lblTableTitle}</span>
    `;

    const tableElem = document.querySelector('table');
    tableElem.classList.toggle('text-right', isAr);
    tableElem.classList.toggle('text-left', !isAr);

    document.getElementById('table-header').innerHTML = `
        <th class="py-3.5 px-4 ${isAr ? 'rounded-tr-xl' : 'rounded-tl-xl'}">${t.thIter}</th>
        <th class="py-3.5 px-4">${t.thXi}</th>
        <th class="py-3.5 px-4">${t.thFXi}</th>
        <th class="py-3.5 px-4 ${isAr ? 'rounded-tl-xl' : 'rounded-tr-xl'}">${t.thDFXi}</th>
    `;

    if (lastStepsCount > 0) {
        document.getElementById('iter-count-badge').innerText = t.rowsCount(lastStepsCount);
    }

    const fxEl = document.getElementById('fx-input');
    const x0El = document.getElementById('x0-input');
    if (fxEl.value.trim() && !isNaN(parseFloat(x0El.value))) {
        calculateNewton();
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const cards = document.querySelectorAll('section');

    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        document.body.className = "bg-rose-50/60 text-slate-900 min-h-screen transition-colors duration-300 relative overflow-x-hidden";
        icon.className = "fa-solid fa-moon text-slate-700";
        cards.forEach(c => {
            if (c.id !== 'result-summary') {
                c.classList.remove('bg-[#111827]/90', 'border-slate-800');
                c.classList.add('bg-white', 'border-rose-100');
            }
        });
    } else {
        html.classList.add('dark');
        document.body.className = "bg-[#090d16] text-slate-100 min-h-screen transition-colors duration-300 relative overflow-x-hidden";
        icon.className = "fa-solid fa-sun text-amber-300";
        cards.forEach(c => {
            if (c.id !== 'result-summary') {
                c.classList.add('bg-[#111827]/90', 'border-slate-800');
                c.classList.remove('bg-white', 'border-rose-100');
            }
        });
    }
    if (chartInstance) calculateNewton();
}

function formatNum(num, decimals = 5) {
    const rounded = Number(num.toFixed(decimals));
    return (rounded === 0 ? 0 : rounded).toFixed(decimals);
}

function calculateNewton() {
    const t = translations[currentLang];
    const fxStr = document.getElementById('fx-input').value.trim();
    const dfxStr = document.getElementById('dfx-input').value.trim();
    const x0 = parseFloat(document.getElementById('x0-input').value);

    if (!fxStr || isNaN(x0)) {
        alert(t.alertInvalidInput);
        return;
    }

    try {
        const compiledF = math.compile(fxStr);
        const compiledDF = dfxStr
            ? math.compile(dfxStr)
            : math.derivative(math.parse(fxStr), 'x').compile();

        const steps = [];
        let currentX = x0;
        const decimals = 5;
        const maxSteps = 1000;

        for (let i = 0; i < maxSteps; i++) {
            const fxVal = compiledF.evaluate({ x: currentX });
            const dfxVal = compiledDF.evaluate({ x: currentX });

            if (!isFinite(fxVal) || !isFinite(dfxVal)) {
                alert(t.alertUndefined);
                break;
            }

            if (dfxVal === 0) {
                alert(t.alertZeroDeriv);
                break;
            }

            const nextX = currentX - (fxVal / dfxVal);

            steps.push({
                index: i,
                x: currentX,
                fx: fxVal,
                dfx: dfxVal
            });

            // يتوقف التكرار عندما يصبح آخر ناتجين متطابقين
            if (formatNum(nextX, decimals) === formatNum(currentX, decimals)) {
                steps.push({
                    index: i + 1,
                    x: nextX,
                    fx: compiledF.evaluate({ x: nextX }),
                    dfx: compiledDF.evaluate({ x: nextX })
                });
                currentX = nextX;
                break;
            }

            currentX = nextX;
        }

        lastStepsCount = steps.length;

        const summaryEl = document.getElementById('result-summary');
        summaryEl.classList.remove('hidden');
        document.getElementById('root-output').innerText = formatNum(currentX, 6);
        document.getElementById('iter-count-badge').innerText = t.rowsCount(steps.length);

        const isDark = document.documentElement.classList.contains('dark');
        const tbody = document.getElementById('table-body');

        tbody.innerHTML = steps.map((item, idx) => {
            const isLastTwo = idx >= steps.length - 2;
            const rowStyle = isLastTwo
                ? (isDark ? "bg-cyan-500/15 text-lime-300 font-bold" : "bg-cyan-100 text-slate-900 font-bold")
                : (isDark ? "hover:bg-slate-800/50 text-slate-200" : "hover:bg-rose-50/70 text-slate-800");

            return `
                <tr class="${rowStyle} transition">
                    <td class="py-3 px-4">${item.index}</td>
                    <td class="py-3 px-4">${formatNum(item.x, decimals)}</td>
                    <td class="py-3 px-4">${formatNum(item.fx, decimals)}</td>
                    <td class="py-3 px-4">${formatNum(item.dfx, decimals)}</td>
                </tr>
            `;
        }).join('');

        drawCurve(compiledF, x0, currentX);

    } catch (error) {
        console.error(error);
        alert(t.alertSyntax);
    }
}

function drawCurve(compiledF, startX, rootX) {
    const t = translations[currentLang];
    const canvas = document.getElementById('functionChart');
    const ctx = canvas.getContext('2d');

    const minX = Math.min(startX, rootX) - 2.5;
    const maxX = Math.max(startX, rootX) + 2.5;
    const delta = (maxX - minX) / 150;

    const curveData = [];
    for (let x = minX; x <= maxX; x += delta) {
        try {
            const y = compiledF.evaluate({ x });
            if (isFinite(y)) curveData.push({ x, y });
        } catch (_) {}
    }

    if (chartInstance) chartInstance.destroy();

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.08)';
    const labelColor = isDark ? '#cbd5e1' : '#334155';

    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: t.chartFuncLabel,
                    data: curveData,
                    showLine: true,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.12)',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.25
                },
                {
                    label: t.chartRootLabel,
                    data: [{ x: rootX, y: 0 }],
                    backgroundColor: '#ff4d6d',
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    grid: { color: gridColor },
                    ticks: { color: labelColor, font: { size: 12 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: labelColor, font: { size: 12 } }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: labelColor,
                        font: { size: 13, weight: 'bold' }
                    }
                }
            }
        }
    });
}