// Cleanse - finds and removes unused assets ie. images, css and js files.
// Inspired by http://stackoverflow.com/questions/19423879/a-grunt-task-script-or-application-which-removes-unused-assets
module.exports = function (grunt) {

	'use strict';

	var _ = grunt.util._;

	grunt.registerMultiTask('cleanse', 'removes unused assets.', function () {

		var assets = [],
			assets_meta,
			linked_assets = [],
			diff,

			templates	= grunt.file.expand(this.data.templates),
			assets		= grunt.file.expand(this.data.assets),

			// enable file deletion only if the 'delete' option is set to true
			flag_delete	= typeof this.data.delete !== 'undefined' ? this.data.delete == true ? true : false: false,

			//ignore list
			ignore_list = typeof this.data.ignore !== 'undefined' ? this.data.ignore : [];


		// utility to separate filenames and file extensions from the filepaths
		// for easier logic.
		assets_meta = group_file_metdata(assets);

		// assets_meta.extensions.join("|") turns ["jpg","png","ico"] into "jpg|png|ico"
		linked_assets = extract_asset_filenames_from_file( templates, assets_meta.extensions.join("|") );

		linked_assets = _.union(linked_assets,ignore_list);

		// compares list of filenames found in assets and list of filenames found by
		// scaping the templates. Value of 0 should indicate no differences found.
		diff = _.difference(assets_meta.filenames, linked_assets);

		if (diff.length > 0){

			grunt.log.writeln('Found ' + diff.length + ' unused assets.');

			// Though we have a list of filenames in the diff array, we need
			// to find the filepath in order to delete. The following loops
			// through the original assets array to achieve this.
			var files_to_delete=[], match=-1, i=0, j=assets.length, k=0, l=diff.length;

			for (;i<j;i++){
				k=0;
				for(;k<l;k++){
					match = assets[i].indexOf(diff[k]);
					if (match > -1){
						files_to_delete.push(assets[i]);
						break;
					}
				}
			}

			if (flag_delete){
				grunt.log.writeln('Preparing to delete...');
				delete_files(files_to_delete);
			}else{
				for (i=0,j=files_to_delete.length;i<j;i++){
					grunt.log.writeln(files_to_delete[i]);
				}
				grunt.log.warn('Assets not deleted! Set delete:true to enable automatic deletion.');
			}

		}else{
			grunt.log.writeln('No unused assets found.');
		}

	});

	/*
	 *	group_file_metdata(files|array)
	 *
	 *	Given an array of filepaths, return an object with key 'filenames' which
	 *	groups the filenames of all items in the array and another key 'extensions'
	 *	which groups the file extensions of all items in the array. Ensure there
	 *	are no duplicate items in 'filenames' and 'extenstions'.
	 */
	function group_file_metdata(files){

		var filenames	= [],
			extensions	= [],
			match;

		files.forEach(function(file){

			// the regex here includes the parent folder name if available
			// this allows to differentiate files which have the same name but
			// are in different folders
			match = file.match(/([\w-]+\/?[\w-]+[^\.]{2}\.([\w-.]+))/i);

			if (match !== null && match !== 'undefined'){
				filenames.push(match[1]);
				extensions.push(match[2]);
			}
		});

		return {
			filenames	: _.uniq(filenames),
			extensions	: _.uniq(extensions)
		}
	}

	/*
	 *	extract_asset_filenames_from_file (files|array, extensions|string)
	 *
	 *  Given an array of filepaths, Find and return a list of external resource filenames
	 *  which match the given 'extensions' argument, from within the contents of
	 *  all files.
	 */
	function extract_asset_filenames_from_file (files, extensions) {

		var filenames	= [],
			regex		= new RegExp();

		regex.compile('(?:href|src|url)[=]?.+?([\\w-/]+\\.(?:'+ extensions +'))[\'|\"]?', 'ig');

		files.forEach(function(file){

			var content	= grunt.file.read(file),
				matches;

			while ((matches = regex.exec(content)) !== null){
				if (matches[1][0] == '/'){
					matches[1] = matches[1].replace('/','');
				}
				filenames.push(matches[1]);
			}

		});
		return filenames;
	}

	/*
	 * delete_files(files|array)
	 *
	 * Given an array of filepaths, loops through and executes the
	 * grunt.file.delete command on each.
	 */
	function delete_files(files){
		files.forEach(function(filepath){
			grunt.log.writeln("Deleting " + filepath);
			grunt.file.delete(filepath, { force: true });
		});
	}

}