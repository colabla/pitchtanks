const base = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://pitchtanks-colab.herokuapp.com';

module.exports = {
  facebookAuth: {
    clientID: '536185809877448',
    clientSecret: '66b8a62da47b1742e898b560b135ec74',
    callbackURL: base + '/auth/facebook/callback', // eslint-disable-line prefer-template
  },

  twitterAuth: {
    consumerKey: 'kreAVjA9fRp4dPdGlteeGjExR',
    consumerSecret: 'zafeyozClihvzI5RLKLCE3FaNzIGqM8cyYUlOMrmbSvMVBn6Ng',
    callbackURL: base + '/auth/twitter/callback', // eslint-disable-line prefer-template
  },

  linkedInAuth: {
    consumerKey: '78n3vx3os3v55x',
    consumerSecret: 'WeizMUL29MDPKcDN',
    callbackURL: base + '/auth/linkedin/callback', // eslint-disable-line prefer-template
  },
};
