function generateChances() {
  let ndVariable = document.getElementById("nd-selector").value;
  const treasureGenerationExcel = "assets/spreadsheets/TreasureGeneration.xlsx";

  const xhr = new XMLHttpRequest();
  xhr.open('GET', treasureGenerationExcel, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function (e) {
    if (xhr.status === 200) {
      const data = new Uint8Array(xhr.response);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      let range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: 0 });
        const ndCell = worksheet[cellAddress] ? worksheet[cellAddress].v : undefined;
        if (ndCell === ndVariable) {
          const ndData = [];
          var differentNd = false
          var i = 0
          while (!differentNd) {
            const currentRow = [];
            for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
              const address = XLSX.utils.encode_cell({ r: rowNum + i, c: colNum });
              if (worksheet[address].v != ndVariable && colNum == 0) {
                differentNd = true
                break;
              } else if (worksheet[address].v != ndVariable) {
                currentRow.push(worksheet[address] ? worksheet[address].v : undefined);
              }
            }
            i++
            ndData.push(currentRow);
          }
          ndData.splice(-1);
          generateTreasure(ndData)
          return;
        }
      }
      console.log("ND not found in the first column.");
    } else {
      console.error('Failed to load the Excel file.');
    }
  };
  xhr.send();
}

function generateTreasure(data) {
  let treasureRoll = rollDice(1, 100)
  console.log(treasureRoll)
  for (var i = 0; i < data.length; i++) {
    var endOfFirst = false;
    var secondNumber = "";
    const chances = []
    for (var j = 0; j < data[i][0].length; j++) {
      if (data[i][0][j] == "-") {
        endOfFirst = true;
      } else if (endOfFirst == true) {
        secondNumber += data[i][0][j]
      }
    }
    chances.push(secondNumber);
    chances.push(data[i][1]);

    if (treasureRoll < chances[0]) {
      console.log(chances);

      // IF TREASURE IS MONEY //
      if (chances[1][chances[1].length - 2] == "y") {
        let multiplierIndex = chances[1].indexOf("*");
        let plusIndex = chances[1].includes("+");
        let spaceIndex = chances[1].indexOf(" ");
        let roll = parseInt(chances[1][0]);
        let dice = 0;
        let multiplier = parseInt(chances[1].substr(multiplierIndex + 1, spaceIndex - 1));
        switch (multiplierIndex) {
          case 3:
            dice = parseInt(chances[1][2]);
            break;

          case 4:
            dice = parseInt(chances[1].substr(2, multiplierIndex - 1));
            break;

          case 5:
            dice = parseInt(chances[1].substr(2, multiplierIndex - 4));
            break;

          case 6:
            dice = parseInt(chances[1].substr(2, multiplierIndex - 3));
            break;
          default:
            console.log("Error occured while loading dice.")
        }
        let diceResult = rollDice(roll, dice)
        if (plusIndex == true) {
          diceResult + 1
        }
        money = diceResult * multiplier
        console.log(diceResult, multiplier, money)
        console.log("You gained " + money + "¥" + chances[1][chances[1].length - 1]);
      }

      break;
    }
  }
}

function rollDice(rolls, dice) {
  let x = 0;
  let result = 0;
  while (x < rolls) {
    result += Math.floor(Math.random() * dice + 1);
    x++;
  }
  return result;
}