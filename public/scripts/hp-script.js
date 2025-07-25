// hp.js: versione frontend Harry Potter (sostituisce marvel.js)

// Ottieni i personaggi HP tramite il backend (che ora gira su HP API)
async function getHPCharacters(query) {
    return await fetch(`../characters?query=${query}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .catch(error => console.error(error));
}

async function getPackage() {
    return await fetch('../package',{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: localStorage.getItem("username"), album_id:localStorage.getItem("album_ID"),user_id: localStorage.getItem("_id"),cards:5})
    })
    .then(response => response.json())
    .catch(error => console.error(error));
}

async function getAlbumcardsDB(albumID) {
    return await fetch(`/albums_cards/${albumID}`,{
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .catch(error => console.error(error));
}

async function getDuplicatedAlbumcardsDB(albumID) {
    return await fetch(`/albums_duplicated_cards/${albumID}`,{
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .catch(error => console.error(error));
}

async function printPackage() {
    await getPackage()
    .then(response => {
        printCredits();
        var i = 0;
        var Div_Car = `<div class="row">
                        <div class="col-md-12 text-center"> `;
        // ASSICURATI DI USARE SEMPRE response.data.results
        let results = [];
        if (response && response.data && Array.isArray(response.data.results)) {
            results = response.data.results;
        }
        results.forEach(item => {
            if (i % 3 == 0) {
                Div_Car = Div_Car + 
                `   </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12 text-center"> `;
            }
            Div_Car =
                Div_Car + 
                '<div class="card card-shine-effect-metal" id="char-'+item.name+'">'+
                    '<div class="card-header">'+
                        item.name+
                    '</div>'+
                    '<div class="card-content">'+
                        (item.image ? `<img src="${item.image}">` : '<div>No image</div>') +
                    '</div>'+
                    '<div class="card-body">'+
                    (item.house ? `<b>House:</b> ${item.house}<br>` : '') +
                    (item.dateOfBirth ? `<b>Birth:</b> ${item.dateOfBirth}<br>` : '') +
                    (item.actor ? `<b>Actor:</b> ${item.actor}<br>` : '') +
                    (item.wand && item.wand.wood ? `<b>Wand:</b> ${item.wand.wood} wood, ${item.wand.core || ''} core<br>` : '') +
                    '</div>'+
                    '<div class="card-footer">'+
                    'Data provided by Harry Potter API'+
                    '</div>'+
                '</div>';
            i++;
        });
        Div_Car = Div_Car + `   </div>
                                </div>
                                <button onclick=window.location.reload(); class="btn btn-block btn-success w-100">OK</button>`;
        document.getElementById("pack_cards").innerHTML = Div_Car;
    })
    .catch(response => console.error("Calculation error!"+response)) 
}

async function printAlbumCards(albumId) {
    document.getElementById("pack_cards")
    .innerHTML = '<i class="fas fa-spinner fa-spin fa-3x"></i>';
    await getAlbumcardsDB(albumId)
    .then(response =>
        {   
             var i=0;
                var Div_Car = `<div class="row">
                            <div class="col-md-12 text-center"> `
                response.forEach(item => {
                    if (i % 3 ==0 ) {
                        Div_Car = Div_Car + 
                        `   </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12 text-center"> `;
                    }
                    // item.hp_data contiene il personaggio HP!
                    const hpChar = item.hp_data;
                    Div_Car =
                        Div_Car + 
                        ' <a href="/card" onclick=localStorage.setItem("heroId",`' + hpChar.name + '`)>' +
                        '<div class="card card-shine-effect-metal" id="char-'+hpChar.name+'">'+
                            '<div class="card-header">'+
                                hpChar.name+
                            '</div>'+
                            '<div class="card-content">'+
                                (hpChar.image ? `<img src="${hpChar.image}">` : '<div>No image</div>') +
                            '</div>'+
                            '<div class="card-body">'+
                            (hpChar.house ? `<b>House:</b> ${hpChar.house}<br>` : '') +
                            (hpChar.dateOfBirth ? `<b>Birth:</b> ${hpChar.dateOfBirth}<br>` : '') +
                            (hpChar.actor ? `<b>Actor:</b> ${hpChar.actor}<br>` : '') +
                            (hpChar.wand && hpChar.wand.wood ? `<b>Wand:</b> ${hpChar.wand.wood} wood, ${hpChar.wand.core || ''} core<br>` : '') +
                            '</div>'+
                            '<div class="card-footer">'+
                            'Data provided by Harry Potter API'+
                            '</div>'+
                        '</div></a>';
                        i++;
                });
                Div_Car = Div_Car + `   </div>
                                    </div>`;
                document.getElementById("pack_cards").innerHTML = Div_Car;
                document.getElementById("pack_cards").classList.remove("hidden");
            }
    )
    .catch(response => console.error("Calculation error!"+response)) 
}

