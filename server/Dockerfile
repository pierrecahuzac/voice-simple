FROM node:22-alpine
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY shared ./shared
COPY server ./server
RUN npm install -g pnpm@10.33.0 && pnpm install --filter @voice-simple/server...
ENV PORT=6666
EXPOSE 6666
CMD ["pnpm", "--filter", "@voice-simple/server", "dev"]
