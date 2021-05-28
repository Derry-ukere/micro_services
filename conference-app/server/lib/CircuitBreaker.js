const axios = require('axios');

class CircuitBreaker {
  constructor() {
    this.state = {};
    this.failureThreshold = 5;
    this.coolDownPeriod = 10;
    this.requestTimeOut = 0;
  }


  async callService(requestOptions) {
    const endpoint = `${requestOptions.method}: ${requestOptions.url}`;
    // eslint-disable-next-line no-undef
    if (!this.canRequest(endpoint)) return false;
    // eslint-disable-next-line no-param-reassign
    requestOptions.timeout = this.requestTimeOut * 1000;
    try {
      const response = await axios(requestOptions);
      this.onSuccess(endpoint);
      return response.data;
    } catch (error) {
      this.onFailure(endpoint);
      return false;
    }
  }

  onSuccess(enpoint) {
    this.initState(enpoint);
  }

  onFailure(enpoint) {
    const state = this.state[enpoint];
    state.failure += 1;
    if (state.failure > this.failureThreshold) {
      state.circuit = 'OPEN';
      state.nextTry = new Date() / 1000 + this.coolDownPeriod;
      // eslint-disable-next-line no-console
      console.log(`ALERT! Circuit for ${enpoint} is in state 'OPEN'`);
    }
  }

  // eslint-disable-next-line consistent-return
  canRequest(endpoint) {
    if (!this.state[endpoint]) this.initState(endpoint);
    const state = this.state[endpoint];
    if (state.circuit === 'ClOSED') return true;
    const now = new Date() / 1000;
    if (state.nextTry <= now) {
      state.circuit = 'HALF';
      return true;
    }
    return false;
  }

  // eslint-disable-next-line space-before-function-paren
  initState (endpoint) {
    this.state[endpoint] = {
      failures: 0,
      coolDownPeriod: this.coolDownPeriod,
      circuit: 'CLOSED',
      nextTry: 0,
    };
  }
}

module.exports = CircuitBreaker;
