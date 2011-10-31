
M.form_filepicker = {};
M.form_filepicker.Y = null;
M.form_filepicker.instances = [];

M.form_filepicker.callback = function(params) {
    var html = '<a href="'+params['url']+'">'+params['file']+'</a>';
    document.getElementById('file_info_'+params['client_id']).innerHTML = html;
    //When file is added then set status of global variable to true
    var elementname = M.core_filepicker.instances[params['client_id']].options.elementname;
    M.form_filepicker.instances[elementname].fileadded = true;
    //generate event to indicate changes which will be used by disable if or validation code
    M.form_filepicker.Y.one('#id_'+elementname).simulate('change');
};

/**
 * This fucntion is called for each file picker on page.
 */
M.form_filepicker.init = function(Y, options) {
    //Keep reference of YUI, so that it can be used in callback.
    M.form_filepicker.Y = Y;

    //For client side validation, initialize file status for this filepicker
    M.form_filepicker.instances[options.elementname] = {};
    M.form_filepicker.instances[options.elementname].fileadded = false;

    //Set filepicker callback
    options.formcallback = M.form_filepicker.callback;

    if (!M.core_filepicker.instances[options.client_id]) {
        M.core_filepicker.init(Y, options);
    }
    Y.on('click', function(e, client_id) {
        e.preventDefault();
        M.core_filepicker.instances[client_id].show();
    }, '#filepicker-button-'+options.client_id, null, options.client_id);

    var item = document.getElementById('nonjs-filepicker-'+options.client_id);
    if (item) {
        item.parentNode.removeChild(item);
    }
    item = document.getElementById('filepicker-wrapper-'+options.client_id);
    if (item) {
        item.style.display = '';
    }

    var DndUploadHelper = function(options) {
        DndUploadHelper.superclass.constructor.apply(this, arguments);
    };
    DndUploadHelper.NAME = "DndUpload";
    DndUploadHelper.ATTRS = {
        options: {},
        lang: {}
    };

    Y.extend(DndUploadHelper, Y.Base, {
        api: M.cfg.wwwroot+'/repository/repository_ajax.php',
        initializer: function(options) {
            if (!options.enabledndupload) {
                return;
            }

            if (!this.browsersupport()) {
                return;
            }

            this.options = options;
            this.client_id = options.client_id;
            this.maxbytes = options.maxbytes;
            this.itemid = options.itemid;
            this.upload_repo = options.upload_repo;

            this.container = Y.one('#file_info_'+this.client_id);

            // Needed to tell the filepicker to update when a new
            // file is uploaded
            this.callback = options.formcallback;

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
            Y.on('dragenter', this.dragenter, this.container, this);
            Y.on('dragleave', this.dragleave, this.container, this);
            Y.on('dragover',  this.dragover,  this.container, this);
            Y.on('drop',      this.drop,      this.container, this);
        },

        initinstructions: function() {
            Y.one('#dndenabled-'+this.client_id).setStyle('display', 'inline');
        },

        dragenter: function(e) {
            if (!this.hasfiles(e)) {
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
            if (!this.hasfiles(e)) {
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
            if (!this.hasfiles(e)) {
                return true;
            }

            e.preventDefault();
            e.stopPropagation();

            return false;
        },

        drop: function(e) {
            if (!this.hasfiles(e)) {
                return true;
            }

            e.preventDefault();
            e.stopPropagation();
            this.entercount = 0;

            this.hideuploadready();

            var files = e._event.dataTransfer.files;

            if (files.length >= 1) {
                this.uploadfile(files[0]);
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

        showuploadready: function() {
            this.container.addClass('dndupload-over');
        },

        hideuploadready: function() {
            this.container.removeClass('dndupload-over');
        },

        uploadfile: function(file) {
            if (file.size > this.maxbytes && this.maxbytes > 0) {
                alert(M.util.get_string('uploadformlimit', 'moodle')+"\n'"+file.name+"'");
                return false;
            }

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
                            } else {
                                result.client_id = self.client_id;
                                self.callback(result);
                            }
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
            var accepted_types = this.options.accepted_types;
            if (accepted_types.constructor == Array) {
                for (var i=0; i<accepted_types.length; i++) {
                    formdata.append('accepted_types[]', accepted_types[i]);
                }
            } else {
                formdata.append('accepted_types', accepted_types);
            }

            xhr.open("POST", url, true);
            xhr.send(formdata);
        }
    });

    new DndUploadHelper(options);
};
