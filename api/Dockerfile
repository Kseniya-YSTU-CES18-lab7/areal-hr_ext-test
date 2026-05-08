# === Этап 1: Сборка ===
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Копируем исходный код
COPY . .

# Собираем проект и ПОКАЗЫВАЕМ ВЫВОД
RUN npm run build 2>&1 | tee /tmp/build.log

# Показываем, что создалось в dist/
RUN echo "=== FILES IN /app/dist ===" && find /app/dist -type f -name "*.js" | head -20 && echo "=== END ==="

# Проверяем, есть ли main.js
RUN if [ -f /app/dist/main.js ]; then echo "✅ main.js FOUND"; else echo "❌ main.js NOT FOUND"; fi

# === Этап 2: Продакшен-образ ===
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и ставим только продакшен-зависимости
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps --ignore-scripts

# Копируем собранный код из builder
COPY --from=builder /app/dist ./dist

# Ещё раз проверяем в финальном образе
RUN echo "=== FILES IN FINAL /app/dist ===" && find /app/dist -type f -name "*.js" | head -20 && echo "=== END ==="
RUN if [ -f /app/dist/main.js ]; then echo "✅ main.js FOUND in final image"; else echo "❌ main.js NOT FOUND in final image"; fi

# Создаём пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["node", "/app/dist/main.js"]