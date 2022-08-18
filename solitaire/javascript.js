class Card{
  constructor(type, num){
    this.type = type;
    this.num = num;
    this.display = false;
    this.image = "images/" + type + num + ".png";
  }
}

const cards = [];
const types = ["H", "S", "D", "C"];
const deck = [];
const finals = [[], [], [], []];
const stacks = [[], [], [], [], [], [], []];
const picked = [];
const dragged = [-1, -1];
const mainRect = document.getElementsByTagName("main")[0].getBoundingClientRect();
let deckPos = -1;
let dropped = true;
let dragPos = -1;
let endPos = 0;
let endInterval = 0;
let x = 0;
let y = 0;
let a = 1;
let endRect = 0;
let aIncreased = false;
let mode = 0;
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").catch(() => console.log("failed"));
}

for(let i = 0; i < 4; i ++){
  for(let j = 1; j <= 13; j ++){
    cards.push(new Card(types[i], j));
  }
}
start();

function start(){
  for(let i = 0; i < 7; i ++){
    for(let j = 0; j <= i; j ++){
      let n;
      do{
        n = Math.floor(Math.random() * 52);
      }while(picked.includes(n));
      stacks[i].push(cards[n]);
      picked.push(n);

      if(j == i){
        stacks[j][j].display = true;
      }
      let card;
      if(stacks[i][j].display){
        card = document.createElement("img");
        card.src = stacks[i][j].image;
        card.setAttribute("width", "100%");
        card.setAttribute("height", "100%");
        card.style.position = "absolute";
        if(innerWidth > 768){
          card.style.top = (27 * j) + "px";
        }else{
          card.style.top = (20 * j) + "px";
        }
        card.setAttribute("ondragstart", "drag(" + i + ", " + j + ")");
        card.setAttribute("ondragend", "endDrag()");
        card.setAttribute("ontouchmove", "touchDrag(" + i + ", " + j + ")");
        card.setAttribute("ontouchend", "touchDrop()");
      }else{
        card = document.createElement("img");
        card.src = "images/back.png";
        card.setAttribute("width", "100%");
        card.setAttribute("height", "100%");
        card.style.position = "absolute";
        if(innerWidth > 768){
          card.style.top = (27 * j) + "px";
        }else{
          card.style.top = (20 * j) + "px";
        }
        card.setAttribute("draggable", "false");
        card.setAttribute("onclick", "displayCard(" + i + ", " + j + ")");
      }
      document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(card);
      document.getElementsByClassName("droppable")[i].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * (stacks[i].length - 1) + "px";
    }
  }
  for(let i = 0; i < 24; i ++){
    let n;
    do{
      n = Math.floor(Math.random() * 52);
    }while(picked.includes(n));
    deck.push(cards[n]);
    picked.push(n);
  }
  document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "<img src = 'images/back.png' width = '100%' height = '100%' draggable = 'false'>";
}

