var astroidFramework = angular.module("astroid-framework", ["ng-sortable", "ngAnimate"]);
astroidFramework.directive("tooltip", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            $(element).hover(function() {
                $(element).tooltip("show")
            }, function() {
                $(element).tooltip("hide")
            })
        }
    }
});
astroidFramework.directive("astroidmediagallery", ["$http", function($http) {
    return {
        restrict: "A",
        scope: true,
        require: "ngModel",
        link: function($scope, $element, $attrs, ngModel) {
            $scope.gallery = {};
            $scope.back = "";
            $scope.folder = "";
            $scope.MEDIA_URL = SITE_URL + $scope.Imgpath + "/";
            $scope.iconsize = 130;
            $scope.getImageUrl = function() {
                if (ngModel.$modelValue == "" || typeof ngModel.$modelValue == "undefined") {
                    $scope.clearImage();
                    return ""
                }
                return $scope.MEDIA_URL + ngModel.$modelValue
            };
            $scope.getFileName = function() {
                if (ngModel.$modelValue == "" || typeof ngModel.$modelValue == "undefined") {
                    $scope.clearImage();
                    return ""
                }
                return ngModel.$modelValue
            };
            $scope.getImgUrl = function(_url) {
                return $scope.MEDIA_URL + _url
            };
            $scope.clearImage = function(_id) {
                ngModel.$setViewValue("");
                try {
                    Admin.refreshScroll()
                } catch (e) {}
            };
            $scope.selectImage = function(_id, _value) {
                ngModel.$setViewValue(_value);
                $scope.selectMedia = false;
                try {
                    Admin.refreshScroll()
                } catch (e) {}
            };
            $scope.getLibrary = function(folder, tab) {
                $("a#" + tab).tab("show");
                $scope.loading = true;
                $scope.folder = folder;
                $scope.bradcrumb = [];
                $.ajax({
                    method: "GET",
                    url: BASE_URL + "index.php?option=com_ajax&astroid=media&action=library&folder=" + folder + "&asset=com_templates&author=",
                    success: function(response) {
                        if (response.status == "error") {
                            $.notify(response.message, {
                                className: "error",
                                globalPosition: "bottom right"
                            });
                            $scope.selectMedia = false;
                            $scope.$apply();
                            return false
                        }
                        $scope.gallery = response.data;
                        $scope.loading = false;
                        var folders = folder.split("/");
                        var bradcrumb = [];
                        var _url = [];
                        var _obj = {
                            name: "Library",
                            url: ""
                        };
                        bradcrumb.push(_obj);
                        folders.forEach(function(_u, _i) {
                            _url.push(_u);
                            var _path = _url.join("/");
                            var _obj = {
                                name: _path == "" ? "Library" : _u,
                                url: _path
                            };
                            bradcrumb.push(_obj)
                        });
                        $scope.bradcrumb = bradcrumb;
                        $scope.$apply()
                    }
                })
            };
            $scope.newFolder = function(_id) {
                var name = prompt(TPL_ASTROID_NEW_FOLDER_NAME_LBL, "");
                if (name === "") {
                    return false
                } else if (name) {
                    var re = /^[0-9a-zA-Z].*/;
                    if (!re.test(name) || /\s/.test(name)) {
                        Admin.notify(TPL_ASTROID_NEW_FOLDER_NAME_INVALID, "error");
                        return false
                    }
                    $scope.loading = true;
                    $.ajax({
                        method: "GET",
                        url: BASE_URL + "index.php?option=com_ajax&astroid=media&action=create-folder&dir=" + $scope.gallery.current_folder + "&name=" + name,
                        success: function(response) {
                            if (response.status == "error") {
                                $.notify(response.message, {
                                    className: "error",
                                    globalPosition: "bottom right"
                                })
                            } else {
                                $.notify(response.data.message, {
                                    className: "success",
                                    globalPosition: "bottom right"
                                });
                                $scope.getLibrary(response.data.folder, _id)
                            }
                            $scope.loading = false;
                            $scope.$apply()
                        }
                    })
                } else {
                    return false
                }
            }
        }
    }
}]);
astroidFramework.directive("astroidsocialprofiles", ["$http", function($http) {
    return {
        restrict: "A",
        scope: true,
        link: function($scope, $element, $attrs) {
            $scope.getId = function(_title) {
                return _title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
            };
            AstroidSocialProfiles.forEach(function(_sp) {
                _sp.id = $scope.getId(_sp.title)
            });
            $scope.astroidsocialprofiles = AstroidSocialProfiles;
            $scope.profiles = AstroidSocialProfilesSelected;
            $scope.addProfile = function() {
                var _profiles = $scope.astroidsocialprofiles;
                _profiles.push({
                    title: "",
                    icon: "",
                    link: "",
                    id: $scope.getId()
                });
                $scope.astroidsocialprofiles = _profiles
            };
            $scope.selectSocialProfile = function(_profile) {
                var _profiles = $scope.profiles;
                _profiles.push(angular.copy(_profile));
                $scope.profiles = _profiles
            };
            $scope.removeSocialProfile = function(_index) {
                var _c = confirm("Are you sure?");
                if (_c) {
                    var _profiles = $scope.profiles;
                    _profiles.splice(_index, 1);
                    $scope.profiles = _profiles
                }
            };
            $scope.refreshScroll = function(_this, profile) {
                profile.enabled = $("#" + _this).is(":checked");
                try {
                    $scope.setProfiles();
                    Admin.refreshScroll()
                } catch (e) {}
            };
            $scope.setProfiles = function() {
                var _profiles = [];
                $scope.astroidsocialprofiles.forEach(function(_profile) {
                    if (_profile.enabled) {
                        _profiles.push(_profile)
                    }
                });
                $scope.profiles = _profiles
            };
            $scope.addCustomProfile = function() {
                var _profile = {
                    color: "#495057",
                    enabled: false,
                    icon: "",
                    icons: [],
                    id: "custom",
                    link: "#",
                    title: "Custom social profile"
                };
                var _profiles = $scope.profiles;
                _profiles.push(angular.copy(_profile));
                $scope.profiles = _profiles
            }
        }
    }
}]);
astroidFramework.directive("astroidsassoverrides", ["$http", function() {
    return {
        restrict: "A",
        scope: true,
        link: function($scope, $element, $attrs) {
            $scope.overrides = AstroidSassOverrideVariables;
            $scope.addOverride = function() {
                var _overrides = $scope.overrides;
                _overrides.push({
                    variable: "",
                    value: "",
                    color: true
                });
                $scope.overrides = _overrides;
                setTimeout(function() {
                    $(".sass-variable-" + (_overrides.length - 1) + "-value").spectrum(spectrumConfig)
                }, 50)
            };
            $scope.removeOverride = function(_index) {
                var _c = confirm("Are you sure?");
                if (_c) {
                    var _overrides = $scope.overrides;
                    _overrides.splice(_index, 1);
                    $scope.overrides = _overrides
                }
            };
            $scope.initSassColorPicker = function(_index, _status) {
                if (_status) {
                    $(".sass-variable-" + _index + "-value").spectrum(spectrumConfig)
                } else {
                    $(".sass-variable-" + _index + "-value").spectrum("destroy")
                }
            };
            setTimeout(function() {
                $scope.overrides.forEach(function(_variable, _index) {
                    if (typeof _variable.color != "undefined" && _variable.color == true) {
                        $(".sass-variable-" + _index + "-value").spectrum(spectrumConfig)
                    } else {
                        _variable.color = false
                    }
                })
            }, 500)
        }
    }
}]);
astroidFramework.directive("dropzone", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var _id = $(element).data("dropzone-id");
            var _dir = $(element).data("dropzone-dir");
            var _media = $(element).data("media");
            $(element).dropzone({
                url: "index.php?option=com_ajax&astroid=media&action=upload&media=" + _media,
                clickable: true,
                success: function(file, response) {
                    if (response.status == "success") {
                        scope.getLibrary(response.data.folder, "astroid-media-tab-library-" + _id)
                    } else {
                        Admin.notify(response.message, "error")
                    }
                    try {
                        Admin.refreshScroll()
                    } catch (e) {}
                },
                complete: function(file) {
                    this.removeAllFiles(true);
                    try {
                        Admin.refreshScroll()
                    } catch (e) {}
                },
                sending: function(file, xhr, formData) {
                    if (_dir) {
                        formData.append("dir", $("#dropzone_folder_" + _id).val())
                    } else {
                        formData.append("dir", "")
                    }
                }
            })
        }
    }
});
astroidFramework.directive("rangeSlider", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            setTimeout(function() {
                ngModel.$setViewValue(parseFloat($(element).data("slider-value")));
                scope.$apply()
            }, 50);
            setTimeout(function() {
                $(element).slider(rangeConfig)
            }, 100);
            setTimeout(function() {
                var _prefix = $(element).data("prefix");
                var _postfix = $(element).data("postfix");
                $(element).on("slide", function(e) {
                    $(element).siblings(".range-slider-value").text(_prefix + e.value + _postfix)
                });
                $(element).siblings(".range-slider-value").text(_prefix + $(element).val() + _postfix);
                var setRange = function() {
                    $(element).slider("setValue", ngModel.$modelValue)
                };
                scope.$watch(attrs["ngModel"], setRange)
            }, 200)
        }
    }
});
astroidFramework.directive("colorPicker", function($parse) {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            if ($(element).hasClass("color-picker-lg")) {
                var spectrumConfigExtend = angular.copy(spectrumConfig);
                spectrumConfigExtend.replacerClassName = "color-picker-lg";
                $(element).spectrum(spectrumConfigExtend)
            } else {
                $(element).spectrum(spectrumConfig)
            }
            $(element).on("move.spectrum", function(e, tinycolor) {
                $(element).spectrum("set", tinycolor.toRgbString())
            });
            var setColor = function() {
                $(element).spectrum("set", ngModel.$modelValue)
            };
            setTimeout(function() {
                var _value = $(element).val();
                $(element).spectrum("set", _value);
                scope.$watch(attrs["ngModel"], setColor)
            }, 200)
        }
    }
});
astroidFramework.directive("colorSelector", function($parse) {
    return {
        restrict: "A",
        link: function(scope, element, attrs, ngModel) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            $(element).spectrum(spectrumConfig);
            $(element).on("move.spectrum", function(e, tinycolor) {
                $(element).spectrum("set", tinycolor.toRgbString()).trigger("change")
            })
        }
    }
});
astroidFramework.directive("animationSelector", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            setTimeout(function() {
                $(element).addClass("astroid-animation-selector");
                $(element).astroidAnimationSelector()
            }, 100)
        }
    }
});
astroidFramework.directive("selectUi", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            var _value = $(element).val();
            setTimeout(function() {
                var _placeholder = $(element).data("placeholder");
                _placeholder = typeof _placeholder == "undefined" ? false : _placeholder;
                $(element).addClass("astroid-select-ui search selection").dropdown({
                    placeholder: _placeholder,
                    fullTextSearch: true
                })
            }, 200)
        }
    }
});
astroidFramework.directive("selectUiAddable", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            setTimeout(function() {
                var _placeholder = $(element).data("placeholder");
                _placeholder = typeof _placeholder == "undefined" ? false : _placeholder;
                $(element).addClass("astroid-select-ui search selection").dropdown({
                    placeholder: _placeholder,
                    fullTextSearch: true
                })
            }, 200)
        }
    }
});
astroidFramework.directive("selectUiDiv", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs, ngModel) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            setTimeout(function() {
                $(element).dropdown({
                    placeholder: false,
                    fullTextSearch: true
                })
            }, 200)
        }
    }
});
astroidFramework.directive("astroidSwitch", function() {
    return {
        restrict: "A",
        transclude: true,
        replace: false,
        require: "ngModel",
        link: function($scope, $element, $attr, require) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            var ngModel = require;
            var updateModelFromElement = function(checked) {
                if (checked && ngModel.$viewValue != 1) {
                    ngModel.$setViewValue(1);
                    $scope.$apply()
                } else if (!checked && ngModel.$viewValue != 0) {
                    ngModel.$setViewValue(0);
                    $scope.$apply()
                } else if (ngModel.$viewValue != 0 && ngModel.$viewValue != 1) {
                    ngModel.$setViewValue(0)
                }
                try {
                    Admin.refreshScroll()
                } catch (e) {}
            };
            var updateElementFromModel = function() {
                if (ngModel.$viewValue == 1) {
                    $element.siblings(".custom-toggle").children(".custom-control-input").prop("checked", true);
                    $element.val(1)
                } else {
                    $element.siblings(".custom-toggle").children(".custom-control-input").prop("checked", false);
                    $element.val(0)
                }
            };
            var initElementFromModel = function() {
                if ($element.val() == 1) {
                    $element.siblings(".custom-toggle").children(".custom-control-input").prop("checked", true);
                    ngModel.$setViewValue(1)
                } else {
                    $element.siblings(".custom-toggle").children(".custom-control-input").prop("checked", false);
                    ngModel.$setViewValue(0)
                }
            };
            $scope.$watch($attr["ngModel"], updateElementFromModel);
            var _id = $element.attr("id");
            $element.attr("id", "");
            $element.wrap("<div/>");
            var _container = $element.parent("div");
            $(_container).append('<div class="custom-control custom-toggle"><input type="checkbox" id="' + _id + '" class="custom-control-input" /><label class="custom-control-label" for="' + _id + '"></label></div>');
            $(_container).find(".custom-control-input").bind("change", function(e) {
                var _checked = $(this).is(":checked");
                updateModelFromElement(_checked)
            });
            setTimeout(function() {
                initElementFromModel()
            }, 250)
        }
    }
});
astroidFramework.directive("draggable", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            $(element).draggable({
                revert: "invalid",
                helper: "clone",
                cursor: "move"
            })
        }
    }
});
astroidFramework.directive("astroidDatetimepicker", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            $(element).datetimepicker({
                icons: {
                    time: "far fa-clock",
                    date: "far fa-calendar-alt",
                    up: "fa fa-angle-up",
                    down: "fa fa-angle-down",
                    next: "fa fa-angle-right",
                    previous: "fa fa-angle-left",
                    today: "fa fa-bullseye",
                    clear: "far fa-trash-alt",
                    close: "fa fa-times"
                },
                format: "MMMM Do YYYY, h:mm a",
                timeZone: TIMEZONE
            })
        }
    }
});
astroidFramework.directive("droppable", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            $(element).droppable({
                classes: {
                    "ui-droppable-active": "has-module",
                    "ui-droppable-hover": "hovered"
                },
                drop: function(event, ui) {
                    var _id = $(ui.draggable).data("module-id");
                    var _title = $(ui.draggable).data("module-title");
                    var _name = $(ui.draggable).data("module-name");
                    var _colIndex = $(this).data("col");
                    var _rowIndex = $(this).data("row");
                    scope.rows[_rowIndex].cols[_colIndex].module.id = _id;
                    scope.rows[_rowIndex].cols[_colIndex].module.title = _title;
                    scope.rows[_rowIndex].cols[_colIndex].module.name = _name;
                    scope.$apply()
                }
            })
        }
    }
});
astroidFramework.directive("popover", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            setTimeout(function() {
                $(element).popover()
            }, 100)
        }
    }
});
astroidFramework.directive("convertToNumber", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(val) {
                return val != null ? parseInt(val, 10) : null
            });
            ngModel.$formatters.push(function(val) {
                return val != null ? "" + val : null
            })
        }
    }
});
astroidFramework.directive("convertToString", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(val) {
                return val != null ? val + "" : null
            });
            ngModel.$formatters.push(function(val) {
                return val != null ? "" + val : null
            })
        }
    }
});
astroidFramework.directive("astroidresponsive", ["$http", function($http) {
    return {
        restrict: "A",
        scope: true,
        require: "ngModel",
        link: function($scope, $element, $attrs, ngModel) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            $($element).parent(".astroidresponsive").append($("#column-responsive-field-template").html());
            var bindFields = function() {
                $($element).parent(".astroidresponsive").find(".responsive-field").bind("change", function() {
                    var _params = [];
                    $(".responsive-field").each(function() {
                        var _param = {};
                        _param.name = $(this).data("name");
                        if ($(this).hasClass("jd-switch")) {
                            _param.value = $(this).is(":checked") ? 1 : 0
                        } else {
                            _param.value = $(this).val()
                        }
                        _params.push(_param)
                    });
                    var _params = JSON.stringify(_params);
                    ngModel.$setViewValue(_params);
                    $($element).val(_params);
                    $scope.$apply()
                })
            };
            var _initValue = false;
            var setValue = function() {
                if (!_initValue) {
                    _initValue = true;
                    if (typeof ngModel.$modelValue != "undefined") {
                        try {
                            var _params = JSON.parse(ngModel.$modelValue)
                        } catch (e) {
                            var _params = []
                        }
                    } else {
                        var _params = []
                    }
                    _params.forEach(function(_param) {
                        var _field = $($element).parent(".astroidresponsive").find('.responsive-field[data-name="' + _param.name + '"]');
                        if (_field.hasClass("jd-switch")) {
                            if (_param.value) {
                                _field.prop("checked", true)
                            } else {
                                _field.prop("checked", false)
                            }
                        } else {
                            _field.val(_param.value)
                        }
                    });
                    setTimeout(function() {
                        bindFields()
                    }, 50)
                }
            };
            setTimeout(function() {
                setValue()
            }, 100)
        }
    }
}]);
astroidFramework.directive("astroidgradient", ["$http", function($http) {
    return {
        restrict: "A",
        scope: true,
        require: "ngModel",
        link: function($scope, $element, $attrs, ngModel) {
            if (typeof $ == "undefined") {
                var $ = jQuery
            }
            var _gradeintPicker = $($element).parent(".astroid-gradient");
            var _typeInput = $(_gradeintPicker).find(".gradient-type");
            var _startInput = $(_gradeintPicker).find(".start-color");
            var _stopInput = $(_gradeintPicker).find(".stop-color");
            var _preview = $(_gradeintPicker).find(".gradient-preview");
            var updatePreview = function() {
                var _start = _startInput.val();
                var _stop = _stopInput.val();
                var _type = "linear";
                _typeInput.each(function() {
                    if ($(this).is(":checked")) {
                        _type = $(this).val()
                    }
                });
                if (_type == "radial") {
                    var _gradiant = "radial-gradient(" + _start + ", " + _stop + ")"
                } else {
                    var _gradiant = "linear-gradient(to bottom, " + _start + " 0%, " + _stop + " 100%)"
                }
                _preview.css("background-image", _gradiant);
                var _params = {
                    type: "linear",
                    start: "transparent",
                    stop: "transparent"
                };
                _params.type = _type;
                _params.start = _start;
                _params.stop = _stop;
                _params = JSON.stringify(_params);
                ngModel.$setViewValue(_params);
                $($element).val(_params);
                $scope.$apply()
            };
            _typeInput.bind("change", updatePreview);
            _startInput.bind("change", updatePreview);
            _stopInput.bind("change", updatePreview);
            var _initValue = false;
            var setValue = function() {
                if (!_initValue) {
                    _initValue = true;
                    if (typeof ngModel.$modelValue != "undefined") {
                        try {
                            var _params = JSON.parse(ngModel.$modelValue)
                        } catch (e) {
                            var _params = {
                                type: "linear",
                                start: "transparent",
                                stop: "transparent"
                            }
                        }
                    } else {
                        var _params = {
                            type: "linear",
                            start: "transparent",
                            stop: "transparent"
                        }
                    }
                    $(_gradeintPicker).find(".gradient-type[value=" + _params.type + "]").prop("checked", true);
                    _startInput.spectrum("set", _params.start);
                    _stopInput.spectrum("set", _params.stop);
                    updatePreview()
                }
            };
            setTimeout(function() {
                setValue()
            }, 100)
        }
    }
}]);
"use strict";

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
String.prototype.shuffle = function() {
    var a = this.split(""),
        n = a.length;
    for (var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp
    }
    return a.join("")
};

