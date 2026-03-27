const fs = require('fs');

const cssPath = 'd:/online-exam-backend/public/style.css';
let content = fs.readFileSync(cssPath);

// Convert to string to find the valid end
// The file should cleanly end after the last badge rule:
// .custom-table td .badge {
//     box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
// }

const anchor = `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);\n}`;
const anchor2 = `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);\r\n}`;

const text = content.toString('utf8');
let splitIdx = text.lastIndexOf(anchor);
if (splitIdx === -1) splitIdx = text.lastIndexOf(anchor2);

if (splitIdx !== -1) {
    const validEndIdx = splitIdx + (text.includes(anchor2) ? anchor2.length : anchor.length);
    const validPart = text.substring(0, validEndIdx);

    const darkModeCss = `

/* Dark Mode Variables and Overrides */
[data-theme='dark'] {
    --primary: #818cf8;
    --primary-hover: #a5b4fc;
    --secondary: #94a3b8;
    --success: #4ade80;
    --danger: #f87171;
    --warning: #fbbf24;
    --background: #0f172a;
    --surface: #1e293b;
    --text: #f1f5f9;
    --text-muted: #94a3b8;
    --border: #334155;
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5);
}

[data-theme='dark'] .alert-success { background-color: rgba(34, 197, 94, 0.2); color: #4ade80; border-color: rgba(34, 197, 94, 0.3); }
[data-theme='dark'] .alert-error { background-color: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.3); }

[data-theme='dark'] .btn-ghost:hover { background: var(--surface); color: var(--primary); border: 1px solid var(--border); }
[data-theme='dark'] .btn-ghost.text-warning:hover { background: rgba(245, 158, 11, 0.1); }
[data-theme='dark'] .btn-ghost.text-danger:hover { background: rgba(239, 68, 68, 0.1); }
[data-theme='dark'] .btn-ghost.text-primary:hover { background: rgba(99, 102, 241, 0.1); }

[data-theme='dark'] .badge-blue { background: rgba(79, 70, 229, 0.2); color: #a5b4fc; }
[data-theme='dark'] .badge-green { background: rgba(34, 197, 94, 0.2); color: #86efac; }
[data-theme='dark'] .badge-yellow { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }

[data-theme='dark'] .timer-box { background: var(--surface); border: 1px solid var(--primary); }
[data-theme='dark'] .q-nav-btn { background: var(--surface); border-color: var(--border); }
[data-theme='dark'] .q-nav-btn:hover { background: var(--border); }
[data-theme='dark'] .q-nav-btn.active { background: rgba(79, 70, 229, 0.2); color: var(--primary); }
[data-theme='dark'] .q-nav-btn.answered { background: var(--success); color: #1e293b; }
[data-theme='dark'] .q-nav-btn.review { background: var(--warning); color: #1e293b; }

[data-theme='dark'] .option-label:hover { background: var(--background); }
[data-theme='dark'] .option-label.selected { background: rgba(79, 70, 229, 0.2); }

[data-theme='dark'] .custom-table tbody tr:hover { background-color: var(--border); }
[data-theme='dark'] .custom-table tbody tr:nth-child(even) { background-color: rgba(255, 255, 255, 0.02); }

[data-theme='dark'] .bg-gray-50, [data-theme='dark'] body { background-color: var(--background) !important; color: var(--text) !important; }
[data-theme='dark'] .bg-white { background-color: var(--surface) !important; color: var(--text) !important; }
[data-theme='dark'] .text-slate-900 { color: var(--text) !important; }
[data-theme='dark'] .bg-indigo-100 { background-color: rgba(99, 102, 241, 0.2) !important; }
[data-theme='dark'] .bg-emerald-100 { background-color: rgba(16, 185, 129, 0.2) !important; }
[data-theme='dark'] .border-t { border-color: var(--border); }
`;
    // Overwrite the file with the clean part + the dark mode css
    fs.writeFileSync(cssPath, validPart + darkModeCss, 'utf8');
    console.log("Fixed CSS file!");
} else {
    console.log("Anchor not found in the file.");
}
