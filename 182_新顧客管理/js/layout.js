jQuery.noConflict();
(function($) {
   "use strict";
   kintone.events.on(["app.record.detail.show", "app.record.create.show", "app.record.edit.show"], function(e) {
       kintone.app.record.getFieldElement("３コード").parentElement.children.item(0).style.color = "red";
   });
})(jQuery);
