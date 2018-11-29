"use strict";

var through = require("through2");
var Dropbox = require("dropbox");
var colors = require("ansi-colors");
var fancyLog = require('fancy-log');
var PluginError = require("plugin-error");

const PLUGIN_NAME = "gulp-dropbox";

var opts = {};

function gulpDropbox(options) {
	if (!options) {
		throw new PluginError(PLUGIN_NAME, "Missing plugin options!");
	}

	opts = {
		token: options.token || undefined,
		path: options.path || "/",
		folder: options.folder || ""
	};

	return through.obj(dropboxUpload);
}

function dropboxUpload(file, enc, cb) {
	if (file.isStream()) {
		throw new PluginError(
			PLUGIN_NAME,
			"Looks like you've tried to use a stream, and this plugin only supports buffers. Please tweak your code and retry."
		);
		return cb(null, file);
	}

	if (!opts.token) {
		throw new PluginError(PLUGIN_NAME, "Missing Dropbox token!");
		return cb(null, file);
	}

	if (file.stat.isDirectory()) {
		return cb(null, file);
	}

	var replacePattern =
		opts.folder === "" ? opts.path : opts.path + "/" + opts.folder;

	var filePath = file.path.replace(file.base, replacePattern + "/");

	var dropbox = new Dropbox({
			accessToken: opts.token
		})
		.filesUpload({
			path: filePath,
			contents: file.contents
		})
		.then(function (response) {
			fancyLog(
				colors.green(
					"File '" +
					file.path.replace(file.base, "") +
					"' created in '" +
					replacePattern +
					"'."
				)
			);
			cb(null, file);
		})
		.catch(function (error) {
			throw new PluginError(
				PLUGIN_NAME,
				"There was an error uploading at least one file to Dropbox. Please check your terminal."
			);
			cb(null, file);
		});

	return cb(null, file);
}

module.exports = gulpDropbox;