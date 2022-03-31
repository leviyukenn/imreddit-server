FROM node

ENV WORKSPACE=/home/local/app
WORKDIR $WORKSPACE

COPY dist ./dist
COPY package*.json ./

RUN npm install --only=production


CMD ["node","/home/local/app/dist/main"]