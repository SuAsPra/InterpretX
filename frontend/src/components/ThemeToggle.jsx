import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="theme-toggle"
    >
      <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'}</span>
      <span className={`theme-toggle__track ${isDark ? 'is-dark' : ''}`}>
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
};

export default ThemeToggle;