async function removeCard(cardId) {
    var albumId = localStorage.getItem("album_ID");
    var username = localStorage.getItem("username");
    var user_id = localStorage.getItem("_id");
    if(confirm('Are you sure you want to sell this card?')) {
        fetch('/sell_card', 
            { method: 'DELETE',
             headers: { 'Content-Type': 'application/json' }, 
             body: JSON.stringify({ card_id: cardId,
                                    album_id: albumId,
                                    username: username,
                                    user_id: user_id
                         }) 
            }
        )
        .then(() => window.location.reload());
    }
}
    
async function printDuplicatedAlbumCards(albumId) {
    document.getElementById("pack_cards")
    .innerHTML = '<i class="fas fa-spinner fa-spin fa-3x"></i>';
    var action =``;
    if (['/sell_cards' ].includes(window.location.pathname))
        {   
            action = `<a onclick="removeCard(`;
        } 
    else if (['/create_exchange' ].includes(window.location.pathname))
   {    
        action = `<a onclick="toggletoExchange(`;
   } else {
        action = `<a onclick="alert(`;
   }
    await getDuplicatedAlbumcardsDB(albumId)
    .then(response =>
        {              
            var i=0;
            if (response.length > 0) {
                var Div_Car = `<div class="row">
                            <div class="col-md-12 text-center"> `
                response.forEach(item => {
                    const hpChar = item.hp_data;
                    if (i % 3 ==0 ) {
                        Div_Car = Div_Car + 
                        `   </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12 text-center"> `;
                    }
                    
                    Div_Car =
                        Div_Car + action
                        +`'${hpChar.name}')"> `+
                        `<div class="card card-shine-effect-metal" id="char-`+hpChar.name+`">`+
                            `<div class="card-header">`+
                                hpChar.name+
                            `</div>`+
                            `<div class="card-content">`+
                                (hpChar.image ? `<img src="${hpChar.image}">` : '<div>No image</div>') +
                            `</div>`+
                            `<div class="card-body">`+
                            (hpChar.house ? `<b>House:</b> ${hpChar.house}<br>` : '') +
                            (hpChar.dateOfBirth ? `<b>Birth:</b> ${hpChar.dateOfBirth}<br>` : '') +
                            (hpChar.actor ? `<b>Actor:</b> ${hpChar.actor}<br>` : '') +
                            (hpChar.wand && hpChar.wand.wood ? `<b>Wand:</b> ${hpChar.wand.wood} wood, ${hpChar.wand.core || ''} core<br>` : '') +
                            `</div>`+
                            `<div class="card-footer">`+
                           'Data provided by Harry Potter API'+
                            `</div>`+
                        `</div> </a>`;
                        i++;
                });
                Div_Car = Div_Car + `   </div>
                                    </div>`;
                
                document.getElementById("pack_cards").innerHTML = Div_Car;
                document.getElementById("pack_cards").classList.remove("hidden");
                if (['/create_exchange' ].includes(window.location.pathname)) {
                    document.getElementById("recieveCard").classList.remove("hidden");
                    document.getElementById("card_sell").classList.remove("hidden");
                }
            } else
            {
                document.getElementById("pack_cards").classList.remove("hidden");
                document.getElementById("pack_cards").innerHTML="<p> No duplicate cards available to exchange</p>"
                if (['/create_exchange' ].includes(window.location.pathname)){
                    document.getElementById("card_sell").disabled = true;
                }
            }
        }
    )
    .catch(response => console.error("Calculation error!"+response)) 
}

