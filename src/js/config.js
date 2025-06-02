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

  // Get fields from kintone app
  let GETFIELD = await kintone.api("/k/v1/preview/app/form/fields", "GET", {
    app: kintone.app.getId(),
  });
  console.log("GETFIELD", GETFIELD);


  // Set loadDefaultConfig function
  function loadDefaultConfig() {
    let defaultConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (defaultConfig && defaultConfig.config) {
      let config = JSON.parse(defaultConfig.config);
      $('#display_location').val(config.displayLocation || '');
      // Remove all rows except template
      $('#kintoneplugin-setting-tspace').find('tr:not(.table-space)').remove();
      // For each spaceSetting, add a main row and its sub-rows
      if (Array.isArray(config.spaceSettings)) {
        config.spaceSettings.forEach(spaceSetting => {
          let $mainRow = $('#kintoneplugin-setting-tspace .table-space').first().clone(true).removeAttr('hidden');
          // Set main row values
          $mainRow.find('input#bunttonName').val(spaceSetting.bunttonName || '');
          $mainRow.find('input#appId').val(spaceSetting.appId || '');
          $mainRow.find('select#fieldA').val(spaceSetting.fieldA || '');
          $mainRow.find('select#fieldB').val(spaceSetting.fieldB || '');
          $mainRow.find('select#condition').val(spaceSetting.condition || '');
          // Remove all sub-rows except template
          let $subTable = $mainRow.find('.sub-table');
          let $subTbody = $subTable.find('tbody');
          $subTbody.find('tr:not(.table-space)').remove();
          // Add subSettings
          if (Array.isArray(spaceSetting.subSettings)) {
            spaceSetting.subSettings.forEach(subSetting => {
              let $subRow = $subTbody.find('tr.table-space').first().clone(true).removeAttr('hidden');
              $subRow.find('input#bunttonName').val(subSetting.bunttonName || '');
              $subRow.find('input#appId').val(subSetting.appId || '');
              $subRow.find('select#fieldA').val(subSetting.fieldA || '');
              $subRow.find('select#fieldB').val(subSetting.fieldB || '');
              $subRow.find('select#condition').val(subSetting.condition || '');
              $subTbody.append($subRow);
            });
          }
          $('#kintoneplugin-setting-tspace').append($mainRow);
        });
      }
    } else {
      $('#display_location').val('');
    }
  }

  // Populate dropdown for fieldA with field codes and labels
  function populateFieldADropdown() {
    // Target all select elements with id=fieldA (should be unique per sub-row)
    $('select#fieldA').each(function () {
      let $dropdown = $(this);
      $dropdown.empty();
      $dropdown.append($('<option>', { value: '', text: '-- Select Field --' }));
      Object.values(GETFIELD.properties).forEach(field => {
        $dropdown.append($('<option>', {
          value: field.code,
          text: field.label
        }));
      });
    });
  }

  // Check App ID to fieldB dropdown 
  function checkAppIdToFieldBDropdown() {
    // Target all select elements with id=fieldB (should be unique per sub-row)
    $('select#fieldB').each(function () {
      let $fieldBSelect = $(this);
      let appId = $fieldBSelect.closest('.row').find('input#appId').val();
      $fieldBSelect.empty();
      if (appId) {
        // Fetch fields from the specified app
        kintone.api('/k/v1/preview/app/form/fields', 'GET', { app: appId })
          .then(function (response) {
            // Populate the dropdown with fields from the specified app
            $fieldBSelect.append($('<option>', { value: '', text: '-- Select Field --' }));
            Object.values(response.properties).forEach(field => {
              $fieldBSelect.append($('<option>', {
                value: field.code,
                text: field.label
              }));
            });
          })
          .catch(function (error) {
            console.error('Error fetching fields:', error);
            Swal10.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to fetch fields from the specified app.'
            });
          });
      } else {
        // If no App ID is provided, show a default option
        $fieldBSelect.append($('<option>', { value: '', text: '-- Select Field --' }));
      }
    });
  }

  // Button submit form
  function submitForm() {
    let config = {
      displayLocation: $('#display_location').val(),
      spaceSettings: []
    };
    $('#kintoneplugin-setting-tspace > tr:not([hidden])').each(function () {
      let $mainRow = $(this);
      let mainRowData = {
        bunttonName: $mainRow.find('input#bunttonName').val(),
        appId: $mainRow.find('input#appId').val(),
        fieldA: $mainRow.find('select#fieldA').val(),
        fieldB: $mainRow.find('select#fieldB').val(),
        condition: $mainRow.find('select#condition').val(),
        subSettings: []
      };
      $mainRow.find('.sub-table tbody > tr:not([hidden])').each(function () {
        let $subRow = $(this);
        let subRowData = {
          bunttonName: $subRow.find('input#bunttonName').val(),
          appId: $subRow.find('input#appId').val(),
          fieldA: $subRow.find('select#fieldA').val(),
          fieldB: $subRow.find('select#fieldB').val(),
          condition: $subRow.find('select#condition').val()
        };
        mainRowData.subSettings.push(subRowData);
      });
      config.spaceSettings.push(mainRowData);
    });
    console.log("Config to submit:", config);
    try {
      kintone.plugin.app.setConfig({ config: JSON.stringify(config) }, () => {
        window.location.href = `../../flow?app=${kintone.app.getId()}#section=settings`;
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      Swal10.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save configuration.'
      });
    }
  }

  // Initialize the form and event listeners
  $(document).ready(function () {
    // Call the function to populate dropdown
    loadDefaultConfig();
    populateFieldADropdown();
    checkAppIdToFieldBDropdown();

    $('#submit-button').on('click', submitForm);
    $('#cancel-button').on('click', function (e) {
      e.preventDefault();
      Swal10.fire({
        icon: 'info',
        title: 'Cancelled',
        text: 'Configuration changes have been discarded.'
      });
    });

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

    // Remove previous input/blur event for #appId to avoid double API calls
    $(document).off('input blur', 'input#appId');

    // Listen for blur on any App ID input and update only the Field B in the same row
    $(document).on('blur', 'input#appId', function () {
      let $row = $(this).closest('.row');
      let appId = $(this).val();
      let $fieldBSelect = $row.find('select#fieldB');
      $fieldBSelect.empty();
      if (appId) {
        kintone.api('/k/v1/preview/app/form/fields', 'GET', { app: appId })
          .then(function (response) {
            $fieldBSelect.append($('<option>', { value: '', text: '-- Select Field --' }));
            Object.values(response.properties).forEach(field => {
              $fieldBSelect.append($('<option>', {
                value: field.code,
                text: field.label
              }));
            });
          })
          .catch(function (error) {
            console.error('Error fetching fields:', error);
            Swal10.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to fetch fields from the specified app.'
            });
          });
      } else {
        $fieldBSelect.append($('<option>', { value: '', text: '-- Select Field --' }));
      }
    });
  });
})(jQuery, Sweetalert2_10.noConflict(true), kintone.$PLUGIN_ID);



