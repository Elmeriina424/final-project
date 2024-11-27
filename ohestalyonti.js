// Shakin erikoissääntö ohestalyönti, koskee sotilasta (pawn), joka siirtyy ensimmäisellä siirrollaan 2 ruutua
// ja päätyy rinnakkain vastapuolen sotilaan kanssa
function handleEnPassant(startId, targetId, draggedElement) {
    const width = 8; // Shakkilaudan leveyden määrittäminen
    let enPassantTarget = null; // Muuttuja, joka määrittelee mahdollisen kohteen

    // Alkuperäiset rivit, joilta sotilaat voivat liikkua 2 ruutua eteenpäin
    const pawnRowStart = [8, 9, 10, 11, 12, 13, 14, 15]; // Aloitusrivi valkoiset sotilaat
    const pawnRowEnd = [48, 49, 50, 51, 52, 53, 54, 55]; // Aloitusrivi mustat sotilaat

    // Tarkistetaan, onko kyseessä sotilaan siirto, joka mahdollistaa ohestalyönnin
    if (
        draggedElement.id === 'pawn' && // Tarkistetaan, että siirretty nappula on sotilas (pawn)
        (pawnRowStart.includes(startId) && targetId === startId + 2 * width || 
         pawnRowEnd.includes(startId) && targetId === startId - 2 * width)
    ) {
        // Määritellään, minne mahdollinen ohestalyönti voi tapahtua
        enPassantTarget = startId + (startId < targetId ? width : -width);
    }

    // Tarkistetaan, onko ohestalyönti mahdollinen ja onko kohderuutu oikea
    if (
        enPassantTarget && // Varmistetaan, että kohde on määritelty
        targetId === enPassantTarget && // Tarkistetaan, että siirto on ohestalyöntikohteeseen
        draggedElement.id === 'pawn' // Varmistetaan, että siirrettävä nappula on sotilas
    ) {
        // Haetaan vastustajan sotilas, joka on ohestalyöntikohteen vieressä
        const opponentPawnSquare = document.querySelector(
            `[square-id="${enPassantTarget - (startId < targetId ? width : -width)}"]` // Vastustajan sotilas on vieressä
        );

        // Jos vastustajan sotilas löydetty, poistetaan se
        if (opponentPawnSquare && opponentPawnSquare.firstChild?.id === 'pawn') {
            opponentPawnSquare.firstChild.remove(); // Poistetaan vastustajan sotilas
            return true; // Ohestalyönti onnistui
        }
    }
    // Mikäli ohestalyönti ei mahdollinen, ei tehdä mitään
    return false;
}
