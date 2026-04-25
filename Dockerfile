#====== Builder Stage ======
FROM node:22.9.0-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG MODE=dev
RUN npm run build -- --mode=$MODE

#====== Runner Stage ======
FROM nginx:alpine AS runner

COPY --from=build /app/dist /usr/share/nginx/html
ARG MODE=dev
COPY nginx.${MODE}.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]