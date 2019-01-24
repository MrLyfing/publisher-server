if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '../.env' })
}

const config = {
  NGINX: {
    PUBLIC_PATH: process.env.PUBLIC_PATH || '',
    ROOT_DOMAIN_FOLDER: `${process.env.PUBLIC_PATH}/root`,
    SUB_DOMAINS_FOLDER: `${process.env.PUBLIC_PATH}/subdomains`
  },
  PORT: process.env.PORT || 3000,

  DIGITAL_OCEAN_API_KEY: process.env.DIGITAL_OCEAN_API_KEY || '',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
  ROOT_DOMAIN_NAME: process.env.ROOT_DOMAIN_NAME || '',
  IPV4_ADDRESS: process.env.IPV4_ADDRESS || ''
}
module.exports = config
