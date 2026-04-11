FROM node:22-alpine AS build

WORKDIR /usr/local/app

COPY ./ /usr/local/app

RUN npm ci

RUN npm run build-prod

FROM nginx:1.27-alpine

COPY --from=build /usr/local/app/dist/dispogramm /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
