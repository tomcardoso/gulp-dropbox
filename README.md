# gulp-dropbox

Takes a set of files and uploads them to a common Dropbox folder.

### Installation

`npm install --save-dev gulp-dropbox`

### Usage

gulp-dropbox takes an options object with three things:

* **token**: Your Dropbox token, which can be created [here](https://www.dropbox.com/developers/apps). I recommend storing your token as an environment variable and calling it using `process.env` *(required)*
* **path**: The base path within Dropbox you want to write to. Defaults to `/` otherwise *(optional)*
* **folder**: Subfolder you want to write everything to *(optional)*

```
var gulp = require('gulp'),
    gulpDropbox = require('gulp-dropbox');

gulp.task('deploy', function() {
  return gulp.src('./dist')
    .pipe(gulpDropbox({
      token: process.env.DROPBOX_TOKEN,
      path: '/Sites',
      folder: 'my-awesome-project'
    }));
  });
```

Protip: If you want to exclude files specified in your `.gitignore` from your pattern, use something like [gulp-gitignore](https://www.npmjs.com/package/gulp-gitignore):

```
var gulp = require('gulp'),
    gulpDropbox = require('gulp-dropbox'),
    gitignore = require('gulp-gitignore');

gulp.task('deploy', function() {
  return gulp.src('./dist')
    .pipe(gitignore())
    .pipe(gulpDropbox({
      token: process.env.DROPBOX_TOKEN,
      path: '/Sites',
      folder: 'my-awesome-project'
    }));
  });
```

### Todo

Write tests (yeah…)

### License

MIT © [Tom Cardoso](tomcardoso.com)
