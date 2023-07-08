// initialize the map of the 9 cells to 0
const map = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
// corner cells, used for the computer round
const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
// id for timeout of computer round
let computerRound = 0;

// register service worker to enable PWA features
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").catch(() => console.log("failed"));
}

// set the vertical and horizontal lines to locate at the center of the grid cells
// offsetWidth / offsetHeight = content + padding + border
// clientWidth / clientHeight = content + padding
// offsetTop = top position in parent element
let verticals = document.getElementsByClassName("vertical");
let horizontals = document.getElementsByClassName("horizontal");
let buttons = document.getElementById("map").getElementsByTagName("button");
let buttonWidth = buttons[0].offsetWidth;
let buttonHeight = buttons[0].offsetHeight;
for(let i = 0; i < 3; i ++){
  // calculate the left position of vertical lines different to horizontal lines as they are rotated by the center point, the position before rotation should be calculated
  verticals[i].style.left = (i * buttonWidth + buttons[i].clientWidth / 2) + "px";
  horizontals[i].style.top = (i * buttonHeight + buttons[i * 3].clientHeight / 2 + buttons[0].offsetTop - horizontals[i].offsetHeight / 2) + "px";
  // hide the vertical and horizontal lines, display them after one of the player wins
  verticals[i].style.display = "none";
  horizontals[i].style.display = "none";
}

// when user press the other selectCharacter button, the game restarts with the other player plays first
const changeCharacter = i => {
  let selectCharacter = document.getElementsByClassName("selectCharacter");
  let inputs = document.getElementsByTagName("input");
  let images = document.getElementsByTagName("img");
  restart();
  // change the display and disability of the character buttons
  selectCharacter[i].style = "background-color: black";
  inputs[i].disabled = true;
  images[i].src = images[i].src.replace("black", "white");
  selectCharacter[1 - i].style = "";
  inputs[1 - i].disabled = false;
  images[1 - i].src = images[1 - i].src.replace("white", "black");
}

// swap the width, height and opacity of the human and robot to indicate switching of player
// i = player, 1 = change to computer, 2 = change to player
const changeRound = i => {
  let human = document.getElementById("human");
  let robot = document.getElementById("robot");
  let width = human.offsetWidth;
  let height = human.offsetHeight;
  human.style.width = robot.offsetWidth + "px";
  human.style.height = robot.offsetHeight + "px";
  robot.style.width = width + "px";
  robot.style.height = height + "px";
  if(i == 1){
    human.style.opacity = "0.5";
    robot.style.opacity = "1";
  }else{
    robot.style.opacity = "0.5";
    human.style.opacity = "1";
  }
}

// perform the operations for a game round, such as updating the grid cells or checking if the game ends
// i = row, j = column, 0 <= i, j <= 2
const gameRound = (i, j) => {
  let inputs = document.getElementsByTagName("input");
  let buttons = document.getElementById("map").getElementsByTagName("button");
  let result = document.getElementById("result");
  // 1 = player
  map[i][j] = 1;
  // display the X or O of the clicked cell
  // inputs[0].clicked = player is X, otherwise = player is O
  if(inputs[0].checked == true){
    buttons[i * 3 + j].innerHTML = "<img src = 'images/cross_black.svg' width = '100%' height = '100%'>";
  }else{
    buttons[i * 3 + j].innerHTML = "<img src = 'images/circle_black.svg' width = '100%' height = '100%'>";
  }
  buttons[i * 3 + j].disabled = true;
  // end the game if the player wins
  if(win(1)){
    result.innerHTML = "You win!";
    for(let i = 0; i < 9; i ++){
      buttons[i].disabled = true;
    }
    return;
  }
  // end the game if it draws
  if(draw()){
    result.innerHTML = "Draw";
    return;
  }
  // disable the buttons for the computer round
  for(let i = 0; i < 9; i ++){
    buttons[i].disabled = true;
  }
  // change the display for the human and robot
  changeRound(1);
  // delay for 0.75s before the computer give its choice
  computerRound = setTimeout(() => {
    let pos = computer();
    // 2 = computer
    map[pos[0]][pos[1]] = 2;
    // display the X or O of the clicked cell
    // inputs[0].clicked = computer is O, otherwise = computer is X
    if(inputs[0].checked == true){
      buttons[pos[0] * 3 + pos[1]].innerHTML = "<img src = 'images/circle_black.svg' width = '100%' height = '100%'>";
    }else{
      buttons[pos[0] * 3 + pos[1]].innerHTML = "<img src = 'images/cross_black.svg' width = '100%' height = '100%'>";
    }
    buttons[pos[0] * 3 + pos[1]].disabled = true;
    // end the game if the computer wins
    if(win(2)){
      result.innerHTML = "You lose!";
      for(let i = 0; i < 9; i ++){
        buttons[i].disabled = true;
      }
      return;
    }
    // end the game if it draws
    if(draw()){
      result.innerHTML = "Draw";
      return;
    }
    // enable the empty buttons for the player round
    for(let i = 0; i < 3; i ++){
      for(let j = 0; j < 3; j ++){
        if(map[i][j] == 0){
          buttons[i * 3 + j].disabled = false;
        }
      }
    }
    // change the display for the human and robot
    changeRound(2);
  }, 750);
}

