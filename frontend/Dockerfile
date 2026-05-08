# === Сборка Vue-приложения ===
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Копируем исходный код
COPY . .

# Собираем 
RUN npm run build:docker

# === Nginx для раздачи статики ===
FROM nginx:alpine

# Копируем конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный фронтенд (Vite сбор в /app/dist)
COPY --from=builder /app/dist /usr/share/nginx/html

# Экспонируем порт
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]