const assert = require('node:assert/strict');
const { describe, test } = require('node:test');
const request = require('supertest');
const app = require('../app');

describe('Verify the site loads', () => {
  test('Response should equal HTTP 200', async () => {
    const response = await request(app).get('/');
    assert.equal(response.statusCode, 200);
  });

  test('Health check should return app status', async () => {
    const response = await request(app).get('/healthz');
    assert.equal(response.statusCode, 200);
    assert.match(response.body.response.msg, /up and running/);
  });
});
