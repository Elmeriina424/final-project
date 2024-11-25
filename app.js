// Valitaan HTML-elementit pelilaudan, pelaajan nimen ja infon näyttämistä varten
const gameBoard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");

// Laudan leveys (8 x 8 ruudukko)
const width = 8;

// Aloitetaan peli mustan pelaajan vuorolla
let playerGo = 'black'
playerDisplay.textContent = 'black'

// Määritellään alkupelimerkit (tornit, ratsut, lähetit, kuningatar, kuningas, ja sotilaat)
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];

// Luodaan pelilauta ja sijoitetaan pelinappulat
function createBoard() {
    startPieces.forEach((startPiece, i) => {
        // Luodaan yksittäinen ruutu
        const square = document.createElement('div')
        square.classList.add('square') // Asetetaan luokka 'square'
        square.innerHTML = startPiece  // Lisätään pelinappula ruutuun
        square.firstChild?.setAttribute('draggable', true) // Tehdään pelinappulasta vedettävä
        square.setAttribute('square-id', i) // Annetaan ruudulle yksilöllinen ID
        
        // Määritellään ruudun väri riveittäinen
        const row = Math.floor( (63 - i)  / 8) + 1
        if ( row % 2 === 0 ) {
            square.classList.add(i % 2 === 0 ? "beige" : "brown")
        } else {
            square.classList.add(i % 2 === 0 ? "brown" : "beige")

        }

        // Asetetaan mustat pelinappulat ylärunaan
        if ( i <= 15) {
            square.firstChild.firstChild.classList.add('black')
        }
        // Asetetaan valkoiset pelinappulat alareunaan
        if (i >= 48) {
            square.firstChild.firstChild.classList.add('white')

        }

        // Lisätään ruutu pelilautaan
        gameBoard.append(square)
    })
}

// Kutsutaan createboard-function pelilaudan luomiseksi
createBoard();

// Valitaan kaikki ruudut ja lisätään tapahtumankuuntelijat vetotoiminnolle
const allSquares = document.querySelectorAll("#gameboard .square")

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart) // Aloitus
    square.addEventListener('dragover', dragOver)   // Vedon aikana
    square.addEventListener('drop', dragDrop)       // Päästö


})

// Vedon aloitus: tallennetaan vedetyn pelinappulan sijainti
let startPositionId
let draggedElement

function dragStart (e) {
    startPositionId = e.target.parentNode.getAttribute('square-id')
    draggedElement = e.target
}

// Vedon aikana: estetään oletustoiminta, joka voisi häiritä vetämistä
function dragOver(e) {
    e.preventDefault()
}

// Vedon päästö: tarkistetaan, onko siirto sääntöjen mukainen
function dragDrop(e) {
    e.stopPropagation()

    // Tarkistetaan, onko oikean pelaajan vuoro
    const correctGo =  draggedElement.firstChild.classList.contains(playerGo)
    const taken = e.target.classList.contains('piece'); // Onko ruudussa jo pelinappula
    const valid = checkIfValid(e.target)                // Onko siirto sääntöjen mukainen
    const opponentGo = playerGo == 'white' ? 'black' : 'white'
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo)


    if (correctGo) {
        // Jos siirto valtaisi vastustajan nappulan
        if (takenByOpponent && valid) {
            e.target.parentNode.append(draggedElement) // Siirretään nappula uuteen ruutuun
            e.target.remove()  // Poistetaan vastustajan nappula 
            checkForWin()      // Tarkistetaan voittotilanne
            changePlayer()     // Vaihdetaan vuoro
            return
        }

        // Estetään siirto, jos ruutuu on varattu omalla nappulalla
        if (taken && !takenByOpponent) {
            infoDisplay.textContent = "you cannot go there cunt!"
            setTimeout(() =>infoDisplay.textContent = "", 2000)
            return
        }

        // Jos siirto on sääntöjen mukainen, siirretään nappula uuteen ruutuun
        if (valid) {
            e.target.append(draggedElement)
            checkForWin()
            changePlayer()
            return
        }
    }
}


