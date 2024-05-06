# Note: NW.js doesn't have linux/arm64 builds
FROM --platform=linux/amd64 ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update

RUN apt-get -y install locales && \
  locale-gen en_US.UTF-8 && \
  update-locale LANG=en_US.UTF-8
ENV LANG en_US.UTF-8

# build-essential is included because `npm install` can run node-gyp which runs make.
RUN apt-get install -y \
  build-essential \
  libglib2.0 \
  libnss3 \
  xvfb \
  libxcomposite1 \
  libxcursor1 \
  libxi6 \
  libxtst6 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2t64 \
  libatk1.0 \
  libpangocairo-1.0 \
  libatspi2.0 \
  libgtk-3-0 \
  libgbm1

RUN apt-get install -y curl

SHELL ["/bin/bash", "-c"]

ENV NVM_DIR /usr/local/nvm
RUN mkdir -p /usr/local/nvm

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

RUN source $NVM_DIR/nvm.sh && nvm install 21

ENV DISPLAY :0

CMD Xvfb -screen 0 1024x768x16 -ac & bash
