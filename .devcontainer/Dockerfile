FROM node:20

RUN npm install husky eslint typescript @angular/cli @compodoc/compodoc sass-lint sassdoc -g

RUN apt update && apt install -y curl python && rm -rf /var/lib/apt/lists/*

# Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose

WORKDIR /omegle-nostr

COPY ./.gitconfig /root/.gitconfig
COPY ./.ssh /root/.ssh
RUN chmod 600 -R /root/.ssh

ENV LANG C.UTF-8
ENV TZ America/Sao_Paulo

EXPOSE 9229
EXPOSE 4200

# The run the start script
CMD [ "/bin/bash" ]
