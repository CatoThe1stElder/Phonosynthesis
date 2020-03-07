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
  console.log("%c Loading-screen Backdrop Deactivated!", "background: beige; color: purple;");

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

  console.log("%c Rules", "background: beige; color: purple;");
  console.log(rules);
  console.log(rules.length);


  // ERSP Test: Insert Rules
  rulesElem = $('#rules');
  rulesElem.empty();

  // ERSP Test: Insert Unsatisfiable constraints
  constraintsElem = $('#unsatisfiable-constraints');
  constraintsElem.empty();

  for (var i = 0; i < (rules.length); i++) {
    if (rules[i].includes("Unsatisfiable constraints")) {
      var j = 0;
      // console.log("%c UC FOUND!", "background: red; color: white;");

      // Activate Error Box

      console.log("i val");
      console.log(i);
      for (var j = i; j < (rules.length); j++) {
        if (j == i) {
          $('<div class="constraint header">').text(rules[j]).appendTo(constraintsElem);
        }
        else {
          if (rules[j].includes("changed")) {
            $('<div id="constraint" class="constraint changed">').text(rules[j]).appendTo(constraintsElem);
          }
          else {
            $('<div id="constraint" class="constraint unchanged">').text(rules[j]).appendTo(constraintsElem);
          }
        }
      }
      break;
    }
    else {
      $('<div>').text(rules[i]).appendTo(rulesElem);
    }
  }
  

  console.log("%c rulesElem", "background: beige; color: purple;");
  console.log(rulesElem);
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

  $('#word-stems > tbody > tr').each(function (row) {
    let data = $('td', this);
    wordStems.push({
      underlyingForm: $(data[1]).text(),
      realization: $(data[2]).text()
    });
  });

  // ERSP:
  console.log("%c Begin - wordStems", "background: beige; color: purple;");
  console.log(wordStems);
  console.log("%c End - wordStems", "background: beige; color: purple;");

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
});

$("#constraint").hover(function(){
  console.log("blue");
})



