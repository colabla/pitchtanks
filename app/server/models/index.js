'use strict';

const mongoose = require('mongoose');

// mongoose.connect(`mongodb://${process.env.MONGO_URL}`);
// mongoose.connect(process.env.MONGO_URL);
let uri;
if (process.env.NODE_ENV === 'development') {
	uri = 'mongodb://127.0.0.1:27017';
} else {
	uri = process.env.MONGOLAB_URI;
}
mongoose.connect(uri);

const User = mongoose.model('User', {
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String },
	campaign: { type: String },
	facebook: {
		id: { type: String },
		token: { type: String },
		email: { type: String },
	},
	twitter: {
		id: { type: String },
	},
	linkedIn: {
		id: { type: String },
	},
});

const Campaign = mongoose.model('Company', {
	isComplete: { type: Boolean },
	name: { type: String },
	tagline: { type: String },
	joinDate: { type: String },
	city: { type: String },
	market: { type: String },
	website: { type: String },
	battles: { type: Array },
	battleCount: { type: Number },
	pitchDescription: { type: String },
	videoUploadDate: { type: Date },
	upvotes: { type: Array },
	upvoteCount: { type: Number },
	videoUrl: { type: String },
	logo: { type: String },
});

const Battle = mongoose.model('Battle', {
	video1: {
		id: { type: String },
		votes: { type: String },
	},
	video2: {
		id: { type: String },
		votes: { type: String },
	},
});

module.exports = {
	User,
	Campaign,
	Battle,
};
