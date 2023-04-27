#Build image
FROM node:18.13.0-alpine As builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-ssr:dev
WORKDIR /usr/src/app/server
RUN rm -rf package-lock.json
RUN npm cache clean -force
RUN npm install
RUN npm run build

#Final image
FROM node:18.13.0-alpine
RUN npm install -g pm2@latest
WORKDIR /app
COPY --from=builder /usr/src/app/dist/ /app/dist/
COPY --from=builder /usr/src/app/server/dist/ /app/dist/server
COPY --from=builder /usr/src/app/server/node_modules/ /app/dist/server/node_modules
CMD npm run serve:bff
