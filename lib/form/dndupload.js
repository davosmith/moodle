M.dndupload = {
    api: M.cfg.wwwroot+'/repository/repository_ajax.php',

    init: function(Y, options) {
        if (!options.enabledndupload) {
            return;
        }

        if (!this.browsersupport()) {
            return;
        }

        this.Y = Y;
        this.options = options;
        this.client_id = options.client_id;
        this.maxfiles = options.maxfiles;
        this.maxbytes = options.maxbytes;
        this.itemid = options.itemid;
        this.upload_repo = options.upload_repo;

        this.uploadingcount = 0;

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

    browsersupport: function() {
        if (typeof FileReader=='undefined') {
            return false;
        }
        if (typeof FormData=='undefined') {
            return false;
        }
        return true;
    },

    initevents: function() {
        this.Y.on('dragenter', this.dragenter, this.container, this);
        this.Y.on('dragleave', this.dragleave, this.container, this);
        this.Y.on('dragover',  this.dragover,  this.container, this);
        this.Y.on('drop',      this.drop,      this.container, this);
    },

    initinstructions: function() {
        this.Y.one('#dndenabled-'+this.client_id).setStyle('display', 'inline');
    },

    dragenter: function(e) {
        if (!this.hasfiles(e) || this.reachedmaxfiles()) {
            return true;
        }

        e.preventDefault();
        e.stopPropagation();

        this.entercount++;
        if (this.entercount >= 2) {
            this.entercount = 2; // Just moved over a child element - nothing to do
            return false;
        }

        this.showuploadready();
        return false;
    },

    dragleave: function(e) {
        if (!this.hasfiles(e) || this.reachedmaxfiles()) {
            return true;
        }

        e.preventDefault();
        e.stopPropagation();

        this.entercount--;
        if (this.entercount == 1) {
            return false; // Just moved over a child element - nothing to do
        }

        this.entercount = 0;
        this.hideuploadready();
        return false;
    },

    dragover: function(e) {
        if (!this.hasfiles(e) || this.reachedmaxfiles()) {
            return true;
        }

        e.preventDefault();
        e.stopPropagation();

        return false;
    },

    drop: function(e) {
        if (!this.hasfiles(e) || this.reachedmaxfiles()) {
            return true;
        }

        e.preventDefault();
        e.stopPropagation();
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

    hasfiles: function(e) {
        var types = e._event.dataTransfer.types;
        for (var i=0; i<types.length; i++) {
            if (types[i] == 'Files') {
                return true;
            }
        }
        return false;
    },

    reachedmaxfiles: function() {
        if (this.filemanager) {
            if (this.filemanager.filecount >= this.maxfiles && this.maxfiles != -1) {
                return true;
            }
        }
        return false;
    },

    showuploadready: function() {
        this.container.addClass('dndupload-over');
    },

    hideuploadready: function() {
        this.container.removeClass('dndupload-over');
    },

    redrawfilemanager: function() {
        if (this.filemanager) {
            this.uploadingcount--;
            if (this.uploadingcount <= 0) {
                this.uploadingcount = 0;
                this.filemanager.refresh(this.filemanager.currentpath);
            }
        }
    },

    uploadfile: function(file) {
        if (file.size > this.maxbytes && this.maxbytes > 0) {
            alert(M.util.get_string('uploadformlimit', 'moodle')+"\n'"+file.name+"'");
            return false;
        }

        this.uploadingcount++;

        // This would be an ideal place to use the Y.io function
        // however, this does not support data encoded using the
        // FormData object, which is needed to transfer data from
        // the DataTransfer object into an XMLHTTPRequest
        var xhr = new XMLHttpRequest();
        var self = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var result = JSON.parse(xhr.responseText);
                    if (result) {
                        if (result.error) {
                            alert(result.error);
                        } else if (self.callback) {
                            this.uploadingcount = 0;
                            if (result.event == 'fileexists') {
                                result.file = result.newfile.filename;
                                result.url = result.newfile.url;
                            }
                            result.client_id = self.client_id;
                            self.callback(result);
                        }
                        self.redrawfilemanager();
                    }
                }
            }
        };

        var url = this.api + '?action=upload';

        var formdata = new FormData();
        formdata.append('repo_upload_file', file);
        formdata.append('sesskey', M.cfg.sesskey);
        formdata.append('repo_id', this.upload_repo);
        formdata.append('itemid', this.itemid);
        if (this.filemanager) {
            formdata.append('savepath', this.filemanager.currentpath);
        }
        var accepted_types = this.options.accepted_types;
        if (accepted_types.constructor == Array) {
            for (var i=0; i<accepted_types.length; i++) {
                formdata.append('accepted_types[]', accepted_types[i]);
            }
        } else {
            formdata.append('accepted_types[]', accepted_types);
        }

        xhr.open("POST", url, true);
        xhr.send(formdata);
    }
};
