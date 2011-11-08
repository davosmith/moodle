// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.
/**
 *
 * Drag and drop upload UI
 * =====
 * this.api, stores the URL to make ajax request
 * this.maxfiles
 * this.maxbytes
 *
 * Drag and drop upload options:
 * =====
 * this.options.currentpath
 * this.options.client_id
 * this.options.filemanager - the filemanager element to work with
 * this.options.formcallback - the callback to the filepicker element
 * this.options.itemid
 * this.options.upload_repo - the id of the 'upload' repository
 *
 * Note: one and only one of options.filemanager and options.formcallback
 * must be defined
 */

M.dndupload = {
    api: M.cfg.wwwroot+'/repository/repository_ajax.php',

    init: function(Y, options) {
        if (!options.enabledndupload) {
            return; // Drag and drop has been disabled
        }

        if (!this.browsersupport()) {
            return; // Browser does not support the required functionality
        }

        this.Y = Y;
        this.options = options;
        this.client_id = options.client_id;
        this.maxfiles = options.maxfiles;
        this.maxbytes = options.maxbytes;
        this.itemid = options.itemid;
        this.upload_repo = options.upload_repo;

        this.uploadingcount = 0; // So the filemanager is refreshed when all files have uploaded

        if (options.filemanager) {

            // Needed to tell the filemanager to redraw when files uploaded
            // and to check how many files are already uploaded
            this.filemanager = options.filemanager;
            this.container = this.Y.one('#filemanager-'+this.client_id);
        } else if (options.formcallback) {

            // Needed to tell the filepicker to update when a new
            // file is uploaded
            this.callback = options.formcallback;
            this.container = this.Y.one('#file_info_'+this.client_id);
            this.maxfiles = -1;
        } else {
            alert('dndupload: Need to define either options.filemanager or options.formcallback');
            return;
        }

        // Nasty hack to distinguish between dragenter(first entry), dragenter+dragleave(moving between child elements) and dragleave (leaving element)
        this.entercount = 0;

        this.initevents();
        this.initinstructions();
    },

    // Check the browser has the required functionality
    browsersupport: function() {
        if (typeof FileReader=='undefined') {
            return false;
        }
        if (typeof FormData=='undefined') {
            return false;
        }
        return true;
    },

    // All these events need to be processed for drag and drop to work
    initevents: function() {
        this.Y.on('dragenter', this.dragenter, this.container, this);
        this.Y.on('dragleave', this.dragleave, this.container, this);
        this.Y.on('dragover',  this.dragover,  this.container, this);
        this.Y.on('drop',      this.drop,      this.container, this);
    },

    // Display a message to the user
    initinstructions: function() {
        this.Y.one('#dndenabled-'+this.client_id).setStyle('display', 'inline');
    },

    // Check if the drag contents are valid and then call
    // preventdefault / stoppropagation to let the browser know
    // we will handle this drag/drop
    checkdrag: function(e) {
        if (!this.hasfiles(e)) {
            return false;
        }

        if (this.reachedmaxfiles()) {
            return false;
        }

        e.preventDefault();
        e.stopPropagation();

        return true;
    },

    // Highlight the destination box when a suitable drag event occurs
    dragenter: function(e) {
        if (!this.checkdrag(e)) {
            return true;
        }

        this.entercount++;
        if (this.entercount >= 2) {
            this.entercount = 2; // Just moved over a child element - nothing to do
            return false;
        }

        this.showuploadready();
        return false;
    },

    // Remove the highlight, if the drag leaves the box again
    dragleave: function(e) {
        if (!this.checkdrag(e)) {
            return true;
        }

        this.entercount--;
        if (this.entercount == 1) {
            return false; // Just moved over a child element - nothing to do
        }

        this.entercount = 0;
        this.hideuploadready();
        return false;
    },

    // Just needed to stop the browser hijacking our drag and drop
    dragover: function(e) {
        if (!this.checkdrag(e)) {
            return true;
        }

        return false;
    },

    // Remove the highlight and then upload each of the files (until we
    // reach the file limit, or run out of files)
    drop: function(e) {
        if (!this.checkdrag(e)) {
            return true;
        }

        this.entercount = 0;
        this.hideuploadready();

        var files = e._event.dataTransfer.files;
        if (this.filemanager) {
            var currentfilecount = this.filemanager.filecount;
            for (var i=0, f; f=files[i]; i++) {
                if (currentfilecount >= this.maxfiles && this.maxfiles != -1) {
                    break;
                }
                if (this.uploadfile(f)) {
                    currentfilecount++;
                }
            }
        } else {
            if (files.length >= 1) {
                this.uploadfile(files[0]);
            }
        }

        return false;
    },

    // Check to see if the drag has any files in it
    hasfiles: function(e) {
        var types = e._event.dataTransfer.types;
        for (var i=0; i<types.length; i++) {
            if (types[i] == 'Files') {
                return true;
            }
        }
        return false;
    },

    // Make sure we have not reached the 'maxfiles' limit
    reachedmaxfiles: function() {
        if (this.filemanager) {
            if (this.filemanager.filecount >= this.maxfiles && this.maxfiles != -1) {
                return true;
            }
        }
        return false;
    },

    // Highlight the destination box
    showuploadready: function() {
        this.container.addClass('dndupload-over');
    },

    // Remove the highlight
    hideuploadready: function() {
        this.container.removeClass('dndupload-over');
    },

    // Tell the attached filemanager element (if any) to refresh, once
    // all the files have been uploaded
    redrawfilemanager: function() {
        if (this.filemanager) {
            this.uploadingcount--;
            if (this.uploadingcount <= 0) {
                this.uploadingcount = 0;
                this.filemanager.refresh(this.filemanager.currentpath);
            }
        }
    },

    // Upload a single file via an AJAX call to the 'upload' repository
    uploadfile: function(file) {
        if (file.size > this.maxbytes && this.maxbytes > 0) {
            // Check filesize before attempting to upload
            alert(M.util.get_string('uploadformlimit', 'moodle')+"\n'"+file.name+"'");
            return false;
        }

        this.uploadingcount++; // So we know when to redraw the filemanager

        // This would be an ideal place to use the Y.io function
        // however, this does not support data encoded using the
        // FormData object, which is needed to transfer data from
        // the DataTransfer object into an XMLHTTPRequest
        var xhr = new XMLHttpRequest();
        var self = this;
        xhr.onreadystatechange = function() { // Process the server response
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var result = JSON.parse(xhr.responseText);
                    if (result) {
                        if (result.error) {
                            alert(result.error);
                        } else if (self.callback) {
                            // Only update the filepicker if there were no errors
                            this.uploadingcount = 0;
                            if (result.event == 'fileexists') {
                                // Do not worry about this, as we only care about the last
                                // file uploaded, with the filepicker
                                result.file = result.newfile.filename;
                                result.url = result.newfile.url;
                            }
                            result.client_id = self.client_id;
                            self.callback(result);
                        }
                        // Filemanager is redrawn even if one (or more) files gave an error
                        self.redrawfilemanager();
                    }
                }
            }
        };

        var url = this.api + '?action=upload';

        // Prepare the data to send
        var formdata = new FormData();
        formdata.append('repo_upload_file', file); // The FormData class allows us to attach a file
        formdata.append('sesskey', M.cfg.sesskey);
        formdata.append('repo_id', this.upload_repo);
        formdata.append('itemid', this.itemid);
        if (this.filemanager) { // Filepickers do not have folders
            formdata.append('savepath', this.filemanager.currentpath);
        }
        var accepted_types = this.options.accepted_types;
        if (accepted_types.constructor == Array) {
            for (var i=0; i<accepted_types.length; i++) {
                formdata.append('accepted_types[]', accepted_types[i]);
            }
        } else {
            formdata.append('accepted_types[]', accepted_types);
            // Must be an array to avoid a developer warning on the server
        }

        // Send the file & required details
        xhr.open("POST", url, true);
        xhr.send(formdata);
    }
};
