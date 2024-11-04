FROM node:20

# Including jq to filter json
RUN apt update
RUN apt install -y jq gnupg

# Chrome install for unit test
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt update
RUN apt install -y google-chrome-stable

# Clean
RUN apt clean
RUN rm -rf /var/lib/apt/lists/*

# Installing nak, the nostr army knife
RUN wget https://github.com/fiatjaf/nak/releases/download/v0.1.13/nak-v0.1.13-linux-amd64
RUN mv nak-v0.1.13-linux-amd64 /usr/bin/nak
RUN chmod +x /usr/bin/nak

# Installing client dependencies
RUN npm install typescript @angular/cli -g

WORKDIR /omeglestr

# Keyboard & Timezone
ENV LANG=C.UTF-8
ENV TZ=America/Sao_Paulo

# Exposing ports
EXPOSE 9876
EXPOSE 4200

# The run the start script
CMD [ "/bin/bash" ]
