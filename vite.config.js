import { defineConfig } from 'vite'
import injectHTML from 'vite-plugin-html-inject'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [
    injectHTML()
  ],
  build: {
    rollupOptions: {
      output: {
        // Настройка для JS файлов
        entryFileNames: 'js/script.js',
        chunkFileNames: 'js/[name].js',
        
        // Настройка для стилей (CSS) и статичных ассетов (изображений)
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];

          // Если это CSS файл
          if (extType === 'css') {
            return 'css/styles.css';
          }

          // Если это изображения (картинки, иконки, фавиконки)
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            // Проверяем, если структура путей уже заложена в имени (например из public)
            // и убираем дублирование папки img, если она уже есть в начале
            const relativePath = assetInfo.name.replace(/^img\//, '');
            return `img/${relativePath}`;
          }

          // Для всех остальных ассетов (шрифты и т.д.) по умолчанию
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  }
})