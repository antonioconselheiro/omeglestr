FROM node:20

# Including jq to filter json
RUN apt update
RUN apt install -y jq
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# Installing nak, the nostr army knife
RUN wget https://github.com/fiatjaf/nak/releases/download/v0.1.13/nak-v0.1.13-linux-amd64
RUN mv nak-v0.1.13-linux-amd64 /usr/bin/nak
RUN chmod +x /usr/bin/nak

# Installing client dependencies
RUN npm install typescript @angular/cli -g

# Credentials
COPY ./.gitconfig /root/.gitconfig
COPY ./.ssh /root/.ssh
RUN chmod 600 -R /root/.ssh
RUN ssh-add -D && ssh-add /root/.ssh/id_ed25519 || true

WORKDIR /omegle-nostr

# Brazilian time and keyboard
ENV LANG C.UTF-8
ENV TZ America/Sao_Paulo

# Exposing ports
EXPOSE 9229
EXPOSE 4200

# The run the start script
CMD [ "/bin/bash" ]
