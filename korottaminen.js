// Shakin erikoissääntö sotilaan (pawn) korottamisesta, kun se saavuttaa vastustajan päädyn
function handlePromotion(targetId, draggedElement) {
    // Määritellään kummallekin pelaajalle viimeinen rivi (korottaminen tapahtuu päätyrivillä)
    const lastRow = draggedElement.color === 'white'
        ? [56, 57, 58, 59, 60, 61, 62, 63] // Valkoisen sotilaan päätyrivi
        : [0, 1, 2, 3, 4, 5, 6, 7];        // Mustan sotilaan päätyrivi

    // Tarkistetaan ruutu, johon sotilas siirtyy -> onko se päätyruutujen joukossa
    if (lastRow.includes(targetId)) {
        // Luodaan uusi nappula (kuningatar), joka korvaa sotilaan
        const newPiece = document.createElement('div'); // Luodaan uusi elementti
        newPiece.id = draggedElement.color + '-queen-' + targetId; // Korotetun nappulan ID:n
        newPiece.classList.add('piece', 'queen', draggedElement.color); // Lisätään CSS-luokat, jotta nappula saa oikean muodon

        // Kohderuudun etsiminen, nappulan lisäys
        const targetSquare = document.querySelector(`[square-id="${targetId}"]`);
        if (targetSquare) {
            targetSquare.appendChild(newPiece);
        }

        // Poistetaan alkuperäinen sotilas (pawn), koska se on nyt korotettu
        draggedElement.remove();

        // Korottaminen onnistui.
        return true;
    }

    // Jos siirretty ruutu ei ollut päätyruutu, ei tehdä mitään
    return false;
}
