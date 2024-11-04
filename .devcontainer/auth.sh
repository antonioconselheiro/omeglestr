#bin/bash

mkdir -f ~/.ssh;
cp -r .ssh/** ~/.ssh/;
cp .gitconfig ~/.gitconfig;
chmod 500 ~/.ssh/id_ed25519;
ssh-add -D;
ssh-add ~/.ssh/id_ed25519;