FROM nginx:alpine

ARG NGINX_HTML_PATH=/usr/share/nginx/html
ARG NGINX_CONF_PATH=/etc/nginx/conf.d

ENV NGINX_HTML_PATH=$NGINX_HTML_PATH
ENV NGINX_CONF_PATH=$NGINX_CONF_PATH

# Clear html directory and create root and subdomains folders
WORKDIR $NGINX_HTML_PATH
RUN rm *
RUN mkdir root subdomains
COPY ./index.html ./root

# ROOT_DOMAIN_NAME is passed from the .env file and set into the container
# Note: CMD env variables context is post-build
CMD envsubst '$ROOT_DOMAIN_NAME $NGINX_HTML_PATH $NGINC_CONF_PATH' < \
  ${NGINX_CONF_PATH}/default.template > ${NGINX_CONF_PATH}/default.conf ;\
  nginx -g 'daemon off;'