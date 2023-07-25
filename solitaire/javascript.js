// class of a Card object
class Card{
  // initialize a Card object
  constructor(type, num){
    // type = H (heart), S (spade), D (diamond), C (club)
    this.type = type;
    // num = 1 - 13 (1 = A, 11 = J, 12 = Q, 13 = K)
    this.num = num;
    //
    this.display = false;
    this.image = "images/" + type + num + ".png";
  }
}

// collection of all 52 cards objects
const cards = [];
// possible types of the cards
const types = ["H", "S", "D", "C"];
// collection of the cards in the deck
const deck = [];
// collection of the cards in the 4 final stacks
const finals = [[], [], [], []];
// collection of the cards in the 7 stacks
const stacks = [[], [], [], [], [], [], []];
// store the cards that are already picked, used for random distribution of the cards at the start of a game
const picked = [];
// [i, j] = position of the dragged card, i = index of stack, j = index of card in that stack
const dragged = [-1, -1];
// [x, y] = position of dragged point in the card
const ghostPos = [-1, -1];
// [x, y] = position of dragged point in the page
const dragPos = [-1, -1];
// empty Image object for invisibility of the drag image
const emptyImage = new Image();
//
const mainRect = document.getElementsByTagName("main")[0].getBoundingClientRect();
// index of the displayed card in the deck
let deckPos = -1;
// record whether the dragging card is dropped
let dropped = true;
//
let endPos = 0;
let endInterval = 0;
let x = 0;
let y = 0;
let a = 1;
let endRect = 0;
let aIncreased = false;
let mode = 0;

// register sevice worker to enable PWA features
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").catch(() => console.log("failed"));
}

// link the empty Image object with a transparent image
emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// initialize the Card objects for every combination of types and numbers
for(let i = 0; i < 4; i ++){
  for(let j = 1; j <= 13; j ++){
    cards.push(new Card(types[i], j));
  }
}

