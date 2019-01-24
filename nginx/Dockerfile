FROM nginx:alpine

# Configuration
WORKDIR /etc/nginx/conf.d
RUN rm -f *
COPY ./templates/default.conf ./

# Public folder
WORKDIR /usr/share/nginx/html
RUN rm -f *
COPY ./templates/html ./

