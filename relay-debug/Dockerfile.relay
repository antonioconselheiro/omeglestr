FROM nginx

RUN apt update
RUN apt install -y git build-essential libyaml-perl \
  libtemplate-perl libregexp-grammars-perl libssl-dev \
  zlib1g-dev liblmdb-dev libflatbuffers-dev libsecp256k1-dev \
  libzstd-dev certbot python3-certbot-nginx

RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/hoytech/strfry

WORKDIR /strfry

RUN git submodule update --init
RUN make setup-golpe
RUN make -j4

RUN cp strfry /usr/local/bin
RUN rm -rf /etc/nginx/sites-available/default
RUN mkdir -p /etc/nginx/sites-available

RUN echo 'server {\n\
  server_name localhost;\n\
  location / {\n\
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
      proxy_set_header Host $host;\n\
      proxy_pass http://127.0.0.1:7777;\n\
      proxy_http_version 1.1;\n\
      proxy_set_header Upgrade $http_upgrade;\n\
      proxy_set_header Connection "upgrade";\n\
  }\n\
}' > /etc/nginx/sites-available/default

EXPOSE 7777

CMD nginx -g 'daemon off;'

ENTRYPOINT [ "strfry", "relay" ]