function generateID() {
    var r = Math.random() >= .5;
    if (r) {
        var x = Math.floor(Math.random() * 10 + 1);
        var y = Math.floor(Math.random() * 100 + 1);
        var z = Math.floor(Math.random() * 10 + 1)
    } else {
        var x = Math.floor(Math.random() * 10 + 1);
        var y = Math.floor(Math.random() * 10 + 1);
        var z = Math.floor(Math.random() * 100 + 1)
    }
    var t = Date.now();
    return x + y + z + t.toString()
}

function refreshID(_object, _type) {
    switch (_type) {
        case "layout":
            _object.sections.forEach(function(_section) {
                refreshID(_section, "section")
            });
            break;
        case "section":
            _object.id = generateID();
            _object.rows.forEach(function(_row) {
                refreshID(_row, "row")
            });
            break;
        case "row":
            _object.id = generateID();
            _object.cols.forEach(function(_col) {
                refreshID(_col, "col")
            });
            break;
        case "col":
            _object.id = generateID();
            _object.elements.forEach(function(_element) {
                refreshID(_element, "element")
            });
            break;
        case "element":
            _object.id = generateID();
            break
    }
}
var AstroidElement = function AstroidElement(type, title) {
    _classCallCheck(this, AstroidElement);
    this.id = generateID();
    this.type = type;
    this.params = [{
        name: "title",
        value: title
    }];
    this.refreshID = function() {
        this.id = generateID()
    }
};
var AstroidSection = function AstroidSection(type, title) {
    _classCallCheck(this, AstroidSection);
    this.id = generateID();
    this.type = type;
    this.rows = [];
    this.params = [{
        name: "title",
        value: title
    }];
    this.refreshID = function() {
        this.id = generateID()
    }
};
var AstroidRegularSection = function(_AstroidSection) {
    _inherits(AstroidRegularSection, _AstroidSection);

    function AstroidRegularSection() {
        _classCallCheck(this, AstroidRegularSection);
        return _possibleConstructorReturn(this, (AstroidRegularSection.__proto__ || Object.getPrototypeOf(AstroidRegularSection)).call(this, "regular-section", "Astroid Section"))
    }
    return AstroidRegularSection
}(AstroidSection);
var AstroidFullWidthSection = function(_AstroidSection2) {
    _inherits(AstroidFullWidthSection, _AstroidSection2);

    function AstroidFullWidthSection() {
        _classCallCheck(this, AstroidFullWidthSection);
        return _possibleConstructorReturn(this, (AstroidFullWidthSection.__proto__ || Object.getPrototypeOf(AstroidFullWidthSection)).call(this, "ful-width", "Full Width"))
    }
    return AstroidFullWidthSection
}(AstroidSection);
var AstroidSpecialSection = function(_AstroidSection3) {
    _inherits(AstroidSpecialSection, _AstroidSection3);

    function AstroidSpecialSection() {
        _classCallCheck(this, AstroidSpecialSection);
        return _possibleConstructorReturn(this, (AstroidSpecialSection.__proto__ || Object.getPrototypeOf(AstroidSpecialSection)).call(this, "special", "Special Section"))
    }
    return AstroidSpecialSection
}(AstroidSection);
var AstroidRow = function AstroidRow() {
    _classCallCheck(this, AstroidRow);
    this.id = generateID();
    this.cols = []
};
var AstroidColumn = function AstroidColumn() {
    _classCallCheck(this, AstroidColumn);
    this.id = generateID();
    this.elements = [];
    this.size = 12;
    this.type = "column";
    this.params = [{
        name: "title",
        value: ""
    }]
};
astroidFramework.controller("layoutController", function($scope, $compile) {
    $scope.grids = ASTROID_GRIDS;
    $scope.elements = AstroidLayoutBuilderElements;
    $scope.sections = [];
    $scope.sections.push(AstroidRegularSection);
    $scope.chooseRow = {
        open: 0,
        section: null
    };
    $scope.chooseRowColumns = {
        open: 0,
        row: null,
        section: null
    };
    $scope.chooseElement = {
        open: 0,
        column: null,
        row: null,
        section: null
    };
    $scope.chooseSection = {
        open: 0,
        section: null
    };
    $scope.savingSection = {
        open: 0,
        section: null
    };
    $scope.editingElement = {
        open: 0,
        element: null,
        template: ""
    };
    $scope.editSectionTitle = {
        title: "",
        editing: false
    };
    $scope.layout = _layout;
    $scope.save = function() {
        console.log($scope.layout)
    };
    $scope.focusEditTitle = function($event, _section) {
        $scope.editSectionTitle.editing = true;
        $scope.editSectionTitle.title = $scope.getParam(_section, "title");
        setTimeout(function() {
            $($event.currentTarget).siblings("input").focus()
        }, 50)
    };
    $scope.layoutHistory = [];
    $scope.historyIndex = -1;
    $scope.backIndex = -1;
    $scope.getObject = function(_class) {
        return new _class
    };
    $scope.addingSection = function(_sectionIndex) {
        $scope.chooseSection = {
            open: 1,
            section: _sectionIndex
        }
    };
    $scope.addSection = function(_index) {
        var _sections = $scope.layout.sections;
        var _section = new AstroidSection("section", "Astroid Section");
        var _col = new AstroidColumn;
        _col.size = 12;
        var _row = new AstroidRow;
        _row.cols.push(_col);
        _section.rows.push(_row);
        var sectionIndex = 0;
        if (_index == null) {
            _sections.push(_section);
            sectionIndex = _sections.length - 1
        } else {
            _sections.splice(_index + 1, 0, _section);
            sectionIndex = _index + 1
        }
        $scope.layout.sections = _sections;
        $scope.chooseSection = {
            open: 0,
            section: null
        };
        $scope.editRow(0, sectionIndex);
        $scope.actionPreformed()
    };
    $scope.duplicateSection = function(_sectionIndex) {
        var _section = angular.copy($scope.layout.sections[_sectionIndex]);
        _section = $scope.checkBeforeDuplicate("section", _section);
        refreshID(_section, "section");
        var _sections = $scope.layout.sections;
        _sections.splice(_sectionIndex + 1, 0, _section);
        $scope.layout.sections = _sections;
        $scope.actionPreformed()
    };
    $scope.addToLibrarySection = function(_section) {
        console.log(_section);
        console.log("Added to library");
        $scope.savingSection = {
            open: 0,
            section: null
        }
    };
    $scope.removeSection = function(_sectionIndex) {
        var c = confirm("Are you sure?");
        if (c) {
            var _sections = $scope.layout.sections;
            _sections.splice(_sectionIndex, 1);
            $scope.layout.sections = _sections;
            $scope.actionPreformed()
        }
    };
    $scope.updateSectionTitle = function(_section) {
        if ($scope.editSectionTitle.title == "") {
            $scope.editSectionTitle.title = "Astroid Section"
        }
        $scope.setParam(_section, "title", $scope.editSectionTitle.title);
        $scope.editSectionTitle.editing = false;
        $scope.editSectionTitle.title = ""
    };
    $scope.editRow = function(_rowIndex, _sectionIndex) {
        $scope.chooseRowColumns = {
            open: 1,
            row: _rowIndex,
            section: _sectionIndex
        }
    };
    $scope.updateRow = function(_rowIndex, _sectionIndex, _grid) {
        if (_grid == "custom") {
            var _grid = $scope.getCustomGrid();
            if (_grid === false) {
                return false
            }
        }
        var _columns = $scope.layout.sections[_sectionIndex].rows[_rowIndex].cols;
        var _updatedColumns = [];
        if (_grid.length < _columns.length) {
            _columns.forEach(function(_column, _i) {
                if (typeof _grid[_i] != "undefined") {
                    _column.size = _grid[_i];
                    _updatedColumns.push(_column)
                } else {
                    var _elements = _updatedColumns[_grid.length - 1].elements;
                    _column.elements.forEach(function(_el) {
                        _elements.push(_el)
                    });
                    _updatedColumns[_grid.length - 1].elements = _elements
                }
            })
        } else {
            _grid.forEach(function(_size, _i) {
                if (typeof _columns[_i] != "undefined") {
                    var _c = _columns[_i];
                    _c.size = _size;
                    _updatedColumns.push(_c)
                } else {
                    var _col = new AstroidColumn;
                    _col.size = _size;
                    _updatedColumns.push(_col)
                }
            })
        }
        $scope.layout.sections[_sectionIndex].rows[_rowIndex].cols = _updatedColumns;
        $scope.chooseRowColumns = {
            open: 0,
            row: null,
            section: null
        };
        $scope.actionPreformed()
    };
    $scope.getCustomGrid = function() {
        var grid = prompt("Please enter custom grid size (eg. 2+3+6+1)", "");
        if (grid != null) {
            grid = grid.split("+");
            if ($scope.isValidGrid(grid)) {
                return grid
            } else {
                alert("Invalid grid size.");
                return false
            }
        }
        return false
    };
    $scope.isValidGrid = function(_grid) {
        var _total = 0;
        _grid.forEach(function(_g) {
            _total += parseInt(_g)
        });
        if (_total == 12) {
            return true
        } else {
            return false
        }
    };
    $scope.duplicateRow = function(_rowIndex, _sectionIndex) {
        var _row = angular.copy($scope.layout.sections[_sectionIndex].rows[_rowIndex]);
        var _row = $scope.checkBeforeDuplicate("row", _row);
        refreshID(_row, "row");
        var _rows = $scope.layout.sections[_sectionIndex].rows;
        _rows.splice(_rowIndex + 1, 0, _row);
        $scope.layout.sections[_sectionIndex].rows = _rows;
        $scope.actionPreformed()
    };
    $scope.addingRow = function(_index) {
        $scope.chooseRow = {
            open: 1,
            section: _index
        }
    };
    $scope.addRow = function(_index, _layout) {
        if (_layout == "custom") {
            var _layout = $scope.getCustomGrid();
            if (_layout === false) {
                return false
            }
        }
        var _section = $scope.layout.sections[_index];
        var _row = new AstroidRow;
        _layout.forEach(function(_size) {
            var _col = new AstroidColumn;
            _col.size = _size;
            _row.cols.push(_col)
        });
        _section.rows.push(_row);
        $scope.layout.sections[_index] = _section;
        $scope.chooseRow.open = 0;
        $scope.chooseRow.section = null;
        $scope.actionPreformed()
    };
    $scope.removeRow = function(_rowIndex, _sectionIndex) {
        var c = confirm("Are you sure?");
        if (c) {
            var _rows = $scope.layout.sections[_sectionIndex].rows;
            _rows.splice(_rowIndex, 1);
            $scope.layout.sections[_sectionIndex].rows = _rows;
            $scope.actionPreformed()
        }
    };
    $scope.setColumn = function(_column) {
        if (typeof _column.type == "undefined") {
            _column.type = "column"
        }
    };
    $scope.addingElement = function(_colIndex, _rowIndex, _sectionIndex, _elementIndex) {
        $scope.chooseElement = {
            open: 1,
            column: _colIndex,
            row: _rowIndex,
            section: _sectionIndex,
            element: _elementIndex
        }
    };
    $scope.addElement = function(_colIndex, _rowIndex, _sectionIndex, _elementIndex, _element) {
        _element = new AstroidElement(_element.type, _element.title);
        var _elements = $scope.layout.sections[_sectionIndex].rows[_rowIndex].cols[_colIndex].elements;
        if (_elementIndex == null) {
            _elements.push(_element)
        } else {
            _elements.splice(_elementIndex + 1, 0, _element)
        }
        $scope.layout.sections[_sectionIndex].rows[_rowIndex].cols[_colIndex].elements = _elements;
        $scope.chooseElement = {
            open: 0,
            column: null,
            row: null,
            section: null,
            element: null
        };
        $scope.actionPreformed();
        $scope.editElement(_element)
    };
    $scope.removeElement = function(_elementIndex, _colIndex, _rowIndex, _sectionIndex) {
        var c = confirm("Are you sure?");
        if (c) {
            var _elements = $scope.layout.sections[_sectionIndex].rows[_rowIndex].cols[_colIndex].elements;
            _elements.splice(_elementIndex, 1);
            $scope.layout.sections[_sectionIndex].rows[_rowIndex].cols[_colIndex].elements = _elements;
            $scope.actionPreformed()
        }
    };
    $scope.getParam = function(_element, _key) {
        var _value = "";
        _element.params.forEach(function(_param) {
            if (_param.name == _key) {
                _value = _param.value;
                return false
            }
        });
        return _value
    };
    $scope.setParam = function(_element, _key, _value) {
        _element.params.forEach(function(_param) {
            if (_param.name == _key) {
                _param.value = _value;
                return false
            }
        });
        return true
    };
    $scope.elementParams = {};
    $scope.editElement = function(_element, _focus) {
        Admin.ringLoading($("#element-settings").children(".ezlb-pop-body"), true);
        var _template = $("#element-form-template-" + _element.type).html();
        $scope.elementParams = {};
        var _temp = {};
        angular.element(document.getElementById("element-settings-form")).html($compile(_template)($scope, function() {
            $("#element-settings").addClass("open");
            var _params = {};
            if (typeof _element.params != "undefined") {
                _element.params.forEach(function(_p) {
                    _params[_p.name] = _p.value
                })
            }
            _temp = angular.copy(_params);
            $scope.elementParams = _params;
            setTimeout(function() {
                var _change = false;
                $.each(_temp, function(_key, _value) {
                    var _f = $("#element-settings-form").find('[name="' + _key + '"]');
                    if (_f.length) {
                        if (_f.attr("type") == "radio") {
                            $scope.elementParams[_key] = _value;
                            _change = true
                        }
                    }
                });
                if (_change) {
                    $scope.$apply()
                }
                Admin.ringLoading($("#element-settings").children(".ezlb-pop-body"), false);
                if (typeof _focus != "undefined") {
                    $("#element-settings").find("#" + _focus).focus()
                }
                Admin.initPop()
            }, 500)
        }));
        $("#element-form-" + _element.type).submit(function(event) {
            event.preventDefault(event);
            var _data = $(this).serializeArray();
            _element.params = _data;
            $scope.elementParams = {};
            $("#element-settings-save").unbind();
            $("#element-form-" + _element.type).unbind();
            angular.element(document.getElementById("element-settings-form")).html($compile("")($scope));
            $("#element-settings").removeClass("open");
            $scope.$apply();
            return false
        });
        $("#element-settings-save").bind("click", function() {
            $("#element-form-" + _element.type).submit()
        });
        $("#element-settings-close").click(function() {
            $("#element-settings-save").unbind();
            $("#element-form-" + _element.type).unbind();
            $scope.elementParams = {};
            angular.element(document.getElementById("element-settings-form")).html($compile("")($scope));
            $scope.$apply();
            $("#element-settings").removeClass("open")
        })
    };
    $scope.saveElement = function(_form) {
        var _data = $("#" + _form).serialize()
    };
    $scope.getElementByType = function(_type) {
        var _element = {};
        $scope.elements.forEach(function(_el) {
            if (_el.type == _type) {
                _element = _el
            }
        });
        return _element
    };
    $scope.duplicateElement = function(_elementIndex, _colIndex, _rowIndex, _sectionIndex) {
        var _element = angular.copy($scope.layout.sections[_sectionIndex].rows[_rowIndex].cols[_colIndex].elements[_elementIndex]);
        refreshID(_element, "element");
        var _elements = $scope.layout.sections[_sectionIndex].rows[_rowIndex].cols[_colIndex].elements;
        _elements.splice(_elementIndex + 1, 0, _element);
        $scope.layout.sections[_sectionIndex].rows[_rowIndex].cols[_colIndex].elements = _elements;
        $scope.actionPreformed()
    };
    $scope.checkBeforeDuplicate = function(_type, _object) {
        switch (_type) {
            case "section":
                _object.rows.forEach(function(_row) {
                    _row = $scope.checkBeforeDuplicate("row", _row)
                });
                return _object;
                break;
            case "row":
                _object.cols.forEach(function(_col) {
                    _col = $scope.checkBeforeDuplicate("column", _col)
                });
                return _object;
                break;
            case "column":
                var _elements = [];
                _object.elements.forEach(function(_element) {
                    if ($scope.checkBeforeDuplicate("element", _element)) {
                        _elements.push(_element)
                    }
                });
                _object.elements = _elements;
                return _object;
                break;
            case "element":
                return $scope.canAddElement($scope.getElementByType(_object.type));
                break
        }
    };
    $scope.actionPreformed = function() {
        $scope.saveHistory();
        setTimeout(function() {
            Admin.refreshScroll()
        }, 200)
    };
    $scope.saveHistory = function() {
        var _history = $scope.layoutHistory;
        _history.push({
            date: new Date,
            layout: angular.copy($scope.layout)
        });
        $scope.layoutHistory = _history;
        $scope.historyIndex = $scope.historyIndex + 1;
        $scope.backIndex = $scope.backIndex + 1
    };
    $scope.saveHistory();
    $scope.setFormData = function(form, data) {
        $.each(data, function() {
            var key = this.name;
            var value = this.value;
            var ctrl = $('[name="' + key + '"]', form);
            switch (ctrl.prop("type")) {
                case "radio":
                case "checkbox":
                    ctrl.each(function() {
                        if ($(this).attr("value") == value) $(this).attr("checked", value)
                    });
                    break;
                default:
                    ctrl.val(value)
            }
            ctrl.change()
        })
    };
    $scope.canAddElement = function(_element) {
        if (_element.multiple) {
            return true
        } else {
            if ($scope.hasElement(_element.type)) {
                return false
            } else {
                return true
            }
        }
    };
    $scope.hasElement = function(_type) {
        var _has = false;
        $scope.layout.sections.forEach(function(_section) {
            if (_has) {
                return false
            }
            _section.rows.forEach(function(_row) {
                if (_has) {
                    return false
                }
                _row.cols.forEach(function(_col) {
                    if (_has) {
                        return false
                    }
                    _col.elements.forEach(function(_element) {
                        if (_has) {
                            return false
                        }
                        if (_element.type == _type) {
                            _has = true;
                            return false
                        }
                    })
                })
            })
        });
        return _has
    };
    $scope.back = function() {};
    $scope.forward = function() {};
    $scope.exportLayout = function() {
        var _layout = angular.copy($scope.layout);
        var dataStr = JSON.stringify(_layout);
        var dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        var exportFileDefaultName = "astroid-layout.json";
        var linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click()
    };
    $scope.importLayout = function() {
        $("#astroid-layout-import").click()
    }
});
(function($) {
    $(function() {
        $(".compress").click(function() {
            $(this).parent(".ezlb-pop-header").parent(".ezlb-pop-body").addClass("left-push")
        });
        $(".expand").click(function() {
            $(this).parent(".ezlb-pop-header").parent(".ezlb-pop-body").removeClass("left-push")
        });
        $(document).bind("keydown", "ctrl+z", function() {
            angular.element(document.getElementById("layoutController")).scope().back()
        });
        $(document).bind("keydown", "meta+z", function() {
            angular.element(document.getElementById("layoutController")).scope().back()
        });
        $(document).bind("keydown", "ctrl+y", function() {
            angular.element(document.getElementById("layoutController")).scope().forward()
        });
        $(document).bind("keydown", "meta+y", function() {
            angular.element(document.getElementById("layoutController")).scope().forward()
        })
    })
})(jQuery);

