$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: "steam-library.csv",
        dataType: "text",
        success: function (data) {
            const games = parseCSV(data);
            const sortedGames = sortGamesByUserScore(games);
            displayGames(sortedGames);
        }
    });

    function parseCSV(data) {
        const lines = data.split("\n");
        const headers = lines[0].split(";");
        const games = lines.slice(1).map(line => {
            const values = line.split(";");
            if (values.length !== headers.length) {
                return null; // Ignore lines that do not match the header length
            }
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index] ? values[index].trim() : ""; // Use empty string for missing values
                return obj;
            }, {});
        }).filter(game => game !== null); // Filter out any null entries;
        return games;
    }

    function sortGamesByUserScore(games) {
        return games.sort((a, b) => b.userscore - a.userscore);
    }

    function displayGames(games) {
        const gameCardsContainer = $("#game-cards");
        gameCardsContainer.empty();
        games.forEach(game => {
            const gameCard = $(`
                <div class="game-card" data-players="${game['number_of_players']}" >
                    <h2>${game['game']}</h2>
                    <div class="image-container">
                            <img data-id="${game['id']}" src="img/${game['id']}.jpg" alt="${game['game']} header image" loading="lazy" />
                    </div>
                    <p>Metascore: ${game['userscore']}</p>
                    <p>Nombre de joueurs: ${game['number_of_players']}</p>
                    <p><a href="https://store.steampowered.com/app/${game['id']}/">Lien Steam</a></p>
                </div>
           `);
            gameCardsContainer.append(gameCard);
            gameCard.find('img').on('click', function () {
                openModal(game['id']);
            });
        });
    }

    $('#players').change(function () {
        const selectedValue = $(this).val();
        filterGames(selectedValue);
    });

    function filterGames(players) {
        $('.game-card').each(function () {
            const gamePlayers = $(this).data('players');
            if (players === 'all' || (players === '8+' && gamePlayers >= 8) || gamePlayers == players) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    function openModal(steamId) {
        const modal = $("#videoModal");
        const modalVideo = $("#modalVideo");
        modalVideo.attr('src', '');
        modalVideo.attr('class', 'video-steam');
        modal.show();

        modalVideo.attr('src', `img/${steamId}.webm`);

        $(".close").on('click', function () {
            modal.hide();
            modalVideo[0].pause();
        });

        $(window).on('click', function (event) {
            if (event.target == modal[0]) {
                modal.hide();
                modalVideo[0].pause();
            }
        });
    }
});
