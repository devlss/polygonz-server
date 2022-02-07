FROM node:16-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json /app/
RUN npm i
CMD ["npm", "start"]