function uploadLayoutJSON() {
    var input = document.getElementById("astroid-layout-import");
    if (!input) {} else if (!input.files) {} else if (!input.files[0]) {} else {
        var file = input.files[0];
        var reader = new FileReader;
        reader.addEventListener("load", function() {
            var _json = checkUploadedJSON(reader.result);
            if (_json !== false) {
                var scope = angular.element(document.getElementById("layoutController")).scope();
                scope.layout = _json;
                scope.$apply()
            }
        }, false);
        if (file) {
            reader.readAsText(file)
        }
    }
    $("#astroid-layout-import").val("")
}

function checkUploadedJSON(text) {
    if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
        var json = JSON.parse(text)
    } else {
        Admin.notify("Invalid JSON");
        return false
    }
    if (json == "" || json == null || typeof json.sections == "undefined") {
        Admin.notify("Invalid Layout file");
        return false
    }
    return json
}
"use strict";

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
var spectrumConfig = {
    flat: $(undefined).data("flat") ? true : false,
    showInput: true,
    showInitial: false,
    allowEmpty: true,
    showAlpha: true,
    disabled: false,
    showPalette: true,
    showPaletteOnly: false,
    showSelectionPalette: true,
    showButtons: false,
    preferredFormat: "rgb",
    localStorageKey: "astroid.colors",
    palette: [
        ["#fff", "#f8f9fa", "#dee2e6", "#adb5bd", "#495057", "#343a40", "#212529", "#000"],
        ["#007bff", "#8445f7", "#ff4169", "#c4183c", "#fb7906", "#ffb400", "#17c671", "#00b8d8"]
    ],
    change: function change(color) {}
};
var dropdownConfig = {
    placeholder: false,
    fullTextSearch: true
};
var rangeConfig = {};
var presetProps = ["preloader_color", "preloader_bgcolor", "backtotop_icon_color", "backtotop_icon_bgcolor", "body_background_color", "body_text_color", "body_link_color", "body_link_hover_color", "header_bg", "header_text_color", "header_logo_text_color", "header_logo_text_tagline_color", "stick_header_bg_color", "stick_header_menu_link_color", "stick_header_menu_link_active_color", "stick_header_menu_link_hover_color", "main_menu_link_color", "main_menu_link_active_color", "main_menu_link_hover_color", "dropdown_bg_color", "dropdown_link_color", "dropdown_menu_active_link_color", "dropdown_menu_active_bg_color", "dropdown_menu_link_hover_color", "dropdown_menu_hover_bg_color", "mobile_backgroundcolor", "mobile_menu_text_color", "mobile_menu_link_color", "mobile_menu_active_link_color", "mobile_menu_active_bg_color", "h1_typography_options.font_color", "h2_typography_options.font_color", "h3_typography_options.font_color", "h4_typography_options.font_color", "h5_typography_options.font_color", "h6_typography_options.font_color", "icon_color", "background_color", "img_background_color", "background_color_404", "img_background_color_404", "theme_blue", "theme_indigo", "theme_purple", "theme_pink", "theme_red", "theme_orange", "theme_yellow", "theme_green", "theme_teal", "theme_cyan", "theme_white", "theme_gray100", "theme_gray600", "theme_gray800"];
(function($) {
    $.fn.astroidAnimationSelector = function(options) {
        var settings = $.extend({
            actor: ".animation-actor",
            createActor: true
        }, options);
        return this.each(function() {
            var _select = $(this);
            var _animate = false;
            if (settings.createActor) {
                _select.after('<span title="Animate it" class="animation-actor"><span>').append("<span><span>");
                var _actor = _select.next(".animation-actor")
            }
            _select.addClass("search selection");
            _select.dropdown({
                placeholder: false,
                fullTextSearch: true,
                onChange: function onChange(value, text, $choice) {
                    clearTimeout(_animate);
                    _actor.children("span").removeClass();
                    var _animation = value;
                    _animation = _animation.replace("string:", "");
                    _actor.children("span").removeClass().addClass("animated").addClass(_animation);
                    _animate = setTimeout(function() {
                        _actor.children("span").removeClass()
                    }, 1500)
                }
            });
            _actor.bind("click", function() {
                clearTimeout(_animate);
                _actor.children("span").removeClass();
                var _animation = _select.val();
                _animation = _animation.replace("string:", "");
                _actor.children("span").removeClass().addClass("animated").addClass(_animation);
                _animate = setTimeout(function() {
                    _actor.children("span").removeClass()
                }, 1500)
            })
        })
    }
})(jQuery);
var AstroidForm = function AstroidForm(form) {
    _classCallCheck(this, AstroidForm);
    this.form = $(form);
    this.init = function() {};
    this.reload = function() {}
};
var AstroidContentLayout = function AstroidContentLayout() {
    _classCallCheck(this, AstroidContentLayout);
    this.positions = $("[data-astroid-content-layout]");
    this.loads = $("[data-astroid-content-layout-load]");
    this.input = $(".astroidcontentlayouts");
    this.layouts = [];
    this.save = function() {
        var _row = [];
        var _layouts = this.layouts;
        _layouts.forEach(function(_l) {
            _row.push(_l.join(":"))
        });
        this.input.val(_row.join(","))
    };
    this.refresh = function() {
        var _layouts = [];
        var _this = this;
        _this.positions.each(function() {
            var _field = $(this);
            var _layout = _field.data("astroid-content-layout");
            var _fieldname = _field.data("fieldname");
            var _load = $('[data-astroid-content-layout-load="' + _fieldname + '"]').val();
            if (typeof _load == "undefined" || _load == "" || _load == null || _load != "after" && _load != "before") {
                _load = "after"
            } else {
                _load = _load
            }
            if (_layout != "" && _field.val() != "") {
                _layouts.push([_layout, _field.val(), _load])
            }
        });
        _this.layouts = _layouts;
        _this.save()
    };
    this.init = function() {
        var _this = this;
        _this.refresh();
        _this.loads.change(function() {
            _this.refresh()
        });
        _this.positions.change(function() {
            _this.refresh()
        })
    }
};
var AstroidAdmin = function AstroidAdmin() {
    _classCallCheck(this, AstroidAdmin);
    this.saved = true;
    this.notify = function(message, type) {
        $.notify(message, {
            className: type,
            globalPosition: "bottom right"
        })
    };
    this.ringLoading = function(_el, _st) {
        if (_st) {
            $(_el).children(".astroid-ring-loading").show()
        } else {
            $(_el).children(".astroid-ring-loading").hide()
        }
    };
    this.initSidebar = function() {
        var _class = this;
        $('.sidebar-nav > li > a[data-toggle="tab"]').on("shown.bs.tab", function(e) {
            $("body").removeClass("show-options");
            if ($("body").hasClass("astroid-live-preview")) {
                _class.refreshPreviewScrolls()
            }
            if ($(e.target).attr("data-target") == "#astroid-tab-astroid_layout") {
                $("body").addClass("astroid-layout-tab-selected")
            } else {
                $("body").removeClass("astroid-layout-tab-selected")
            }
            $.cookie("astroid-default-tab", $(e.target).attr("data-target"));
            $(".sidebar-submenu").slideUp(500);
            $(e.target).siblings(".sidebar-submenu").slideDown(500);
            setTimeout(function() {
                $("body, html").animate({
                    scrollTop: 0
                }, 0);
                if (!$("body").hasClass("astroid-live-preview")) {
                    _class.refreshScroll()
                }
            }, 510);
            $("body, html").animate({
                scrollTop: 2
            }, 0)
        })
    };
    this.initTabs = function() {
        $(".hash-link").click(function(e) {
            e.preventDefault();
            var _group = $(this).attr("href");
            $("body, html").animate({
                scrollTop: $(_group).offset().top - 68
            }, 100);
            setTimeout(function() {
                $(window).trigger("scroll")
            }, 110)
        })
    };
    this.initPop = function() {
        $(".compress").click(function() {
            $(this).parent(".ezlb-pop-header").parent(".ezlb-pop-body").addClass("left-push");
            $(this).parent(".ezlb-pop-header").parent("div").parent(".ezlb-pop-body").addClass("left-push")
        });
        $(".expand").click(function() {
            $(this).parent(".ezlb-pop-header").parent(".ezlb-pop-body").removeClass("left-push");
            $(this).parent(".ezlb-pop-header").parent("div").parent(".ezlb-pop-body").removeClass("left-push")
        });
        $(".ezlb-pop-header .nav-tabs li a").on("click", function(e) {
            e.preventDefault();
            var _this = $(this);
            if (!_this.hasClass("active")) {
                Admin.ringLoading($("#element-settings").children(".ezlb-pop-body"), true)
            }
        });
        $(".ezlb-pop-header .nav-tabs li a").on("shown.bs.tab", function(e) {
            e.preventDefault();
            setTimeout(function() {
                Admin.ringLoading($("#element-settings").children(".ezlb-pop-body"), false)
            }, 100)
        })
    };
    this.initScroll = function() {
        $("#astroid-sidebar-wrapper").niceScroll({
            autohidemode: "leave",
            cursoropacitymin: .4,
            background: "rgba(255,255,255,0.5)",
            cursorcolor: "#4A5768",
            cursorwidth: "7px",
            cursorborderradius: 0,
            cursorborder: "none"
        });
        $("body").niceScroll({
            autohidemode: "leave",
            cursoropacitymin: .4,
            background: "rgba(255,255,255,0.5)",
            cursorcolor: "#4A5768",
            cursorwidth: "7px",
            cursorborderradius: 0,
            cursorborder: "none"
        })
    };
    this.initScrollSpy = function() {
        $("body").scrollspy({
            target: "#astroid-menu",
            offset: 101
        })
    };
    this.refreshScroll = function() {
        setTimeout(function() {
            $("#astroid-sidebar-wrapper").getNiceScroll().resize();
            $("body").getNiceScroll().resize()
        }, 300)
    };
    this.livePreview = function() {
        $("body").addClass("astroid-live-preview");
        $("body").addClass("show-options");
        setTimeout(function() {
            Admin.livePreviewScrolls()
        }, 220);
        Admin.hideAllTabs()
    };
    this.reloadPreview = function() {
        if ($("body").hasClass("astroid-live-preview")) {
            var iframe = document.getElementById("live-preview");
            iframe.src = iframe.src + "?ts=" + generateID()
        }
    };
    this.hideAllTabs = function() {
        $("#astroid-menu li a").removeClass("active");
        $("#astroid-menu li a").removeClass("show");
        $("#astroid-menu li a").prop("aria-selected", false)
    };
    this.closeLivePreview = function() {
        $("body").removeClass("astroid-live-preview");
        $("body").removeClass("show-options");
        setTimeout(function() {
            $("#astroid-content-wrapper").getNiceScroll().remove();
            Admin.refreshScroll()
        }, 220)
    };
    this.livePreviewScrolls = function() {
        $("#astroid-content-wrapper").niceScroll({
            autohidemode: "leave",
            cursoropacitymin: .4,
            background: "rgba(243,243,243,1)",
            cursorcolor: "#4A5768",
            cursorwidth: "7px",
            cursorborderradius: 0,
            cursorborder: "none"
        });
        Admin.refreshPreviewScrolls()
    };
    this.setPreviewViewport = function(_class, _obj) {
        $("#live-preview-viewport").removeClass().addClass(_class);
        $(".viewport-options").find("a").removeClass("active");
        $(_obj).addClass("active")
    };
    this.refreshPreviewScrolls = function() {
        setTimeout(function() {
            $("#astroid-content-wrapper").getNiceScroll().resize();
            $("#astroid-sidebar-wrapper").getNiceScroll().resize()
        }, 50)
    };
    this.showOptions = function() {
        $("body").addClass("show-options");
        $("body").removeClass("astroid-layout-tab-selected");
        Admin.refreshPreviewScrolls();
        Admin.hideAllTabs()
    };
    this.initForm = function() {
        $("#astroid-form").parsley({
            focus: "last"
        }).on("field:error", function() {
            var fieldset = $(this.$element).parent("div").data("fieldset");
            $('[data-target="#' + fieldset + '"]').tab("show")
        }).on("form:submit", function() {
            var data = $("#astroid-form").serializeArray();
            var _export = parseInt($("#export-form").val());
            $("#astroid-manager-disabled").show();
            if (!_export) {
                $("#save-options").addClass("d-none");
                $("#saving-options").removeClass("d-none")
            }
            $("#save-options").prop("disabled", true);
            $("#export-options").prop("disabled", true);
            $("#export-preset").prop("disabled", true);
            $("#import-options").prop("disabled", true);
            $("#save-options").addClass("disabled");
            $("#export-options").addClass("disabled");
            $("#export-preset").addClass("disabled");
            $("#import-options").addClass("disabled");
            $.ajax({
                method: "POST",
                url: $("#astroid-form").attr("action"),
                data: data,
                dataType: "json",
                success: function success(response) {
                    $("#astroid-manager-disabled").hide();
                    $("#save-options").removeClass("d-none");
                    $("#saving-options").addClass("d-none");
                    $("#save-options").prop("disabled", false);
                    $("#export-options").prop("disabled", false);
                    $("#export-preset").prop("disabled", false);
                    $("#import-options").prop("disabled", false);
                    $("#save-options").removeClass("disabled");
                    $("#export-options").removeClass("disabled");
                    $("#export-preset").removeClass("disabled");
                    $("#import-options").removeClass("disabled");
                    $("#export-form").val(0);
                    if (response.status == "error") {
                        Admin.notify(response.message, "error");
                        return false
                    }
                    Admin.saved = true;
                    Admin.reloadPreview();
                    if (!_export) {
                        Admin.notify("Template Saved.", "success")
                    } else {
                        Admin.exportSettings(response.data)
                    }
                }
            });
            return false
        });
        $("#save-options").click(function() {
            $("#astroid-form").submit();
            return false
        });
        $("#export-options").click(function() {
            $("#export-form").val(1);
            $("#astroid-form").submit();
            return false
        });
        $("#import-options").click(function() {
            $("#astroid-settings-import").click();
            return false
        });
        $("#astroid-settings-import").on("change", function() {
            var input = document.getElementById("astroid-settings-import");
            if (!input) {} else if (!input.files) {} else if (!input.files[0]) {} else {
                var file = input.files[0];
                var reader = new FileReader;
                reader.addEventListener("load", function() {
                    var _json = Admin.checkUploadedSettings(reader.result);
                    if (_json !== false) {
                        Admin.saveImportedSettings(_json)
                    }
                }, false);
                if (file) {
                    reader.readAsText(file)
                }
            }
            $("#astroid-settings-import").val("")
        })
    };
    this.saveImportedSettings = function(_params) {
        $("#astroid-manager-disabled").show();
        $("#save-options").addClass("d-none");
        $("#saving-options").removeClass("d-none");
        $("#save-options").prop("disabled", true);
        $("#export-options").prop("disabled", true);
        $("#export-preset").prop("disabled", true);
        $("#import-options").prop("disabled", true);
        $("#save-options").addClass("disabled");
        $("#export-options").addClass("disabled");
        $("#export-preset").addClass("disabled");
        $("#import-options").addClass("disabled");
        var _token = $("#astroid-admin-token").val();
        var _data = {
            params: _params
        };
        _data[_token] = 1;
        $.ajax({
            method: "POST",
            url: $("#astroid-form").attr("action"),
            data: _data,
            dataType: "json",
            success: function success(response) {
                if (response.status == "error") {
                    Admin.notify(response.message, "error")
                } else {
                    Admin.saved = true;
                    Admin.reloadPreview();
                    Admin.notify("Settings Imported.", "success")
                }
                setTimeout(function() {
                    window.location = window.location
                }, 1e3)
            }
        })
    };
    this.checkUploadedSettings = function(text) {
        if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
            var json = JSON.parse(text)
        } else {
            Admin.notify("Invalid JSON");
            return false
        }
        return json
    };
    this.exportSettings = function(_settings) {
        var dataStr = JSON.stringify(_settings);
        var dataUri = "data:text/json;charset=utf-8," + encodeURIComponent(dataStr);
        var date = new Date;
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var exportName = prompt("Please enter your desired name", "astroid-zero-template");
        if (exportName === "") {
            Admin.notify("Can't be empty", "error");
            return false
        } else if (exportName) {
            var re = /^[0-9a-zA-Z].*/;
            if (!re.test(exportName) || /\s/.test(exportName)) {
                Admin.notify("Invalid", "error");
                return false
            } else {
                var exportFileDefaultName = exportName + " " + (year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds) + ".json"
            }
        }
        $("#export-link").attr("href", dataUri);
        $("#export-link").attr("download", exportFileDefaultName);
        $("#export-link")[0].click()
    };
    this.watchForm = function() {
        var _this = this;
        $("form#astroid-form :input").change(function() {
            _this.saved = false;
            try {
                Admin.refreshScroll()
            } catch (e) {}
        })
    };
    this.initClearCache = function() {
        var _this = this;
        $("#clear-cache").click(function() {
            $("#clear-cache").addClass("d-none");
            $("#clearing-cache").removeClass("d-none");
            $.ajax({
                method: "GET",
                dataType: "json",
                url: BASE_URL + "index.php?option=com_ajax&astroid=clear-cache&template=" + TEMPLATE_NAME,
                success: function success(response) {
                    $("#clear-cache").removeClass("d-none");
                    $("#clearing-cache").addClass("d-none");
                    _this.notify(response.message, response.status)
                }
            });
            return false
        })
    };
    this.initSelect = function() {
        $(".astroid-select-ui").addClass("search selection").dropdown({
            placeholder: false,
            fullTextSearch: true
        })
    };
    this.initSelectGrouping = function() {
        $(".ui.dropdown").has("optgroup").each(function() {
            var $menu = $("<div/>").addClass("menu");
            $(this).find("optgroup").each(function() {
                $menu.append('<div class="header">' + this.label + '</div><div class="divider"></div>');
                return $(this).children().each(function() {
                    return $menu.append('<div class="item" data-value="' + this.value + '">' + this.innerHTML + "</div>")
                })
            });
            return $(this).find(".menu").html($menu.html())
        })
    };
    this.initAnimationSelector = function() {
        $(".astroid-animation-selector").astroidAnimationSelector()
    };
    this.initColorPicker = function() {
        $(".astroid-color-picker").each(function() {
            if ($(this).hasClass("color-picker-lg")) {
                var spectrumConfigExtend = spectrumConfig;
                spectrumConfigExtend.replacerClassName = "color-picker-lg";
                $(this).spectrum(spectrumConfigExtend)
            } else {
                $(this).spectrum(spectrumConfig)
            }
        })
    };
    this.initCodeArea = function() {
        $("[data-code]").each(function() {
            var _id = $(this).attr("id");
            var _textarea = $(this);
            $(_textarea).hide();
            var _editor = ace.edit(_id + "_editor");
            _editor.session.setMode("ace/mode/" + _textarea.data("code"));
            _editor.setOption("showPrintMargin", false);
            _editor.getSession().setValue($(_textarea).val());
            _editor.getSession().on("change", function() {
                $(_textarea).val(_editor.getSession().getValue())
            })
        })
    };
    this.slugify = function(string) {
        var a = "àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;";
        var b = "aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------";
        var p = new RegExp(a.split("").join("|"), "g");
        return string.toString().toLowerCase().replace(/\s+/g, "-").replace(p, function(c) {
            return b.charAt(a.indexOf(c))
        }).replace(/&/g, "-and-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "")
    };
    this.init = function() {
        this.initScroll();
        this.initScrollSpy();
        this.initSidebar();
        this.initTabs();
        this.initForm();
        this.watchForm();
        this.initClearCache();
        this.initPop();
        this.initSelect();
        this.initSelectGrouping()
    };
    this.load = function() {
        var _this = this;
        var _defaultTab = $.cookie("astroid-default-tab");
        if (_defaultTab == "#astroid-tab-astroid_layout") {
            $("body").addClass("astroid-layout-tab-selected")
        } else {
            $("body").removeClass("astroid-layout-tab-selected")
        }
        if (typeof _defaultTab == "undefined") {
            $("#astroid-menu li:first-child a").tab("show")
        } else {
            if ($('#astroid-menu li a[data-target="' + _defaultTab + '"]').length == 0) {
                $("#astroid-menu li:first-child a").tab("show")
            } else {
                $('#astroid-menu li a[data-target="' + _defaultTab + '"]').tab("show")
            }
        }
        setTimeout(function() {
            Admin.saved = true
        }, 150);
        setTimeout(function() {
            _this.loading(false)
        }, 500);
        this.initCodeArea()
    };
    this.loading = function(_start) {
        if (typeof _start == "undefined") {
            _start = true
        }
        if (_start) {
            $(".astroid-loading").fadeIn(500)
        } else {
            $(".astroid-loading").fadeOut(500)
        }
    }
};
var Admin = new AstroidAdmin;
(function($) {
    var docReady = function docReady() {
        Admin.init();
        var OnSave = function() {
            $(document).on("keydown", function(e) {
                var _popsave = $("#element-settings-save");
                if ((e.metaKey || e.ctrlKey) && String.fromCharCode(e.which).toLowerCase() === "s") {
                    if (_popsave.length) {
                        _popsave.click();
                        setTimeout(function() {
                            $("#astroid-form").submit()
                        }, 100)
                    } else {
                        $("#astroid-form").submit()
                    }
                    return false
                }
            })
        };
        var OnClear = function() {
            $(document).on("keydown", function(e) {
                var hasFocus = $("input,textarea").is(":focus");
                if (hasFocus == false && e.keyCode == 46) {
                    $("#clear-cache").click();
                    return false
                }
            })
        };
        var OnPreview = function() {
            $(document).on("keydown", function(e) {
                if ((e.metaKey || e.ctrlKey) && String.fromCharCode(e.which).toLowerCase() === "p") {
                    var _href = $("#show-previews").attr("href");
                    window.open(_href)
                }
            })
        };
        var OnClose = function() {
            $(document).on("keydown", function(e) {
                var _close = $("#element-settings-close");
                if (_close.length && e.keyCode == 27) {
                    _close.click()
                }
            })
        };
		
		 var OnHotKeysShowPopup = function () {
			$(document).on('keypress', function(e){
				if((e.shiftKey && e.keyCode == 63) && !$("textarea,input").is(':focus')){
					$('#astroidUnderlay').addClass('helpshortcut-visible');
				}
			});
		  }
		  
		var OnHotKeysClosePopup = function () {
			$(document).on('click','.astroid-close', function(e){
				$('#astroidUnderlay').removeClass('helpshortcut-visible');
			});
			
			 document.onkeydown = function(e) {
				if(e.keyCode == 27){
					$('#astroidUnderlay').removeClass('helpshortcut-visible');
				}
			}		 
		  }
        if (astroid_shortcut_enable) {
			OnSave();
			OnClear();
			OnClose();
			OnPreview()
			OnHotKeysShowPopup();
			OnHotKeysClosePopup();
        }
        getGoogleFonts();
        initAstroidUploader();
        $(".astroid-code-editor-exit-fs").click(function() {
            $(this).parent(".head").parent(".astroid-code-editor").removeClass("full-screen");
            setTimeout(function() {
                var resizeEvent = window.document.createEvent("UIEvents");
                resizeEvent.initUIEvent("resize", true, false, window, 0);
                window.dispatchEvent(resizeEvent)
            }, 10)
        });
        $(".astroid-code-editor-fs").click(function() {
            $(this).parent(".astroid-code-editor").addClass("full-screen");
            setTimeout(function() {
                var resizeEvent = window.document.createEvent("UIEvents");
                resizeEvent.initUIEvent("resize", true, false, window, 0);
                window.dispatchEvent(resizeEvent)
            }, 10)
        });
        $(".astroid-preloader-field-select").click(function() {
            $(this).parent(".astroid-preloader-field").children(".astroid-preloaders-selector").addClass("open")
        });
        $(".astroid-preloaders-selector-exit-fs").click(function() {
            $(this).parent(".head").parent(".astroid-preloaders-selector").removeClass("open")
        });
        $(".astroid-preloader-select").click(function() {
            var _value = $(this).data("value");
            $(this).parent("div").parent(".body").parent(".astroid-preloaders-selector").parent(".astroid-preloader-field").children('input[type="hidden"]').val(_value);
            $(this).parent("div").parent(".body").parent(".astroid-preloaders-selector").parent(".astroid-preloader-field").children(".select-preloader").html($(this).html());
            $(this).parent("div").parent(".body").parent(".astroid-preloaders-selector").removeClass("open")
        });
        initAstroidUnitPicker()
    };
    var initAstroidTypographyField = function initAstroidTypographyField() {
        $("[data-typography-field]").each(function() {
            var _field = $(this);
            var _id = _field.data("typography-field");
            var _preview = $(".astroid-typography-preview." + _id + "-astroid-typography-preview");
            var _property = _field.data("typography-property");
            var _unit = _field.data("unit");
            if (_property == "font-style") {
                if ($(this).is(":checked")) {
                    _value = $(this).val();
                    switch (_value) {
                        case "italic":
                            _preview.css("font-style", "italic");
                            break;
                        case "underline":
                            _preview.css("text-decoration", "underline");
                            _preview.children("*").css("text-decoration", "underline");
                            break
                    }
                } else {
                    _value = $(this).val();
                    switch (_value) {
                        case "italic":
                            _preview.css("font-style", "normal");
                            break;
                        case "underline":
                            _preview.css("text-decoration", "none");
                            _preview.children("*").css("text-decoration", "none");
                            break
                    }
                }
                _field.change(function() {
                    if ($(this).is(":checked")) {
                        _value = $(this).val();
                        switch (_value) {
                            case "italic":
                                _preview.css("font-style", "italic");
                                break;
                            case "underline":
                                _preview.css("text-decoration", "underline");
                                _preview.children("*").css("text-decoration", "underline");
                                break
                        }
                    } else {
                        _value = $(this).val();
                        switch (_value) {
                            case "italic":
                                _preview.css("font-style", "normal");
                                break;
                            case "underline":
                                _preview.css("text-decoration", "none");
                                _preview.children("*").css("text-decoration", "none");
                                break
                        }
                    }
                })
            } else if (_property == "color") {
                var _value = _field.val();
                _preview.css(_property, _value);
                _field.change(function() {
                    var _value = _field.val();
                    _preview.css(_property, _value)
                })
            } else {
                if (typeof _unit == "undefined") {
                    _unit = ""
                }
                var _value = _field.val();
                _preview.css(_property, _value + _unit);
                _field.change(function() {
                    var _u = $(this).attr("data-unit");
                    if (typeof _u == "undefined") {
                        _u = ""
                    }
                    var _value = _field.val();
                    _preview.css(_property, _value + _u)
                })
            }
        })
    };
    var setAstroidRange = function setAstroidRange(_range) {
        try {
            var _value = $(_range).val();
            var _post = $(_range).data("postfix");
            var _pre = $(_range).data("prefix");
            var _per = (_value - $(_range).attr("min")) * 100 / ($(_range).attr("max") - $(_range).attr("min"));
            var _left = 20 * _per / 100 + 10 - 40 - .4 * _per;
            $(_range).css("background-size", _per + "%");
            $(_range).siblings(".astroid-range-value").css("left", _per + "%");
            $(_range).siblings(".astroid-range-value").css("margin-left", _left + "px");
            $(_range).siblings(".astroid-range-value").text(_pre + _value + _post);
            $(_range).siblings(".astroid-range-min-value").text(_pre + _value + _post)
        } catch (e) {}
    };
    var initAstroidFontSelector = function initAstroidFontSelector() {
        $(".astroid-font-preview").find(".more").click(function() {
            var _target = $(this).data("target");
            $("." + _target).addClass("expand")
        });
        $(".astroid-font-preview").find(".less").click(function() {
            var _target = $(this).data("target");
            $("." + _target).removeClass("expand")
        });
        $(".astroid-font-selector").addClass("search selection").dropdown({
            placeholder: false,
            fullTextSearch: true,
            onChange: function onChange(value, text, $choice) {
                _dropdown = $(this);
                var _preview = _dropdown.data("preview");
                loadGoogleFont(value, _dropdown, $("." + _preview))
            }
        });
        $(".astroid-font-selector").each(function() {
            var _select = $(this).children('[type="hidden"]');
            var _dropdown = $(this);
            var value = _select.val();
            if (value != "" && typeof value != "undefined") {
                var _preview = _dropdown.data("preview");
                loadGoogleFont(value, _dropdown, $("." + _preview))
            }
        })
    };
    var loadGoogleFont = function loadGoogleFont(_font, _dropdown, _preview) {
        if (_preview !== null) {
            _preview.parent(".astroid-typography-preview-container").siblings(".library-font-warning").addClass("d-none")
        }
        var _isSystemFont = false;
        SYSTEM_FONTS.forEach(function(_sfont) {
            if (_font == _sfont) {
                _isSystemFont = true;
                return false
            }
        });
        var _isLibraryFont = false;
        LIBRARY_FONTS.forEach(function(_ufont) {
            if (_font == _ufont) {
                _isLibraryFont = true;
                return false
            }
        });
        if (_isLibraryFont) {
            if (_preview !== null) {
                _preview.css("font-family", _font);
                _preview.parent(".astroid-typography-preview-container").siblings(".library-font-warning").removeClass("d-none")
            }
            return false
        }
        if (_isSystemFont) {
            if (_preview !== null) {
                _preview.css("font-family", _font)
            }
            return false
        }
        var _family = _font.split(":");
        _family = _family[0];
        _family = _family.replace(/\+/g, " ");
        var _id = _font.replace(/\+/g, "-");
        _id = _id.replace(/\:/g, "-");
        _id = _id.replace(/\,/g, "-");
        var _loaded = $("link#" + _id);
        if (_loaded.length) {
            if (_preview !== null) {
                _preview.css("font-family", _family)
            }
            return false
        }
        _dropdown.addClass("loading");
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            id: _id,
            href: "https://fonts.googleapis.com/css?family=" + _font
        }).appendTo("head");
        $("link#" + _id).bind("load", function() {
            setTimeout(function() {
                _dropdown.removeClass("loading");
                if (_preview !== null) {
                    _preview.css("font-family", _family)
                }
            }, 200)
        })
    };
    var getGoogleFonts = function getGoogleFonts() {
        $.ajax({
            method: "GET",
            url: BASE_URL + "index.php?option=com_ajax&astroid=google-fonts&template=" + TEMPLATE_NAME,
            success: function success(response) {
                $(".astroid-font-selector").find(".menu").html(response);
                setTimeout(function() {
                    $(".astroid-font-selector").each(function() {
                        $(this).val($(this).data("value"))
                    });
                    initAstroidFontSelector()
                }, 100)
            }
        })
    };
    var initAstroidUploader = function initAstroidUploader() {
        Dropzone.autoDiscover = false
    };
    var initAstroidUnitPicker = function initAstroidUnitPicker() {
        $(".unit-picker").children("li").children("label").children("input[type=radio]").change(function() {
            var _sliderid = $(this).data("sid");
            $('[data-slider-id="' + _sliderid + '"]').attr("data-unit", $(this).val()).trigger("change")
        })
    };
    var winLoad = function winLoad() {
        initAstroidTypographyField();
        Admin.load()
    };
    docReady();
    $(window).on("load", winLoad)
})(jQuery);
window.onbeforeunload = function() {
    if (!Admin.saved) {
        return "Are you sure you want to leave before save?"
    }
};
var ContentLayout = new AstroidContentLayout;
ContentLayout.init();