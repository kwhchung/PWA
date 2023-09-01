// class of a Card object
class Card{
  // initialize a Card object
  constructor(type, num){
    // type = H (heart), S (spade), D (diamond), C (club)
    this.type = type;
    // num = 1 - 13 (1 = A, 11 = J, 12 = Q, 13 = K)
    this.num = num;
    // display the card as its image or the back image
    this.display = false;
    // path to the image of the card
    this.image = "images/" + type + num + ".png";
  }
}

// class of an Action object
class Action{
  constructor(type, fromi, fromj, toi, toj){
    // 1 = undisplay a card in a stack, 2 = undisplay a card in the deck, 3 = move a card back to a stack, 4 = move a card back to a final stack, 5 = move a card back to the deck
    this.type = type;
    // i = index of deck, stack or final stack, j = index of card in that deck, stack or final stack
    this.fromi = fromi;
    this.fromj = fromj;
    this.toi = toi;
    this.toj = toj;
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
// collection of the actions performed
const actions = [];
// [i, j] = position of the dragged card, i = index of stack, j = index of card in that stack
const dragged = [-1, -1];
// [x, y] = position of dragged point in the card
const ghostPos = [-1, -1];
// [x, y] = position of dragged point in the page
const dragPos = [-1, -1];
// [i, j] = position of the card for the ending animation, i = index of final stack, j = index of card in that final stacl
const endPos = [0, 12];
// empty Image object for invisibility of the drag image
const emptyImage = new Image();
// store the size information of the main map for the ending animation
const mainRect = document.getElementsByTagName("main")[0].getBoundingClientRect();
// index of the displayed card in the deck
let deckPos = -1;
// record whether the dragging card is dropped
let dropped = true;
// id of the interval of the ending animation
let endInterval = 0;
// position of the displaying card in the ending animation
let x = 0;
let y = 0;
// scale of the curve along the y-axis in the ending animation
let a = 1;
// scale of the curve along the x-axis in the ending animation
let b = 1;
// store the previous y position of the card in the ending animation
let prevY = 0;
// store the size information of the final stack for the ending animation
let endRect = 0;
// record whether a has been decreased in that drop of cards in the ending animation
let aDecreased = false;
// scale of the decrease of a of the next drop of cards in the ending animation
let aDecrease = 1;
// 0 = display 1 card on the deck, 1 = display 3 cards on the deck
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
      // set the top position of the current card as 8% lower than the previous card if it is not displayed
      card.style.top = (8 * j) + "%";
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, ${i}, ${j})`);
      card.setAttribute("ondragend", "drop()");
      card.setAttribute("ontouchend", "drop()");
      card.setAttribute("ontouchcancel", "drop()")
      // the card is displayed
      if(stacks[i][j].display){
        // display the image of the card
        card.src = stacks[i][j].image;
        // draggble must be set to true to set the drag image to an empty image
        card.setAttribute("draggable", "true");
        card.setAttribute("ontouchmove", `drag(event, ${i}, ${j})`);
      // the card is not displayed
      }else{
        // display the image of the back of the card
        card.src = "images/back.png";
        // disable dragging of undisplayed card
        card.setAttribute("draggable", "false");
        // click to display the card
        card.setAttribute("onclick", `displayCard(${i}, ${j})`);
      }
      // add the card image to the stack
      document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(card);
      // enlarge the area that allows dropping of cards
      document.getElementsByClassName("droppable")[i].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * (stacks[i].length - 1) + "px";
    }
  }
  // put the remaining cards in the deck
  for(let i = 0; i < 24; i ++){
    // randomly pick a card in the remaining 24 cards
    let n;
    do{
      // repick a card if it has already been picked
      n = Math.floor(Math.random() * 52);
    }while(picked.includes(n));
    // set display of the card to true for calculating the top position in the stack
    cards[n].display = true;
    // put the card in the deck
    deck.push(cards[n]);
    // record the picked card
    picked.push(n);
  }
  // display the image of the back of the card in the deck
  document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "<img src = 'images/back.png' width = '100%' height = '100%' draggable = 'false'>";
}

start();

// click on the deck to display 1 or 3 cards
const displayDeck = () => {
  let display = document.getElementById("display").getElementsByClassName("place")[0];
  // display 1 card on the deck
  if(mode == 0){
    deckPos ++;
    // the next card is available for display in the deck
    if(deckPos >= 0 && deckPos < deck.length){
      // there are cards currently displaying
      if(deckPos > 0){
        // disable dragging of the current displaying cards
        let card = document.getElementById("display").getElementsByTagName("img")[deckPos - 1];
        card.setAttribute("draggable", "false");
        card.removeAttribute("ontouchmove");
      }
      // create the image of the card
      let card = document.createElement("img");
      // display the image of the card
      card.src = deck[deckPos].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      card.style.position = "absolute";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, -1, ${deckPos})`);
      card.setAttribute("ontouchmove", `drag(event, -1, ${deckPos})`);
      card.setAttribute("ondragend", "drop()");
      card.setAttribute("ontouchend", "drop()");
      card.setAttribute("ontouchcancel", "drop()");
      // add the card image to the displaying cards
      display.appendChild(card);
    }
    // the current card is the last card in the deck
    if(deckPos == deck.length - 1){
      // remove the image of the back of the card in the deck
      document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "";
    // all cards in the deck has been displayed, revert the deck
    }else if(deckPos == deck.length){
      deckPos = -1;
      // the deck still has cards
      if(deck.length > 0){
        // display the image of the back of the card in the deck
        document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "<img src = 'images/back.png' width = '100%' height = '100%' draggable = 'false'>";
      }
      // clear the current displaying cards
      display.innerHTML = "";
    }
    // the deck still has cards, a card is displayed successfully
    if(deck.length > 0){
      // record the action for undo
      actions.push(new Action(2, 0));
      // enable undo
      document.getElementById("undo").disabled = false;
    }
  // display 3 cards on the deck
  }else{
    // number of cards currently displaying
    let n = display.childElementCount;
    // clear the current displaying cards
    display.innerHTML = "";
    // display the next 3 cards in the deck
    for(let i = 0; i < 3; i ++){
      deckPos ++;
      // all the cards in the deck has been displayed
      if(deckPos == deck.length){
        break;
      }
      // create the image of the card
      let card = document.createElement("img");
      // display the image of the card
      card.src = deck[deckPos].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      card.style.position = "absolute";
      // set the left position of the current card as 30% right than the previous displayed card
      card.style.left = (30 * i) + "%";
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, -1, ${deckPos})`);
      card.setAttribute("ondragend", "drop()");
      card.setAttribute("ontouchend", "drop()");
      card.setAttribute("ontouchcancel", "drop()");
      // the top card currently displaying
      if(i == 2 || deckPos == deck.length - 1){
        // draggble must be set to true to set the drag image to an empty image
        card.setAttribute("draggable", "true");
        card.setAttribute("ontouchmove", `drag(event, -1, ${deckPos})`);
      // the bottom cards currently displaying
      }else{
        // disable dragging of the card
        card.setAttribute("draggable", "false");
      }
      // add the card image to the displaying cards
      display.appendChild(card);
      // the last card of the deck
      if(deckPos == deck.length - 1){
        break;
      }
    }
    // the current card is the last card in the deck
    if(deckPos >= deck.length - 1){
      // remove the image of the back of the card in the deck
      document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "";
    }
    // all cards in the deck has been displayed, revert the deck
    if(deckPos == deck.length){
      deckPos = -1;
      // the deck still has cards
      if(deck.length > 0){
        // display the image of the back of the card in the deck
        document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "<img src = 'images/back.png' width = '100%' height = '100%' draggable = 'false'>";
      }
      // clear the current displaying cards
      display.innerHTML = "";
    }
    // the deck still has cards, a card is displayed successfully
    if(deck.length > 0){
      // record the action for undo
      actions.push(new Action(2, n));
      // enable undo
      document.getElementById("undo").disabled = false;
    }
  }
}

// click on an undisplayed card to display it
// i = index of stack, j = index of card in that stack
const displayCard = (i, j) => {
  // display the card if it is the last card of a stack
  if(j == stacks[i].length - 1){
    // set display of the card to true for calculating the top position in the stack
    stacks[i][j].display = true;
    let card = document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j];
    // display the image of the card
    card.src = stacks[i][j].image;
    // draggble must be set to true to set the drag image to an empty image
    card.setAttribute("draggable", "true");
    card.setAttribute("ontouchmove", `drag(event, ${i}, ${j})`);
    card.removeAttribute("onclick");
    // record the action for undo
    actions.push(new Action(1, i, j));
    // enable undo
    document.getElementById("undo").disabled = false;
  }
}

// drag a card
// event = dragstart or touchmove event, i = index of stack, j = index of card in that stack
const drag = (event, i, j) => {
  // top position of the cards
  let top = -22;
  // the card is previously dropped, the first drag or touch event fired in current drag, used for touchmove events
  if(dropped){
    // record the drag status of the card
    dropped = false;
    // record the position of the dragged card
    dragged[0] = i;
    dragged[1] = j;
    // drag event fired by laptop or mouse
    if(event.type == "dragstart"){
      // set drag image to an empty image to be invisible
      event.dataTransfer.setDragImage(emptyImage, 0, 0);
      // record the dragged point on the screen
      dragPos[0] = event.pageX;
      dragPos[1] = event.pageY;
      // record the dragged point on the card
      ghostPos[0] = event.layerX;
      ghostPos[1] = event.layerY;
    // touch event fired by touchscreen devices
    }else{
      // get the size information of the dragged card
      let rect = event.srcElement.getBoundingClientRect();
      // record the dragged point on the screen
      dragPos[0] = event.changedTouches[0].pageX;
      dragPos[1] = event.changedTouches[0].pageY;
      // record the dragged point on the card
      ghostPos[0] = dragPos[0] - rect.x;
      ghostPos[1] = dragPos[1] - rect.y;
    }
    // card from the final stacks
    if(i > 6){
      // create the image of the card
      let card = document.createElement("img");
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      // display the image of the card
      card.src = finals[i - 7][j].image;
      // set the ghost image of the dragging cards
      document.getElementById("ghostPlace").appendChild(card);
      // set the original card image invisible
      document.getElementsByClassName("final")[i - 7].getElementsByTagName("img")[j].style.opacity = "0";
    // card from the stacks
    }else if(i > -1){
      // set the ghost image to the selected card and the cards below it
      for(let k = j; k < stacks[i].length; k ++){
        // create the image of the card
        let card = document.createElement("img");
        card.setAttribute("width", "100%");
        card.setAttribute("height", "100%");
        // display the image of the card
        card.src = stacks[i][k].image;
        card.style.position = "absolute";
        // set the top position of the current card as 22% lower than the previous card if it is displayed
        card.style.top = (top + 22) + "%";
        top += 22;
        // set the ghost image of the dragging cards
        document.getElementById("ghostPlace").appendChild(card);
        // set the original card image invisible
        document.getElementsByClassName("stack")[i].getElementsByTagName("img")[k].style.opacity = "0";
      }
    // card from the deck
    }else{
      // create the image of the card
      let card = document.createElement("img");
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      // display the image of the card
      card.src = deck[j].image;
      // set the ghost image of the dragging cards
      document.getElementById("ghostPlace").appendChild(card);
      // set the original card image invisible
      document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.opacity = "0";
    }
  }
}

// allow dropping of cards on the screen and record the dragging position
// event = dragover or touchmove event
const allowDrop = event => {
  // allow dropping of cards
  event.preventDefault();
  // a card is currently being dragged
  if(!dropped){
    // drag event fired by laptop or mouse
    if(event.type == "dragover"){
      // record the dragged point on the screen
      dragPos[0] = event.pageX;
      dragPos[1] = event.pageY;
    // touch event fired by touchscreen devices
    }else{
      // record the dragged point on the screen
      dragPos[0] = event.changedTouches[0].pageX;
      dragPos[1] = event.changedTouches[0].pageY;
    }
    // set the position of the ghost image to follow the dragging point
    ghost.style.top = (dragPos[1] - ghostPos[1]) + "px";
    ghost.style.left = (dragPos[0] - ghostPos[0]) + "px";
  }
}

// drop a card
const drop = () => {
  // a card is currently being dragged
  if(!dropped){
    // record the drag status of the card
    dropped = true;
    // clear the ghost image
    document.getElementById("ghostPlace").innerHTML = "";
    document.getElementById("ghost").style.left = "-200px";
    // all elements on the point the card is dropped
    let n = document.elementsFromPoint(dragPos[0], dragPos[1]);
    // record whether the card is dropped successfully
    let valid = false;
    for(let i = 0; i < n.length; i ++){
      // perform drop action if the element on the dropping point accepts dropping of cards
      if(n[i].hasAttribute("ondrop")){
        valid = eval(n[i].getAttribute("ondrop"));
        if(valid){
          break;
        }
      }
    }
    // if the drop action is unsuccessful, revert the card to the original position
    if(!valid){
      // card from the final stacks
      if(dragged[0] > 6){
        // show the dragged card
        document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]].style.opacity = "1";
      // card from the stacks
      }else if(dragged[0] > -1){
        for(let k = dragged[1]; k < stacks[dragged[0]].length; k ++){
          // show the dragged card
          document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[k].style.opacity = "1";
        }
      // card from the deck
      }else{
        // show the dragged card
        document.getElementById("display").getElementsByClassName("place")[0].lastElementChild.style.opacity = "1";
      }
    }
  }
  // clear the record of the position of the dragged card
  for(let k = 0; k < 2; k ++){
    dragged[k] = -1;
  }
}

// drop a card on the stack and return whether the card is dropped successfully
// i = index of stack
const stackDrop = i => {
  // record whether the card is dropped successfully
  let valid = false;
  // top position of the cards
  let top;
  // there are cards in the stack
  if(stacks[i].length > 0){
    // get the top position of the last card in the stack
    top = parseInt(document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].lastElementChild.style.top);
  // there are no card in the stack
  }else{
    top = -22;
  }
  // card from the final stacks
  if(dragged[0] > 6){
    // there are cards in the stack
    if(stacks[i].length > 0){
      // the value of the card dropped is 1 less than the value of the last card in the stack
      if(finals[dragged[0] - 7][dragged[1]].num == stacks[i][stacks[i].length - 1].num - 1){
        // the color of the card dropped is different from the color of the last card in the stack
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
    // there are no card in the stack
    }else{
      // the value of the card dropped is K
      if(finals[dragged[0] - 7][dragged[1]].num == 13){
        valid = true;
      }
    }
    // if the drop action is valid, perform the drop action
    if(valid){
      let card = document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]];
      // move the card from the final stack to the stack
      stacks[i].push(finals[dragged[0] - 7][dragged[1]]);
      finals[dragged[0] - 7].pop();
      // set the top position of the current card as 22% lower than the previous card if it is displayed
      card.style.top = (top + 22) + "%";
      top += 22;
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, ${i}, ${stacks[i].length - 1})`);
      card.setAttribute("ontouchmove", `drag(event, ${i}, ${stacks[i].length - 1})`);
      // move the card image to the stack
      document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(card);
      // enlarge the area that allows dropping of cards
      document.getElementsByClassName("droppable")[i].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * (stacks[i].length - 1) + "px";
      // record the action for undo
      actions.push(new Action(4, dragged[0] - 7, dragged[1], i, stacks[i].length - 1));
      // enable undo
      document.getElementById("undo").disabled = false;
    }
  // card from the stacks
  }else if(dragged[0] > -1){
    // there are cards in the stack
    if(stacks[i].length > 0){
      // the value of the card dropped is 1 less than the value of the last card in the stack
      if(stacks[dragged[0]][dragged[1]].num == stacks[i][stacks[i].length - 1].num - 1){
        // the color of the card dropped is different from the color of the last card in the stack
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
    // there are no card in the stack
    }else{
      // the value of the card dropped is K
      if(stacks[dragged[0]][dragged[1]].num == 13){
        valid = true;
      }
    }
    // if the drop action is valid, perform the drop action
    if(valid){
      let n = stacks[dragged[0]].length;
      let m = stacks[i].length;
      // move all the cards on top of the selected card
      for(let j = dragged[1]; j < n; j ++){
        let card = document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]];
        // move the card from the orginal stack to the current stack
        stacks[i].push(stacks[dragged[0]][dragged[1]]);
        stacks[dragged[0]].splice(dragged[1], 1);
        // set the top position of the current card as 22% lower than the previous card if it is displayed
        card.style.top = (top + 22) + "%";
        top += 22;
        card.style.opacity = "1";
        // draggble must be set to true to set the drag image to an empty image
        card.setAttribute("draggable", "true");
        // drag image can only be set in dragstart event
        card.setAttribute("ondragstart", `drag(event, ${i}, ${stacks[i].length - 1})`);
        card.setAttribute("ontouchmove", `drag(event, ${i}, ${stacks[i].length - 1})`);
        // move the card image to the stack
        document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(card);
        // enlarge the area that allows dropping of cards
        document.getElementsByClassName("droppable")[i].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * (stacks[i].length - 1) + "px";
      }
      // record the action for undo
      actions.push(new Action(3, dragged[0], dragged[1], i, m));
      // enable undo
      document.getElementById("undo").disabled = false;
    }
  // card from the deck
  }else{
    // there are cards in the stack
    if(stacks[i].length > 0){
      // the value of the card dropped is 1 less than the value of the last card in the stack
      if(deck[dragged[1]].num == stacks[i][stacks[i].length - 1].num - 1){
        // the color of the card dropped is different from the color of the last card in the stack
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
    // there are no card in the stack
    }else{
      // the value of the card dropped is K
      if(deck[dragged[1]].num == 13){
        valid = true;
      }
    }
    // if the drop action is valid, perform the drop action
    if(valid){
      let card = document.getElementById("display").getElementsByClassName("place")[0].lastElementChild;
      // move the card from the deck to the stack
      stacks[i].push(deck[dragged[1]]);
      deck.splice(dragged[1], 1);
      deckPos --;
      // set the top position of the current card as 22% lower than the previous card if it is displayed
      card.style.top = (top + 22) + "%";
      top += 22;
      card.style.left = "0";
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, ${i}, ${stacks[i].length - 1})`);
      card.setAttribute("ontouchmove", `drag(event, ${i}, ${stacks[i].length - 1})`);
      // move the card image to the stack
      document.getElementsByClassName("stack")[i].getElementsByClassName("place")[0].appendChild(card);
      // there are other card on display in the deck
      if(document.getElementById("display").getElementsByClassName("place")[0].children.length > 0){
        // enable dragging of next card on display
        card = document.getElementById("display").getElementsByClassName("place")[0].lastElementChild;
        card.setAttribute("ontouchmove", `drag(event, -1, ${dragged[1] - 1})`);
        card.draggable = "true";
      }
      // enlarge the area that allows dropping of cards
      document.getElementsByClassName("droppable")[i].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * (stacks[i].length - 1) + "px";
      // record the action for undo
      actions.push(new Action(5, dragged[0], dragged[1], i, stacks[i].length - 1));
      // enable undo
      document.getElementById("undo").disabled = false;
    }
  }
  return valid;
}

// drop a card on the final stack and return whether the card is dropped successfully
// i = index of final stack
const finalDrop = i => {
  // record whether the card is dropped successfully
  let valid = false;
  // card from the final stacks
  if(dragged[0] > 6){
    // there are cards in the final stack
    if(finals[i].length > 0){
      // the type of the card dropped is the same as the last card in the final stack and the value of the card dropped is 1 more than the value of the last card in the final stack
      if(finals[dragged[0] - 7][dragged[1]].type == finals[i][finals[i].length - 1].type && finals[dragged[0] - 7][dragged[1]].num == finals[i][finals[i].length - 1].num + 1){
        valid = true;
      }
    // there are no card in the final stack
    }else{
      // the value of the card dropped is A
      if(finals[dragged[0] - 7][dragged[1]].num == 1){
        valid = true;
      }
    }
    // if the drop action is valid, perform the drop action
    if(valid){
      let card = document.getElementsByClassName("final")[dragged[0] - 7].getElementsByTagName("img")[dragged[1]];
      // move the card from the original final stack to the current final stack
      finals[i].push(finals[dragged[0] - 7][dragged[1]]);
      finals[dragged[0] - 7].pop();
      deckPos --;
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, ${i + 7}, ${finals[i].length - 1})`);
      card.setAttribute("ontouchmove", `drag(event, ${i + 7}, ${finals[i].length - 1})`);
      // move the card image to the final stack
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(card);
      // record the action for undo
      actions.push(new Action(4, dragged[0] - 7, dragged[1], i + 7, finals[i].length - 1));
      // enable undo
      document.getElementById("undo").disabled = false;
    }
  // card from the stacks
  }else if(dragged[0] > -1){
    // the card dropped is the last card in the stack
    if(dragged[1] == stacks[dragged[0]].length - 1){
      // there are cards in the final stack
      if(finals[i].length > 0){
        // the type of the card dropped is the same as the last card in the final stack and the value of the card dropped is 1 more than the value of the last card in the final stack
        if(stacks[dragged[0]][dragged[1]].type == finals[i][finals[i].length - 1].type && stacks[dragged[0]][dragged[1]].num == finals[i][finals[i].length - 1].num + 1){
          valid = true;
        }
      // there are no card in the final stack
      }else{
        // the value of the card dropped is A
        if(stacks[dragged[0]][dragged[1]].num == 1){
          valid = true;
        }
      }
    }
    // if the drop action is valid, perform the drop action
    if(valid){
      let card = document.getElementsByClassName("stack")[dragged[0]].getElementsByTagName("img")[dragged[1]];
      // move the card from the stack to the final stack
      finals[i].push(stacks[dragged[0]][dragged[1]]);
      stacks[dragged[0]].pop();
      card.style.top = "0";
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, ${i + 7}, ${finals[i].length - 1})`);
      card.setAttribute("ontouchmove", `drag(event, ${i + 7}, ${finals[i].length - 1})`);
      // move the card image to the final stack
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(card);
      // record the action for undo
      actions.push(new Action(3, dragged[0], dragged[1], i + 7, finals[i].length - 1));
      // enable undo
      document.getElementById("undo").disabled = false;
    }
  // card from the deck
  }else{
    // there are cards in the final stack
    if(finals[i].length > 0){
      // the type of the card dropped is the same as the last card in the final stack and the value of the card dropped is 1 more than the value of the last card in the final stack
      if(deck[dragged[1]].type == finals[i][finals[i].length - 1].type && deck[dragged[1]].num == finals[i][finals[i].length - 1].num + 1){
        valid = true;
      }
    // there are no card in the final stack
    }else{
      // the value of the card dropped is A
      if(deck[dragged[1]].num == 1){
        valid = true;
      }
    }
    // if the drop action is valid, perform the drop action
    if(valid){
      let card = document.getElementById("display").getElementsByClassName("place")[0].lastElementChild;
      // move the card from the stack to the final stack
      finals[i].push(deck[dragged[1]]);
      deck.splice(dragged[1], 1);
      deckPos --;
      card.style.left = "0";
      card.style.opacity = "1";
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, ${i + 7}, ${finals[i].length - 1})`);
      card.setAttribute("ontouchmove", `drag(event, ${i + 7}, ${finals[i].length - 1})`);
      // move the card image to the final stack
      document.getElementsByClassName("final")[i].getElementsByClassName("place")[0].appendChild(card);
      // there are other card on display in the deck
      if(document.getElementById("display").getElementsByClassName("place")[0].children.length > 0){
        // enable dragging of next card on display
        card = document.getElementById("display").getElementsByClassName("place")[0].lastElementChild;
        card.setAttribute("ontouchmove", `drag(event, -1, ${dragged[1] - 1})`);
        card.draggable = "true";
      }
      // record the action for undo
      actions.push(new Action(5, dragged[0], dragged[1], i + 7, finals[i].length - 1));
      // enable undo
      document.getElementById("undo").disabled = false;
    }
  }
  // check if the game ends
  if(valid && win()){
    // end the game
    end();
  }
  return valid;
}

