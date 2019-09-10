FROM node:12.10-alpine
ADD VERSION package*.json /dist/
ADD src /dist/server/
WORKDIR /dist
RUN npm ci --production
CMD ["npm", "run", "start"]
EXPOSE 80
