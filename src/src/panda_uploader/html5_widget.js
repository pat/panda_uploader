
PandaUploader.HTML5Widget = function() {
};

PandaUploader.HTML5Widget.prototype = new PandaUploader.BaseWidget();
PandaUploader.HTML5Widget.prototype.constructor = PandaUploader.HTML5Widget;

PandaUploader.HTML5Widget.prototype.init = function() {
    PandaUploader.BaseWidget.prototype.init.apply(this, arguments);
    
    this.xhr = PandaUploader.createXHRObject();
    this.xhr.upload.addEventListener('loadstart', this.boundHandler('onloadstart'), false);
    this.xhr.upload.addEventListener('progress', this.boundHandler('onprogress'), false);
    this.xhr.upload.addEventListener('load', this.boundHandler('onload'), false);
    this.xhr.upload.addEventListener('error', PandaUploader.bind(this, 'onerror'), false);
    this.xhr.upload.addEventListener('abort', this.boundHandler('onabort'), false);

    this.createField();
    
    this.triggerEvent('onwidgetload');
};

PandaUploader.HTML5Widget.prototype.start = function() {
    var file = this.getFile();
    var json_string = PandaUploader.toJSON(this.getSignedParams());
    this.xhr.open('POST', this.options.api_url + '/videos.json', true);
    this.xhr.setRequestHeader("Cache-Control", "no-cache");
    this.xhr.setRequestHeader("Content-Type", "application/octet-stream");
    this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    this.xhr.setRequestHeader("X-File-Name", file.name || file.fileName);
    this.xhr.setRequestHeader("X-Query-Params", json_string);
    this.bindRSCEvent();
    
    this.errorCalled = false;
    if ('name' in file) {
        // W3C-blessed interface
        this.xhr.send(file);
    }
    else {
        // Firefox 3.5
        this.xhr.sendAsBinary(file.getAsBinary());
    }
};

PandaUploader.HTML5Widget.prototype.abort = function() {
    this.xhr.abort();
}

PandaUploader.HTML5Widget.prototype.getFile = function() {
    return jQuery(this.getField()).get(0).files[0];
};

PandaUploader.HTML5Widget.prototype.setValue = function(value) {
    return this.query.val(value);
};

PandaUploader.HTML5Widget.prototype.disable = function() {
    jQuery(this.getField()).attr('disabled', true);
};

PandaUploader.HTML5Widget.prototype.enable = function() {
    jQuery(this.getField()).removeAttr('disabled');
};

PandaUploader.HTML5Widget.prototype.createField = function() {
    this.query.after('<input type="file" />');
    jQuery(this.getField()).change(PandaUploader.bind(this, 'onchange'))
}

PandaUploader.HTML5Widget.prototype.getField = function() {
    return this.query.next().get(0);
};

PandaUploader.HTML5Widget.prototype.onerror = function(event) {
    this.notifyError(event);
};

PandaUploader.HTML5Widget.prototype.notifyError = function(event) {
    if (this.errorCalled) {
        return;
    }
    this.errorCalled = true;
    this.triggerEvent('onerror', [event, this.getFile()]);
}

PandaUploader.HTML5Widget.prototype.onreadystatechange = function(event) {
    this.triggerEvent('onreadystatechange', arguments);

    var status = null;

    try {
        status = event.target.status;
    }
    catch(e) {
        this.bindRSCEvent();
        return;
    }

    if (status == '200' && event.target.responseText) {
        var response = PandaUploader.parseJSON(event.target.responseText);
        this.setValue(response.id);
        this.triggerEvent('onsuccess', [event]);
    }
    else {
      if (status != '200') {
        this.notifyError(event);
      }
      this.bindRSCEvent();
    }
}

PandaUploader.HTML5Widget.prototype.bindRSCEvent = function() {
  jQuery(this.xhr).one('readystatechange', PandaUploader.bind(this, 'onreadystatechange'));
}

PandaUploader.HTML5Widget.prototype.onchange = function() {
    if (this.validateFileExtension() && this.validateFileSize()) {
        this.triggerEvent('onchange');
    }
    else {
        this.query.next('[type=file]').remove();
        this.createField();
    }
    
}

PandaUploader.HTML5Widget.prototype.validateFileExtension = function() {
    var ok = false;
    var that = this;
    jQuery.each(this.options.allowed_extensions, function(i, ext) {
        var re = new RegExp('\\.' + ext + '$', 'i');
        if (re.test(that.getFile().fileName)) {
            ok = true;
        }
    });
    if ( ! ok) {
        PandaUploader.alert("You did not select a video file. Please select a valid file.");
    }
    return ok;
}

PandaUploader.HTML5Widget.prototype.validateFileSize = function() {
    var size = this.getFile().size || this.getFile().fileSize;
    var ok = size < 5368709120;
    if ( ! ok) {
        PandaUploader.alert("The file you are trying to upload is too large. The limit is 5GB");
    }
    return ok;
}
