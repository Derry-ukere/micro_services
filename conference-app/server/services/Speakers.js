/* eslint-disable class-methods-use-this */
/* eslint-disable arrow-parens */
/* eslint-disable semi */
// const fs = require('fs')
// const util = require('util')
const axios = require('axios');
const url = require('url');
const crypto = require('crypto')


const CircuitBreaker = require('../lib/CircuitBreaker');

const circuitBreaker = new CircuitBreaker();

class SpeakersService {
  constructor({ servieRegistryUrl, serviceVersionIdentifier }) {
    this.servieRegistryUrl = servieRegistryUrl
    this.serviceVersionIdentifier = serviceVersionIdentifier
    this.cache = {};
  }

  async getImage(path) {
    const { ip, port } = await this.getService('speakers-service')
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/${path}`,
      responseType: 'stream',
    })
  }

  async getNames() {
    const { ip, port } = await this.getService('speakers-service')
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/names`,
    })
  }

  async getListShort() {
    const { ip, port } = await this.getService('speakers-service')
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/list-short`,
    })
  }

  async getList() {
    const { ip, port } = await this.getService('speakers-service')
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/list`,
    })
  }

  async getAllArtwork() {
    const { ip, port } = await this.getService('speakers-service')
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/artworks`,
    })
  }

  async getSpeaker(shortname) {
    const { ip, port } = await this.getService('speakers-service')
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/speaker/${shortname}`,
    })
  }

  async getArtworkForSpeaker(shortname) {
    const { ip, port } = await this.getService('speakers-service')
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/artwork/${shortname}`,
    })
  }

  async callService(requestOptions) {
    const servicePath = url.parse(requestOptions.url).path;
    const cachKey = crypto.createHash('md5').update(requestOptions.method + servicePath).digest('hex')
    const result = circuitBreaker.callService(requestOptions)

    if (!result) {
      if (this.cache[cachKey]) return this.cache[this.cacheKey];
      return false;
    }
    this.cache[cachKey] = result;
    return result;
  }

  async getService(servicename) {
    const response = await axios.get(
      // eslint-disable-next-line comma-dangle
      `${this.servieRegistryUrl}/find/${servicename}/${this.serviceVersionIdentifier}`
    )

    return response.data
  }
}

module.exports = SpeakersService