function displayDeck(){
  if(mode == 0){
    deckPos ++;
    if(deckPos >= 0 && deckPos < deck.length){
      if(deckPos > 0){
        document.getElementById("display").getElementsByTagName("img")[deckPos - 1].setAttribute("draggable", "false");
        document.getElementById("display").getElementsByTagName("img")[deckPos - 1].removeAttribute("ontouchmove");
      }
      let card = document.createElement("img");
      card.src = deck[deckPos].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      card.style.position = "absolute";
      card.setAttribute("ondragstart", "drag(-1, " + deckPos + ")");
      card.setAttribute("ondragend", "endDrag()");
      card.setAttribute("ontouchmove", "touchDrag(-1, " + deckPos + ")");
      card.setAttribute("ontouchend", "touchDrop()");
      document.getElementById("display").getElementsByClassName("place")[0].appendChild(card);
    }
    if(deckPos == deck.length - 1){
      document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "";
    }else if(deckPos == deck.length){
      deckPos = -1;
      if(deck.length > 0){
        document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "<img src = 'images/back.png' width = '100%' height = '100%' draggable = 'false'>";
      }
      document.getElementById("display").getElementsByClassName("place")[0].innerHTML = "";
    }
  }else{
    document.getElementById("display").getElementsByClassName("place")[0].innerHTML = "";
    for(let i = 0; i < 3; i ++){
      deckPos ++;
      if(deckPos == deck.length){
        break;
      }
      let card = document.createElement("img");
      card.src = deck[deckPos].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      card.style.position = "absolute";
      card.style.left = 20 * i + "px";
      card.setAttribute("ondragstart", "drag(-1, " + deckPos + ")");
      card.setAttribute("ondragend", "endDrag()");
      card.setAttribute("ontouchend", "touchDrop()");
      if(i == 2 || deckPos == deck.length - 1){
        card.setAttribute("ontouchmove", "touchDrag(-1, " + deckPos + ")");
      }else{
        card.setAttribute("draggable", "false");
      }
      document.getElementById("display").getElementsByClassName("place")[0].appendChild(card);
      if(deckPos == deck.length - 1){
        break;
      }
    }
    if(deckPos >= deck.length - 1){
      document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "";
    }
    if(deckPos == deck.length){
      deckPos = -1;
      if(deck.length > 0){
        document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "<img src = 'images/back.png' width = '100%' height = '100%' draggable = 'false'>";
      }
      document.getElementById("display").getElementsByClassName("place")[0].innerHTML = "";
    }
  }

}

function displayCard(i, j){
  if(j == stacks[i].length - 1){
    document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j].src = stacks[i][j].image;
    document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j].draggable = "true";
    document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j].setAttribute("ondragstart", "drag(" + i + ", " + j + ")");
    document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j].setAttribute("ondragend", "endDrag()");
    document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j].setAttribute("ontouchmove", "touchDrag(" + i + ", " + j + ")");
    document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j].setAttribute("ontouchend", "touchDrop()");
    document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j].removeAttribute("onclick");
  }
}

function drag(i, j){
  if(dropped){
    dropped = false;
    dragged[0] = i;
    dragged[1] = j;
    if(i > 6){
      let card = document.createElement("img");
      card.src = finals[i - 7][j].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      document.getElementById("ghostPlace").appendChild(card);
      document.getElementsByClassName("final")[i - 7].getElementsByTagName("img")[j].style.opacity = "0";
    }else if(i > -1){
      for(let k = j; k < stacks[i].length; k ++){
        let card = document.createElement("img");
        card.src = stacks[i][k].image;
        card.setAttribute("width", "100%");
        card.setAttribute("height", "100%");
        card.style.position = "absolute";
        if(innerWidth > 768){
          card.style.top = (k - j) * 27 + "px";
        }else{
          card.style.top = (k - j) * 20 + "px";
        }
        document.getElementById("ghostPlace").appendChild(card);
        document.getElementsByClassName("stack")[i].getElementsByTagName("img")[k].style.opacity = "0";
      }
    }else{
      let card = document.createElement("img");
      card.src = deck[j].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      document.getElementById("ghostPlace").appendChild(card);
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.opacity = "0";
    }
    event.dataTransfer.setDragImage(document.getElementById("ghost"), document.getElementById("ghost").offsetHeight / 2, document.getElementById("ghost").offsetWidth / 2);
    document.getElementById("ghost").style.left = "-100px";
  }
}

function endDrag(){
  document.getElementById("ghostPlace").innerHTML = "";
  document.getElementById("ghost").style.left = "-200px";
  if(!dropped){
    dropped = true;
    if(dragged[0] > 6){
      document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].style.opacity = "1";
    }else if(dragged[0] > -1){
      for(let k = dragged[1]; k < stacks[dragged[0]].length; k ++){
        document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[k].style.opacity = "1";
      }
    }else{
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.opacity = "1";
    }
  }
  for(let k = 0; k < 2; k ++){
    dragged[k] = -1;
  }
}

