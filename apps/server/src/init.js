const {
  getAllDomains,
  getAllRecords,
  createRecord,
  createDomain
} = require('@/dns')
const {
  BOOTSTRAP_ROOT_DOMAIN,
  ROOT_DOMAIN_NAME,
  IPV4_ADDRESS
} = require('@/config')

const STEPS = {
  CREATE_DOMAIN: 'CREATE_DOMAIN',
  CREATE_ROOT_RECORD: 'CREATE_ROOT_RECORD',
  CREATE_WWW_ROOT_RECORD: 'CREATE_WWW_ROOT_RECORD'
}

const ACTION_BY_STEP = {
  [STEPS.CREATE_DOMAIN]: async () => {
    await createDomain(ROOT_DOMAIN_NAME, IPV4_ADDRESS)
  },
  [STEPS.CREATE_ROOT_RECORD]: async () => {
    await createRecord({
      type: 'A',
      name: '@',
      data: IPV4_ADDRESS,
      ttl: 3600 // Default value when set from Digital Ocean dashboard
    })
  },
  [STEPS.CREATE_WWW_ROOT_RECORD]: async () => {
    await createRecord({
      type: 'CNAME',
      name: `www`,
      data: `${ROOT_DOMAIN_NAME}.`, // Data needs to end with a dot (.) for CNAME
      ttl: 43200
    })
  }
}

// TODO: Use a fn to wrap error message for each type
const MESSAGE_BY_STEP = {
  [STEPS.CREATE_DOMAIN]: {
    NOT_FOUND: `Root domain name ${ROOT_DOMAIN_NAME} does not exist`,
    CREATED: `Root domain name ${ROOT_DOMAIN_NAME} has been created`,
    CONFIGURED: ''
  },
  [STEPS.CREATE_ROOT_RECORD]: {
    NOT_FOUND: `A record (@ -> ${IPV4_ADDRESS}) not found or incorrectly configured`,
    CREATED: `A record (@ -> ${IPV4_ADDRESS}) has been created`,
    CONFIGURED: ''
  },
  [STEPS.CREATE_WWW_ROOT_RECORD]: {
    NOT_FOUND: `CNAME record (www -> ${ROOT_DOMAIN_NAME}) not found or incorrectly configured`,
    CREATED: `CNAME record (www -> ${ROOT_DOMAIN_NAME}) has been created`,
    CONFIGURED: ''
  }
}

class InitError extends Error {
  constructor(message, steps = []) {
    super(message)
    this.steps = steps
  }
}

module.exports = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const domains = await getAllDomains()
      if (!domains.find(d => d.name === ROOT_DOMAIN_NAME)) {
        throw new InitError('', Object.keys(STEPS))
      }
      console.log(
        `[API | INIT] Root domain ${ROOT_DOMAIN_NAME} is already configured`
      )

      const records = await getAllRecords()
      let steps = []
      const aExistsFn = r =>
        r.name === '@' && r.type === 'A' && r.data === IPV4_ADDRESS
      if (!records.find(aExistsFn)) {
        steps.push(STEPS.CREATE_ROOT_RECORD)
      }

      const cNameExistsFn = r =>
        r.name === 'www' && r.type === 'CNAME' && r.data === '@'
      if (!records.find(cNameExistsFn)) {
        steps.push(STEPS.CREATE_WWW_ROOT_RECORD)
      }
      !steps.includes(STEPS.CREATE_ROOT_RECORD) &&
        console.log(
          `[API | INIT] A record (@ -> ${IPV4_ADDRESS}) is already configured`
        )

      !steps.includes(STEPS.CREATE_WWW_ROOT_RECORD) &&
        console.log(
          `[API | INIT] CNAME record (www -> ${ROOT_DOMAIN_NAME}) is already configured`
        )
      if (steps.length) {
        throw new InitError('', steps)
      }

      resolve()
    } catch (err) {
      if (err instanceof InitError) {
        for (let i = 0; i < err.steps.length; ++i) {
          const step = err.steps[i]
          console.log(`[API | INIT] ${MESSAGE_BY_STEP[step].NOT_FOUND}`)
          if (BOOTSTRAP_ROOT_DOMAIN) {
            try {
              await ACTION_BY_STEP[step]()
              console.log(`[API | INIT] ${MESSAGE_BY_STEP[step].CREATED}`)
            } catch (err) {
              // Something is wrong
              return reject(err)
            }
          }
        }
        BOOTSTRAP_ROOT_DOMAIN ? resolve() : reject(err.message)
      } else {
        const err = new Error(
          "Can't connect to Digital Ocean. Please check your API KEY"
        )
        reject(err.message)
      }
    }
  })
}
