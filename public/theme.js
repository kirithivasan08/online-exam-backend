(function() {
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateToggleSwitch(theme);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    function updateToggleSwitch(theme) {
        // Wait for DOM to be ready if called during script evaluation
        const setToggle = () => {
            const toggles = document.querySelectorAll('.theme-toggle-input');
            toggles.forEach(toggle => {
                toggle.checked = theme === 'dark';
            });
        };
        document.addEventListener("DOMContentLoaded", setToggle);
        setToggle();
    }

    window.toggleTheme = toggleTheme;

    // Run init immediately on script execution to avoid FOUC
    initTheme();

    document.addEventListener("DOMContentLoaded", () => {
        const toggles = document.querySelectorAll('.theme-toggle-input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', toggleTheme);
        });
    });
})();