//start the game
const start = () => {
  // randomly generate cards for the 7 stacks
  for(let i = 0; i < 7; i ++){
    // the number of cards in each stack increases from 0 to 6
    for(let j = 0; j <= i; j ++){
      // randomly pick a card in 52 cards
      let n;
      do{
        // repick a card if it has already been picked
        n = Math.floor(Math.random() * 52);
      }while(picked.includes(n));
      // put the card in the stack
      stacks[i].push(cards[n]);
      // record the picked card
      picked.push(n);
      // display the last card in the stack
      if(j == i){
        stacks[j][j].display = true;
      }
      // create the image of the card
      let card = document.createElement("img");
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      card.style.position = "absolute";
      card.style.top = (8 * j) + "%";
      if(stacks[i][j].display){
        // display the image of the card
        card.src = stacks[i][j].image;
        // draggble must be set to true to set the drag image to an empty image
        card.setAttribute("draggable", "true");
        // drag image can only be set in dragstart event
        card.setAttribute("ondragstart", "drag(" + i + ", " + j + ")");
        card.setAttribute("ondrag", "console.log(event)");
        card.setAttribute("ondragend", "drop()");
        card.setAttribute("ontouchmove", "drag(" + i + ", " + j + ")");
        card.setAttribute("ontouchend", "drop()");
        card.setAttribute("ontouchcancel", "drop()");
      }else{
        // display the image of the back of the card
        card.src = "images/back.png";
        // disable dragging of undisplayed card
        card.setAttribute("draggable", "false");
        // click to display the card
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

start();

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
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", "drag(-1, " + deckPos + ")");
      card.setAttribute("ondrag", "console.log(event)");
      card.setAttribute("ondragend", "drop()");
      card.setAttribute("ontouchmove", "drag(-1, " + deckPos + ")");
      card.setAttribute("ontouchend", "drop()");
      card.setAttribute("ontouchcancel", "drop()");
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
      card.style.left = 30 * i + "%";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", "drag(-1, " + deckPos + ")");
      card.setAttribute("ondrag", "console.log(event)");
      card.setAttribute("ondragend", "drop()");
      card.setAttribute("ontouchend", "drop()");
      card.setAttribute("ontouchcancel", "drop()");
      if(i == 2 || deckPos == deck.length - 1){
        card.setAttribute("ontouchmove", "drag(-1, " + deckPos + ")");
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
    let card = document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j];
    card.src = stacks[i][j].image;
    card.draggable = "true";
    // draggble must be set to true to set the drag image to an empty image
    card.setAttribute("draggable", "true");
    // drag image can only be set in dragstart event
    card.setAttribute("ondragstart", "drag(" + i + ", " + j + ")");
    card.setAttribute("ondrag", "console.log(event)");
    card.setAttribute("ondragend", "drop()");
    card.setAttribute("ontouchmove", "drag(" + i + ", " + j + ")");
    card.setAttribute("ontouchend", "drop()");
    card.setAttribute("ontouchcancel", "drop()");
    card.removeAttribute("onclick");
  }
}

function drag(i, j){
  console.log(event);
  let top = -22;
  if(dropped){
    dropped = false;
    dragged[0] = i;
    dragged[1] = j;
    if(event.type == "dragstart"){
      event.dataTransfer.setDragImage(emptyImage, 0, 0);
      dragPos[0] = event.pageX;
      dragPos[1] = event.pageY;
      ghostPos[0] = event.layerX;
      ghostPos[1] = event.layerY;
    }else{
      dragPos[0] = event.changedTouches[0].pageX;
      dragPos[1] = event.changedTouches[0].pageY;
      ghostPos[0] = dragPos[0] - event.srcElement.getBoundingClientRect().x;
      ghostPos[1] = dragPos[1] - event.srcElement.getBoundingClientRect().y;
    }
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
        card.style.top = (top + 22) + "%";
        top += 22;
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
}

function allowDrop(){
  event.preventDefault();
  if(event.type == "dragover"){
    dragPos[0] = event.pageX;
    dragPos[1] = event.pageY;
  }else{
    dragPos[0] = event.changedTouches[0].pageX;
    dragPos[1] = event.changedTouches[0].pageY;
  }
  console.log(dragPos, ghostPos);
  ghost.style.top = (dragPos[1] - ghostPos[1]) + "px";
  ghost.style.left = (dragPos[0] - ghostPos[0]) + "px";
}

function drop(){
  console.log(event);
  if(!dropped){
    let n = document.elementsFromPoint(dragPos[0], dragPos[1]);
    for(let i = 0; i < n.length; i ++){
      if(n[i].hasAttribute("ondrop")){
        eval(n[i].getAttribute("ondrop"));
      }
    }
  }
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

function stackDrop(i){
  let valid = false;
  let top;
  if(stacks[i].length > 0){
    top = parseInt(document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].lastElementChild.style.top);
  }else{
    top = -22;
  }
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
      let card = document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]];
      stacks[i].push(finals[dragged[0] - 7][dragged[1]]);
      finals[dragged[0] - 7].pop();
      card.style.top = (top + 22) + "%";
      top += 22;
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
      card.setAttribute("ondrag", "console.log(event)");
      card.setAttribute("ontouchmove", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
      document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(card);
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
      let n = stacks[dragged[0]].length;
      for(let j = dragged[1]; j < n; j ++){
        let card = document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]];
        stacks[i].push(stacks[dragged[0]][dragged[1]]);
        stacks[dragged[0]].splice(dragged[1], 1);
        card.style.top = (top + 22) + "%";
        top += 22;
        card.style.opacity = "1";
        // draggble must be set to true to set the drag image to an empty image
        card.setAttribute("draggable", "true");
        // drag image can only be set in dragstart event
        card.setAttribute("ondragstart", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
        card.setAttribute("ondrag", "console.log(event)");
        card.setAttribute("ontouchmove", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
        document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(card);
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
      let card = document.getElementById("display").getElementsByClassName("place")[0].lastElementChild;
      stacks[i].push(deck[dragged[1]]);
      deck.splice(dragged[1], 1);
      deckPos --;
      card.style.top = (top + 22) + "%";
      top += 22;
      card.style.left = "0";
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
      card.setAttribute("ondrag", "console.log(event)");
      card.setAttribute("ontouchmove", "drag(" + i + ", " + (stacks[i].length - 1) + ")");
      document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(card);
      if(document.getElementById("display").getElementsByClassName("place")[0].children.length > 0){
        // enable dragging of next card on display
        card = document.getElementById("display").getElementsByClassName("place")[0].lastElementChild;
        card.setAttribute("ontouchmove", "drag(-1, " + (dragged[1] - 1) + ")");
        card.draggable = "true";
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
      let card = document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]];
      finals[i].push(finals[dragged[0] - 7][dragged[1]]);
      finals[dragged[0] - 7].pop();
      deckPos --;
      card.style.top = "0";
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      card.setAttribute("ondrag", "console.log(event)");
      card.setAttribute("ontouchmove", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(card);
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
      let card = document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]];
      finals[i].push(stacks[dragged[0]][dragged[1]]);
      stacks[dragged[0]].pop();
      card.style.top = "0";
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      card.setAttribute("ondrag", "console.log(event)");
      card.setAttribute("ontouchmove", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(card);
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
      let card = document.getElementById("display").getElementsByClassName("place")[0].lastElementChild;
      finals[i].push(deck[dragged[1]]);
      deck.splice(dragged[1], 1);
      deckPos --;
      card.style.top = "0";
      card.style.left = "0";
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      card.setAttribute("ondrag", "console.log(event)");
      card.setAttribute("ontouchmove", "drag(" + (i + 7) + ", " + (finals[i].length - 1) + ")");
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(card);
      if(document.getElementById("display").getElementsByClassName("place")[0].children.length > 0){
        // enable dragging of next card on display
        card = document.getElementById("display").getElementsByClassName("place")[0].lastElementChild;
        card.setAttribute("ontouchmove", "drag(-1, " + (dragged[1] - 1) + ")");
        card.draggable = "true";
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