function touchDrag(i, j){
  if(dropped){
    dropped = false;
    dragged[0] = i;
    dragged[1] = j;
    if(i > 6){
      let card = document.createElement("img");
      card.src = finals[i - 7][j].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      document.getElementById("ghostPlace").appendChild(card);
      document.getElementsByClassName("final")[i - 7].getElementsByTagName("img")[j].style.opacity = "0";
    }else if(i > -1){
      for(let k = j; k < stacks[i].length; k ++){
        let card = document.createElement("img");
        card.src = stacks[i][k].image;
        card.setAttribute("width", "100%");
        card.setAttribute("height", "100%");
        card.style.position = "absolute";
        if(innerWidth > 768){
          card.style.top = (k - j) * 27 + "px";
        }else{
          card.style.top = (k - j) * 20 + "px";
        }
        document.getElementById("ghostPlace").appendChild(card);
        document.getElementsByClassName("stack")[i].getElementsByTagName("img")[k].style.opacity = "0";
      }
    }else{
      let card = document.createElement("img");
      card.src = deck[j].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      document.getElementById("ghostPlace").appendChild(card);
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.opacity = "0";
    }
  }
  document.getElementById("ghost").style.top = (event.changedTouches[0].pageY - document.getElementById("ghost").offsetHeight / 2) + "px";
  document.getElementById("ghost").style.left = (event.changedTouches[0].pageX - document.getElementById("ghost").offsetWidth / 2) + "px";
}

