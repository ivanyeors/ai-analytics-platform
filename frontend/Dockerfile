FROM node:16 as build-stage

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY public ./public
COPY src ./src
COPY index.html ./
COPY vite.config.js ./
COPY .eslintrc.js ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Copy the build output to nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy default nginx conf
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 