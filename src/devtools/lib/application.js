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

    // Dropdowns
    $(".dropdown-toggle").dropdown();

    // Put selected text in dropdown
    $(".dropdown-menu").on('click', 'li a', function() {
      $(".dropdown-toggle:first-child").text($(this).text());
    });

  });

})(jQuery);