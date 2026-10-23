FROM node:22-alpine
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY shared ./shared
COPY client ./client
RUN npm install -g pnpm@10.33.0 && pnpm install --filter @voice-simple/client...
ENV PORT=5273
EXPOSE 5273
CMD ["pnpm", "--filter", "@voice-simple/client", "exec", "vite", "--host", "0.0.0.0", "--port", "5273"]
