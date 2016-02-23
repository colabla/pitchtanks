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
	upvotes: { type: Array },
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
	user: { type: String }, 							// The owner of the campaign.
	isComplete: { type: Boolean }, 				// If the campaign has been completed
	name: { type: String },								// Name of the startup
	tagline: { type: String },						// Tagline of startup
	joinDate: { type: Date },							// Date campaign was completed
	city: { type: String },								// City in which startup is based.
	market: { type: String },							// Startup's market
	website: { type: String },						// Startup's website
	battles: { type: Array },							// Array of battles fought
	battleCount: { type: Number },				// Number of battles fought
	pitchDescription: { type: String },		// Pitch description
	videoUploadDate: { type: Date },			// Date video was uploaded
	upvotes: { type: Array },							// Array of user IDs that upvoted.
	upvoteCount: { type: Number },				// Number of upvotes
	videoUrl: { type: String },						// URL of video.
	isHtml5: { type: Boolean },						// If we put the video in iframe or video
	logo: { type: String },								// URL of company logo.
	thumbnail: { type: String },					// URL of video thumbnail

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
