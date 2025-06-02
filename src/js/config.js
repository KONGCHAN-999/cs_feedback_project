jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
  "use strict";
  // check row function.
  function checkRow() {
    let rows = $("#kintoneplugin-setting-tspace > tr");
    if (rows.length <= 1) {
      rows.find(".removeRow").hide();
    } else {
      rows.find(".removeRow").show();
    }
  }

  $(document).ready(function () {
    let $tbody = $('#kintoneplugin-setting-tspace');
    let $firstRow = $tbody.find('tr').first();
    if ($firstRow.is('[hidden]')) {
      let $clonedRow = $firstRow.clone(true).removeAttr('hidden');
      // Clear input/select values in the cloned row
      $clonedRow.find('input[type="text"]').val("");
      $clonedRow.find('select').prop('selectedIndex', 0);
      $tbody.append($clonedRow);
    }

    $('#kintoneplugin-setting-tspace').sortable({
      handle: '.drag-icon', 
      items: 'tr:not([hidden])',
      cursor: 'move',
      placeholder: 'ui-state-highlight',
      axis: 'y'
    });

    //add new row function
    $(".addRow").on('click', function () {
      let closestTable = $(this).closest("table");
      let closestTbody = $(this).closest("tbody");
      let clonedRow = closestTbody.find("tr").first().clone(true).removeAttr("hidden");
      // Clear input/select values in the cloned row
      clonedRow.find('input[type="text"]').val("");
      clonedRow.find('select').prop('selectedIndex', 0);
      if (closestTable.is("#kintoneplugin-setting-body")) slideUp.call(this);

      // Insert the cloned row after the current clicked row
      $(this).closest("tr").after(clonedRow);
      checkRow();
    });

    //remove row function
    $(".removeRow").on('click', function () {
      $(this).closest("tr").remove();
      checkRow();
    });

  });
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);

