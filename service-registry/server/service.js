/* eslint-disable operator-linebreak */
/* eslint-disable new-cap */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
const express = require('express')
const ServiceRegistry = require('./lib/ServiceRegistry')

const service = express()
// const ServiceRegistry = require('./ServiceRegistry');

module.exports = (config) => {
  const log = config.log()
  const serviceRegistry = new ServiceRegistry(log)
  // Add a request logging middleware in development mode
  if (service.get('env') === 'development') {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`)
      return next()
    })
  }

  // registering services
  service.put(
    '/register/:servicename/:serviceversion/:serviceport',
    (req, res) => {
      const { servicename, serviceversion, serviceport } = req.params
      const serviceip = req.socket.remoteAddress.includes('::')
        ? `[${req.socket.remoteAddress}]`
        : ':::'
      const serviceKey = serviceRegistry.register(
        servicename,
        serviceversion,
        serviceip,
        serviceport
      )
      return res.json({ result: serviceKey })
    }
  )

  // delete a service
  service.delete(
    '/register/:servicename/:serviceversion/:serviceport',
    (req, res) => {
      const { servicename, serviceversion, serviceport } = req.params
      const serviceip = req.socket.remoteAddress.includes('::')
        ? `[${req.socket.remoteAddress}]`
        : ':::'
      const serviceKey = serviceRegistry.unregister(
        servicename,
        serviceversion,
        serviceip,
        serviceport
      )
      return res.json({ result: serviceKey })
    }
  )
  // get service
  service.get('/find/:servicename/:serviceversion', (req, res) => {
    const { servicename, serviceversion } = req.params
    const svc = serviceRegistry.get(servicename, serviceversion)
    if (!svc) return res.status(401).json({ result: 'service not found' })
    return res.json(svc)
  })

  // eslint-disable-next-line no-unused-vars
  service.use((error, req, res, next) => {
    res.status(error.status || 500)
    // Log out the error to the console
    log.error(error)
    return res.json({
      error: {
        message: error.message,
      },
    })
  })
  return service
}