// check if the player or computer wins
// 1 = player, 2 = computer
function win(n){
  let verticals = document.getElementsByClassName("vertical");
  let horizontals = document.getElementsByClassName("horizontal");
  // if all the cells of that row is occupied by the character, display the horizontal line of that row
  for(let i = 0; i < 3; i ++){
    if(map[i][0] == n && map[i][1] == n && map[i][2] == n){
      horizontals[i].style.display = "block";
      return true;
    }
    // if all the cells of that column is occupied by the character, display the horizontal line of that column
    if(map[0][i] == n && map[1][i] == n && map[2][i] == n){
      verticals[i].style.display = "block";
      return true;
    }
  }
  // if all the cells of that diagonal is occupied by the character, display the line of that diagonal
  if(map[0][0] == n && map[1][1] == n && map[2][2] == n){
    document.getElementById("diagonal1").style.display = "block";
    return true;
  }
  if(map[0][2] == n && map[1][1] == n && map[2][0] == n){
    document.getElementById("diagonal2").style.display = "block";
    return true;
  }
  return false;
}

// determine the step for the computer round
// should be modified to determine the step by AI algorithms
function computer(){
  let count = 0;
  for(let i = 0; i < 3; i ++){
    count = 0;
    for(let j = 0; j < 3; j ++){
      if(map[i][j] == 2){
        count += j + 2;
      }
    }
    if(count > 4 && map[i][7 - count] == 0){
      return [i, 7 - count];
    }
  }
  for(let i = 0; i < 3; i ++){
    count = 0;
    for(let j = 0; j < 3; j ++){
      if(map[j][i] == 2){
        count += j + 2;
      }
    }
    if(count > 4 && map[7 - count][i] == 0){
      return [7 - count, i];
    }
  }
  count = 0;
  for(let i = 0; i < 3; i ++){
    if(map[i][i] == 2){
      count += i + 2;
    }
  }
  if(count > 4 && map[7 - count][7 - count] == 0){
    return [7 - count, 7 - count];
  }
  count = 0;
  for(let i = 0; i < 3; i ++){
    if(map[i][2 - i] == 2){
      count += i + 2;
    }
  }
  if(count > 4 && map[7 - count][count - 5] == 0){
    return [7 - count, count - 5];
  }
  for(let i = 0; i < 3; i ++){
    count = 0;
    for(let j = 0; j < 3; j ++){
      if(map[i][j] == 1){
        count += j + 2;
      }
    }
    if(count > 4 && map[i][7 - count] == 0){
      return [i, 7 - count];
    }
  }
  for(let i = 0; i < 3; i ++){
    count = 0;
    for(let j = 0; j < 3; j ++){
      if(map[j][i] == 1){
        count += j + 2;
      }
    }
    if(count > 4 && map[7 - count][i] == 0){
      return [7 - count, i];
    }
  }
  count = 0;
  for(let i = 0; i < 3; i ++){
    if(map[i][i] == 1){
      count += i + 2;
    }
  }
  if(count > 4 && map[7 - count][7 - count] == 0){
    return [7 - count, 7 - count];
  }
  count = 0;
  for(let i = 0; i < 3; i ++){
    if(map[i][2 - i] == 1){
      count += i + 2;
    }
  }
  if(count > 4 && map[7 - count][count - 5] == 0){
    return [7 - count, count - 5];
  }
  count = 0;
  for(let i = 0; i < 4; i ++){
    if(map[corners[i][0]][corners[i][1]] == 0){
      count ++;
    }
  }
  if(count == 1){
    for(let i = 0; i < 4; i ++){
      if(map[corners[i][0]][corners[i][1]] == 0){
        return corners[i];
      }
    }
  }
  if(count > 1){
    let i = 0;
    do{
      i = Math.floor(Math.random() * 4);
      if(map[corners[i][0]][corners[i][1]] == 0){
        return corners[i];
      }
    }while(map[corners[i][0]][corners[i][1]] != 0);
  }
  for(let i = 0; i < 3; i ++){
    for(let j = 0; j < 3; j ++){
      if(map[i][j] == 0){
        return [i, j];
      }
    }
  }
}

