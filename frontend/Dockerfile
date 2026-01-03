FROM node:16-bullseye

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --no-optional

COPY . .

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
