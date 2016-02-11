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

const Company = mongoose.model('Company', {
	name: { type: String },
	tagline: { type: String },
	joinDate: { type: String },
	city: { type: String },
	market: { type: String },
	numBattles: { type: Number },
	pitchDescription: { type: String },
	videoUploadDate: { type: Date },
	upvotes: { type: Array },
	upvoteCount: { type: Number },
});

const Video = mongoose.model('Video', {
	updoadDate: { type: Date },
	upvotes: { type: Array },
	upvoteCount: { type: Number },
	thumbnailUrl: { type: String },
	objectPath: { type: String },
});

module.exports = {
	User,
	Company,
	Video,
};
