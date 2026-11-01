FROM node:24 AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev
ENV PORT=501
USER node
EXPOSE 501
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
