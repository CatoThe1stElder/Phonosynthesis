function populateWordStems() {
  let csvRows = $.csv.toArrays(this.result);
  let tableBody = $('<tbody>');

  // ESRP Test: Get "Length" of csvRows
  console.log("%c Begin - csvRows.length", "background: beige; color: purple;");
  console.log(csvRows);
  console.log(csvRows.length);  
  console.log("%c End - csvRows.length", "background: beige; color: purple;");

  // ESRP Test: Append line numbers to csvRows
  for (i=0;i < csvRows.length; i++) {
    csvRows[i].unshift(i + 1);
  }

  console.log("%c Begin - Modified csvRows w/ Line Numbers", "background: beige; color: purple;");
  console.log(csvRows);  
  console.log("%c End - Modified csvRows w/ Line Numbers", "background: beige; color: purple;");

  // ERSP Test: Generate Table as Viewed BEFORE "Infer Rule" is Clicked 
  csvRows.forEach(csvRow => {
    let tableRow = $('<tr>');
    let rowNum = $('<td>').text(csvRow[0]);
    let underlyingForm = $('<td>').text(csvRow[1]);
    let realization = $('<td>').text(csvRow[2]);
    tableRow.append(rowNum).append(underlyingForm).append(realization).appendTo(tableBody);
  });


  // ESRP Test: Check that tableBody was appended correctly
  console.log("%c Begin - tableBody", "background: beige; color: purple;");
  console.log(tableBody);  
  console.log("%c End - tableBody", "background: beige; color: purple;");

  $('#word-stems > tbody').replaceWith(tableBody);
}

function renderRules(rules) {

  // ERSP: Deactivate Loading Notification
  document.getElementById("loading-screen-backdrop").style.display = "none";
  console.log("%c Loading-screen Backdrop Activated!", "background: beige; color: purple;");

  function renderPhone(phone) {
    let phoneString = '';

    if ($.type(phone) === 'string') {
      phoneString += phone;
    } else if (phone === null) {
      phoneString += '_';
    } else {
      phoneString += '[';
      phoneString += phone
	.map(feature => (feature.positive ? '+' : '-') + feature.feature)
	.join(' ');
      phoneString += ']';
    }

    return phoneString;
  }

  function renderRule(rule) {
    let target = renderPhone(rule.target);
    let change = renderPhone(rule.change);

    let context = '_';
    if (rule.context.left !== null) {
      let left = renderPhone(rule.context.left);
      context = `${left} ${context}`;
    }
    if (rule.context.right !== null) {
      let right = renderPhone(rule.context.right);
      context = `${context} ${right}`;
    }

    return `${target} → ${change} / ${context}`;
  }

  rulesElem = $('#rules');
  rulesElem.empty();
  rules
    .forEach(rule => {
    $('<li>').text(rule).appendTo(rulesElem);
  });
}

$('#csv-upload').change(function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = populateWordStems;
  reader.readAsText(file);
});

// ERSP: Dropdown Menu for GitHub datasets HTML Element
$('#csv-upload-github').change(function () {
  console.log("%c Change of the HTML element 'csv-select-github'", "background: beige; color: purple;");
});


$('#infer').click(() => {

  // ERSP: Activate Loading Notification
  document.getElementById("loading-screen-backdrop").style.display = "initial";
  console.log("%c Loading-screen Backdrop Activated!", "background: beige; color: purple;");


  let wordStems = [];
  
  // ERSP Test:
  console.log("%c Begin - wordStems", "background: beige; color: purple;");
  console.log(wordStems);
  console.log("%c End - wordStems", "background: beige; color: purple;");





  $('#word-stems > tbody > tr').each(function (row) {
    let data = $('td', this);
    wordStems.push({
      underlyingForm: $(data[1]).text(),
      realization: $(data[2]).text()
    });
  });



  let payload = {
    wordStems: wordStems
  };

  $.post({
    url: 'api/infer_rule',
    contentType: 'application/json',
    data: JSON.stringify(payload)
  })
    .then(renderRules)
    .catch(error => {
      console.log(error);
    });
})