// undo the last action
const undo = () => {
  // get the last action
  let action = actions[actions.length - 1];
  actions.pop();
  // if there are no more actions to undo, disable undo
  if(actions.length == 0){
    document.getElementById("undo").disabled = true;
  }
  // perform undo action
  switch(action.type){
    case 1:
      undisplayCard(action.fromi, action.fromj);
      break;
    case 2:
      undisplayDeck(action.fromi);
      break;
    case 3:
      stackUndo(action.fromi, action.fromj, action.toi, action.toj);
      break;
    case 4:
      finalUndo(action.fromi, action.fromj, action.toi, action.toj);
      break;
    case 5:
      deckUndo(action.toi, action.toj);
  }
}

// undo the card displayed in the stack
// i = index of stack, j = index of card in that stack
const undisplayCard = (i, j) => {
  // set display of the card to false for calculating the top position in the stack
  stacks[i][j].display = false;
  let card = document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j];
  // display the image of the back of the card
  card.src = "images/back.png";
  // disable dragging of undisplayed card
  card.setAttribute("draggable", "false");
  card.removeAttribute("ontouchmove");
  // click to display the card
  card.setAttribute("onclick", `displayCard(${i}, ${j})`);
}

// undo the cards displayed in the deck
// n = number of cards previously displaying
const undisplayDeck = n => {
  let display = document.getElementById("display").getElementsByClassName("place")[0];
  // display 1 card on the deck
  if(mode == 0){
    // there are no card currently displaying
    if(deckPos == -1){
      deckPos = deck.length - 1;
      // display all the cards in the deck
      for(let i = 0; i < deck.length; i ++){
        // create the image of the card
        let card = document.createElement("img");
        // display the image of the card
        card.src = deck[i].image;
        card.setAttribute("width", "100%");
        card.setAttribute("height", "100%");
        card.style.position = "absolute";
        // draggble must be set to true to set the drag image to an empty image
        card.setAttribute("draggable", "true");
        // drag image can only be set in dragstart event
        card.setAttribute("ondragstart", `drag(event, -1, ${i})`);
        card.setAttribute("ontouchmove", `drag(event, -1, ${i})`);
        card.setAttribute("ondragend", "drop()");
        card.setAttribute("ontouchend", "drop()");
        card.setAttribute("ontouchcancel", "drop()");
        // add the card image to the displaying cards
        display.appendChild(card);
      }
      // remove the image of the back of the card in the deck
      document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "";
    // there are cards currently displaying
    }else{
      deckPos --;
      // remove the image of the top card currently displaying
      display.removeChild(display.lastElementChild);
      // there are still cards currently displaying after the top card
      if(deckPos >= 0){
        // enable dragging of the next card current displaying
        let card = document.getElementById("display").getElementsByTagName("img")[deckPos];
        card.setAttribute("draggable", "true");
        card.setAttribute("ontouchmove", `drag(event, -1, ${deckPos})`);
      }
      // the current displaying card is the last card in the deck
      if(deckPos == deck.length - 2){
        // display the image of the back of the card in the deck
        document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "<img src = 'images/back.png' width = '100%' height = '100%' draggable = 'false'>";
      }
    }
  // display 3 cards on the deck
  }else{
    // there are no card currently displaying
    if(deckPos == -1){
      // remove the image of the back of the card in the deck
      document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "";
      deckPos = deck.length - 1;
    // there are cards currently displaying
    }else{
      // the current displaying card is the last card in the deck
      if(deckPos == deck.length - 1){
        // display the image of the back of the card in the deck
        document.getElementById("deck").getElementsByClassName("place")[0].innerHTML = "<img src = 'images/back.png' width = '100%' height = '100%' draggable = 'false'>";
      }
      // revert the previous position of the card in the deck
      deckPos -= display.childElementCount;
    }
    // clear the current displaying cards
    display.innerHTML = "";
    // display the images of the previous displaying cards
    for(let i = deckPos - n + 1; i <= deckPos; i ++){
      // create the image of the card
      let card = document.createElement("img");
      // display the image of the card
      card.src = deck[i].image;
      card.setAttribute("width", "100%");
      card.setAttribute("height", "100%");
      card.style.position = "absolute";
      // set the left position of the current card as 30% right than the previous displayed card
      card.style.left = 30 * (i - deckPos + n - 1) + "%";
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, -1, ${i})`);
      card.setAttribute("ondragend", "drop()");
      card.setAttribute("ontouchend", "drop()");
      card.setAttribute("ontouchcancel", "drop()");
      // the top card currently displaying
      if(i == deckPos){
        // draggble must be set to true to set the drag image to an empty image
        card.setAttribute("draggable", "true");
        card.setAttribute("ontouchmove", `drag(event, -1, ${i})`);
      // the bottom cards currently displaying
      }else{
        // disable dragging of the card
        card.setAttribute("draggable", "false");
      }
      // add the card image to the displaying cards
      display.appendChild(card);
    }
  }
}

// undo the movement of cards from the stack
// fromi = index of stack the card is moved from, fromj = index of card in that stack, toi = index of stack the card is moved to, toj = index of card in that stack
const stackUndo = (fromi, fromj, toi, toj) => {
  // top position of the cards
  let top;
  // there are cards in the stack
  if(stacks[fromi].length > 0){
    // get the top position of the last card in the stack
    top = parseInt(document.getElementsByClassName("stack")[fromi].getElementsByClassName("place")[0].lastElementChild.style.top);
    // the last card in the stack is undisplayed
    if(!stacks[fromi][stacks[fromi].length - 1].display){
      top -= 14;
    }
  // there are no card in the stack
  }else{
    top = -22;
  }
  // card from the final stacks
  if(toi > 6){
    let card = document.getElementsByClassName("final")[toi - 7].getElementsByTagName("img")[toj];
    // move the cards from the final stack back to the stack
    stacks[fromi].push(finals[toi - 7][toj]);
    finals[toi - 7].pop();
    // set the top position of the current card as 22% lower than the previous card if it is displayed
    card.style.top = (top + 22) + "%";
    top += 22;
    card.style.opacity = "1";
    // draggble must be set to true to set the drag image to an empty image
    card.setAttribute("draggable", "true");
    // drag image can only be set in dragstart event
    card.setAttribute("ondragstart", `drag(event, ${fromi}, ${fromj})`);
    card.setAttribute("ontouchmove", `drag(event, ${fromi}, ${fromj})`);
    // move the card image to the stack
    document.getElementsByClassName("stack")[fromi].getElementsByClassName("place")[0].appendChild(card);
    // enlarge the area that allows dropping of cards
    document.getElementsByClassName("droppable")[fromi].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * fromj + "px";
  // card from the stacks
  }else{
    // get the number of cards in the stack
    let n = stacks[toi].length;
    // move all the cards on top of the selected card
    for(let j = toj; j < n; j ++){
      let card = document.getElementsByClassName("stack")[toi].getElementsByTagName("img")[toj];
      // move the card from the current stack back to the original stack
      stacks[fromi].push(stacks[toi][toj]);
      stacks[toi].splice(toj, 1);
      // set the top position of the current card as 22% lower than the previous card if it is displayed
      card.style.top = (top + 22) + "%";
      top += 22;
      // draggble must be set to true to set the drag image to an empty image
      card.setAttribute("draggable", "true");
      // drag image can only be set in dragstart event
      card.setAttribute("ondragstart", `drag(event, ${fromi}, ${stacks[fromi].length - 1})`);
      card.setAttribute("ontouchmove", `drag(event, ${fromi}, ${stacks[fromi].length - 1})`);
      // move the card image to the stack
      document.getElementsByClassName("stack")[fromi].getElementsByClassName("place")[0].appendChild(card);
      // enlarge the area that allows dropping of cards
      document.getElementsByClassName("droppable")[fromi].style.height = document.getElementsByClassName("place")[0].offsetHeight * 2 + 20 * fromj + "px";
    }
  }
}

// undo the movement of cards from the final stack
// fromi = index of final stack the card is moved from, fromj = index of card in that final stack, toi = index of stack the card is moved to, toj = index of card in that stack
const finalUndo = (fromi, fromj, toi, toj) => {
  let card;
  // card from the final stacks
  if(toi > 6){
    card = document.getElementsByClassName("final")[toi - 7].getElementsByTagName("img")[toj];
    // move the card from the current final stack back to the original final stack
    finals[fromi].push(finals[toi - 7][toj]);
    finals[toi - 7].pop();
  // card from the stacks
  }else{
    card = document.getElementsByClassName("stack")[toi].getElementsByTagName("img")[toj];
    // move the card from the stack back to the final stack
    finals[fromi].push(stacks[toi][toj]);
    stacks[toi].pop();
  }
  card.style.top = "0";
  // draggble must be set to true to set the drag image to an empty image
  card.setAttribute("draggable", "true");
  // drag image can only be set in dragstart event
  card.setAttribute("ondragstart", `drag(event, ${fromi + 7}, ${fromj})`);
  card.setAttribute("ontouchmove", `drag(event, ${fromi + 7}, ${fromj})`);
  // move the card image to the final stack
  document.getElementsByClassName("final")[fromi].getElementsByClassName("place")[0].appendChild(card);
}

// i = index of stack the card is moved to, j = index of card in that stack
const deckUndo = (i, j) => {
  let display = document.getElementById("display").getElementsByClassName("place")[0];
  let card;
  if(i > 6){
    card = document.getElementsByClassName("final")[i - 7].getElementsByTagName("img")[j];
    // move the card from the final stack back to the deck
    deck.splice(deckPos + 1, 0, finals[i - 7][j]);
    finals[i - 7].pop();
  }else{
    card = document.getElementsByClassName("stack")[i].getElementsByTagName("img")[j];
    // move the card from the stack back to the deck
    deck.splice(deckPos + 1, 0, stacks[i][j]);
    stacks[i].pop();
    card.style.top = "0";
  }
  deckPos ++;
  // drag image can only be set in dragstart event
  card.setAttribute("ondragstart", `drag(event, -1, ${deckPos})`);
  card.setAttribute("ontouchmove", `drag(event, -1, ${deckPos})`);
  // display 3 cards on the deck
  if(mode == 1){
    // number of cards currently displaying
    let n = display.childElementCount;
    // there are cards currently displaying
    if(n > 0){
      // disable dragging of the last current displaying card
      display.lastElementChild.setAttribute("draggable", "false");
      display.lastElementChild.removeAttribute("ontouchmove");
    }
    // set the left position of the current card as 30% right than the previous displayed card
    card.style.left = (30 * n) + "%";
  }
  // move the card image to the deck
  display.appendChild(card);
}

// check if the game has ended
const win = () => {
  // check if all the final stacks have 13 cards
  for(let i = 0; i < 4; i ++){
    if(finals[i].length < 13){
      return false;
    }
  }
  return true;
}

// end the game
const end = () => {
  // display the plane for the ending animation
  document.getElementById("end").style.display = "block";
  // store the size information of the final stack for the ending animation
  endRect = document.getElementsByClassName("final")[endPos[0]].getElementsByClassName("place")[0].getBoundingClientRect();
  // scale of the decrease of a of the next drop of cards in the ending animation, between 0.5 and 0.8
  aDecrease = Math.random() * 0.3 + 0.5;
  // scale of the curve along the x-axis in the ending animation, between 5 and upper limit depends on the width of the plane for the ending animation
  b = Math.random() * mainRect.width / 4000 + 0.05;
  // x position as 0 = x position of the final stack - x position of the plane for the ending animation
  x = endRect.x - mainRect.x;
  // start the ending animation
  endInterval = setInterval(endAnimation, 10);
}

// display a card in the ending animation
const endAnimation = () => {
  // record the y position of the previous card for checking the direction of the curve
  prevY = y;
  // y position = lowest possible y position of the card to drop - scale of the curve along the y-axis of the random reduction (a) * abs(cos(x value of the card with the x position of the final stack as 0 / scale of the curve along the x-axis)) * scale of the curve along the y-axis of the maximum possible range of y position for the card to drop
  // lowest possible y position of the card to drop = height of the plane for the ending animation - height of the final stack)
  // x value of the card with the x position of the final stack as 0 = current x position - x position as 0
  // x position as 0 = x position of the final stack - x position of the plane for the ending animation
  // scale of the curve along the x-axis = scale of the curve along the y-axis of the maximum possible range of y position for the card to drop * scale of the curve along the x-axis of the random reduction (b)
  // scale of the curve along the y-axis of the maximum possible range of y position for the card to drop = lowest possible y position of the card to drop - y position as 0 (y position of the final stack - y position of the plane for the ending animation)
  y = mainRect.height - endRect.height - a * Math.abs(Math.cos((x - endRect.x + mainRect.x) / (mainRect.height - endRect.height - endRect.y + mainRect.y) / b)) * (mainRect.height - endRect.height - endRect.y + mainRect.y);
  // the direction of the curve becomes increasing for the first time for the current drop of cards
  if(!aDecreased && y < prevY){
    a *= aDecrease;
    aDecreased = true;
    // y position = lowest possible y position of the card to drop - scale of the curve along the y-axis of the random reduction (a) * abs(cos(x value of the card with the x position of the final stack as 0 / scale of the curve along the x-axis)) * scale of the curve along the y-axis of the maximum possible range of y position for the card to drop
    // lowest possible y position of the card to drop = height of the plane for the ending animation - height of the final stack)
    // x value of the card with the x position of the final stack as 0 = current x position - x position as 0
    // x position as 0 = x position of the final stack - x position of the plane for the ending animation
    // scale of the curve along the x-axis = scale of the curve along the y-axis of the maximum possible range of y position for the card to drop * scale of the curve along the x-axis of the random reduction (b)
    // scale of the curve along the y-axis of the maximum possible range of y position for the card to drop = lowest possible y position of the card to drop - y position as 0 (y position of the final stack - y position of the plane for the ending animation)
    y = mainRect.height - endRect.height - a * Math.abs(Math.cos((x - endRect.x + mainRect.x) / (mainRect.height - endRect.height - endRect.y + mainRect.y) / b)) * (mainRect.height - endRect.height - endRect.y + mainRect.y);
  // the direction of the curve becomes decreasing
  }else if(y >= prevY){
    aDecreased = false;
  }
  // create the image of the card
  let card = document.createElement("img");
  // display the image of the card
  card.src = finals[endPos[0]][endPos[1]].image;
  card.setAttribute("width", endRect.width + "px");
  card.setAttribute("height", endRect.height + "px");
  card.style.position = "absolute";
  card.style.top = y + "px";
  card.style.left = x + "px";
  // display the image of the card on the plane for the ending animation
  document.getElementById("end").appendChild(card);
  // decrease the x position for the next animating card, depends on the width of the plane for the ending animation
  x -= mainRect.width / 300;
  // the card leaves the screen
  if(x < -endRect.width){
    endPos[0] ++;
    // all 4 types of a value of the cards have been animated
    if(endPos[0] >= 4){
      endPos[1] --;
      endPos[0] = 0;
    }
    // the value of the animated card is valid
    if(endPos[1] > -1){
      endRect = document.getElementsByClassName("final")[endPos[0]].getElementsByClassName("place")[0].getBoundingClientRect();
      x = endRect.x - mainRect.x;
      y = 0;
      prevY = 0;
      a = 1;
      // scale of the decrease of a of the next drop of cards in the ending animation, between 0.5 and 0.8
      aDecrease = Math.random() * 0.3 + 0.5;
      // scale of the curve along the x-axis in the ending animation, between 0.5 and upper limit depends on the width of the plane for the ending animation
      b = Math.random() * mainRect.width / 4000 + 0.05;
    }else{
      // stop the ending animation
      clearInterval(endInterval);
    }
  }
}

// restart the game
const restart = () => {
  // stop the ending animation, in case the game is restarted during the ending animation
  clearInterval(endInterval);
  // reset the variables
  endPos[0] = 0;
  endPos[1] = 12;
  a = 1;
  aDecreased = false;
  // clear and hide the plane for the ending animation
  document.getElementById("end").innerHTML = "";
  document.getElementById("end").style.display = "none";
  document.getElementById("undo").disabled = true;
  // remove all elements in the array
  picked.splice(0, picked.length);
  deck.splice(0, deck.length);
  actions.splice(0, actions.length);
  deckPos = -1;
  // set the mode from the option selected
  if(document.getElementsByTagName("option")[0].selected == true){
    mode = 0;
  }else{
    mode = 1;
  }
  // clear the cards displayed
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
  // start the game
  start();
}
