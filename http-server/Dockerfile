FROM node:22.23-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npx prisma migrate
RUN npm run build
RUN npm prune --omit=dev
ENV PORT=501
USER node
CMD ["node", "dist/main.js"]


