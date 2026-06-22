FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p logs .session src/assets

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "index.js"]
