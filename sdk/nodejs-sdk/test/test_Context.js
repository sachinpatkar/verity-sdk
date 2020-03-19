/* eslint-env mocha */
'use strict'
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const Context = require('../src/utils/Context')
const utils = require('../src/utils')

const testConfig = {
  verityUrl: 'http://vas-team1.pdev.evernym.com',
  verityPublicDID: '3pjVfGmNysjiS5FiGPaa3F',
  verityPublicVerKey: '2YEuuFaKV3gvbuCUVKGwWxXdiPtHvocV2VNJ7LK9knn1',
  domainDID: 'LQYTvDVJpUF76aqBoPnq2p',
  verityAgentVerKey: 'BaTcmxFB6SdXh2xMhjc8thzh4P37jNbvx8QVHXeN2b5R',
  sdkVerKeyId: '5wEFMRrGhJUpXegY1eYxdK',
  sdkVerKey: '3h1FAFLNLaqyknzzE9xBrchQQC1XkLERWZuyr3ACWyy9',
  endpointUrl: 'http://localhost:4002',
  walletName: utils.miniId(),
  walletKey: '12345',
  version: '0.2'
}

function getTestConfig () {
  const config = JSON.parse(JSON.stringify(testConfig)) // Copy object
  config.walletName = utils.miniId()
  return JSON.stringify(config)
}

exports.getTestConfig = getTestConfig

describe('Context', () => {
  it('should accept valid configuration and contain all data', async () => {
    let config = getTestConfig()
    const context = await Context.createWithConfig(config)
    config = JSON.parse(config)
    expect(context.verityUrl).to.equal(config.verityUrl)
    expect(context.verityPublicDID).to.equal(config.verityPublicDID)
    expect(context.verityPublicVerKey).to.equal(config.verityPublicVerKey)
    expect(context.domainDID).to.equal(config.domainDID)
    expect(context.verityAgentVerKey).to.equal(config.verityAgentVerKey)
    expect(context.sdkVerKeyId).to.equal(config.sdkVerKeyId)
    expect(context.sdkVerKey).to.equal(config.sdkVerKey)
    expect(context.endpointUrl).to.equal(config.endpointUrl)
    expect(context.walletConfig).to.equal(JSON.stringify({ id: config.walletName }))
    expect(context.walletCredentials).to.equal(JSON.stringify({ key: config.walletKey }))
    expect(context.walletHandle).to.be.a('number')
    await context.deleteWallet()
  }).timeout(5000)

  it('should parse config if a JSON value', async () => {
    let config = getTestConfig()
    const context = await Context.createWithConfig(JSON.parse(config))
    config = JSON.parse(config)
    expect(context.verityUrl).to.equal(config.verityUrl)
    expect(context.verityPublicDID).to.equal(config.verityPublicDID)
    expect(context.verityPublicVerKey).to.equal(config.verityPublicVerKey)
    expect(context.domainDID).to.equal(config.domainDID)
    expect(context.verityAgentVerKey).to.equal(config.verityAgentVerKey)
    expect(context.sdkVerKeyId).to.equal(config.sdkVerKeyId)
    expect(context.sdkVerKey).to.equal(config.sdkVerKey)
    expect(context.endpointUrl).to.equal(config.endpointUrl)
    expect(context.walletConfig).to.equal(JSON.stringify({ id: config.walletName }))
    expect(context.walletCredentials).to.equal(JSON.stringify({ key: config.walletKey }))
    expect(context.walletHandle).to.be.a('number')
    await context.deleteWallet()
  }).timeout(5000)

  it('should reject invalid configuration', async () => {
    const requiredAttributes = [
      'verityUrl',
      'verityPublicDID',
      'verityPublicVerKey',
      'sdkVerKeyId',
      'sdkVerKey',
      'walletName',
      'walletKey'
    ]
    for (const key of requiredAttributes) {
      const config = JSON.parse(getTestConfig())
      delete config[key]
      await expect(Context.createWithConfig(JSON.stringify(config))).to.be.rejectedWith(Error, 'Invalid Context Configuration: missing attribute "' + key + '"')
    }
  })

  it('should throw an error if configuration is passed into the Context constructor', () => {
    // eslint-disable-next-line no-new
    expect(() => { new Context(getTestConfig()) }).to.throw(Error, 'Invalid arguments to Context constructor. Context should be created with Context.create or Context.createWithConfig.')
  })

  it('should parse v0.1 to v0.2', async () => {
    const v01Str = `{
      "verityPublicVerkey": "ETLgZKeQEKxBW7gXA6FBn7nBwYhXFoogZLCCn5EeRSQV",
      "verityPairwiseDID": "NTvSuSXzygyxWrF3scrhdc",
      "verityUrl": "https://vas-team1.pdev.evernym.com",
      "verityPairwiseVerkey": "ChXRWjQdrrLyksbPQZfaS3JekA4xLgD5Jg7GzXhc9zqE",
      "walletName": "f93cb7e5-0f35-466e-ba59-11a22b8f4004",
      "walletKey": "f8597321-c826-49a7-8edb-38b8e0fa8528",
      "sdkPairwiseVerkey": "HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh",
      "verityPublicDID": "Rgj7LVEonrMzcRC1rhkx76",
      "sdkPairwiseDID": "XNRkA8tboikwHD3x1Yh7Uz"
    }`

    const ctx = await Context.createWithConfig(v01Str)

    expect(ctx.domainDID).to.equal('NTvSuSXzygyxWrF3scrhdc')
    expect(ctx.verityAgentVerKey).to.equal('ChXRWjQdrrLyksbPQZfaS3JekA4xLgD5Jg7GzXhc9zqE')
    expect(ctx.sdkVerKey).to.equal('HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh')
    expect(ctx.sdkVerKeyId).to.equal('XNRkA8tboikwHD3x1Yh7Uz')
    expect(ctx.version).to.equal('0.2')
  }).timeout(5000)

  it('should create valid context without provisioning', async () => {
    const ctx = await Context.create(
      'test1',
      'test1',
      'https://vas-team1.pdev.evernym.com',
      'NTvSuSXzygyxWrF3scrhdc',
      'ChXRWjQdrrLyksbPQZfaS3JekA4xLgD5Jg7GzXhc9zqE',
      'https://enazy4stgnrep.x.pipedream.net/',
      '000000000000000000000000Team1VAS'
    )

    const expected = `{
      "verityPublicVerKey": "ETLgZKeQEKxBW7gXA6FBn7nBwYhXFoogZLCCn5EeRSQV",
      "verityUrl": "https://vas-team1.pdev.evernym.com",
      "verityAgentVerKey": "ChXRWjQdrrLyksbPQZfaS3JekA4xLgD5Jg7GzXhc9zqE",
      "walletKey": "test1",
      "sdkVerKey": "HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh",
      "walletName": "test1",
      "endpointUrl": "https://enazy4stgnrep.x.pipedream.net/",
      "verityPublicDID": "Rgj7LVEonrMzcRC1rhkx76",
      "sdkVerKeyId": "XNRkA8tboikwHD3x1Yh7Uz",
      "version": "0.2",
      "domainDID": "NTvSuSXzygyxWrF3scrhdc"
    }`

    expect(ctx.getConfig()).to.eql(JSON.parse(expected))
  }).timeout(5000)
})
