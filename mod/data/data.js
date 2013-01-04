/**
 * Javascript to insert the field tags into the textarea.
 * Used when editing a data template
 */
function insert_field_tags(selectlist) {
    var value = selectlist.options[selectlist.selectedIndex].value;
    var editorname = 'template';
    if (typeof tinyMCE == 'undefined') {
        var element = document.getElementsByName(editorname)[0];
        // For inserting when in normal textareas
        insertAtCursor(element, value);
    } else {
        tinyMCE.execInstanceCommand(editorname, 'mceInsertContent', false, value);
    }
}

/**
 * javascript for hiding/displaying advanced search form when viewing
 */
function showHideAdvSearch(checked) {
    var divs = document.getElementsByTagName('div');
    for(i=0;i<divs.length;i++) {
        if(divs[i].id.match('data_adv_form')) {
            if(checked) {
                divs[i].style.display = 'inline';
            }
            else {
                divs[i].style.display = 'none';
            }
        }
        else if (divs[i].id.match('reg_search')) {
            if (!checked) {
                divs[i].style.display = 'inline';
            }
            else {
                divs[i].style.display = 'none';
            }
        }
    }
}

M.data_filepicker = {};
M.data_filepicker.Y = null;
M.data_filepicker.instances = [];


M.data_filepicker.callback = function(params) {
    var html = '<a href="'+params['url']+'">'+params['file']+'</a>';
    M.data_filepicker.Y.one('#file_info_'+params['client_id'] + ' .filepicker-filename').setContent(html);
    //When file is added then set status of global variable to true
    var elementname = M.core_filepicker.instances[params['client_id']].options.elementname;
    M.data_filepicker.instances[elementname].fileadded = true;
    //generate event to indicate changes which will be used by disable if or validation code
    M.data_filepicker.Y.one('#id_'+elementname).simulate('change');
};

/**
 * This fucntion is called for each file picker on page.
 */
M.data_filepicker.init = function(Y, options) {
    //Keep reference of YUI, so that it can be used in callback.
    M.data_filepicker.Y = Y;

    //For client side validation, initialize file status for this filepicker
    M.data_filepicker.instances[options.elementname] = {};
    M.data_filepicker.instances[options.elementname].fileadded = false;

    //Set filepicker callback
    options.formcallback = M.data_filepicker.callback;

    if (!M.core_filepicker.instances[options.client_id]) {
        M.core_filepicker.init(Y, options);
    }
    Y.on('click', function(e, client_id) {
        e.preventDefault();
        if (this.ancestor('.fitem.disabled') == null) {
            M.core_filepicker.instances[client_id].show();
        }
    }, '#filepicker-button-'+options.client_id, null, options.client_id);

    var item = document.getElementById('nonjs-filepicker-'+options.client_id);
    if (item) {
        item.parentNode.removeChild(item);
    }
    item = document.getElementById('filepicker-wrapper-'+options.client_id);
    if (item) {
        item.style.display = '';
    }

    var dndoptions = {
        clientid: options.client_id,
        acceptedtypes: options.accepted_types,
        author: options.author,
        maxfiles: -1,
        maxbytes: options.maxbytes,
        itemid: options.itemid,
        repositories: options.repositories,
        formcallback: options.formcallback,
        containerprefix: '#file_info_',
        containerid: 'file_info_'+options.client_id
    };
    M.form_dndupload.init(Y, dndoptions);
};

M.data_urlpicker = {};

M.data_urlpicker.init = function(Y, options) {
    options.formcallback = M.data_urlpicker.callback;
    if (!M.core_filepicker.instances[options.client_id]) {
        M.core_filepicker.init(Y, options);
    }
    Y.on('click', function(e, client_id) {
        e.preventDefault();
        M.core_filepicker.instances[client_id].show();
    }, '#filepicker-button-'+options.client_id, null, options.client_id);

};

M.data_urlpicker.callback = function (params) {
    document.getElementById('field_url_'+params.client_id).value = params.url;
};

M.data_imagepicker = {};

M.data_imagepicker.callback = function(params) {
    var html = '<a href="'+params['url']+'"><img src="'+params['url']+'" /> '+params['file']+'</a>';
    M.data_filepicker.Y.one('#file_info_'+params['client_id'] + ' .filepicker-filename').setContent(html);
    //When file is added then set status of global variable to true
    var elementname = M.core_filepicker.instances[params['client_id']].options.elementname;
    M.data_filepicker.instances[elementname].fileadded = true;
    //generate event to indicate changes which will be used by disable if or validation code
    M.data_filepicker.Y.one('#id_'+elementname).simulate('change');
};

/**
 * This fucntion is called for each file picker on page.
 */
M.data_imagepicker.init = function(Y, options) {
    //Keep reference of YUI, so that it can be used in callback.
    M.data_filepicker.Y = Y;

    //For client side validation, initialize file status for this filepicker
    M.data_filepicker.instances[options.elementname] = {};
    M.data_filepicker.instances[options.elementname].fileadded = false;

    options.formcallback = M.data_imagepicker.callback;
    if (!M.core_filepicker.instances[options.client_id]) {
        M.core_filepicker.init(Y, options);
    }
    Y.on('click', function(e, client_id) {
        e.preventDefault();
        if (this.ancestor('.fitem.disabled') == null) {
            M.core_filepicker.instances[client_id].show();
        }
    }, '#filepicker-button-'+options.client_id, null, options.client_id);

    var item = document.getElementById('nonjs-filepicker-'+options.client_id);
    if (item) {
        item.parentNode.removeChild(item);
    }
    item = document.getElementById('filepicker-wrapper-'+options.client_id);
    if (item) {
        item.style.display = '';
    }
    var dndoptions = {
        clientid: options.client_id,
        acceptedtypes: options.accepted_types,
        author: options.author,
        maxfiles: -1,
        maxbytes: options.maxbytes,
        itemid: options.itemid,
        repositories: options.repositories,
        formcallback: options.formcallback,
        containerprefix: '#file_info_',
        containerid: 'file_info_'+options.client_id
    };
    M.form_dndupload.init(Y, dndoptions);
};
