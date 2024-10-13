FROM node:22 AS build

ENV NG_APP_PROD=1
ENV NG_APP_RELAYS=wss://nos.lol,wss://nostr.mom
ENV NG_APP_USE_HASH=0

WORKDIR /build
COPY . .
RUN npm install
RUN npm install -g @angular/cli
RUN ng build --production

FROM nginx AS hoster

ENV LANG=C.UTF-8
ENV TZ=America/Sao_Paulo

COPY --from=build /build/docs /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT [ "nginx", "-g", "'daemon", "off;'" ]