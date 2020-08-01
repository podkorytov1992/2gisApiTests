FROM node:13.12.0

ADD . /opt/tests
WORKDIR /opt/tests

RUN yarn install && yarn test