async function getSingleCharacter(name) {
    try {
        const response = await fetch(`../character/${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching character:', error);
        throw error; // Re-throw to handle it in the calling function
    }
}

async function createAlbum(userid, name) {
    try{
        const response = await fetch(`../create_album`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({userId:userid, name:name})
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            let JsonResponse = await response.json();
            localStorage.setItem("album_ID",JsonResponse.insertedId);
            alert("Album created");
            window.location.reload();
        }
    } catch (error) {
        console.error('Error creating album:', error);
        throw error; // Re-throw to handle it in the calling function
    }
}

async function loadCharacterpassed(){
    var heroID = localStorage.getItem("heroId");
    if (heroID) {
        try {
            const heroResponse = await getSingleCharacter(heroID);    
            const searchInput = document.getElementById('select_superhero');
            if (!heroResponse) {
                throw new Error('No response from character fetch');
            }
            if (heroResponse.data) {
                const hero = heroResponse.data;
                // Update the visible search input with the hero name
                searchInput.value = hero.name;
                var Div_Car =
                '<div class="card card-shine-effect-metal" id="char-'+hero.name+'">'+
                    '<div class="card-header">'+
                    hero.name+
                    '</div>'+
                    '<div class="card-content">'+
                        (hero.image ? `<img src="${hero.image}">` : '<div>No image</div>') +
                    '</div>'+
                    '<div class="card-body">'+
                    (hero.house ? `<b>House:</b> ${hero.house}<br>` : '') +
                    (hero.dateOfBirth ? `<b>Birth:</b> ${hero.dateOfBirth}<br>` : '') +
                    (hero.actor ? `<b>Actor:</b> ${hero.actor}<br>` : '') +
                    (hero.wand && hero.wand.wood ? `<b>Wand:</b> ${hero.wand.wood} wood, ${hero.wand.core || ''} core<br>` : '') +
                    '</div>'+
                    '<div class="card-footer">'+
                    'Data provided by Harry Potter API'+
                    '</div>'+
                '</div>';
                document.getElementById("CardContainer").innerHTML = Div_Car;
                
                //If the user is logged and has selected an album and have the card in the album i present all data
                var user_Id = localStorage.getItem("_id");
                var album_ID = localStorage.getItem("album_ID");

                if (!user_Id || !album_ID ) {
                    return;
                }
                try {
                    const response = await fetch('/check_card_album', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            user_Id: user_Id,
                            album_Id: album_ID,
                            card_Id: hero.name
                        })
                    });

                    if (!response.ok) {
                        throw new Error("Autenticazione non valida");
                    }
                    const userData = await response.json();
                    if (userData.length>0) {
                        const character_details = document.getElementById('character_details');
                        // Qui puoi aggiungere dettagli extra se vuoi
                        character_details.innerHTML = "";
                    }
                } catch (error) {
                    console.error("Errore!",error);
                    return "ERR";
                }
            } else {
                console.error("Character not found");
                searchInput.value = "Character not found";
            }
            localStorage.removeItem("heroId");
        } catch (error) {
            console.error("Error fetching character details:", error);
            searchInput.value = "Error loading character";
        }
    }
}
let collection = [];

function toggletoExchange (cardName)
{
    const found = collection.filter(item => item.name === cardName);
    if (found.length>0) {
        document.getElementById("char-"+cardName).style="";
        collection = collection.filter(item => item.name !== cardName);
    } else {
        document.getElementById("char-"+cardName).style="background-color: var(--bs-green);";
        // Add/Insert item
        collection.push({
            name: cardName,
        });
    }
}

async function createExchange() {
    const userId = localStorage.getItem('_id');
    const cardToGet = document.getElementById('selected_Superhero').value;
    if (!userId || !cardToGet || !collection || collection.length === 0) {
        alert("Select one or more cards to send and a card that you want.");
        throw new Error('Missing required exchange parameters');
    }

    // Check if cardToGet is in the collection
    if (collection.some(card => card.name === cardToGet)) {
        alert("You cannot request a card that you're offering to send.");
        throw new Error('Card requested is in the send collection');
    }

    try {
      const response = await fetch('/create_exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          cardtoGet: cardToGet,
          cardtosend: collection,
          albumId: localStorage.getItem('album_ID')
        })
      });

      if (response.ok) {
        alert("Exchange create successfully");
        window.location.href = '/exchange';
      } else {
        throw new Error('Exchange creation failed');
      }
    } catch (error) {
      console.error('Error creating exchange:', error);
      throw error;
    }
}

async function acceptExchange(exchangeId) {
    const userId = localStorage.getItem('_id');
    const albumId = localStorage.getItem('album_ID');

    try {
        const response = await fetch('/accept_exchange', {
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            exchange_id: exchangeId,
            acceptingUserId: userId,
            album_id: albumId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('Exchange accepted successfully');
        window.location.reload();
    } catch (error) {
        console.error('Error accepting exchange:', error);
        alert('Failed to accept exchange');
    }
}

async function deleteExchange(exchangeID) {
    const userId = localStorage.getItem('_id');
    const albumId = localStorage.getItem('album_ID');

    try{
        const response = await fetch(`../delete-exchange/${exchangeID}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        alert("Exchange successfully deleted");
        window.location.reload();

    } catch (error) {
        console.error("Errore!",error);
        return "ERR";
    }
}