function touchDrop(){
  if(!dropped){
    let n = document.elementsFromPoint(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    for(let i = 0; i < n.length; i ++){
      if(n[i].hasAttribute("ondrop")){
        eval(n[i].getAttribute("ondrop"));
      }
    }
  }
  endDrag();
}

function allowDrop(){
  event.preventDefault();
}

function stackDrop(i){
  let valid = false;
  if(dragged[0] > 6){
    if(stacks[i].length > 0){
      if(finals[dragged[0] - 7][dragged[1]].num == stacks[i][stacks[i].length - 1].num - 1){
        if(finals[dragged[0] - 7][dragged[1]].type == "S" || finals[dragged[0] - 7][dragged[1]].type == "C"){
          if(stacks[i][stacks[i].length - 1].type == "H" || stacks[i][stacks[i].length - 1].type == "D"){
            valid = true;
          }
        }else{
          if(stacks[i][stacks[i].length - 1].type == "S" || stacks[i][stacks[i].length - 1].type == "C"){
            valid = true;
          }
        }
      }
    }else{
      if(finals[dragged[0] - 7][dragged[1]].num == 13){
        valid = true;
      }
    }
    if(valid){
      stacks[i].push(finals[dragged[0] - 7][dragged[1]]);
      finals[dragged[0] - 7].pop();
      if(innerWidth > 768){
        document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].style.top = 27 * (stacks[i].length - 1) + "px";
      }else{
        document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].style.top = 20 * (stacks[i].length - 1) + "px";
      }
      document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].style.opacity = "1";
      document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].setAttribute("ondragstart", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
      document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].setAttribute("ontouchmove", "touchDrag(" + i + ", " + (stacks[i].length - 1) + ")");
      document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]]);
      document.getElementsByClassName("droppable")[i].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * (stacks[i].length - 1) + "px";
      dropped = true;
    }
  }else if(dragged[0] > -1){
    if(stacks[i].length > 0){
      if(stacks[dragged[0]][dragged[1]].num == stacks[i][stacks[i].length - 1].num - 1){
        if(stacks[dragged[0]][dragged[1]].type == "S" || stacks[dragged[0]][dragged[1]].type == "C"){
          if(stacks[i][stacks[i].length - 1].type == "H" || stacks[i][stacks[i].length - 1].type == "D"){
            valid = true;
          }
        }else{
          if(stacks[i][stacks[i].length - 1].type == "S" || stacks[i][stacks[i].length - 1].type == "C"){
            valid = true;
          }
        }
      }
    }else{
      if(stacks[dragged[0]][dragged[1]].num == 13){
        valid = true;
      }
    }
    if(valid){
      let n = stacks[dragged[0]].length
      for(let j = dragged[1]; j < n; j ++){
        stacks[i].push(stacks[dragged[0]][dragged[1]]);
        stacks[dragged[0]].splice(dragged[1], 1);
        if(innerWidth > 768){
          document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].style.top = 27 * (stacks[i].length - 1) + "px";
        }else{
          document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].style.top = 20 * (stacks[i].length - 1) + "px";
        }
        document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].style.opacity = "1";
        document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].setAttribute("ondragstart", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
        document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].setAttribute("ontouchmove", "touchDrag(" + i + ", " + (stacks[i].length - 1) + ")");
        document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]]);
        document.getElementsByClassName("droppable")[i].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * (stacks[i].length - 1) + "px";
      }
      dropped = true;
    }
  }else{
    if(stacks[i].length > 0){
      if(deck[dragged[1]].num == stacks[i][stacks[i].length - 1].num - 1){
        if(deck[dragged[1]].type == "S" || deck[dragged[1]].type == "C"){
          if(stacks[i][stacks[i].length - 1].type == "H" || stacks[i][stacks[i].length - 1].type == "D"){
            valid = true;
          }
        }else{
          if(stacks[i][stacks[i].length - 1].type == "S" || stacks[i][stacks[i].length - 1].type == "C"){
            valid = true;
          }
        }
      }
    }else{
      if(deck[dragged[1]].num == 13){
        valid = true;
      }
    }
    if(valid){
      stacks[i].push(deck[dragged[1]]);
      deck.splice(dragged[1], 1);
      deckPos --;
      if(innerWidth > 768){
        document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.top = 27 * (stacks[i].length - 1) + "px";
      }else{
        document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.top = 20 * (stacks[i].length - 1) + "px";
      }
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.left = "0";
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.opacity = "1";
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.setAttribute("ondragstart", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.setAttribute("ontouchmove", "touchDrag(" + i + ", " + (stacks[i].length - 1) + ")");
      document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(document.getElementById("display").getElementsByClassName("place")[0].lastElementChild);
      if(document.getElementById("display").getElementsByClassName("place")[0].children.length > 0){
        document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.setAttribute("ontouchmove", "touchDrag(-1, " + (dragged[1] - 1) + ")");
        document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.draggable = "true";
      }
      document.getElementsByClassName("droppable")[i].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * (stacks[i].length - 1) + "px";
      dropped = true;
    }
  }
}

