let chartInstance = null;

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.className = "fa-solid fa-sun text-primary";
    } else {
        html.classList.add('dark');
        icon.className = "fa-solid fa-moon text-primary";
    }
    if (chartInstance) calculateNewton();
}

function formatNum(num, decimals = 5) {
    // معالجة -0.00000 لتظهر 0.00000 بشكل نظيف
    const fixed = Number(num.toFixed(decimals));
    return (fixed === 0 ? 0 : fixed).toFixed(decimals);
}

function calculateNewton() {
    const fxStr = document.getElementById('fx-input').value;
    const dfxStrInput = document.getElementById('dfx-input').value.trim();
    const x0 = parseFloat(document.getElementById('x0-input').value);

    if (isNaN(x0)) {
        alert("يرجى إدخال تخمين أولي صحيح.");
        return;
    }

    try {
        const f = math.compile(fxStr);
        let df;
        if (dfxStrInput !== '') {
            df = math.compile(dfxStrInput);
        } else {
            const node = math.parse(fxStr);
            const derivNode = math.derivative(node, 'x');
            df = derivNode.compile();
        }

        let iterations = [];
        let xi = x0;
        const safetyLimit = 1000;
        const decimals = 5;

        for (let i = 0; i < safetyLimit; i++) {
            const fxi = f.evaluate({ x: xi });
            const dfxi = df.evaluate({ x: xi });

            if (!isFinite(fxi) || !isFinite(dfxi)) {
                alert("القيمة غير معرفة أو غير منتهية.");
                break;
            }

            if (dfxi === 0) {
                alert("المشتقة تساوي صفراً، تعذر إكمال الطريقة.");
                break;
            }

            const xNext = xi - (fxi / dfxi);

            iterations.push({
                i: i,
                xi: xi,
                fxi: fxi,
                dfxi: dfxi,
                xNext: xNext
            });

            // يتوقف التكرار عندما يصبح الناتج الحالي والناتج التالي متطابقين
            if (formatNum(xNext, decimals) === formatNum(xi, decimals)) {
                iterations.push({
                    i: i + 1,
                    xi: xNext,
                    fxi: f.evaluate({ x: xNext }),
                    dfxi: df.evaluate({ x: xNext }),
                    xNext: xNext
                });
                xi = xNext;
                break;
            }

            xi = xNext;
        }

        // عرض النتيجة النهائية
        document.getElementById('result-summary').classList.remove('hidden');
        document.getElementById('root-output').innerText = formatNum(xi, 6);

        // عرض جميع خطوات التكرار حتى توقفها عند تطابق آخر ناتجين
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        iterations.forEach(row => {
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td class="py-3 px-4 font-semibold">${row.i}</td>
                    <td class="py-3 px-4">${formatNum(row.xi, decimals)}</td>
                    <td class="py-3 px-4">${formatNum(row.fxi, decimals)}</td>
                    <td class="py-3 px-4">${formatNum(row.dfxi, decimals)}</td>
                </tr>
            `;
        });

        // رسم المخطط البياني
        plotGraph(f, x0, xi);

    } catch (err) {
        console.error(err);
        alert("تأكد من صحة كتابة الدالة الرياضية.");
    }
}

function plotGraph(f, xStart, xFinal) {
    const ctx = document.getElementById('functionChart').getContext('2d');
    
    let minX = Math.min(xStart, xFinal) - 2;
    let maxX = Math.max(xStart, xFinal) + 2;
    let step = (maxX - minX) / 100;
    
    let funcPoints = [];
    for (let x = minX; x <= maxX; x += step) {
        try {
            let y = f.evaluate({ x: x });
            if (isFinite(y)) {
                funcPoints.push({ x: x, y: y });
            }
        } catch (e) {}
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#4b5563';

    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'f(x)',
                    data: funcPoints,
                    showLine: true,
                    borderColor: '#0984e3',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 0
                },
                {
                    label: 'تقدير الجذر',
                    data: [{ x: xFinal, y: 0 }],
                    backgroundColor: '#00f2fe',
                    borderColor: '#ffffff',
                    pointRadius: 6,
                    pointHoverRadius: 8
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
                    ticks: { color: textColor }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                }
            },
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            }
        }
    });
}

window.onload = () => {
    calculateNewton();
};