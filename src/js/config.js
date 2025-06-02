jQuery.noConflict();
(async function ($, Swal10, PLUGIN_ID) {
  "use strict";
  
  // Check row function - fixed class names
  function checkRow() {
    let rows = $("#kintoneplugin-setting-tspace > tr:not([hidden])");
    if (rows.length <= 1) {
      rows.find(".removeRow-main").hide();
    } else {
      rows.find(".removeRow-main").show();
    }
  }

  // Check sub-row function
  function checkSubRow($subTable) {
    let subRows = $subTable.find('tbody > tr:not([hidden])');
    if (subRows.length <= 1) {
      subRows.find(".removeRow-sub").hide();
    } else {
      subRows.find(".removeRow-sub").show();
    }
  }

  $(document).ready(function () {
    // Main layer: ensure at least one visible row
    let $tbody = $('#kintoneplugin-setting-tspace');
    let $templateRow = $tbody.find('tr.table-space').first();
    
    if ($templateRow.length && $tbody.find('tr:not([hidden])').length === 0) {
      let $clonedRow = $templateRow.clone(true).removeAttr('hidden');
      
      // Clear main row inputs
      $clonedRow.find('input[type="text"]').val("");
      $clonedRow.find('select').prop('selectedIndex', 0);

      // For sub-layer: ensure at least one visible sub-row
      $clonedRow.find('.sub-table').each(function () {
        let $subTbody = $(this).find('tbody');
        let $subTemplateRow = $subTbody.find('tr').first();
        
        // Remove any existing visible sub-rows
        $subTbody.find('tr:not(:first)').remove();
        
        // Create first visible sub-row from template
        if ($subTemplateRow.length) {
          let $subClonedRow = $subTemplateRow.clone(true).removeAttr('hidden');
          $subClonedRow.find('input[type="text"]').val("");
          $subClonedRow.find('select').prop('selectedIndex', 0);
          $subTbody.append($subClonedRow);
          
          // Initialize sub-row visibility
          checkSubRow($(this));
        }
      });
      
      $tbody.append($clonedRow);
    }

    // Initialize sortable functionality
    $('#kintoneplugin-setting-tspace').sortable({
      handle: '.drag-icon',
      items: 'tr:not([hidden])',
      cursor: 'move',
      placeholder: 'ui-state-highlight',
      axis: 'y'
    });

    // Initial check for row visibility
    checkRow();

    // Main layer add row
    $tbody.on('click', '.addRow-main', function () {
      let $closestTbody = $(this).closest('tbody');
      let $templateRow = $closestTbody.find('tr.table-space').first();
      let $clonedRow = $templateRow.clone(true).removeAttr('hidden');
      
      // Clear main row inputs
      $clonedRow.find('input[type="text"]').val("");
      $clonedRow.find('select').prop('selectedIndex', 0);

      // For sub-layer: reset to have only one visible row
      $clonedRow.find('.sub-table').each(function () {
        let $subTbody = $(this).find('tbody');
        let $subTemplateRow = $subTbody.find('tr').first();
        
        // Remove all rows except template
        $subTbody.find('tr:not(:first)').remove();
        
        // Create one visible sub-row
        if ($subTemplateRow.length) {
          let $subClonedRow = $subTemplateRow.clone(true).removeAttr('hidden');
          $subClonedRow.find('input[type="text"]').val("");
          $subClonedRow.find('select').prop('selectedIndex', 0);
          $subTbody.append($subClonedRow);
          
          // Initialize sub-row visibility
          checkSubRow($(this));
        }
      });
      
      $(this).closest('tr').after($clonedRow);
      checkRow();
    });

    // Main layer remove row
    $tbody.on('click', '.removeRow-main', function () {
      let $closestTbody = $(this).closest('tbody');
      if ($closestTbody.find('tr:not([hidden])').length > 1) {
        $(this).closest('tr').remove();
        checkRow();
      }
    });

    // Sub-layer add row
    $tbody.on('click', '.addRow-sub', function () {
      let $subTable = $(this).closest('.sub-table');
      let $subTbody = $subTable.find('tbody');
      let $subTemplateRow = $subTbody.find('tr').first();
      let $subClonedRow = $subTemplateRow.clone(true).removeAttr('hidden');
      
      $subClonedRow.find('input[type="text"]').val("");
      $subClonedRow.find('select').prop('selectedIndex', 0);
      $(this).closest('tr').after($subClonedRow);
      
      checkSubRow($subTable);
    });

    // Sub-layer remove row
    $tbody.on('click', '.removeRow-sub', function () {
      let $subTable = $(this).closest('.sub-table');
      let $subTbody = $subTable.find('tbody');
      
      if ($subTbody.find('tr:not([hidden])').length > 1) {
        $(this).closest('tr').remove();
        checkSubRow($subTable);
      }
    });
  });
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);