function finalDrop(i){
  let valid = false;
  if(dragged[0] > 6){
    if(finals[i].length > 0){
      if(finals[dragged[0] - 7][dragged[1]].type == finals[i][finals[i].length - 1].type && finals[dragged[0] - 7][dragged[1]].num == finals[i][finals[i].length - 1].num + 1){
        valid = true;
      }
    }else{
      if(finals[dragged[0] - 7][dragged[1]].num == 1){
        valid = true;
      }
    }
    if(valid){
      finals[i].push(finals[dragged[0] - 7][dragged[1]]);
      finals[dragged[0] - 7].pop();
      deckPos --;
      document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].style.top = "0";
      document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].style.opacity = "1";
      document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].setAttribute("ondragstart", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].setAttribute("ontouchmove", "touchDrag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]]);
      dropped = true;
    }
  }else if(dragged[0] > -1){
    if(dragged[1] == stacks[dragged[0]].length - 1){
      if(finals[i].length > 0){
        if(stacks[dragged[0]][dragged[1]].type == finals[i][finals[i].length - 1].type && stacks[dragged[0]][dragged[1]].num == finals[i][finals[i].length - 1].num + 1){
          valid = true;
        }
      }else{
        if(stacks[dragged[0]][dragged[1]].num == 1){
          valid = true;
        }
      }
    }
    if(valid){
      finals[i].push(stacks[dragged[0]][dragged[1]]);
      stacks[dragged[0]].pop();
      document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].style.top = "0";
      document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].style.opacity = "1";
      document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].setAttribute("ondragstart", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]].setAttribute("ontouchmove", "touchDrag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]]);
      dropped = true;
    }
  }else{
    if(finals[i].length > 0){
      if(deck[dragged[1]].type == finals[i][finals[i].length - 1].type && deck[dragged[1]].num == finals[i][finals[i].length - 1].num + 1){
        valid = true;
      }
    }else{
      if(deck[dragged[1]].num == 1){
        valid = true;
      }
    }
    if(valid){
      finals[i].push(deck[dragged[1]]);
      deck.splice(dragged[1], 1);
      deckPos --;
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.top = "0";
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.left = "0";
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.opacity = "1";
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.setAttribute("ondragstart", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.setAttribute("ontouchmove", "touchDrag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(document.getElementById("display").getElementsByClassName("place")[0].lastElementChild);
      if(document.getElementById("display").getElementsByClassName("place")[0].children.length > 0){
        document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.setAttribute("ontouchmove", "touchDrag(-1, " + (dragged[1] - 1) + ")");
        document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.draggable = "true";
      }
      dropped = true;
    }
  }
  if(win()){
    end();
  }
}

function win(){
  for(let i = 0; i < 4; i ++){
    if(finals[i].length < 13){
      return false;
    }
  }
  return true;
}

function end(){
  document.getElementById("end").style.display = "block";
  endRect = document.getElementsByClassName("final")[endPos].getElementsByClassName("place")[0].getBoundingClientRect();
  x = endRect.x - mainRect.x;
  endInterval = setInterval(endAnimation, 10);
}

function endAnimation(){
  y = mainRect.height - endRect.height - a * Math.abs(Math.cos((x - endRect.x + mainRect.x - 1) / (mainRect.height - endRect.height - endRect.y + mainRect.y) * 10)) * (mainRect.height - endRect.height - endRect.y + mainRect.y);
  if(!aIncreased && y >= mainRect.height - endRect.height - 15){
    a *= 2/3;
    aIncreased = true;
  }else if(y < mainRect.height - endRect.height - 15){
    aIncreased = false;
  }
  let card = document.createElement("img");
  card.src = finals[endPos][finals[endPos].length - 1].image;
  card.setAttribute("width", endRect.width + "px");
  card.setAttribute("height", endRect.height + "px");
  card.style.position = "absolute";
  card.style.top = y + "px";
  card.style.left = x + "px";
  document.getElementById("end").appendChild(card);
  x --;
  if(x < -endRect.width){
    clearInterval(endInterval);
    endPos ++;
    if(endPos < 4){
      endRect = document.getElementsByClassName("final")[endPos].getElementsByClassName("place")[0].getBoundingClientRect();
      x = endRect.x - mainRect.x;
      a = 1;
      endInterval = setInterval(endAnimation, 10);
    }
  }
}

function restart(){
  clearInterval(endInterval);
  endPos = 0;
  a = 1;
  aIncreased = false;
  document.getElementById("end").innerHTML = "";
  document.getElementById("end").style.display = "none";
  picked.splice(0, picked.length);
  deck.splice(0, deck.length);
  deckPos = -1;
  if(document.getElementsByTagName("option")[0].selected == true){
    mode = 0;
  }else{
    mode = 1;
  }
  for(let i = 0; i < 52; i ++){
    cards[i].display = false;
    if(i < 13){
      document.getElementsByClassName("place")[i].innerHTML = "";
    }
    if(i < 7){
      stacks[i].splice(0, stacks[i].length);
    }
    if(i < 4){
      finals[i].splice(0, finals[i].length);
    }
  }
  start();
}
