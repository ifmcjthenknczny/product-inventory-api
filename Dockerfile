FROM node:22
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]