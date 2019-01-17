const config = {
  NGINX: {
    PUBLIC_FOLDER: process.env.PUBLIC_FOLDER || '/var/www'
  },
  DIGITAL_OCEAN_API_KEY: process.env.DIGITAL_OCEAN_API_KEY || '',
  AUTH_TOKEN: process.env.AUTH_TOKEN || '',
  ROOT_DOMAIN_NAME: process.env.ROOT_DOMAIN_NAME || '',
  IPV4_ADDRESS: process.env.IPV4_ADDRESS || '',
  PORT: process.env.PORT || 3000
}

const { PUBLIC_FOLDER } = config.NGINX
config.NGINX = Object.assign(config.NGINX, {
  ROOT_DOMAIN_FOLDER: `${PUBLIC_FOLDER}/default`,
  SUB_DOMAINS_FOLDER: `${PUBLIC_FOLDER}/subdomains`
})

module.exports = config
