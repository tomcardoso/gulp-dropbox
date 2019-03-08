"use strict";

var through = require("through2");
var fetch = require('isomorphic-fetch');
var Dropbox = require("dropbox").Dropbox;
var colors = require("ansi-colors");
var path = require("path");
var fancyLog = require('fancy-log');
var PluginError = require("plugin-error");

const PLUGIN_NAME = "gulp-dropbox";
const PLUGIN_ERROR_INPUT_NOT_BUFFER = "Looks like you've tried to use a stream, and this plugin only supports buffers. Please tweak your code and retry.";
const PLUGIN_ERROR_MISSING_OPTIONS = "Missing plugin options!";
const PLUGIN_ERROR_MISSING_TOKEN = "Missing Dropbox token!";

var opts = {};

function gulpDropbox(options) {
	if (!options) {
		throw new PluginError(PLUGIN_NAME, PLUGIN_ERROR_MISSING_OPTIONS);
	}

	opts = {
		token: options.token || undefined,
		path: options.path || "/",
		folder: options.folder || ""
	};

	return through.obj(dropboxUpload);
}

async function dropboxUpload(file, enc, cb) {

	if (file.isStream()) {
		const pluginError = new PluginError(PLUGIN_NAME, PLUGIN_ERROR_INPUT_NOT_BUFFER);
		this.emit('error', pluginError);

		return cb(null, file);
	}

	if (!opts.token) {
		const pluginError = new PluginError(PLUGIN_NAME, PLUGIN_ERROR_MISSING_TOKEN);
		this.emit('error', pluginError);

		return cb(null, file);
	}

	// Null or unusable file
	if (file.isNull() || file.stat.isDirectory()) {
		return cb(null, file);
	}

	var replacePattern =
		opts.folder === "" ? opts.path : opts.path + "/" + opts.folder;

	var filePath = path.resolve(file.path.replace(file.base, replacePattern + "/"));

	var dropbox = new Dropbox({
		accessToken: opts.token,
		fetch
	});

	// Hold onto this instance for use in the promise below
	var self = this;

	await dropbox.filesUpload({
			path: filePath,
			contents: file.contents
		})
		.then(function () {
			fancyLog(
				colors.green(
					"File '" +
					file.path.replace(file.base, "") +
					"' created in '" +
					replacePattern +
					"'."
				)
			);
			self.emit('end');
		})
		.catch(function (err) {
			const pluginError = new PluginError(PLUGIN_NAME, err.error || err.message);

			self.emit('error', pluginError);
		});

	cb(null, file);
}

module.exports = gulpDropbox;
module.exports.PLUGIN_NAME = PLUGIN_NAME;
module.exports.PLUGIN_ERROR_INPUT_NOT_BUFFER = PLUGIN_ERROR_INPUT_NOT_BUFFER;
module.exports.PLUGIN_ERROR_MISSING_OPTIONS = PLUGIN_ERROR_MISSING_OPTIONS;
module.exports.PLUGIN_ERROR_MISSING_TOKEN = PLUGIN_ERROR_MISSING_TOKEN;