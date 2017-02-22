/* eslint no-unused-expressions: 0 */
/* eslint import/no-unresolved: 0 */
import 'babel-polyfill';
import chai from 'chai';
import supertest from 'supertest';
import app from '../app';

const expect = chai.expect;
const request = supertest(app);

describe('Home Route', () => {
  it('returns a response message when a user visits the api', () => {
    request
      .get('/')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message');
      });
  });
});
