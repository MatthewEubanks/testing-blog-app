const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const seedData = require("seed-data");

const expect = chai.expect;

const {BlogPost} = require("../models");
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
    console.info('seeding blog posts');
    const newSeed = [];
    
    for (let i = 0; i <= 10; i++) {
        newSeed.push(seedData);
    }
    return BlogPost.insertMany(newSeed);
}

function generateBlogtData() {
  return {
    title: 'something something',
    author: {
        firstName: 'Someone',
        lastName: 'Somewhere'
    },
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed'
  };
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('BlogPost API resource', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function() {
        return seedBlogData();
    });
    afterEach(function() {
        return tearDownDb();
    });
    after(function() {
        return closeServer();
    });
    
    describe('GET endpoint', function() {
        it('should return all existing blogs', function() {
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body.blogPost).to.have.lengthOf.at.least(1);
                    return BlogPost.count();
                })
                .then(function(count) {
                    expect(res.body.blogPost).to.have.lengthOf(count);
                });
        });
        
        it('should return blogs posts with right fields', function() {
            let resBlogPost;
            return chai.request(app)
                .get('/posts')
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.blogPost).to.be.a('array');
                    expect(res.body.blogPost).to.have.lengthOf.at.least(1);
                    
                    res.body.blogPost.forEach(function(blogPost) {
                        expect(blogPost).to.be.a('object');
                        expect(blogPost).to.include.keys(
                            'id', 'title', 'author', 'content');
                    });
                    resBlogPost = res.body.restaurants[0];
                    return BlogPost.findById(resBlogPost.id);
                })
                .then(function(blogPost) {
                    expect(resBlogPost.id).to.equal(blogPost.id);
                    expect(resBlogPost.title).to.equal(blogPost.title);
                    expect(resBlogPost.author).to.equal(blogPost.author);
                    expect(resBlogPost.content).to.equal(blogPost.content);
                });
        });
    });
    describe('POST endpoint', function() {
        it('should add a new post', function() {
            const newBlogPost = generateBlogtData();
            
            return chai.request(app)
                .post('/posts')
                .send(newBlogPost)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys(
                        'id', 'title', 'name', 'content');
                    expect(res.body.title).to.equal(newBlogPost.title);
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.name).to.equal(newBlogPost.name);
                    expect(res.body.content).to.equal(newBlogPost.content);
                    
                    return BlogPost.findById(res.body.id);
                })
                .then(function(blogPost) {
                    expect(blogPost.title).to.equal(newBlogPost.title);
                    expect()
                })
        })
    })
})