// check if the game draws
function draw(){
  // if all cells are occupied by the player or computer, the game draws
  let count = 0;
  for(let i = 0; i < 3; i ++){
    for(let j = 0; j < 3; j ++){
      if(map[i][j] == 0){
        count ++;
      }
    }
  }
  return count == 0;
}

// restart the game
function restart(){
  // cancel the delayed step of the computer round
  clearTimeout(computerRound);
  // clear the game progress and remove any lines displayed if the player or computer wins
  document.getElementById("diagonal1").style.display = "none";
  document.getElementById("diagonal2").style.display = "none";
  for(let i = 0; i < 3; i ++){
    document.getElementsByClassName("horizontal")[i].style.display = "none";
    document.getElementsByClassName("vertical")[i].style.display = "none";
    for(let j = 0; j < 3; j ++){
      map[i][j] = 0;
    }
  }
  // remove any cross or circle displayed in the buttons
  for(let i = 0; i < 9; i ++){
    document.getElementsByTagName("button")[i].innerHTML = "";
    document.getElementsByTagName("button")[i].disabled = false;
  }
  document.getElementById("result").innerHTML = "";
  // if the computer starts first, start the game automatically
  if(document.getElementsByTagName("input")[1].checked == true){
    for(let i = 0; i < 9; i ++){
      document.getElementsByTagName("button")[i].disabled = true;
    }
    if(document.getElementById("human").offsetWidth > document.getElementById("robot").offsetWidth){
      changeRound(0);
    }
    // delay for 0.75s before the computer give its choice
    computerRound = setTimeout(function(){
      // pick a random number between 0 - 8
      let i = Math.floor(Math.random() * 9);
      // computer will only choose the corners or the middle cell
      if(i >= 4){
        // computer choose the middle cell
        // 2 = computer
        map[1][1] = 2;
        // display the X of the clicked cell
        document.getElementsByTagName("button")[4].innerHTML = "<img src = 'images/cross_black.svg' width = '100%' height = '100%'>";
        document.getElementsByTagName("button")[4].disabled = true;
      }else{
        // computer choose the corner cell
        // 2 = computer
        map[corners[i][0]][corners[i][1]] = 2;
        // display the X of the clicked cell
        document.getElementsByTagName("button")[corners[i][0] * 3 + corners[i][1]].innerHTML = "<img src = 'images/cross_black.svg' width = '100%' height = '100%'>";
        document.getElementsByTagName("button")[corners[i][0] * 3 + corners[i][1]].disabled = true;
      }
      // enable the empty buttons for the player round
      for(let i = 0; i < 3; i ++){
        for(let j = 0; j < 3; j ++){
          if(map[i][j] == 0){
            document.getElementsByTagName("button")[i * 3 + j].disabled = false;
          }
        }
      }
      if(document.getElementById("robot").offsetWidth > document.getElementById("human").offsetWidth){
        // change the display for the human and robot
        changeRound(1);
      }
    }, 750);
  }else if(document.getElementById("robot").offsetWidth > document.getElementById("human").offsetWidth){
    // change the display for the human and robot
    changeRound(1);
  }
}