// Tarkistaa, onko siirto laillinen pelisääntöjen mukaan
function checkIfValid(target) {
    const targetId = Number(target.getAttribute('square-id')) || Number (target.parentNode.getAttribute('square-id'))
    const startId = Number(startPositionId)
    const piece = draggedElement.id     // Vedettävän nappulan tyyppi (esim: sotilas, torni, jne)
    console.log('targetId' ,targetId)
    console.log('stratId', startId)
    console.log('piece', piece)

    // Erilaisia siirtosääntöjä kullekin nappulatyypille
    switch(piece) {
        case 'pawn':
        // Sotilaan siirrot: 1-2 askelta eteenpäin ja viisto syöminen
        const starterRow = [8, 9, 10, 11, 12, 13, 14, 15]
        if (
            (starterRow.includes(startId) && startId + width * 2 === targetId) ||
            (startId + width === targetId) ||
            (startId + width - 1 === targetId && document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild) ||
            (startId + width + 1 === targetId && document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild)
        ) {
            return true
        }
        break;
    
    case 'knight':
        // Ratsu voi liikua "L" - muodossa
        if (
            startId + width * 2 + 1 === targetId ||
            startId + width * 2 - 1 === targetId ||
            startId + width - 2 === targetId ||
            startId + width + 2 === targetId ||
            startId - width * 2 + 1 === targetId ||
            startId - width * 2 - 1 === targetId ||
            startId - width - 2 === targetId ||
            startId - width + 2 === targetId 

        ) {
            return true
        }
        break;
    
    case 'bishop': 
        // Lähettisiirrot: viistosiirrot niin pitkälle kuin mahdollista
        if (
            startId + width + 1 === targetId ||
            startId + width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild ||
            startId + width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild ||
            startId + width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild ||
            startId + width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild ||
            startId + width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 + 5}"]`).firstChild ||
            startId + width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 6 + 6}"]`).firstChild ||
            // --
            startId - width - 1 === targetId ||
            startId - width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild ||
            startId - width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild ||
            startId - width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild ||
            startId - width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild ||
            startId - width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 - 5}"]`).firstChild ||
            startId - width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 6 - 6}"]`).firstChild ||
            // --
            startId - width + 1 === targetId ||
            startId - width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild ||
            startId - width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild ||
            startId - width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild ||
            startId - width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild ||
            startId - width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 + 5}"]`).firstChild ||
            startId - width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 6 + 6}"]`).firstChild ||
           // --
           startId + width - 1 === targetId ||
           startId + width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild ||
           startId + width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild ||
           startId + width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild ||
           startId + width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild ||
           startId + width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 - 5}"]`).firstChild ||
           startId + width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 6 - 6}"]`).firstChild 
        )  {
            return true
        }
        break;

    // Lisää vastaavat ehdot tornille, kuingattarelle ja kuininkaalle
    case 'rook':
        // Lisää logiikka tornin siirroille
        if (
            startId + width === targetId ||
            startId + width * 2 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild ||
            startId + width * 3 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild ||
            startId + width * 4 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`)?.firstChild ||
            startId + width * 5 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`)?.firstChild ||
            startId + width * 6 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 5}"]`)?.firstChild ||
            startId + width * 7 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 5}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 6}"]`)?.firstChild ||
            //---

            startId - width === targetId ||
            startId - width * 2 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild ||
            startId - width * 3 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild ||
            startId - width * 4 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`)?.firstChild ||
            startId - width * 5 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`)?.firstChild ||
            startId - width * 6 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 5}"]`)?.firstChild ||
            startId - width * 7 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 5}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 6}"]`)?.firstChild ||
            // --
            startId + 1 === targetId ||
            startId + 2 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild ||
            startId + 3 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild ||
            startId + 4 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 3}"]`)?.firstChild ||
            startId + 5 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 4}"]`)?.firstChild ||
            startId + 6 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + 5}"]`)?.firstChild ||
            startId + 7 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + 5}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 6}"]`)?.firstChild ||
            // --
            startId - 1 === targetId ||
            startId - 2 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild ||
            startId - 3 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild ||
            startId - 4 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 3}"]`)?.firstChild ||
            startId - 5 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 4}"]`)?.firstChild ||
            startId - 6 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - 5}"]`)?.firstChild ||
            startId - 7 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - 5}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 6}"]`)?.firstChild
        ) {
            return true
        }
        break;

    case 'queen':
        // Lisää logiikka kuningattaren siirroille
        if (
            startId + width + 1 === targetId ||
            startId + width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild ||
            startId + width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild ||
            startId + width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild ||
            startId + width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild ||
            startId + width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 + 5}"]`).firstChild ||
            startId + width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 6 + 6}"]`).firstChild ||
            // --
            startId - width - 1 === targetId ||
            startId - width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild ||
            startId - width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild ||
            startId - width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild ||
            startId - width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild ||
            startId - width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 - 5}"]`).firstChild ||
            startId - width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 6 - 6}"]`).firstChild ||
            // --
            startId - width + 1 === targetId ||
            startId - width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild ||
            startId - width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild ||
            startId - width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild ||
            startId - width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild ||
            startId - width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 + 5}"]`).firstChild ||
            startId - width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 6 + 6}"]`).firstChild ||
            // --
            startId + width - 1 === targetId ||
            startId + width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild ||
            startId + width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild ||
            startId + width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild ||
            startId + width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild ||
            startId + width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 - 5}"]`).firstChild ||
            startId + width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 6 - 6}"]`).firstChild ||
            //--
            startId + width === targetId ||
            startId + width * 2 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild ||
            startId + width * 3 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild ||
            startId + width * 4 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`)?.firstChild ||
            startId + width * 5 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`)?.firstChild ||
            startId + width * 6 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 5}"]`)?.firstChild ||
            startId + width * 7 === targetId && !document.querySelector(`[square-id="${startId + width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + width * 5}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + width * 6}"]`)?.firstChild ||
            //---

            startId - width === targetId ||
            startId - width * 2 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild ||
            startId - width * 3 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild ||
            startId - width * 4 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`)?.firstChild ||
            startId - width * 5 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`)?.firstChild ||
            startId - width * 6 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 5}"]`)?.firstChild ||
            startId - width * 7 === targetId && !document.querySelector(`[square-id="${startId - width}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - width * 5}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - width * 6}"]`)?.firstChild ||
            // --
            startId + 1 === targetId ||
            startId + 2 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild ||
            startId + 3 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild ||
            startId + 4 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 3}"]`)?.firstChild ||
            startId + 5 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 4}"]`)?.firstChild ||
            startId + 6 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + 5}"]`)?.firstChild ||
            startId + 7 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId + 5}"]`)?.firstChild && !document.querySelector(`[square-id="${startId + 6}"]`)?.firstChild ||
            // --
            startId - 1 === targetId ||
            startId - 2 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild ||
            startId - 3 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild ||
            startId - 4 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 3}"]`)?.firstChild ||
            startId - 5 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 4}"]`)?.firstChild ||
            startId - 6 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - 5}"]`)?.firstChild ||
            startId - 7 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 2}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 3}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 4}"]`)?.firstChild  && !document.querySelector(`[square-id="${startId - 5}"]`)?.firstChild && !document.querySelector(`[square-id="${startId - 6}"]`)?.firstChild
        
        ) {
            return true
        }
        break;

        case 'king':
            // Lisää logikka kuninkaan siirroille
            if (
                startId + 1 === targetId ||
                startId - 1 === targetId ||
                startId + width === targetId ||
                startId - width === targetId ||
                startId + width - 1 === targetId ||
                startId + width + 1 === targetId ||
                startId - width - 1 === targetId ||
                startId - width + 1 === targetId
        ) {
            return true
        }
    }

}

// Toiminto vuoron vaihtamiseksi mustan ja valkoisen välillä
function changePlayer() {
    if (playerGo === "black") {
        reverseId()
        playerGo = "white"
        playerDisplay.textContent = 'white'
    } else {
        revertIds()
        playerGo = "black"
        playerDisplay.textContent = 'black'
    }
}

function reverseId() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i) => 
        square.setAttribute('square-id', (width * width - 1) - i))
}

function revertIds() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i) => square.setAttribute('square-id', i))

}

// Tarkistetaan, onko peli voitettu
function checkForWin() {
    
    // Lisää voittotarkistuslogiikka
    const kings = Array.from(document.querySelectorAll('#king'))
    console.log(kings)
    if(!kings.some(king => king.firstChild.classList.contains('white'))) {
        infoDisplay.innerHTML = "black player wins!"
        const allSquares = document.querySelectorAll('.square')
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
    }
    if(!kings.some(king => king.firstChild.classList.contains('black'))) {
        infoDisplay.innerHTML = "White player wins!"
        const allSquares = document.querySelectorAll('.square')
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
    }
}