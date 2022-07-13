const map = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
let computerRound = 0;
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").catch(() => console.log("failed"));
}

for(let i = 0; i < 3; i ++){
  document.getElementsByClassName("vertical")[i].style.left = (i * document.getElementById("map").getElementsByTagName("button")[0].offsetWidth + document.getElementById("map").getElementsByTagName("button")[i].clientWidth / 2) + "px";
  document.getElementsByClassName("horizontal")[i].style.top = (i * document.getElementById("map").getElementsByTagName("button")[0].offsetHeight + document.getElementById("map").getElementsByTagName("button")[i * 3].clientHeight / 2 + document.getElementById("map").getElementsByTagName("button")[0].offsetTop - document.getElementsByClassName("horizontal")[i].offsetHeight / 2) + "px";
  document.getElementsByClassName("vertical")[i].style.display = "none";
  document.getElementsByClassName("horizontal")[i].style.display = "none";
}
document.getElementById("diagonal1").style.display = "none";
document.getElementById("diagonal2").style.display = "none";

function changeCharacter(i){
  restart();
  document.getElementsByClassName("selectCharacter")[i].style = "background-color: black";
  document.getElementsByTagName("input")[i].disabled = true;
  document.getElementsByTagName("img")[i].src = document.getElementsByTagName("img")[i].src.replace("black", "white");
  document.getElementsByClassName("selectCharacter")[1 - i].style = "";
  document.getElementsByTagName("input")[1 - i].disabled = false;
  document.getElementsByTagName("img")[1 - i].src = document.getElementsByTagName("img")[1 - i].src.replace("white", "black");
}

function changeRound(i){
  let width = document.getElementById("human").offsetWidth;
  let height = document.getElementById("human").offsetHeight;
  document.getElementById("human").style.width = document.getElementById("robot").offsetWidth + "px";
  document.getElementById("human").style.height = document.getElementById("robot").offsetHeight + "px";
  document.getElementById("robot").style.width = width + "px";
  document.getElementById("robot").style.height = height + "px";
  if(i == 0){
    document.getElementById("human").style.opacity = "0.5";
    document.getElementById("robot").style.opacity = "1";
  }else{
    document.getElementById("robot").style.opacity = "0.5";
    document.getElementById("human").style.opacity = "1";
  }
}

function gameRound(i, j){
  map[i][j] = 1;
  if(document.getElementsByTagName("input")[0].checked == true){
    document.getElementsByTagName("button")[i * 3 + j].innerHTML = "<img src = 'images/cross_black.svg' width = '100%' height = '100%'>";
  }else{
    document.getElementsByTagName("button")[i * 3 + j].innerHTML = "<img src = 'images/circle_black.svg' width = '100%' height = '100%'>";
  }
  document.getElementsByTagName("button")[i * 3 + j].disabled = true;
  if(win(1)){
    document.getElementById("result").innerHTML = "You win!";
    for(let i = 0; i < 9; i ++){
      document.getElementsByTagName("button")[i].disabled = true;
    }
    return;
  }
  if(draw()){
    document.getElementById("result").innerHTML = "Draw";
    return;
  }
  for(let i = 0; i < 9; i ++){
    document.getElementsByTagName("button")[i].disabled = true;
  }
  changeRound(0);
  computerRound = setTimeout(function(){
    let pos = computer();
    map[pos[0]][pos[1]] = 2;
    if(document.getElementsByTagName("input")[0].checked == true){
      document.getElementsByTagName("button")[pos[0] * 3 + pos[1]].innerHTML = "<img src = 'images/circle_black.svg' width = '100%' height = '100%'>";
    }else{
      document.getElementsByTagName("button")[pos[0] * 3 + pos[1]].innerHTML = "<img src = 'images/cross_black.svg' width = '100%' height = '100%'>";
    }
    document.getElementsByTagName("button")[pos[0] * 3 + pos[1]].disabled = true;
    if(win(2)){
      document.getElementById("result").innerHTML = "You lose!";
      for(let i = 0; i < 9; i ++){
        document.getElementsByTagName("button")[i].disabled = true;
        return;
      }
    }
    if(draw()){
      document.getElementById("result").innerHTML = "Draw";
      return;
    }
    for(let i = 0; i < 3; i ++){
      for(let j = 0; j < 3; j ++){
        if(map[i][j] == 0){
          document.getElementsByTagName("button")[i * 3 + j].disabled = false;
        }
      }
    }
    changeRound(1);
  }, 750);
}

function win(n){
  for(let i = 0; i < 3; i ++){
    if(map[i][0] == n && map[i][1] == n && map[i][2] == n){
      document.getElementsByClassName("horizontal")[i].style.display = "block";
      return true;
    }
    if(map[0][i] == n && map[1][i] == n && map[2][i] == n){
      document.getElementsByClassName("vertical")[i].style.display = "block";
      return true;
    }
  }
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

function draw(){
  let count = 0;
  for(let i = 0; i < 3; i ++){
    for(let j = 0; j < 3; j ++){
      if(map[i][j] == 0){
        count ++;
      }
    }
  }
  if(count == 0){
    return true;
  }
  return false;
}

function restart(){
  clearTimeout(computerRound);
  document.getElementById("diagonal1").style.display = "none";
  document.getElementById("diagonal2").style.display = "none";
  for(let i = 0; i < 3; i ++){
    document.getElementsByClassName("horizontal")[i].style.display = "none";
    document.getElementsByClassName("vertical")[i].style.display = "none";
    for(let j = 0; j < 3; j ++){
      map[i][j] = 0;
    }
  }
  for(let i = 0; i < 9; i ++){
    document.getElementsByTagName("button")[i].innerHTML = "";
    document.getElementsByTagName("button")[i].disabled = false;
  }
  document.getElementById("result").innerHTML = "";
  if(document.getElementsByTagName("input")[1].checked == true){
    for(let i = 0; i < 9; i ++){
      document.getElementsByTagName("button")[i].disabled = true;
    }
    if(document.getElementById("human").offsetWidth > document.getElementById("robot").offsetWidth){
      changeRound(0);
    }
    computerRound = setTimeout(function(){
      let i = Math.floor(Math.random() * 9);
      if(i >= 4){
        map[1][1] = 2;
        document.getElementsByTagName("button")[4].innerHTML = "<img src = 'images/cross_black.svg' width = '100%' height = '100%'>";
        document.getElementsByTagName("button")[4].disabled = true;
      }else{
        map[corners[i][0]][corners[i][1]] = 2;
        document.getElementsByTagName("button")[corners[i][0] * 3 + corners[i][1]].innerHTML = "<img src = 'images/cross_black.svg' width = '100%' height = '100%'>";
        document.getElementsByTagName("button")[corners[i][0] * 3 + corners[i][1]].disabled = true;
      }
      for(let i = 0; i < 3; i ++){
        for(let j = 0; j < 3; j ++){
          if(map[i][j] == 0){
            document.getElementsByTagName("button")[i * 3 + j].disabled = false;
          }
        }
      }
      if(document.getElementById("robot").offsetWidth > document.getElementById("human").offsetWidth){
        changeRound(1);
      }
    }, 750);
  }else if(document.getElementById("robot").offsetWidth > document.getElementById("human").offsetWidth){
    changeRound(1);
  }
}
