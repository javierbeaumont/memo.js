$(function() {
// Variables Configuration
  const emojis = [
        'Alien', 'Ant', 'Avocado', 'Banana', 'Bat', 'Bear', 'Beaver', 'Bird', 'Boar', 'Bug',
        'Butterfly', 'Cactus', 'Cat', 'Chicken', 'Chipmunk', 'Cockroach', 'Cookie', 'Cow', 'Crab',
        'Cricket', 'Crocodile', 'Crown', 'Dodo', 'Dog', 'Dolphin', 'Donkey', 'Dragon', 'Duck', 'Eagle',
        'Elephant', 'Ewe', 'Fish', 'Flamingo', 'Fox', 'Frog', 'Ghost', 'Giraffe', 'Goat', 'Gorilla',
        'Hamster', 'Hedgehog', 'Hippopotamus', 'Honeybee', 'Horse', 'Kangaroo', 'Koala', 'Lady beetle',
        'Leopard', 'Lion', 'Lizard', 'Llama', 'Lobster', 'Mammoth', 'Monkey', 'Mosquito', 'Mouse',
        'Mushroom', 'Octopus', 'Otter', 'Owl', 'Panda', 'Parrot', 'Peacock', 'Penguin', 'Pig', 'Pizza',
        'Polar bear', 'Rabbit', 'Raccoon', 'Ram', 'Rat', 'Rhinoceros', 'Robot', 'Rocket', 'Rooster',
        'Rose', 'Sauropod', 'Scorpion', 'Seal', 'Shark', 'Shrimp', 'Skunk', 'Sloth', 'Snail', 'Snake',
        'Snowflake', 'Spider', 'Strawberry', 'Sunflower', 'Swan', 'Teddy bear', 'Tiger', 'Turkey',
        'Turtle', 'Unicorn', 'Watermelon', 'Whale', 'Wolf', 'Zebra'
      ];

  const validCouples = [3, 6, 8, 12, 14, 16, 18, 20, 24, 28, 32, 36];

// Level is a 1-based index into validCouples: use ?level=N if valid, else random
  const requested = parseInt(new URLSearchParams(location.search).get('level'), 10)
    , level = (requested >= 1 && requested <= validCouples.length)
        ? requested
        : Math.floor(Math.random() * validCouples.length) + 1;

  const config = {
        couples: validCouples[level - 1],
        id: {
          min: 0,
          max: emojis.length
        }
      };

// Playing Card Distribution
  const couples = config.couples
    , cards = couples * 2;

// Lists all divisors from number of playing cards
  const l = [];

  for (let d = 1; d <= cards; d++){
    if(cards % d === 0) {
      l.push(d);
    }
  }

// Select best divisors from the list
  const w = (l.length % 2 === 0) ? [1, 0] : [.5, .5]
    , short = l[l.length / 2 - w[0]]
    , long  = l[l.length / 2 - w[1]];

// Playing Cards Selection
  const minId = config.id.min
    , maxId = config.id.max
    , list = [];

  while(list.length < couples) {
    const m = Math.floor((Math.random() * (maxId - minId)) + minId);

    if (maxId - minId <= list.length || $.inArray(m, list) === -1) {
      list.push(m);
    }
  }

// Shuffle The Deck (Fisher-Yates)
  $.merge(list, list);

  for (let position = list.length - 1; position > 0; position--) {
    const randomIndex = Math.floor(Math.random() * (position + 1))
      , card = list[position];

    list[position] = list[randomIndex];
    list[randomIndex] = card;
  }

// Playing Card HTML Code
  const html = '\
        <div class="card" data-status="hide">\
          <img src="image/%src%" />\
          <div data-element="cover"></div>\
        </div>';

// Print Board and Playing Cards
  $('[data-element="board"]')
    .append(function() {
      let data = '';

      $.each(list, function(index, id) {
        const file = emojis[id].toLowerCase().replace(/ /g, '_') + '_3d.png';

        data += html.replace('%src%', file);
      });

      return data;
    })
    .css({ '--long': long, '--short': short });

// Level selector: 1..N, reflects the current level, reloads on change
  let options = '';

  for (let n = 1; n <= validCouples.length; n++) {
    options += '<option value="' + n + '">' + n + '</option>';
  }

  $('#level').html(options).val(level).on('change', function() {
    location.search = 'level=' + $(this).val();
  });

// Player Interaction
  let count = 0
    , pair = []
    , locked = false
    , moves = 0
    , startTime = null
    , timer = null;

// mm:ss from milliseconds
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000) % 60
      , minutes = Math.floor(ms / 60000);

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  function showWin() {
    clearInterval(timer);

    $('#win-time').text(formatTime(Date.now() - startTime));
    $('#win-moves').text(moves);
    $('#win').css('display', 'flex');
  }

  $('[data-element="cover"]').on('click', function() {
    if (locked) return;                                          // two cards are flipping back
    if ($(this).parent().attr('data-status') !== 'hide') return; // card already flipped

    if (!startTime) {
      startTime = Date.now();

      timer = setInterval(function() {
        $('#stats-time').text(formatTime(Date.now() - startTime));
      }, 1000);
    }

    count ++;

    if (count <= 2) {
      $(this).slideUp('slow');

      if($(this).parent().attr('data-status') === 'hide') {
        $(this).parent().attr('data-status', 'view');

        pair.push($(this).prev().attr('src'));
      }

      if (count === 2) {
        moves ++;
        $('#stats-moves').text(moves);

        if (pair[0] === pair[1]) {
          $('[data-status="view"]').attr('data-status', 'show');

          count = 0;

          pair = [];

          if ($('[data-status="show"]').length === cards) showWin();
        } else {
          locked = true;

          $('[data-status="view"] [data-element="cover"]').delay(500).slideDown('slow', function(){
            $('[data-status="view"]').attr('data-status', 'hide');

            count = pair.length;

            pair = [];

            locked = false;
          });
        }
      }
    }
  });

  $('#replay').on('click', function() {
    location.search = 'level=' + level;
  });

  if (level < validCouples.length) {
    $('#next').on('click', function() {
      location.search = 'level=' + (level + 1);
    });
  } else {
    $('#next').remove();
  }
});