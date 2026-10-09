# Montaža Škerjanec Digital – slika za Docker (Synology Container Manager)
ARG BASE=node:22.22.0-bookworm-slim
FROM ${BASE}
ENV NODE_ENV=production TZ=Europe/Ljubljana MSD_DATA=/data PORT=8080
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY public ./public
COPY scripts ./scripts
COPY prototip/ceniki ./prototip/ceniki
VOLUME /data
EXPOSE 8080
HEALTHCHECK --interval=60s --timeout=5s CMD node -e "fetch('http://localhost:8080/api/session').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
USER node
CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.js"]
