import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="relative overflow-hidden"
      >
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === 'dark' ? 180 : 0,
            scale: theme === 'dark' ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="h-4 w-4" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === 'light' ? -180 : 0,
            scale: theme === 'light' ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="h-4 w-4" />
        </motion.div>
      </Button>
    </motion.div>
  );
}