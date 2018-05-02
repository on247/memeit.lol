let express = require('express')
let util = require('../modules/util')
let accinfo = require('../modules/accinfo')
let router = express.Router()
let db = require('../db')

/* GET users listing. */
router.get('/', util.isAuthenticated, async (req, res, next) => {
  let posts = await db.Post.find({
    hidden: false,
    voted: true
  }).sort({
    time: -1
  }).limit(10)
  const userMetadata = req.session.steemconnect.json_metadata
    ? JSON.parse(req.session.steemconnect.json_metadata) : {}
  posts = await Promise.all(posts.map(async function (post) {
    post.payout = await accinfo.payoutCalculator(post.author, post.permlink)
    // console.log(post.payout);
    return post
  }))
  // console.log(posts);
  res.render('dashboard', {
    posts,
    name: req.session.steemconnect.name,
    about: userMetadata.profile ? userMetadata.profile.about : '',
    profileImage: userMetadata.profile ? userMetadata.profile.profile_image : 'http://via.placeholder.com/100x100',
    logged: res.logged,
    mod: res.mod,
    username: req.session.steemconnect.name
  })
})

module.exports = router
