FROM node

ENV WORKSPACE=/home/local/app
WORKDIR $WORKSPACE

COPY dist ./dist
COPY package*.json ./
COPY ormconfig.json ./
COPY .env ./

RUN npm install --only=production


CMD ["node","/home/local/app/dist/main"]