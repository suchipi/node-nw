FROM ubuntu:18.04

RUN apt-get update
RUN apt-get -y install locales

RUN locale-gen en_US.UTF-8
RUN update-locale LANG=en_US.UTF-8
ENV LANG en_US.UTF-8

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get install -y libglib2.0
RUN apt-get install -y libnss3
RUN apt-get install -y xvfb
RUN apt-get install -y libxcomposite1
RUN apt-get install -y libxcursor1
RUN apt-get install -y libxi6
RUN apt-get install -y libxtst6
RUN apt-get install -y libcups2
RUN apt-get install -y libxss1
RUN apt-get install -y libxrandr2
RUN apt-get install -y libasound2
RUN apt-get install -y libatk1.0
RUN apt-get install -y libpangocairo-1.0
RUN apt-get install -y libatspi2.0
RUN apt-get install -y libgtk-3-0

ENV DISPLAY :0

RUN apt-get install -y curl

SHELL ["/bin/bash", "-c"]

ENV NVM_DIR /usr/local/nvm
RUN mkdir -p /usr/local/nvm

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash

RUN source $NVM_DIR/nvm.sh && nvm install 10
RUN source $NVM_DIR/nvm.sh && npm install -g pnpm

CMD Xvfb -screen 0 1024x768x16 -ac & bash
