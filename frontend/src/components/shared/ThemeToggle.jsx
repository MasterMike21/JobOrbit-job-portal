import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
        >
            {theme === "light" ? (
                <Moon className="h-4 w-4 text-gray-700" />
            ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
            )}
        </Button>
    );
};

export default ThemeToggle;