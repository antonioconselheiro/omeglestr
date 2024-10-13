FROM node:22 AS build

#wss://nostrnetl6yd5whkldj3vqsxyyaq3tkuspy23a3qgx7cdepb4564qgqd.onion
ENV NG_APP_RELAYS=wss://relay.nostr.net
ENV NG_APP_USE_HASH=0

WORKDIR /build
COPY . .
RUN npm install
RUN npm install -g @angular/cli
RUN ng build --configuration production --base-href=/

FROM nginx AS hoster

ENV LANG=C.UTF-8
ENV TZ=America/Sao_Paulo

COPY --from=build /build/docs /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD nginx -g 'daemon off;'