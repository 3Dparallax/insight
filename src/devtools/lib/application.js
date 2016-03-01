(function ($) {
  $(function () {

    // Switches
    if ($('[data-toggle="switch"]').length) {
      $('[data-toggle="switch"]').bootstrapSwitch();
    }

    // Tooltip
    if ($('[data-toggle=tooltip]').length) {
      $('[data-toggle=tooltip]').tooltip();
    }
  });
})(jQuery);
