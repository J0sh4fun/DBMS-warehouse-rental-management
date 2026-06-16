FROM node:20-alpine
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Copy các file quản lý thư viện
COPY package.json package-lock.json* ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000

# Khởi chạy Next.js
CMD ["npm", "start"]
